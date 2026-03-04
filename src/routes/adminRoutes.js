const express = require("express");
const router = express.Router();
const { dashboard } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { role } = require("../middleware/roleMiddleware");

router.get("/dashboard", protect, role("superadmin"), dashboard);

module.exports = router;