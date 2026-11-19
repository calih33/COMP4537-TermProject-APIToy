// This file was created with help from Claude code.

import { Link, useNavigate } from 'react-router';
import { api } from '../api/ApiClient';
import { messages } from '../lang/en/messages';

interface PageHeaderProps {
    title: string;
    email: string;
    link?: { to: string; label: string };
}

export default function PageHeader({ title, email, link }: PageHeaderProps) {
    const navigate = useNavigate();

    async function handleLogout() {
        await api.logout().catch(() => undefined);
        navigate('/login', { replace: true });
    }

    return (
        <header className="page-header">
            <div>
                <h1>{title}</h1>
                <p>{messages.common.signedInAs(email)}</p>
            </div>
            <nav className="header-actions">
                {link && <Link to={link.to}>{link.label}</Link>}
                <button type="button" onClick={handleLogout}>
                    {messages.common.logout}
                </button>
            </nav>
        </header>
    );
}
