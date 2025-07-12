import Joi from "joi";

class PassportValidation{
    createValidator(data) {
        const passport = Joi.object({
            number: Joi.string()
                .length(9)
                .regex(/^[A-Z]{2}\d{7}$/)
                .required(),
            pinfl: Joi.string()
                .length(14)
                .regex(/^\d{14}$/)
                .required(),
            student_id: Joi.number()
                .required()
        });

        return passport.validate(data);
    }

    updateValidator(data) {
        const passport = Joi.object({
            number: Joi.string()
                .length(9)
                .regex(/^[A-Z]{2}\d{7}$/)
                .optional(),
            pinfl: Joi.string()
                .length(14)
                .regex(/^\d{14}$/)
                .optional(),
            student_id: Joi.number()
                .optional()
        });

        return passport.validate(data);
    }
}

export default PassportValidation;