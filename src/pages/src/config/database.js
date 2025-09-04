const { Sequelize } = require('sequelize');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../../../src/database.sqlite');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: console.log // Change this from false to console.log
});

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite database connection established successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

testConnection();

module.exports = sequelize;