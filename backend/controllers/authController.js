import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { JWT_SECRET } from '../middleware/authMiddleware.js';

// Worker Login
export const login = async (req, res) => {
    try {
        const { employee_id, password } = req.body;

        const [rows] = await pool.execute(
            'SELECT * FROM workers WHERE employee_id = ? AND status = "active"',
            [employee_id]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const worker = rows[0];
        const validPassword = await bcrypt.compare(password, worker.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: worker.id, employee_id: worker.employee_id, role: worker.position },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            worker: {
                id: worker.id,
                full_name: worker.full_name,
                email: worker.email,
                employee_id: worker.employee_id,
                department: worker.department,
                position: worker.position,
                work_start_time: worker.work_start_time,
                work_end_time: worker.work_end_time
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Worker Registration
export const register = async (req, res) => {
    try {
        const { full_name, email, phone, department, position, employee_id, password, work_start_time, work_end_time } = req.body;

        const [existing] = await pool.execute(
            'SELECT id FROM workers WHERE employee_id = ? OR email = ?',
            [employee_id, email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Employee ID or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.execute(
            'INSERT INTO workers (full_name, email, phone, department, position, employee_id, password_hash, work_start_time, work_end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [full_name, email, phone, department, position, employee_id, hashedPassword, work_start_time || '09:00:00', work_end_time || '17:00:00']
        );

        res.status(201).json({
            message: 'Worker registered successfully',
            worker_id: result.insertId
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


// Admin Login (restricted to admin accounts only)
export const adminLogin = async (req, res) => {
    try {
        const { employee_id, password } = req.body;

        const [rows] = await pool.execute(
            'SELECT * FROM workers WHERE employee_id = ? AND status = "active"',
            [employee_id]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const admin = rows[0];
        const isAdmin = admin.employee_id === 'ADMIN001' || admin.position === 'Administrator';
        if (!isAdmin) {
            return res.status(403).json({ error: 'Access denied: not an admin account' });
        }

        const validPassword = await bcrypt.compare(password, admin.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin.id, employee_id: admin.employee_id, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            admin: {
                id: admin.id,
                full_name: admin.full_name,
                email: admin.email,
                employee_id: admin.employee_id,
                position: admin.position
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
