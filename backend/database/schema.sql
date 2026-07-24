-- ============================================================
-- Worker Management System — MySQL Schema
-- For use with XAMPP (phpMyAdmin or mysql CLI)
-- ============================================================

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS worker_management
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE worker_management;

-- ============================================================
-- 2. Table: workers
-- Stores every worker (and the admin account) that can log in
-- ============================================================
CREATE TABLE IF NOT EXISTS workers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30),
    department VARCHAR(100),
    position VARCHAR(100),
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    work_start_time TIME NOT NULL DEFAULT '09:00:00',
    work_end_time TIME NOT NULL DEFAULT '17:00:00',
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. Table: attendance
-- One row per worker per day they check in
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    check_in_time DATETIME NOT NULL,
    check_out_time DATETIME NULL,
    status ENUM('on_time', 'late') NOT NULL DEFAULT 'on_time',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    INDEX idx_worker_checkin (worker_id, check_in_time)
);

-- ============================================================
-- 4. Table: late_reports
-- Created automatically whenever a worker checks in late
-- ============================================================
CREATE TABLE IF NOT EXISTS late_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    attendance_id INT NOT NULL,
    scheduled_time TIME NOT NULL,
    actual_time TIME NOT NULL,
    minutes_late INT NOT NULL,
    report_date DATE NOT NULL,
    is_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    FOREIGN KEY (attendance_id) REFERENCES attendance(id) ON DELETE CASCADE,
    INDEX idx_report_date (report_date)
);

-- ============================================================
-- 5. Seed data: one admin account
-- employee_id: ADMIN001
-- password:    admin123   (change this after first login!)
-- ============================================================
INSERT INTO workers
    (full_name, email, phone, department, position, employee_id, password_hash, work_start_time, work_end_time, status)
VALUES
    ('System Admin', 'admin@company.com', '0000000000', 'Management', 'Administrator', 'ADMIN001',
     '$2b$10$tKIuq0pzlb1DPyAWACFdbuPoLsrELh.7uWtcEEPKpwi13CfjPlKUK',
     '09:00:00', '17:00:00', 'active');

-- ============================================================
-- 6. (Optional) Sample worker for testing
-- employee_id: EMP001
-- password:    admin123   (same hash reused for convenience)
-- ============================================================
INSERT INTO workers
    (full_name, email, phone, department, position, employee_id, password_hash, work_start_time, work_end_time, status)
VALUES
    ('Jane Doe', 'jane.doe@company.com', '0712345678', 'Engineering', 'Developer', 'EMP001',
     '$2b$10$tKIuq0pzlb1DPyAWACFdbuPoLsrELh.7uWtcEEPKpwi13CfjPlKUK',
     '09:00:00', '17:00:00', 'active');
