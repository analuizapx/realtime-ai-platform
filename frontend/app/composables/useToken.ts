// Stores the auth token on the client. Used as a fallback to cookies when the
// frontend and backend live on different sites (third-party cookies blocked).
const KEY = 'access_token'

export function useToken() {
  function get(): string | null {
    return import.meta.client ? localStorage.getItem(KEY) : null
  }
  function set(token: string) {
    if (import.meta.client) localStorage.setItem(KEY, token)
  }
  function clear() {
    if (import.meta.client) localStorage.removeItem(KEY)
  }
  return { get, set, clear }
}
