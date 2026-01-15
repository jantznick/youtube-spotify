import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

// Construct Socket.io URL from API URL
let SOCKET_URL;
if (import.meta.env.VITE_API_URL) {
  // Parse the API URL and remove /api if present
  const apiUrl = import.meta.env.VITE_API_URL;
  // Remove trailing /api if it exists
  SOCKET_URL = apiUrl.replace(/\/api\/?$/, '');
  // Ensure it doesn't have a trailing slash
  SOCKET_URL = SOCKET_URL.replace(/\/$/, '');
} else {
  // Development fallback
  SOCKET_URL = window.location.origin.replace(':5173', ':3001');
}

export function useSocket(onConnect, onDisconnect) {
  const socketRef = useRef(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    console.log('Connecting to Socket.io:', SOCKET_URL);
    
    // Create socket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: {
        sessionId: document.cookie
          .split('; ')
          .find(row => row.startsWith('connect.sid='))
          ?.split('=')[1],
      },
    });

    socket.on('connect', () => {
      console.log('Socket.io connected:', socket.id);
      // Join with user ID
      socket.emit('join', user.id);
      if (onConnect) onConnect(socket);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.io disconnected:', reason);
      if (onDisconnect) onDisconnect(reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
    });

    socketRef.current = socket;

    return () => {
      console.log('Cleaning up Socket.io connection');
      socket.disconnect();
    };
  }, [user?.id]);

  return socketRef.current;
}
