const fs = require('fs');
const path = require('path');

const coversDir = path.join(__dirname, '..', 'public', 'assets', 'covers');
const slipsDir = path.join(__dirname, '..', 'public', 'assets', 'slips');
const downloadsDir = path.join(__dirname, '..', 'public', 'downloads');
const samplesDir = path.join(__dirname, '..', 'public', 'samples');

[coversDir, slipsDir, downloadsDir, samplesDir].forEach(d => {
    fs.mkdirSync(d, { recursive: true });
});

const books = [
    { id: 'book1', title: 'Modern Database Design', sub: 'SQL & Normalization 3NF', c1: '#1e3a8a', c2: '#3b82f6', cat: 'TECH' },
    { id: 'book2', title: 'Full-Stack JavaScript', sub: 'Node.js & SQLite Guide', c1: '#065f46', c2: '#10b981', cat: 'CODE' },
    { id: 'book3', title: 'Practical AI & ML', sub: 'Machine Learning in Action', c1: '#581c87', c2: '#a855f7', cat: 'AI' },
    { id: 'book4', title: 'Lean Startup Scale', sub: 'Growth Strategy 2026', c1: '#9a3412', c2: '#f97316', cat: 'BIZ' },
    { id: 'book5', title: 'Personal Finance', sub: 'Smart Wealth & Stocks', c1: '#115e59', c2: '#14b8a6', cat: 'INVEST' },
    { id: 'book6', title: 'Mindset for Success', sub: 'Psychology of Growth', c1: '#0e7490', c2: '#06b6d4', cat: 'LIFE' },
    { id: 'book7', title: 'Effective Communication', sub: 'Persuasion in Work', c1: '#9f1239', c2: '#f43f5e', cat: 'SKILL' },
    { id: 'book8', title: 'The Lost Chrono Cipher', sub: 'Sci-Fi Mystery Thriller', c1: '#1e1b4b', c2: '#6366f1', cat: 'FICTION' },
    { id: 'book9', title: 'Shadow of the Knight', sub: 'Epic Fantasy Saga', c1: '#312e81', c2: '#eab308', cat: 'NOVEL' },
    { id: 'book10', title: 'Business English', sub: 'TOEIC & Global Comms', c1: '#1d4ed8', c2: '#38bdf8', cat: 'LANG' },
    { id: 'book11', title: 'Basic Japanese', sub: 'JLPT N5-N4 & Travel', c1: '#991b1b', c2: '#ef4444', cat: 'JAPAN' },
    { id: 'book12', title: 'Cloud Security & DevOps', sub: 'Docker & Kubernetes', c1: '#1e293b', c2: '#0ea5e9', cat: 'CLOUD' },
];

