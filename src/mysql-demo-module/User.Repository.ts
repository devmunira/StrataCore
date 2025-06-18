import { userTable } from '@/db/schemas/postgresql/schemas/user.schemas';
import { BaseRepository } from '@/libs/repository/classes/BaseRepository';
import {
  DatabaseClientToken,
  IDatabaseClient,
} from '@/libs/database/IDatabaseClient.interface';
import { inject, injectable } from 'tsyringe';
import { users } from '@/db/schemas/mysql/schemas';

@injectable()
export class UserRepository extends BaseRepository<typeof users> {
  constructor(@inject(DatabaseClientToken) db: IDatabaseClient) {
    super(db as IDatabaseClient, users);
  }
}
