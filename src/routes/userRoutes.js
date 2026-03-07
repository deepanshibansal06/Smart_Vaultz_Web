const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getMe, updateProfile, getWalletBalance, addWalletMoney, setMpin, verifyMpin } = require("../controllers/userController");

router.get("/me", protect, getMe);
router.put("/me", protect, updateProfile);
router.post("/me/mpin", protect, setMpin);
router.post("/me/mpin/verify", protect, verifyMpin);
router.get("/me/wallet", protect, getWalletBalance);
router.post("/me/wallet/add", protect, addWalletMoney);

module.exports = router;
