// eslint-disable-next-line node/no-unpublished-import
import request from 'supertest';
import app from '../../../src/app';

describe('authRoute', () => {
  describe('/login', () => {
    it('GET without session', async () => {
      const response = await request(app).get('/login');
      expect(response.status).toBe(200);
      expect(response.text).toContain('<h1>Login Page</h1>');
    });

    it('POST /login successfully', async () => {
      const login = await request(app).post('/login').type('form').send({
        username: 'david',
        password: 'teamplayer',
      });

      expect(login.status).toBe(302);
      expect(login.text).toContain('Redirecting to /login-success');
    });

    it('GET with a session', async () => {
      let cookie = '';
      await request(app)
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
          cookie = cookies.join(';');
        });
      const response = await request(app).get('/login').set('Cookie', cookie);
      expect(response.status).toBe(302);
      expect(response.text).toBe('Found. Redirecting to /login-success');
    });

    it('POST /login with a wrong password', async () => {
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
      expect(response.body.message).toBe(
        'You are not authorized to view this resource'
      );
    });

    it('GET with a session', async () => {
      let cookie = '';
      await request(app)
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
          cookie = cookies.join(';');
        });
      const response = await request(app).get('/token').set('Cookie', cookie);
      expect(response.status).toBe(200);
      const json = response.body;
      expect(json.expires).toBe('1d');
      expect(json.token).toContain('Bearer ');
    });
  });

  it('GET /logout', async () => {
    request(app).get('/logout').expect(302).expect('Location', '/login');
  });
});
