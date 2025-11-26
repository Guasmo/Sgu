-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "age" INTEGER,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speciality" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "speciality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "total_cicles" INTEGER NOT NULL,
    "duration_years" INTEGER NOT NULL,

    CONSTRAINT "career_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_profile" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "speciality_id" INTEGER NOT NULL,
    "career_id" INTEGER NOT NULL,

    CONSTRAINT "teacher_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_profile" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "career_id" INTEGER NOT NULL,
    "current_cicle" INTEGER NOT NULL,

    CONSTRAINT "student_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "career_id" INTEGER NOT NULL,
    "cicle_number" INTEGER NOT NULL,
    "teacher_profile_id" INTEGER,

    CONSTRAINT "subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_subject" (
    "id" SERIAL NOT NULL,
    "student_profile_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "grade" DECIMAL(5,2),
    "status" TEXT NOT NULL DEFAULT 'enrolled',

    CONSTRAINT "student_subject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_role_idx" ON "user"("role");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "speciality_name_key" ON "speciality"("name");

-- CreateIndex
CREATE UNIQUE INDEX "career_name_key" ON "career"("name");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_profile_user_id_key" ON "teacher_profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_profile_user_id_key" ON "student_profile"("user_id");

-- CreateIndex
CREATE INDEX "student_profile_career_id_current_cicle_idx" ON "student_profile"("career_id", "current_cicle");

-- CreateIndex
CREATE INDEX "subject_career_id_cicle_number_idx" ON "subject"("career_id", "cicle_number");

-- CreateIndex
CREATE UNIQUE INDEX "subject_career_id_cicle_number_name_key" ON "subject"("career_id", "cicle_number", "name");

-- CreateIndex
CREATE UNIQUE INDEX "student_subject_student_profile_id_subject_id_key" ON "student_subject"("student_profile_id", "subject_id");

-- AddForeignKey
ALTER TABLE "teacher_profile" ADD CONSTRAINT "teacher_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_profile" ADD CONSTRAINT "teacher_profile_speciality_id_fkey" FOREIGN KEY ("speciality_id") REFERENCES "speciality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_profile" ADD CONSTRAINT "teacher_profile_career_id_fkey" FOREIGN KEY ("career_id") REFERENCES "career"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profile" ADD CONSTRAINT "student_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profile" ADD CONSTRAINT "student_profile_career_id_fkey" FOREIGN KEY ("career_id") REFERENCES "career"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject" ADD CONSTRAINT "subject_career_id_fkey" FOREIGN KEY ("career_id") REFERENCES "career"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject" ADD CONSTRAINT "subject_teacher_profile_id_fkey" FOREIGN KEY ("teacher_profile_id") REFERENCES "teacher_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_subject" ADD CONSTRAINT "student_subject_student_profile_id_fkey" FOREIGN KEY ("student_profile_id") REFERENCES "student_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_subject" ADD CONSTRAINT "student_subject_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
