import pool from '../config/db.js';

// Get all workers
export const getAllWorkers = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT id, full_name, email, phone, department, position, employee_id, work_start_time, work_end_time, status, created_at FROM workers WHERE employee_id != "ADMIN001"'
        );
        res.json(rows);
    } catch (error) {
        console.error('Get workers error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get today's attendance
export const getTodayAttendance = async (req, res) => {
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
};

// Get late reports
export const getLateReports = async (req, res) => {
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
};

// Mark late report as reviewed
export const reviewLateReport = async (req, res) => {
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
};

// Delete worker
export const deleteWorker = async (req, res) => {
    try {
        await pool.execute('DELETE FROM workers WHERE id = ? AND employee_id != "ADMIN001"', [req.params.id]);
        res.json({ message: 'Worker deleted successfully' });
    } catch (error) {
        console.error('Delete worker error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
