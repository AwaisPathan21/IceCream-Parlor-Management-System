# 🍦 Pathan Ice-cream Parlor — Full Stack Website

A complete ice cream delivery website with customer accounts, cart, payment, and 10-minute home delivery.

---

## 🛠️ Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript (Bootstrap 4)
- **Backend:** Node.js + Express.js
- **Database:** MySQL

---

## ⚡ Quick Setup

### 1. Install Node.js
Download from: https://nodejs.org (v16 or later)

### 2. Install MySQL
Download from: https://dev.mysql.com/downloads/mysql/

### 3. Setup Database
```bash
mysql -u root -p < schema.sql
```

### 4. Configure Environment
Edit `.env` and set your MySQL password:
```
DB_PASSWORD=your_mysql_password
```

### 5. Install & Run
```bash
npm install
npm start
```

### 6. Open Browser
Visit: **http://localhost:3000**

---

## 📁 Project Structure
```
ice-cream Parlor management System/
├── server.js            # Express server
├── db.js                # MySQL connection pool
├── schema.sql           # Database schema + seed data
├── .env                 # Environment variables
├── middleware/
│   └── auth.js          # JWT authentication middleware
├── routes/
│   ├── auth.js          # Register / Login endpoints
│   ├── products.js      # Products API
│   └── orders.js        # Orders & Addresses API
└── public/              # Frontend (served statically)
    ├── index.html       # Home page
    ├── products.html    # Browse & order products
    ├── cart.html        # Cart + Checkout
    ├── orders.html      # Order history
    ├── login.html       # Login
    ├── register.html    # Register
    ├── css/style.css    # All styles
    ├── js/app.js        # Shared JS (auth, cart, API)
    └── images/          # Product images
```

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/products` | ❌ | All products |
| GET | `/api/orders/addresses` | ✅ | My addresses |
| POST | `/api/orders/addresses` | ✅ | Add address |
| DELETE | `/api/orders/addresses/:id` | ✅ | Delete address |
| POST | `/api/orders` | ✅ | Place order |
| GET | `/api/orders/my` | ✅ | My order history |

---

## 🌟 Features
- ✅ Customer registration & login (JWT auth)
- ✅ Browse ice cream products with categories
- ✅ Add to cart / update qty / remove items
- ✅ Save multiple delivery addresses
- ✅ 3 payment options: Cash on Delivery, UPI, Credit/Debit Card
- ✅ Place order with 10-minute delivery promise
- ✅ Live countdown timer after order confirmation
- ✅ Order history page
- ✅ Responsive design (mobile-friendly)
- ✅ Toast notifications

