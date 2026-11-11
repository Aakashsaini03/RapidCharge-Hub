import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './apis/auth/auth.module.js';
import { ConfigModule } from '@nestjs/config';
import { dataSourceOptions } from '../db/config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilsModule } from './common/util/util.module.js';
import { UsersModule } from './apis/users/users.module';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    UtilsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
