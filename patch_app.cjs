const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetEdit = `  // Handler: Edit Report
  const handleEditReport = (report: WorkReport) => {
    setEditingReport(report);
    setActiveTab('new-report');
  };`;

const replaceEdit = `  // Handler: Edit Report
  const handleEditReport = (report: WorkReport) => {
    setEditingReport(report);
    setActiveTab('new-report');
  };

  // Handler: Copy Report
  const handleCopyReport = (report: WorkReport) => {
    const copiedReport: WorkReport = {
      ...report,
      id: '', // Empty ID will force a new ID generation in WorkReportForm
      reportNumber: '', // Will generate a new report number
      date: new Date().toISOString().split('T')[0], // Reset to today's date
      createdAt: '', // Will generate new timestamp
      driverSignature: undefined // Clear signature
    };
    setEditingReport(copiedReport);
    setActiveTab('new-report');
    showToast('📑 تم نسخ البيانات، يمكنك تعديل التاريخ وحفظ التقرير الجديد');
  };`;

code = code.replace(targetEdit, replaceEdit);

const targetListProps = `              onEditReport={handleEditReport}
              onDeleteReport={handleDeleteReport}`;

const replaceListProps = `              onEditReport={handleEditReport}
              onCopyReport={handleCopyReport}
              onDeleteReport={handleDeleteReport}`;

code = code.replace(targetListProps, replaceListProps);

fs.writeFileSync('src/App.tsx', code);
console.log("Success patch App.tsx");
