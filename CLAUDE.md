# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ReactView is a Visual Studio Code extension that provides live preview capabilities for React components within the IDE. The extension consists of:

1. **VSCode Extension** (`src/`) - TypeScript extension code
2. **Test React App** (`test-app/`) - Vite + React + Tailwind test application
3. **Development Scripts** (`scripts/`) - Setup and development automation

## Development Commands

### Initial Setup

```bash
npm run setup           # Install all dependencies and configure VSCode
```

### Development

```bash
npm run dev            # Start extension compilation + test app dev server
npm run watch          # TypeScript compilation in watch mode
npm run test-app       # Start test app only (localhost:3000)
```

### Building and Testing

```bash
npm run compile        # Compile extension TypeScript
npm run lint          # Run ESLint on extension code
npm run package       # Create .vsix package for distribution
npm run install-extension  # Install packaged extension locally
```

### Testing the Extension

1. Run `npm run dev` to start development environment
2. Press `F5` in VSCode to launch Extension Development Host
3. Open component files from `test-app/src/components/`
4. Click eye icon in editor toolbar to preview
5. Preview opens at http://localhost:3001

## Code Architecture

### Extension Structure (`src/`)

- `extension.ts` - Main extension entry point, command registration
- `previewServer.ts` - Express server with WebSocket for live preview
- `componentParser.ts` - Analyzes React components to extract prop information

### Preview Flow

1. User clicks preview button on `.jsx/.tsx` file
2. Extension starts Express server (port 3001)
3. Component parser extracts prop types from TypeScript interfaces/PropTypes
4. Browser opens with interactive preview UI
5. WebSocket enables live updates on file changes

### Test App Structure (`test-app/`)

Standard Vite React app with:

- Three example components with various prop patterns
- Tailwind CSS for styling
- TypeScript interfaces demonstrating parser capabilities

## Component Parser Capabilities

Extracts prop information from:

- TypeScript interfaces (preferred method)
- PropTypes definitions
- Function parameter destructuring patterns

Generates appropriate UI controls:

- Text inputs for strings
- Checkboxes for booleans
- Number inputs for numbers
- Select dropdowns for union types
- Preset buttons for common prop combinations

## Development Notes

- Extension activates on JavaScript/TypeScript file types
- Preview server runs on configurable port (default 3001)
- Auto-refresh enabled by default when files change
- VSCode launch configuration created by setup script
- Test components demonstrate various prop patterns for parser testing

## Common Development Tasks

- **Adding new test components**: Create in `test-app/src/components/`
- **Extending parser**: Modify `componentParser.ts`
- **UI improvements**: Update HTML template in `previewServer.ts`
- **New extension commands**: Register in `package.json` and `extension.ts`
