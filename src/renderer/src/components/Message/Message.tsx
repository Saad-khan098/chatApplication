import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useMessages } from "@renderer/utils/Message/MessageContext";
import styles from './Message.module.scss';
import { Avatar } from "@mui/material";

export default function Message() {
    const params = useParams();
    const location = useLocation();
    const { state } = location;
    const name = state?.name;
    const { id: receiver_id } = params;

    const { sendMessage, fetchMessagesForChat, messages, markMessagesAsRead } = useMessages();
    const [content, setContent] = useState("");
    const [chatId, setChatId] = useState<string | null>(null);
    const [sender_id, setSender_id] = useState<string | null>(null);
    const chatRef = useRef<HTMLDivElement | null>(null);

    useEffect(()=>{
        console.log('*********************************************************')
        console.log('requesting marking');
        markMessagesAsRead(receiver_id);
    }, [receiver_id])

    console.log('messages,', messages);

    useEffect(() => {
        const loadMessages = async () => {
            const token = await window.electron.ipcRenderer.invoke("get-token");
            const sender_id = token?.id;
            setSender_id(sender_id);

            if (!sender_id || !receiver_id) return;

            const chatKey = [receiver_id, sender_id].sort().join("-");
            setChatId(chatKey);

            await fetchMessagesForChat(chatKey);
        };

        loadMessages();
    }, [receiver_id]);

    const handleSend = async () => {
        const token = await window.electron.ipcRenderer.invoke("get-token");
        const sender_id = token?.id;

        if (!sender_id || !receiver_id || !chatId) return;

        if (content.trim()) {
            console.log('********sending message');
            sendMessage({ chatId, sender_id, receiver_id, content });
            setContent("");
        }
    };

    const chatMessages = chatId ? messages[chatId] || [] : [];

    return (
        <div className={styles.container}>
            <h1>Direct Message - {name}</h1>

            <div className={styles.chatBox} ref={chatRef}>
                {chatMessages.length === 0 ? (
                    <p className={styles.noMessages}>No messages yet.</p>
                ) : (
                    [...chatMessages].reverse().map((msg) => {

                        const isSelf = msg.sender_id == sender_id;
                        return (
                            <div
                                key={msg.id}
                                className={`${styles.messageRow} ${isSelf ? styles.self : styles.other}`}
                            >
                                {
                                    !isSelf &&
                                    <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32, fontSize: 16, marginRight: '10px' }} className={styles.avatar}>
                                        {name.charAt(0).toUpperCase()}
                                    </Avatar>
                                }

                                <div className={styles.messageGroup}>

                                    <div className={styles.senderName}>{isSelf ? "You" : name}</div>
                                    <div className={`${styles.messageBubble} ${isSelf ? styles.selfBubble : styles.otherBubble}`}>
                                        {msg.content}
                                    </div>
                                </div>

                            </div>




                        );
                    })
                )}
            </div>

            <div className={styles.inputRow}>
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type a message"
                />
                <button onClick={handleSend}>Send</button>
            </div>
        </div>
    );
}
