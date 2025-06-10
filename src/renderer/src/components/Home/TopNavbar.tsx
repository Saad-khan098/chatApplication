import React, { useState } from 'react';
import styles from './TopNavbar.module.scss';

interface TopNavbarProps {
    onLogout: () => void;
    name: string;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ onLogout, name }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);

    const toggleUserMenu = () => {
        setShowUserMenu(!showUserMenu);
    };

    return (
        <header className={styles.navbar}>
            <div className={styles.navbarContent}>
                <div className={styles.leftSection}>
                    <h1 className={styles.pageTitle}>QLU Recruiting</h1>
                </div>
                
                <div className={styles.rightSection}>
                    
                    <div className={styles.userSection}>
                        <button 
                            className={styles.userButton}
                            onClick={toggleUserMenu}
                        >
                            <div className={styles.userAvatar}>
                                <span className={styles.avatarIcon}>👤</span>
                            </div>
                            <span className={styles.userName}>{name}</span>
                            <span className={styles.dropdownIcon}>▼</span>
                        </button>
                        
                        {showUserMenu && (
                            <div className={styles.userDropdown}>
                                <div className={styles.dropdownItem}>
                                    <span>Profile</span>
                                </div>
                                <div className={styles.dropdownItem}>
                                    <span>Account Settings</span>
                                </div>
                                <div className={styles.dropdownDivider}></div>
                                <button
                                    className={`${styles.dropdownItem} ${styles.logoutBtn}`}
                                    onClick={onLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopNavbar;