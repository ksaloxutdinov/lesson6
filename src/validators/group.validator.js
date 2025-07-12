import Joi from "joi";

class GroupValidation{
    createValidator(data) {
        const group = Joi.object({
            name: Joi.string()
                .max(50)
                .min(3)
                .required()
        });

        return group.validate(data);
    }

    updateValidator(data) {
        const group = Joi.object({
            name: Joi.string()
                .max(50)
                .min(3)
                .required()
        });

        return group.validate(data);
    }
}

export default GroupValidation;