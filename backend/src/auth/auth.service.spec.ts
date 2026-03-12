import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

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
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
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
      const payload = { username: 'test' };
      const token = service.generateToken(payload);
      expect(token).toEqual('mockToken');
      expect(jwtService.sign).toHaveBeenCalledWith(payload);
    });
  });
});
