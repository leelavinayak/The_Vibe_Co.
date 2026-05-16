const Event = require('../models/Event');
const Service = require('../models/Service');
const User = require('../models/User');

const seedEvents = [
  {
    title: "Golden Gala Night",
    description: "An exclusive black-tie evening of luxury dining, live jazz performances, and networking with the city's elite. Experience an unforgettable night under crystal chandeliers with world-class entertainment.",
    category: "corporate",
    date: new Date("2026-07-15"),
    time: "19:00",
    venue: { name: "The Grand Ballroom", address: "123 Luxury Ave", city: "Mumbai" },
    capacity: 500,
    price: 15000,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    status: "upcoming",
    featured: true,
    tags: ["luxury", "networking", "gala"]
  },
  {
    title: "Midnight Music Festival",
    description: "A three-day music extravaganza featuring top international DJs and artists. From deep house to techno, experience music that moves your soul under the stars.",
    category: "festival",
    date: new Date("2026-08-20"),
    time: "18:00",
    venue: { name: "Sunset Arena", address: "456 Beach Road", city: "Goa" },
    capacity: 10000,
    price: 5000,
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
    status: "upcoming",
    featured: true,
    tags: ["music", "festival", "nightlife"]
  },
  {
    title: "Royal Wedding Showcase",
    description: "Discover the finest in wedding planning at our curated showcase. From couture bridal wear to exotic destinations, let us help you design your dream wedding.",
    category: "wedding",
    date: new Date("2026-06-10"),
    time: "10:00",
    venue: { name: "Palace Gardens", address: "789 Royal Lane", city: "Jaipur" },
    capacity: 300,
    price: 2000,
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
    status: "upcoming",
    featured: true,
    tags: ["wedding", "luxury", "showcase"]
  }
];

const seedServices = [
  {
    name: "Vamsi Decorations",
    type: "decoration",
    description: "WE ARE READY TO DECORATE YOUR EVENT WITH YOUR EXPECTATIONS",
    priceStartsFrom: "15000",
    features: ["Premium Floral Decor", "Themed Backgrounds", "Custom Lighting"],
    images: ["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800"],
    rating: 5,
    state: "Andhra Pradesh",
    city: "Tirupati",
    email: "kleelavinayak@gmail.com",
    phone: "123456789"
  },
  {
    name: "Elite Lens Photography",
    type: "photography",
    description: "Capturing your moments with cinematic precision. We specialize in high-end wedding and corporate event photography.",
    priceStartsFrom: "₹50,000",
    features: ["4K Video", "Drone Coverage", "Live Streaming", "Premium Albums"],
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800"],
    rating: 4.9,
    state: "Maharashtra",
    city: "Mumbai"
  },
  {
    name: "Royal Flavors Catering",
    type: "catering",
    description: "Exquisite multi-cuisine catering for grand celebrations. Our chefs craft personalized menus that delight every palate.",
    priceStartsFrom: "₹1,500",
    features: ["Live Stations", "Gourmet Menu", "Mixology", "Waiter Service"],
    images: ["https://images.unsplash.com/photo-1555244162-803834f70033?w=800"],
    rating: 4.8,
    state: "Karnataka",
    city: "Bangalore"
  },
  {
    name: "Dream Decor Stylists",
    type: "decoration",
    description: "Transforming venues into magical spaces. From floral arrangements to lighting design, we create the perfect ambiance.",
    priceStartsFrom: "₹1,00,000",
    features: ["Floral Design", "Theme Concept", "Lighting", "Stage Setup"],
    images: ["https://images.unsplash.com/photo-1511795409834-432f7b1728d2?w=800"],
    rating: 4.7,
    state: "Maharashtra",
    city: "Pune"
  },
  {
    name: "Vibe Global Organizers",
    type: "total_event_organisation",
    description: "End-to-end event management. We handle everything from planning to execution, ensuring a flawless experience.",
    priceStartsFrom: "Custom Pricing",
    features: ["Venue Selection", "Vendor Management", "Logistics", "Guest Relations"],
    images: ["https://images.unsplash.com/photo-1511578314322-379afb476865?w=800"],
    rating: 5.0,
    state: "Delhi",
    city: "New Delhi"
  }
];

const performSeed = async () => {
  try {
    // Seed Events
    await Event.deleteMany({});
    await Event.insertMany(seedEvents);
    console.log('✅ Events seeded successfully!');

    // Seed Services
    await Service.deleteMany({});
    await Service.insertMany(seedServices);
    console.log('✅ Services seeded successfully!');

    // Seed Admin (Fixed ID to prevent session loss on restart)
    const adminEmail = process.env.ADMIN_EMAIL || 'kleelavinayak@gmail.com';
    const adminId = "60d5ec49f3e5b30015f606a1"; // Fixed ID
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        _id: adminId,
        name: 'Vibe Admin',
        email: adminEmail,
        password: 'adminpassword123',
        role: 'admin'
      });
      console.log('✅ Admin user created with fixed ID: kleelavinayak@gmail.com / adminpassword123');
    } else {
      adminExists.role = 'admin';
      await adminExists.save();
    }
    return true;
  } catch (error) {
    console.error('❌ Seeding error:', error);
    return false;
  }
};

const seedDB = async () => {
  const mongoose = require('mongoose');
  const { MongoMemoryServer } = require('mongodb-memory-server');
  require('dotenv').config();

  let mongoUri = process.env.MONGODB_URI;

  try {
    console.log('Connecting to DB for seeding...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  } catch (error) {
    console.log('Local DB failed for seeding, using memory server...');
    const mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  }

  await performSeed();
  process.exit(0);
};

module.exports = { seedEvents, seedServices, seedDB, performSeed };

if (require.main === module) {
  seedDB();
}
