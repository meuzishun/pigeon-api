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

describe('Get rooms routes', () => {
  test('exists', async () => {
    const res = await request(app).get('/api/rooms');
    expect(res.status).not.toBe(404);
  });

  test('responds with 200 status when token in header', async () => {
    const { token: debbieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Debbie'
    );

    const res = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${debbieToken}`);

    expect(res.status).toBe(200);
  });

  test('responds with 401 error when no token in header', async () => {
    const res = await request(app).get('/api/rooms');
    expect(res.status).toBe(401);
  });

  test('responds with error msg when no token in header', async () => {
    const res = await request(app).get('/api/rooms');
    expect(res.error.text).toContain('Not authorized, no token');
  });

  test('responds with an array when user is signed in', async () => {
    const { token: debbieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Debbie'
    );

    const res = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${debbieToken}`);

    expect(res.body.rooms).toBeInstanceOf(Array);
  });

  test('responds with empty array when there are no rooms', async () => {
    const { token: user4Token } = loggedInUsers.find(
      (user) => user.firstName === 'Fourth'
    );
    const res = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${user4Token}`);

    expect(res.body.rooms).toHaveLength(0);
  });

  test('responds with array of length 1 when only one room exists', async () => {
    const { token: user10token, _id: user10Id } = loggedInUsers.find(
      (user) => user.firstName === 'Tenth'
    );

    const res1 = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${user10token}`)
      .send({
        data: {
          name: 'test room',
        },
      });

    const res = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${user10token}`);

    expect(res.body.rooms.length).toBe(1);
  });
});

describe('New room route', () => {
  test('exists', async () => {
    const res = await request(app).post('/api/rooms');
    expect(res.status).not.toBe(404);
  });

  test('responds with 400 status when no body is sent', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.status).toBe(400);
  });

  test('responds with error msg when no body is sent', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.error.text).toContain('Room has no name');
  });

  //? not sure this test is needed
  test('responds with 400 status when no name is included', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.status).toBe(400);
  });

  //? not sure this test is needed
  test('responds with error msg when no name is included', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.error.text).toContain('Room has no name');
  });

  test('responds with 401 status when token is not included in header', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .send({
        data: {
          name: 'Hello world',
        },
      });

    expect(res.status).toBe(401);
  });

  test('responds with error msg when token is not included in header', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .send({
        data: {
          name: 'Hello world',
        },
      });

    expect(res.error.text).toContain('Not authorized, no token');
  });

  test('responds with 400 status when room name is empty', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${maggieToken}`)
      .send({
        data: {
          name: '',
        },
      });

    expect(res.status).toBe(400);
  });

  test('responds with 201 status when new room submission is successful', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${maggieToken}`)
      .send({
        data: {
          name: 'test room',
        },
      });

    expect(res.status).toBe(201);
  });

  test('responds with room when new room submission is successful', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${maggieToken}`)
      .send({
        data: {
          name: 'Test room',
        },
      });

    expect(res.body.room.name).toEqual('Test room');
  });
});

describe('Get room route', () => {
  test('exists', async () => {
    //! This is a strange test. If you don't include a legit-looking document id in the url, a 200 status is sent, bypassing any conditional checks in the controller. In short, may need to be rewritten or perhaps not included at all.
    const res = await request(app).get('/api/rooms/123');
    expect(res.status).not.toBe(404);
  });

  test('responds with 400 when room id is wrong format', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/rooms/123')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.status).toBe(400);
  });

  test('responds with error msg when room id is wrong format', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/rooms/123')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.error.text).toContain('Invalid room ID');
  });

  //? How can you honestly test for this? Maybe figure out which part of the id is the date? Maybe run this test with a cleared db?
  test('responds with 404 when room does not exist', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/rooms/615a8be41c2b20f6e47c256d')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.status).toBe(404);
  });

  //? How can you honestly test for this? Maybe figure out which part of the id is the date? Maybe run this test with a cleared db?
  test('responds with error msg when room does not exist', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const res = await request(app)
      .get('/api/rooms/615a8be41c2b20f6e47c256d')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.error.text).toContain('No room found with id');
  });

  test('responds with 401 when token not in header', async () => {
    const { token: debbieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Debbie'
    );

    const roomRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${debbieToken}`)
      .send({
        data: {
          name: 'Test room 1',
        },
      });

    const res = await request(app).get(`/api/rooms/${roomRes.body.room._id}`);

    expect(res.status).toBe(401);
  });

  test('responds with error msg when token not in header', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const roomRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${maggieToken}`)
      .send({
        data: {
          name: 'Test room 2',
        },
      });

    const res = await request(app).get(`/api/rooms/${roomRes.body.room._id}`);

    expect(res.error.text).toContain('Not authorized, no token');
  });

  test('responds with 200 when room exists', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const roomRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${maggieToken}`)
      .send({
        data: {
          name: 'I am ALIVE!!!',
        },
      });

    const res = await request(app)
      .get(`/api/rooms/${roomRes.body.room._id}`)
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.status).toBe(200);
  });

  test('responds with room when it exists', async () => {
    const { token: maggieToken, _id: maggieId } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const roomRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${maggieToken}`)
      .send({
        data: {
          name: 'Where am I?',
        },
      });

    const res = await request(app)
      .get(`/api/rooms/${roomRes.body.room._id}`)
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.body.room).toBeTruthy();
  });
});

