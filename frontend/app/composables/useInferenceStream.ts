import { io, type Socket } from 'socket.io-client'

// Shape of a streamed frame (matches the backend gateway payload)
export interface StreamFrame {
  ts: string
  frameId: string
  overlay: {
    boxes: { class: string; score: number; bbox: [number, number, number, number] }[]
    emotions: { label: string; score: number }[]
    risk: { level: 'LOW' | 'MEDIUM' | 'HIGH'; score: number; reasons: string[] }
  }
}

export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error'
  | 'disconnected'

export function useInferenceStream() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string

  const status = ref<ConnectionStatus>('connecting')
  const latestFrame = ref<StreamFrame | null>(null)
  // Rolling buffer of recent frames (newest first)
  const recentFrames = ref<StreamFrame[]>([])

  let socket: Socket | null = null

  function connect() {
    status.value = 'connecting'

    // withCredentials sends the httpOnly auth cookie in the handshake
    socket = io(apiBase, {
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      status.value = 'connected'
    })

    socket.on('frame', (frame: StreamFrame) => {
      latestFrame.value = frame
      recentFrames.value.unshift(frame)
      // Keep only the last 30 frames in memory
      if (recentFrames.value.length > 30) recentFrames.value.pop()
    })

    socket.on('disconnect', () => {
      status.value = 'disconnected'
    })

    // Built-in reconnection lifecycle from socket.io
    socket.io.on('reconnect_attempt', () => {
      status.value = 'reconnecting'
    })
    socket.io.on('reconnect', () => {
      status.value = 'connected'
    })

    socket.on('connect_error', () => {
      status.value = 'error'
    })
  }

  function disconnect() {
    socket?.disconnect()
    socket = null
  }

  // Auto connect/cleanup with the component lifecycle
  onMounted(connect)
  onBeforeUnmount(disconnect)

  return { status, latestFrame, recentFrames }
}
