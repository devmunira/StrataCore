import { BaseRepository } from '@/libs/repository/classes/BaseRepository';
import {
  DatabaseClientToken,
  IDatabaseClient,
  DatabaseDriver,
} from '@/libs/database/IDatabaseClient.interface';
import { inject, injectable } from 'tsyringe';
import { users } from '@/db/schemas/mysql/schemas';
import { userTable } from '@/db/schemas/postgresql/schemas/user.schemas';
import { AppConfig } from '@/config/app.config';

@injectable()
export class UserRepository extends BaseRepository<
  typeof users | typeof userTable
> {
  constructor(@inject(DatabaseClientToken) db: IDatabaseClient) {
    const config = AppConfig.getInstance().database;
    const table =
      config.driver === DatabaseDriver.POSTGRESQL ? userTable : users;
    super(db as IDatabaseClient, table as any);
  }
}
