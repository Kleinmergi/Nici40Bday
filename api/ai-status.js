export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'METHOD_NOT_ALLOWED'});
  const key=process.env.OPENAI_API_KEY;
  const model=process.env.OPENAI_JUDGE_MODEL||'gpt-5.6-luna';
  if(!key)return res.status(503).json({ok:false,keyPresent:false,model,error:'OPENAI_API_KEY fehlt im Deployment'});
  const started=Date.now();
  try{
    const r=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},
      body:JSON.stringify({
        model,
        store:false,
        reasoning:{effort:'none'},
        max_output_tokens:16,
        input:'Antworte ausschließlich mit OK.'
      })
    });
    const latencyMs=Date.now()-started;
    const data=await r.json().catch(()=>({}));
    if(!r.ok){
      const msg=data?.error?.message||`OpenAI HTTP ${r.status}`;
      return res.status(502).json({ok:false,keyPresent:true,model,latencyMs,httpStatus:r.status,error:msg});
    }
    const text=(data.output_text||data.output?.flatMap(x=>x.content||[]).map(x=>x.text||'').join('')||'').trim();
    return res.status(200).json({ok:true,keyPresent:true,model,latencyMs,response:text||'OK'});
  }catch(e){
    return res.status(502).json({ok:false,keyPresent:true,model,latencyMs:Date.now()-started,error:e?.message||'Verbindungsfehler'});
  }
}
