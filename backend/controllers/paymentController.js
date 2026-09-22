const Payment = require("../models/payment");
const Booking = require("../models/booking");

// ==========================================
// CREATE PAYMENT
// ==========================================
const createPayment = async (req, res) => {
  try {
    const {
      bookingId,
      paymentMethod,
    } = req.body;

    // Check required fields
    if (!bookingId || !paymentMethod) {
      return res.status(400).json({
        message:
          "Please provide bookingId and paymentMethod",
      });
    }

    // Check payment method
    const allowedMethods = [
      "UPI",
      "CARD",
      "CASH",
    ];

    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    // ==========================================
    // FIND BOOKING
    // ==========================================
    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user.userId,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Cannot pay for cancelled booking
    if (booking.status === "cancelled") {
      return res.status(400).json({
        message:
          "Cannot make payment for a cancelled booking",
      });
    }

    // ==========================================
    // CHECK IF PAYMENT ALREADY EXISTS
    // ==========================================
    const existingPayment =
      await Payment.findOne({
        bookingId,
      });

    if (existingPayment) {
      return res.status(400).json({
        message: "Payment already exists for this booking",
        payment: existingPayment,
      });
    }

    // ==========================================
    // CREATE PAYMENT
    // ==========================================
    const payment = await Payment.create({
      bookingId: booking._id,
      userId: req.user.userId,
      amount: booking.totalAmount,
      paymentMethod,
      status: "success",
    });

    res.status(201).json({
      message: "Payment successful",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// GET MY PAYMENTS
// ==========================================
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      userId: req.user.userId,
    })
      .populate(
        "bookingId",
        "seats totalAmount status"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Payments fetched successfully",
      payments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// GET PAYMENT BY ID
// ==========================================
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    }).populate(
      "bookingId",
      "seats totalAmount status"
    );

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    res.status(200).json({
      message: "Payment fetched successfully",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createPayment,
  getMyPayments,
  getPaymentById,
};