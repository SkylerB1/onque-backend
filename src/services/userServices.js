const db = require("../config/db.config");
const Users = require("../models/Users");
const SocialMediaToken = require("../models/SocialMediaToken");



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

    async checkId (id) {
        return SocialMediaToken.findOne({
            where: {
                id: id
            }
        })
    }

    async setMediaToken (data) {
        return SocialMediaToken.create(
            data
        )
    }

    // async checkId (id) {
    //     return SocialMediaToken.findOne({
    //         where: {
    //             id: id
    //         }
    //     })
    // }
}

module.exports = UserService;