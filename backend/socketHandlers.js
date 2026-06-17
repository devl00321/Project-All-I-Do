const db = require('./models');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a specific booking room to get live tracking updates
    socket.on('join-booking', (bookingId) => {
      socket.join(`booking_${bookingId}`);
      console.log(`Socket ${socket.id} joined room booking_${bookingId}`);
    });

    // Receive worker location update and broadcast to the booking room
    socket.on('update-location', async (data) => {
      // data: { workerId, bookingId, lat, lng }
      const { workerId, bookingId, lat, lng } = data;
      
      try {
        // Update DB
        await db.Worker.update(
          { current_lat: lat, current_lng: lng },
          { where: { id: workerId } }
        );

        // Broadcast to customer
        io.to(`booking_${bookingId}`).emit('location-updated', {
          workerId,
          lat,
          lng
        });
        
        // Also broadcast to a general 'dealer-map' room if we implement it later
        io.emit('worker-location-changed', { workerId, lat, lng });
      } catch (error) {
        console.error("Error updating worker location:", error);
      }
    });

    // Handle status changes (e.g., Worker accepts, En route, Arrived)
    socket.on('status-change', async (data) => {
      const { bookingId, status } = data;
      try {
        await db.Booking.update(
          { status },
          { where: { id: bookingId } }
        );

        io.to(`booking_${bookingId}`).emit('booking-status-changed', {
          bookingId,
          status
        });
      } catch (error) {
        console.error("Error updating booking status:", error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
