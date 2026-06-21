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

  const user = ref<User | null>(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => user.value !== null)

  // Ask the backend who the logged-in user is (reads the httpOnly cookie).
  async function fetchUser() {
    loading.value = true
    try {
      user.value = await $fetch<User>(`${apiBase}/auth/me`, {
        credentials: 'include', // send the auth cookie
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
    await $fetch(`${apiBase}/auth/logout`, { credentials: 'include' })
    user.value = null
    navigateTo('/login')
  }

  return { user, loading, isLoggedIn, fetchUser, login, logout }
})
