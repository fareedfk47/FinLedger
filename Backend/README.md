# FinLedger

**FinLedger** is a banking backend REST API currently under active development, built with **Node.js, Express.js, and MongoDB**.

The project is being developed to provide a secure backend for managing users, bank accounts, deposits, withdrawals, transfers, transaction history, ledgers, and audit logs.

The core banking functionality has been implemented, and the project is currently being refined with additional validation, security improvements, testing, documentation, and production-readiness work.

> **Project Status:** 🚧 In Development
> Core backend features are implemented and the project is actively being improved.

---

## Features

### Authentication & Users

* User registration
* User login
* User logout
* JWT-based authentication
* HTTP-only authentication cookies
* Password hashing with bcryptjs
* Login rate limiting

### Account Management

* Create bank accounts
* Support for multiple accounts per user
* View user's accounts
* View account details by account number
* Account balance management
* Block accounts
* Unblock accounts
* Close accounts
* Role-based account management

### Banking Transactions

* Deposit money
* Withdraw money
* Account-to-account transfers
* Transaction history
* Account ledger
* Audit logs

### Authorization

The application uses role-based authorization for administrative operations.

* **User** — Regular banking operations
* **Manager** — User permissions + account block/unblock
* **Admin** — Manager permissions + account closing

### Security

* JWT authentication
* HTTP-only cookies
* Password hashing
* Role-based authorization
* Login rate limiting
* Helmet security headers
* CORS configuration
* Environment variables for sensitive configuration
* Audit logging
* Business-rule validation

### Email

* Email service using Nodemailer
* Registration-related email functionality

---

## Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Authentication & Security

* JSON Web Token (JWT)
* bcryptjs
* HTTP-only cookies
* Helmet
* CORS
* Express Rate Limit

### Email

* Nodemailer

### Development

* Nodemon
* Git
* GitHub
* Postman

---

## API Endpoints

Base URL:

```text
http://localhost:3000/api
```

### Authentication

| Method | Endpoint         | Access        | Description         |
| ------ | ---------------- | ------------- | ------------------- |
| POST   | `/auth/register` | Public        | Register a new user |
| POST   | `/auth/login`    | Public        | Login user          |
| POST   | `/auth/logout`   | Authenticated | Logout user         |

---

### Accounts

| Method | Endpoint                           | Access        | Description                   |
| ------ | ---------------------------------- | ------------- | ----------------------------- |
| POST   | `/accounts/`                       | Authenticated | Create a bank account         |
| GET    | `/accounts/`                       | Authenticated | Get user's accounts           |
| GET    | `/accounts/:accountNumber`         | Authenticated | Get account by account number |
| PATCH  | `/accounts/:accountNumber/block`   | Manager/Admin | Block an account              |
| PATCH  | `/accounts/:accountNumber/unblock` | Manager/Admin | Unblock an account            |
| PATCH  | `/accounts/:accountNumber/close`   | Admin         | Close an account              |

---

### Transactions

| Method | Endpoint                   | Access        | Description             |
| ------ | -------------------------- | ------------- | ----------------------- |
| POST   | `/transactions/deposit`    | Authenticated | Deposit money           |
| POST   | `/transactions/withdraw`   | Authenticated | Withdraw money          |
| POST   | `/transactions/transfer`   | Authenticated | Transfer money          |
| GET    | `/transactions/`           | Authenticated | Get transaction history |
| GET    | `/transactions/ledger`     | Authenticated | Get account ledger      |
| GET    | `/transactions/audit-logs` | Authenticated | Get user's audit logs   |

---

## Roles & Permissions

FinLedger uses role-based authorization to control access to administrative account operations.

### User

Regular users can:

* Create accounts
* View their accounts
* View account details
* Deposit money
* Withdraw money
* Transfer money
* View transactions
* View their ledger
* View their audit logs

### Manager

Managers have regular user permissions plus:

* Block accounts
* Unblock accounts

### Admin

Admins have manager permissions plus:

* Close accounts

---

## Authentication Flow

FinLedger uses **JWT-based authentication**.

After a successful login, the authentication token is stored in an **HTTP-only cookie** rather than being exposed directly to the client.

