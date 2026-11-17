# Generiše .docx obrazac u stilu Ritual pravnih stranica iz jednostavne specifikacije.
import sys, json
from docx import Document
from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
OLIVE=RGBColor(0x3F,0x45,0x2B); INK=RGBColor(0x23,0x26,0x1C); MUTE=RGBColor(0x6C,0x67,0x5D); SUN=RGBColor(0xB9,0x80,0x5F)
def shade(cell, hexc):
    tcPr=cell._tc.get_or_add_tcPr(); s=OxmlElement('w:shd'); s.set(qn('w:val'),'clear'); s.set(qn('w:color'),'auto'); s.set(qn('w:fill'),hexc); tcPr.append(s)
def borders(table, color='D8CFBF'):
    tblPr=table._tbl.tblPr; b=OxmlElement('w:tblBorders')
    for e in ('top','left','bottom','right','insideH','insideV'):
        el=OxmlElement('w:'+e); el.set(qn('w:val'),'single'); el.set(qn('w:sz'),'6'); el.set(qn('w:color'),color); b.append(el)
    tblPr.append(b)
def run(p, text, bold=False, size=10.5, color=INK, italic=False, font=None):
    r=p.add_run(text); r.bold=bold; r.italic=italic; r.font.size=Pt(size); r.font.color.rgb=color
    if font: r.font.name=font; r._element.rPr.rFonts.set(qn('w:eastAsia'),font)
    return r
spec=json.load(open(sys.argv[1],encoding='utf8')); out=sys.argv[2]
d=Document()
sec=d.sections[0]; sec.page_height=Cm(29.7); sec.page_width=Cm(21); sec.left_margin=sec.right_margin=Cm(2.2); sec.top_margin=Cm(1.8); sec.bottom_margin=Cm(1.8)
st=d.styles['Normal']; st.font.name='Calibri'; st.font.size=Pt(10.5); st.paragraph_format.space_after=Pt(6)
st.element.rPr.rFonts.set(qn('w:eastAsia'),'Calibri')
# zaglavlje
p=d.add_paragraph(); run(p,'RITUAL',size=11,color=OLIVE,bold=True); run(p,'  ·  PILATES STUDIO  ·  BEOGRAD',size=8,color=MUTE)
p.paragraph_format.space_after=Pt(2)
p=d.add_paragraph(); run(p,spec['title'],size=22,color=OLIVE,italic=True,font='Georgia'); p.paragraph_format.space_after=Pt(8)
foot=sec.footer.paragraphs[0]; foot.alignment=WD_ALIGN_PARAGRAPH.CENTER
run(foot,'Ritual Pilates Studio · Skenderbegova broj 53, Stari Grad, 11158 Beograd · ritualstudio99@gmail.com · +381 66 428 926',size=7.5,color=MUTE)
for b in spec['blocks']:
    t=b[0]
    if t=='h':
        p=d.add_paragraph(); p.paragraph_format.space_before=Pt(12); p.paragraph_format.space_after=Pt(5); p.paragraph_format.keep_with_next=True
        run(p,b[1],size=13,color=OLIVE,bold=True,font='Georgia')
    elif t=='p' or t=='note' or t=='lead':
        p=d.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.JUSTIFY
        if t=='note': run(p,'Napomena: ',bold=True,color=OLIVE,size=9.5); run(p,b[1],size=9.5,color=MUTE)
        elif t=='lead': run(p,b[1],size=10.5,italic=True,color=INK)
        else: run(p,b[1])
    elif t=='label':
        p=d.add_paragraph(); p.paragraph_format.keep_with_next=True; p.paragraph_format.space_after=Pt(3); run(p,b[1],bold=True,color=INK)
    elif t=='checks':
        for c in b[1]:
            p=d.add_paragraph(); p.paragraph_format.left_indent=Cm(0.6); p.paragraph_format.space_after=Pt(3)
            run(p,'☐  ',size=12,color=OLIVE); run(p,c)
    elif t=='table':
        rows=b[1]; filled=len(b)>2 and b[2]=='filled'
        tb=d.add_table(rows=len(rows),cols=2); tb.alignment=WD_TABLE_ALIGNMENT.CENTER; borders(tb)
        for i,row in enumerate(rows):
            l,v=(row if isinstance(row,list) else [row,''])
            c0,c1=tb.rows[i].cells; c0.width=Cm(6.2); c1.width=Cm(10.4); shade(c0,'F3EEE3')
            c0.paragraphs[0].paragraph_format.space_after=Pt(0); c1.paragraphs[0].paragraph_format.space_after=Pt(0)
            run(c0.paragraphs[0],l,bold=True,size=9.5,color=OLIVE)
            if v: run(c1.paragraphs[0],v,size=9.5)
            tr=tb.rows[i]._tr; trPr=tr.get_or_add_trPr(); h=OxmlElement('w:trHeight'); h.set(qn('w:val'),'440' if filled else '520'); trPr.append(h)
            for c in (c0,c1):
                tcPr=c._tc.get_or_add_tcPr(); va=OxmlElement('w:vAlign'); va.set(qn('w:val'),'center'); tcPr.append(va)
        d.add_paragraph().paragraph_format.space_after=Pt(2)
    elif t=='studio':
        p=d.add_paragraph(); p.paragraph_format.space_before=Pt(14); p.paragraph_format.keep_with_next=True
        run(p,'POPUNJAVA STUDIO',size=8.5,bold=True,color=SUN)
d.save(out)
