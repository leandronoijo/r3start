import type { Greeting } from '../domain/hello';
export interface GreetingRepository {
  getCurrent(): Promise<Greeting | undefined>;
}
export const GREETING_REPOSITORY = Symbol('GREETING_REPOSITORY');
