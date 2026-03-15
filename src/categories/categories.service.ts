import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string) {
    const championship = await this.prisma.championship.findUnique({
      where: { id: createCategoryDto.championshipId },
      select: { id: true, modality: true },
    });

    if (!championship) {
      throw new NotFoundException('Championship not found');
    }

    if (championship.modality !== createCategoryDto.modality) {
      throw new BadRequestException(
        'La modalidad de la categoría debe coincidir con la del campeonato.',
      );
    }

    try {
      return await this.prisma.category.create({
        data: {
          name: createCategoryDto.name,
          modality: createCategoryDto.modality,
          ...(createCategoryDto.allowsCodriver !== undefined
            ? { allowsCodriver: createCategoryDto.allowsCodriver }
            : {}),
          ...(createCategoryDto.pointsApply !== undefined
            ? { pointsApply: createCategoryDto.pointsApply }
            : {}),
          championship: {
            connect: { id: createCategoryDto.championshipId },
          },
          createdById: userId,
        },
        select: this.baseSelect(),
      });
    } catch (error: unknown) {
      this.handleKnownErrors(error);
      throw error;
    }
  }

  async findAll(queryCategoryDto: QueryCategoryDto) {
    const {
      page,
      limit,
      name,
      modality,
      allowsCodriver,
      pointsApply,
      championshipId,
    } = queryCategoryDto;
    const skip = (page - 1) * limit;
    const where: Prisma.CategoryWhereInput = {};

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    if (modality) {
      where.modality = { equals: modality, mode: 'insensitive' };
    }
    if (allowsCodriver !== undefined) {
      where.allowsCodriver = allowsCodriver;
    }
    if (pointsApply !== undefined) {
      where.pointsApply = pointsApply;
    }
    if (championshipId) {
      where.championshipId = championshipId;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
        select: {
          id: true,
          championshipId: true,
          name: true,
          modality: true,
          allowsCodriver: true,
          pointsApply: true,
          championship: {
            select: {
              id: true,
              name: true,
              season: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.category.count({ where }),
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
    const category = await this.prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        championshipId: true,
        name: true,
        modality: true,
        allowsCodriver: true,
        pointsApply: true,
        championship: {
          select: {
            id: true,
            name: true,
            season: true,
            modality: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async selectData() {
    return await this.prisma.category.findMany({
      select: {
        id: true,
        championshipId: true,
        name: true,
        modality: true,
        allowsCodriver: true,
        pointsApply: true,
        championship: {
          select: {
            name: true,
            season: true,
            modality: true,
          },
        },
      },
      orderBy: [{ name: 'asc' }],
    });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, userId: string) {
    const currentCategory = await this.prisma.category.findUnique({
      where: { id },
      select: { id: true, championshipId: true, modality: true },
    });

    if (!currentCategory) {
      throw new NotFoundException('Category not found');
    }

    const nextChampionshipId =
      updateCategoryDto.championshipId ?? currentCategory.championshipId;
    const nextModality = updateCategoryDto.modality ?? currentCategory.modality;

    if (
      updateCategoryDto.championshipId !== undefined ||
      updateCategoryDto.modality !== undefined
    ) {
      const championship = await this.prisma.championship.findUnique({
        where: { id: nextChampionshipId },
        select: { id: true, modality: true },
      });

      if (!championship) {
        throw new NotFoundException('Championship not found');
      }

      if (championship.modality !== nextModality) {
        throw new BadRequestException(
          'La modalidad de la categoría debe coincidir con la del campeonato.',
        );
      }
    }

    try {
      return await this.prisma.category.update({
        where: { id },
        data: {
          ...(updateCategoryDto.name !== undefined
            ? { name: updateCategoryDto.name }
            : {}),
          ...(updateCategoryDto.modality !== undefined
            ? { modality: updateCategoryDto.modality }
            : {}),
          ...(updateCategoryDto.allowsCodriver !== undefined
            ? { allowsCodriver: updateCategoryDto.allowsCodriver }
            : {}),
          ...(updateCategoryDto.pointsApply !== undefined
            ? { pointsApply: updateCategoryDto.pointsApply }
            : {}),
          ...(updateCategoryDto.championshipId
            ? {
                championship: {
                  connect: { id: updateCategoryDto.championshipId },
                },
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
      return await this.prisma.category.delete({
        where: { id },
        select: {
          id: true,
          name: true,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Category not found');
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'No se puede eliminar la categoría porque tiene datos asociados.',
        );
      }
      throw error;
    }
  }

  private handleKnownErrors(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Category not found');
    }
  }

  private baseSelect() {
    return {
      id: true,
      championshipId: true,
      name: true,
      modality: true,
      allowsCodriver: true,
      pointsApply: true,
      championship: {
        select: {
          id: true,
          name: true,
          season: true,
          modality: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    } satisfies Prisma.CategorySelect;
  }
}
