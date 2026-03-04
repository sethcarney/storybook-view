import type { Meta, StoryObj } from '@storybook/vue3'
import UserProfile from './UserProfile.vue'

const meta = {
  title: 'Components/UserProfile',
  component: UserProfile,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    status: {
      control: 'select',
      options: ['online', 'offline', 'busy'],
    },
  },
} satisfies Meta<typeof UserProfile>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'Jane Doe',
    role: 'Software Engineer',
    size: 'medium',
  },
}

export const WithAvatar: Story = {
  args: {
    name: 'John Smith',
    role: 'Product Designer',
    avatarUrl: 'https://picsum.photos/seed/user1/200',
    size: 'medium',
  },
}

export const Online: Story = {
  args: {
    name: 'Alice Johnson',
    role: 'Team Lead',
    status: 'online',
    showStatus: true,
    size: 'medium',
  },
}

export const Large: Story = {
  args: {
    name: 'Bob Williams',
    role: 'CTO',
    size: 'large',
    status: 'busy',
    showStatus: true,
  },
}
