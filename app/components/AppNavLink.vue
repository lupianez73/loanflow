<script setup lang="ts">
const props = defineProps<{ href: string; icon: string; label: string }>()
const route    = useRoute()
const isActive = computed(() => route.path === props.href || route.path.startsWith(props.href + '/'))
</script>

<template>
  <NuxtLink
    :to="href"
    :class="['flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
             isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800']"
  >
    <span class="text-base shrink-0">{{ icon }}</span>
    <span v-if="label" class="truncate">{{ label }}</span>
  </NuxtLink>
</template>
