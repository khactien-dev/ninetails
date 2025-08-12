import { NextFunction } from 'http-proxy-middleware/dist/types';
import { Request } from 'express';
import {
  ForbiddenException,
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
      if (payload.role !== EUserRole.ADMIN && !payload.tenant) {
        throw new UnauthorizedException(
          '이 차량 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!',
        );
      }
      req['auth'] = payload;
      if (!req.headers['schema']) {
        if (
          payload.role === EUserRole.ADMIN &&
          !payload.tenant &&
          !req.headers['opid']
        ) {
          throw new UnauthorizedException(
            '이 차량 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!',
          );
        }
        req.headers['schema'] = payload.tenant;
      } else {
        if (payload.role === EUserRole.ADMIN && req.headers['opid']) {
          req['auth'].adminId = req['auth'].id;
          req['auth'].id = req.headers['opid'];
        }
      }
      if (payload.role !== EUserRole.ADMIN) {
        const endDate = payload?.contractEndDate;
        const current = new Date().getTime();
        if (!endDate || current > new Date(endDate).getTime()) {
          throw new Error('CONTRACT_EXPIRE');
        }
      }
    } catch (error) {
      if (error.message === 'jwt expired') {
        throw new UnauthorizedException(
          'Your login session has been expired. Please login again !',
          'TOKEN_EXPIRED',
        );
      }
      if (error.message === 'CONTRACT_EXPIRE') {
        throw new ForbiddenException('Contract has expired');
      }
      throw new UnauthorizedException(
        '이 차량 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!',
      );
    }
    next();
  }
}
