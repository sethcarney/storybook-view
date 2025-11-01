# Changelog

All notable changes to the "Storybook View" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-01

### 🎉 Initial Release

The first stable release of Storybook View for VSCode!

### Features

- **Storybook Integration**: Full integration with your existing Storybook setup
  - One-click component preview from editor toolbar
  - Access all Storybook features, controls, and addons
  - View component docs page with all story variations

- **Intelligent Server Management**:
  - Auto-starts Storybook server when previewing first component (10-20 seconds)
  - Stays running for fast subsequent previews
  - Auto-stops after 5 minutes of inactivity to save resources
  - Inactivity timer resets on component preview or file edits

- **Smart Detection**:
  - Multiple detection methods for reliable server startup (stdout parsing + HTTP polling)
  - Handles Windows process tree cleanup properly
  - Clear error messages with troubleshooting steps

- **Commands**:
  - `Storybook View: Start Storybook Server` - Manually start Storybook
  - `Storybook View: Stop Storybook Server` - Stop the server
  - `Storybook View: Open Storybook in Browser` - Open full Storybook in external browser

- **Configuration**:
  - `storybookview.port` - Configure Storybook server port (default: 6006)
  - `storybookview.autoRefresh` - Enable/disable auto-refresh on file changes

### Developer Experience

- Hot Module Replacement (HMR) for instant component updates
- Webview shows loading spinner while Storybook starts
- 30-second timeout for webview with helpful error messages
- Proper cleanup on VSCode close
- Detailed console logging for debugging

### Technical Details

- **Architecture**: Manages Storybook dev server as a child process
- **Platform Support**: Windows, macOS, Linux
- **Requirements**: VSCode 1.74.0+, Node.js 16+, Storybook 7+
- **Language Support**: JavaScript, TypeScript, JSX, TSX

### Known Limitations

- Only supports React components (`.jsx` and `.tsx` files)
- Requires Storybook to be pre-installed in the project
- First startup takes time while Storybook compiles

---

## Future Enhancements

Planned for future releases:

- [ ] Support for Vue, Angular, Svelte, and other frameworks
- [ ] Custom port configuration per workspace
- [ ] Multiple Storybook instances for monorepos
- [ ] Keyboard shortcuts for common actions
- [ ] Story creation snippets and templates
- [ ] Performance metrics and diagnostics
- [ ] Offline mode with cached stories

---

**Note**: Replace `yourusername` in package.json with your actual GitHub username/organization before publishing.
