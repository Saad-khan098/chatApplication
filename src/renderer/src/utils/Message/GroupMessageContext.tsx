import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { jwtDecode } from 'jwt-decode';

const apiUrl = import.meta.env.VITE_BASE_BACKEND_URL;

// Types
export type Message = {
    id: string;
    chatId: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    createdAt: string;
};

type MessageMap = {
    [chatId: string]: Message[];
};

type MessageContextType = {
    messages: MessageMap;
    addMessage: (chatId: string, message: Message) => void;
    fetchMessagesForChat: (chatId: string) => Promise<void>;
    sendMessage: (message: Message) => void;
    totalMessages: any;
    markMessagesAsRead: (senderId: string) => void;
};

const GroupMessageContext = createContext<MessageContextType | undefined>(undefined);
export const useGroupMessages = () => useContext(GroupMessageContext)!;

export const GroupMessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [totalMessages, settotalMessages] = useState();
    const [messages, setMessages] = useState<MessageMap>({});
    
    const socketRef = useRef(null);
    const isRegisteredRef = useRef(false);
    const isInitializedRef = useRef(false);

    const addMessage = (groupId: string, message: Message) => {
        console.log('adding a new message', message.group_id, message);
        setMessages(prev => ({
            ...prev,
            [message.group_id]: [...(prev[message.group_id] || []), message]
        }));

        settotalMessages((prev: any) =>
            prev ? prev.map(entry =>
                entry.chat_id === groupId
                    ? { ...entry, content: message.content }
                    : entry
            ) : prev
        );
    };

    const fetchMessagesForChat = async (groupId: string) => {
        let token = await window.electron.ipcRenderer.invoke('get-token');

        if (!token) throw new Error('No auth token found');

        try {
            const res = await fetch(`${apiUrl}/groups/chat/${groupId}`, {
                headers: {
                    Authorization: `Bearer ${token.idToken}`,
                    'x-user-id': token.id,
                },
            });
            const data = await res.json();
            setMessages(prev => ({
                ...prev,
                [groupId]: data || [],
            }));
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        }
    };

    const fetchMessages = async () => {
        // let token = await window.electron.ipcRenderer.invoke('get-token');

        // if (!token) throw new Error('No auth token found');

        // try {
        //     const res = await fetch(`${apiUrl}/messages/`, {
        //         headers: {
        //             Authorization: `Bearer ${token.idToken}`,
        //             'x-user-id': token.id,
        //         },
        //     });
        //     const data = await res.json();
        //     settotalMessages(data.inbox);
        // } catch (err) {
        //     console.error("Failed to fetch messages:", err);
        // }
    };

    const registerUser = async () => {
        if (isRegisteredRef.current || !socketRef.current) {
            console.log('User already registered or socket not available, skipping...');
            return;
        }

        try {
            const token = await window.electron.ipcRenderer.invoke('get-token');
            const userId = token.id;
            if (userId && socketRef.current.connected) {
                console.log('Registering user:', userId);
                socketRef.current.emit("register", userId);
                isRegisteredRef.current = true;
            }
        } catch (err) {
            console.error("Failed to register socket:", err);
        }
    };

    const sendMessage = (message: Message) => {
        if (socketRef.current) {
            socketRef.current.emit("group_send_message", message);
            addMessage(message.chatId, { ...message });
        }
    };

    const markMessagesAsRead = async (senderId: string) => {
        // try {
        //     const token = await window.electron.ipcRenderer.invoke('get-token');
        //     const receiverId = token.id;

        //     if (socketRef.current) {
        //         socketRef.current.emit("status_update", {
        //             senderId,
        //             receiverId
        //         });
        //     }

        //     const chatId = [receiverId, senderId].sort().join('-');

        //     settotalMessages((prev: any) => {
        //         if (!prev) return prev;

        //         return prev.map(entry => {
        //             if (entry.chat_id == chatId) {
        //                 return {
        //                     ...entry,
        //                     unread_count: 0,
        //                 };
        //             }
        //             return entry;
        //         });
        //     });

        // } catch (err) {
        //     console.error("Failed to emit status update:", err);
        // }
    };

    // Initialize socket connection and event listeners once
    useEffect(() => {
        if (isInitializedRef.current) {
            return;
        }

        console.log('Initializing socket connection...');
        
        // Create socket connection
        const socket = io(apiUrl);
        socketRef.current = socket;
        isInitializedRef.current = true;

        console.log("Initial socket ID:", socket.id);

        const handleConnect = () => {
            console.log("Socket connected with ID:", socket.id);
            registerUser();
        };

        const handleDisconnect = (reason) => {
            console.log("Socket disconnected. Reason:", reason);
            isRegisteredRef.current = false;
        };

        const handleNewMessage = (message: Message) => {
            console.log('Received new message:', message);
            const chatId = [message.sender_id, message.receiver_id].sort().join('-');
            addMessage(chatId, message);
        };

        const handleConnectError = (error) => {
            console.error("Socket connection error:", error);
        };

        // Set up event listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('connect_error', handleConnectError);
        socket.on("new_group_message", handleNewMessage);

        // If already connected, register immediately
        if (socket.connected) {
            registerUser();
        }

        // Fetch initial messages
        fetchMessages();

        // Cleanup function
        return () => {
            console.log('Cleaning up socket connection...');
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('connect_error', handleConnectError);
            socket.off("new_group_message", handleNewMessage);
            socket.disconnect();
            socketRef.current = null;
            isRegisteredRef.current = false;
            isInitializedRef.current = false;
        };
    }, []); // Empty dependency array ensures this runs only once

    return (
        <GroupMessageContext.Provider value={{ 
            messages, 
            addMessage, 
            fetchMessagesForChat, 
            sendMessage, 
            totalMessages, 
            markMessagesAsRead 
        }}>
            {children}
        </GroupMessageContext.Provider>
    );
};