# Backend Developer Home Assessment

A REST API built with [NestJS](https://nestjs.com/) and TypeORM, backed by SQL. It provides JWT authentication and a CRUD API for streaming resources.

## Key Decisions
- SQLite with syncing was chosen for simplicity, a real production setup would require migration scripts and a more performant database such as PostgreSQL
- Hand-rolled JWT auth with stateless tokens. this is very straightforward and requires no additional third party dependencies. However, it requires setup and maintenance compared to using an auth library
- vitest was used over jest, because it is the built in solution for this version of NestJS migrating to different testing frameworks should be pretty straightforward


## Tech stack

- **NestJS 12** (Node.js)
- **TypeORM** with `better-sqlite3`
- **@nestjs/jwt** for authentication
- **bcrypt** for password hashing
- **class-validator / class-transformer** for DTO validation
- **@nestjs/swagger** for API docs

## Prerequisites

- Node.js 20+
- npm

## Getting started

```bash
# install dependencies
npm install

# start in development mode 
./start.sh
```

The server starts on http://localhost:3000 by default. Swagger docs are available at http://localhost:3000/docs.

## Auth Flow
- Register account using the /auth/register endpoint
- Log in using the /auth/login endpoint with your credentials
- Store the bearer token to use in the API 

## Tests
- `npm run test` — unit tests (guard, controller).
- `npm run test:e2e` — integration tests covering auth and the streaming CRUD, run against an in-memory SQLite database.

## UI
The UI is the swagger page. You acquire a token using the auth flow above and store the token using the Authorize button. You can then test the endpoints out

# Bug Fix Documentation
## Auth Guard Fix
- The auth guard failed to validate the Auth Header for malformed input, causing a crash on empty or invalid auth headers
- secret was hardcoded in plain text in the source code, rather than in an enviroment variable
- the error from the jwtService.verify method call is caught and logged on the server, however the server does not return false or throw the error to stop the client

## Performance issue in streaming API
The endpoint fetched all rows from the database and looped over them in memory. This is problematic at very large row counts (O(n) complexity), filtering directly in the ORM/SQL layer is more efficient

## Scripts

| Script          | Description                          |
| --------------- | ------------------------------------ |
| `npm run build` | Compile the project to `dist/`       |
| `npm start`     | Run the compiled app                  |
| `npm run start:dev` | Run with hot reload               |
| `npm run test`  | Run unit tests (Vitest)              |
| `npm run test:e2e` | Run integration tests (Vitest)    |
| `npm run lint`  | Lint with oxlint                     |

## Environment variables

| Variable        | Default            | Description                        |
| --------------- | ------------------ | ---------------------------------- |
| `PORT`          | `3000`             | HTTP port                          |
| `JWT_SECRET`    | `your-secret-key`  | Secret used to sign JWTs           |
| `DATABASE_PATH` | `database.sqlite`  | SQLite database file path          |

