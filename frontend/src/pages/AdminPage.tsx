// Lists registered users and API stats (admin only).
// This file was created with help from Claude code.

import { useEffect, useState } from 'react';
import { api, ApiError } from '../api/ApiClient';
import type { AdminUserRow, EndpointStat } from '../api/ApiClient';
import PageHeader from '../components/PageHeader';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { messages } from '../lang/en/messages';

const text = messages.admin;

export default function AdminPage() {
    const { user } = useCurrentUser();
    const [users, setUsers] = useState<AdminUserRow[] | null>(null);
    const [stats, setStats] = useState<EndpointStat[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;

        Promise.all([api.getAllUsers(), api.getEndpointStats()])
            .then(([userRows, statRows]) => {
                if (ignore) return;
                setUsers(userRows);
                setStats(statRows);
            })
            .catch((err: unknown) => {
                if (ignore) return;
                const forbidden = err instanceof ApiError && err.status === 403;
                setError(forbidden ? text.forbidden : messages.common.genericError);
            });

        return () => {
            ignore = true;
        };
    }, []);

    return (
        <main className="page">
            <PageHeader
                title={text.heading}
                email={user.email}
                link={{ to: '/user', label: text.userPageLink }}
            />

            {error && <p className="error" role="alert">{error}</p>}
            {!error && !users && <p>{messages.common.loading}</p>}

            {users && (
                <section className="card">
                    <h2>{text.usersHeading}</h2>
                    <div className="table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>{text.columns.email}</th>
                                    <th>{text.columns.role}</th>
                                    <th>{text.columns.joined}</th>
                                    <th>{text.columns.requests}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((row) => (
                                    <tr key={row.id}>
                                        <td>{row.email}</td>
                                        <td>{row.role}</td>
                                        <td>{new Date(row.createdAt).toLocaleDateString()}</td>
                                        <td>{row.totalRequests}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {stats && (
                <section className="card">
                    <h2>{text.statsHeading}</h2>
                    {stats.length === 0 ? (
                        <p>{text.noStats}</p>
                    ) : (
                        <div className="table-scroll">
                            <table>
                                <thead>
                                    <tr>
                                        <th>{text.columns.method}</th>
                                        <th>{text.columns.endpoint}</th>
                                        <th>{text.columns.requests}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.map((row) => (
                                        <tr key={`${row.method} ${row.endpoint}`}>
                                            <td>{row.method}</td>
                                            <td>{row.endpoint}</td>
                                            <td>{row.requests}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}
        </main>
    );
}
