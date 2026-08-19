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

// Memory stores removed in favor of DB

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

// Simulation logic for worker movement and booking progress
async function simulateMovement(workerId, bookingId, io) {
  try {
    const worker = await db.Worker.findByPk(workerId);
    if (!worker) return;

    let lat = parseFloat(worker.current_lat) || 28.6139;
    let lng = parseFloat(worker.current_lng) || 77.2090;

    let steps = 10;
    let currentStep = 0;
    const interval = setInterval(async () => {
      if (currentStep >= steps) {
        clearInterval(interval);
        return;
      }
      
      lat += 0.002;
      lng += 0.002;

      await db.Worker.update({ current_lat: lat, current_lng: lng }, { where: { id: workerId } });
      
      if (io) {
        io.to(`booking_${bookingId}`).emit('location-updated', { workerId, lat, lng });
        io.emit('worker-location-changed', { workerId, lat, lng });
      }

      currentStep++;
    }, 1000);
  } catch (err) {
    console.error("Simulation movement error:", err);
  }
}

async function simulateBookingProgress(bookingId, workerId, io) {
  const steps = [
    { status: 'EN_ROUTE', delay: 2000 },
    { status: 'IN_PROGRESS', delay: 12000 },
    { status: 'COMPLETED', delay: 20000 }
  ];

  let cumulativeDelay = 0;
  for (const step of steps) {
    cumulativeDelay += step.delay;
    setTimeout(async () => {
      try {
        await db.Booking.update({ status: step.status }, { where: { id: bookingId } });
        if (step.status === 'COMPLETED') {
           await db.Worker.update({ status: 'AVAILABLE' }, { where: { id: workerId } });
        }
        if (io) {
          io.to(`booking_${bookingId}`).emit('booking-status-changed', { status: step.status });
          io.to('booking_admin_room').emit('booking-status-changed', { type: 'refresh' });
        }
      } catch (err) {
        console.error("Simulation progress error:", err);
      }
    }, cumulativeDelay);
  }

  // Trigger movement simulation immediately
  simulateMovement(workerId, bookingId, io);
}

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
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Customer Register
router.post('/customer/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await db.User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ error: 'User already exists' });
    
    const user = await db.User.create({
      name, email, password, role: 'CUSTOMER', status: 'APPROVED'
    });
    
    res.status(201).json({
      token: generateToken(user.id),
      user
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Customer Login
router.post('/customer/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.User.findOne({ where: { email, role: 'CUSTOMER' } });
    if (user && (await user.matchPassword(password))) {
      res.json({ token: generateToken(user.id), user });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/customer/me
router.get('/customer/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Dealer Register
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
      edit_permission_status: 'NONE',
      status: 'PENDING'
    });

    res.status(201).json({ message: "Registered successfully! Waiting for HQ approval.", user });
  } catch (error) {
    console.error("Error registering dealer:", error);
    res.status(500).json({ error: "Could not register dealer" });
  }
});

// Dealer Login
router.post('/dealer/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.User.findOne({ where: { email, role: 'DEALER' } });
    if (user && (await user.matchPassword(password))) {
      if (user.status !== 'APPROVED') {
        return res.status(401).json({ error: 'Account pending HQ approval or rejected' });
      }
      res.json({ token: generateToken(user.id), user });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// HQ Login
router.post('/hq/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let hq = await db.User.findOne({ where: { email, role: 'HQ' } });
    
    // Auto-create HQ if it doesn't exist to prevent login lockouts in fresh DBs
    if (!hq && email === 'hq@allido.com' && password === 'hq123') {
      hq = await db.User.create({
        name: 'Headquarters',
        email: 'hq@allido.com',
        role: 'HQ',
        password: 'hq123',
        status: 'APPROVED'
      });
    }

    let valid = false;
    if (hq) {
      valid = await hq.matchPassword(password);
      if (!valid && hq.password === password) { 
        // Fallback for unhashed seeded users
        valid = true;
        // Hash it for next time
        hq.password = password; 
        await hq.save();
      }
    }
    
    if (valid) {
      res.json({ token: generateToken(hq.id), user: hq });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("HQ login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/hq/dealers
router.get('/hq/dealers', async (req, res) => {
  try {
    const dealers = await db.User.findAll({
      where: { role: 'DEALER' },
      include: [
        { model: db.Worker, as: 'workers' },
        { model: db.Booking, as: 'dealerBookings' }
      ]
    });

    const enrichedDealers = dealers.map(dealer => {
      const d = dealer.toJSON();
      d.totalWorkers = d.workers ? d.workers.length : 0;
      d.totalBookings = d.dealerBookings ? d.dealerBookings.length : 0;
      d.totalRevenue = d.dealerBookings ? d.dealerBookings.reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0) : 0;
      
      const ratedBookings = d.dealerBookings ? d.dealerBookings.filter(b => b.rating > 0) : [];
      d.overallRating = ratedBookings.length > 0 
        ? (ratedBookings.reduce((sum, b) => sum + b.rating, 0) / ratedBookings.length).toFixed(1) 
        : 0;

      const uniqueCustomers = new Set();
      if (d.dealerBookings) {
        d.dealerBookings.forEach(b => {
          if (b.userId) uniqueCustomers.add(b.userId);
        });
      }
      d.totalCustomers = uniqueCustomers.size;

      delete d.workers;
      delete d.dealerBookings;
      delete d.password; // Secure
      return d;
    });

    res.json(enrichedDealers);
  } catch (error) {
    console.error("Fetch dealers error:", error);
    res.status(500).json({ error: 'Failed to fetch dealers' });
  }
});

// PUT /api/hq/dealers/:id
router.put('/hq/dealers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, city, status } = req.body;
    
    const user = await db.User.findByPk(id);
    if (!user) return res.status(404).json({ error: "Dealer not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password; // Will be hashed by beforeUpdate hook
    if (city) user.city = city;
    if (status) user.status = status;

    await user.save();
    
    const safeUser = user.toJSON();
    delete safeUser.password;
    res.json({ message: "Dealer updated successfully", user: safeUser });
  } catch (error) {
    console.error("Update dealer error:", error);
    res.status(500).json({ error: 'Failed to update dealer' });
  }
});

// GET /api/hq/dealers/:id/analytics
router.get('/hq/dealers/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch all bookings for the dealer to aggregate revenue and services
    const bookings = await db.Booking.findAll({
      where: { dealerId: id }
    });

    // 1. Service Data (count by service type)
    const serviceCounts = {};
    bookings.forEach(b => {
      const s = b.service || 'Unknown';
      serviceCounts[s] = (serviceCounts[s] || 0) + 1;
    });
    const serviceData = Object.keys(serviceCounts).map(name => ({
      name,
      value: serviceCounts[name]
    }));
    if (serviceData.length === 0) {
      serviceData.push({ name: 'No Data', value: 1 }); // Prevent empty chart crash
    }

    // 2. Revenue Trend (aggregate total_amount by month)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueMap = {};
    
    // Pre-fill last 6 months to ensure chart looks good even with empty data
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const past = new Date(d.getFullYear(), d.getMonth() - i, 1);
      revenueMap[monthNames[past.getMonth()]] = 0;
    }

    bookings.forEach(b => {
      if (b.status === 'COMPLETED' && b.total_amount) {
        const month = monthNames[new Date(b.createdAt).getMonth()];
        if (revenueMap[month] !== undefined) {
          revenueMap[month] += parseFloat(b.total_amount);
        } else {
          // If booking is older than 6 months, we could ignore or add it
          revenueMap[month] = (revenueMap[month] || 0) + parseFloat(b.total_amount);
        }
      }
    });

    // Convert map to array and sort by chronological order of last 6 months
    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
      const past = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const mName = monthNames[past.getMonth()];
      revenueData.push({ name: mName, revenue: revenueMap[mName] });
    }

    // 3. Worker Data (count by status)
    const workers = await db.Worker.findAll({
      where: { dealerId: id }
    });
    
    const workerCounts = { 'AVAILABLE': 0, 'BUSY': 0, 'OFFLINE': 0 };
    workers.forEach(w => {
      if (workerCounts[w.status] !== undefined) {
        workerCounts[w.status]++;
      }
    });
    
    const workerData = [
      { name: 'Available', value: workerCounts['AVAILABLE'] },
      { name: 'Busy', value: workerCounts['BUSY'] },
      { name: 'Offline', value: workerCounts['OFFLINE'] },
    ];

    res.json({ revenueData, serviceData, workerData });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/hq/applications
router.get('/hq/applications', async (req, res) => {
  try {
    const pending = await db.User.findAll({ where: { role: 'DEALER', status: 'PENDING' }});
    res.json(pending);
  } catch(error) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

// PUT /api/hq/applications/:id/action
router.put('/hq/applications/:id/action', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'APPROVE' or 'REJECT'
    const user = await db.User.findByPk(id);
    if (!user) return res.status(404).json({ error: "Not found" });
    
    user.status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    await user.save();
    res.json({ message: `${action} successful`, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

// GET /api/dealer/profile
router.get('/dealer/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to load profile" });
  }
});

// POST /api/dealer/profile/request-edit
router.post('/dealer/profile/request-edit', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.User.findByPk(decoded.id);
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
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.User.findByPk(decoded.id);
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
    const { service, scheduled_time, total_amount } = req.body;
    let actualUserId = null;

    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        actualUserId = decoded.id;
      } catch (err) {
        console.warn("Invalid token in booking creation");
      }
    }
    
    // For now, if no userId is provided, find or create a default user
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
