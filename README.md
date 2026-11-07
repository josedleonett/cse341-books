# CSE 341 Books Web Service

Week 01 read-only Books API built with Node.js, Express, and the MongoDB
Node.js driver.

## API contract

Book documents are stored in the `cse341-books-db.books` collection and include
the required fields:

```json
{
  "id": "b1",
  "author": "Maya Rivera",
  "title": "Patterns of Light",
  "publicationDate": "2021-08-17"
}
```

MongoDB adds its own `_id`; routes use the course-required custom `id` value.

| Method | Path | Success | Not found / error |
| --- | --- | --- | --- |
| `GET` | `/books` | `200`, JSON array of books | `500`, `{"message":"Internal server error"}` |
| `GET` | `/books/:id` | `200`, matching book | `404`, `{"message":"Book not found"}`; unexpected errors return `500` with a safe message |
| `GET` | `/api-docs` | Interactive Swagger UI for the API | N/A |

`GET /` returns a JSON health message after the database connection succeeds.

## Local setup

1. Install Node.js 22 or later.
2. Install project dependencies with `npm install`.
3. Copy `.env.example` to `.env`, then set `MONGODB_URI` to your own Atlas
   connection string. Do not share or commit `.env`.
4. In MongoDB Atlas, create the `cse341-books-db` database and `books`
   collection. Insert at least three documents with string `id`, `author`,
   `title`, and ISO 8601 `publicationDate` values.
5. Start the server with `npm run dev`.
6. Try `http://127.0.0.1:3000/api-docs` to inspect and exercise the documented
   API routes. You can also try `http://127.0.0.1:3000/books`,
   `http://127.0.0.1:3000/books/b1`, and a missing id such as
   `http://127.0.0.1:3000/books/missing`.

The server connects to MongoDB before it accepts requests. Local startup stops
with a clear error if the database settings are missing or the database cannot
be reached.

## Validation

Run `npm run lint` to check the JavaScript files and `npm run swagger` to
regenerate `swagger.json` after changing routes or their OpenAPI comments. The
Week 01 assignment also requires checking both routes against the Atlas data
and, after deployment, against the Render URL.

## Deployment

Configure `MONGODB_URI` and `MONGODB_DB_NAME=cse341-books-db` as Render
environment variables. Use `npm install` as the build command and `npm start` as
the start command. Verify the list, existing-id, and missing-id responses at
the deployed URL.

## Implementation decisions

- The API looks up books by the custom `id` field (for example, `b1`) rather
  than MongoDB's generated `_id`, as required by the Week 01 specification.
- The database connection completes before Express begins listening, so the
  API does not accept requests when its required database is unavailable.
- Controllers return safe JSON errors; database details are logged server-side
  and are not included in client responses.
