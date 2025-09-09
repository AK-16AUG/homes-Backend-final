import cluster from 'cluster';
import os from 'os';
import dbConnect from './db/db.connect.js';
import app from './app.js';
import dotenv from "dotenv";

dotenv.config();

const PORT: number = parseInt(process.env.PORT || "3000", 10);
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary PID: ${process.pid}`);
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Restart workers if they die
  cluster.on('exit', (worker, code, signal) => {
    console.warn(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });

} else {
  dbConnect().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Worker ${process.pid}: Server running on http://0.0.0.0:${PORT}`);
      console.log(`Swagger docs at http://0.0.0.0:${PORT}/api/docs`);
    });
  }).catch((error: Error) => {
    console.error("Database connection failed", error);
  });
}
