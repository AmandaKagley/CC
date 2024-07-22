const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const session = require('express-session');
const WebSocket = require('ws');
const multer = require('multer');
const fs = require('fs');

// SQLite database setup
const db = new sqlite3.Database(path.join(__dirname, 'database', 'CC.db'));

const app = express();
const port = 3000; // Single port for the server

// Constants for friendship status
const FRIENDSHIP_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED'
};

// Middleware setup
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:5173', // or whatever port your React app is running on
  credentials: true
}));
app.use(express.static(path.join(__dirname)));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production", // false for development
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Multer setup for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Setup WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });

const clients = new Map();

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
  const userId = new URL(req.url, 'http://localhost:8080').searchParams.get('userId');
  clients.set(userId, ws);

  console.log(`New WebSocket connection for user ${userId}`);

  // Handle WebSocket disconnections
  ws.on('close', () => {
    clients.delete(userId);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Function to create AI chat for a user
function createAIChatForUser(userId, username) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO GroupChats (GroupName) VALUES (?)
    `;
    db.run(query, [`AI Assistant Chat for ${username}`], function(err) {
      if (err) {
        reject(err);
        return;
      }
      const groupId = this.lastID;
      const addUserQuery = `
        INSERT INTO GroupMembers (GroupID, UserID) VALUES (?, ?)
      `;
      db.run(addUserQuery, [groupId, userId], (err) => {
        if (err) {
          reject(err);
        } else {
          const initialMessageQuery = `
            INSERT INTO Messages (GroupID, SenderID, Message, Timestamp)
            VALUES (?, ?, ?, ?)
          `;
          db.run(initialMessageQuery, [groupId, 0, 'Hello! How can I assist you today?', new Date().toISOString()], (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
      });
    });
  });
}

/* Google AI */
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyDWj-xDyshF4zSUadL_0hpCk07Fl6YaI9U';
const genAI = new GoogleGenerativeAI(API_KEY);

async function generateBotAnswer(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log(response.text());
    return response.text();
  } catch (error) {
    console.error('Error generating bot answer:', error);
    return 'Sorry, I encountered an error while processing your request.';
  }
}

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

      const userId = this.lastID;

      // Create AI chat for the new user
      createAIChatForUser(userId, username)
        .then(() => {
          // Read the default profile picture
          const defaultProfilePicturePath = path.join(__dirname, 'assets', 'images', 'blank-profile-picture.png');
          fs.readFile(defaultProfilePicturePath, (err, defaultProfilePicture) => {
            if (err) {
              console.error('Error reading default profile picture:', err);
              return res.status(201).json({ message: 'Signup Successful, but failed to set default profile picture', userId });
            }

            // Update the user's profile picture
            const updateQuery = 'UPDATE Users SET ProfilePicture = ? WHERE UserID = ?';
            db.run(updateQuery, [defaultProfilePicture, userId], function (err) {
              if (err) {
                console.error('Error updating profile picture:', err);
                return res.status(201).json({ message: 'Signup Successful, but failed to set default profile picture', userId });
              }
              res.status(201).json({ message: 'Signup Successful', userId });
            });
          });
        })
        .catch((error) => {
          console.error('Error creating AI chat:', error);
          res.status(201).json({ message: 'Signup Successful, but failed to create AI chat', userId });
        });
    });
  });
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM Users WHERE Username = ? AND Password = ?';
  db.get(query, [username, password], (err, row) => {
    if (err) {
      console.error('Database error during login:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!row) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Log the user data for debugging
    console.log('User found:', row);

    req.session.userId = row.UserID;
    res.status(200).json({
      message: 'Login Successful',
      userId: row.UserID,
      username: row.Username
    });
  });
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout Failed' });
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
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
app.get('/messages/:groupId', (req, res) => {
  const groupId = req.params.groupId;
  const query = `
    SELECT 
      m.MessageID,
      m.GroupID,
      m.SenderID,
      CASE WHEN m.SenderID = 0 THEN 'AI Assistant' ELSE u.Username END as SenderUsername,
      CASE WHEN m.SenderID = 0 THEN NULL ELSE u.ProfilePicture END as SenderProfilePicture,
      m.Message,
      m.Timestamp
    FROM Messages m
    LEFT JOIN Users u ON m.SenderID = u.UserID
    WHERE m.GroupID = ?
    ORDER BY m.Timestamp ASC
  `;
  db.all(query, [groupId], (err, rows) => {
    if (err) {
      console.error('Error fetching messages:', err);
      return res.status(500).json({ message: 'Failed to fetch messages', error: err.message });
    }
    res.status(200).json(rows);
  });
});

// Create a new chat between two users
app.post('/start-chat', (req, res) => {
  const { userId, friendId } = req.body;

  if (!userId || !friendId) {
    return res.status(400).json({ message: 'User ID and Friend ID are required' });
  }

  // Create a new group chat
  const query = `
    INSERT INTO GroupChats (GroupName)
    VALUES ('Chat between ${userId} and ${friendId}')
  `;
  db.run(query, function (err) {
    if (err) {
      console.error('Error creating chat:', err);
      return res.status(500).json({ message: 'Failed to create chat' });
    }

    const groupId = this.lastID;

    // Add users to the new group chat
    const addUsersQuery = `
      INSERT INTO GroupMembers (GroupID, UserID)
      VALUES (?, ?), (?, ?)
    `;
    db.run(addUsersQuery, [groupId, userId, groupId, friendId], function (err) {
      if (err) {
        console.error('Error adding users to chat:', err);
        return res.status(500).json({ message: 'Failed to add users to chat' });
      }

      // Fetch the new chat data
      const fetchChatQuery = `
        SELECT 
          gc.GroupID as groupId, 
          gc.GroupName as groupName
        FROM GroupChats gc
        WHERE gc.GroupID = ?
      `;
      db.get(fetchChatQuery, [groupId], (err, chat) => {
        if (err) {
          console.error('Error fetching new chat:', err);
          return res.status(500).json({ message: 'Failed to fetch new chat' });
        }

        res.status(201).json(chat);
      });
    });
  });
});

// Send a new message
app.post('/messages', async (req, res) => {
  const { groupId, senderId, message, timestamp } = req.body;

  const query = 'INSERT INTO Messages (GroupID, SenderID, Message, Timestamp) VALUES (?, ?, ?, ?)';

  db.run(query, [groupId, senderId, message, timestamp], async function (err) {
    if (err) {
      console.error('Error inserting message:', err);
      return res.status(500).json({ message: 'Failed to send message' });
    }

    const newMessage = {
      MessageID: this.lastID,
      GroupID: groupId,
      SenderID: senderId,
      Message: message,
      Timestamp: timestamp
    };

    // Check if this is an AI chat and generate a response
    db.get('SELECT GroupName FROM GroupChats WHERE GroupID = ?', [groupId], async (err, chat) => {
      if (err) {
        console.error('Error checking chat type:', err);
      } else if (chat && chat.GroupName.startsWith('AI Assistant Chat for ')) {
        // Generate AI response using the user's message
        const aiResponse = await generateBotAnswer(message);

        db.run(query, [groupId, 0, aiResponse, new Date().toISOString()], function (err) {
          if (err) {
            console.error('Error inserting AI response:', err);
          } else {
            const aiMessage = {
              MessageID: this.lastID,
              GroupID: groupId,
              SenderID: 0,
              SenderUsername: 'AI Assistant',
              Message: aiResponse,
              Timestamp: new Date().toISOString()
            };
            // Broadcast AI message
            broadcastMessage(aiMessage);
          }
        });
      }
    });

    // Broadcast the new message to all connected WebSocket clients
    broadcastMessage(newMessage);

    res.status(201).json({ message: 'Message sent successfully', newMessage });
  });
});
function broadcastMessage(message) {
  clients.forEach((clientWs, clientUserId) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({
        type: 'newMessage',
        message: message
      }));
    }
  });
}

// Serve the main HTML file
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

// Fetch user group chats
app.get('/user-group-chats/:userId', (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT 
      gc.GroupID as groupId, 
      gc.GroupName as groupName, 
      m.Message as lastMessage, 
      m.Timestamp as lastMessageTime,
      CASE WHEN m.SenderID = 0 THEN 0 ELSE u.UserID END as lastMessageSenderId,
      CASE WHEN m.SenderID = 0 THEN NULL ELSE u.ProfilePicture END as lastMessageSenderProfilePicture
    FROM GroupChats gc
    JOIN GroupMembers gm ON gc.GroupID = gm.GroupID
    LEFT JOIN (
      SELECT 
        GroupID, 
        Message, 
        Timestamp, 
        SenderID,
        ROW_NUMBER() OVER (PARTITION BY GroupID ORDER BY Timestamp DESC) as rn
      FROM Messages
    ) m ON gc.GroupID = m.GroupID AND m.rn = 1
    LEFT JOIN Users u ON m.SenderID = u.UserID
    WHERE gm.UserID = ?
    ORDER BY m.Timestamp DESC NULLS LAST
  `;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch group chats' });
    }
    res.status(200).json(rows);
  });
});
// Fetch user profile
app.get('/user/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = 'SELECT UserID, Username, Email, ProfilePicture, Bio FROM Users WHERE UserID = ?';

  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error('Error fetching user profile:', err);
      return res.status(500).json({ message: 'Failed to fetch user profile' });
    }
    if (!row) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(row);
  });
});

