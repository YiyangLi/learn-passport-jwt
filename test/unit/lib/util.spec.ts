import {genPassword, validPassword, issueJWT} from '../../../src/lib/utils';
import {User} from '../../../src/models/User';

describe('genPassword', () => {
  it('generates a password', () => {
    const password = genPassword('foo');
    expect(password.hash.length).toBe(128);
    expect(password.salt.length).toBe(64);
  });
});

describe('validPassword', () => {
  it('returns true for a valid password', () => {
    const password = genPassword('foo');
    expect(validPassword('foo', password.hash, password.salt)).toBe(true);
  });

  it('return false for an invalid password', () => {
    const password = genPassword('foo');
    expect(validPassword('foo2', password.hash, password.salt)).toBe(false);
  });
});

describe('issueJWT', () => {
  const privateKey = process.env.PRIV_KEY!;
  let dateNowSpy: jest.SpyInstance;
  beforeAll(() => {
    dateNowSpy = jest
      .spyOn(Date, 'now')
      .mockImplementation(() => 1487076708000);
  });

  afterAll(() => {
    dateNowSpy.mockRestore();
  });

  it('generates token', () => {
    const user = {
      _id: '123',
    } as unknown as User;
    const token = issueJWT(user, privateKey);
    expect(token.expires).toBe('1d');
    expect(token.token).toBe(
      'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJpYXQiOjE0ODcwNzY3MDgwMDAsImV4cCI6MTQ4NzA3Njc5NDQwMH0.C658prOmfmvmUP_RyJFsE3dFtqOd35MY2iifxIUrc6VTb0ZBH2aKeolr9m-aIOValnFOzj71e6rO49teqOlJ45j1PRfA2FlBYIbngRzLxJt4Nt7N41-RtQ_dU6x9S6uge3m69MbocMalASTCFcnJ_JoyJVkl4QTQfG0F268_r7SX006IcnBE7JVQ6YJ3UFwhH49qVJRMBYIEkpY5DwG9-rHzsZt2Z1TApAyShcBQDv9D9RfBuo0Hu97DEUdrKcYvaue7O6sPPisrqVTuoGUKiB4xAx7U_T1DTmdig8ovbO6vWolabY7behYz2v8fq5Vgt6ypVc6E1fVbX5n1bIab8olN_KInb0j-u60R-gvv02gFyO6IRxE9uHmuvEgCCvxxeb15KhlWHDFDPXr9ibR0-XP23nrcDy-v-LKZKiNuBHqdQX-e1vv8IvhijRWw_H_5SDH0vT9dn-Gv7U4Xzu4-_Pmg8bDTg9mOFwhQelYBdy9aSzZZ09dnq3f-gP0bqBz_qzasDh9RHvYpcGHVRI9pI5bI3T-tRC3-vYmKD3hhPY6uMq2_gsFyLd_vcu1TBaJDggReSIzeEJvHAzS5klNobrJd1VwUvV2-Dpb9B136_oRm43Z9dLfLyxHicqpB9gLV9bQ1LStb_DAsbJ1kKHI1ZAkxMndEVZ2cqEbEGket4j0'
    );
  });
});
