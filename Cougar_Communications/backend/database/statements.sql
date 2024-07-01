-- SQLite
-- Drop the tables if they exists
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Friends;
DROP TABLE IF EXISTS GroupChats;
DROP TABLE IF EXISTS GroupMembers;
DROP TABLE IF EXISTS Messages;

-- Create the Users table
CREATE TABLE Users (
    UserID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    Email TEXT NOT NULL,
    Username VARCHAR NOT NULL,
    Password VARCHAR NOT NULL
);

-- Stores friendship and requests 
CREATE TABLE Friends (
    UserID INTEGER NOT NULL,
    FriendID INTEGER NOT NULL,
    FriendshipStatus VARCHAR NOT NULL,
    DateAdded DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (UserID, FriendID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (FriendID) REFERENCES Users(UserID)
);
-- Stores groupchat names
CREATE TABLE GroupChats (
    GroupID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    GroupName VARCHAR,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Keeps track of users attached to each groupchat
-- Used for groupchats and one to one chats
CREATE TABLE GroupMembers (
    GroupID INTEGER NOT NULL,
    UserID INTEGER NOT NULL,
    JoinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (GroupID, UserID),
    FOREIGN KEY (GroupID) REFERENCES GroupChats(GroupID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Each message is attached to a groupchat
CREATE TABLE Messages (
    MessageID INTEGER PRIMARY KEY AUTOINCREMENT,
    GroupID INTEGER NOT NULL,
    SenderID INTEGER NOT NULL,
    Message TEXT NOT NULL,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (GroupID) REFERENCES GroupChats(GroupID),
    FOREIGN KEY (SenderID) REFERENCES Users(UserID)
);


-- Insert statements were generated using ChatGTP

-- Insert users
INSERT INTO Users (Email, Username, Password) VALUES ('alice@example.com', 'Alice', 'password1');
INSERT INTO Users (Email, Username, Password) VALUES ('bob@example.com', 'Bob', 'password2');
INSERT INTO Users (Email, Username, Password) VALUES ('carol@example.com', 'Carol', 'password3');

-- Insert friendships
INSERT INTO Friends (UserID, FriendID, FriendshipStatus) 
VALUES 
    ((SELECT UserID FROM Users WHERE Username = 'Alice'), (SELECT UserID FROM Users WHERE Username = 'Bob'), 'Accepted'),
    ((SELECT UserID FROM Users WHERE Username = 'Alice'), (SELECT UserID FROM Users WHERE Username = 'Carol'), 'Accepted'),
    ((SELECT UserID FROM Users WHERE Username = 'Bob'), (SELECT UserID FROM Users WHERE Username = 'Carol'), 'Accepted');

-- Create group chats (including one-on-one chats)
INSERT INTO GroupChats (GroupName) VALUES ('Alice-Bob Chat');
INSERT INTO GroupChats (GroupName) VALUES ('Alice-Carol Chat');
INSERT INTO GroupChats (GroupName) VALUES ('Bob-Carol Chat');
INSERT INTO GroupChats (GroupName) VALUES ('Alice-Bob-Carol Group');

-- Add members to group chats
INSERT INTO GroupMembers (GroupID, UserID)
VALUES 
    (1, (SELECT UserID FROM Users WHERE Username = 'Alice')),
    (1, (SELECT UserID FROM Users WHERE Username = 'Bob')),
    (2, (SELECT UserID FROM Users WHERE Username = 'Alice')),
    (2, (SELECT UserID FROM Users WHERE Username = 'Carol')),
    (3, (SELECT UserID FROM Users WHERE Username = 'Bob')),
    (3, (SELECT UserID FROM Users WHERE Username = 'Carol')),
    (4, (SELECT UserID FROM Users WHERE Username = 'Alice')),
    (4, (SELECT UserID FROM Users WHERE Username = 'Bob')),
    (4, (SELECT UserID FROM Users WHERE Username = 'Carol'));

-- Insert messages
INSERT INTO Messages (GroupID, SenderID, Message) 
VALUES 
    (1, (SELECT UserID FROM Users WHERE Username = 'Alice'), 'Hi Bob, how are you?'),
    (1, (SELECT UserID FROM Users WHERE Username = 'Bob'), 'I am good, Alice. How about you?'),
    (2, (SELECT UserID FROM Users WHERE Username = 'Alice'), 'Hey Carol, long time no see!'),
    (2, (SELECT UserID FROM Users WHERE Username = 'Carol'), 'Indeed, Alice! We should catch up soon.'),
    (3, (SELECT UserID FROM Users WHERE Username = 'Bob'), 'Hi Carol, are you joining the meeting tomorrow?'),
    (3, (SELECT UserID FROM Users WHERE Username = 'Carol'), 'Yes, Bob. I will be there.'),
    (4, (SELECT UserID FROM Users WHERE Username = 'Alice'), 'Hey everyone, welcome to our group chat!'),
    (4, (SELECT UserID FROM Users WHERE Username = 'Bob'), 'Thanks for setting this up, Alice!'),
    (4, (SELECT UserID FROM Users WHERE Username = 'Carol'), 'Great idea! This will be much easier for planning.'),
    (4, (SELECT UserID FROM Users WHERE Username = 'Alice'), 'Agreed! Shall we plan our next meetup?');

-- Select all chats and their messages
SELECT 
    gc.GroupID,
    gc.GroupName,
    u.Username AS Sender,
    m.Message,
    m.Timestamp
FROM 
    GroupChats gc
JOIN 
    Messages m ON gc.GroupID = m.GroupID
JOIN 
    Users u ON m.SenderID = u.UserID
ORDER BY 
    gc.GroupID, m.Timestamp;