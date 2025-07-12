import Joi from "joi";

class StudentValidation{
    createValidator(data) {
        const student = Joi.object({
            username: Joi.string()
                .min(5)
                .max(50)
                .required(),
            group_id: Joi.number()
                .required()
        });

        return student.validate(data);
    }

    updateValidator(data) {
        const student = Joi.object({
            username: Joi.string()
                .min(5)
                .max(50)
                .optional(),
            group_id: Joi.number()
                .optional()
        });

        return student.validate(data);
    }
}

export default StudentValidation;