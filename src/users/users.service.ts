import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { CurrentUser } from '../auth/interfaces/current-user.interface';
import { GetPaginationParamsDto } from '../common/dto/get-pagination-params.dto';

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
  async findAll(query: GetPaginationParamsDto) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // GET BY ID
  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // UPDATE
  async update(id: string, dto: UpdateUserDto, currentUser: CurrentUser) {
    await this.findOne(id);

    const data: any = { ...dto };

    delete data.password;

    if (!this.isAdmin(currentUser)) {
      if (currentUser.id !== id) {
        throw new ForbiddenException('You cannot update this user');
      }
      delete data.status;
    }

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
  async remove(id: string, currentUser: CurrentUser) {
    await this.findOne(id);

    if (!this.isAdmin(currentUser) && currentUser.id !== id) {
      throw new ForbiddenException('You cannot delete this user');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'BLOCKED',
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
  }

  private isAdmin(user: CurrentUser) {
    return user.roles?.includes('ADMIN');
  }
}
