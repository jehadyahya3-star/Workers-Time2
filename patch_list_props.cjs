const fs = require('fs');
let code = fs.readFileSync('src/components/WorkReportsList.tsx', 'utf8');

const targetProps = `  onEditReport: (report: WorkReport) => void;
  onDeleteReport: (reportId: string) => void;
  onOpenNewReport: () => void;`;

const replaceProps = `  onEditReport: (report: WorkReport) => void;
  onCopyReport: (report: WorkReport) => void;
  onDeleteReport: (reportId: string) => void;
  onOpenNewReport: () => void;`;

const targetFn = `  onEditReport,
  onDeleteReport,
  onOpenNewReport
}) => {`;

const replaceFn = `  onEditReport,
  onCopyReport,
  onDeleteReport,
  onOpenNewReport
}) => {`;

const targetImports = `  ExternalLink,
  Loader2
} from 'lucide-react';`;

const replaceImports = `  ExternalLink,
  Loader2,
  Copy
} from 'lucide-react';`;

code = code.replace(targetProps, replaceProps);
code = code.replace(targetFn, replaceFn);
code = code.replace(targetImports, replaceImports);

fs.writeFileSync('src/components/WorkReportsList.tsx', code);
console.log("Success patch list props");
