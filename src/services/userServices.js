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

    async storePostData(data,post_id) {

        // backend query
        /****  if post id exist then update or create */
        let createRequired = 1;

        if(post_id != '') {

            let where = { id:post_id};

             let getPostData = await PostData.findOne({where : where});

             if(getPostData) {

                createRequired = 0;

                return PostData.update(

                    data,{where: where}

                )

             }

        } else{}

        if(createRequired) {

            return PostData.create(

                data

            )

        }

    }

    async getPostData() {
        return PostData.findAll();
    }
    
    async uploadMediaFile(data) {
        return MediaFile.create(
            data
        )
    }
    async getSpecificPostData(id,userId){

        let where = { id,userId};

       return await PostData.findOne({where : where});

 

 

    }
}

module.exports = UserService;