const request = require('supertest');
const app = require('../server');

describe('API Garderie', () => {
    test('GET /health retourne status ok', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('OK');
    });
});