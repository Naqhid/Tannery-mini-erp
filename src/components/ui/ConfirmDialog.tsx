import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title = 'Confirm Delete',
  message = 'Are you sure you want to delete this record? This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[70] flex items-center justify-center" onClick={onCancel}>
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-2xl mx-3 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-red-100/50 bg-gradient-to-r from-red-50 via-rose-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-200/50">
                <AlertTriangle size={18} className="text-white" />
              </div>
              <h2 className="text-base font-bold text-gray-900">{title}</h2>
            </div>
            <button onClick={onCancel} className="p-2 rounded-lg hover:bg-white/70 text-gray-400 hover:text-gray-600 transition-all">
              <X size={18} />
            </button>
          </div>
        </div>
        {/* Body */}
        <div className="px-5 py-5">
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>
        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gradient-to-r from-slate-50 to-red-50/30 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all active:scale-95"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-lg shadow-md shadow-red-200 hover:shadow-lg hover:shadow-red-300 transition-all active:scale-95"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
