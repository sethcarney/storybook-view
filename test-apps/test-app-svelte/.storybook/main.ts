import type { StorybookConfig } from '@storybook/svelte-vite'

const config: StorybookConfig = {
  stories: [
    '../src/components/**/*.stories.@(js|ts)',
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/svelte-vite',
    options: {},
  },
}

export default config
