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

describe('Get profile route', () => {
  test('to have status of 401 when no auth', async () => {
    const res = await request(app).get('/api/profile');
    expect(res.status).toBe(401);
  });

  test('to throw error when no auth', async () => {
    const res = await request(app).get('/api/profile');
    expect(res.error.text).toContain('Not authorized, no token');
  });

  test('to have status of 200 on success', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.status).toBe(200);
  });

  test('to respond with user data on success', async () => {
    const maggieUser = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${maggieUser.token}`);

    expect(res.body.user.firstName).toBe(maggieUser.firstName);
    expect(res.body.user.lastName).toBe(maggieUser.lastName);
    expect(res.body.user.email).toBe(maggieUser.email);
  });

  test('responds without password field', async () => {
    const maggieUser = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${maggieUser.token}`);

    expect(res.body.user.password).toBeFalsy();
  });
});

describe('Edit profile route', () => {
  test('to have status of 401 when no auth', async () => {
    const res = await request(app)
      .put('/api/profile')
      .send({ data: { firstName: 'Da Maggs' } });

    expect(res.status).toBe(401);
  });

  test('to throw error when no auth', async () => {
    const res = await request(app)
      .put('/api/profile')
      .send({ data: { firstName: 'Da Maggs' } });

    expect(res.error.text).toContain('Not authorized, no token');
  });

  test('to have status of 400 when no data sent', async () => {
    const maggieUser = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${maggieUser.token}`);

    expect(res.status).toBe(400);
  });

  test('to throw error msg when no data sent', async () => {
    const maggieUser = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${maggieUser.token}`);

    expect(res.error.text).toContain('No user data submitted');
  });

  test('to have status of 201 on successful first name change', async () => {
    const maggieUser = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${maggieUser.token}`)
      .send({ data: { firstName: 'Da Maggs' } });

    expect(res.status).toBe(201);
  });

  test('to respond with new user data on successful first name change', async () => {
    const debbieUser = loggedInUsers.find(
      (user) => user.firstName === 'Debbie'
    );

    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${debbieUser.token}`)
      .send({ data: { firstName: 'Deborah' } });

    expect(res.body.user.firstName).toBe('Deborah');
  });

  test('to have status of 200 on retrieval after first name change', async () => {
    const maggieUser = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${maggieUser.token}`)
      .send({ data: { firstName: 'Flubbles' } });

    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${maggieUser.token}`);

    expect(res.status).toBe(200);
  });

  test('to respond with new user first name on retrieval', async () => {
    const debbieUser = loggedInUsers.find(
      (user) => user.firstName === 'Debbie'
    );

    await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${debbieUser.token}`)
      .send({ data: { firstName: 'Deb' } });

    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${debbieUser.token}`);

    expect(res.body.user.firstName).toBe('Deb');
  });

  test('to have status of 201 on successful last name change', async () => {
    const user1 = loggedInUsers.find((user) => user.firstName === 'User');

    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${user1.token}`)
      .send({ data: { lastName: 'NumberOne' } });

    expect(res.status).toBe(201);
  });

  test('to respond with new user data on successful last name change', async () => {
    const user1 = loggedInUsers.find((user) => user.firstName === 'User');

    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${user1.token}`)
      .send({ data: { lastName: 'NumeroUno' } });

    expect(res.body.user.lastName).toBe('NumeroUno');
  });

  test('to have status of 200 on retrieval after last name change', async () => {
    const maggieUser = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${maggieUser.token}`)
      .send({ data: { lastName: 'Bubbles' } });

    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${maggieUser.token}`);

    expect(res.status).toBe(200);
  });

  test('to respond with new user last name on retrieval', async () => {
    const maggieUser = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${maggieUser.token}`)
      .send({ data: { lastName: 'Wubbles' } });

    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${maggieUser.token}`);

    expect(res.body.user.lastName).toBe('Wubbles');
  });

  test('to have status of 400 on bad email submit', async () => {
    const maggieUser = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${maggieUser.token}`)
      .send({ data: { email: 'asdfqwer' } });

    expect(res.status).toBe(400);
  });

  test('to respond with error msg on bad email submit', async () => {
    const maggieUser = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${maggieUser.token}`)
      .send({ data: { email: 'asdfqwer' } });

    expect(res.error.text).toContain('Please include a valid email');
  });

  test('to have status of 201 on successful email change', async () => {
    const maggieUser = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${maggieUser.token}`)
      .send({ data: { email: 'asdf@qwer.com' } });

    expect(res.status).toBe(201);
  });

  test('to respond with new user data on successful email change', async () => {
    const maggieUser = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${maggieUser.token}`)
      .send({ data: { email: 'qwer@asdf.com' } });

    expect(res.body.user.email).toBe('qwer@asdf.com');
  });

  test('to have status of 200 on retrieval after email change', async () => {
    const maggieUser = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${maggieUser.token}`)
      .send({ data: { email: 'damaggs@email.com' } });

    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${maggieUser.token}`);

    expect(res.status).toBe(200);
  });

  test('to respond with new user email on retrieval', async () => {
    const maggieUser = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${maggieUser.token}`)
      .send({ data: { email: 'maggs@email.com' } });

    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${maggieUser.token}`);

    expect(res.body.user.email).toBe('maggs@email.com');
  });

  test('responds without password field', async () => {
    const maggieUser = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${maggieUser.token}`)
      .send({ data: { firstName: 'Margo' } });

    expect(res.body.user.password).toBeFalsy();
  });
});

describe('Delete profile route', () => {
  test('to have status of 401 when no auth', async () => {
    const res = await request(app).delete('/api/profile');
    expect(res.status).toBe(401);
  });

  test('to throw error when no auth', async () => {
    const res = await request(app).delete('/api/profile');
    expect(res.error.text).toContain('Not authorized, no token');
  });

  test('to have 200 status on success', async () => {
    const maggieUser = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .delete('/api/profile')
      .set('Authorization', `Bearer ${maggieUser.token}`);

    expect(res.status).toBe(200);
  });

  test('to responds with deleted profile id', async () => {
    const debbieUser = loggedInUsers.find(
      (user) => user.firstName === 'Debbie'
    );

    const res = await request(app)
      .delete('/api/profile')
      .set('Authorization', `Bearer ${debbieUser.token}`);

    expect(res.body.id).toBe(debbieUser._id);
  });

  test('to have 401 status when attempting to retrieve', async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    await request(app)
      .delete('/api/profile')
      .set('Authorization', `Bearer ${user1Token}`);

    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(401);
  });

  test('to throw error when attempting to retrieve', async () => {
    const { token: user2Token } = loggedInUsers.find(
      (user) => user.firstName === 'Second'
    );

    await request(app)
      .delete('/api/profile')
      .set('Authorization', `Bearer ${user2Token}`);

    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res.error.text).toContain('Not authorized, no user found');
  });
});
