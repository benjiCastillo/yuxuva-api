import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRallyStageScheduleDto } from './dto/create-rally-stage-schedule.dto';
import { QueryRallyStageScheduleDto } from './dto/query-rally-stage-schedule.dto';
import { UpdateRallyStageScheduleDto } from './dto/update-rally-stage-schedule.dto';

@Injectable()
export class RallyStageSchedulesService {
  constructor(private prisma: PrismaService) {}

  private get rallyStageScheduleDelegate(): any {
    return (this.prisma as any).rallyStageSchedule;
  }

  async create(
    createRallyStageScheduleDto: CreateRallyStageScheduleDto,
    userId: string,
  ) {
    await this.validateRelations(
      createRallyStageScheduleDto.stageId,
      createRallyStageScheduleDto.categoryId,
      createRallyStageScheduleDto.teamId,
    );

    try {
      return await this.rallyStageScheduleDelegate.create({
        data: {
          stage: { connect: { id: createRallyStageScheduleDto.stageId } },
          category: { connect: { id: createRallyStageScheduleDto.categoryId } },
          team: { connect: { id: createRallyStageScheduleDto.teamId } },
          startOrder: createRallyStageScheduleDto.startOrder,
          ...(createRallyStageScheduleDto.scheduledStartTime
            ? {
                scheduledStartTime: new Date(
                  createRallyStageScheduleDto.scheduledStartTime,
                ),
              }
            : {}),
          ...(createRallyStageScheduleDto.status
            ? { status: createRallyStageScheduleDto.status }
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

  async findAll(queryRallyStageScheduleDto: QueryRallyStageScheduleDto) {
    const {
      page,
      limit,
      id,
      stageId,
      rallyId,
      calendarId,
      teamId,
      championshipId,
      categoryId,
      status,
      startOrder,
    } = queryRallyStageScheduleDto;
    const skip = (page - 1) * limit;
    const where: any = {};
    const stageWhere: Prisma.RallyStageWhereInput = {};
    const rallyWhere: Prisma.RallyWhereInput = {};
    const calendarWhere: Prisma.ChampionshipCalendarWhereInput = {};
    const teamWhere: Prisma.TeamWhereInput = {};

    if (id) {
      where.id = id;
    }
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
      where.categoryId = categoryId;
      teamWhere.categoryId = categoryId;
    }
    if (Object.keys(teamWhere).length > 0) {
      where.team = teamWhere;
    }
    if (status) {
      where.status = { equals: status, mode: 'insensitive' };
    }
    if (startOrder !== undefined) {
      where.startOrder = startOrder;
    }

    const [data, total] = await this.prisma.$transaction([
      this.rallyStageScheduleDelegate.findMany({
        skip,
        take: limit,
        where,
        orderBy: [
          { stage: { stageOrder: 'asc' } },
          { startOrder: 'asc' },
          { createdAt: 'asc' },
        ],
        select: this.detailedSelect(),
      }),
      this.rallyStageScheduleDelegate.count({ where }),
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
    const schedule = await this.rallyStageScheduleDelegate.findUnique({
      where: { id },
      select: this.detailedSelect(),
    });

    if (!schedule) {
      throw new NotFoundException('Rally stage schedule not found');
    }

    return schedule;
  }

  async selectData() {
    return await this.rallyStageScheduleDelegate.findMany({
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
        categoryId: true,
        teamId: true,
        startOrder: true,
        scheduledStartTime: true,
        status: true,
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
      orderBy: [{ stage: { stageOrder: 'asc' } }, { startOrder: 'asc' }],
    });
  }

  async update(
    id: string,
    updateRallyStageScheduleDto: UpdateRallyStageScheduleDto,
    userId: string,
  ) {
    let currentSchedule:
      | {
          stageId: string;
          categoryId: string;
          teamId: string;
        }
      | null = null;

    if (
      updateRallyStageScheduleDto.stageId ||
      updateRallyStageScheduleDto.categoryId ||
      updateRallyStageScheduleDto.teamId
    ) {
      currentSchedule = await this.rallyStageScheduleDelegate.findUnique({
        where: { id },
        select: {
          stageId: true,
          categoryId: true,
          teamId: true,
        },
      });

      if (!currentSchedule) {
        throw new NotFoundException('Rally stage schedule not found');
      }

      await this.validateRelations(
        updateRallyStageScheduleDto.stageId ?? currentSchedule.stageId,
        updateRallyStageScheduleDto.categoryId ?? currentSchedule.categoryId,
        updateRallyStageScheduleDto.teamId ?? currentSchedule.teamId,
      );
    }

    try {
      return await this.rallyStageScheduleDelegate.update({
        where: { id },
        data: {
          ...(updateRallyStageScheduleDto.stageId
            ? { stage: { connect: { id: updateRallyStageScheduleDto.stageId } } }
            : {}),
          ...(updateRallyStageScheduleDto.categoryId
            ? {
                category: {
                  connect: { id: updateRallyStageScheduleDto.categoryId },
                },
              }
            : {}),
          ...(updateRallyStageScheduleDto.teamId
            ? { team: { connect: { id: updateRallyStageScheduleDto.teamId } } }
            : {}),
          ...(updateRallyStageScheduleDto.startOrder !== undefined
            ? { startOrder: updateRallyStageScheduleDto.startOrder }
            : {}),
          ...(updateRallyStageScheduleDto.scheduledStartTime !== undefined
            ? {
                scheduledStartTime: updateRallyStageScheduleDto.scheduledStartTime
                  ? new Date(updateRallyStageScheduleDto.scheduledStartTime)
                  : null,
              }
            : {}),
          ...(updateRallyStageScheduleDto.status !== undefined
            ? { status: updateRallyStageScheduleDto.status }
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
      return await this.rallyStageScheduleDelegate.delete({
        where: { id },
        select: {
          id: true,
          stageId: true,
          categoryId: true,
          teamId: true,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Rally stage schedule not found');
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'No se puede eliminar la programacion porque ya tiene un resultado asociado.',
        );
      }
      throw error;
    }
  }

  private async validateRelations(
    stageId: string,
    categoryId: string,
    teamId: string,
  ) {
    const [stage, category, team] = await Promise.all([
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
      this.prisma.category.findUnique({
        where: { id: categoryId },
        select: {
          id: true,
          championshipId: true,
          modality: true,
        },
      }),
      this.prisma.team.findUnique({
        where: { id: teamId },
        select: {
          id: true,
          championshipId: true,
          categoryId: true,
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

    if (!category) {
      throw new NotFoundException('Category not found');
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

    if (category.modality !== 'RALLY') {
      throw new BadRequestException(
        'La categoria seleccionada no pertenece a rally.',
      );
    }

    if (stage.rally.calendar.championshipId !== team.championshipId) {
      throw new BadRequestException(
        'El equipo no pertenece al mismo campeonato de la etapa seleccionada.',
      );
    }

    if (stage.rally.calendar.championshipId !== category.championshipId) {
      throw new BadRequestException(
        'La categoria no pertenece al mismo campeonato de la etapa seleccionada.',
      );
    }

    if (team.categoryId !== category.id) {
      throw new BadRequestException(
        'El equipo no pertenece a la categoria seleccionada para la programacion.',
      );
    }
  }

  private handleKnownErrors(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const target = Array.isArray(error.meta?.target) ? error.meta.target : [];

      if (target.includes('stageId') && target.includes('teamId')) {
        throw new BadRequestException(
          'Ya existe una programacion para este equipo en la etapa seleccionada.',
        );
      }

      if (
        target.includes('stageId') &&
        target.includes('categoryId') &&
        target.includes('startOrder')
      ) {
        throw new BadRequestException(
          'El orden de partida ya esta asignado para la categoria en la etapa seleccionada.',
        );
      }

      throw new BadRequestException(
        'No se pudo guardar la programacion de la etapa.',
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Rally stage schedule not found');
    }
  }

  private baseSelect() {
    return {
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
      result: {
        select: {
          id: true,
          time: true,
          penalty: true,
          status: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    } as any;
  }

  private detailedSelect() {
    return {
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
      result: {
        select: {
          id: true,
          startTime: true,
          endTime: true,
          time: true,
          penalty: true,
          status: true,
          createdAt: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    } as any;
  }
}
