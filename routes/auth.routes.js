const express = require("express");
const router = express.Router();

// ℹ️ Handles password encryption
const bcrypt = require("bcrypt");

// ℹ️ Handles password encryption
const jwt = require("jsonwebtoken");

// Require the User model in order to interact with the database
const User = require("../models/User.model");

// Require necessary (isAuthenticated) middleware in order to control access to specific routes
const { isAuthenticated } = require("../middleware/jwt.middleware.js");

// How many rounds should bcrypt run the salt (default - 10 rounds)
const saltRounds = 10;


//Fetches all user data for the leaderboard
router.get("/users", (req, res, next) => {
  User.find({}, { password: 0 }) // Exclude passwords
  .then((users) => {
    res.status(200).json(users);
  })
  .catch((err) => {
    console.error("Error retrieving users:", err);
    res.status(500).json({ message: "Failed to retrieve users." });
  });
});

// POST /auth/signup  - Only two emails are allowed for signup
const allowedEmails = ["justin.fanton@gmail.com", "dominicmeddick@gmail.com"]

router.post("/signup", async (req, res, next) => {
  const { email, password, name } = req.body;

  try {
    // Validate input
    if (!allowedEmails.includes(email)) {
      return res.status(403).json({
        message: "Signup is restricted to specific users. Please use an authorized email.",
      });
    }

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Provide email, password, and name" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Provide a valid email address." });
    }

    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must have at least 6 characters and contain at least one number, one lowercase, and one uppercase letter.",
      });
    }

    // Check if signup is still allowed
    const existingUsers = await User.find({ email: { $in: allowedEmails } });
    if (existingUsers.length >= allowedEmails.length) {
      return res.status(403).json({ message: "Signup is closed." });
    }

    // Check for existing user
    const foundUser = await User.findOne({ email });
    if (foundUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash password and create user
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const createdUser = await User.create({ email, password: hashedPassword, name });

    if (!createdUser) throw new Error("Failed to create user.");

    const { _id } = createdUser;
    res.status(201).json({ user: { _id, email, name } });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// POST  /auth/login - Verifies email and password and returns a JWT
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  // Check if email or password are provided as empty string
  if (email === "" || password === "") {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  // Check the users collection if a user with the same email exists
  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        // If the user is not found, send an error response
        res.status(401).json({ message: "User not found." });
        return;
      }

      // Compare the provided password with the one saved in the database
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        // Deconstruct the user object to omit the password
        const { _id, email, name } = foundUser;

        // Create an object that will be set as the token payload
        const payload = { _id, email, name };

        // Create a JSON Web Token and sign it
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });

        // Send the token as the response
        res.status(200).json({ authToken: authToken });
      } else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }
    })
    .catch((err) => next(err)); // In this case, we send error handling to the error handling middleware.
});

// Checks number of users in the database
router.get("/user-count", async (req, res) => {
  try {
    const userCount = await User.countDocuments(); // Counts total users
    res.status(200).json({ userCount });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user count." });
  }
});

// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get("/verify", isAuthenticated, (req, res, next) => {
  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and is made available on `req.payload`
  console.log(`req.payload`, req.payload);

  // Send back the token payload object containing the user data
  res.status(200).json(req.payload);
});

module.exports = router;
