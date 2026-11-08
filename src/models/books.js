import { getDb } from '../db/connect.js';

const getAllBooks = async () => {
  const db = getDb();
  const collection = db.collection('books');
  const books = await collection.find({}).toArray();
  return books;
};

const getBookById = async (id) => {
  const db = getDb();
  const collection = db.collection('books');
  const book = await collection.findOne({ id });
  return book;
};

const createBook = async (book) => {
  const db = getDb();
  const collection = db.collection('books');
  await collection.createIndex({ id: 1 }, { unique: true });
  await collection.insertOne(book);
  return collection.findOne({ id: book.id });
};

const updateBook = async (id, book) => {
  const db = getDb();
  const collection = db.collection('books');
  const result = await collection.updateOne(
    { id },
    { $set: book, $unset: { author: '' } },
  );

  if (result.matchedCount === 0) {
    return null;
  }

  return collection.findOne({ id });
};

const deleteBook = async (id) => {
  const db = getDb();
  const collection = db.collection('books');
  const result = await collection.deleteOne({ id });
  return result.deletedCount > 0;
};

const authorExists = async (id) => {
  const db = getDb();
  const collection = db.collection('authors');
  const author = await collection.findOne({ id });
  return Boolean(author);
};

export {
  authorExists,
  createBook,
  deleteBook,
  getAllBooks,
  getBookById,
  updateBook,
};
