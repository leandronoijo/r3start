import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { HealthController } from './health.controller';
import { HelloModule } from './modules/hello';
import { IdentityModule } from './modules/identity';
@Module({
  imports: [
    HelloModule,
    IdentityModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../web/dist'),
      exclude: ['/api/{*path}', '/health/{*path}', '/docs/{*path}'],
    }),
  ],
  controllers: [HealthController],
})
export class AppModule {}
