import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'http-proxy-middleware/dist/types';
import { EUserRole } from 'libs/enums/common.enum';

@Injectable()
export class RoleAdminMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req['auth'].role !== EUserRole.ADMIN) {
      throw new ForbiddenException('Forbidden Role');
    }
    next();
  }
}
