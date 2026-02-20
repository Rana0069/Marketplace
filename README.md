# Micro Marketplace App

Full-stack assignment implementation with:

- **Backend:** Node.js + Express + SQLite + JWT
- **Web:** React (Vite)
- **Mobile:** React Native (Expo)

## Project Structure

- `backend/` REST API + DB + seed script
- `web/` React web app
- `mobile/` React Native app

## Backend Setup

```bash
cd backend
npm install
npm run seed
npm start
```

Server runs on `http://localhost:4000`.

### Test Credentials

- `alice@example.com` / `password123`
- `bob@example.com` / `password123`

### API Endpoints

#### Auth
- `POST /auth/register`
- `POST /auth/login`

#### Products
- `GET /products?search=&page=1&limit=6` (search + pagination)
- `GET /products/:id`
- `POST /products` (auth)
- `PUT /products/:id` (auth)
- `DELETE /products/:id` (auth)

#### Favorites
- `POST /products/:id/favorite` (auth)
- `DELETE /products/:id/favorite` (auth)

## Web Setup

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:5173`.

Features:
- Login/Register
- Product list with search + pagination
- Product detail
- Favorite/unfavorite
- Responsive layout + heart pulse animation micro-interaction

## Mobile Setup

```bash
cd mobile
npm install
npm run start
```

Then run in emulator/device with Expo QR.

> For Android emulator, change API URL in `mobile/src/Main.js` to `http://10.0.2.2:4000`.

## Seed Script

```bash
cd backend
npm run seed
```

Adds 2 users + 10 products.

## Demo

Use a deployed link or record a 3–5 minute walkthrough covering auth, browse, details, favorites, and search/pagination.
