import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { jwtDecode } from 'jwt-decode';


console.log('running message context');
const socket = io("http://localhost:5000"); // Backend socket server

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

const MessageContext = createContext<MessageContextType | undefined>(undefined);
export const useMessages = () => useContext(MessageContext)!;

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [totalMessages, settotalMessages] = useState();

    const [messages, setMessages] = useState<MessageMap>({});

    // Add or receive a message
    const addMessage = (chatId: string, message: Message) => {
        setMessages(prev => ({
            ...prev,
            [chatId]: [...(prev[chatId] || []), message]
        }));
    };

    // Load from backend
    const fetchMessagesForChat = async (chatId: string) => {
        let token = await window.electron.ipcRenderer.invoke('get-token');

        if (!token) throw new Error('No auth token found');

        try {
            const res = await fetch(`http://localhost:5000/messages/${chatId}`, {
                headers: {
                    Authorization: `Bearer ${token.idToken}`,
                    'x-user-id': token.id,
                },
            });
            const data = await res.json();
            setMessages(prev => ({
                ...prev,
                [chatId]: data.messages || [],
            }));
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        }
    };

    // Register user with socket
    useEffect(() => {
        const registerUser = async () => {
            console.log("registering user");
            try {
                const token = await window.electron.ipcRenderer.invoke('get-token');
                const userId = token.id;
                console.log(userId);
                if (userId) {
                    socket.emit("register", userId);
                    console.log("Registered socket for user:", userId);
                }
            } catch (err) {
                console.error("Failed to register socket:", err);
            }
        };

        registerUser();
    }, []);

    const fetchMessages = async () => {
        console.log('getting total messages');
        let token = await window.electron.ipcRenderer.invoke('get-token');

        if (!token) throw new Error('No auth token found');

        try {
            const res = await fetch(`http://localhost:5000/messages/`, {
                headers: {
                    Authorization: `Bearer ${token.idToken}`,
                    'x-user-id': token.id,
                },
            });
            const data = await res.json();
            console.log('fetched total messages', data);
            settotalMessages(data.inbox);
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        }
    }

    useEffect(() => {
        fetchMessages();
    }, [])

    useEffect(() => {
        socket.on("new_message", (message: Message) => {
            addMessage(message.chatId, message);
        });

        return () => {
            socket.off("new_message");
        };
    }, []);

    const sendMessage = (message: Message) => {
        console.log('sending message', message);
        socket.emit("send_message", message);

        addMessage(message.chatId, {
            ...message,
        });
    };


    const markMessagesAsRead = async (senderId: string) => {
        try {
            const token = await window.electron.ipcRenderer.invoke('get-token');
            const receiverId = token.id;

            socket.emit("status_update", {
                senderId,
                receiverId
            });

            const chatId = [receiverId, senderId].sort().join('-');

            settotalMessages((prev:any) => {
                if (!prev) return prev;

                return prev.map(entry => {
                    if (entry.chat_id == chatId) {
                        return {
                            ...entry,
                            unread_count: 0,
                        };
                    }
                    return entry;
                });
            });


            console.log(`Status update emitted and unread count cleared for chatId: ${chatId}`);
        } catch (err) {
            console.error("Failed to emit status update:", err);
        }
    };



    return (
        <MessageContext.Provider value={{ messages, addMessage, fetchMessagesForChat, sendMessage, totalMessages, markMessagesAsRead }}>
            {children}
        </MessageContext.Provider>
    );
};
