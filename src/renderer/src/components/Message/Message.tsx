import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useMessages } from "@renderer/utils/Message/MessageContext";
import { useGroupMessages } from "@renderer/utils/Message/GroupMessageContext";
import styles from './Message.module.scss';
import { Avatar } from "@mui/material";
import { jwtDecode } from 'jwt-decode';


export default function Message() {
    const params = useParams();
    const location = useLocation();
    const { state } = location;
    const name = state?.name;
    const isGroup = state?.isGroup;


    const { id: receiver_id } = params;

    const groupId = isGroup ? receiver_id : null;


    const individualMessages = useMessages();
    const groupMessages = useGroupMessages();

    const {
        sendMessage,
        fetchMessagesForChat,
        messages,
        markMessagesAsRead
    } = groupId ? groupMessages : individualMessages

    console.log('messages', messages);

    const [content, setContent] = useState("");
    const [chatId, setChatId] = useState<string | null>(null);
    const [sender_id, setSender_id] = useState<string | null>(null);
    const chatRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        markMessagesAsRead(receiver_id);
    }, [receiver_id])


    useEffect(() => {
        const loadMessages = async () => {
            const token = await window.electron.ipcRenderer.invoke("get-token");
            const sender_id = token?.id;
            setSender_id(sender_id);

            if (!sender_id || !receiver_id) return;

            const chatKey = isGroup ? groupId : [receiver_id, sender_id].sort().join("-");
            setChatId(chatKey);

            await fetchMessagesForChat(chatKey);
        };

        loadMessages();
    }, [receiver_id]);

    const handleSend = async () => {
        const token = await window.electron.ipcRenderer.invoke("get-token");
        const sender_id = token?.id;
        const decoded = jwtDecode(token.idToken);
        console.log('decoded',decoded);


        if (!sender_id || !receiver_id || !chatId) return;

        if (content.trim()) {
            sendMessage({ chatId: chatId, sender_id, receiver_id, content, group_id: groupId, sender_name:decoded.name });
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
                                        {isGroup ? msg.sender_name.charAt(0).toUpperCase() : name.charAt(0).toUpperCase()}
                                    </Avatar>
                                }

                                <div className={styles.messageGroup}>

                                    <div className={styles.senderName}>{isSelf ? "You" : isGroup ? msg.sender_name : name}</div>
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
