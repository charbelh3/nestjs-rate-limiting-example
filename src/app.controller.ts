import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { minutes, seconds, SkipThrottle, Throttle } from '@nestjs/throttler';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Throttle({ long: { ttl: minutes(30), limit: 100 } })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @SkipThrottle({ short: true })
  @Get('hi')
  getHi(): string {
    return this.appService.getHello();
  }
}
