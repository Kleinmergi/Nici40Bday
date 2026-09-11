import { FLAT } from './quiz-data.js';

const seen=new WeakSet();
const localAudio=new Map();
let audioUrls=[];

function keyForFile(name){
 const base=name.replace(/\.[^.]+$/,'').toLowerCase().trim();
 const m=base.match(/(?:q|frage|track)?[ _-]*0*(\d{1,2})$/i);
 return m?Number(m[1])-1:null;
}

function installAudioLoader(){
 if(document.getElementById('audioPackLoader'))return;
 const box=document.createElement('div');
 box.id='audioPackLoader';
 box.className='audioPackLoader';
 box.innerHTML=`<button type="button" class="audioLoadBtn">♫ Musikpaket laden</button><input hidden type="file" accept="audio/*" multiple><span class="audioLoadState">optional · Dateien 01.mp3 … 40.mp3</span>`;
 document.body.appendChild(box);
 const input=box.querySelector('input');
 box.querySelector('button').addEventListener('click',()=>input.click());
 input.addEventListener('change',()=>{
  audioUrls.forEach(URL.revokeObjectURL); audioUrls=[]; localAudio.clear();
  [...input.files].forEach(file=>{const idx=keyForFile(file.name);if(idx!==null&&idx>=0&&idx<FLAT.length){const url=URL.createObjectURL(file);audioUrls.push(url);localAudio.set(idx,url)}});
  box.querySelector('.audioLoadState').textContent=`${localAudio.size} Tracks lokal geladen · nichts wird hochgeladen`;
  seen.clear?.(); enhance(true);
 });
}

function isHostView(root){return root.classList.contains('stage') || root.closest?.('.stage');}

function enhance(force=false){
 document.querySelectorAll('.stage,#playerView').forEach(root=>{
  const q=root.querySelector('.question'); if(!q)return;
  const idx=FLAT.findIndex(x=>x.q===q.textContent.trim()); if(idx<0)return;
  const item=FLAT[idx];
  const eyebrow=root.querySelector('.eyebrow');
  if(eyebrow&&!eyebrow.querySelector('.catBadge'))eyebrow.insertAdjacentHTML('beforeend',` <span class="catBadge">${item.cat||'POP'}</span>`);
  if(!force&&seen.has(q))return; seen.add(q);

  if(item.img&&!root.querySelector('.questionMedia')){
   const figure=document.createElement('figure'); figure.className='questionMedia';
   figure.innerHTML=`<img src="${item.img}" alt="${item.alt||''}" loading="eager"><figcaption>${item.credit||''}</figcaption>`;
   q.after(figure);
  }

  const src=localAudio.get(idx)||item.audio;
  if(src&&isHostView(root)&&!root.querySelector('.audioCard')){
   const audio=document.createElement('div'); audio.className='audioCard';
   audio.innerHTML=`<div class="mediaKicker">♫ AUDIO-RÄTSEL · TITEL VERSTECKT</div><audio controls preload="metadata" src="${src}"></audio>`;
   (root.querySelector('.questionMedia')||q).after(audio);
  }
 });
}

new MutationObserver(()=>enhance()).observe(document.body,{childList:true,subtree:true});
installAudioLoader();
enhance();
