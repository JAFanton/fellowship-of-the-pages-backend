const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const Book = require("../models/Book.model");
const { isAuthenticated } = require("../middleware/jwt.middleware.js");

const saltRounds = 10;

// Fetch users and calculate points dynamically
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); 

    const usersWithPoints = await Promise.all(
      users.map(async (user) => {
        const books = await Book.find({ userId: user._id });

        const fictionBooks = books.filter((book) => book.genre === "Fiction").length;
        const nonFictionBooks = books.filter((book) => book.genre === "Non-Fiction").length;

        const points = Math.min(fictionBooks, nonFictionBooks); // One point awarded per non-fiction and fiction book

        return { ...user.toObject(), points };
      })
    );

    res.status(200).json(usersWithPoints);
  } catch (err) {
    console.error("Error retrieving users:", err);
    res.status(500).json({ message: "Failed to retrieve users." });
  }
});


router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;
  const allowedEmails = ["justin.fanton@gmail.com", "dominicmeddick@gmail.com"];

  try {
    if (!allowedEmails.includes(email)) {
      return res.status(403).json({ message: "Signup is restricted to specific users." });
    }

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Provide email, password, and name" });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    const createdUser = await User.create({ email, password: hashedPassword, name });

    res.status(201).json({ user: { _id: createdUser._id, email, name } });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const foundUser = await User.findOne({ email });
    if (!foundUser || !bcrypt.compareSync(password, foundUser.password)) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const { _id, name } = foundUser;
    const authToken = jwt.sign({ _id, email, name }, process.env.TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "6h",
    });

    res.status(200).json({ authToken });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});


router.get("/verify", isAuthenticated, (req, res) => {
  res.status(200).json(req.payload);
});

module.exports = router;
