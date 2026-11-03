import { MongoClient } from 'mongodb';

let client;
let db;

const connectToDb = async () => {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME;

  if (!uri || !dbName) {
    throw new Error('MONGODB_URI and MONGODB_DB_NAME must be defined.');
  }

  const mongoClient = new MongoClient(uri);
  await mongoClient.connect();

  client = mongoClient;
  db = client.db(dbName);

  return db;
};

const getDb = () => {
  if (!db) {
    throw new Error('Database is not connected.');
  }

  return db;
};

export { connectToDb, getDb };
