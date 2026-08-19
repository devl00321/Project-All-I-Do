const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const sequelize = require('../config/database');

const User = require('./User')(sequelize, DataTypes);
const Worker = require('./Worker')(sequelize, DataTypes);
const Booking = require('./Booking')(sequelize, DataTypes);

// Define Associations
User.hasMany(Booking, { foreignKey: 'userId', as: 'customerBookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'customer' });

User.hasMany(Booking, { foreignKey: 'dealerId', as: 'dealerBookings' });
Booking.belongsTo(User, { foreignKey: 'dealerId', as: 'dealer' });

User.hasMany(Worker, { foreignKey: 'dealerId', as: 'workers' });
Worker.belongsTo(User, { foreignKey: 'dealerId', as: 'dealer' });

Worker.hasMany(Booking, { foreignKey: 'workerId' });
Booking.belongsTo(Worker, { foreignKey: 'workerId' });

const db = {
  sequelize,
  Sequelize,
  User,
  Worker,
  Booking
};

module.exports = db;
