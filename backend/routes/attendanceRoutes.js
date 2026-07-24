import express from 'express';
import { checkIn, checkOut, getHistory } from '../controllers/attendanceController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/check-in', authenticateToken, checkIn);
router.post('/check-out', authenticateToken, checkOut);
router.get('/history', authenticateToken, getHistory);

export default router;
