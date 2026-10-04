import { Module } from '@nestjs/common';
import { readConfig } from '../../infrastructure/config';
import { createDatabase } from '../../infrastructure/db/client';
import { DrizzleProfileRepository } from './adapters/drizzle-profile.repository';
import { IdentityFacade } from './application/identity.facade';
import { USER_PROFILE_REPOSITORY } from './ports/profile.repository';

@Module({
  providers: [
    { provide: 'DATABASE', useFactory: () => createDatabase(readConfig().DATABASE_URL) },
    {
      provide: USER_PROFILE_REPOSITORY,
      useFactory: (database: ReturnType<typeof createDatabase>) =>
        new DrizzleProfileRepository(database.db),
      inject: ['DATABASE'],
    },
    IdentityFacade,
  ],
  exports: [IdentityFacade, USER_PROFILE_REPOSITORY, 'DATABASE'],
})
export class IdentityModule {}
