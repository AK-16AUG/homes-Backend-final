import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const uri = process.env.URI;
const PropertySchema = new mongoose.Schema({
  latitude: String,
  longitude: String,
  property_name: String
}, { strict: false });

const Property = mongoose.model('Property', PropertySchema);

async function checkAll() {
  try {
    await mongoose.connect(uri);
    const properties = await Property.find({});
    console.log(`Total properties: ${properties.length}`);
    properties.forEach(p => {
      console.log(`ID: ${p._id}, Name: ${p.property_name}, Lat: "${p.latitude}", Lng: "${p.longitude}"`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkAll();
