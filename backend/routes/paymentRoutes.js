const express = require("express");

const {
  createPayment,
  getMyPayments,
  getPaymentById,
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create payment
router.post("/", protect, createPayment);

// Get my payments
router.get("/my-payments", protect, getMyPayments);

// Get one payment
router.get("/:id", protect, getPaymentById);

module.exports = router;