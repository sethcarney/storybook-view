import * as fs from "fs";
import * as vscode from "vscode";
import { StorybookServer } from "./storybookServer";
import { StorybookPreviewPanel } from "./webviewPanel";

export function activate(context: vscode.ExtensionContext) {
  console.log("Storybook View extension is now active");

  const storybookServer = StorybookServer.getInstance(context.extensionPath);

  // Register commands
  const openPreviewCommand = vscode.commands.registerCommand(
    "storybookview.openPreview",
    async (uri?: vscode.Uri) => {
      const activeEditor = vscode.window.activeTextEditor;
      const targetUri = uri || activeEditor?.document.uri;

      if (!targetUri) {
        vscode.window.showErrorMessage("No component file selected");
        return;
      }

      if (!isComponentFile(targetUri.fsPath)) {
        vscode.window.showErrorMessage(
          "Please select a component file (.jsx, .tsx, .ts, .js, .vue, or .svelte)"
        );
        return;
      }

      // If this is a .stories file, find the corresponding component file
      let componentUri = targetUri;
      if (targetUri.fsPath.includes(".stories.")) {
        const base = targetUri.fsPath.replace(
          /\.stories\.(tsx|jsx|ts|js|vue|svelte)$/,
          ""
        );
        const candidateExts = ["tsx", "jsx", "ts", "js", "vue", "svelte"];
        const componentPath = candidateExts
          .map(ext => `${base}.${ext}`)
          .find(p => fs.existsSync(p));
        if (componentPath) {
          componentUri = vscode.Uri.file(componentPath);
        } else {
          vscode.window.showErrorMessage(
            "Could not find corresponding component file"
          );
          return;
        }
      }

      try {
        StorybookPreviewPanel.createOrShow(context.extensionPath, componentUri);
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to open preview: ${error}`);
      }
    }
  );

  const refreshPreviewCommand = vscode.commands.registerCommand(
    "storybookview.refreshPreview",
    () => {
      StorybookPreviewPanel.refresh();
    }
  );

  const startStorybookCommand = vscode.commands.registerCommand(
    "storybookview.startStorybook",
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
        vscode.window.showErrorMessage(`Failed to start Storybook: ${error}`);
      }
    }
  );

  const stopStorybookCommand = vscode.commands.registerCommand(
    "storybookview.stopStorybook",
    async () => {
      const isRunning = await storybookServer.isRunning();
      const canStop = storybookServer.canStop();

      if (!isRunning) {
        vscode.window.showInformationMessage("Storybook is not running");
      } else if (!canStop) {
        vscode.window.showWarningMessage(
          "Storybook is running externally. Please stop it manually."
        );
      } else {
        await storybookServer.stop();
        vscode.window.showInformationMessage(
          "Storybook server has been terminated"
        );
      }
    }
  );

  const openStorybookCommand = vscode.commands.registerCommand(
    "storybookview.openStorybook",
    async () => {
      if (!(await storybookServer.isRunning())) {
        const start = await vscode.window.showInformationMessage(
          "Storybook is not running. Would you like to start it?",
          "Start Storybook",
          "Cancel"
        );
        if (start === "Start Storybook") {
          await vscode.commands.executeCommand("storybookview.startStorybook");
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

export async function deactivate() {
  // Stop Storybook server on extension deactivation
  console.log("[Extension] Deactivating - cleaning up Storybook server...");
  try {
    const storybookServer = StorybookServer.getInstance("");
    const isRunning = await storybookServer.isRunning();
    const canStop = storybookServer.canStop();

    if (isRunning && canStop) {
      console.log("[Extension] Stopping Storybook server...");
      await storybookServer.stop();
      console.log("[Extension] Storybook server stopped successfully");
    }
  } catch (error) {
    console.error("[Extension] Error during deactivation:", error);
  }
}

function isComponentFile(filePath: string): boolean {
  return /\.(jsx|tsx|ts|js|vue|svelte)$/.test(filePath);
}
