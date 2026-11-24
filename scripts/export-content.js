/* Reexporta data/lessons.js a JSON para los PDF: node scripts/export-content.js */
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
global.window=global;
require(path.join(root,'data','lessons.js'));
if(!Array.isArray(global.TESERACTO_LESSONS))throw Error('No hay lecciones que exportar.');
fs.writeFileSync(path.join(root,'data','lessons-export.json'),JSON.stringify(global.TESERACTO_LESSONS,null,2)+'\n','utf8');
console.log(`${global.TESERACTO_LESSONS.length} bloques exportados.`);
