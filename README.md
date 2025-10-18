# ReactView

A Visual Studio Code extension that allows developers to view their React components live within the IDE. Preview your components with different prop variations without leaving your editor.

## Features

- 🔍 **Live Component Preview**: View React components directly in your browser with real-time updates
- 🎛️ **Interactive Prop Controls**: Adjust component props through an intuitive interface
- 🎨 **Preset Variations**: Quickly test common prop combinations with one-click presets
- 🔄 **Auto Refresh**: Automatically updates preview when files change
- 📱 **Responsive Design**: Preview components at different screen sizes
- 🏗️ **TypeScript Support**: Full support for TypeScript React components

## Installation

### From Marketplace (Coming Soon)

1. Open Visual Studio Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "ReactView"
4. Click Install

### Manual Installation (Development)

1. Clone this repository
2. Run `npm run setup` to install dependencies and set up the development environment
3. Press F5 to launch the extension in a new Extension Development Host window

## Usage

### Basic Usage

1. Open a React component file (`.jsx` or `.tsx`)
2. Click the eye icon (👁️) in the editor toolbar, or
3. Right-click in the editor and select "Preview React Component"
4. Your component will open in a new browser tab with an interactive preview

### Component Requirements

For best results, your React components should:

- Be the default export of the file
- Have TypeScript interfaces or PropTypes defined
- Use standard React patterns

### Prop Controls

The preview interface automatically generates controls for your component props:

- **Text inputs** for string props
- **Checkboxes** for boolean props
- **Number inputs** for numeric props
- **Dropdowns** for union types (e.g., `'primary' | 'secondary'`)

### Preset Variations

Click preset buttons to quickly test common prop combinations:

- **Variants**: primary, secondary, danger, etc.
- **Sizes**: small, medium, large
- **States**: disabled, loading, online/offline

### Configuration

Configure ReactView in VS Code settings:

- `reactview.port`: Preview server port (default: 3001)
- `reactview.autoRefresh`: Auto-refresh on file changes (default: true)

## Example Component

```tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  onClick
}) => {
  // Component implementation
};
```

This component will automatically generate:

- Preset buttons for each variant
- Preset buttons for each size
- A checkbox for the disabled state
- A text input for the children prop
