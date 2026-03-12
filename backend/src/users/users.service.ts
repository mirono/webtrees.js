import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { User } from '../database/entity/user.entity';

@Injectable()
export class UsersService {
  constructor(private databaseService: DatabaseService) {}

  async findOneByUsername(username: string): Promise<User | undefined> {
    const dataSource = this.databaseService.getDataSource();
    const repository = dataSource.getRepository(User);
    return repository.findOne({ where: { username } });
  }
}
