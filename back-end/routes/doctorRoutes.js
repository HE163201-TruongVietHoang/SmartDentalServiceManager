const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController.js");

router.get("/", doctorController.getAll);

module.exports = router;
