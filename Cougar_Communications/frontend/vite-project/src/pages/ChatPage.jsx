import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import shimarin from '../assets/images/shimarin.png';
import nadeshiko from '../assets/images/nadeshiko.png';
import bluedragon from '../assets/images/bluedragon.png';
import reddragon from '../assets/images/reddragon.png';
import trash from '../assets/images/trash.png';
import wow from '../assets/images/wow.png';
import dodrio from '../assets/images/dodrio.png';
import './ChatPage.css'; // We'll create this file for the styles

function ChatPage() {
  const [messages, setMessages] = useState([
    { text: "Hello dude!", sender: "left" },
    { text: "Hello dude!", sender: "right" },
    { text: "Hello dude!", sender: "right" },
    { text: "Hello dude!", sender: "left" },
    { text: "Hello dude!", sender: "left" },
    { text: "Hello dude!", sender: "left" },
    { text: "Hello dude!", sender: "right" },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() !== '') {
      setMessages([...messages, { text: inputMessage, sender: "right" }]);
      setInputMessage('');
    }
  };

  return (
    <div>
      <header>
        <div className="header">
          <Link to="/" className="logo">
            <img src={logo} alt="Saint Charles Community College Logo" />
          </Link>
          <div className="header-right">
            <h1>Cougar Communications</h1>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="row no-gutters">
          <div className="col-md-4 border-right">
            <div className="settings-tray">
              <img className="profile-image" src={shimarin} alt="Profile img" />
              <span className="settings-tray--right">
                <i className="material-icons">cached</i>
                <i className="material-icons">message</i>
                <i className="material-icons">menu</i>
              </span>
            </div>
            <div className="search-box">
              <div className="input-wrapper">
                <i className="material-icons">search</i>
                <input placeholder="Search here" type="text" />
              </div>
            </div>
            {[
              { img: nadeshiko, name: "Nadeshiko", message: "You have to see this view!", time: "13:21" },
              { img: bluedragon, name: "Blue Eyes", message: "Red is bad, don't listen to him.", time: "12:42" },
              { img: reddragon, name: "Red Eyes", message: "Blue is outdated, don't even try.", time: "12:39" },
              { img: trash, name: "Ex-Girlfriend", message: "I bet you miss me.", time: "09:02" },
              { img: wow, name: "Jenkins", message: "Hop on World of Warcraft.", time: "04:34" },
              { img: dodrio, name: "Dodrio", message: "Early bird gets the worm!", time: "01:00" },
            ].map((friend, index) => (
              <React.Fragment key={index}>
                <div className="friend-drawer friend-drawer--onhover">
                  <img className="profile-image" src={friend.img} alt="" />
                  <div className="text">
                    <h6>{friend.name}</h6>
                    <p className="text-muted">{friend.message}</p>
                  </div>
                  <span className="time text-muted small">{friend.time}</span>
                </div>
                {index < 5 && <hr />}
              </React.Fragment>
            ))}
          </div>
          <div className="col-md-8">
            <div className="settings-tray">
              <div className="friend-drawer no-gutters friend-drawer--grey">
                <img className="profile-image" src={nadeshiko} alt="" />
                <div className="text">
                  <h4>Nadeshiko</h4>
                </div>
                <span className="settings-tray--right">
                  <i className="material-icons">cached</i>
                  <i className="material-icons">message</i>
                  <i className="material-icons">menu</i>
                </span>
              </div>
            </div>
            <div className="chat-panel">
              {messages.map((message, index) => (
                <div key={index} className="row no-gutters">
                  <div className={`col-md-3 ${message.sender === 'right' ? 'offset-md-9' : ''}`}>
                    <div className={`chat-bubble chat-bubble--${message.sender}`}>
                      {message.text}
                    </div>
                  </div>
                </div>
              ))}
              <div className="row">
                <div className="col-12">
                  <form onSubmit={handleSendMessage} className="chat-box-tray">
                    <i className="material-icons">sentiment_very_satisfied</i>
                    <input 
                      type="text" 
                      placeholder="Type your message here..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                    />
                    <i className="material-icons">mic</i>
                    <button type="submit" style={{background: 'none', border: 'none'}}>
                      <i className="material-icons">send</i>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer>
        <div className="footer">
          <Link to="/contact">Contact</Link>
          <Link to="/about">About</Link>
        </div>
      </footer>
    </div>
  );
}

export default ChatPage;