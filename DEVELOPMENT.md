# ReactView Development Guide

This guide is for developers working on the ReactView extension itself.

## Project Structure

```
ReactView/
├── src/                     # Extension source code
│   ├── extension.ts         # Main extension entry point
│   ├── previewServer.ts     # Express server for component preview
│   └── componentParser.ts   # Parser for extracting component info
├── test-app/               # Test React application
│   ├── src/
│   │   ├── components/     # Test components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── UserProfile.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── scripts/                # Development scripts
│   ├── setup.js           # Initial setup
│   └── dev.js            # Development mode launcher
├── package.json           # Extension manifest
├── tsconfig.json         # TypeScript configuration
└── README.md            # User documentation
```

## Getting Started

### Prerequisites

- Node.js 16 or higher
- Visual Studio Code
- Git

### Setup

1. Clone the repository
2. Run the setup script:
   ```bash
   npm run setup
   ```
   This will:
   - Install extension dependencies
   - Install test app dependencies
   - Compile the extension
   - Create VSCode launch configuration

### Development Workflow

#### Start Development Environment

```bash
npm run dev
```

This launches:

- TypeScript compiler in watch mode for the extension
- Vite dev server for the test app (http://localhost:3000)

#### Test the Extension

1. Press `F5` in VSCode to launch Extension Development Host
2. Open a React component file (try files in `test-app/src/components/`)
3. Click the eye icon in the editor toolbar
4. The preview will open at http://localhost:3001

#### Build and Package

```bash
npm run compile    # Compile TypeScript
npm run package    # Create .vsix package
```

## Architecture

### Extension Entry Point (`extension.ts`)

- Activates on JavaScript/TypeScript files
- Registers commands and event handlers
- Manages the preview server lifecycle

### Preview Server (`previewServer.ts`)

- Express.js server serving the preview interface
- WebSocket connection for live updates
- Serves static HTML with embedded React preview logic
- API endpoint for component metadata

### Component Parser (`componentParser.ts`)

- Analyzes React component files
- Extracts prop types from TypeScript interfaces or PropTypes
- Identifies component names and structure

### Preview Interface

The preview is served as a single HTML page with:

- React loaded from CDN
- Babel for runtime JSX transformation
- WebSocket connection for live updates
- Dynamic prop controls based on component analysis

## Key Features Implementation

### Prop Type Detection

The parser looks for:

1. TypeScript interfaces (preferred)
2. PropTypes definitions
3. Destructuring patterns in function parameters

### Preset Generation

Automatically creates preset variations based on:

- `variant` props → generates common variants
- `size` props → generates size options
- `boolean` props → generates state toggles

### Live Updates

- File watcher monitors component changes
- WebSocket pushes refresh messages to preview
- Auto-refresh can be configured per user

## Testing Components

The test app includes sample components demonstrating:

### Button Component

- Variants: primary, secondary, danger
- Sizes: small, medium, large
- States: disabled

### Card Component

- Title and description props
- Optional footer
- Different variants

### UserProfile Component

- Complex props with nested objects
- Optional avatar images
- Online/offline states
- Badge notifications

## Debugging

### Extension Debugging

1. Set breakpoints in TypeScript files
2. Press F5 to launch debug session
3. Use Developer Console in Extension Development Host

### Server Debugging

- Server logs appear in VSCode terminal
- Preview interface logs in browser console
- WebSocket connection status visible in Network tab

### Common Issues

- **Port conflicts**: Change `reactview.port` setting
- **Component not parsing**: Check TypeScript interface format
- **Preview not updating**: Verify WebSocket connection

## Contributing

### Code Style

- Use TypeScript strict mode
- Follow existing naming conventions
- Add JSDoc comments for public APIs

### Testing

- Test with various component patterns
- Verify prop type detection accuracy
- Test live update functionality

### Pull Requests

1. Fork the repository
2. Create feature branch
3. Test thoroughly with test app
4. Submit PR with clear description

## Deployment

### Marketplace Publishing

```bash
npm run package
vsce publish
```

### Local Installation

```bash
npm run package
npm run install-extension
```

## Future Enhancements

### Planned Features

- [ ] Component story/documentation integration
- [ ] Custom CSS injection
- [ ] Multiple component variations side-by-side
- [ ] Export component screenshots
- [ ] Integration with popular component libraries

### Technical Improvements

- [ ] Better error handling and user feedback
- [ ] Performance optimization for large components
- [ ] Cached component parsing
- [ ] Plugin system for custom parsers
