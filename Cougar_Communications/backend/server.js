const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const dialogflow = require('@google-cloud/dialogflow');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// SQLite database setup
const db = new sqlite3.Database(path.join(__dirname, 'database', 'CC.db'));

const app = express();
const port = 3000; // Single port for the server

// Dialogflow Configuration
const projectId = 'scc-student-chatbot';
const sessionId = 'YOUR_SESSION_ID'; // Replace with a unique session ID
const sessionClient = new dialogflow.SessionsClient();
const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

// Middleware setup
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // 1. Authenticate the user against your database
  // 2. If authentication succeeds, create a session and send a success response
  // 3. If authentication fails, send an error response
});

// Signup route
app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  // 1. Validate the email (make sure it ends with "@my.stchas.edu")
  // 2. Create a new user in your database
  // 3. Send a success response
});

// Update profile route
app.put('/update-profile', (req, res) => {
  const { bio, classes } = req.body;
  // 1. Update the user's profile in your database
  // 2. Send a success response
});

// Chatbot route
app.post('/chatbot', async (req, res) => {
  const { query } = req.body;

  // Create a Dialogflow request
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: 'en-US',
      },
    },
  };

  try {
    // Send the request to Dialogflow
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    // Get the chatbot's response
    const chatbotResponse = result.fulfillmentText;

    res.json({ response: chatbotResponse });
  } catch (error) {
    console.error('ERROR:', error);
    res.status(500).send('Error processing request');
  }
});

// Endpoint to handle profile picture upload
app.post('/upload-profile-picture', upload.single('profilePicture'), (req, res) => {
  const userId = req.body.userId;
  const profilePicturePath = req.file.path;

  // Read the image file and convert to binary
  fs.readFile(profilePicturePath, (err, data) => {
    if (err) {
      return res.status(500).send('Error reading file');
    }

    const updateQuery = `UPDATE Users SET ProfilePicture = ? WHERE UserID = ?`;
    db.run(updateQuery, [data, userId], function (err) {
      if (err) {
        return res.status(500).send('Error updating profile picture');
      }
      // Delete the file after storing it in the database
      fs.unlinkSync(profilePicturePath);
      res.send('Profile picture updated successfully');
    });
  });
});

// Endpoint to serve profile pictures
app.get('/profile-picture/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = `SELECT ProfilePicture FROM Users WHERE UserID = ?`;
  db.get(query, [userId], (err, row) => {
    if (err) {
      return res.status(500).send('Error retrieving profile picture');
    }
    if (!row || !row.ProfilePicture) {
      return res.status(404).send('Profile picture not found');
    }
    // Set the appropriate content type (assuming JPEG for this example)
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(row.ProfilePicture);
  });
});

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});