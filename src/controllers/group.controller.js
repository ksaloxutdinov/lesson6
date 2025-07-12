import db from "../database/index.js";
import GroupValidation from "../validators/group.validator.js";
import { successResponse, errorResponse } from "../helpers/response-handle.js";

const validation = new GroupValidation();

class GroupController{
    async createGroup(req, res) {
        try {
            const { value, error } = validation.createValidator(req.body);
            if (error) return errorResponse(res, `Validation error: ${error.message}`, 422);
            const { name } = value;

            const lastRecordId = (await db.query('SELECT * FROM "group" ORDER BY id DESC LIMIT 1')).rows[0]?.id;
            if (lastRecordId) {
                await db.query(`ALTER SEQUENCE group_id_seq RESTART WITH ${lastRecordId + 1}`);
            } else {
                await db.query(`ALTER SEQUENCE group_id_seq RESTART WITH 1`);
            }
            
            const groupExists = (await db.query('SELECT * FROM "group" WHERE name = $1', [name])).rows[0];
            if (groupExists) return errorResponse(res, 'This group already exists', 409);

            const newGroup = (await db.query('INSERT INTO "group" (name) VALUES ($1) RETURNING *', [name])).rows[0];
            if (!newGroup) return errorResponse(res, 'Error on creating group', 400);

            return successResponse(res, newGroup, 201);
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }

    async getAllGroups(_req, res) {
        try {
            const groups = (await db.query(`
                SELECT 
                    "group".id, 
                    "group".name AS group, 
                    teacher.full_name AS teacher,
                    ARRAY_AGG(DISTINCT student.username) AS students,
                    "group".created_at
                FROM "group" 
                LEFT JOIN student ON student.group_id = "group".id
                LEFT JOIN teacher_group ON teacher_group.group_id = "group".id
                LEFT JOIN teacher ON teacher.id = teacher_group.teacher_id 
                GROUP BY "group".id, teacher.full_name
                ORDER BY "group".id ASC`
            )).rows;
            return successResponse(res, groups);
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }

    async getGroupById(req, res) {
        try {
            const id = req.params.id;
            const group = (await db.query(`
                SELECT 
                    "group".id, 
                    "group".name AS group, 
                    teacher.full_name AS teacher,
                    ARRAY_AGG(DISTINCT student.username) AS students,
                    "group".created_at
                FROM "group" 
                JOIN student ON student.group_id = "group".id
                JOIN teacher_group ON teacher_group.group_id = "group".id
                JOIN teacher ON teacher.id = teacher_group.teacher_id
                WHERE "group".id = $1
                GROUP BY "group".id, teacher.full_name`, [id]
            )).rows[0];
            if (!group) return errorResponse(res, 'Group not found', 404);

            return successResponse(res, group)
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }

    async updateGroup(req, res) {
        try {
            const id = req.params.id;
            const { value, error } = validation.updateValidator(req.body);
            if (error) return errorResponse(res, `Validation error: ${error.message}`, 422);

            const group = (await db.query('SELECT * FROM "group" WHERE id = $1', [id])).rows[0];
            if (!group) return errorResponse(res, 'Group does not exist', 400);

            const { name } = value;
            const groupExists = (await db.query('SELECT * FROM "group" WHERE name = $1', [name])).rows[0];
            if (groupExists) return errorResponse(res, 'This group already exists', 409);

            const updatedGroup = (await db.query('UPDATE "group" SET name = $1 WHERE id = $2 RETURNING *', [name, id])).rows[0];
            if (!updatedGroup) return errorResponse(res, 'Error on updating group', 400);

            return successResponse(res, updatedGroup);
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }

    async deleteGroup(req, res) {
        try {
            const id = req.params.id;
            
            const deletedGroup = (await db.query('DELETE FROM "group" WHERE id = $1 RETURNING *', [id])).rows[0];
            if (!deletedGroup) return errorResponse(res, 'Group does not exist', 400);

            return successResponse(res, {});
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }
}

export default GroupController;