import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './Button';

const meta: Meta<ButtonComponent> = {
  title: 'Components/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
      description: 'The button style variant',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'The button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    clicked: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
  args: { label: 'Primary Button', variant: 'primary', size: 'medium' },
};

export const Secondary: Story = {
  args: { label: 'Secondary Button', variant: 'secondary', size: 'medium' },
};

export const Danger: Story = {
  args: { label: 'Delete', variant: 'danger', size: 'medium' },
};

export const Small: Story = {
  args: { label: 'Small Button', size: 'small' },
};

export const Large: Story = {
  args: { label: 'Large Button', size: 'large' },
};

export const Disabled: Story = {
  args: { label: 'Disabled Button', disabled: true },
};
