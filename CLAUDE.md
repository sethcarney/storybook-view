# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Storybook View is a Visual Studio Code extension that provides Storybook integration for React components. The extension allows developers to preview their React components with all Storybook features directly within VSCode.

The extension consists of:

1. **VSCode Extension** (`src/`) - TypeScript extension code that manages Storybook server lifecycle
2. **Test React App** (`test-app/`) - Vite + React + Tailwind + Storybook test application

## Architecture

### Extension Flow

1. User clicks the eye icon on a `.jsx` or `.tsx` component file
2. Extension starts Storybook server (if not already running) on port 6006
3. Opens a webview panel showing the component's Storybook documentation page
4. Storybook's HMR automatically updates the preview when files change
5. Inactivity timer (5 minutes) automatically stops Storybook to save resources

### Key Components

- **extension.ts** - Main entry point, registers commands and manages lifecycle
- **storybookServer.ts** - Manages Storybook dev server process with auto-start/stop
- **webviewPanel.ts** - Creates and manages the Storybook preview webview

## Development Commands

### Initial Setup

```bash
npm run setup           # Install extension and test-app dependencies
```

### Extension Development

```bash
npm run dev            # Start extension compilation + Storybook dev server
npm run watch          # TypeScript compilation in watch mode
npm run compile        # Compile extension TypeScript
npm run lint          # Run ESLint on extension code
```

### Testing the Extension

1. Run `npm run setup` to install all dependencies
2. Press `F5` in VSCode to launch Extension Development Host
3. Open component files from `test-app/src/components/`
4. Click eye icon in editor toolbar to preview
5. Storybook opens showing all story variations

### Test App & Storybook

```bash
cd test-app
npm run dev           # Start Vite dev server (for regular development)
npm run storybook     # Start Storybook standalone (localhost:6006)
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

## VSCode Commands

The extension provides these commands (accessible via Command Palette):

- **Storybook View: Start Storybook Server** - Manually start Storybook
- **Storybook View: Stop Storybook Server** - Manually stop Storybook
- **Storybook View: Open Storybook in Browser** - Open full Storybook in external browser

## Configuration Settings

Available in VSCode settings:

- `storybookview.port`: Storybook server port (default: 6006)
- `storybookview.autoRefresh`: Auto-refresh on file changes (default: true)

## Development Notes

### Server Lifecycle Management

- Storybook auto-starts when user previews a component
- Stays running for multiple component previews (no restart needed)
- Auto-stops after 5 minutes of inactivity to save resources
- Inactivity timer resets when user:
  - Opens a new component preview
  - Edits a watched component file

### Preview Navigation

- Extension navigates to Storybook's **docs page** for each component
- Docs page shows all story variations in a single view
- URL format: `http://localhost:6006/?path=/docs/components-{componentname}--docs`

### Hot Module Replacement

- Storybook's built-in HMR handles all live updates
- Extension doesn't need to manage reload logic
- File watcher only resets inactivity timer

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
- Check `Output > Storybook View` panel for runtime information

## Dependencies

### Extension Dependencies

- `vscode` - VSCode Extension API
- `child_process` - For spawning Storybook server process

### Test App Dependencies

- **React 18** - UI library
- **Vite 5** - Build tool and dev server
- **Storybook 10** - Component development environment
- **Tailwind CSS 3** - Styling
- **TypeScript 5** - Type safety

## Project Structure

```
storybook-view/
├── src/                        # Extension source code
│   ├── extension.ts           # Main entry point
│   ├── storybookServer.ts     # Storybook server manager
│   └── webviewPanel.ts        # Webview UI manager
├── test-app/                   # Test React application
│   ├── .storybook/            # Storybook configuration
│   │   ├── main.ts            # Stories config
│   │   └── preview.ts         # Global settings
│   └── src/
│       └── components/        # Components and their stories
│           ├── Button.tsx
│           ├── Button.stories.tsx
│           ├── Card.tsx
│           ├── Card.stories.tsx
│           └── ...
├── package.json               # Extension dependencies
└── CLAUDE.md                  # This file
```

## Troubleshooting

### Storybook Won't Start

1. Check `test-app` dependencies are installed: `cd test-app && npm install`
2. Verify Storybook works standalone: `cd test-app && npm run storybook`
3. Check port 6006 isn't already in use

### Component Not Found in Storybook

1. Verify story file exists alongside component
2. Check story file matches pattern: `*.stories.tsx`
3. Ensure story has proper `title` in meta (e.g., `'Components/YourComponent'`)
4. Restart Storybook server via Command Palette

### Preview Shows Wrong Component

1. Close the preview panel
2. Reopen by clicking eye icon on correct component file
3. Panel title should update to show current component name
