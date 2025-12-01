const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController.js");

router.get("/", doctorController.getAll);
router.get("/:userId", doctorController.getDetail);

module.exports = router;
