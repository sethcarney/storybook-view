import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { spawn, ChildProcess } from "child_process";

export class StorybookServer {
  private static instance: StorybookServer | undefined;
  private storybookProcess: ChildProcess | undefined;
  private port: number = 6006;
  private testAppPath: string;
  private inactivityTimer: NodeJS.Timeout | undefined;
  private readonly INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  private isIntentionalStop: boolean = false;

  private constructor(extensionPath: string) {
    this.testAppPath = path.join(extensionPath, "test-app");
  }

  public static getInstance(extensionPath: string): StorybookServer {
    if (!StorybookServer.instance) {
      StorybookServer.instance = new StorybookServer(extensionPath);
    }
    return StorybookServer.instance;
  }

  public async start(): Promise<number> {
    // Reset inactivity timer
    this.resetInactivityTimer();

    if (this.storybookProcess) {
      return this.port;
    }

    // Check if Storybook is already running on the port
    const isAlreadyRunning = await this.checkIfPortInUse(this.port);
    if (isAlreadyRunning) {
      console.log(`[Storybook] Server already running on port ${this.port}`);
      return this.port;
    }

    return new Promise((resolve, reject) => {
      // Check if test-app dependencies are installed
      const nodeModulesPath = path.join(this.testAppPath, "node_modules");
      if (!fs.existsSync(nodeModulesPath)) {
        reject(
          new Error(
            "Test app dependencies not installed. Run: cd test-app && npm install"
          )
        );
        return;
      }

      // Start Storybook dev server directly with CLI options
      const isWindows = process.platform === "win32";
      const npxCmd = isWindows ? "npx.cmd" : "npx";

      console.log("[Storybook] Starting Storybook server...");

      // Run storybook directly with specific CLI options
      const storybookArgs = [
        "storybook",
        "dev",
        "-p", this.port.toString(),
        "--ci",                   // CI mode: skip prompts, don't open browser
        "--quiet",                // Reduce console output noise
        "--disable-telemetry",    // Disable telemetry for better performance
        "--config-dir", ".storybook"  // Explicit config directory
      ];

      this.storybookProcess = spawn(npxCmd, storybookArgs, {
        cwd: this.testAppPath,
        shell: true,
        stdio: ["ignore", "pipe", "pipe"]
      });

      console.log(`[Storybook] Process spawned (PID: ${this.storybookProcess.pid})`);
      console.log(`[Storybook] Waiting for server to be ready on port ${this.port}...`);

      let serverStarted = false;
      let errorOutput = "";

      this.storybookProcess.stdout?.on("data", (data) => {
        const output = data.toString();
        console.log("[Storybook stdout]:", output);

        // Look for Storybook server start message with more flexible detection
        // Storybook 7+ uses different output formats, so check for multiple patterns
        if (!serverStarted) {
          const isStarted =
            output.includes("started") ||
            output.includes("Local:") ||
            output.includes("localhost:") ||
            output.match(/http:\/\/[^\s]+:\d+/) ||
            (output.includes("Storybook") && output.match(/\d{1,5}/)) ||
            output.includes("serving static files from");

          if (isStarted) {
            serverStarted = true;
            // Extract port from output if present
            const portMatch = output.match(/:(\d+)/);
            if (portMatch) {
              this.port = parseInt(portMatch[1], 10);
            }
            console.log(`[Storybook] Server detected as started on port ${this.port}`);
            resolve(this.port);
          }
        }
      });

      this.storybookProcess.stderr?.on("data", (data) => {
        const error = data.toString();
        console.log("[Storybook stderr]:", error);

        // Many "errors" are just warnings or info messages in stderr
        // Only accumulate actual errors
        if (error.includes("Error:") || error.includes("EADDRINUSE") || error.includes("failed")) {
          errorOutput += error;
        }

        // Only show critical errors to user
        if (error.includes("Error:") || error.includes("EADDRINUSE")) {
          vscode.window.showErrorMessage(
            `Storybook Error: ${error.substring(0, 200)}`
          );
        }
      });

      this.storybookProcess.on("error", (error) => {
        console.error("[Storybook Process Error]:", error);
        if (!serverStarted) {
          reject(error);
        }
      });

      this.storybookProcess.on("exit", (code) => {
        console.log(`[Storybook] Exited with code ${code}`);
        const wasIntentionalStop = this.isIntentionalStop;
        this.storybookProcess = undefined;
        this.isIntentionalStop = false; // Reset the flag

        if (!serverStarted && !wasIntentionalStop) {
          // Only reject if this was not an intentional stop
          const errorMsg = errorOutput
            ? `Storybook failed: ${errorOutput.substring(0, 500)}`
            : `Storybook failed to start (exit code: ${code})`;
          reject(new Error(errorMsg));
        } else if (wasIntentionalStop) {
          console.log("[Storybook] Server stopped intentionally");
        }
      });

      // Timeout for initial detection - but don't kill the server
      // The webview will continue polling and will connect once ready
      setTimeout(() => {
        if (!serverStarted) {
          console.log("[Storybook] Detection timeout reached, but server may still be starting...");
          console.log("[Storybook] Webview will continue polling until connection is established");
          // Resolve anyway - let the webview handle the polling
          resolve(this.port);
        }
      }, 120000); // Increased to 120 seconds
    });
  }

  public stop(): void {
    console.log("[Storybook] Stopping Storybook server...");

    // Mark this as an intentional stop to avoid error messages
    this.isIntentionalStop = true;

    // Clear inactivity timer
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = undefined;
    }

    if (this.storybookProcess) {
      // On Windows, need to kill the entire process tree
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", this.storybookProcess.pid!.toString(), "/f", "/t"]);
      } else {
        this.storybookProcess.kill();
      }
      this.storybookProcess = undefined;
    }
  }

  public resetInactivityTimer(): void {
    // Clear existing timer
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    // Set new timer
    this.inactivityTimer = setTimeout(() => {
      console.log(
        "[Storybook] Inactivity timeout reached. Stopping Storybook..."
      );
      this.stop();
      vscode.window.showInformationMessage(
        "Storybook server automatically stopped due to inactivity (5 minutes)"
      );
    }, this.INACTIVITY_TIMEOUT);
  }

  public getPort(): number {
    return this.port;
  }

  public async isRunning(): Promise<boolean> {
    // Check both if we have a process and if the port is in use
    if (this.storybookProcess) {
      return true;
    }
    // Even if we don't have a process, check if port is in use
    // (could be running externally)
    return await this.checkIfPortInUse(this.port);
  }

  public canStop(): boolean {
    // Can only stop if we started it (we have a process)
    return this.storybookProcess !== undefined;
  }

  public getUrl(): string {
    return `http://localhost:${this.port}`;
  }

  /**
   * Get the URL for a specific component's story
   * @param componentName The name of the component (e.g., "Button", "Card")
   * @param storyName Optional specific story name (e.g., "Primary", "Default")
   */
  public getComponentUrl(componentName: string, storyName?: string): string {
    const baseUrl = this.getUrl();
    const storyPath = `components-${componentName.toLowerCase()}--${storyName?.toLowerCase() || "default"}`;
    return `${baseUrl}/?path=/story/${storyPath}`;
  }

  /**
   * Check if a port is already in use
   */
  private checkIfPortInUse(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const net = require('net');
      const tester = net.createServer()
        .once('error', () => {
          // Port is in use
          resolve(true);
        })
        .once('listening', () => {
          // Port is available
          tester.close();
          resolve(false);
        })
        .listen(port);
    });
  }
}
