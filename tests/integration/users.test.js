const app = require('../../app');
const request = require('supertest');
const {
  initializeMongoServer,
  disconnectMongoServer,
} = require('../mongoTestingConfig');
const { mockUsers, registerUsers } = require('../mockUsers');

let loggedInUsers;

beforeAll(async () => {
  await initializeMongoServer();
  const registeredUsers = await registerUsers(mockUsers);
  loggedInUsers = registeredUsers;
});

afterAll(async () => {
  await disconnectMongoServer();
});

describe('Search users route', () => {
  test('responds with 401 status when no token in header', async () => {
    const res = await request(app).get('/api/users/search?query=Maggie');
    expect(res.status).toBe(401);
  });

  test('responds with error msg when no token in header', async () => {
    const res = await request(app).get('/api/users/search?query=Maggie');
    expect(res.error.text).toContain('Not authorized, no token');
  });

  test('responds with 400 status when query string is invalid', async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const res = await request(app)
      .get('/api/users/search?query=')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(400);
  });

  test('responds with error msg when query string is invalid', async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const res = await request(app)
      .get('/api/users/search?query=')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.error.text).toContain('Query string is invalid');
  });

  test('responds with 200 status when token present', async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const res = await request(app)
      .get('/api/users/search?query=Maggie')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
  });

  test('responds with an array when token present', async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const res = await request(app)
      .get('/api/users/search?query=Maggie')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(Array.isArray(res.body.users)).toBe(true);
  });

  test('responds with an empty array when no results found', async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const res = await request(app)
      .get('/api/users/search?query=Andrew')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.body.users).toHaveLength(0);
  });

  test("responds with multiple users when searching for 'user'", async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const res = await request(app)
      .get('/api/users/search?query=user')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.body.users.length).toBeGreaterThan(1);
  });

  test('responds with several users when searching for string in all emails', async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const res = await request(app)
      .get('/api/users/search?query=email')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.body.users.length).toBeGreaterThan(1);
  });

  test("responds with users' firstName when user found", async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const res = await request(app)
      .get('/api/users/search?query=email')
      .set('Authorization', `Bearer ${user1Token}`);

    for (const user of res.body.users) {
      expect(user).toHaveProperty('firstName');
    }
  });

  test("responds with users' lastName when user found", async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const res = await request(app)
      .get('/api/users/search?query=email')
      .set('Authorization', `Bearer ${user1Token}`);

    for (const user of res.body.users) {
      expect(user).toHaveProperty('lastName');
    }
  });

  test("responds with users' email when user found", async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const res = await request(app)
      .get('/api/users/search?query=email')
      .set('Authorization', `Bearer ${user1Token}`);

    for (const user of res.body.users) {
      expect(user).toHaveProperty('email');
    }
  });

  test("responds without users' password when user found", async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const res = await request(app)
      .get('/api/users/search?query=email')
      .set('Authorization', `Bearer ${user1Token}`);

    for (const user of res.body.users) {
      expect(user).not.toHaveProperty('password');
    }
  });

  test("responds without users' friends array when user found", async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const res = await request(app)
      .get('/api/users/search?query=email')
      .set('Authorization', `Bearer ${user1Token}`);

    for (const user of res.body.users) {
      expect(user).not.toHaveProperty('friends');
    }
  });

  test('responds with array no longer than 10', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/users/search?query=email')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.body.users.length).not.toBeGreaterThan(10);
  });

  test('responds with remaining users when included in params', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/users/search?query=email&page=2&limit=10')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.body.users.length).toBe(2);
  });

  test('responds with empty array when requesting a page beyond the number of users', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/users/search?query=email&page=3&limit=10')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.body.users.length).toBe(0);
  });
});

