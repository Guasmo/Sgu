import { Controller, Get, Patch, Param, Delete, Query, Body } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { PaginationDto } from 'src/pagination/pagination.dto';
import { Auth } from 'src/auth/decorators';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Teachers')
@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @ApiOperation({ summary: 'Get all teachers' })
  @Auth(Role.ADMIN)
  @Get()
  findAll(@Query() findWithPagination: PaginationDto) {
    return this.teacherService.findAll(findWithPagination);
  }

  @ApiOperation({ summary: 'Get a teacher by ID' })
  @Auth(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teacherService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a teacher profile' })
  @Auth(Role.ADMIN, Role.TEACHER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.teacherService.update(+id, updateTeacherDto);
  }

  @ApiOperation({ summary: 'Delete a teacher' })
  @Auth(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teacherService.remove(+id);
  }
}