describe('Edit room route', () => {
  test('responds with 401 when no token in header', async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const roomToBeEditedRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        data: {
          name: 'I am a room name to be edited',
        },
      });

    const roomId = roomToBeEditedRes.body.room._id;
    const res = await request(app)
      .put(`/api/rooms/${roomId}`)
      .send({ data: { name: 'I am an edited room name' } });

    expect(res.status).toBe(401);
  });

  test('responds with error msg when no token in header', async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const roomToBeEditedRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        data: {
          name: 'I am a room name to be edited',
        },
      });

    const roomId = roomToBeEditedRes.body.room._id;
    const res = await request(app)
      .put(`/api/rooms/${roomId}`)
      .send({ data: { name: 'I am an edited room name' } });

    expect(res.error.text).toContain('Not authorized, no token');
  });

  test('responds with 404 when no room exists', async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const roomId = '615a8be41c2b20f6e47c256d';
    const res = await request(app)
      .put(`/api/rooms/${roomId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ data: { name: 'I am an edited room name' } });

    expect(res.status).toBe(404);
  });

  test('responds with error msg when no room exists', async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const roomId = '615a8be41c2b20f6e47c256d';
    const res = await request(app)
      .put(`/api/rooms/${roomId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ data: { name: 'I am an edited room name' } });

    expect(res.error.text).toContain('Room not found');
  });

  test('responds with 400 when room data is not sent', async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const roomToBeEditedRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        data: {
          name: 'I am a room that will still be here',
        },
      });

    const roomId = roomToBeEditedRes.body.room._id;
    const res = await request(app)
      .put(`/api/rooms/${roomId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(400);
  });

  test('responds with error msg when room data is not sent', async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const roomToBeEditedRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        data: {
          name: 'I am also a room that will still be here',
        },
      });

    const roomId = roomToBeEditedRes.body.room._id;

    const res = await request(app)
      .put(`/api/rooms/${roomId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.error.text).toContain('Room has no name');
  });

  test('responds with 201 when new room is submitted', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const roomToBeEditedRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${maggieToken}`)
      .send({
        data: {
          name: 'I am a room to be edited',
        },
      });

    const roomId = roomToBeEditedRes.body.room._id;
    const res = await request(app)
      .put(`/api/rooms/${roomId}`)
      .set('Authorization', `Bearer ${maggieToken}`)
      .send({ data: { name: 'I am an edited room name' } });

    expect(res.status).toBe(201);
  });

  test('responds with new room when edit is successful', async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const roomToBeEditedRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        data: {
          name: 'I am a bad room name to be edited',
        },
      });

    const roomId = roomToBeEditedRes.body.room._id;

    const res = await request(app)
      .put(`/api/rooms/${roomId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ data: { name: 'I am an awesome edited room name' } });

    expect(res.body.room.name).toBe('I am an awesome edited room name');
  });

  test('causes getRoom route to respond with 200 when editRoom route is successful', async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const roomToBeEditedRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        data: {
          name: 'I am a room name to be edited and then retrieved',
        },
      });

    const roomId = roomToBeEditedRes.body.room._id;
    await request(app)
      .put(`/api/rooms/${roomId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        data: {
          name: 'I am an edited room name but I will be retrieved later',
        },
      });

    const res = await request(app)
      .get(`/api/rooms/${roomId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
  });

  test('causes getRoom route to respond with correct room name when editRoom is successful', async () => {
    const { token: user3Token } = loggedInUsers.find(
      (user) => user.firstName === 'Third'
    );

    const roomToBeEditedRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${user3Token}`)
      .send({
        data: {
          name: 'I am another room name to be edited and then retrieved',
        },
      });

    const roomId = roomToBeEditedRes.body.room._id;
    await request(app)
      .put(`/api/rooms/${roomId}`)
      .set('Authorization', `Bearer ${user3Token}`)
      .send({
        data: {
          name: 'I am another edited room name but I will also be retrieved later',
        },
      });

    const res = await request(app)
      .get(`/api/rooms/${roomId}`)
      .set('Authorization', `Bearer ${user3Token}`);

    expect(res.body.room.name).toBe(
      'I am another edited room name but I will also be retrieved later'
    );
  });
});

describe('Delete room route', () => {
  test('responds with 401 when no token in header', async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const roomRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        data: {
          name: 'I am a bad room to be deleted',
        },
      });

    const res = await request(app).delete(
      `/api/rooms/${roomRes.body.room._id}`
    );

    expect(res.status).toBe(401);
  });

  test('responds with error msg when no token in header', async () => {
    const { token: user2Token } = loggedInUsers.find(
      (user) => user.firstName === 'Second'
    );

    const roomRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        data: {
          name: 'I am a bad room to be deleted',
        },
      });

    const res = await request(app).delete(
      `/api/rooms/${roomRes.body.room._id}`
    );

    expect(res.error.text).toContain('Not authorized, no token');
  });

  test('responds with 400 status when roomId is invalid', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${maggieToken}`)
      .send({
        data: {
          name: 'I am a bad room to be deleted',
        },
      });

    const res = await request(app)
      .delete('/api/rooms/123abc')
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.status).toBe(400);
  });

  test('responds with error msg when roomId is invalid', async () => {
    const { token: debbieToken } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${debbieToken}`)
      .send({
        data: {
          name: 'I am a bad room to be deleted',
        },
      });

    const res = await request(app)
      .delete('/api/rooms/123abc')
      .set('Authorization', `Bearer ${debbieToken}`);

    expect(res.error.text).toContain('Invalid room ID');
  });

  test('responds with 404 when no room exists', async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const roomId = '615a8be41c2b20f6e47c256d';

    const res = await request(app)
      .delete(`/api/rooms/${roomId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(404);
  });

  test('responds with error msg when no room exists', async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const roomId = '615a8be41c2b20f6e47c256d';

    const res = await request(app)
      .delete(`/api/rooms/${roomId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.error.text).toContain('No room found');
  });

  test('responds with 200 when room is successfully deleted', async () => {
    const { token: user1Token } = loggedInUsers.find(
      (user) => user.firstName === 'User'
    );

    const roomToBeDeletedRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        data: {
          name: 'I am a room that WILL be deleted',
        },
      });

    const res = await request(app)
      .delete(`/api/rooms/${roomToBeDeletedRes.body.room._id}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
  });

  test('responds with deleted room id when room is successfully deleted', async () => {
    const { token: user2Token } = loggedInUsers.find(
      (user) => user.firstName === 'Second'
    );

    const roomToBeDeletedRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        data: {
          name: 'I am a room that WILL be deleted',
        },
      });

    const res = await request(app)
      .delete(`/api/rooms/${roomToBeDeletedRes.body.room._id}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res.body.id).toContain(roomToBeDeletedRes.body.room._id);
  });

  test('causes getRoom to respond with 404 when deleted room id is attempted to be retrieved', async () => {
    const { token: user3Token } = loggedInUsers.find(
      (user) => user.firstName === 'Third'
    );

    const roomToBeDeletedRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${user3Token}`)
      .send({
        data: {
          name: 'I am a room that WILL be deleted',
        },
      });

    const delMsgRes = await request(app)
      .delete(`/api/rooms/${roomToBeDeletedRes.body.room._id}`)
      .set('Authorization', `Bearer ${user3Token}`);

    const res = await request(app)
      .get(`/api/rooms/${delMsgRes.body.id}`)
      .set('Authorization', `Bearer ${user3Token}`);

    expect(res.status).toBe(404);
  });

  test('causes getRoom to respond with error msg when deleted room is attempted to be retrieved', async () => {
    const { token: maggieToken } = loggedInUsers.find(
      (user) => user.firstName === 'Maggie'
    );

    const roomToBeDeletedRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${maggieToken}`)
      .send({
        data: {
          name: 'I am a message that WILL be deleted',
        },
      });

    const delMsgRes = await request(app)
      .delete(`/api/rooms/${roomToBeDeletedRes.body.room._id}`)
      .set('Authorization', `Bearer ${maggieToken}`);

    const res = await request(app)
      .get(`/api/rooms/${delMsgRes.body.id}`)
      .set('Authorization', `Bearer ${maggieToken}`);

    expect(res.error.text).toContain('No room found');
  });
});
