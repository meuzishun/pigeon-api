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
  loggedInUsers = await registerUsers(mockUsers);
});

afterAll(async () => {
  await disconnectMongoServer();
});

describe('Get contacts route', () => {
  test('responds with 401 when user not signed in', async () => {
    const res = await request(app).get('/api/contacts');
    expect(res.status).toBe(401);
  });

  test('responds with error msg when user not signed in', async () => {
    const res = await request(app).get('/api/contacts');
    expect(res.error.text).toContain('Not authorized, no token');
  });

  test('responds with 200 status when user is signed in', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/contacts')
      .set('authorization', `Bearer ${maggieToken}`);

    expect(res.status).toBe(200);
  });

  test('responds with empty array when user has no contacts', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/contacts')
      .set('authorization', `Bearer ${maggieToken}`);

    expect(res.body.contacts).toHaveLength(0);
  });

  test('responds with correct array of users', async () => {
    const { token: user3Token } = loggedInUsers.find(
      (user) => user.firstName === 'Third'
    );

    const user1 = loggedInUsers.find((user) => user.firstName === 'User');

    const user2 = loggedInUsers.find((user) => user.firstName === 'Second');

    await request(app)
      .put('/api/contacts')
      .set('authorization', `Bearer: ${user3Token}`)
      .send({ contactId: user1._id });

    await request(app)
      .put('/api/contacts')
      .set('authorization', `Bearer: ${user3Token}`)
      .send({ contactId: user2._id });

    const res = await request(app)
      .get('/api/contacts')
      .set('authorization', `Bearer ${user3Token}`);

    const resFirstNames = res.body.contacts.map((contact) => contact.firstName);
    const resLastNames = res.body.contacts.map((contact) => contact.lastName);
    const resEmails = res.body.contacts.map((contact) => contact.email);
    const resIds = res.body.contacts.map((contact) => contact._id);

    expect(resFirstNames).toContain(user1.firstName);
    expect(resFirstNames).toContain(user2.firstName);
    expect(resLastNames).toContain(user1.lastName);
    expect(resLastNames).toContain(user2.lastName);
    expect(resEmails).toContain(user1.email);
    expect(resEmails).toContain(user2.email);
    expect(resIds).toContain(user1._id);
    expect(resIds).toContain(user2._id);
  });

  test("responds with contact's first names", async () => {
    const { token: user3Token } = loggedInUsers.find(
      (user) => user.firstName === 'Third'
    );

    const res = await request(app)
      .get('/api/contacts')
      .set('authorization', `Bearer ${user3Token}`);

    const firstNames = res.body.contacts.map((contact) => contact.firstName);
    expect(firstNames).toContain('User');
    expect(firstNames).toContain('Second');
  });

  test("responds with contact's last names", async () => {
    const { token: user3Token } = loggedInUsers.find(
      (user) => user.firstName === 'Third'
    );

    const res = await request(app)
      .get('/api/contacts')
      .set('authorization', `Bearer ${user3Token}`);

    const lastNames = res.body.contacts.map((contact) => contact.lastName);
    expect(lastNames).toContain('One');
    expect(lastNames).toContain('Dude');
  });

  test("responds with contact's email", async () => {
    const { token: user3Token } = loggedInUsers.find(
      (user) => user.firstName === 'Third'
    );

    const res = await request(app)
      .get('/api/contacts')
      .set('authorization', `Bearer ${user3Token}`);

    const emails = res.body.contacts.map((contact) => contact.email);
    expect(emails).toContain('user1@email.com');
    expect(emails).toContain('user2@email.com');
  });

  test("responds without contact's password", async () => {
    const { token: user3Token } = loggedInUsers.find(
      (user) => user.firstName === 'Third'
    );

    const res = await request(app)
      .get('/api/contacts')
      .set('authorization', `Bearer ${user3Token}`);

    const passwords = res.body.contacts.reduce((array, contact) => {
      return contact.password ? contact.password : array;
    }, []);

    expect(passwords).toHaveLength(0);
  });

  test("responds without contact's friends", async () => {
    const { token: user3Token } = loggedInUsers.find(
      (user) => user.firstName === 'Third'
    );

    const res = await request(app)
      .get('/api/contacts')
      .set('authorization', `Bearer ${user3Token}`);

    const friends = res.body.contacts.reduce((array, contact) => {
      return contact.friends ? contact.friends : array;
    }, []);

    expect(friends).toHaveLength(0);
  });
});

