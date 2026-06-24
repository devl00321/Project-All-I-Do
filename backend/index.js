const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config({ path: '../.env' }); // Load from root .env
const sequelize = require('./config/database');
const { requireAuth } = require('./middleware/auth');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // We will restrict this later
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'allido-backend' });
});

// Example protected route
app.get('/api/protected', requireAuth, (req, res) => {
  res.json({ message: 'Success! You are authenticated.', user: req.user });
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    server.listen(PORT, () => {
      console.log(`ALLIDO Backend running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
