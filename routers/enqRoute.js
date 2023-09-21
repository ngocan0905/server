const express = require("express");
const { createEnq, updateEnq, deleteEnq, getAllEnq, getEnq } = require("../controller/enqCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createEnq);
router.put("/:id", authMiddleware, isAdmin, updateEnq);
router.delete("/:id", authMiddleware, isAdmin, deleteEnq);
router.get("/", getAllEnq);
router.get("/:id", getEnq);
module.exports = router;
