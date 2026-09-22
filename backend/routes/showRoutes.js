const express = require("express");

const {
  createShow,
  getMyShows,
  getShowById,
  updateShow,
  deleteShow,
  getPublicShows,
} = require("../controllers/showController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public - users can view available shows
router.get("/public", getPublicShows);

// Theatre owner - create show
router.post("/", protect, createShow);

// Theatre owner - get own shows
router.get("/my-shows", protect, getMyShows);

// Theatre owner - get one show
router.get("/:id", protect, getShowById);

// Theatre owner - update show
router.put("/:id", protect, updateShow);

// Theatre owner - delete show
router.delete("/:id", protect, deleteShow);

module.exports = router;