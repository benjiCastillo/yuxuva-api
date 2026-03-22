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
      return await (this.prisma.team as any).create({
        data: {
          championship: { connect: { id: createTeamDto.championshipId } },
          category: { connect: { id: createTeamDto.categoryId } },
          driver: { connect: { id: createTeamDto.driverId } },
          ...(createTeamDto.codriverId
            ? { codriver: { connect: { id: createTeamDto.codriverId } } }
            : {}),
          competitionNo: createTeamDto.competitionNo,
          carBrand: createTeamDto.carBrand,
          ...(createTeamDto.carModel !== undefined
            ? { carModel: createTeamDto.carModel }
            : {}),
          ...(createTeamDto.carYear !== undefined
            ? { carYear: createTeamDto.carYear }
            : {}),
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
      carBrand,
      carModel,
      carYear,
      driverId,
      codriverId,
      competitionNo,
      status,
    } = queryTeamDto;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (championshipId) {
      where.championshipId = championshipId;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (carBrand) {
      where.carBrand = { contains: carBrand, mode: 'insensitive' };
    }
    if (carModel) {
      where.carModel = { contains: carModel, mode: 'insensitive' };
    }
    if (carYear !== undefined) {
      where.carYear = carYear;
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
      (this.prisma.team as any).findMany({
        skip,
        take: limit,
        where,
        orderBy: [{ championshipId: 'asc' }, { competitionNo: 'asc' }],
        select: {
          id: true,
          championshipId: true,
          categoryId: true,
          driverId: true,
          codriverId: true,
          competitionNo: true,
          carBrand: true,
          carModel: true,
          carYear: true,
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
    const team = await (this.prisma.team as any).findUnique({
      where: { id },
      select: {
        id: true,
        championshipId: true,
        categoryId: true,
        driverId: true,
        codriverId: true,
        competitionNo: true,
        carBrand: true,
        carModel: true,
        carYear: true,
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

  async selectData(queryTeamDto: QueryTeamDto = new QueryTeamDto()) {
    const {
      championshipId,
      categoryId,
      stageId,
      excludeScheduledForStage,
      driverId,
      codriverId,
      competitionNo,
      status,
      carBrand,
      carModel,
      carYear,
    } = queryTeamDto;

    if (excludeScheduledForStage !== undefined && (!stageId || !categoryId)) {
      throw new BadRequestException(
        'excludeScheduledForStage solo puede usarse junto con stageId y categoryId.',
      );
    }

    const where: any = {};

    if (championshipId) {
      where.championshipId = championshipId;
    }
    if (categoryId) {
      where.categoryId = categoryId;
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
    if (carBrand) {
      where.carBrand = { contains: carBrand, mode: 'insensitive' };
    }
    if (carModel) {
      where.carModel = { contains: carModel, mode: 'insensitive' };
    }
    if (carYear !== undefined) {
      where.carYear = carYear;
    }

    if (stageId && categoryId && excludeScheduledForStage === true) {
      where.rallySchedules = {
        none: {
          stageId,
        },
      };
    }

    return await (this.prisma.team as any).findMany({
      where,
      select: {
        id: true,
        championshipId: true,
        categoryId: true,
        driverId: true,
        codriverId: true,
        competitionNo: true,
        carBrand: true,
        carModel: true,
        carYear: true,
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
    const currentTeam: any = await (this.prisma.team as any).findUnique({
      where: { id },
      select: {
        id: true,
        championshipId: true,
        categoryId: true,
        driverId: true,
        codriverId: true,
        competitionNo: true,
        carBrand: true,
        carModel: true,
        carYear: true,
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
      driverId: updateTeamDto.driverId ?? currentTeam.driverId,
      codriverId:
        updateTeamDto.codriverId === undefined
          ? currentTeam.codriverId
          : updateTeamDto.codriverId,
      competitionNo: updateTeamDto.competitionNo ?? currentTeam.competitionNo,
      carBrand: updateTeamDto.carBrand ?? currentTeam.carBrand,
      status: updateTeamDto.status ?? currentTeam.status,
    };

    await this.validateTeamRelations(nextTeam);

    try {
      return await (this.prisma.team as any).update({
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
          ...(updateTeamDto.carBrand !== undefined
            ? { carBrand: updateTeamDto.carBrand }
            : {}),
          ...(updateTeamDto.carModel !== undefined
            ? { carModel: updateTeamDto.carModel }
            : {}),
          ...(updateTeamDto.carYear !== undefined
            ? { carYear: updateTeamDto.carYear }
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
    driverId: string;
    carBrand: string;
    codriverId?: string | null;
  }) {
    if (team.codriverId && team.driverId === team.codriverId) {
      throw new BadRequestException(
        'El piloto y el copiloto no pueden ser la misma persona.',
      );
    }

    if (!team.carBrand || team.carBrand.trim().length === 0) {
      throw new BadRequestException(
        'La marca del auto es obligatoria para el equipo.',
      );
    }

    const [championship, category, driver] = await this.prisma.$transaction([
      this.prisma.championship.findUnique({
        where: { id: team.championshipId },
        select: { id: true },
      }),
      this.prisma.category.findUnique({
        where: { id: team.categoryId },
        select: { id: true, championshipId: true, allowsCodriver: true },
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
      driverId: true,
      codriverId: true,
      competitionNo: true,
      carBrand: true,
      carModel: true,
      carYear: true,
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
    } as any;
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
