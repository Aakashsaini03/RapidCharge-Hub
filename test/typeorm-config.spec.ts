import { describe, expect, it } from 'vitest';
import { dataSourceOptions } from '../db/config/typeorm.config.js';

describe('TypeORM config', () => {
  it('reads the database port as a number', () => {
    expect(dataSourceOptions.port).toBeTypeOf('number');
    expect(dataSourceOptions.port).toBe(1433);
  });
});
