import express from 'express';
import { login, adminLogin, register } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/admin/login', adminLogin);
router.post('/register', register);

export default router;