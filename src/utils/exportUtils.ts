import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { WorkReport, DieselTransaction, ProjectInfo } from '../types';

/**
 * Format currency with custom currency symbol (defaults to 'ر.ي' or provided symbol)
 */
export const formatCurrency = (amount: number, currencySymbol: string = 'ر.ي') => {
  const formatted = (amount || 0).toLocaleString('ar-SA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  return `${formatted} ${currencySymbol}`;
};

/**
 * Format decimal hours into digital clock format HH:MM (e.g., 5.5833 -> 05:35)
 */
export const formatHoursDigital = (decimalHours: number): string => {
  if (!decimalHours || isNaN(decimalHours) || decimalHours <= 0) return '00:00';
  const totalMinutes = Math.round(decimalHours * 60);
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hrs)}:${pad(mins)}`;
};

/**
 * Format date in localized Arabic format
 */
export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return dateString;
  }
};

/**
 * Export Work Reports to Excel (.xlsx)
 */
export const exportReportsToExcel = (reports: WorkReport[], filename: string = 'تقارير_العمل_والمعدات.xlsx') => {
  const dataToExport = reports.map((r, idx) => ({
    '#': idx + 1,
    'رقم التقرير': r.reportNumber,
    'التاريخ': r.date,
    'نوع العقد': getContractTypeName(r.contractType),
    'اسم الشركة': r.companyName,
    'اسم المعدة': r.equipmentName,
    'رقم اللوحة': r.equipmentRegNumber,
    'اسم السائق': r.driverName,
    'موقع العمل': r.workLocation || '-',
    'بند العمل': r.workItem || '-',
    'ساعات العمل': r.totalNetHours,
    'قراءة العداد (بداية)': r.meterStart,
    'قراءة العداد (نهاية)': r.meterEnd,
    'الكمية بالمتـر': r.quantityMeters || '-',
    'الفئات / السعر': r.ratePerUnit,
    'المبلغ الإجمالي': r.grossAmount,
    'تكلفة الديزل': r.costs?.dieselTotalCost || 0,
    'سلفة السائق اليومية': r.driverAdvance || 0,
    'الصافي المستحق': r.netCompanyDue,
    'الملاحظات': r.notes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'سجلات العمل');
  
  // Set sheet directional properties if available
  worksheet['!dir'] = 'rtl';
  
  XLSX.writeFile(workbook, filename);
};

/**
 * Export Diesel Transactions to Excel (.xlsx)
 */
export const exportDieselToExcel = (transactions: DieselTransaction[], filename: string = 'سجل_مخزن_الديزل.xlsx') => {
  const dataToExport = transactions.map((t, idx) => ({
    '#': idx + 1,
    'التاريخ': t.date,
    'نوع العملية': t.type === 'receive' ? 'استلام (وارد)' : 'صرف لمعدة (صادر)',
    'رقم سند الصرف/الاستلام': t.voucherNumber || '-',
    'رقم الفاتورة / أمر التوريد': t.invoiceNumber || '-',
    'الكمية (لتر)': t.quantityLiters,
    'سعر اللتر': t.pricePerLiter,
    'التكلفة الإجمالية': t.totalCost,
    'الجهة / المعدة المستفيدة': t.type === 'receive' ? (t.equipmentName || 'مخزن المشروع الرئيسي') : (t.equipmentName || '-'),
    'اسم المستلم (أمين المخزن/السائق)': t.driverName || '-',
    'سائق ناقلة التوريد (الوايت)': t.deliveryDriverName || '-',
    'وارد من (المورد / المصدر)': t.type === 'receive' ? (t.supplierOrSource || '-') : 'مخزن المشروع',
    'ملاحظات': t.notes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'حركات الديزل');
  worksheet['!dir'] = 'rtl';

  XLSX.writeFile(workbook, filename);
};

/**
 * Helper to translate contract type key
 */
export const getContractTypeName = (type: string) => {
  switch (type) {
    case 'daily': return 'يومي';
    case 'salary': return 'راتب';
    case 'hourly': return 'ساعة';
    case 'meter': return 'متر';
    case 'monthly': return 'شهري';
    default: return type;
  }
};

/**
 * Export Work Reports to PDF document with rich Arabic formatting, KPI cards, and print trigger
 */
export const exportReportsToPDF = (
  reports: WorkReport[], 
  projectInfo: ProjectInfo, 
  title: string = 'كشف تقارير يومية العمل والمعدات',
  filterSummary?: string
) => {
  const totalGross = reports.reduce((acc, curr) => acc + (curr.grossAmount || 0), 0);
  const totalAdvances = reports.reduce((acc, curr) => acc + (curr.driverAdvance || 0), 0);
  const totalNet = reports.reduce((acc, curr) => acc + (curr.netCompanyDue || 0), 0);
  const totalHours = reports.reduce((acc, curr) => acc + (curr.totalNetHours || 0), 0);

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const todayStr = new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });

  const rowsHtml = reports.length === 0 ? `
    <tr>
      <td colSpan="12" style="padding: 20px; text-align: center; color: #94a3b8; font-weight: bold;">
        لا توجد تقارير مطابقة لمحددات البحث
      </td>
    </tr>
  ` : reports.map((r, i) => `
    <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 8px 10px; text-align: center; font-weight: bold; color: #d97706;">${i + 1}</td>
      <td style="padding: 8px 10px; text-align: center; font-weight: bold; color: #0f172a;">${r.reportNumber}</td>
      <td style="padding: 8px 10px; text-align: center; font-size: 11px;">${r.date}</td>
      <td style="padding: 8px 10px; font-weight: bold; color: #0f172a;">
        ${r.equipmentName}
        ${r.equipmentRegNumber ? `<div style="font-size: 10px; color: #64748b; font-weight: normal;">${r.equipmentRegNumber}</div>` : ''}
      </td>
      <td style="padding: 8px 10px; color: #334155;">${r.companyName || '-'}</td>
      <td style="padding: 8px 10px; color: #334155;">${r.driverName || '-'}</td>
      <td style="padding: 8px 10px; color: #475569;">${r.workLocation || '-'}</td>
      <td style="padding: 8px 10px; color: #475569;">${r.workItem || '-'}</td>
      <td style="padding: 8px 10px; text-align: center; font-weight: bold; color: #2563eb;">${formatHoursDigital(r.totalNetHours || 0)}</td>
      <td style="padding: 8px 10px; text-align: center; font-weight: bold; color: #16a34a;">${(r.grossAmount || 0).toLocaleString('ar-SA')} ${projectInfo.currency || 'ر.ي'}</td>
      <td style="padding: 8px 10px; text-align: center; font-weight: bold; color: #dc2626;">${(r.driverAdvance || 0).toLocaleString('ar-SA')} ${projectInfo.currency || 'ر.ي'}</td>
      <td style="padding: 8px 10px; text-align: left; font-weight: 900; color: #059669;">${(r.netCompanyDue || 0).toLocaleString('ar-SA')} ${projectInfo.currency || 'ر.ي'}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; font-family: 'Cairo', sans-serif; }
          body { padding: 25px; margin: 0; background: #fff; color: #0f172a; direction: rtl; font-size: 12px; }
          .document-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
          .project-title { font-size: 20px; font-weight: 900; color: #0f172a; margin: 0; }
          .project-sub { font-size: 12px; color: #475569; margin-top: 4px; font-weight: 600; }
          .report-badge { background: #f59e0b; color: #0f172a; padding: 4px 12px; border-radius: 6px; font-weight: 900; font-size: 13px; display: inline-block; }
          .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
          .kpi-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; }
          .kpi-title { font-size: 10px; color: #64748b; font-weight: 700; }
          .kpi-value { font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          th { background: #0f172a; color: #ffffff; padding: 10px; font-weight: 800; text-align: right; border: 1px solid #0f172a; }
          td { border: 1px solid #e2e8f0; }
          .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 40px; text-align: center; }
          .sig-box { border-top: 2px stroke #cbd5e1; padding-top: 10px; font-weight: 700; color: #334155; }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: left; background: #f1f5f9; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: bold; color: #334155;">جاهز للطباعة وتصدير PDF (اضغط زر الطباعة أو استخدم Ctrl+P وحفظ كـ PDF)</span>
          <button onclick="window.print()" style="background: #0f172a; color: white; border: none; padding: 8px 18px; border-radius: 6px; font-weight: bold; cursor: pointer; font-family: 'Cairo', sans-serif;">
            🖨️ طباعة / حفظ كـ PDF
          </button>
        </div>

        <div class="document-header">
          <div>
            <h1 class="project-title">${projectInfo.name || 'مشروع إدارة المعدات والمباني'}</h1>
            <div class="project-sub">${projectInfo.companyName || 'الشركة المقاولة'} | هاتف: ${projectInfo.phone || '-'}</div>
            <div class="project-sub">الموقع: ${projectInfo.location || '-'} | المشرف المسؤول: ${projectInfo.managerName || '-'}</div>
          </div>
          <div style="text-align: left;">
            <div class="report-badge">${title}</div>
            <div style="font-size: 11px; font-weight: bold; margin-top: 6px; color: #475569;">تاريخ التصدير: ${todayStr}</div>
            <div style="font-size: 11px; color: #64748b;">إجمالي عدد السجلات: ${reports.length} تقرير</div>
          </div>
        </div>

        ${filterSummary ? `
          <div style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 8px 12px; border-radius: 6px; margin-bottom: 15px; font-weight: bold; color: #92400e; font-size: 11px;">
            🔍 معايير ومحددات الفلترة المطبقة: ${filterSummary}
          </div>
        ` : ''}

        <div class="summary-cards">
          <div class="kpi-card" style="border-right: 4px solid #2563eb;">
            <div class="kpi-title">إجمالي ساعات العمل</div>
            <div class="kpi-value" style="color: #1d4ed8;">${formatHoursDigital(totalHours)}</div>
          </div>
          <div class="kpi-card" style="border-right: 4px solid #16a34a;">
            <div class="kpi-title">إجمالي المستحقات الإجمالية</div>
            <div class="kpi-value" style="color: #15803d;">${totalGross.toLocaleString('ar-SA')} ${projectInfo.currency || 'ر.ي'}</div>
          </div>
          <div class="kpi-card" style="border-right: 4px solid #dc2626;">
            <div class="kpi-title">إجمالي السُلف اليومية</div>
            <div class="kpi-value" style="color: #b91c1c;">${totalAdvances.toLocaleString('ar-SA')} ${projectInfo.currency || 'ر.ي'}</div>
          </div>
          <div class="kpi-card" style="border-right: 4px solid #059669; background: #ecfdf5;">
            <div class="kpi-title">صافي المستحق للشركة</div>
            <div class="kpi-value" style="color: #047857;">${totalNet.toLocaleString('ar-SA')} ${projectInfo.currency || 'ر.ي'}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">#</th>
              <th style="text-align: center;">رقم التقرير</th>
              <th style="text-align: center;">التاريخ</th>
              <th>اسم المعدة واللوحة</th>
              <th>الشركة المؤجرة</th>
              <th>السائق</th>
              <th>موقع العمل</th>
              <th>بند العمل</th>
              <th style="text-align: center;">الساعات</th>
              <th style="text-align: center;">الإجمالي</th>
              <th style="text-align: center;">السلفة</th>
              <th style="text-align: left;">الصافي</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-box">
            <div>إعداد ومراجعة المحاسب</div>
            <div style="margin-top: 35px; border-top: 1px dashed #94a3b8; width: 80%; margin-right: auto; margin-left: auto;">التوقيع</div>
          </div>
          <div class="sig-box">
            <div>توقيع المشرف الميداني</div>
            <div style="margin-top: 35px; border-top: 1px dashed #94a3b8; width: 80%; margin-right: auto; margin-left: auto;">التوقيع</div>
          </div>
          <div class="sig-box">
            <div>اعتماد مدير المشروع</div>
            <div style="margin-top: 35px; border-top: 1px dashed #94a3b8; width: 80%; margin-right: auto; margin-left: auto;">التوقيع والختم</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

/**
 * Export Diesel Transactions to PDF document with rich Arabic formatting and KPI cards
 */
export const exportDieselToPDF = (
  transactions: DieselTransaction[], 
  projectInfo: ProjectInfo, 
  title: string = 'كشف وحركات مخزن وقود الديزل',
  filterSummary?: string
) => {
  const totalReceived = transactions.filter(t => t.type === 'receive').reduce((sum, t) => sum + (t.quantityLiters || 0), 0);
  const totalConsumed = transactions.filter(t => t.type === 'consume').reduce((sum, t) => sum + (t.quantityLiters || 0), 0);
  const totalCost = transactions.reduce((sum, t) => sum + (t.totalCost || 0), 0);

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const todayStr = new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });

  const rowsHtml = transactions.length === 0 ? `
    <tr>
      <td colSpan="10" style="padding: 20px; text-align: center; color: #94a3b8; font-weight: bold;">
        لا توجد حركات ديزل مطابقة
      </td>
    </tr>
  ` : transactions.map((t, i) => `
    <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 8px 10px; text-align: center; font-weight: bold; color: #d97706;">${i + 1}</td>
      <td style="padding: 8px 10px; text-align: center; font-size: 11px;">${t.date}</td>
      <td style="padding: 8px 10px; text-align: center; font-weight: bold;">
        <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; ${
          t.type === 'receive' ? 'background: #dcfce7; color: #166534;' : 'background: #fee2e2; color: #991b1b;'
        }">
          ${t.type === 'receive' ? 'وارد (استلام)' : 'صادر (معدة)'}
        </span>
      </td>
      <td style="padding: 8px 10px; text-align: center; font-weight: bold;">
        <div style="display: flex; flex-direction: column; gap: 2px; align-items: center;">
          ${t.voucherNumber ? `<span style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 1px 5px; border-radius: 4px; color: #0f172a; font-weight: 900; font-family: monospace; font-size: 10px;">سند: ${t.voucherNumber}</span>` : ''}
          ${t.invoiceNumber ? `<span style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 1px 5px; border-radius: 4px; color: #065f46; font-weight: 800; font-family: monospace; font-size: 10px;">فاتورة: ${t.invoiceNumber}</span>` : ''}
          ${!t.voucherNumber && !t.invoiceNumber ? '<span style="color: #cbd5e1;">-</span>' : ''}
        </div>
      </td>
      <td style="padding: 8px 10px; font-weight: bold; color: #0f172a;">${t.type === 'receive' ? (t.equipmentName || 'مخزن المشروع الرئيسي') : (t.equipmentName || '-')}</td>
      <td style="padding: 8px 10px; color: #334155;">
        ${t.type === 'receive' ? `
          <div>
            <div style="font-weight: bold; color: #0f172a;">مستلم: ${t.driverName || 'أمين المخزن'}</div>
            ${t.deliveryDriverName ? `<div style="font-size: 10px; color: #2563eb; font-weight: bold; margin-top: 2px;">سائق الناقلة: ${t.deliveryDriverName}</div>` : ''}
          </div>
        ` : (t.driverName || '-')}
      </td>
      <td style="padding: 8px 10px; color: #334155;">${t.type === 'receive' ? (t.supplierOrSource || '-') : 'مخزن المشروع'}</td>
      <td style="padding: 8px 10px; text-align: center; font-weight: 900; color: #2563eb;">${(t.quantityLiters || 0).toLocaleString('ar-SA')} لتر</td>
      <td style="padding: 8px 10px; text-align: center; font-weight: bold; color: #475569;">${t.pricePerLiter || 2.3} ${projectInfo.currency || 'ر.ي'}</td>
      <td style="padding: 8px 10px; text-align: left; font-weight: 900; color: #0f172a;">${(t.totalCost || 0).toLocaleString('ar-SA')} ${projectInfo.currency || 'ر.ي'}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; font-family: 'Cairo', sans-serif; }
          body { padding: 25px; margin: 0; background: #fff; color: #0f172a; direction: rtl; font-size: 12px; }
          .document-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #d97706; padding-bottom: 15px; margin-bottom: 20px; }
          .project-title { font-size: 20px; font-weight: 900; color: #0f172a; margin: 0; }
          .project-sub { font-size: 12px; color: #475569; margin-top: 4px; font-weight: 600; }
          .report-badge { background: #d97706; color: #ffffff; padding: 4px 12px; border-radius: 6px; font-weight: 900; font-size: 13px; display: inline-block; }
          .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
          .kpi-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; }
          .kpi-title { font-size: 10px; color: #64748b; font-weight: 700; }
          .kpi-value { font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          th { background: #0f172a; color: #ffffff; padding: 10px; font-weight: 800; text-align: right; border: 1px solid #0f172a; }
          td { border: 1px solid #e2e8f0; }
          .signatures { margin-top: 40px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center; font-weight: bold; }
          .sig-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; background: #f8fafc; }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: left; background: #f1f5f9; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: bold; color: #334155;">جاهز للطباعة وتصدير PDF لمخزن الديزل (استخدم Ctrl+P للطباعة أو حفظ كـ PDF)</span>
          <button onclick="window.print()" style="background: #d97706; color: white; border: none; padding: 8px 18px; border-radius: 6px; font-weight: bold; cursor: pointer; font-family: 'Cairo', sans-serif;">
            🖨️ طباعة / حفظ كـ PDF
          </button>
        </div>

        <div class="document-header">
          <div>
            <h1 class="project-title">${projectInfo.name || 'مشروع إدارة المعدات'}</h1>
            <div class="project-sub">${projectInfo.companyName || 'الشركة المقاولة'} | هاتف: ${projectInfo.phone || '-'}</div>
          </div>
          <div style="text-align: left;">
            <div class="report-badge">${title}</div>
            <div style="font-size: 11px; font-weight: bold; margin-top: 6px; color: #475569;">تاريخ التصدير: ${todayStr}</div>
            <div style="font-size: 11px; color: #64748b;">عدد العمليات: ${transactions.length} حركة</div>
          </div>
        </div>

        ${filterSummary ? `
          <div style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 8px 12px; border-radius: 6px; margin-bottom: 15px; font-weight: bold; color: #92400e; font-size: 11px;">
            🔍 معايير البحث والفلترة: ${filterSummary}
          </div>
        ` : ''}

        <div class="summary-cards">
          <div class="kpi-card" style="border-right: 4px solid #16a34a;">
            <div class="kpi-title">إجمالي الوارد (الكميات المستلمة)</div>
            <div class="kpi-value" style="color: #15803d;">${totalReceived.toLocaleString('ar-SA')} لتر</div>
          </div>
          <div class="kpi-card" style="border-right: 4px solid #dc2626;">
            <div class="kpi-title">إجمالي المصروف للمعدات</div>
            <div class="kpi-value" style="color: #b91c1c;">${totalConsumed.toLocaleString('ar-SA')} لتر</div>
          </div>
          <div class="kpi-card" style="border-right: 4px solid #d97706;">
            <div class="kpi-title">التكلفة المالية الإجمالية للديزل</div>
            <div class="kpi-value" style="color: #b45309;">${totalCost.toLocaleString('ar-SA')} ${projectInfo.currency || 'ر.ي'}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">#</th>
              <th style="text-align: center;">التاريخ</th>
              <th style="text-align: center;">نوع الحركة</th>
              <th style="text-align: center;">رقم السند اليدوي</th>
              <th>الجهة / المعدة المستفيدة</th>
              <th>اسم المستلم (أمين المخزن / السائق)</th>
              <th>المورد / المصدر</th>
              <th style="text-align: center;">الكمية (لتر)</th>
              <th style="text-align: center;">سعر اللتر</th>
              <th style="text-align: left;">التكلفة الإجمالية</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-box">
            <div>مسئول المحروقات والمحطة</div>
            <div style="margin-top: 35px; border-top: 1px dashed #94a3b8; width: 80%; margin-right: auto; margin-left: auto;">التوقيع</div>
          </div>
          <div class="sig-box">
            <div>توقيع المستلم / السائق</div>
            <div style="margin-top: 35px; border-top: 1px dashed #94a3b8; width: 80%; margin-right: auto; margin-left: auto;">التوقيع</div>
          </div>
          <div class="sig-box">
            <div>اعتماد مدير المشروع</div>
            <div style="margin-top: 35px; border-top: 1px dashed #94a3b8; width: 80%; margin-right: auto; margin-left: auto;">التوقيع والختم</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

/**
 * Browser Print Utility
 */
export const printElement = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <html lang="ar" dir="rtl">
      <head>
        <title>طباعة التقرير</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Cairo', sans-serif; direction: rtl; padding: 20px; color: #1e293b; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: right; }
          th { background-color: #0f172a; color: white; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; background: #e2e8f0; }
          .highlight { font-weight: bold; color: #0284c7; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

/**
 * Export a Single Work Report to a professionally formatted PDF document ready for printing.
 */
export const exportSingleReportToPDF = (
  report: WorkReport,
  projectInfo: ProjectInfo
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const todayStr = new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  const currency = projectInfo.currency || 'ر.ي';

  const periodsRows = (report.periods || []).map((p, idx) => `
    <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px; text-align: center; font-weight: bold; color: #d97706;">${p.periodName || `الفترة ${idx + 1}`}</td>
      <td style="padding: 10px; text-align: center; font-family: monospace; font-weight: bold; color: #0f172a;">${p.startTime || '-'}</td>
      <td style="padding: 10px; text-align: center; font-family: monospace; font-weight: bold; color: #0f172a;">${p.endTime || '-'}</td>
      <td style="padding: 10px; text-align: center; color: #64748b; font-weight: bold;">${p.breakMinutes || 0} دقيقة</td>
      <td style="padding: 10px; text-align: center; font-weight: 900; color: #2563eb;">${p.netHours || 0} ساعة (${formatHoursDigital(p.netHours || 0)})</td>
      <td style="padding: 10px; color: #475569;">${p.notes || '-'}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8">
        <title>تقرير عمل يومي - ${report.reportNumber}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; font-family: 'Cairo', sans-serif; }
          body { padding: 30px; margin: 0; background: #fff; color: #0f172a; direction: rtl; font-size: 13px; line-height: 1.5; }
          
          /* Top Document Header */
          .doc-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px double #0f172a; padding-bottom: 18px; margin-bottom: 22px; }
          .logo-box { display: flex; align-items: center; gap: 14px; }
          .logo-icon { width: 56px; height: 56px; background: linear-gradient(135deg, #0f172a, #1e293b); color: #f59e0b; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 900; box-shadow: 0 4px 10px rgba(0,0,0,0.15); border: 1px solid #334155; }
          .company-title { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; line-height: 1.2; }
          .project-sub { font-size: 12px; color: #475569; margin-top: 3px; font-weight: 700; }
          
          .report-meta-box { background: #fffbeb; border: 2px solid #fde68a; border-radius: 12px; padding: 12px 18px; text-align: center; min-width: 210px; }
          .report-badge { background: #f59e0b; color: #0f172a; padding: 4px 14px; border-radius: 8px; font-weight: 900; font-size: 13px; display: inline-block; letter-spacing: 0.5px; }
          .report-num { font-size: 16px; font-weight: 900; color: #78350f; margin-top: 4px; }
          .report-date { font-size: 12px; color: #92400e; font-weight: 700; }

          /* Info Grid Cards */
          .section-title { font-size: 14px; font-weight: 900; color: #0f172a; border-right: 4px solid #f59e0b; padding-right: 10px; margin: 22px 0 10px 0; }
          .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
          .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; }
          .info-label { font-size: 11px; color: #64748b; font-weight: 700; display: block; }
          .info-val { font-size: 13px; font-weight: 900; color: #0f172a; margin-top: 2px; }

          /* Tables */
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
          th { background: #0f172a; color: #ffffff; padding: 10px 12px; font-weight: 800; text-align: right; border: 1px solid #0f172a; }
          td { border: 1px solid #cbd5e1; }

          /* Financial Summary Box */
          .fin-summary { background: #0f172a; color: #ffffff; border-radius: 14px; padding: 18px 22px; margin-top: 22px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; border: 2px solid #334155; }
          .fin-item { border-left: 1px solid #334155; padding-left: 12px; }
          .fin-item:last-child { border-left: none; }
          .fin-title { font-size: 11px; color: #94a3b8; font-weight: 700; }
          .fin-amount { font-size: 18px; font-weight: 900; margin-top: 4px; }

          /* Signatures */
          .signatures { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 35px; text-align: center; }
          .sig-box { border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; background: #fafafa; font-size: 11px; font-weight: 800; color: #334155; }
          .sig-space { height: 48px; border-bottom: 1px dashed #cbd5e1; margin-top: 8px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; }

          /* Print Action Bar */
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
            .doc-header { border-bottom-color: #000; }
          }
        </style>
      </head>
      <body>

        <!-- Action Bar -->
        <div class="no-print" style="margin-bottom: 22px; text-align: left; background: #1e293b; color: white; padding: 14px 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);">
          <div>
            <div style="font-weight: 900; font-size: 14px; color: #fbbf24;">📄 تقرير عمل فردي جاهز للطباعة والتصدير كـ PDF</div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">يمكنك حفظ الملف بصيغة PDF عالية الجودة أو طباعته فوراً باستخدام المتصفح</div>
          </div>
          <button onclick="window.print()" style="background: #f59e0b; color: #0f172a; border: none; padding: 10px 22px; border-radius: 8px; font-weight: 900; font-size: 13px; cursor: pointer; font-family: 'Cairo', sans-serif; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);">
            🖨️ طباعة / حفظ كـ PDF
          </button>
        </div>

        <!-- Header -->
        <div class="doc-header">
          <div class="logo-box">
            <div class="logo-icon">🏗️</div>
            <div>
              <h1 class="company-title">${projectInfo.name || 'مشروع المقاولات'}</h1>
              <div class="project-sub">${projectInfo.companyName || 'الشركة المنفذة'} | هاتف: ${projectInfo.phone || '-'}</div>
              <div class="project-sub">الموقع: ${projectInfo.location || '-'} ${(projectInfo as any).code ? `| كود المشروع: ${(projectInfo as any).code}` : ''}</div>
            </div>
          </div>

          <div class="report-meta-box">
            <div class="report-badge">تقرير عمل يومي</div>
            <div class="report-num">رقم: ${report.reportNumber}</div>
            <div class="report-date">التاريخ: ${report.date}</div>
          </div>
        </div>

        <!-- Equipment & Rental Info -->
        <div class="section-title">بيانات المعدة والشركة المؤجرة</div>
        <div class="info-grid">
          <div class="info-card">
            <span class="info-label">اسم المعدة</span>
            <div class="info-val" style="color: #d97706;">${report.equipmentName}</div>
          </div>
          <div class="info-card">
            <span class="info-label">رقم اللوحة / التسجيل</span>
            <div class="info-val" style="font-family: monospace;">${report.equipmentRegNumber || '-'}</div>
          </div>
          <div class="info-card">
            <span class="info-label">الشركة المؤجرة</span>
            <div class="info-val">${report.companyName || '-'}</div>
          </div>
          <div class="info-card">
            <span class="info-label">اسم السائق / المشغل</span>
            <div class="info-val">${report.driverName || '-'} ${report.driverPhone ? `(${report.driverPhone})` : ''}</div>
          </div>
          <div class="info-card">
            <span class="info-label">نوع العقد وطريقة الحساب</span>
            <div class="info-val" style="color: #2563eb;">${getContractTypeName(report.contractType)}</div>
          </div>
          <div class="info-card">
            <span class="info-label">قراءة العدادات</span>
            <div class="info-val">من ${report.meterStart || 0} إلى ${report.meterEnd || 0} ${report.quantityMeters ? `(الكمية: ${report.quantityMeters} م)` : ''}</div>
          </div>
          <div class="info-card">
            <span class="info-label">موقع العمل الميداني</span>
            <div class="info-val">${report.workLocation || '-'}</div>
          </div>
          <div class="info-card" style="grid-column: span 2;">
            <span class="info-label">بند العمل والمهام التخصصية</span>
            <div class="info-val">${report.workItem || '-'}</div>
          </div>
        </div>

        <!-- Work Shifts Table -->
        <div class="section-title">فترات وساعات العمل بالوردية</div>
        <table>
          <thead>
            <tr>
              <th style="width: 140px; text-align: center;">الفترة</th>
              <th style="text-align: center;">وقت البدء</th>
              <th style="text-align: center;">وقت الانتهاء</th>
              <th style="text-align: center;">الخصم (توقف)</th>
              <th style="text-align: center;">صافي الساعات</th>
              <th>بيان الأعمال والملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${periodsRows.length > 0 ? periodsRows : '<tr><td colspan="6" style="text-align: center; padding: 15px; color: #94a3b8;">لا توجد تفاصيل فترات مسجلة</td></tr>'}
          </tbody>
        </table>

        <!-- Operational Costs & Extras if any -->
        ${report.costs && (report.costs.dieselLiters > 0 || report.costs.oilCost > 0 || report.costs.greaseCost > 0 || report.costs.maintenanceCost > 0 || report.driverAdvance > 0) ? `
          <div class="section-title">التكاليف التشغيلية والمستلزمات المقيدة بالتقرير</div>
          <div class="info-grid" style="grid-template-columns: repeat(4, 1fr);">
            <div class="info-card">
              <span class="info-label">وقود الديزل (كمية وتكلفة)</span>
              <div class="info-val" style="color: #d97706;">${report.costs.dieselLiters || 0} لتر (${(report.costs.dieselTotalCost || 0).toLocaleString('ar-SA')} ${currency})</div>
            </div>
            <div class="info-card">
              <span class="info-label">تكلفة الزيوت والشحوم</span>
              <div class="info-val">${((report.costs.oilCost || 0) + (report.costs.greaseCost || 0)).toLocaleString('ar-SA')} ${currency}</div>
            </div>
            <div class="info-card">
              <span class="info-label">قطع الغيار والصيانة</span>
              <div class="info-val">${((report.costs.sparePartsCost || 0) + (report.costs.maintenanceCost || 0)).toLocaleString('ar-SA')} ${currency}</div>
            </div>
            <div class="info-card">
              <span class="info-label">السلفة اليومية المقيدة للسائق</span>
              <div class="info-val" style="color: #dc2626;">${(report.driverAdvance || 0).toLocaleString('ar-SA')} ${currency}</div>
            </div>
          </div>
        ` : ''}

        ${report.costs && (
          report.costs.dieselNotes || report.costs.dieselAttachment ||
          report.costs.hydraulicOilNotes || report.costs.hydraulicOilAttachment ||
          report.costs.engineOilNotes || report.costs.engineOilAttachment ||
          report.costs.greaseNotes || report.costs.greaseAttachment ||
          report.costs.sparePartsNotes || report.costs.sparePartsAttachment ||
          report.costs.maintenanceNotes || report.costs.maintenanceAttachment ||
          report.costs.driverAdvanceNotes || report.costs.driverAdvanceAttachment
        ) ? `
          <div class="section-title">ملاحظات ومرفقات سندات الاستلام والمصروفات</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px;">
            ${report.costs.dieselNotes || report.costs.dieselAttachment ? `
              <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 10px; border-radius: 8px;">
                <strong style="color: #b45309; display: block; margin-bottom: 4px;">الديزل:</strong>
                ${report.costs.dieselNotes ? `<div style="font-size: 11px; color: #475569;">${report.costs.dieselNotes}</div>` : ''}
                ${report.costs.dieselAttachment ? `<img src="${report.costs.dieselAttachment}" style="max-height: 120px; max-width: 100%; margin-top: 6px; border-radius: 6px; border: 1px solid #cbd5e1;" />` : ''}
              </div>
            ` : ''}
            ${report.costs.hydraulicOilNotes || report.costs.hydraulicOilAttachment ? `
              <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 10px; border-radius: 8px;">
                <strong style="color: #0369a1; display: block; margin-bottom: 4px;">زيت الهيدروليك:</strong>
                ${report.costs.hydraulicOilNotes ? `<div style="font-size: 11px; color: #475569;">${report.costs.hydraulicOilNotes}</div>` : ''}
                ${report.costs.hydraulicOilAttachment ? `<img src="${report.costs.hydraulicOilAttachment}" style="max-height: 120px; max-width: 100%; margin-top: 6px; border-radius: 6px; border: 1px solid #cbd5e1;" />` : ''}
              </div>
            ` : ''}
            ${report.costs.engineOilNotes || report.costs.engineOilAttachment ? `
              <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 10px; border-radius: 8px;">
                <strong style="color: #047857; display: block; margin-bottom: 4px;">زيت المكينة:</strong>
                ${report.costs.engineOilNotes ? `<div style="font-size: 11px; color: #475569;">${report.costs.engineOilNotes}</div>` : ''}
                ${report.costs.engineOilAttachment ? `<img src="${report.costs.engineOilAttachment}" style="max-height: 120px; max-width: 100%; margin-top: 6px; border-radius: 6px; border: 1px solid #cbd5e1;" />` : ''}
              </div>
            ` : ''}
            ${report.costs.greaseNotes || report.costs.greaseAttachment ? `
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px;">
                <strong style="color: #334155; display: block; margin-bottom: 4px;">التشحيم:</strong>
                ${report.costs.greaseNotes ? `<div style="font-size: 11px; color: #475569;">${report.costs.greaseNotes}</div>` : ''}
                ${report.costs.greaseAttachment ? `<img src="${report.costs.greaseAttachment}" style="max-height: 120px; max-width: 100%; margin-top: 6px; border-radius: 6px; border: 1px solid #cbd5e1;" />` : ''}
              </div>
            ` : ''}
            ${report.costs.sparePartsNotes || report.costs.sparePartsAttachment ? `
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px;">
                <strong style="color: #334155; display: block; margin-bottom: 4px;">قطع الغيار والصيانة:</strong>
                ${report.costs.sparePartsNotes ? `<div style="font-size: 11px; color: #475569;">${report.costs.sparePartsNotes}</div>` : ''}
                ${report.costs.sparePartsAttachment ? `<img src="${report.costs.sparePartsAttachment}" style="max-height: 120px; max-width: 100%; margin-top: 6px; border-radius: 6px; border: 1px solid #cbd5e1;" />` : ''}
              </div>
            ` : ''}
            ${report.costs.driverAdvanceNotes || report.costs.driverAdvanceAttachment ? `
              <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 10px; border-radius: 8px;">
                <strong style="color: #b45309; display: block; margin-bottom: 4px;">سلفة السائق:</strong>
                ${report.costs.driverAdvanceNotes ? `<div style="font-size: 11px; color: #475569;">${report.costs.driverAdvanceNotes}</div>` : ''}
                ${report.costs.driverAdvanceAttachment ? `<img src="${report.costs.driverAdvanceAttachment}" style="max-height: 120px; max-width: 100%; margin-top: 6px; border-radius: 6px; border: 1px solid #cbd5e1;" />` : ''}
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Financial Calculations Statement -->
        <div class="fin-summary">
          <div class="fin-item">
            <div class="fin-title">إجمالي ساعات / وحدات التشغيل</div>
            <div class="fin-amount" style="color: #60a5fa;">${report.totalNetHours || 0} ساعة (${formatHoursDigital(report.totalNetHours || 0)})</div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">سعر الفئة: ${(report.ratePerUnit || 0).toLocaleString('ar-SA')} ${currency}</div>
          </div>
          <div class="fin-item">
            <div class="fin-title">إجمالي المستحق قبل الخصم</div>
            <div class="fin-amount" style="color: #f59e0b;">${(report.grossAmount || 0).toLocaleString('ar-SA')} ${currency}</div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">يخصم منها السلفة: ${(report.driverAdvance || 0).toLocaleString('ar-SA')} ${currency}</div>
          </div>
          <div class="fin-item">
            <div class="fin-title">صافي المستحق النهائي للشركة</div>
            <div class="fin-amount" style="color: #34d399; font-size: 22px;">${(report.netCompanyDue || 0).toLocaleString('ar-SA')} ${currency}</div>
            <div style="font-size: 10px; color: #a7f3d0; margin-top: 2px;">مستحق الدفع واعتماد المحاسب</div>
          </div>
        </div>

        ${report.notes ? `
          <div style="margin-top: 15px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 14px; border-radius: 8px; font-size: 12px;">
            <strong style="color: #0f172a;">ملاحظات وتعليمات التقرير:</strong> ${report.notes}
          </div>
        ` : ''}

        ${report.sitePhotos && report.sitePhotos.length > 0 ? `
          <div class="section-title">التوثيق بالصور الميدانية للموقع والعمل المنجز (${report.sitePhotos.length})</div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;">
            ${report.sitePhotos.map((photo, i) => `
              <div style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: #0f172a; height: 110px; display: flex; align-items: center; justify-content: center;">
                <img src="${photo}" alt="صورة ميدانية ${i + 1}" style="max-width: 100%; max-height: 100%; object-fit: cover;" />
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Signatures & Stamp Box -->
        <div class="signatures">
          <div class="sig-box">
            <div>توقيع سائق / مشغل المعدة</div>
            <div class="sig-space" style="display: flex; align-items: center; justify-content: center;">
              ${report.driverSignature ? `<img src="${report.driverSignature}" alt="توقيع السائق" style="max-height: 45px; max-width: 100%;" />` : 'توقيع السائق'}
            </div>
            <div style="font-size: 10px; color: #64748b; font-weight: bold;">${report.driverName || '-'}</div>
          </div>

          <div class="sig-box">
            <div>توقيع المشرف / المهندس الميداني</div>
            <div class="sig-space" style="display: flex; align-items: center; justify-content: center;">
              ${report.supervisorSignature ? `<img src="${report.supervisorSignature}" alt="توقيع المشرف" style="max-height: 45px; max-width: 100%;" />` : 'توقيع المشرف'}
            </div>
            <div style="font-size: 10px; color: #64748b; font-weight: bold;">${report.supervisorName || projectInfo.managerName || '-'}</div>
          </div>

          <div class="sig-box">
            <div>تدقيق وتوقيع المحاسب</div>
            <div class="sig-space">التوقيع والتدقيق</div>
            <div style="font-size: 10px; color: #64748b; font-weight: bold;">قسم الحسابات</div>
          </div>

          <div class="sig-box" style="border-color: #f59e0b; background: #fffdf5;">
            <div style="color: #78350f;">اعتماد مدير المشروع والختم</div>
            <div class="sig-space" style="border-color: #fde68a;">الختم الرسمي والتوقيع</div>
            <div style="font-size: 10px; color: #92400e; font-weight: bold;">${projectInfo.companyName || '-'}</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

