const fs = require('fs');
let code = fs.readFileSync('src/components/WorkReportsList.tsx', 'utf8');

const targetBtns = `                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedReport(report)}
                          title="معاينة وطباعة التقرير"
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditReport(report)}
                          title="تعديل البيانات"`;

const replaceBtns = `                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedReport(report)}
                          title="معاينة وطباعة التقرير"
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onCopyReport(report)}
                          title="نسخ التقرير (عمل مكرر)"
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditReport(report)}
                          title="تعديل البيانات"`;

if (code.includes(targetBtns)) {
  code = code.replace(targetBtns, replaceBtns);
  fs.writeFileSync('src/components/WorkReportsList.tsx', code);
  console.log("Success patch buttons");
} else {
  console.log("Not found in WorkReportsList.tsx");
}
