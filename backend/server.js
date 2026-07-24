import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'worker_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// ===== AUTH ROUTES =====

// Worker Login
app.post('/api/auth/login', async (req, res) => {
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
});

// Worker Registration
app.post('/api/auth/register', async (req, res) => {
    try {
        const { full_name, email, phone, department, position, employee_id, password, work_start_time, work_end_time } = req.body;

        // Check if employee_id or email already exists
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
});

// ===== ATTENDANCE ROUTES =====

// Check-in
app.post('/api/attendance/check-in', authenticateToken, async (req, res) => {
    try {
        const workerId = req.user.id;
        const now = new Date();
        
        // Check if already checked in today
        const [existingCheckin] = await pool.execute(
            'SELECT id FROM attendance WHERE worker_id = ? AND DATE(check_in_time) = CURDATE()',
            [workerId]
        );

        if (existingCheckin.length > 0) {
            return res.status(400).json({ error: 'Already checked in today' });
        }

        // Get worker's scheduled time
        const [workers] = await pool.execute(
            'SELECT work_start_time FROM workers WHERE id = ?',
            [workerId]
        );

        const scheduledTime = workers[0].work_start_time;
        const currentTime = now.toTimeString().split(' ')[0];
        
        // Determine if late
        let status = 'on_time';
        let minutesLate = 0;
        
        if (currentTime > scheduledTime) {
            const [scheduledHours, scheduledMinutes] = scheduledTime.split(':');
            const [currentHours, currentMinutes] = currentTime.split(':');
            
            minutesLate = (parseInt(currentHours) * 60 + parseInt(currentMinutes)) - 
                         (parseInt(scheduledHours) * 60 + parseInt(scheduledMinutes));
            
            if (minutesLate > 0) {
                status = 'late';
            }
        }

        // Insert attendance record
        const [result] = await pool.execute(
            'INSERT INTO attendance (worker_id, check_in_time, status) VALUES (?, ?, ?)',
            [workerId, now, status]
        );

        // If late, create late report
        if (status === 'late') {
            await pool.execute(
                'INSERT INTO late_reports (worker_id, attendance_id, scheduled_time, actual_time, minutes_late, report_date) VALUES (?, ?, ?, ?, ?, CURDATE())',
                [workerId, result.insertId, scheduledTime, currentTime, minutesLate]
            );
        }

        res.json({
            message: 'Check-in successful',
            check_in_time: now,
            status: status,
            minutes_late: minutesLate
        });
    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Check-out
app.post('/api/attendance/check-out', authenticateToken, async (req, res) => {
    try {
        const workerId = req.user.id;
        const now = new Date();

        const [result] = await pool.execute(
            'UPDATE attendance SET check_out_time = ? WHERE worker_id = ? AND DATE(check_in_time) = CURDATE() AND check_out_time IS NULL',
            [now, workerId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'No active check-in found' });
        }

        res.json({
            message: 'Check-out successful',
            check_out_time: now
        });
    } catch (error) {
        console.error('Check-out error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get attendance history for worker
app.get('/api/attendance/history', authenticateToken, async (req, res) => {
    try {
        const workerId = req.user.id;
        const { startDate, endDate } = req.query;

        let query = `
            SELECT a.*, w.work_start_time 
            FROM attendance a
            JOIN workers w ON a.worker_id = w.id
            WHERE a.worker_id = ?
        `;
        const params = [workerId];

        if (startDate) {
            query += ' AND DATE(a.check_in_time) >= ?';
            params.push(startDate);
        }
        if (endDate) {
            query += ' AND DATE(a.check_in_time) <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY a.check_in_time DESC LIMIT 30';

        const [rows] = await pool.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ===== ADMIN ROUTES =====

// Get all workers
app.get('/api/admin/workers', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT id, full_name, email, phone, department, position, employee_id, work_start_time, work_end_time, status, created_at FROM workers WHERE employee_id != "ADMIN001"'
        );
        res.json(rows);
    } catch (error) {
        console.error('Get workers error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get today's attendance
app.get('/api/admin/attendance/today', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                w.id,
                w.full_name,
                w.employee_id,
                w.department,
                w.work_start_time,
                a.check_in_time,
                a.check_out_time,
                a.status,
                lr.minutes_late,
                lr.is_reviewed
            FROM workers w
            LEFT JOIN attendance a ON w.id = a.worker_id AND DATE(a.check_in_time) = CURDATE()
            LEFT JOIN late_reports lr ON a.id = lr.attendance_id
            WHERE w.employee_id != 'ADMIN001'
            ORDER BY a.check_in_time DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Today attendance error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get late reports
app.get('/api/admin/late-reports', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                lr.*,
                w.full_name,
                w.employee_id,
                w.department
            FROM late_reports lr
            JOIN workers w ON lr.worker_id = w.id
            ORDER BY lr.report_date DESC, lr.created_at DESC
            LIMIT 50
        `);
        res.json(rows);
    } catch (error) {
        console.error('Late reports error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark late report as reviewed
app.put('/api/admin/late-reports/:id/review', authenticateToken, async (req, res) => {
    try {
        await pool.execute(
            'UPDATE late_reports SET is_reviewed = TRUE WHERE id = ?',
            [req.params.id]
        );
        res.json({ message: 'Report reviewed' });
    } catch (error) {
        console.error('Review error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete worker
app.delete('/api/admin/workers/:id', authenticateToken, async (req, res) => {
    try {
        await pool.execute('DELETE FROM workers WHERE id = ? AND employee_id != "ADMIN001"', [req.params.id]);
        res.json({ message: 'Worker deleted successfully' });
    } catch (error) {
        console.error('Delete worker error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});