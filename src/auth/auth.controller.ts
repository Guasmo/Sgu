import { Controller, Post, Body, HttpStatus, HttpCode } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/loginDto";
import { Auth } from "./decorators";
import { Role } from "@prisma/client";
import { RegisterStudentDto } from "./dto/register-student.dto";
import { RegisterTeacherDto } from "./dto/register-teacher.dto";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}


	@Post("register/student")
	async registerStudent(@Body() registerStudentDto: RegisterStudentDto) {
		return this.authService.registerStudent(registerStudentDto);
	}

	@Auth(Role.ADMIN)
	@Post("register/teacher")
	async registerTeacher(@Body() registerTeacherDto: RegisterTeacherDto) {
		return this.authService.registerTeacher(registerTeacherDto);
	}

	@HttpCode(HttpStatus.OK)
	@Post("login")
	async login(@Body() loginDto: LoginDto) {
		return this.authService.login(loginDto);
	}

	@Auth(Role.ADMIN)
	@Post("test")
	async test() {
		return `this action returns a null`;
	}
}