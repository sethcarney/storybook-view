# ReactView Architecture Migration

## What Changed

The extension has been completely redesigned to fix memory leaks and rendering issues:

### Before (❌ Problems)

- Used `eval()` and `new Function()` to execute component code
- Required `'unsafe-eval'` in CSP
- Infinite reload loops
- High memory usage
- Couldn't render Tailwind or complex components properly

### After (✅ Solution)

- Uses Vite dev server with proper bundling
- Iframes the Vite server in webview
- Vite HMR (Hot Module Replacement) for live updates
- No eval, no CSP issues
- Proper Tailwind support
- Low memory footprint

## Migration Steps

### 1. Replace webviewPanel.ts

```bash
# Delete the old file
del src\webviewPanel.ts

# Rename the new one
move src\webviewPanel.new.ts src\webviewPanel.ts
```

### 2. Install preview-runtime dependencies

```bash
cd preview-runtime
npm install
cd ..
```

### 3. Update package.json scripts

Add this to the `scripts` section:

```json
"preview-runtime:install": "cd preview-runtime && npm install",
"preview-runtime:dev": "cd preview-runtime && npm run dev"
```

### 4. Clean up temporary files

```bash
del src\webviewPanel.old.ts
del src\webviewPanel.new.ts
del MIGRATION_STEPS.md
```

### 5. Compile and test

```bash
npm run compile
```

Press F5 to test the extension.

## How It Works Now

1. **User clicks preview button** → Extension starts Vite dev server (port 3001)
2. **Extension copies component** → User's component is copied to `preview-runtime/src/UserComponent.tsx`
3. **Vite bundles component** → Vite compiles the component with all dependencies (including Tailwind)
4. **Webview iframes Vite** → VSCode webview shows an iframe pointing to `http://localhost:3001`
5. **HMR for updates** → When file changes, Vite HMR updates the component instantly

## File Structure

```
ReactView/
├── src/
│   ├── extension.ts          # Entry point
│   ├── webviewPanel.ts       # NEW: Simple iframe-based webview
│   ├── previewServer.ts      # NEW: Manages Vite dev server
│   └── componentParser.ts    # Unchanged
│
├── preview-runtime/          # NEW: Vite app for previewing
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── PreviewApp.tsx    # Preview UI with prop controls
│       └── UserComponent.tsx # Placeholder (replaced at runtime)
│
└── test-app/                 # Existing test app
```

## Benefits

✅ **No memory leaks** - Vite manages its own memory efficiently
✅ **Proper rendering** - Real bundling means Tailwind, CSS modules, etc. all work
✅ **Fast HMR** - Changes reflect instantly via Vite's HMR
✅ **No CSP issues** - No eval means no security concerns
✅ **Simple code** - Webview is just an iframe, < 230 lines
✅ **Industry standard** - Uses Vite like modern React dev tools

## Troubleshooting

**Preview not loading?**

- Check if `preview-runtime/node_modules` exists
- Run: `cd preview-runtime && npm install`

**Port 3001 already in use?**

- Change the port in VSCode settings: `reactview.port`

**Component not rendering?**

- Check the component has a default export or named export
- Open browser console in the webview for errors
