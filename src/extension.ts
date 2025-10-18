import * as vscode from 'vscode';
import { PreviewServer } from './previewServer';
import { ComponentParser } from './componentParser';

let previewServer: PreviewServer | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('ReactView extension is now active');

    // Initialize preview server
    previewServer = new PreviewServer(context);

    // Register commands
    const openPreviewCommand = vscode.commands.registerCommand('reactview.openPreview', async (uri?: vscode.Uri) => {
        const activeEditor = vscode.window.activeTextEditor;
        const targetUri = uri || activeEditor?.document.uri;

        if (!targetUri) {
            vscode.window.showErrorMessage('No React component file selected');
            return;
        }

        if (!isReactFile(targetUri.fsPath)) {
            vscode.window.showErrorMessage('Please select a React component file (.jsx or .tsx)');
            return;
        }

        try {
            await previewServer?.openPreview(targetUri);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open preview: ${error}`);
        }
    });

    const refreshPreviewCommand = vscode.commands.registerCommand('reactview.refreshPreview', () => {
        previewServer?.refreshPreview();
    });

    // Watch for file changes
    const watcher = vscode.workspace.createFileSystemWatcher('**/*.{jsx,tsx,js,ts}');
    watcher.onDidChange((uri) => {
        if (previewServer?.isWatching(uri)) {
            previewServer.onFileChange(uri);
        }
    });

    context.subscriptions.push(
        openPreviewCommand,
        refreshPreviewCommand,
        watcher
    );
}

export function deactivate() {
    previewServer?.dispose();
}

function isReactFile(filePath: string): boolean {
    return /\.(jsx|tsx)$/.test(filePath);
}