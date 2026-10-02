import { AUDIO_UPLOADS } from './media-config.js';
const list=document.querySelector('#audioList');let serverAudio={};
const dbOpen=()=>new Promise((resolve,reject)=>{const r=indexedDB.open('nici40-media',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('audio'))r.result.createObjectStore('audio')};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
const localGet=async key=>{const db=await dbOpen();return new Promise((resolve,reject)=>{const r=db.transaction('audio','readonly').objectStore('audio').get(key);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})};
const localPut=async(key,file)=>{const db=await dbOpen();return new Promise((resolve,reject)=>{const r=db.transaction('audio','readwrite').objectStore('audio').put(file,key);r.onsuccess=resolve;r.onerror=()=>reject(r.error)})};
const localDel=async key=>{const db=await dbOpen();return new Promise((resolve,reject)=>{const r=db.transaction('audio','readwrite').objectStore('audio').delete(key);r.onsuccess=resolve;r.onerror=()=>reject(r.error)})};
async function refreshServer(){try{const r=await fetch('/api/audio-library',{cache:'no-store'});const x=await r.json();serverAudio=x.audio||{}}catch{serverAudio={}}}
async function removeServer(key){const r=await fetch('/api/audio-library?key='+encodeURIComponent(key),{method:'DELETE'});if(!r.ok)throw new Error((await r.json().catch(()=>({}))).error||'Löschen fehlgeschlagen')}
async function uploadFile(key,file,status){
 status.textContent='UPLOAD …';status.classList.add('ok');
 const r=await fetch('/api/audio-upload?key='+encodeURIComponent(key),{method:'POST',headers:{'Content-Type':file.type||'application/octet-stream','X-File-Name':encodeURIComponent(file.name||'audio')},body:file});
 const x=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(x.error||('HTTP '+r.status));
 return x;
}
async function render(){
 await refreshServer();list.innerHTML='';
 for(const [i,x] of AUDIO_UPLOADS.entries()){
  const remote=serverAudio[x.key],local=await localGet(x.key),has=!!remote||!!local,where=remote?'☁ SERVER':local?'📱 NUR DIESES GERÄT':'FEHLT';
  const row=document.createElement('div');row.className='uploadRow';
  row.innerHTML=`<div class="uploadMeta"><b>${String(i+1).padStart(2,'0')} · ${x.era}</b><strong>${x.label}</strong><small>${x.kind==='background'?'Hintergrund: ':'Frage: '}${x.question}</small></div><div class="uploadActions"><span class="uploadStatus ${has?'ok':''}">${has?'✓ '+where:where}</span>${local&&!remote?'<button class="uploadLocal">☁ LOKALE DATEI HOCHLADEN</button>':''}<label class="uploadBtn">${remote?'ERSETZEN':'NEUE DATEI WÄHLEN'}<input type="file" hidden></label>${has?'<button class="testAudio">▶ TEST</button>':''}${remote?'<button class="deleteAudio">SERVER LÖSCHEN</button>':''}</div>`;
  const status=row.querySelector('.uploadStatus');
  const inp=row.querySelector('input');inp.onchange=async()=>{const file=inp.files?.[0];if(!file)return;try{await localPut(x.key,file);await uploadFile(x.key,file,status);await render()}catch(e){status.textContent='FEHLER';alert('Upload fehlgeschlagen: '+e.message)}};
  row.querySelector('.uploadLocal')?.addEventListener('click',async()=>{const file=await localGet(x.key);if(!file)return;try{await uploadFile(x.key,file,status);await render()}catch(e){status.textContent='FEHLER';alert('Upload fehlgeschlagen: '+e.message)}});
  row.querySelector('.testAudio')?.addEventListener('click',async()=>{let src=remote?.url,objectUrl=null;if(!src&&local){objectUrl=URL.createObjectURL(local);src=objectUrl}if(!src)return;const a=new Audio(src);a.play();setTimeout(()=>{a.pause();if(objectUrl)URL.revokeObjectURL(objectUrl)},10000)});
  row.querySelector('.deleteAudio')?.addEventListener('click',async()=>{if(!confirm('Diese Audio-Datei wirklich vom Server löschen?'))return;await removeServer(x.key);await localDel(x.key);render()});list.appendChild(row);
 }}
async function checkAi(){const box=document.querySelector('#aiStatus'),details=document.querySelector('#aiStatusDetails'),btn=document.querySelector('#recheckAi');box.className='aiStatus checking';box.innerHTML='<span class="aiDot"></span><div><strong>OPENAI WIRD GEPRÜFT …</strong><small>API-Key, Modell und Testaufruf</small></div>';details.textContent='';btn.disabled=true;try{const r=await fetch('/api/ai-status',{cache:'no-store'});const x=await r.json().catch(()=>({ok:false,error:'Ungültige Serverantwort'}));if(r.ok&&x.ok){box.className='aiStatus online';box.innerHTML='<span class="aiDot"></span><div><strong>OPENAI CONNECTED</strong><small>KI-Antwortprüfung ist einsatzbereit</small></div>';details.innerHTML=`<span>API-Key vorhanden ✓</span><span>Modell: <b>${x.model}</b></span><span>Testaufruf erfolgreich ✓</span><span>Antwortzeit: <b>${x.latencyMs} ms</b></span>`}else{box.className='aiStatus offline';box.innerHTML='<span class="aiDot"></span><div><strong>OPENAI OFFLINE</strong><small>KI-Prüfung ist derzeit nicht verfügbar</small></div>';details.innerHTML=`<span>Fehler: <b>${x.error||`HTTP ${r.status}`}</b></span>`}}catch(e){box.className='aiStatus offline';box.innerHTML='<span class="aiDot"></span><div><strong>OPENAI OFFLINE</strong><small>Status-Endpunkt nicht erreichbar</small></div>';details.innerHTML=`<span>Fehler: <b>${e.message}</b></span>`}finally{btn.disabled=false}}
document.querySelector('#clearAll').onclick=async()=>{if(!confirm('Alle zentral gespeicherten Audios vom Server löschen?'))return;await refreshServer();for(const key of Object.keys(serverAudio))await removeServer(key);const db=await dbOpen();await new Promise((resolve,reject)=>{const r=db.transaction('audio','readwrite').objectStore('audio').clear();r.onsuccess=resolve;r.onerror=()=>reject(r.error)});render()};
document.querySelector('#recheckAi').onclick=checkAi;render();checkAi();
