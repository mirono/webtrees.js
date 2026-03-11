import { Test, TestingModule } from '@nestjs/testing';
import { IndividualsService } from './individuals.service';
import { DatabaseService } from '../database/database.service';
import { Individual } from '../database/entity/individual.entity';

describe('IndividualsService', () => {
    let service: IndividualsService;
    let databaseService: DatabaseService;

    const mockRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        findOneBy: jest.fn(),
    };

    const mockDataSource = {
        getRepository: jest.fn().mockReturnValue(mockRepository),
    };

    const mockDatabaseService = {
        getDataSource: jest.fn().mockReturnValue(mockDataSource),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                IndividualsService,
                {
                    provide: DatabaseService,
                    useValue: mockDatabaseService,
                },
            ],
        }).compile();

        service = module.get<IndividualsService>(IndividualsService);
        databaseService = module.get<DatabaseService>(DatabaseService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return all individuals', async () => {
        const individuals = [new Individual()];
        mockRepository.find.mockResolvedValue(individuals);

        const result = await service.findAll();
        expect(result).toEqual(individuals);
        expect(mockRepository.find).toHaveBeenCalledWith({ relations: ['names', 'events'] });
    });

    it('should return a single individual by id (gedcom_id)', async () => {
        const individual = new Individual();
        individual.gedcom_id = 'I1';
        mockRepository.findOne.mockResolvedValue(individual);

        const result = await service.findOne('I1');
        expect(result).toEqual(individual);
        expect(mockRepository.findOne).toHaveBeenCalledWith({
            where: { gedcom_id: 'I1' },
            relations: ['names', 'events', 'links', 'links.family', 'links.individual']
        });
    });
});
