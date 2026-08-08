const fs = require('fs');
let code = fs.readFileSync('src/components/WorkReportForm.tsx', 'utf8');

const targetSelect = `      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <label className="text-xs font-black text-slate-700 block">
          اختيار نوع العقد التشغيلي:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[
            { id: 'daily', label: 'عقد يومي', sub: 'مبلغ مقطوع باليوم' },
            { id: 'hourly', label: 'عقد بالساعة', sub: 'حساب دقيق بالساعات' },
            { id: 'meter', label: 'عقد بالمتر', sub: 'حساب الكميات بالأنظار' },
            { id: 'monthly', label: 'عقد شهري', sub: 'حساب النسبة اليومية' },
            { id: 'salary', label: 'عقد براتب', sub: 'ساعات عمل راتب' }
          ].map((mode) => (
            <button
              type="button"
              key={mode.id}
              onClick={() => setContractType(mode.id as ContractType)}
              className={\`p-3 rounded-xl border text-right transition-all cursor-pointer \${
                contractType === mode.id
                  ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-md'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
              }\`}
            >
              <div className="text-sm">{mode.label}</div>
              <div className={\`text-[10px] mt-0.5 \${contractType === mode.id ? 'text-slate-900 font-bold' : 'text-slate-400'}\`}>
                {mode.sub}
              </div>
            </button>
          ))}
        </div>
      </div>`;

const replaceSelect = `      {/* Contract Type Selection */}
      {(() => {
        const eq = equipmentList.find(e => e.name === selectedEquipmentName);
        const hasDefault = Boolean(eq && eq.defaultContractType);
        
        if (hasDefault) {
          return (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  المعدة مرتبطة بعقد افتراضي
                </label>
                <div className="text-sm text-slate-500">تم اختيار نوع العقد تلقائياً</div>
              </div>
              <div className="bg-amber-100 text-amber-800 font-extrabold px-4 py-2 rounded-xl text-sm border border-amber-200">
                {contractType === 'daily' && 'عقد يومي'}
                {contractType === 'hourly' && 'عقد بالساعة'}
                {contractType === 'meter' && 'عقد بالمتر'}
                {contractType === 'monthly' && 'عقد شهري'}
                {contractType === 'salary' && 'عقد براتب'}
              </div>
            </div>
          );
        }

        return (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <label className="text-xs font-black text-slate-700 block flex justify-between">
              <span>اختيار نوع العقد التشغيلي (اختياري)</span>
              {contractType !== '' && (
                <button type="button" onClick={() => setContractType('')} className="text-slate-400 hover:text-slate-700 underline text-[10px]">
                  إلغاء التحديد
                </button>
              )}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { id: 'daily', label: 'عقد يومي', sub: 'مبلغ مقطوع باليوم' },
                { id: 'hourly', label: 'عقد بالساعة', sub: 'حساب دقيق بالساعات' },
                { id: 'meter', label: 'عقد بالمتر', sub: 'حساب الكميات بالأنظار' },
                { id: 'monthly', label: 'عقد شهري', sub: 'حساب النسبة اليومية' },
                { id: 'salary', label: 'عقد براتب', sub: 'ساعات عمل راتب' }
              ].map((mode) => (
                <button
                  type="button"
                  key={mode.id}
                  onClick={() => setContractType(mode.id as ContractType)}
                  className={\`p-3 rounded-xl border text-right transition-all cursor-pointer \${
                    contractType === mode.id
                      ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-md'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
                  }\`}
                >
                  <div className="text-sm">{mode.label}</div>
                  <div className={\`text-[10px] mt-0.5 \${contractType === mode.id ? 'text-slate-900 font-bold' : 'text-slate-400'}\`}>
                    {mode.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })()}`;

if(code.includes(targetSelect)) {
  code = code.replace(targetSelect, replaceSelect);
  fs.writeFileSync('src/components/WorkReportForm.tsx', code);
  console.log("Success patch work form 2");
} else {
  console.log("targetSelect not found in WorkReportForm.tsx");
}
