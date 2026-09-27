const fs = require('fs');
const path = require('path');

const coversDir = path.join(__dirname, '..', 'public', 'assets', 'covers');
const slipsDir = path.join(__dirname, '..', 'public', 'assets', 'slips');
const downloadsDir = path.join(__dirname, '..', 'public', 'downloads');
const samplesDir = path.join(__dirname, '..', 'public', 'samples');

[coversDir, slipsDir, downloadsDir, samplesDir].forEach(d => {
    fs.mkdirSync(d, { recursive: true });
});

function escapeXml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&amp;/g, '&')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// 12 Rich Illustrated Covers
const bookConfigs = [
    {
        id: 'book1',
        title: 'Modern Database Design',
        thaiTitle: 'คู่มือออกแบบฐานข้อมูลขั้นสูง',
        sub: 'SQL, ERD &amp; Normalization 3NF',
        cat: 'DATABASE',
        tag: 'BESTSELLER 2026',
        c1: '#09152e',
        c2: '#1e3a8a',
        accent: '#38bdf8',
        art: `
        <!-- Database Server Stack Art -->
        <g transform="translate(200, 195)">
            <!-- Cyber Glow -->
            <circle cx="0" cy="0" r="75" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.4"/>
            <circle cx="0" cy="0" r="95" fill="none" stroke="#60a5fa" stroke-width="1" stroke-dasharray="3 6" opacity="0.25"/>
            <!-- Tier 1 Top -->
            <path d="M-60,-45 C-60,-58 60,-58 60,-45 C60,-32 -60,-32 -60,-45 Z" fill="#0284c7"/>
            <path d="M-60,-45 L-60,-25 C-60,-12 60,-12 60,-25 L60,-45 C60,-32 -60,-32 -60,-45 Z" fill="#0369a1"/>
            <ellipse cx="0" cy="-45" rx="60" ry="13" fill="#38bdf8" opacity="0.9"/>
            <circle cx="40" cy="-30" r="3.5" fill="#22d3ee"/>
            <circle cx="48" cy="-30" r="3.5" fill="#4ade80"/>
            <!-- Tier 2 Mid -->
            <path d="M-60,-10 C-60,-23 60,-23 60,-10 C60,3 -60,3 -60,-10 Z" fill="#0284c7"/>
            <path d="M-60,-10 L-60,10 C-60,23 60,23 60,10 L60,-10 C60,3 -60,3 -60,-10 Z" fill="#0369a1"/>
            <ellipse cx="0" cy="-10" rx="60" ry="13" fill="#0ea5e9"/>
            <circle cx="40" cy="5" r="3.5" fill="#22d3ee"/>
            <circle cx="48" cy="5" r="3.5" fill="#4ade80"/>
            <!-- Tier 3 Base -->
            <path d="M-60,25 C-60,12 60,12 60,25 C60,38 -60,38 -60,25 Z" fill="#0369a1"/>
            <path d="M-60,25 L-60,45 C-60,58 60,58 60,45 L60,25 C60,38 -60,38 -60,25 Z" fill="#075985"/>
            <ellipse cx="0" cy="25" rx="60" ry="13" fill="#0284c7"/>
            <circle cx="40" cy="40" r="3.5" fill="#22d3ee"/>
            <circle cx="48" cy="40" r="3.5" fill="#facc15"/>
            <!-- Data connection circuits -->
            <path d="M-80,0 L-60,-10 M-80,20 L-60,25 M80,-20 L60,-25 M80,10 L60,10" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
            <circle cx="-80" cy="0" r="3.5" fill="#38bdf8"/>
            <circle cx="-80" cy="20" r="3.5" fill="#38bdf8"/>
            <circle cx="80" cy="-20" r="3.5" fill="#38bdf8"/>
            <circle cx="80" cy="10" r="3.5" fill="#38bdf8"/>
        </g>`
    },
    {
        id: 'book2',
        title: 'Full-Stack JavaScript',
        thaiTitle: 'เว็บแอปด้วย Node.js &amp; SQLite',
        sub: 'Modern REST API &amp; Full-Stack Guide',
        cat: 'CODING',
        tag: 'DEVELOPER GUIDE',
        c1: '#022c22',
        c2: '#065f46',
        accent: '#10b981',
        art: `
        <!-- Laptop & JS Art -->
        <g transform="translate(200, 195)">
            <circle cx="0" cy="0" r="85" fill="none" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.35"/>
            <!-- Hexagon badge -->
            <polygon points="0,-75 55,-43 55,20 0,52 -55,20 -55,-43" fill="#064e3b" stroke="#34d399" stroke-width="2.5"/>
            <text x="0" y="-8" fill="#34d399" font-family="'Courier New', monospace" font-weight="900" font-size="28" text-anchor="middle">{ JS }</text>
            <text x="0" y="24" fill="#a7f3d0" font-family="'Segoe UI', sans-serif" font-weight="bold" font-size="12" text-anchor="middle">NODE &amp; SQL</text>
            <!-- Orbiting Nodes -->
            <circle cx="-65" cy="-35" r="5" fill="#10b981"/>
            <circle cx="65" cy="-35" r="5" fill="#10b981"/>
            <circle cx="0" cy="70" r="6" fill="#34d399"/>
            <line x1="-55" y1="20" x2="-75" y2="40" stroke="#10b981" stroke-width="2"/>
            <line x1="55" y1="20" x2="75" y2="40" stroke="#10b981" stroke-width="2"/>
        </g>`
    },
    {
        id: 'book3',
        title: 'Practical AI &amp; Machine Learning',
        thaiTitle: 'ปัญญาประดิษฐ์ฉบับใช้งานจริง',
        sub: 'Deep Learning, NLP &amp; Neural Nets',
        cat: 'ARTIFICIAL INTEL',
        tag: 'AI MASTERCLASS',
        c1: '#1e1b4b',
        c2: '#581c87',
        accent: '#c084fc',
        art: `
        <!-- Neural Brain / AI Chip Art -->
        <g transform="translate(200, 195)">
            <circle cx="0" cy="0" r="80" fill="none" stroke="#c084fc" stroke-width="1" stroke-dasharray="8 6" opacity="0.4"/>
            <!-- AI Chip Base -->
            <rect x="-45" y="-45" width="90" height="90" rx="14" fill="#3b0764" stroke="#a855f7" stroke-width="3"/>
            <!-- Circuit pins -->
            <line x1="-30" y1="-45" x2="-30" y2="-60" stroke="#c084fc" stroke-width="2.5"/>
            <line x1="0" y1="-45" x2="0" y2="-60" stroke="#c084fc" stroke-width="2.5"/>
            <line x1="30" y1="-45" x2="30" y2="-60" stroke="#c084fc" stroke-width="2.5"/>
            <line x1="-30" y1="45" x2="-30" y2="60" stroke="#c084fc" stroke-width="2.5"/>
            <line x1="0" y1="45" x2="0" y2="60" stroke="#c084fc" stroke-width="2.5"/>
            <line x1="30" y1="45" x2="30" y2="60" stroke="#c084fc" stroke-width="2.5"/>
            <!-- Inner AI Core -->
            <circle cx="0" cy="0" r="24" fill="#a855f7"/>
            <polygon points="0,-16 14,-8 14,8 0,16 -14,8 -14,-8" fill="#f3e8ff"/>
            <circle cx="0" cy="0" r="4" fill="#581c87"/>
            <text x="0" y="32" fill="#e9d5ff" font-family="'Segoe UI', sans-serif" font-weight="900" font-size="10" text-anchor="middle">NEURAL CORE</text>
        </g>`
    },
    {
        id: 'book4',
        title: 'Lean Startup Scale',
        thaiTitle: 'สตาร์ทอัพติดสปีด 2026',
        sub: 'Growth Hacking &amp; Business Models',
        cat: 'BUSINESS',
        tag: 'SCALE UP EDITION',
        c1: '#431407',
        c2: '#9a3412',
        accent: '#fb923c',
        art: `
        <!-- Rocket & Growth Curve Art -->
        <g transform="translate(200, 195)">
            <!-- Orbit rings -->
            <ellipse cx="0" cy="0" rx="80" ry="40" fill="none" stroke="#fb923c" stroke-width="1.5" stroke-dasharray="5 5" opacity="0.5" transform="rotate(-30)"/>
            <!-- Ascending Curve -->
            <path d="M-75,45 Q-20,30 20,-10 T70,-60" fill="none" stroke="#fed7aa" stroke-width="3" stroke-linecap="round"/>
            <!-- Rocket -->
            <g transform="translate(25,-25) rotate(-45)">
                <path d="M0,-35 C12,-15 15,15 15,25 L-15,25 C-15,15 -12,-15 0,-35 Z" fill="#ffffff"/>
                <path d="M0,-35 C6,-20 8,0 8,10 L-8,10 C-8,0 -6,-20 0,-35 Z" fill="#ea580c"/>
                <circle cx="0" cy="0" r="6" fill="#38bdf8"/>
                <!-- Fins -->
                <path d="M-15,15 L-25,28 L-14,26 Z" fill="#ea580c"/>
                <path d="M15,15 L25,28 L14,26 Z" fill="#ea580c"/>
                <!-- Flame -->
                <path d="M-8,25 Q0,45 8,25 Z" fill="#facc15"/>
            </g>
        </g>`
    },
    {
        id: 'book5',
        title: 'Personal Finance &amp; Wealth',
        thaiTitle: 'การเงินและการลงทุนฉบับเข้าใจง่าย',
        sub: 'Smart Wealth, Stocks &amp; Passive Income',
        cat: 'FINANCE',
        tag: 'WEALTH 2026',
        c1: '#042f2e',
        c2: '#0f766e',
        accent: '#2dd4bf',
        art: `
        <!-- Gold Coins & Bull Chart Art -->
        <g transform="translate(200, 195)">
            <circle cx="0" cy="0" r="75" fill="none" stroke="#2dd4bf" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.4"/>
            <!-- Stack of gold coins -->
            <g transform="translate(0, 15)">
                <!-- Coin 1 bottom -->
                <ellipse cx="0" cy="20" rx="42" ry="12" fill="#ca8a04"/>
                <path d="M-42,20 L-42,28 C-42,35 42,35 42,28 L42,20 Z" fill="#a16207"/>
                <!-- Coin 2 mid -->
                <ellipse cx="0" cy="6" rx="42" ry="12" fill="#eab308"/>
                <path d="M-42,6 L-42,14 C-42,21 42,21 42,14 L42,6 Z" fill="#ca8a04"/>
                <!-- Coin 3 top -->
                <ellipse cx="0" cy="-8" rx="42" ry="12" fill="#facc15"/>
                <ellipse cx="0" cy="-8" rx="34" ry="9" fill="none" stroke="#ca8a04" stroke-width="1.5"/>
                <text x="0" y="-3" fill="#a16207" font-family="'Segoe UI', sans-serif" font-weight="900" font-size="16" text-anchor="middle">฿</text>
            </g>
            <!-- Upward Candlestick Chart -->
            <g transform="translate(-40, -45)">
                <line x1="-15" y1="15" x2="-15" y2="40" stroke="#4ade80" stroke-width="1.5"/>
                <rect x="-20" y="20" width="10" height="15" fill="#4ade80" rx="2"/>
                <line x1="15" y1="0" x2="15" y2="35" stroke="#4ade80" stroke-width="1.5"/>
                <rect x="10" y="8" width="10" height="20" fill="#4ade80" rx="2"/>
                <line x1="45" y1="-20" x2="45" y2="20" stroke="#facc15" stroke-width="1.5"/>
                <rect x="40" y="-12" width="10" height="22" fill="#facc15" rx="2"/>
                <path d="M-30,40 L0,20 L30,25 L65,-15" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
            </g>
        </g>`
    },
    {
        id: 'book6',
        title: 'Mindset for Success',
        thaiTitle: 'จัดระเบียบความคิด พิชิตความกังวล',
        sub: 'Growth Mindset, Focus &amp; Psychology',
        cat: 'SELF-DEV',
        tag: 'TRANSFORMATION',
        c1: '#083344',
        c2: '#0e7490',
        accent: '#22d3ee',
        art: `
        <!-- Mountain Peak & Golden Sun Art -->
        <g transform="translate(200, 195)">
            <!-- Radiant Sun Rays -->
            <circle cx="0" cy="-15" r="45" fill="none" stroke="#facc15" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.6"/>
            <circle cx="0" cy="-15" r="28" fill="#facc15"/>
            <!-- Mountains -->
            <polygon points="-75,45 -10,-10 35,45" fill="#0369a1"/>
            <polygon points="-10,-10 5,8 -25,8" fill="#f0f9ff"/>
            <polygon points="-15,45 35,-25 85,45" fill="#0284c7"/>
            <polygon points="35,-25 50,-5 20,-5" fill="#ffffff"/>
            <!-- Rising Birds -->
            <path d="M-45,-40 Q-40,-46 -35,-42 Q-30,-46 -25,-40" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M40,-50 Q45,-56 50,-52 Q55,-56 60,-50" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
        </g>`
    },
    {
        id: 'book7',
        title: 'Effective Communication',
        thaiTitle: 'ศิลปะการสื่อสารและโน้มน้าวใจ',
        sub: 'Influence, Empathy &amp; Presentation',
        cat: 'SKILLS',
        tag: 'CAREER BOOST',
        c1: '#4c0519',
        c2: '#9f1239',
        accent: '#f43f5e',
        art: `
        <!-- Dialogue & Resonance Art -->
        <g transform="translate(200, 195)">
            <circle cx="0" cy="0" r="75" fill="none" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.4"/>
            <!-- Chat Bubble 1 -->
            <rect x="-65" y="-45" width="70" height="48" rx="14" fill="#e11d48"/>
            <polygon points="-30,3 -20,15 -12,3" fill="#e11d48"/>
            <line x1="-50" y1="-28" x2="-15" y2="-28" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
            <line x1="-50" y1="-14" x2="-25" y2="-14" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
            <!-- Chat Bubble 2 -->
            <rect x="-5" y="-15" width="72" height="50" rx="14" fill="#ffffff"/>
            <polygon points="30,35 42,48 48,35" fill="#ffffff"/>
            <line x1="12" y1="2" x2="50" y2="2" stroke="#9f1239" stroke-width="3" stroke-linecap="round"/>
            <line x1="12" y1="16" x2="40" y2="16" stroke="#9f1239" stroke-width="3" stroke-linecap="round"/>
        </g>`
    },
    {
        id: 'book8',
        title: 'The Lost Chrono Cipher',
        thaiTitle: 'รหัสลับนครสูญหาย',
        sub: 'Ancient Cyberspace Sci-Fi Thriller',
        cat: 'SCI-FI',
        tag: 'BEST NOVEL 2026',
        c1: '#0f051d',
        c2: '#2e1065',
        accent: '#a855f7',
        art: `
        <!-- Mystical Time Vortex & Clockwork Art -->
        <g transform="translate(200, 195)">
            <!-- Outer Chrono Ring -->
            <circle cx="0" cy="0" r="68" fill="none" stroke="#c084fc" stroke-width="2"/>
            <circle cx="0" cy="0" r="78" fill="none" stroke="#a855f7" stroke-width="1" stroke-dasharray="4 6"/>
            <!-- Roman Numerals -->
            <text x="0" y="-50" fill="#f3e8ff" font-family="'Times New Roman', serif" font-size="11" text-anchor="middle">XII</text>
            <text x="52" y="4" fill="#f3e8ff" font-family="'Times New Roman', serif" font-size="11" text-anchor="middle">III</text>
            <text x="0" y="58" fill="#f3e8ff" font-family="'Times New Roman', serif" font-size="11" text-anchor="middle">VI</text>
            <text x="-52" y="4" fill="#f3e8ff" font-family="'Times New Roman', serif" font-size="11" text-anchor="middle">IX</text>
            <!-- Clock Hands -->
            <circle cx="0" cy="0" r="7" fill="#fbbf24"/>
            <line x1="0" y1="0" x2="28" y2="-28" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="0" y1="0" x2="-35" y2="0" stroke="#f472b6" stroke-width="2" stroke-linecap="round"/>
            <!-- Gear Teeth Accents -->
            <circle cx="-68" cy="0" r="3" fill="#c084fc"/>
            <circle cx="68" cy="0" r="3" fill="#c084fc"/>
            <circle cx="0" cy="-68" r="3" fill="#c084fc"/>
            <circle cx="0" cy="68" r="3" fill="#c084fc"/>
        </g>`
    },
    {
        id: 'book9',
        title: 'Shadow of the Knight',
        thaiTitle: 'เงาอัศวินแห่งรัตติกาล',
        sub: 'Epic Dark Fantasy Chronicle',
        cat: 'FANTASY',
        tag: 'EPIC SAGA',
        c1: '#1c1917',
        c2: '#451a03',
        accent: '#f59e0b',
        art: `
        <!-- Knight Sword & Moon Crest Art -->
        <g transform="translate(200, 195)">
            <!-- Full Moon Crescent -->
            <circle cx="0" cy="-10" r="60" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="5 5" opacity="0.5"/>
            <path d="M-30,-50 A45,45 0 0,0 20,40 A55,55 0 1,1 -30,-50 Z" fill="#d97706" opacity="0.35"/>
            <!-- Runic Broadsword -->
            <g transform="translate(0, 0)">
                <!-- Blade -->
                <path d="M0,-75 L6,-55 L5,35 L0,50 L-5,35 L-6,-55 Z" fill="#f8fafc"/>
                <line x1="0" y1="-65" x2="0" y2="35" stroke="#0284c7" stroke-width="1.5"/>
                <!-- Crossguard -->
                <rect x="-24" y="32" width="48" height="6" rx="2" fill="#d97706"/>
                <circle cx="-24" cy="35" r="4" fill="#fbbf24"/>
                <circle cx="24" cy="35" r="4" fill="#fbbf24"/>
                <!-- Hilt & Pommel -->
                <rect x="-4" y="38" width="8" height="22" rx="2" fill="#78350f"/>
                <circle cx="0" cy="64" r="6" fill="#fbbf24"/>
            </g>
        </g>`
    },
    {
        id: 'book10',
        title: 'Business English Mastery',
        thaiTitle: 'พิชิตข้อสอบภาษาอังกฤษเพื่อการทำงาน',
        sub: 'TOEIC 850+, Emails &amp; Negotiations',
        cat: 'LANGUAGE',
        tag: 'GLOBAL BUSINESS',
        c1: '#0f172a',
        c2: '#1e3a8a',
        accent: '#60a5fa',
        art: `
        <!-- Wireframe Globe & Flight Arc Art -->
        <g transform="translate(200, 195)">
            <!-- Globe Base -->
            <circle cx="0" cy="0" r="62" fill="none" stroke="#60a5fa" stroke-width="2"/>
            <ellipse cx="0" cy="0" rx="62" ry="24" fill="none" stroke="#60a5fa" stroke-width="1.5" stroke-dasharray="4 4"/>
            <ellipse cx="0" cy="0" rx="28" ry="62" fill="none" stroke="#60a5fa" stroke-width="1.5" stroke-dasharray="4 4"/>
            <line x1="-62" y1="0" x2="62" y2="0" stroke="#93c5fd" stroke-width="1.5"/>
            <line x1="0" y1="-62" x2="0" y2="62" stroke="#93c5fd" stroke-width="1.5"/>
            <!-- Flight Arc -->
            <path d="M-65,30 Q-20,-70 55,-35" fill="none" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 4"/>
            <!-- Small Airplane at arc tip -->
            <g transform="translate(55, -35) rotate(45)">
                <polygon points="0,-10 5,6 0,3 -5,6" fill="#facc15"/>
            </g>
        </g>`
    },
    {
        id: 'book11',
        title: 'Basic Japanese for Travel',
        thaiTitle: 'ภาษาญี่ปุ่นระดับต้นเพื่อการท่องเที่ยว',
        sub: 'JLPT N5-N4, Grammar &amp; Phrases',
        cat: 'JAPANESE',
        tag: 'TRAVEL &amp; JLPT',
        c1: '#450a0a',
        c2: '#991b1b',
        accent: '#f87171',
        art: `
        <!-- Mt. Fuji & Torii Gate Art -->
        <g transform="translate(200, 195)">
            <!-- Rising Red Sun -->
            <circle cx="0" cy="-10" r="42" fill="#ef4444" opacity="0.9"/>
            <!-- Mt Fuji -->
            <polygon points="-75,45 -22,-20 22,-20 75,45" fill="#1e293b"/>
            <polygon points="-22,-20 22,-20 15,-6 5,-3 -2,-8 -12,-4 -18,-10" fill="#ffffff"/>
            <!-- Japanese Torii Gate -->
            <g transform="translate(0, 30)">
                <!-- Top Beam -->
                <path d="M-45,-15 Q0,-22 45,-15 L43,-9 Q0,-16 -43,-9 Z" fill="#b91c1c"/>
                <rect x="-35" y="-9" width="70" height="4" fill="#b91c1c"/>
                <!-- Pillars -->
                <rect x="-24" y="-5" width="6" height="24" fill="#991b1b"/>
                <rect x="18" y="-5" width="6" height="24" fill="#991b1b"/>
            </g>
        </g>`
    },
    {
        id: 'book12',
        title: 'Cloud Security &amp; DevOps',
        thaiTitle: 'ความปลอดภัยคลาวด์และเดฟออปส์',
        sub: 'Docker, Kubernetes &amp; CI/CD Pipeline',
        cat: 'DEVOPS',
        tag: 'CLOUD SECURITY',
        c1: '#020617',
        c2: '#0f172a',
        accent: '#38bdf8',
        art: `
        <!-- Security Shield & Cloud Nodes Art -->
        <g transform="translate(200, 195)">
            <!-- Outer Radial Sensor -->
            <circle cx="0" cy="0" r="80" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.4"/>
            <!-- Defensive Shield -->
            <path d="M0,-55 C35,-55 48,-35 48,0 C48,45 0,65 0,65 C0,65 -48,45 -48,0 C-48,-35 -35,-55 0,-55 Z" fill="#0284c7" stroke="#38bdf8" stroke-width="3"/>
            <path d="M0,-45 C28,-45 38,-28 38,0 C38,36 0,52 0,52 C0,52 -38,36 -38,0 C-38,-28 -28,-45 0,-45 Z" fill="#0369a1"/>
            <!-- Padlock in center -->
            <rect x="-14" y="-4" width="28" height="24" rx="4" fill="#facc15"/>
            <path d="M-9,-4 L-9,-14 C-9,-22 9,-22 9,-14 L9,-4" fill="none" stroke="#facc15" stroke-width="4" stroke-linecap="round"/>
            <circle cx="0" cy="6" r="3" fill="#713f12"/>
            <line x1="0" y1="8" x2="0" y2="13" stroke="#713f12" stroke-width="2"/>
        </g>`
    }
];

