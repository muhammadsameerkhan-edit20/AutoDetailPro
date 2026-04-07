# AutoDetailPro 🚗✨

A full-stack **automobile detailing booking platform** built with React, Node.js, MongoDB, and Gemini AI.

## Features

- 🔐 **Secure Authentication** — JWT-based login/register for customers & admins
- 🛡️ **Admin Portal** — Dedicated admin panel with secret key access control
- 📅 **Booking System** — Full booking flow with location picker, time slots & email notifications
- 🤖 **AI Chatbot** — Gemini 2.5 Flash powered AI consultant with multi-key rotation
- 💳 **Service Management** — Admin can add, edit, delete services with image upload
- 🗑️ **Trash System** — Soft-delete bookings with admin restore capability
- 📧 **Email Notifications** — Automated Gmail SMTP emails for booking events
- 💰 **PKR Pricing** — All prices in Pakistani Rupees (Rs.)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| AI | Google Gemini 2.5 Flash |
| Email | Nodemailer (Gmail SMTP) |

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally or Atlas connection

### Backend
```bash
cd backend
npm install
# Create .env file (see .env.example)
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables (`backend/.env`)
```
PORT=5001
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
SMTP_EMAIL=your_gmail
SMTP_PASSWORD=your_app_password
ADMIN_SECRET_KEY=your_admin_secret
GEMINI_API_KEY_1=your_gemini_key_1
GEMINI_API_KEY_2=your_gemini_key_2
GEMINI_API_KEY_3=your_gemini_key_3
```

## Admin Access

Navigate to `/admin-auth` to access the Admin Portal. Admin registration requires the `ADMIN_SECRET_KEY` from your `.env`.

---

Built with ❤️ for AutoDetailPro, Lahore 🇵🇰
