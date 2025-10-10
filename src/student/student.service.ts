import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/dto/pagination.dto';

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
  
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
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
  
  update(id: number, updateStudentDto: UpdateStudentDto) {
    return `This action updates a #${id} student`;
  }

  remove(id: number) {
    return `This action removes a #${id} student`;
  }
  }

