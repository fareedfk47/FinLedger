# FinLedger Frontend

**FinLedger Frontend** is a modern, production-style banking client application built with **React, Vite, Redux Toolkit, React Router, Axios, and Tailwind CSS**.

The interface is modeled after the **Stitch** *Sovereign Ledger* fintech design system, delivering a clean banking experience with mobile-first navigation, tabular figures for financial accuracy, animated status feedback, and zero mock data.

Development, component architecture, and bug resolution were refined with technical and debugging assistance from **ChatGPT** and **Claude**.

> **Project Status:** 🚀 Live in Production  
> 🌐 **Live Web Application:** [https://fin-ledger-kappa.vercel.app](https://fin-ledger-kappa.vercel.app)  
> ⚙️ **Connected API:** [https://finledger-1-6qag.onrender.com/api](https://finledger-1-6qag.onrender.com/api)

---

## Features

### Authentication & Session Management
* **Secure Cookie Authentication**: Communicates with the backend using HTTP-only cookies (`withCredentials: true`), completely shielding JWT tokens from JavaScript execution (XSS protection).
* **Automatic Session Hydration**: On mount, `AuthInitializer` queries `GET /api/accounts` to verify cookie validity and hydrate the Redux store with user and account states.
* **Route Guards**:
  * `ProtectedRoute`: Blocks unauthenticated users and redirects to `/login`.
  * `PublicOnlyRoute`: Prevents authenticated users from viewing `/login` or `/register` by redirecting to `/dashboard`.
* **Form Validation**: In-line validation, match checking on passwords, and clear API error messages.

### Dashboard (`/dashboard`)
* **Dynamic Net Balance**: Aggregates balances across all linked accounts in real time.
* **Privacy Toggle**: One-click toggle to mask or unmask all financial figures.
* **Account Breakdown Pills**: Live balances for Savings and Current accounts.
* **Quick Actions**: One-tap access to Deposit, Withdraw, Transfer, and Ledger.
* **Linked Accounts Grid**: Account summary cards with status chips and masked numbers.
* **Recent Activity**: Live feed of the last 5 transactions with color-coded credit/debit indicators.

### Bank Accounts (`/accounts` & `/accounts/:accountNumber`)
* **Liquidity Summary**: Overview of total liquidity across active accounts.
* **Account Cards**: Details account type, currency, balance, status badge, and masked numbers with clipboard copy.
* **Open New Account Modal**: Create new Savings or Current accounts directly from the UI.
* **Account Details & Management**:
  * Individual account breakdown with historical timestamps.
  * Interactive **Deposit** and **Withdrawal** action cards.
  * Quick amount buttons (+₹500, +₹1,000, +₹5,000, etc.).
  * Automatic balance updates and toast feedback upon settlement.

### Funds Transfer (`/transfer`)
* **3-Step Structured Wizard**:
  1. *Source Selection*: Choose from user's active accounts with real-time balance checks.
  2. *Beneficiary Details*: Recipient account input with live confirmation match detection and optional rapid transfer between user's own accounts.
  3. *Transfer Amount & Memo*: Overdraft prevention check before submission.
* **Cryptographic Idempotency**: Automatically generates a unique UUID `Idempotency-Key` header on every request to prevent double-charges.
* **Settlement Receipt Modal**: Displays transaction reference ID, sender/recipient masks, and settlement confirmation.

### Financial Ledger (`/ledger`)
* **Double-Entry Financial Statement**: Running transaction audit trail.
* **Telemetry Metric Cards**: Calculates total page Inflow (credits), Outflow (debits), and Net Variance.
* **Search & Filters**: Search by reference ID or description, with one-click pills for Credits Only and Debits Only.
* **Pagination**: Server-side pagination controls (limit 10 per page).

### Transaction History (`/transactions`)
* Complete chronological transaction list.
* Filter by transaction type: All, Deposit, Withdraw, and Transfer.
* Search by description or transaction ID.
* Semantic type badges and balance-after readouts.

### Profile & Security (`/profile`)
* **User Identity**: Account holder name, verified email, and initials avatar.
* **Session Health**: Real-time authentication status indicators.
* **Immutable Audit Trail**: Live view of security events (logins, account creations, transfers) fetched directly from the backend audit log.
* **Secure Logout**: Invalidates the HTTP-only cookie on the backend, clears Redux store, and redirects to the login screen.

---

## Tech Stack

### Core Framework
* **React 19**
* **Vite 8**
* **React Router v7**

### State Management
* **Redux Toolkit (`@reduxjs/toolkit`)**: Global state for `auth` and `accounts`.
* **React Redux**: Typed state bindings and dispatchers.

### Networking
* **Axios**: Configured instance with `withCredentials: true`, automated reverse proxy routing, and 401 response interceptors.

### Styling & Design System
* **Tailwind CSS v4** (using `@tailwindcss/vite`)
* **Inter Font** (Google Fonts)
* **Material Symbols Outlined** (Google Icons)
* **Custom Theme Tokens**: Sovereign Ledger color hierarchy (Primary `#0037b0`, Surface `#f9f9ff`, Tertiary `#004f35`, Error `#ba1a1a`).
* **Tabular Figures**: `tabular-nums` enforced on all monetary displays.

### Design & AI Tooling
* **Stitch**: Source of truth for UI/UX layouts, color tokens, and dashboard hierarchy.
* **ChatGPT & Claude**: Pair programming, component design, and bug diagnosis.

---

## State Management Architecture

```text
Redux Store (store/index.js)
├── authSlice
│   ├── user: { id, name, email }
│   ├── isAuthenticated: boolean
│   └── isLoading: boolean
└── accountsSlice
    ├── accounts: Account[]
    ├── isLoading: boolean
    └── error: string | null
```

* **Local Component State**: Ephemeral UI state (search inputs, active tabs, modals, reveal toggles, toast notifications) stays in component state to avoid unnecessary global overhead.
* **Shared State**: Only cross-cutting data (the logged-in user profile and the active accounts array) is housed in Redux.

---

## Project Structure

```text
Frontend/
├── public/
│   └── favicon.svg           # Custom FinLedger banking emblem favicon
├── src/
│   ├── components/
│   │   ├── AuthInitializer.jsx  # App-mount session checker
│   │   └── ui/
│   │       ├── BottomTabBar.jsx # Mobile-first bottom tab navigation
│   │       ├── EmptyState.jsx   # List empty states
│   │       ├── Pagination.jsx   # Page navigation controls
│   │       ├── Spinner.jsx      # Loading spinners
│   │       ├── StatusBadge.jsx  # Active/Blocked/Closed chips
│   │       ├── Toast.jsx        # Notification alert
│   │       ├── TopBar.jsx       # Fixed top header
│   │       ├── TransactionBadge.jsx
│   │       └── useToast.jsx     # Toast hook
│   ├── layouts/
│   │   └── AppLayout.jsx        # Authenticated page layout shell
│   ├── pages/
│   │   ├── accounts/
│   │   │   ├── AccountDetails.jsx
│   │   │   └── Accounts.jsx
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── dashboard/
│   │   │   └── Dashboard.jsx
│   │   ├── ledger/
│   │   │   └── Ledger.jsx
│   │   ├── profile/
│   │   │   └── Profile.jsx
│   │   └── transactions/
│   │       ├── Transactions.jsx
│   │       └── Transfer.jsx
│   ├── routes/
│   │   ├── AppRoutes.jsx        # Route tree
│   │   ├── ProtectedRoute.jsx   # Unauthenticated guard
│   │   └── PublicOnlyRoute.jsx  # Authenticated guard
│   ├── services/
│   │   ├── accountService.js    # /api/accounts API calls
│   │   ├── authService.js       # /api/auth API calls
│   │   ├── axiosInstance.js     # Axios client configuration
│   │   └── transactionService.js# /api/transactions API calls
│   ├── store/
│   │   ├── accountsSlice.js
│   │   ├── authSlice.js
│   │   └── index.js
│   ├── utils/
│   │   └── formatters.js        # Currency (INR), dates, account masking
│   ├── App.jsx
│   ├── index.css                # Tailwind directives & design tokens
│   └── main.jsx                 # Provider setup & DOM root
├── index.html                   # HTML entry with font preconnects
├── package.json
└── vite.config.js               # Dev server reverse proxy configuration
```

---

## Getting Started

### 1. Install Dependencies

```bash
cd Frontend
npm install
```

### 2. Run the Development Server

Make sure the backend server is running on `http://localhost:3000`.

```bash
npm run dev
```

The application will be accessible at:

```text
http://localhost:5173
```

All requests to `/api/*` are automatically forwarded to the backend via Vite's development proxy.

### 3. Build for Production

```bash
npm run build
```

Production assets are compiled into the `dist/` directory.

### 4. Code Quality & Linting

```bash
npm run lint
```

---

## Acknowledgments

* **UI Design:** Designed using **Stitch** (*Sovereign Ledger* fintech design system).
* **AI Assistance:** Architectural assistance and debugging provided by **ChatGPT** and **Claude**.

---

## Author

**Fareed Khan**
* GitHub: [https://github.com/fareedfk47](https://github.com/fareedfk47)
* LinkedIn: [https://linkedin.com/in/fareed-khan-174141246](https://linkedin.com/in/fareed-khan-174141246)

---

## License

This project is licensed under the MIT License.
