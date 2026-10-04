import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { SessionGuard } from '../../identity/session.guard';
import { HelloFacade } from '../application/hello.facade';

type SessionRequest = Request & { session: { getUserId(): string } };
@Controller('api/hello')
export class HelloController {
  constructor(private readonly hello: HelloFacade) {}
  @Get() getPublic() {
    return this.hello.getPublic();
  }
  @Get('personal') @UseGuards(SessionGuard) getPersonal(@Req() request: SessionRequest) {
    return this.hello.getPersonal(request.session.getUserId());
  }
}
