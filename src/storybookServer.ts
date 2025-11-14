import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { spawn, ChildProcess } from "child_process";

export class StorybookServer {
  private static instance: StorybookServer | undefined;
  private storybookProcess: ChildProcess | undefined;
  private port: number = 6006;
  private workspacePath: string;
  private inactivityTimer: NodeJS.Timeout | undefined;
  private readonly INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  private isIntentionalStop: boolean = false;

  private constructor(extensionPath: string) {
    // Find the workspace path with Storybook
    this.workspacePath = this.findStorybookWorkspace();
  }

  /**
   * Find the workspace directory that contains Storybook
   * Searches for package.json with Storybook dependencies
   */
  private findStorybookWorkspace(): string {
    const vscode = require('vscode');
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error("No workspace folder open. Please open a folder with a Storybook project.");
    }

    // Check each workspace folder for Storybook
    for (const folder of workspaceFolders) {
      const packageJsonPath = path.join(folder.uri.fsPath, 'package.json');

      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          const deps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
          };

          // Check if Storybook is installed
          if (deps['storybook'] || deps['@storybook/react'] || deps['@storybook/react-vite'] ||
              Object.keys(deps).some(key => key.startsWith('@storybook/'))) {
            console.log(`[Storybook] Found Storybook in: ${folder.uri.fsPath}`);
            return folder.uri.fsPath;
          }
        } catch (err) {
          console.error(`[Storybook] Error reading package.json in ${folder.uri.fsPath}:`, err);
        }
      }
    }

    // Fallback to first workspace folder
    console.log(`[Storybook] No Storybook found in workspace, using first folder: ${workspaceFolders[0].uri.fsPath}`);
    return workspaceFolders[0].uri.fsPath;
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
      // Check if workspace dependencies are installed
      const nodeModulesPath = path.join(this.workspacePath, "node_modules");
      if (!fs.existsSync(nodeModulesPath)) {
        reject(
          new Error(
            "Dependencies not installed. Please run: npm install"
          )
        );
        return;
      }

      // Check if Storybook is configured
      const storybookConfigPath = path.join(this.workspacePath, ".storybook");
      if (!fs.existsSync(storybookConfigPath)) {
        reject(
          new Error(
            "Storybook not configured. Please run: npx storybook@latest init"
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
        cwd: this.workspacePath,
        shell: true,
        stdio: ["ignore", "pipe", "pipe"]
      });

      console.log(`[Storybook] Process spawned (PID: ${this.storybookProcess.pid})`);
      console.log(`[Storybook] Waiting for server to be ready on port ${this.port}...`);

      let serverStarted = false;
      let errorOutput = "";

      // Poll the port to detect when server is ready (fallback if stdout parsing fails)
      const pollInterval = setInterval(async () => {
        if (serverStarted) {
          clearInterval(pollInterval);
          return;
        }

        const isPortResponding = await this.checkIfPortResponding(this.port);
        if (isPortResponding) {
          serverStarted = true;
          clearInterval(pollInterval);
          console.log(`[Storybook] Server detected as ready via port polling on port ${this.port}`);
          resolve(this.port);
        }
      }, 2000); // Check every 2 seconds

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
            clearInterval(pollInterval);
            // Extract port from output if present
            const portMatch = output.match(/:(\d+)/);
            if (portMatch) {
              this.port = parseInt(portMatch[1], 10);
            }
            console.log(`[Storybook] Server detected as started via stdout on port ${this.port}`);
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
        clearInterval(pollInterval);
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
          clearInterval(pollInterval);
          console.log("[Storybook] Detection timeout reached, but server may still be starting...");
          console.log("[Storybook] Webview will continue polling until connection is established");
          // Resolve anyway - let the webview handle the polling
          resolve(this.port);
        }
      }, 60000); // 60 seconds - reduced since we have port polling now
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

  /**
   * Check if the Storybook server is responding to HTTP requests
   */
  private async checkIfPortResponding(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const http = require('http');
      const request = http.get(`http://localhost:${port}/`, (res: any) => {
        // Any response means server is up
        resolve(res.statusCode === 200);
        request.destroy();
      });

      request.on('error', () => {
        // Server not responding yet
        resolve(false);
      });

      request.setTimeout(1000, () => {
        request.destroy();
        resolve(false);
      });
    });
  }
}
