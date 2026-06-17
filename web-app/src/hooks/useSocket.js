import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export default function useSocket(bookingId, onLocationUpdate, onStatusChange) {
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL);

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to socket server');
      if (bookingId) {
        socket.emit('join-booking', bookingId);
      }
    });

    socket.on('location-updated', (data) => {
      if (onLocationUpdate) onLocationUpdate(data);
    });

    socket.on('booking-status-changed', (data) => {
      if (onStatusChange) onStatusChange(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [bookingId]); // Re-run if bookingId changes

  return socketRef.current;
}
