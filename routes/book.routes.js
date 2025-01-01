const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

//Add a Book
router.post('/',
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('coverImageUrl').isURL().withMessage('Valid cover image URL is required'),
        body('bookImageUrl').optional().isURL().withMessage('Invalid book image URL'),
        body('genre')
            .isIn(['Fiction', 'Non-Fiction'])
            .withMessage('Genre must be either Fiction or Non-Fiction'),
        body('review').optional().isLength({ max: 1000 }).withMessage('Review is too long')
    ],
    async (req, res) => {
        try {
            const { title, author, coverImageUrl, bookImageUrl, genre, review, userId } = req.body;

            const newBook = new Book({
                title,
                author,
                coverImageUrl,
                bookImageUrl,
                genre,
                review,
                userId
            });

            const savedBook = await newBook.save();
            res.status(201).json(savedBook);
        } catch (error) {
            res.status(500).json({ error: 'Failed to add book', details: error.message });
        }
    }
);

//Get All Books (Public)
router.get('/', async (req, res) => {
    try {
        const books = await Book.find().select('-review'); // Exclude reviews for public viewing
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch books', details: error.message });
    }
});

//Get Books by User
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userBooks = await Book.find({ userId });
        res.status(200).json(userBooks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user books', details: error.message });
    }
});

//Update a Book
router.put(
    '/:id',
    [
        body('title').optional().notEmpty().withMessage('Title cannot be empty'),
        body('coverImageUrl').optional().isURL().withMessage('Valid cover image URL is required'),
        body('bookImageUrl').optional().isURL().withMessage('Invalid book image URL'),
        body('genre')
            .optional()
            .isIn(['Fiction', 'Non-Fiction'])
            .withMessage('Genre must be either Fiction or Non-Fiction'),
        body('review').optional().isLength({ max: 1000 }).withMessage('Review is too long')
    ],
    async (req, res) => {
        try {
            const { id } = req.params;
            const updates = req.body;

            const updatedBook = await Book.findByIdAndUpdate(id, updates, { new: true });
            if (!updatedBook) return res.status(404).json({ error: 'Book not found' });

            res.status(200).json(updatedBook);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update book', details: error.message });
        }
    }
);

//Delete a Book
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBook = await Book.findByIdAndDelete(id);
        if (!deletedBook) return res.status(404).json({ error: 'Book not found' });

        res.status(200).json({ message: 'Book deleted successfully', book: deletedBook });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete book', details: error.message });
    }
});

module.exports = router;