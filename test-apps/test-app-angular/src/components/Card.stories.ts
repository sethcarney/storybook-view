import type { Meta, StoryObj } from '@storybook/angular';
import { CardComponent } from './Card';

const meta: Meta<CardComponent> = {
  title: 'Components/Card',
  component: CardComponent,
  tags: ['autodocs'],
  argTypes: {
    title:       { control: 'text',    description: 'Card heading' },
    description: { control: 'text',    description: 'Card body text' },
    imageUrl:    { control: 'text',    description: 'URL for the cover image' },
    badge:       { control: 'text',    description: 'Optional badge label' },
    elevated:    { control: 'boolean', description: 'Drop shadow' },
  },
};

export default meta;
type Story = StoryObj<CardComponent>;

export const Default: Story = {
  args: {
    title: 'Angular Component',
    description: 'A simple card built with a standalone Angular component and Storybook.',
  },
};

export const WithBadge: Story = {
  args: {
    title: 'Featured',
    description: 'This card has a badge label displayed below the description.',
    badge: 'New',
  },
};

export const Elevated: Story = {
  args: {
    title: 'Elevated Card',
    description: 'Uses a drop shadow to lift the card off the page.',
    elevated: true,
  },
};

export const WithImage: Story = {
  args: {
    title: 'Photo Card',
    description: 'A card with a cover image at the top.',
    imageUrl: 'https://picsum.photos/seed/angular/560/320',
    elevated: true,
  },
};
