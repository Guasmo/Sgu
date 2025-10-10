import { Module } from '@nestjs/common';
import { SpecialityService } from './speciality.service';
import { SpecialityController } from './speciality.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SpecialityController],
  providers: [SpecialityService, PrismaService],
})
export class SpecialityModule {}
