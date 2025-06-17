import { PgTable } from 'drizzle-orm/pg-core';
import { asc, desc, eq, inArray, sql, SQLWrapper } from 'drizzle-orm';
import {
  FindOptionsSQL,
  IBaseRepository,
  ID,
} from '../interfaces/IBaseRepository';
import {
  DatabaseConfig,
  IDatabaseClient,
} from '@/libs/database/IDatabaseClient.interface';
import { MySqlTable } from 'drizzle-orm/mysql-core';
import { AppConfig } from '@/config/app.config';

export abstract class BaseRepository<
  TTable extends (PgTable | MySqlTable) & { id: SQLWrapper },
> implements IBaseRepository<TTable>
{
  private config: DatabaseConfig = AppConfig.getInstance().database;

  constructor(
    protected db: IDatabaseClient,
    protected table: TTable,
  ) {}

  async findAll(options?: FindOptionsSQL): Promise<TTable['$inferSelect'][]> {
    const result = await this.db.executeQuery('FindAll', async (db) => {
      let query = db
        .select()
        .from(this.table as any)
        .$dynamic();

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

      return (await query.execute()) as TTable['$inferSelect'][];
    });

    return result;
  }

  async findById(id: ID): Promise<TTable['$inferSelect'] | null> {
    const result = await this.db.executeQuery('FindById', async (db) => {
      const records = (await db
        .select()
        .from(this.table as any)
        .where(eq(this.table.id, id))
        .execute()) as TTable['$inferSelect'][];

      return records[0] ?? null;
    });

    return result;
  }

  async findOne(where: SQLWrapper): Promise<TTable['$inferSelect'] | null> {
    const result = await this.db.executeQuery('FindById', async (db) => {
      const records = (await db
        .select()
        .from(this.table as any)
        .where(where.getSQL())
        .execute()) as TTable['$inferSelect'][];

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
        .from(this.table as any)
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
      const records = (await db
        .insert(this.table as any)
        .values(data)
        .returning()) as TTable['$inferSelect'][];

      return records[0];
    });

    return result;
  }

  async createMany(
    data: TTable['$inferInsert'][],
  ): Promise<TTable['$inferSelect'][]> {
    const result = await this.db.executeQuery('CreateMany', async (db) => {
      return (await db
        .insert(this.table as any)
        .values(data)
        .returning()) as TTable['$inferSelect'][];
    });

    return result;
  }

  async update(
    id: ID,
    data: Partial<TTable['$inferInsert']>,
  ): Promise<TTable['$inferSelect'] | null> {
    const result = await this.db.executeQuery('Update', async (db) => {
      const records = (await db
        .update(this.table as any)
        .set(data)
        .where(eq(this.table.id, id))
        .returning()) as TTable['$inferSelect'][];

      return records[0] ?? null;
    });

    return result;
  }

  async updateMany(
    data: Partial<TTable['$inferInsert']> & { id: ID }[],
  ): Promise<TTable['$inferSelect'][]> {
    const result = await this.db.executeQuery('UpdateMany', async (db) => {
      return (await db
        .update(this.table as any)
        .set(data)
        .returning()) as TTable['$inferSelect'][];
    });

    return result;
  }

  async delete(id: ID): Promise<void> {
    await this.db.executeQuery('Delete', async (db) => {
      await db.delete(this.table as any).where(eq(this.table.id, id));
    });
  }

  async deleteMany(ids: ID[]): Promise<void> {
    await this.db.executeQuery('DeleteMany', async (db) => {
      await db.delete(this.table as any).where(inArray(this.table.id, ids));
    });
  }

  getTable(): TTable {
    return this.table;
  }
}
