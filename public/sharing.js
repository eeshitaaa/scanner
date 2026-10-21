(() => {
const $=s=>document.querySelector(s);
const clean=(v,max)=>Number.isFinite(Number(v))?Math.max(0,Math.min(max,Math.round(Number(v)))):0;
function paint(canvas,d){
 const c=canvas.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,canvas.width,canvas.height);c.scale(canvas.width/1200,canvas.height/630);c.save();
 const ink=(text,x,y)=>{c.save();c.globalAlpha=.92;c.shadowColor='#f4fff099';c.shadowOffsetY=1;c.shadowBlur=.5;c.fillText(text,x,y);c.restore();};c.beginPath();c.roundRect(1,1,1198,628,32);c.clip();
 let g=c.createLinearGradient(0,0,1200,630);g.addColorStop(0,'#d9f4d8');g.addColorStop(.25,'#a8d7ba');g.addColorStop(.52,'#e4efda');g.addColorStop(.75,'#8fc3b0');g.addColorStop(1,'#bddec1');c.fillStyle=g;c.fillRect(0,0,1200,630);
 // Broad satin reflections give the surface depth without extra ornament.
 c.save();c.translate(600,315);c.rotate(-.35);g=c.createLinearGradient(-900,-100,900,100);g.addColorStop(0,'#ffffff00');g.addColorStop(.42,'#ffffff00');g.addColorStop(.49,'#ffffff3d');g.addColorStop(.54,'#ffffff00');g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.fillRect(-1000,-800,2000,1600);c.restore();
 c.fillStyle='#193e30';c.font='600 42px Arial';ink('ShieldTX',58,78);c.font='23px monospace';c.textAlign='right';ink(d.sample?'SAMPLE REPORT':'EXPOSURE REPORT',1140,75);c.textAlign='left';
 c.fillStyle='#375f4c';c.font='22px monospace';ink('EXPOSURE SCORE',62,175);
 c.fillStyle='#123a2a';c.font='500 236px Arial';ink(String(d.score),48,390);const scoreWidth=c.measureText(String(d.score)).width;c.font='48px Arial';c.fillStyle='#47715c';ink('/100',64+scoreWidth,386);
 c.strokeStyle='#274b3a3b';c.lineWidth=1;c.beginPath();c.moveTo(62,443);c.lineTo(1138,443);c.stroke();
 c.fillStyle='#173d2c';c.font='500 60px Arial';let count=d.followers.toLocaleString('en-US');if(c.measureText(count).width>650)c.font='500 48px Arial';ink(count,61,534);c.fillStyle='#375f4c';c.font='24px Arial';ink('possible followers',64,575);
 c.textAlign='right';c.font='24px Arial';c.fillStyle='#244b37';ink(d.score>70?'High exposure':d.score>40?'Moderate exposure':'Lower exposure',1138,530);c.font='17px monospace';c.fillStyle='#47715c';ink('30-DAY ANALYSIS',1138,573);c.textAlign='left';c.restore();
 c.strokeStyle='#f2fff3aa';c.lineWidth=2;c.beginPath();c.roundRect(1,1,1198,628,32);c.stroke();
}
window.paintExposureCard=paint;
let payload,shareUrl,shareReady;
const shareButtons=()=>[...document.querySelectorAll('#share-x,#share-linkedin,#copy-card-link,#share-link')];
async function publishCard(d){
 shareButtons().forEach(b=>b.disabled=true);
 $('#share-status').textContent='Preparing your share link…';
 try{const blob=await new Promise(resolve=>$('#share-canvas').toBlob(resolve,'image/png'));
 const response=await fetch('/api/share?'+new URLSearchParams({score:d.score,followers:d.followers,sample:d.sample?'1':'0'}),{method:'POST',headers:{'Content-Type':'image/png'},body:blob});
 if(!response.ok)throw new Error('Share unavailable');
 shareUrl=new URL((await response.json()).url);shareButtons().forEach(b=>b.disabled=false);$('#share-status').textContent='';
 }catch{$('#share-status').textContent='Could not create a share link. Close and reopen to retry, or download the card.';}
}

window.openExposureShare=report=>{payload={followers:clean(report.data.copier_count,1e12),score:clean(report.data.exposure_score,100),sample:report.example};paint($('#share-canvas'),payload);shareUrl=new URL('shared.html',location.href);shareUrl.search=new URLSearchParams({followers:payload.followers,score:payload.score,sample:payload.sample?'1':'0'});$('#share-status').textContent='';$('#share-menu').hidden=true;$('#share-options').setAttribute('aria-expanded','false');$('#share-link-fallback').hidden=true;$('#share-caption').textContent='Your trades leave a trail.';$('#share-dialog').showModal();shareReady=publishCard({...payload});};
const message=()=>`My wallet scored ${payload.score}/100 for public exposure on ShieldTX — with ${payload.followers.toLocaleString('en-US')} possible followers.${payload.sample?' (Sample report)':''}\n\nHow exposed are your trades? See my card and try the scanner:`;
const prepared=()=>message()+' '+shareUrl.href;
$('#share-x')?.addEventListener('click',()=>window.open('https://twitter.com/intent/tweet?'+new URLSearchParams({text:message(),url:shareUrl.href}),'_blank','noopener,noreferrer'));
$('#share-linkedin')?.addEventListener('click',async()=>{const destination='https://www.linkedin.com/sharing/share-offsite/?'+new URLSearchParams({url:shareUrl.href});window.open(destination,'_blank','noopener,noreferrer');try{await navigator.clipboard.writeText(prepared());$('#share-status').textContent='Prepared message copied. Paste it into your LinkedIn post.';}catch{$('#share-link-fallback').hidden=false;$('#shared-message').textContent=prepared();$('#shared-url').value=shareUrl.href;$('#share-status').textContent='Use this prepared message in your LinkedIn post.';}});
$('#copy-card-link')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(shareUrl.href);$('#share-status').textContent='Card link copied.';}catch{$('#share-link-fallback').hidden=false;$('#shared-url').value=shareUrl.href;$('#shared-url').focus();$('#shared-url').select();$('#share-status').textContent='Select and copy the card link below.';}});
$('#close-share')?.addEventListener('click',()=>$('#share-dialog').close());
$('#share-options')?.addEventListener('click',()=>{const m=$('#share-menu');m.hidden=!m.hidden;$('#share-options').setAttribute('aria-expanded',String(!m.hidden));});
$('#share-link')?.addEventListener('click',async()=>{try{if(navigator.share){await navigator.share({title:'My ShieldTX exposure card',text:message(),url:shareUrl.href});return;}}catch(e){if(e.name==='AbortError')return;}
 $('#share-link-fallback').hidden=false;$('#shared-url').value=shareUrl.href;$('#shared-message').textContent=message();$('#shared-url').focus();$('#shared-url').select();});
$('#share-image')?.addEventListener('click',()=>{$('#share-canvas').toBlob(blob=>{if(!blob)return;const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='shieldtx-exposure-card.png';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);});});
let observer,animation;
window.animateImpact=()=>{const el=$('#impact-value');if(!el)return;cancelAnimationFrame(animation);observer?.disconnect();el.textContent='$0';observer=new IntersectionObserver(entries=>{if(!entries.some(e=>e.isIntersecting))return;observer.disconnect();const start=performance.now(),duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:1500;function tick(now){const t=duration?Math.min(1,(now-start)/duration):1;el.textContent='$'+Math.round(12255*(1-Math.pow(1-t,3))).toLocaleString('en-US');if(t<1)animation=requestAnimationFrame(tick);}animation=requestAnimationFrame(tick);},{threshold:.3});observer.observe(el);};
if($('#shared-card')){const q=new URLSearchParams(location.search);paint($('#shared-card'),{followers:clean(q.get('followers'),1e12),score:clean(q.get('score'),100),sample:q.get('sample')==='1'});}
})();
