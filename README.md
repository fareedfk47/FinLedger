# FinLedger — Full-Stack Banking Management System

**FinLedger** is a full-stack banking management system and double-entry financial ledger platform, built with **Node.js, Express.js, MongoDB, React, Vite, Redux Toolkit, and Tailwind CSS**.

The project provides an end-to-end banking application featuring authenticated sessions, multi-account management (Savings & Current), instant deposits, cash withdrawals, account-to-account funds transfers, double-entry ledger bookkeeping, and immutable security audit trails.

The user interface was crafted using **Stitch** (following the *Sovereign Ledger* fintech design system) and engineered into modular React components, with debugging and architectural assistance from **ChatGPT** and **Claude**.

> **Project Status:** 🚀 Live in Production  
> 🌐 **Live Web Application:** [https://fin-ledger-kappa.vercel.app](https://fin-ledger-kappa.vercel.app)  
> ⚙️ **Backend REST API:** [https://finledger-1-6qag.onrender.com](https://finledger-1-6qag.onrender.com)  
> 🩺 **API Health Check:** [https://finledger-1-6qag.onrender.com/api/health](https://finledger-1-6qag.onrender.com/api/health)

---

## Architecture Overview

FinLedger is organized as a clean multi-package workspace:

```text
FinLedger/
├── Backend/          # Node.js + Express REST API with MongoDB & Mongoose
├── Frontend/         # React 19 + Vite SPA with Redux Toolkit & Tailwind CSS
└── README.md         # Repository root overview
```

---

## Features

### Authentication & Security
* User registration and login with input validation
* JWT authentication with **HTTP-only secure cookies** (no client-side token exposure)
* Password hashing with bcryptjs
* Login rate limiting (5 failed attempts trigger lockout window)
* Helmet security headers and CORS protection
* Protected frontend routes and session hydration

### Account Management
* Multi-account support per user (Savings and Current Checking accounts)
* Automated account number generation
* Balance tracking with strict non-negative constraints
* Privacy-first account masking (`•••• 1234`) with click-to-reveal and clipboard copy
* Role-based administration (User, Manager, Admin) for account block/unblock/close operations

### Transactions & Ledger
* **Instant Deposits**: Account balance top-ups with immediate ledger crediting
* **Withdrawals**: Balance checks with overdraft prevention
* **Account-to-Account Transfers**: Atomic balance debit and credit across accounts
* **Cryptographic Idempotency**: Auto-generated UUID `Idempotency-Key` headers on all mutating operations to prevent double-charges
* **Double-Entry Financial Ledger**: Immutable trail recording transaction references, credit/debit classifications, and running balances
* **Security Audit Trail**: Logs critical user events (logins, account creations, transfers) with timestamps and event descriptions

---

## Tech Stack

### Frontend
* **Core:** React 19, Vite
* **Routing:** React Router v7
* **State Management:** Redux Toolkit, React-Redux
* **HTTP Client:** Axios (with cookie credentials and response interceptors)
* **Styling:** Tailwind CSS v4, Inter font, Google Material Symbols Outlined
* **UI/UX Design:** Designed with **Stitch** (*Sovereign Ledger* design system)

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB Atlas with Mongoose ODM
* **Security & Auth:** JSON Web Tokens (JWT), bcryptjs, cookie-parser, Helmet, Express Rate Limit
* **Email Service:** Nodemailer

### Tooling & AI Assistance
* **Design System:** Stitch
* **AI Debugging & Pair Programming:** ChatGPT & Claude
* **API Testing:** Postman & Thunder Client
* **Version Control:** Git, GitHub

---

## Repository Structure

```text
FinLedger/
│
├── Backend/
│   ├── src/
│   │   ├── config/          # Environment configuration
│   │   ├── controllers/     # Route logic (auth, accounts, transactions)
│   │   ├── db/              # MongoDB connection
│   │   ├── middlewares/     # JWT auth, rate limiter, role authorization
│   │   ├── models/          # User, Account, Transaction, Ledger, AuditLog
│   │   ├── routes/          # Express route definitions
│   │   └── services/        # Audit logging, email services
│   ├── package.json
│   ├── README.md            # Detailed Backend API documentation
│   └── server.js            # Express server entry point
│
├── Frontend/
│   ├── src/
│   │   ├── components/      # UI elements (TopBar, BottomNav, Badges, Modals)
│   │   ├── layouts/         # AppLayout shell
│   │   ├── pages/           # Dashboard, Accounts, Details, Transfer, Ledger, Profile
│   │   ├── routes/          # ProtectedRoute, PublicOnlyRoute, AppRoutes
│   │   ├── services/        # Axios API service layer (auth, accounts, transactions)
│   │   ├── store/           # Redux store (authSlice, accountsSlice)
│   │   └── utils/           # Formatters (INR currency, dates, account masks)
│   ├── package.json
│   ├── README.md            # Detailed Frontend documentation
│   └── vite.config.js       # Vite configuration with reverse proxy
│
└── README.md
```

---

## Quick Start

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm**
* **MongoDB** (local instance or MongoDB Atlas cluster)

### 1. Clone the Repository

```bash
git clone https://github.com/fareedfk47/FinLedger.git
cd FinLedger
```

### 2. Setup the Backend

```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/` (see `Backend/.env.example` for reference):

```env
MONGOOSE_URI=your_mongodb_connection_string
JWT_SECRETKEY=your_secret_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Start the backend development server:

```bash
npm run dev
# Backend server runs on http://localhost:3000
```

### 3. Setup the Frontend

Open a new terminal window:

```bash
cd Frontend
npm install
npm run dev
# Frontend dev server runs on http://localhost:5173
```

Open your browser and navigate to `http://localhost:5173`.

---

## Acknowledgments & Design Attribution

* **UI/UX Design**: Built using the **Stitch** design system (*Sovereign Ledger* mobile-first banking dashboard).
* **AI Debugging & Development**: Developed with pair programming and debugging assistance from **ChatGPT** and **Claude**.

---

## Author

**Fareed Khan**
* GitHub: [https://github.com/fareedfk47](https://github.com/fareedfk47)
* LinkedIn: [https://linkedin.com/in/fareed-khan-174141246](https://linkedin.com/in/fareed-khan-174141246)

---

## License

This project is licensed under the MIT License.
