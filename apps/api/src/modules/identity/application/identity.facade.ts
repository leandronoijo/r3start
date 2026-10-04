import { Inject, Injectable } from '@nestjs/common';
import { USER_PROFILE_REPOSITORY, type UserProfileRepository } from '../ports/profile.repository';

export class MissingProfileError extends Error {}
@Injectable()
export class IdentityFacade {
  constructor(@Inject(USER_PROFILE_REPOSITORY) private readonly profiles: UserProfileRepository) {}
  async getFullNameForSession(userId: string): Promise<string> {
    const fullName = await this.profiles.getFullName(userId);
    if (!fullName) throw new MissingProfileError('User profile is missing');
    return fullName;
  }
  async createProfile(userId: string, fullName: string): Promise<void> {
    await this.profiles.create(userId, fullName);
  }
  async deleteProfile(userId: string): Promise<void> {
    await this.profiles.delete(userId);
  }
}
