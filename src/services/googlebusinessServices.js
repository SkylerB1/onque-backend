
// const SocialMediaToken = require("../models/SocialMediaToken");
const SocialMediaToken = require("../models/SocialMediaToken");

const googleBusinessServices = {

    async mediaData(data) {
        try {
            const where = {
                userId: data.userId,
                platform: data.platform,
            };
            const IsToken = await SocialMediaToken.findOne({
                where: where,
            });
            if (IsToken) {
                return {
                    status: true,
                    data: await SocialMediaToken.update(data, {
                        where: where,
                        returning: true,
                    }),
                };
            } else {
                return {
                    status: true,
                    data: await SocialMediaToken.create(data, { returning: true }),
                };
            }
        } catch (err) {
            return { status: false, data: err };
        }
    }
};

module.exports = googleBusinessServices;