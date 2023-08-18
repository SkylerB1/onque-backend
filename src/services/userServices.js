const db = require("../models/index");
const Users = require("../models/Users");
const SocialMediaToken = require("../models/SocialMediaToken");
const PostData = require("../models/PostData");
const MediaFile = require("../models/mediaFile");
const { Op } = require('sequelize');


class UserService {
    async checkEmail(email) {
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

    async checkId(userId) {
        return SocialMediaToken.findOne({
            where: {
                userId: userId
            }
        })
    }

    async setMediaToken(data) {

        if (data.userId != '') {
            const where = { userId: data.userId };
            const objData = {
                accessToken: data.accessToken,
                accessSecret: data.accessSecret,
            }
            const updateSocialToke = await SocialMediaToken.findOne({ where: where });
            console.log(updateSocialToke)
            if (updateSocialToke) {
                return SocialMediaToken.update(
                    objData, { where: where }
                )
            } else {
                return SocialMediaToken.create(
                    data
                )
            }
        } else {
            // post_id = data.id;
        }
    }

    async storePostData(data, post_id) {
        // backend query
        /****  if post id exist then update or create */
        let createRequired = 1;

        if (post_id != '') {
            let where = { id: post_id };
            let getPostData = await PostData.findOne({ where: where });
            if (getPostData) {
                createRequired = 0;
                return PostData.update(
                    data, { where: where }
                )
            }
        } else {
            // post_id = data.id;
        }

        if (createRequired) {
            return PostData.create(
                data
            )
        }
    }

    async getPostData() {
        let deleted = "0";
        if (deleted) {
            let where = { deleted: deleted }
            return PostData.findAll({ where: where });
        }
    }

    async uploadMediaFile(data) {
        return MediaFile.create(
            data
        )
    }

    async getSpecificPostData(id, userId) {
        let where = { id, userId };
        return await PostData.findOne({ where: where });
    }

    async updateSpecificPostData(id, userId) {
        const data = {
            deleted: "1",
            deletedOn: new Date()
        }
        return PostData.update(data, {
            where: {
                id: id,
                userId: userId
            }
        });
    }


    async scheduleData() {

        const currentDate = new Date(); // Get the current date and time
        const status = "pending";
        const deleted = "0";

        const result = await PostData.findAll({
            where: {
                scheduledDate: {
                    [Op.lte]: currentDate, // Use less than or equal operator
                },
                status: status,
                deleted: deleted,
            }
        });


        return result;
    }

    async getAccessToken(userId) {
        let where = { userId: userId };
        return await SocialMediaToken.findOne({ where: where });
        
    }
}

module.exports = UserService;