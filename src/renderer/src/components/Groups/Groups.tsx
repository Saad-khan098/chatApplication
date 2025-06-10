import { useQuery } from '@tanstack/react-query';
import {
    CircularProgress,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { useState } from 'react';
import styles from './Groups.module.scss';
import CreateGroup from './CreateGroup';
import { useNavigate } from 'react-router-dom';

interface Group {
    id: string;
    name: string;
}

const apiUrl = import.meta.env.VITE_BASE_BACKEND_URL;

export default function Groups() {
    const [open, setOpen] = useState(false);


    const navigate = useNavigate();

    const goToMessage = (name: string, id: string) => {
        navigate(`/home/message/${id}`, {
            state: {
                name,
                isGroup: true
            }
        })
    }

    const { data: groups, isLoading, error } = useQuery<Group[]>({
        queryKey: ['groups'],
        queryFn: async () => {
            let token = await window.electron.ipcRenderer.invoke('get-token')

            const response = await fetch(`${apiUrl}/groups/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token.idToken}`,
                    'x-user-id': token.id,
                }
            });

            if (!response.ok) throw new Error('Failed to fetch groups');
            return response.json();
        },
    });



    return (
        <div className={styles.container}>
            <h1 variant="h4">
                Groups
            </h1>


            {isLoading && <CircularProgress />}
            {error && <Typography color="error">Error loading groups.</Typography>}

            <ul className={styles.groupList}>
                {groups &&
                    groups?.map((group) => (
                        <li key={group.id}
                        onClick={()=>{goToMessage(group.name, group.id)}}
                        >{group.name}</li>
                    ))}
            </ul>

            <Button variant="contained" onClick={() => setOpen(true)}>
                Create New Group
            </Button>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create a New Group</DialogTitle>
                <DialogContent>
                    <CreateGroup onSuccess={() => setOpen(false)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