describe('Add contacts route', () => {
  test('responds with 401 when user not signed in', async () => {
    const maggieUser = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .put('/api/contacts')
      .send({ contactId: maggieUser._id });

    expect(res.status).toBe(401);
  });

  test('responds with error msg when user not signed in', async () => {
    const maggieUser = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .put('/api/contacts')
      .send({ contactId: maggieUser._id });

    expect(res.error.text).toContain('Not authorized, no token');
  });

  test('responds with 400 status when contact id is not valid mongo id', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .put('/api/contacts')
      .set('authorization', `Bearer ${maggieToken}`)
      .send({ contactId: '1234abcd' });

    expect(res.status).toBe(400);
  });

  test('responds with error msg when contact id is not valid mongo id', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .put('/api/contacts')
      .set('authorization', `Bearer ${maggieToken}`)
      .send({ contactId: '1234abcd' });

    expect(res.error.text).toContain('Invalid contact ID');
  });

  test('responds with 400 status when contact id is same a logged in user id', async () => {
    const maggieUser = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .put('/api/contacts')
      .set('authorization', `Bearer ${maggieUser.token}`)
      .send({ contactId: `${maggieUser._id}` });

    expect(res.status).toBe(400);
  });

  test('responds with error msg when contact id is same a logged in user id', async () => {
    const maggieUser = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .put('/api/contacts')
      .set('authorization', `Bearer ${maggieUser.token}`)
      .send({ contactId: `${maggieUser._id}` });

    expect(res.error.text).toContain('Invalid contact ID');
  });

  test('responds with 201 status when user is signed in', async () => {
    const maggieUser = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const { token: debbieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Debbie'
    );

    const res = await request(app)
      .put('/api/contacts')
      .set('authorization', `Bearer ${debbieToken}`)
      .send({ contactId: maggieUser._id });

    expect(res.status).toBe(201);
  });

  test('responds with updated friends list', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const debbieUser = loggedInUsers.find(
      (user) => user.firstName === 'Debbie'
    );

    const res = await request(app)
      .put('/api/contacts')
      .set('authorization', `Bearer ${maggieToken}`)
      .send({ contactId: debbieUser._id });

    expect(res.body.contacts.map((contact) => contact._id)).toContain(
      debbieUser._id
    );
  });

  test('get request has updated friends list after contact added', async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const user2 = loggedInUsers.find((user) => user.firstName === 'Second');

    await request(app)
      .put('/api/contacts')
      .set('authorization', `Bearer ${user1Token}`)
      .send({ contactId: user2._id });

    const res = await request(app)
      .get('/api/contacts')
      .set('authorization', `Bearer ${user1Token}`);

    expect(res.body.contacts.map((contact) => contact._id)).toContain(
      user2._id
    );
  });

  test('responds with 400 status when contact id is already a contact', async () => {
    const maggieUser = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const { token: debbieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Debbie'
    );

    const res = await request(app)
      .put('/api/contacts')
      .set('authorization', `Bearer ${debbieToken}`)
      .send({ contactId: maggieUser._id });

    expect(res.status).toBe(400);
  });

  test('responds with error msg when contact id is already a contact', async () => {
    const maggieUser = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const { token: debbieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Debbie'
    );

    const res = await request(app)
      .put('/api/contacts')
      .set('authorization', `Bearer ${debbieToken}`)
      .send({ contactId: maggieUser._id });

    expect(res.error.text).toContain('Contact already listed');
  });
});

describe('Get contact route', () => {
  test('responds with 401 when user not signed in', async () => {
    const user1 = loggedInUsers.find((user) => user.firstName === 'User');
    const res = await request(app).get(`/api/contacts/${user1._id}`);
    expect(res.status).toBe(401);
  });

  test('responds with error msg when user not signed in', async () => {
    const user1 = loggedInUsers.find((user) => user.firstName === 'User');
    const res = await request(app).get(`/api/contacts/${user1._id}`);
    expect(res.error.text).toContain('Not authorized, no token');
  });

  test('responds with 400 status when contact id is not valid mongo id', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/contacts/1234abcd')
      .set('authorization', `Bearer ${maggieToken}`);

    expect(res.status).toBe(400);
  });

  test('responds with error msg when contact id is not valid mongo id', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/contacts/1234abcd')
      .set('authorization', `Bearer ${maggieToken}`);

    expect(res.error.text).toContain('Invalid contact ID');
  });

  test('responds with 400 status when user is not friends with contact', async () => {
    const user1 = loggedInUsers.find((user) => user.firstName === 'User');
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get(`/api/contacts/${user1._id}`)
      .set('authorization', `Bearer ${maggieToken}`);

    expect(res.status).toBe(400);
  });

  test('responds with error msg when user is not friends with contact', async () => {
    const user1 = loggedInUsers.find((user) => user.firstName === 'User');
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get(`/api/contacts/${user1._id}`)
      .set('authorization', `Bearer ${maggieToken}`);

    expect(res.error.text).toContain('Contact not friend');
  });

  test('responds with 200 status when contact is found', async () => {
    const user1 = loggedInUsers.find((user) => user.firstName === 'User');

    const { token: user3Token } = loggedInUsers.find(
      (user) => user.firstName === 'Third'
    );

    const newUser1 = await request(app)
      .get('/api/profile')
      .set('authorization', `Bearer ${user1.token}`);

    const res = await request(app)
      .get(`/api/contacts/${user1._id}`)
      .set('authorization', `Bearer ${user3Token}`);

    expect(res.status).toBe(200);
  });

  test('responds with user when contact is found', async () => {
    const user1 = loggedInUsers.find((user) => user.firstName === 'User');

    const { token: user3Token } = loggedInUsers.find(
      (user) => user.firstName === 'Third'
    );

    const newUser1 = await request(app)
      .get('/api/profile')
      .set('authorization', `Bearer ${user1.token}`);

    const res = await request(app)
      .get(`/api/contacts/${user1._id}`)
      .set('authorization', `Bearer ${user3Token}`);

    expect(res.body.contact.firstName).toEqual(newUser1.body.user.firstName);
    expect(res.body.contact.lastName).toEqual(newUser1.body.user.lastName);
    expect(res.body.contact.email).toEqual(newUser1.body.user.email);
    expect(res.body.contact._id).toEqual(newUser1.body.user._id);
  });

  test('responds without user password when contact is found', async () => {
    const user1 = loggedInUsers.find((user) => user.firstName === 'User');

    const { token: user3Token } = loggedInUsers.find(
      (user) => user.firstName === 'Third'
    );

    const res = await request(app)
      .get(`/api/contacts/${user1._id}`)
      .set('authorization', `Bearer ${user3Token}`);

    expect(res.body.contact).not.toHaveProperty('password');
  });

  test('responds without user friends when contact is found', async () => {
    const user1 = loggedInUsers.find((user) => user.firstName === 'User');

    const { token: user3Token } = loggedInUsers.find(
      (user) => user.firstName === 'Third'
    );

    const res = await request(app)
      .get(`/api/contacts/${user1._id}`)
      .set('authorization', `Bearer ${user3Token}`);

    expect(res.body.contact).not.toHaveProperty('friends');
  });
});

