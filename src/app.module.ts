import { ExecutionContext, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  minutes,
  seconds,
  ThrottlerGuard,
  ThrottlerModule,
} from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: seconds(4),
          limit: 3,
          blockDuration: minutes(10),
        },
        {
          name: 'medium',
          ttl: seconds(30),
          limit: 10,
        },
        {
          name: 'long',
          ttl: seconds(60),
          limit: 20,
        },
      ],
      errorMessage: 'Wow! Slow down.',
      storage: new ThrottlerStorageRedisService(), //Make sure you have a local redis instance running
      getTracker: (req: Record<string, any>, context: ExecutionContext) => {
        //Track requests by tenantId rather than IP address (You can also customize trackers per endpoints and/or throttlers)
        console.log(req.headers['x-tenant-id']);
        return req.headers['x-tenant-id'];
      },
      //Overidden default implementation, to block access to all endpoints
      generateKey: (
        context: ExecutionContext,
        trackerString: string,
        throttlerName: string,
      ) => {
        //TODO: Needs hashing, for security purposes
        return trackerString;
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
