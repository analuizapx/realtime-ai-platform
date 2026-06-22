// Runs once on app startup (client only): captures the token that the OAuth
// callback put in the URL hash, before any page tries to fetch the user.
export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  auth.captureTokenFromUrl()
})
