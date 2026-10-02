import { list, del } from '@vercel/blob';
const PREFIX='nici40/audio/';
function keyFrom(pathname){const name=String(pathname||'').slice(PREFIX.length);return name.split('--')[0]||''}
async function library(){
  const blobs=[];let cursor;
  do{const r=await list({prefix:PREFIX,cursor,limit:100});blobs.push(...r.blobs);cursor=r.hasMore?r.cursor:undefined}while(cursor);
  const latest={};for(const b of blobs){const key=keyFrom(b.pathname);if(!key)continue;if(!latest[key]||new Date(b.uploadedAt)>new Date(latest[key].uploadedAt))latest[key]=b}
  return{latest,all:blobs};
}
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  try{
    if(req.method==='GET'){const {latest}=await library();return res.status(200).json({ok:true,audio:Object.fromEntries(Object.entries(latest).map(([k,b])=>[k,{url:b.url,pathname:b.pathname,size:b.size,uploadedAt:b.uploadedAt,contentType:b.contentType}]))})}
    if(req.method==='DELETE'){const key=String(req.query?.key||req.body?.key||'');if(!key)return res.status(400).json({ok:false,error:'KEY_REQUIRED'});const {all}=await library();const matches=all.filter(b=>keyFrom(b.pathname)===key);if(matches.length)await del(matches.map(b=>b.url));return res.status(200).json({ok:true,deleted:matches.length})}
    return res.status(405).json({ok:false,error:'METHOD_NOT_ALLOWED'});
  }catch(e){return res.status(500).json({ok:false,error:e?.message||'Blob-Fehler'})}
}
