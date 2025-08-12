import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { EUserRole } from '../../../../libs/enums/common.enum';

@Injectable()
export class AuthenAdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request?.auth?.role !== EUserRole.ADMIN) {
      throw new ForbiddenException('Forbidden Role');
    }
    return true;
  }
}

@Injectable()
export class AuthenOperatorGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const auth = request?.auth;
    if (
      auth?.role === EUserRole.OP ||
      (auth?.role === EUserRole.ADMIN && auth.tenant) ||
      (auth?.role === EUserRole.ADMIN &&
        request.headers['opid'] &&
        request.headers['schema'])
    ) {
      return true;
    }
    throw new ForbiddenException('Forbidden Role');
  }
}
