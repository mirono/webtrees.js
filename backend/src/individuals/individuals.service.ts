import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Individual } from '../database/entity/individual.entity';

@Injectable()
export class IndividualsService {
    constructor(private databaseService: DatabaseService) { }

    async findAll(): Promise<Individual[]> {
        const dataSource = this.databaseService.getDataSource();
        const repository = dataSource.getRepository(Individual);
        return repository.find();
    }

    async findOne(id: string): Promise<Individual | null> {
        const dataSource = this.databaseService.getDataSource();
        const repository = dataSource.getRepository(Individual);
        return repository.findOneBy({ id });
    }
}
