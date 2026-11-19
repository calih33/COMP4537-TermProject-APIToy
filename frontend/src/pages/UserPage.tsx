// Shows email, API usage, and the AI health-event demo.
// This file was created with help from Claude code.

import { useState } from 'react';
import { api, ApiError } from '../api/ApiClient';
import type { HealthEventResult } from '../api/ApiClient';
import PageHeader from '../components/PageHeader';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { messages } from '../lang/en/messages';

const MIN_HEALTH = 0;
const MAX_HEALTH = 100;
const text = messages.user;

function isValidHealth(value: number) {
    return Number.isInteger(value) && value >= MIN_HEALTH && value <= MAX_HEALTH;
}

export default function UserPage() {
    const { user, refreshUser } = useCurrentUser();

    const [previousHealth, setPreviousHealth] = useState('100');
    const [currentHealth, setCurrentHealth] = useState('70');
    const [result, setResult] = useState<HealthEventResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit() {
        const before = Number(previousHealth);
        const after = Number(currentHealth);
        if (!isValidHealth(before) || !isValidHealth(after) || after > before) {
            setError(text.invalidHealth);
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setResult(null);
        try {
            setResult(await api.sendHealthEvent(before, after));
            await refreshUser();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : messages.common.genericError);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="page">
            <PageHeader
                title={text.heading}
                email={user.email}
                link={user.role === 'admin' ? { to: '/admin', label: text.adminLink } : undefined}
            />

            <section className="card">
                <h2>{text.usageHeading}</h2>
                <p>{text.usageCount(user.totalRequests)}</p>
            </section>

            <section className="card">
                <h2>{text.demoHeading}</h2>
                <p>{text.demoIntro}</p>

                <form
                    className="health-form"
                    onSubmit={(event) => {
                        event.preventDefault(); // stop the browser from reloading the page
                        void handleSubmit();
                    }}
                >
                    <label>
                        {text.previousHealthLabel}
                        <input
                            type="number"
                            min={MIN_HEALTH}
                            max={MAX_HEALTH}
                            step={1}
                            required
                            value={previousHealth}
                            onChange={(e) => setPreviousHealth(e.target.value)}
                        />
                    </label>
                    <label>
                        {text.currentHealthLabel}
                        <input
                            type="number"
                            min={MIN_HEALTH}
                            max={MAX_HEALTH}
                            step={1}
                            required
                            value={currentHealth}
                            onChange={(e) => setCurrentHealth(e.target.value)}
                        />
                    </label>
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? text.submitting : text.submit}
                    </button>
                </form>

                {error && <p className="error" role="alert">{error}</p>}

                {result && (
                    <dl className="result">
                        <dt>{text.healthLost}</dt>
                        <dd>{result.healthLost}</dd>
                        <dt>{text.aiShots}</dt>
                        <dd>{result.aiShots}</dd>
                        <dt>{text.approvedShots}</dt>
                        <dd>{result.approvedShots}</dd>
                        <dt>{text.reason}</dt>
                        <dd>{result.reason}</dd>
                    </dl>
                )}
            </section>
        </main>
    );
}
