import { TryCatch } from '@/libs/decorator';
import { BaseRepository } from '@/libs/repository/classes/BaseRepository';
import { FilterBuilder } from '@/libs/repository/classes/DatabaseFilterBuilder';

import {
  FindOptions,
  ID,
  OrderDirection,
} from '@/libs/repository/interfaces/IBaseRepository';
import { SQLWrapper } from 'drizzle-orm';
import { MySqlTable } from 'drizzle-orm/mysql-core';
import { PgColumn, PgTable, TableConfig } from 'drizzle-orm/pg-core';

export abstract class BaseService<
  TTable extends (PgTable | MySqlTable) & { id: SQLWrapper },
  TRepository extends BaseRepository<TTable> = BaseRepository<TTable>,
> {
  constructor(protected readonly repository: TRepository) {}

  @TryCatch()
  async findAll(options?: FindOptions) {
    const filter = options?.where
      ? FilterBuilder.build(options?.where)
      : undefined;

    return await this.repository.findAll({
      where: filter,
      limit: options?.limit ?? 10,
      offset: options?.offset ?? 0,
      orderBy: this.transformOrderBy(options?.orderBy),
    });
  }

  @TryCatch()
  async findById(id: ID) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new Error('Item not found');
    }
    return item;
  }

  // @TryCatch()
  async create(data: TTable['$inferInsert']) {
    const item = await this.repository.create(data);
    return item;
  }

  @TryCatch()
  async update(id: ID, data: Partial<TTable['$inferInsert']>) {
    const item = await this.repository.update(id, data);
    if (!item) {
      throw new Error('Item not found');
    }

    return item;
  }

  @TryCatch()
  async delete(id: ID) {
    await this.repository.delete(id);
  }

  @TryCatch()
  async checkExists(id: ID) {
    await this.repository.findById(id);
    return true;
  }

  protected transformOrderBy(orderBy: FindOptions['orderBy']) {
    if (!orderBy) return undefined;
    const table = this.repository.getTable();

    return orderBy
      .filter((order) => order.column in table)
      .map((order) => ({
        column: table[order.column as keyof typeof table] as PgColumn,
        direction: order.direction as OrderDirection,
      }));
  }
}