describe('Get user route', () => {
  test('responds with 401 status when no token in header', async () => {
    const { _id: user1id } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const res = await request(app).get(`/api/users/${user1id}`);

    expect(res.status).toBe(401);
  });

  test('responds with error msg when no token in header', async () => {
    const { _id: user1id } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const res = await request(app).get(`/api/users/${user1id}`);

    expect(res.error.text).toContain('Not authorized, no token');
  });

  test('responds with 400 status when id provided is invalid', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get(`/api/users/a1b2c3`)
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.status).toBe(400);
  });

  test('responds with error msg when id provided is invalid', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get(`/api/users/a1b2c3`)
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.error.text).toContain('Invalid user ID');
  });

  test('responds with 200 status when provided id finds a user', async () => {
    const { _id: user1id } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get(`/api/users/${user1id}`)
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.status).toBe(200);
  });

  test('responds with 400 status when no user is found', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/users/615a8be41c2b20f6e47c256d')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.status).toBe(400);
  });

  test('responds with error msg when no user is found', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/users/615a8be41c2b20f6e47c256d')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.error.text).toContain('No user found');
  });

  test("responds with user's firstName when user found", async () => {
    const user1 = loggedInUsers.find((user) => user.firstName === 'User');

    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get(`/api/users/${user1._id}`)
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.body.user).toHaveProperty('firstName');
  });

  test("responds with user's lastName when user found", async () => {
    const user1 = loggedInUsers.find((user) => user.firstName === 'User');

    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get(`/api/users/${user1._id}`)
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.body.user).toHaveProperty('lastName');
  });

  test("responds with user's email when user found", async () => {
    const user1 = loggedInUsers.find((user) => user.firstName === 'User');

    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get(`/api/users/${user1._id}`)
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.body.user).toHaveProperty('email');
  });

  test("responds without user's password when user found", async () => {
    const user1 = loggedInUsers.find((user) => user.firstName === 'User');

    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get(`/api/users/${user1._id}`)
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.body.user).not.toHaveProperty('password');
  });

  test("responds without user's friends array when user found", async () => {
    const user1 = loggedInUsers.find((user) => user.firstName === 'User');

    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get(`/api/users/${user1._id}`)
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.body.user).not.toHaveProperty('friends');
  });

  test.skip('responds with user first name that matches id provided', async () => {
    const user1 = loggedInUsers.find((user) => user.firstName === 'User');

    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get(`/api/users/${user1._id}`)
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.body.user.firstName).toBe(user1.firstName);
  });

  test('responds with user last name that matches id provided', async () => {
    const user1 = loggedInUsers.find((user) => user.firstName === 'User');

    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get(`/api/users/${user1._id}`)
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.body.user.lastName).toBe(user1.lastName);
  });

  test('responds with user email that matches id provided', async () => {
    const user1 = loggedInUsers.find((user) => user.firstName === 'User');

    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get(`/api/users/${user1._id}`)
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.body.user.email).toBe(user1.email);
  });
});

describe('Get users route', () => {
  test('responds with 401 status when no token in header', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  test('responds with error msg when no token in header', async () => {
    const res = await request(app).get('/api/users');
    expect(res.error.text).toContain('Not authorized, no token');
  });

  test('responds with 400 status when limit query in url is not integer', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/users?page=2&limit=5.5')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.status).toBe(400);
  });

  test('responds with 400 status when limit query in url is not integer', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/users?page=2&limit=5.5')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.error.text).toContain('Limit must be an integer');
  });

  test('responds with 400 status when page query in url is not integer', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/users?page=2.3&limit=10')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.status).toBe(400);
  });

  test('responds with 400 status when page query in url is not integer', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/users?page=2.3&limit=10')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.error.text).toContain('Page must be an integer');
  });

  test('responds with 200 status when token in header', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.status).toBe(200);
  });

  test('responds with array of users when token in header', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(Array.isArray(res.body.users)).toBe(true);
  });

  test("responds with users' firstName when user found", async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${user1Token}`);

    for (const user of res.body.users) {
      expect(user).toHaveProperty('firstName');
    }
  });

  test("responds with users' lastName when user found", async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${user1Token}`);

    for (const user of res.body.users) {
      expect(user).toHaveProperty('lastName');
    }
  });

  test("responds with users' email when user found", async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${user1Token}`);

    for (const user of res.body.users) {
      expect(user).toHaveProperty('email');
    }
  });

  test("responds without users' password when user found", async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${user1Token}`);

    for (const user of res.body.users) {
      expect(user).not.toHaveProperty('password');
    }
  });

  test("responds without users' friends array when user found", async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${user1Token}`);

    for (const user of res.body.users) {
      expect(user).not.toHaveProperty('friends');
    }
  });

  test('responds with array no longer than 10', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.body.users.length).not.toBeGreaterThan(10);
  });

  test('responds with remaining users when included in params', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/users?page=2&limit=10')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.body.users.length).toBe(2);
  });

  test('responds with empty array when requesting a page beyond the number of users', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/users?page=3&limit=10')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.body.users.length).toBe(0);
  });
});
