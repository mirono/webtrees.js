import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { IndividualsService } from './individuals.service';
import { Individual } from '../database/entity/individual.entity';

@Controller('individuals')
export class IndividualsController {
    constructor(private readonly individualsService: IndividualsService) { }

    @Get()
    async findAll(): Promise<Individual[]> {
        return this.individualsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Individual> {
        const individual = await this.individualsService.findOne(id);
        if (!individual) {
            throw new NotFoundException(`Individual with ID ${id} not found`);
        }
        return individual;
    }
}
