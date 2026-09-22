const Screen = require("../models/screen");
const Theatre = require("../models/Theatre");

// ==========================================
// CREATE SCREEN
// ==========================================
const createScreen = async (req, res) => {
  try {
    const {
      theatreId,
      name,
      totalSeats,
      rows,
      seatsPerRow,
    } = req.body;

    // Check required fields
    if (
      !theatreId ||
      !name ||
      !totalSeats ||
      !rows ||
      !seatsPerRow
    ) {
      return res.status(400).json({
        message: "Please provide all required screen details",
      });
    }

    // ==========================================
    // CHECK THEATRE
    // ==========================================
    const theatre = await Theatre.findOne({
      _id: theatreId,
      ownerId: req.user.userId,
    });

    if (!theatre) {
      return res.status(404).json({
        message: "Theatre not found or does not belong to you",
      });
    }

    // Only approved theatres can have screens
    if (theatre.status !== "approved") {
      return res.status(400).json({
        message: "Theatre must be approved before adding screens",
      });
    }

    // ==========================================
    // MAXIMUM 2 SCREENS PER THEATRE
    // ==========================================
    const screenCount = await Screen.countDocuments({
      theatreId,
    });

    if (screenCount >= 2) {
      return res.status(400).json({
        message: "A theatre can have maximum 2 screens",
      });
    }

    // ==========================================
    // MAXIMUM 50 SEATS
    // ==========================================
    if (totalSeats > 50) {
      return res.status(400).json({
        message: "A screen can have maximum 50 seats",
      });
    }

    // ==========================================
    // VALIDATE SEAT CALCULATION
    // ==========================================
    if (rows * seatsPerRow !== totalSeats) {
      return res.status(400).json({
        message: "Total seats must equal rows × seats per row",
      });
    }

    // ==========================================
    // CHECK DUPLICATE SCREEN NAME
    // ==========================================
    const existingScreen = await Screen.findOne({
      theatreId,
      name,
    });

    if (existingScreen) {
      return res.status(400).json({
        message:
          "A screen with this name already exists in this theatre",
      });
    }

    // ==========================================
    // CREATE SCREEN
    // ==========================================
    const screen = await Screen.create({
      theatreId,
      name,
      totalSeats,
      rows,
      seatsPerRow,
      status: "active",
    });

    res.status(201).json({
      message: "Screen created successfully",
      screen,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// GET MY SCREENS
// ==========================================
const getMyScreens = async (req, res) => {
  try {
    // Get theatres belonging to logged-in owner
    const theatres = await Theatre.find({
      ownerId: req.user.userId,
    }).select("_id");

    const theatreIds = theatres.map(
      (theatre) => theatre._id
    );

    // Get screens belonging to those theatres
    const screens = await Screen.find({
      theatreId: { $in: theatreIds },
    })
      .populate(
        "theatreId",
        "name address city"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Screens fetched successfully",
      screens,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// GET SCREEN BY ID
// ==========================================
const getScreenById = async (req, res) => {
  try {
    const screen = await Screen.findById(
      req.params.id
    ).populate(
      "theatreId",
      "name address city ownerId"
    );

    if (!screen) {
      return res.status(404).json({
        message: "Screen not found",
      });
    }

    // Make sure screen belongs to owner's theatre
    if (
      screen.theatreId.ownerId.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to access this screen",
      });
    }

    res.status(200).json({
      message: "Screen fetched successfully",
      screen,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE SCREEN
// ==========================================
const updateScreen = async (req, res) => {
  try {
    const {
      name,
      totalSeats,
      rows,
      seatsPerRow,
      status,
    } = req.body;

    const screen = await Screen.findById(
      req.params.id
    ).populate("theatreId");

    if (!screen) {
      return res.status(404).json({
        message: "Screen not found",
      });
    }

    // ==========================================
    // CHECK OWNERSHIP
    // ==========================================
    if (
      screen.theatreId.ownerId.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to update this screen",
      });
    }

    // ==========================================
    // CALCULATE NEW VALUES
    // ==========================================
    const newRows = rows ?? screen.rows;

    const newSeatsPerRow =
      seatsPerRow ?? screen.seatsPerRow;

    const newTotalSeats =
      totalSeats ?? screen.totalSeats;

    // ==========================================
    // MAXIMUM 50 SEATS
    // ==========================================
    if (newTotalSeats > 50) {
      return res.status(400).json({
        message: "A screen can have maximum 50 seats",
      });
    }

    // ==========================================
    // VALIDATE SEAT CALCULATION
    // ==========================================
    if (
      newRows * newSeatsPerRow !==
      newTotalSeats
    ) {
      return res.status(400).json({
        message:
          "Total seats must equal rows × seats per row",
      });
    }

    // ==========================================
    // CHECK DUPLICATE SCREEN NAME
    // ==========================================
    if (name && name !== screen.name) {
      const existingScreen =
        await Screen.findOne({
          theatreId: screen.theatreId._id,
          name,
          _id: { $ne: screen._id },
        });

      if (existingScreen) {
        return res.status(400).json({
          message:
            "A screen with this name already exists in this theatre",
        });
      }
    }

    // ==========================================
    // UPDATE SCREEN
    // ==========================================
    screen.name = name ?? screen.name;

    screen.totalSeats = newTotalSeats;

    screen.rows = newRows;

    screen.seatsPerRow = newSeatsPerRow;

    screen.status = status ?? screen.status;

    await screen.save();

    res.status(200).json({
      message: "Screen updated successfully",
      screen,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE SCREEN
// ==========================================
const deleteScreen = async (req, res) => {
  try {
    const screen = await Screen.findById(
      req.params.id
    ).populate("theatreId");

    if (!screen) {
      return res.status(404).json({
        message: "Screen not found",
      });
    }

    // ==========================================
    // CHECK OWNERSHIP
    // ==========================================
    if (
      screen.theatreId.ownerId.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to delete this screen",
      });
    }

    await Screen.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      message: "Screen deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================
module.exports = {
  createScreen,
  getMyScreens,
  getScreenById,
  updateScreen,
  deleteScreen,
};