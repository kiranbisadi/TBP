const express = require("express");

const {
  createBooking,
  getShowSeats,
  getMyBookings,
  getBookingById,
  cancelBooking,
} = require("../controllers/bookingController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get seats for a show
router.get("/show/:showId/seats", protect, getShowSeats);

// Create booking
router.post("/", protect, createBooking);

// Get logged-in user's bookings
router.get("/my-bookings", protect, getMyBookings);

// Get one booking
router.get("/:id", protect, getBookingById);

// Cancel booking
router.put("/:id/cancel", protect, cancelBooking);

module.exports = router;