import { MEDIA } from './media-config.js';
const seen=new WeakSet();
let activeAudio=null, backgroundAudio=null, snippetTimers=[];
const dbOpen=()=>new Promise((resolve,reject)=>{const r=indexedDB.open('nici40-media',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('audio'))r.result.createObjectStore('audio')};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
async function getAudio(key){try{const db=await dbOpen();return await new Promise((resolve,reject)=>{const r=db.transaction('audio','readonly');const q=r.objectStore('audio').get(key);q.onsuccess=()=>resolve(q.result||null);q.onerror=()=>reject(q.error)})}catch{return null}}
const waitMeta=a=>a.readyState>=1?Promise.resolve():new Promise(res=>{a.addEventListener('loadedmetadata',res,{once:true});setTimeout(res,2500)});
const waitUntilQuestionVisible=async q=>{
  // Era transition sits above the already-rendered next question for ~2.6 s.
  // Never start a clue while that overlay is still visible.
  while(document.body.contains(q)){
    const overlay=document.getElementById('eraTransition');
    if(!overlay?.classList.contains('show'))return true;
    await new Promise(r=>setTimeout(r,100));
  }
  return false;
};
function clearSnippetTimers(){snippetTimers.forEach(clearTimeout);snippetTimers=[]}
function stopAudio(){clearSnippetTimers();if(activeAudio){activeAudio.pause();if(activeAudio.dataset.objectUrl)URL.revokeObjectURL(activeAudio.dataset.objectUrl);activeAudio=null}if(backgroundAudio)backgroundAudio.volume=.22}
async function ensureBackground(){
 if(backgroundAudio&&!backgroundAudio.paused)return;
 const blob=await getAudio('quiz-bg');if(!blob)return;
 if(!backgroundAudio){const a=new Audio();a.src=URL.createObjectURL(blob);a.dataset.objectUrl=a.src;a.loop=true;a.preload='auto';a.volume=.22;backgroundAudio=a}
 try{await backgroundAudio.play()}catch{}
}
function randomStart(duration,clip=1){if(!Number.isFinite(duration)||duration<=clip+2)return 0;const lo=Math.min(5,Math.max(0,duration*.08)),hi=Math.max(lo,duration-clip-3);return lo+Math.random()*(hi-lo)}
async function playTeaser(a,seconds=10,startAt=null){
 await waitMeta(a);const maxStart=Math.max(0,(Number.isFinite(a.duration)?a.duration:seconds)-seconds-.25);const chosen=Number.isFinite(Number(startAt))?Math.min(maxStart,Math.max(0,Number(startAt))):randomStart(a.duration,seconds);a.currentTime=chosen;if(backgroundAudio)backgroundAudio.volume=.06;
 try{await a.play()}catch{return false}
 snippetTimers.push(setTimeout(()=>{a.pause();if(backgroundAudio)backgroundAudio.volume=.22},seconds*1000));return true
}
async function playSongGuess(a){
 await waitMeta(a);
 let stopped=false;
 const playOne=async()=>{
   if(stopped||a!==activeAudio)return;
   a.currentTime=randomStart(a.duration,1);
   if(backgroundAudio)backgroundAudio.volume=.06;
   try{await a.play()}catch{return false}
   snippetTimers.push(setTimeout(()=>{
     if(a!==activeAudio)return;
     a.pause();
     if(backgroundAudio)backgroundAudio.volume=.22;
     // 3 Sekunden reine Rate-/Quizmusik-Pause, danach neuer zufälliger 1-s-Schnipsel.
     snippetTimers.push(setTimeout(()=>{if(a===activeAudio)playOne()},3000));
   },1000));
   return true;
 };
 return await playOne();
}
async function enhance(){
 const root=document.querySelector('#hostQuestion');if(!root)return;
 const q=root.querySelector('.question'),revealing=!!root.querySelector('.reviewCount,.opt.correct');
 root.classList.toggle('hostMediaOnly',!!q&&!revealing);
 if(!q){stopAudio();return}
 await ensureBackground();
 const mediaKey=q.dataset.mediaKey||q.textContent.trim(),cfg=MEDIA[mediaKey];
 if(!cfg)return;
 const eyebrow=root.querySelector('.eyebrow');if(eyebrow&&!eyebrow.querySelector('.catBadge'))eyebrow.insertAdjacentHTML('beforeend',` <span class="catBadge">${cfg.audioMode==='songGuess'?'1s SONG QUIZ':(cfg.cat||'POP')}</span>`);
 if(seen.has(q))return;seen.add(q);stopAudio();
 if(cfg.img){const f=document.createElement('figure');f.className='questionMedia';f.innerHTML=`<img src="${cfg.img}" alt="${cfg.alt||''}" loading="eager"><figcaption>${cfg.credit||''}</figcaption>`;q.after(f)}
 if(cfg.audioKey){const blob=await getAudio(cfg.audioKey);if(blob&&document.body.contains(q)){const visible=await waitUntilQuestionVisible(q);if(!visible||!document.body.contains(q))return;const a=new Audio();a.src=URL.createObjectURL(blob);a.dataset.objectUrl=a.src;a.preload='auto';a.volume=.92;a.loop=false;a.className='hostBackgroundAudio';activeAudio=a;
   const play=()=>cfg.audioMode==='songGuess'?playSongGuess(a):playTeaser(a,10,cfg.teaserStart);
   const ok=await play();if(ok===false){const b=document.createElement('button');b.className='audioStart';b.textContent=cfg.audioMode==='songGuess'?'▶ 3 × 1 SEK. STARTEN':'▶ 10 SEK. SOUND STARTEN';b.onclick=async()=>{await ensureBackground();await play();b.remove()};(root.querySelector('.questionMedia')||q).after(b)}
 }}
}
new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true});enhance();
