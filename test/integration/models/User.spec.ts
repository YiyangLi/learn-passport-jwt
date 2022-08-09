import connectDB from '../../../src/lib/connectDB';
import {UserOdm} from '../../../src/models/User';

describe('User', () => {
  it('contains 3 bootstrap records', async () => {
    await connectDB();
    const count = await UserOdm.count();
    expect(count).toBe(3);
  });
});
