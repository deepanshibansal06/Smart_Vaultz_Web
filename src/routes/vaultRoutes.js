const express = require("express");
const router = express.Router();
const { createVault, getVaults, deleteVault } = require("../controllers/vaultController");
const { protect } = require("../middleware/authMiddleware");
const { role } = require("../middleware/roleMiddleware");

router.get("/", protect, getVaults);
router.post("/", protect, role("superadmin"), createVault);
router.delete("/:id", protect, role("superadmin"), deleteVault);

module.exports = router;