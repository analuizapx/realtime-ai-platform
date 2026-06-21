<script setup lang="ts">
// Home just routes the user to the right place based on auth state
const auth = useAuthStore()

onMounted(async () => {
  await auth.fetchUser()
  navigateTo(auth.isLoggedIn ? '/dashboard' : '/login')
})
</script>

<template>
  <div class="flex min-h-[70vh] items-center justify-center text-slate-400">
    Loading…
  </div>
</template>
