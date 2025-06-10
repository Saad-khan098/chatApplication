import { useEffect, useState } from 'react';

interface AuthToken {
  id: string;       
  idToken: string;
}

export const useAuth = () => {
  const [auth, setAuth] = useState<AuthToken | null>(null);

  const fetchToken = async () => {
    try {
      const token = await window.electron.ipcRenderer.invoke('get-token');
      setAuth(token);
    } catch (err) {
      setAuth(null);
    } finally {
    }
  };

  useEffect(() => {
    fetchToken();
  }, []);

  return { auth, refetch: fetchToken };
};
