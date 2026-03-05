const express = require("express");
const router = express.Router();
const { register, login, sendOtp, resetPassword } = require("../controllers/authController");

router.post("/register", register);
router.post("/signup", register);
router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/reset-password", resetPassword);

module.exports = router;