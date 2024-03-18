const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const stripeController =  require("../controller/stripeController")

router.post("/create-checkout-session",verifyToken,stripeController.createCheckoutSession);

module.exports = router