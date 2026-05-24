import { io } from 'socket.io-client';

let socket;

export function getSocket() {
  if (!socket) {
    socket = io({
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20_000,
    });
  }
  return socket;
}
