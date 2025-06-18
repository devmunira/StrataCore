import { userTable } from '@/db/schemas/postgresql/schemas/user.schemas';
import { BaseService } from '@/libs/service/classes/BaseService';
import { UserRepository } from './User.Repository';
import { injectable } from 'tsyringe';

@injectable()
export class UserService extends BaseService<typeof userTable, UserRepository> {
  constructor(readonly repository: UserRepository) {
    super(repository);
  }
}
