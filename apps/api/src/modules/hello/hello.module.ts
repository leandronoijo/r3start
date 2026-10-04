import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity';
import { DrizzleGreetingRepository } from './adapters/drizzle-greeting.repository';
import { HelloController } from './adapters/hello.controller';
import { HelloFacade } from './application/hello.facade';
import { GREETING_REPOSITORY } from './ports/greeting.repository';

@Module({
  imports: [IdentityModule],
  controllers: [HelloController],
  providers: [
    {
      provide: GREETING_REPOSITORY,
      useFactory: (database: { db: ConstructorParameters<typeof DrizzleGreetingRepository>[0] }) =>
        new DrizzleGreetingRepository(database.db),
      inject: ['DATABASE'],
    },
    HelloFacade,
  ],
  exports: [HelloFacade],
})
export class HelloModule {}
