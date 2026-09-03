# Chadani Cosmetic — Premium Beauty & Cosmetics Boutique

Chadani Cosmetic is a full-stack eCommerce application designed for curated beauty cosmetics, luxury skincare formulations, and bespoke cosmetic treatments with dedicated local delivery across Dharan.

Built with Next.js 16 (Turbopack), React 19, Tailwind CSS v4, Node.js, Express, Prisma ORM, PostgreSQL, and Socket.IO.

---

## Key Features

### Customer Boutique Experience
- **Editorial Storefront**: Warm ivory and espresso visual system, curated hero, featured departments, bestselling formulations, and customer reviews.
- **Dynamic Catalogue**: Filter by collection, search by product name/SKU, and sort by price or availability.
- **Product Details & Gallery**: High-res image preview, stock badges, structured JSON-LD schema, verified purchase customer reviews, and instant wishlist management.
- **Cart & Checkout**: Real-time guest cart with authenticated merge, transparent Dharan delivery calculation (flat NPR 100), and Cash on Delivery order completion.
- **Unified Account Portal**: Single `/account` architecture with dedicated sub-views for orders history (`/account/orders`), wishlist (`/account/wishlist`), and profile settings (`/account/settings`).
- **Security & Authentication**: Email registration with 6-digit OTP verification, secure Google Sign-in OAuth, and sanitized internal redirect safety.
- **Live Support Chat**: Real-time customer support powered by Socket.IO.

### Administrative Commerce Operations
- **Role-Based Authorization**: Protected `/admin/*` routes enforcing strict backend JWT verification and admin role checking.
- **Commerce Overview**: Accurately labeled Gross Order Value (product subtotal + NPR 100 delivery), delivered revenue, and real-time inventory shortfalls.
- **Product & Inventory Management**: Complete CRUD with original vs discount pricing validation (`0 <= discountPrice <= price`), SKU tracking, and multi-image uploads.
- **Collection Management**: Category organisation with active product dependency checks before deletion.
- **Fulfillment & Dispatch**: Order details breakdown (subtotal + delivery = total), customer Dharan address, GPS delivery map, and atomic inventory restoration upon order cancellation.
- **Client Directory**: Manage customer verification statuses with account deactivation safeguards.

---

## Technology Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS v4, Lucide React, Axios, Socket.IO Client
- **Backend**: Node.js, Express, Prisma ORM, Multer, Nodemailer, Socket.IO
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens) & Google OAuth 2.0
- **Media Storage**: Cloudinary SDK (with automatic fallback to local storage)

---

## Project Structure

```text
chadani-cosmetic/
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router (Storefront, Shop, Cart, Checkout, Account, Admin)
│   │   ├── components/      # UI Components (Navbar, Footer, Admin, ProductCard)
│   │   ├── context/         # Auth, Cart, Wishlist, Chat, and Notification Providers
│   │   └── utils/           # Currency, pricing, and redirect utilities
│   ├── .env.example         # Frontend environment template
│   └── package.json
│
└── backend/
    ├── prisma/
    │   ├── schema.prisma    # PostgreSQL Schema
    │   └── seed.js          # Catalog & Admin seeder script
    ├── src/
    │   ├── controllers/     # Route controller logic
    │   ├── middleware/      # Auth, role check, and rate-limiting
    │   ├── routes/          # API route definitions
    │   ├── utils/           # Pricing, email, storage, and socket helpers
    │   └── index.js         # Express & Socket.IO server entry
    ├── .env.example         # Backend environment template
    └── package.json
```

---

## Setup & Running Locally

### Prerequisites
- Node.js (v18.x or later)
- PostgreSQL running locally or on a cloud provider (e.g. Supabase, Neon)

### 1. Backend Setup

1. Navigate to `backend/`:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment:
   Copy `.env.example` to `.env` and fill in your credentials:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://user:password@localhost:5432/chadani_db"
   JWT_SECRET="your-strong-random-jwt-secret"
   FRONTEND_URL="http://localhost:3000"
   ```

3. Run Prisma migrations and seed catalog:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. Start development server:
   ```bash
   npm run dev
   ```
   Backend listens on `http://localhost:5000`.

### 2. Frontend Setup

1. Navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   ```

2. Configure environment:
   Copy `.env.example` to `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
   Storefront is available at `http://localhost:3000`.

---

## Production Deployment Considerations

1. **Security**:
   - Set a strong, unique `JWT_SECRET` in environment variables.
   - Configure `ALLOWED_ORIGINS` to restrict CORS to production frontend domains.
   - Run behind HTTPS / TLS proxy (e.g. Vercel, Render).

2. **Delivery & Payments**:
   - Order delivery is flat NPR 100 within Dharan.
   - Primary payment method is Cash on Delivery.

3. **Database**:
   - Execute `npx prisma migrate deploy` in production pipelines to apply schema updates without resetting data.
