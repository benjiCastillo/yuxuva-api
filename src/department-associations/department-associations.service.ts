import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentAssociationDto } from './dto/create-department-association.dto';
import { QueryDepartmentAssociationDto } from './dto/query-department-association.dto';
import { UpdateDepartmentAssociationDto } from './dto/update-department-association.dto';

@Injectable()
export class DepartmentAssociationsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createDepartmentAssociationDto: CreateDepartmentAssociationDto,
    userId: string,
  ) {
    const federation = await this.prisma.federation.findUnique({
      where: { id: createDepartmentAssociationDto.federationId },
      select: { id: true },
    });

    if (!federation) {
      throw new NotFoundException('Federation not found');
    }

    try {
      return await this.prisma.departmentAssociation.create({
        data: {
          name: createDepartmentAssociationDto.name,
          department: createDepartmentAssociationDto.department,
          ...(createDepartmentAssociationDto.status
            ? { status: createDepartmentAssociationDto.status }
            : {}),
          federation: {
            connect: { id: createDepartmentAssociationDto.federationId },
          },
          createdById: userId,
        },
        select: this.baseSelect(),
      });
    } catch (error: unknown) {
      this.handleKnownErrors(error);
      throw error;
    }
  }

  async findAll(queryDepartmentAssociationDto: QueryDepartmentAssociationDto) {
    const { page, limit, name, department, status, federationId } =
      queryDepartmentAssociationDto;
    const skip = (page - 1) * limit;
    const where: Prisma.DepartmentAssociationWhereInput = {};

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    if (department) {
      where.department = { contains: department, mode: 'insensitive' };
    }
    if (status) {
      where.status = { equals: status, mode: 'insensitive' };
    }
    if (federationId) {
      where.federationId = federationId;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.departmentAssociation.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
        select: {
          id: true,
          federationId: true,
          name: true,
          department: true,
          status: true,
          federation: {
            select: {
              id: true,
              acronym: true,
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.departmentAssociation.count({ where }),
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
    const association = await this.prisma.departmentAssociation.findUnique({
      where: { id },
      select: {
        id: true,
        federationId: true,
        name: true,
        department: true,
        status: true,
        federation: {
          select: {
            id: true,
            name: true,
            acronym: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!association) {
      throw new NotFoundException('Department association not found');
    }

    return association;
  }

  async selectData() {
    return await this.prisma.departmentAssociation.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        department: true,
        federationId: true,
        federation: {
          select: {
            name: true,
            acronym: true,
          },
        },
      },
      orderBy: [{ department: 'asc' }, { name: 'asc' }],
    });
  }

  async update(
    id: string,
    updateDepartmentAssociationDto: UpdateDepartmentAssociationDto,
    userId: string,
  ) {
    if (updateDepartmentAssociationDto.federationId) {
      const federation = await this.prisma.federation.findUnique({
        where: { id: updateDepartmentAssociationDto.federationId },
        select: { id: true },
      });

      if (!federation) {
        throw new NotFoundException('Federation not found');
      }
    }

    try {
      return await this.prisma.departmentAssociation.update({
        where: { id },
        data: {
          ...(updateDepartmentAssociationDto.name !== undefined
            ? { name: updateDepartmentAssociationDto.name }
            : {}),
          ...(updateDepartmentAssociationDto.department !== undefined
            ? { department: updateDepartmentAssociationDto.department }
            : {}),
          ...(updateDepartmentAssociationDto.status !== undefined
            ? { status: updateDepartmentAssociationDto.status }
            : {}),
          ...(updateDepartmentAssociationDto.federationId
            ? {
                federation: {
                  connect: { id: updateDepartmentAssociationDto.federationId },
                },
              }
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
      return await this.prisma.departmentAssociation.delete({
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
        throw new NotFoundException('Department association not found');
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'No se puede eliminar la asociación porque tiene calendarios asociados.',
        );
      }
      throw error;
    }
  }

  private handleKnownErrors(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new BadRequestException(
        'El nombre ya existe para esta federación.',
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Department association not found');
    }
  }

  private baseSelect() {
    return {
      id: true,
      federationId: true,
      name: true,
      department: true,
      status: true,
      federation: {
        select: {
          id: true,
          name: true,
          acronym: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    } satisfies Prisma.DepartmentAssociationSelect;
  }
}
