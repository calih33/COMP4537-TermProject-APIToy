// Shared email + password form used by the login and register pages.
// This file was created with help from Claude code.

import { useState } from 'react';
import { Link } from 'react-router';
import { ApiError } from '../api/ApiClient';
import { messages } from '../lang/en/messages';

const text = messages.auth;

interface AuthFormProps {
    title: string;
    submitLabel: string;
    submittingLabel: string;
    askToConfirmPassword?: boolean;
    footerText: string;
    footerLink: { to: string; label: string };
    onSubmit: (email: string, password: string) => Promise<void>;
}

export default function AuthForm({
    title,
    submitLabel,
    submittingLabel,
    askToConfirmPassword = false,
    footerText,
    footerLink,
    onSubmit,
}: AuthFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit() {
        if (askToConfirmPassword && password !== confirmPassword) {
            setError(text.passwordsDontMatch);
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            await onSubmit(email.trim(), password);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : messages.common.genericError);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="page auth-page">
            <section className="card">
                <p className="app-title">{messages.appTitle}</p>
                <h1>{title}</h1>

                <form
                    className="auth-form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        void handleSubmit();
                    }}
                >
                    <label>
                        {text.emailLabel}
                        <input
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </label>

                    <label>
                        {text.passwordLabel}
                        <input
                            type="password"
                            autoComplete={askToConfirmPassword ? 'new-password' : 'current-password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>

                    {askToConfirmPassword && (
                        <label>
                            {text.confirmPasswordLabel}
                            <input
                                type="password"
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </label>
                    )}

                    {error && <p className="error" role="alert">{error}</p>}

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? submittingLabel : submitLabel}
                    </button>
                </form>

                <p>
                    {footerText} <Link to={footerLink.to}>{footerLink.label}</Link>
                </p>
            </section>
        </main>
    );
}
