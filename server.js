import app from './app.js';
import { connectToDb } from './src/db/connect.js';

const PORT = process.env.PORT;

if (!PORT) {
  throw new Error(
    'PORT is not defined. Add it to .env for local development or configure it in the hosted environment.',
  );
}

const startServer = async () => {
  try {
    await connectToDb();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

await startServer();
