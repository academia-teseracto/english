"""Generador editorial: ejecutarlo dentro del proyecto si se actualizan las lecciones.
Requiere Python + ReportLab. Los PDF ya están incluidos en materiales/.
"""
import json, os
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak,KeepTogether,HRFlowable
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib.enums import TA_LEFT,TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.units import mm

BASE=os.path.dirname(os.path.abspath(__file__))
OUT=os.path.join(BASE,'materiales');os.makedirs(OUT,exist_ok=True)
DATA=json.load(open(os.path.join(BASE,'data','lessons-export.json'),encoding='utf8'))
fontdir='/usr/share/fonts/truetype/dejavu'
pdfmetrics.registerFont(TTFont('DVS',fontdir+'/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DVS-Bold',fontdir+'/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFontFamily('DVS',normal='DVS',bold='DVS-Bold',italic='DVS',boldItalic='DVS-Bold')
NAVY=colors.HexColor('#122B56');TEAL=colors.HexColor('#087F8C');LIGHT=colors.HexColor('#EAF3F7');MID=colors.HexColor('#4F617C')
S={
 'title':ParagraphStyle('t',fontName='DVS-Bold',fontSize=16,leading=20,textColor=NAVY,spaceAfter=7),
 'heading':ParagraphStyle('h',fontName='DVS-Bold',fontSize=10.2,leading=13,textColor=NAVY,spaceBefore=9,spaceAfter=5),
 'text':ParagraphStyle('txt',fontName='DVS',fontSize=8.7,leading=13,spaceAfter=3,textColor=colors.HexColor('#26334A')),
 'tiny':ParagraphStyle('sm',fontName='DVS',fontSize=7.4,leading=10,textColor=MID),
 'q':ParagraphStyle('q',fontName='DVS',fontSize=8.5,leading=12.5,spaceAfter=3),
 'key':ParagraphStyle('k',fontName='DVS',fontSize=8.4,leading=13,spaceAfter=5),
 'cover':ParagraphStyle('cover',fontName='DVS-Bold',fontSize=26,leading=31,textColor=NAVY,spaceAfter=13),
}
def P(x,style='text'):
 return Paragraph(escape(str(x)).replace('\n','<br/>'),S[style])
def rich(x,style='text'):return Paragraph(x,S[style])
def header(canvas,doc):
 canvas.saveState();w,h=A4
 canvas.setStrokeColor(colors.HexColor('#D9E3EF'));canvas.line(16*mm,h-16*mm,w-16*mm,h-16*mm)
 canvas.setFont('DVS-Bold',8);canvas.setFillColor(NAVY);canvas.drawString(16*mm,h-13.5*mm,'TESERACTO  /  ENGLISH')
 canvas.setFont('DVS',7);canvas.setFillColor(MID);canvas.drawRightString(w-16*mm,h-13.5*mm,'Inglés que se construye')
 canvas.line(16*mm,14*mm,w-16*mm,14*mm);canvas.drawString(16*mm,9.5*mm,'Academia Teseracto · Material de elaboración propia')
 canvas.drawRightString(w-16*mm,9.5*mm,f'Página {doc.page}')
 canvas.restoreState()
def doc(path):return SimpleDocTemplate(path,pagesize=A4,leftMargin=18*mm,rightMargin=18*mm,topMargin=23*mm,bottomMargin=22*mm,title='Teseracto English',author='Academia Teseracto')
def selected(lesson):return lesson['q'][:6]+lesson['q'][6:7]+lesson['aged']['teens'][:1]
def vocab(lesson):
 rows=[]
 for i in range(0,len(lesson['words']),2):
  a=lesson['words'][i]; b=lesson['words'][i+1] if i+1<len(lesson['words']) else None
  rows.append([P(f'{a[0]} — {a[1]}','tiny'),P(f'{b[0]} — {b[1]}','tiny') if b else P('','tiny')])
 t=Table(rows,colWidths=[83*mm,83*mm],hAlign='LEFT',rowHeights=7*mm)
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),LIGHT),('BOX',(0,0),(-1,-1),.35,colors.HexColor('#D5E1E9')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),7)]))
 return t

