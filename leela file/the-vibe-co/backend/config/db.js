const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    let dbUri = process.env.MONGODB_URI;
    if (!dbUri || dbUri.trim() === '') {
      throw new Error('MONGODB_URI is empty or not provided');
    }

    // Ensure database name is present to avoid using 'test' database
    if (dbUri.includes('mongodb.net/') && dbUri.endsWith('/')) {
      dbUri += 'vibe_db';
    } else if (dbUri.includes('mongodb.net') && !dbUri.includes('mongodb.net/')) {
       dbUri += '/vibe_db';
    }

    const conn = await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 5000 
    });
    console.log(`✅ Connected to Cloud DB: ${conn.connection.host}`);
    
    // Auto-seed only if database is empty to preserve user data
    const { performSeed } = require('./seed');
    const Service = require('../models/Service');
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      console.log('🌱 Cloud Database is empty. Seeding initial data...');
      await performSeed();
    } else {
      console.log('✅ Existing Cloud data found. Skipping seed to preserve history.');
    }
  } catch (error) {
    console.log(`❌ Cloud DB connection failed: ${error.message}`);
    console.log(`Setting up local persistent storage...`);
    try {
      const path = require('path');
      const fs = require('fs');
      const dbPath = path.resolve(__dirname, '..', 'data');
      if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });

      const mongoServer = await MongoMemoryServer.create({
        instance: {
          dbPath: dbPath,
          storageEngine: 'wiredTiger',
          auth: false
        }
      });
      const mongoUri = mongoServer.getUri();
      console.log(`✅ Local Persistent DB Ready: ${mongoUri}`);
      console.log(`📁 Data stored at: ${dbPath}`);
      
      const conn = await mongoose.connect(mongoUri);
      
      // Auto-seed only if database is empty
      const { performSeed } = require('./seed');
      const Service = require('../models/Service');
      const serviceCount = await Service.countDocuments();
      if (serviceCount === 0) {
        console.log('🌱 Local Database is empty. Seeding initial data...');
        await performSeed();
      } else {
        console.log('✅ Existing Local data found. Skipping seed to preserve history.');
      }
    } catch (memError) {
      console.error(`Local Persistence Error: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
