// Fake API responses so the UI can be previewed before the backend exists.
// Turned on with VITE_USE_MOCK=true in .env.

// Change role to 'user' to see what a normal user sees.
const fakeUser = { id: 1, email: 'admin@admin.com', role: 'admin', totalRequests: 7 };

export function mockResponse(path: string): unknown {
  switch (path) {
    case '/api/v1/users/me':
      return { user: fakeUser };
    case '/api/v1/health-events':
      return {
        event: {
          id: 1,
          healthLost: 30,
          aiShots: 4,
          approvedShots: 3,
          reason: 'Large hit, so a strong response. Capped at 3 by the safety limit.',
        },
      };
    case '/api/v1/admin/users':
      return {
        users: [
          { id: 1, email: 'admin@admin.com', role: 'admin', createdAt: '2026-11-01', totalRequests: 7 },
          { id: 2, email: 'john@john.com', role: 'user', createdAt: '2026-11-02', totalRequests: 12 },
        ],
      };
    case '/api/v1/admin/stats':
      return {
        stats: [
          { method: 'POST', endpoint: '/api/v1/health-events', requests: 19 },
          { method: 'GET', endpoint: '/api/v1/users/me', requests: 42 },
        ],
      };
    default:
      return null;
  }
}
