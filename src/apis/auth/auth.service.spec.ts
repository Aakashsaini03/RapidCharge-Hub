import { describe, expect, it, vi } from 'vitest';
import { getMetadataArgsStorage } from 'typeorm';
import { User } from '../users/entities/users.entity';
import { AuthController } from './auth.controller';

describe('User auth model', () => {
  it('defines the status column required by the auth login flow', () => {
    const columnNames = getMetadataArgsStorage()
      .columns.filter((column) => column.target === User)
      .map((column) => column.propertyName);

    console.log('columnNames', columnNames);
    expect(columnNames).toContain('status');
  });
});

describe('AuthController MFA flow', () => {
  it('uses the authenticated user id for MFA setup', async () => {
    const generateMfaSecret = vi.fn().mockResolvedValue({ ok: true });
    const controller = new AuthController({ generateMfaSecret } as any);

    await controller.generateMfa({ user: { id: 99 } } as any);

    expect(generateMfaSecret).toHaveBeenCalledWith(99);
  });
});
