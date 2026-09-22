const express = require("express");

const {
  createTheatre,
  getMyTheatres,
  getTheatreById,
  updateTheatre,
  deleteTheatre,
} = require("../controllers/theatreController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create theatre
router.post("/", protect, createTheatre);

// Get owner's theatres
router.get("/my-theatres", protect, getMyTheatres);

// Get one theatre
router.get("/:id", protect, getTheatreById);

// Update theatre
router.put("/:id", protect, updateTheatre);

// Delete theatre
router.delete("/:id", protect, deleteTheatre);

module.exports = router;