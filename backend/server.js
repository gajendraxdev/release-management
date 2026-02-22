import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import releasesRouter from './routes/releases.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // Allow all origins in dev, set specific origin in production
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Release Checklist API is running' });
});

// API routes
app.use('/api/releases', releasesRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Export for Vercel serverless
export default app;

// Start server when run directly (local dev)
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}
