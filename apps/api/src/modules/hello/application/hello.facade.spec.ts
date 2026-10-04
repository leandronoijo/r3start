import { ServiceUnavailableException } from '@nestjs/common';
import { HelloFacade } from './hello.facade';
describe('HelloFacade', () => {
  const identity = { getFullNameForSession: jest.fn().mockResolvedValue('Ada Lovelace') };
  it('returns the same stored greeting for public and personal requests', async () => {
    const facade = new HelloFacade(
      { getCurrent: jest.fn().mockResolvedValue({ message: 'Hello world' }) },
      identity as never,
    );
    await expect(facade.getPublic()).resolves.toEqual({ message: 'Hello world' });
    await expect(facade.getPersonal('user-1')).resolves.toEqual({
      message: 'Hello world',
      fullName: 'Ada Lovelace',
    });
  });
  it('fails safely when the greeting is missing', async () => {
    const facade = new HelloFacade(
      { getCurrent: jest.fn().mockResolvedValue(undefined) },
      identity as never,
    );
    await expect(facade.getPublic()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
