import {Body, Controller, Header, MessageEvent, Post, Sse} from '@nestjs/common';
import {ApiOkResponse, ApiTags} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import {FakeSendReq, FakeSendRes, PushReq, PushRes} from "./notification.dto";
import {fromEvent, interval, map, Observable} from "rxjs";
import { EventEmitter2 } from '@nestjs/event-emitter';

@ApiTags('Notification')
@Controller()
export class NotificationController {
  constructor(
    private readonly NotificationService: NotificationService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Post('fake-stream')
  @ApiOkResponse({ type: FakeSendRes })
  async fakeSendingMessages(@Body() input: FakeSendReq) {
    return await this.NotificationService.sendMessage(input);
  }

  @Sse('sse')
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('X-Accel-Buffering', 'no')
  async sse(): Promise<Observable<MessageEvent>> {
    return fromEvent(this.eventEmitter, 'sse.event').pipe(
        map(function (payload) {
          const data = JSON.stringify(payload);
          return { data, retry: 5000 };
        }),
    );
  }

  @Sse('sse2')
  sse2(): Observable<MessageEvent> {
    return interval(1000).pipe(
        map((_) => ({ data: { hello: 'world' }, type: ':keepalive' })),
    );
  }

  @Post('send')
  @ApiOkResponse({ type: PushRes })
  async send(@Body() input: PushReq) {
    return await this.NotificationService.send(input);
  }
}