Protected requests pass through authentication middleware that:

1. Reads the authentication token.
2. Verifies the JWT.
3. Identifies the authenticated user.
4. Attaches the user information to the request.
5. Allows the request to continue to the protected route.

A simplified flow:

```text
Register
   ↓
Login
   ↓
JWT generated
   ↓
HTTP-only Cookie
   ↓
Protected API Requests
   ↓
Authentication Middleware
   ↓
Controller
```

---

## Banking Transaction Flow

The core transaction flow is structured around authenticated banking operations.

```text
Authenticated User
        │
        ├── Deposit
        │
        ├── Withdraw
        │
        └── Transfer
              │
              ↓
       Transaction Record
              │
              ↓
           Ledger
              │
              ↓
        Audit Logging
```

This structure allows transaction activity to be recorded separately from ledger and audit information.

---

## Security

Security is an important part of the project's ongoing development.

Current security measures include:

* Password hashing with bcryptjs
* JWT authentication
* HTTP-only authentication cookies
* Role-based authorization
* Login rate limiting
* Helmet security headers
* CORS configuration
* Environment variables for sensitive configuration
* Authentication middleware
* Audit logging

Security, validation, testing, and production-readiness are still being improved as development continues.

---

## Project Structure

```text
FinLedger/
│
├── src/
│   ├── config/
│   │   └── env.js
│   │
│   ├── controllers/
│   │   ├── account.controller.js
│   │   ├── auth.controller.js
│   │   └── transaction.controller.js
│   │
│   ├── db/
│   │   └── db.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   └── role.middleware.js
│   │
│   ├── models/
│   │   ├── account.model.js
│   │   ├── auditLog.model.js
│   │   ├── ledger.model.js
│   │   ├── transaction.model.js
│   │   └── user.model.js
│   │
│   ├── routes/
│   │   ├── account.routes.js
│   │   ├── auth.routes.js
│   │   └── transaction.routes.js
│   │
│   └── services/
│       ├── audit.service.js
│       └── email.service.js
│
├── .env.example
├── .gitignore
├── LICENSE
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

---

## Environment Variables

Create a `.env` file in the project root.

```env
MONGOOSE_URI=
JWT_SECRETKEY=

NODE_ENV=development
FRONTEND_URL=http://localhost:5173

CLIENT_ID=
CLIENT_SECRET=
EMAIL_USER=
```

> **Important:** Never commit your actual `.env` file or secret credentials to GitHub.

The repository contains `.env.example` for documenting the required configuration without exposing sensitive values.

---

## Installation

Clone the repository:

```bash
git clone https://github.com/fareedfk47/FinLedger.git
```

Move into the project directory:

```bash
cd FinLedger
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root and configure the required environment variables.

---

## Running the Project

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

The development server runs on:

```text
http://localhost:3000
```

---

## API Testing

The API can be tested using:

* Postman
* Insomnia
* Thunder Client

A typical authentication flow is:

```text
Register
   ↓
Login
   ↓
Authentication Cookie
   ↓
Protected API Requests
   ↓
Logout
```

---

## Current Development Status

FinLedger is **not being presented as a finished production banking platform**.

The core backend architecture and major banking operations are currently implemented. Development is continuing around areas such as:

* Additional validation
* Error handling improvements
* Automated testing
* API documentation
* Security hardening
* Production configuration
* Performance improvements
* Deployment

The project is being developed incrementally, with a focus on building and improving the backend architecture rather than treating the current version as a final production release.

---

## Future Improvements

Planned or possible improvements include:

* Automated test suite
* Swagger/OpenAPI documentation
* Refresh token implementation
* Transaction pagination
* Advanced transaction filtering
* Docker support
* CI/CD pipeline
* Production deployment
* Improved application monitoring
* More comprehensive logging

---

## Acknowledgments

* **AI Assistance:** Architectural design review and debugging assistance provided by **ChatGPT** and **Claude**.

---

## Author

**Fareed Khan**

* GitHub: https://github.com/fareedfk47
* LinkedIn: https://linkedin.com/in/fareed-khan-174141246

---

## License

This project is licensed under the MIT License.
