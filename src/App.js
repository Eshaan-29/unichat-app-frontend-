import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import './App.css'; // Only one import at the top

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2', contrastText: '#fff' },
    secondary: { main: '#26c6da' },
    background: { default: '#f4f6fa', paper: '#ffffff' },
    error: { main: '#e53935' },
    success: { main: '#43a047' }
  },
  typography: { fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif' },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, fontSize: '1rem' } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 16 } } }
  }
});

const socket = io('https://unichat-app-backend-5fob.onrender.com');

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
    <div className="app-background">
      <ThemeProvider theme={theme}>
        <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
          {!joined ? (
            <div>
              <h2>Welcome to UniChat</h2>
              <TextField
                label="Enter username"
                value={username}
                inputProps={{ maxLength: 20 }}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && joinChat()}
                fullWidth
                margin="normal"
              />
              <Button
                onClick={joinChat}
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 1 }}
              >
                Join Chat
              </Button>
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
              <TextField
                placeholder="Type your message (max 500 chars)"
                inputProps={{ maxLength: 500 }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                fullWidth
                margin="normal"
              />
              <Button
                onClick={sendMessage}
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 1 }}
              >
                Send
              </Button>
            </div>
          )}
        </div>
      </ThemeProvider>
    </div>
  );
}

export default App;
