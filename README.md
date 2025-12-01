# ecommerce-webapp

## Project Introduction
This is a full-stack ecommerce web application built with the MERN stack (MongoDB, Express, React, Node.js), utilizing Redis for caching/session management and Stripe for payment processing. The project is structured for scalability and maintainability, with clear separation of backend and frontend concerns.

## Architecture Overview
- **Backend:** Node.js/Express REST API, MongoDB (Mongoose), Redis, Stripe, Cloudinary (image uploads)
  - Controllers, models, and routes are organized by domain in `backend/`
- **Frontend:** React (Vite, Tailwind CSS), custom state management hooks, API abstraction
  - Pages, components, and stores are organized in `frontend/src/`

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or Atlas)
- Redis server
- Stripe account (for live payments; test mode supported)
- Cloudinary account (for image uploads)

### Environment Variables
Create `.env` files in `backend/` and `frontend/` as needed. Required variables include:
- **Backend:**
  - `MONGODB_URI`, `REDIS_URL`, `STRIPE_SECRET_KEY`, `CLOUDINARY_URL`, etc.
- **Frontend:**
  - (If needed for API base URL or public keys)

### Backend
```bash
# Install dependencies
cd backend
npm install
# Start server (ensure MongoDB & Redis are running)
node server.js
# Or for auto-reload:
npx nodemon server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173 by default
```

## Testing
- No automated test suite is included; manual testing via UI and API tools (e.g., Postman) is recommended.
- Stripe test card for checkout:
  - Card: `4242 4242 4242 4242`
  - Exp: `04/25`
  - CVV: `424`

## Key Project Structure
- `backend/controllers/` — Business logic per domain
- `backend/models/` — Mongoose schemas
- `backend/routes/` — API endpoints
- `backend/lib/` — Integrations (Stripe, Redis, Cloudinary, DB)
- `frontend/src/pages/` — Main app pages
- `frontend/src/components/` — UI components
- `frontend/src/stores/` — State management hooks
- `frontend/src/lib/axios.js` — API abstraction

## Conventions & Patterns
- One controller/model/route per domain (e.g., `product`, `cart`)
- State managed with custom hooks (not Redux)
- API calls centralized in `lib/axios.js`

## Integration Points
- **Stripe:** Payment logic in `backend/lib/stripe.js` and `backend/controllers/payment.controller.js`
- **Cloudinary:** Image upload logic in `backend/lib/cloudinary.js`
- **Redis:** Caching/session in `backend/lib/redis.js`

## Additional Notes
- For production, ensure all environment variables are securely set and services are properly configured.
- See `.github/copilot-instructions.md` for AI agent and codebase conventions.

---
_For questions or improvements, please open an issue or PR._




