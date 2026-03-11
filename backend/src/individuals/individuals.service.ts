import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Individual } from '../database/entity/individual.entity';

@Injectable()
export class IndividualsService {
    constructor(private databaseService: DatabaseService) { }

    async findAll(): Promise<Individual[]> {
        const dataSource = this.databaseService.getDataSource();
        const repository = dataSource.getRepository(Individual);
        return repository.find({ relations: ['names', 'events'] });
    }

    async findOne(id: string): Promise<Individual | null> {
        const dataSource = this.databaseService.getDataSource();
        const repository = dataSource.getRepository(Individual);
        // id here is gedcom_id (the XREF)
        return repository.findOne({
            where: { gedcom_id: id },
            relations: ['names', 'events', 'links', 'links.family', 'links.individual']
        });
    }
}
