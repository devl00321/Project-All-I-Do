const express = require('express');
const router = express.Router();
const db = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/kyc');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

// Helper to simulate the booking lifecycle
const simulateMovement = (workerId, bookingId, io) => {
  const startLat = 23.9054;
  const startLng = 87.5276;
  const endLat = 23.9100;
  const endLng = 87.5200;
  
  const totalSteps = 50; 
  const intervalTime = 100; // 5 seconds total
  let stepCount = 0;

  const interval = setInterval(async () => {
    stepCount++;
    const progress = stepCount / totalSteps;
    const currentLat = startLat + (endLat - startLat) * progress;
    const currentLng = startLng + (endLng - startLng) * progress;
    
    if (io) {
      io.to(`booking_${bookingId}`).emit('location-updated', { lat: currentLat, lng: currentLng });
      io.to('booking_admin_room').emit('location-updated', { workerId, lat: currentLat, lng: currentLng });
    }
    
    // Update DB occasionally to avoid overwhelming, or just update every time for local test
    await db.Worker.update({ current_lat: currentLat, current_lng: currentLng }, { where: { id: workerId } });

    if (stepCount >= totalSteps) {
      clearInterval(interval);
    }
  }, intervalTime);
};

const simulateBookingProgress = (bookingId, workerId, io) => {
  const steps = [
    { status: 'EN_ROUTE', delay: 2000 },
    { status: 'IN_PROGRESS', delay: 7000 },
    { status: 'COMPLETED', delay: 12000 }
  ];

  steps.forEach(step => {
    setTimeout(async () => {
      try {
        const booking = await db.Booking.findByPk(bookingId);
        if (booking && booking.status !== 'CANCELLED') {
          booking.status = step.status;
          await booking.save();
          
          if (io) {
            io.to(`booking_${bookingId}`).emit('booking-status-changed', { status: step.status });
            io.to('booking_admin_room').emit('booking-status-changed', { type: 'refresh' });
          }
          
          if (step.status === 'EN_ROUTE') {
            simulateMovement(workerId, bookingId, io);
          }
          
          if (step.status === 'COMPLETED') {
            await db.Worker.update({ status: 'AVAILABLE' }, { where: { id: workerId } });
          }
        }
      } catch (err) {
        console.error("Simulation error:", err);
      }
    }, step.delay);
  });
};

// GET /api/workers/active - Fetch active workers for dealer map
router.get('/workers/active', async (req, res) => {
  try {
    const workers = await db.Worker.findAll({
      where: {
        status: ['AVAILABLE', 'BUSY']
      }
    });
    res.json(workers);
  } catch (error) {
    console.error("Error fetching workers:", error);
    res.status(500).json({ error: "Could not fetch workers" });
  }
});

// GET /api/workers - Fetch all workers
router.get('/workers', async (req, res) => {
  try {
    const workers = await db.Worker.findAll();
    res.json(workers);
  } catch (error) {
    console.error("Error fetching workers:", error);
    res.status(500).json({ error: "Could not fetch workers" });
  }
});

// GET /api/users - Fetch all customers
router.get('/users', async (req, res) => {
  try {
    const users = await db.User.findAll({ where: { role: 'CUSTOMER' } });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Could not fetch users" });
  }
});

// --- AUTH & PROFILE ROUTES ---

// POST /api/dealer/register
router.post('/dealer/register', upload.fields([
  { name: 'face_photo', maxCount: 1 },
  { name: 'aadhaar_photo', maxCount: 1 },
  { name: 'pan_photo', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, email, password, city, aadhaar_id, pan_id, voter_id } = req.body;
    
    const face_photo_url = req.files['face_photo'] ? `/uploads/kyc/${req.files['face_photo'][0].filename}` : null;
    const aadhaar_photo_url = req.files['aadhaar_photo'] ? `/uploads/kyc/${req.files['aadhaar_photo'][0].filename}` : null;
    const pan_photo_url = req.files['pan_photo'] ? `/uploads/kyc/${req.files['pan_photo'][0].filename}` : null;

    const user = await db.User.create({
      name, email, password, city, aadhaar_id, pan_id, voter_id,
      face_photo_url, aadhaar_photo_url, pan_photo_url,
      role: 'DEALER',
      edit_permission_status: 'NONE'
    });

    res.status(201).json({ message: "Registered successfully", user });
  } catch (error) {
    console.error("Error registering dealer:", error);
    res.status(500).json({ error: "Could not register dealer" });
  }
});

