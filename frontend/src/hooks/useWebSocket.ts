import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const socketRef = useRef<Socket | null>(null);
  
  useEffect(() => {
    const socket = io('http://localhost:3001', {
      transports: ['websocket'],
      autoConnect: true,
    });
    
    socket.on('connect', () => {
      console.log('🟢 WebSocket connecté');
      setIsConnected(true);
    });
    
    socket.on('disconnect', () => {
      console.log('🔴 WebSocket déconnecté');
      setIsConnected(false);
    });
    
    socket.on('stats:update', (data: any) => {
      setLastMessage({ type: 'stats:update', data, timestamp: new Date().toISOString() });
    });
    
    socket.on('health:update', (data: any) => {
      setLastMessage({ type: 'health:update', data, timestamp: new Date().toISOString() });
    });
    
    socketRef.current = socket;
    
    return () => {
      socket.disconnect();
    };
  }, []);
  
  const subscribe = useCallback((channel: string) => {
    if (socketRef.current) {
      socketRef.current.emit('subscribe', channel);
    }
  }, []);
  
  const send = useCallback((event: string, data: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  }, []);
  
  return { isConnected, lastMessage, subscribe, send };
}