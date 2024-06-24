-- SQLite
-- Drop the tables if they exists
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Friends;
DROP TABLE IF EXISTS Chats;
DROP TABLE IF EXISTS Messages;

-- Create the Users table
CREATE TABLE Users (
    UserID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    Email TEXT NOT NULL,
    Username VARCHAR NOT NULL,
    Password VARCHAR NOT NULL
);

-- Create the Friends table
CREATE TABLE Friends (
    UserID INTEGER NOT NULL,
    FriendID INTEGER NOT NULL,
    PRIMARY KEY (UserID, FriendID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (FriendID) REFERENCES Users(UserID)
);

-- Create the Chats table
CREATE TABLE Chats (
    ChatID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    UserID INTEGER NOT NULL,
    FriendID INTEGER NOT NULL,
    UNIQUE(UserID, FriendID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (FriendID) REFERENCES Users(UserID)
);

-- Create the Messages table
CREATE TABLE Messages (
    MessageID INTEGER PRIMARY KEY AUTOINCREMENT,
    ChatID INTEGER NOT NULL,
    SenderID INTEGER NOT NULL,
    Message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ChatID) REFERENCES Chats(ChatID),
    FOREIGN KEY (SenderID) REFERENCES Users(UserID)
);


-- Insert statements were generated using ChatGTP

-- Insert users
INSERT INTO Users (Email, Username, Password) VALUES ('alice@example.com', 'Alice', 'password1');
INSERT INTO Users (Email, Username, Password) VALUES ('bob@example.com', 'Bob', 'password2');
INSERT INTO Users (Email, Username, Password) VALUES ('carol@example.com', 'Carol', 'password3');

-- Insert friendships and corresponding chat entries
INSERT INTO Friends (UserID, FriendID) 
VALUES ((SELECT UserID FROM Users WHERE Username = 'Alice'), (SELECT UserID FROM Users WHERE Username = 'Bob'));

INSERT INTO Chats (UserID, FriendID)
VALUES ((SELECT UserID FROM Users WHERE Username = 'Alice'), (SELECT UserID FROM Users WHERE Username = 'Bob'));

INSERT INTO Friends (UserID, FriendID) 
VALUES ((SELECT UserID FROM Users WHERE Username = 'Alice'), (SELECT UserID FROM Users WHERE Username = 'Carol'));

INSERT INTO Chats (UserID, FriendID)
VALUES ((SELECT UserID FROM Users WHERE Username = 'Alice'), (SELECT UserID FROM Users WHERE Username = 'Carol'));

INSERT INTO Friends (UserID, FriendID) 
VALUES ((SELECT UserID FROM Users WHERE Username = 'Bob'), (SELECT UserID FROM Users WHERE Username = 'Carol'));

INSERT INTO Chats (UserID, FriendID)
VALUES ((SELECT UserID FROM Users WHERE Username = 'Bob'), (SELECT UserID FROM Users WHERE Username = 'Carol'));

-- Insert messages between Alice and Bob
INSERT INTO Messages (ChatID, SenderID, Message) 
VALUES (
    (SELECT ChatID FROM Chats WHERE UserID = (SELECT UserID FROM Users WHERE Username = 'Alice') AND FriendID = (SELECT UserID FROM Users WHERE Username = 'Bob')), 
    (SELECT UserID FROM Users WHERE Username = 'Alice'), 
    'Hi Bob, how are you?'
);

INSERT INTO Messages (ChatID, SenderID, Message) 
VALUES (
    (SELECT ChatID FROM Chats WHERE UserID = (SELECT UserID FROM Users WHERE Username = 'Alice') AND FriendID = (SELECT UserID FROM Users WHERE Username = 'Bob')), 
    (SELECT UserID FROM Users WHERE Username = 'Bob'), 
    'I am good, Alice. How about you?'
);

-- Insert messages between Alice and Carol
INSERT INTO Messages (ChatID, SenderID, Message) 
VALUES (
    (SELECT ChatID FROM Chats WHERE UserID = (SELECT UserID FROM Users WHERE Username = 'Alice') AND FriendID = (SELECT UserID FROM Users WHERE Username = 'Carol')), 
    (SELECT UserID FROM Users WHERE Username = 'Alice'), 
    'Hey Carol, long time no see!'
);

INSERT INTO Messages (ChatID, SenderID, Message) 
VALUES (
    (SELECT ChatID FROM Chats WHERE UserID = (SELECT UserID FROM Users WHERE Username = 'Alice') AND FriendID = (SELECT UserID FROM Users WHERE Username = 'Carol')), 
    (SELECT UserID FROM Users WHERE Username = 'Carol'), 
    'Indeed, Alice! We should catch up soon.'
);

-- Insert messages between Bob and Carol
INSERT INTO Messages (ChatID, SenderID, Message) 
VALUES (
    (SELECT ChatID FROM Chats WHERE UserID = (SELECT UserID FROM Users WHERE Username = 'Bob') AND FriendID = (SELECT UserID FROM Users WHERE Username = 'Carol')), 
    (SELECT UserID FROM Users WHERE Username = 'Bob'), 
    'Hi Carol, are you joining the meeting tomorrow?'
);

INSERT INTO Messages (ChatID, SenderID, Message) 
VALUES (
    (SELECT ChatID FROM Chats WHERE UserID = (SELECT UserID FROM Users WHERE Username = 'Bob') AND FriendID = (SELECT UserID FROM Users WHERE Username = 'Carol')), 
    (SELECT UserID FROM Users WHERE Username = 'Carol'), 
    'Yes, Bob. I will be there.'
);



-- Select all entries from the Users table
SELECT * FROM Users;
SELECT * FROM Friends;
SELECT * FROM Chats;
SELECT * FROM Messages;



-- Select all chats and their messages
SELECT 
    c.ChatID,
    u1.Username AS User1,
    u2.Username AS User2,
    m.MessageID,
    m.SenderID,
    u3.Username AS Sender,
    m.Message,
    m.timestamp
FROM 
    Chats c
JOIN 
    Users u1 ON c.UserID = u1.UserID
JOIN 
    Users u2 ON c.FriendID = u2.UserID
LEFT JOIN 
    Messages m ON c.ChatID = m.ChatID
LEFT JOIN 
    Users u3 ON m.SenderID = u3.UserID
ORDER BY 
    c.ChatID, m.timestamp;