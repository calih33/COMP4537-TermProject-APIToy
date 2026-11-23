// Email + password registration.
// This file was created with help from Claude code.

import { useNavigate } from 'react-router';
import { api } from '../api/ApiClient';
import AuthForm from '../components/AuthForm';
import { messages } from '../lang/en/messages';

const text = messages.auth;

export default function RegisterPage() {
    const navigate = useNavigate();

    async function handleRegister(email: string, password: string) {
        await api.register(email, password);
        // Log in straight away so the user doesn't have to type everything twice.
        await api.login(email, password);
        navigate('/user', { replace: true });
    }

    return (
        <AuthForm
            title={text.registerHeading}
            submitLabel={text.registerButton}
            submittingLabel={text.registering}
            askToConfirmPassword
            footerText={text.haveAccount}
            footerLink={{ to: '/login', label: text.loginLink }}
            onSubmit={handleRegister}
        />
    );
}
