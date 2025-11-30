import { useEffect, useRef, useState, useCallback } from 'react';
import type { WebSocketNotification } from '../types';

interface UseWebSocketOptions {
    usuarioCorreo: string;
    pedidoId: string;
    onMessage?: (notification: WebSocketNotification) => void;
    autoReconnect?: boolean;
    reconnectInterval?: number;
}

interface UseWebSocketReturn {
    isConnected: boolean;
    lastNotification: WebSocketNotification | null;
    error: string | null;
    disconnect: () => void;
    reconnect: () => void;
}

const WS_BASE_URL = import.meta.env.VITE_WEBSOCKET_URL;

/**
 * Hook personalizado para gestión de conexiones WebSocket
 * Conecta automáticamente al montar y desconecta al desmontar
 */
export const useWebSocket = ({
    usuarioCorreo,
    pedidoId,
    onMessage,
    autoReconnect = true,
    reconnectInterval = 3000
}: UseWebSocketOptions): UseWebSocketReturn => {
    const [isConnected, setIsConnected] = useState(false);
    const [lastNotification, setLastNotification] = useState<WebSocketNotification | null>(null);
    const [error, setError] = useState<string | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<number | null>(null);
    const shouldReconnectRef = useRef(true);

    const connect = useCallback(() => {
        if (!usuarioCorreo || !pedidoId) {
            console.log('WebSocket: Faltan usuarioCorreo o pedidoId para conectar. No se inicia la conexión.');
            setIsConnected(false);
            setError('Faltan credenciales para la conexión WebSocket');
            return;
        }

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            console.log('WebSocket: Ya existe una conexión activa');
            return;
        }

        try {
            const wsUrl = `${WS_BASE_URL}?usuario_correo=${encodeURIComponent(usuarioCorreo)}&pedido_id=${encodeURIComponent(pedidoId)}`;
            console.log(`WebSocket: Conectando a ${wsUrl}`);

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket: Conectado exitosamente');
                setIsConnected(true);
                setError(null);
            };

            ws.onmessage = (event) => {
                try {
                    const notification: WebSocketNotification = JSON.parse(event.data);
                    console.log('WebSocket: Notificación recibida:', notification);

                    setLastNotification(notification);

                    if (onMessage) {
                        onMessage(notification);
                    }
                } catch (err) {
                    console.error('WebSocket: Error al parsear mensaje:', err);
                    setError('Error al procesar notificación');
                }
            };

            ws.onerror = (event) => {
                console.error('WebSocket: Error de conexión:', event);
                setError('Error de conexión WebSocket');
                setIsConnected(false);
            };

            ws.onclose = (event) => {
                console.log('WebSocket: Conexión cerrada:', event.code, event.reason);
                setIsConnected(false);
                wsRef.current = null;

                // Reconexión automática si está habilitada y el componente sigue montado
                if (autoReconnect && shouldReconnectRef.current) {
                    console.log(`WebSocket: Reconectando en ${reconnectInterval}ms...`);
                    reconnectTimeoutRef.current = window.setTimeout(() => {
                        connect();
                    }, reconnectInterval);
                }
            };
        } catch (err) {
            console.error('WebSocket: Error al crear conexión:', err);
            setError('Error al crear conexión WebSocket');
            setIsConnected(false);
        }
    }, [usuarioCorreo, pedidoId, onMessage, autoReconnect, reconnectInterval]);

    const disconnect = useCallback(() => {
        console.log('WebSocket: Desconectando...');
        shouldReconnectRef.current = false;

        // Limpiar timeout de reconexión
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        // Cerrar conexión
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        setIsConnected(false);
    }, []);

    const reconnect = useCallback(() => {
        console.log('WebSocket: Reconexión manual...');
        disconnect();
        shouldReconnectRef.current = true;
        setTimeout(() => {
            connect();
        }, 100);
    }, [connect, disconnect]);

    // Conectar al montar y gestionar el ciclo de vida de la conexión
    useEffect(() => {
        shouldReconnectRef.current = autoReconnect;
        
        // Iniciar conexión
        connect();

        // Función de limpieza para desmontar el componente
        return () => {
            console.log('WebSocket: Limpiando efecto y desconectando...');
            shouldReconnectRef.current = false;

            // Limpiar timeout de reconexión
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }

            // Cerrar conexión WebSocket
            if (wsRef.current) {
                wsRef.current.onclose = null; // Evitar reconexión al desmontar
                wsRef.current.close();
            }
        };
    }, [autoReconnect, connect]); // Ejecutar solo si autoReconnect cambia

    return {
        isConnected,
        lastNotification,
        error,
        disconnect,
        reconnect
    };
};
