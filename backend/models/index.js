const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'allido_db',
  process.env.DB_USER || 'allido',
  process.env.DB_PASSWORD || 'allido_secret',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // Set to true to see SQL queries
  }
);

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
