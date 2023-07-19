const Joi = require('joi');

const userSchema = {
    login: Joi.object().keys({
        email: Joi.string().min(1).max(200).required().email(),
        password: Joi.string().min(8).max(20).required()

    })
}

module.exports = {userSchema}