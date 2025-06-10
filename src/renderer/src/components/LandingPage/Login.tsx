import React, { useState } from 'react';
import styles from './Signup.module.scss'; // can be renamed later if you want
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';


type Props = {
    close: () => void;
};

type FormData = {
    email: string;
    password: string;
};

const LoginForm: React.FC<Props> = ({ close }) => {

    const navigate = useNavigate();

    const [form, setForm] = useState<FormData>({
        email: '',
        password: '',
    });

    const [errorMessage, setErrorMessage] = useState('');

    const handleSuccess = async (data: any) => {
        console.log('Login success:', data);


        const token = {idToken: data.idToken, id: data.internalUserId};
        try {
            await window.electron.ipcRenderer.invoke('save-token', token);
            console.log('Token saved securely.');
            navigate('/home');

        } catch (error) {
            setErrorMessage('Failed to save token.')
        }
    };

    const handleError = (message: string) => {
        setErrorMessage(message);
    };

    const loginMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await fetch('http://localhost:5000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Login failed');
            }

            return res.json();
        },
        onSuccess: handleSuccess,
        onError: (error: any) => {
            handleError(error.message);
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errorMessage) setErrorMessage('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate(form);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.top}>
                <h1>Login</h1>
                <div className={styles.close} onClick={close}>x</div>
            </div>
            <input
                type="text"
                name="email"
                placeholder="email"
                value={form.email}
                onChange={handleChange}
            />
            <input
                type="password"
                name="password"
                placeholder="password"
                value={form.password}
                onChange={handleChange}
            />
            <button type="submit" >
                Login
            </button>
            {errorMessage && <p className={styles.error}>{errorMessage}</p>}
            <a href="/signup">Don’t have an account? Signup</a>
        </form>
    );
};

export default LoginForm;
