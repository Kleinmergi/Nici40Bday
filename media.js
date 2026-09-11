import { MEDIA } from './media-config.js';
const seen=new WeakSet();
let activeAudio=null;
const dbOpen=()=>new Promise((resolve,reject)=>{const r=indexedDB.open('nici40-media',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('audio'))r.result.createObjectStore('audio')};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
async function getAudio(key){try{const db=await dbOpen();return await new Promise((resolve,reject)=>{const tx=db.transaction('audio','readonly');const r=tx.objectStore('audio').get(key);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}catch{return null}}
function stopAudio(){if(activeAudio){activeAudio.pause();if(activeAudio.dataset.objectUrl)URL.revokeObjectURL(activeAudio.dataset.objectUrl);activeAudio=null}}
async function enhance(){
 const root=document.querySelector('#hostQuestion'); if(!root)return;
 const q=root.querySelector('.question'); if(!q){stopAudio();return}
 const cfg=MEDIA[q.textContent.trim()]; if(!cfg)return;
 const eyebrow=root.querySelector('.eyebrow'); if(eyebrow&&!eyebrow.querySelector('.catBadge'))eyebrow.insertAdjacentHTML('beforeend',` <span class="catBadge">${cfg.cat||'POP'}</span>`);
 if(seen.has(q))return; seen.add(q); stopAudio();
 if(cfg.img){const f=document.createElement('figure');f.className='questionMedia';f.innerHTML=`<img src="${cfg.img}" alt="${cfg.alt||''}" loading="eager"><figcaption>${cfg.credit||''}</figcaption>`;q.after(f)}
 if(cfg.audioKey){const blob=await getAudio(cfg.audioKey);if(blob&&document.body.contains(q)){const a=new Audio();a.src=URL.createObjectURL(blob);a.dataset.objectUrl=a.src;a.preload='auto';a.volume=.9;a.loop=false;a.className='hostBackgroundAudio';activeAudio=a;try{await a.play()}catch{const b=document.createElement('button');b.className='audioStart';b.textContent='▶ SOUND STARTEN';b.onclick=()=>{a.play();b.remove()};(root.querySelector('.questionMedia')||q).after(b)}}}
}
new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true});enhance();
