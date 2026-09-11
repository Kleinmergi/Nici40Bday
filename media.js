import { FLAT } from './quiz-data.js';
const seen=new WeakSet();
function enhance(){
 document.querySelectorAll('.stage,#playerView').forEach(root=>{
  const q=root.querySelector('.question'); if(!q)return;
  const item=FLAT.find(x=>x.q===q.textContent.trim()); if(!item)return;
  const eyebrow=root.querySelector('.eyebrow');
  if(eyebrow&&!eyebrow.querySelector('.catBadge'))eyebrow.insertAdjacentHTML('beforeend',` <span class="catBadge">${item.cat||'POP'}</span>`);
  if(seen.has(q))return; seen.add(q);
  if(item.img){
   const figure=document.createElement('figure'); figure.className='questionMedia';
   figure.innerHTML=`<img src="${item.img}" alt="${item.alt||''}" loading="eager"><figcaption>${item.credit||''}</figcaption>`;
   q.after(figure);
  }
  if(item.audio){
   const audio=document.createElement('div'); audio.className='audioCard';
   audio.innerHTML=`<div class="mediaKicker">♫ AUDIO-RÄTSEL</div><audio controls preload="metadata" src="${item.audio}"></audio>`;
   (root.querySelector('.questionMedia')||q).after(audio);
  }
 });
}
new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true}); enhance();
