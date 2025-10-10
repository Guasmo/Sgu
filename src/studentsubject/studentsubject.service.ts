import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateStudentsubjectDto } from './dto/create-studentsubject.dto';
import { UpdateStudentsubjectDto } from './dto/update-studentsubject.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginationDto } from 'src/pagination/pagination.dto';

@Injectable()
export class StudentsubjectService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly studentSubjectIncludes = {
    student: true,
    subject: true
  }

  async create(createStudentsubjectDto: CreateStudentsubjectDto) {
    try {
      const existingEnrollment = await this.prisma.studentSubject.findFirst({
        where: {
          studentId: createStudentsubjectDto.studentId,
          subjectId: createStudentsubjectDto.subjectId
        }
      });

      if (existingEnrollment) {
        throw new ConflictException('Student is already enrolled in this subject');
      }

      const studentSubject = await this.prisma.studentSubject.create({
        data: createStudentsubjectDto,
        include: this.studentSubjectIncludes
      });

      return studentSubject;

    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Student is already enrolled in this subject');
        }
      }

      throw new InternalServerErrorException('Error enrolling student in subject');
    }
  }

  async findAll(findWithPagination: PaginationDto) {
    const { page = 1, limit = 10 } = findWithPagination;
    const skip = (page - 1) * limit;

    try {
      const [data, total] = await Promise.all([
        this.prisma.studentSubject.findMany({
          skip,
          take: limit,
          include: this.studentSubjectIncludes
        }),
        this.prisma.studentSubject.count()
      ]);

      return {
        data,
        total,
        page,
        limit
      };

    } catch (error) {
      throw new InternalServerErrorException('Error fetching student enrollments');
    }
  }

  async findOne(id: number) {
    try {
      const studentSubject = await this.prisma.studentSubject.findUnique({
        where: { id },
        include: this.studentSubjectIncludes
      });

      if (!studentSubject) {
        throw new NotFoundException('Student enrollment not found');
      }

      return studentSubject;

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching student enrollment');
    }
  }

  update(id: number, updateStudentsubjectDto: UpdateStudentsubjectDto) {
    return `This action updates a #${id} studentsubject`;
  }

  remove(id: number) {
    return `This action removes a #${id} studentsubject`;
  }
}
