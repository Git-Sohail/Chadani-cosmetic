# Bella & Bangles - Premium Cosmetics & Jewelry Full-Stack Store

Bella & Bangles is a premium, fully-responsive eCommerce application designed specifically for organic cosmetics, skincare treatments, traditional bangles, and handpicked luxury jewelry. 

This project is built using a modern full-stack web architecture, presenting a soft-pink aesthetic, elegant serif/sans typography, sleek transitions, micro-animations, and full-featured customer and administrator portals.

---

## Key Features

### 🌸 Customer Experience
- **Interactive Landing Screen**: Features a curated rose-pink hero section, bestselling category carousels, new collections spotlight, and testimonials.
- **Dynamic Product Catalog**: Features dynamic query filters (by category, price range, search query) and price sorting options.
- **Product Details View**: Includes real stock trackers, quantity selectors, and instant wishlist toggles.
- **Smart Global State (Cart & Wishlist)**: Integrates with backend APIs when authenticated, and falls back to cached `localStorage` states if offline for guest users.
- **Atomic Checkout**: Checkout orders validated, decrementing database stock counters securely inside database transactions (`prisma.$transaction`), clearing carts automatically.

### 🛡️ Administrative Portal
- **Admin Authentication**: Full JWT validation protecting endpoints and frontend dashboard views.
- **Visual Analytics**: Interactive overview boards calculating gross sales, item counters, and active customer bases.
- **Critical Stock Alarms**: Automatic alerts notifying administrators when product stock dips below 5 items.
- **Catalogue CRUD Control**: Admin modal interface to easily add, edit, or delete products and categories directly in the UI.
- **Order Management Logs**: Review checkout orders and modify delivery statuses (`pending`, `confirmed`, `shipped`, `delivered`, `cancelled`).

---

## Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React, Axios
- **Backend**: Node.js, Express.js, Multer
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens) & BCryptJS
- **Image Storage**: Cloudinary SDK

---

## Folder Structure

```text
cosmetic-store/
├── frontend/                # Next.js Frontend
│   ├── src/
│   │   ├── app/             # Page Router (Home, Shop, Cart, Wishlist, Checkout, Login, Admin)
│   │   ├── components/      # Shared Design Components (Navbar, Footer, ProductCard, Button)
│   │   ├── context/         # React Contexts (AuthContext, CartContext, WishlistContext)
│   │   └── utils/           # Mock data utilities
│   ├── .env.local           # Local frontend settings
│   └── package.json
│
└── backend/                 # Express.js Backend
    ├── prisma/
    │   ├── schema.prisma    # PostgreSQL Schema
    │   └── seed.js          # Auto-seeder script
    ├── src/
    │   ├── controllers/     # Route controller actions
    │   ├── middleware/      # Auth & role checking middleware
    │   ├── routes/          # Express route routers
    │   ├── utils/           # Cloudinary configuration
    │   ├── db.js            # Prisma connection instantiator
    │   └── index.js         # Entry server
    ├── .env                 # Server configuration
    └── package.json
```

---

## Setup and Run Instructions

### 📦 Prerequisites
- **Node.js** (v18.x or later)
- **NPM** (v9.x or later)
- **PostgreSQL Database** running locally or in the cloud

---

### 1. Database & Backend Setup

1. **Navigate to the Backend directory**:
   ```bash
   cd backend
   ```

2. **Install all server dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:password@localhost:5432/cosmetic_store?schema=public"
   JWT_SECRET="your_custom_jwt_secret_phrase"
   CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
   CLOUDINARY_API_KEY="your_cloudinary_api_key"
   CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
   ```

4. **Sync Prisma Schema & Run Database Migrations**:
   Ensure PostgreSQL is running and credentials are correct, then run:
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed Demo Data**:
   Populate your database with categories, organic cosmetics, bangle catalogs, and an administrator account:
   ```bash
   npx prisma db seed
   ```

6. **Start Backend Server**:
   ```bash
   npm run dev
   ```
   The backend server will spin up on **`http://localhost:5000`**.

---

### 2. Frontend Setup

1. **Open a new terminal and navigate to the Frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install all client dependencies**:
   ```bash
   npm install
   ```

3. **Configure Frontend Environment**:
   Verify `.env.local` contains the local server url:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Launch Frontend Development Server**:
   ```bash
   npm run dev
   ```
   The Next.js frontend will boot on **`http://localhost:3000`**.

---

## 🔑 Demo Account Credentials

Use these credentials to sign in and test the application features:

### 👤 Administrator Account
- **Email**: `admin@bellabangles.com`
- **Password**: `admin123`
*(Gives access to products CRUD, category creator, status updates, and low-stock alarms).*

### 🛍️ Standard Customer Account
- **Email**: `jane@example.com`
- **Password**: `customer123`
