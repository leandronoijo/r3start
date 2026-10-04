export interface UserProfileRepository {
  getFullName(id: string): Promise<string | undefined>;
  create(id: string, fullName: string): Promise<void>;
  delete(id: string): Promise<void>;
}
export const USER_PROFILE_REPOSITORY = Symbol('USER_PROFILE_REPOSITORY');
