import * as vscode from 'vscode';
import * as express from 'express';
import * as WebSocket from 'ws';
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import { ComponentParser } from './componentParser';

export class PreviewServer {
    private app: express.Application;
    private server: http.Server | undefined;
    private wss: WebSocket.Server | undefined;
    private currentComponent: vscode.Uri | undefined;
    private parser: ComponentParser;
    private port: number;

    constructor(private context: vscode.ExtensionContext) {
        this.app = express();
        this.parser = new ComponentParser();
        this.port = vscode.workspace.getConfiguration('reactview').get('port', 3001);
        this.setupRoutes();
    }

    private setupRoutes() {
        // Serve static files
        this.app.use('/static', express.static(path.join(this.context.extensionPath, 'preview-client')));
        
        // API endpoint to get component info
        this.app.get('/api/component', (req, res) => {
            if (!this.currentComponent) {
                return res.status(404).json({ error: 'No component loaded' });
            }

            try {
                const componentInfo = this.parser.parseComponent(this.currentComponent.fsPath);
                res.json(componentInfo);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Serve the preview page
        this.app.get('/', (req, res) => {
            const html = this.generatePreviewHTML();
            res.send(html);
        });
    }

    private generatePreviewHTML(): string {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ReactView Preview</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            font-family: system-ui, -apple-system, sans-serif;
            background: #f5f5f5;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .component-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
        .prop-controls {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 20px;
        }
        .preview-area {
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 20px;
            min-height: 200px;
        }
        .prop-control {
            margin-bottom: 10px;
        }
        .prop-control label {
            display: inline-block;
            width: 120px;
            font-weight: 500;
        }
        .prop-control input, .prop-control select {
            padding: 5px 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            width: 200px;
        }
        .error {
            color: #d32f2f;
            background: #ffebee;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ReactView Preview</h1>
            <div id="component-path"></div>
        </div>
        
        <div id="component-info" class="component-info"></div>
        
        <div id="prop-controls" class="prop-controls">
            <h3>Component Props</h3>
            <div id="props-container"></div>
        </div>
        
        <div class="preview-area">
            <h3>Preview</h3>
            <div id="preview-container"></div>
        </div>
    </div>

    <script>
        const { useState, useEffect } = React;
        
        let ws;
        let componentData = null;
        let currentProps = {};

        function connectWebSocket() {
            ws = new WebSocket('ws://localhost:${this.port}/ws');
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'refresh') {
                    loadComponent();
                }
            };
            
            ws.onclose = () => {
                setTimeout(connectWebSocket, 1000);
            };
        }

        async function loadComponent() {
            try {
                const response = await fetch('/api/component');
                if (!response.ok) throw new Error('Failed to load component');
                
                componentData = await response.json();
                renderComponentInfo();
                renderPropControls();
                renderPreview();
            } catch (error) {
                document.getElementById('preview-container').innerHTML = 
                    '<div class="error">Error loading component: ' + error.message + '</div>';
            }
        }

        function renderComponentInfo() {
            if (!componentData) return;
            
            document.getElementById('component-path').textContent = componentData.filePath;
            document.getElementById('component-info').innerHTML = 
                '<strong>Component:</strong> ' + componentData.name + 
                '<br><strong>Props:</strong> ' + Object.keys(componentData.props || {}).length;
        }

        function renderPropControls() {
            if (!componentData || !componentData.props) return;
            
            const container = document.getElementById('props-container');
            container.innerHTML = '';
            
            // Add preset variations button
            const presetsDiv = document.createElement('div');
            presetsDiv.className = 'preset-controls';
            presetsDiv.innerHTML = '<h4 style="margin: 0 0 10px 0;">Preset Variations:</h4>';
            
            const presetButtons = document.createElement('div');
            presetButtons.style.marginBottom = '20px';
            
            // Generate some common preset variations
            const presets = generatePresetVariations();
            presets.forEach((preset, index) => {
                const button = document.createElement('button');
                button.textContent = preset.name;
                button.className = 'preset-btn';
                button.style.cssText = 'margin-right: 10px; margin-bottom: 5px; padding: 5px 10px; border: 1px solid #ccc; border-radius: 4px; background: #f5f5f5; cursor: pointer;';
                button.addEventListener('click', () => {
                    currentProps = {...preset.props};
                    updatePropInputs();
                    renderPreview();
                });
                presetButtons.appendChild(button);
            });
            
            presetsDiv.appendChild(presetButtons);
            container.appendChild(presetsDiv);
            
            // Add individual prop controls
            Object.entries(componentData.props).forEach(([propName, propInfo]) => {
                const controlDiv = document.createElement('div');
                controlDiv.className = 'prop-control';
                
                const label = document.createElement('label');
                label.textContent = propName + ':';
                
                const input = createPropInput(propName, propInfo);
                input.id = 'prop-' + propName;
                
                controlDiv.appendChild(label);
                controlDiv.appendChild(input);
                container.appendChild(controlDiv);
            });
        }

        function generatePresetVariations() {
            if (!componentData) return [];
            
            const presets = [
                { name: 'Default', props: {} }
            ];
            
            // Generate common variations based on component props
            const props = componentData.props || {};
            
            if (props.variant) {
                const variants = ['primary', 'secondary', 'danger', 'success', 'warning'];
                variants.forEach(variant => {
                    presets.push({
                        name: variant.charAt(0).toUpperCase() + variant.slice(1),
                        props: { variant }
                    });
                });
            }
            
            if (props.size) {
                const sizes = ['small', 'medium', 'large'];
                sizes.forEach(size => {
                    presets.push({
                        name: size.charAt(0).toUpperCase() + size.slice(1),
                        props: { size }
                    });
                });
            }
            
            if (props.disabled !== undefined) {
                presets.push({
                    name: 'Disabled',
                    props: { disabled: true }
                });
            }
            
            if (props.isOnline !== undefined) {
                presets.push(
                    { name: 'Online', props: { isOnline: true } },
                    { name: 'Offline', props: { isOnline: false } }
                );
            }
            
            return presets.slice(0, 8); // Limit to 8 presets
        }

        function createPropInput(propName, propInfo) {
            const type = propInfo.type?.toLowerCase() || 'string';
            
            if (type.includes('boolean')) {
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = currentProps[propName] === true || currentProps[propName] === 'true';
                input.addEventListener('change', (e) => {
                    currentProps[propName] = e.target.checked;
                    renderPreview();
                });
                return input;
            }
            
            if (type.includes('number')) {
                const input = document.createElement('input');
                input.type = 'number';
                input.value = currentProps[propName] || propInfo.defaultValue || '';
                input.addEventListener('input', (e) => {
                    currentProps[propName] = parseFloat(e.target.value) || 0;
                    renderPreview();
                });
                return input;
            }
            
            if (type.includes('|')) {
                // Union type - create a select dropdown
                const select = document.createElement('select');
                const options = type.split('|').map(opt => opt.trim().replace(/['"]/g, ''));
                
                options.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option;
                    optionElement.textContent = option;
                    select.appendChild(optionElement);
                });
                
                select.value = currentProps[propName] || propInfo.defaultValue || options[0];
                select.addEventListener('change', (e) => {
                    currentProps[propName] = e.target.value;
                    renderPreview();
                });
                return select;
            }
            
            // Default to text input
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = propInfo.type || 'string';
            input.value = currentProps[propName] || propInfo.defaultValue || '';
            
            input.addEventListener('input', (e) => {
                currentProps[propName] = e.target.value;
                renderPreview();
            });
            
            return input;
        }
        
        function updatePropInputs() {
            Object.keys(currentProps).forEach(propName => {
                const input = document.getElementById('prop-' + propName);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = currentProps[propName] === true;
                    } else {
                        input.value = currentProps[propName] || '';
                    }
                }
            });
        }

        function renderPreview() {
            if (!componentData) return;
            
            try {
                // This is a simplified preview - in a real implementation,
                // you'd need to properly transform and execute the component code
                const container = document.getElementById('preview-container');
                container.innerHTML = 
                    '<div style="padding: 20px; border: 2px dashed #ccc; text-align: center;">' +
                    '<p>Component: ' + componentData.name + '</p>' +
                    '<p>Props: ' + JSON.stringify(currentProps, null, 2) + '</p>' +
                    '<p><em>Live preview coming soon...</em></p>' +
                    '</div>';
            } catch (error) {
                document.getElementById('preview-container').innerHTML = 
                    '<div class="error">Preview error: ' + error.message + '</div>';
            }
        }

        // Initialize
        connectWebSocket();
        loadComponent();
    </script>
</body>
</html>
        `;
    }

    async openPreview(componentUri: vscode.Uri) {
        this.currentComponent = componentUri;
        
        if (!this.server) {
            await this.startServer();
        }

        // Open preview in browser
        const url = `http://localhost:${this.port}`;
        vscode.env.openExternal(vscode.Uri.parse(url));
    }

    private async startServer(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server = this.app.listen(this.port, () => {
                console.log(`ReactView preview server running on port ${this.port}`);
                
                // Setup WebSocket server for live updates
                this.wss = new WebSocket.Server({ server: this.server });
                this.wss.on('connection', (ws) => {
                    console.log('WebSocket client connected');
                });
                
                resolve();
            }).on('error', (err) => {
                reject(err);
            });
        });
    }

    refreshPreview() {
        if (this.wss) {
            this.wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'refresh' }));
                }
            });
        }
    }

    onFileChange(uri: vscode.Uri) {
        if (vscode.workspace.getConfiguration('reactview').get('autoRefresh', true)) {
            this.refreshPreview();
        }
    }

    isWatching(uri: vscode.Uri): boolean {
        return this.currentComponent?.fsPath === uri.fsPath;
    }

    dispose() {
        if (this.wss) {
            this.wss.close();
        }
        if (this.server) {
            this.server.close();
        }
    }
}