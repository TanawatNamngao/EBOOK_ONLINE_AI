const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { marked } = require('marked');

const docsDir = path.join(__dirname, '..', 'docs');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const filesToConvert = [
    'FINAL_PROJECT_REPORT.md',
    '00_PROJECT_INFO.md',
    '01_DATABASE_DESIGN_ERD.md',
    '02_AI_USAGE_LOG.md',
    '03_SYSTEM_FLOW_AND_SCENARIOS.md',
    '04_TEST_CASES.md',
    '05_ANALYTICS_REPORTS.md'
];

const cssTemplate = `
@import url('https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Fira+Code:wght@400;500&display=swap');

@page {
    size: A4 portrait;
    margin: 20mm 15mm 20mm 15mm;
}

body {
    font-family: 'TH Sarabun New', 'TH SarabunPSK', 'Sarabun', 'Leelawadee UI', 'Leelawadee', Tahoma, sans-serif;
    font-size: 13pt;
    line-height: 1.6;
    color: #1e293b;
    background: #ffffff;
    margin: 0;
    padding: 0;
}

h1 {
    font-size: 20pt;
    font-weight: 700;
    color: #0f172a;
    border-bottom: 2.5px solid #2563eb;
    padding-bottom: 8px;
    margin-top: 15px;
    margin-bottom: 15px;
}

h2 {
    font-size: 15pt;
    font-weight: 700;
    color: #1e3a8a;
    border-bottom: 1.5px solid #cbd5e1;
    padding-bottom: 6px;
    margin-top: 24px;
    margin-bottom: 12px;
    page-break-after: avoid;
}

h3 {
    font-size: 12.5pt;
    font-weight: 700;
    color: #334155;
    margin-top: 18px;
    margin-bottom: 8px;
    page-break-after: avoid;
}

h4, h5, h6 {
    font-size: 11pt;
    font-weight: 600;
    color: #475569;
    margin-top: 14px;
    margin-bottom: 6px;
}

p, ul, ol {
    margin-top: 0;
    margin-bottom: 12px;
}

li {
    margin-bottom: 4px;
}

table {
    border-collapse: collapse;
    width: 100%;
    margin: 16px 0;
    font-size: 9.5pt;
    page-break-inside: auto;
}

tr {
    page-break-inside: avoid;
    page-break-after: auto;
}

th {
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
    text-align: left;
    padding: 8px 10px;
    border: 1px solid #cbd5e1;
}

td {
    padding: 7px 10px;
    border: 1px solid #e2e8f0;
    vertical-align: top;
}

tr:nth-child(even) td {
    background-color: #f8fafc;
}

code {
    font-family: 'Fira Code', 'Consolas', 'Courier New', monospace;
    font-size: 9pt;
    background-color: #f1f5f9;
    color: #0f172a;
    padding: 2px 5px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
}

pre {
    background-color: #0f172a;
    color: #f8fafc;
    padding: 14px 16px;
    border-radius: 8px;
    overflow-x: auto;
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 9pt;
    line-height: 1.5;
    margin: 14px 0;
    page-break-inside: avoid;
}

pre code {
    background-color: transparent;
    color: inherit;
    padding: 0;
    border: none;
}

blockquote {
    border-left: 4px solid #3b82f6;
    background-color: #eff6ff;
    padding: 10px 16px;
    margin: 14px 0;
    border-radius: 0 8px 8px 0;
    color: #1e3a8a;
    font-size: 10.5pt;
}

hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 22px 0;
}

.cover-page {
    text-align: center;
    page-break-after: always;
    break-after: page;
    padding-top: 30px;
}

.cover-page h1 {
    font-size: 20pt;
    border-bottom: none;
    margin-top: 20px;
    margin-bottom: 8px;
    color: #0f172a;
}

.cover-page h2 {
    font-size: 14pt;
    border-bottom: none;
    color: #334155;
    margin-top: 10px;
    margin-bottom: 25px;
}

.cover-page h3 {
    font-size: 13pt;
    font-weight: 600;
    color: #2563eb;
    margin-top: 0;
    margin-bottom: 15px;
}

.cover-logo {
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    margin-top: 20px;
    margin-bottom: 15px;
}

.page-break {
    page-break-after: always;
    break-after: page;
}

img {
    max-width: 95%;
    height: auto;
    display: block;
    margin: 14px auto 6px auto;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
    box-shadow: 0 3px 8px rgba(0,0,0,0.08);
    page-break-inside: avoid;
}

p > em {
    display: block;
    text-align: center;
    font-size: 9pt;
    color: #64748b;
    margin-top: 4px;
    margin-bottom: 16px;
    page-break-after: avoid;
}
`;

console.log('🚀 Starting PDF generation using Microsoft Edge Headless engine...');

for (const filename of filesToConvert) {
    const mdPath = path.join(docsDir, filename);
    if (!fs.existsSync(mdPath)) continue;

    const baseName = filename.replace('.md', '');
    const htmlPath = path.join(docsDir, `${baseName}_temp.html`);
    const pdfPath = path.join(docsDir, `${baseName}.pdf`);

    const mdContent = fs.readFileSync(mdPath, 'utf8');
    const parsedHtml = marked.parse(mdContent);

    const fullHtml = `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>${baseName}</title>
    <style>${cssTemplate}</style>
</head>
<body>
    ${parsedHtml}
</body>
</html>`;

    fs.writeFileSync(htmlPath, fullHtml, 'utf8');

    const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
    console.log(`📄 Rendering ${filename} -> ${baseName}.pdf...`);

    try {
        const cmd = `"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --run-all-compositor-stages-before-draw --print-to-pdf="${pdfPath}" "${fileUrl}"`;
        execSync(cmd, { stdio: 'ignore' });
        
        if (fs.existsSync(pdfPath)) {
            const stats = fs.statSync(pdfPath);
            console.log(`  ✅ Successfully created ${baseName}.pdf (${Math.round(stats.size / 1024)} KB)`);
        }
    } catch (err) {
        console.error(`  ❌ Error generating ${baseName}.pdf:`, err.message);
    } finally {
        if (fs.existsSync(htmlPath)) {
            fs.unlinkSync(htmlPath);
        }
    }
}

console.log('🎉 All PDF files generated successfully in docs/ folder!');