// Endpoint to handle profile picture upload
app.post('/upload-profile-picture', upload.single('profilePicture'), (req, res) => {
  const userId = req.body.userId;
  const profilePicture = req.file.buffer;

  console.log("Uploading profile picture for userId:", userId);

  if (!userId || !profilePicture) {
    return res.status(400).json({ error: 'User ID and Profile Picture are required' });
  }

  const updateQuery = 'UPDATE Users SET ProfilePicture = ? WHERE UserID = ?';
  db.run(updateQuery, [profilePicture, userId], function (err) {
    if (err) {
      console.error('Error updating profile picture:', err);
      return res.status(500).json({ error: 'Error updating profile picture' });
    }
    console.log("Profile picture updated successfully for userId:", userId);
    res.json({ message: 'Profile picture updated successfully' });
  });
});

// Endpoint to serve profile pictures
app.get('/profile-picture/:userId', (req, res) => {
  const userId = req.params.userId;

  const query = 'SELECT ProfilePicture FROM Users WHERE UserID = ?';
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

// Save User Bio
app.put('/user/:userId/bio', (req, res) => {
  const userId = req.params.userId;
  const { bio } = req.body;

  const query = 'UPDATE Users SET Bio = ? WHERE UserID = ?';
  db.run(query, [bio, userId], function(err) {
    if (err) {
      console.error('Error updating bio:', err);
      return res.status(500).json({ message: 'Failed to update bio' });
    }
    res.status(200).json({ message: 'Bio updated successfully' });
  });
});

// Send a friend request
app.post('/send-friend-request', (req, res) => {
  const { senderId, recipientEmail } = req.body;

  const getRecipientQuery = 'SELECT UserID FROM Users WHERE Email = ?';
  db.get(getRecipientQuery, [recipientEmail], (err, recipient) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    const recipientId = recipient.UserID;
    const checkQuery = 'SELECT * FROM Friends WHERE UserID = ? AND FriendID = ?';
    db.get(checkQuery, [senderId, recipientId], (err, row) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      if (row) {
        return res.status(400).json({ message: 'Friend request already sent or already friends' });
      }

      const query = 'INSERT INTO Friends (UserID, FriendID, FriendshipStatus) VALUES (?, ?, ?)';
  db.run(query, [senderId, recipientId, FRIENDSHIP_STATUS.PENDING], function (err) {
        if (err) {
          return res.status(500).json({ message: 'Failed to send friend request' });
        }
        res.status(200).json({ message: 'Friend request sent successfully' });
      });
    });
  });
});

