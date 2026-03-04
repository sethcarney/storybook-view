<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'danger' = 'primary'
  export let size: 'small' | 'medium' | 'large' = 'medium'
  export let disabled: boolean = false

  const variantMap = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  }

  const sizeMap = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  }

  $: classes = [
    'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
    variantMap[variant],
    sizeMap[size],
    disabled ? 'opacity-50 cursor-not-allowed' : '',
  ].filter(Boolean).join(' ')
</script>

<button {disabled} type="button" class={classes} on:click>
  <slot />
</button>
