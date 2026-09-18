const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.js")
const TheatreOwner = require("../models/theatreOwner.js")

//USER Registration
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "Please provide name, email, password and phone",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "user",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//Theatre Owner Registration
const registerTheatreOwner = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      businessName,
      address,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !businessName ||
      !address
    ) {
      return res.status(400).json({
        message: "Please provide all required details",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "theatreOwner",
    });

    const theatreOwner = await TheatreOwner.create({
      userId: user._id,
      phone,
      businessName,
      address,
      phone,
      status: "pending",
    });

    res.status(201).json({
      message: "Theatre owner registration submitted for approval",
      owner: {
        id: theatreOwner._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: theatreOwner.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.role === "theatreOwner") {
      const theatreOwner = await TheatreOwner.findOne({
        userId: user._id,
      });

      if (!theatreOwner) {
        return res.status(403).json({
          message: "Theatre owner details not found",
        });
      }

      if (theatreOwner.status !== "approved") {
        return res.status(403).json({
          message: `Account is ${theatreOwner.status}`,
        });
      }
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,    
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser, registerTheatreOwner, loginUser,
};