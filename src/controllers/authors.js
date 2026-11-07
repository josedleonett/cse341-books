import {
  authorHasBooks,
  createAuthor,
  deleteAuthor,
  getAllAuthors,
  getAuthorById,
  updateAuthor,
} from '../models/authors.js';

const hasNonblankString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

const isValidBirthYear = (value) =>
  Number.isInteger(value) && value !== 0;

const isRequestBody = (body) =>
  body !== null && typeof body === 'object' && !Array.isArray(body);

const getAuthorsHandler = async (req, res) => {
  try {
    const authors = await getAllAuthors();
    return res.status(200).json(authors);
  } catch (error) {
    console.error('GET /authors failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getAuthorByIdHandler = async (req, res) => {
  try {
    const author = await getAuthorById(req.params.id);

    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    return res.status(200).json(author);
  } catch (error) {
    console.error('GET /authors/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const createAuthorHandler = async (req, res) => {
  const { id, name, birthYear } = isRequestBody(req.body) ? req.body : {};

  if (
    !hasNonblankString(id) ||
    !hasNonblankString(name) ||
    !isValidBirthYear(birthYear)
  ) {
    return res.status(400).json({ message: 'Invalid author data' });
  }

  try {
    const existingAuthor = await getAuthorById(id);

    if (existingAuthor) {
      return res.status(400).json({ message: 'Author ID already exists' });
    }

    const author = await createAuthor({ id, name, birthYear });
    return res.status(201).json(author);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Author ID already exists' });
    }

    console.error('POST /authors failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateAuthorHandler = async (req, res) => {
  const { name, birthYear } = isRequestBody(req.body) ? req.body : {};

  if (!hasNonblankString(name) || !isValidBirthYear(birthYear)) {
    return res.status(400).json({ message: 'Invalid author data' });
  }

  try {
    const author = await updateAuthor(req.params.id, { name, birthYear });

    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    return res.status(200).json(author);
  } catch (error) {
    console.error('PUT /authors/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteAuthorHandler = async (req, res) => {
  try {
    const author = await getAuthorById(req.params.id);

    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    if (await authorHasBooks(req.params.id)) {
      return res
        .status(409)
        .json({ message: 'Author has books and cannot be deleted' });
    }

    const deleted = await deleteAuthor(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Author not found' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('DELETE /authors/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  createAuthorHandler,
  deleteAuthorHandler,
  getAuthorByIdHandler,
  getAuthorsHandler,
  updateAuthorHandler,
};
