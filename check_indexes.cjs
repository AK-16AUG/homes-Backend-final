const mongoose = require("mongoose");

const URI = "mongodb+srv://anujkumar2632001:Y2p9OxCuz5lTPBVO@motherhomes.1oud5vb.mongodb.net/?retryWrites=true&w=majority&appName=motherhomes";

async function main() {
    await mongoose.connect(URI);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const hasProperties = collections.some(c => c.name === "properties");

    if (hasProperties) {
        const indexes = await db.collection("properties").indexes();
        console.log("Indexes on 'properties' collection:");
        console.log(JSON.stringify(indexes, null, 2));

        // Wait, let's drop property_name unique index if it exists
        for (let idx of indexes) {
            if (idx.unique && idx.name !== "_id_") {
                console.log("Found unique index:", idx.name);
                if (idx.key.property_name || idx.key.flat_no) {
                    console.log("Dropping index:", idx.name);
                    await db.collection("properties").dropIndex(idx.name);
                }
            }
        }
    } else {
        console.log("Collection 'properties' does not exist.");
    }

    process.exit(0);
}

main().catch(console.error);
