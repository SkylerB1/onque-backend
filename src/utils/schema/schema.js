const Joi = require('joi');

const registerSchema = {
    register: Joi.object().keys({
        firstName: Joi.string().min(1).max(200).required(),
        lastName: Joi.string().min(1).max(200).required(),
        email: Joi.string().min(1).max(200).required().email(),
        password: Joi.string().min(8).max(20).required()
    })
}

const loginSchema = {
    login: Joi.object().keys({
        email: Joi.string().min(1).max(200).required().email(),
        password: Joi.string().min(8).max(20).required()

    })
}

module.exports = { loginSchema, registerSchema }