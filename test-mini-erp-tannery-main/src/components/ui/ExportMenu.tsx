import { useState, useRef, useEffect } from 'react';
import { Download, Eye, FileDown, FileSpreadsheet } from 'lucide-react';

interface ExportMenuProps {
  onPreview: () => void;
  onDownload: () => void;
  onExcel?: () => void;
}

export default function ExportMenu({ onPreview, onDownload, onExcel }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="hidden sm:flex p-2 rounded-lg border border-sky-200 text-sky-500 hover:bg-sky-50 hover:border-sky-300 transition-all"
      >
        <Download size={15} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
          <button
            onClick={() => { onPreview(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gradient-to-r hover:from-sky-50 hover:to-blue-50 hover:text-sky-700 transition-all"
          >
            <Eye size={14} className="text-sky-500" />
            Preview PDF
          </button>
          <div className="border-t border-gray-50" />
          <button
            onClick={() => { onDownload(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-700 transition-all"
          >
            <FileDown size={14} className="text-emerald-500" />
            Download PDF
          </button>
          {onExcel && (
            <>
              <div className="border-t border-gray-50" />
              <button
                onClick={() => { onExcel(); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 transition-all"
              >
                <FileSpreadsheet size={14} className="text-green-600" />
                Download Excel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
