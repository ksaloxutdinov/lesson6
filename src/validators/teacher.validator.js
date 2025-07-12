import Joi from "joi";

class TeacherValidation{
    createValidator(data) {
        const teacher = Joi.object({
            full_name: Joi.string()
                .min(4)
                .max(100)
                .required(),
            subject: Joi.string()
                .min(3)
                .max(50)
                .required()
        });

        return teacher.validate(data);
    }

    updateValidator(data) {
        const teacher = Joi.object({
            full_name: Joi.string()
                .min(4)
                .max(100)
                .optional(),
            subject: Joi.string()
                .min(3)
                .max(50)
                .optional()
        });

        return teacher.validate(data);
    }
}

export default TeacherValidation;