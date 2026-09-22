const mongoose = require("mongoose");

const screenSchema = new mongoose.Schema(
  {
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    totalSeats: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
    },

    rows: {
      type: Number,
      required: true,
      min: 1,
    },

    seatsPerRow: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Screen = mongoose.model("Screen", screenSchema);

module.exports = Screen;