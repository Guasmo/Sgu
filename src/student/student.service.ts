import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PaginationDto } from 'src/pagination/pagination.dto';

@Injectable()
export class StudentService {
  
  constructor(private readonly prisma: PrismaService) {}

  async create(createStudentDto: CreateStudentDto) {
      try {
  
        const existingStudent = await this.prisma.student.findUnique({
          where: {
            email: createStudentDto.email
          }
        });
  
        if (existingStudent) {
          throw new ConflictException('Student already exists');
        }
  
        const studentData = await this.prisma.student.create({
          data: {
            name: createStudentDto.name,
            age: createStudentDto.age,
            email: createStudentDto.email,
            phone: createStudentDto.phone,
            careerId: createStudentDto.careerId,
            currentCicle: createStudentDto.currentCicle 
          },
        });
  
        return studentData;
  
      } catch (error) {
        if (error instanceof ConflictException) {
          throw error;
        }
  
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ConflictException('Student with this email already exists');
          }
        }
  
        throw new InternalServerErrorException('Error creating student');
      }
    }

  async findAll(findWithPagination: PaginationDto) {
    const { page = 1, limit = 10 } = findWithPagination;
    const skip = (page - 1) * limit;

    try {
      const [data, total] = await Promise.all([
        this.prisma.student.findMany({
          skip,
          take: limit,
          include: {
            career: true,
            studentSubjects: {
              include: {
                subject: true
              }
            }
          }
        }),
        this.prisma.student.count()
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
      const student = await this.prisma.student.findUnique({
        where: { id },
        include: {
          career: true,
          studentSubjects: {
            include: {
              subject: true
            }
          }
        }
      });

      if (!student) {
        throw new NotFoundException('Student not found');
      }

      return student;

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching student');
    }
  }
  
  async update(id: number, updateStudentDto: UpdateStudentDto) {
    try {
      const existingStudent = await this.prisma.student.findUnique({
        where: { id }
      });

      if (!existingStudent) {
        throw new NotFoundException(`Student with ID ${id} not found`);
      }

      if (updateStudentDto.email) {
        const duplicateEmail = await this.prisma.student.findFirst({
          where: {
            email: updateStudentDto.email,
            id: { not: id }
          }
        });

        if (duplicateEmail) {
          throw new ConflictException(`Student with email ${updateStudentDto.email} already exists`);
        }
      }

      const updatedStudent = await this.prisma.student.update({
        where: { id },
        data: updateStudentDto,
        include: {
          career: true,
          studentSubjects: {
            include: {
              subject: true
            }
          }
        }
      });

      return updatedStudent;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating student');
    }
  }

  async remove(id: number) {
    try {
      const existingStudent = await this.prisma.student.findUnique({
        where: { id }
      });

      if (!existingStudent) {
        throw new NotFoundException(`Student with ID ${id} not found`);
      }

      await this.prisma.student.delete({
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

