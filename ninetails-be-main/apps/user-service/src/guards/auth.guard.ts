import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '../../../../libs/utils/helper.util';
import { IJwtPayload } from '../payloads/jwt-payload.payload';
import { EUserRole } from '../../../../libs/enums/common.enum';

@Injectable()
export class AuthenAdminGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer') {
      throw new UnauthorizedException();
    }
    try {
      const secretKey =
        this.configService.get('JWT_SECRET') ?? 'ninetails-secret';
      const payload = verifyToken(token, secretKey) as IJwtPayload;
      request['auth'] = payload;
      // if (payload.role === EUserRole.ADMIN) {
      //   request['ADMIN'] = payload;
      // }
    } catch (error) {
      if (error.message === 'jwt expired') {
        throw new UnauthorizedException(
          'Your login session has been expired. Please login again !',
          'TOKEN_EXPIRED',
        );
      }
      throw new UnauthorizedException('이 차량 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!');
    }
    return true;
  }
}
