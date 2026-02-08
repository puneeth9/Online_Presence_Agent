require('dotenv').config();

const app = require('./app');
const { connectDB, closeDB } = require('./db');
const { runMigrations } = require('./db/migrate');

const PORT = process.env.PORT || 4000;

let server;

async function startServer() {
  try {
    await connectDB();
    await runMigrations();

    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

async function shutdown(signal) {
  try {
    console.log(`Shutting down (${signal})`);

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }

    await closeDB();
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown');
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
