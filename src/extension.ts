import * as vscode from "vscode";
import { ReactPreviewPanel } from "./webviewPanel";
import { StorybookServer } from "./storybookServer";

export function activate(context: vscode.ExtensionContext) {
  console.log("ReactView extension is now active");

  const storybookServer = StorybookServer.getInstance(context.extensionPath);

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

  const startStorybookCommand = vscode.commands.registerCommand(
    "reactview.startStorybook",
    async () => {
      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Starting Storybook...",
            cancellable: false
          },
          async () => {
            const port = await storybookServer.start();
            vscode.window.showInformationMessage(
              `Storybook started on port ${port}`
            );
          }
        );
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to start Storybook: ${error}`
        );
      }
    }
  );

  const stopStorybookCommand = vscode.commands.registerCommand(
    "reactview.stopStorybook",
    () => {
      if (storybookServer.isRunning()) {
        storybookServer.stop();
        vscode.window.showInformationMessage("Storybook stopped");
      } else {
        vscode.window.showInformationMessage("Storybook is not running");
      }
    }
  );

  const openStorybookCommand = vscode.commands.registerCommand(
    "reactview.openStorybook",
    async () => {
      if (!storybookServer.isRunning()) {
        const start = await vscode.window.showInformationMessage(
          "Storybook is not running. Would you like to start it?",
          "Start Storybook",
          "Cancel"
        );
        if (start === "Start Storybook") {
          await vscode.commands.executeCommand("reactview.startStorybook");
        } else {
          return;
        }
      }
      vscode.env.openExternal(vscode.Uri.parse(storybookServer.getUrl()));
    }
  );

  context.subscriptions.push(
    openPreviewCommand,
    refreshPreviewCommand,
    startStorybookCommand,
    stopStorybookCommand,
    openStorybookCommand
  );
}

export function deactivate() {
  // Stop Storybook server on extension deactivation
  const storybookServer = StorybookServer.getInstance("");
  if (storybookServer.isRunning()) {
    storybookServer.stop();
  }
}

function isReactFile(filePath: string): boolean {
  return /\.(jsx|tsx)$/.test(filePath);
}
