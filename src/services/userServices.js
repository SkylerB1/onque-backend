const db = require("../config/db.config");
const Users = require("../models/Users");
const SocialMediaToken = require("../models/SocialMediaToken");
const PostData = require("../models/PostData");
const MediaFile = require("../models/mediaFile");


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

    async storePostData(data) {
        // backend query
        return PostData.create(
            data
        )
    }

    async getPostData() {
        return PostData.findAll();
    }
    
    async uploadMediaFile(data) {
        return MediaFile.create(
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