# 🔐 KVault - Advanced Learning Management System (LMS)

KVault is a feature-rich, high-performance Learning Management System (LMS) designed to empower students to learn new skills and allow instructors to easily curate and manage educational content. Built using a modern, scalable architecture with React/Vite on the frontend and Express/TypeScript on the backend, it delivers a secure, responsive, and seamless learning experience.

---

## 🚀 Key Features by User Roles

KVault defines clear privileges and interfaces depending on the logged-in user's role: **Student**, **Instructor**, or **Admin**.

### 👨‍🎓 Student Experience
*   **Structured Learning**: Browse courses across diverse categories, read details, structure learning with module-lesson hierarchies, and track progress.
*   **Shopping Cart & Wishlist**: Save courses to a wishlist or cart, and manage them before checking out.
*   **Razorpay Payment Integration**: Secure course purchasing with a seamless checkout flow backed by Razorpay (supports test/production modes).
*   **Custom Video Player**: Interactive distraction-free course player featuring video tracking, resume playback, and lesson completions.
*   **Achievements & Certificates**: Track course progress percentages, mark items complete, and generate downloadable PDF certificates of completion upon finishing courses.
*   **Profile Management**: Customize avatar, bio, personal info, and view purchase history.

### 👩‍🏫 Instructor Dashboard & Tools
*   **Distraction-Free Course Creation Wizard**: A step-by-step setup interface for initializing courses.
*   **Course Editor Sidebar Workspace**: Manage modules, add lessons, upload video content, and attach resources (PDFs, docs).
*   **Media & Resource Uploads**: Integrated with Cloudflare R2 (AWS S3-compatible object storage) for fast, secure file uploads and presigned URL access.
*   **Analytics Hub**: Track performance with intuitive visual dashboards representing enrollment trends, sales, top-performing courses, and average ratings.
*   **Interaction Systems**: Read and reply to student reviews, manage assignments, and broadcast announcements.

---

## 🛠️ Technology Stack

| Layer | Technology Used |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS (v4), Redux Toolkit, React Router DOM v7, Framer Motion, Video.js, Lucide Icons, jsPDF |
| **Backend** | Node.js, Express v5, TypeScript, MongoDB (Mongoose), Redis (Caching & sessions via ioredis) |
| **Storage / Media** | Cloudflare R2 Object Storage (S3 API Client), Multer |
| **Payments** | Razorpay Node SDK |
| **Auth & Security** | JWT, bcrypt, Cookie Parser, Express Rate Limit, Google Auth Library (OAuth 2.0) |
| **Communication** | Nodemailer (OTP email verification codes) |

---

## 📁 Project Directory Structure

```text
KVault/
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── api/                # API layer (raw Axios HTTP requests)
│   │   ├── assets/             # Static images, fonts, and assets
│   │   ├── components/         # Reusable UI components (Auth, Cards, Hero, etc.)
│   │   ├── context/            # React Contexts (Theme, User Auth, AppState)
│   │   ├── data/               # Local constants and static configs
│   │   ├── hooks/              # Custom hooks (useCart, useWishlist, useAppState)
│   │   ├── layouts/            # Page layouts (MainLayout, AuthLayout, InstructorLayout)
│   │   ├── pages/              # Primary page components (Home, CoursePlayer, Cart, etc.)
│   │   │   ├── Mylearing/      # Learning progress, player, certificates
│   │   │   ├── Profile/        # Achievements, profile edit, sidebar tabs
│   │   │   └── instructor/     # Instructor pages (Dashboard, Analytics, Reviews)
│   │   ├── routes/             # Client routes & guards (ProtectedRoute, InstructorRoute)
│   │   ├── services/           # Business logic & services wrapping API calls
│   │   ├── store/              # Redux store setup
│   │   ├── utils/              # Client utility functions
│   │   ├── App.tsx             # Root component
│   │   └── index.css           # Tailwind v4 configuration & styles
│   ├── package.json
│   └── vite.config.ts
│
├── server/                     # Backend API Server (Node + Express)
│   ├── src/
│   │   ├── db/                 # MongoDB database connections
│   │   ├── controllers/        # Request handling and controller logic
│   │   ├── middleware/         # Security guards & Auth middleware (authenticate)
│   │   ├── models/             # Mongoose schemas (User, Course, Order, OTP, etc.)
│   │   ├── routers/            # API Route definitions
│   │   ├── schemas/            # Validation schemas (Zod validators)
│   │   ├── services/           # Core backend services (Mail, Payment, S3 Storage)
│   │   ├── types/              # TS interface and enum definitions
│   │   ├── utils/              # Helper utilities
│   │   └── index.ts            # Server entry file (Express configuration)
│   ├── package.json
│   └── tsconfig.json
└── README.md                   # This project documentation
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file in both `client/` and `server/` using the following templates:

### 🖥️ Client Environment Configuration (`client/.env`)
```env
VITE_BACKEND_BASE_URL=http://localhost:3000
API_VERSION=api/v1

# Razorpay Configuration (Test Mode)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### ⚙️ Server Environment Configuration (`server/.env`)
```env
DATABASE_URL=mongodb://admin:admin@localhost:27017/kVault?authSource=admin
REDIS_DB_URL=redis://your_redis_host:your_redis_port
REDIS_PASSWORD=your_redis_password
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port

FRONTEND_URL=http://localhost:5173
FRONTEND_URL_2=http://localhost:5174
API_VERSION=api/v1

# Nodemailer SMTP Configuration
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password

# Razorpay Configuration (Test Mode)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Cloudflare R2 / AWS S3 Storage Details
R2_ACCESS_KEY_ID=your_cloudflare_r2_access_key
R2_SECRET_ACCESS_KEY=your_cloudflare_r2_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your_public_cdn_domain
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
R2_ACCOUNT_ID=your_cloudflare_account_id
```

---

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [MongoDB](https://www.mongodb.com/) (Local or Atlas instance)
*   [Redis](https://redis.io/) (Local or Cloud instance)

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/ankitgill07/KVault.git
cd KVault

# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install
```

### 2. Start the Application

#### Backend Express Server
```bash
cd server
npm run dev
```
*The server will start running on [http://localhost:3000](http://localhost:3000).*

#### Frontend Client App
```bash
cd client
npm run dev
```
*The client app will launch on [http://localhost:5173](http://localhost:5173).*

---

## 📐 Architecture and Data Flow

KVault operates with a structured, strict data flow that enforces a clean separation of concerns:

```text
[Frontend View] ──► [Custom React Hook] ──► [Service Layer] ──► [Axios API Layer]
                                                                        │
                                                                 (HTTP Request)
                                                                        ▼
[DB Models] ◄── [Controllers] ◄── [Middlewares / Router] ◄── [Express Server Entry]
```

1.  **Frontend Views**: Present UI and trigger actions.
2.  **Hooks (`useCart`, `useWishlist`, etc.)**: Manage local states, dispatch Redux actions, or connect to context providers.
3.  **Service Layer**: Pre-processes parameters, manages error-handling wrappers, and returns clean data.
4.  **API Layer**: Axios instances executing queries to API endpoints.
5.  **Express Endpoints**: Authenticate via token/cookies, validate payloads via Zod, and dispatch request queries to Mongo/Redis schemas.
