import { Module } from '@nestjs/common';
import { StudentsubjectService } from './studentsubject.service';
import { StudentsubjectController } from './studentsubject.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubjectModule } from 'src/subject/subject.module';

@Module({
  controllers: [StudentsubjectController],
  providers: [StudentsubjectService, PrismaService],
  imports:[SubjectModule]
})
export class StudentsubjectModule {}
