import express from 'express';
import {
    getAllWorkers,
    getTodayAttendance,
    getLateReports,
    reviewLateReport,
    deleteWorker
} from '../controllers/adminController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/workers', authenticateToken, isAdmin, getAllWorkers);
router.get('/attendance/today', authenticateToken, isAdmin, getTodayAttendance);
router.get('/late-reports', authenticateToken, isAdmin, getLateReports);
router.put('/late-reports/:id/review', authenticateToken, isAdmin, reviewLateReport);
router.delete('/workers/:id', authenticateToken, isAdmin, deleteWorker);

export default router;