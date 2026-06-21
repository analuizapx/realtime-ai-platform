// Route middleware: blocks access to protected pages when not logged in.
export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()

  // Ensure we have the latest auth state before deciding
  if (!auth.user) await auth.fetchUser()

  if (!auth.isLoggedIn) {
    return navigateTo('/login')
  }
})
