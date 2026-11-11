import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AttemptFailureResult } from './util.interface';

@Injectable()
export class UtilsService {
  private readonly MAX_ATTEMPT: number;
  private readonly LOCKOUT_DURATION: number;

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly configService: ConfigService

  ) {
    // If using ConfigService:
    this.MAX_ATTEMPT = Number(this.configService.get('MAX_ATTEMPTS'));
    this.LOCKOUT_DURATION = Number(this.configService.get('LOCKOUT_DURATION_IN_MIN'));

    // OR if reading directly from process.env:
    // this.MAX_ATTEMPT = Number(process.env.MAX_ATTEMPT ?? 5);
    // this.LOCKOUT_DURATION = Number(process.env.LOCKOUT_DURATION ?? 300);
  }


    async matchPassword(hash: string, password: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async recordFailedAttempt(
    identifier: string,
    purpose: string,
  ): Promise<AttemptFailureResult> {
    const attemptsKey = this.getAttemptsKey(identifier, purpose);
    const attemptsStr = await this.cacheManager.get(attemptsKey);
    let attempts: number = attemptsStr ? parseInt(attemptsStr as string, 10) : 0;
    attempts++;
    await this.cacheManager.set(attemptsKey, attempts.toString(), this.LOCKOUT_DURATION);
    if (attempts >= this.MAX_ATTEMPT) {
      return { locked: true, attempts, remaining: this.LOCKOUT_DURATION };
    }
    return { locked: false, attempts, remaining: this.MAX_ATTEMPT- attempts };
  }

    async resetAttempts(identifier: string, purpose: string): Promise<void> {
    await this.cacheManager.del(this.getAttemptsKey(identifier, purpose));
  }
   private getAttemptsKey(identifier: string, purpose: string): string {
    return `lockout:attempts:${purpose}:${identifier}`;
  }
}
