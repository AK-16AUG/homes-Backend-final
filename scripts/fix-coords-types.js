import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const uri = process.env.URI;
const PropertySchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
}, { strict: false });

const Property = mongoose.model('Property', PropertySchema);

async function fixTypes() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const defaultLat = 28.6300;
    const defaultLng = 77.4351;

    const allProperties = await Property.find({});
    console.log(`Processing ${allProperties.length} properties...`);

    for (const p of allProperties) {
      // If it's a string like "28.6300° N", clean it up
      let lat = p.latitude;
      let lng = p.longitude;

      if (typeof lat === 'string') {
        lat = parseFloat(lat.replace(/[^0-9.]/g, ''));
      }
      if (typeof lng === 'string') {
        lng = parseFloat(lng.replace(/[^0-9.]/g, ''));
      }

      // If it's still not a valid number, use default
      if (isNaN(lat) || !lat) lat = defaultLat;
      if (isNaN(lng) || !lng) lng = defaultLng;

      await Property.updateOne({ _id: p._id }, {
        $set: {
          latitude: lat,
          longitude: lng
        }
      });
    }

    console.log('Finished updating all properties to numeric coordinates.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

fixTypes();
