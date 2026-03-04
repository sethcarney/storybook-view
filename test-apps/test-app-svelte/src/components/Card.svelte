<script lang="ts">
  export let title: string
  export let description: string
  export let image: string | undefined = undefined
  export let variant: 'default' | 'elevated' | 'outlined' = 'default'

  const variantMap = {
    default: 'bg-white shadow-md',
    elevated: 'bg-white shadow-xl',
    outlined: 'bg-white border-2 border-gray-200',
  }

  $: classes = `rounded-lg p-6 max-w-sm ${variantMap[variant]}`
</script>

<div class={classes}>
  {#if image}
    <div class="mb-4">
      <img src={image} alt={title} class="w-full h-48 object-cover rounded-md" />
    </div>
  {/if}
  <h3 class="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
  <p class="text-gray-600 text-sm mb-4">{description}</p>
  <slot />
</div>
