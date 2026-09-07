const bcrypt = require('bcryptjs');
const { User, Wallet, StudentCard, CampusLocation, ServiceItem, Notification } = require('../models');

const seedDatabase = async () => {
  try {
    // Check if demo user already exists
    const existingUser = await User.findOne({ where: { username: 'demo.student' } });
    
    if (!existingUser) {
      console.log('Seeding demo data...');

      // Create demo student
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const demoUser = await User.create({
        username: 'demo.student',
        password: hashedPassword,
        fullName: 'Demo Student',
        studentId: 'DEMO001',
        role: 'STUDENT',
        guest: false
      });

      // Create wallet
      const wallet = await Wallet.create({
        userId: demoUser.id,
        balance: 500.00,
        currency: 'ZAR'
      });

      // Create student card
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 4);

      await StudentCard.create({
        userId: demoUser.id,
        cardNumber: `DEMO-${demoUser.id}-${Date.now()}`,
        status: 'ACTIVE',
        expiryDate: expiryDate.toISOString().split('T')[0],
        issueDate: new Date().toISOString().split('T')[0]
      });

      console.log('Demo student created successfully');
    }

    // Seed campus locations if empty
    const locationCount = await CampusLocation.count();
    if (locationCount === 0) {
      await CampusLocation.bulkCreate([
        {
          name: 'Main Library',
          description: 'Central library with study areas',
          latitude: -30.2250,
          longitude: 25.7461,
          category: 'Library'
        },
        {
          name: 'Student Center Café',
          description: 'Campus cafeteria and meeting point',
          latitude: -30.2255,
          longitude: 25.7465,
          category: 'Cafeteria'
        },
        {
          name: 'Sports Complex',
          description: 'Athletics and fitness facilities',
          latitude: -30.2240,
          longitude: 25.7470,
          category: 'Sports'
        },
        {
          name: 'Science Lab Building',
          description: 'Physics and Chemistry laboratories',
          latitude: -30.2260,
          longitude: 25.7455,
          category: 'Lab'
        },
        {
          name: 'Student Accommodation',
          description: 'On-campus residence halls',
          latitude: -30.2245,
          longitude: 25.7450,
          category: 'Residence'
        }
      ]);
      console.log('Campus locations seeded');
    }

    // Seed services if empty
    const serviceCount = await ServiceItem.count();
    if (serviceCount === 0) {
      await ServiceItem.bulkCreate([
        {
          name: 'Library Services',
          description: 'Book lending and research resources',
          icon: '📚',
          category: 'Education',
          url: '/services/library'
        },
        {
          name: 'IT Help Desk',
          description: 'Technical support and troubleshooting',
          icon: '💻',
          category: 'Technology',
          url: '/services/it'
        },
        {
          name: 'Counseling Services',
          description: 'Mental health and wellness support',
          icon: '🧠',
          category: 'Wellness',
          url: '/services/counseling'
        },
        {
          name: 'Health Center',
          description: 'Medical care and vaccinations',
          icon: '⚕️',
          category: 'Health',
          url: '/services/health'
        },
        {
          name: 'Career Services',
          description: 'Job placement and internship assistance',
          icon: '💼',
          category: 'Career',
          url: '/services/career'
        },
        {
          name: 'Sports & Recreation',
          description: 'Fitness classes and club activities',
          icon: '⚽',
          category: 'Recreation',
          url: '/services/sports'
        },
        {
          name: 'Bookstore',
          description: 'Textbooks and campus merchandise',
          icon: '🛍️',
          category: 'Shopping',
          url: '/services/bookstore'
        },
        {
          name: 'Registrar Office',
          description: 'Academic records and registration',
          icon: '📋',
          category: 'Academic',
          url: '/services/registrar'
        }
      ]);
      console.log('Services seeded');
    }

    // Seed broadcast notification if none exist
    const notificationCount = await Notification.count();
    if (notificationCount === 0) {
      await Notification.create({
        title: 'Welcome to CampusMobi',
        message: 'Your campus portal is now ready. Explore services, manage your wallet, and stay connected!',
        type: 'INFO',
        isBroadcast: true,
        isRead: false
      });
      console.log('Welcome notification created');
    }

  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = { seedDatabase };
