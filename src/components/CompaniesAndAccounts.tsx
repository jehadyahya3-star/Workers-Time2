import React, { useState } from 'react';
import { Company, WorkReport, DieselTransaction, CompanyPayment, Equipment, ProjectInfo } from '../types';
import { formatCurrency, formatHoursDigital } from '../utils/exportUtils';
import { 
  Building2, 
  Plus, 
  DollarSign, 
  FileText, 
  Clock, 
  Calendar, 
  Fuel, 
  Droplet, 
  UserCheck, 
  CreditCard, 
  Printer, 
  X, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  ArrowDownCircle,
  ArrowUpRight,
  TrendingDown,
  ChevronRight
} from 'lucide-react';

interface CompaniesAndAccountsProps {
  companies: Company[];
  reports: WorkReport[];
  dieselTransactions?: DieselTransaction[];
  companyPayments?: CompanyPayment[];
  equipmentList?: Equipment[];
  projectInfo?: ProjectInfo;
  onAddCompany: (company: Company) => void;
  onAddCompanyPayment?: (payment: CompanyPayment) => void;
  onDeleteCompanyPayment?: (paymentId: string) => void;
}

export const CompaniesAndAccounts: React.FC<CompaniesAndAccountsProps> = ({
  companies,
  reports,
  dieselTransactions = [],
  companyPayments = [],
  equipmentList = [],
  projectInfo,
  onAddCompany,
  onAddCompanyPayment,
  onDeleteCompanyPayment
}) => {
  const currencySymbol = projectInfo?.currency || 'ر.ي';
  const formatCurr = (amount: number) => formatCurrency(amount, currencySymbol);

  // Modal States
  const [selectedCompanyForStatement, setSelectedCompanyForStatement] = useState<Company | null>(null);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [paymentForCompany, setPaymentForCompany] = useState<Company | null>(null);

  // Filters inside Statement Modal
  const [statementStartDate, setStatementStartDate] = useState<string>('');
  const [statementEndDate, setStatementEndDate] = useState<string>('');
  const [statementEquipmentFilter, setStatementEquipmentFilter] = useState<string>('all');
  const [includeDieselInDeductions, setIncludeDieselInDeductions] = useState<boolean>(true);
  const [includeEngineOilInDeductions, setIncludeEngineOilInDeductions] = useState<boolean>(true);

  // Form States for Add Company
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyContact, setNewCompanyContact] = useState('');
  const [newCompanyPhone, setNewCompanyPhone] = useState('');
  const [newCompanyAddress, setNewCompanyAddress] = useState('');

  // Form States for Add Payment
  const [paymentAmount, setPaymentAmount] = useState<number>(10000);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'حوالة بنكية' | 'نقدي' | 'شيك' | 'سند صرف'>('حوالة بنكية');
  const [paymentRefNumber, setPaymentRefNumber] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Helper calculation for a company
  const calculateCompanyStats = (company: Company) => {
    // 1. Company Reports
    let compReports = reports.filter(r => r.companyName === company.name);
    
    if (selectedCompanyForStatement?.id === company.id) {
      if (statementStartDate) {
        compReports = compReports.filter(r => r.date >= statementStartDate);
      }
      if (statementEndDate) {
        compReports = compReports.filter(r => r.date <= statementEndDate);
      }
      if (statementEquipmentFilter !== 'all') {
        compReports = compReports.filter(r => r.equipmentName === statementEquipmentFilter);
      }
    }

    // Work Hours & Days
    const totalHours = compReports.reduce((acc, r) => acc + (r.totalNetHours || 0), 0);
    const uniqueDays = new Set(compReports.map(r => r.date)).size;

    // Gross Amount
    const grossAmount = compReports.reduce((acc, r) => acc + (r.grossAmount || 0), 0);

    // Driver Advances
    const driverAdvances = compReports.reduce((acc, r) => acc + (r.driverAdvance || 0), 0);

    // Diesel Costs (Report level + Diesel transactions for equipment)
    const reportDieselCost = compReports.reduce((acc, r) => {
      // If report flagged dieselOnLessor OR if global statement toggle is enabled
      const isLessor = r.costs?.dieselOnLessor ?? includeDieselInDeductions;
      return isLessor ? acc + (r.costs?.dieselTotalCost || 0) : acc;
    }, 0);

    // Hydraulic Oil Costs (ALWAYS on Lessor)
    const hydraulicOilCost = compReports.reduce((acc, r) => acc + (r.costs?.hydraulicOilCost || 0), 0);

    // Engine Oil Costs (Optional: on Lessor)
    const engineOilCost = compReports.reduce((acc, r) => {
      const isLessor = r.costs?.engineOilOnLessor ?? includeEngineOilInDeductions;
      return isLessor ? acc + (r.costs?.engineOilCost || 0) : acc;
    }, 0);

    // Direct Payments / Transfers to Lessor
    let compPayments = companyPayments.filter(p => p.companyName === company.name);
    if (selectedCompanyForStatement?.id === company.id) {
      if (statementStartDate) compPayments = compPayments.filter(p => p.date >= statementStartDate);
      if (statementEndDate) compPayments = compPayments.filter(p => p.date <= statementEndDate);
    }
    const totalPaymentsPaid = compPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

    // Total Deductions sum
    const totalDeductions = driverAdvances + reportDieselCost + hydraulicOilCost + engineOilCost + totalPaymentsPaid;

    // Net Remaining Owed Balance
    const netRemaining = grossAmount - totalDeductions;

    return {
      compReports,
      compPayments,
      totalHours,
      uniqueDays,
      grossAmount,
      driverAdvances,
      reportDieselCost,
      hydraulicOilCost,
      engineOilCost,
      totalPaymentsPaid,
      totalDeductions,
      netRemaining
    };
  };

  // Handle submit Add Company
  const handleAddCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    onAddCompany({
      id: `c-${Date.now()}`,
      name: newCompanyName,
      contactPerson: newCompanyContact || 'مسؤول الاتصال',
      phone: newCompanyPhone || '0500000000',
      address: newCompanyAddress,
      totalWorkAmount: 0,
      totalAdvances: 0,
      totalPaid: 0,
      remainingBalance: 0
    });
    setNewCompanyName('');
    setNewCompanyContact('');
    setNewCompanyPhone('');
    setNewCompanyAddress('');
    setShowAddCompanyModal(false);
  };

  // Handle submit Add Payment
  const handleAddPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForCompany || !paymentAmount) return;
    if (onAddCompanyPayment) {
      onAddCompanyPayment({
        id: `cp-${Date.now()}`,
        companyName: paymentForCompany.name,
        date: paymentDate,
        amount: paymentAmount,
        paymentMethod,
        referenceNumber: paymentRefNumber,
        notes: paymentNotes,
        createdAt: new Date().toISOString()
      });
    }
    setPaymentRefNumber('');
    setPaymentNotes('');
    setShowAddPaymentModal(false);
  };

  // Printable HTML Export function for Company Statement
  // Printable HTML Export function for Monthly Invoice
  const handlePrintInvoice = () => {
    if (!selectedCompanyForStatement) return;
    const stats = calculateCompanyStats(selectedCompanyForStatement);
    const companyEqList = equipmentList.filter(e => e.companyName === selectedCompanyForStatement.name);
    
    // Generate Invoice Number based on date
    const invoiceNo = `INV-${new Date().getFullYear()}${(new Date().getMonth()+1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 9000 + 1000)}`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formatCurr = (num: number) => Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة تشغيل معدات - ${selectedCompanyForStatement.name}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            background: #ffffff;
            color: #0f172a;
            padding: 40px;
            margin: 0;
            direction: rtl;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #f59e0b;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .invoice-header h1 {
            font-size: 28px;
            color: #0f172a;
            margin: 0 0 5px 0;
            font-weight: 900;
          }
          .invoice-header .project-name {
            font-size: 14px;
            color: #64748b;
            font-weight: bold;
          }
          .invoice-details {
            text-align: left;
          }
          .invoice-details div {
            margin-bottom: 5px;
            font-size: 13px;
          }
          .invoice-details strong {
            display: inline-block;
            width: 100px;
          }
          .parties {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .party-box {
            width: 48%;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 15px;
            border-radius: 8px;
          }
          .party-box h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #64748b;
            text-transform: uppercase;
          }
          .party-box p {
            margin: 0;
            font-size: 16px;
            font-weight: bold;
            color: #0f172a;
          }
          .party-box .contact {
            margin-top: 5px;
            font-size: 13px;
            color: #475569;
            font-weight: normal;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-bottom: 30px;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 10px;
          }
          th {
            background: #0f172a;
            color: #ffffff;
            font-weight: bold;
            text-align: center;
          }
          td { text-align: center; }
          td.left-align { text-align: left; font-weight: bold; }
          tr:nth-child(even) { background: #f8fafc; }
          .totals-table {
            width: 50%;
            margin-left: 0;
            margin-right: auto;
          }
          .totals-table td {
            border: none;
            border-bottom: 1px solid #e2e8f0;
            padding: 8px 10px;
          }
          .totals-table td:first-child {
            text-align: right;
            font-weight: bold;
            color: #475569;
          }
          .totals-table td:last-child {
            text-align: left;
            font-weight: 900;
            font-size: 14px;
            color: #0f172a;
          }
          .totals-table tr.grand-total td {
            border-bottom: 2px solid #0f172a;
            border-top: 2px solid #0f172a;
            color: #059669;
            font-size: 16px;
            background: #ecfdf5;
          }
          .totals-table tr.deduction td:last-child {
            color: #dc2626;
          }
          .footer {
            margin-top: 50px;
            font-size: 12px;
            color: #64748b;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 60px;
            padding: 0 40px;
          }
          .sig-box {
            text-align: center;
            width: 200px;
          }
          .sig-line {
            border-bottom: 1px solid #0f172a;
            margin-top: 40px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div>
            <h1>فاتورة ضريبية / مطالبة مالية</h1>
            <div class="project-name">${projectInfo?.name || 'مشروع إدارة المقاولات والمعدات'}</div>
          </div>
          <div class="invoice-details">
            <div><strong>رقم الفاتورة:</strong> ${invoiceNo}</div>
            <div><strong>تاريخ الإصدار:</strong> ${new Date().toLocaleDateString('ar-SA')}</div>
            <div><strong>الفترة من:</strong> ${statementStartDate ? new Date(statementStartDate).toLocaleDateString('ar-SA') : 'بداية العمل'}</div>
            <div><strong>الفترة إلى:</strong> ${statementEndDate ? new Date(statementEndDate).toLocaleDateString('ar-SA') : 'حتى تاريخه'}</div>
          </div>
        </div>

        <div class="parties">
          <div class="party-box">
            <h3>مُصدر الفاتورة (المشروع)</h3>
            <p>${projectInfo?.name || 'مشروع المقاولات'}</p>
            <div class="contact">إدارة المشروع / المشتريات</div>
          </div>
          <div class="party-box">
            <h3>مُوجّهة إلى (الشركة المؤجرة)</h3>
            <p>${selectedCompanyForStatement.name}</p>
            <div class="contact">
              عناية السيد: ${selectedCompanyForStatement.contactPerson}<br/>
              هاتف: ${selectedCompanyForStatement.phone}<br/>
              العنوان: ${selectedCompanyForStatement.address || '-'}
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>المعدة (الرقم)</th>
              <th>إجمالي الساعات/الأيام</th>
              <th>الإجمالي (${currencySymbol})</th>
            </tr>
          </thead>
          <tbody>
            ${companyEqList.map((eq, index) => {
              const eqReports = stats.compReports.filter(r => r.equipmentRegNumber === eq.regNumber);
              if(eqReports.length === 0) return '';
              const eqTotalHours = eqReports.reduce((sum, r) => sum + r.totalNetHours, 0);
              const eqTotalGross = eqReports.reduce((sum, r) => sum + (r.grossAmount || 0), 0);
              const isHourly = eqReports.some(r => r.contractType === 'hourly' || r.contractType === 'monthly');
              const eqTotalValue = isHourly ? formatHoursDigital(eqTotalHours) : eqReports.length + ' يوم';
              return `
                <tr>
                  <td>${index + 1}</td>
                  <td>${eq.name} (${eq.regNumber})</td>
                  <td>${eqTotalValue}</td>
                  <td class="left-align">${eqTotalGross.toLocaleString()}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <table class="totals-table">
          <tbody>
            <tr>
              <td>إجمالي قيمة الأعمال:</td>
              <td>${formatCurr(stats.grossAmount)}</td>
            </tr>
            <tr class="deduction">
              <td>يخصم: السلف النقدية للسائقين:</td>
              <td>- ${formatCurr(stats.driverAdvances)}</td>
            </tr>
            <tr class="deduction">
              <td>يخصم: مسحوبات الديزل:</td>
              <td>- ${formatCurr(stats.reportDieselCost)}</td>
            </tr>
            <tr class="deduction">
              <td>يخصم: زيوت وصيانات:</td>
              <td>- ${formatCurr((stats.hydraulicOilCost || 0) + (stats.engineOilCost || 0))}</td>
            </tr>
            <tr class="deduction">
              <td>يخصم: دفعات نقدية محولة:</td>
              <td>- ${formatCurr(stats.totalPaymentsPaid)}</td>
            </tr>
            <tr class="grand-total">
              <td>الصافي المستحق للدفع:</td>
              <td>${formatCurr(stats.netRemaining)}</td>
            </tr>
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-box">
            <div class="sig-line"></div>
            <div>توقيع ممثل المشروع</div>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <div>ختم / توقيع الشركة المؤجرة</div>
          </div>
        </div>

        <div class="footer">
          تم إنشاء هذه الفاتورة آلياً من نظام إدارة المعدات والمشاريع
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handlePrintStatement = () => {
    if (!selectedCompanyForStatement) return;
    const stats = calculateCompanyStats(selectedCompanyForStatement);
    const companyEqList = equipmentList.filter(e => e.companyName === selectedCompanyForStatement.name);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>كشف حساب شركة مؤجرة - ${selectedCompanyForStatement.name}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            background: #ffffff;
            color: #0f172a;
            padding: 25px;
            margin: 0;
            direction: rtl;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .header h1 { margin: 0 0 5px 0; font-size: 22px; color: #0f172a; font-weight: 900; }
          .header p { margin: 0; font-size: 13px; color: #475569; }
          .meta-box {
            display: flex;
            justify-content: space-between;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 12px 18px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 12px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 25px;
          }
          .summary-card {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 10px;
            border-radius: 6px;
            text-align: center;
          }
          .summary-card.highlight {
            background: #ecfdf5;
            border-color: #10b981;
            color: #065f46;
          }
          .summary-card .title { font-size: 10px; color: #475569; font-weight: bold; }
          .summary-card .value { font-size: 15px; font-weight: 900; margin-top: 4px; }
          section { margin-bottom: 22px; }
          section h3 {
            font-size: 14px;
            font-weight: 800;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 6px;
            margin-bottom: 10px;
            color: #1e293b;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-bottom: 10px;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 7px 9px;
            text-align: right;
          }
          th { background: #0f172a; color: #ffffff; font-weight: bold; }
          tr:nth-child(even) { background: #f8fafc; }
          .total-row { background: #e2e8f0; font-weight: bold; }
          .footer-sig {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            font-weight: bold;
            padding: 0 30px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${projectInfo?.name || 'مشروع إدارة المقاولات والمعدات'}</h1>
          <p>كشف حساب مالي تفصيلي للشركة المؤجرة للمعدات</p>
        </div>

        <div class="meta-box">
          <div>
            <strong>اسم الشركة المؤجرة:</strong> ${selectedCompanyForStatement.name}<br/>
            <strong>مسؤول الاتصال:</strong> ${selectedCompanyForStatement.contactPerson} (${selectedCompanyForStatement.phone})
          </div>
          <div>
            <strong>تاريخ إصدار الكشف:</strong> ${new Date().toLocaleDateString('ar-SA')}<br/>
            <strong>العملة المعتمدة:</strong> ${currencySymbol}
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="title">إجمالي ساعات العمل</div>
            <div class="value">${formatHoursDigital(stats.totalHours)}</div>
          </div>
          <div class="summary-card">
            <div class="title">عدد أيام التشغيل</div>
            <div class="value">${stats.uniqueDays} يوم عمل</div>
          </div>
          <div class="summary-card">
            <div class="title">إجمالي أجور المعدات</div>
            <div class="value">${formatCurr(stats.grossAmount)}</div>
          </div>
          <div class="summary-card highlight">
            <div class="title">الصافي المتبقي للشركة</div>
            <div class="value">${formatCurr(stats.netRemaining)}</div>
          </div>
        </div>

        <section>
          <h3>1. تقرير ساعات وأيام عمل معدات الشركة</h3>
          <table>
            <thead>
              <tr>
                <th>رقم التقرير</th>
                <th>التاريخ</th>
                <th>اسم المعدة ورقمها</th>
                <th>السائق</th>
                <th>ساعات العمل</th>
                <th>الفئة / السعر</th>
                <th>الإجمالي (${currencySymbol})</th>
              </tr>
            </thead>
            <tbody>
              ${stats.compReports.map(r => `
                <tr>
                  <td>${r.reportNumber}</td>
                  <td>${r.date}</td>
                  <td>${r.equipmentName} (${r.equipmentRegNumber})</td>
                  <td>${r.driverName}</td>
                  <td>${r.workLocation || '-'}</td>
                  <td>${r.workItem || '-'}</td>
                  <td>${formatHoursDigital(r.totalNetHours)}</td>
                  <td>${r.ratePerUnit}</td>
                  <td>${(r.grossAmount || 0).toLocaleString()}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="6">المجموع الكلي لأجور وساعات التشغيل</td>
                <td>${formatHoursDigital(stats.totalHours)}</td>
                <td>-</td>
                <td>${formatCurr(stats.grossAmount)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h3>2. بيان السُلف اليومية المعطاة للسائقين</h3>
          <table>
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>اسم السائق</th>
                <th>المعدة</th>
                <th>مبلغ السلفة اليومية (${currencySymbol})</th>
                <th>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              ${stats.compReports.filter(r => (r.driverAdvance || 0) > 0).map(r => `
                <tr>
                  <td>${r.date}</td>
                  <td>${r.driverName}</td>
                  <td>${r.equipmentName}</td>
                  <td>${r.driverAdvance}</td>
                  <td>${r.notes || '-'}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3">إجمالي سُلف السائقين المخصومة</td>
                <td>${formatCurr(stats.driverAdvances)}</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h3>3. بيان الدفعات والتحويلات المالية المسددة للشركة</h3>
          <table>
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>طريقة الدفع</th>
                <th>رقم الحوالة / السند</th>
                <th>المبلغ المسدد (${currencySymbol})</th>
                <th>البيان والملاحظات</th>
              </tr>
            </thead>
            <tbody>
              ${stats.compPayments.map(p => `
                <tr>
                  <td>${p.date}</td>
                  <td>${p.paymentMethod}</td>
                  <td>${p.referenceNumber || '-'}</td>
                  <td>${p.amount.toLocaleString()}</td>
                  <td>${p.notes || '-'}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3">إجمالي الدفعات والتحويلات النقدية المسددة</td>
                <td>${formatCurr(stats.totalPaymentsPaid)}</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h3>4. التصفية والتسوية الحسابية النهائية</h3>
          <table>
            <tbody>
              <tr>
                <td><strong>(+) إجمالي أجور وساعات تشغيل المعدات</strong></td>
                <td style="color: #059669; font-weight: bold;">+ ${formatCurr(stats.grossAmount)}</td>
              </tr>
              <tr>
                <td><strong>(-) إجمالي السُلف اليومية المعطاة للسائقين</strong></td>
                <td style="color: #d97706;">- ${formatCurr(stats.driverAdvances)}</td>
              </tr>
              <tr>
                <td><strong>(-) إجمالي الديزل المقيّد على الشركة</strong></td>
                <td style="color: #d97706;">- ${formatCurr(stats.reportDieselCost)}</td>
              </tr>
              <tr>
                <td><strong>(-) إجمالي زيت الهيدروليك (خصم تلقائي دائماً)</strong></td>
                <td style="color: #d97706;">- ${formatCurr(stats.hydraulicOilCost)}</td>
              </tr>
              <tr>
                <td><strong>(-) إجمالي زيت المكينة المقيّد على الشركة</strong></td>
                <td style="color: #d97706;">- ${formatCurr(stats.engineOilCost)}</td>
              </tr>
              <tr>
                <td><strong>(-) إجمالي الدفعات والتحويلات المالية المسددة للشركة</strong></td>
                <td style="color: #d97706;">- ${formatCurr(stats.totalPaymentsPaid)}</td>
              </tr>
              <tr style="background: #0f172a; color: #ffffff; font-size: 13px; font-weight: 900;">
                <td><strong>(=) الصافي النهائي المتبقي والواجب تسديده للشركة المؤجرة</strong></td>
                <td style="color: #34d399;">${formatCurr(stats.netRemaining)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <div class="footer-sig">
          <div>المحاسب المسؤول: .............................</div>
          <div>اعتماد الشركة المؤجرة: .............................</div>
          <div>مدير المشروع: .............................</div>
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-500" />
            <span>كشوفات حسابات الشركات المؤجرة للمعدات</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            متابعة دقيقة لساعات عمل المعدات، أيام التشغيل، سُلف السائقين، تكاليف الديزل والزيوت، والدفعات المالية ({currencySymbol})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddCompanyModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-amber-500/10 transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة شركة مؤجرة جديدة</span>
          </button>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {companies.map((c) => {
          const stats = calculateCompanyStats(c);
          const companyEquipment = equipmentList.filter(e => e.companyName === c.name);

          return (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all">
              
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{c.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">مسؤول الاتصال: {c.contactPerson} ({c.phone})</p>
                  </div>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-200">
                    {companyEquipment.length} معدة
                  </span>
                </div>

                {c.address && (
                  <p className="text-[11px] text-slate-400 truncate">العنوان: {c.address}</p>
                )}
              </div>

              {/* Card Body - Financial & Operational Statistics */}
              <div className="p-5 space-y-3 text-xs">
                
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold">إجمالي ساعات العمل:</span>
                    <span className="font-black text-slate-900 text-sm">{formatHoursDigital(stats.totalHours)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold">أيام التشغيل الفعلية:</span>
                    <span className="font-black text-slate-900 text-sm">{stats.uniqueDays} يوم</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>إجمالي أجور أوقات التشغيل:</span>
                    <span className="font-extrabold text-slate-900">{formatCurr(stats.grossAmount)}</span>
                  </div>

                  <div className="flex justify-between items-center text-amber-800">
                    <span>إجمالي سُلف السائقين الميدانية:</span>
                    <span className="font-extrabold text-amber-700">- {formatCurr(stats.driverAdvances)}</span>
                  </div>

                  <div className="flex justify-between items-center text-rose-700">
                    <span>خصم الديزل والزيوت المقيّدة:</span>
                    <span className="font-extrabold text-rose-600">
                      - {formatCurr(stats.reportDieselCost + stats.hydraulicOilCost + stats.engineOilCost)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-emerald-800">
                    <span>الدفعات والتحويلات المسددة:</span>
                    <span className="font-extrabold text-emerald-700">- {formatCurr(stats.totalPaymentsPaid)}</span>
                  </div>

                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-black text-emerald-900 bg-emerald-50/80 p-2.5 rounded-xl">
                    <span>الصافي المتبقي للشركة:</span>
                    <span>{formatCurr(stats.netRemaining)}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setSelectedCompanyForStatement(c);
                    setStatementStartDate('');
                    setStatementEndDate('');
                    setStatementEquipmentFilter('all');
                  }}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>عرض كشف الحساب التفصيلي</span>
                </button>

                <button
                  onClick={() => {
                    setPaymentForCompany(c);
                    setPaymentAmount(10000);
                    setShowAddPaymentModal(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="تسجيل دفعة جديدة للشركة"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>دفعة</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* MODAL 1: Detailed Company Statement Modal */}
      {selectedCompanyForStatement && (() => {
        const stats = calculateCompanyStats(selectedCompanyForStatement);
        const companyEqList = equipmentList.filter(e => e.companyName === selectedCompanyForStatement.name);

        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
              
              {/* Modal Header */}
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-white">كشف حساب الشركة المؤجرة التفصيلي</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedCompanyForStatement.name} - مسؤول الاتصال: {selectedCompanyForStatement.contactPerson} ({selectedCompanyForStatement.phone})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintInvoice}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
                  >
                    <FileText className="w-4 h-4" />
                    <span>تصدير فاتورة شهرية</span>
                  </button>
                  <button
                    onClick={handlePrintStatement}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة كشف حساب</span>
                  </button>

                  <button
                    onClick={() => setSelectedCompanyForStatement(null)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Statement Filters Bar */}
              <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">من تاريخ:</label>
                  <input
                    type="date"
                    value={statementStartDate}
                    onChange={(e) => setStatementStartDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">إلى تاريخ:</label>
                  <input
                    type="date"
                    value={statementEndDate}
                    onChange={(e) => setStatementEndDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">تصفية حسب المعدة:</label>
                  <select
                    value={statementEquipmentFilter}
                    onChange={(e) => setStatementEquipmentFilter(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800"
                  >
                    <option value="all">كافة معدات الشركة</option>
                    {companyEqList.map(eq => (
                      <option key={eq.id} value={eq.name}>{eq.name} ({eq.regNumber})</option>
                    ))}
                  </select>
                </div>

                {/* Expense Deduction Toggles */}
                <div className="flex flex-col justify-center space-y-1 bg-amber-50/70 p-2 rounded-xl border border-amber-200">
                  <label className="text-[10px] font-extrabold text-amber-950 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDieselInDeductions}
                      onChange={(e) => setIncludeDieselInDeductions(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>تقييد الديزل خصماً على الشركة</span>
                  </label>

                  <label className="text-[10px] font-extrabold text-amber-950 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeEngineOilInDeductions}
                      onChange={(e) => setIncludeEngineOilInDeductions(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>تقييد زيت المكينة خصماً على الشركة</span>
                  </label>
                </div>
              </div>

              {/* Modal Body / Scrollable Content */}
              <div className="p-5 overflow-y-auto space-y-6 text-xs">
                
                {/* 1. Summary Cards Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 font-bold block">ساعات العمل</span>
                    <span className="text-sm font-black text-slate-900">{formatHoursDigital(stats.totalHours)}</span>
                  </div>

                  <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 font-bold block">أيام التشغيل</span>
                    <span className="text-sm font-black text-slate-900">{stats.uniqueDays} يوم</span>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200 text-center">
                    <span className="text-[10px] text-blue-700 font-bold block">إجمالي أجور التشغيل</span>
                    <span className="text-sm font-black text-blue-900">{formatCurr(stats.grossAmount)}</span>
                  </div>

                  <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-center">
                    <span className="text-[10px] text-amber-800 font-bold block">إجمالي المخصومات</span>
                    <span className="text-sm font-black text-amber-900">- {formatCurr(stats.totalDeductions)}</span>
                  </div>

                  <div className="col-span-2 sm:col-span-1 bg-emerald-50 p-3 rounded-2xl border border-emerald-300 text-center shadow-sm">
                    <span className="text-[10px] text-emerald-800 font-bold block">الصافي المتبقي للشركة</span>
                    <span className="text-base font-black text-emerald-900">{formatCurr(stats.netRemaining)}</span>
                  </div>
                </div>

                {/* 2. Work Hours & Operating Sessions Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>1. تقرير ساعات وأيام عمل معدات الشركة ({stats.compReports.length} تقرير)</span>
                    </h4>
                    <span className="text-[11px] font-bold text-slate-500">
                      مجموع الساعات: {formatHoursDigital(stats.totalHours)} | الأيام: {stats.uniqueDays} يوم عمل
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white font-bold text-[11px]">
                          <th className="p-2.5">رقم التقرير</th>
                          <th className="p-2.5">التاريخ</th>
                          <th className="p-2.5">اسم المعدة ورقمها</th>
                          <th className="p-2.5">اسم السائق</th>
                          <th className="p-2.5">موقع العمل</th>
                          <th className="p-2.5">بند العمل</th>
                          <th className="p-2.5">نوع العقد</th>
                          <th className="p-2.5 text-center">ساعات العمل</th>
                          <th className="p-2.5 text-center">الفئة/السعر</th>
                          <th className="p-2.5 text-left">الإجمالي ({currencySymbol})</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold">
                        {stats.compReports.map(r => (
                          <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-2.5 text-slate-900">{r.reportNumber}</td>
                            <td className="p-2.5 text-slate-600">{r.date}</td>
                            <td className="p-2.5 text-slate-900">{r.equipmentName} ({r.equipmentRegNumber})</td>
                            <td className="p-2.5 text-slate-700">{r.driverName}</td>
                            <td className="p-2.5 text-slate-500">{r.workLocation || '-'}</td>
                            <td className="p-2.5 text-slate-500">{r.workItem || '-'}</td>
                            <td className="p-2.5 text-slate-500">{r.contractType}</td>
                            <td className="p-2.5 text-center text-amber-700 font-extrabold">{formatHoursDigital(r.totalNetHours)}</td>
                            <td className="p-2.5 text-center text-slate-800">{r.ratePerUnit}</td>
                            <td className="p-2.5 text-left font-black text-slate-900">{(r.grossAmount || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-100 font-black text-slate-900 text-xs">
                          <td colSpan={7} className="p-2.5">إجمالي أجور وساعات تشغيل المعدات</td>
                          <td className="p-2.5 text-center text-amber-800">{formatHoursDigital(stats.totalHours)}</td>
                          <td className="p-2.5 text-center">-</td>
                          <td className="p-2.5 text-left text-blue-900">{formatCurr(stats.grossAmount)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* 3. Driver Daily Advances Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-amber-500" />
                      <span>2. بيان السُلف اليومية المعطاة للسائقين (تُخصم من مستحقات الشركة)</span>
                    </h4>
                    <span className="text-[11px] font-bold text-amber-700">
                      الإجمالي: - {formatCurr(stats.driverAdvances)}
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 font-bold text-[11px]">
                          <th className="p-2.5">التاريخ</th>
                          <th className="p-2.5">اسم السائق</th>
                          <th className="p-2.5">المعدة</th>
                          <th className="p-2.5 text-left">مبلغ السلفة ({currencySymbol})</th>
                          <th className="p-2.5">البيان والملاحظات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold">
                        {stats.compReports.filter(r => (r.driverAdvance || 0) > 0).map(r => (
                          <tr key={`adv-${r.id}`} className="hover:bg-slate-50">
                            <td className="p-2.5 text-slate-600">{r.date}</td>
                            <td className="p-2.5 text-slate-900">{r.driverName}</td>
                            <td className="p-2.5 text-slate-700">{r.equipmentName}</td>
                            <td className="p-2.5 text-left text-amber-700 font-extrabold">{r.driverAdvance}</td>
                            <td className="p-2.5 text-slate-500">{r.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Oil Expenses Section (Hydraulic Oil Always + Engine Oil Option) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      <Droplet className="w-4 h-4 text-sky-500" />
                      <span>3. مصاريف الزيوت (زيت الهيدروليك دائماً خصم + زيت المكينة حسب التقييد)</span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-sky-50 p-3.5 rounded-2xl border border-sky-200 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-sky-950 text-xs">زيت الهيدروليك (دائماً على الشركة):</span>
                        <span className="font-black text-sky-900 text-sm">- {formatCurr(stats.hydraulicOilCost)}</span>
                      </div>
                      <p className="text-[10px] text-sky-800">
                        * محدد بالنظام: زيت الهيدروليك دائماً مقيّد خصماً على حساب الشركة المؤجرة للمعدة.
                      </p>
                    </div>

                    <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-emerald-950 text-xs">زيت المكينة (حسب التقييد):</span>
                        <span className="font-black text-emerald-900 text-sm">- {formatCurr(stats.engineOilCost)}</span>
                      </div>
                      <p className="text-[10px] text-emerald-800">
                        * {includeEngineOilInDeductions ? 'مدرج ضمن الخصومات بقرار الكشف.' : 'غير مدرج (تم احتسابه على المشروع).'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5. Payments & Contract Transfers Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span>4. الدفعات والتحويلات المالية المسددة للشركة من قيمة العقد</span>
                    </h4>
                    
                    <button
                      onClick={() => {
                        setPaymentForCompany(selectedCompanyForStatement);
                        setPaymentAmount(10000);
                        setShowAddPaymentModal(true);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة تحويل مالي</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 font-bold text-[11px]">
                          <th className="p-2.5">التاريخ</th>
                          <th className="p-2.5">طريقة السداد</th>
                          <th className="p-2.5">رقم الحوالة/السند</th>
                          <th className="p-2.5 text-left">المبلغ المسدد ({currencySymbol})</th>
                          <th className="p-2.5">الملاحظات</th>
                          <th className="p-2.5 text-center">إجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold">
                        {stats.compPayments.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="p-2.5 text-slate-600">{p.date}</td>
                            <td className="p-2.5 text-slate-900">{p.paymentMethod}</td>
                            <td className="p-2.5 text-slate-700">{p.referenceNumber || '-'}</td>
                            <td className="p-2.5 text-left text-emerald-700 font-black">{p.amount.toLocaleString()}</td>
                            <td className="p-2.5 text-slate-500">{p.notes || '-'}</td>
                            <td className="p-2.5 text-center">
                              {onDeleteCompanyPayment && (
                                <button
                                  onClick={() => onDeleteCompanyPayment(p.id)}
                                  className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded cursor-pointer"
                                  title="حذف الدفعة"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 6. Statement Final Reconciliation Box */}
                <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="font-black text-amber-400 text-sm border-b border-slate-800 pb-2 flex items-center justify-between">
                    <span>التصفية الحسابية النهائية للشركة المؤجرة</span>
                    <span>العملة: {currencySymbol}</span>
                  </h4>

                  <div className="space-y-2 text-xs font-bold text-slate-300">
                    <div className="flex justify-between items-center">
                      <span>(+) إجمالي مستحقات أجور تشغيل المعدات:</span>
                      <span className="text-white text-sm font-extrabold">+ {formatCurr(stats.grossAmount)}</span>
                    </div>

                    <div className="flex justify-between items-center text-amber-400">
                      <span>(-) إجمالي سُلف السائقين الميدانية:</span>
                      <span>- {formatCurr(stats.driverAdvances)}</span>
                    </div>

                    <div className="flex justify-between items-center text-amber-400">
                      <span>(-) إجمالي الديزل المقيّد على الشركة:</span>
                      <span>- {formatCurr(stats.reportDieselCost)}</span>
                    </div>

                    <div className="flex justify-between items-center text-amber-400">
                      <span>(-) إجمالي زيت الهيدروليك (خصم تلقائي):</span>
                      <span>- {formatCurr(stats.hydraulicOilCost)}</span>
                    </div>

                    <div className="flex justify-between items-center text-amber-400">
                      <span>(-) إجمالي زيت المكينة المقيّد على الشركة:</span>
                      <span>- {formatCurr(stats.engineOilCost)}</span>
                    </div>

                    <div className="flex justify-between items-center text-emerald-400">
                      <span>(-) إجمالي الدفعات والتحويلات المالية المسددة:</span>
                      <span>- {formatCurr(stats.totalPaymentsPaid)}</span>
                    </div>

                    <div className="border-t border-slate-700 pt-3 flex justify-between items-center text-base font-black text-emerald-400 bg-slate-950 p-3 rounded-xl border border-emerald-500/30">
                      <span>(=) الصافي النهائي المتبقي للشركة المؤجرة:</span>
                      <span className="text-lg">{formatCurr(stats.netRemaining)}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        );
      })()}

      {/* MODAL 2: Add Company Modal */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                <span>إضافة شركة مؤجرة جديدة</span>
              </h3>
              <button
                onClick={() => setShowAddCompanyModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCompanySubmit} className="space-y-3 text-xs font-bold">
              <div>
                <label className="text-slate-600 block mb-1">اسم الشركة / المؤسسة المؤجرة *:</label>
                <input
                  type="text"
                  required
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="مثال: شركة أعمار الخليج للمقاولات"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">اسم مسؤول الاتصال / المندوب:</label>
                <input
                  type="text"
                  value={newCompanyContact}
                  onChange={(e) => setNewCompanyContact(e.target.value)}
                  placeholder="مثال: سعود القحطاني"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">رقم الهاتف / الجوال:</label>
                <input
                  type="text"
                  value={newCompanyPhone}
                  onChange={(e) => setNewCompanyPhone(e.target.value)}
                  placeholder="0500000000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">العنوان / الملاحظات:</label>
                <input
                  type="text"
                  value={newCompanyAddress}
                  onChange={(e) => setNewCompanyAddress(e.target.value)}
                  placeholder="الرياض - طريق الملك فهد"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl cursor-pointer"
                >
                  حفظ الشركة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCompanyModal(false)}
                  className="bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL 3: Add Payment Modal */}
      {showAddPaymentModal && paymentForCompany && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>تسجيل دفعة جديدة للشركة المؤجرة</span>
              </h3>
              <button
                onClick={() => setShowAddPaymentModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs font-bold text-amber-900">
              تسجيل تحويل مالي لصالح: <strong>{paymentForCompany.name}</strong>
            </div>

            <form onSubmit={handleAddPaymentSubmit} className="space-y-3 text-xs font-bold">
              <div>
                <label className="text-slate-600 block mb-1">تاريخ التحويل / السداد *:</label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">المبلغ التحويل / الدفعة ({currencySymbol}) *:</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-extrabold text-sm"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">طريقة السداد / الدفع:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                >
                  <option value="حوالة بنكية">حوالة بنكية</option>
                  <option value="نقدي">نقدي (كاش)</option>
                  <option value="سند صرف">سند صرف يدوي</option>
                  <option value="شيك">شيك بنكي</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 block mb-1">رقم الحوالة / السند / الشيك:</label>
                <input
                  type="text"
                  value={paymentRefNumber}
                  onChange={(e) => setPaymentRefNumber(e.target.value)}
                  placeholder="مثال: TR-908123"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">البيان والملاحظات:</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="مثال: دفعة تحت حساب العقد من أجور تشغيل البوكلين"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl cursor-pointer"
                >
                  حفظ وتسجيل الدفعة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className="bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
