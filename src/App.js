import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001'); // For later, change to deployment backend URL

function App() {
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef();

  useEffect(() => {
    socket.on('history', (msgs) => setMessages(msgs));
    socket.on('message', (msg) => setMessages((prev) => [...prev, msg]));
    socket.on('userJoined', (user) =>
      setMessages((prev) => [...prev, { system: true, text: `${user.username} joined the chat` }])
    );
    socket.on('userLeft', (user) =>
      setMessages((prev) => [...prev, { system: true, text: `${user.username} left the chat` }])
    );

    return () => {
      socket.off('history');
      socket.off('message');
      socket.off('userJoined');
      socket.off('userLeft');
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const joinChat = () => {
    if (username.trim()) {
      socket.emit('join', username.trim());
      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit('message', input.trim());
      setInput('');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      {!joined ? (
        <div>
          <h2>Welcome to UniChat</h2>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            maxLength={20}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && joinChat()}
            style={{ width: '100%', padding: 10, fontSize: 16 }}
          />
          <button onClick={joinChat} style={{ marginTop: 10, padding: '10px 20px', fontSize: 16 }}>
            Join Chat
          </button>
        </div>
      ) : (
        <div>
          <h2>Hi {username}</h2>
          <div
            style={{
              border: '1px solid #ccc',
              height: 400,
              overflowY: 'auto',
              padding: 10,
              marginBottom: 10,
              backgroundColor: '#f9f9f9',
            }}
          >
            {messages.map((msg, idx) =>
              msg.system ? (
                <div key={idx} style={{ color: '#888', fontStyle: 'italic', margin: '5px 0' }}>
                  {msg.text}
                </div>
              ) : (
                <div key={idx} style={{ marginBottom: 8 }}>
                  <b>{msg.username}:</b> {msg.text}{' '}
                  <span style={{ fontSize: 10, color: '#aaa' }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              )
            )}
            <div ref={scrollRef} />
          </div>
          <input
            type="text"
            placeholder="Type your message (max 500 chars)"
            maxLength={500}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            style={{ width: '100%', padding: 10, fontSize: 16 }}
          />
          <button onClick={sendMessage} style={{ marginTop: 10, padding: '10px 20px', fontSize: 16 }}>
            Send
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

