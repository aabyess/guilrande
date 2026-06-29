import { io, Socket } from 'socket.io-client';

// ─── 서버 URL ─────────────────────────────────────────────────────────────────
// 로컬: 'http://localhost:4000'
// 배포: 환경변수로 주입 (NEXT_PUBLIC_SOCKET_URL)

const SERVER_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';

// ─── 싱글턴 소켓 ──────────────────────────────────────────────────────────────

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect:    false,   // 명시적으로 connect() 호출 시 연결
      reconnection:   true,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}