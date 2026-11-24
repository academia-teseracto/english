/* TESERACTO ENGLISH | v1.0 | Sin frameworks, sin cuentas, compatible con GitHub Pages */
(() => {
'use strict';
const LESSONS = window.TESERACTO_LESSONS || [];
const STORAGE_KEY = 'teseracto-english-v1-progress';
const LETTERS = ['A','B','C'];
const STAGE_NAMES = ['Comprender','Entrenar','Aplicar'];
const STAGE_HELP = [
  'Observa la estructura y reconoce cómo funciona.',
  'Reordena, transforma y recupera la estructura sin mirar la solución.',
  'Traslada lo que sabes a nuevas situaciones y vocabulario de tu edad.'
];
const AGE_LABELS = {kids:'Niños',teens:'Adolescentes',adults:'Adultos'};
const STAGE_LABELS = {kids:'Exploradores',teens:'Impulso',adults:'Vida real'};
const FUTURE = [
 ['021–030','Conversaciones con más precisión','Past continuous, going to, comparativos, superlativos, cantidades, modales y preguntas indirectas'],
 ['031–040','Contar experiencias y conectar tiempos','Present perfect, since/for, contraste de pasados, conectores y narración'],
 ['041–050','Hipótesis y decisiones','Condicionales 0–3, deseos, obligación, recomendaciones y consecuencias'],
 ['051–060','Explicar y argumentar','Pasiva, relativos, estilo indirecto, concesión y textos argumentativos'],
 ['061–075','Lenguaje flexible','Modales de deducción, énfasis, inversión, registro, colocaciones, paráfrasis'],
 ['076–090','Pensamiento avanzado','Síntesis, debate, matices, negociación, interpretación de textos complejos'],
 ['091–100','Dominio comunicativo avanzado','Producción extensa, precisión estilística, mediación y práctica integral avanzada']
];
const app = document.querySelector('#app');
const fileImport = document.querySelector('#fileImport');
const safe = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localDate = d => [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const today = () => localDate(new Date());
const dateAfter = d => {const x=new Date();x.setDate(x.getDate()+d);return localDate(x);};
const toCode = (n,stage) => String(n).padStart(3,'0') + LETTERS[stage];
const allCodes = LESSONS.flatMap((l,i)=>LETTERS.map((_,s)=>toCode(i+1,s)));
const codeDetails = code => {
  const m=/^(\d{3})([ABC])$/i.exec(String(code || '').trim());
  if(!m) return null;
  const index=Number(m[1])-1, stage=LETTERS.indexOf(m[2].toUpperCase());
  if(index<0 || index>=LESSONS.length || stage<0) return null;
  return {index,stage,lesson:LESSONS[index],code:toCode(index+1,stage)};
};
const defaultProfile = () => ({id:'main',name:'Mi recorrido',age:'teens',progress:{},wrong:{},history:[],bookmark:'001A',note:''});
function load(){
  try {
    const data=JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(data && data.version===1 && Array.isArray(data.profiles) && data.profiles.length){
      data.profiles=data.profiles.filter(p=>p && typeof p==='object' && typeof p.id==='string').slice(0,12).map(p=>({
        id:p.id,name:String(p.name || 'Estudiante').slice(0,40),age:AGE_LABELS[p.age]?p.age:'teens',
        progress:typeof p.progress==='object'&&p.progress&&!Array.isArray(p.progress)?p.progress:{},
        wrong:typeof p.wrong==='object'&&p.wrong&&!Array.isArray(p.wrong)?p.wrong:{},
        history:Array.isArray(p.history)?p.history.slice(-400):[],
        bookmark:codeDetails(p.bookmark)?p.bookmark:'001A',note:String(p.note || '').slice(0,800)
      }));
      if(data.profiles.length){data.active=data.profiles.some(p=>p.id===data.active)?data.active:data.profiles[0].id;return data;}
    }
  } catch (_) {}
  return {version:1,profiles:[defaultProfile()],active:'main'};
}
let state=load(), currentView='home', quiz=null, orderPick=[], feedback=null;
const profile = () => state.profiles.find(p=>p.id===state.active) || state.profiles[0];
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(_){toast('El navegador no ha podido guardar. Exporta una copia JSON.');}}
function toast(msg){const t=document.querySelector('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),4000);}
function go(path){location.hash='#'+path; if(location.hash==='#'+path) render();}
function setChrome(){
 const p=profile();
 document.body.className='age-'+p.age;
 document.querySelector('#who-mini').textContent=p.name;
 document.querySelector('#avatar-mini').textContent=p.name.trim().charAt(0).toUpperCase() || 'T';
 document.querySelectorAll('.main-nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===currentView));
}
function layout(content){app.innerHTML='<div class="page">'+content+'</div>';setChrome();}
function stat(p){
 const passed=allCodes.filter(c=>p.progress[c]?.passed);
 const recent=Array.isArray(p.history)?p.history.slice(-100):[];
 return {passed:passed.length,percent:Math.round(passed.length/allCodes.length*100),review:Object.values(p.wrong).filter(w=>w && w.next<=today()).length,totalWrong:Object.keys(p.wrong).length,recent};
}
function nextCode(p){return allCodes.find(c=>!p.progress[c]?.passed)||'020C';}
function streak(p){const days=new Set(p.history.map(x=>x.date));let n=0,i=0;while(i<365){const x=new Date();x.setDate(x.getDate()-i);if(days.has(localDate(x))){n++;i++;continue;}if(i===0){i++;continue;}break;}return n;}
function xp(p){return p.history.reduce((sum,x)=>sum+(Number(x.correct)||0)*5,0)+stat(p).passed*20;}
function progressBar(p){let n=stat(p).percent;return `<div class="progress" role="progressbar" aria-label="Progreso de niveles disponibles" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${n}"><span style="width:${n}%"></span></div>`;}
function crumb(...items){return `<div class="breadcrumbs">${items.map(it=>it.href?`<button data-action="go" data-view="${safe(it.href)}">${safe(it.text)}</button>`:`<strong>${safe(it.text)}</strong>`).join('<span> / </span>')}</div>`;}
function btn(label,view,cls='btn-primary'){return `<button class="btn ${cls}" data-action="go" data-view="${safe(view)}">${safe(label)}</button>`;}
function renderHome(){
 const p=profile(), s=stat(p), next=nextCode(p), detail=codeDetails(next);
 currentView='home';
 layout(`<section class="hero"><div class="eyebrow">TESERACTO ENGLISH · RUTA POR CONSTRUCCIÓN</div><h1>Una pieza nueva.<br>Una frase más poderosa.</h1><p>Aprende a decir lo que necesitas, paso a paso. No memorizas temas aislados: construyes frases, preguntas y conversaciones con lo que ya sabes.</p><div class="btn-row">${btn(s.passed?'Continuar en '+next:'Empezar por 001A','lesson/'+(s.passed?next:p.bookmark))}${btn('Ver todos los niveles','route','btn-outline')}</div></section>
 <section class="meta-grid"><div class="stat"><span class="value">${s.passed}<small>/ ${allCodes.length}</small></span><span class="caption">Etapas superadas</span></div><div class="stat"><span class="value">${safe(next)}</span><span class="caption">Siguiente etapa</span></div><div class="stat"><span class="value">${s.review}</span><span class="caption">Repasos pendientes</span></div><div class="stat"><span class="value">${xp(p)} XP</span><span class="caption">Experiencia de práctica · ${streak(p)} días seguidos</span></div></section>
 <div class="two-col"><section class="card"><span class="eyebrow">Tu siguiente paso</span><h2>${safe(next)} · ${safe(detail.lesson.title)}</h2><p>${safe(STAGE_HELP[detail.stage])}</p>${progressBar(p)}<p class="caption">${s.percent}% de las 60 etapas actualmente publicadas, no del dominio completo del inglés.</p><div class="btn-row">${btn('Abrir '+next,'lesson/'+next,'btn-dark')}${btn('Ir a mi último marcador','lesson/'+p.bookmark,'btn-outline')}</div></section>
 <section class="card"><span class="eyebrow">Aprende con sentido</span><h3>Reconoce → transforma → úsalo</h3><p>Los mismos cimientos para cualquier edad. Los temas y ejemplos se adaptan a tu etapa de vida.</p><div class="kpi-line">Perfil: <strong>${safe(p.name)}</strong> · ${safe(AGE_LABELS[p.age])}</div><button class="btn btn-light" data-action="go" data-view="profiles">Cambiar edad o recorrido</button></section></div>
 <div class="section-title"><div><h2>Tu caja de herramientas</h2><p>Un lugar claro para cada acción.</p></div></div><div class="cards-3">
 <article class="card action-card"><div class="icon-tile">01</div><h3>Ruta guiada</h3><p>60 etapas, con códigos de avance que puedes apuntar en tu cuaderno.</p>${btn('Explorar la ruta','route','btn-outline')}</article>
 <article class="card action-card"><div class="icon-tile">02</div><h3>Repetición inteligente</h3><p>Los errores vuelven a aparecer en sesiones posteriores. Repasa también cuando quieras.</p>${btn('Practicar otra vez','review','btn-outline')}</article>
 <article class="card action-card"><div class="icon-tile">03</div><h3>Cuaderno imprimible</h3><p>Una ficha para practicar sin pantalla, PDFs y materiales externos seleccionados.</p>${btn('Ver recursos','resources','btn-outline')}</article></div>
 <section class="card" style="margin-top:20px"><div class="row-between"><div><div class="eyebrow">UN RETO QUE CAMBIA CONTIGO</div><h3>Reto relámpago · 8 preguntas</h3><p>Mezclamos estructuras que ya has trabajado para comprobar si las recuerdas fuera de orden.</p></div><button class="btn btn-dark" data-action="challenge-start">Jugar ahora</button></div></section><div class="callout info"><strong>Sobre los niveles:</strong> Los códigos 001A–020C son etapas Teseracto. No equivalen a A1, A2 o C2. La comunicación real también se trabaja escuchando, hablando, leyendo y escribiendo con otras personas.</div>`);
}
function lessonStageStatus(p,c){return p.progress[c]?.passed?'✓ Superado':p.progress[c]?'↻ Repetir':'Sin empezar';}
function renderRoute(){
 currentView='route';const p=profile(),s=stat(p);let units=[];
 LESSONS.forEach((l,i)=>{let g=units.find(x=>x.name===l.unit);if(!g){g={name:l.unit,items:[]};units.push(g);}g.items.push({l,i});});
 layout(`${crumb({text:'Inicio',href:'home'},{text:'Mi ruta'})}<div class="section-title"><div><div class="eyebrow">TU MAPA DE APRENDIZAJE</div><h1>Elige un nivel y sigue construyendo</h1><p>Avanza en orden recomendado o entra por un código específico. Puedes regresar siempre que lo necesites.</p></div></div>
 <section class="card" style="margin-bottom:22px"><div class="row-between"><div><strong>${s.passed} / ${allCodes.length} etapas superadas</strong><p class="caption">Accesibles desde cualquier dispositivo con el código. Las marcas de progreso se guardan solo aquí o en tu copia JSON.</p></div>${btn('Seguir en '+nextCode(p),'lesson/'+nextCode(p),'btn-primary')}</div>${progressBar(p)}<form data-form="jump" class="btn-row" style="margin-top:17px"><label for="level-jump"><strong>Saltar a un código</strong></label><input class="field" id="level-jump" name="code" placeholder="Ej.: 007B" maxlength="4" pattern="[0-9]{3}[ABCabc]" required><button class="btn btn-dark" type="submit">Ir al nivel</button></form></section>
 ${units.map((g,gi)=>`<section class="route-section"><div class="unit-header"><span class="unit-no">${String(gi+1).padStart(2,'0')}</span><h2>${safe(g.name)}</h2></div><div class="lesson-list">${g.items.map(({l,i})=>`<article class="card" style="padding:13px 16px"><div class="row-between"><div class="lesson-main"><strong>${safe(l.title)}</strong><small>${safe(l.goal)}</small></div></div><div class="btn-row" style="margin-top:10px">${LETTERS.map((letter,j)=>{const code=toCode(i+1,j),pr=p.progress[code];return `<button class="step ${pr?.passed?'done':''}" data-action="go" data-view="lesson/${code}" title="${safe(lessonStageStatus(p,code))}">${safe(code)} · ${safe(STAGE_NAMES[j])} ${pr?.passed?'✓':''}</button>`;}).join('')}</div></article>`).join('')}</div></section>`).join('')}
 <div class="section-title"><h2>Lo que vendrá después</h2></div><div class="callout info">Esta sección es una <strong>hoja de ruta editorial</strong>, no ejercicios terminados. No se considera cursada ni certifica ningún nivel del MCER.</div><div class="cards-3">${FUTURE.map(f=>`<article class="card"><div class="pill">Planeado · ${safe(f[0])}</div><h3 style="margin-top:12px">${safe(f[1])}</h3><p>${safe(f[2])}</p></article>`).join('')}</div>`);
}
function stageQuestionList(detail,age){
 const q=detail.lesson.q, i=detail.stage;
 if(i===0)return q.slice(0,3);
 if(i===1)return q.slice(3,6);
 return [...q.slice(6,9),...(detail.lesson.aged[age]||[])];
}
function renderLesson(code){
 const d=codeDetails(code);if(!d){go('route');return;}
 const p=profile();p.bookmark=code;save();currentView='lesson';
 const l=d.lesson,s=d.stage,st=stat(p),prev=allCodes[allCodes.indexOf(code)-1],next=allCodes[allCodes.indexOf(code)+1];
 const status=p.progress[code];
 layout(`${crumb({text:'Mi ruta',href:'route'},{text:code})}
 <div class="lesson-header"><div><div class="eyebrow">${safe(l.unit)} · ETAPA ${safe(code)}</div><h1>${safe(l.title)}</h1><p>${safe(l.goal)}</p></div><div class="pill">${safe(STAGE_NAMES[s])} · ${safe(lessonStageStatus(p,code))}</div></div>
 <div class="steps">${LETTERS.map((letter,j)=>{const x=toCode(d.index+1,j);return `<button class="step ${j===s?'active':p.progress[x]?.passed?'done':''}" data-action="go" data-view="lesson/${x}">${safe(x)} · ${safe(STAGE_NAMES[j])}</button>`;}).join('')}</div>
 <div class="learning-layout"><div>
 <section class="card"><div class="eyebrow">Lo nuevo que añadimos hoy</div><h2>${safe(STAGE_NAMES[s])} · ${safe(STAGE_HELP[s])}</h2><div class="grammar-table">${l.formula.map(([tag,example])=>`<div class="grammar-row"><span>${safe(tag==='+'?'Afirmativa':tag==='−'?'Negativa':tag==='?'?'Interrogativa':tag)}</span><strong lang="en">${safe(example)}</strong><button class="btn btn-light btn-small" data-action="speak" data-text="${safe(example)}" aria-label="Escuchar ${safe(example)}">Escuchar</button></div>`).join('')}</div><h3 style="margin-top:25px">Regla que debes comprender</h3><p>${safe(l.rule)}</p><div class="callout warn"><strong>Error habitual:</strong> ${safe(l.trap)}</div><div class="callout info"><strong>Ejemplo para ${safe(AGE_LABELS[p.age].toLowerCase())}:</strong> <span lang="en">${safe(l.examples[p.age])}</span></div></section>
 <section class="card" style="margin-top:18px"><div class="eyebrow">Escucha y repite</div><h3>Una conversación que ya puedes entender</h3><p lang="en" class="quote-example">${safe(l.audio)}</p><div class="btn-row"><button class="btn btn-outline" data-action="speak" data-text="${safe(l.audio)}">▶ Escuchar en inglés</button><button class="btn btn-light" data-action="slow" data-text="${safe(l.audio)}">Escuchar despacio</button></div><p class="caption">Voz del dispositivo si está disponible. Puedes escuchar mientras lees, después ocultar el texto con la mano y repetir en voz alta.</p></section>
 </div><aside class="stack"><section class="card"><div class="eyebrow">Tu misión</div><p>${safe(STAGE_HELP[s])}</p><p class="caption">${stageQuestionList(d,p.age).length} ejercicios · autocorrección · sin cronómetro</p><button class="btn btn-primary btn-large" data-action="go" data-view="quiz/${code}">${status?.passed?'Volver a practicar':'Comenzar ejercicios'}</button><button class="btn btn-outline" data-action="print" data-code="${code}">Imprimir ficha / PDF</button></section><section class="card"><div class="eyebrow">Vocabulario útil</div><div class="word-grid">${l.words.map(([en,es])=>`<div class="word"><strong lang="en">${safe(en)}</strong><small>${safe(es)}</small></div>`).join('')}</div></section><section class="card"><div class="eyebrow">Para practicar fuera</div><p class="caption">Recurso externo, abre en una pestaña nueva.</p><a class="btn btn-outline" href="${safe(p.age==='kids'?l.kidsUrl:l.resourceUrl)}" target="_blank" rel="noopener noreferrer">${p.age==='kids'?'Vídeo British Council':'Gramática British Council'} ↗</a></section></aside></div>
 <div class="quiz-actions"><span>${prev?btn('← '+prev,'lesson/'+prev,'btn-ghost'):'Principio de la ruta'}</span><div class="btn-row">${btn('Todos los niveles','route','btn-outline')}${next?btn(next+' →','lesson/'+next,'btn-dark'):btn('Repasar','review','btn-dark')}</div></div>`);
}
function normalizeAnswer(x){return String(x||'').toLowerCase().normalize('NFKC').replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[.?!,;:]/g,'').replace(/\s+/g,' ').trim();}
function tokensForOrder(q){return String(q.prompt.split(':').slice(1).join(':') || '').split('|').map(s=>s.trim()).filter(Boolean);}
function shuffled(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function printOptions(q){const a=q.options.slice(1);let n=Array.from(q.id||'').reduce((x,c)=>x+c.charCodeAt(0),0)%q.options.length;a.splice(n,0,q.answer);return a;}
function startQuiz(code, mode='lesson', questions=null){
 const d=codeDetails(code),p=profile();if(!d && mode==='lesson')return go('route');
 if(!quiz || quiz.code!==code || quiz.mode!==mode || questions){
   const items=questions || stageQuestionList(d,p.age);
   quiz={mode,code,items:items.map(x=>({...x})),index:0,correct:0,answers:[],done:false,optionOrder:Object.fromEntries(items.filter(x=>x.type==='choice').map(x=>[x.id,shuffled(x.options)]))};
 }
 orderPick=[];feedback=null;renderQuiz();
}
function restartQuiz(){if(!quiz)return;const d=codeDetails(quiz.code);const items=quiz.mode==='lesson'?stageQuestionList(d,profile().age):quiz.items;startQuiz(quiz.code,quiz.mode,items);}
function renderQuiz(){
 if(!quiz)return go('route');currentView=quiz.mode==='review'?'review':'quiz';
 if(quiz.done)return renderQuizEnd();
 const i=quiz.index, q=quiz.items[i], n=quiz.items.length, detail=codeDetails(quiz.code);
 const options=q.type==='choice'?(quiz.optionOrder[q.id]||q.options):[];
 let controls='';
 if(q.type==='choice')controls=`<div class="choice-list">${options.map((o,j)=>`<button class="answer-choice ${feedback?.response===o?'selected':''}" data-action="select" data-val="${safe(o)}" ${feedback?'disabled':''}><strong>${String(j+1).padStart(2,'0')}</strong> ${safe(o)}</button>`).join('')}</div>`;
 else if(q.type==='order'){
   const tokens=tokensForOrder(q);
   controls=`<p class="caption">Pulsa las palabras en el orden correcto. Si te equivocas, utiliza «Reiniciar orden».</p><div class="order-selected" aria-live="polite">${orderPick.map(j=>`<span class="word-choice">${safe(tokens[j])}</span>`).join('') || '<span class="muted">Tu frase aparecerá aquí…</span>'}</div><div class="word-order">${tokens.map((t,j)=>`<button class="word-choice" data-action="word" data-index="${j}" ${orderPick.includes(j)||feedback?'disabled':''}>${safe(t)}</button>`).join('')}</div><div class="btn-row"><button class="btn btn-outline btn-small" data-action="clearorder" ${feedback?'disabled':''}>Reiniciar orden</button><button class="btn btn-dark btn-small" data-action="check" ${feedback?'disabled':''}>Comprobar frase</button></div>`;
 } else controls=`<label class="label" for="quiz-input">Escribe en inglés:</label><input id="quiz-input" class="answer-text" autocomplete="off" autocapitalize="sentences" spellcheck="false" ${feedback?'disabled':''} placeholder="Tu respuesta..." aria-label="Tu respuesta en inglés"><div class="btn-row" style="margin-top:14px"><button class="btn btn-dark" data-action="check" ${feedback?'disabled':''}>Comprobar respuesta</button></div>`;
 const feedbackUI=feedback?`<div class="feedback ${feedback.ok?'good':'bad'}" role="status"><strong>${feedback.ok?'¡Bien construido!':'Vamos a corregir la estructura'}</strong><span class="answer" lang="en">${safe(q.answer)}</span><p>${feedback.ok?'Has reconocido la forma adecuada.':'Compárala con la tuya y fíjate en el orden y el verbo auxiliar.'}${q.transfer?' En respuestas abiertas puede haber otras expresiones válidas. Esta corrección es literal y orientativa.':''}</p></div>`:'';
 layout(`${crumb({text:'Mi ruta',href:'route'},{text:quiz.mode==='review'?'Repaso':'Nivel '+quiz.code,href:quiz.mode==='review'?'review':'lesson/'+quiz.code},{text:'Ejercicio '+(i+1)})}
 <div class="card quiz-card"><div class="quiz-top"><span class="eyebrow">${quiz.mode==='review'?'REPASO DE ESTRUCTURAS':quiz.mode==='challenge'?'RETO RELÁMPAGO':'ETAPA '+safe(quiz.code)+' · '+safe(STAGE_NAMES[detail.stage])}</span><span class="pill">${i+1} de ${n}</span></div><div class="progress"><span style="width:${Math.round(i/n*100)}%"></span></div><h2 style="margin-top:24px">${q.type==='order'?'Construye la frase':q.type==='choice'?'Escoge la forma correcta':'Escribe la estructura'}</h2><p class="question">${safe(q.prompt)}</p>${controls}${feedbackUI}<div class="quiz-actions"><button class="btn btn-ghost" data-action="quitquiz">Salir y volver al nivel</button>${feedback?`<button class="btn btn-primary" data-action="next">${i===n-1?'Ver resultado':'Siguiente pregunta →'}</button>`:`<span class="caption">Comprueba tu respuesta para avanzar.</span>`}</div></div>`);
 if(!feedback && q.type==='write')document.querySelector('#quiz-input')?.focus();
}
function answer(value){
 if(!quiz || feedback || quiz.done)return;
 const q=quiz.items[quiz.index],response=String(value||'').trim();
 if(!response){toast('Escribe o construye una respuesta antes de comprobar.');return;}
 const accepted=[q.answer,...(q.alternatives||[])].map(normalizeAnswer);
 const ok=accepted.includes(normalizeAnswer(response));
 feedback={ok,response};quiz.answers.push({id:q.id||'unknown',ok,answer:q.answer,given:response});if(ok)quiz.correct++;
 renderQuiz();
}
function sourceCodeForQuestion(id){for(let i=0;i<LESSONS.length;i++){const l=LESSONS[i];const j=l.q.findIndex(q=>q.id===id);if(j>=0)return toCode(i+1,j<3?0:j<6?1:2);for(const qs of Object.values(l.aged||{}))if(qs.some(q=>q.id===id))return toCode(i+1,2);}return profile().bookmark;}
function answerWrongRecords(){
 const p=profile();quiz.answers.forEach(a=>{
  if(a.id==='unknown')return;
  if(!a.ok){p.wrong[a.id]={next:today(),step:0,source:quiz.mode==='lesson'?quiz.code:sourceCodeForQuestion(a.id),answer:a.answer};}
  else if(quiz.mode==='review' && p.wrong[a.id]){
   const prev=p.wrong[a.id],steps=[1,3,7,14];const step=Math.min((prev.step||0)+1,4);
   if(step>=4)delete p.wrong[a.id]; else p.wrong[a.id]={...prev,step,next:dateAfter(steps[step-1])};
  }
 });
}
function quizFinish(){
 quiz.done=true;const p=profile(),total=quiz.items.length,rate=quiz.correct/total,passed=rate>=.75;
 answerWrongRecords();
 if(quiz.mode==='lesson'){
   const old=p.progress[quiz.code]||{};
   const passes=(old.attempts||0)+1;
   p.progress[quiz.code]={passed:Boolean(old.passed||passed),score:Math.max(old.score||0,quiz.correct),total,attempts:passes,updated:today()};
   const next=allCodes[allCodes.indexOf(quiz.code)+1];
   if(passed && next && p.bookmark===quiz.code)p.bookmark=next;
 }
 p.history.push({date:today(),code:quiz.code,correct:quiz.correct,total,mode:quiz.mode});
 p.history=p.history.slice(-400);save();renderQuizEnd();
}
function renderQuizEnd(){
 const q=quiz,p=profile(),pct=Math.round(q.correct/q.items.length*100),passed=pct>=75,next=allCodes[allCodes.indexOf(q.code)+1];
 const result=q.mode==='lesson'?(passed?'¡Etapa superada hoy!':'Buen entrenamiento: toca reforzar'):(passed?'¡Buen reto! Has recuperado lo aprendido':'Has encontrado estructuras para seguir entrenando');
 layout(`${crumb({text:'Ruta',href:'route'},{text:'Resultado'})}<div class="card" style="max-width:780px;margin:20px auto;text-align:center"><div class="eyebrow">${q.mode==='review'?'REPASO TERMINADO':q.mode==='challenge'?'RETO RELÁMPAGO':'RESULTADO '+safe(q.code)}</div><div class="score-circle">${q.correct}<small>/ ${q.items.length}</small></div><h1 style="font-size:2rem">${safe(result)}</h1><p>${passed?'Puedes avanzar, pero dominarlo de verdad exige recordarlo otros días y usarlo en contextos diferentes.':'No hace falta correr. Vuelve a mirar el ejemplo, comprueba dónde se rompió la frase y prueba otra vez.'}</p><div class="btn-row" style="justify-content:center"><button class="btn btn-outline" data-action="retry">Repetir ejercicios</button>${q.mode==='lesson'?btn('Ver la explicación','lesson/'+q.code,'btn-light'):btn('Elegir estructura','route','btn-light')}${q.mode==='lesson'&&passed&&next?btn('Ir al '+next,'lesson/'+next,'btn-primary'):btn('Mi ruta','route','btn-primary')}</div></div><div class="card" style="max-width:780px;margin:16px auto"><h2>Tu devolución</h2>${q.answers.map((a,i)=>`<p>${a.ok?'✓':'↻'} <strong>${i+1}.</strong> ${a.ok?'Correcto':'Revisar'} · Modelo: <span lang="en">${safe(a.answer)}</span></p>`).join('')}<div class="callout info">Se han marcado para repaso las respuestas que no coincidieron con el modelo. Los ejercicios escritos pueden admitir otras respuestas válidas: si ves una corrección demasiado estricta, consúltala con tu profesor.</div></div>`);
}
function lookupQuestion(id){for(const l of LESSONS){for(const q of l.q){if(q.id===id)return q;}for(const qs of Object.values(l.aged||{})){for(const q of qs){if(q.id===id)return q;}}}return null;}
function renderReview(){
 currentView='review';const p=profile(),records=Object.entries(p.wrong).filter(([id,r])=>lookupQuestion(id)&&r),due=records.filter(([id,r])=>r.next<=today());
 layout(`${crumb({text:'Inicio',href:'home'},{text:'Repetición'})}<div class="eyebrow">SIN PRISA · CON MEMORIA</div><h1>Repetir también es avanzar</h1><p>Guardamos las estructuras que no salieron y te las ofrecemos después. Repetir una respuesta correcta en varios días ayuda más que memorizarla en una sola sesión.</p>
 <div class="meta-grid"><div class="stat"><span class="value">${due.length}</span><span class="caption">Para repasar ahora</span></div><div class="stat"><span class="value">${records.length}</span><span class="caption">Elementos en seguimiento</span></div><div class="stat"><span class="value">${stat(p).passed}</span><span class="caption">Etapas superadas</span></div><div class="stat"><span class="value">${safe(p.bookmark)}</span><span class="caption">Marcador</span></div></div>
 <div class="two-col"><section class="card"><h2>Mis errores útiles</h2><p>${due.length?`Tienes ${due.length} estructuras preparadas para recordar hoy.`:'No hay repasos programados para hoy. Puedes practicar lo aprendido o avanzar a otra etapa.'}</p><div class="btn-row"><button class="btn btn-primary" data-action="review-start" data-scope="due" ${!due.length?'disabled':''}>Empezar repaso pendiente</button><button class="btn btn-outline" data-action="review-start" data-scope="all" ${!records.length?'disabled':''}>Repasar todos</button></div></section><section class="card"><h3>Cómo funciona la repetición</h3><p>Si fallas, la pregunta vuelve al repaso. Si aciertas, el intervalo aumenta progresivamente. Lo que se busca es recuperación autónoma, no una racha de clics.</p>${btn('Ver ruta de niveles','route','btn-light')}</section></div>
 ${records.length?`<div class="section-title"><h2>Tu lista de repaso</h2></div><div class="lesson-list">${records.slice(0,40).map(([id,r])=>`<div class="card row-between"><div><strong>${safe(r.source)}</strong> · ${safe(lookupQuestion(id)?.prompt||'')}<p class="caption">Próxima práctica: ${safe(r.next)}</p></div><span class="pill">${r.next<=today()?'Disponible':'Programado'}</span></div>`).join('')}</div>`:''}`);
}
function renderResources(){
 currentView='resources';const p=profile();
 layout(`${crumb({text:'Inicio',href:'home'},{text:'Recursos'})}<div class="eyebrow">CUADERNO + VOZ + VÍDEOS</div><h1>Material para aprender fuera de la pantalla</h1><p>Cada ficha se puede imprimir o guardar como PDF desde el navegador. Escucha y repite con la voz del dispositivo; los enlaces externos llevan a materiales de terceros.</p>
 <div class="cards-3"><article class="card action-card"><h3>Fichas por etapa</h3><p>Explicación, vocabulario y ejercicios para escribir a mano.</p>${btn('Elegir etapa','route','btn-primary')}</article><article class="card action-card"><h3>Cuaderno completo</h3><p>20 fichas de las lecciones disponibles, listas para guardar como PDF o imprimir.</p><button class="btn btn-primary" data-action="print-all">Imprimir el cuaderno</button></article><article class="card action-card"><h3>Solucionario</h3><p>Modelos para que un docente o la familia revise el trabajo autónomo.</p><button class="btn btn-outline" data-action="print-solutions">Imprimir respuestas</button></article></div>
 <div class="section-title"><h2>Descargas PDF listas para imprimir</h2></div><div class="cards-3"><article class="card"><h3>Cuaderno · 20 bloques</h3><p>Veinte fichas A4. Ejercicios con espacio para responder.</p><a class="btn btn-outline" href="materiales/Teseracto_English_Cuaderno_20_bloques.pdf" download>Descargar cuaderno PDF</a></article><article class="card"><h3>Solucionario</h3><p>Respuestas modelo para revisar el trabajo.</p><a class="btn btn-outline" href="materiales/Teseracto_English_Solucionario_20_bloques.pdf" download>Descargar respuestas PDF</a></article><article class="card"><h3>Mapa de niveles</h3><p>La ruta actual y lo previsto hasta la etapa 100.</p><a class="btn btn-outline" href="materiales/Teseracto_English_Mapa_de_niveles.pdf" download>Descargar mapa PDF</a></article></div><div class="section-title"><h2>Biblioteca para ${safe(AGE_LABELS[p.age].toLowerCase())}</h2></div><div class="cards-3"><div class="card"><h3>British Council · vídeos y gramática</h3><p>Para reforzar estructuras con materiales preparados para distintas edades.</p><a href="${p.age==='kids'?'https://learnenglishkids.britishcouncil.org/grammar-vocabulary/grammar-videos':p.age==='teens'?'https://learnenglishteens.britishcouncil.org/grammar':'https://learnenglish.britishcouncil.org/free-resources/grammar'}" target="_blank" rel="noopener noreferrer">Abrir recurso ↗</a></div><div class="card"><h3>British Council · escucha</h3><p>Escuchar, observar el contexto y responder preguntas sobre lo que oyes.</p><a href="${p.age==='kids'?'https://learnenglishkids.britishcouncil.org/listen-watch':'https://learnenglishteens.britishcouncil.org/skills/listening'}" target="_blank" rel="noopener noreferrer">Practicar listening ↗</a></div><div class="card"><h3>BBC Learning English</h3><p>Audios y vídeos breves; útil cuando ya puedes comprender ideas completas en contexto.</p><a href="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english" target="_blank" rel="noopener noreferrer">6 Minute English ↗</a></div></div>
 <div class="card" style="margin-top:25px"><h3>Cómo usar una canción o un vídeo</h3><p>Escucha una vez sin detenerlo. Escucha de nuevo para reconocer al menos tres estructuras que ya hayas estudiado. Escribe dos frases propias con esas estructuras y léelas en voz alta. No hace falta aprender palabras que no vas a utilizar.</p><p class="caption">No descargamos ni reproducimos música comercial dentro de la web; enlazamos a materiales alojados por sus titulares.</p></div>`);
}
function renderProfiles(){
 currentView='profiles';const p=profile();
 layout(`${crumb({text:'Inicio',href:'home'},{text:'Perfiles'})}<div class="eyebrow">PROGRESO EN ESTE NAVEGADOR</div><h1>Elige cómo quieres aprender</h1><p>No necesitas una cuenta. Puedes usar un alias, elegir la edad de los ejemplos y guardar el código de nivel en tu cuaderno.</p><section class="card"><h2>Perfil actual: ${safe(p.name)}</h2><form data-form="rename" class="form-narrow"><label class="label" for="profile-name">Nombre o alias (opcional)</label><div class="btn-row"><input id="profile-name" class="field" name="name" maxlength="40" value="${safe(p.name)}"><button class="btn btn-dark" type="submit">Guardar alias</button></div></form><h3 style="margin-top:22px">¿Qué ejemplos quieres recibir?</h3><div class="profile-grid">${Object.keys(AGE_LABELS).map(a=>`<button class="age-card" aria-pressed="${p.age===a?'true':'false'}" data-action="age" data-age="${a}"><strong>${AGE_LABELS[a]}</strong><small>${a==='kids'?'Colegio, juegos, casa y amistades.':a==='teens'?'Instituto, aficiones, planes y vida social.':'Trabajo, gestiones, viajes y conversaciones cotidianas.'}</small></button>`).join('')}</div><p class="caption" style="margin-top:10px">La secuencia gramatical es la misma para las tres edades. La opción no representa un nivel oficial de inglés.</p></section>
 <div class="section-title"><h2>Mis recorridos en este dispositivo</h2></div><div class="profile-grid">${state.profiles.map(x=>`<div class="card profile-card"><div class="pill">${safe(AGE_LABELS[x.age])}</div><h3>${safe(x.name)}</h3><p>${stat(x).passed} etapas superadas · ${safe(x.bookmark)}</p><button class="btn ${x.id===p.id?'btn-dark':'btn-outline'} btn-small" data-action="profile" data-id="${safe(x.id)}" ${x.id===p.id?'disabled':''}>${x.id===p.id?'Recorrido activo':'Cambiar a este'}</button></div>`).join('')}</div><form data-form="newprofile" class="btn-row" style="margin-top:18px"><input class="field" name="name" maxlength="40" placeholder="Nuevo alias (ej. Alumno 2)" required><button class="btn btn-outline" ${state.profiles.length>=12?'disabled':''} type="submit">Crear otro recorrido</button></form>
 <div class="section-title"><h2>Copias de seguridad</h2></div><div class="card"><p>Guarda una copia JSON en tu equipo o móvil. Puedes importarla al cambiar de navegador. <strong>Sin esta copia, borrar los datos del navegador puede hacerte perder el progreso.</strong></p><div class="btn-row"><button class="btn btn-primary" data-action="export">Exportar JSON</button><button class="btn btn-outline" data-action="import">Importar JSON</button></div><p class="caption">No se sube ningún dato a un servidor de Teseracto. Mantén el archivo JSON en privado si has incluido alias de menores.</p></div>`);
}
function renderTeacher(){
 currentView='teacher';const p=profile(),s=stat(p),hist=p.history.slice(-15).reverse();
 layout(`${crumb({text:'Inicio',href:'home'},{text:'Docente'})}<div class="eyebrow">MAER · SEGUIMIENTO ORIENTATIVO</div><h1>Lo que se observa, lo que se trabaja y lo que sigue</h1><p>Resumen para trabajar con el alumno. Esta herramienta usa algunas ideas operativas de MAER, que todavía están en valoración; no constituye un diagnóstico ni una certificación.</p><div class="teacher-grid"><div class="card"><h2>Ficha breve de sesión</h2><p><strong>Recorrido:</strong> ${safe(p.name)} · ${safe(AGE_LABELS[p.age])}</p><p><strong>Etapas superadas:</strong> ${s.passed} · <strong>Marcador:</strong> ${safe(p.bookmark)}</p><p><strong>Errores en repaso:</strong> ${s.totalWrong}</p><label for="teacher-note" class="label">Diana trabajada · evidencia observada · decisión siguiente</label><textarea id="teacher-note" class="field" rows="5" maxlength="800" style="width:100%;resize:vertical">${safe(p.note)}</textarea><div class="btn-row" style="margin-top:13px"><button class="btn btn-dark" data-action="save-note">Guardar nota en este dispositivo</button><button class="btn btn-outline" data-action="export">Exportar datos</button></div><div class="teacher-warning">Las puntuaciones de ejercicios son indicios de práctica, no pruebas concluyentes de competencia. Confirma oralmente y en días distintos antes de considerar una estructura consolidada.</div></div><div class="card"><h2>Actividad reciente</h2>${hist.length?`<div class="lesson-list">${hist.map(x=>`<div class="row-between"><span>${safe(x.date)} · ${safe(x.code)} ${x.mode==='review'?'(repaso)':''}</span><strong>${x.correct}/${x.total}</strong></div>`).join('')}</div>`:'<p>Cuando completes una etapa aparecerán aquí los intentos.'}</div></div>`);
}
function printDoc(details,solutions=false){
 const p=profile();return `${details.map((d,i)=>{
  const l=d.lesson,qs=d.stage===null?[...l.q,...(l.aged[p.age]||[])]:stageQuestionList(d,p.age);
  return `<div class="${i?'page-break':''}"><div class="p-head"><strong>ACADEMIA TESERACTO · ENGLISH</strong><small>${safe(d.stage===null?String(d.index+1).padStart(3,'0'):d.code)} · ${safe(AGE_LABELS[p.age])}</small></div><h1>${safe(l.title)}</h1><p><strong>Objetivo:</strong> ${safe(l.goal)}</p><h2>La estructura</h2>${l.formula.map(([t,ex])=>`<p>${safe(t)} <strong lang="en">${safe(ex)}</strong></p>`).join('')}<p>${safe(l.rule)}</p><h2>Palabras que sí vas a usar</h2><div class="p-vocab">${l.words.map(([en,es])=>`<span>${safe(en)} — ${safe(es)}</span>`).join('')}</div><h2>${solutions?'Soluciones modelo':'Practica en papel'}</h2><ol>${qs.map(q=>`<li><span>${safe(q.prompt)}</span>${q.type==='choice'?`<p class="print-muted">${printOptions(q).map(safe).join(' / ')}</p>`:''}${solutions?`<p class="print-sol"><strong>${safe(q.answer)}</strong></p>`:'<span class="line"></span><span class="line"></span>'}</li>`).join('')}</ol>${solutions?'<p class="print-muted">Las respuestas abiertas pueden admitir expresiones equivalentes.</p>':'<p>Repasa en voz alta dos frases. Explica con tus palabras qué cambia entre una pregunta y una afirmación.</p>'}<p class="print-muted">Teseracto English · Material original · Guárdalo como PDF desde «Imprimir» · ${safe(d.code||'Bloque '+(d.index+1))}</p></div>`;
 }).join('')}`;
}
function printLevels(type,code){
 let ds=[];
 if(type==='one'){const d=codeDetails(code);if(!d)return;ds=[d];}
 else ds=LESSONS.map((lesson,index)=>({lesson,index,stage:null,code:String(index+1).padStart(3,'0')}));
 const root=document.querySelector('#printRoot');root.innerHTML=printDoc(ds,type==='solutions');root.setAttribute('aria-hidden','false');
 requestAnimationFrame(()=>setTimeout(()=>window.print(),140));
}
window.addEventListener('afterprint',()=>{const r=document.querySelector('#printRoot');r.innerHTML='';r.setAttribute('aria-hidden','true');});
function exportData(){
 const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`teseracto-english-progreso-${today()}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);toast('Copia JSON preparada para guardar.');
}
function validateImport(x){
 if(!x || x.version!==1 || !Array.isArray(x.profiles) || !x.profiles.length || x.profiles.length>12)throw Error('Este archivo no tiene el formato esperado.');
 if(x.profiles.some(p=>!p || typeof p.id!=='string' || typeof p.name!=='string' || !AGE_LABELS[p.age] || !p.progress || !p.wrong))throw Error('La copia no es válida.');
 return {version:1,profiles:x.profiles.map(p=>({id:p.id.slice(0,80),name:p.name.slice(0,40),age:p.age,progress:Object.fromEntries(Object.entries(p.progress).filter(([k])=>codeDetails(k))),wrong:Object.fromEntries(Object.entries(p.wrong).filter(([id])=>lookupQuestion(id))),history:Array.isArray(p.history)?p.history.slice(-400):[],bookmark:codeDetails(p.bookmark)?p.bookmark:'001A',note:String(p.note||'').slice(0,800)})),active:x.active};
}
fileImport.addEventListener('change',async()=>{
 const f=fileImport.files[0];if(!f)return;
 try{if(f.size>500000)throw Error('El JSON es demasiado grande.');const imported=validateImport(JSON.parse(await f.text()));
  if(!confirm('Importar sustituirá los recorridos actuales en este navegador. ¿Continuar?'))return;
  state=imported;state.active=state.profiles.some(p=>p.id===state.active)?state.active:state.profiles[0].id;save();toast('Recorridos importados.');go('home');
 }catch(e){toast(e.message||'No se puede importar el archivo.');}finally{fileImport.value='';}
});
function handleAction(event){
 const b=event.target.closest('[data-action]');if(!b || b.disabled)return;
 const act=b.dataset.action;
 if(act==='go'){go(b.dataset.view);return;}
 if(act==='age'){profile().age=b.dataset.age;save();render();toast('Ejemplos adaptados.');return;}
 if(act==='profile'){state.active=b.dataset.id;save();go('home');return;}
 if(act==='speak'||act==='slow'){
  if(!('speechSynthesis' in window)){toast('Este navegador no dispone de lectura por voz.');return;}
  speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(b.dataset.text||'');u.lang='en-GB';u.rate=act==='slow'?.68:.87;
  const voices=speechSynthesis.getVoices();u.voice=voices.find(v=>v.lang.toLowerCase().startsWith('en-gb')) || voices.find(v=>v.lang.toLowerCase().startsWith('en'))||null;speechSynthesis.speak(u);return;
 }
 if(act==='select'){answer(b.dataset.val);return;}
 if(act==='word'){orderPick.push(Number(b.dataset.index));renderQuiz();return;}
 if(act==='clearorder'){orderPick=[];renderQuiz();return;}
 if(act==='check'){
  const q=quiz?.items[quiz.index];if(!q)return;
  answer(q.type==='order'?orderPick.map(i=>tokensForOrder(q)[i]).join(' '):document.querySelector('#quiz-input')?.value||'');return;
 }
 if(act==='next'){if(!feedback)return;quiz.index++;orderPick=[];feedback=null;if(quiz.index>=quiz.items.length)quizFinish();else renderQuiz();return;}
 if(act==='quitquiz'){const dest=quiz?.mode==='review'?'review':'lesson/'+quiz.code;quiz=null;feedback=null;go(dest);return;}
 if(act==='retry'){restartQuiz();return;}
 if(act==='challenge-start'){
  const p=profile(),codes=allCodes.filter(c=>p.progress[c]?.passed);if(!codes.length)codes.push('001A','001B','001C');
  const pool=codes.flatMap(c=>{const d=codeDetails(c);return stageQuestionList(d,p.age)});
  const shuffled=[...pool].sort(()=>Math.random()-.5).slice(0,8);startQuiz(p.bookmark,'challenge',shuffled);return;
 }
 if(act==='review-start'){
  const q=Object.entries(profile().wrong).filter(([id,r])=>lookupQuestion(id)&& (b.dataset.scope==='all'||r.next<=today())).slice(0,14).map(([id])=>lookupQuestion(id));
  if(!q.length)return toast('No hay preguntas pendientes.');
  startQuiz(profile().bookmark,'review',q.sort(()=>Math.random()-.5));return;
 }
 if(act==='print'){printLevels('one',b.dataset.code);return;}
 if(act==='print-all'){printLevels('all');return;}
 if(act==='print-solutions'){printLevels('solutions');return;}
 if(act==='export'){exportData();return;}
 if(act==='import'){fileImport.click();return;}
 if(act==='save-note'){profile().note=document.querySelector('#teacher-note')?.value||'';save();toast('Registro de sesión guardado en este dispositivo.');return;}
}
document.addEventListener('click',handleAction);
document.addEventListener('submit',event=>{
 const form=event.target.closest('form[data-form]');if(!form)return;event.preventDefault();
 const type=form.dataset.form,fd=new FormData(form),p=profile();
 if(type==='jump'){const d=codeDetails(String(fd.get('code')).toUpperCase());if(!d)return toast('Ese código no está publicado todavía. Prueba 001A–020C.');go('lesson/'+d.code);}
 if(type==='rename'){const name=String(fd.get('name')||'').trim();if(!name)return toast('Escribe un alias.');p.name=name.slice(0,40);save();render();}
 if(type==='newprofile'){
  if(state.profiles.length>=12)return toast('Máximo de 12 recorridos en este dispositivo.');
  const name=String(fd.get('name')||'').trim();if(!name)return;
  const id='p'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);const n={...defaultProfile(),id,name:name.slice(0,40),age:p.age};state.profiles.push(n);state.active=id;save();go('home');
 }
});
document.addEventListener('keydown',event=>{
 if(event.key==='Enter' && event.target.id==='quiz-input'){event.preventDefault();answer(event.target.value);}
});
function render(){
 const hash=decodeURIComponent(location.hash.slice(1)||'home');const [view,code]=hash.split('/');
 if(view==='home')renderHome();else if(view==='route')renderRoute();else if(view==='lesson')renderLesson(String(code||'').toUpperCase());
 else if(view==='quiz'){
   const c=String(code||'').toUpperCase();
   if(!quiz||quiz.code!==c||quiz.mode!=='lesson')startQuiz(c);
   else renderQuiz();
 }else if(view==='review'){if(quiz?.mode==='review'&&!quiz.done){renderQuiz();}else renderReview();}
 else if(view==='resources')renderResources();else if(view==='profiles')renderProfiles();else if(view==='teacher')renderTeacher();else renderHome();
}
window.addEventListener('hashchange',()=>{quiz=null;feedback=null;render();window.scrollTo({top:0,behavior:'instant'});});
render();
})();
