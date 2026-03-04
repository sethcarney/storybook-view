import type { Meta, StoryObj } from '@storybook/svelte'
import Button from './Button.svelte'

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
      description: 'The button variant',
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
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'medium',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'medium',
  },
}

export const Danger: Story = {
  args: {
    variant: 'danger',
    size: 'medium',
  },
}

export const Small: Story = {
  args: {
    size: 'small',
  },
}

export const Large: Story = {
  args: {
    size: 'large',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}
