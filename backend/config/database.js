const { Sequelize } = require('sequelize');

// Connect using the connection string from environment variables
const sequelize = new Sequelize(process.env.SUPABASE_DB_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Supabase requires SSL
    }
  },
  logging: false
});

module.exports = sequelize;
