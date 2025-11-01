import * as vscode from "vscode";
import * as path from "path";
import { StorybookServer } from "./storybookServer";

export class StorybookPreviewPanel {
  private static currentPanel: StorybookPreviewPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly extensionPath: string;
  private disposables: vscode.Disposable[] = [];
  private currentComponentUri: vscode.Uri | undefined;
  private fileWatcher: vscode.FileSystemWatcher | undefined;
  private storybookServer: StorybookServer;

  private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
    this.panel = panel;
    this.extensionPath = extensionPath;
    this.storybookServer = StorybookServer.getInstance(extensionPath);

    // Handle messages from the webview
    this.panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "ready":
            console.log("Preview webview is ready");
            // Reset inactivity timer when user interacts
            this.storybookServer.resetInactivityTimer();
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
    if (StorybookPreviewPanel.currentPanel) {
      StorybookPreviewPanel.currentPanel.panel.reveal(column);
      await StorybookPreviewPanel.currentPanel.setComponent(componentUri);
      return;
    }

    // Otherwise, create a new panel
    const panel = vscode.window.createWebviewPanel(
      "storybookPreview",
      "Storybook Preview",
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(extensionPath)]
      }
    );

    StorybookPreviewPanel.currentPanel = new StorybookPreviewPanel(
      panel,
      extensionPath
    );
    await StorybookPreviewPanel.currentPanel.setComponent(componentUri);
  }

  public async setComponent(componentUri: vscode.Uri) {
    this.currentComponentUri = componentUri;

    const fileName = path.basename(componentUri.fsPath);
    const componentName = this.getComponentName(fileName);

    // Set up file watcher - watch the specific component file
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
    }

    // Watch the original component file - Storybook will HMR automatically
    this.fileWatcher = vscode.workspace.createFileSystemWatcher(
      componentUri.fsPath
    );

    this.fileWatcher.onDidChange(() => {
      // Storybook's HMR will handle updates automatically
      // Just reset the inactivity timer
      this.storybookServer.resetInactivityTimer();
    });

    // Start Storybook server if not running
    try {
      if (!(await this.storybookServer.isRunning())) {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Starting Storybook...",
            cancellable: false
          },
          async () => {
            await this.storybookServer.start();
          }
        );
      } else {
        // Reset inactivity timer if already running
        this.storybookServer.resetInactivityTimer();
      }

      // Get component name from filename
      const componentName = this.getComponentName(fileName);

      // Try to find the story URL, otherwise just show Storybook home
      const storybookUrl = this.getStorybookUrl(componentName);

      this.panel.webview.html = this.getWebviewContent(storybookUrl, componentName);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      vscode.window.showErrorMessage(
        `Failed to start Storybook: ${message}`
      );
    }
  }

  private getComponentName(fileName: string): string {
    // Remove file extension
    return fileName.replace(/\.(tsx|jsx|ts|js)$/, '');
  }

  private getStorybookUrl(componentName: string): string {
    const baseUrl = this.storybookServer.getUrl();
    // Navigate to the component's docs page which shows all stories
    // Storybook URL format: /?path=/docs/components-componentname--docs
    const docsPath = `components-${componentName.toLowerCase()}--docs`;
    return `${baseUrl}/?path=/docs/${docsPath}`;
  }

  private getWebviewContent(storybookUrl: string, componentName: string): string {
    const port = this.storybookServer.getPort();
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Storybook Preview</title>
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
        <div class="loading-text">Starting Storybook...</div>
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
        const maxAttempts = 60; // Storybook takes longer to start
        let checkInterval;

        // Function to check if Storybook server is ready
        function checkServer() {
            attempts++;
            loadingText.textContent = \`Connecting to Storybook... (\${attempts}/\${maxAttempts})\`;

            fetch('http://localhost:${port}/')
                .then(response => {
                    if (response.ok) {
                        clearInterval(checkInterval);
                        loadingText.textContent = 'Loading ${componentName} stories...';

                        // Server is ready, load the iframe with the specific component
                        iframe.src = '${storybookUrl}';
                        iframe.style.display = 'block';

                        iframe.onload = function() {
                            loading.style.display = 'none';
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
                                <strong>Failed to connect to Storybook</strong>
                                <p style="margin: 8px 0 0 0; font-size: 12px;">
                                    Make sure test-app dependencies are installed:<br>
                                    <code style="background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 3px;">
                                        cd test-app && npm install
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
    StorybookPreviewPanel.currentPanel = undefined;

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
    if (StorybookPreviewPanel.currentPanel && StorybookPreviewPanel.currentPanel.currentComponentUri) {
      // Reload the component
      StorybookPreviewPanel.currentPanel.setComponent(
        StorybookPreviewPanel.currentPanel.currentComponentUri
      );
    }
  }
}
