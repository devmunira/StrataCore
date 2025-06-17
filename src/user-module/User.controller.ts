import { injectable } from 'tsyringe';
import { UserService } from './User.Service';
import { Controller, Get, Guard } from '@/libs/decorator';
import { FindOptionsSchema } from '@/libs/repository/interfaces/IBaseRepository';
import { Request, Response } from 'express';
import { AuthGuard } from '@/middlewares';

@injectable()
@Controller('/api/v1/users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get('/')
  @Guard([AuthGuard])
  async findAll(req: Request, res: Response) {
    console.log('Route handler: findAll called');
    const parsedQuery = FindOptionsSchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ message: 'Invalid query' });
    }
    const users = await this.service.findAll(parsedQuery.data);
    res.json(users);
  }
}
