# Contacts Backend API

A small REST API built with Node.js, Express, and Mongoose to manage a simple Contact resource, supporting CRUD operations with features like soft deletion, pagination, and data validation.
## Demo Video
Watch the project demo here: [Contacts API Demo](https://drive.google.com/file/d/1HIrXdJYoyreTzzELJb5LT0XlZOk7r5So/view?usp=sharing)

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

* Node.js 
* MongoDB Atlas or a local MongoDB instance

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Anand14001/contacts-api.git
    cd contacts-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a file named **`.env`** in the root directory and add your MongoDB connection strings. The provided connection strings are placeholders and should be replaced with your actual values.

    ```
    MONGO_URI="your_main_mongodb_connection_string"
    TEST_MONGO_URI="your_test_mongodb_connection_string"
    ```

### Running the Application

| Script | Command | Description |
| :--- | :--- | :--- |
| **Development** | `npm run dev` | Starts the server in watch mode for development (uses `index.js`). |
| **Production** | `npm start` | Starts the server for production (uses `index.js`). |
| **Seeding Data** | `node mongo.js` | Connects to the main database (`MONGO_URI`), clears existing data, and seeds the initial set of contacts. |
| **Testing** | `npm test` | Runs the unit tests using `node:test` and `supertest` (uses `index.test.js` against `TEST_MONGO_URI`). |

The server will typically run on port `3001` unless configured otherwise.

## Design and Architectural Choices

This project uses a standard **Express** setup with **Mongoose** for interacting with MongoDB.

### 1. Database and Environment

* **Separate Database for Testing:** The configuration uses `process.env.NODE_ENV` to switch between a main database (`MONGO_URI`) and a dedicated test database (`TEST_MONGO_URI`). This ensures tests are run in an isolated environment without affecting live data.
* **Mongoose Schema:** The `contacts.js` model includes validation for `required` fields (`name`, `email`, `phone`) and enforces `unique` constraints on `email` and `phone`. It also converts `email` to lowercase and trims whitespace for consistency.

### 2. Soft Deletion (DELETE /api/contacts/:id)

* Instead of permanently removing data, the `DELETE` endpoint implements **soft deletion**.
* The schema includes `isDeleted: { type: Boolean, default: false }` and `deletedAt: { type: Date }`.
* The `DELETE` route sets `isDeleted` to `true` and records the `deletedAt` timestamp.
* **Crucially, the `GET /api/contacts` endpoint filters out all contacts where `isDeleted` is `true`** using the query: `{ isDeleted: { $ne: true } }`. This makes soft-deleted contacts invisible to the main list endpoint.

### 3. Error Handling

* **Specific Status Codes:** The API returns standard HTTP status codes:
    * `200 OK` for success (GET, PUT, DELETE).
    * `201 Created` for successful resource creation (POST).
    * `400 Bad Request` for client-side errors like invalid Mongoose IDs or missing required fields.
    * `404 Not Found` when an ID doesn't correspond to an existing resource.
    * `409 Conflict` (HTTP 409) for duplicate key errors (e.g., trying to create a contact with an existing email/phone).
    * `500 Internal Server Error` for unexpected server issues.
* **Centralized Duplicate Key Handling:** The `POST` and `PUT` routes explicitly check for the Mongoose/MongoDB duplicate key error code (`11000`) to return a more informative `409 Conflict` error.

### 4. Pagination (GET /api/contacts)

* The list endpoint supports optional query parameters: `page` (default 1) and `limit` (default 10).
* It calculates the total number of non-deleted contacts and total pages, returning them in a `metadata` object alongside the paginated `contacts` array. This is essential for frontend clients to build pagination UI.

## 📄 API Specification

The base URL for all contact operations is `/api/contacts`.

| Method | Endpoint | Description | Query/Body | Success Status | Error Statuses |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/` | Creates a new contact. | `{"name": "...", "email": "...", "phone": "..."}` | `201 Created` | `400 Bad Request`, `409 Conflict` |
| **GET** | `/` | Lists all non-deleted contacts. | Optional: `?page=1&limit=10` | `200 OK` | `500 Internal Server Error` |
| **GET** | `/:id` | Retrieves a single contact by ID. | Path parameter `id` | `200 OK` | `400 Bad Request`, `404 Not Found` |
| **PUT** | `/:id` | Updates an existing contact. | Path parameter `id`. Body: `{"name": "...", "email": "...", "phone": "..."}` | `200 OK` | `400 Bad Request`, `404 Not Found`, `409 Conflict` |
| **DELETE** | `/:id` | Soft-deletes a contact. | Path parameter `id` | `200 OK` | `400 Bad Request`, `404 Not Found` |

---

## Unit Tests

The API includes comprehensive unit tests in `index.test.js` using the built-in Node.js test runner (`node:test`) and `supertest` for making HTTP requests. The tests cover:

* Fetching all contacts with correct length and metadata.
* Fetching a specific contact and handling non-existent/invalid IDs.
* Creating a valid contact and handling missing fields/duplicate emails.
* Updating a contact and handling non-existent/duplicate emails.
* Soft-deleting a contact and verifying the `isDeleted` flag is set.

To run the tests:

```bash
npm test