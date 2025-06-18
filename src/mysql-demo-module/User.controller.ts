import { injectable } from 'tsyringe';
import { UserService } from './User.Service';
import { Controller, Delete, Get, Guard, Post, Put } from '@/libs/decorator';
import { FindOptionsSchema } from '@/libs/repository/interfaces/IBaseRepository';
import { Request, Response } from 'express';
import { AuthGuard } from '@/middlewares';
import { FilterRuleGroup } from '@/libs/repository/interfaces/IDatabaseFilterBuilder';
import { UpdateUserSchema } from '@/db/schemas/postgresql/schemas';
import { CreateUserSchema } from '@/db/schemas/mysql/schemas';

@injectable()
@Controller('/api/v1/mysql/users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get('/')
  @Guard([AuthGuard])
  async findAll(req: Request, res: Response) {
    const parsedQuery = FindOptionsSchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ message: 'Invalid query' });
    }
    const users = await this.service.findAll(parsedQuery.data);
    res.json(users);
  }

  @Get('/:id')
  async findById(req: Request, res: Response) {
    const user = await this.service.findById(req.params.id);
    res.json(user);
  }

  @Get('/search')
  async search(req: Request, res: Response) {
    const { query = '' } = req.query;
    const where: FilterRuleGroup = {
      combinator: 'or',
      rules: [
        {
          field: 'name',
          operator: 'contains',
          value: query,
        },
        {
          field: 'email',
          operator: 'contains',
          value: query,
        },
        {
          field: 'id',
          operator: '=',
          value: query,
        },
      ],
    };

    const users = await this.service.findAll({ where });
    res.json(users);
  }

  @Post('/')
  async create(req: Request, res: Response) {
    const parsedQuery = CreateUserSchema.safeParse(req.body);
    if (!parsedQuery.success) {
      res.status(400).json({
        message: 'Invalid input data',
        errors: parsedQuery.error,
      });
    } else {
      const user = await this.service.create(parsedQuery.data);
      res.json(user);
    }
  }

  @Put('/:id')
  async update(req: Request, res: Response) {
    const parsedBody = UpdateUserSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({ message: 'Invalid body' });
    }

    const user = await this.service.update(req.params.id, parsedBody.data);
    res.json(user);
  }

  @Delete('/:id')
  async delete(req: Request, res: Response) {
    await this.service.delete(req.params.id);
    res.status(204).send();
  }
}
