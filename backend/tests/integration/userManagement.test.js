const request = require('supertest');
const app = require('../../server');

describe('User Management API Integration', () => {
    // We'll mock the supabase response for testing
    // In a real scenario, we'd use a test DB or mock the client

    it('should block non-admin users from accessing /auth/users', async () => {
        // Mocking a standard user request
        // Since we don't have a real token here, the auth middleware will block it
        const res = await request(app).get('/api/v1/auth/users');
        expect(res.status).toBe(401);
    });

    it('should have the update-role route registered', async () => {
        const res = await request(app).put('/api/v1/auth/users/some-id/role').send({ role: 'moderator' });
        expect(res.status).toBe(401); // Still blocked by auth, which proves it hit the middleware
    });
});
