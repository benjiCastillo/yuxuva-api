import { Injectable } from '@nestjs/common';
import { CreateFederationDto } from './dto/create-federation.dto';
import { UpdateFederationDto } from './dto/update-federation.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FederationsService {
  constructor(private prisma: PrismaService) {}
  create(createFederationDto: CreateFederationDto) {
    return 'This action adds a new federation';
  }

  findAll() {
    return `This action returns all federations`;
  }

  findOne(id: string) {
    return `This action returns a #${id} federation`;
  }

  async selectData() {
    return await this.prisma.federation.findMany({
      select: {
        id: true,
        name: true,
        acronym: true,
      },
      where: {
        status: 'ACTIVE',
      },
    });
  }

  update(id: string, updateFederationDto: UpdateFederationDto) {
    return `This action updates a #${id} federation`;
  }

  remove(id: string) {
    return `This action removes a #${id} federation`;
  }
}
