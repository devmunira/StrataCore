import { BaseService } from '@/libs/service/classes/BaseService';
import { UserRepository } from './User.Repository';
import { injectable } from 'tsyringe';
import { users } from '@/db/schemas/mysql/schemas';

@injectable()
export class UserService extends BaseService<typeof users, UserRepository> {
  constructor(readonly repository: UserRepository) {
    super(repository);
  }
}
