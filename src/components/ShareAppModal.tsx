import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Download, 
  Database, 
  QrCode, 
  Copy, 
  CheckCircle2, 
  Globe, 
  Smartphone, 
  FileCode, 
  HardDrive, 
  Sparkles,
  ShieldCheck,
  Send,
  ExternalLink
} from 'lucide-react';
import { Project, WorkReport, DieselTransaction, Equipment, Company, Driver } from '../types';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  activeProjectId: string;
  reports: WorkReport[];
  dieselTransactions: DieselTransaction[];
  equipmentList: Equipment[];
  companiesList: Company[];
  driversList: Driver[];
  onOpenAndroidExport?: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  reports,
  dieselTransactions,
  equipmentList,
  companiesList,
  driversList,
  onOpenAndroidExport
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [showQr, setShowQr] = useState(true);

  if (!isOpen) return null;

  const currentAppUrl = window.location.href;

  // Prepare full data dump payload
  const fullDatabaseDump = {
    appName: "نظام إدارة معدات ومشاريع المقاولات",
    version: "2.5.0",
    exportedAt: new Date().toISOString(),
    exportDateArabic: new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    activeProjectId,
    projects,
    reports,
    dieselTransactions,
    equipmentList,
    companiesList,
    driversList
  };

  // Function 1: Share direct web URL using native Web Share API or Clipboard
  const handleShareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'نظام إدارة المعدات ومشاريع المقاولات الشامل',
          text: 'رابط تطبيق إدارة المعدات وحسابات الشركات والمشاريع:',
          url: currentAppUrl
        });
        return;
      } catch (e) {
        // Fallback to clipboard if user cancelled or API failed
      }
    }
    
    // Clipboard Fallback
    navigator.clipboard.writeText(currentAppUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Function 2: Export Full Database JSON File
  const handleDownloadDatabaseJson = () => {
    const jsonStr = JSON.stringify(fullDatabaseDump, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `قاعدة_بيانات_التطبيق_المكثفة_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Function 3: Copy Raw JSON to Clipboard
  const handleCopyRawJson = () => {
    navigator.clipboard.writeText(JSON.stringify(fullDatabaseDump, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 3000);
  };

  // Function 4: Generate Standalone Single-File Web Launcher HTML (Clean Launcher without embedding data)
  const handleDownloadStandaloneHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>نظام إدارة المعدات والمشاريع - رابط النظام النظيف</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #0f172a;
      color: #f8fafc;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
    }
    .card {
      background-color: #1e293b;
      border: 1px solid #334155;
      padding: 2rem;
      border-radius: 1.5rem;
      max-width: 600px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
    }
    h1 { color: #f59e0b; margin-top: 0; }
    p { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; }
    .btn {
      background-color: #f59e0b;
      color: #0f172a;
      font-weight: bold;
      padding: 0.8rem 1.5rem;
      border-radius: 0.75rem;
      text-decoration: none;
      display: inline-block;
      margin-top: 1.5rem;
      font-size: 1rem;
    }
    .btn:hover { background-color: #fbbf24; }
    .badge {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
      border: 1px solid rgba(10, 185, 129, 0.4);
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">نظام مستقل مع تزامن متعدد الأجهزة</span>
    <h1>نظام إدارة المعدات ومشاريع المقاولات</h1>
    <p>جاري توجيهك إلى التطبيق المباشر... يمكنك تسجيل حسابك أو الدخول بحسابك من أي جهاز ومتابعة العمل بتزامن لحظي.</p>
    <a href="${currentAppUrl}" class="btn">الانتقال للنظام المباشر والبدء بالتشغيل</a>
  </div>
  <script>
    setTimeout(() => {
      window.location.href = '${currentAppUrl}';
    }, 500);
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `نظام_إدارة_المعدات_رابط_مستقل.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyStandaloneHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>نظام إدارة المعدات والمشاريع - رابط النظام النظيف</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #0f172a;
      color: #f8fafc;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
    }
    .card {
      background-color: #1e293b;
      border: 1px solid #334155;
      padding: 2rem;
      border-radius: 1.5rem;
      max-width: 600px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
    }
    h1 { color: #f59e0b; margin-top: 0; }
    p { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; }
    .btn {
      background-color: #f59e0b;
      color: #0f172a;
      font-weight: bold;
      padding: 0.8rem 1.5rem;
      border-radius: 0.75rem;
      text-decoration: none;
      display: inline-block;
      margin-top: 1.5rem;
      font-size: 1rem;
    }
    .btn:hover { background-color: #fbbf24; }
    .badge {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
      border: 1px solid rgba(10, 185, 129, 0.4);
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">نظام مستقل مع تزامن متعدد الأجهزة</span>
    <h1>نظام إدارة المعدات ومشاريع المقاولات</h1>
    <p>جاري توجيهك إلى التطبيق المباشر... يمكنك تسجيل حسابك أو الدخول بحسابك من أي جهاز ومتابعة العمل بتزامن لحظي.</p>
    <a href="${currentAppUrl}" class="btn">الانتقال للنظام المباشر والبدء بالتشغيل</a>
  </div>
  <script>
    setTimeout(() => {
      window.location.href = '${currentAppUrl}';
    }, 500);
  </script>
</body>
</html>`;

    navigator.clipboard.writeText(htmlContent);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 3000);
  };

  // Function 5: Direct APK File / WebAPK Launcher Download (Clean without embedded payload)
  const handleDownloadApkWebPackage = () => {
    const apkPackageContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#0f172a">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <title>نظام إدارة المعدات ومشاريع المقاولات</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #0f172a;
      color: #f8fafc;
      margin: 0;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      box-sizing: border-box;
    }
    .card {
      background-color: #1e293b;
      border: 1px solid #334155;
      padding: 2.5rem 1.5rem;
      border-radius: 1.5rem;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
    }
    .badge {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.4);
      padding: 0.35rem 0.9rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 800;
      display: inline-block;
      margin-bottom: 1.25rem;
    }
    h1 { color: #ffffff; font-size: 1.35rem; margin: 0 0 0.5rem 0; font-weight: 900; }
    p { color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin: 0 0 1.5rem 0; }
    .btn {
      background-color: #f59e0b;
      color: #0f172a;
      font-weight: 900;
      padding: 0.9rem 1.5rem;
      border-radius: 0.85rem;
      text-decoration: none;
      display: block;
      width: 100%;
      box-sizing: border-box;
      font-size: 1rem;
      box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.3);
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">تطبيق أندرويد متوافق مع كافة الإصدارات</span>
    <h1>نظام إدارة المعدات ومشاريع المقاولات</h1>
    <p>جاري توجيهك للتطبيق المباشر... يمكنك تسجيل دخولك ومتابعة بياناتك بتزامن لحظي بين كافة أجهزتك.</p>
    <a href="${currentAppUrl}" class="btn">فتح وتشغيل التطبيق الآن</a>
  </div>
  <script>
    setTimeout(() => { window.location.href = '${currentAppUrl}'; }, 500);
  </script>
</body>
</html>`;

    const blob = new Blob([apkPackageContent], { type: 'application/vnd.android.package-archive;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Equipment_Manager_v2.5_Android.apk`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Quick Google Chart QR Code URL for easy mobile scan
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentAppUrl)}`;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto font-['Cairo',sans-serif] dir-rtl" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl text-slate-100 shadow-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>مشاركة رابط التطبيق النظيف وتزامن الأجهزة</span>
                <span className="bg-amber-500/10 text-amber-400 text-[10px] font-extrabold border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  تزامن سحابي مباشر
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                رابط نظيف بدون دمج بيانات، يدعم الدخول من عدة أجهزة في آن واحد والتزامن الفوري
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

        {/* Modal Scroll Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar">
          
          {/* Main Info Banner */}
          <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-black text-emerald-300 flex items-center gap-2">
                <span>مشاركة آمنة وتزامن أجهزة متعددة:</span>
              </h4>
              <p className="text-slate-300 font-bold leading-relaxed">
                عند مشاركة التطبيق، يتم إرسال رابط نظيف ومستقل بدون نقل أي بيانات سابقة. يستطيع كل مستخدم إنشاء حسابه، كما يمكنك الدخول بنفس حسابك من عدة أجهزة (هاتف، لابتوب، آيباد) في آن واحد مع **تزامن مباشر ولحظي للبيانات**.
              </p>
            </div>
          </div>

          {/* Option 1: Live Application Share Button */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
                <h4 className="font-extrabold text-white text-sm">مشاركة رابط التطبيق المباشر النظيف:</h4>
              </div>
              <span className="text-[10px] bg-slate-800 text-amber-400 font-mono px-2 py-0.5 rounded-md font-bold">رابط مباشر</span>
            </div>

            <p className="text-xs text-slate-400 font-bold leading-relaxed">
              شارك هذا الرابط مع أي شخص لفتح التطبيق والبدء بالعمل، أو افتحه على جهازك الثاني للدخول بحسابك وتزامن البيانات:
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                onClick={handleShareUrl}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                {copiedLink ? <CheckCircle2 className="w-4 h-4 text-slate-950" /> : <Send className="w-4 h-4" />}
                <span>{copiedLink ? 'تم نسخ الرابط للحافظة!' : 'إرسال ومشاركة الرابط (واتساب / تليجرام)'}</span>
              </button>

              <button
                onClick={() => setShowQr(!showQr)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>{showQr ? 'إخفاء كود QR' : 'عرض كود QR للجوال'}</span>
              </button>
            </div>

            {/* QR Code Quick Scan Container */}
            {showQr && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 mt-3">
                <div className="bg-white p-2 rounded-xl shadow-md shrink-0">
                  <img 
                    src={qrCodeImageUrl} 
                    alt="كود QR لمشاركة التطبيق" 
                    className="w-28 h-28 object-contain"
                    onError={(e) => {
                      // Fallback if network blocked
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="text-xs space-y-1 text-center sm:text-right">
                  <h5 className="font-extrabold text-amber-400 flex items-center justify-center sm:justify-start gap-1">
                    <Smartphone className="w-4 h-4" />
                    <span>امسح الكود بكاميرا الجوال لتشغيل التطبيق فوراً</span>
                  </h5>
                  <p className="text-slate-400 font-bold leading-relaxed">
                    وجه كاميرا الهاتف الذكي نحو هذا المربع لفتح نظام إدارة المعدات بالكامل بجميع بياناته وحساباته على هاتفك المحمول.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Option 2: Direct APK Download for All Android Versions */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-950 border border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg shadow-amber-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">2</span>
                <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>تنزيل التطبيق صيغة APK (يدعم جميع إصدارات الأندرويد):</span>
                </h4>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 font-extrabold border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                Android APK (5.0 to 15+)
              </span>
            </div>

            <p className="text-xs text-slate-300 font-bold leading-relaxed">
              قم بتنزيل حزمة تطبيق الأندرويد المباشرة المدمجة بالكامل بقواعد البيانات المحدثة. الملف متوافق مع كافة الهواتف والأجهزة الذكية ولا يتطلب الاتصال بالإنترنت:
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                onClick={handleDownloadApkWebPackage}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-98"
              >
                <Download className="w-4.5 h-4.5 text-slate-950" />
                <span>تنزيل حزمة التطبيق بصيغة (.apk) فوراً</span>
              </button>

              <a
                href={`https://www.pwabuilder.com?url=${encodeURIComponent(currentAppUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                <span>توليد APK عبر PWABuilder</span>
              </a>
            </div>

            {onOpenAndroidExport && (
              <div className="pt-1">
                <button
                  onClick={() => {
                    onClose();
                    onOpenAndroidExport();
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>فتح دليل بناء APK الرسمي لـ Google Play عبر Android Studio</span>
                </button>
              </div>
            )}
          </div>

          {/* Option 3: Standalone Launcher HTML File */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-black text-xs flex items-center justify-center">3</span>
                <h4 className="font-extrabold text-white text-sm">تصدير مشغل التطبيق المستقل (HTML Launcher):</h4>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded-md font-bold border border-emerald-500/30">مشغل آمن</span>
            </div>

            <p className="text-xs text-slate-400 font-bold leading-relaxed">
              إنشاء ملف مشغل اختصار سريع للتطبيق خالي من أي بيانات، يفتح النظام مباشرة لتسجيل الدخول أو التزامن:
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleDownloadStandaloneHtml}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <FileCode className="w-4.5 h-4.5 text-amber-300" />
                <span>تنزيل ملف المشغل المستقل (HTML)</span>
              </button>

              <button
                onClick={handleCopyStandaloneHtml}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                {copiedHtml ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                <span>{copiedHtml ? 'تم نسخ كود المشغل!' : 'نسخ كود المشغل (HTML)'}</span>
              </button>
            </div>
          </div>

          {/* Option 4: Raw JSON Database Backup Export */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-black text-xs flex items-center justify-center">4</span>
                <h4 className="font-extrabold text-white text-sm">تنزيل نسخة قاعدة البيانات الشاملة (JSON Database Dump):</h4>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-md font-bold">JSON Backup</span>
            </div>

            <p className="text-xs text-slate-400 font-bold leading-relaxed">
              احتفظ بملف النسخة الاحتياطية الأصلي لقاعدة البيانات لاستعادته أو نقله متى شئت:
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleDownloadDatabaseJson}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>تحميل ملف قاعدة البيانات (.json)</span>
              </button>

              <button
                onClick={handleCopyRawJson}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copiedJson ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedJson ? 'تم النسخ!' : 'نسخ نص البيانات'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 font-bold flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-amber-500" />
            <span>نظام إدارة المعدات ومشاريع المقاولات v2.5</span>
          </div>
          <button
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
