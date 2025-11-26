import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/pagination/pagination.dto';

@Injectable()
export class TeacherService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly teacherIncludes = {
    speciality: true,
    career: true,
    subjects: true
  }

  async findAll(findWithPagination: PaginationDto) {
    const { page = 1, limit = 10 } = findWithPagination;
    const skip = (page - 1) * limit;

    try {
      const [data, total] = await Promise.all([
        this.prisma.user.findMany({
          where: { role: 'TEACHER' },
          skip,
          take: limit,
          include: {
            teacherProfile: {
              include: {
                speciality: true,
                career: true,
                subjects: true
              }
            }
          }
        }),
        this.prisma.user.count({ where: { role: 'TEACHER' } })
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
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          teacherProfile: {
            include: {
              speciality: true,
              career: true,
              subjects: true
            }
          }
        }
      });

      if (!user || user.role !== 'TEACHER') {
        throw new NotFoundException('Teacher not found');
      }

      return user;

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching teacher');
    }
  }

  async update(id: number, updateTeacherDto: UpdateTeacherDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id }
      });

      if (!user || user.role !== 'TEACHER') {
        throw new NotFoundException(`Teacher with ID ${id} not found`);
      }

      if (updateTeacherDto.email) {
        const duplicateEmail = await this.prisma.user.findFirst({
          where: {
            email: updateTeacherDto.email,
            id: { not: id }
          }
        });

        if (duplicateEmail) {
          throw new ConflictException(`User with email ${updateTeacherDto.email} already exists`);
        }
      }

      // Prepare update data for user
      const userUpdateData = {
        ...(updateTeacherDto.name && { name: updateTeacherDto.name }),
        ...(updateTeacherDto.email && { email: updateTeacherDto.email }),
        ...(updateTeacherDto.phone !== undefined && { phone: updateTeacherDto.phone }),
        ...(updateTeacherDto.age !== undefined && { age: updateTeacherDto.age }),
      };

      // Prepare update data for teacher profile
      const profileUpdateData = {
        ...(updateTeacherDto.specialityId && { specialityId: updateTeacherDto.specialityId }),
        ...(updateTeacherDto.careerId && { careerId: updateTeacherDto.careerId }),
      };

      // Update user and profile
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          ...userUpdateData,
          ...(Object.keys(profileUpdateData).length > 0 && {
            teacherProfile: {
              update: profileUpdateData
            }
          })
        },
        include: {
          teacherProfile: {
            include: {
              speciality: true,
              career: true,
              subjects: true
            }
          }
        }
      });

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating teacher');
    }
  }

  async remove(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id }
      });

      if (!user || user.role !== 'TEACHER') {
        throw new NotFoundException(`Teacher with ID ${id} not found`);
      }

      // Delete will cascade to teacherProfile due to the schema configuration
      await this.prisma.user.delete({
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
