import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import type { Pool } from 'pg';
import { readConfig } from './infrastructure/config';
@Controller('health')
export class HealthController {
  constructor(@Inject('DATABASE') private readonly database: { pool: Pool }) {}
  @Get('live') live() {
    return { status: 'ok' };
  }
  @Get('ready') async ready() {
    try {
      await this.database.pool.query('select 1');
      const response = await fetch(`${readConfig().SUPERTOKENS_CONNECTION_URI}/hello`);
      if (!response.ok) throw new Error('Core unavailable');
      return { status: 'ok' };
    } catch {
      throw new ServiceUnavailableException('Dependencies are temporarily unavailable');
    }
  }
}
