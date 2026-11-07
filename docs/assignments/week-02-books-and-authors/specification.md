# CSE 341 W02 Books and Authors API Specification

## Version 1

### Feature 1: Book CRUD Operations and Author References

#### Goal

Update the Week 01 Books API so books reference authors and support all CRUD
operations. Document every route in Swagger.

#### Data model

Book documents are stored in the `books` collection and contain:

- `id`: required custom string ID, such as `b1`
- `authorId`: required custom string ID referencing an author
- `title`: required string
- `publicationDate`: required string

Routes use the custom `id`, not MongoDB's generated `_id`.

#### Relationship

Every `authorId` must match the custom `id` of an existing author. Reject a
book create or update with `400` if its author does not exist.

#### Routes

| Method and path | Success | Errors |
| --- | --- | --- |
| `GET /books` | `200` with an array of books | `500` for an unexpected error |
| `GET /books/:id` | `200` with the matching book | `404` if the book does not exist; `500` for an unexpected error |
| `POST /books` | `201` with the created book | `400` for missing required fields, a duplicate ID, or an author that does not exist; `500` for an unexpected error |
| `PUT /books/:id` | `200` with the updated book | `400` for missing required fields or an author that does not exist; `404` if the book does not exist; `500` for an unexpected error |
| `DELETE /books/:id` | `204` with no response body | `404` if the book does not exist; `500` for an unexpected error |

#### Create request example

```json
{
  "id": "b4",
  "authorId": "a1",
  "title": "Example Book Title",
  "publicationDate": "2026-01-15"
}
```

#### Update request example

```json
{
  "authorId": "a2",
  "title": "Updated Book Title",
  "publicationDate": "2026-02-20"
}
```

### Feature 2: Author CRUD Operations

#### Goal

Create an `authors` collection and provide complete CRUD routes for authors.
Document every route in Swagger.

#### Data model

Author documents are stored in the `authors` collection and contain:

- `id`: required custom string ID, such as `a1`
- `name`: required string
- `birthYear`: required integer

Routes use the custom `id`, not MongoDB's generated `_id`.

#### Routes

| Method and path | Success | Errors |
| --- | --- | --- |
| `GET /authors` | `200` with an array of authors | `500` for an unexpected error |
| `GET /authors/:id` | `200` with the matching author | `404` if the author does not exist; `500` for an unexpected error |
| `POST /authors` | `201` with the created author | `400` for missing required fields or a duplicate ID; `500` for an unexpected error |
| `PUT /authors/:id` | `200` with the updated author | `400` for missing required fields; `404` if the author does not exist; `500` for an unexpected error |
| `DELETE /authors/:id` | `204` with no response body | `404` if the author does not exist; `409` if books still reference the author; `500` for an unexpected error |

#### Create request example

```json
{
  "id": "a4",
  "name": "Example Author",
  "birthYear": 1980
}
```

#### Update request example

```json
{
  "name": "Updated Author",
  "birthYear": 1981
}
```

## Version 2 - Implementation Specification

Version 2 clarifies validation, response bodies, update behavior, and the
representation of authors born before the common era. It is the source of truth
for implementation.

### Shared data and response rules

- Use custom string `id` values for books and authors. MongoDB's generated
  `_id` may appear in resource responses as database metadata, but it is never
  used in route parameters or relationships.
- Successful resource responses include the custom `id` and the fields listed
  for that resource.
- Required text fields must be strings containing at least one non-whitespace
  character.
- An invalid request body returns `400` with a safe JSON message.
- An unexpected server or database error returns `500` with
  `{"message":"Internal server error"}`. Log diagnostic details server-side;
  do not expose raw database errors to clients.
- Swagger documents each method, path parameter, request body, success
  response, and error response.

### Book data and relationship rules

A book has these required fields:

- `id`: nonblank string, unique among books
- `authorId`: nonblank string matching an existing author's custom `id`
- `title`: nonblank string
- `publicationDate`: a real calendar date formatted as `YYYY-MM-DD`

MongoDB stores books in `books`. A book's author is represented by `authorId`,
not an author name. Reject create or update requests with `400` when
`authorId` does not match an existing author.