// Accept a friend request
app.post('/accept-friend-request', (req, res) => {
  const { senderId } = req.body;
  const userId = req.session.userId;

  if (!senderId || !userId) {
    return res.status(400).json({ message: 'Missing sender ID or user ID' });
  }

  console.log(`Accepting friend request from ${senderId} to ${userId}`);

  // Start a transaction to ensure both updates happen or neither does
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    const updateQuery = `
    UPDATE Friends 
    SET FriendshipStatus = ? 
    WHERE (UserID = ? AND FriendID = ? AND FriendshipStatus = ?)
    OR (UserID = ? AND FriendID = ? AND FriendshipStatus = ?)
  `;
  db.run(updateQuery, [
    FRIENDSHIP_STATUS.ACCEPTED, 
    senderId, userId, FRIENDSHIP_STATUS.PENDING,
    userId, senderId, FRIENDSHIP_STATUS.PENDING
  ], function (err) {
      if (err) {
        console.error('Error accepting friend request:', err);
        db.run('ROLLBACK');
        return res.status(500).json({ message: 'Failed to accept friend request' });
      }

      if (this.changes === 0) {
        db.run('ROLLBACK');
        return res.status(404).json({ message: 'Friend request not found or already accepted' });
      }

      // If the friend record doesn't exist in both directions, create it
      const insertQuery = `
        INSERT OR IGNORE INTO Friends (UserID, FriendID, FriendshipStatus)
        VALUES (?, ?, 'accepted')
      `;

      db.run(insertQuery, [userId, senderId], (err) => {
        if (err) {
          console.error('Error creating reverse friendship:', err);
          db.run('ROLLBACK');
          return res.status(500).json({ message: 'Failed to create reverse friendship' });
        }

        db.run('COMMIT', (err) => {
          if (err) {
            console.error('Error committing transaction:', err);
            return res.status(500).json({ message: 'Failed to commit friendship changes' });
          }
          res.status(200).json({ message: 'Friend request accepted successfully' });
        });
      });
    });
  });
});

