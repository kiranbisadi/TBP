const express = require("express");
const protect = require("../middleware/authMiddleware");

const { registerUser,registerTheatreOwner, loginUser } = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/register/theatre-owner", registerTheatreOwner);
router.post("/login", loginUser);

router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

module.exports = router;