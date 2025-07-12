import db from "../database/index.js";
import { successResponse, errorResponse } from "../helpers/response-handle.js";

class TeacherGroupController{
    async createTG(req, res) {
        try {
            const { teacher_id, group_id } = req.body;

            if (!teacher_id || !group_id) return errorResponse(res, 'Both teacher_id and group_id are required', 400);

            const teacher = (await db.query('SELECT * FROM teacher WHERE id = $1', [teacher_id])).rows[0];
            if (!teacher) return errorResponse(res, 'Teacher does not exist', 400);

            const group = (await db.query('SELECT * FROM "group" WHERE id = $1', [group_id])).rows[0];
            if (!group) return errorResponse(res, 'Group does not exist', 400);

            const lastRecordId = (await db.query('SELECT * FROM teacher_group ORDER BY id DESC LIMIT 1')).rows[0]?.id;
            if (lastRecordId) {
                await db.query(`ALTER SEQUENCE teacher_group_id_seq RESTART WITH ${lastRecordId + 1}`);
            } else {
                await db.query('ALTER SEQUENCE teacher_group_id_seq RESTART WITH 1');
            }

            const tg = (await db.query('INSERT INTO teacher_group (teacher_id, group_id) VALUES ($1, $2) RETURNING *', [teacher_id, group_id])).rows[0];
            if (!tg) return errorResponse(res, 'Error on creating Teacher-Group', 400);

            return successResponse(res, tg, 201);
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }

    async getAllTG(_req, res) {
        try {
            const tgs = (await db.query(`
                SELECT
                    teacher_group.id,
                    teacher.full_name AS teacher,
                    "group".name AS group,
                    teacher_group.created_at
                FROM teacher_group
                JOIN teacher ON teacher_group.teacher_id = teacher.id
                JOIN "group" ON "group".id = teacher_group.group_id
                GROUP BY teacher_group.id, teacher.id, "group".name, teacher.full_name
                ORDER BY teacher.id ASC`
            )).rows;
            return successResponse(res, tgs);
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }

    async getTGById(req, res) {
        try {
            const id = req.params.id;

            const tg = (await db.query(`
                SELECT
                    teacher_group.id,
                    teacher.full_name AS teacher,
                    "group".name AS group,
                    teacher_group.created_at
                FROM teacher_group
                JOIN teacher ON teacher_group.teacher_id = teacher.id
                JOIN "group" ON "group".id = teacher_group.group_id
                WHERE teacher_group.id = $1
                GROUP BY teacher_group.id, teacher.id, "group".name, teacher.full_name
                `, [id]
            )).rows[0];
            if (!tg) return errorResponse(res, 'Teacher-Group data does not exist', 404);

            return successResponse(res, tg);
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }

    async updateTG(req, res) {
        try {
            const id = req.params.id;

            const tg = (await db.query('SELECT * FROM teacher_group WHERE id = $1', [id])).rows[0];
            if (!tg) return errorResponse(res, 'Teacher-Group data does not exist', 400);

            const { teacher_id, group_id } = req.body;

            let updatedTG;

            if (teacher_id && group_id) {
                console.log('IN 1st block')
                const teacherExists = (await db.query('SELECT * FROM teacher WHERE id = $1', [teacher_id])).rows[0];
                if (!teacherExists) return errorResponse(res, 'Teacher does not exist', 400);

                const groupExists = (await db.query('SELECT * FROM "group" WHERE id = $1', [group_id])).rows[0];
                if (!groupExists) return errorResponse(res, 'Group does not exist', 400);

                updatedTG = (await db.query('UPDATE teacher_group SET teacher_id = $1, group_id = $2 WHERE id = $3 RETURNING *', [teacher_id, group_id, id])).rows[0];
            } else if (teacher_id && !group_id) {
                console.log('IN 2nd block')
                const teacherExists = (await db.query('SELECT * FROM teacher WHERE id = $1', [teacher_id])).rows[0];
                if (!teacherExists) return errorResponse(res, 'Teacher does not exist', 400);

                updatedTG = (await db.query('UPDATE teacher_group SET teacher_id = $1 WHERE id = $2 RETURNING *', [teacher_id, id])).rows[0];
            } else if (!teacher_id && group_id) {
                console.log('IN 3rd block')
                const teacherExists = (await db.query('SELECT * FROM "group" WHERE id = $1', [group_id])).rows[0];
                if (!teacherExists) return errorResponse(res, 'Group does not exist', 400);

                updatedTG = (await db.query('UPDATE teacher_group SET group_id = $1 WHERE id = $2 RETURNING *', [group_id, id])).rows[0];
            } else {
                return errorResponse(res, 'Nothing to update', 400);
            }

            if (!updatedTG) return errorResponse(res, 'Error on updating Teacher-Group data', 400);

            return successResponse(res, updatedTG);
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }

    async deleteTG(req, res) {
        try {
            const id = req.params.id;

            const deletedTG = (await db.query('DELETE FROM teacher_group WHERE id = $1 RETURNING *', [id])).rows[0];
            if (!deletedTG) return errorResponse(res, 'Teacher-Group data does not exist', 400);

            return successResponse(res, {});
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }
}

export default TeacherGroupController;