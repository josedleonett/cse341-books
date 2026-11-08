# CSE 341 Books Web Service

Books and Authors API built with Node.js, Express, and the MongoDB Node.js
driver. Books reference authors through each author's custom `id`.

## API contract

Book documents are stored in the `cse341-books-db.books` collection and include
the required fields:

```json
{
  "id": "b1",
  "authorId": "a1",
  "title": "Patterns of Light",
  "publicationDate": "2021-08-17"
}
```

The referenced author is stored in `cse341-books-db.authors`. MongoDB adds its
own `_id`; routes and relationships use the course-required custom `id` value.

| Method | Path | Success | Not found / error |
| --- | --- | --- | --- |
| `GET` | `/books` | `200`, JSON array of books | `500`, `{"message":"Internal server error"}` |
| `GET` | `/books/:id` | `200`, matching book | `404`, `{"message":"Book not found"}`; unexpected errors return `500` with a safe message |
| `POST` | `/books` | `201`, created book | `400` for invalid data, duplicate ID, or unknown author; unexpected errors return `500` |
| `PUT` | `/books/:id` | `200`, updated book | `400` for invalid data or unknown author; `404` if no book matches; unexpected errors return `500` |
| `DELETE` | `/books/:id` | `204`, no response body | `404` if no book matches; unexpected errors return `500` |
| `GET` | `/api-docs` | Interactive Swagger UI for the API | N/A |

`GET /` returns a JSON health message after the database connection succeeds.

## Authors API

Author documents are stored in the `authors` collection with a unique custom
string `id`, a `name`, and a nonzero integer `birthYear`. Positive birth years
represent CE; negative values represent BCE by absolute value. MongoDB's
generated `_id` may appear in responses, but routes use the custom `id`.

| Method | Path | Success | Not found / error |
| --- | --- | --- | --- |
| `GET` | `/authors` | `200`, JSON array of authors | `500`, safe JSON error |
| `GET` | `/authors/:id` | `200`, matching author | `404`, `{"message":"Author not found"}`; unexpected errors return `500` |
| `POST` | `/authors` | `201`, created author | `400` for invalid data or duplicate custom ID; unexpected errors return `500` |
| `PUT` | `/authors/:id` | `200`, updated author | `400` for invalid data; `404` if no author matches; unexpected errors return `500` |
| `DELETE` | `/authors/:id` | `204`, no response body | `404` if no author matches; `409` if books reference the author; unexpected errors return `500` |

Use `/api-docs` to inspect and exercise the documented author routes.

## Local setup

1. Install Node.js 22 or later.
2. Install project dependencies with `npm install`.
3. Copy `.env.example` to `.env`, then set `MONGODB_URI` to your own Atlas
   connection string. Do not share or commit `.env`.
4. In MongoDB Atlas, create the `cse341-books-db` database and its `books` and
   `authors` collections. Seed author documents with custom string `id`,
   `name`, and nonzero integer `birthYear`. Seed book documents with custom
   string `id`, an `authorId` matching an existing author, `title`, and
   `publicationDate` formatted as `YYYY-MM-DD`. Migrate existing Week 01
   books by calling `PUT /books/:id` with their matching `authorId`; this
   removes the legacy `author` name field as part of the update.
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

- The API looks up books and authors by their custom `id` fields rather than
  MongoDB's generated `_id`.
- Book writes validate that `authorId` refers to an existing author.
- Authors with books cannot be deleted; the API returns `409 Conflict` and
  leaves both documents unchanged.
- The database connection completes before Express begins listening, so the
  API does not accept requests when its required database is unavailable.
- Controllers return safe JSON errors; database details are logged server-side
  and are not included in client responses.
