import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/pagination/pagination.dto';

@Injectable()
export class StudentService {
  
  constructor(private readonly prisma: PrismaService) {}

  async findAll(findWithPagination: PaginationDto) {
    const { page = 1, limit = 10 } = findWithPagination;
    const skip = (page - 1) * limit;

    try {
      const [data, total] = await Promise.all([
        this.prisma.user.findMany({
          where: { role: 'STUDENT' },
          skip,
          take: limit,
          include: {
            studentProfile: {
              include: {
                career: true,
                studentSubjects: {
                  include: {
                    subject: true
                  }
                }
              }
            }
          }
        }),
        this.prisma.user.count({ where: { role: 'STUDENT' } })
      ]);

      return {
        data,
        total,
        page,
        limit
      };

    } catch (error) {
      throw new InternalServerErrorException('Error fetching students');
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          studentProfile: {
            include: {
              career: true,
              studentSubjects: {
                include: {
                  subject: true
                }
              }
            }
          }
        }
      });

      if (!user || user.role !== 'STUDENT') {
        throw new NotFoundException('Student not found');
      }

      return user;

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching student');
    }
  }
  
  async update(id: number, updateStudentDto: UpdateStudentDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id }
      });

      if (!user || user.role !== 'STUDENT') {
        throw new NotFoundException(`Student with ID ${id} not found`);
      }

      if (updateStudentDto.email) {
        const duplicateEmail = await this.prisma.user.findFirst({
          where: {
            email: updateStudentDto.email,
            id: { not: id }
          }
        });

        if (duplicateEmail) {
          throw new ConflictException(`User with email ${updateStudentDto.email} already exists`);
        }
      }

      // Prepare update data for user
      const userUpdateData = {
        ...(updateStudentDto.name && { name: updateStudentDto.name }),
        ...(updateStudentDto.email && { email: updateStudentDto.email }),
        ...(updateStudentDto.phone !== undefined && { phone: updateStudentDto.phone }),
        ...(updateStudentDto.age !== undefined && { age: updateStudentDto.age }),
        ...(updateStudentDto.status && { status: updateStudentDto.status }),
      };

      // Prepare update data for student profile
      const profileUpdateData = {
        ...(updateStudentDto.careerId && { careerId: updateStudentDto.careerId }),
        ...(updateStudentDto.currentCicle && { currentCicle: updateStudentDto.currentCicle }),
      };

      // Update user and profile
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          ...userUpdateData,
          ...(Object.keys(profileUpdateData).length > 0 && {
            studentProfile: {
              update: profileUpdateData
            }
          })
        },
        include: {
          studentProfile: {
            include: {
              career: true,
              studentSubjects: {
                include: {
                  subject: true
                }
              }
            }
          }
        }
      });

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating student');
    }
  }

  async remove(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id }
      });

      if (!user || user.role !== 'STUDENT') {
        throw new NotFoundException(`Student with ID ${id} not found`);
      }

      // Delete will cascade to studentProfile due to the schema configuration
      await this.prisma.user.delete({
        where: { id }
      });

      return { message: `Student with ID ${id} has been successfully removed` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error removing student');
    }
  }
}

