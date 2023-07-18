const { SuccessResponse, ErrorResponse } = require("../utils/apiResponse");
const UserService = require("../services/userServices")
const loginInterface = new UserService();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Users = require("../models/Users");

const method = {}

// Register a new User
method.register = async (req, res) => {
    try{
        const verifiedEmail = await loginInterface.checkEmail(req.body.email);
        if (!verifiedEmail) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            const data = await loginInterface.createUser({
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
                mobile: req.body.mobile,
                status: req.body.status,
            });
            const authToken = jwt.sign({user: data.id}, process.env.SECRETKEY)
            res.status(200).json({
                data: data,
                token: authToken,
                message: "user created successfully",
            })
    
        } else {
            res.status(400).json({ message: "user already exist" })
        }
    } catch (err){
        res.send({ message: "Somithing wrong" }).status(500)
    }
}

method.logInUser = async (req, res) => {
    // const result = loginInterface.logInUser();
    const verifiedEmail = await loginInterface.checkEmail(req.body.email)
    if(verifiedEmail) {
        const verifiedPassword = await bcrypt.compare(req.body.password, verifiedEmail.password)
        if (verifiedPassword){
            const authToken = jwt.sign({user: verifiedEmail.id}, process.env.SECRETKEY)
            res.status(200).json({
                data: {username: verifiedEmail.username,email:verifiedEmail.email},
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

module.exports = method