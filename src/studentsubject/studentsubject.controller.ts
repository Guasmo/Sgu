import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { StudentsubjectService } from './studentsubject.service';
import { CreateStudentsubjectDto } from './dto/create-studentsubject.dto';
import { UpdateStudentsubjectDto } from './dto/update-studentsubject.dto';
import { PaginationDto } from 'src/pagination/pagination.dto';

@Controller('studentsubject')
export class StudentsubjectController {
  constructor(private readonly studentsubjectService: StudentsubjectService) {}

  @Post()
  create(@Body() createStudentsubjectDto: CreateStudentsubjectDto) {
    return this.studentsubjectService.create(createStudentsubjectDto);
  }

  @Get()
  findAll(@Query()findWithPagination: PaginationDto) {
    return this.studentsubjectService.findAll(findWithPagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsubjectService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentsubjectDto: UpdateStudentsubjectDto) {
    return this.studentsubjectService.update(+id, updateStudentsubjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsubjectService.remove(+id);
  }
}
