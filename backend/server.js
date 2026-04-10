const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.url} from ${req.headers.origin}`);
    next();
});

// CORS Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Body parser
app.use(express.json());

// Route files
const auth = require('./routes/authRoutes');
const users = require('./routes/userRoutes');
const vehicles = require('./routes/vehicleRoutes');
const services = require('./routes/serviceRoutes');
const bookings = require('./routes/bookingRoutes');
const payments = require('./routes/paymentRoutes');
const admin = require('./routes/adminRoutes');
const chatbot = require('./routes/chatbotRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const history = require('./routes/historyRoutes');
const notifications = require('./routes/notificationRoutes');
const analytics = require('./routes/analyticsRoutes');
const rbac = require('./routes/rbacRoutes');
const offers = require('./routes/offerRoutes');

const errorHandler = require('./middleware/errorMiddleware');

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/', (req, res) => {
  res.send('AutoDetailPro API Running...');
});

// Mount routers
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/vehicles', vehicles);
app.use('/api/services', services);
app.use('/api/bookings', bookings);
app.use('/api/payments', payments);
app.use('/api/admin', admin);
app.use('/api/chatbot', chatbot);
app.use('/api/upload', uploadRoutes);
app.use('/api/history', history);
app.use('/api/notifications', notifications);
app.use('/api/analytics', analytics);
app.use('/api/rbac', rbac);
app.use('/api/offers', offers);

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
