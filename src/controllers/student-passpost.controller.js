import db from "../database/index.js";
import PassportValidation from "../validators/student-passport.validator.js";
import { successResponse, errorResponse } from "../helpers/response-handle.js";

const validaion = new PassportValidation();

class StudentPassportController{
    async createPassport(req, res) {
        try {
            const { value, error } = validaion.createValidator(req.body);
            if (error) return errorResponse(res, `Validation error: ${error.message}`, 422);
            const { number, pinfl, student_id } = value;
    
            const numberExists = (await db.query('SELECT * FROM student_passport WHERE number = $1', [number])).rows[0];
            if (numberExists) return errorResponse(res, 'Passport number already exists', 409);
    
            const pinflExists = (await db.query('SELECT * FROM student_passport WHERE pinfl = $1', [pinfl])).rows[0];
            if (pinflExists) return errorResponse(res, 'Passport PINFL already exists', 409);

            const studentExist = (await db.query('SELECT * FROM student WHERE id = $1', [student_id])).rows[0];
            if (!studentExist) return errorResponse(res, 'Student does not exist', 400);
    
            const studentIdExists = (await db.query('SELECT * FROM student_passport WHERE student_id = $1', [student_id])).rows[0];
            if (studentIdExists) return errorResponse(res, 'This student is already bind to another credentials', 409);

            const lastRecordId = (await db.query('SELECT * FROM student_passport ORDER BY id DESC LIMIT 1')).rows[0]?.id;
            if (lastRecordId) {
                await db.query(`ALTER SEQUENCE student_passport_id_seq RESTART WITH ${lastRecordId + 1}`);
            } else {
                await db.query(`ALTER SEQUENCE student_passport_id_seq RESTART WITH 1`);
            }
    
            const newPassport = (await db.query('INSERT INTO student_passport (number, pinfl, student_id) VALUES ($1, $2, $3) RETURNING *', [number, pinfl, student_id])).rows[0];
            if (!newPassport) return errorResponse(res, 'Error on creating passport info', 400);
    
            return successResponse(res, newPassport, 201);
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }

    async getAllPassports(_req, res) {
        try {
            const passports = (await db.query(`
                SELECT
                    student_passport.id,
                    student.username AS student,
                    student_passport.number AS passport,
                    student_passport.pinfl AS pinfl,
                    student_passport.created_at
                FROM student
                JOIN student_passport
                ON student_passport.student_id = student.id
                ORDER BY student_passport.id ASC`)).rows;
            return successResponse(res, passports);
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }

    async getPassportById(req, res) {
        try {
            const id = req.params.id;
            const passport = (await db.query(`
                SELECT
                    student_passport.id,
                    student.username AS student,
                    student_passport.number AS passport,
                    student_passport.pinfl AS pinfl,
                    student_passport.created_at
                FROM student
                JOIN student_passport
                ON student_passport.student_id = student.id
                WHERE student_passport.id = $1`, [id])).rows[0];
            if (!passport) return errorResponse(res, 'Passport info not found', 404);

            return successResponse(res, passport);
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }

    async updatePassport(req, res) {
        try {
            const id = req.params.id;
            const { value, error } = validaion.updateValidator(req.body);
            if (error) return errorResponse(res, `Validation error: ${error.message}`, 422);

            const passport = (await db.query('SELECT * FROM student_passport WHERE id = $1', [id])).rows[0];
            if (!passport) return errorResponse(res, 'Passport info does not exist', 400);

            const { number, pinfl, student_id } = value;

            if (!number && !pinfl && !student_id) return errorResponse(res, 'Nothing to update', 400);

            let newNumber = number || passport.number;
            let newPinfl = pinfl || passport.pinfl;
            let newStudentId = student_id || passport.student_id;

            let updateQuery = 'UPDATE student_passport SET ';
            let updateValues = [];
            let setValues = [];

            if (newNumber !== passport.number) {
                const numberExists = (await db.query('SELECT * FROM student_passport WHERE number = $1', [newNumber])).rows[0];
                if (numberExists) return errorResponse(res, 'Passport number already exists', 409);
    
                updateValues.push(`number = $${updateValues.length + 1}`);
                setValues.push(newNumber);
            }

            if (newPinfl !== passport.pinfl) {
                const pinflExists = (await db.query('SELECT * FROM student_passport WHERE pinfl = $1', [newPinfl])).rows[0];
                if (pinflExists) return errorResponse(res, 'Passport PINFL already exists', 409);

                updateValues.push(`pinfl = $${updateValues.length + 1}`);
                setValues.push(newPinfl);
            }

            if (newStudentId !== passport.student_id) {
                const studentIdExists = (await db.query('SELECT * FROM student_passport WHERE student_id = $1', [newStudentId])).rows[0];
                if (studentIdExists) return errorResponse(res, 'This student is already bound to another credentials', 409);


                const studentExists = (await db.query('SELECT * FROM student WHERE id = $1', [newStudentId])).rows[0];
                if (!studentExists) return errorResponse(res, 'Student does not exist', 400);

                updateValues.push(`student_id = $${updateValues.length + 1}`);
                setValues.push(newStudentId);
            }

            if (updateValues.length === 0) return errorResponse(res, 'Nothing to update', 400);

            updateQuery += updateValues.join(' ') + ` WHERE id = $${updateValues.length + 1} RETURNING *`;
            setValues.push(id);

            const updatedPassport = (await db.query(updateQuery, setValues)).rows[0];
            if (!updatedPassport) return errorResponse(res, 'Error on updating passport', 400);

            return successResponse(res, updatedPassport);
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }

    async deletePassport(req, res) {
        try {
            const id = req.params.id;
    
            const deletedPassport = (await db.query('DELETE FROM sudent_passport WHERE id = $1 RETURNING *', [id])).rows[0];
            if (!deletedPassport) return errorResponse(res, 'Student passport does not exis', 400);
    
            return successResponse(res, {});
        } catch (error) {
            return errorResponse(res, error.message);
        }
    }
}

export default StudentPassportController;