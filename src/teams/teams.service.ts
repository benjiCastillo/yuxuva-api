import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { QueryTeamDto } from './dto/query-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async create(createTeamDto: CreateTeamDto, userId: string) {
    await this.validateTeamRelations(createTeamDto);

    try {
      return await this.prisma.team.create({
        data: {
          championship: { connect: { id: createTeamDto.championshipId } },
          category: { connect: { id: createTeamDto.categoryId } },
          car: { connect: { id: createTeamDto.carId } },
          driver: { connect: { id: createTeamDto.driverId } },
          ...(createTeamDto.codriverId
            ? { codriver: { connect: { id: createTeamDto.codriverId } } }
            : {}),
          competitionNo: createTeamDto.competitionNo,
          ...(createTeamDto.status ? { status: createTeamDto.status } : {}),
          createdById: userId,
        },
        select: this.baseSelect(),
      });
    } catch (error: unknown) {
      this.handleKnownErrors(error);
      throw error;
    }
  }

  async findAll(queryTeamDto: QueryTeamDto) {
    const {
      page,
      limit,
      championshipId,
      categoryId,
      carId,
      driverId,
      codriverId,
      competitionNo,
      status,
    } = queryTeamDto;
    const skip = (page - 1) * limit;
    const where: Prisma.TeamWhereInput = {};

    if (championshipId) {
      where.championshipId = championshipId;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (carId) {
      where.carId = carId;
    }
    if (driverId) {
      where.driverId = driverId;
    }
    if (codriverId) {
      where.codriverId = codriverId;
    }
    if (competitionNo !== undefined) {
      where.competitionNo = competitionNo;
    }
    if (status) {
      where.status = { equals: status, mode: 'insensitive' };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.team.findMany({
        skip,
        take: limit,
        where,
        orderBy: [{ championshipId: 'asc' }, { competitionNo: 'asc' }],
        select: {
          id: true,
          championshipId: true,
          categoryId: true,
          carId: true,
          driverId: true,
          codriverId: true,
          competitionNo: true,
          status: true,
          championship: {
            select: {
              id: true,
              name: true,
              season: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              modality: true,
            },
          },
          car: {
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
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
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.team.count({ where }),
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
    const team = await this.prisma.team.findUnique({
      where: { id },
      select: {
        id: true,
        championshipId: true,
        categoryId: true,
        carId: true,
        driverId: true,
        codriverId: true,
        competitionNo: true,
        status: true,
        championship: {
          select: {
            id: true,
            name: true,
            season: true,
            modality: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            modality: true,
            allowsCodriver: true,
          },
        },
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
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            documentNumber: true,
            licenseNumber: true,
          },
        },
        codriver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            documentNumber: true,
            licenseNumber: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async selectData() {
    return await this.prisma.team.findMany({
      select: {
        id: true,
        championshipId: true,
        categoryId: true,
        driverId: true,
        codriverId: true,
        competitionNo: true,
        status: true,
        championship: {
          select: {
            name: true,
            season: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        car: {
          select: {
            brand: true,
            model: true,
            year: true,
          },
        },
        driver: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        codriver: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ championshipId: 'asc' }, { competitionNo: 'asc' }],
    });
  }

  async update(id: string, updateTeamDto: UpdateTeamDto, userId: string) {
    const currentTeam = await this.prisma.team.findUnique({
      where: { id },
      select: {
        id: true,
        championshipId: true,
        categoryId: true,
        carId: true,
        driverId: true,
        codriverId: true,
        competitionNo: true,
        status: true,
      },
    });

    if (!currentTeam) {
      throw new NotFoundException('Team not found');
    }

    const nextTeam = {
      championshipId:
        updateTeamDto.championshipId ?? currentTeam.championshipId,
      categoryId: updateTeamDto.categoryId ?? currentTeam.categoryId,
      carId: updateTeamDto.carId ?? currentTeam.carId,
      driverId: updateTeamDto.driverId ?? currentTeam.driverId,
      codriverId:
        updateTeamDto.codriverId === undefined
          ? currentTeam.codriverId
          : updateTeamDto.codriverId,
      competitionNo: updateTeamDto.competitionNo ?? currentTeam.competitionNo,
      status: updateTeamDto.status ?? currentTeam.status,
    };

    await this.validateTeamRelations(nextTeam);

    try {
      return await this.prisma.team.update({
        where: { id },
        data: {
          ...(updateTeamDto.championshipId
            ? {
                championship: { connect: { id: updateTeamDto.championshipId } },
              }
            : {}),
          ...(updateTeamDto.categoryId
            ? { category: { connect: { id: updateTeamDto.categoryId } } }
            : {}),
          ...(updateTeamDto.carId
            ? { car: { connect: { id: updateTeamDto.carId } } }
            : {}),
          ...(updateTeamDto.driverId
            ? { driver: { connect: { id: updateTeamDto.driverId } } }
            : {}),
          ...(updateTeamDto.codriverId !== undefined
            ? updateTeamDto.codriverId
              ? { codriver: { connect: { id: updateTeamDto.codriverId } } }
              : { codriver: { disconnect: true } }
            : {}),
          ...(updateTeamDto.competitionNo !== undefined
            ? { competitionNo: updateTeamDto.competitionNo }
            : {}),
          ...(updateTeamDto.status !== undefined
            ? { status: updateTeamDto.status }
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
      return await this.prisma.team.delete({
        where: { id },
        select: {
          id: true,
          competitionNo: true,
        },
      });
    } catch (error: unknown) {
      this.handleKnownErrors(error);
      throw error;
    }
  }

  private async validateTeamRelations(team: {
    championshipId: string;
    categoryId: string;
    carId: string;
    driverId: string;
    codriverId?: string | null;
  }) {
    if (team.codriverId && team.driverId === team.codriverId) {
      throw new BadRequestException(
        'El piloto y el copiloto no pueden ser la misma persona.',
      );
    }

    const [championship, category, car, driver] =
      await this.prisma.$transaction([
        this.prisma.championship.findUnique({
          where: { id: team.championshipId },
          select: { id: true },
        }),
        this.prisma.category.findUnique({
          where: { id: team.categoryId },
          select: { id: true, championshipId: true, allowsCodriver: true },
        }),
        this.prisma.car.findUnique({
          where: { id: team.carId },
          select: { id: true },
        }),
        this.prisma.driver.findUnique({
          where: { id: team.driverId },
          select: { id: true },
        }),
      ]);
    const codriver = team.codriverId
      ? await this.prisma.driver.findUnique({
          where: { id: team.codriverId },
          select: { id: true },
        })
      : null;

    if (!championship) {
      throw new NotFoundException('Championship not found');
    }

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.championshipId !== team.championshipId) {
      throw new BadRequestException(
        'La categoría debe pertenecer al campeonato seleccionado.',
      );
    }

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    if (team.codriverId && !codriver) {
      throw new NotFoundException('Codriver not found');
    }

    if (!category.allowsCodriver && team.codriverId) {
      throw new BadRequestException(
        'La categoría seleccionada no permite copiloto.',
      );
    }
  }

  private baseSelect() {
    return {
      id: true,
      championshipId: true,
      categoryId: true,
      carId: true,
      driverId: true,
      codriverId: true,
      competitionNo: true,
      status: true,
      championship: {
        select: {
          id: true,
          name: true,
          season: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          modality: true,
        },
      },
      car: {
        select: {
          id: true,
          brand: true,
          model: true,
          year: true,
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
    } satisfies Prisma.TeamSelect;
  }

  private handleKnownErrors(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Team not found');
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new BadRequestException(
        'Ya existe un equipo con ese número de competencia en el campeonato.',
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
