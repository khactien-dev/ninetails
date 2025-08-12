import {
  NestMiddleware,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { EUserRole, PERMISSION } from 'libs/enums/common.enum';
import { NextFunction } from 'http-proxy-middleware/dist/types';

@Injectable()
export class AbsenceManagementReadMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req['auth'].role != EUserRole.ADMIN) {
      if (!req['auth'].permission) {
        throw new UnauthorizedException(
          '이 차량 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!',
        );
      }
      if (
        !req['auth'].permission.absence_management.includes(PERMISSION.READ)
      ) {
        throw new UnauthorizedException(
          '이 차량 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!',
        );
      }
    }
    next();
  }
}

@Injectable()
export class AbsenceManagementCreateMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req['auth'].role != EUserRole.ADMIN) {
      if (!req['auth'].permission) {
        throw new UnauthorizedException(
          '이 차량 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!',
        );
      }
      if (
        !req['auth'].permission.absence_management.includes(PERMISSION.CREATE)
      ) {
        throw new UnauthorizedException(
          '이 차량 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!',
        );
      }
    }
    next();
  }
}

@Injectable()
export class AbsenceManagementUpdateMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req['auth'].role != EUserRole.ADMIN) {
      if (!req['auth'].permission) {
        throw new UnauthorizedException(
          '이 차량 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!',
        );
      }
      if (
        !req['auth'].permission.absence_management.includes(PERMISSION.UPDATE)
      ) {
        throw new UnauthorizedException(
          '이 차량 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!',
        );
      }
    }
    next();
  }
}

@Injectable()
export class AbsenceManagementDeleteMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req['auth'].role != EUserRole.ADMIN) {
      if (!req['auth'].permission) {
        throw new UnauthorizedException(
          '이 차량 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!',
        );
      }
      if (
        !req['auth'].permission.absence_management.includes(PERMISSION.DELETE)
      ) {
        throw new UnauthorizedException(
          '이 차량 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!',
        );
      }
    }
    next();
  }
}