def workbook():
 story=[]
 for k,l in enumerate(DATA):
  if k:story.append(PageBreak())
  story += [P(f'{k+1:03}A / {k+1:03}B / {k+1:03}C  ·  {l["unit"]}','tiny'),P(l['title'],'title'),rich('<b>Objetivo:</b> '+escape(l['goal'])),P('Primero, comprende la estructura. Después, utilízala.','tiny')]
  story.append(P('Estructuras de hoy','heading'))
  for tag,example in l['formula']:
   story.append(rich('<b>'+escape(tag)+'</b>  '+escape(example)))
  story+=[P('La regla que te ayuda','heading'),P(l['rule']),P('Vocabulario útil','heading'),vocab(l),P('Reto para el cuaderno','heading')]
  for j,q in enumerate(selected(l),1):
   story.append(rich(f'<b>{j}.</b> '+escape(q['prompt']),'q'))
   if q['type']=='choice':
    options=q['options'][1:]; options.insert((k+j)%len(q['options']),q['answer'])
    story.append(P('   /   '.join(options),'tiny'))
   story.append(HRFlowable(width='98%',thickness=.35,color=colors.HexColor('#A8B5C4'),spaceBefore=12,spaceAfter=7))
  story.append(Spacer(1,4));story.append(P('Reto oral: lee tres frases en voz alta y explica con tus palabras dónde se coloca el verbo.','tiny'))
 path=os.path.join(OUT,'Teseracto_English_Cuaderno_20_bloques.pdf');doc(path).build(story,onFirstPage=header,onLaterPages=header);return path

def answers():
 story=[]
 for k,l in enumerate(DATA):
  if k and k%2==0:story.append(PageBreak())
  story += [P(f'{k+1:03} · {l["title"]}','heading')]
  for j,q in enumerate(selected(l),1):story.append(rich(f'<b>{j}.</b> {escape(q["answer"])}','key'))
  story.append(P('Las respuestas abiertas admiten alternativas correctas. Revisar con criterio docente.','tiny'))
  story.append(Spacer(1,7))
 path=os.path.join(OUT,'Teseracto_English_Solucionario_20_bloques.pdf');doc(path).build(story,onFirstPage=header,onLaterPages=header);return path

def route():
 story=[P('TESERACTO ENGLISH','cover'),P('Guía de niveles · versión inicial','title'),P('Un recorrido por construcción, no una sucesión rígida de etiquetas A1–C2.'),P('El mapa que sigue diferencia entre contenido programado y contenido publicado. Completar un ejercicio gramatical no equivale a alcanzar un nivel de competencia comunicativa.'),P('Cómo se usa una etapa','heading')]
 for x in ['A · Comprender: observar el patrón, reconocer qué cambia y detectar un error típico.','B · Entrenar: recuperar palabras, completar formas y ordenar frases.','C · Aplicar: trasladar la misma estructura a una situación útil, con ejemplos adaptados a la edad.','Registrar el código: si acabas en 008B, podrás volver a esa etapa desde «Mi ruta».','No cerrar la sesión sin escuchar y producir al menos una frase propia.']:
  story.append(P('• '+x))
 story += [P('Ruta disponible: 20 bloques / 60 etapas','heading')]
 for i,l in enumerate(DATA):story.append(rich(f'<b>{i+1:03}A–{i+1:03}C</b> · {escape(l["title"])}','text'))
 story += [PageBreak(),P('Siguientes etapas: planificación editorial','title')]
 future=[
 ('021–030','Contrastes, comparación y decisiones','Past continuous, going to, comparativos, cuantificadores, modales y preguntas indirectas.'),
 ('031–040','Experiencia y narración','Present perfect, since/for, pasados combinados, conectores y relatos.'),
 ('041–050','Hipótesis y consecuencias','Condicionales 0–3, deseos, consejos, obligación y consecuencias hipotéticas.'),
 ('051–060','Información compleja','Pasiva, relativos, estilo indirecto, concesión y argumentación.'),
 ('061–075','Precisión y registro','Modales de deducción, inversión, énfasis, combinaciones léxicas.'),
 ('076–090','Interacción avanzada','Debates, síntesis, negociación, textos extensos, mediación y reformulación.'),
 ('091–100','Competencia avanzada integral','Comunicación precisa según audiencia, contexto y propósito; práctica de comprensión y producción.')]
 for code,title,desc in future:story += [rich(f'<b>{code} · {escape(title)}</b>'),P(desc),Spacer(1,5)]
 story += [P('Relación con el MCER','heading'),P('Los códigos Teseracto son internos. El MCER describe destrezas observables de comprensión, interacción, expresión y mediación en distintos contextos. Una orientación hasta C2 requiere materiales complejos, escucha auténtica, lectura extensa, conversación real, producción escrita y evaluación independiente; esta primera versión no certifica esos niveles.'),P('Fuentes de referencia: Consejo de Europa, MCER Companion Volume (2020), y British Council LearnEnglish.'),P('Enlace: https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors','tiny')]
 path=os.path.join(OUT,'Teseracto_English_Mapa_de_niveles.pdf');doc(path).build(story,onFirstPage=header,onLaterPages=header);return path
if __name__=='__main__':
 import fitz
 for fn in (workbook(),answers(),route()):
  with fitz.open(fn) as pdf: print(os.path.basename(fn),len(pdf),'pages',os.path.getsize(fn),'bytes')
