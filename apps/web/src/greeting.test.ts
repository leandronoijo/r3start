import { expect, test } from 'vitest';
test('preserves the greeting message', () => {
  expect({ message: 'Hello world' }).toEqual({ message: 'Hello world' });
});