### Book routes

#### `GET /books`

- Return `200` and an array of book resources.
- Return `500` on an unexpected error.

#### `GET /books/:id`

- Find the book by its custom `id`.
- Return `200` and the matching book resource.
- Return `404` with `{"message":"Book not found"}` if no book matches.
- Return `500` on an unexpected error.

#### `POST /books`

Request body:

```json
{
  "id": "b4",
  "authorId": "a1",
  "title": "Example Book Title",
  "publicationDate": "2026-01-15"
}
```

- Require all four fields and validate their types and values.
- Return `201` and the created book resource.
- Return `400` with a safe JSON message if a field is missing or invalid, the
  custom `id` already exists, or `authorId` does not match an author.
- Return `500` on an unexpected error.

#### `PUT /books/:id`

Request body:

```json
{
  "authorId": "a2",
  "title": "Updated Book Title",
  "publicationDate": "2026-02-20"
}
```

- Treat `PUT` as a complete update of the editable fields. Require and validate
  `authorId`, `title`, and `publicationDate`; the route's `id` identifies the
  book and is not part of the update body.
- Return `200` and the updated book resource.
- Return `400` with a safe JSON message if a field is missing or invalid, or
  `authorId` does not match an author.
- Return `404` with `{"message":"Book not found"}` if no book matches the
  route `id`.
- Return `500` on an unexpected error.

#### `DELETE /books/:id`

- Delete the book identified by its custom `id`.
- Return `204` with no response body when deleted.
- Return `404` with `{"message":"Book not found"}` if no book matches.
- Return `500` on an unexpected error.

### Author data and relationship rules

An author has these required fields:

- `id`: nonblank string, unique among authors
- `name`: nonblank string
- `birthYear`: nonzero integer

MongoDB stores authors in `authors`. `birthYear` uses a signed integer
convention: positive values represent years CE and negative values represent
the corresponding year BCE by absolute value. For example, `1775` is 1775 CE
and `-384` is 384 BCE. Year `0` is invalid. No other range limit is specified.

Before deleting an author, check whether any book has a matching `authorId`.
If books reference that author, do not delete the author or its books; return
`409 Conflict`.

### Author routes

#### `GET /authors`

- Return `200` and an array of author resources.
- Return `500` on an unexpected error.

#### `GET /authors/:id`

- Find the author by its custom `id`.
- Return `200` and the matching author resource.
- Return `404` with `{"message":"Author not found"}` if no author matches.
- Return `500` on an unexpected error.

#### `POST /authors`

Request body:

```json
{
  "id": "a4",
  "name": "Example Author",
  "birthYear": -384
}
```

- Require a nonblank string `id`, a nonblank string `name`, and a nonzero
  integer `birthYear`.
- Return `201` and the created author resource.
- Return `400` with a safe JSON message if a field is missing or invalid, the
  custom `id` already exists, or `birthYear` is `0`.
- Return `500` on an unexpected error.

#### `PUT /authors/:id`

Request body:

```json
{
  "name": "Updated Author",
  "birthYear": -383
}
```

- Treat `PUT` as a complete update of the editable fields. Require and validate
  `name` and `birthYear`; the route's `id` identifies the author and is not
  part of the update body.
- Return `200` and the updated author resource.
- Return `400` with a safe JSON message if a field is missing or invalid, or
  `birthYear` is `0`.
- Return `404` with `{"message":"Author not found"}` if no author matches the
  route `id`.
- Return `500` on an unexpected error.

#### `DELETE /authors/:id`

- First check that an author with the custom `id` exists.
- Return `404` with `{"message":"Author not found"}` if no author matches.
- If any book references the author, do not delete anything and return `409`
  with `{"message":"Author has books and cannot be deleted"}`.
- Otherwise, delete the author and return `204` with no response body.
- Return `500` on an unexpected error.

### Deployment and verification

- Test every route locally through `/api-docs`.
- Verify request validation, successful responses, missing-resource responses,
  relationship behavior, and documented status codes.
- After deployment, test the routes through the hosted `/api-docs` page and
  confirm the books and authors API routes work in Render.
