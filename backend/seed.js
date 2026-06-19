const db = require('./models');

const seedWorkers = async () => {
  try {
    await db.sequelize.sync({ force: true });

    const dummyWorkers = [
      { name: 'Rajesh Kumar', service_type: 'Plumber', status: 'AVAILABLE', current_lat: 23.9056, current_lng: 87.5266 }, // Suri coords approx
      { name: 'Sanjay Das', service_type: 'Electrician', status: 'AVAILABLE', current_lat: 23.9100, current_lng: 87.5300 },
      { name: 'Amit Roy', service_type: 'Cleaning', status: 'BUSY', current_lat: 23.9000, current_lng: 87.5200 },
    ];

    for (const worker of dummyWorkers) {
      await db.Worker.findOrCreate({
        where: { name: worker.name },
        defaults: worker,
      });
    }

    // Seed HQ
    await db.User.findOrCreate({
      where: { email: 'hq@allido.com' },
      defaults: {
        name: 'Headquarters',
        role: 'HQ',
        password: 'hq123'
      }
    });

    // Seed a test dealer
    await db.User.findOrCreate({
      where: { email: 'admin@allido.com' },
      defaults: {
        name: 'Suri Dealer Admin',
        role: 'DEALER',
        password: 'admin123',
        city: 'Suri',
        aadhaar_id: '1234-5678-9012',
        pan_id: 'ABCDE1234F',
        voter_id: 'VOTER987654321',
        edit_permission_status: 'NONE'
      }
    });

    console.log('Dummy data seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding workers:', error);
    process.exit(1);
  }
};

seedWorkers();
