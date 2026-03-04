import type { Meta, StoryObj } from '@storybook/svelte'
import Card from './Card.svelte'

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outlined'],
      description: 'The card variant',
    },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Card Title',
    description: 'This is a card description that provides context about the content.',
    variant: 'default',
  },
}

export const Elevated: Story = {
  args: {
    title: 'Elevated Card',
    description: 'This card has a stronger shadow for more visual depth.',
    variant: 'elevated',
  },
}

export const Outlined: Story = {
  args: {
    title: 'Outlined Card',
    description: 'This card uses a border instead of a shadow.',
    variant: 'outlined',
  },
}

export const WithImage: Story = {
  args: {
    title: 'Card with Image',
    description: 'This card includes an image at the top.',
    image: 'https://picsum.photos/400/200',
    variant: 'default',
  },
}
