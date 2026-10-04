import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { errorHandler, middleware } from 'supertokens-node/framework/express';
import { AppModule } from './app.module';
import { readConfig } from './infrastructure/config';
import { initializeSuperTokens } from './infrastructure/supertokens';
import { IdentityFacade } from './modules/identity';
async function bootstrap() {
  const config = readConfig();
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });
  initializeSuperTokens(config, app.get(IdentityFacade));
  app.enableCors({ origin: config.APP_ORIGIN, credentials: true });
  app.use('/auth', middleware());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  if (config.NODE_ENV === 'development')
    SwaggerModule.setup(
      'docs',
      app,
      SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('Starter API').build()),
    );
  app.use(errorHandler());
  await app.listen(config.PORT, '0.0.0.0');
  Logger.log(JSON.stringify({ event: 'api_started', port: config.PORT }), 'Bootstrap');
}
bootstrap().catch((error) => {
  console.error(
    JSON.stringify({
      level: 'error',
      event: 'startup_failed',
      error: error instanceof Error ? error.message : 'unknown',
    }),
  );
  process.exit(1);
});
