# Setting up the database in XAMPP

## 1. Start MySQL in XAMPP
Open the **XAMPP Control Panel** and click **Start** next to **MySQL**.
(You don't need Apache running unless you're also serving PHP files.)

## 2. Open phpMyAdmin
Click **Admin** next to MySQL in the XAMPP panel, or go to:
```
http://localhost/phpmyadmin
```

## 3. Import the schema
1. Click the **Import** tab at the top
2. Click **Choose File** and select `schema.sql` (in this `database/` folder)
3. Scroll down and click **Go**

This will:
- Create the `worker_management` database
- Create the `workers`, `attendance`, and `late_reports` tables
- Insert one **admin** login and one **sample worker** login for testing

## 4. Test accounts created

| Role | employee_id | password |
|---|---|---|
| Admin | `ADMIN001` | `admin123` |
| Worker | `EMP001` | `admin123` |

⚠️ Change these passwords once you've confirmed everything works — they're only meant for local testing.

## 5. Match your `.env` to XAMPP's defaults
XAMPP's MySQL normally runs with:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=worker_management
```
(no password on `root` by default — leave `DB_PASSWORD` empty unless you've set one)

## 6. Verify it worked
In phpMyAdmin's left sidebar, click on `worker_management` — you should see three tables:
`workers`, `attendance`, `late_reports`, with the admin and sample worker rows already inside `workers`.

## Alternative: import via command line
If you prefer Git Bash / terminal instead of phpMyAdmin:
```bash
cd /path/to/xampp/mysql/bin
./mysql -u root -p < path/to/schema.sql
```
(leave the password blank when prompted, since XAMPP's root has none by default)
