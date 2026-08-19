const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, 'routes', 'api.js');
let content = fs.readFileSync(apiPath, 'utf8');

const targetStr = "// PUT /api/dealer/bookings/:id/assign - Assign a worker";
const idx = content.indexOf(targetStr);

if (idx !== -1) {
  content = content.substring(0, idx) + `// PUT /api/dealer/bookings/:id/assign - Assign a worker
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
      req.io.to(\`booking_\${id}\`).emit('booking-status-changed', { status: 'ASSIGNED' });
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
      req.io.to(\`booking_\${id}\`).emit('booking-status-changed', { status: 'COMPLETED' });
      req.io.to('booking_admin_room').emit('booking-status-changed', { type: 'refresh' });
    }

    res.json(booking);
  } catch (error) {
    console.error("Error completing booking:", error);
    res.status(500).json({ error: "Could not complete booking" });
  }
});

module.exports = router;
`;
  fs.writeFileSync(apiPath, content, 'utf8');
  console.log("Fixed api.js");
} else {
  console.log("Could not find marker");
}
