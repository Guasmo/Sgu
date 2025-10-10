import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class CreateStudentsubjectDto {
    @ApiProperty({
        description: "ID of the student",
        example: 1
    })
    @IsNumber()
    studentId: number;

    @ApiProperty({
        description: "ID of the subject",
        example: 1
    })
    @IsNumber()
    subjectId: number;
}
