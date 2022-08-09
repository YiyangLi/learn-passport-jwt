// eslint-disable-next-line node/no-unpublished-import
import request from 'supertest';
import app from '../src/app';

it('Hello world', async () => {
  const result = await request(app).get('/');
  expect(result.text).toBe('Hello World!');
});
