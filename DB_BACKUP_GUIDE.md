# Daily Database Backup - Documentation

## Overview

The Tannery Mini ERP database is automatically backed up twice daily using a cron job that runs `mysqldump` and stores compressed `.sql.gz` files on the server.

---

## Backup Schedule

| Time  | Frequency |
|-------|-----------|
| 2:00 PM (14:00) | Daily |
| 8:00 PM (20:00) | Daily |

---

## Server Details

- **Server:** serv-b47ce278 (103.86.177.237)
- **Database:** tannery_mini_erp
- **DB Port:** 3306
- **Backup Location:** `/var/www/backups/db/`
- **Script Location:** `/var/www/scripts/db_backup.sh`
- **Retention:** 30 days (older backups are auto-deleted)

---

## Backup Script

**File:** `/var/www/scripts/db_backup.sh`

```bash
#!/bin/bash
BACKUP_DIR="/var/www/backups/db"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M")

mysqldump -h 103.86.177.237 -P 3306 -u root -p'Shoe@123' tannery_mini_erp | gzip > "$BACKUP_DIR/tannery_mini_erp_${TIMESTAMP}.sql.gz"

# Delete backups older than 30 days
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete
```

---

## Cron Job Configuration

```
0 14 * * * /var/www/scripts/db_backup.sh
0 20 * * * /var/www/scripts/db_backup.sh
```

To view current cron jobs:
```bash
crontab -l
```

To edit cron jobs:
```bash
crontab -e
```

---

## Backup File Format

Files are named with timestamp for easy identification:

```
tannery_mini_erp_2026-07-27_14-00.sql.gz
tannery_mini_erp_2026-07-27_20-00.sql.gz
```

---

## How to Restore a Backup

### Step 1: List available backups
```bash
ls -la /var/www/backups/db/
```

### Step 2: Restore from a specific backup
```bash
gunzip < /var/www/backups/db/tannery_mini_erp_2026-07-27_14-00.sql.gz | mysql -h 103.86.177.237 -P 3306 -u root -p'Shoe@123' tannery_mini_erp
```

> ⚠️ **Warning:** Restoring will overwrite all current data in the database with the backup data.

---

## Manual Backup (On Demand)

To trigger a backup manually at any time:
```bash
/var/www/scripts/db_backup.sh
```

Then verify:
```bash
ls -la /var/www/backups/db/
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backup file is 0 bytes | Check DB credentials and network connectivity |
| Cron not running | Run `crontab -l` to verify jobs exist |
| Disk full | Check with `df -h`, delete old backups manually |
| Permission denied | Run `sudo chmod +x /var/www/scripts/db_backup.sh` |

---

## Setup Steps (For Reference)

These steps were used to set up the backup system:

```bash
# 1. Create directories
sudo mkdir -p /var/www/scripts
sudo mkdir -p /var/www/backups/db

# 2. Create the backup script
sudo nano /var/www/scripts/db_backup.sh

# 3. Make it executable
sudo chmod +x /var/www/scripts/db_backup.sh

# 4. Add cron jobs
crontab -e
# Add the two lines (2 PM and 8 PM)

# 5. Verify
crontab -l
```
