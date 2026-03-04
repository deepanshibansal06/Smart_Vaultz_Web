const express = require("express");
const router = express.Router();
const { bookVault, openVault, closeVault } = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, bookVault);
router.post("/open/:id", protect, openVault);
router.post("/close/:id", protect, closeVault);

module.exports = router;