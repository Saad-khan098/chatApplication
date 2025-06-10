import React, { useEffect, useState, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import styles from './Home.module.scss';
import { jwtDecode } from 'jwt-decode';
import { useGetUsers } from '@renderer/Hooks/getUsers';
import { useMessages } from '@renderer/utils/Message/MessageContext';

interface DecodedToken {
    id: string;
    name: string;
    exp: number;
    iat: number;
    [key: string]: any;
}

const Home: React.FC = () => {

    const {totalMessages} = useMessages();
    

    const [token, setToken] = useState<DecodedToken | null>(null);
    const userId = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const { data: users = [] } = useGetUsers();


    const getToken = async () => {
        try {
            const fetchedToken = await window.electron.ipcRenderer.invoke('get-token');
            const decoded: DecodedToken = jwtDecode(fetchedToken.idToken);
            userId.current = fetchedToken.id;
            setToken(decoded);
        } catch (error) {
            console.error('Failed to get or decode token:', error);
            setToken(null);
        }
    };

    useEffect(() => {
        getToken();
    }, []);

    const handleLogout = async () => {
        try {
            await window.electron.ipcRenderer.invoke('clear-token');
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!token) return <>Loading...</>;

    return (

            <div className={styles.container}>
                <TopNavbar onLogout={handleLogout} name={token.name} />
                <div className={styles.bodyContent}>
                    <Sidebar currentPath={location.pathname} users={users} messages={totalMessages} userId={userId.current}/>
                    <main className={styles.contentArea}>
                        <Outlet />
                    </main>
                </div>
            </div>
    );
};

export default Home;
