import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SpecialityModule } from './speciality/speciality.module';
import { CareerModule } from './career/career.module';
import { TeacherModule } from './teacher/teacher.module';
import { SubjectModule } from './subject/subject.module';
import { StudentsubjectModule } from './studentsubject/studentsubject.module';
import { StudentModule } from './student/student.module';


@Module({
  imports: [PrismaModule, SpecialityModule, CareerModule, TeacherModule, SubjectModule, StudentsubjectModule, StudentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
