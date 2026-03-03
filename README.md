# 💰 Smart Expense Tracker

A full-stack web application to manage personal finances — track income, expenses, set budgets, and visualize spending patterns with interactive charts.

---

## 🌟 Features

- 🔐 **JWT Authentication** — Secure register & login
- 💳 **Transaction Management** — Add, edit, delete income & expenses
- 📊 **Interactive Charts** — Bar chart (monthly overview) & Pie chart (category breakdown)
- 🔍 **Search & Filter** — Search by keyword, filter by month, type, and category
- 💰 **Budget Alerts** — Set monthly budget limits with visual progress bars and warnings
- 📥 **Export** — Export transactions to CSV or PDF
- 🌙 **Dark/Light Mode** — Toggle between themes
- 📱 **Responsive Design** — Works on all screen sizes

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Authentication | JWT (JSON Web Tokens) |
| Charts | Chart.js |
| Password Hashing | bcryptjs |

---

## 📁 Project Structure

```
smart-expense-tracker/
├── backend/
│   ├── config/
│   │   └── db.js                  # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js      # Register, login, profile
│   │   ├── transactionController.js # CRUD operations
│   │   ├── summaryController.js   # Analytics & charts data
│   │   └── categoryController.js  # Category listing
│   ├── middleware/
│   │   └── auth.js                # JWT verification
│   ├── routes/
│   │   ├── auth.js
│   │   ├── transactions.js
│   │   ├── summary.js
│   │   └── categories.js
│   ├── .env                       # Environment variables
│   ├── server.js                  # Entry point
│   └── package.json
├── database/
│   └── schema.sql                 # MySQL tables & seed data
└── frontend/
    ├── css/
    │   ├── style.css              # Global styles
    │   ├── auth.css               # Login & register styles
    │   ├── dashboard.css          # Dashboard styles
    │   └── transactions.css       # Transactions page styles
    ├── js/
    │   ├── api.js                 # All API calls
    │   ├── auth.js                # Auth logic
    │   ├── dashboard.js           # Dashboard logic
    │   ├── transactions.js        # Transactions logic
    │   ├── charts.js              # Chart.js rendering
    │   └── utils.js               # Helper functions
    ├── index.html                 # Landing/redirect page
    ├── login.html
    ├── register.html
    ├── dashboard.html
    └── transactions.html
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0)
- Git

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/aasi7376/smart-expense-tracker.git
cd smart-expense-tracker
```

**2. Install backend dependencies**
```bash
cd backend
npm install
```

**3. Setup environment variables**

Create a `.env` file in the `backend` folder:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=expense_tracker
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

**4. Setup MySQL database**
```bash
mysql -u root -p
```
```sql
CREATE DATABASE expense_tracker;
USE expense_tracker;
source database/schema.sql;
```

**5. Run the backend server**
```bash
npm run dev
```
Server runs on `http://localhost:5000`

**6. Open the frontend**

Open `frontend/login.html` with Live Server in VS Code.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get user profile |

### Transactions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/transactions` | Add transaction |
| GET | `/api/transactions` | Get all transactions |
| GET | `/api/transactions/:id` | Get single transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |

### Summary & Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/summary` | Total income/expense/balance |
| GET | `/api/summary/monthly` | Monthly comparison data |
| GET | `/api/summary/category` | Category breakdown |
| GET | `/api/summary/recent` | Recent transactions |

### Categories
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/categories` | Get all categories |

---

## 📸 Screenshots

### Login Page
> Clean dark-themed login with JWT authentication

### Dashboard
> Summary cards, bar chart (monthly), pie chart (category), recent transactions

### Transactions Page
> Full CRUD with search, filters, pagination, export to CSV/PDF

---

## 🗄️ Database Schema

```sql
users         → id, name, email, password, created_at
categories    → id, name, type (income/expense)
transactions  → id, user_id, type, amount, category_id, description, date
```

---

## 👨‍💻 Author

**Asiya S** — [@aasi7376](https://github.com/aasi7376)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
