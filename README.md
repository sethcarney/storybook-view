# ReactView

A Visual Studio Code extension that integrates Storybook directly into your IDE. Preview your React components with all Storybook features without leaving your editor.

## Features

- 📚 **Storybook Integration**: Full Storybook experience within VSCode
- 👁️ **One-Click Preview**: Click the eye icon to view any component's stories
- 🎨 **Interactive Controls**: Use Storybook's powerful prop controls and addons
- 🔄 **Hot Module Replacement**: Instant updates when you edit components
- ⚡ **Smart Lifecycle**: Auto-starts Storybook when needed, stops after inactivity
- 📖 **Auto Documentation**: Generates docs from TypeScript types
- ♿ **Accessibility**: Built-in a11y testing with Storybook addons
- 🎯 **Multiple Variations**: See all story variants in one view

## Requirements

**Storybook must be installed in your project.**

This extension wraps your existing Storybook setup. If you don't have Storybook installed:

```bash
npx storybook@latest init
```

## Installation

### From Marketplace (Coming Soon)

1. Open Visual Studio Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "ReactView"
4. Click Install

### Manual Installation (Development)

1. Clone this repository
2. Run `npm run setup` to install dependencies
3. Press F5 to launch the extension in Extension Development Host

## Usage

### Basic Usage

1. Open a React component file (`.jsx` or `.tsx`)
2. Click the eye icon (👁️) in the editor toolbar
3. Storybook preview opens showing all your component's stories
4. Interact with props using Storybook's controls panel

### Creating Stories

Create a `.stories.tsx` file alongside your component:

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Click me',
  },
};
```

### Available Commands

Access via Command Palette (Ctrl+Shift+P):

- **ReactView: Start Storybook Server** - Manually start Storybook
- **ReactView: Stop Storybook Server** - Stop the Storybook server
- **ReactView: Open Storybook in Browser** - Open full Storybook in external browser

### Configuration

Configure in VS Code settings (File > Preferences > Settings):

```json
{
  "reactview.port": 6006,
  "reactview.autoRefresh": true
}
```

- `reactview.port`: Storybook server port (default: 6006)
- `reactview.autoRefresh`: Auto-refresh preview on file changes (default: true)

## How It Works

### Lifecycle Management

1. **Auto-Start**: Storybook starts automatically when you preview a component (takes ~30-60 seconds first time)
2. **Stays Running**: Remains active for quick switching between components
3. **Auto-Stop**: Stops after 5 minutes of inactivity to save resources
4. **Timer Reset**: Activity resets timer (opening previews, editing files)

### What You Get

- **All Storybook Features**: Controls, actions, docs, a11y testing, and all addons
- **Professional Development**: Industry-standard tool used by major companies
- **Comprehensive Testing**: Test components with different prop combinations
- **Auto-Generated Docs**: Documentation from TypeScript interfaces
- **Collaborative**: Share Storybook URL with team members

## Example Component

```typescript
// Button.tsx
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
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

Storybook automatically generates:
- Dropdown controls for `variant` and `size`
- Checkbox for `disabled`
- Text input for `children`
- Action logger for `onClick`
- Full TypeScript documentation

## Troubleshooting

### Storybook Won't Start

1. Ensure Storybook is installed in your project
   ```bash
   npm install --save-dev @storybook/react-vite storybook
   ```
2. Verify Storybook works standalone:
   ```bash
   npm run storybook
   ```
3. Check that port 6006 is available

### Component Not Showing

1. Ensure you have a `.stories.tsx` file for your component
2. Verify the story file is in a location Storybook scans
3. Check Storybook configuration in `.storybook/main.ts`
4. Restart Storybook using Command Palette

### Preview Shows Wrong Content

1. Close the preview panel
2. Click the eye icon again on the correct component
3. Panel title should show the component name

## Benefits Over Custom Previews

✅ **Mature Ecosystem**: Leverage years of Storybook development
✅ **Rich Addons**: A11y, viewport testing, design integration, and more
✅ **Industry Standard**: Used by React, Material-UI, Ant Design, and thousands of teams
✅ **Better Controls**: Auto-generated, type-safe prop controls
✅ **Documentation**: Auto-docs from your TypeScript types
✅ **Testing**: Built-in interaction testing and visual regression
✅ **Collaboration**: Share preview URLs with designers and stakeholders

## Development

### Building from Source

```bash
git clone https://github.com/yourusername/reactview.git
cd reactview
npm run setup
npm run compile
```

### Testing the Extension

```bash
npm run dev  # Start compilation + test app
# Press F5 in VSCode to launch Extension Development Host
```

### Package for Distribution

```bash
npm run package
npm run install-extension
```

## License

MIT

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

## Credits

Built with:
- [Storybook](https://storybook.js.org/) - Component development environment
- [Vite](https://vitejs.dev/) - Build tool
- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
