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
    await this.validateSchedule(createRallyStageResultDto.scheduleId);
    await this.ensureScheduleHasNoResult(createRallyStageResultDto.scheduleId);
    const time = this.calculateTime(
      createRallyStageResultDto.startTime,
      createRallyStageResultDto.endTime,
    );

    try {
      return await this.rallyStageResultDelegate.create({
        data: {
          schedule: { connect: { id: createRallyStageResultDto.scheduleId } },
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
      scheduleId,
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
    const where: any = {};
    const scheduleWhere: any = {};
    const stageWhere: Prisma.RallyStageWhereInput = {};
    const rallyWhere: Prisma.RallyWhereInput = {};
    const calendarWhere: Prisma.ChampionshipCalendarWhereInput = {};
    const teamWhere: Prisma.TeamWhereInput = {};

    if (scheduleId) {
      where.scheduleId = scheduleId;
    }
    if (stageId) {
      scheduleWhere.stageId = stageId;
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
      scheduleWhere.stage = stageWhere;
    }
    if (teamId) {
      scheduleWhere.teamId = teamId;
    }
    if (categoryId) {
      teamWhere.categoryId = categoryId;
    }
    if (Object.keys(teamWhere).length > 0) {
      scheduleWhere.team = teamWhere;
    }
    if (Object.keys(scheduleWhere).length > 0) {
      where.schedule = scheduleWhere;
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
          { schedule: { stage: { stageOrder: 'asc' } } },
          { time: 'asc' },
          { penalty: 'asc' },
        ],
        select: this.detailedSelect(),
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
      select: this.detailedSelect(),
    });

    if (!result) {
      throw new NotFoundException('Rally stage result not found');
    }

    return result;
  }

  async selectData() {
    return await this.rallyStageResultDelegate.findMany({
      where: {
        schedule: {
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
      },
      select: {
        id: true,
        scheduleId: true,
        startTime: true,
        endTime: true,
        time: true,
        penalty: true,
        status: true,
        schedule: {
          select: {
            categoryId: true,
            startOrder: true,
            scheduledStartTime: true,
            category: {
              select: {
                name: true,
              },
            },
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
        },
      },
      orderBy: [
        { schedule: { stage: { stageOrder: 'asc' } } },
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
          scheduleId: string;
          startTime: Date;
          endTime: Date;
        }
      | null = null;

    if (updateRallyStageResultDto.scheduleId) {
      await this.validateSchedule(updateRallyStageResultDto.scheduleId);
    }

    if (
      updateRallyStageResultDto.startTime ||
      updateRallyStageResultDto.endTime
    ) {
      currentResult = await this.rallyStageResultDelegate.findUnique({
        where: { id },
        select: {
          scheduleId: true,
          startTime: true,
          endTime: true,
        },
      });

      if (!currentResult) {
        throw new NotFoundException('Rally stage result not found');
      }
    }

    const nextStartTime =
      updateRallyStageResultDto.startTime ??
      currentResult?.startTime.toISOString();
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
          ...(updateRallyStageResultDto.scheduleId
            ? {
                schedule: {
                  connect: { id: updateRallyStageResultDto.scheduleId },
                },
              }
            : {}),
          ...(updateRallyStageResultDto.startTime
            ? { startTime: new Date(updateRallyStageResultDto.startTime) }
            : {}),
          ...(updateRallyStageResultDto.endTime
            ? { endTime: new Date(updateRallyStageResultDto.endTime) }
            : {}),
          ...(nextTime !== undefined ? { time: nextTime } : {}),
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
          scheduleId: true,
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

  private async validateSchedule(scheduleId: string) {
    const schedule = await (this.prisma as any).rallyStageSchedule.findUnique({
      where: { id: scheduleId },
      select: {
        id: true,
        stage: {
          select: {
            id: true,
            rally: {
              select: {
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
            },
          },
        },
        team: {
          select: {
            id: true,
            category: {
              select: {
                modality: true,
              },
            },
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Rally stage schedule not found');
    }

    if (schedule.stage.rally.calendar.championship.modality !== 'RALLY') {
      throw new BadRequestException(
        'La programacion seleccionada no pertenece a un campeonato de rally.',
      );
    }

    if (schedule.team.category.modality !== 'RALLY') {
      throw new BadRequestException(
        'El equipo programado no pertenece a una categoria de rally.',
      );
    }
  }

  private async ensureScheduleHasNoResult(scheduleId: string) {
    const existingResult = await this.rallyStageResultDelegate.findUnique({
      where: { scheduleId },
      select: { id: true },
    });

    if (existingResult) {
      throw new BadRequestException(
        'La programacion seleccionada ya tiene un resultado registrado.',
      );
    }
  }

  private handleKnownErrors(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === 'P2002' || error.code === 'P2014')
    ) {
      throw new BadRequestException(
        'Ya existe un resultado para la programacion seleccionada.',
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
      scheduleId: true,
      startTime: true,
      endTime: true,
      time: true,
      penalty: true,
      status: true,
      schedule: {
        select: {
          id: true,
          startOrder: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
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
        },
      },
      createdAt: true,
    } as any;
  }

  private detailedSelect() {
    return {
      id: true,
      scheduleId: true,
      startTime: true,
      endTime: true,
      time: true,
      penalty: true,
      status: true,
      schedule: {
        select: {
          id: true,
          stageId: true,
          categoryId: true,
          teamId: true,
          startOrder: true,
          scheduledStartTime: true,
          status: true,
          category: {
            select: {
              id: true,
              name: true,
              modality: true,
            },
          },
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