// POST /api/dealer/login
router.post('/dealer/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.User.findOne({ where: { email, password, role: 'DEALER' } });
    
    if (user) {
      res.json({ token: user.id, user }); // Basic dummy token
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/dealer/profile
router.get('/dealer/profile', async (req, res) => {
  try {
    const userId = req.headers.authorization; // Using ID as token
    const user = await db.User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to load profile" });
  }
});

// POST /api/dealer/profile/request-edit
router.post('/dealer/profile/request-edit', async (req, res) => {
  try {
    const userId = req.headers.authorization;
    const user = await db.User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Not found" });
    
    user.edit_permission_status = 'REQUESTED';
    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to request edit" });
  }
});

// PUT /api/dealer/profile
router.put('/dealer/profile', async (req, res) => {
  try {
    const userId = req.headers.authorization;
    const user = await db.User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Not found" });
    
    if (user.edit_permission_status !== 'GRANTED') {
      return res.status(403).json({ error: "Edit permission not granted" });
    }

    const { name, email, password, city } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;
    if (city) user.city = city;

    // Reset permission after edit
    user.edit_permission_status = 'NONE';
    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// --- HQ PORTAL ROUTES ---

// POST /api/hq/login
router.post('/hq/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hq = await db.User.findOne({ where: { email, password, role: 'HQ' } });
    if (hq) {
      res.json({ token: hq.id, user: hq });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/hq/requests
router.get('/hq/requests', async (req, res) => {
  try {
    const requests = await db.User.findAll({ 
      where: { edit_permission_status: 'REQUESTED' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Failed to load requests" });
  }
});

// PUT /api/hq/requests/:id
router.put('/hq/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'APPROVE' or 'REJECT'
    const user = await db.User.findByPk(id);
    
    if (!user) return res.status(404).json({ error: "User not found" });

    user.edit_permission_status = action === 'APPROVE' ? 'GRANTED' : 'NONE';
    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to process request" });
  }
});

// --- CORE ROUTES ---

// POST /api/bookings - Create a new booking
router.post('/bookings', async (req, res) => {
  try {
    const { userId, service, scheduled_time, total_amount } = req.body;
    
    // For now, if no userId is provided, find or create a default user
    let actualUserId = userId;
    if (!actualUserId) {
      const [user] = await db.User.findOrCreate({
        where: { email: 'testcustomer@example.com' },
        defaults: { name: 'Test Customer', role: 'CUSTOMER' }
      });
      actualUserId = user.id;
    }

    const booking = await db.Booking.create({
      userId: actualUserId,
      service,
      scheduled_time,
      total_amount,
      status: 'PENDING'
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Could not create booking" });
  }
});

// GET /api/bookings/:userId - Fetch user's booking history
router.get('/bookings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await db.Booking.findAll({
      where: { userId },
      include: [db.Worker],
      order: [['createdAt', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Could not fetch bookings" });
  }
});

// GET /api/dealer/bookings - Fetch all bookings for the dealer dashboard
router.get('/dealer/bookings', async (req, res) => {
  try {
    const bookings = await db.Booking.findAll({
      include: [db.Worker, db.User],
      order: [['createdAt', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching dealer bookings:", error);
    res.status(500).json({ error: "Could not fetch bookings" });
  }
});

// PUT /api/dealer/bookings/:id/assign - Assign a worker
router.put('/dealer/bookings/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { workerId } = req.body;

    const booking = await db.Booking.findByPk(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Update booking
    booking.workerId = workerId;
    booking.status = 'ASSIGNED';
    await booking.save();

    // Fetch the updated booking with Worker included to return
    const updatedBooking = await db.Booking.findByPk(id, { include: [db.Worker] });
    
    // Also update worker status to BUSY
    await db.Worker.update({ status: 'BUSY' }, { where: { id: workerId } });

    // Start simulation
    simulateBookingProgress(booking.id, workerId, req.io);

    // Notify customer that it was assigned immediately
    if (req.io) {
      req.io.to(`booking_${id}`).emit('booking-status-changed', { status: 'ASSIGNED' });
      req.io.to('booking_admin_room').emit('booking-status-changed', { type: 'refresh' });
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error("Error assigning worker:", error);
    res.status(500).json({ error: "Could not assign worker" });
  }
});

// PUT /api/dealer/bookings/:id/complete - Manually mark a booking as completed
router.put('/dealer/bookings/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await db.Booking.findByPk(id);
    
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    booking.status = 'COMPLETED';
    await booking.save();

    if (booking.workerId) {
      await db.Worker.update({ status: 'AVAILABLE' }, { where: { id: booking.workerId } });
    }

    if (req.io) {
      req.io.to(`booking_${id}`).emit('booking-status-changed', { status: 'COMPLETED' });
      req.io.to('booking_admin_room').emit('booking-status-changed', { type: 'refresh' });
    }

    res.json(booking);
  } catch (error) {
    console.error("Error completing booking:", error);
    res.status(500).json({ error: "Could not complete booking" });
  }
});

module.exports = router;
