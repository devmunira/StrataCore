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
import { DatabaseDriver } from '@/libs/database/IDatabaseClient.interface';
import { AppConfig } from '@/config/app.config';

export abstract class BaseService<
  TTable extends (PgTable | MySqlTable) & { id: SQLWrapper },
  TRepository extends BaseRepository<TTable> = BaseRepository<TTable>,
> {
  private config = AppConfig.getInstance().database;

  constructor(protected readonly repository: TRepository) {}

  @TryCatch()
  async findAll(options?: FindOptions) {
    const filter = options?.where
      ? FilterBuilder.build(options?.where, this.config.driver)
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

  @TryCatch()
  async create(data: TTable['$inferInsert']) {
    try {
      const item = await this.repository.create(data);
      return item;
    } catch (error) {
      throw error;
    }
  }

  // @TryCatch()
  async update(id: ID, data: Partial<TTable['$inferInsert']>) {
    const findData = await this.repository.findById(id);
    if (!findData) {
      throw new Error('Item not found');
    }
    const item = await this.repository.update(id, data);
    if (!item) {
      throw new Error('Item not found');
    }

    return item;
  }

  @TryCatch()
  async delete(id: ID) {
    const findData = await this.repository.findById(id);
    if (!findData) {
      throw new Error('Item not found');
    }

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
