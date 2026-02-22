import app from "../src/app.js";
import dbConnect from "../src/db/db.connect.js";
import dotenv from "dotenv";

dotenv.config();

dbConnect().catch(err => {
    console.error("Database connection failed during initialization:", err);
});

export default app;
