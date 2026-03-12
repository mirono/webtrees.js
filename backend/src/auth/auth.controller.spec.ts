import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            generateToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return a token if credentials are valid', async () => {
      const user = { id: 1, username: 'test' };
      const token = 'mockToken';
      
      (service.validateUser as jest.Mock).mockResolvedValue(user);
      (service.generateToken as jest.Mock).mockReturnValue(token);

      const result = await controller.login({ username: 'test', password: 'password' });
      expect(result).toEqual({ access_token: token });
      expect(service.validateUser).toHaveBeenCalledWith('test', 'password');
      expect(service.generateToken).toHaveBeenCalledWith(user);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      (service.validateUser as jest.Mock).mockResolvedValue(null);

      await expect(controller.login({ username: 'test', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return the user from the request', () => {
      const user = { userId: 1, username: 'test' };
      const req = { user };
      const result = controller.getProfile(req);
      expect(result).toEqual(user);
    });
  });
});
