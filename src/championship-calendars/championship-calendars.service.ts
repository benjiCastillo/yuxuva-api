import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChampionshipCalendarDto } from './dto/create-championship-calendar.dto';
import { QueryChampionshipCalendarDto } from './dto/query-championship-calendar.dto';
import { UpdateChampionshipCalendarDto } from './dto/update-championship-calendar.dto';

@Injectable()
export class ChampionshipCalendarsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createChampionshipCalendarDto: CreateChampionshipCalendarDto,
    userId: string,
  ) {
    await this.validateRelations(
      createChampionshipCalendarDto.championshipId,
      createChampionshipCalendarDto.associationId,
    );
    this.validateDateRange(
      createChampionshipCalendarDto.startDate,
      createChampionshipCalendarDto.endDate,
    );

    try {
      return await this.prisma.championshipCalendar.create({
        data: {
          championship: {
            connect: { id: createChampionshipCalendarDto.championshipId },
          },
          association: {
            connect: { id: createChampionshipCalendarDto.associationId },
          },
          roundNumber: createChampionshipCalendarDto.roundNumber,
          eventName: createChampionshipCalendarDto.eventName,
          startDate: new Date(createChampionshipCalendarDto.startDate),
          endDate: new Date(createChampionshipCalendarDto.endDate),
          ...(createChampionshipCalendarDto.status
            ? { status: createChampionshipCalendarDto.status }
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

  async findAll(queryChampionshipCalendarDto: QueryChampionshipCalendarDto) {
    const {
      page,
      limit,
      eventName,
      roundNumber,
      status,
      championshipId,
      associationId,
      startDateFrom,
      endDateTo,
    } = queryChampionshipCalendarDto;
    const skip = (page - 1) * limit;
    const where: Prisma.ChampionshipCalendarWhereInput = {};

    if (eventName) {
      where.eventName = { contains: eventName, mode: 'insensitive' };
    }
    if (roundNumber !== undefined) {
      where.roundNumber = roundNumber;
    }
    if (status) {
      where.status = { equals: status, mode: 'insensitive' };
    }
    if (championshipId) {
      where.championshipId = championshipId;
    }
    if (associationId) {
      where.associationId = associationId;
    }
    if (startDateFrom || endDateTo) {
      where.startDate = {
        ...(startDateFrom ? { gte: new Date(startDateFrom) } : {}),
        ...(endDateTo ? { lte: new Date(endDateTo) } : {}),
      };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.championshipCalendar.findMany({
        skip,
        take: limit,
        orderBy: [{ startDate: 'asc' }, { roundNumber: 'asc' }],
        where,
        select: {
          id: true,
          championshipId: true,
          associationId: true,
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
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.championshipCalendar.count({ where }),
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
    const calendar = await this.prisma.championshipCalendar.findUnique({
      where: { id },
      select: {
        id: true,
        championshipId: true,
        associationId: true,
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
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!calendar) {
      throw new NotFoundException('Championship calendar not found');
    }

    return calendar;
  }

  async selectData() {
    return await this.prisma.championshipCalendar.findMany({
      where: {
        status: {
          in: ['SCHEDULED', 'ONGOING'],
        },
      },
      select: {
        id: true,
        eventName: true,
        roundNumber: true,
        startDate: true,
        endDate: true,
        status: true,
        championshipId: true,
        associationId: true,
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
      orderBy: [{ startDate: 'asc' }, { roundNumber: 'asc' }],
    });
  }

  async update(
    id: string,
    updateChampionshipCalendarDto: UpdateChampionshipCalendarDto,
    userId: string,
  ) {
    if (
      updateChampionshipCalendarDto.championshipId ||
      updateChampionshipCalendarDto.associationId
    ) {
      const existingCalendar =
        await this.prisma.championshipCalendar.findUnique({
          where: { id },
          select: {
            championshipId: true,
            associationId: true,
            startDate: true,
            endDate: true,
          },
        });

      if (!existingCalendar) {
        throw new NotFoundException('Championship calendar not found');
      }

      await this.validateRelations(
        updateChampionshipCalendarDto.championshipId ??
          existingCalendar.championshipId,
        updateChampionshipCalendarDto.associationId ??
          existingCalendar.associationId,
      );
    }

    if (
      updateChampionshipCalendarDto.startDate ||
      updateChampionshipCalendarDto.endDate
    ) {
      const existingCalendar =
        await this.prisma.championshipCalendar.findUnique({
          where: { id },
          select: { startDate: true, endDate: true },
        });

      if (!existingCalendar) {
        throw new NotFoundException('Championship calendar not found');
      }

      this.validateDateRange(
        updateChampionshipCalendarDto.startDate ??
          existingCalendar.startDate.toISOString(),
        updateChampionshipCalendarDto.endDate ??
          existingCalendar.endDate.toISOString(),
      );
    }

    try {
      return await this.prisma.championshipCalendar.update({
        where: { id },
        data: {
          ...(updateChampionshipCalendarDto.championshipId
            ? {
                championship: {
                  connect: { id: updateChampionshipCalendarDto.championshipId },
                },
              }
            : {}),
          ...(updateChampionshipCalendarDto.associationId
            ? {
                association: {
                  connect: { id: updateChampionshipCalendarDto.associationId },
                },
              }
            : {}),
          ...(updateChampionshipCalendarDto.roundNumber !== undefined
            ? { roundNumber: updateChampionshipCalendarDto.roundNumber }
            : {}),
          ...(updateChampionshipCalendarDto.eventName !== undefined
            ? { eventName: updateChampionshipCalendarDto.eventName }
            : {}),
          ...(updateChampionshipCalendarDto.startDate
            ? { startDate: new Date(updateChampionshipCalendarDto.startDate) }
            : {}),
          ...(updateChampionshipCalendarDto.endDate
            ? { endDate: new Date(updateChampionshipCalendarDto.endDate) }
            : {}),
          ...(updateChampionshipCalendarDto.status !== undefined
            ? { status: updateChampionshipCalendarDto.status }
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
      return await this.prisma.championshipCalendar.delete({
        where: { id },
        select: {
          id: true,
          eventName: true,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Championship calendar not found');
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'No se puede eliminar el calendario porque tiene datos asociados.',
        );
      }
      throw error;
    }
  }

  private async validateRelations(
    championshipId: string,
    associationId: string,
  ) {
    const [championship, association] = await Promise.all([
      this.prisma.championship.findUnique({
        where: { id: championshipId },
        select: { id: true },
      }),
      this.prisma.departmentAssociation.findUnique({
        where: { id: associationId },
        select: { id: true },
      }),
    ]);

    if (!championship) {
      throw new NotFoundException('Championship not found');
    }

    if (!association) {
      throw new NotFoundException('Department association not found');
    }
  }

  private validateDateRange(startDate: string, endDate: string) {
    if (new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser mayor a la fecha de fin.',
      );
    }
  }

  private handleKnownErrors(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new BadRequestException(
        'El número de ronda ya existe para este campeonato.',
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Championship calendar not found');
    }
  }

  private baseSelect() {
    return {
      id: true,
      championshipId: true,
      associationId: true,
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
      createdAt: true,
      updatedAt: true,
    } satisfies Prisma.ChampionshipCalendarSelect;
  }
}
