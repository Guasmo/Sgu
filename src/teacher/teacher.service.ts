import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginationDto } from 'src/pagination/pagination.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/binary';

@Injectable()
export class TeacherService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly teacherIncludes = {
    speciality: true,
    career: true,
    subjects: true
  }

  async create(createTeacherDto: CreateTeacherDto) {
    try {
      const existingTeacher = await this.prisma.teacher.findUnique({
        where: {
          email: createTeacherDto.email
        }
      });

      if (existingTeacher) {
        throw new ConflictException('Teacher already exists');
      }

      const teacher = await this.prisma.teacher.create({
        data: {
          name: createTeacherDto.name,
          email: createTeacherDto.email,
          phone: createTeacherDto.phone,
          age: createTeacherDto.age,
          specialityId: createTeacherDto.specialityId,
          careerId: createTeacherDto.careerId
        },
        include: this.teacherIncludes
      });

      return teacher;

    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Teacher with this email already exists');
        }
      }

      throw new InternalServerErrorException('Error creating teacher');
    }
  }

  async findAll(findWithPagination: PaginationDto) {
    const { page = 1, limit = 10 } = findWithPagination;
    const skip = (page - 1) * limit;

    try {
      const [data, total] = await Promise.all([
        this.prisma.teacher.findMany({
          skip,
          take: limit,
          include: this.teacherIncludes
        }),
        this.prisma.teacher.count()
      ]);

      return {
        data,
        total,
        page,
        limit
      };

    } catch (error) {
      throw new InternalServerErrorException('Error fetching teachers');
    }
  }

  async findOne(id: number) {
    try {
      const teacher = await this.prisma.teacher.findUnique({
        where: { id },
        include: this.teacherIncludes
      });

      if (!teacher) {
        throw new NotFoundException('Teacher not found');
      }

      return teacher;

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching teacher');
    }
  }

  async update(id: number, updateTeacherDto: UpdateTeacherDto) {
    try {
      const existingTeacher = await this.prisma.teacher.findUnique({
        where: { id }
      });

      if (!existingTeacher) {
        throw new NotFoundException(`Teacher with ID ${id} not found`);
      }

      if (updateTeacherDto.email) {
        const duplicateEmail = await this.prisma.teacher.findFirst({
          where: {
            email: updateTeacherDto.email,
            id: { not: id }
          }
        });

        if (duplicateEmail) {
          throw new ConflictException(`Teacher with email ${updateTeacherDto.email} already exists`);
        }
      }

      const updatedTeacher = await this.prisma.teacher.update({
        where: { id },
        data: updateTeacherDto,
        include: this.teacherIncludes
      });

      return updatedTeacher;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating teacher');
    }
  }

  async remove(id: number) {
    try {
      const existingTeacher = await this.prisma.teacher.findUnique({
        where: { id }
      });

      if (!existingTeacher) {
        throw new NotFoundException(`Teacher with ID ${id} not found`);
      }

      await this.prisma.teacher.delete({
        where: { id }
      });

      return { message: `Teacher with ID ${id} has been successfully removed` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error removing teacher');
    }
  }
}
