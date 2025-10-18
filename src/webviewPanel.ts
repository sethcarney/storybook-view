import * as vscode from "vscode";
import * as path from "path";
import { ComponentParser } from "./componentParser";
import { PreviewServer } from "./previewServer";

export class ReactPreviewPanel {
  private static currentPanel: ReactPreviewPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly extensionPath: string;
  private disposables: vscode.Disposable[] = [];
  private parser: ComponentParser;
  private currentComponentUri: vscode.Uri | undefined;
  private fileWatcher: vscode.FileSystemWatcher | undefined;
  private previewServer: PreviewServer;
  private isUpdating: boolean = false;

  private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
    this.panel = panel;
    this.extensionPath = extensionPath;
    this.parser = new ComponentParser();
    this.previewServer = PreviewServer.getInstance(extensionPath);

    // Handle messages from the webview
    this.panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "ready":
            console.log("Preview webview is ready");
            break;
          case "error":
            vscode.window.showErrorMessage(`Preview error: ${message.text}`);
            break;
        }
      },
      null,
      this.disposables
    );

    // Clean up when panel is closed
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
  }

  public static async createOrShow(
    extensionPath: string,
    componentUri: vscode.Uri
  ) {
    const column = vscode.ViewColumn.Beside;

    // If we already have a panel, show it
    if (ReactPreviewPanel.currentPanel) {
      ReactPreviewPanel.currentPanel.panel.reveal(column);
      await ReactPreviewPanel.currentPanel.setComponent(componentUri);
      return;
    }

    // Otherwise, create a new panel
    const panel = vscode.window.createWebviewPanel(
      "reactPreview",
      "React Preview",
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(extensionPath)]
      }
    );

    ReactPreviewPanel.currentPanel = new ReactPreviewPanel(
      panel,
      extensionPath
    );
    await ReactPreviewPanel.currentPanel.setComponent(componentUri);
  }

  public async setComponent(componentUri: vscode.Uri) {
    this.currentComponentUri = componentUri;

    // Update panel title
    const fileName = path.basename(componentUri.fsPath);
    this.panel.title = `Preview: ${fileName}`;

    // Set up file watcher - watch the specific component file
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
    }

    this.fileWatcher = vscode.workspace.createFileSystemWatcher(
      componentUri.fsPath
    );
    this.fileWatcher.onDidChange(() => {
      if (
        vscode.workspace.getConfiguration("reactview").get("autoRefresh", true)
      ) {
        this.updatePreview();
      }
    });

    // Start preview server if not running
    try {
      if (!this.previewServer.isRunning()) {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Starting preview server...",
            cancellable: false
          },
          async () => {
            await this.previewServer.start();
          }
        );
      }

      // Update preview
      await this.updatePreview();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      vscode.window.showErrorMessage(
        `Failed to start preview server: ${message}`
      );
    }
  }

  private async updatePreview() {
    if (!this.currentComponentUri || this.isUpdating) {
      return;
    }

    this.isUpdating = true;

    try {
      // Parse component to get prop information
      const componentInfo = this.parser.parseComponent(
        this.currentComponentUri.fsPath
      );

      // Copy component to preview-runtime
      await this.previewServer.loadComponent(this.currentComponentUri.fsPath);

      // Update webview HTML to iframe the Vite server
      const port = this.previewServer.getPort();
      this.panel.webview.html = this.getWebviewContent(port, componentInfo);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      vscode.window.showErrorMessage(`Failed to update preview: ${message}`);
    } finally {
      this.isUpdating = false;
    }
  }

  private getWebviewContent(port: number, componentInfo: any): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React Preview</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100vh;
            overflow: hidden;
        }
        iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        .loading {
            display: flex;
            align-items: center;
            justify-center;
            height: 100vh;
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
        }
    </style>
</head>
<body>
    <div id="loading" class="loading">
        Loading preview server...
    </div>
    <iframe
        id="preview-frame"
        src="http://localhost:${port}"
        style="display: none;"
        allow="cross-origin-isolated"
    ></iframe>

    <script>
        const iframe = document.getElementById('preview-frame');
        const loading = document.getElementById('loading');

        iframe.onload = function() {
            loading.style.display = 'none';
            iframe.style.display = 'block';

            // Send component info to iframe
            iframe.contentWindow.postMessage({
                type: 'updateComponent',
                componentInfo: ${JSON.stringify(componentInfo)},
                props: {}
            }, '*');
        };

        // Handle timeout
        setTimeout(() => {
            if (iframe.style.display === 'none') {
                loading.textContent = 'Preview server is taking longer than expected. Check if preview-runtime dependencies are installed.';
            }
        }, 10000);
    </script>
</body>
</html>`;
  }

  public dispose() {
    ReactPreviewPanel.currentPanel = undefined;

    if (this.fileWatcher) {
      this.fileWatcher.dispose();
    }

    this.panel.dispose();

    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  public static refresh() {
    if (ReactPreviewPanel.currentPanel) {
      ReactPreviewPanel.currentPanel.updatePreview();
    }
  }
}
