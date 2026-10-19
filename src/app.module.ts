import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController, MyController } from './app.controller.js';
import { AppService } from './app.service.js';
import { LoggerMiddleware } from './app.middleware.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stream } from './stream.entity.js';
import { User } from './user.entity.js';
import { StreamingModule } from './streaming/streaming.module.js';
import { AuthModule } from './auth/auth.module.js';
export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DATABASE_PATH || 'database.sqlite',
      autoLoadEntities: true,
      entities: [Stream, User],
      synchronize: true, //set to false for prod
    }),

    StreamingModule,
    AuthModule,

    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    // ObserveModule.forRoot({
    //   appKey: process.env.OBSERVE_APP_KEY ?? '',
    //   appSecret: process.env.OBSERVE_APP_SECRET ?? '',
    //   runtimeMetrics: !Boolean(process.versions?.['webcontainer']),
    //   serviceId: 'nest-typescript-starter',
    // }),
  ],
  controllers: [AppController, MyController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(MyController);
  }
}
