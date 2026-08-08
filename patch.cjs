const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const target = `        </div>

        {/* Equipment Diesel Consumption Summary & Top Consumer Highlight */}`;

const replacement = `        </div>

        {/* Chart 3: Daily Diesel Trend (Current Week vs Last Week) */}
        <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/90 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>تطور استهلاك الديزل اليومي</span>
              </h4>
              <p className="text-[11px] text-slate-500">مقارنة الاستهلاك اليومي (لتر) خلال الأسبوع الحالي مقابل الأسبوع الماضي</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyDieselTrendData} margin={{ top: 15, right: 10, left: 10, bottom: 15 }}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="dayLabel" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={10} label={{ value: 'لتر', angle: -90, position: 'insideRight', offset: 0, fill: '#64748b', fontSize: 10 }} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 font-sans border border-slate-700">
                          <p className="font-bold text-emerald-400">{data.dayLabel} ({data.dateStr})</p>
                          <p className="flex justify-between gap-4">
                            <span className="text-slate-300">الأسبوع الحالي:</span>
                            <strong className="text-emerald-300">{data.currentWeek.toLocaleString('ar-SA')} لتر</strong>
                          </p>
                          <p className="flex justify-between gap-4">
                            <span className="text-slate-400">الأسبوع الماضي:</span>
                            <strong className="text-slate-300">{data.lastWeek.toLocaleString('ar-SA')} لتر</strong>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  formatter={(value) => <span className="text-xs font-bold text-slate-700">{value === 'currentWeek' ? 'الأسبوع الحالي' : 'الأسبوع الماضي'}</span>}
                />
                <Area type="monotone" dataKey="lastWeek" name="lastWeek" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorLast)" />
                <Area type="monotone" dataKey="currentWeek" name="currentWeek" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCurrent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Equipment Diesel Consumption Summary & Top Consumer Highlight */}`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/Dashboard.tsx', code);
  console.log("Success");
} else {
  console.log("Not found target string");
}
