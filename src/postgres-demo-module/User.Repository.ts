import { userTable } from '@/db/schemas/postgresql/schemas/user.schemas';
import { BaseRepository } from '@/libs/repository/classes/BaseRepository';
import {
  DatabaseClientToken,
  IDatabaseClient,
} from '@/libs/database/IDatabaseClient.interface';
import { inject, injectable } from 'tsyringe';

@injectable()
export class UserRepository extends BaseRepository<typeof userTable> {
  constructor(@inject(DatabaseClientToken) db: IDatabaseClient) {
    super(db as IDatabaseClient, userTable);
  }
}
