import { Module } from '@nestjs/common';
import { StudentsubjectService } from './studentsubject.service';
import { StudentsubjectController } from './studentsubject.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [StudentsubjectController],
  providers: [StudentsubjectService, PrismaService],
})
export class StudentsubjectModule {}
