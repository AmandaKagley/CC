const express = require("express")
const app = express()

app.listen(3001, () => {
  console.log("Server Running")
})


const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors'); // For allowing cross-origin requests

// ... (Database setup - choose a database like MySQL, MongoDB, etc.)

app.use(bodyParser.json()); // Parse JSON request bodies
app.use(cors());

// ... (Login route)

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // 1. Authenticate the user against your database
  // 2. If authentication succeeds, create a session and send a success response
  // 3. If authentication fails, send an error response
});

// ... (Signup route)

app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  // 1. Validate the email (make sure it ends with "@my.stchas.edu")
  // 2. Create a new user in your database
  // 3. Send a success response
});

// ... (Update profile route)

app.put('/update-profile', (req, res) => {
  const { bio, classes } = req.body;
  // 1. Update the user's profile in your database
  // 2. Send a success response
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const dialogflow = require('dialogflow');

// Dialogflow Configuration
const dialogflow = require('dialogflow');
const projectId = 'scc-student-chatbot';
const sessionId = 'YOUR_SESSION_ID'; // Replace with a unique session ID
const sessionClient = new dialogflow.SessionsClient();
const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

app.use(bodyParser.json());
app.use(cors());

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

  // Send the request to Dialogflow
  const responses = await sessionClient.detectIntent(request);
  const result = responses[0].queryResult;

  // Get the chatbot's response
  const chatbotResponse = result.fulfillmentText;

  res.json({ response: chatbotResponse });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
