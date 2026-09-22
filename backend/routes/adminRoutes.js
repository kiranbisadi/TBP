const express = require("express");

const {
  getPendingTheatreOwners,
  approveTheatreOwner,
  rejectTheatreOwner,
  getAllUsers,
  updateUser,
  blockUser,
  unblockUser,
  deleteUser,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// ==========================================
// ADMIN TEST
// ==========================================
router.get("/test", protect, adminOnly, (req, res) => {
  res.status(200).json({
    message: "Admin access successful",
    admin: req.user,
  });
});

// ==========================================
// THEATRE OWNER MANAGEMENT
// ==========================================

router.get(
  "/theatre-owners/pending",
  protect,
  adminOnly,
  getPendingTheatreOwners
);

router.put(
  "/theatre-owners/:id/approve",
  protect,
  adminOnly,
  approveTheatreOwner
);

router.put(
  "/theatre-owners/:id/reject",
  protect,
  adminOnly,
  rejectTheatreOwner
);

// ==========================================
// USER MANAGEMENT
// ==========================================

// Get all users
router.get(
  "/users",
  protect,
  adminOnly,
  getAllUsers
);

// Update user
router.put(
  "/users/:id",
  protect,
  adminOnly,
  updateUser
);

// Block user
router.put(
  "/users/:id/block",
  protect,
  adminOnly,
  blockUser
);

// Unblock user
router.put(
  "/users/:id/unblock",
  protect,
  adminOnly,
  unblockUser
);

// Delete user
router.delete(
  "/users/:id",
  protect,
  adminOnly,
  deleteUser
);

module.exports = router;