// Decline a friend request
app.post('/decline-friend-request', (req, res) => {
  const { requestId } = req.body;

  const deleteQuery = 'DELETE FROM Friends WHERE ROWID = ? AND FriendshipStatus = "pending"';
  db.run(deleteQuery, [requestId], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Failed to decline friend request' });
    }
    res.status(200).json({ message: 'Friend request declined' });
  });
});

// Fetch friend requests
app.get('/friend-requests', (req, res) => {
  const userId = req.session.userId;
  const query = `
    SELECT f.UserID AS SenderID, u.Username AS SenderUsername
    FROM Friends f
    JOIN Users u ON f.UserID = u.UserID
    WHERE f.FriendID = ? AND f.FriendshipStatus = ?
  `;
  db.all(query, [userId, FRIENDSHIP_STATUS.PENDING], (err, rows) => {
    if (err) {
      console.error('Error fetching friend requests:', err);
      return res.status(500).json({ message: 'Failed to fetch friend requests' });
    }
    res.status(200).json(rows);
  });
});

// Fetch friends list
app.get('/friends-list', (req, res) => {
  const userId = req.session.userId;
  
  if (!userId) {
    return res.status(401).json({ message: 'User not logged in' });
  }

  const query = `
    SELECT u.UserID, u.Username, u.Email
    FROM Friends f
    JOIN Users u ON (f.UserID = u.UserID OR f.FriendID = u.UserID)
    WHERE (f.UserID = ? OR f.FriendID = ?) AND f.FriendshipStatus = ? AND u.UserID != ?
  `;
  db.all(query, [userId, userId, FRIENDSHIP_STATUS.ACCEPTED, userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch friends list' });
    }
    res.status(200).json(rows);
  });
});