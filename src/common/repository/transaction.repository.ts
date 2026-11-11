import {
  DataSource,
  EntityTarget,
  FindOneOptions,
  ObjectLiteral,
  QueryRunner,
} from 'typeorm';

export class TransactionBaseRepository<T extends ObjectLiteral> {
  constructor(
    public readonly dataSource: DataSource,
    private readonly entityClass: EntityTarget<T>,
  ) {}

  private getQueryRunner(queryRunner?: QueryRunner): QueryRunner {
    if (queryRunner) return queryRunner;
    return this.dataSource.createQueryRunner();
  }

  async findOne(
    option: FindOneOptions<T>,
    queryRunner?: QueryRunner,
  ): Promise<T | null> {
    const runner = this.getQueryRunner(queryRunner);
    return runner.manager.findOne<T>(this.entityClass, option);
  }
}
