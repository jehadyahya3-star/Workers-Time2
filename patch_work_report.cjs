const fs = require('fs');
let code = fs.readFileSync('src/components/WorkReportForm.tsx', 'utf8');

const targetState = `  const [notes, setNotes] = useState<string>(existingReport?.notes || '');`;
const replacementState = `  const [workLocation, setWorkLocation] = useState<string>(existingReport?.workLocation || '');
  const [workItem, setWorkItem] = useState<string>(existingReport?.workItem || '');
  const [notes, setNotes] = useState<string>(existingReport?.notes || '');`;

const targetSave = `      notes,`;
const replacementSave = `      workLocation,
      workItem,
      notes,`;

const targetFields = `          <div>
            <label className="text-[11px] text-slate-400 font-bold block mb-1">ملاحظات حقل العمل:</label>`;
const replacementFields = `          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">موقع العمل:</label>
              <input
                type="text"
                value={workLocation}
                onChange={(e) => setWorkLocation(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="مثال: البلوك A, القطاع 2..."
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">بند العمل:</label>
              <input
                type="text"
                value={workItem}
                onChange={(e) => setWorkItem(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="مثال: حفر أساسات، تسوية، نقل ردميات..."
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-bold block mb-1">ملاحظات حقل العمل:</label>`;

code = code.replace(targetState, replacementState);
code = code.replace(targetSave, replacementSave);
code = code.replace(targetFields, replacementFields);

fs.writeFileSync('src/components/WorkReportForm.tsx', code);
console.log("Success");
