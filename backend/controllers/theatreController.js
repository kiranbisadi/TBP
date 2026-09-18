const Theatre = require("../models/Theatre");

// Create Theatre
const createTheatre = async (req, res) => {
  try {
    const { name, address, city } = req.body;

    if (!name || !address || !city) {
      return res.status(400).json({
        message: "Please provide name, address and city",
      });
    }

    const theatre = await Theatre.create({
      name,
      address,
      city,
      ownerId: req.user.userId,
      status: "pending",
    });

    res.status(201).json({
      message: "Theatre created successfully and is pending approval",
      theatre,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get owner's theatres
const getMyTheatres = async (req, res) => {
  try {
    const theatres = await Theatre.find({
      ownerId: req.user.userId,
    });

    res.status(200).json({
      message: "Theatres fetched successfully",
      theatres,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get one theatre
const getTheatreById = async (req, res) => {
  try {
    const theatre = await Theatre.findOne({
      _id: req.params.id,
      ownerId: req.user.userId,
    });

    if (!theatre) {
      return res.status(404).json({
        message: "Theatre not found",
      });
    }

    res.status(200).json({
      message: "Theatre fetched successfully",
      theatre,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update theatre
const updateTheatre = async (req, res) => {
  try {
    const { name, address, city } = req.body;

    const theatre = await Theatre.findOne({
      _id: req.params.id,
      ownerId: req.user.userId,
    });

    if (!theatre) {
      return res.status(404).json({
        message: "Theatre not found",
      });
    }

    theatre.name = name ?? theatre.name;
    theatre.address = address ?? theatre.address;
    theatre.city = city ?? theatre.city;

    await theatre.save();

    res.status(200).json({
      message: "Theatre updated successfully",
      theatre,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete theatre
const deleteTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findOne({
      _id: req.params.id,
      ownerId: req.user.userId,
    });

    if (!theatre) {
      return res.status(404).json({
        message: "Theatre not found",
      });
    }

    await Theatre.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Theatre deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createTheatre,
  getMyTheatres,
  getTheatreById,
  updateTheatre,
  deleteTheatre,
};