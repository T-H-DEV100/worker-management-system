import pool from '../config/db.js';

// Check-in
export const checkIn = async (req, res) => {
    try {
        const workerId = req.user.id;
        const now = new Date();

        const [existingCheckin] = await pool.execute(
            'SELECT id FROM attendance WHERE worker_id = ? AND DATE(check_in_time) = CURDATE()',
            [workerId]
        );

        if (existingCheckin.length > 0) {
            return res.status(400).json({ error: 'Already checked in today' });
        }

        const [workers] = await pool.execute(
            'SELECT work_start_time FROM workers WHERE id = ?',
            [workerId]
        );

        const scheduledTime = workers[0].work_start_time;
        const currentTime = now.toTimeString().split(' ')[0];

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

        const [result] = await pool.execute(
            'INSERT INTO attendance (worker_id, check_in_time, status) VALUES (?, ?, ?)',
            [workerId, now, status]
        );

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
};

// Check-out
export const checkOut = async (req, res) => {
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
};

// Get attendance history for worker
export const getHistory = async (req, res) => {
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
};
