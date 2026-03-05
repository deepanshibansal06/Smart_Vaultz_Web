const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getMe, updateProfile, getWalletBalance, addWalletMoney } = require("../controllers/userController");

router.get("/me", protect, getMe);
router.put("/me", protect, updateProfile);
router.get("/me/wallet", protect, getWalletBalance);
router.post("/me/wallet/add", protect, addWalletMoney);

module.exports = router;
