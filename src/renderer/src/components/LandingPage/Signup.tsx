import React, { useState } from 'react';
import styles from './Signup.module.scss';
import { useMutation } from '@tanstack/react-query';
import SuccessAlert from '../HelperComponents/SuccessAlert';

const apiUrl = import.meta.env.VITE_BASE_BACKEND_URL;


type Props = {
    close: () => void;
};
type FormData = {
    displayName: string;
    email: string;
    password: string;
};

const SignupForm: React.FC<Props> = ({ close }) => {


    const [successOpen, setSuccessOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [errorMessage, setErrorMessage] = useState("");

    const handleSuccess = (data: { uid: string }) => {
        setSuccessMessage('User created: ' + data.uid);
        setSuccessOpen(true);
    };

    const handleError = (errorMessage)=>{
        setErrorMessage(errorMessage)
    }

    const [form, setForm] = useState({
        email: '',
        displayName: '',
        username: '',
        password: '',
    });

    const signupMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await fetch(`${apiUrl}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: formData.displayName
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Signup failed');
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
        signupMutation.mutate(form);
    };

    return (
        <>
            <SuccessAlert
                open={successOpen}
                message={successMessage}
                onClose={() => setSuccessOpen(false)}
            />
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.top}>
                    <h1>Signup</h1>
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
                    type="text"
                    name="displayName"
                    placeholder="display name"
                    value={form.displayName}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="username"
                    placeholder="username"
                    value={form.username}
                    onChange={handleChange}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="password"
                    value={form.password}
                    onChange={handleChange}
                />
                <button type="submit">Signup</button>
                {
                    errorMessage != ''
                    &&
                    <p className={styles.error}>{errorMessage}</p>
                }
                <a href="/login">Already have an account? Login</a>
            </form>
        </>
    );
};

export default SignupForm;
