import db from "../database/index.js";
import TeacherValidation from "../validators/teacher.validator.js";
import { successResponse, errorResponse } from "../helpers/response-handle.js";

const validation = new TeacherValidation();

class TeacherController{
    async createTeacher(req, res) {
        try {
            const { value, error } = validation.createValidator(req.body);
            if (error) return errorResponse(res, `Validation error: ${error.message}`, 409);
            const { full_name, subject } = value;

            const lastRecordId = (await db.query('SELECT * FROM teacher ORDER BY id DESC LIMIT 1')).rows[0]?.id;
            if (lastRecordId) {
                await db.query(`ALTER SEQUENCE teacher_id_seq RESTART WITH ${lastRecordId + 1}`);
            } else {
                await db.query(`ALTER SEQUENCE teacher_id_seq RESTART WITH 1`);
            }

            const newTeacher = (await db.query('INSERT INTO teacher (full_name, subject) VALUES ($1, $2) RETURNING *', [full_name, subject])).rows[0];
            if (!newTeacher) return errorResponse(res, 'Error on creating teacher', 400);

            return successResponse(res, newTeacher, 201);
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }

    async getAllTeachers(_req, res) {
        try {
            const teachers = (await db.query(`
                SELECT
                    teacher.id,
                    teacher.full_name AS teacher,
                    "group".name AS group,
                    teacher.created_at
                FROM teacher
                JOIN teacher_group ON teacher_group.teacher_id = teacher.id
                JOIN "group" ON "group".id = teacher_group.group_id
                GROUP BY teacher.id, "group".name
                ORDER BY teacher.id ASC`)).rows;
            return successResponse(res, teachers);
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }

    async getTeacherById(req, res) {
        try {
            const id = req.params.id;

            const teacher = (await db.query(`
                SELECT
                    teacher.id,
                    teacher.full_name AS teacher,
                    "group".name AS group,
                    teacher.created_at
                FROM teacher
                JOIN teacher_group ON teacher_group.teacher_id = teacher.id
                JOIN "group" ON "group".id = teacher_group.group_id
                WHERE teacher.id = $1`, [id])).rows[0];
            if (!teacher) return errorResponse(res, 'Teacher not found', 404);

            return successResponse(res, teacher);
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }

    async updateTeacher(req, res) {
        try {
            const id = req.params.id;
            const { value, error } = validation.updateValidator(req.body);
            if (error) return errorResponse(res, `Validation error: ${error.message}`, 422);

            const teacher = (await db.query('SELECT * FROM teacher WHERE id = $1', [id])).rows[0];
            if (!teacher) return errorResponse('Teacher does not exist', 400);

            let updatedTeacher;
            const { full_name, subject } = value;

            if (full_name && !subject) {
                updatedTeacher = (await db.query('UPDATE teacher SET full_name = $1 WHERE id = $2 RETURNING *', [full_name, id])).rows[0];
            } else if (!full_name && subject) {
                updatedTeacher = (await db.query('UPDATE teacher SET subject = $1 WHERE id = $2 RETURNING *', [subject, id])).rows[0];
            } else if (full_name && subject) {
                updatedTeacher = (await db.query('UPDATE teacher SET full_name = $1, subject = $2 WHERE id = $3 RETURNING *', [full_name, subject, id])).rows[0];
            } else {
                return errorResponse(res, 'Nothing to update', 400);
            }

            if (!updatedTeacher) return errorResponse(res, 'Error on updating teacher', 400);

            return successResponse(res, updatedTeacher);
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }

    async deleteTeacher(req, res) {
        try {
            const id = req.params.id;
        
            const deletedTeacher = (await db.query('DELETE FROM teacher WHERE id = $1 RETURNING *', [id])).rows[0];
            if (!deletedTeacher) return errorResponse(res, 'Teacher does not exist', 400);

            return successResponse(res, {});
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }
}

export default TeacherController;