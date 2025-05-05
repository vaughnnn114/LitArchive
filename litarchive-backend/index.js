const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Default route to serve the main HTML file (e.g., aLibrary.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'aLibrary.html'));
});

// Import routes
const booksRoute = require('./routes/books');

// Use routes
app.use('/api/books', booksRoute);

// Add more routes for users, reviews, etc. as needed

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT}/aLibrary.html in your browser.`);
}); 