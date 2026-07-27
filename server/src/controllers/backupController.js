import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BACKUP_DIR = process.env.BACKUP_DIR || '/var/www/backups/db';

// Ensure backup directory exists
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

// List all backups
export async function listBackups(req, res) {
  try {
    ensureBackupDir();

    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.sql.gz'))
      .map(filename => {
        const filepath = path.join(BACKUP_DIR, filename);
        const stats = fs.statSync(filepath);
        return {
          filename,
          size: stats.size,
          sizeFormatted: formatFileSize(stats.size),
          createdAt: stats.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ backups: files, backupDir: BACKUP_DIR });
  } catch (error) {
    console.error('Error listing backups:', error);
    res.status(500).json({ error: 'Failed to list backups' });
  }
}

// Create a new backup
export async function createBackup(req, res) {
  try {
    ensureBackupDir();

    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '3306';
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'tannery_mini_erp';

    const timestamp = new Date().toISOString().replace(/[T:]/g, '-').split('.')[0];
    const filename = `${dbName}_${timestamp}.sql.gz`;
    const filepath = path.join(BACKUP_DIR, filename);

    const command = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} -p'${dbPassword}' ${dbName} | gzip > "${filepath}"`;

    await execAsync(command);

    // Verify file was created
    if (!fs.existsSync(filepath)) {
      return res.status(500).json({ error: 'Backup file was not created' });
    }

    const stats = fs.statSync(filepath);

    res.json({
      message: 'Backup created successfully',
      backup: {
        filename,
        size: stats.size,
        sizeFormatted: formatFileSize(stats.size),
        createdAt: stats.mtime.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup: ' + error.message });
  }
}

// Download a backup file
export async function downloadBackup(req, res) {
  try {
    const { filename } = req.params;

    // Security: prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filepath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    // Give it a .sql download name (strip .gz from filename for user-friendly download)
    const downloadName = filename.endsWith('.sql.gz') ? filename.replace('.gz', '') : filename;

    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);

    // Decompress on the fly so user gets a ready-to-use .sql file
    const { createGunzip } = await import('zlib');
    const gunzip = createGunzip();
    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(gunzip).pipe(res);
  } catch (error) {
    console.error('Error downloading backup:', error);
    res.status(500).json({ error: 'Failed to download backup' });
  }
}

// Delete a backup file
export async function deleteBackup(req, res) {
  try {
    const { filename } = req.params;

    // Security: prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filepath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    fs.unlinkSync(filepath);
    res.json({ message: 'Backup deleted successfully' });
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({ error: 'Failed to delete backup' });
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
