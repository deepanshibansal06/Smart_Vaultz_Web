const express = require("express");
const router = express.Router();
const { getLockStatus } = require("../controllers/lockController");

router.get("/status", getLockStatus);

module.exports = router;
