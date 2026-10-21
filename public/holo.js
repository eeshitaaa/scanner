(() => {
function mount(){document.querySelectorAll('.holo-card').forEach(card=>{
 let tx=0,ty=0,x=0,y=0,frame=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function tick(){x+=(tx-x)*.12;y+=(ty-y)*.12;card.style.setProperty('--rx',x.toFixed(3)+'deg');card.style.setProperty('--ry',y.toFixed(3)+'deg');if(Math.abs(tx-x)+Math.abs(ty-y)>.01)frame=requestAnimationFrame(tick);else frame=0;}
 card.addEventListener('pointermove',e=>{if(reduced||e.pointerType==='touch')return;const b=card.getBoundingClientRect(),px=Math.max(0,Math.min(1,(e.clientX-b.left)/b.width)),py=Math.max(0,Math.min(1,(e.clientY-b.top)/b.height));tx=(.5-py)*12;ty=(px-.5)*16;card.style.setProperty('--mx',px*100+'%');card.style.setProperty('--my',py*100+'%');card.style.setProperty('--shine','.85');if(!frame)frame=requestAnimationFrame(tick);});
 card.addEventListener('pointerleave',()=>{tx=ty=0;card.style.setProperty('--shine','.3');if(!frame)frame=requestAnimationFrame(tick);});
 });}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
