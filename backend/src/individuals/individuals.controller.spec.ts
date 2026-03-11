import { Test, TestingModule } from '@nestjs/testing';
import { IndividualsController } from './individuals.controller';
import { IndividualsService } from './individuals.service';
import { Individual } from '../database/entity/individual.entity';
import { NotFoundException } from '@nestjs/common';

describe('IndividualsController', () => {
    let controller: IndividualsController;
    let service: IndividualsService;

    const mockIndividualsService = {
        findAll: jest.fn(),
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [IndividualsController],
            providers: [
                {
                    provide: IndividualsService,
                    useValue: mockIndividualsService,
                },
            ],
        }).compile();

        controller = module.get<IndividualsController>(IndividualsController);
        service = module.get<IndividualsService>(IndividualsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return all individuals', async () => {
        const individuals = [new Individual()];
        mockIndividualsService.findAll.mockResolvedValue(individuals);

        const result = await controller.findAll();
        expect(result).toEqual(individuals);
        expect(service.findAll).toHaveBeenCalled();
    });

    it('should return a single individual by id', async () => {
        const individual = new Individual();
        individual.id = 'I1';
        mockIndividualsService.findOne.mockResolvedValue(individual);

        const result = await controller.findOne('I1');
        expect(result).toEqual(individual);
        expect(service.findOne).toHaveBeenCalledWith('I1');
    });

    it('should throw NotFoundException if individual not found', async () => {
        mockIndividualsService.findOne.mockResolvedValue(null);

        await expect(controller.findOne('I999')).rejects.toThrow(NotFoundException);
    });
});