// Generate Master SVG for each book
bookConfigs.forEach(b => {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 580" width="400" height="580">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bg_${b.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${b.c1}" />
      <stop offset="65%" stop-color="${b.c2}" />
      <stop offset="100%" stop-color="${b.c1}" />
    </linearGradient>

    <!-- Overlay Mesh -->
    <linearGradient id="highlight_${b.id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18" />
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.45" />
    </linearGradient>

    <!-- Grid Pattern -->
    <pattern id="pat_${b.id}" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.8"/>
    </pattern>

    <!-- Glow Filter -->
    <filter id="glow_${b.id}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Base Cover Structure -->
  <rect width="400" height="580" rx="16" fill="${b.c1}" />
  <rect width="400" height="580" rx="16" fill="url(#bg_${b.id})" />
  <rect width="400" height="580" rx="16" fill="url(#pat_${b.id})" />
  <rect width="400" height="580" rx="16" fill="url(#highlight_${b.id})" />

  <!-- Book Spine 3D Effect on Left -->
  <rect x="0" y="0" width="24" height="580" rx="4" fill="rgba(0,0,0,0.38)" />
  <line x1="24" y1="0" x2="24" y2="580" stroke="rgba(255,255,255,0.22)" stroke-width="1.5" />
  <line x1="6" y1="0" x2="6" y2="580" stroke="rgba(255,255,255,0.08)" stroke-width="1" />

  <!-- Top Category Badge -->
  <rect x="42" y="38" width="95" height="26" rx="6" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
  <text x="89" y="55" fill="#ffffff" font-family="'Segoe UI', Roboto, sans-serif" font-weight="bold" font-size="11" text-anchor="middle" letter-spacing="1">${escapeXml(b.cat)}</text>

  <!-- Tag Ribbon (e.g. Bestseller / 2026) -->
  <rect x="250" y="38" width="112" height="26" rx="6" fill="rgba(245,158,11,0.25)" stroke="#f59e0b" stroke-width="1"/>
  <text x="306" y="55" fill="#fbbf24" font-family="'Segoe UI', Roboto, sans-serif" font-weight="bold" font-size="10" text-anchor="middle" letter-spacing="0.5">★ ${escapeXml(b.tag)}</text>

  <!-- Central Graphic Artwork -->
  ${b.art}

  <!-- Typography Area -->
  <g transform="translate(44, 340)">
    <!-- English/Main Title -->
    <text x="0" y="0" fill="#ffffff" font-family="'Segoe UI', Roboto, Helvetica, sans-serif" font-weight="900" font-size="23" letter-spacing="-0.5">${escapeXml(b.title)}</text>
    
    <!-- Thai Title -->
    <text x="0" y="28" fill="${b.accent}" font-family="'Segoe UI', 'Sarabun', sans-serif" font-weight="bold" font-size="15">${escapeXml(b.thaiTitle)}</text>
    
    <!-- Subtitle / Topic Details -->
    <text x="0" y="52" fill="rgba(255,255,255,0.8)" font-family="'Segoe UI', Roboto, sans-serif" font-size="13">${escapeXml(b.sub)}</text>
    
    <!-- Stylized Separator Bar -->
    <line x1="0" y1="72" x2="80" y2="72" stroke="${b.accent}" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="95" cy="72" r="3" fill="${b.accent}" />
  </g>

  <!-- Footer Edition & Barcode Area -->
  <rect x="42" y="490" width="318" height="48" rx="10" fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  <text x="60" y="520" fill="rgba(255,255,255,0.9)" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold">OFFICIAL DIGITAL E-BOOK</text>
  <text x="342" y="520" fill="#fbbf24" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="13" text-anchor="end">2026 EDITION</text>
</svg>`;

    fs.writeFileSync(path.join(coversDir, `${b.id}.svg`), svg, 'utf8');
});

// Default Cover
fs.copyFileSync(path.join(coversDir, 'book1.svg'), path.join(coversDir, 'default.svg'));

console.log('✅ Generated 12 high-detail, illustrated SVG book covers with 100% valid XML entities!');
