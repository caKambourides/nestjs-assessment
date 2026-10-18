import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user.entity.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

export interface JwtPayload {
  sub: number;
  email: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface SafeUser {
  id: number;
  email: string;
  created_at: Date;
  updated_at: Date;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<SafeUser> {
    const { email, password } = dto;
    this.validateCredentials(email, password);

    const existing = await this.usersRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = this.usersRepository.create({ email, password: hashedPassword });
    const saved = await this.usersRepository.save(user);

    return this.toSafeUser(saved);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const { email, password } = dto;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }

  private validateCredentials(email: string, password: string): void {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }
    if (!EMAIL_REGEX.test(email)) {
      throw new BadRequestException('Invalid email address');
    }
    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }
  }

  private toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      email: user.email,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }
}
