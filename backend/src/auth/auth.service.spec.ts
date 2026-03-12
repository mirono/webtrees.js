import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mockToken'),
            verify: jest.fn().mockReturnValue({ username: 'test' }),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOneByUsername: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('bcrypt', () => {
    it('should hash a password', async () => {
      const password = 'testpassword';
      const hash = await service.hashPassword(password);
      expect(hash).toBeDefined();
      expect(hash).not.toEqual(password);
      const isMatch = await bcrypt.compare(password, hash);
      expect(isMatch).toBe(true);
    });
  });

  describe('jwt', () => {
    it('should sign a token', () => {
      const user = { username: 'test', id: 1 };
      const token = service.generateToken(user);
      expect(token).toEqual('mockToken');
      expect(jwtService.sign).toHaveBeenCalledWith({ username: 'test', sub: 1 });
    });
  });

  describe('validateUser', () => {
    it('should return user without password if valid', async () => {
      const password = 'testpassword';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = { id: 1, username: 'test', password: hashedPassword };
      
      (usersService.findOneByUsername as jest.Mock).mockResolvedValue(user);

      const result = await service.validateUser('test', password);
      expect(result).toEqual({ id: 1, username: 'test' });
    });

    it('should return null if user not found', async () => {
      (usersService.findOneByUsername as jest.Mock).mockResolvedValue(null);

      const result = await service.validateUser('nonexistent', 'password');
      expect(result).toBeNull();
    });

    it('should return null if password invalid', async () => {
      const hashedPassword = await bcrypt.hash('password', 10);
      const user = { id: 1, username: 'test', password: hashedPassword };
      
      (usersService.findOneByUsername as jest.Mock).mockResolvedValue(user);

      const result = await service.validateUser('test', 'wrongpassword');
      expect(result).toBeNull();
    });
  });
});
