import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { CreateChampionshipDto } from './dto/create-championship.dto';
import { UpdateChampionshipDto } from './dto/update-championship.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryChampionshipDto } from './dto/query-championship.dto';

@Injectable()
export class ChampionshipsService {
  constructor(private prisma: PrismaService) {}

  async create(createChampionshipDto: CreateChampionshipDto, userId: string) {
    const federation = await this.prisma.federation.findUnique({
      where: { id: createChampionshipDto.federationId },
      select: { id: true },
    });

    if (!federation) {
      throw new NotFoundException('Federation not found');
    }

    try {
      return await this.prisma.championship.create({
        data: {
          name: createChampionshipDto.name,
          modality: createChampionshipDto.modality,
          season: createChampionshipDto.season,
          ...(createChampionshipDto.status
            ? { status: createChampionshipDto.status }
            : {}),
          federation: {
            connect: {
              id: createChampionshipDto.federationId,
            },
          },
          createdById: userId,
        },
        select: {
          id: true,
          name: true,
          modality: true,
          season: true,
          status: true,
          federation: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'El nombre ya existe para esta federación y temporada.',
        );
      }
      throw error;
    }
  }

  async findAll(queryChampionshipDto: QueryChampionshipDto) {
    const { page, limit, name, season, modality, status, federationId } =
      queryChampionshipDto;
    const skip = (page - 1) * limit;
    const where: Prisma.ChampionshipWhereInput = {};

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    if (season !== undefined) {
      where.season = season;
    }
    if (modality) {
      where.modality = { equals: modality, mode: 'insensitive' };
    }
    if (status) {
      where.status = { equals: status, mode: 'insensitive' };
    }
    if (federationId) {
      where.federationId = federationId;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.championship.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          modality: true,
          season: true,
          status: true,
          federationId: true,
          federation: {
            select: {
              acronym: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        where,
      }),
      this.prisma.championship.count({
        where,
      }),
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
    const championship = await this.prisma.championship.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        modality: true,
        season: true,
        status: true,
        federationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!championship) {
      throw new NotFoundException('Championship not found');
    }
    return championship;
  }

  update(
    id: string,
    updateChampionshipDto: UpdateChampionshipDto,
    userId: string,
  ) {
    return this.prisma.championship.update({
      where: { id },
      data: {
        ...updateChampionshipDto,
        updatedById: userId,
      },
      select: {
        id: true,
        name: true,
        modality: true,
        season: true,
        status: true,
        federationId: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    try {
      return await this.prisma.championship.delete({
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
        throw new NotFoundException('Championship not found');
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'No se puede eliminar el campeonato porque tiene calendarios asociados.',
        );
      }
      throw error;
    }
  }
}
