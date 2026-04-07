const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('./models/serviceModel');

dotenv.config();

const services = [
    {
        name: 'Basic Exterior Wash',
        description: 'Comprehensive exterior hand wash, wheel cleaning, and tire shine. Perfect for a quick refresh.',
        price: 50,
        duration: 45,
        category: 'exterior'
    },
    {
        name: 'Interior Deep Clean',
        description: 'Complete interior vacuum, steam cleaning of carpets and upholstery, leather conditioning, and dash protection.',
        price: 120,
        duration: 90,
        category: 'interior'
    },
    {
        name: 'Full Detail Pro',
        description: 'Our signature service. Exterior clay bar treatment, wax, stage 1 polish, and a deep interior revitalization.',
        price: 250,
        duration: 180,
        category: 'full-detail'
    },
    {
        name: 'Ceramic Coating Shield',
        description: 'Ultra-durable 2-year ceramic coating. Superior gloss and hydrophobic protection against the elements.',
        price: 450,
        duration: 240,
        category: 'ceramic-coating'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing services
        await Service.deleteMany();
        console.log('Cleared existing services.');

        // Insert new services
        await Service.insertMany(services);
        console.log('Successfully seeded 4 services!');

        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedDB();
