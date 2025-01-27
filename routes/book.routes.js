const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Book = require("../models/Book.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// POST /api/books - Add a new book
router.post("/books", isAuthenticated, (req, res) => {

    const { title, author, bookImageUrl, genre, wordCount, review } = req.body;
    const userId = req.payload._id;

    //Validation checks for each book field
    if (!title || !author || !bookImageUrl || !genre || !wordCount || !review) {
      return res.status(400).json({ error: "Please fill out all required fields" });
    }

    Book.create({
      title,
      author,
      bookImageUrl,
      genre,
      review,
      wordCount,
      userId,
    })
      .then((newBook) => res.status(201).json({ data: newBook}))
      .catch((error) => res.status(500).json({ error: "Failed to add book", details: error }));
  }
);

// GET /api/books - Retrieve all books (public)
router.get("/books", (req, res) => {
  Book.find()
    .select("-review") // Exclude reviews for public viewing
    .then((books) => res.status(200).json(books))
    .catch((err) => res.status(500).json({ error: "Failed to fetch books", details: err }));
});

// GET /api/books/user/:userId - Retrieve books by user
router.get("/books/user/:userId", isAuthenticated, (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Specified user id is not valid" });
  }

  Book.find({ userId })
    .then((userBooks) => res.status(200).json(userBooks))
    .catch((err) => res.status(500).json({ error: "Failed to fetch user books", details: err }));
});

// PUT /api/books/:id - Update a book
router.put("/books/:id", isAuthenticated, (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Failed to update book" });
    }

    Book.findByIdAndUpdate(id, updates, { new: true })
      .then((updatedBook) => {
        if (!updatedBook) {
          return res.status(404).json({ error: "Failed to find book to update" });
        }
        res.status(200).json({ data: updatedBook });
      })
      .catch((err) => res.status(500).json({ error: "Failed to update book", details: err }));
  }
);

// DELETE /api/books/:id - Delete a book
router.delete("/books/:id", isAuthenticated, (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Specified book id is not valid" });
  }

  Book.findByIdAndDelete(id)
    .then((deletedBook) => {
      if (!deletedBook) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.status(200).json({ message: "Book deleted successfully", book: deletedBook });
    })
    .catch((err) => res.status(500).json({ error: "Failed to delete book", details: err }));
});

module.exports = router;