const fs = require('fs');
let code = fs.readFileSync('src/components/WorkReportForm.tsx', 'utf8');

const targetCostsState = `  const [costs, setCosts] = useState<OperationalCosts>(
    existingReport?.costs || {
      dieselLiters: 150,
      dieselCostPerLiter: 2.3,
      dieselTotalCost: 345,
      dieselOnLessor: false,
      oilCost: 0,
      hydraulicOilCost: 0,
      engineOilCost: 0,
      engineOilOnLessor: false,
      greaseCost: 20,
      sparePartsCost: 0,
      maintenanceCost: 0
    }
  );`;
const replaceCostsState = `  const [costs, setCosts] = useState<OperationalCosts>(
    existingReport?.costs || {
      dieselLiters: 0,
      dieselCostPerLiter: 2.3,
      dieselTotalCost: 0,
      dieselOnLessor: false,
      oilCost: 0,
      hydraulicOilCost: 0,
      engineOilCost: 0,
      engineOilOnLessor: false,
      greaseCost: 0,
      sparePartsCost: 0,
      maintenanceCost: 0
    }
  );
  
  const [hasCosts, setHasCosts] = useState<boolean>(
    existingReport ? (
      (existingReport.costs.dieselLiters > 0) || 
      (existingReport.costs.hydraulicOilCost! > 0) || 
      (existingReport.costs.engineOilCost! > 0) || 
      (existingReport.costs.greaseCost > 0) || 
      (existingReport.costs.sparePartsCost > 0) || 
      (existingReport.costs.maintenanceCost > 0)
    ) : false
  );`;

const targetCostsRender = `      {/* Operational Costs Entry */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
          <Fuel className="w-4 h-4 text-amber-500" />
          <span>التكاليف التشغيلية ومصروفات اليوم</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">`;
const replaceCostsRender = `      {/* Operational Costs Entry */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Fuel className="w-4 h-4 text-amber-500" />
            <span>التكاليف التشغيلية ومصروفات اليوم (اختياري)</span>
          </h3>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
            <input 
              type="checkbox"
              checked={hasCosts}
              onChange={(e) => setHasCosts(e.target.checked)}
              className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
            />
            إدخال تكاليف
          </label>
        </div>
        
        {hasCosts && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">`;

const targetCostsEndRender = `            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <label className="text-xs font-black text-slate-950 block">صيانة وأخرى (ر.س):</label>
              <input
                type="number"
                value={costs.maintenanceCost}
                onChange={(e) => setCosts({ ...costs, maintenanceCost: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
              />
            </div>
          </div>
        </div>
      </div>`;

const replaceCostsEndRender = `            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <label className="text-xs font-black text-slate-950 block">صيانة وأخرى (ر.س):</label>
              <input
                type="number"
                value={costs.maintenanceCost}
                onChange={(e) => setCosts({ ...costs, maintenanceCost: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
              />
            </div>
          </div>
        </div>
        )}
      </div>`;

code = code.replace(targetCostsState, replaceCostsState);
code = code.replace(targetCostsRender, replaceCostsRender);
code = code.replace(targetCostsEndRender, replaceCostsEndRender);
fs.writeFileSync('src/components/WorkReportForm.tsx', code);
console.log("Success patch costs form");
