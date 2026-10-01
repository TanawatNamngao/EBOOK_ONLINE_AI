import os
import sys
import re
import urllib.parse

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

docs_dir = os.path.join(os.path.dirname(__file__), '..', 'docs')

files_to_convert = [
    'FINAL_PROJECT_REPORT.md',
    '00_PROJECT_INFO.md',
    '01_DATABASE_DESIGN_ERD.md',
    '02_AI_USAGE_LOG.md',
    '03_SYSTEM_FLOW_AND_SCENARIOS.md',
    '04_TEST_CASES.md',
    '05_ANALYTICS_REPORTS.md'
]

def apply_sarabun_font(run, size=Pt(16), bold=False, italic=False, color=None):
    font_name = 'TH Sarabun New'
    run.font.name = font_name
    run.font.size = size
    run.bold = bold
    run.italic = italic
    if color:
        run.font.color.rgb = color
    rPr = run._r.get_or_add_rPr()
    rFonts = parse_xml(f'<w:rFonts {nsdecls("w")} w:ascii="{font_name}" w:hAnsi="{font_name}" w:cs="{font_name}"/>')
    rPr.append(rFonts)

def set_cell_background(cell, color_hex):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def convert_md_to_docx(md_path, docx_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    doc = Document()

    # Set page margins A4 standard
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    in_code_block = False
    code_lines = []
    in_table = False
    table_lines = []
    is_in_cover = False

    def flush_table():
        nonlocal table_lines
        if not table_lines:
            return
        
        rows_data = []
        for line in table_lines:
            if re.match(r'^\s*\|?\s*[-:]+[-| :]*\|?\s*$', line):
                continue
            cells = [c.strip() for c in line.split('|')]
            if cells and cells[0] == '':
                cells = cells[1:]
            if cells and cells[-1] == '':
                cells = cells[:-1]
            if cells:
                rows_data.append(cells)

        table_lines = []
        if not rows_data:
            return

        cols_count = max(len(r) for r in rows_data)
        table = doc.add_table(rows=len(rows_data), cols=cols_count)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER

        for row_idx, row in enumerate(rows_data):
            for col_idx in range(cols_count):
                cell_text = row[col_idx] if col_idx < len(row) else ''
                cell = table.cell(row_idx, col_idx)
                cell.text = cell_text
                set_cell_margins(cell, top=100, bottom=100, left=130, right=130)

                # Format Header Row
                if row_idx == 0:
                    set_cell_background(cell, '1E3A8A')
                    for p in cell.paragraphs:
                        for run in p.runs:
                            apply_sarabun_font(run, size=Pt(14), bold=True, color=RGBColor(255, 255, 255))
                else:
                    bg = 'F8FAFC' if row_idx % 2 == 1 else 'FFFFFF'
                    set_cell_background(cell, bg)
                    for p in cell.paragraphs:
                        for run in p.runs:
                            apply_sarabun_font(run, size=Pt(13.5), color=RGBColor(30, 41, 59))

        tblPr = table._tbl.tblPr
        borders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>'
            '<w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
            '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
            '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
            '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
            '<w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
            '<w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
            '</w:tblBorders>'
        )
        tblPr.append(borders)
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    def flush_code():
        nonlocal code_lines
        if not code_lines:
            return
        code_text = ''.join(code_lines)
        code_lines = []

        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        set_cell_background(cell, '0F172A')
        set_cell_margins(cell, top=120, bottom=120, left=180, right=180)

        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.15
        run = p.add_run(code_text.rstrip())
        run.font.name = 'Consolas'
        run.font.size = Pt(10)
        run.font.color.rgb = RGBColor(241, 245, 249)

        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    for line in lines:
        stripped = line.strip()

        # Handle Page Break
        if '<div class="page-break">' in stripped or 'page-break-after' in stripped:
            if in_table:
                in_table = False
                flush_table()
            if in_code_block:
                in_code_block = False
                flush_code()
            doc.add_page_break()
            is_in_cover = False
            continue

        if '<div class="cover-page"' in stripped:
            is_in_cover = True
            continue

        # Handle HTML image tag <img src="..."
        img_match = re.search(r'<img\s+[^>]*src=["\']([^"\']+)["\']', stripped)
        if img_match:
            img_rel = urllib.parse.unquote(img_match.group(1))
            img_full = os.path.normpath(os.path.join(docs_dir, img_rel))
            if os.path.exists(img_full):
                if in_table:
                    in_table = False
                    flush_table()
                p = doc.add_paragraph()
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p.paragraph_format.space_before = Pt(12)
                p.paragraph_format.space_after = Pt(4)
                is_logo = 'logo' in img_rel.lower()
                width = Inches(1.8) if is_logo else Inches(5.8)
                try:
                    p.add_run().add_picture(img_full, width=width)
                except Exception as img_err:
                    p.add_run(f"[{img_rel}]")
            continue

        # Handle Markdown image ![alt](path)
        md_img_match = re.search(r'!\[(.*?)\]\((.*?)\)', stripped)
        if md_img_match:
            caption = md_img_match.group(1)
            img_rel = urllib.parse.unquote(md_img_match.group(2))
            img_full = os.path.normpath(os.path.join(docs_dir, img_rel))
            if os.path.exists(img_full):
                if in_table:
                    in_table = False
                    flush_table()
                p = doc.add_paragraph()
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p.paragraph_format.space_before = Pt(12)
                p.paragraph_format.space_after = Pt(4)
                is_logo = 'logo' in img_rel.lower()
                width = Inches(1.8) if is_logo else Inches(5.8)
                try:
                    p.add_run().add_picture(img_full, width=width)
                except Exception as img_err:
                    p.add_run(f"[{caption or img_rel}]")
                if caption:
                    p_cap = doc.add_paragraph()
                    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    p_cap.paragraph_format.space_before = Pt(2)
                    p_cap.paragraph_format.space_after = Pt(10)
                    run = p_cap.add_run(caption)
                    apply_sarabun_font(run, size=Pt(13.5), italic=True, color=RGBColor(100, 116, 139))
            continue

        # Handle image caption in markdown *ภาพที่ ...* or <em>...</em>
        cap_match = re.search(r'(?:\*|<em>)(ภาพ(?:ที่|ประกอบ)[^*<]+)(?:\*|</em>)', stripped)
        if cap_match:
            cap_text = cap_match.group(1).strip()
            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_before = Pt(2)
            p_cap.paragraph_format.space_after = Pt(10)
            run = p_cap.add_run(cap_text)
            apply_sarabun_font(run, size=Pt(13.5), italic=True, color=RGBColor(100, 116, 139))
            continue

        # Skip generic html helper tags
        if stripped.startswith('<div') or stripped.startswith('</div') or stripped in ['<br>', '<br><br>', '<br><br><br>']:
            continue

        # Handle Code Block fences
        if stripped.startswith('```'):
            if in_code_block:
                in_code_block = False
                flush_code()
            else:
                if in_table:
                    in_table = False
                    flush_table()
                in_code_block = True
            continue

        if in_code_block:
            code_lines.append(line)
            continue

        # Handle Tables
        if '|' in stripped and not stripped.startswith('#'):
            in_table = True
            table_lines.append(stripped)
            continue
        elif in_table:
            in_table = False
            flush_table()

        if not stripped:
            continue

        # Headings (Standard TH Sarabun New sizes: H1=20pt, H2=18pt, H3=16pt)
        if stripped.startswith('# '):
            p = doc.add_heading(level=1)
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(6)
            if is_in_cover:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = p.add_run(stripped[2:])
            apply_sarabun_font(run, size=Pt(22 if is_in_cover else 20), bold=True, color=RGBColor(15, 23, 42))
        elif stripped.startswith('## '):
            p = doc.add_heading(level=2)
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(4)
            if is_in_cover:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = p.add_run(stripped[3:])
            apply_sarabun_font(run, size=Pt(18), bold=True, color=RGBColor(30, 58, 138))
        elif stripped.startswith('### '):
            p = doc.add_heading(level=3)
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(4)
            if is_in_cover:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = p.add_run(stripped[4:])
            apply_sarabun_font(run, size=Pt(16), bold=True, color=RGBColor(37, 99, 235 if is_in_cover else 51))
        elif stripped.startswith('#### '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(3)
            run = p.add_run(stripped[5:])
            apply_sarabun_font(run, size=Pt(16), bold=True, color=RGBColor(71, 85, 105))
        elif stripped.startswith('- ') or stripped.startswith('* '):
            bullet_text = stripped[2:]
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.15
            run = p.add_run(bullet_text.replace('**', ''))
            apply_sarabun_font(run, size=Pt(16), color=RGBColor(30, 41, 59))
        elif re.match(r'^\d+\.\s', stripped):
            match = re.match(r'^\d+\.\s', stripped)
            text_val = stripped[match.end():]
            p = doc.add_paragraph(style='List Number')
            p.paragraph_format.space_after = Pt(2)
            run = p.add_run(text_val.replace('**', ''))
            apply_sarabun_font(run, size=Pt(16), color=RGBColor(30, 41, 59))
        elif stripped.startswith('>'):
            quote_text = stripped[1:].strip()
            tbl = doc.add_table(rows=1, cols=1)
            tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
            cell = tbl.cell(0, 0)
            set_cell_background(cell, 'EFF6FF')
            set_cell_margins(cell, top=80, bottom=80, left=140, right=140)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(quote_text.replace('**', ''))
            apply_sarabun_font(run, size=Pt(15), color=RGBColor(30, 58, 138))
            doc.add_paragraph().paragraph_format.space_after = Pt(4)
        elif stripped.startswith('---'):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(4)
            run = p.add_run('__________________________________________________________________________')
            run.font.color.rgb = RGBColor(203, 213, 225)
            run.font.size = Pt(8)
        else:
            p = doc.add_paragraph()
            if is_in_cover:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.line_spacing = 1.2
            
            clean_text = stripped
            parts = re.split(r'(\*\*.*?\*\*)', clean_text)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    run = p.add_run(part[2:-2])
                    apply_sarabun_font(run, size=Pt(16), bold=True, color=RGBColor(30, 41, 59))
                else:
                    run = p.add_run(part)
                    apply_sarabun_font(run, size=Pt(16), color=RGBColor(30, 41, 59))

    if in_table:
        flush_table()
    if in_code_block:
        flush_code()

    try:
        doc.save(docx_path)
    except PermissionError:
        new_path = docx_path.replace('.docx', '_UPDATED.docx')
        doc.save(new_path)
        print(f'  ⚠️ {os.path.basename(docx_path)} is open in Word! Saved to {os.path.basename(new_path)} instead.')

print('🚀 Converting Markdown documents to Microsoft Word (.docx) with TH Sarabun New font...')

for fname in files_to_convert:
    m_path = os.path.join(docs_dir, fname)
    if not os.path.exists(m_path):
        continue
    base = fname.replace('.md', '')
    d_path = os.path.join(docs_dir, f'{base}.docx')
    print(f'📝 Building {base}.docx...')
    try:
        convert_md_to_docx(m_path, d_path)
        sz = round(os.path.getsize(d_path) / 1024)
        print(f'  ✅ Successfully created {base}.docx ({sz} KB)')
    except Exception as e:
        print(f'  ❌ Error creating {base}.docx: {e}')

print('🎉 All Word (.docx) files created successfully with TH Sarabun New font!')
