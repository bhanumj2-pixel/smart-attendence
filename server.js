const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Establish SQL Database Binary File Handler
const db = new sqlite3.Database('./attendance.db', (err) => {
    if (err) console.error('Database instantiation crash error:', err);
    else console.log('SQLite Relational Engine Context Connected Natively.');
});

// Configure Schema Data Tables Structure Layouts
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS students (
        roll TEXT PRIMARY KEY,
        name TEXT,
        landmarks TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roll TEXT,
        name TEXT,
        status TEXT,
        activity TEXT,
        date_day TEXT,
        time_clock TEXT
    )`);
});

// GET Endpoint: Fetch All Registered Biometric Targets Context
app.get('/api/students', (req, res) => {
    db.all("SELECT * FROM students", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const students = rows.map(r => ({
            roll: r.roll,
            name: r.name,
            landmarks: JSON.parse(r.landmarks)
        }));
        res.json(students);
    });
});

// POST Endpoint: Save New Registered Biometric Fingerprint Data Elements
app.post('/api/register', (req, res) => {
    const { name, roll, landmarks } = req.body;
    const stringifiedLandmarks = JSON.stringify(landmarks);

    const query = `INSERT INTO students (roll, name, landmarks) VALUES (?, ?, ?)`;
    db.run(query, [roll, name, stringifiedLandmarks], function(err) {
        if (err) return res.status(400).json({ error: "Constraint violation: Roll number matching key already exists." });
        res.json({ message: "Student profile saved to relational database file structure cleanly." });
    });
});

// POST Endpoint: Insert Attendance Evaluation Log Rows Segment Entries 
app.post('/api/attendance', (req, res) => {
    const { roll, name, status, activity, date_day, time_clock } = req.body;
    const query = `INSERT INTO attendance (roll, name, status, activity, date_day, time_clock) VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.run(query, [roll, name, status, activity, date_day, time_clock], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Attendance tracking metrics record added to database file." });
    });
});

// GET Endpoint: Export complete relational database rows table straight out as raw CSV text data string structures
app.get('/api/download-csv', (req, res) => {
    db.all("SELECT roll, name, status, activity, date_day, time_clock FROM attendance ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Define clean spreadsheet column structure array headers list
        let csvBodyContent = "Roll Number,Student Name,Attendance Status,Live Behavior Activity,Date (Calendar Day),Time Map Log\n";
        
        // Loop row contexts and parse elements securely escaping data spaces parameters
        rows.forEach(row => {
            csvBodyContent += `"${row.roll}","${row.name}","${row.status}","${row.activity}","${row.date_day}","${row.time_clock}"\n`;
        });
        
        // Configure response metadata contexts properties instructing immediate browser attachment download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=attendance_historical_report.csv');
        res.status(200).send(csvBodyContent);
    });
});

app.listen(3000, () => console.log('Attendance SQL DB Integration Server processing threads active at http://localhost:3000'));