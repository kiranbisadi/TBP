const express = require("express");

const {
  createScreen,
  getMyScreens,
  getScreenById,
  updateScreen,
  deleteScreen,
} = require("../controllers/screenController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create screen
router.post("/", protect, createScreen);

// Get all screens belonging to owner's theatres
router.get("/my-screens", protect, getMyScreens);

// Get one screen
router.get("/:id", protect, getScreenById);

// Update screen
router.put("/:id", protect, updateScreen);

// Delete screen
router.delete("/:id", protect, deleteScreen);

module.exports = router;