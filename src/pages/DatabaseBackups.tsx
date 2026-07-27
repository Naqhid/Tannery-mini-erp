import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Download, Trash2, Plus, HardDrive, RefreshCw } from 'lucide-react';
import api from '../lib/api';

interface Backup {
  filename: string;
  size: number;
  sizeFormatted: string;
  createdAt: string;
}

interface BackupListResponse {
  backups: Backup[];
  backupDir: string;
}

interface CreateBackupResponse {
  message: string;
  backup: Backup;
}

export default function DatabaseBackups() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const data = await api<BackupListResponse>('/backups');
      setBackups(data.backups);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load backups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      const data = await api<CreateBackupResponse>('/backups/create', { method: 'POST' });
      toast.success(data.message);
      fetchBackups();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create backup');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = (filename: string) => {
    const token = localStorage.getItem('tannery_token');
    const baseUrl = import.meta.env.VITE_API_BASE || '/api';
    const url = `${baseUrl}/backups/download/${encodeURIComponent(filename)}`;

    // Use a hidden anchor with token in header via fetch + blob
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Download failed');
        return res.blob();
      })
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      })
      .catch(() => toast.error('Failed to download backup'));
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

    try {
      setDeleting(filename);
      await api(`/backups/${encodeURIComponent(filename)}`, { method: 'DELETE' });
      toast.success('Backup deleted');
      fetchBackups();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete backup');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <HardDrive size={28} />
            Database Backups
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage database backup files. Auto backups run daily at 2:00 PM & 8:00 PM.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchBackups}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleCreateBackup}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Plus size={16} />
            {creating ? 'Creating...' : 'Create Backup Now'}
          </button>
        </div>
      </div>

      {/* Backup List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <p className="text-sm font-medium text-gray-600">
            {backups.length} backup{backups.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <RefreshCw size={24} className="animate-spin mx-auto mb-3" />
            Loading backups...
          </div>
        ) : backups.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <HardDrive size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No backups found</p>
            <p className="text-sm mt-1">Click "Create Backup Now" to generate your first backup.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {backups.map((backup) => (
              <div
                key={backup.filename}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{backup.filename}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-500">{formatDate(backup.createdAt)}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {backup.sizeFormatted}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(backup.filename)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Download backup"
                  >
                    <Download size={14} />
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(backup.filename)}
                    disabled={deleting === backup.filename}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Delete backup"
                  >
                    <Trash2 size={14} />
                    {deleting === backup.filename ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
