import { NextFunction } from 'http-proxy-middleware/dist/types';
import { Request } from 'express';
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from 'libs/utils/helper.util';
import { IJwtPayload } from '../payloads/jwt-payload.payload';
import { EUserRole } from 'libs/enums/common.enum';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer') {
      throw new UnauthorizedException();
    }
    try {
      const secretKey =
        this.configService.get('JWT_SECRET') ?? 'ninetails-secret';
      const payload = verifyToken(token, secretKey) as IJwtPayload;
      req['auth'] = payload;
      if (payload.role !== EUserRole.ADMIN) {
        if (!payload.tenant) {
          throw new UnauthorizedException(
            '이 차량 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!',
          );
        }
        req.headers['schema'] = payload.tenant;
      }
    } catch (error) {
      if (error.message === 'jwt expired') {
        throw new UnauthorizedException(
          'Your login session has been expired. Please login again !',
          'TOKEN_EXPIRED',
        );
      }
      throw new UnauthorizedException(
        // 'UnAuthorized'
        '이 차량 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!',
      );
    }
    next();
  }
}
