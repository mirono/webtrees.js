import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DatabaseService } from '../database/database.service';

describe('UsersService', () => {
  let service: UsersService;
  let databaseService: DatabaseService;

  const mockRepository = {
    findOne: jest.fn(),
  };

  const mockDataSource = {
    getRepository: jest.fn().mockReturnValue(mockRepository),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DatabaseService,
          useValue: {
            getDataSource: jest.fn().mockReturnValue(mockDataSource),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneByUsername', () => {
    it('should return a user if found', async () => {
      const user = { id: 1, username: 'test' };
      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.findOneByUsername('test');
      expect(result).toEqual(user);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { username: 'test' } });
    });

    it('should return undefined if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(undefined);

      const result = await service.findOneByUsername('nonexistent');
      expect(result).toBeUndefined();
    });
  });
});
