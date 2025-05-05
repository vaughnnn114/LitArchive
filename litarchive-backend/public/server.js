// Simple Express server for shared book data
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8000;
const BOOKS_FILE = path.join(__dirname, 'books.json');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'aLibrary.html'));
  });

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files (HTML, CSS, JS)

// Helper: Read books.json
function readBooks() {
    if (!fs.existsSync(BOOKS_FILE)) return [];
    return JSON.parse(fs.readFileSync(BOOKS_FILE, 'utf8'));
}

// Helper: Write books.json
function writeBooks(books) {
    fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2));
}

// API: Get all books
app.get('/api/books', (req, res) => {
    res.json(readBooks());
});

// API: Add a book
app.post('/api/books', (req, res) => {
    const books = readBooks();
    const book = req.body;
    books.push(book);
    writeBooks(books);
    res.status(201).json(book);
});

// API: Update a book by title (simplest key)
app.put('/api/books/:title', (req, res) => {
    const books = readBooks();
    const idx = books.findIndex(b => b.title === req.params.title);
    if (idx === -1) return res.status(404).json({ error: 'Book not found' });
    books[idx] = req.body;
    writeBooks(books);
    res.json(books[idx]);
});

// API: Delete a book by title
app.delete('/api/books/:title', (req, res) => {
    let books = readBooks();
    const idx = books.findIndex(b => b.title === req.params.title);
    if (idx === -1) return res.status(404).json({ error: 'Book not found' });
    const deleted = books.splice(idx, 1);
    writeBooks(books);
    res.json(deleted[0]);
});

// --- CONFIGURATION FOR NETWORK ACCESS ---
const os = require('os');
 

// Helper function to get local IP address
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// --- START SERVER ON ALL NETWORK INTERFACES ---
app.listen(PORT, '0.0.0.0', () => {
    const localIp = getLocalIp();
    console.log('Server running!');
    console.log(`- On this PC:   http://localhost:${PORT}`);
    console.log(`- On your LAN:  http://${localIp}:${PORT}`);
    console.log('To access from your phone, make sure both devices are on the same Wi-Fi, then open the LAN address above in your phone browser.');
});