# Changelog

All notable changes to the "Storybook View" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-11-18

### Added

- Port configuration (`storybookview.port`) now properly implemented and functional

### Changed

- Simplified error handling - checks only for `.storybook` directory
- Error messages now direct users to Output Channel for detailed logs
- Removed unused `storybookview.autoRefresh` setting

### Fixed

- Port configuration is now read correctly before webview initialization
- Webview polling uses configured port instead of hardcoded 6006

### Removed

- Dead code: unused `getComponentUrl()` method

## [1.0.5] - 2025-11-18

- Update path to icon for webviewPanel

## [1.0.4] - 2025-11-14

### Changed

- Fixed README images now served via GitHub
- Made all documentation more concise and readable

## [1.0.3] - 2025-11-14

### Added

- `storybookview.storybookPath` setting for custom Storybook directory paths

## [1.0.2] - 2025-11-14

### Fixed

- Build scripts

## [1.0.1] - 2025-11-14

### Fixed

- Removed outdated reference to test file

## [1.0.0] - 2025-11-01

### Added

- One-click Storybook component preview from editor toolbar
- Auto-start/stop Storybook server with configurable inactivity timer
- Commands: Start Server, Stop Server, Open in Browser
- Configuration options: `storybookview.storybookPath`, `storybookview.port`, `storybookview.inactivityTimeout`
- Hot Module Replacement (HMR) support
- Loading states and error handling
- Dual server detection (stdout parsing + HTTP polling)

### Platform Support

- Windows, macOS, Linux
- VSCode 1.74.0+, Node.js 16+, Storybook 7+

### Limitations

- React components only (`.jsx`, `.tsx`)
- Requires pre-installed Storybook in project
