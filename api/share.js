const BACKEND='https://shieldtx-scanner-simple.eeshita7546.chatgpt.site';
export default { async fetch(request){
 const u=new URL(request.url);
 if(request.method!=='POST')return new Response('Method not allowed',{status:405});
 if(request.headers.get('origin')!==u.origin)return new Response('Forbidden',{status:403});
 try{
  const body=await request.arrayBuffer();
  if(body.byteLength>4400000)return new Response('Image too large',{status:413});
  const query=new URLSearchParams();for(const key of ['score','followers','sample'])query.set(key,u.searchParams.get(key)||'0');
  const upstream=await fetch(BACKEND+'/api/share?'+query,{method:'POST',headers:{'Content-Type':'image/png',Origin:BACKEND},body,signal:AbortSignal.timeout(20000)});
  if(!upstream.ok)return new Response('Unable to save card',{status:upstream.status});
  const data=await upstream.json(),path=new URL(data.url).pathname;
  if(!/^\/s\/[a-f0-9]{64}$/.test(path))throw new Error('Invalid response');
  return Response.json({url:u.origin+path},{headers:{'Cache-Control':'no-store'}});
 }catch{return new Response('Share service temporarily unavailable',{status:502});}
}};
