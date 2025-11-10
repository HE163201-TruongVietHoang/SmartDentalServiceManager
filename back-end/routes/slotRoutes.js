const express = require("express");
const router = express.Router();
const {slotController} = require("../controllers/slotController.js");

router.get("/available", slotController.getAvailable);

module.exports = router;
