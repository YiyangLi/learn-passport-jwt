import {randomUUID} from 'crypto';
// eslint-disable-next-line node/no-unpublished-import
import request from 'supertest';
import app from '../../../src/app';
import {User} from '../../../src/models/types';

const apiPrefix = '/api/v1/users';
const passwords = {
  david: 'teamplayer',
  jeff: 'manager',
  admin: 'admin',
};
describe('userRoutes', () => {
  async function getTokenForUser(
    username: 'david' | 'jeff' | 'admin'
  ): Promise<string> {
    const password = passwords[username];
    const response = await request(app).post('/login').type('form').send({
      username,
      password,
    });
    const cookies = response.headers['set-cookie'][0]
      .split(',')
      .map((item: string) => item.split(';')[0]);
    const cookie = cookies.join(';');
    const tokenResponse = await request(app)
      .get('/token')
      .set('Cookie', cookie);
    return tokenResponse.body.token;
  }

  describe('as a manager', () => {
    let token = '';
    beforeEach(async () => {
      token = await getTokenForUser('jeff');
    });

    it('get all users return themselves only', async () => {
      const response = await request(app)
        .get(apiPrefix)
        .set('Accept', 'application/json')
        .set('Authorization', token);
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      const userIds = (response.body as [{id: string}]).map(user => user.id);
      expect(userIds).toEqual([
        '62f18e9514cdfe460b4aef3c',
        '62f18e9514cdfe460b4aef3d',
      ]);
    });

    it('get themselves by user id', async () => {
      const response = await request(app)
        .get(`${apiPrefix}/62f18e9514cdfe460b4aef3d`)
        .set('Accept', 'application/json')
        .set('Authorization', token);
      expect(response.status).toBe(200);
      const user = response.body as User;
      expect((user as unknown as {id: string}).id).toBe(
        '62f18e9514cdfe460b4aef3d'
      );
      expect(user.manager).toBe('jeff');
      expect(user.tShirtSize.length).toBe(1);
      expect(user.username).toBe('david');
      expect(user.members).toEqual([]);
    });

    it('get another user not accessiable to them', async () => {
      const response = await request(app)
        .get(`${apiPrefix}/62f18e9514cdfe460b4aef3b`)
        .set('Accept', 'application/json')
        .set('Authorization', token);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'Not Authorized',
      });
    });

    it('update t-shirt size', async () => {
      const response = await request(app)
        .put(`${apiPrefix}/62f18e9514cdfe460b4aef3d`)
        .set('Accept', 'application/json')
        .send({
          id: '62f18e9514cdfe460b4aef3d',
          manager: 'jeff',
          members: [],
          tShirtSize: 'L',
          random: 'foo',
        })
        .set('Authorization', token);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: '62f18e9514cdfe460b4aef3d',
        manager: 'jeff',
        members: [],
        tShirtSize: 'L',
        username: 'david',
      });
    });

    it('create not allowed', async () => {
      const response = await request(app)
        .post(`${apiPrefix}`)
        .set('Accept', 'application/json')
        .set('Authorization', token)
        .send({
          username: randomUUID(),
          password: randomUUID(),
        });
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'Not Authorized',
      });
    });

    it('delete not allowed', async () => {
      const response = await request(app)
        .delete(`${apiPrefix}/62f18e9514cdfe460b4aef3d`)
        .set('Accept', 'application/json')
        .set('Authorization', token);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'Not Authorized',
      });
    });
  });

  describe('as a user', () => {
    let token = '';
    beforeEach(async () => {
      token = await getTokenForUser('david');
    });

    it('get all users return themselves only', async () => {
      const response = await request(app)
        .get(apiPrefix)
        .set('Accept', 'application/json')
        .set('Authorization', token);
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      const user = response.body[0] as User;
      expect((user as unknown as {id: string}).id).toBe(
        '62f18e9514cdfe460b4aef3d'
      );
      expect(user.manager).toBe('jeff');
      expect(user.tShirtSize.length).toBe(1);
      expect(user.username).toBe('david');
      expect(user.members).toEqual([]);
    });

    it('get themselves by user id', async () => {
      const response = await request(app)
        .get(`${apiPrefix}/62f18e9514cdfe460b4aef3d`)
        .set('Accept', 'application/json')
        .set('Authorization', token);
      expect(response.status).toBe(200);
      const user = response.body as User;
      expect((user as unknown as {id: string}).id).toBe(
        '62f18e9514cdfe460b4aef3d'
      );
      expect(user.manager).toBe('jeff');
      expect(user.tShirtSize.length).toBe(1);
      expect(user.username).toBe('david');
      expect(user.members).toEqual([]);
    });

    it('get another user not accessiable to them', async () => {
      const response = await request(app)
        .get(`${apiPrefix}/62f18e9514cdfe460b4aef3c`)
        .set('Accept', 'application/json')
        .set('Authorization', token);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'Not Authorized',
      });
    });

    it('update t-shirt size', async () => {
      const response = await request(app)
        .put(`${apiPrefix}/62f18e9514cdfe460b4aef3d`)
        .set('Accept', 'application/json')
        .send({
          id: '62f18e9514cdfe460b4aef3d',
          manager: 'jeff',
          members: [],
          tShirtSize: 'L',
          random: 'foo',
        })
        .set('Authorization', token);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: '62f18e9514cdfe460b4aef3d',
        manager: 'jeff',
        members: [],
        tShirtSize: 'L',
        username: 'david',
      });
    });

    it('update another person is not allowed', async () => {
      const response = await request(app)
        .put(`${apiPrefix}/62f18e9514cdfe460b4aef3c`)
        .set('Accept', 'application/json')
        .send({
          id: '62f18e9514cdfe460b4aef3c',
          tShirtSize: 'L',
          random: 'foo',
        })
        .set('Authorization', token);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'Not Authorized',
      });
    });

    it('create not allowed', async () => {
      const response = await request(app)
        .post(`${apiPrefix}`)
        .set('Accept', 'application/json')
        .set('Authorization', token)
        .send({
          username: randomUUID(),
          password: randomUUID(),
        });
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'Not Authorized',
      });
    });

    it('delete not allowed', async () => {
      const response = await request(app)
        .delete(`${apiPrefix}/62f18e9514cdfe460b4aef3d`)
        .set('Accept', 'application/json')
        .set('Authorization', token);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'Not Authorized',
      });
    });
  });

  describe('as a admin', () => {
    let token = '';
    beforeEach(async () => {
      token = await getTokenForUser('admin');
    });

    it('get all users return themselves only', async () => {
      const response = await request(app)
        .get(apiPrefix)
        .set('Accept', 'application/json')
        .set('Authorization', token);
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
      const expectedIds = [
        '62f18e9514cdfe460b4aef3c',
        '62f18e9514cdfe460b4aef3d',
        '62f18e9514cdfe460b4aef3b',
      ];
      (response.body as [{id: string}]).every(user => {
        return expectedIds.includes(user.id);
      });
    });

    it('get another user', async () => {
      const response = await request(app)
        .get(`${apiPrefix}/62f18e9514cdfe460b4aef3c`)
        .set('Accept', 'application/json')
        .set('Authorization', token);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe('62f18e9514cdfe460b4aef3c');
    });

    it('update t-shirt size', async () => {
      const username = randomUUID();
      const password = randomUUID();
      const response = await request(app)
        .post(`${apiPrefix}`)
        .set('Accept', 'application/json')
        .set('Authorization', token)
        .send({
          username,
          password,
          tShirtSize: 'S',
        });

      const updateResponse = await request(app)
        .put(`${apiPrefix}/${response.body.id}`)
        .set('Accept', 'application/json')
        .send({
          tShirtSize: 'L',
        })
        .set('Authorization', token);
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.tShirtSize).toEqual('L');
    });

    it('create is allowed', async () => {
      const username = randomUUID();
      const password = randomUUID();
      const response = await request(app)
        .post(`${apiPrefix}`)
        .set('Accept', 'application/json')
        .set('Authorization', token)
        .send({
          username,
          password,
        });
      expect(response.status).toBe(200);
      expect(response.body.username).toEqual(username);
      expect(response.body.password).not.toEqual(password);
    });

    it('delete is allowed', async () => {
      const response = await request(app)
        .post(`${apiPrefix}`)
        .set('Accept', 'application/json')
        .set('Authorization', token)
        .send({
          username: randomUUID(),
          password: randomUUID(),
          manager: '',
          members: [],
          tShirtSize: 'XXL',
        });
      const user = response.body as {id: string};
      const deleteResponse = await request(app)
        .delete(`${apiPrefix}/${user.id.toString()}`)
        .set('Accept', 'application/json')
        .set('Authorization', token);
      expect(deleteResponse.status).toBe(204);
    });
  });
});
