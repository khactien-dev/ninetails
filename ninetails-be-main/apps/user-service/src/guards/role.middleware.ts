import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'http-proxy-middleware/dist/types';
import { EUserRole } from 'libs/enums/common.enum';

@Injectable()
export class RoleOpMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const role = [EUserRole.ADMIN, EUserRole.OP];
    if (!role.includes(req['auth'].role)) {
      throw new ForbiddenException('Forbidden Role');
    }
    next();
  }
}

@Injectable()
export class RoleBackUpMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const role = [EUserRole.ADMIN, EUserRole.BACKUP, EUserRole.OP];
    if (!role.includes(req['auth'].role)) {
      throw new ForbiddenException('Forbidden Role');
    }
    next();
  }
}

@Injectable()
export class RoleDispatchMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const role = [
      EUserRole.ADMIN,
      EUserRole.BACKUP,
      EUserRole.OP,
      EUserRole.DISPATCH,
    ];
    if (!role.includes(req['auth'].role)) {
      throw new ForbiddenException('Forbidden Role');
    }
    next();
  }
}
