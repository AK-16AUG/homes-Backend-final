import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Define Mongoose schema
const societySchema = new mongoose.Schema({
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true }
});

const Society = mongoose.model('Society', societySchema);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'Noida.json');
const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// Transform Overpass-style JSON to { name, lat, lon }
const seedData = rawData.elements
  .filter((item: any) => item.tags?.name && (item.lat || item.center?.lat))
  .map((item: any) => ({
    name: item.tags.name,
    lat: item.lat || item.center?.lat,
    lon: item.lon || item.center?.lon
  }));

// Seed MongoDB
async function seed() {
  try {
    const mongoUri = 'mongodb://127.0.0.1:27017/testdatabase';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');

    // await Society.deleteMany({});
    // console.log('🧹 Old data deleted');

    await Society.insertMany(seedData);
    console.log(`✅ Inserted ${seedData.length} records`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();
