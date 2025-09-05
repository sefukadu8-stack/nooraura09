import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus('connecting');
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('WebSocket message received:', message);

          switch (message.type) {
            case 'connected':
              toast({
                title: "Live Updates Active",
                description: "Real-time synchronization enabled",
                duration: 3000,
              });
              break;

            case 'product_created':
            case 'product_updated':
            case 'product_deleted':
              queryClient.invalidateQueries({ queryKey: ['/api/products'] });
              toast({
                title: "Product Updated",
                description: "Product changes synchronized",
                duration: 2000,
              });
              break;

            case 'order_created':
            case 'order_updated':
              queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
              break;

            case 'admin_update':
              // Handle specific admin updates
              if (message.action === 'product_change') {
                queryClient.invalidateQueries({ queryKey: ['/api/products'] });
              }
              break;

            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        console.log('WebSocket disconnected');
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (wsRef.current?.readyState !== WebSocket.OPEN) {
            connect();
          }
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('disconnected');
    }
  }, [queryClient, toast]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return {
    isConnected,
    connectionStatus,
    sendMessage,
  };
}
