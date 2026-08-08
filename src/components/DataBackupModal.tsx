import React, { useRef } from 'react';
import { Database, Download, Upload, RefreshCw, X, ShieldCheck, HardDrive } from 'lucide-react';

interface DataBackupModalProps {
  onExportData: () => void;
  onImportData: (file: File) => void;
  onResetData: () => void;
  onClose: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  onExportData,
  onImportData,
  onResetData,
  onClose
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportData(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
        
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-500" />
            <span>النسخ الاحتياطي وإدارة البيانات (IndexedDB)</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Storage Persistence Status Banner */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
              <span>قواعد البيانات المحلية نشطة</span>
              <span className="text-[9px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded font-mono">IndexedDB + LocalStorage</span>
            </h4>
            <p className="text-[11px] text-emerald-800 leading-snug mt-0.5">
              جميع التعديلات، التقارير، والديزل تُحفظ تلقائياً في متصفحك دون ضياع، مع إمكانية التصدير والاستعادة في أي وقت.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          
          {/* Export JSON Backup */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-slate-600" />
                <span>تصدير نسخة احتياطية (JSON)</span>
              </h4>
              <p className="text-[10px] text-slate-500">تحميل كافة السجلات والمعدات والديزل في ملف آمن</p>
            </div>
            <button
              onClick={onExportData}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>تحميل</span>
            </button>
          </div>

          {/* Import JSON Backup */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-900">استعادة نسخة احتياطية</h4>
              <p className="text-[10px] text-slate-500">رفع ملف JSON محفوظ سابقاً لاستعادة البيانات</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>رفع ملف</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>

          {/* Reset to Initial Data */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-rose-950">إعادة ضبط البيانات الأولية</h4>
              <p className="text-[10px] text-rose-700">استرجاع عينة البيانات الاحترافية الافتراضية</p>
            </div>
            <button
              onClick={onResetData}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة ضبط</span>
            </button>
          </div>

        </div>

        <div className="pt-2 border-t text-left">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
