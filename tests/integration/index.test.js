const app = require('../../app');
const request = require('supertest');

describe('Non-existent route', () => {
  test('Non-existent route does not exist', async () => {
    const res = await request(app).post('/non-route');
    expect(res.status).toBe(404);
  });
});
