# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Storybook View** is a Visual Studio Code extension that provides Storybook integration for React components. The extension allows developers to preview their React components with all Storybook features directly within VSCode, without leaving the editor.

The extension consists of:

1. **VSCode Extension** (`src/`) - TypeScript extension code that manages Storybook server lifecycle
2. **Test React App** (`test-app/`) - Vite + React + Tailwind + Storybook test application

## Architecture

### Core Concept

The extension acts as a **wrapper around your existing Storybook setup**. It doesn't implement its own preview system; instead, it:
1. Starts your project's Storybook dev server
2. Opens a webview panel with an iframe pointing to Storybook
3. Navigates to the specific component's docs page
4. Manages the server lifecycle (auto-start, auto-stop)

### Extension Flow

1. User clicks the eye icon on a `.jsx` or `.tsx` component file
2. Extension checks if Storybook server is running
3. If not running, starts Storybook server on port 6006
4. Opens a webview panel with loading spinner
5. Webview polls Storybook server until it's ready (~10-20 seconds first time)
6. Once ready, loads the component's Storybook docs page in iframe
7. Storybook's HMR automatically updates the preview when files change
8. Inactivity timer (5 minutes) automatically stops Storybook to save resources

### Key Components

#### extension.ts
- Main entry point for the extension
- Registers commands:
  - `storybookview.openPreview` - Open component preview
  - `storybookview.startStorybook` - Manually start Storybook
  - `storybookview.stopStorybook` - Manually stop Storybook
  - `storybookview.openStorybook` - Open Storybook in external browser
  - `storybookview.refreshPreview` - Refresh current preview
- Manages lifecycle via `activate()` and `deactivate()`
- Cleans up Storybook server on VSCode close

#### storybookServer.ts
- Singleton class managing Storybook dev server process
- **Server Management**:
  - Spawns Storybook as child process using `npx storybook dev`
  - Uses dual detection: stdout parsing + HTTP polling (checks every 2 seconds)
  - Properly kills process tree on Windows using `taskkill`
- **Inactivity Timer**:
  - 5-minute timer starts when server is active
  - Resets on component preview or file edit
  - Auto-stops server when timer expires
- **Intentional Stop Tracking**:
  - Tracks manual stops vs crashes using `isIntentionalStop` flag
  - Prevents false error messages when user stops server
- **Port Detection**:
  - `checkIfPortInUse()` - Checks if port is occupied (TCP)
  - `checkIfPortResponding()` - Checks if HTTP server is responding
  - Supports external Storybook instances

#### webviewPanel.ts
- Manages the webview that displays Storybook
- **Lifecycle**:
  - Singleton pattern (`currentPanel`)
  - Creates webview panel with `retainContextWhenHidden`
  - Shows HTML with loading spinner immediately
  - Starts Storybook in background (non-blocking)
- **URL Construction**:
  - Navigates to docs page: `http://localhost:6006/?path=/docs/components-{componentname}--docs`
  - Docs page shows all story variations for the component
- **Webview Polling**:
  - JavaScript in webview polls `http://localhost:6006/` every second
  - 60-second timeout with helpful error message
  - Once connected, loads component-specific URL in iframe
- **File Watching**:
  - Watches component file for changes
  - Resets inactivity timer (Storybook HMR handles actual updates)
- **Cleanup**:
  - Disposes file watchers and webview on panel close

## Development Commands

### Initial Setup

```bash
npm install              # Install extension dependencies
cd test-app && npm install  # Install test-app dependencies
npm run compile         # Compile TypeScript
```

### Extension Development

```bash
npm run dev            # TypeScript compilation in watch mode
npm run compile        # Compile extension TypeScript once
npm run lint          # Run ESLint on extension code
```

### Testing the Extension

1. Press `F5` in VSCode to launch Extension Development Host
2. Open component files from `test-app/src/components/`
3. Click eye icon in editor toolbar to preview
4. Storybook opens showing all story variations
5. Check Debug Console for logs

### Test App & Storybook

```bash
cd test-app
npm run dev           # Start Vite dev server (port 5173)
npm run storybook     # Start Storybook standalone (port 6006)
```

### Packaging

```bash
npm run package                 # Creates .vsix file
npm run install-extension       # Installs the .vsix locally
```

## Storybook Integration

### Story File Structure

Stories are located in `test-app/src/components/` alongside their components:

```
test-app/src/components/
├── Button.tsx
├── Button.stories.tsx
├── Card.tsx
├── Card.stories.tsx
└── ...
```

### Creating New Stories

Follow this pattern for new component stories:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from './YourComponent';

const meta = {
  title: 'Components/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Define prop controls here
  },
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default props
  },
};

export const Variant: Story = {
  args: {
    // Variant props
  },
};
```

### Storybook Configuration

- **`.storybook/main.ts`** - Storybook configuration, loads stories from `src/components/**/*.stories.tsx`
- **`.storybook/preview.ts`** - Global Storybook settings, imports Tailwind CSS

## Configuration Settings

Available in VSCode settings:

- `storybookview.storybookPath`: Path to Storybook directory relative to workspace root (default: "")
- `storybookview.port`: Storybook server port (default: 6006)
- `storybookview.inactivityTimeout`: Auto-stop server after N minutes of inactivity (default: 5, range: 1-60)

## Server Lifecycle Management

### Auto-Start Behavior
- Storybook auto-starts when user previews a component
- First start takes ~10-20 seconds (Storybook compilation)
- Webview shows loading spinner during startup
- Dual detection ensures reliable startup detection

### Staying Running
- Server stays running for multiple component previews
- No restart needed when switching between components
- Improves performance after initial startup

### Auto-Stop Behavior
- 5-minute inactivity timer to save resources
- Timer resets when user:
  - Opens a new component preview
  - Edits a watched component file
- Notification shown when auto-stopped
- Can manually stop via Command Palette

### Intentional Stop Handling
- Uses `isIntentionalStop` flag to track manual stops
- Prevents false error messages on intentional stop
- Cleans up process properly on VSCode close

## Preview Navigation

- Extension navigates to Storybook's **docs page** for each component
- Docs page shows all story variations in a single view
- URL format: `http://localhost:6006/?path=/docs/components-{componentname}--docs`
- Storybook's built-in HMR handles live updates automatically

