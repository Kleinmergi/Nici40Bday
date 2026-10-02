import { put } from '@vercel/blob';

const ALLOWED_KEYS=new Set(['quiz-bg','q01-wham','q02-bttf','q03-aha','q05-madonna','q08-ghostbusters','q09-spice','q11-nirvana','q12-titanic','q13-bsb','q17-beyonce','q19-rihanna','q21-potter','q22-bep','q25-gangnam','q27-adele','q28-got','q29-happy','q33-weeknd','q35-miley','q38-bruno']);
const safeName=name=>String(name||'audio').replace(/[^a-zA-Z0-9._-]+/g,'_').slice(-90);

export const config={api:{bodyParser:false}};

async function readBody(req){
 const chunks=[];for await(const chunk of req)chunks.push(chunk);return Buffer.concat(chunks);
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'METHOD_NOT_ALLOWED'});
 try{
   const key=String(req.query?.key||'');
   if(!ALLOWED_KEYS.has(key))return res.status(400).json({error:'Unbekannter Audio-Slot'});
   const filename=safeName(req.headers['x-file-name']||'audio.bin');
   const body=await readBody(req);
   if(!body.length)return res.status(400).json({error:'Leere Datei'});
   const contentType=String(req.headers['content-type']||'application/octet-stream');
   const blob=await put(`nici40/audio/${key}--${filename}`,body,{access:'public',addRandomSuffix:true,contentType});
   return res.status(200).json({ok:true,url:blob.url,pathname:blob.pathname,size:body.length});
 }catch(e){return res.status(500).json({error:e?.message||'Upload fehlgeschlagen'})}
}
