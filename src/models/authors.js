import { getDb } from '../db/connect.js';

const getAllAuthors = async () => {
  const db = getDb();
  const collection = db.collection('authors');
  const authors = await collection.find({}).toArray();
  return authors;
};

const getAuthorById = async (id) => {
  const db = getDb();
  const collection = db.collection('authors');
  const author = await collection.findOne({ id });
  return author;
};

const createAuthor = async (author) => {
  const db = getDb();
  const collection = db.collection('authors');
  await collection.createIndex({ id: 1 }, { unique: true });
  await collection.insertOne(author);
  return collection.findOne({ id: author.id });
};

const updateAuthor = async (id, author) => {
  const db = getDb();
  const collection = db.collection('authors');
  const result = await collection.updateOne({ id }, { $set: author });

  if (result.matchedCount === 0) {
    return null;
  }

  return collection.findOne({ id });
};

const deleteAuthor = async (id) => {
  const db = getDb();
  const collection = db.collection('authors');
  const result = await collection.deleteOne({ id });
  return result.deletedCount > 0;
};

const authorHasBooks = async (id) => {
  const db = getDb();
  const collection = db.collection('books');
  const count = await collection.countDocuments({ authorId: id });
  return count > 0;
};

export {
  authorHasBooks,
  createAuthor,
  deleteAuthor,
  getAllAuthors,
  getAuthorById,
  updateAuthor,
};
