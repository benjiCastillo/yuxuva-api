import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRallyDto } from './dto/create-rally.dto';
import { QueryRallyDto } from './dto/query-rally.dto';
import { UpdateRallyDto } from './dto/update-rally.dto';

@Injectable()
export class RalliesService {
  constructor(private prisma: PrismaService) {}

  async create(createRallyDto: CreateRallyDto, userId: string) {
    await this.validateCalendar(createRallyDto.calendarId);

    try {
      return await this.prisma.rally.create({
        data: {
          calendar: { connect: { id: createRallyDto.calendarId } },
          ...(createRallyDto.totalKm !== undefined
            ? { totalKm: createRallyDto.totalKm }
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

  async findAll(queryRallyDto: QueryRallyDto) {
    const {
      page,
      limit,
      calendarId,
      championshipId,
      associationId,
      eventName,
      totalKmFrom,
      totalKmTo,
    } = queryRallyDto;
    const skip = (page - 1) * limit;
    const where: Prisma.RallyWhereInput = {};
    const calendarWhere: Prisma.ChampionshipCalendarWhereInput = {};

    if (calendarId) {
      where.calendarId = calendarId;
    }
    if (championshipId) {
      calendarWhere.championshipId = championshipId;
    }
    if (associationId) {
      calendarWhere.associationId = associationId;
    }
    if (eventName) {
      calendarWhere.eventName = { contains: eventName, mode: 'insensitive' };
    }
    if (Object.keys(calendarWhere).length > 0) {
      where.calendar = calendarWhere;
    }
    if (totalKmFrom !== undefined || totalKmTo !== undefined) {
      where.totalKm = {
        ...(totalKmFrom !== undefined ? { gte: totalKmFrom } : {}),
        ...(totalKmTo !== undefined ? { lte: totalKmTo } : {}),
      };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.rally.findMany({
        skip,
        take: limit,
        where,
        orderBy: [{ calendar: { startDate: 'asc' } }, { createdAt: 'desc' }],
        select: {
          id: true,
          calendarId: true,
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
          createdAt: true,
        },
      }),
      this.prisma.rally.count({ where }),
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
    const rally = await this.prisma.rally.findUnique({
      where: { id },
      select: {
        id: true,
        calendarId: true,
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
        stages: {
          select: {
            id: true,
            name: true,
            stageType: true,
            stageOrder: true,
            distanceKm: true,
            createdAt: true,
          },
          orderBy: { stageOrder: 'asc' },
        },
        createdAt: true,
      },
    });

    if (!rally) {
      throw new NotFoundException('Rally not found');
    }

    return rally;
  }

  async selectData() {
    return await this.prisma.rally.findMany({
      where: {
        calendar: {
          status: {
            in: ['SCHEDULED', 'ONGOING'],
          },
        },
      },
      select: {
        id: true,
        calendarId: true,
        totalKm: true,
        calendar: {
          select: {
            eventName: true,
            roundNumber: true,
            startDate: true,
            endDate: true,
            championship: {
              select: {
                name: true,
                season: true,
              },
            },
            association: {
              select: {
                name: true,
                department: true,
              },
            },
          },
        },
      },
      orderBy: [{ calendar: { startDate: 'asc' } }],
    });
  }

  async update(id: string, updateRallyDto: UpdateRallyDto, userId: string) {
    if (updateRallyDto.calendarId) {
      await this.validateCalendar(updateRallyDto.calendarId);
    }

    try {
      return await this.prisma.rally.update({
        where: { id },
        data: {
          ...(updateRallyDto.calendarId
            ? { calendar: { connect: { id: updateRallyDto.calendarId } } }
            : {}),
          ...(updateRallyDto.totalKm !== undefined
            ? { totalKm: updateRallyDto.totalKm }
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
      return await this.prisma.rally.delete({
        where: { id },
        select: {
          id: true,
          calendarId: true,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Rally not found');
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'No se puede eliminar el rally porque tiene datos asociados.',
        );
      }
      throw error;
    }
  }

  private async validateCalendar(calendarId: string) {
    const calendar = await this.prisma.championshipCalendar.findUnique({
      where: { id: calendarId },
      select: {
        id: true,
        championship: {
          select: {
            modality: true,
          },
        },
      },
    });

    if (!calendar) {
      throw new NotFoundException('Championship calendar not found');
    }

    if (calendar.championship.modality !== 'RALLY') {
      throw new BadRequestException(
        'El calendario seleccionado no pertenece a un campeonato de rally.',
      );
    }
  }

  private handleKnownErrors(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new BadRequestException(
        'Ya existe un rally registrado para este calendario.',
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Rally not found');
    }
  }

  private baseSelect() {
    return {
      id: true,
      calendarId: true,
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
      createdAt: true,
    } satisfies Prisma.RallySelect;
  }
}
