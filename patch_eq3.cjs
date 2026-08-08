const fs = require('fs');
let code = fs.readFileSync('src/components/EquipmentManager.tsx', 'utf8');

const targetSelect = `                <div>
                  <label className="font-bold text-slate-700 block mb-1">حالة المعدة الحالية:</label>
                  <select`;
const replaceSelect = `                <div>
                  <label className="font-bold text-slate-700 block mb-1">نوع العقد الافتراضي (اختياري):</label>
                  <select
                    value={defaultContractType}
                    onChange={(e) => setDefaultContractType(e.target.value as ContractType | '')}
                    className="w-full bg-slate-50 border rounded-xl p-2 font-bold mb-2"
                  >
                    <option value="">بدون نوع عقد افتراضي</option>
                    <option value="hourly">بالساعة (Hourly)</option>
                    <option value="daily">يومية (Daily)</option>
                    <option value="salary">راتب (Salary)</option>
                    <option value="monthly">شهري (Monthly)</option>
                    <option value="meter">بالمتر (Meter/Counter)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">حالة المعدة الحالية:</label>
                  <select`;

code = code.replace(targetSelect, replaceSelect);
fs.writeFileSync('src/components/EquipmentManager.tsx', code);
console.log("Success patch eq part 3");
