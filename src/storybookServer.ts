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
  private isIntentionalStop: boolean = false;
  private outputChannel: vscode.OutputChannel | undefined;
  private showingOutput: boolean = false;

  private constructor(extensionPath: string) {
    // Get the workspace path for Storybook
    this.workspacePath = this.getStorybookWorkspacePath();

    // Create output channel for Storybook logs
    this.outputChannel = vscode.window.createOutputChannel("Storybook");
  }

  /**
   * Strip ANSI escape codes from text for clean output display
   */
  private stripAnsi(text: string): string {
    // Remove ANSI escape codes (e.g., \x1b[1m, \x1b[22m, \x1b[0m)
    return text.replace(/\x1b\[[0-9;]*m/g, '');
  }

  /**
   * Get the inactivity timeout in milliseconds from configuration
   */
  private getInactivityTimeout(): number {
    const config = vscode.workspace.getConfiguration('storybookview');
    const timeoutMinutes = config.get('inactivityTimeout', 5) as number;
    return timeoutMinutes * 60 * 1000; // Convert minutes to milliseconds
  }

  /**
   * Get the workspace directory for Storybook based on configuration
   * Uses storybookview.storybookPath setting or defaults to workspace root
   */
  private getStorybookWorkspacePath(): string {
    const vscode = require('vscode');
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error("No workspace folder open. Please open a folder with a Storybook project.");
    }

    // Get the workspace root
    const workspaceRoot = workspaceFolders[0].uri.fsPath;

    // Get the configured Storybook path from settings
    const config = vscode.workspace.getConfiguration('storybookview');
    const storybookPath = config.get('storybookPath', '') as string;

    // If a custom path is configured, join it with the workspace root
    if (storybookPath && storybookPath.trim() !== '') {
      const fullPath = path.join(workspaceRoot, storybookPath);
      console.log(`[Storybook] Using configured path: ${fullPath}`);
      return fullPath;
    }

    // Default to workspace root
    console.log(`[Storybook] Using workspace root: ${workspaceRoot}`);
    return workspaceRoot;
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

    // Re-read settings from config in case user updated them
    this.workspacePath = this.getStorybookWorkspacePath();
    const config = vscode.workspace.getConfiguration('storybookview');
    this.port = config.get('port', 6006) as number;

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
      // Check for .storybook directory - this is the primary validation
      // If it doesn't exist, the directory isn't configured properly for Storybook
      const storybookConfigPath = path.join(this.workspacePath, ".storybook");
      if (!fs.existsSync(storybookConfigPath)) {
        const config = vscode.workspace.getConfiguration('storybookview');
        const configuredPath = config.get('storybookPath', '') as string;
        const configInfo = configuredPath
          ? `\n\nConfigured path "${configuredPath}" resolves to: ${this.workspacePath}`
          : `\n\nCurrent directory: ${this.workspacePath}`;

        reject(
          new Error(
            `.storybook directory not found. ` +
            `Either initialize Storybook with "npx storybook@latest init" or ` +
            `update "storybookview.storybookPath" in VS Code settings to point to your Storybook project.${configInfo}`
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

      // Show the output channel during startup
      this.showingOutput = true;
      this.outputChannel?.clear();
      this.outputChannel?.appendLine("=== Starting Storybook Server ===");
      this.outputChannel?.appendLine(`Working directory: ${this.workspacePath}`);
      this.outputChannel?.appendLine(`Port: ${this.port}`);
      this.outputChannel?.appendLine(`Command: npx storybook dev -p ${this.port} --ci --quiet --disable-telemetry`);
      this.outputChannel?.appendLine("=====================================\n");
      this.outputChannel?.show(true); // Show but preserve focus on editor

      let serverStarted = false;

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

          // Stop showing output once server is up
          if (this.showingOutput) {
            this.outputChannel?.appendLine("\n=== Storybook Server Ready ===");
            this.showingOutput = false;
          }

          resolve(this.port);
        }
      }, 2000); // Check every 2 seconds

      this.storybookProcess.stdout?.on("data", (data) => {
        const output = data.toString();
        console.log("[Storybook stdout]:", output);

        // Show output in output channel during startup (strip ANSI codes for clean display)
        if (this.showingOutput) {
          this.outputChannel?.append(this.stripAnsi(output));
        }

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

            // Stop showing output once server is up
            if (this.showingOutput) {
              this.outputChannel?.appendLine("\n=== Storybook Server Ready ===");
              this.showingOutput = false;
            }

            resolve(this.port);
          }
        }
      });

      this.storybookProcess.stderr?.on("data", (data) => {
        const error = data.toString();
        console.log("[Storybook stderr]:", error);

        // Show output in output channel during startup (strip ANSI codes for clean display)
        if (this.showingOutput) {
          this.outputChannel?.append(this.stripAnsi(error));
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
          // Point user to Output Channel for details and suggest manual run
          reject(new Error(
            `Storybook failed to start. Check the "Storybook" output channel for details. ` +
            `Try running manually: cd "${this.workspacePath}" && npx storybook dev`
          ));
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

  public stop(): Promise<void> {
    console.log("[Storybook] Stopping Storybook server...");

    // Mark this as an intentional stop to avoid error messages
    this.isIntentionalStop = true;
    this.showingOutput = false;

    // Clear inactivity timer
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = undefined;
    }

    return new Promise((resolve) => {
      if (this.storybookProcess) {
        const pid = this.storybookProcess.pid;

        // On Windows, need to kill the entire process tree
        if (process.platform === "win32" && pid) {
          const killProcess = spawn("taskkill", ["/pid", pid.toString(), "/f", "/t"]);

          killProcess.on('exit', (code) => {
            console.log(`[Storybook] Process tree killed (exit code: ${code})`);
            this.outputChannel?.appendLine("\n=== Storybook Server Stopped ===");
            this.storybookProcess = undefined;
            resolve();
          });

          // Timeout fallback in case taskkill doesn't respond
          setTimeout(() => {
            console.log("[Storybook] Kill command timeout, continuing cleanup");
            this.outputChannel?.appendLine("\n=== Storybook Server Stopped (timeout) ===");
            this.storybookProcess = undefined;
            resolve();
          }, 2000);
        } else {
          // Unix-like systems
          this.storybookProcess.kill();
          this.outputChannel?.appendLine("\n=== Storybook Server Stopped ===");
          this.storybookProcess = undefined;
          // Give it a moment to clean up
          setTimeout(() => resolve(), 500);
        }
      } else {
        resolve();
      }
    });
  }

  public resetInactivityTimer(): void {
    // Clear existing timer
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    // Get configured timeout
    const timeout = this.getInactivityTimeout();
    const timeoutMinutes = Math.round(timeout / 60000);

    // Set new timer
    this.inactivityTimer = setTimeout(() => {
      console.log(
        `[Storybook] Inactivity timeout reached (${timeoutMinutes} minutes). Stopping Storybook...`
      );
      this.stop();
      vscode.window.showInformationMessage(
        `Storybook server automatically stopped due to inactivity (${timeoutMinutes} minute${timeoutMinutes !== 1 ? 's' : ''})`
      );
    }, timeout);
  }

  public getPort(): number {
    // Always read from config to ensure we have the latest value
    const config = vscode.workspace.getConfiguration('storybookview');
    this.port = config.get('port', 6006) as number;
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
    return `http://localhost:${this.getPort()}`;
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
