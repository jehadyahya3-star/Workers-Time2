const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="50%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>

    <!-- Metallic Gold/Amber Gradient -->
    <linearGradient id="gold" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="30%" stop-color="#F59E0B"/>
      <stop offset="70%" stop-color="#D97706"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>

    <!-- Bright Gold Highlight -->
    <linearGradient id="goldBright" x1="0" y1="0" x2="0" y2="100%">
      <stop offset="0%" stop-color="#FEF08A"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>

    <!-- Steel Bucket Metallic Gradient -->
    <linearGradient id="steel" x1="0" y1="0" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#94A3B8"/>
      <stop offset="50%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>

    <!-- Glass Blue Gradient -->
    <linearGradient id="glass" x1="0" y1="0" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7DD3FC"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>

    <!-- Heavy Tire Rubber Gradient -->
    <radialGradient id="tire" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="70%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#090D16"/>
    </radialGradient>

    <!-- Outer Glow Filter -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#F59E0B" flood-opacity="0.45"/>
    </filter>
  </defs>

  <!-- Outer Gold Hexagonal Pattern / Border Rim -->
  <rect x="16" y="16" width="480" height="480" rx="100" fill="none" stroke="url(#gold)" stroke-width="8" stroke-opacity="0.75"/>
  <rect x="28" y="28" width="456" height="456" rx="88" fill="none" stroke="#F59E0B" stroke-width="2" stroke-opacity="0.3"/>

  <!-- Construction Track / Ground Line Accent -->
  <path d="M 48 416 L 464 416" stroke="url(#gold)" stroke-width="12" stroke-linecap="round" stroke-dasharray="28 16" opacity="0.6"/>

  <!-- Heavy Loader Emblem -->
  <g filter="url(#glow)">
    <!-- Cabin Glass Body -->
    <polygon points="205,150 280,150 315,220 205,220" fill="url(#glass)" opacity="0.9"/>
    <polygon points="220,158 268,158 298,212 220,212" fill="#E0F2FE" opacity="0.35"/>

    <!-- Cab Steel Frame Roof & Pillars -->
    <polygon points="195,145 288,145 325,225 195,225" fill="none" stroke="url(#goldBright)" stroke-width="14" stroke-linejoin="round"/>
    <line x1="185" y1="140" x2="295" y2="140" stroke="url(#goldBright)" stroke-width="16" stroke-linecap="round"/>

    <!-- Rear Engine Frame -->
    <path d="M 95 225 L 205 225 L 205 300 L 105 300 C 95 285 90 255 95 225 Z" fill="url(#gold)"/>
    <!-- Grill Slots -->
    <line x1="110" y1="242" x2="155" y2="242" stroke="#451A03" stroke-width="5" stroke-linecap="round"/>
    <line x1="110" y1="258" x2="155" y2="258" stroke="#451A03" stroke-width="5" stroke-linecap="round"/>
    <line x1="110" y1="274" x2="155" y2="274" stroke="#451A03" stroke-width="5" stroke-linecap="round"/>

    <!-- Exhaust Pipe Stack -->
    <rect x="175" y="95" width="16" height="50" rx="5" fill="#475569"/>
    <polygon points="170,95 196,95 183,82" fill="#94A3B8"/>

    <!-- Chassis Base -->
    <polygon points="205,235 345,235 365,300 205,300" fill="#D97706"/>

    <!-- Heavy Boom Arms -->
    <path d="M 265 245 L 400 205 L 425 315 L 395 320 L 370 255 L 270 275 Z" fill="url(#goldBright)"/>
    <circle cx="270" cy="270" r="9" fill="#451A03"/>
    <circle cx="395" cy="215" r="9" fill="#451A03"/>

    <!-- Hydraulic Cylinder -->
    <line x1="285" y1="210" x2="370" y2="230" stroke="#F8FAFC" stroke-width="14" stroke-linecap="round"/>
    <line x1="285" y1="210" x2="328" y2="220" stroke="#334155" stroke-width="18" stroke-linecap="round"/>

    <!-- Large Loader Bucket (الشيول العملاق) -->
    <path d="M 395 280 Q 465 245 480 290 L 465 375 Q 395 395 380 345 Z" fill="url(#steel)" stroke="url(#goldBright)" stroke-width="9"/>
    <!-- Bucket Steel Teeth -->
    <polygon points="470,270 495,265 486,285" fill="#FBBF24"/>
    <polygon points="478,300 504,300 492,318" fill="#FBBF24"/>
    <polygon points="480,330 504,335 490,350" fill="#FBBF24"/>
    <polygon points="473,360 493,372 479,382" fill="#FBBF24"/>

    <!-- Heavy Duty Wheels & Treads -->
    <!-- Rear Wheel -->
    <g>
      <circle cx="155" cy="345" r="56" fill="url(#tire)" stroke="#090D16" stroke-width="14"/>
      <circle cx="155" cy="345" r="34" fill="url(#gold)"/>
      <circle cx="155" cy="345" r="14" fill="#0F172A"/>
      <!-- Wheel Treads -->
      <line x1="155" y1="280" x2="155" y2="292" stroke="#FDE047" stroke-width="7" stroke-linecap="round"/>
      <line x1="155" y1="398" x2="155" y2="410" stroke="#FDE047" stroke-width="7" stroke-linecap="round"/>
      <line x1="90" y1="345" x2="102" y2="345" stroke="#FDE047" stroke-width="7" stroke-linecap="round"/>
      <line x1="208" y1="345" x2="220" y2="345" stroke="#FDE047" stroke-width="7" stroke-linecap="round"/>
    </g>

    <!-- Front Wheel -->
    <g>
      <circle cx="335" cy="345" r="56" fill="url(#tire)" stroke="#090D16" stroke-width="14"/>
      <circle cx="335" cy="345" r="34" fill="url(#gold)"/>
      <circle cx="335" cy="345" r="14" fill="#0F172A"/>
      <!-- Wheel Treads -->
      <line x1="335" y1="280" x2="335" y2="292" stroke="#FDE047" stroke-width="7" stroke-linecap="round"/>
      <line x1="335" y1="398" x2="335" y2="410" stroke="#FDE047" stroke-width="7" stroke-linecap="round"/>
      <line x1="270" y1="345" x2="282" y2="345" stroke="#FDE047" stroke-width="7" stroke-linecap="round"/>
      <line x1="388" y1="345" x2="400" y2="345" stroke="#FDE047" stroke-width="7" stroke-linecap="round"/>
    </g>

    <!-- "966" Metallic Model Badge -->
    <rect x="222" y="248" width="58" height="24" rx="7" fill="#0F172A" stroke="url(#goldBright)" stroke-width="3"/>
    <text x="251" y="265" font-family="'Cairo', 'Segoe UI', Arial, sans-serif" font-weight="900" font-size="14" fill="#FBBF24" text-anchor="middle" letter-spacing="1.5">966</text>
  </g>
</svg>`;

async function generate() {
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write SVG file
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgIcon);
  fs.writeFileSync(path.join(publicDir, 'pwa-192x192.svg'), svgIcon);
  fs.writeFileSync(path.join(publicDir, 'pwa-512x512.svg'), svgIcon);

  // Convert to high-res PNG buffers via Sharp
  const svgBuffer = Buffer.from(svgIcon);

  const png192 = await sharp(svgBuffer).resize(192, 192).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

  const png512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);

  const appleTouch = await sharp(svgBuffer).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);

  const faviconIco = await sharp(svgBuffer).resize(64, 64).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), faviconIco);

  console.log('✅ All icons (SVG & high-res PNGs & ICO) successfully generated with Sharp!');
}

generate().catch(console.error);
