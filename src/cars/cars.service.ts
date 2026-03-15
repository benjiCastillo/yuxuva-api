import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCarDto } from './dto/create-car.dto';
import { QueryCarDto } from './dto/query-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';

@Injectable()
export class CarsService {
  constructor(private prisma: PrismaService) {}

  async create(createCarDto: CreateCarDto, userId: string) {
    try {
      return await this.prisma.car.create({
        data: {
          brand: createCarDto.brand,
          model: createCarDto.model,
          year: createCarDto.year,
          ...(createCarDto.drivetrain !== undefined
            ? { drivetrain: createCarDto.drivetrain }
            : {}),
          ...(createCarDto.status !== undefined
            ? { status: createCarDto.status }
            : {}),
          createdById: userId,
        },
        select: this.baseSelect(),
      });
    } catch (error: unknown) {
      this.handleKnownErrors(error);
      throw error;
    }
  }

  async findAll(queryCarDto: QueryCarDto) {
    const { page, limit, brand, model, year, drivetrain, status } = queryCarDto;
    const skip = (page - 1) * limit;
    const where: Prisma.CarWhereInput = {};

    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' };
    }
    if (model) {
      where.model = { contains: model, mode: 'insensitive' };
    }
    if (year !== undefined) {
      where.year = year;
    }
    if (drivetrain) {
      where.drivetrain = { contains: drivetrain, mode: 'insensitive' };
    }
    if (status) {
      where.status = { equals: status, mode: 'insensitive' };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.car.findMany({
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }],
        where,
        select: {
          id: true,
          brand: true,
          model: true,
          year: true,
          drivetrain: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.car.count({ where }),
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

  async findOne(id: string) {
    const car = await this.prisma.car.findUnique({
      where: { id },
      select: {
        id: true,
        brand: true,
        model: true,
        year: true,
        drivetrain: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    return car;
  }

  async selectData() {
    return await this.prisma.car.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        brand: true,
        model: true,
        year: true,
        drivetrain: true,
        status: true,
      },
      orderBy: [{ brand: 'asc' }, { model: 'asc' }, { year: 'desc' }],
    });
  }

  async update(id: string, updateCarDto: UpdateCarDto, userId: string) {
    try {
      return await this.prisma.car.update({
        where: { id },
        data: {
          ...(updateCarDto.brand !== undefined
            ? { brand: updateCarDto.brand }
            : {}),
          ...(updateCarDto.model !== undefined
            ? { model: updateCarDto.model }
            : {}),
          ...(updateCarDto.year !== undefined ? { year: updateCarDto.year } : {}),
          ...(updateCarDto.drivetrain !== undefined
            ? { drivetrain: updateCarDto.drivetrain }
            : {}),
          ...(updateCarDto.status !== undefined
            ? { status: updateCarDto.status }
            : {}),
          updatedById: userId,
        },
        select: this.baseSelect(),
      });
    } catch (error: unknown) {
      this.handleKnownErrors(error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.car.delete({
        where: { id },
        select: {
          id: true,
          brand: true,
          model: true,
          year: true,
        },
      });
    } catch (error: unknown) {
      this.handleKnownErrors(error);
      throw error;
    }
  }

  private baseSelect() {
    return {
      id: true,
      brand: true,
      model: true,
      year: true,
      drivetrain: true,
      status: true,
    } satisfies Prisma.CarSelect;
  }

  private handleKnownErrors(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Car not found');
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      throw new BadRequestException(
        'No se puede eliminar el auto porque tiene registros asociados.',
      );
    }
  }
}
