const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '../.env' }); // Load from root .env

// Connect using the connection string from environment variables
const sequelize = new Sequelize(process.env.NEON_DB_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Neon requires SSL
    }
  },
  logging: false
});

module.exports = sequelize;
