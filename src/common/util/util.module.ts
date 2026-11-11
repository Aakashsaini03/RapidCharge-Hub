import { Module } from '@nestjs/common';
import { UtilsService } from './util.service';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register(), // <--- Add this import
    ConfigModule,
  ],
 providers: [UtilsService],
  exports: [UtilsService],
})
export class UtilsModule {}
