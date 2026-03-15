import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { QueryDriverDto } from './dto/query-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async create(createDriverDto: CreateDriverDto, userId: string) {
    try {
      return await this.prisma.driver.create({
        data: {
          firstName: createDriverDto.firstName,
          lastName: createDriverDto.lastName,
          ...(createDriverDto.documentType !== undefined
            ? { documentType: createDriverDto.documentType }
            : {}),
          ...(createDriverDto.documentNumber !== undefined
            ? { documentNumber: createDriverDto.documentNumber }
            : {}),
          ...(createDriverDto.licenseNumber !== undefined
            ? { licenseNumber: createDriverDto.licenseNumber }
            : {}),
          ...(createDriverDto.nationality !== undefined
            ? { nationality: createDriverDto.nationality }
            : {}),
          ...(createDriverDto.birthDate !== undefined
            ? { birthDate: this.parseDateOnly(createDriverDto.birthDate) }
            : {}),
          ...(createDriverDto.phone !== undefined
            ? { phone: createDriverDto.phone }
            : {}),
          ...(createDriverDto.email !== undefined
            ? { email: createDriverDto.email }
            : {}),
          ...(createDriverDto.bloodType !== undefined
            ? { bloodType: createDriverDto.bloodType }
            : {}),
          ...(createDriverDto.address !== undefined
            ? { address: createDriverDto.address }
            : {}),
          ...(createDriverDto.photoUrl !== undefined
            ? { photoUrl: createDriverDto.photoUrl }
            : {}),
          ...(createDriverDto.status !== undefined
            ? { status: createDriverDto.status }
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

  async findAll(queryDriverDto: QueryDriverDto) {
    const {
      page,
      limit,
      search,
      documentType,
      documentNumber,
      licenseNumber,
      nationality,
      email,
      status,
    } = queryDriverDto;
    const skip = (page - 1) * limit;
    const where: Prisma.DriverWhereInput = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (documentType) {
      where.documentType = { equals: documentType, mode: 'insensitive' };
    }
    if (documentNumber) {
      where.documentNumber = {
        contains: documentNumber,
        mode: 'insensitive',
      };
    }
    if (licenseNumber) {
      where.licenseNumber = {
        contains: licenseNumber,
        mode: 'insensitive',
      };
    }
    if (nationality) {
      where.nationality = { contains: nationality, mode: 'insensitive' };
    }
    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }
    if (status) {
      where.status = { equals: status, mode: 'insensitive' };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.driver.findMany({
        skip,
        take: limit,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          documentType: true,
          documentNumber: true,
          licenseNumber: true,
          nationality: true,
          birthDate: true,
          phone: true,
          email: true,
          bloodType: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.driver.count({ where }),
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
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        documentType: true,
        documentNumber: true,
        licenseNumber: true,
        nationality: true,
        birthDate: true,
        phone: true,
        email: true,
        bloodType: true,
        address: true,
        photoUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return driver;
  }

  async selectData() {
    return await this.prisma.driver.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        documentNumber: true,
        licenseNumber: true,
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  async update(id: string, updateDriverDto: UpdateDriverDto, userId: string) {
    try {
      return await this.prisma.driver.update({
        where: { id },
        data: {
          ...(updateDriverDto.firstName !== undefined
            ? { firstName: updateDriverDto.firstName }
            : {}),
          ...(updateDriverDto.lastName !== undefined
            ? { lastName: updateDriverDto.lastName }
            : {}),
          ...(updateDriverDto.documentType !== undefined
            ? { documentType: updateDriverDto.documentType }
            : {}),
          ...(updateDriverDto.documentNumber !== undefined
            ? { documentNumber: updateDriverDto.documentNumber }
            : {}),
          ...(updateDriverDto.licenseNumber !== undefined
            ? { licenseNumber: updateDriverDto.licenseNumber }
            : {}),
          ...(updateDriverDto.nationality !== undefined
            ? { nationality: updateDriverDto.nationality }
            : {}),
          ...(updateDriverDto.birthDate !== undefined
            ? {
                birthDate: updateDriverDto.birthDate
                  ? this.parseDateOnly(updateDriverDto.birthDate)
                  : null,
              }
            : {}),
          ...(updateDriverDto.phone !== undefined
            ? { phone: updateDriverDto.phone }
            : {}),
          ...(updateDriverDto.email !== undefined
            ? { email: updateDriverDto.email }
            : {}),
          ...(updateDriverDto.bloodType !== undefined
            ? { bloodType: updateDriverDto.bloodType }
            : {}),
          ...(updateDriverDto.address !== undefined
            ? { address: updateDriverDto.address }
            : {}),
          ...(updateDriverDto.photoUrl !== undefined
            ? { photoUrl: updateDriverDto.photoUrl }
            : {}),
          ...(updateDriverDto.status !== undefined
            ? { status: updateDriverDto.status }
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
      return await this.prisma.driver.delete({
        where: { id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      });
    } catch (error: unknown) {
      this.handleKnownErrors(error);
      throw error;
    }
  }

  private baseSelect() {
    return {
      id: true,
      firstName: true,
      lastName: true,
      documentType: true,
      documentNumber: true,
      licenseNumber: true,
      nationality: true,
      birthDate: true,
      phone: true,
      email: true,
      bloodType: true,
      address: true,
      photoUrl: true,
      status: true,
    } satisfies Prisma.DriverSelect;
  }

  private parseDateOnly(value: string) {
    return new Date(`${value}T00:00:00.000Z`);
  }

  private handleKnownErrors(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Driver not found');
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new BadRequestException(
        'Ya existe un piloto con el mismo documento, licencia o email.',
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      throw new BadRequestException(
        'No se puede eliminar el piloto porque tiene registros asociados.',
      );
    }
  }
}
