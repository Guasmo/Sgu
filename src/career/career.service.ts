import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/pagination/pagination.dto';

@Injectable()
export class CareerService {
  constructor(private readonly prisma:PrismaService){}

  private readonly careerIncludes = {
    teachers: true,
    subjects: true,
    students: true
  }

  async create(createCareerDto: CreateCareerDto) {
    try {

      const existingCareer = await this.prisma.career.findUnique({
        where: {
          name: createCareerDto.name
        }
      })

      if (existingCareer) {
        throw new ConflictException("Career already exists")
      }

      const career = await this.prisma.career.create({
        data: {
          name: createCareerDto.name,
          totalCicles: createCareerDto.totalCicles,
          durationYears: createCareerDto.durationYears
        }
      })

      return career;
    } catch (error) {
    if (error instanceof ConflictException) {
      throw error;
    }
    throw new InternalServerErrorException("Error creating career");
  }
  }



  async findAll(findWithPagination: PaginationDto) {
  const { page = 1, limit = 10 } = findWithPagination;
  const skip = (page - 1) * limit;

  try {
    const [data, total] = await Promise.all([
      this.prisma.career.findMany({
        skip,
        take: limit,
        include: this.careerIncludes
      }),
      this.prisma.career.count()
    ]);

    return {
      data,
      total,
      page,
      limit
    };

  } catch (error) {
    throw new InternalServerErrorException('Error fetching careers');
  }
}

  async findOne(id: number) {
    try {
      const career = await this.prisma.career.findUnique({
        where: { id },
        include: this.careerIncludes
      });

      if (!career) {
        throw new NotFoundException(`Career with ID ${id} not found`);
      }

      return career;

    } catch (error) {

      if (error instanceof NotFoundException){
        throw error
      }
      throw new InternalServerErrorException('Error fetching career');
    
    }  
  }

  update(id: number, updateCareerDto: UpdateCareerDto) {
    return `This action updates a #${id} career`;
  }

  remove(id: number) {
    return `This action removes a #${id} career`;
  }
}
