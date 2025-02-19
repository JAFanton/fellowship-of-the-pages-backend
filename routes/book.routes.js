const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Book = require("../models/Book.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// POST Add a new book
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

// GET Retrieve all books 
router.get("/books", (req, res) => {
  Book.find()
    .select("-review") // Exclude reviews for public viewing
    .then((books) => res.status(200).json(books))
    .catch((err) => res.status(500).json({ error: "Failed to fetch books", details: err }));
});

// GET Retrieve books by user
router.get("/books/user/:userId", (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Specified user id is not valid" });
  }

  Book.find({ userId })
    .then((userBooks) => res.status(200).json(userBooks))
    .catch((err) => res.status(500).json({ error: "Failed to fetch user books", details: err }));
});

//GET retrieve book by ID
router.get("/books/:id", (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid book ID format" });
  }

  Book.findById(id)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.status(200).json(book);
    })
    .catch((err) => {
      res.status(500).json({ error: "Failed to fetch book details", details: err });
    });
});


// PUT Update a book
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

// DELETE Delete a book
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