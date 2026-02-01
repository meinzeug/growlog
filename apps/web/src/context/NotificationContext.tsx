import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: Date;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    removeNotification: (id: string) => void;
    refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const res = await api.get('/notifications');
            // Ensure dates are parsed correctly
            const parsed = res.data.map((n: any) => ({
                id: n.id,
                title: n.title,
                message: n.message,
                type: n.type,
                read: n.read,
                createdAt: new Date(n.created_at || n.createdAt)
            }));
            setNotifications(parsed);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            // Poll every minute
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        } else {
            setNotifications([]);
        }
    }, [isAuthenticated]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const addNotification = async (data: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
        // Optimistic update
        const tempId = Math.random().toString(36).substring(2, 9);
        const newNotification: Notification = {
            ...data,
            id: tempId,
            read: false,
            createdAt: new Date()
        };
        setNotifications(prev => [newNotification, ...prev]);

        if (isAuthenticated) {
            try {
                await api.post('/notifications', data);
                // Refresh to get real ID
                fetchNotifications();
            } catch (error) {
                console.error('Failed to save notification', error);
            }
        }
    };

    const markAsRead = async (id: string) => {
        // Optimistic
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

        if (isAuthenticated) {
            try {
                await api.put(`/notifications/${id}/read`);
            } catch (error) {
                console.error('Failed to mark notification as read', error);
            }
        }
    };

    const markAllAsRead = async () => {
        // Optimistic
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));

        if (isAuthenticated) {
            try {
                await api.put('/notifications/read-all');
            } catch (error) {
                console.error('Failed to mark all as read', error);
            }
        }
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            addNotification,
            markAsRead,
            markAllAsRead,
            removeNotification,
            refreshNotifications: fetchNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
    return context;
};
