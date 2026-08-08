const fs = require('fs');
let code = fs.readFileSync('src/components/CompaniesAndAccounts.tsx', 'utf8');

const thTarget = `                          <th className="p-2.5">اسم السائق</th>
                          <th className="p-2.5">نوع العقد</th>
                          <th className="p-2.5 text-center">ساعات العمل</th>`;
const thReplace = `                          <th className="p-2.5">اسم السائق</th>
                          <th className="p-2.5">موقع العمل</th>
                          <th className="p-2.5">بند العمل</th>
                          <th className="p-2.5">نوع العقد</th>
                          <th className="p-2.5 text-center">ساعات العمل</th>`;

const tdTarget = `                            <td className="p-2.5 text-slate-700">{r.driverName}</td>
                            <td className="p-2.5 text-slate-500">{r.contractType}</td>
                            <td className="p-2.5 text-center text-amber-700 font-extrabold">{formatHoursDigital(r.totalNetHours)}</td>`;
const tdReplace = `                            <td className="p-2.5 text-slate-700">{r.driverName}</td>
                            <td className="p-2.5 text-slate-500">{r.workLocation || '-'}</td>
                            <td className="p-2.5 text-slate-500">{r.workItem || '-'}</td>
                            <td className="p-2.5 text-slate-500">{r.contractType}</td>
                            <td className="p-2.5 text-center text-amber-700 font-extrabold">{formatHoursDigital(r.totalNetHours)}</td>`;

const tdFooterTarget = `                          <td colSpan={5} className="p-2.5">إجمالي أجور وساعات تشغيل المعدات</td>`;
const tdFooterReplace = `                          <td colSpan={7} className="p-2.5">إجمالي أجور وساعات تشغيل المعدات</td>`;

if (code.includes(thTarget)) code = code.replace(thTarget, thReplace);
if (code.includes(tdTarget)) code = code.replace(tdTarget, tdReplace);
if (code.includes(tdFooterTarget)) code = code.replace(tdFooterTarget, tdFooterReplace);

fs.writeFileSync('src/components/CompaniesAndAccounts.tsx', code);
console.log("Success patch table ui");
