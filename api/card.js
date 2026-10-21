const BACKEND='https://shieldtx-scanner-simple.eeshita7546.chatgpt.site';
export default { async fetch(request){
 const u=new URL(request.url),id=u.searchParams.get('id')||u.pathname.split('/').pop();
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 if(!/^[a-f0-9]{64}(\.png)?$/.test(id))return new Response('Not found',{status:404});
 try{
  const upstream=await fetch(BACKEND+'/s/'+id,{signal:AbortSignal.timeout(20000)});
  if(!upstream.ok)return new Response('Card not found',{status:upstream.status});
  const headers={'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'};
  if(id.endsWith('.png'))return new Response(request.method==='HEAD'?null:upstream.body,{headers:{...headers,'Content-Type':'image/png'}});
  const html=(await upstream.text()).replaceAll(BACKEND,u.origin);
  return new Response(request.method==='HEAD'?null:html,{headers:{...headers,'Content-Type':'text/html; charset=utf-8'}});
 }catch{return new Response('Card temporarily unavailable',{status:502});}
}};
