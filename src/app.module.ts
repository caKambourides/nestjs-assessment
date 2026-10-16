import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController, MyController } from './app.controller.js';
import { AppService } from './app.service.js';
import { LoggerMiddleware } from './app.middleware.js';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stream } from './stream.entity.js';
import { StreamingModule } from './streaming/streaming.module.js';
export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),

    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'database.sqlite',
      autoLoadEntities: true,
      entities: [Stream],
      synchronize: true, //set to false for prod
    }),

    StreamingModule,

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
