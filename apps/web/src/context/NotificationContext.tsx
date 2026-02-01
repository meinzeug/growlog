import React, { createContext, useContext, useState, useEffect } from 'react';

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
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Load initial mock data
    useEffect(() => {
        // Only add mock data if empty (simulate fetch)
        if (notifications.length === 0) {
            setNotifications([
                {
                    id: '1',
                    title: 'Welcome to GrowLog!',
                    message: 'Start by adding your first plant or grow space.',
                    type: 'success',
                    read: false,
                    createdAt: new Date()
                },
                {
                    id: '2',
                    title: 'System Update',
                    message: 'New features added: Moon Phase & Electricity Calculator.',
                    type: 'info',
                    read: false,
                    createdAt: new Date(Date.now() - 3600000) // 1 hour ago
                }
            ]);
        }
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const addNotification = (data: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
        const newNotification: Notification = {
            ...data,
            id: Math.random().toString(36).substring(2, 9),
            read: false,
            createdAt: new Date()
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, removeNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
    return context;
};
