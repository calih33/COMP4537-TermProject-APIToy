// class ApiClient: calls the API server (separate origin), sends credentials.
// This file was written with help from Claude code.

import { messages } from '../lang/en/messages';
import { mockResponse } from './mockData';

export type Role = 'user' | 'admin';

export interface CurrentUser {
    id: number;
    email: string;
    role: Role;
    totalRequests: number;
}

export interface HealthEventResult {
    id: number;
    healthLost: number;
    aiShots: number;
    approvedShots: number;
    reason: string;
}

export interface AdminUserRow {
    id: number;
    email: string;
    role: Role;
    createdAt: string;
    totalRequests: number;
}

export interface EndpointStat {
    method: string;
    endpoint: string;
    requests: number;
}

export class ApiError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

class ApiClient {
    private readonly baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
    }

    private async request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
        if (import.meta.env.VITE_USE_MOCK === 'true') {
            await new Promise((resolve) => setTimeout(resolve, 500)); // fake network delay
            return mockResponse(path) as T;
        }
        const response = await fetch(this.baseUrl + path, {
            method,
            credentials: 'include',
            headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
            body: body === undefined ? undefined : JSON.stringify(body),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new ApiError(response.status, data?.error ?? messages.common.genericError);
        }
        return data as T;
    }

    async login(email: string, password: string) {
        const data = await this.request<{ user: CurrentUser }>(
            '/api/v1/auth/login', 'POST', { email, password },
        );
        return data.user;
    }

    async register(email: string, password: string) {
        const data = await this.request<{ user: CurrentUser }>(
            '/api/v1/auth/register', 'POST', { email, password },
        );
        return data.user;
    }

    logout() {
        return this.request<void>('/api/v1/auth/logout', 'POST');
    }

    async getMe() {
        const data = await this.request<{ user: CurrentUser }>('/api/v1/users/me');
        return data.user;
    }

    async sendHealthEvent(previousHealth: number, currentHealth: number) {
        const data = await this.request<{ event: HealthEventResult }>(
            '/api/v1/health-events', 'POST', { previousHealth, currentHealth },
        );
        return data.event;
    }

    async getAllUsers() {
        const data = await this.request<{ users: AdminUserRow[] }>('/api/v1/admin/users');
        return data.users;
    }

    async getEndpointStats() {
        const data = await this.request<{ stats: EndpointStat[] }>('/api/v1/admin/stats');
        return data.stats;
    }
}

export const api = new ApiClient(import.meta.env.VITE_API_URL ?? '');