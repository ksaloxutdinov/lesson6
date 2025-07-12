import db from "../database/index.js";
import StudentValidation from "../validators/student.validator.js";
import { successResponse, errorResponse } from "../helpers/response-handle.js";

const validation = new StudentValidation();

class StudentController{
    async createStudent(req, res) {
        try {
            const { value, error } = validation.createValidator(req.body);
            if (error) return errorResponse(res, `Validation error: ${error.message}`);
            const { username, group_id } = value;

            const group = (await db.query('SELECT * FROM "group" WHERE id = $1', [group_id])).rows[0];
            if (!group) return errorResponse(res, 'Group does not exist', 400);
            
            const student = (await db.query('SELECT * FROM student WHERE username = $1', [username])).rows[0];
            if (student) return errorResponse(res, 'Username already taken', 409);

            const lastRecordId = (await db.query('SELECT * FROM student ORDER BY id DESC LIMIT 1')).rows[0]?.id;
            if (lastRecordId) {
                await db.query(`ALTER SEQUENCE student_id_seq RESTART WITH ${lastRecordId + 1}`);
            } else {
                await db.query(`ALTER SEQUENCE student_id_seq RESTART WITH 1`);
            }

            const newStudent = (await db.query('INSERT INTO student (username, group_id) VALUES ($1, $2) RETURNING *', [username, group_id])).rows[0];
            if (!newStudent) return errorResponse(res, 'Error on creating student', 400);

            return successResponse(res, newStudent, 201);
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }

    async getAllStudents(_req, res) {
        try {
            const students = (await db.query(`
                SELECT 
                    student.id,
                    student.username AS student,
                    "group".name AS group,
                    teacher.full_name AS teacher,
                    student_passport.number AS passport,
                    student_passport.pinfl AS pinfl,
                    student.created_at
                FROM student
                JOIN "group" ON student.group_id = "group".id
                JOIN student_passport ON student_passport.student_id = student.id
                JOIN teacher_group ON "group".id = teacher_group.group_id
                JOIN teacher ON teacher_group.teacher_id = teacher.id
                ORDER BY student.id`)).rows;
            return successResponse(res, students);
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }

    async getStudentById(req, res) {
        try {
            const id = req.params.id;
            const student = (await db.query(`
                SELECT 
                    student.id,
                    student.username AS student,
                    "group".name AS group,
                    teacher.full_name AS teacher,
                    student_passport.number AS passport,
                    student_passport.pinfl AS pinfl,
                    student.created_at
                FROM student
                JOIN "group" ON student.group_id = "group".id
                JOIN student_passport ON student_passport.student_id = student.id
                JOIN teacher_group ON "group".id = teacher_group.group_id
                JOIN teacher ON teacher_group.teacher_id = teacher.id
                WHERE student.id = $1
                ORDER BY student.id`, [id])).rows[0];
            if (!student) return errorResponse(res, 'Student not found', 404);

            return successResponse(res, student);
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }
    
    async updateStudent(req, res) {
        try {
            const id = req.params.id;
            const { value, error } = validation.updateValidator(req.body);
            if (error) return errorResponse(res, `Validation error: ${error.message}`, 422);

            const student = (await db.query('SELECT * FROM student WHERE id = $1', [id])).rows[0];
            if (!student) return errorResponse(res, 'Student does not exist', 400);

            let updatedStudent;
            const { username, group_id } = value;

            if (username) {
                const student = (await db.query('SELECT * FROM student WHERE username = $1', [username])).rows[0];
                if (student) return errorResponse(res, 'Username already taken', 409);
            }

            if (group_id) {
                const group = (await db.query('SELECT * FROM "group" WHERE id = $1', [group_id])).rows[0];
                if (!group) return errorResponse(res, 'Group does not exist', 400);
            }

            if (username && !group_id) {
                updatedStudent = (await db.query('UPDATE student SET username = $1 WHERE id = $2 RETURNING *', [username, id])).rows[0];
            } else if (!username && group_id) {
                updatedStudent = (await db.query('UPDATE student SET group_id = $1 WHERE id = $2 RETURNING *', [group_id, id])).rows[0];
            } else if (username && group_id) {
                updatedStudent = (await db.query('UPDATE student SET username = $1, group_id = $2 WHERE id = $3 RETURNING *', [username, group_id, id])).rows[0];
            } else {
                return errorResponse(res, 'Nothing to update', 400);
            }

            if (!updatedStudent) return errorResponse(res, 'Error on updating student', 400);

            return successResponse(res, updatedStudent);
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }

    async deleteStudent(req, res) {
        try {
            const id = req.params.id;

            const deletedStudent = (await db.query('DELETE FROM student WHERE id = $1 RETURNING *', [id])).rows[0];
            if (!deletedStudent) return errorResponse(res, 'Student does not exist', 400);

            return successResponse(res, {});
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }
}

export default StudentController;