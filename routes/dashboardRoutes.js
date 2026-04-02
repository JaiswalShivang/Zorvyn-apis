import express from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';
import { getDashboardSummary } from '../controllers/dashboardController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/summary', authorizeRole('ANALYST', 'ADMIN'), getDashboardSummary);

export default router;
