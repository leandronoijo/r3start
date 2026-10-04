import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { HelloResponse, PersonalHelloResponse } from '@starter/shared';
import { IdentityFacade } from '../../identity';
import { GREETING_REPOSITORY, type GreetingRepository } from '../ports/greeting.repository';

@Injectable()
export class HelloFacade {
  constructor(
    @Inject(GREETING_REPOSITORY) private readonly greetings: GreetingRepository,
    private readonly identity: IdentityFacade,
  ) {}
  async getPublic(): Promise<HelloResponse> {
    const greeting = await this.greetings.getCurrent();
    if (!greeting) throw new ServiceUnavailableException('Greeting is temporarily unavailable');
    return { message: greeting.message };
  }
  async getPersonal(userId: string): Promise<PersonalHelloResponse> {
    const [greeting, fullName] = await Promise.all([
      this.getPublic(),
      this.identity.getFullNameForSession(userId),
    ]);
    return { ...greeting, fullName };
  }
}
