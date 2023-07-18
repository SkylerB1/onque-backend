const db = require("../config/db.config");
const Users = require("../models/Users");


class UserService {
    async checkEmail (email) {
        // backend query
        return Users.findOne({
            where: {
                email: email
            }
        })
    }

    async createUser(data) {
        // backend query
        return Users.create(
            data
        )
    }

    async logInUser() {
        // backend query
    }
}

module.exports = UserService;