const fs = require('fs');
let code = fs.readFileSync('src/components/WorkReportsList.tsx', 'utf8');

const target = `                <div>
                  <span className="font-bold text-slate-500 block">قراءة العدادات:</span>
                  <span className="font-bold text-slate-800">من {selectedReport.meterStart} إلى {selectedReport.meterEnd}</span>
                </div>
              </div>`;

const replacement = `                <div>
                  <span className="font-bold text-slate-500 block">قراءة العدادات:</span>
                  <span className="font-bold text-slate-800">من {selectedReport.meterStart} إلى {selectedReport.meterEnd}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block">موقع العمل:</span>
                  <span className="font-bold text-slate-800">{selectedReport.workLocation || '-'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block">بند العمل:</span>
                  <span className="font-bold text-slate-800">{selectedReport.workItem || '-'}</span>
                </div>
              </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/WorkReportsList.tsx', code);
console.log("Success");
