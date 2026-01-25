import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // REGISTER
  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
      },
    });
  }

  // LIST
  async findAll() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
      },
    });
  }

  // GET BY ID
  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // UPDATE
  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    const data: any = { ...dto };

    delete data.password;

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  // SOFT DELETE
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'BLOCKED',
      },
    });
  }
}
