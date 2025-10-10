import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentsubjectDto } from './create-studentsubject.dto';

export class UpdateStudentsubjectDto extends PartialType(CreateStudentsubjectDto) {}
