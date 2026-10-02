import { handleUpload } from '@vercel/blob/client';

const ALLOWED_KEYS=new Set(['quiz-bg','q01-wham','q02-bttf','q03-aha','q05-madonna','q08-ghostbusters','q09-spice','q11-nirvana','q12-titanic','q13-bsb','q17-beyonce','q19-rihanna','q21-potter','q22-bep','q25-gangnam','q27-adele','q28-got','q29-happy','q33-weeknd','q35-miley','q38-bruno']);
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'METHOD_NOT_ALLOWED'});
 try{
  const jsonResponse=await handleUpload({
   body:req.body,
   request:req,
   onBeforeGenerateToken:async(pathname,clientPayload)=>{
    let payload={};try{payload=JSON.parse(clientPayload||'{}')}catch{}
    const key=String(payload.key||'');
    if(!ALLOWED_KEYS.has(key))throw new Error('Unbekannter Audio-Slot');
    if(!pathname.startsWith(`nici40/audio/${key}--`))throw new Error('Ungültiger Dateipfad');
    return{
     allowedContentTypes:['audio/mpeg','audio/mp3','audio/mp4','audio/aac','audio/x-m4a','audio/ogg','audio/opus','audio/wav','audio/x-wav','audio/webm','video/webm','application/octet-stream'],
     maximumSizeInBytes:100*1024*1024,
     addRandomSuffix:true,
     tokenPayload:JSON.stringify({key})
    };
   },
   onUploadCompleted:async()=>{}
  });
  return res.status(200).json(jsonResponse);
 }catch(e){return res.status(400).json({error:e?.message||'Upload fehlgeschlagen'})}
}
