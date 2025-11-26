import { Controller, Get, Patch, Param, Delete, Query, Body } from '@nestjs/common';
import { StudentService } from './student.service';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PaginationDto } from 'src/pagination/pagination.dto';
import { Auth } from 'src/auth/decorators';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Students')
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @ApiOperation({ summary: 'Get all students' })
  @Auth(Role.ADMIN, Role.TEACHER)
  @Get()
  findAll(@Query() findWithPagination: PaginationDto) {
    return this.studentService.findAll(findWithPagination);
  }

  @ApiOperation({ summary: 'Get a student by ID' })
  @Auth(Role.ADMIN, Role.TEACHER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a student profile' })
  @Auth(Role.ADMIN, Role.STUDENT)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentService.update(+id, updateStudentDto);
  }

  @ApiOperation({ summary: 'Delete a student' })
  @Auth(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentService.remove(+id);
  }
}
