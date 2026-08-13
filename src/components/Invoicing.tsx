import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Printer, 
  Download, 
  FileText, 
  Building2, 
  Calendar, 
  DollarSign, 
  Fuel, 
  CheckCircle2, 
  Calculator, 
  Percent, 
  Tag, 
  Filter, 
  Clock, 
  HardHat, 
  Search, 
  FileCheck, 
  AlertCircle,
  ChevronDown,
  Sparkles,
  UserCheck,
  MapPin,
  ListPlus,
  RefreshCw,
  Plus
} from 'lucide-react';
import { WorkReport, DieselTransaction, Company, Equipment, ProjectInfo } from '../types';
import { formatCurrency, formatHoursDigital, getContractTypeName } from '../utils/exportUtils';
import * as XLSX from 'xlsx';

interface InvoicingProps {
  reports: WorkReport[];
  dieselTransactions: DieselTransaction[];
  companies: Company[];
  equipmentList: Equipment[];
  projectInfo: ProjectInfo;
}

export const Invoicing: React.FC<InvoicingProps> = ({
  reports,
  dieselTransactions,
  companies,
  equipmentList,
  projectInfo
}) => {
  // 1. Filter States
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // 2. Invoice Customization States
  const [invoiceNumber, setInvoiceNumber] = useState<string>(`INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().slice(0, 10);
  });
  const [taxRate, setTaxRate] = useState<number>(0); // e.g. 0% or 15% VAT
  const [taxId, setTaxId] = useState<string>('30098271100003');
  const [customDiscount, setCustomDiscount] = useState<number>(0);
  const [includeDieselDeduction, setIncludeDieselDeduction] = useState<boolean>(true);
  const [includeAdvancesDeduction, setIncludeAdvancesDeduction] = useState<boolean>(true);
  const [invoiceNotes, setInvoiceNotes] = useState<string>('سداد المستحقات المالية خلال 15 يوماً من تاريخ استلام المطالبة الرسمية.');
  
  // 3. View mode: 'preview' | 'details' | 'diesel'
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'reports' | 'diesel'>('preview');

  // Quick Date Range Shortcuts
  const setQuickRange = (range: 'this_month' | 'last_month' | 'all') => {
    const now = new Date();
    if (range === 'this_month') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(first.toISOString().slice(0, 10));
      setEndDate(last.toISOString().slice(0, 10));
    } else if (range === 'last_month') {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(first.toISOString().slice(0, 10));
      setEndDate(last.toISOString().slice(0, 10));
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  // 4. Data Aggregation & Filter Logic
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      // Company match
      if (selectedCompany !== 'all' && r.companyName !== selectedCompany) {
        return false;
      }
      // Equipment match
      if (selectedEquipment !== 'all' && r.equipmentName !== selectedEquipment) {
        return false;
      }
      // Date range match
      if (startDate && r.date < startDate) return false;
      if (endDate && r.date > endDate) return false;
      return true;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [reports, selectedCompany, selectedEquipment, startDate, endDate]);

  const filteredDiesel = useMemo(() => {
    return dieselTransactions.filter(t => {
      if (t.type !== 'consume') return false;
      // Filter by company/equipment if selected
      if (selectedEquipment !== 'all' && t.equipmentName !== selectedEquipment) {
        return false;
      }
      if (selectedCompany !== 'all') {
        // match equipment owned by company or transaction notes
        const matchedEq = equipmentList.find(e => e.name === t.equipmentName);
        if (matchedEq && matchedEq.companyName !== selectedCompany) {
          return false;
        }
      }
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      return true;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [dieselTransactions, selectedCompany, selectedEquipment, startDate, endDate, equipmentList]);

  // 5. Financial Calculations
  const invoiceFinancials = useMemo(() => {
    const grossWorkTotal = filteredReports.reduce((acc, r) => acc + (r.grossAmount || 0), 0);
    const totalHours = filteredReports.reduce((acc, r) => acc + (r.totalNetHours || 0), 0);
    const totalMeters = filteredReports.reduce((acc, r) => acc + (r.quantityMeters || 0), 0);
    const totalDriverAdvances = filteredReports.reduce((acc, r) => acc + (r.driverAdvance || 0), 0);

    // Diesel consumed from reports operational costs OR diesel warehouse
    let totalDieselLiters = 0;
    let totalDieselCost = 0;

    filteredReports.forEach(r => {
      if (r.costs && r.costs.dieselLiters) {
        totalDieselLiters += r.costs.dieselLiters;
        totalDieselCost += (r.costs.dieselTotalCost || (r.costs.dieselLiters * 2.3));
      }
    });

    // If report costs were 0, check diesel warehouse
    if (totalDieselLiters === 0 && filteredDiesel.length > 0) {
      filteredDiesel.forEach(t => {
        totalDieselLiters += t.quantityLiters;
        totalDieselCost += t.totalCost;
      });
    }

    const appliedDieselDeduction = includeDieselDeduction ? totalDieselCost : 0;
    const appliedAdvancesDeduction = includeAdvancesDeduction ? totalDriverAdvances : 0;
    const totalDeductions = appliedDieselDeduction + appliedAdvancesDeduction + (customDiscount || 0);

    const netBeforeTax = Math.max(0, grossWorkTotal - totalDeductions);
    const taxAmount = (netBeforeTax * taxRate) / 100;
    const grandNetPayable = netBeforeTax + taxAmount;

    return {
      grossWorkTotal,
      totalHours,
      totalMeters,
      totalDriverAdvances,
      totalDieselLiters,
      totalDieselCost,
      appliedDieselDeduction,
      appliedAdvancesDeduction,
      totalDeductions,
      netBeforeTax,
      taxAmount,
      grandNetPayable
    };
  }, [filteredReports, filteredDiesel, includeDieselDeduction, includeAdvancesDeduction, customDiscount, taxRate]);

  // Grouped Itemized Breakdown by Equipment or Work Item
  const groupedEquipmentItems = useMemo(() => {
    const map: Record<string, {
      equipmentName: string;
      companyName: string;
      contractType: string;
      reportsCount: number;
      totalHours: number;
      totalMeters: number;
      ratePerUnit: number;
      grossAmount: number;
      dieselLiters: number;
      dieselCost: number;
      driverAdvances: number;
      netAmount: number;
    }> = {};

    filteredReports.forEach(r => {
      const key = `${r.equipmentName}_${r.contractType}_${r.ratePerUnit}`;
      if (!map[key]) {
        map[key] = {
          equipmentName: r.equipmentName,
          companyName: r.companyName || 'غير محدد',
          contractType: r.contractType,
          reportsCount: 0,
          totalHours: 0,
          totalMeters: 0,
          ratePerUnit: r.ratePerUnit || 0,
          grossAmount: 0,
          dieselLiters: 0,
          dieselCost: 0,
          driverAdvances: 0,
          netAmount: 0
        };
      }

      map[key].reportsCount += 1;
      map[key].totalHours += (r.totalNetHours || 0);
      map[key].totalMeters += (r.quantityMeters || 0);
      map[key].grossAmount += (r.grossAmount || 0);
      if (r.costs) {
        map[key].dieselLiters += (r.costs.dieselLiters || 0);
        map[key].dieselCost += (r.costs.dieselTotalCost || 0);
      }
      map[key].driverAdvances += (r.driverAdvance || 0);
      map[key].netAmount += (r.netCompanyDue || 0);
    });

    return Object.values(map);
  }, [filteredReports]);

  // 6. Export Invoice to PDF / Print Function
  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currency = projectInfo.currency || 'ر.ي';
    const clientName = selectedCompany !== 'all' ? selectedCompany : (projectInfo.companyName || 'جميع الشركات المؤجرة والعملاء');

    const workRowsHtml = filteredReports.length === 0 ? `
      <tr>
        <td colSpan="8" style="padding: 20px; text-align: center; color: #94a3b8; font-weight: bold;">
          لا توجد تقارير عمل في الفترة المحددة
        </td>
      </tr>
    ` : filteredReports.map((r, i) => `
      <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 10px; text-align: center; font-weight: bold; color: #d97706;">${i + 1}</td>
        <td style="padding: 8px 10px; text-align: center; font-size: 11px;">${r.date}</td>
        <td style="padding: 8px 10px; font-weight: bold; color: #0f172a;">
          ${r.equipmentName}
          ${r.equipmentRegNumber ? `<div style="font-size: 10px; color: #64748b; font-weight: normal;">${r.equipmentRegNumber}</div>` : ''}
        </td>
        <td style="padding: 8px 10px; color: #334155;">${r.workItem || r.workLocation || 'عمل تشغيلي'}</td>
        <td style="padding: 8px 10px; text-align: center; font-weight: bold; color: #2563eb;">
          ${r.contractType === 'meter' ? `${r.quantityMeters || 0} م` : `${r.totalNetHours || 0} ساعة (${formatHoursDigital(r.totalNetHours || 0)})`}
        </td>
        <td style="padding: 8px 10px; text-align: center; font-weight: bold; color: #475569;">${(r.ratePerUnit || 0).toLocaleString('ar-SA')} ${currency}</td>
        <td style="padding: 8px 10px; text-align: center; font-weight: 900; color: #059669;">${(r.grossAmount || 0).toLocaleString('ar-SA')} ${currency}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8">
          <title>فاتورة مطالبة مالية - ${invoiceNumber}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; font-family: 'Cairo', sans-serif; }
            body { padding: 30px; margin: 0; background: #fff; color: #0f172a; direction: rtl; font-size: 12px; line-height: 1.5; }
            
            /* Letterhead Header */
            .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0f172a; padding-bottom: 18px; margin-bottom: 22px; }
            .logo-title { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; }
            .sub-title { font-size: 12px; color: #475569; font-weight: 700; margin-top: 3px; }
            
            .inv-badge-box { text-align: left; background: #fffdf5; border: 2px solid #fde68a; padding: 12px 18px; border-radius: 12px; min-width: 220px; }
            .inv-badge { background: #f59e0b; color: #0f172a; padding: 4px 12px; border-radius: 6px; font-weight: 900; font-size: 13px; display: inline-block; }
            .inv-number { font-size: 16px; font-weight: 900; color: #78350f; margin-top: 4px; font-family: monospace; }
            
            /* Party Cards */
            .parties-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 22px; }
            .party-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px 16px; }
            .party-label { font-size: 11px; color: #64748b; font-weight: 800; text-transform: uppercase; border-bottom: 1px border #e2e8f0; padding-bottom: 4px; margin-bottom: 6px; }
            .party-name { font-size: 15px; font-weight: 900; color: #0f172a; }

            /* Financial Summary Box */
            .fin-summary-box { background: #0f172a; color: #ffffff; border-radius: 14px; padding: 20px; margin-top: 22px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; border: 2px solid #334155; }
            .fin-card { border-left: 1px solid #334155; padding-left: 10px; }
            .fin-card:last-child { border-left: none; }
            .fin-title { font-size: 10px; color: #94a3b8; font-weight: 700; }
            .fin-val { font-size: 16px; font-weight: 900; margin-top: 4px; }

            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th { background: #0f172a; color: #ffffff; padding: 10px 12px; font-weight: 800; text-align: right; border: 1px solid #0f172a; }
            td { border: 1px solid #cbd5e1; }

            .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 40px; text-align: center; }
            .sig-box { border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; background: #fafafa; font-size: 11px; font-weight: 800; color: #334155; }
            .sig-space { height: 50px; border-bottom: 1px dashed #cbd5e1; margin-top: 8px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; }

            @media print {
              .no-print { display: none !important; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; text-align: left; background: #1e293b; color: white; padding: 12px 18px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="color: #fbbf24; font-size: 14px;">🧾 فاتورة مطالبة مالية جاهزة للطباعة والتصدير PDF</strong>
              <div style="font-size: 11px; color: #94a3b8;">اضغط الزر للطباعة أو الحفظ بصيغة PDF عبر المتصفح</div>
            </div>
            <button onclick="window.print()" style="background: #f59e0b; color: #0f172a; border: none; padding: 9px 20px; border-radius: 8px; font-weight: 900; cursor: pointer; font-family: 'Cairo', sans-serif;">
              🖨️ طباعة الفاتورة / حفظ PDF
            </button>
          </div>

          <!-- Header -->
          <div class="invoice-header">
            <div>
              <h1 class="logo-title">${projectInfo.name || 'مشروع إدارة وتأجير المعدات'}</h1>
              <div class="sub-title">${projectInfo.companyName || 'الشركة المقاولة المنفذة'} | هاتف: ${projectInfo.phone || '-'}</div>
              <div class="sub-title">الموقع: ${projectInfo.location || '-'} | الرقم الضريبي: ${taxId || '-'}</div>
            </div>

            <div class="inv-badge-box">
              <div class="inv-badge">فاتورة مطالبة مالية</div>
              <div class="inv-number">${invoiceNumber}</div>
              <div style="font-size: 11px; font-weight: bold; color: #475569; margin-top: 4px;">تاريخ الإصدار: ${issueDate}</div>
              <div style="font-size: 11px; font-weight: bold; color: #dc2626;">تاريخ الاستحقاق: ${dueDate}</div>
            </div>
          </div>

          <!-- Parties -->
          <div class="parties-grid">
            <div class="party-card" style="border-right: 4px solid #f59e0b;">
              <div class="party-label">المصادر إلى (العميل / الشركة المؤجرة):</div>
              <div class="party-name">${clientName}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">مطالبة مالية بتكاليف وساعات التشغيل بوقع تقارير العمل الميدانية</div>
            </div>

            <div class="party-card" style="border-right: 4px solid #2563eb;">
              <div class="party-label">الفترة الزمنية للتقرير والمطالبة:</div>
              <div class="party-name" style="font-size: 13px;">
                ${startDate ? `من ${startDate}` : 'من البداية'} ${endDate ? `إلى ${endDate}` : 'حتى تاريخه'}
              </div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">إجمالي عدد السجلات المشمولة: ${filteredReports.length} تقرير عمل</div>
            </div>
          </div>

          <!-- Itemized Table -->
          <div style="font-weight: 900; font-size: 13px; color: #0f172a; margin-bottom: 6px;">تفاصيل كشف ساعات وأعمال المعدات:</div>
          <table>
            <thead>
              <tr>
                <th style="width: 35px; text-align: center;">#</th>
                <th style="text-align: center;">التاريخ</th>
                <th>اسم المعدة واللوحة</th>
                <th>بند / موقع العمل</th>
                <th style="text-align: center;">ساعات / كمية التشغيل</th>
                <th style="text-align: center;">سعر الفئة</th>
                <th style="text-align: center;">المبلغ الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${workRowsHtml}
            </tbody>
          </table>

          <!-- Diesel & Deductions Breakdown if applicable -->
          ${invoiceFinancials.appliedDieselDeduction > 0 || invoiceFinancials.appliedAdvancesDeduction > 0 ? `
            <div style="font-weight: 900; font-size: 13px; color: #0f172a; margin-top: 18px; margin-bottom: 6px;">بيان الاستقطاعات والخصومات المقيدة بالفاتورة:</div>
            <table>
              <thead>
                <tr>
                  <th>نوع الاستقطاع / الخصم</th>
                  <th>البيان والتفاصيل</th>
                  <th style="text-align: center;">الكمية / البيان</th>
                  <th style="text-align: left;">إجمالي الخصم</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceFinancials.appliedDieselDeduction > 0 ? `
                  <tr>
                    <td style="padding: 8px; font-weight: bold; color: #b45309;">وقود الديزل المصروف</td>
                    <td style="padding: 8px; color: #475569;">قيمة الديزل المصروف للمعدات والمقيد كاستقطاع تشغيلي</td>
                    <td style="padding: 8px; text-align: center; font-weight: bold;">${invoiceFinancials.totalDieselLiters.toLocaleString('ar-SA')} لتر</td>
                    <td style="padding: 8px; text-align: left; font-weight: 900; color: #dc2626;">- ${(invoiceFinancials.appliedDieselDeduction).toLocaleString('ar-SA')} ${currency}</td>
                  </tr>
                ` : ''}
                ${invoiceFinancials.appliedAdvancesDeduction > 0 ? `
                  <tr>
                    <td style="padding: 8px; font-weight: bold; color: #b45309;">السُلف اليومية للسائقين</td>
                    <td style="padding: 8px; color: #475569;">السُلف والمصروفات اليومية المسلمة مقدماً للسائقين</td>
                    <td style="padding: 8px; text-align: center; font-weight: bold;">مقيدة بتقرير العمل</td>
                    <td style="padding: 8px; text-align: left; font-weight: 900; color: #dc2626;">- ${(invoiceFinancials.appliedAdvancesDeduction).toLocaleString('ar-SA')} ${currency}</td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          ` : ''}

          <!-- Financial Statement Box -->
          <div class="fin-summary-box">
            <div class="fin-card">
              <div class="fin-title">إجمالي مستحقات التشغيل</div>
              <div class="fin-val" style="color: #f59e0b;">${(invoiceFinancials.grossWorkTotal).toLocaleString('ar-SA')} ${currency}</div>
            </div>
            <div class="fin-card">
              <div class="fin-title">إجمالي الخصومات والديزل</div>
              <div class="fin-val" style="color: #f87171;">- ${(invoiceFinancials.totalDeductions).toLocaleString('ar-SA')} ${currency}</div>
            </div>
            <div class="fin-card">
              <div class="fin-title">الضريبة المضافة (${taxRate}%)</div>
              <div class="fin-val" style="color: #38bdf8;">${(invoiceFinancials.taxAmount).toLocaleString('ar-SA')} ${currency}</div>
            </div>
            <div class="fin-card" style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 8px;">
              <div class="fin-title" style="color: #fef08a;">صافي المستحق النهائي للدفع</div>
              <div class="fin-val" style="color: #4ade80; font-size: 20px;">${(invoiceFinancials.grandNetPayable).toLocaleString('ar-SA')} ${currency}</div>
            </div>
          </div>

          ${invoiceNotes ? `
            <div style="margin-top: 15px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 14px; border-radius: 8px; font-size: 11px;">
              <strong style="color: #0f172a;">الشروط والملاحظات:</strong> ${invoiceNotes}
            </div>
          ` : ''}

          <!-- Signatures -->
          <div class="signatures">
            <div class="sig-box">
              <div>توقيع وتدقيق المحاسب</div>
              <div class="sig-space">التوقيع والتاريخ</div>
              <div style="font-size: 10px; color: #64748b;">قسم المحاسبة والحسابات</div>
            </div>
            <div class="sig-box">
              <div>المشرف / مهندس المشروع</div>
              <div class="sig-space">المطابقة الميدانية</div>
              <div style="font-size: 10px; color: #64748b;">${projectInfo.managerName || '-'}</div>
            </div>
            <div class="sig-box" style="border-color: #f59e0b; background: #fffdf5;">
              <div style="color: #78350f;">اعتماد مدير الشركة والختم</div>
              <div class="sig-space" style="border-color: #fde68a;">الختم والتوقيع الرسمي</div>
              <div style="font-size: 10px; color: #92400e;">${projectInfo.companyName || '-'}</div>
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

  // Export Invoice Summary to Excel (.xlsx)
  const handleExportExcel = () => {
    const dataToExport = filteredReports.map((r, idx) => ({
      '#': idx + 1,
      'رقم الفاتورة': invoiceNumber,
      'تاريخ الفاتورة': issueDate,
      'رقم التقرير': r.reportNumber,
      'التاريخ': r.date,
      'الشركة المؤجرة / الزبون': r.companyName,
      'اسم المعدة': r.equipmentName,
      'رقم اللوحة': r.equipmentRegNumber || '-',
      'بند العمل': r.workItem || '-',
      'نوع العقد': getContractTypeName(r.contractType),
      'ساعات العمل': r.totalNetHours || 0,
      'الكمية بالمتـر': r.quantityMeters || 0,
      'سعر الفئة': r.ratePerUnit || 0,
      'المبلغ الإجمالي': r.grossAmount || 0,
      'تكلفة الديزل': includeDieselDeduction ? (r.costs?.dieselTotalCost || 0) : 0,
      'سلفة السائق': includeAdvancesDeduction ? (r.driverAdvance || 0) : 0,
      'الصافي المستحق': r.netCompanyDue || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `فاتورة_${invoiceNumber}`);
    worksheet['!dir'] = 'rtl';

    XLSX.writeFile(workbook, `فاتورة_مالية_${invoiceNumber}_${selectedCompany !== 'all' ? selectedCompany : 'المشروع'}.xlsx`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl font-black shadow-md shadow-amber-500/20">
            <Receipt className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>مركز إصدار الفواتير والمطالبات المالية الرسمية</span>
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                توليد تلقائي
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              قم بإنشاء فاتورة مالية تفصيلية ومستند مطالبة للشركة بناءً على تقارير العمل وساعات التشغيل وتكاليف الديزل
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrintInvoice}
            disabled={filteredReports.length === 0}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl transition-all shadow-md flex items-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة وتصدير PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={filteredReports.length === 0}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-extrabold rounded-xl transition-all border border-slate-700 flex items-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>تصدير Excel</span>
          </button>
        </div>
      </div>

      {/* Control Panel: Invoice Generator Settings */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-black text-slate-900 dark:text-slate-100">
              إعدادات محددات الفاتورة والشركة المؤجرة
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setQuickRange('this_month')}
              className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-lg transition-colors cursor-pointer"
            >
              هذا الشهر
            </button>
            <button
              onClick={() => setQuickRange('last_month')}
              className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-lg transition-colors cursor-pointer"
            >
              الشهر السابق
            </button>
            <button
              onClick={() => setQuickRange('all')}
              className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-lg transition-colors cursor-pointer"
            >
              كافة الفترات
            </button>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Target Company Select */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
              الشركة المؤجرة / الزبون:
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">جميع الشركات والجهات (كشف شامل)</option>
                {companies.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Equipment Select */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
              تصفية بالمعدة (اختياري):
            </label>
            <div className="relative">
              <HardHat className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">كافة معدات الشركة</option>
                {equipmentList.map(eq => (
                  <option key={eq.id} value={eq.name}>{eq.name} - ({eq.companyName})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
              تاريخ بداية الفترة:
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
              تاريخ نهاية الفترة:
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

        </div>

        {/* Invoice Metadata and Toggles Accordion Box */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-0.5">رقم الفاتورة:</label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-0.5">تاريخ الإصدار:</label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-0.5">تاريخ الاستحقاق:</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-0.5">نسبة الضريبة (VAT %):</label>
            <select
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 dark:text-slate-100"
            >
              <option value={0}>بدون ضريبة (0%)</option>
              <option value={5}>ضريبة 5%</option>
              <option value={15}>ضريبة مضافة 15%</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-0.5">الخصم الإضافي (إن وجد):</label>
            <input
              type="number"
              value={customDiscount}
              onChange={(e) => setCustomDiscount(Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Checkbox options */}
          <div className="flex flex-col justify-center gap-1.5 pt-2 sm:pt-0">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={includeDieselDeduction}
                onChange={(e) => setIncludeDieselDeduction(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
              />
              <span>خصم وقود الديزل المصروف</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={includeAdvancesDeduction}
                onChange={(e) => setIncludeAdvancesDeduction(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
              />
              <span>خصم السُلف اليومية للسائقين</span>
            </label>
          </div>
        </div>
      </div>

      {/* KPI Cards: Invoice Summary Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-r-4 border-r-amber-500">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">إجمالي مستحقات التشغيل (الساعات)</span>
          <strong className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono mt-1 block">
            {formatCurrency(invoiceFinancials.grossWorkTotal, projectInfo.currency)}
          </strong>
          <span className="text-[11px] text-slate-500 mt-1 block">
            إجمالي {invoiceFinancials.totalHours} ساعة عمل | {filteredReports.length} تقرير
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-r-4 border-r-rose-500">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">إجمالي الخصومات والاستقطاعات</span>
          <strong className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono mt-1 block">
            - {formatCurrency(invoiceFinancials.totalDeductions, projectInfo.currency)}
          </strong>
          <span className="text-[11px] text-slate-500 mt-1 block">
            ديزل: {formatCurrency(invoiceFinancials.appliedDieselDeduction, projectInfo.currency)} | سُلف: {formatCurrency(invoiceFinancials.appliedAdvancesDeduction, projectInfo.currency)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-r-4 border-r-blue-500">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">ضريبة القيمة المضافة ({taxRate}%)</span>
          <strong className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono mt-1 block">
            {formatCurrency(invoiceFinancials.taxAmount, projectInfo.currency)}
          </strong>
          <span className="text-[11px] text-slate-500 mt-1 block">
            محسوبة على الصافي قبل الضريبة
          </span>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-4 rounded-2xl border border-slate-800 shadow-md border-r-4 border-r-emerald-500">
          <span className="text-xs font-bold text-amber-400 block">صافي المستحق النهائي للدفع</span>
          <strong className="text-xl font-black text-emerald-400 font-mono mt-1 block">
            {formatCurrency(invoiceFinancials.grandNetPayable, projectInfo.currency)}
          </strong>
          <span className="text-[11px] text-slate-300 mt-1 block">
            جاهز للاعتماد والمطالبة المالية
          </span>
        </div>

      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('preview')}
            className={`px-4 py-2 font-black text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'preview'
                ? 'bg-slate-900 text-amber-400 shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>المعاينة المباشرة للفاتورة الرسمية</span>
          </button>

          <button
            onClick={() => setActiveSubTab('reports')}
            className={`px-4 py-2 font-black text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'reports'
                ? 'bg-slate-900 text-amber-400 shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <ListPlus className="w-4 h-4" />
            <span>جدول تقارير العمل المشمولة ({filteredReports.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('diesel')}
            className={`px-4 py-2 font-black text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'diesel'
                ? 'bg-slate-900 text-amber-400 shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Fuel className="w-4 h-4" />
            <span>بيانات وقود الديزل ({filteredDiesel.length})</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 font-bold hidden sm:inline">
          {filteredReports.length} تقرير مفلتر
        </span>
      </div>

      {/* SUB-TAB 1: Live Interactive Invoice Preview */}
      {activeSubTab === 'preview' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 max-w-5xl mx-auto text-slate-900 dark:text-slate-100">
          
          {/* Printable Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-slate-900 dark:border-slate-700 pb-5">
            <div>
              <div className="flex items-center gap-2 text-amber-500 font-black text-sm">
                <Building2 className="w-5 h-5" />
                <span>{projectInfo.companyName || 'شركة المقاولات العامة'}</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {projectInfo.name || 'مشروع إدارة وتأجير المعدات والمباني'}
              </h2>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 space-y-0.5">
                <p>الموقع الميداني: {projectInfo.location || '-'} | هاتف التواصل: {projectInfo.phone || '-'}</p>
                <p>المشرف المسؤول: {projectInfo.managerName || '-'} | الرقم الضريبي: {taxId || '-'}</p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-900/60 p-3.5 rounded-2xl text-right min-w-52 space-y-1">
              <span className="inline-block bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-lg">
                فاتورة مطالبة مالية
              </span>
              <p className="font-mono font-black text-base text-slate-900 dark:text-slate-100 mt-1">
                {invoiceNumber}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-bold">
                تاريخ الإصدار: <span className="font-mono">{issueDate}</span>
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold">
                تاريخ الاستحقاق: <span className="font-mono">{dueDate}</span>
              </p>
            </div>
          </div>

          {/* Client & Period Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">مطالبة موجهة إلى:</span>
              <strong className="text-base font-extrabold text-slate-900 dark:text-slate-100 block">
                {selectedCompany !== 'all' ? selectedCompany : (projectInfo.companyName || 'كافة الشركات والعملاء')}
              </strong>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                مطالبة مالية بتكاليف وساعات التشغيل والمستلزمات المقيدة بالتقارير
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">الفترة الزمنية للمطالبة:</span>
              <strong className="text-base font-extrabold text-slate-900 dark:text-slate-100 block">
                {startDate ? `من ${startDate}` : 'بداية المشروع'} {endDate ? `إلى ${endDate}` : 'حتى تاريخه'}
              </strong>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                إجمالي التقارير المسجلة بالفترة: {filteredReports.length} تقرير عمل
              </p>
            </div>
          </div>

          {/* Itemized Work Operations Table */}
          <div className="space-y-2">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span>تفاصيل أعمال التشغيل وساعات المعدات المشمولة بالفاتورة:</span>
              <span className="text-xs font-normal text-slate-500">{groupedEquipmentItems.length} بند معدة</span>
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-900 text-slate-200 font-extrabold">
                  <tr>
                    <th className="p-3 text-center">#</th>
                    <th className="p-3">اسم المعدة والتصنيف</th>
                    <th className="p-3">نوع العقد</th>
                    <th className="p-3 text-center">عدد التقارير</th>
                    <th className="p-3 text-center">إجمالي الساعات/الأمتار</th>
                    <th className="p-3 text-center">سعر الفئة</th>
                    <th className="p-3 text-left">المبلغ الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-bold bg-white dark:bg-slate-900">
                  {groupedEquipmentItems.length > 0 ? (
                    groupedEquipmentItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 text-center font-bold text-amber-500">{idx + 1}</td>
                        <td className="p-3 font-extrabold text-slate-900 dark:text-slate-100">
                          {item.equipmentName}
                          <span className="block text-[10px] text-slate-400 font-normal">{item.companyName}</span>
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300">
                          {getContractTypeName(item.contractType)}
                        </td>
                        <td className="p-3 text-center font-mono">{item.reportsCount}</td>
                        <td className="p-3 text-center font-mono text-blue-600 dark:text-blue-400 font-bold">
                          {item.contractType === 'meter' ? `${item.totalMeters} م` : `${item.totalHours} ساعة (${formatHoursDigital(item.totalHours)})`}
                        </td>
                        <td className="p-3 text-center font-mono">
                          {formatCurrency(item.ratePerUnit, projectInfo.currency)}
                        </td>
                        <td className="p-3 text-left font-mono font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(item.grossAmount, projectInfo.currency)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400 font-bold">
                        لا توجد أعمال مسجلة مطابقة لمحددات التصفية
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Itemized Deductions & Fuel Statement */}
          {(invoiceFinancials.appliedDieselDeduction > 0 || invoiceFinancials.appliedAdvancesDeduction > 0) && (
            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                بيان الخصومات والاستقطاعات المقيدة بالفاتورة:
              </h3>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold">
                    <tr>
                      <th className="p-2.5">نوع الخصم</th>
                      <th className="p-2.5">البيان والشرح</th>
                      <th className="p-2.5 text-center">الكمية</th>
                      <th className="p-2.5 text-left">قيمة الخصم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-bold">
                    {invoiceFinancials.appliedDieselDeduction > 0 && (
                      <tr>
                        <td className="p-2.5 text-amber-600 dark:text-amber-400">وقود الديزل المصروف</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400">كميات وقود الديزل المسلمة للمعدات التشغيلية والمقيدة كخصم</td>
                        <td className="p-2.5 text-center font-mono">{invoiceFinancials.totalDieselLiters.toLocaleString()} لتر</td>
                        <td className="p-2.5 text-left font-mono text-rose-600 dark:text-rose-400 font-black">
                          - {formatCurrency(invoiceFinancials.appliedDieselDeduction, projectInfo.currency)}
                        </td>
                      </tr>
                    )}
                    {invoiceFinancials.appliedAdvancesDeduction > 0 && (
                      <tr>
                        <td className="p-2.5 text-amber-600 dark:text-amber-400">السُلف اليومية للسائقين</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400">المبالغ النقدية المصروفة مقدماً كسُلف يومية في التقارير</td>
                        <td className="p-2.5 text-center font-mono">مقيدة بالتقارير</td>
                        <td className="p-2.5 text-left font-mono text-rose-600 dark:text-rose-400 font-black">
                          - {formatCurrency(invoiceFinancials.appliedAdvancesDeduction, projectInfo.currency)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Financial Calculation Grand Block */}
          <div className="bg-slate-950 text-white rounded-2xl p-5 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className="text-[11px] text-slate-400 block">إجمالي مستحقات التشغيل:</span>
              <strong className="text-lg font-black text-amber-400 font-mono block mt-1">
                {formatCurrency(invoiceFinancials.grossWorkTotal, projectInfo.currency)}
              </strong>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">إجمالي الخصومات والديزل:</span>
              <strong className="text-lg font-black text-rose-400 font-mono block mt-1">
                - {formatCurrency(invoiceFinancials.totalDeductions, projectInfo.currency)}
              </strong>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">ضريبة القيمة المضافة ({taxRate}%):</span>
              <strong className="text-lg font-black text-sky-400 font-mono block mt-1">
                {formatCurrency(invoiceFinancials.taxAmount, projectInfo.currency)}
              </strong>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-emerald-400 font-extrabold block">صافي الفاتورة النهائي المستحق:</span>
              <strong className="text-xl font-black text-emerald-400 font-mono block mt-1">
                {formatCurrency(invoiceFinancials.grandNetPayable, projectInfo.currency)}
              </strong>
            </div>
          </div>

          {/* Editable Terms & Notes Box */}
          <div className="space-y-1">
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
              ملاحظات وشروط المطالبة المالية:
            </label>
            <textarea
              rows={2}
              value={invoiceNotes}
              onChange={(e) => setInvoiceNotes(e.target.value)}
              placeholder="اكتب ملاحظات الشروط أو بيانات الحساب البنكي للسداد..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Printable Signature & Stamp Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs font-bold">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <span>توقيع وتدقيق المحاسب</span>
              <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-[10px] text-slate-400">
                التوقيع
              </div>
              <span className="text-[10px] text-slate-500 block">قسم الحسابات</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <span>المشرف / مهندس الموقع</span>
              <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-[10px] text-slate-400">
                المطابقة الميدانية
              </div>
              <span className="text-[10px] text-slate-500 block">{projectInfo.managerName || '-'}</span>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-3">
              <span className="text-amber-900 dark:text-amber-400 font-extrabold">اعتماد مدير الشركة والختم</span>
              <div className="h-10 border-b border-dashed border-amber-300 dark:border-amber-800 flex items-center justify-center text-[10px] text-amber-700">
                الختم والتوقيع الرسمي
              </div>
              <span className="text-[10px] text-amber-800 dark:text-amber-500 block">{projectInfo.companyName || '-'}</span>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: Underlying Work Reports List */}
      {activeSubTab === 'reports' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs font-bold">
            <span className="text-slate-700 dark:text-slate-300">
              قائمة تقارير العمل المسجلة والداخلة بالحساب للفترة الحالية ({filteredReports.length})
            </span>
            <span className="font-mono text-amber-600 font-black">
              إجمالي المستحقات: {formatCurrency(invoiceFinancials.grossWorkTotal, projectInfo.currency)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900 text-slate-200 font-extrabold">
                <tr>
                  <th className="p-3 text-center">#</th>
                  <th className="p-3">رقم التقرير</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">اسم المعدة</th>
                  <th className="p-3">الشركة المؤجرة</th>
                  <th className="p-3">السائق</th>
                  <th className="p-3 text-center">ساعات العمل</th>
                  <th className="p-3 text-center">الفئة</th>
                  <th className="p-3 text-center">الإجمالي</th>
                  <th className="p-3 text-center">الخصم (الديزل/السلفة)</th>
                  <th className="p-3 text-left">الصافي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-bold text-slate-800 dark:text-slate-200">
                {filteredReports.length > 0 ? (
                  filteredReports.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 text-center text-amber-500 font-bold">{idx + 1}</td>
                      <td className="p-3 font-mono font-black text-slate-900 dark:text-slate-100">{r.reportNumber}</td>
                      <td className="p-3">{r.date}</td>
                      <td className="p-3 text-amber-600 font-extrabold">{r.equipmentName}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{r.companyName || '-'}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{r.driverName || '-'}</td>
                      <td className="p-3 text-center font-mono text-blue-600 font-extrabold">
                        {r.totalNetHours} ساعة ({formatHoursDigital(r.totalNetHours)})
                      </td>
                      <td className="p-3 text-center font-mono">{formatCurrency(r.ratePerUnit, projectInfo.currency)}</td>
                      <td className="p-3 text-center font-mono text-emerald-600 font-bold">{formatCurrency(r.grossAmount, projectInfo.currency)}</td>
                      <td className="p-3 text-center font-mono text-rose-600">
                        {formatCurrency((r.costs?.dieselTotalCost || 0) + (r.driverAdvance || 0), projectInfo.currency)}
                      </td>
                      <td className="p-3 text-left font-mono font-black text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(r.netCompanyDue, projectInfo.currency)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="p-6 text-center text-slate-400 font-bold">
                      لا توجد تقارير عمل في النطاق المحدد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Underlying Diesel Transactions List */}
      {activeSubTab === 'diesel' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs font-bold">
            <span className="text-slate-700 dark:text-slate-300">
              سجل صادر وقود الديزل المورد والمصروف للمعدات بالفترة ({filteredDiesel.length})
            </span>
            <span className="font-mono text-rose-600 font-black">
              إجمالي تكلفة الوقود: {formatCurrency(invoiceFinancials.totalDieselCost, projectInfo.currency)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900 text-slate-200 font-extrabold">
                <tr>
                  <th className="p-3 text-center">#</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">رقم السند/الفاتورة</th>
                  <th className="p-3">اسم المعدة المستفيدة</th>
                  <th className="p-3">المستلم / السائق</th>
                  <th className="p-3 text-center">الكمية (لتر)</th>
                  <th className="p-3 text-center">سعر اللتر</th>
                  <th className="p-3 text-left">التكلفة الإجمالية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-bold text-slate-800 dark:text-slate-200">
                {filteredDiesel.length > 0 ? (
                  filteredDiesel.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 text-center text-amber-500 font-bold">{idx + 1}</td>
                      <td className="p-3">{t.date}</td>
                      <td className="p-3 font-mono text-slate-500">{t.voucherNumber || t.invoiceNumber || '-'}</td>
                      <td className="p-3 font-extrabold text-amber-600">{t.equipmentName || '-'}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{t.driverName || '-'}</td>
                      <td className="p-3 text-center font-mono text-blue-600 font-extrabold">{t.quantityLiters.toLocaleString()} لتر</td>
                      <td className="p-3 text-center font-mono">{formatCurrency(t.pricePerLiter, projectInfo.currency)}</td>
                      <td className="p-3 text-left font-mono font-black text-rose-600 dark:text-rose-400">
                        {formatCurrency(t.totalCost, projectInfo.currency)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-400 font-bold">
                      لا توجد حركات ديزل مسجلة بالفترة الحالية
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
