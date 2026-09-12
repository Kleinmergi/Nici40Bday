import {TEXT_CONFIG} from './text-config.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
function enhance(){
 const root=document.querySelector('#playerView'); if(!root)return;
 const q=root.querySelector('.question'); if(!q)return;
 const cfg=TEXT_CONFIG[q.textContent.trim()]; if(!cfg)return;
 const locked=!!root.querySelector('.answerBox');
 const opts=root.querySelector('.opts');
 if(!opts||opts.dataset.textified==='1')return;
 opts.dataset.textified='1';
 if(locked){opts.innerHTML='<div class="textLocked">✓ ANTWORT GESPEICHERT</div>';return}
 opts.innerHTML=`<form class="textAnswerForm"><input class="textAnswerInput" maxlength="80" autocomplete="off" autocapitalize="words" placeholder="Antwort eingeben …" aria-label="Freitextantwort"><button class="primary textSubmit" type="submit">LOCK IN →</button></form><div class="textHint">Freitext · Schreibweise muss nicht perfekt sein.</div>`;
 const form=opts.querySelector('form'),input=opts.querySelector('input');
 form.addEventListener('submit',e=>{e.preventDefault();const value=input.value.trim();if(!value)return;input.disabled=true;form.querySelector('button').disabled=true;window.send('textAnswer',{answer:value});});
 setTimeout(()=>input.focus({preventScroll:true}),50);
}
new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true});enhance();
