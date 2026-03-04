<script lang="ts">
  export let name: string
  export let role: string
  export let avatarUrl: string | undefined = undefined
  export let size: 'small' | 'medium' | 'large' = 'medium'
  export let status: 'online' | 'offline' | 'busy' | undefined = undefined
  export let showStatus: boolean = false

  const sizeMap = { small: 'w-8 h-8 text-xs', medium: 'w-12 h-12 text-sm', large: 'w-16 h-16 text-base' }
  const statusColorMap = { online: 'bg-green-500', offline: 'bg-gray-400', busy: 'bg-yellow-500' }

  $: initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  $: avatarClasses = `rounded-full object-cover ${sizeMap[size]}`
  $: statusColor = status ? statusColorMap[status] : ''
</script>

<div class="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
  <div class="relative">
    {#if avatarUrl}
      <img src={avatarUrl} alt={name} class={avatarClasses} />
    {:else}
      <div class="{avatarClasses} bg-blue-500 flex items-center justify-center text-white font-bold">
        {initials}
      </div>
    {/if}
    {#if showStatus && status}
      <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white {statusColor}" />
    {/if}
  </div>
  <div>
    <p class="font-semibold text-gray-900">{name}</p>
    <p class="text-sm text-gray-500">{role}</p>
  </div>
</div>
