const UserService = require("../services/userServices")
const userInterface = new UserService();

const method = {}


/**
*
* @param {request} req
* @param {response} res
* @returns Json response or Error response
* Comment: get all data which is scheduled for posting
*/
method.scheduleData = async (req, res) => {
    let data = await userInterface.scheduleData();
    if (data.length > 0) {
        res.status(200).json({
            message: "Schedule data fetched successfully",
            data: data
        })
    } else {
        res.status(400).json({
            message: "No schedule data found"
        })
    }
}

module.exports = method