
Books minimal NestJS solution (in-memory)
----------------------------------------

How to use (Windows PowerShell):

1) Move to folder:
   cd <path-to-extracted-folder>/books_complete_solution

2) Install dependencies:
   npm install

3) Run tests:
   npm run test

4) Run server:
   npm run start:dev
   -> open http://localhost:3000

Endpoints:
- POST /books
- GET /books?q=&conStock=1&page=1&limit=10
- GET /books/:id
- PATCH /books/:id
- DELETE /books/:id  (returns 204 No Content)

Notes:
- This implementation uses in-memory storage (no DB) so it's easy to run locally.
- Tests include unit-like tests and e2e tests using Supertest.
- Use Thunder Client collection included to demo the endpoints.
