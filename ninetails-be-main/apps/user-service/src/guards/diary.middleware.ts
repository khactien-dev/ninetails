import {
  NestMiddleware,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { EUserRole, PERMISSION } from 'libs/enums/common.enum';
import { NextFunction } from 'http-proxy-middleware/dist/types';

@Injectable()
export class DiaryReadMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req['auth'].role != EUserRole.ADMIN) {
      if (!req['auth'].permission) {
        throw new UnauthorizedException(
          '이 차량 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!',
        );
      }
      if (!req['auth'].permission?.driving_diary.includes(PERMISSION.READ)) {
        throw new UnauthorizedException(
          '이 차량 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!',
        );
      }
    }
    next();
  }
}

@Injectable()
export class DiaryUpdateMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req['auth'].role != EUserRole.ADMIN) {
      if (!req['auth'].permission) {
        throw new UnauthorizedException(
          '이 차량 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!',
        );
      }
      if (!req['auth'].permission.driving_diary.includes(PERMISSION.UPDATE)) {
        throw new UnauthorizedException(
          '이 차량 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!',
        );
      }
    }
    next();
  }
}

@Injectable()
export class DiaryCreateMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req['auth'].role != EUserRole.ADMIN) {
      if (!req['auth'].permission) {
        throw new UnauthorizedException(
          '이 차량 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!',
        );
      }
      if (!req['auth'].permission.driving_diary.includes(PERMISSION.CREATE)) {
        throw new UnauthorizedException(
          '이 차량 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!',
        );
      }
    }
    next();
  }
}

@Injectable()
export class DiaryDeleteMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req['auth'].role != EUserRole.ADMIN) {
      if (!req['auth'].permission) {
        throw new UnauthorizedException(
          '이 차량 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!',
        );
      }
      if (!req['auth'].permission.driving_diary.includes(PERMISSION.DELETE)) {
        throw new UnauthorizedException(
          '이 차량 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!',
        );
      }
    }
    next();
  }
}
