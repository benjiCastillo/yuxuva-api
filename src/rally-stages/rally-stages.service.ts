import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRallyStageDto } from './dto/create-rally-stage.dto';
import { QueryRallyStageDto } from './dto/query-rally-stage.dto';
import { UpdateRallyStageDto } from './dto/update-rally-stage.dto';

@Injectable()
export class RallyStagesService {
  constructor(private prisma: PrismaService) {}

  async create(createRallyStageDto: CreateRallyStageDto, userId: string) {
    await this.validateRally(createRallyStageDto.rallyId);

    try {
      return await this.prisma.rallyStage.create({
        data: {
          rally: { connect: { id: createRallyStageDto.rallyId } },
          name: createRallyStageDto.name,
          stageType: createRallyStageDto.stageType,
          stageOrder: createRallyStageDto.stageOrder,
          distanceKm: createRallyStageDto.distanceKm,
          createdById: userId,
        },
        select: this.baseSelect(),
      });
    } catch (error: unknown) {
      this.handleKnownErrors(error);
      throw error;
    }
  }

  async findAll(queryRallyStageDto: QueryRallyStageDto) {
    const {
      page,
      limit,
      rallyId,
      calendarId,
      championshipId,
      associationId,
      name,
      stageType,
      stageOrder,
      distanceKmFrom,
      distanceKmTo,
    } = queryRallyStageDto;
    const skip = (page - 1) * limit;
    const where: Prisma.RallyStageWhereInput = {};
    const rallyWhere: Prisma.RallyWhereInput = {};
    const calendarWhere: Prisma.ChampionshipCalendarWhereInput = {};

    if (rallyId) {
      where.rallyId = rallyId;
    }
    if (calendarId) {
      rallyWhere.calendarId = calendarId;
    }
    if (championshipId) {
      calendarWhere.championshipId = championshipId;
    }
    if (associationId) {
      calendarWhere.associationId = associationId;
    }
    if (Object.keys(calendarWhere).length > 0) {
      rallyWhere.calendar = calendarWhere;
    }
    if (Object.keys(rallyWhere).length > 0) {
      where.rally = rallyWhere;
    }
    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    if (stageType) {
      where.stageType = { equals: stageType, mode: 'insensitive' };
    }
    if (stageOrder !== undefined) {
      where.stageOrder = stageOrder;
    }
    if (distanceKmFrom !== undefined || distanceKmTo !== undefined) {
      where.distanceKm = {
        ...(distanceKmFrom !== undefined ? { gte: distanceKmFrom } : {}),
        ...(distanceKmTo !== undefined ? { lte: distanceKmTo } : {}),
      };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.rallyStage.findMany({
        skip,
        take: limit,
        where,
        orderBy: [{ stageOrder: 'asc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          rallyId: true,
          name: true,
          stageType: true,
          stageOrder: true,
          distanceKm: true,
          rally: {
            select: {
              id: true,
              totalKm: true,
              calendar: {
                select: {
                  id: true,
                  roundNumber: true,
                  eventName: true,
                  startDate: true,
                  endDate: true,
                  status: true,
                  championship: {
                    select: {
                      id: true,
                      name: true,
                      season: true,
                    },
                  },
                  association: {
                    select: {
                      id: true,
                      name: true,
                      department: true,
                    },
                  },
                },
              },
            },
          },
          createdAt: true,
        },
      }),
      this.prisma.rallyStage.count({ where }),
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
    const rallyStage = await (this.prisma.rallyStage as any).findUnique({
      where: { id },
      select: {
        id: true,
        rallyId: true,
        name: true,
        stageType: true,
        stageOrder: true,
        distanceKm: true,
        rally: {
          select: {
            id: true,
            totalKm: true,
            calendar: {
              select: {
                id: true,
                roundNumber: true,
                eventName: true,
                startDate: true,
                endDate: true,
                status: true,
                championship: {
                  select: {
                    id: true,
                    name: true,
                    season: true,
                    modality: true,
                  },
                },
                association: {
                  select: {
                    id: true,
                    name: true,
                    department: true,
                  },
                },
              },
            },
          },
        },
        schedules: {
          select: {
            id: true,
            teamId: true,
            startOrder: true,
            status: true,
            scheduledStartTime: true,
            result: {
              select: {
                id: true,
                time: true,
                penalty: true,
                status: true,
                createdAt: true,
              },
            },
            createdAt: true,
          },
          orderBy: { startOrder: 'asc' },
        },
        createdAt: true,
      },
    });

    if (!rallyStage) {
      throw new NotFoundException('Rally stage not found');
    }

    return rallyStage;
  }

  async selectData() {
    return await this.prisma.rallyStage.findMany({
      where: {
        rally: {
          calendar: {
            status: {
              in: ['SCHEDULED', 'ONGOING'],
            },
          },
        },
      },
      select: {
        id: true,
        rallyId: true,
        name: true,
        stageType: true,
        stageOrder: true,
        distanceKm: true,
        rally: {
          select: {
            calendar: {
              select: {
                eventName: true,
                roundNumber: true,
                championship: {
                  select: {
                    name: true,
                    season: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ stageOrder: 'asc' }],
    });
  }

  async update(
    id: string,
    updateRallyStageDto: UpdateRallyStageDto,
    userId: string,
  ) {
    if (updateRallyStageDto.rallyId) {
      await this.validateRally(updateRallyStageDto.rallyId);
    }

    try {
      return await this.prisma.rallyStage.update({
        where: { id },
        data: {
          ...(updateRallyStageDto.rallyId
            ? { rally: { connect: { id: updateRallyStageDto.rallyId } } }
            : {}),
          ...(updateRallyStageDto.name !== undefined
            ? { name: updateRallyStageDto.name }
            : {}),
          ...(updateRallyStageDto.stageType !== undefined
            ? { stageType: updateRallyStageDto.stageType }
            : {}),
          ...(updateRallyStageDto.stageOrder !== undefined
            ? { stageOrder: updateRallyStageDto.stageOrder }
            : {}),
          ...(updateRallyStageDto.distanceKm !== undefined
            ? { distanceKm: updateRallyStageDto.distanceKm }
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
      return await this.prisma.rallyStage.delete({
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
        throw new NotFoundException('Rally stage not found');
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'No se puede eliminar la etapa porque tiene datos asociados.',
        );
      }
      throw error;
    }
  }

  private async validateRally(rallyId: string) {
    const rally = await this.prisma.rally.findUnique({
      where: { id: rallyId },
      select: {
        id: true,
        calendar: {
          select: {
            championship: {
              select: {
                modality: true,
              },
            },
          },
        },
      },
    });

    if (!rally) {
      throw new NotFoundException('Rally not found');
    }

    if (rally.calendar.championship.modality !== 'RALLY') {
      throw new BadRequestException(
        'El rally seleccionado no pertenece a un campeonato de rally válido.',
      );
    }
  }

  private handleKnownErrors(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Rally stage not found');
    }
  }

  private baseSelect() {
    return {
      id: true,
      rallyId: true,
      name: true,
      stageType: true,
      stageOrder: true,
      distanceKm: true,
      rally: {
        select: {
          id: true,
          totalKm: true,
          calendar: {
            select: {
              id: true,
              roundNumber: true,
              eventName: true,
              startDate: true,
              endDate: true,
              status: true,
            },
          },
        },
      },
      createdAt: true,
    } satisfies Prisma.RallyStageSelect;
  }
}
