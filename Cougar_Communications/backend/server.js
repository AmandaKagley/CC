const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const dialogflow = require('@google-cloud/dialogflow');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

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