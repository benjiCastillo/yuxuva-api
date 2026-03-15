import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCarCategoryDto } from './dto/create-car-category.dto';
import { QueryCarCategoryDto } from './dto/query-car-category.dto';
import { UpdateCarCategoryDto } from './dto/update-car-category.dto';

@Injectable()
export class CarCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCarCategoryDto: CreateCarCategoryDto, userId: string) {
    await this.validateRelations(
      createCarCategoryDto.carId,
      createCarCategoryDto.categoryId,
    );
    this.validateDateRange(
      createCarCategoryDto.validFrom,
      createCarCategoryDto.validTo,
    );

    try {
      return await this.prisma.carCategory.create({
        data: {
          car: { connect: { id: createCarCategoryDto.carId } },
          category: { connect: { id: createCarCategoryDto.categoryId } },
          validFrom: new Date(createCarCategoryDto.validFrom),
          ...(createCarCategoryDto.validTo
            ? { validTo: new Date(createCarCategoryDto.validTo) }
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

  async findAll(queryCarCategoryDto: QueryCarCategoryDto) {
    const {
      page,
      limit,
      carId,
      categoryId,
      validFromFrom,
      validFromTo,
      validToFrom,
      validToTo,
    } = queryCarCategoryDto;
    const skip = (page - 1) * limit;
    const where: Prisma.CarCategoryWhereInput = {};

    if (carId) {
      where.carId = carId;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (validFromFrom || validFromTo) {
      where.validFrom = {
        ...(validFromFrom ? { gte: new Date(validFromFrom) } : {}),
        ...(validFromTo ? { lte: new Date(validFromTo) } : {}),
      };
    }
    if (validToFrom || validToTo) {
      where.validTo = {
        ...(validToFrom ? { gte: new Date(validToFrom) } : {}),
        ...(validToTo ? { lte: new Date(validToTo) } : {}),
      };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.carCategory.findMany({
        skip,
        take: limit,
        where,
        orderBy: [{ validFrom: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          carId: true,
          categoryId: true,
          validFrom: true,
          validTo: true,
          car: {
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              modality: true,
            },
          },
          createdAt: true,
        },
      }),
      this.prisma.carCategory.count({ where }),
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
    const carCategory = await this.prisma.carCategory.findUnique({
      where: { id },
      select: {
        id: true,
        carId: true,
        categoryId: true,
        validFrom: true,
        validTo: true,
        car: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            drivetrain: true,
            status: true,
          },
        },
        category: {
          select: {
            id: true,
            championshipId: true,
            name: true,
            modality: true,
            allowsCodriver: true,
            pointsApply: true,
          },
        },
        createdAt: true,
      },
    });

    if (!carCategory) {
      throw new NotFoundException('Car category not found');
    }

    return carCategory;
  }

  async selectData() {
    return await this.prisma.carCategory.findMany({
      select: {
        id: true,
        carId: true,
        categoryId: true,
        validFrom: true,
        validTo: true,
        car: {
          select: {
            brand: true,
            model: true,
            year: true,
          },
        },
        category: {
          select: {
            name: true,
            modality: true,
          },
        },
      },
      orderBy: [{ validFrom: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async update(
    id: string,
    updateCarCategoryDto: UpdateCarCategoryDto,
    userId: string,
  ) {
    const currentCarCategory = await this.prisma.carCategory.findUnique({
      where: { id },
      select: {
        id: true,
        carId: true,
        categoryId: true,
        validFrom: true,
        validTo: true,
      },
    });

    if (!currentCarCategory) {
      throw new NotFoundException('Car category not found');
    }

    const nextCarId = updateCarCategoryDto.carId ?? currentCarCategory.carId;
    const nextCategoryId =
      updateCarCategoryDto.categoryId ?? currentCarCategory.categoryId;
    const nextValidFrom =
      updateCarCategoryDto.validFrom ??
      currentCarCategory.validFrom.toISOString();
    const nextValidTo =
      updateCarCategoryDto.validTo === undefined
        ? currentCarCategory.validTo?.toISOString()
        : updateCarCategoryDto.validTo;

    if (
      updateCarCategoryDto.carId !== undefined ||
      updateCarCategoryDto.categoryId !== undefined
    ) {
      await this.validateRelations(nextCarId, nextCategoryId);
    }

    if (
      updateCarCategoryDto.validFrom !== undefined ||
      updateCarCategoryDto.validTo !== undefined
    ) {
      this.validateDateRange(nextValidFrom, nextValidTo);
    }

    try {
      return await this.prisma.carCategory.update({
        where: { id },
        data: {
          ...(updateCarCategoryDto.carId
            ? { car: { connect: { id: updateCarCategoryDto.carId } } }
            : {}),
          ...(updateCarCategoryDto.categoryId
            ? {
                category: {
                  connect: { id: updateCarCategoryDto.categoryId },
                },
              }
            : {}),
          ...(updateCarCategoryDto.validFrom !== undefined
            ? { validFrom: new Date(updateCarCategoryDto.validFrom) }
            : {}),
          ...(updateCarCategoryDto.validTo !== undefined
            ? {
                validTo: updateCarCategoryDto.validTo
                  ? new Date(updateCarCategoryDto.validTo)
                  : null,
              }
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
      return await this.prisma.carCategory.delete({
        where: { id },
        select: {
          id: true,
          carId: true,
          categoryId: true,
        },
      });
    } catch (error: unknown) {
      this.handleKnownErrors(error);
      throw error;
    }
  }

  private async validateRelations(carId: string, categoryId: string) {
    const [car, category] = await this.prisma.$transaction([
      this.prisma.car.findUnique({
        where: { id: carId },
        select: { id: true },
      }),
      this.prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true },
      }),
    ]);

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    if (!category) {
      throw new NotFoundException('Category not found');
    }
  }

  private validateDateRange(validFrom: string, validTo?: string) {
    if (!validTo) {
      return;
    }

    if (new Date(validTo) < new Date(validFrom)) {
      throw new BadRequestException(
        'La fecha validTo no puede ser anterior a validFrom.',
      );
    }
  }

  private baseSelect() {
    return {
      id: true,
      carId: true,
      categoryId: true,
      validFrom: true,
      validTo: true,
      car: {
        select: {
          id: true,
          brand: true,
          model: true,
          year: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          modality: true,
        },
      },
    } satisfies Prisma.CarCategorySelect;
  }

  private handleKnownErrors(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Car category not found');
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new BadRequestException(
        'Ya existe una asignación para este auto, categoría y fecha de vigencia.',
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      throw new BadRequestException(
        'No se puede completar la operación por relaciones inválidas o registros asociados.',
      );
    }
  }
}
