from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,KeepTogether
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from xml.sax.saxutils import escape
from pathlib import Path
import json
cv=json.load(open('data.json'))
def t(v):return v.get('en','') if isinstance(v,dict) else str(v)
def period(v):return v['start']+' - '+('Present' if v['end']=='present' else v['end'])
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='NameCV',fontName='Helvetica-Bold',fontSize=24,leading=29,textColor=HexColor('#1d2475'),spaceAfter=7))
styles.add(ParagraphStyle(name='SectionCV',fontName='Helvetica-Bold',fontSize=12,leading=16,textColor=HexColor('#1d2475'),spaceBefore=16,spaceAfter=7,keepWithNext=True))
styles.add(ParagraphStyle(name='EntryCV',fontName='Helvetica-Bold',fontSize=10.5,leading=14,spaceBefore=7,spaceAfter=4,keepWithNext=True))
styles.add(ParagraphStyle(name='BodyCV',fontName='Helvetica',fontSize=9.5,leading=13,spaceAfter=5))
styles.add(ParagraphStyle(name='MetaCV',fontName='Helvetica',fontSize=9,leading=12,textColor=HexColor('#555555'),spaceAfter=5))
story=[]
def p(text,style='BodyCV'):return Paragraph(escape(t(text)).replace('\n','<br/>'),styles[style])
def add(text,style='BodyCV'):story.append(p(text,style))
P=cv['profile'];add(P['name'],'NameCV');add(P['roles'][0],'EntryCV');add(P['affiliation']['organization']);add(P['headline'],'MetaCV')
for c in P['contacts']:add(t(c['label'])+': '+c['value'],'MetaCV')
for s in P['socials']:add(t(s['label'])+': '+s['url'],'MetaCV')
add('Profile','SectionCV');add(P['about'])
for detail in P['details']:add(t(detail['label'])+': '+t(detail['value']),'MetaCV')
add('Education','SectionCV')
for e in cv['education']:
 add(t(e['degree'])+' | '+t(e['school']),'EntryCV');add(t(e['department'])+' | '+period(e),'MetaCV')
 if 'grade' in e:add('GPA: '+e['grade'],'MetaCV')
 add(e['description'])
add('Experience','SectionCV')
for e in cv['experience']:add(e['title'],'EntryCV');add(t(e['organization'])+' | '+period(e),'MetaCV');add(e['location'],'MetaCV');add(e['description'])
add('Projects','SectionCV')
for e in cv['projects']:
 add(e['title'],'EntryCV');add(t(e['category'])+' | '+period(e),'MetaCV');add(e['organization'],'MetaCV');add('Role: '+t(e['role']));add(e['summary'])
 for h in e['highlights']:add('- '+t(h))
 add('Technologies: '+', '.join(e['skills']),'MetaCV')
add('Publications','SectionCV')
for e in cv['publications']:
 add(e['title'],'EntryCV');add(e['year']+' | '+t(e['type']),'MetaCV');add(e['venue']);add(e['authors'],'MetaCV')
 if e.get('award'):add(e['award'])
add('Awards','SectionCV')
for e in cv['awards']:
 add(e['title'],'EntryCV');add(t(e['date'])+' | '+t(e['organization']),'MetaCV');add(e['venue']);add('Track: '+t(e['track'])+' | Certificate: '+t(e['certNo']),'MetaCV');add(e['paper']);add(e['description'])
add('Skills & Languages','SectionCV')
for e in cv['skills']:add(e['category'],'EntryCV');add(' · '.join(map(t,e['items'])))
out=Path('minecraft/public/minecraft/Jeonghun-Lee-CV.pdf')
def footer(canvas,doc):
 canvas.setFont('Helvetica',8);canvas.setFillColor(HexColor('#777777'));canvas.drawString(42,27,'Lee Jeong Hoon | Curriculum Vitae');canvas.drawRightString(553,27,str(doc.page))
doc=SimpleDocTemplate(str(out),pagesize=(595,842),rightMargin=42,leftMargin=42,topMargin=38,bottomMargin=45,title='Lee Jeong Hoon - Curriculum Vitae',author='Lee Jeong Hoon')
grouped=[];group=[]
for flow in story:
 if flow.style.name in ('EntryCV','SectionCV','NameCV') and group:
  grouped.append(KeepTogether(group));group=[]
 if flow.style.name=='SectionCV':grouped.append(flow)
 else:group.append(flow)
if group:grouped.append(KeepTogether(group))
doc.build(grouped,onFirstPage=footer,onLaterPages=footer)
print(out)
