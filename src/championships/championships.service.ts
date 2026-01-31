import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChampionshipDto } from './dto/create-championship.dto';
import { UpdateChampionshipDto } from './dto/update-championship.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryChampionshipDto } from './dto/query-championship.dto';

@Injectable()
export class ChampionshipsService {
  constructor(private prisma: PrismaService) {}

  create(createChampionshipDto: CreateChampionshipDto, userId: string) {
    return this.prisma.championship.create({
      data: {
        name: createChampionshipDto.name,
        modality: createChampionshipDto.modality,
        season: createChampionshipDto.season,
        status: createChampionshipDto.status,
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
  }

  async findAll(queryChampionshipDto: QueryChampionshipDto) {
    const { page, limit } = queryChampionshipDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.championship.findMany({
        skip,
        take: queryChampionshipDto.limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      this.prisma.championship.count(),
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

  remove(id: number) {
    return `This action removes a #${id} championship`;
  }
}
