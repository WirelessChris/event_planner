import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const adminExists = await this.usersService.adminExists();
    if (adminExists) {
      throw new BadRequestException('Administrator already registered');
    }

    if (registerDto.password !== registerDto.confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.usersService.findByUsername(
      registerDto.username,
    );
    if (existingUser) {
      throw new BadRequestException('Username already taken');
    }

    const user = await this.usersService.createUser(
      registerDto.username,
      registerDto.password,
      true,
    );

    return {
      message: 'Administrator account created successfully',
      user: { id: user.id, username: user.username },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByUsername(loginDto.username);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const isValid = await this.usersService.validatePassword(
      user,
      loginDto.password,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload = { sub: user.id, username: user.username };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: { id: user.id, username: user.username },
    };
  }

  async checkAdminExists(): Promise<boolean> {
    return this.usersService.adminExists();
  }
}
