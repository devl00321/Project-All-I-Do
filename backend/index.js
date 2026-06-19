const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const db = require('./models');

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

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Attach io to req object so routes can emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: 'rzp_test_T2C2aD1TZMX8tV',
  key_secret: 'TrYG8VGv7HD5gEQPogpL5ZmX'
});

app.post('/api/create-razorpay-order', async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: "receipt_order_" + Date.now()
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Could not create order" });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'allido-backend' });
});

require('./socketHandlers')(io);

const PORT = process.env.PORT || 5000;

db.sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully.');
    server.listen(PORT, () => {
      console.log(`ALLIDO Backend running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
