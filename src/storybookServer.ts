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

      // Start Storybook dev server
      const isWindows = process.platform === "win32";
      const npmCmd = isWindows ? "npm.cmd" : "npm";

      console.log("[Storybook] Starting Storybook server...");

      this.storybookProcess = spawn(npmCmd, ["run", "storybook"], {
        cwd: this.testAppPath,
        shell: true,
        stdio: ["ignore", "pipe", "pipe"]
      });

      let serverStarted = false;
      let errorOutput = "";

      this.storybookProcess.stdout?.on("data", (data) => {
        const output = data.toString();
        console.log("[Storybook]:", output);

        // Look for Storybook server start message
        if (
          !serverStarted &&
          (output.includes("Storybook") &&
            (output.includes("started") || output.includes("localhost")))
        ) {
          serverStarted = true;
          // Extract port from output if different from default
          const portMatch = output.match(/:(\d+)/);
          if (portMatch) {
            this.port = parseInt(portMatch[1], 10);
          }
          console.log(`[Storybook] Server started on port ${this.port}`);
          resolve(this.port);
        }
      });

      this.storybookProcess.stderr?.on("data", (data) => {
        const error = data.toString();
        errorOutput += error;
        console.error("[Storybook Error]:", error);

        // Only show critical errors
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
        this.storybookProcess = undefined;
        if (!serverStarted) {
          const errorMsg = errorOutput
            ? `Storybook failed: ${errorOutput.substring(0, 500)}`
            : `Storybook failed to start (exit code: ${code})`;
          reject(new Error(errorMsg));
        }
      });

      // Timeout if server doesn't start in 60 seconds
      setTimeout(() => {
        if (!serverStarted) {
          this.stop();
          reject(new Error("Storybook start timeout"));
        }
      }, 60000);
    });
  }

  public stop(): void {
    console.log("[Storybook] Stopping Storybook server...");

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
      vscode.window.showInformationMessage(
        "Storybook stopped due to inactivity (5 minutes)"
      );
      this.stop();
    }, this.INACTIVITY_TIMEOUT);
  }

  public getPort(): number {
    return this.port;
  }

  public isRunning(): boolean {
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
}
