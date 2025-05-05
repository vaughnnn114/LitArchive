const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all books
router.get('/', (req, res) => {
    db.query('SELECT * FROM books', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// Add a new book
router.post('/', (req, res) => {
    const { title, author, isbn, description, image, status, copies, category, ebookLink } = req.body;
    db.query(
        'INSERT INTO books (title, author, isbn, description, image, status, copies, category, ebookLink) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [title, author, isbn, description, image, status, copies, category, ebookLink],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ id: result.insertId });
        }
    );
});

// Update an existing book
router.put('/:id', (req, res) => {
    const bookId = parseInt(req.params.id, 10);
    const { title, author, isbn, description, image, status, copies, category, ebookLink } = req.body;
    db.query(
        'UPDATE books SET title=?, author=?, isbn=?, description=?, image=?, status=?, copies=?, category=?, ebookLink=? WHERE id=?',
        [title, author, isbn, description, image, status, copies, category, ebookLink, bookId],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ success: true });
        }
    );
});

// Add a DELETE route to delete a book by id
router.delete('/:id', (req, res) => {
    const bookId = parseInt(req.params.id, 10); // force to integer
    console.log('Attempting to delete book with id:', bookId, 'type:', typeof bookId);
    db.query('DELETE FROM books WHERE id = ?', [bookId], (err, result) => {
        if (err) {
            console.error('MySQL error:', err);
            return res.status(500).json({ error: err });
        }
        console.log('MySQL delete result:', result);
        if (result.affectedRows === 0) {
            console.warn('Book not found for id:', bookId);
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json({ success: true });
    });
});

module.exports = router; 