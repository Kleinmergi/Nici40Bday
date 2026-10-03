import { AUDIO_UPLOADS } from './media-config.js';
const list=document.querySelector('#audioList');
const dbOpen=()=>new Promise((resolve,reject)=>{const r=indexedDB.open('nici40-media',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('audio'))r.result.createObjectStore('audio')};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
const localGet=async key=>{const db=await dbOpen();return new Promise((resolve,reject)=>{const r=db.transaction('audio','readonly').objectStore('audio').get(key);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})};
const localPut=async(key,file)=>{const db=await dbOpen();return new Promise((resolve,reject)=>{const r=db.transaction('audio','readwrite').objectStore('audio').put(file,key);r.onsuccess=resolve;r.onerror=()=>reject(r.error)})};
const localDel=async key=>{const db=await dbOpen();return new Promise((resolve,reject)=>{const r=db.transaction('audio','readwrite').objectStore('audio').delete(key);r.onsuccess=resolve;r.onerror=()=>reject(r.error)})};
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ');
function jsonTemplate(){return{format:'nici40-audio-map',version:1,files:Object.fromEntries(AUDIO_UPLOADS.map(x=>[x.key,x.key+' - '+x.label+'.mp3']))}}
function downloadJson(){const blob=new Blob([JSON.stringify(jsonTemplate(),null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='nici40-audio.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
async function importFolder(fileList){
 const files=[...fileList],audio=files.filter(f=>/\.(mp3|webm|ogg|opus|wav|m4a|aac|mp4)$/i.test(f.name));let map={};
 const jf=files.find(f=>f.name.toLowerCase()==='nici40-audio.json');
 if(jf){try{const j=JSON.parse(await jf.text());map=j.files||j.audio||j}catch(e){throw new Error('nici40-audio.json ist ungültig: '+e.message)}}
 const used=new Set(),found=[],missing=[];
 for(const x of AUDIO_UPLOADS){
  let f=null,target=map[x.key];
  if(typeof target==='object')target=target.file||target.filename||target.name;
  if(target)f=audio.find(a=>a.name===target||a.webkitRelativePath?.endsWith('/'+target));
  if(!f){const key=norm(x.key);f=audio.find(a=>norm(a.name).includes(key))}
  if(!f){const words=norm(x.label).split(' ').filter(w=>w.length>2);f=audio.find(a=>{const n=norm(a.name);return words.length>=2&&words.slice(0,3).filter(w=>n.includes(w)).length>=2})}
  if(f){await localPut(x.key,f);used.add(f);found.push(x.key)}else missing.push(x.key)
 }
 const box=document.querySelector('#folderResult');box.innerHTML=`<span><b>${found.length}/${AUDIO_UPLOADS.length} Audios zugeordnet ✓</b></span>${missing.length?`<span>Fehlen: <b>${missing.join(', ')}</b></span>`:'<span>Alle vorgesehenen Audios gefunden.</span>'}${audio.filter(f=>!used.has(f)).length?`<span>Nicht zugeordnet: ${audio.filter(f=>!used.has(f)).map(f=>f.name).join(', ')}</span>`:''}`;
 await render();
}
async function render(){
 list.innerHTML='';
 for(const [i,x] of AUDIO_UPLOADS.entries()){
  const local=await localGet(x.key),has=!!local;
  const row=document.createElement('div');row.className='uploadRow';
  row.innerHTML=`<div class="uploadMeta"><b>${String(i+1).padStart(2,'0')} · ${x.era}</b><strong>${x.label}</strong><small>${x.kind==='background'?'Hintergrund: ':'Frage: '}${x.question}</small></div><div class="uploadActions"><span class="uploadStatus ${has?'ok':''}">${has?'✓ LOKAL · '+local.name:'FEHLT'}</span><label class="uploadBtn">${has?'ERSETZEN':'DATEI WÄHLEN'}<input type="file" hidden></label>${has?'<button class="testAudio">▶ TEST</button><button class="deleteAudio">LÖSCHEN</button>':''}</div>`;
  const inp=row.querySelector('input');inp.onchange=async()=>{const file=inp.files?.[0];if(!file)return;await localPut(x.key,file);render()};
  row.querySelector('.testAudio')?.addEventListener('click',async()=>{const file=await localGet(x.key);if(!file)return;const u=URL.createObjectURL(file),a=new Audio(u);a.play();setTimeout(()=>{a.pause();URL.revokeObjectURL(u)},10000)});
  row.querySelector('.deleteAudio')?.addEventListener('click',async()=>{await localDel(x.key);render()});list.appendChild(row);
 }}
async function checkAi(){const box=document.querySelector('#aiStatus'),details=document.querySelector('#aiStatusDetails'),btn=document.querySelector('#recheckAi');box.className='aiStatus checking';box.innerHTML='<span class="aiDot"></span><div><strong>OPENAI WIRD GEPRÜFT …</strong><small>API-Key, Modell und Testaufruf</small></div>';details.textContent='';btn.disabled=true;try{const r=await fetch('/api/ai-status',{cache:'no-store'});const x=await r.json().catch(()=>({ok:false,error:'Ungültige Serverantwort'}));if(r.ok&&x.ok){box.className='aiStatus online';box.innerHTML='<span class="aiDot"></span><div><strong>OPENAI CONNECTED</strong><small>KI-Antwortprüfung ist einsatzbereit</small></div>';details.innerHTML=`<span>API-Key vorhanden ✓</span><span>Modell: <b>${x.model}</b></span><span>Testaufruf erfolgreich ✓</span><span>Antwortzeit: <b>${x.latencyMs} ms</b></span>`}else{box.className='aiStatus offline';box.innerHTML='<span class="aiDot"></span><div><strong>OPENAI OFFLINE</strong><small>KI-Prüfung ist derzeit nicht verfügbar</small></div>';details.innerHTML=`<span>Fehler: <b>${x.error||`HTTP ${r.status}`}</b></span>`}}catch(e){box.className='aiStatus offline';box.innerHTML='<span class="aiDot"></span><div><strong>OPENAI OFFLINE</strong><small>Status-Endpunkt nicht erreichbar</small></div>';details.innerHTML=`<span>Fehler: <b>${e.message}</b></span>`}finally{btn.disabled=false}}
document.querySelector('#folderPick').onclick=()=>document.querySelector('#folderInput').click();
document.querySelector('#folderInput').onchange=async e=>{try{await importFolder(e.target.files)}catch(err){alert(err.message)}};
document.querySelector('#exportMap').onclick=downloadJson;
document.querySelector('#clearAll').onclick=async()=>{if(!confirm('Alle lokal gespeicherten Audio-Zuordnungen löschen?'))return;const db=await dbOpen();await new Promise((resolve,reject)=>{const r=db.transaction('audio','readwrite').objectStore('audio').clear();r.onsuccess=resolve;r.onerror=()=>reject(r.error)});document.querySelector('#folderResult').textContent='';render()};
document.querySelector('#recheckAi').onclick=checkAi;render();checkAi();
