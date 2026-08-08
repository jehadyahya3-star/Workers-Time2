const fs = require('fs');
let code = fs.readFileSync('src/components/CompaniesAndAccounts.tsx', 'utf8');

const targetFunction = `  const handlePrintStatement = () => {`;
const newFunction = `  // Printable HTML Export function for Monthly Invoice
  const handlePrintInvoice = () => {
    if (!selectedCompanyForStatement) return;
    const stats = calculateCompanyStats(selectedCompanyForStatement);
    const companyEqList = equipmentList.filter(e => e.companyName === selectedCompanyForStatement.name);
    
    // Generate Invoice Number based on date
    const invoiceNo = \`INV-\${new Date().getFullYear()}\${(new Date().getMonth()+1).toString().padStart(2, '0')}-\${Math.floor(Math.random() * 9000 + 1000)}\`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formatCurr = (num: number) => Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    printWindow.document.write(\`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة تشغيل معدات - \${selectedCompanyForStatement.name}</title>
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
            <div class="project-name">\${projectInfo?.name || 'مشروع إدارة المقاولات والمعدات'}</div>
          </div>
          <div class="invoice-details">
            <div><strong>رقم الفاتورة:</strong> \${invoiceNo}</div>
            <div><strong>تاريخ الإصدار:</strong> \${new Date().toLocaleDateString('ar-SA')}</div>
            <div><strong>الفترة من:</strong> \${statementStartDate ? new Date(statementStartDate).toLocaleDateString('ar-SA') : 'بداية العمل'}</div>
            <div><strong>الفترة إلى:</strong> \${statementEndDate ? new Date(statementEndDate).toLocaleDateString('ar-SA') : 'حتى تاريخه'}</div>
          </div>
        </div>

        <div class="parties">
          <div class="party-box">
            <h3>مُصدر الفاتورة (المشروع)</h3>
            <p>\${projectInfo?.name || 'مشروع المقاولات'}</p>
            <div class="contact">إدارة المشروع / المشتريات</div>
          </div>
          <div class="party-box">
            <h3>مُوجّهة إلى (الشركة المؤجرة)</h3>
            <p>\${selectedCompanyForStatement.name}</p>
            <div class="contact">
              عناية السيد: \${selectedCompanyForStatement.contactPerson}<br/>
              هاتف: \${selectedCompanyForStatement.phone}<br/>
              العنوان: \${selectedCompanyForStatement.address || '-'}
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>المعدة (الرقم)</th>
              <th>إجمالي الساعات/الأيام</th>
              <th>الإجمالي (\${currencySymbol})</th>
            </tr>
          </thead>
          <tbody>
            \${companyEqList.map((eq, index) => {
              const eqReports = stats.compReports.filter(r => r.equipmentRegNumber === eq.regNumber);
              if(eqReports.length === 0) return '';
              const eqTotalHours = eqReports.reduce((sum, r) => sum + r.totalNetHours, 0);
              const eqTotalGross = eqReports.reduce((sum, r) => sum + (r.grossAmount || 0), 0);
              const isHourly = eqReports.some(r => r.contractType === 'hourly' || r.contractType === 'monthly');
              const eqTotalValue = isHourly ? formatHoursDigital(eqTotalHours) : eqReports.length + ' يوم';
              return \`
                <tr>
                  <td>\${index + 1}</td>
                  <td>\${eq.name} (\${eq.regNumber})</td>
                  <td>\${eqTotalValue}</td>
                  <td class="left-align">\${eqTotalGross.toLocaleString()}</td>
                </tr>
              \`;
            }).join('')}
          </tbody>
        </table>

        <table class="totals-table">
          <tbody>
            <tr>
              <td>إجمالي قيمة الأعمال:</td>
              <td>\${formatCurr(stats.grossAmount)}</td>
            </tr>
            <tr class="deduction">
              <td>يخصم: السلف النقدية للسائقين:</td>
              <td>- \${formatCurr(stats.driverAdvances)}</td>
            </tr>
            <tr class="deduction">
              <td>يخصم: مسحوبات الديزل:</td>
              <td>- \${formatCurr(stats.reportDieselCost)}</td>
            </tr>
            <tr class="deduction">
              <td>يخصم: زيوت وصيانات:</td>
              <td>- \${formatCurr((stats.hydraulicOilCost || 0) + (stats.engineOilCost || 0) + (stats.maintenanceCost || 0))}</td>
            </tr>
            <tr class="deduction">
              <td>يخصم: دفعات نقدية محولة:</td>
              <td>- \${formatCurr(stats.totalPaymentsPaid)}</td>
            </tr>
            <tr class="grand-total">
              <td>الصافي المستحق للدفع:</td>
              <td>\${formatCurr(stats.netRemaining)}</td>
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
    \`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handlePrintStatement = () => {`;

code = code.replace(targetFunction, newFunction);

const targetButtons = `                  <button
                    onClick={handlePrintStatement}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة / تصدير الكشف</span>
                  </button>`;

const newButtons = `                  <button
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
                  </button>`;

code = code.replace(targetButtons, newButtons);

fs.writeFileSync('src/components/CompaniesAndAccounts.tsx', code);
console.log("Success patch invoice export");
