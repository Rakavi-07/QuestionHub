import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import connectDB from './config/db.js';
import './config/cloudinary.js'; // configured only — no upload logic in this phase
import seedAdmin from './utils/seedAdmin.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import { protect, requireRole } from './middleware/authMiddleware.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware --------------------------------------------------------
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// --- Routes --------------------------------------------------------------
app.get('/', (req, res) => {
  res.json({ message: 'QuestionHub API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', protect, requireRole('Admin'), adminRoutes);
app.use('/api/question-papers', protect, requireRole('Student'), studentRoutes);

// --- Error handling --------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

// --- Startup ---------------------------------------------------------------
async function start() {
  await connectDB();
  await seedAdmin();

  app.listen(PORT, () => {
    console.log(`QuestionHub API listening on port ${PORT}`);
  });
}

start();
