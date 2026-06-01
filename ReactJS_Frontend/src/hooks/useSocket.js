import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let socketInstance = null;

export const useSocket = (onNotification) => {
    const onNotificationRef = useRef(onNotification);
    onNotificationRef.current = onNotification;

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        if (!socketInstance) {
            socketInstance = io(SOCKET_URL, {
                auth: { token },
                reconnectionAttempts: 5,
                reconnectionDelay: 2000
            });
        }

        const handler = (data) => {
            onNotificationRef.current?.(data);
        };

        socketInstance.on('notification', handler);

        return () => {
            socketInstance.off('notification', handler);
        };
    }, []);

    const disconnect = useCallback(() => {
        if (socketInstance) {
            socketInstance.disconnect();
            socketInstance = null;
        }
    }, []);

    return { disconnect };
};