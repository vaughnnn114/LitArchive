const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Homesim123', // <-- change this to your MySQL password
    database: 'litarchive'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL connected!');
});

module.exports = db; 