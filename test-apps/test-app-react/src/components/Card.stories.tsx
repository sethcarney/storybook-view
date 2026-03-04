import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

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
      options: ['default', 'outlined', 'elevated'],
      description: 'The card variant',
    },
    showFooter: {
      control: 'boolean',
      description: 'Whether to show the footer',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Card Title',
    description: 'This is a description of the card content.',
    children: 'Card content goes here.',
    variant: 'default',
    showFooter: true,
  },
};

export const Outlined: Story = {
  args: {
    title: 'Outlined Card',
    description: 'A card with a thicker border.',
    variant: 'outlined',
    showFooter: true,
  },
};

export const Elevated: Story = {
  args: {
    title: 'Elevated Card',
    description: 'A card with a shadow effect.',
    variant: 'elevated',
    showFooter: true,
  },
};

export const NoFooter: Story = {
  args: {
    title: 'Card Without Footer',
    description: 'This card has no footer section.',
    children: 'Some content here.',
    showFooter: false,
  },
};

export const WithCustomFooter: Story = {
  args: {
    title: 'Custom Footer Card',
    description: 'This card has a custom footer.',
    footerContent: (
      <div style={{ textAlign: 'center', padding: '8px' }}>
        <button style={{ marginRight: '8px' }}>Cancel</button>
        <button style={{ fontWeight: 'bold' }}>Save</button>
      </div>
    ),
  },
};

export const LongContent: Story = {
  args: {
    title: 'Card with Long Content',
    description: 'A card that contains more content.',
    children: (
      <div>
        <p>This is a longer piece of content that demonstrates how the card handles more text.</p>
        <p>It can include multiple paragraphs and elements.</p>
        <ul>
          <li>List item 1</li>
          <li>List item 2</li>
          <li>List item 3</li>
        </ul>
      </div>
    ),
  },
};
