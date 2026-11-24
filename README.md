# Sadik E-Commerce Platform (`sadik.com.bd`)

A full-stack, customizable, mobile-first e-commerce platform built with **PHP Laravel 12 (REST API + Sanctum)** and **React + TypeScript + Tailwind CSS v4**.

## Business Information (Admin-Customizable)
- **Brand / Domain:** Sadik (`sadik.com.bd`)
- **Address:** 58, Satmasjid Road, Level 7, Green City Center, Dhanmondi, Dhaka, Bangladesh
- **Phone:** 01617-723455

---

## Project Structure
```text
sadik.com.bd/
├── backend/                 # Laravel 12 REST API (MySQL / SQLite)
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Http/Middleware/RoleMiddleware.php
│   │   ├── Models/
│   │   └── Services/Payment/ # Modular COD, bKash & Nagad gateways
│   ├── database/migrations/
│   ├── database/seeders/
│   └── routes/api.php
├── frontend/                # React 19 + TypeScript + Tailwind CSS v4
│   ├── src/
│   │   ├── components/      # Layout, ProductCard, CartDrawer, SkeletonCard
│   │   ├── context/         # StoreContext (Cart, Auth, Settings, Theme, i18n)
│   │   ├── lib/             # API client & EN/BN dictionary
│   │   ├── pages/           # Storefront, Checkout, Account & Admin Panel
│   │   └── types/
└── README.md
```

---

## Setup & Run Locally

### 1. Backend (Laravel API)
```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
```

Configure MySQL in `backend/.env` (or use SQLite by setting `DB_CONNECTION=sqlite` for quick local testing):
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sadik_ecommerce
DB_USERNAME=root
DB_PASSWORD=
```

Run migrations, seed demo data, and start the server:
```bash
php artisan migrate --seed
php artisan serve
```
API runs at: `http://127.0.0.1:8000`

### 2. Frontend (React + Vite + Tailwind CSS)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173` (automatically proxies `/api` to `http://127.0.0.1:8000`).

---

## Demo Accounts & Coupons
- **Admin:** `admin@sadik.com.bd` / `password`
- **Staff:** `staff@sadik.com.bd` / `password`
- **Customer:** `customer@sadik.com.bd` / `password`
- **Coupons:** `SADIK10` (10% off, min ৳1,000), `WELCOME200` (৳200 off, min ৳1,500)

---

## Running Tests & Production Build
```bash
# Backend feature tests
cd backend && php artisan test

# Frontend TypeScript check & production build
cd frontend && npm run build
```

---

## Production Deployment Guide
1. **Backend:** Deploy `backend/` to a PHP 8.2+ server (Nginx/Apache + MySQL). Run:
   ```bash
   composer install --no-dev --optimize-autoloader
   php artisan migrate --force
   php artisan config:cache && php artisan route:cache
   ```
2. **Frontend:** Set `VITE_API_URL=https://api.sadik.com.bd/api` in `frontend/.env`, run `npm run build`, and serve `frontend/dist/` via Nginx, Vercel, or Cloudflare Pages.
3. **Live Payment Gateways:** Replace mock `process()` methods in `backend/app/Services/Payment/BkashGateway.php` and `NagadGateway.php` with live merchant API credentials.
