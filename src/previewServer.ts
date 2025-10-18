import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { spawn, ChildProcess } from "child_process";

export class PreviewServer {
  private static instance: PreviewServer | undefined;
  private viteProcess: ChildProcess | undefined;
  private port: number;
  private previewRuntimePath: string;
  private currentComponentPath: string | undefined;

  private constructor(extensionPath: string) {
    this.port = vscode.workspace
      .getConfiguration("reactview")
      .get("port", 3001);
    this.previewRuntimePath = path.join(extensionPath, "preview-runtime");
  }

  public static getInstance(extensionPath: string): PreviewServer {
    if (!PreviewServer.instance) {
      PreviewServer.instance = new PreviewServer(extensionPath);
    }
    return PreviewServer.instance;
  }

  public async start(): Promise<number> {
    if (this.viteProcess) {
      return this.port;
    }

    return new Promise((resolve, reject) => {
      // Check if preview-runtime dependencies are installed
      const nodeModulesPath = path.join(
        this.previewRuntimePath,
        "node_modules"
      );
      if (!fs.existsSync(nodeModulesPath)) {
        reject(
          new Error(
            "Preview runtime dependencies not installed. Run: cd preview-runtime && npm install"
          )
        );
        return;
      }

      // Start Vite dev server
      const isWindows = process.platform === "win32";
      const npmCmd = isWindows ? "npm.cmd" : "npm";

      this.viteProcess = spawn(npmCmd, ["run", "dev"], {
        cwd: this.previewRuntimePath,
        shell: true,
        stdio: ["ignore", "pipe", "pipe"]
      });

      let serverStarted = false;

      let errorOutput = '';

      this.viteProcess.stdout?.on("data", (data) => {
        const output = data.toString();
        console.log("[Preview Server]:", output);

        // Look for Vite server start message
        if (
          !serverStarted &&
          (output.includes("Local:") || output.includes("localhost"))
        ) {
          serverStarted = true;
          // Extract port from output if different from default
          const portMatch = output.match(/:(\d+)/);
          if (portMatch) {
            this.port = parseInt(portMatch[1], 10);
          }
          resolve(this.port);
        }
      });

      this.viteProcess.stderr?.on("data", (data) => {
        const error = data.toString();
        errorOutput += error;
        console.error("[Preview Server Error]:", error);

        // Show error in VSCode
        vscode.window.showErrorMessage(`Preview Server Error: ${error.substring(0, 200)}`);
      });

      this.viteProcess.on("error", (error) => {
        console.error("[Preview Server Process Error]:", error);
        if (!serverStarted) {
          reject(error);
        }
      });

      this.viteProcess.on("exit", (code) => {
        console.log(`[Preview Server] Exited with code ${code}`);
        this.viteProcess = undefined;
        if (!serverStarted) {
          const errorMsg = errorOutput
            ? `Preview server failed: ${errorOutput.substring(0, 500)}`
            : `Preview server failed to start (exit code: ${code})`;
          reject(new Error(errorMsg));
        }
      });

      // Timeout if server doesn't start in 30 seconds
      setTimeout(() => {
        if (!serverStarted) {
          this.stop();
          reject(new Error("Preview server start timeout"));
        }
      }, 30000);
    });
  }

  public async loadComponent(componentPath: string): Promise<void> {
    this.currentComponentPath = componentPath;

    // Just copy the component directly - keep it simple
    const componentCode = fs.readFileSync(componentPath, 'utf8');
    const wrapperPath = path.join(
      this.previewRuntimePath,
      "src",
      "UserComponent.tsx"
    );

    // Write the component code directly
    fs.writeFileSync(wrapperPath, componentCode);
  }


  public stop(): void {
    if (this.viteProcess) {
      this.viteProcess.kill();
      this.viteProcess = undefined;
    }
  }

  public getPort(): number {
    return this.port;
  }

  public isRunning(): boolean {
    return this.viteProcess !== undefined;
  }
}
