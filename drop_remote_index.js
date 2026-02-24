// drop_remote_index.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.argv[2] || process.env.URI;

if (!uri) {
    console.error("Please provide a MongoDB URI as an argument or set URI in .env");
    process.exit(1);
}

async function dropIndex() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB successfully.');

        const db = mongoose.connection.db;

        // Check indexes on properties collection
        const indexes = await db.collection('properties').indexes();
        console.log('Current indexes on properties collection:');
        indexes.forEach(idx => console.log(` - ${idx.name}`));

        // Drop the property_name index if it exists
        const hasPropertyNameIndex = indexes.some(i => i.name === 'property_name_1');
        if (hasPropertyNameIndex) {
            console.log('Found property_name_1 index. Dropping it now...');
            await db.collection('properties').dropIndex('property_name_1');
            console.log('✅ Successfully dropped index property_name_1');
        } else {
            console.log('✅ No property_name_1 index found. You are good to go!');
        }

    } catch (err) {
        if (err.code === 27) {
            console.log('✅ Index property_name_1 not found. You are good to go!');
        } else {
            console.error('❌ Error:', err);
        }
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

dropIndex();
