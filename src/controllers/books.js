import {
  authorExists,
  createBook,
  deleteBook,
  getAllBooks,
  getBookById,
  updateBook,
} from '../models/books.js';

const hasNonblankString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

const isRequestBody = (body) =>
  body !== null && typeof body === 'object' && !Array.isArray(body);

const isValidPublicationDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);

  if (year < 1 || month < 1 || month > 12) {
    return false;
  }

  const leapYear =
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    leapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return day >= 1 && day <= daysInMonth[month - 1];
};

const isValidBook = (book) =>
  hasNonblankString(book.id) &&
  hasNonblankString(book.authorId) &&
  hasNonblankString(book.title) &&
  isValidPublicationDate(book.publicationDate);

const getBooksHandler = async (req, res) => {
  try {
    const books = await getAllBooks();
    return res.status(200).json(books);
  } catch (error) {
    console.error('GET /books failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getBookByIdHandler = async (req, res) => {
  try {
    const book = await getBookById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error('GET /books/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const createBookHandler = async (req, res) => {
  const book = isRequestBody(req.body) ? req.body : {};

  if (!isValidBook(book)) {
    return res.status(400).json({ message: 'Invalid book data' });
  }

  try {
    if (!(await authorExists(book.authorId))) {
      return res.status(400).json({ message: 'Author does not exist' });
    }

    if (await getBookById(book.id)) {
      return res.status(400).json({ message: 'Book ID already exists' });
    }

    const createdBook = await createBook({
      id: book.id,
      authorId: book.authorId,
      title: book.title,
      publicationDate: book.publicationDate,
    });

    return res.status(201).json(createdBook);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Book ID already exists' });
    }

    console.error('POST /books failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateBookHandler = async (req, res) => {
  const book = isRequestBody(req.body) ? req.body : {};

  if (
    !hasNonblankString(book.authorId) ||
    !hasNonblankString(book.title) ||
    !isValidPublicationDate(book.publicationDate)
  ) {
    return res.status(400).json({ message: 'Invalid book data' });
  }

  try {
    if (!(await authorExists(book.authorId))) {
      return res.status(400).json({ message: 'Author does not exist' });
    }

    const updatedBook = await updateBook(req.params.id, {
      authorId: book.authorId,
      title: book.title,
      publicationDate: book.publicationDate,
    });

    if (!updatedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(updatedBook);
  } catch (error) {
    console.error('PUT /books/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteBookHandler = async (req, res) => {
  try {
    const deleted = await deleteBook(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('DELETE /books/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  createBookHandler,
  deleteBookHandler,
  getBookByIdHandler,
  getBooksHandler,
  updateBookHandler,
};
