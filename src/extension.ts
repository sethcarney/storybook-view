import * as vscode from "vscode";
import { ReactPreviewPanel } from "./webviewPanel";

export function activate(context: vscode.ExtensionContext) {
  console.log("ReactView extension is now active");

  // Register commands
  const openPreviewCommand = vscode.commands.registerCommand(
    "reactview.openPreview",
    async (uri?: vscode.Uri) => {
      const activeEditor = vscode.window.activeTextEditor;
      const targetUri = uri || activeEditor?.document.uri;

      if (!targetUri) {
        vscode.window.showErrorMessage("No React component file selected");
        return;
      }

      if (!isReactFile(targetUri.fsPath)) {
        vscode.window.showErrorMessage(
          "Please select a React component file (.jsx or .tsx)"
        );
        return;
      }

      try {
        ReactPreviewPanel.createOrShow(context.extensionPath, targetUri);
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to open preview: ${error}`);
      }
    }
  );

  const refreshPreviewCommand = vscode.commands.registerCommand(
    "reactview.refreshPreview",
    () => {
      ReactPreviewPanel.refresh();
    }
  );

  context.subscriptions.push(openPreviewCommand, refreshPreviewCommand);
}

export function deactivate() {
  // Cleanup is handled by the webview panel disposal
}

function isReactFile(filePath: string): boolean {
  return /\.(jsx|tsx)$/.test(filePath);
}
