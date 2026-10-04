import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';

@Injectable()
export class SessionGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    return new Promise((resolve, reject) =>
      verifySession()(http.getRequest(), http.getResponse(), (error?: unknown) =>
        error ? reject(new UnauthorizedException()) : resolve(true),
      ),
    );
  }
}