books.forEach(b => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 580" width="400" height="580">
  <defs>
    <linearGradient id="grad_${b.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${b.c1}" />
      <stop offset="100%" stop-color="${b.c2}" />
    </linearGradient>
    <pattern id="grid_${b.id}" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="400" height="580" rx="16" fill="${b.c1}" />
  <rect width="400" height="580" rx="16" fill="url(#grad_${b.id})" />
  <rect width="400" height="580" fill="url(#grid_${b.id})" />
  <rect x="0" y="0" width="28" height="580" fill="rgba(0,0,0,0.25)" />
  <line x1="28" y1="0" x2="28" y2="580" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
  
  <rect x="46" y="44" width="76" height="26" rx="6" fill="rgba(255,255,255,0.22)" />
  <text x="84" y="62" fill="#ffffff" font-family="'Segoe UI', Roboto, sans-serif" font-weight="bold" font-size="12" text-anchor="middle">${b.cat}</text>
  <circle cx="340" cy="58" r="18" fill="rgba(255,255,255,0.18)" />
  <text x="340" y="64" fill="#fbbf24" font-family="'Segoe UI', Roboto, sans-serif" font-weight="bold" font-size="15" text-anchor="middle">★</text>
  
  <g transform="translate(48, 230)">
    <text x="0" y="0" fill="#ffffff" font-family="'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="24">${b.title}</text>
    <text x="0" y="36" fill="rgba(255,255,255,0.85)" font-family="'Segoe UI', Roboto, sans-serif" font-size="15">${b.sub}</text>
    <line x1="0" y1="62" x2="100" y2="62" stroke="rgba(255,255,255,0.5)" stroke-width="3" stroke-linecap="round"/>
  </g>

  <rect x="46" y="480" width="308" height="46" rx="10" fill="rgba(0,0,0,0.35)" />
  <text x="64" y="509" fill="rgba(255,255,255,0.85)" font-family="'Segoe UI', Roboto, sans-serif" font-size="13">DIGITAL E-BOOK EDITION</text>
  <text x="334" y="509" fill="#fbbf24" font-family="'Segoe UI', Roboto, sans-serif" font-weight="bold" font-size="14" text-anchor="end">2026</text>
</svg>`;
    fs.writeFileSync(path.join(coversDir, `${b.id}.svg`), svg);
});

// Default cover
fs.copyFileSync(path.join(coversDir, 'book1.svg'), path.join(coversDir, 'default.svg'));


// Generate mock slips
for (let i = 1; i <= 32; i++) {
    const pad = i < 10 ? `0${i}` : `${i}`;
    const slipSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 480" width="350" height="480">
  <rect width="350" height="480" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
  <rect width="350" height="90" fill="#0284c7" rx="12"/>
  <text x="175" y="45" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="18" text-anchor="middle">ใบเสร็จรับเงินจำลอง / SLIP</text>
  <text x="175" y="70" fill="rgba(255,255,255,0.9)" font-family="sans-serif" font-size="12" text-anchor="middle">MOCK PAYMENT TRANSFER #${pad}</text>
  
  <text x="30" y="130" fill="#64748b" font-family="sans-serif" font-size="12">สถานะ:</text>
  <text x="320" y="130" fill="#16a34a" font-family="sans-serif" font-weight="bold" font-size="13" text-anchor="end">สำเร็จ (SIMULATED)</text>
  
  <line x1="30" y1="150" x2="320" y2="150" stroke="#e2e8f0" stroke-width="1"/>
  
  <text x="30" y="180" fill="#64748b" font-family="sans-serif" font-size="12">รหัสธุรกรรม:</text>
  <text x="320" y="180" fill="#0f172a" font-family="monospace" font-size="12" text-anchor="end">TXN20260927-${pad}88</text>

  <text x="30" y="215" fill="#64748b" font-family="sans-serif" font-size="12">ช่องทาง:</text>
  <text x="320" y="215" fill="#0f172a" font-family="sans-serif" font-size="12" text-anchor="end">PromptPay QR Code</text>

  <rect x="30" y="250" width="290" height="70" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-dasharray="4"/>
  <text x="175" y="280" fill="#64748b" font-family="sans-serif" font-size="12" text-anchor="middle">ยอดเงินที่ชำระจำลอง</text>
  <text x="175" y="306" fill="#0369a1" font-family="sans-serif" font-weight="bold" font-size="20" text-anchor="middle">ชำระแล้วเรียบร้อย</text>

  <text x="175" y="440" fill="#94a3b8" font-family="sans-serif" font-size="11" text-anchor="middle">หลักฐานจำลองเพื่อการศึกษา วิชา Database</text>
</svg>`;
    fs.writeFileSync(path.join(slipsDir, `slip_mock_${pad}.png`), slipSvg); // using svg content
}

// Generate sample downloadable content for testing download gateway
const sampleFiles = [
    'full_db_guide.pdf',
    'full_js_stack.pdf',
    'full_ai_practical.pdf',
    'full_startup_scale.pdf',
    'full_personal_finance.pdf',
    'full_mindset_success.pdf',
    'full_effective_comm.pdf',
    'full_lost_chrono.pdf',
    'full_shadow_knight.pdf',
    'full_business_eng.pdf',
    'full_basic_japanese.pdf',
    'full_cloud_devops.pdf'
];

sampleFiles.forEach(f => {
    const content = `%PDF-1.4\n% E-Book Mock File for Database Mini Project\n1 0 obj\n<< /Title (${f}) /Subject (E-Book File Download) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`;
    fs.writeFileSync(path.join(downloadsDir, f), content);
    fs.writeFileSync(path.join(samplesDir, f.replace('full_', 'sample_')), content);
});

console.log('✅ All assets, covers, mock slips, and download files generated successfully!');
