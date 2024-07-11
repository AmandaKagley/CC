const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const session = require('express-session');
const WebSocket = require('ws');

// SQLite database setup
const db = new sqlite3.Database(path.join(__dirname, 'database', 'CC.db'));

const app = express();
const port = 3000; // Single port for the server

// Middleware setup
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:5173', // or whatever port your React app is running on
  credentials: true
}));
app.use(express.static(path.join(__dirname)));
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // Broadcast to all connected clients
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Signup route
app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  
  // Perform server-side validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  // Check if the email ends with @my.stchas.edu
  if (!email.endsWith('@my.stchas.edu')) {
    return res.status(400).json({ message: 'Invalid email domain', field: 'email' });
  }

  // Check if the user already exists
  db.get('SELECT * FROM Users WHERE Email = ? OR Username = ?', [email, username], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (row) {
      if (row.Email === email) {
        return res.status(409).json({ message: 'Email already in use', field: 'email' });
      }
      if (row.Username === username) {
        return res.status(409).json({ message: 'Username already taken', field: 'username' });
      }
    }

    // If user doesn't exist, insert the new user
    const query = 'INSERT INTO Users (Username, Email, Password) VALUES (?, ?, ?)';
    db.run(query, [username, email, password], function (err) {
      if (err) {
        console.error('Signup error:', err);
        return res.status(500).json({ message: 'Signup Failed' });
      }
      res.status(201).json({ message: 'Signup Successful', userId: this.lastID });
    });
  });
});


// Login route
app.post('/login', (req, res) => {
  const { username, password, rememberMe } = req.body;
  const query = 'SELECT * FROM Users WHERE Username = ? AND Password = ?';
  db.get(query, [username, password], (err, row) => {
    if (err || !row) {
      return res.status(401).json({ message: 'Login Failed' });
    }
    req.session.userId = row.UserID;
    res.status(200).json({ message: 'Login Successful' });
  });
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout Failed' });
    }
    res.status(200).json({ message: 'Logout Successful' });
  });
});

// Fetch friends and last messages
app.get('/friends', (req, res) => {
  const userId = req.session.userId;
  const query = `
    SELECT f.FriendID, u.Username, m.Text AS LastMessage, m.CreatedAt
    FROM Friends f
    JOIN Users u ON f.FriendID = u.UserID
    LEFT JOIN Messages m ON (f.FriendID = m.SenderID OR f.FriendID = m.ReceiverID)
    WHERE f.UserID = ?
    ORDER BY m.CreatedAt DESC
  `;
  db.all(query, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch friends' });
    }
    res.status(200).json(rows);
  });
});

// Fetch chat messages
app.get('/messages/:chatId', (req, res) => {
  const chatId = req.params.chatId;
  const query = 'SELECT * FROM Messages WHERE ChatID = ? ORDER BY CreatedAt ASC';
  db.all(query, [chatId], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch messages' });
    }
    res.status(200).json(rows);
  });
});

// Send a new message
app.post('/messages', (req, res) => {
  const { chatId, senderId, text } = req.body;
  const query = 'INSERT INTO Messages (ChatID, SenderID, Text, CreatedAt) VALUES (?, ?, ?, ?)';
  db.run(query, [chatId, senderId, text, new Date().toISOString()], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Failed to send message' });
    }
    res.status(201).json({ message: 'Message sent' });
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
// Search for friends endpoint
app.get('/search', (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  const sqlQuery = `
    SELECT UserID, Username, Email
    FROM Users
    WHERE Username LIKE ?
  `;

  const params = [`%${query}%`];

  db.all(sqlQuery, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to search for friends' });
    }
    res.status(200).json(rows);
  });
});
