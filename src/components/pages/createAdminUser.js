const sequelize = require('./src/config/database');
const User = require('./src/models/User');

async function createAdminUser() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connection established.');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      where: { email: 'admin@eyewearr.com' }
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@eyewearr.com');
      console.log('Password: admin123');
      process.exit(0);
    }
    
    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@eyewearr.com',
      password: 'admin123',
      role: 'admin'
    });
    
    console.log('Admin user created successfully!');
    console.log('Email: admin@eyewearr.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
}

createAdminUser();