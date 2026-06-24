<script setup lang="ts">
// Root page — redirect authenticated users to dashboard, others to login
definePageMeta({ middleware: [] })

const authStore = useAuthStore()
if (!authStore.user) await authStore.fetchMe().catch(() => {})
await navigateTo(authStore.isAuthenticated ? '/dashboard' : '/login', { replace: true })
</script>
<template><div /></template>
