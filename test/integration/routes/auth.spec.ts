import {randomUUID} from 'crypto';
// eslint-disable-next-line node/no-unpublished-import
import request from 'supertest';
import app from '../../../src/app';

describe('authRoutes', () => {
  async function loginAsUser(): Promise<[request.Response, string]> {
    return await request(app)
      .post('/login')
      .type('form')
      .send({
        username: 'david',
        password: 'teamplayer',
      })
      .then(res => {
        const cookies = res.headers['set-cookie'][0]
          .split(',')
          .map((item: string) => item.split(';')[0]);
        const cookie = cookies.join(';');
        return [res, cookie];
      });
  }
  describe('/login', () => {
    it('GET without session', async () => {
      const response = await request(app).get('/login');
      expect(response.status).toBe(200);
      expect(response.text).toContain('<h1>Login Page</h1>');
    });

    it('POST /login successfully', async () => {
      const login = (await loginAsUser())[0];
      expect(login.status).toBe(302);
      expect(login.text).toContain('Redirecting to /login-success');
    });

    it('GET with a session', async () => {
      const cookie = (await loginAsUser())[1];
      const response = await request(app).get('/login').set('Cookie', cookie);
      expect(response.status).toBe(302);
      expect(response.text).toBe('Found. Redirecting to /login-success');
    });

    it('POST with a wrong password', async () => {
      const response = await request(app).post('/login').type('form').send({
        username: 'david',
        password: 'teamplayer2',
      });
      expect(response.status).toBe(302);
      expect(response.text).toContain('Found. Redirecting to /login-failure');
    });
  });

  describe('/token', () => {
    it('GET /token without a session', async () => {
      const response = await request(app).get('/token');
      expect(response.status).toBe(401);
      expect(response.text).toContain(
        '<div>You are not allowed to get a new token</div>'
      );
    });

    it('GET with a session', async () => {
      const cookie = (await loginAsUser())[1];
      const response = await request(app).get('/token').set('Cookie', cookie);
      expect(response.status).toBe(200);
      const json = response.body;
      expect(json.expires).toBe('1d');
      expect(json.token).toContain('Bearer ');
    });
  });

  describe('/register', () => {
    it('GET without a session', async () => {
      const response = await request(app).get('/register');
      expect(response.status).toBe(200);
      expect(response.text).toContain('<h1>Register</h1>');
    });

    it('GET with a session', async () => {
      const cookie = (await loginAsUser())[1];
      const response = await request(app)
        .get('/register')
        .set('Cookie', cookie);
      expect(response.status).toBe(200);
      expect(response.text).toContain('<div>You login as david </div>');
    });

    it('POST to register and login', async () => {
      const username = randomUUID();
      const password = randomUUID();
      const response = await request(app).post('/register').type('form').send({
        username,
        password,
        tShirtSize: 'XL',
        manager: 'jeff',
      });
      expect(response.status).toBe(200);
      expect(response.text).toContain('Registration done');
      const loginResponse = await request(app)
        .post('/login')
        .type('form')
        .send({
          username,
          password,
        });
      expect(loginResponse.status).toBe(302);
      expect(loginResponse.text).toContain('Redirecting to /login-success');
    });

    it('POST to register a duplicate user', async () => {
      const response = await request(app).post('/register').type('form').send({
        username: 'david',
        password: randomUUID(),
        tShirtSize: 'XL',
        manager: 'jeff',
      });
      expect(response.status).toBe(409);
      expect(response.text).toContain(
        'Duplicated username, please choose a different one.'
      );
    });
  });

  it('/logout GET', async () => {
    request(app).get('/logout').expect(302).expect('Location', '/login');
  });
});
