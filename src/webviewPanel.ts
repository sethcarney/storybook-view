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
  private updateTimeout: NodeJS.Timeout | undefined;

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

    // Watch ONLY the original component file, not the preview-runtime directory
    this.fileWatcher = vscode.workspace.createFileSystemWatcher(
      componentUri.fsPath
    );

    this.fileWatcher.onDidChange(() => {
      if (
        vscode.workspace.getConfiguration("reactview").get("autoRefresh", true)
      ) {
        // Don't reload on every change - Vite HMR handles it
        // Just update the UserComponent.tsx file
        this.debouncedUpdatePreview();
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

      // Set initial HTML content
      const componentInfo = this.parser.parseComponent(componentUri.fsPath);
      await this.previewServer.loadComponent(componentUri.fsPath);
      const port = this.previewServer.getPort();
      this.panel.webview.html = this.getWebviewContent(port, componentInfo);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      vscode.window.showErrorMessage(
        `Failed to start preview server: ${message}`
      );
    }
  }

  private debouncedUpdatePreview() {
    // Clear existing timeout
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    // Debounce for 1 second to avoid rapid updates
    this.updateTimeout = setTimeout(() => {
      this.updatePreview();
    }, 1000);
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

      // Copy component to preview-runtime (Vite HMR will handle the update automatically)
      await this.previewServer.loadComponent(this.currentComponentUri.fsPath);

      // Don't reload the iframe - Vite HMR will handle updates automatically
      // We only set the HTML on initial load
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
            background-color: var(--vscode-editor-background);
        }
        iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid var(--vscode-progressBar-background);
            border-top-color: var(--vscode-progressBar-foreground);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .loading-text {
            font-size: 14px;
            opacity: 0.8;
        }
        .error {
            color: var(--vscode-errorForeground);
            background-color: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
            padding: 12px 16px;
            border-radius: 4px;
            margin-top: 16px;
            max-width: 500px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div id="loading" class="loading-container">
        <div class="spinner"></div>
        <div class="loading-text">Starting preview server...</div>
    </div>
    <iframe
        id="preview-frame"
        style="display: none;"
        allow="cross-origin-isolated"
    ></iframe>

    <script>
        const iframe = document.getElementById('preview-frame');
        const loading = document.getElementById('loading');
        const loadingText = document.querySelector('.loading-text');

        let attempts = 0;
        const maxAttempts = 30;
        let checkInterval;

        // Function to check if Vite server is ready
        function checkServer() {
            attempts++;
            loadingText.textContent = \`Connecting to preview server... (\${attempts}/\${maxAttempts})\`;

            fetch('http://localhost:${port}/')
                .then(response => {
                    if (response.ok) {
                        clearInterval(checkInterval);
                        loadingText.textContent = 'Loading component...';

                        // Server is ready, load the iframe
                        iframe.src = 'http://localhost:${port}';
                        iframe.style.display = 'block';

                        iframe.onload = function() {
                            loading.style.display = 'none';

                            // Send component info to iframe
                            setTimeout(() => {
                                iframe.contentWindow.postMessage({
                                    type: 'updateComponent',
                                    componentInfo: ${JSON.stringify(componentInfo)},
                                    props: {}
                                }, '*');
                            }, 100);
                        };
                    }
                })
                .catch(err => {
                    // Server not ready yet, continue polling
                    if (attempts >= maxAttempts) {
                        clearInterval(checkInterval);
                        loading.innerHTML = \`
                            <div class="spinner" style="display: none;"></div>
                            <div class="error">
                                <strong>Failed to connect to preview server</strong>
                                <p style="margin: 8px 0 0 0; font-size: 12px;">
                                    Make sure preview-runtime dependencies are installed:<br>
                                    <code style="background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 3px;">
                                        cd preview-runtime && npm install
                                    </code>
                                </p>
                            </div>
                        \`;
                    }
                });
        }

        // Start checking server availability
        checkInterval = setInterval(checkServer, 1000);
        checkServer(); // Check immediately
    </script>
</body>
</html>`;
  }

  public dispose() {
    ReactPreviewPanel.currentPanel = undefined;

    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

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
