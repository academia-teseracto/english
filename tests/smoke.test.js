const fs=require('fs'),vm=require('vm');
const files=require('path').resolve(__dirname,'..');
const tags={};const handlers={};
function el(key){if(!tags[key])tags[key]={innerHTML:'',textContent:'',value:'',classList:{toggle(){},add(){},remove(){}},setAttribute(){},getAttribute(){},click(){},addEventListener(type,fn){handlers[key+type]=fn;}};return tags[key];}
const document={querySelector:el,querySelectorAll:()=>[],addEventListener:(k,f)=>{handlers[k]=f;},body:{className:'',append(){}},createElement:()=>({click(){},remove(){}})};
const window={addEventListener:(k,f)=>{handlers['win_'+k]=f;},scrollTo(){},TESERACTO_LESSONS:[],speechSynthesis:{}};
const mem=new Map(),localStorage={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,v)};
const location={hash:'#home'};
const ctx={window,document,localStorage,location,console,setTimeout,clearTimeout,confirm:()=>true,Date,FormData,Blob,URL,requestAnimationFrame:fn=>fn(),speechSynthesis:window.speechSynthesis};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(files+'/data/lessons.js','utf8'),ctx);
vm.runInContext(fs.readFileSync(files+'/app.js','utf8'),ctx);
const get=()=>tags['#app'].innerHTML;
function click(action,data={}){handlers.click({target:{closest:()=>({dataset:{action,...data},disabled:false})}})}
const assert=(expr,msg)=>{if(!expr)throw Error('FAIL: '+msg);console.log('PASS:',msg)};
assert(get().includes('Una pieza nueva'),'Home renders');
click('go',{view:'route'});assert(get().includes('020C'),'Route renders 60 levels');
click('go',{view:'lesson/001A'});assert(get().includes('I am · You are'),'Lesson explanation');
click('go',{view:'quiz/001A'});assert(get().includes('Elige: «I ___ ready»'),'Quiz ready');
for(const answer of ['am','are','is']){click('select',{val:answer});assert(get().includes('¡Bien construido!'),'Feedback for '+answer);click('next')}
assert(get().includes('Etapa superada hoy'),'Quiz result');
assert(JSON.parse(mem.values().next().value).profiles[0].progress['001A'].passed,'Progress saved');
click('go',{view:'home'});assert(get().includes('001B'),'Next stage changed');
click('go',{view:'resources'});assert(get().includes('Cuaderno completo'),'PDF materials');
click('go',{view:'profiles'});assert(get().includes('Elige cómo quieres aprender'),'Age selection');
click('age',{age:'kids'});assert(get().includes('Niños'),'Age saved');
click('go',{view:'teacher'});assert(get().includes('Ficha breve de sesión'),'Teacher view');
click('go',{view:'home'});click('challenge-start');assert(get().includes('RETO RELÁMPAGO'),'Challenge generates');
console.log('Test suite completed.');
