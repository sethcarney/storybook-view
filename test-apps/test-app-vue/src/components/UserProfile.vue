<template>
  <div class="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
    <div class="relative">
      <img
        v-if="avatarUrl"
        :src="avatarUrl"
        :alt="name"
        :class="avatarClasses"
      />
      <div v-else :class="[avatarClasses, 'bg-blue-500 flex items-center justify-center text-white font-bold']">
        {{ initials }}
      </div>
      <span
        v-if="showStatus"
        :class="['absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white', statusColor]"
      />
    </div>
    <div>
      <p class="font-semibold text-gray-900">{{ name }}</p>
      <p class="text-sm text-gray-500">{{ role }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  role: string
  avatarUrl?: string
  size?: 'small' | 'medium' | 'large'
  status?: 'online' | 'offline' | 'busy'
  showStatus?: boolean
}>(), {
  size: 'medium',
  showStatus: false,
})

const initials = computed(() =>
  props.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
)

const sizeMap = { small: 'w-8 h-8 text-xs', medium: 'w-12 h-12 text-sm', large: 'w-16 h-16 text-base' }
const avatarClasses = computed(() => `rounded-full object-cover ${sizeMap[props.size]}`)

const statusColorMap = { online: 'bg-green-500', offline: 'bg-gray-400', busy: 'bg-yellow-500' }
const statusColor = computed(() => props.status ? statusColorMap[props.status] : '')
</script>
