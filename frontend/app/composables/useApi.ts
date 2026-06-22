// Thin wrapper around $fetch that always points at the backend, sends the auth
// cookie, and adds the Bearer token (fallback when third-party cookies are blocked).
export function useApi() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string
  const { get } = useToken()

  function apiFetch<T>(path: string, options: Record<string, unknown> = {}) {
    const token = get()
    const { headers: optHeaders, ...rest } = options as {
      headers?: Record<string, string>
    }
    return $fetch<T>(`${apiBase}${path}`, {
      credentials: 'include',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(optHeaders ?? {}),
      },
      ...rest,
    })
  }

  return { apiBase, apiFetch }
}