## Hot Module Replacement

- Storybook's built-in HMR handles all live updates
- Extension doesn't need to manage reload logic
- File watcher only resets inactivity timer
- Changes reflect instantly via Storybook's Vite integration

## Common Development Tasks

### Adding a New Test Component

1. Create component in `test-app/src/components/YourComponent.tsx`
2. Create story file `test-app/src/components/YourComponent.stories.tsx`
3. Export multiple story variations
4. Click eye icon on component file to preview

### Extending the Extension

- **Add new commands**: Register in `package.json` and `extension.ts`
- **Modify server behavior**: Edit `storybookServer.ts`
- **Change preview UI**: Update webview HTML in `webviewPanel.ts`

### Debugging

- Extension logs appear in VSCode Debug Console (when pressing F5)
- Storybook server logs appear with `[Storybook]` prefix
- Use `console.log` for debugging (appears in Debug Console)
- Webview logs appear in webview developer tools (right-click > Inspect)

## Project Structure

```
storybook-view/
├── src/                        # Extension source code
│   ├── extension.ts           # Main entry point, registers commands
│   ├── storybookServer.ts     # Storybook server lifecycle manager
│   └── webviewPanel.ts        # Webview UI manager (iframe wrapper)
├── test-app/                   # Test React application
│   ├── .storybook/            # Storybook configuration
│   │   ├── main.ts            # Stories glob patterns
│   │   └── preview.ts         # Global settings, Tailwind import
│   └── src/
│       └── components/        # Test components and their stories
│           ├── Button.tsx
│           ├── Button.stories.tsx
│           ├── Card.tsx
│           ├── Card.stories.tsx
│           └── ...
├── out/                        # Compiled JavaScript (gitignored)
├── package.json               # Extension manifest and dependencies
├── tsconfig.json             # TypeScript configuration
├── CLAUDE.md                 # This file
├── README.md                 # User documentation
└── CHANGELOG.md              # Version history
```

## Troubleshooting

### Storybook Won't Start

1. Check the "Storybook" output channel (View > Output > Storybook) for detailed logs
2. Try running manually: `cd your-project && npx storybook dev`
3. Verify Storybook works standalone: `npm run storybook`
4. Check port isn't already in use
5. If ".storybook directory not found" error: either initialize Storybook or update `storybookview.storybookPath` setting

### Component Not Found in Storybook

1. Verify story file exists alongside component
2. Check story file matches pattern: `*.stories.tsx`
3. Ensure story has proper `title` in meta (e.g., `'Components/YourComponent'`)
4. Restart Storybook server via Command Palette

### Preview Shows Wrong Component

1. Close the preview panel
2. Reopen by clicking eye icon on correct component file
3. Panel title should update to show current component name

### Server Won't Stop

1. Check if it's an external Storybook instance (can't stop those)
2. Try manual stop via Command Palette
3. Check Task Manager/Activity Monitor for `node` processes on port 6006
4. Restart VSCode as last resort

## Technical Implementation Details

### Dual Server Detection

The extension uses two parallel detection methods for reliability:

1. **Stdout Parsing**: Looks for keywords in console output
   - "started", "Local:", "localhost:", "serving static files from"
   - Flexible patterns to support Storybook 7+

2. **HTTP Polling**: Makes actual HTTP requests every 2 seconds
   - Checks `http://localhost:6006/` for 200 response
   - More reliable than stdout parsing
   - Fallback if console output doesn't match patterns

Whichever method succeeds first resolves the startup promise.

### Windows Process Tree Cleanup

On Windows, uses `taskkill /pid /f /t` to kill entire process tree, not just parent process. This ensures all child processes (Vite, esbuild, etc.) are terminated.

### Webview Security

- Webview uses iframe to Storybook (localhost:6006)
- No custom CSP needed (just iframe to local server)
- No eval or unsafe-inline required
- All security handled by Storybook itself

## Publishing Checklist

Before publishing to VSCode Marketplace:

1. Update `publisher` in package.json with your publisher ID
2. Update repository URLs (replace `yourusername`)
3. Add an icon: 128x128 PNG as `icon.png` in root
4. Create screenshot/demo GIF for README
5. Test thoroughly in Extension Development Host
6. Run `npm run package` to create .vsix
7. Test .vsix installation: `code --install-extension storybook-view-1.0.0.vsix`
8. Use `vsce publish` to publish (requires Personal Access Token)

## Version 1.0.0 Features

This is the initial stable release with:

✅ Full Storybook integration
✅ Auto-start/stop server management
✅ Intelligent server detection
✅ Webview with loading states
✅ Inactivity timer
✅ File watching and HMR
✅ Windows/Mac/Linux support
✅ Proper error handling
✅ Clean deactivation
✅ Test app with example components

Future enhancements tracked in CHANGELOG.md.
