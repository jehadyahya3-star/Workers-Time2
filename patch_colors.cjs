const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

const targetCSS = `@layer base {
  .dark {
    --color-white: #0f172a;
    
    --color-slate-50: #1e293b;
    --color-slate-100: #334155;
    --color-slate-200: #475569;
    --color-slate-300: #64748b;
    --color-slate-400: #94a3b8;
    --color-slate-500: #cbd5e1;
    --color-slate-600: #e2e8f0;
    --color-slate-700: #f1f5f9;
    --color-slate-800: #f8fafc;
    --color-slate-900: #ffffff;
    --color-slate-950: #f8fafc;
    
    --color-emerald-50: #022c22;
    --color-emerald-100: #064e3b;
    --color-emerald-700: #34d399;
    --color-emerald-800: #10b981;
    
    --color-amber-50: #451a03;
    --color-amber-100: #78350f;
    --color-amber-200: #92400e;
    --color-amber-800: #fbbf24;

    --color-blue-50: #082f49;
    --color-blue-100: #0c4a6e;
    --color-blue-600: #60a5fa;
    --color-blue-700: #3b82f6;
    
    --color-rose-50: #4c0519;
    --color-rose-100: #881337;
    --color-rose-600: #fb7185;

    color-scheme: dark;
  }
}`;

const replaceCSS = `@layer base {
  .dark {
    --color-white: #0f172a;
    
    --color-slate-50: #1e293b;
    --color-slate-100: #334155;
    --color-slate-200: #475569;
    --color-slate-300: #64748b;
    --color-slate-400: #94a3b8;
    --color-slate-500: #cbd5e1;
    --color-slate-600: #e2e8f0;
    --color-slate-700: #f1f5f9;
    --color-slate-800: #f8fafc;
    --color-slate-900: #ffffff;
    --color-slate-950: #f8fafc;
    
    --color-emerald-50: #022c22;
    --color-emerald-100: #064e3b;
    --color-emerald-200: #065f46;
    --color-emerald-300: #047857;
    --color-emerald-400: #059669;
    --color-emerald-500: #10b981;
    --color-emerald-600: #34d399;
    --color-emerald-700: #6ee7b7;
    --color-emerald-800: #a7f3d0;
    --color-emerald-900: #d1fae5;
    --color-emerald-950: #ecfdf5;
    
    --color-amber-50: #451a03;
    --color-amber-100: #78350f;
    --color-amber-200: #92400e;
    --color-amber-300: #b45309;
    --color-amber-400: #d97706;
    --color-amber-500: #f59e0b;
    --color-amber-600: #fbbf24;
    --color-amber-700: #fcd34d;
    --color-amber-800: #fde68a;
    --color-amber-900: #fef3c7;
    --color-amber-950: #fffbeb;

    --color-blue-50: #082f49;
    --color-blue-100: #0c4a6e;
    --color-blue-200: #075985;
    --color-blue-300: #0369a1;
    --color-blue-400: #0284c7;
    --color-blue-500: #0ea5e9;
    --color-blue-600: #38bdf8;
    --color-blue-700: #7dd3fc;
    --color-blue-800: #bae6fd;
    --color-blue-900: #e0f2fe;
    --color-blue-950: #f0f9ff;
    
    --color-rose-50: #4c0519;
    --color-rose-100: #881337;
    --color-rose-200: #9f1239;
    --color-rose-300: #be123c;
    --color-rose-400: #e11d48;
    --color-rose-500: #f43f5e;
    --color-rose-600: #fb7185;
    --color-rose-700: #fda4af;
    --color-rose-800: #fecdd3;
    --color-rose-900: #ffe4e6;
    --color-rose-950: #fff1f2;

    color-scheme: dark;
  }
}`;

code = code.replace(targetCSS, replaceCSS);
fs.writeFileSync('src/index.css', code);
console.log("Success patch complete colors");
