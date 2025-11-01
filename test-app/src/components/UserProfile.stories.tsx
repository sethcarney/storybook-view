import type { Meta, StoryObj } from "@storybook/react";
import { UserProfile } from "./UserProfile";

const meta = {
  title: "Components/UserProfile",
  component: UserProfile,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["small", "medium", "large"],
      description: "The profile size"
    },
    isOnline: {
      control: "boolean",
      description: "Whether the user is online"
    },
    showBadge: {
      control: "boolean",
      description: "Whether to show a notification badge"
    },
    onClick: { action: "clicked" }
  }
} satisfies Meta<typeof UserProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "John Doe",
    email: "john.doe@example.com",
    size: "medium"
  }
};

export const WithAvatar: Story = {
  args: {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    avatar: "https://i.pravatar.cc/150?img=5",
    size: "medium"
  }
};

export const Online: Story = {
  args: {
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    isOnline: true,
    size: "medium"
  }
};

export const WithBadge: Story = {
  args: {
    name: "Alice Williams",
    email: "alice.williams@example.com",
    showBadge: true,
    size: "medium"
  }
};

export const WithRole: Story = {
  args: {
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    role: "Senior Developer",
    size: "medium"
  }
};

export const OnlineWithBadge: Story = {
  args: {
    name: "Diana Prince",
    email: "diana.prince@example.com",
    avatar: "https://i.pravatar.cc/150?img=1",
    role: "Team Lead",
    isOnline: true,
    showBadge: true,
    size: "medium"
  }
};

export const Small: Story = {
  args: {
    name: "Sam Wilson",
    email: "sam.wilson@example.com",
    role: "Designer",
    isOnline: true,
    size: "small"
  }
};

export const Large: Story = {
  args: {
    name: "Maria Garcia",
    email: "maria.garcia@example.com",
    avatar: "https://i.pravatar.cc/150?img=9",
    role: "Product Manager",
    isOnline: true,
    size: "large"
  }
};

export const Clickable: Story = {
  args: {
    name: "Tom Hardy",
    email: "tom.hardy@example.com",
    role: "Engineer",
    onClick: () => alert("Profile clicked!"),
    size: "medium"
  }
};
