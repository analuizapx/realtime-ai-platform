import { defineStore } from 'pinia'

export interface User {
  _id: string
  name: string
  email: string
  picture: string
}

export const useAuthStore = defineStore('auth', () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string
  const { get, set, clear } = useToken()

  const user = ref<User | null>(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => user.value !== null)

  // Build auth headers from the stored token (when present)
  function authHeaders(): Record<string, string> {
    const token = get()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Ask the backend who the logged-in user is (cookie or Bearer token)
  async function fetchUser() {
    loading.value = true
    try {
      user.value = await $fetch<User>(`${apiBase}/auth/me`, {
        credentials: 'include',
        headers: authHeaders(),
      })
    } catch {
      // 401 -> not logged in
      user.value = null
    } finally {
      loading.value = false
    }
  }

  // Redirect to the backend, which starts the Google OAuth flow
  function login() {
    window.location.href = `${apiBase}/auth/google`
  }

  async function logout() {
    try {
      await $fetch(`${apiBase}/auth/logout`, {
        credentials: 'include',
        headers: authHeaders(),
      })
    } catch {
      // ignore network errors on logout
    }
    clear()
    user.value = null
    navigateTo('/login')
  }

  // After the OAuth callback the backend redirects with #token=... — capture it
  function captureTokenFromUrl() {
    if (!import.meta.client) return
    const match = window.location.hash.match(/token=([^&]+)/)
    if (match) {
      set(decodeURIComponent(match[1]))
      // Remove the token from the visible URL
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }

  return { user, loading, isLoggedIn, fetchUser, login, logout, captureTokenFromUrl }
})
