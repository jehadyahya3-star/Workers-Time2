const fs = require('fs');
let code = fs.readFileSync('src/components/WorkReportsList.tsx', 'utf8');

const thTarget = `                <th className="p-3.5">الشركة المؤجرة</th>
                <th className="p-3.5">السائق</th>
                <th className="p-3.5 text-center">نوع العقد</th>`;
const thReplace = `                <th className="p-3.5">الشركة المؤجرة</th>
                <th className="p-3.5">السائق</th>
                <th className="p-3.5">موقع العمل</th>
                <th className="p-3.5">بند العمل</th>
                <th className="p-3.5 text-center">نوع العقد</th>`;

const tdTarget = `                    <td className="p-3.5 font-medium">{report.companyName}</td>
                    <td className="p-3.5 font-medium">{report.driverName}</td>
                    <td className="p-3.5 text-center">`;
const tdReplace = `                    <td className="p-3.5 font-medium">{report.companyName}</td>
                    <td className="p-3.5 font-medium">{report.driverName}</td>
                    <td className="p-3.5 font-medium">{report.workLocation || '-'}</td>
                    <td className="p-3.5 font-medium">{report.workItem || '-'}</td>
                    <td className="p-3.5 text-center">`;

const colSpanTarget = `                  <td colSpan={10} className="p-8 text-center text-slate-400 font-bold">`;
const colSpanReplace = `                  <td colSpan={12} className="p-8 text-center text-slate-400 font-bold">`;

if (code.includes(thTarget)) code = code.replace(thTarget, thReplace);
if (code.includes(tdTarget)) code = code.replace(tdTarget, tdReplace);
if (code.includes(colSpanTarget)) code = code.replace(colSpanTarget, colSpanReplace);

fs.writeFileSync('src/components/WorkReportsList.tsx', code);
console.log("Success patch work list 2");
