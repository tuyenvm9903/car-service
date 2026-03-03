import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initializeDatabase } from './db/init.js';
import { runMigrations } from './db/migrations/index.js';
import vehicleRoutes from './routes/vehicles.js';
import serviceRoutes from './routes/services.js';
import exportRoutes from './routes/exports.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet({
    crossOriginResourcePolicy: false // Allow PDF to be downloaded in modern browsers
}));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/exports', exportRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Initialize database, run migrations and start server
initializeDatabase()
    .then(async () => {
        await runMigrations('up');
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Failed to initialize database or run migrations:', error);
        process.exit(1);
    });