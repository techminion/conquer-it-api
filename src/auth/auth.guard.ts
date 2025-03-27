import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): Promise<boolean> | boolean | Observable<boolean> {
    this.logger.log('canActivate called: Checking authentication status.');

    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.log('Access allowed: This route is public.');
      return true;
    }

    this.logger.log('Access requires authentication. Proceeding with JWT validation.');
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    this.logger.log('handleRequest called: Validating request.');

    if (err || !user) {
      this.logger.warn(
        `Unauthorized access attempt detected. Reason: ${err?.message || 'No user found'}`,
      );
      throw new UnauthorizedException("Damn boi, you don't have permission to access this.");
    }

    this.logger.log(`User authenticated successfully: ${user.email || 'Unknown User'}`);
    return user;
  }
}
