import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRallyStageResultDto } from './dto/create-rally-stage-result.dto';
import { QueryRallyStageResultDto } from './dto/query-rally-stage-result.dto';
import { UpdateRallyStageResultDto } from './dto/update-rally-stage-result.dto';

@Injectable()
export class RallyStageResultsService {
  constructor(private prisma: PrismaService) {}

  private get rallyStageResultDelegate(): any {
    return this.prisma.rallyStageResult;
  }

  async create(
    createRallyStageResultDto: CreateRallyStageResultDto,
    userId: string,
  ) {
    await this.validateRelations(
      createRallyStageResultDto.stageId,
      createRallyStageResultDto.teamId,
    );
    const time = this.calculateTime(
      createRallyStageResultDto.startTime,
      createRallyStageResultDto.endTime,
    );

    try {
      return await this.rallyStageResultDelegate.create({
        data: {
          stage: { connect: { id: createRallyStageResultDto.stageId } },
          team: { connect: { id: createRallyStageResultDto.teamId } },
          startTime: new Date(createRallyStageResultDto.startTime),
          endTime: new Date(createRallyStageResultDto.endTime),
          time,
          ...(createRallyStageResultDto.penalty !== undefined
            ? { penalty: createRallyStageResultDto.penalty }
            : {}),
          ...(createRallyStageResultDto.status
            ? { status: createRallyStageResultDto.status }
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

  async findAll(queryRallyStageResultDto: QueryRallyStageResultDto) {
    const {
      page,
      limit,
      stageId,
      rallyId,
      calendarId,
      teamId,
      championshipId,
      categoryId,
      status,
      timeFrom,
      timeTo,
    } = queryRallyStageResultDto;
    const skip = (page - 1) * limit;
    const where: Prisma.RallyStageResultWhereInput = {};
    const stageWhere: Prisma.RallyStageWhereInput = {};
    const rallyWhere: Prisma.RallyWhereInput = {};
    const calendarWhere: Prisma.ChampionshipCalendarWhereInput = {};
    const teamWhere: Prisma.TeamWhereInput = {};

    if (stageId) {
      where.stageId = stageId;
    }
    if (rallyId) {
      stageWhere.rallyId = rallyId;
    }
    if (calendarId) {
      rallyWhere.calendarId = calendarId;
    }
    if (championshipId) {
      calendarWhere.championshipId = championshipId;
      teamWhere.championshipId = championshipId;
    }
    if (Object.keys(calendarWhere).length > 0) {
      rallyWhere.calendar = calendarWhere;
    }
    if (Object.keys(rallyWhere).length > 0) {
      stageWhere.rally = rallyWhere;
    }
    if (Object.keys(stageWhere).length > 0) {
      where.stage = stageWhere;
    }
    if (teamId) {
      where.teamId = teamId;
    }
    if (categoryId) {
      teamWhere.categoryId = categoryId;
    }
    if (Object.keys(teamWhere).length > 0) {
      where.team = teamWhere;
    }
    if (status) {
      where.status = { equals: status, mode: 'insensitive' };
    }
    if (timeFrom !== undefined || timeTo !== undefined) {
      where.time = {
        ...(timeFrom !== undefined ? { gte: timeFrom } : {}),
        ...(timeTo !== undefined ? { lte: timeTo } : {}),
      };
    }

    const [data, total] = await this.prisma.$transaction([
      this.rallyStageResultDelegate.findMany({
        skip,
        take: limit,
        where,
        orderBy: [
          { stage: { stageOrder: 'asc' } },
          { time: 'asc' },
          { penalty: 'asc' },
        ],
        select: {
          id: true,
          stageId: true,
          teamId: true,
          startTime: true,
          endTime: true,
          time: true,
          penalty: true,
          status: true,
          stage: {
            select: {
              id: true,
              name: true,
              stageType: true,
              stageOrder: true,
              distanceKm: true,
              rally: {
                select: {
                  id: true,
                  calendar: {
                    select: {
                      id: true,
                      eventName: true,
                      roundNumber: true,
                      championship: {
                        select: {
                          id: true,
                          name: true,
                          season: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          team: {
            select: {
              id: true,
              competitionNo: true,
              status: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
              driver: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
              codriver: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          createdAt: true,
        },
      }),
      this.rallyStageResultDelegate.count({ where }),
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
    const result = await this.rallyStageResultDelegate.findUnique({
      where: { id },
      select: {
        id: true,
        stageId: true,
        teamId: true,
        startTime: true,
        endTime: true,
        time: true,
        penalty: true,
        status: true,
        stage: {
          select: {
            id: true,
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
                    eventName: true,
                    roundNumber: true,
                    championship: {
                      select: {
                        id: true,
                        name: true,
                        season: true,
                        modality: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        team: {
          select: {
            id: true,
            championshipId: true,
            categoryId: true,
            competitionNo: true,
            status: true,
            category: {
              select: {
                id: true,
                name: true,
                modality: true,
              },
            },
            driver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                licenseNumber: true,
              },
            },
            codriver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                licenseNumber: true,
              },
            },
          },
        },
        createdAt: true,
      },
    });

    if (!result) {
      throw new NotFoundException('Rally stage result not found');
    }

    return result;
  }

  async selectData() {
    return await this.rallyStageResultDelegate.findMany({
      where: {
        stage: {
          rally: {
            calendar: {
              status: {
                in: ['SCHEDULED', 'ONGOING'],
              },
            },
          },
        },
      },
      select: {
        id: true,
        stageId: true,
        teamId: true,
        startTime: true,
        endTime: true,
        time: true,
        penalty: true,
        status: true,
        stage: {
          select: {
            name: true,
            stageOrder: true,
            rally: {
              select: {
                calendar: {
                  select: {
                    eventName: true,
                    roundNumber: true,
                  },
                },
              },
            },
          },
        },
        team: {
          select: {
            competitionNo: true,
            driver: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: [
        { stage: { stageOrder: 'asc' } },
        { time: 'asc' },
        { penalty: 'asc' },
      ],
    });
  }

  async update(
    id: string,
    updateRallyStageResultDto: UpdateRallyStageResultDto,
    userId: string,
  ) {
    let currentResult:
      | {
          stageId: string;
          teamId: string;
          startTime: Date;
          endTime: Date;
        }
      | null = null;

    if (updateRallyStageResultDto.stageId || updateRallyStageResultDto.teamId) {
      currentResult = await this.rallyStageResultDelegate.findUnique({
        where: { id },
        select: {
          stageId: true,
          teamId: true,
          startTime: true,
          endTime: true,
        },
      });

      if (!currentResult) {
        throw new NotFoundException('Rally stage result not found');
      }

      await this.validateRelations(
        updateRallyStageResultDto.stageId ?? currentResult.stageId,
        updateRallyStageResultDto.teamId ?? currentResult.teamId,
      );
    }

    if (
      updateRallyStageResultDto.startTime ||
      updateRallyStageResultDto.endTime
    ) {
      currentResult ??= await this.rallyStageResultDelegate.findUnique({
        where: { id },
        select: {
          stageId: true,
          teamId: true,
          startTime: true,
          endTime: true,
        },
      });

      if (!currentResult) {
        throw new NotFoundException('Rally stage result not found');
      }
    }

    const nextStartTime =
      updateRallyStageResultDto.startTime ?? currentResult?.startTime.toISOString();
    const nextEndTime =
      updateRallyStageResultDto.endTime ?? currentResult?.endTime.toISOString();
    const nextTime =
      nextStartTime && nextEndTime
        ? this.calculateTime(nextStartTime, nextEndTime)
        : undefined;

    try {
      return await this.rallyStageResultDelegate.update({
        where: { id },
        data: {
          ...(updateRallyStageResultDto.stageId
            ? { stage: { connect: { id: updateRallyStageResultDto.stageId } } }
            : {}),
          ...(updateRallyStageResultDto.teamId
            ? { team: { connect: { id: updateRallyStageResultDto.teamId } } }
            : {}),
          ...(updateRallyStageResultDto.startTime
            ? { startTime: new Date(updateRallyStageResultDto.startTime) }
            : {}),
          ...(updateRallyStageResultDto.endTime
            ? { endTime: new Date(updateRallyStageResultDto.endTime) }
            : {}),
          ...(nextTime !== undefined
            ? { time: nextTime }
            : {}),
          ...(updateRallyStageResultDto.penalty !== undefined
            ? { penalty: updateRallyStageResultDto.penalty }
            : {}),
          ...(updateRallyStageResultDto.status !== undefined
            ? { status: updateRallyStageResultDto.status }
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
      return await this.rallyStageResultDelegate.delete({
        where: { id },
        select: {
          id: true,
          stageId: true,
          teamId: true,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Rally stage result not found');
      }
      throw error;
    }
  }

  private async validateRelations(stageId: string, teamId: string) {
    const [stage, team] = await Promise.all([
      this.prisma.rallyStage.findUnique({
        where: { id: stageId },
        select: {
          id: true,
          rally: {
            select: {
              calendar: {
                select: {
                  championshipId: true,
                  championship: {
                    select: {
                      modality: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.team.findUnique({
        where: { id: teamId },
        select: {
          id: true,
          championshipId: true,
          category: {
            select: {
              modality: true,
            },
          },
        },
      }),
    ]);

    if (!stage) {
      throw new NotFoundException('Rally stage not found');
    }

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (stage.rally.calendar.championship.modality !== 'RALLY') {
      throw new BadRequestException(
        'La etapa seleccionada no pertenece a un campeonato de rally.',
      );
    }

    if (team.category.modality !== 'RALLY') {
      throw new BadRequestException(
        'El equipo seleccionado no pertenece a una categoria de rally.',
      );
    }

    if (stage.rally.calendar.championshipId !== team.championshipId) {
      throw new BadRequestException(
        'El equipo no pertenece al mismo campeonato de la etapa seleccionada.',
      );
    }
  }

  private handleKnownErrors(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new BadRequestException(
        'Ya existe un resultado para este equipo en la etapa seleccionada.',
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Rally stage result not found');
    }
  }

  private baseSelect() {
    return {
      id: true,
      stageId: true,
      teamId: true,
      startTime: true,
      endTime: true,
      time: true,
      penalty: true,
      status: true,
      stage: {
        select: {
          id: true,
          name: true,
          stageOrder: true,
        },
      },
      team: {
        select: {
          id: true,
          competitionNo: true,
        },
      },
      createdAt: true,
    } as any;
  }

  private calculateTime(startTime: string, endTime: string) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = end.getTime() - start.getTime();

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException(
        'Las fechas de inicio y fin deben ser validas.',
      );
    }

    if (diff < 0) {
      throw new BadRequestException(
        'La hora de llegada no puede ser menor que la hora de partida.',
      );
    }

    return diff;
  }
}
