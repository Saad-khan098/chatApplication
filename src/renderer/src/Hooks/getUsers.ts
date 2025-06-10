import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';


const apiUrl = import.meta.env.VITE_BASE_BACKEND_URL;

// Define the shape of a user object
export interface User {
  id: string;
  name: string;
  email: string;
}

const fetchUsers = async (): Promise<User[]> => {
  let token = await window.electron.ipcRenderer.invoke('get-token')

  if (!token) {
    throw new Error('No auth token found');
  }

  const response = await fetch(`${apiUrl}/users/getAllUsers`, {
    headers: {
      Authorization: `Bearer ${token.idToken}`,
      'x-user-id': token.id,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }

  return response.json();
};

export const useGetUsers = () => {
    const { auth} = useAuth();

  return useQuery<User[], Error>({
    queryKey: ['users', auth?.id],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
  });
};