describe('Delete contacts route', () => {
  test('responds with 401 when user not signed in', async () => {
    const res = await request(app).delete('/api/contacts/:contactId');
    expect(res.status).toBe(401);
  });

  test('responds with error msg when user not signed in', async () => {
    const res = await request(app).delete('/api/contacts/:contactId');
    expect(res.error.text).toContain('Not authorized, no token');
  });

  test('responds with 400 status when user is not friends with contact', async () => {
    const user1 = loggedInUsers.find((user) => user.firstName === 'User');
    const { token: user2Token } = loggedInUsers.find(
      (user) => user.firstName === 'Second'
    );

    const res = await request(app)
      .delete(`/api/contacts/${user1._id}`)
      .set('authorization', `Bearer ${user2Token}`);

    expect(res.status).toBe(400);
  });

  test('responds with 400 status when contact id is not valid mongo id', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .delete('/api/contacts/1234abcd')
      .set('authorization', `Bearer ${maggieToken}`);

    expect(res.status).toBe(400);
  });

  test('responds with error msg when contact id is not valid mongo id', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .delete('/api/contacts/1234abcd')
      .set('authorization', `Bearer ${maggieToken}`);

    expect(res.error.text).toContain('Invalid contact ID');
  });

  test('responds with error msg when user is not friends with contact', async () => {
    const user1 = loggedInUsers.find((user) => user.firstName === 'User');
    const { token: user2Token } = loggedInUsers.find(
      (user) => user.firstName === 'Second'
    );

    const res = await request(app)
      .delete(`/api/contacts/${user1._id}`)
      .set('authorization', `Bearer ${user2Token}`);

    expect(res.error.text).toContain('Contact not friend');
  });

  test('responds with 201 status when contact is removed', async () => {
    const user2 = loggedInUsers.find((user) => user.firstName === 'Second');
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const res = await request(app)
      .delete(`/api/contacts/${user2._id}`)
      .set('authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(201);
  });

  test('responds with altered friend list when contact is removed', async () => {
    const debbieUser = loggedInUsers.find(
      (user) => user.firstName === 'Debbie'
    );

    const user1 = loggedInUsers.find((user) => user.firstName === 'User');

    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    await request(app)
      .put('/api/contacts')
      .set('authorization', `Bearer ${maggieToken}`)
      .send({ contactId: `${user1._id}` });

    const preRes = await request(app)
      .get('/api/contacts')
      .set('authorization', `Bearer ${maggieToken}`);

    expect(preRes.body.contacts.map((contact) => contact._id)).toContain(
      debbieUser._id
    );

    expect(preRes.body.contacts.map((contact) => contact._id)).toContain(
      user1._id
    );

    const res = await request(app)
      .delete(`/api/contacts/${debbieUser._id}`)
      .set('authorization', `Bearer ${maggieToken}`);

    expect(res.body.contacts.map((contact) => contact._id)).not.toContain(
      debbieUser._id
    );

    expect(res.body.contacts.map((contact) => contact._id)).toContain(
      user1._id
    );
  });
});
