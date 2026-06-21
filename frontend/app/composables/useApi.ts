// Thin wrapper around $fetch that always points at the backend
// and sends the auth cookie. Reused by every page that calls the API.
export function useApi() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string

  function apiFetch<T>(path: string, options: Record<string, unknown> = {}) {
    return $fetch<T>(`${apiBase}${path}`, {
      credentials: 'include',
      ...options,
    })
  }

  return { apiBase, apiFetch }
}
