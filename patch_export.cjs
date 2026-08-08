const fs = require('fs');
let code = fs.readFileSync('src/utils/exportUtils.ts', 'utf8');

const targetExcel = `    'اسم السائق': r.driverName,
    'ساعات العمل': r.totalNetHours,`;

const replacementExcel = `    'اسم السائق': r.driverName,
    'موقع العمل': r.workLocation || '-',
    'بند العمل': r.workItem || '-',
    'ساعات العمل': r.totalNetHours,`;

const targetPdfRows = `      <td style="padding: 8px 10px; color: #334155;">\${r.companyName || '-'}</td>
      <td style="padding: 8px 10px; color: #334155;">\${r.driverName || '-'}</td>
      <td style="padding: 8px 10px; text-align: center; font-weight: bold; color: #2563eb;">\${formatHoursDigital(r.totalNetHours || 0)}</td>`;

const replacementPdfRows = `      <td style="padding: 8px 10px; color: #334155;">\${r.companyName || '-'}</td>
      <td style="padding: 8px 10px; color: #334155;">\${r.driverName || '-'}</td>
      <td style="padding: 8px 10px; color: #475569;">\${r.workLocation || '-'}</td>
      <td style="padding: 8px 10px; color: #475569;">\${r.workItem || '-'}</td>
      <td style="padding: 8px 10px; text-align: center; font-weight: bold; color: #2563eb;">\${formatHoursDigital(r.totalNetHours || 0)}</td>`;

const targetPdfHeaders = `              <th>الشركة المؤجرة</th>
              <th>السائق</th>
              <th style="text-align: center;">الساعات</th>`;

const replacementPdfHeaders = `              <th>الشركة المؤجرة</th>
              <th>السائق</th>
              <th>موقع العمل</th>
              <th>بند العمل</th>
              <th style="text-align: center;">الساعات</th>`;

const targetPdfColspan = `<td colSpan="10" style="padding: 20px; text-align: center; color: #94a3b8; font-weight: bold;">`;
const replacementPdfColspan = `<td colSpan="12" style="padding: 20px; text-align: center; color: #94a3b8; font-weight: bold;">`;

if(code.includes(targetExcel)) code = code.replace(targetExcel, replacementExcel);
if(code.includes(targetPdfRows)) code = code.replace(targetPdfRows, replacementPdfRows);
if(code.includes(targetPdfHeaders)) code = code.replace(targetPdfHeaders, replacementPdfHeaders);
if(code.includes(targetPdfColspan)) code = code.replace(targetPdfColspan, replacementPdfColspan);

fs.writeFileSync('src/utils/exportUtils.ts', code);
console.log("Success");
