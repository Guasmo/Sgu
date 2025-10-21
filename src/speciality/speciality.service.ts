import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateSpecialityDto } from './dto/create-speciality.dto';
import { UpdateSpecialityDto } from './dto/update-speciality.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PaginationDto } from 'src/pagination/pagination.dto';

@Injectable()
export class SpecialityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSpecialityDto: CreateSpecialityDto) {
    try {

      const existingSpeciality = await this.prisma.speciality.findUnique({
        where: {
          name: createSpecialityDto.name
        }
      });

      if (existingSpeciality) {
        throw new ConflictException('Speciality already exists');
      }

      const specialityData = await this.prisma.speciality.create({
        data: {
          name: createSpecialityDto.name,
          description: createSpecialityDto.description,
        },
      });

      return specialityData;

    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Speciality with this name already exists');
        }
      }

      throw new InternalServerErrorException('Error creating speciality');
    }
  }

  async findAll(findWithPagination: PaginationDto) {
  const { page = 1, limit = 10 } = findWithPagination;
  const skip = (page - 1) * limit;

  try {
    const [data, total] = await Promise.all([
      this.prisma.speciality.findMany({
        skip,
        take: limit,
        include: {
          teachers:true
        }
      }),
      this.prisma.speciality.count()
    ]);

    return {
      data,
      total,
      page,
      limit
    };

  } catch (error) {
    throw new InternalServerErrorException('Error fetching specialities');
  }
}

  async findOne(id: number) {
    try {
      const speciality = await this.prisma.speciality.findUnique({
        where: { id },
        include: {
          teachers: true
        }
      });

      if (!speciality) {
        throw new NotFoundException(`Speciality with ID ${id} not found`);
      }

      return speciality;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching speciality');
    }
  }

  async update(id: number, updateSpecialityDto: UpdateSpecialityDto) {
    try {
      const existingSpeciality = await this.prisma.speciality.findUnique({
        where: { id }
      });

      if (!existingSpeciality) {
        throw new NotFoundException(`Speciality with ID ${id} not found`);
      }

      if (updateSpecialityDto.name) {
        const duplicateName = await this.prisma.speciality.findFirst({
          where: {
            name: updateSpecialityDto.name,
            id: { not: id }
          }
        });

        if (duplicateName) {
          throw new ConflictException(`Speciality with name ${updateSpecialityDto.name} already exists`);
        }
      }

      const updatedSpeciality = await this.prisma.speciality.update({
        where: { id },
        data: updateSpecialityDto
      });

      return updatedSpeciality;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating speciality');
    }
  }

  async remove(id: number) {
    try {
      const existingSpeciality = await this.prisma.speciality.findUnique({
        where: { id }
      });

      if (!existingSpeciality) {
        throw new NotFoundException(`Speciality with ID ${id} not found`);
      }

      await this.prisma.speciality.delete({
        where: { id }
      });

      return { message: `Speciality with ID ${id} has been successfully removed` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error removing speciality');
    }
  }
}