// Redirects to /login when not signed in; checks role.
// This file was created with help from Claude code.

import { useCallback, useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router';
import { api, ApiError } from '../api/ApiClient';
import type { CurrentUser, Role } from '../api/ApiClient';
import type { CurrentUserContext } from '../hooks/useCurrentUser';
import { messages } from '../lang/en/messages';

type AuthState =
    | { status: 'loading' }
    | { status: 'signedOut' }
    | { status: 'error' }
    | { status: 'signedIn'; user: CurrentUser };

interface ProtectedRouteProps {
    requiredRole?: Role;
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
    const [auth, setAuth] = useState<AuthState>({ status: 'loading' });

    const refreshUser = useCallback(async () => {
        try {
            const user = await api.getMe();
            setAuth({ status: 'signedIn', user });
        } catch (err) {
            const signedOut = err instanceof ApiError && err.status === 401;
            setAuth({ status: signedOut ? 'signedOut' : 'error' });
        }
    }, []);

    useEffect(() => {
        void refreshUser();
    }, [refreshUser]);

    if (auth.status === 'loading') return <p className="page">{messages.common.loading}</p>;
    if (auth.status === 'signedOut') return <Navigate to="/login" replace />;
    if (auth.status === 'error') {
        return <p className="page error" role="alert">{messages.common.genericError}</p>;
    }

    // This check is only for convenience. The server's requireAdmin middleware
    // is what actually protects admin data.
    if (requiredRole && auth.user.role !== requiredRole) {
        return <Navigate to="/user" replace />;
    }

    const context: CurrentUserContext = { user: auth.user, refreshUser };
    return <Outlet context={context} />;
}
