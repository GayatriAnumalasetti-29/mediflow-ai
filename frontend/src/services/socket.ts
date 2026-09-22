import { io, Socket } from 'socket.io-client';

const getSocketUrl = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname || 'localhost';
    return `http://${host}:5000`;
  }
  return 'http://localhost:5000';
};

export const socket: Socket = io(getSocketUrl(), {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1500
});

socket.on('connect', () => {
  console.log('[Socket] Connected to backend gateway at', socket.id);
});

socket.on('disconnect', () => {
  console.log('[Socket] Disconnected from backend gateway');
});
