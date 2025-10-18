import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ComponentParser } from './componentParser';

export class ReactPreviewPanel {
    private static currentPanel: ReactPreviewPanel | undefined;
    private readonly panel: vscode.WebviewPanel;
    private readonly extensionPath: string;
    private disposables: vscode.Disposable[] = [];
    private parser: ComponentParser;
    private currentComponentUri: vscode.Uri | undefined;
    private fileWatcher: vscode.FileSystemWatcher | undefined;

    private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
        this.panel = panel;
        this.extensionPath = extensionPath;
        this.parser = new ComponentParser();

        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'ready':
                        this.updatePreview();
                        break;
                    case 'error':
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

    public static createOrShow(extensionPath: string, componentUri: vscode.Uri) {
        const column = vscode.ViewColumn.Beside;

        // If we already have a panel, show it
        if (ReactPreviewPanel.currentPanel) {
            ReactPreviewPanel.currentPanel.panel.reveal(column);
            ReactPreviewPanel.currentPanel.setComponent(componentUri);
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            'reactPreview',
            'React Preview',
            column,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(extensionPath)
                ]
            }
        );

        ReactPreviewPanel.currentPanel = new ReactPreviewPanel(panel, extensionPath);
        ReactPreviewPanel.currentPanel.setComponent(componentUri);
    }

    public setComponent(componentUri: vscode.Uri) {
        this.currentComponentUri = componentUri;

        // Update panel title
        const fileName = path.basename(componentUri.fsPath);
        this.panel.title = `Preview: ${fileName}`;

        // Set up file watcher
        if (this.fileWatcher) {
            this.fileWatcher.dispose();
        }

        const pattern = new vscode.RelativePattern(
            path.dirname(componentUri.fsPath),
            '**/*.{js,jsx,ts,tsx,css}'
        );

        this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
        this.fileWatcher.onDidChange(() => {
            if (vscode.workspace.getConfiguration('reactview').get('autoRefresh', true)) {
                this.updatePreview();
            }
        });

        this.updatePreview();
    }

    private updatePreview() {
        if (!this.currentComponentUri) {
            return;
        }

        try {
            // Parse component to get prop information
            const componentInfo = this.parser.parseComponent(this.currentComponentUri.fsPath);

            // Read the component source code
            const componentCode = fs.readFileSync(this.currentComponentUri.fsPath, 'utf8');

            // Generate and set HTML content
            this.panel.webview.html = this.getWebviewContent(componentInfo, componentCode);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to parse component: ${message}`);
        }
    }

    private getWebviewContent(componentInfo: any, componentCode: string): string {
        const nonce = this.getNonce();

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' https://cdn.jsdelivr.net; script-src 'nonce-${nonce}' https://unpkg.com https://cdn.jsdelivr.net;">
    <title>React Preview</title>
    <script nonce="${nonce}" crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script nonce="${nonce}" crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script nonce="${nonce}" src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }
        .container {
            padding: 20px;
        }
        .header {
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 16px;
            margin-bottom: 20px;
        }
        .component-info {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 20px;
            font-size: 13px;
        }
        .prop-controls {
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 16px;
            margin-bottom: 20px;
        }
        .prop-control {
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .prop-control label {
            min-width: 120px;
            font-weight: 500;
            font-size: 13px;
        }
        .prop-control input,
        .prop-control select {
            padding: 4px 8px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
            font-size: 13px;
            min-width: 200px;
        }
        .prop-control input:focus,
        .prop-control select:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }
        .preset-controls {
            margin-bottom: 16px;
        }
        .preset-btn {
            padding: 6px 12px;
            margin-right: 8px;
            margin-bottom: 8px;
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: none;
            border-radius: 2px;
            cursor: pointer;
            font-size: 12px;
        }
        .preset-btn:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        .preview-area {
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 20px;
            min-height: 300px;
            background-color: var(--vscode-editor-background);
        }
        .error {
            color: var(--vscode-errorForeground);
            background-color: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
            padding: 12px;
            border-radius: 4px;
            margin: 10px 0;
        }
        h3 {
            margin-top: 0;
            margin-bottom: 16px;
            font-size: 14px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h3>React Component Preview</h3>
            <div style="font-size: 12px; opacity: 0.8;">${componentInfo.name}</div>
        </div>

        <div class="component-info">
            <strong>File:</strong> ${componentInfo.filePath}<br>
            <strong>Props:</strong> ${Object.keys(componentInfo.props || {}).length} detected
        </div>

        <div class="prop-controls">
            <h3>Component Props</h3>
            <div id="preset-container"></div>
            <div id="props-container"></div>
        </div>

        <div class="preview-area">
            <h3>Live Preview</h3>
            <div id="preview-root"></div>
        </div>
    </div>

    <script nonce="${nonce}" type="text/babel">
        const { useState, useEffect } = React;
        const vscode = acquireVsCodeApi();

        const componentInfo = ${JSON.stringify(componentInfo)};
        const componentCode = ${JSON.stringify(componentCode)};

        function PreviewApp() {
            const [props, setProps] = useState({});
            const [error, setError] = useState(null);

            const updateProp = (propName, value) => {
                setProps(prev => ({ ...prev, [propName]: value }));
            };

            const applyPreset = (presetProps) => {
                setProps(presetProps);
            };

            const generatePresets = () => {
                const presets = [{ name: 'Default', props: {} }];
                const compProps = componentInfo.props || {};

                if (compProps.variant) {
                    ['primary', 'secondary', 'danger', 'success', 'warning'].forEach(variant => {
                        presets.push({
                            name: variant.charAt(0).toUpperCase() + variant.slice(1),
                            props: { variant }
                        });
                    });
                }

                if (compProps.size) {
                    ['small', 'medium', 'large'].forEach(size => {
                        presets.push({
                            name: size.charAt(0).toUpperCase() + size.slice(1),
                            props: { size }
                        });
                    });
                }

                if (compProps.disabled !== undefined) {
                    presets.push({ name: 'Disabled', props: { disabled: true } });
                }

                return presets.slice(0, 8);
            };

            const PropControl = ({ propName, propInfo }) => {
                const type = propInfo.type?.toLowerCase() || 'string';
                const value = props[propName] ?? propInfo.defaultValue ?? '';

                if (type.includes('boolean')) {
                    return (
                        <div className="prop-control">
                            <label htmlFor={'prop-' + propName}>{propName}:</label>
                            <input
                                id={'prop-' + propName}
                                type="checkbox"
                                checked={value === true || value === 'true'}
                                onChange={(e) => updateProp(propName, e.target.checked)}
                            />
                        </div>
                    );
                }

                if (type.includes('number')) {
                    return (
                        <div className="prop-control">
                            <label htmlFor={'prop-' + propName}>{propName}:</label>
                            <input
                                id={'prop-' + propName}
                                type="number"
                                value={value}
                                onChange={(e) => updateProp(propName, parseFloat(e.target.value) || 0)}
                            />
                        </div>
                    );
                }

                if (type.includes('|')) {
                    const options = type.split('|').map(opt => opt.trim().replace(/['"]/g, ''));
                    return (
                        <div className="prop-control">
                            <label htmlFor={'prop-' + propName}>{propName}:</label>
                            <select
                                id={'prop-' + propName}
                                value={value}
                                onChange={(e) => updateProp(propName, e.target.value)}
                            >
                                {options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    );
                }

                return (
                    <div className="prop-control">
                        <label htmlFor={'prop-' + propName}>{propName}:</label>
                        <input
                            id={'prop-' + propName}
                            type="text"
                            value={value}
                            placeholder={type}
                            onChange={(e) => updateProp(propName, e.target.value)}
                        />
                    </div>
                );
            };

            const ComponentRenderer = () => {
                try {
                    // Extract component from the code
                    // This is a simplified approach - we're looking for default export or named export
                    const cleanCode = componentCode
                        .replace(/import\s+.*?from\s+['"].*?['"]/g, '') // Remove imports
                        .replace(/export\s+default/g, 'return') // Convert default export to return
                        .replace(/export\s+(?:const|function|class)/g, 'return'); // Convert named exports

                    // Try to evaluate the component
                    // In a real scenario, you'd want better sandboxing and error handling
                    const componentFunc = new Function('React', 'props', cleanCode);
                    const Component = componentFunc(React, props);

                    if (typeof Component === 'function') {
                        return <Component {...props} />;
                    } else if (Component && Component.type) {
                        // It might be already a React element
                        return React.cloneElement(Component, props);
                    }

                    return (
                        <div style={{ padding: '20px', border: '2px dashed var(--vscode-panel-border)', textAlign: 'center' }}>
                            <p><strong>Component: {componentInfo.name}</strong></p>
                            <pre style={{ textAlign: 'left', backgroundColor: 'var(--vscode-editor-inactiveSelectionBackground)', padding: '10px', borderRadius: '4px' }}>
                                {JSON.stringify(props, null, 2)}
                            </pre>
                            <p style={{ fontSize: '12px', opacity: '0.7' }}>
                                <em>Note: Component rendering requires proper export format</em>
                            </p>
                        </div>
                    );
                } catch (err) {
                    return (
                        <div className="error">
                            <strong>Render Error:</strong> {err.message}
                            <details style={{ marginTop: '8px' }}>
                                <summary style={{ cursor: 'pointer' }}>Details</summary>
                                <pre style={{ fontSize: '11px', marginTop: '8px' }}>{err.stack}</pre>
                            </details>
                        </div>
                    );
                }
            };

            return (
                <>
                    <div id="preset-container">
                        <div className="preset-controls">
                            <h3 style={{ fontSize: '13px', marginBottom: '8px' }}>Preset Variations</h3>
                            {generatePresets().map(preset => (
                                <button
                                    key={preset.name}
                                    className="preset-btn"
                                    onClick={() => applyPreset(preset.props)}
                                >
                                    {preset.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div id="props-container">
                        {Object.entries(componentInfo.props || {}).map(([propName, propInfo]) => (
                            <PropControl key={propName} propName={propName} propInfo={propInfo} />
                        ))}
                    </div>

                    <div style={{ marginTop: '-10px' }}>
                        <ComponentRenderer />
                    </div>
                </>
            );
        }

        // Render the app
        const root = ReactDOM.createRoot(document.getElementById('preview-root'));
        root.render(<PreviewApp />);

        // Notify extension that webview is ready
        vscode.postMessage({ command: 'ready' });
    </script>
</body>
</html>`;
    }

    private getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
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
