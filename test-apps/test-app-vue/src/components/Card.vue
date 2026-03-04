<template>
  <div :class="classes">
    <div v-if="image" class="mb-4">
      <img :src="image" :alt="title" class="w-full h-48 object-cover rounded-md" />
    </div>
    <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
    <p class="text-gray-600 text-sm mb-4">{{ description }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  description: string
  image?: string
  variant?: 'default' | 'elevated' | 'outlined'
}>(), {
  variant: 'default',
})

const classes = computed(() => {
  const base = 'rounded-lg p-6 max-w-sm'
  const variantMap = {
    default: 'bg-white shadow-md',
    elevated: 'bg-white shadow-xl',
    outlined: 'bg-white border-2 border-gray-200',
  }
  return [base, variantMap[props.variant]].join(' ')
})
</script>
