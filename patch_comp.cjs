const fs = require('fs');
let code = fs.readFileSync('src/components/CompaniesAndAccounts.tsx', 'utf8');

const thTarget = `              <tr>
                <th>رقم التقرير</th>
                <th>التاريخ</th>
                <th>اسم المعدة ورقمها</th>
                <th>اسم السائق</th>
                <th>ساعات العمل</th>`;
const thReplace = `              <tr>
                <th>رقم التقرير</th>
                <th>التاريخ</th>
                <th>اسم المعدة ورقمها</th>
                <th>اسم السائق</th>
                <th>موقع العمل</th>
                <th>بند العمل</th>
                <th>ساعات العمل</th>`;

const tdTarget = `                <tr>
                  <td>\${r.reportNumber}</td>
                  <td>\${r.date}</td>
                  <td>\${r.equipmentName} (\${r.equipmentRegNumber})</td>
                  <td>\${r.driverName}</td>
                  <td>\${formatHoursDigital(r.totalNetHours)}</td>`;
const tdReplace = `                <tr>
                  <td>\${r.reportNumber}</td>
                  <td>\${r.date}</td>
                  <td>\${r.equipmentName} (\${r.equipmentRegNumber})</td>
                  <td>\${r.driverName}</td>
                  <td>\${r.workLocation || '-'}</td>
                  <td>\${r.workItem || '-'}</td>
                  <td>\${formatHoursDigital(r.totalNetHours)}</td>`;

const tdFooterTarget = `              <tr class="total-row">
                <td colspan="4">المجموع الكلي لأجور وساعات التشغيل</td>
                <td>\${formatHoursDigital(stats.totalHours)}</td>`;
const tdFooterReplace = `              <tr class="total-row">
                <td colspan="6">المجموع الكلي لأجور وساعات التشغيل</td>
                <td>\${formatHoursDigital(stats.totalHours)}</td>`;


code = code.replace(thTarget, thReplace);
code = code.replace(tdTarget, tdReplace);
code = code.replace(tdFooterTarget, tdFooterReplace);

fs.writeFileSync('src/components/CompaniesAndAccounts.tsx', code);
console.log("Success patch print table");
