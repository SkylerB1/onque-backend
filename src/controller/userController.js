const { SuccessResponse, ErrorResponse } = require("../utils/apiResponse");
const UserService = require("../services/userServices")
const loginInterface = new UserService();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Users = require("../models/Users");

const method = {}

// Register a new User

/**
   *
   * @param {object} req
   * @param {object} res
   * @since 18/06/2023
   * @author Aston | <from Appwrk>
   * @return {object} Json Response
   */

method.register = async (req, res) => {
    try {
        const verifiedEmail = await loginInterface.checkEmail(req.body.email);
        if (!verifiedEmail) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            const data = await loginInterface.createUser({
                email: req.body.email,
                password: hashedPassword,
            });
            const authToken = jwt.sign({ user: data.id }, process.env.SECRETKEY)
            res.status(200).json({
                data: data,
                token: authToken,
                message: "user created successfully",
            })

        } else {
            res.status(400).json({ message: "user already exist" })
        }
    } catch (err) {
        res.send({ message: "Somithing wrong" }).status(500)
    }
}

/**
   *
   * @param {object} req
   * @param {object} res
   * @since 18/06/2023
   * @author Aston | <from Appwrk>
   * @return {object} Json Response
   * Comment: This function take the data and authenticate the user
   */

method.logInUser = async (req, res) => {
    // const result = loginInterface.logInUser();
    const verifiedEmail = await loginInterface.checkEmail(req.body.email)
    if (verifiedEmail) {
        const verifiedPassword = await bcrypt.compare(req.body.password, verifiedEmail.password)
        if (verifiedPassword) {
            const authToken = jwt.sign({ user: verifiedEmail.id }, process.env.SECRETKEY)
            res.status(200).json({
                data: {id: verifiedEmail.id, email: verifiedEmail.email },
                token: authToken,
                message: "user Login successfully",
            })

        } else {
            res.status(400).json({ message: "user not exist" })
        }
    } else {
        res.status(400).json({ message: " this email is not exist" })
    }
}

method.facebooklogin = async (req, res) => {
    const {userID, accessToken} = req.body;

    let urlGraphFacebook = `https://graph.facebook.com/v17.0/${userID}/accounts?fields=id,name,email&access_token=${accessToken} `
    fetch(urlGraphFacebook, {
        method: 'GET'
    })
    .then(res => res.json())
    .then(res => {
        const email = res;
        const verifiedEmail = loginInterface.checkEmail(email); 
        if (!verifiedEmail) {
            const hashedPassword =  bcrypt.hash(Math.random().toString(36).slice(-8), 10)
            const data =  loginInterface.createUser({
                email: req.body.email,
                password: hashedPassword,
            });
            const authToken = jwt.sign({ user: data.id }, process.env.SECRETKEY)
            res.status(200).json({
                data: data,
                token: authToken,
                message: "user created successfully",
            })

        } else {
            res.status(400).json({ message: "Something went wrong" })
        }
    })
}

module.exports = method