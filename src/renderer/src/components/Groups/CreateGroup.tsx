import {
    TextField,
    Button,
    Autocomplete,
    Chip,
    CircularProgress,
    Box,
} from '@mui/material';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGetUsers } from '@renderer/Hooks/getUsers';

interface User {
    id: string;
    name: string;
}

interface CreateGroupProps {
    onSuccess?: () => void;
}

const apiUrl = import.meta.env.VITE_BASE_BACKEND_URL;


const CreateGroup = ({ onSuccess }: CreateGroupProps) => {
    const queryClient = useQueryClient();
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

    const { data: users = [], isLoading: loadingUsers } = useGetUsers();

    const createGroup = useMutation({
        mutationFn: async ({ name, members }: { name: string; members: string[] }) => {
            let token = await window.electron.ipcRenderer.invoke('get-token')

            const response = await fetch(`${apiUrl}/groups/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', Authorization: `Bearer ${token.idToken}`,
                    'x-user-id': token.id,
                },
                body: JSON.stringify({ name, members }),
            });
            if (!response.ok) throw new Error('Failed to create group');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            setNewGroupName('');
            setSelectedUsers([]);
            if (onSuccess) onSuccess();
        },
    });

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
                label="Group Name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                fullWidth
            />

            <Autocomplete
                multiple
                options={users}
                getOptionLabel={(user) => user.name}
                value={selectedUsers}
                onChange={(_, newValue) => setSelectedUsers(newValue)}
                loading={loadingUsers}
                renderTags={(value: User[], getTagProps) =>
                    value.map((option, index) => (
                        <Chip label={option.name} {...getTagProps({ index })} key={option.id} />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Select Users"
                        placeholder="Start typing to search"
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {loadingUsers ? <CircularProgress size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
            />

            <Button
                variant="contained"
                onClick={() =>
                    createGroup.mutate({
                        name: newGroupName,
                        members: selectedUsers.map((u) => u.id),
                    })
                }
                disabled={!newGroupName || selectedUsers.length === 0 || createGroup.isPending}
            >
                {createGroup.isPending ? 'Creating...' : 'Create Group'}
            </Button>
        </Box>
    );
};

export default CreateGroup;
