// components/Sidebar/Sidebar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Sidebar.module.scss';
import GroupIcon from '@mui/icons-material/Group';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import Avatar from '@mui/material/Avatar';
import { useNavigate } from 'react-router-dom';


interface User {
    name: string;
    email: string;
    id: string;
}
interface SidebarProps {
    currentPath: string;
    users: User[];
    messages: [];
    userId: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPath, users, messages, userId }) => {
    const navigate = useNavigate();

    const goToMessage = (name: string, id: string) => {
        navigate(`/home/message/${id}`, {
            state: {
                name
            }
        })
    }

    const menuItems = [
        { path: '/home/groups', label: 'Groups', icon: <GroupIcon /> },
        { path: '#', label: 'Messages', icon: <ChatBubbleIcon /> },
    ];

    return (
        <div className={styles.sidebar}>
            <div className={styles.sidebarContent}>
                <nav className={styles.navigation}>
                    <ul className={styles.menuList}>
                        {menuItems.map((item) => (
                            <li key={item.path} className={styles.menuItem}>
                                <Link
                                    to={item.path}
                                    className={`${styles.menuLink} ${currentPath === item.path ? styles.active : ''
                                        }`}
                                >
                                    <span className={styles.menuIcon}>{item.icon}</span>
                                    <span className={styles.menuLabel}>{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className={styles.messages}>
                        <h2>Direct Messages</h2>

                        {
                            (messages && messages.length) > 0 ? (
                                messages.map(msg => {
                                    const isSender = msg.sender_id === userId;
                                    const displayName = isSender ? msg.receiver_name : msg.sender_name;
                                    const targetId = isSender ? msg.receiver_id : msg.sender_id;
                                    const highlight = !isSender && msg.unread_count > 0;

                                    return (
                                        <div
                                            key={msg.chat_id}
                                            className={`${styles.user} ${highlight ? styles.highlight : ''}`}
                                            onClick={() => goToMessage(displayName, targetId)}
                                        >
                                            <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32, fontSize: 16 }}>
                                                {displayName.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <div className={styles.messageContent}>
                                                <p className={styles.name}>{displayName}</p>
                                                <p className={styles.lastMessage}>
                                                    {msg.content.length > 25 ? msg.content.slice(0, 25) + '…' : msg.content}
                                                </p>
                                                {!isSender && msg.unread_count > 0 ? (
                                                    <span className={styles.unreadBadge}>{msg.unread_count}</span>
                                                ) : (
                                                    <span className={styles.readBadge}>✓</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <>Loading...</>
                            )
                        }
                    </div>


                    <div className={styles.messages}>
                        <h2>Users</h2>

                        {
                            (users && users.length > 0) ? (
                                users.map(user => {
                                    return (
                                        <div
                                            key={user.id}
                                            className={`${styles.user}`}
                                            onClick={() => goToMessage(user.name, user.id)}
                                        >
                                            <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32, fontSize: 16 }}>
                                                {user.name.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <p className={styles.messageContent}>{user.name}</p>
                                        </div>
                                    );
                                })
                            ) : (
                                <>Loading...</>
                            )
                        }




                    </div>

                </nav>
            </div>
        </div>
    );
};

export default Sidebar;