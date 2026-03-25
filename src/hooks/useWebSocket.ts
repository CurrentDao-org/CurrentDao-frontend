import { useEffect, useState, useRef, useCallback } from 'react';

interface WebSocketHookProps<T> {
  url?: string;
  onMessage?: (data: T) => void;
  mockInterval?: number;
  mockDataGenerator?: () => T;
}

export function useWebSocket<T>({
  url,
  onMessage,
  mockInterval = 5000,
  mockDataGenerator
}: WebSocketHookProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const handleMessage = useCallback((receivedData: T) => {
    setData(receivedData);
    if (onMessage) onMessage(receivedData);
  }, [onMessage]);

  useEffect(() => {
    if (url) {
      try {
        socketRef.current = new WebSocket(url);

        socketRef.current.onopen = () => {
          setIsConnected(true);
          setError(null);
        };

        socketRef.current.onmessage = (event) => {
          try {
            const parsedData = JSON.parse(event.data);
            handleMessage(parsedData);
          } catch (e) {
            console.error('Error parsing WebSocket message:', e);
          }
        };

        socketRef.current.onerror = (event) => {
          setError('WebSocket connection error');
          console.error('WebSocket Error:', event);
        };

        socketRef.current.onclose = () => {
          setIsConnected(false);
        };

        return () => {
          socketRef.current?.close();
        };
      } catch (e) {
        setError('Failed to initialize WebSocket');
        console.error('WebSocket Initialization Error:', e);
      }
    } else if (mockDataGenerator) {
      // Mock implementation
      setIsConnected(true);
      const interval = setInterval(() => {
        handleMessage(mockDataGenerator());
      }, mockInterval);

      // Initial call
      handleMessage(mockDataGenerator());

      return () => clearInterval(interval);
    }
  }, [url, mockInterval, mockDataGenerator, handleMessage]);

  return { data, isConnected, error, socket: socketRef.current };
}
