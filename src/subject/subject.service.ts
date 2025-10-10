import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginationDto } from 'src/pagination/pagination.dto';

@Injectable()
export class SubjectService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly subjectIncludes = {
    career: true,
    teacher: true,
    studentSubjects: true
  }

  async create(createSubjectDto: CreateSubjectDto) {
    try {
      const existingSubject = await this.prisma.subject.findFirst({
        where: {
          name: createSubjectDto.name,
          careerId: createSubjectDto.careerId,
          cicleNumber: createSubjectDto.cicleNumber
        }
      });

      if (existingSubject) {
        throw new ConflictException('Subject already exists in this career and cycle');
      }

      const subject = await this.prisma.subject.create({
        data: createSubjectDto,
        include: this.subjectIncludes
      });

      return subject;

    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Subject already exists');
        }
      }

      throw new InternalServerErrorException('Error creating subject');
    }
  }

  async findAll(findWithPagination: PaginationDto) {
    const { page = 1, limit = 10 } = findWithPagination;
    const skip = (page - 1) * limit;

    try {
      const [data, total] = await Promise.all([
        this.prisma.subject.findMany({
          skip,
          take: limit,
          include: this.subjectIncludes
        }),
        this.prisma.subject.count()
      ]);

      return {
        data,
        total,
        page,
        limit
      };

    } catch (error) {
      throw new InternalServerErrorException('Error fetching subjects');
    }
  }

  async findOne(id: number) {
    try {
      const subject = await this.prisma.subject.findUnique({
        where: { id },
        include: this.subjectIncludes
      });

      if (!subject) {
        throw new NotFoundException('Subject not found');
      }

      return subject;

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching subject');
    }
  }

  update(id: number, updateSubjectDto: UpdateSubjectDto) {
    return `This action updates a #${id} subject`;
  }

  remove(id: number) {
    return `This action removes a #${id} subject`;
  }
}
