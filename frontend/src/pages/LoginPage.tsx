// Email + password login.
// This file was created with help from Claude code.

import { useNavigate } from 'react-router';
import { api } from '../api/ApiClient';
import AuthForm from '../components/AuthForm';
import { messages } from '../lang/en/messages';

const text = messages.auth;

export default function LoginPage() {
    const navigate = useNavigate();

    async function handleLogin(email: string, password: string) {
        const user = await api.login(email, password);
        navigate(user.role === 'admin' ? '/admin' : '/user', { replace: true });
    }

    return (
        <AuthForm
            title={text.loginHeading}
            submitLabel={text.loginButton}
            submittingLabel={text.loggingIn}
            footerText={text.noAccount}
            footerLink={{ to: '/register', label: text.registerLink }}
            onSubmit={handleLogin}
        />
    );
}
