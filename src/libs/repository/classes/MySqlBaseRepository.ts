import { MySqlColumn, MySqlTable, TableConfig } from 'drizzle-orm/mysql-core';
import { asc, desc, eq, inArray, sql, SQLWrapper } from 'drizzle-orm';
import {
  FindOptionsSQL,
  ID,
  IMyBaseRepository,
} from '../interfaces/IBaseRepository';
import {
  IMyDatabaseClient,
  MysqlDrizzleClient,
} from '@/libs/database/IDatabaseClient.interface';

type TableWithId<T extends MySqlTable<TableConfig>> = T & {
  id: MySqlColumn;
  $inferSelect: any;
  $inferInsert: any;
  _: { name: string; columns: Record<string, any> };
  $dynamic(): any;
  $select(): any;
  $returning(): any;
};

export abstract class MySqlBaseRepository<
  TTable extends TableWithId<MySqlTable<TableConfig>>,
> implements IMyBaseRepository<TTable>
{
  constructor(
    protected readonly db: IMyDatabaseClient,
    protected readonly table: TTable,
  ) {}

  async findAll(options?: FindOptionsSQL): Promise<TTable['$inferSelect'][]> {
    const result = await this.db.executeQuery('FindAll', async (db) => {
      let query = db.select().from(this.table).$dynamic();

      if (options?.where) {
        query = query.where(options.where.getSQL());
      }

      if (options?.orderBy && options.orderBy.length > 0) {
        const orderClause = options.orderBy.map((order) =>
          order.direction === 'asc' ? asc(order.column) : desc(order.column),
        );
        query = query.orderBy(...orderClause);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.offset(options.offset);
      }

      const records = await query.execute();
      return records;
    });

    return result;
  }

  async findById(id: ID): Promise<TTable['$inferSelect'] | null> {
    const result = await this.db.executeQuery('FindById', async (db) => {
      const records = await db
        .select()
        .from(this.table)
        .where(eq(this.table.id, id))
        .execute();

      return records[0] ?? null;
    });

    return result;
  }

  async findOne(where: SQLWrapper): Promise<TTable['$inferSelect'] | null> {
    const result = await this.db.executeQuery('FindById', async (db) => {
      const records = await db
        .select()
        .from(this.table)
        .where(where.getSQL())
        .execute();

      return records[0] ?? null;
    });

    return result;
  }

  async findAndCount(
    options?: FindOptionsSQL,
  ): Promise<[TTable['$inferSelect'][], number]> {
    const [records, count] = await Promise.all([
      this.findAll(options),
      this.count(options?.where),
    ]);

    return [records, count];
  }

  async count(where?: SQLWrapper): Promise<number> {
    const result = await this.db.executeQuery('Count', async (db) => {
      let query = db
        .select({ count: sql`count(*)` })
        .from(this.table)
        .$dynamic();

      if (where) {
        query = query.where(where.getSQL());
      }

      const records = await query.execute();
      return Number(records[0]?.count);
    });

    return result;
  }

  async checkExists(where: SQLWrapper): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  async checkExistsById(id: ID): Promise<boolean> {
    return await this.checkExists(eq(this.table.id, id));
  }

  async create(data: TTable['$inferInsert']): Promise<TTable['$inferSelect']> {
    const result = await this.db.executeQuery('Create', async (db) => {
      await db.insert(this.table).values(data);
      const records = await db
        .select()
        .from(this.table)
        .where(eq(this.table.id, data.id))
        .execute();
      return records[0];
    });

    return result;
  }

  async createMany(
    data: TTable['$inferInsert'][],
  ): Promise<TTable['$inferSelect'][]> {
    const result = await this.db.executeQuery('CreateMany', async (db) => {
      await db.insert(this.table).values(data);
      const ids = data.map((item) => item.id);
      const records = await db
        .select()
        .from(this.table)
        .where(inArray(this.table.id, ids))
        .execute();
      return records;
    });

    return result;
  }

  async update(
    id: ID,
    data: Partial<TTable['$inferInsert']>,
  ): Promise<TTable['$inferSelect'] | null> {
    const result = await this.db.executeQuery('Update', async (db) => {
      await db.update(this.table).set(data).where(eq(this.table.id, id));
      const records = await db
        .select()
        .from(this.table)
        .where(eq(this.table.id, id))
        .execute();
      return records[0] ?? null;
    });

    return result;
  }

  async updateMany(
    data: Partial<TTable['$inferInsert']> & { id: ID }[],
  ): Promise<TTable['$inferSelect'][]> {
    const result = await this.db.executeQuery('UpdateMany', async (db) => {
      await db.update(this.table).set(data);
      const ids = data.map((item) => item.id);
      const records = await db
        .select()
        .from(this.table)
        .where(inArray(this.table.id, ids))
        .execute();
      return records;
    });

    return result;
  }

  async delete(id: ID): Promise<void> {
    await this.db.executeQuery('Delete', async (db) => {
      await db.delete(this.table).where(eq(this.table.id, id));
    });
  }

  async deleteMany(ids: ID[]): Promise<void> {
    await this.db.executeQuery('DeleteMany', async (db) => {
      await db.delete(this.table).where(inArray(this.table.id, ids));
    });
  }

  getTable(): TTable {
    return this.table;
  }
}
