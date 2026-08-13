import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  QrCode, 
  Copy, 
  CheckCircle2, 
  Send
} from 'lucide-react';
import { Project, WorkReport, DieselTransaction, Equipment, Company, Driver } from '../types';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects?: Project[];
  activeProjectId?: string;
  reports?: WorkReport[];
  dieselTransactions?: DieselTransaction[];
  equipmentList?: Equipment[];
  companiesList?: Company[];
  driversList?: Driver[];
  onOpenAndroidExport?: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQr, setShowQr] = useState(true);

  if (!isOpen) return null;

  const currentAppUrl = window.location.href;

  const handleShareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'نظام إدارة المعدات ومشاريع المقاولات',
          text: 'رابط تطبيق إدارة المعدات والمشاريع:',
          url: currentAppUrl
        });
        return;
      } catch (e) {
        // Fallback
      }
    }
    
    navigator.clipboard.writeText(currentAppUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentAppUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentAppUrl)}`;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto font-['Cairo',sans-serif] dir-rtl" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg text-slate-100 shadow-2xl my-8 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>مشاركة رابط التطبيق وتزامن الأجهزة</span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  تزامن سحابي مباشر
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                يدعم الدخول من عدة أجهزة في آن واحد والتزامن الفوري
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Link Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <label className="text-xs font-bold text-slate-300 block">
              رابط التطبيق:
            </label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2.5">
              <input
                type="text"
                readOnly
                value={currentAppUrl}
                className="bg-transparent text-xs text-amber-400 font-mono w-full outline-none ltr text-left"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer"
              >
                {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'تم النسخ!' : 'نسخ'}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={handleShareUrl}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>مشاركة الرابط</span>
            </button>

            <button
              type="button"
              onClick={() => setShowQr(!showQr)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>{showQr ? 'إخفاء رمز QR' : 'عرض رمز QR'}</span>
            </button>
          </div>

          {/* QR Code */}
          {showQr && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-3">
              <div className="bg-white p-3 rounded-2xl shadow-md">
                <img 
                  src={qrCodeImageUrl} 
                  alt="رمز QR لمشاركة التطبيق" 
                  className="w-36 h-36 object-contain"
                />
              </div>
              <p className="text-xs text-slate-400 font-bold text-center">
                امسح الرمز بكاميرا الجوال لفتح التطبيق مباشرة
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
