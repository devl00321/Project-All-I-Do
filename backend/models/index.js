const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
// Use the centralized database connection
const sequelize = require('../config/database');


const User = require('./User')(sequelize, DataTypes);
const Worker = require('./Worker')(sequelize, DataTypes);
const Booking = require('./Booking')(sequelize, DataTypes);

// Define Associations
User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { foreignKey: 'userId' });

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
