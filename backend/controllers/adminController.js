const TheatreOwner = require("../models/theatreOwner.js");
const User = require("../models/user.js");

// ==========================================
// GET ALL USERS
// ==========================================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE USER
// ==========================================
const updateUser = async (req, res) => {
  try {
    const { name, phone, role, status } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Admin cannot change their own role/status
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({
        message: "Admin cannot update their own role or status",
      });
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    if (role !== undefined) {
      if (!["user", "theatreOwner", "admin"].includes(role)) {
        return res.status(400).json({
          message: "Invalid role",
        });
      }

      user.role = role;
    }

    if (status !== undefined) {
      if (!["active", "blocked"].includes(status)) {
        return res.status(400).json({
          message: "Invalid status",
        });
      }

      user.status = status;
    }

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// BLOCK USER
// ==========================================
const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Admin cannot block themselves
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({
        message: "Admin cannot block themselves",
      });
    }

    if (user.status === "blocked") {
      return res.status(400).json({
        message: "User is already blocked",
      });
    }

    user.status = "blocked";

    await user.save();

    res.status(200).json({
      message: "User blocked successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// UNBLOCK USER
// ==========================================
const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.status !== "blocked") {
      return res.status(400).json({
        message: "User is not blocked",
      });
    }

    user.status = "active";

    await user.save();

    res.status(200).json({
      message: "User unblocked successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE USER
// ==========================================
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Admin cannot delete themselves
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({
        message: "Admin cannot delete themselves",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    // If the deleted user is a theatre owner,
    // delete their theatre-owner profile too.
    if (user.role === "theatreOwner") {
      await TheatreOwner.findOneAndDelete({
        userId: user._id,
      });
    }

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  updateUser,
  blockUser,
  unblockUser,
  deleteUser,

  // Existing theatre-owner admin functions
  getPendingTheatreOwners,
  approveTheatreOwner,
  rejectTheatreOwner,
};


// ==========================================
// THEATRE OWNER FUNCTIONS
// ==========================================

// Get pending theatre owners
async function getPendingTheatreOwners(req, res) {
  try {
    const owners = await TheatreOwner.find({
      status: "pending",
    }).populate("userId", "name email phone");

    res.status(200).json({
      message: "Pending theatre owners fetched successfully",
      owners,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}

// Approve theatre owner
async function approveTheatreOwner(req, res) {
  try {
    const owner = await TheatreOwner.findById(req.params.id);

    if (!owner) {
      return res.status(404).json({
        message: "Theatre owner not found",
      });
    }

    if (owner.status === "approved") {
      return res.status(400).json({
        message: "Theatre owner is already approved",
      });
    }

    owner.status = "approved";
    owner.rejectionReason = "";

    await owner.save();

    res.status(200).json({
      message: "Theatre owner approved successfully",
      owner,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}

// Reject theatre owner
async function rejectTheatreOwner(req, res) {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        message: "Rejection reason is required",
      });
    }

    const owner = await TheatreOwner.findById(req.params.id);

    if (!owner) {
      return res.status(404).json({
        message: "Theatre owner not found",
      });
    }

    owner.status = "rejected";
    owner.rejectionReason = rejectionReason;

    await owner.save();

    res.status(200).json({
      message: "Theatre owner rejected successfully",
      owner,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}