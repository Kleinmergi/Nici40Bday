import http from 'node:http';
import { WebSocketServer } from 'ws';
import { QUIZ, FLAT } from '../quiz-data.js';
import { TEXT_CONFIG } from '../text-config.js';

const ROUND_LENGTHS=QUIZ.map(r=>r.items.length);
function flatIndex(ri,qi){let n=qi;for(let i=0;i<ri;i++)n+=ROUND_LENGTHS[i]||0;return n}
function coords(i){let r=0;while(r<ROUND_LENGTHS.length-1&&i>=ROUND_LENGTHS[r]){i-=ROUND_LENGTHS[r];r++}return{roundIndex:r,questionIndex:i}}
const rooms=globalThis.__partyQuizRooms??new Map();globalThis.__partyQuizRooms=rooms;
function code(){const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let o='';for(let i=0;i<5;i++)o+=a[Math.floor(Math.random()*a.length)];return o}
function id(){return Math.random().toString(36).slice(2,10)}
function safeName(v,f='Team'){return String(v||f).replace(/[<>]/g,'').trim().slice(0,28)||f}
function cleanAnswer(v){return String(v??'').replace(/[\u0000-\u001f<>]/g,' ').trim().slice(0,80)}
function send(ws,type,payload={}){if(ws.readyState===1)ws.send(JSON.stringify({type,...payload}))}
function currentFlatIndex(r){return flatIndex(r.roundIndex,r.questionIndex)}
function currentItem(r){return FLAT[currentFlatIndex(r)]}
function stateFor(r){const hide=r.mode==='pub'&&r.phase!=='finished';return{code:r.code,mode:r.mode,phase:r.phase,roundIndex:r.roundIndex,questionIndex:r.questionIndex,revealed:r.revealed,questionEndsAt:r.questionEndsAt,reviewIndex:r.reviewIndex,players:[...r.players.values()].map(p=>({id:p.id,name:p.name,score:hide?null:p.score,answered:p.answered,connected:p.connected!==false})),startedAt:r.startedAt}}
function broadcast(r,type='state',extra={}){const msg=JSON.stringify({type,state:stateFor(r),...extra});for(const ws of r.sockets)if(ws.readyState===1)ws.send(msg)}
function roomOrFail(ws,c){const r=rooms.get(String(c||'').toUpperCase());if(!r)send(ws,'error',{message:'Spielcode nicht gefunden.'});return r}
function clearTimer(r){if(r.timer){clearTimeout(r.timer);r.timer=null}}
function resetAnswered(r){for(const p of r.players.values()){p.answered=false;p.answer=null}}
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,' ').trim()}
function levenshtein(a,b){if(a===b)return 0;if(!a.length)return b.length;if(!b.length)return a.length;let prev=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const cur=[i];for(let j=1;j<=b.length;j++)cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=cur}return prev[b.length]}
function localJudge(answer,cfg){const a=norm(answer);if(!a)return false;for(const x of cfg.accept||[]){const n=norm(x);if(a===n)return true;if(Math.min(a.length,n.length)>=6&&levenshtein(a,n)<=2)return true}return null}
async function aiJudge(question,cfg,answer){
 if(!process.env.OPENAI_API_KEY)return null;
 try{
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:process.env.OPENAI_JUDGE_MODEL||'gpt-5.6-luna',store:false,reasoning:{effort:'none'},max_output_tokens:16,input:[{role:'developer',content:'Du bewertest Antworten in einem Partyquiz. Entscheide nur, ob die Antwort die erwartete Lösung eindeutig bezeichnet. Akzeptiere Tippfehler, Kurzformen, deutsche/englische Titel und offensichtliche Varianten. Akzeptiere keine nur thematisch verwandten Antworten. Antworte ausschließlich mit CORRECT oder WRONG.'},{role:'user',content:`Frage: ${question}\nErwartete Lösung: ${cfg.canonical}\nAntwort des Teams: ${answer}`} ]})});
  if(!response.ok)return null;const data=await response.json();const text=(data.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join(' ').trim().toUpperCase();
  if(text.includes('CORRECT'))return true;if(text.includes('WRONG'))return false;return null;
 }catch{return null}
}
function pointsFor(correct,elapsed){if(!correct)return 0;const speed=Math.round(300*Math.max(0,1-Math.min(180000,Math.max(0,elapsed))/180000));return 700+speed}
function recordResult(p,key,value,correct,elapsed,source){const points=pointsFor(correct,elapsed);p.answers[key]={value,correct,elapsed,points,source};p.score=(p.score||0)+points;return points}
function startQuestion(r){r.questionStartedAt=Date.now()}
function nextPubQuestion(r){clearTimer(r);const i=currentFlatIndex(r);if(i<0||i>=FLAT.length-1){r.phase='review';r.reviewIndex=0;r.questionEndsAt=null;r.revealed=true;broadcast(r);return}const n=coords(i+1);r.roundIndex=n.roundIndex;r.questionIndex=n.questionIndex;r.revealed=false;resetAnswered(r);startPubClock(r);broadcast(r)}
function startPubClock(r){clearTimer(r);startQuestion(r);r.questionEndsAt=Date.now()+180000;r.timer=setTimeout(()=>nextPubQuestion(r),180050)}
const server=http.createServer((req,res)=>{res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({ok:true,rooms:rooms.size,aiJudge:!!process.env.OPENAI_API_KEY}))});
const wss=new WebSocketServer({server});
wss.on('connection',ws=>{ws.meta={room:null,playerId:null,role:null};ws.on('message',async raw=>{let m;try{m=JSON.parse(raw.toString())}catch{return send(ws,'error',{message:'Ungültige Nachricht.'})}
 if(m.type==='create'){let c;do{c=code()}while(rooms.has(c));const hostToken=id()+id(),r={code:c,hostToken,hostSocket:ws,sockets:new Set([ws]),players:new Map(),mode:m.mode==='live'?'live':'pub',phase:'lobby',roundIndex:0,questionIndex:0,revealed:false,startedAt:null,questionStartedAt:null,questionEndsAt:null,reviewIndex:0,timer:null};rooms.set(c,r);ws.meta={room:c,playerId:null,role:'host'};send(ws,'created',{code:c,hostToken,state:stateFor(r)});return}
 if(m.type==='rejoinHost'){const r=roomOrFail(ws,m.code);if(!r)return;if(m.hostToken!==r.hostToken)return send(ws,'error',{message:'Host-Berechtigung ungültig.'});r.hostSocket=ws;r.sockets.add(ws);ws.meta={room:r.code,playerId:null,role:'host'};return send(ws,'state',{state:stateFor(r)})}
 if(m.type==='join'){const r=roomOrFail(ws,m.code);if(!r)return;const playerId=id(),p={id:playerId,name:safeName(m.name),score:0,answered:false,answer:null,answers:{},connected:true};r.players.set(playerId,p);r.sockets.add(ws);ws.meta={room:r.code,playerId,role:'player'};send(ws,'joined',{playerId,state:stateFor(r)});broadcast(r);return}
 const r=roomOrFail(ws,ws.meta.room||m.code);if(!r)return;
 if(m.type==='start'&&ws.meta.role==='host'){r.phase='playing';r.startedAt=Date.now();r.roundIndex=0;r.questionIndex=0;r.revealed=false;r.reviewIndex=0;for(const p of r.players.values()){p.score=0;p.answers={};p.answered=false;p.answer=null}if(r.mode==='pub')startPubClock(r);else startQuestion(r);return broadcast(r)}
 if(m.type==='answer'&&ws.meta.role==='player'&&r.phase==='playing'){const p=r.players.get(ws.meta.playerId),item=currentItem(r);if(!p||p.answered||r.revealed||TEXT_CONFIG[item?.q])return;const a=Number(m.answer);if(!Number.isInteger(a)||a<0||a>3)return;const key=currentFlatIndex(r),elapsed=Date.now()-(r.questionStartedAt||Date.now());p.answered=true;p.answer=a;recordResult(p,key,a,a===item.a,elapsed,'exact');send(ws,'answerAccepted',{answer:a});return broadcast(r,'state',{answerCount:[...r.players.values()].filter(x=>x.answered).length})}
 if(m.type==='textAnswer'&&ws.meta.role==='player'&&r.phase==='playing'){const p=r.players.get(ws.meta.playerId),item=currentItem(r),cfg=TEXT_CONFIG[item?.q];if(!p||p.answered||r.revealed||!cfg)return;const answer=cleanAnswer(m.answer);if(!answer)return;const key=currentFlatIndex(r),elapsed=Date.now()-(r.questionStartedAt||Date.now());p.answered=true;p.answer=answer;send(ws,'answerAccepted',{answer});broadcast(r,'state',{answerCount:[...r.players.values()].filter(x=>x.answered).length});let correct=localJudge(answer,cfg),source='local';if(correct===null){correct=await aiJudge(item.q,cfg,answer);source=correct===null?'fallback':'openai'}if(correct===null)correct=false;recordResult(p,key,answer,correct,elapsed,source);return}
 if(ws.meta.role!=='host')return;
 if(m.type==='pubNext'&&r.mode==='pub'&&r.phase==='playing')return nextPubQuestion(r);
 if(m.type==='reviewNext'&&r.mode==='pub'&&r.phase==='review'){if(r.reviewIndex<FLAT.length-1){r.reviewIndex++;return broadcast(r)}r.phase='finished';return broadcast(r)}
 if(m.type==='reviewPrev'&&r.mode==='pub'&&r.phase==='review'){r.reviewIndex=Math.max(0,r.reviewIndex-1);return broadcast(r)}
 if(m.type==='setQuestion'&&r.mode==='live'){r.roundIndex=Math.max(0,Number(m.roundIndex)||0);r.questionIndex=Math.max(0,Number(m.questionIndex)||0);r.revealed=false;resetAnswered(r);startQuestion(r);return broadcast(r)}
 if(m.type==='reveal'&&r.mode==='live'){r.revealed=true;return broadcast(r)}
 if(m.type==='score'&&r.mode==='live'){const p=r.players.get(m.playerId);if(p)p.score+=Number(m.delta)||0;return broadcast(r)}
 if(m.type==='finish'){clearTimer(r);r.phase='finished';r.revealed=true;r.questionEndsAt=null;return broadcast(r)}
 });ws.on('close',()=>{const{room:rc,playerId}=ws.meta||{},r=rooms.get(rc);if(!r)return;r.sockets.delete(ws);if(playerId&&r.players.has(playerId)){r.players.get(playerId).connected=false;broadcast(r)}})});
export default server;
