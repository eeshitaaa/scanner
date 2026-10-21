(() => {
'use strict';
const $=s=>document.querySelector(s);
let rows=[], selected=-1, expanded=false, isExample=false;
const esc=v=>String(v??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=v=>typeof v==='number'&&Number.isFinite(v)?v.toLocaleString('en-US'):'—';
const compact=v=>typeof v==='number'&&Number.isFinite(v)?new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1,style:'currency',currency:'USD'}).format(v):'—';
const short=v=>typeof v==='string'&&v.length>16?v.slice(0,6)+'…'+v.slice(-4):v||'Address unavailable';
// Design-only relationships. Never mixed into live scan data or headline metrics.
const samples=()=>Array.from({length:10},(_,i)=>({address:['0xede0…6546','0x8b21…c940','0xa47d…821f','0x6e32…b5a0','0xc392…198e','0x041a…ff72','0xf198…70ad','0x27b1…83c2','0x9a31…d8f0','0xb829…311c'][i],fills:[865825,421670,206814,138642,99871,74320,52810,32190,19470,12840][i],value:[6400000000,2800000000,1200000000,840000000,620000000,410000000,290000000,180000000,92000000,67000000][i],delay:[27.6,31.2,42.8,46.5,51.8,58.2,62.4,70.1,82.7,94.2][i],strength:[100,94,89,84,79,73,68,61,56,48][i],markets:['UNI','VIRTUAL','SOL','XRP'],extra:93,coverage:'Partial coverage'}));
function detail(){
 const w=rows[selected];if(!w){$('#wallet-detail-content').innerHTML='<div class="relationship-empty"><h3>No relationships available</h3><p>This report does not yet contain detailed wallet matches. New results will appear here when available.</p></div>';return;}
 const strength=Number.isFinite(w.strength)?Math.max(0,Math.min(100,w.strength)):null;
 const correlation=strength===null?'Unavailable':strength>=75?'High':strength>=45?'Medium':'Low';
 $('#wallet-detail-content').innerHTML=`<div class="detail-eyebrow"><span>SELECTED WALLET</span><span>${String(selected+1).padStart(2,'0')} / ${String(rows.length).padStart(2,'0')}</span></div><h3>Possible follower #${selected+1}</h3><code class="detail-address" title="${esc(w.address)}">${esc(short(w.address))}</code><div class="copy-strength"><span>Relationship copy strength</span><strong>${strength??'—'} <small>/ 100</small></strong></div><div class="copy-strength-meter"><i style="width:${strength??0}%"></i></div><dl><div><dt>Correlation</dt><dd class="correlation-value">${correlation}</dd></div><div><dt>Matched fills</dt><dd>${number(w.fills)}</dd></div><div><dt>Copied trade value</dt><dd>${compact(w.value)}</dd></div><div><dt>Average copy delay</dt><dd>${Number.isFinite(w.delay)?w.delay+'s':'—'}</dd></div></dl><span class="markets-label">MARKETS</span><div class="detail-markets">${w.markets.map(m=>'<span>'+esc(m)+'</span>').join('')}${w.extra>0?'<span>+'+number(w.extra)+' more</span>':''}${!w.markets.length?'<span>Not available</span>':''}</div><p class="relationship-meaning">Similar fills after your trades suggest a possible copying relationship. A stronger score means a closer pattern match, not proof of copying.</p><span class="coverage-label">${esc(w.coverage)}</span>`;
}
let folderOpen=true,busy=false,renderedPage=-1,returnTransform='none',closeQueued=false,frontVisible=false;
const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,reduced()?0:ms));
async function motion(element,frames,duration=620){
 if(reduced())return;
 const animation=element.animate(frames,{duration,easing:'cubic-bezier(.22,.68,.18,1)',fill:'both'});
 try{await animation.finished;}catch{}animation.cancel();
}
function face(w,i){const strength=Number.isFinite(w.strength)?w.strength:null;return `<span class="file-top"><span>WALLET DOSSIER</span><b>${String(i+1).padStart(2,'0')}</b></span><strong>${esc(short(w.address))}</strong><span class="file-correlation"><i></i>${strength===null?'Correlation unavailable':strength>=75?'High correlation':strength>=45?'Medium correlation':'Low correlation'}</span><span class="file-bottom"><span>${number(w.fills)} matched fills</span><span>↗</span></span>`;}
function draw(){
 const start=0,visible=rows.slice(0,10),nodes=$('#relationship-nodes');
 if(selected>=0&&(selected<start||selected>=start+visible.length))selected=-1;
 if(renderedPage!==start){
  nodes.replaceChildren();renderedPage=start;
  visible.forEach((w,j)=>{const i=start+j,card=document.createElement('div');card.className='wallet-file';card.style.setProperty('--slot',j);card.style.setProperty('--depth',14-j);card.style.setProperty('--angle',(j-2)*3+'deg');card.style.setProperty('--lift',Math.abs(j-2)*14+'px');card.setAttribute('aria-label',`Explore wallet ${i+1}: ${short(w.address)}`);card.innerHTML=`<span class="file-edge" aria-hidden="true"></span><button class="file-index" type="button" aria-label="Open wallet ${i+1}: ${esc(short(w.address))}"><span class="tab-number">${String(i+1).padStart(2,'0')}</span></button>`;card.querySelector('.file-index').onclick=()=>{if(!busy&&folderOpen)openCard(i,card);};nodes.append(card);});
 }
 Array.from(nodes.querySelectorAll('.wallet-file:not(.blank-file)')).forEach((card,j)=>{card.classList.toggle('active',selected===start+j);card.querySelector('.file-index').setAttribute('aria-pressed',String(selected===start+j));card.querySelector('.file-index').tabIndex=folderOpen&&selected<0?0:-1;});
 nodes.inert=!folderOpen||selected>=0;
 $('#show-wallets').hidden=true;$('#show-wallets').textContent=expanded?'← Wallets 01–05':'Wallets 06–10 →';$('#show-wallets').disabled=busy;
 $('#show-wallets').setAttribute('aria-expanded',String(expanded));
 $('#visible-wallet-count').textContent=visible.length?`${rows.length} WALLET DOSSIERS`:'NO MATCHES';
 $('#network-empty').hidden=visible.length>0;$('#replay-network').hidden=true;$('#replay-network').disabled=busy;$('#replay-network').textContent=folderOpen?'Close folder ↙':'Open folder ↗';$('#replay-network').setAttribute('aria-label',folderOpen?'Close wallet folder':'Open wallet folder');
 $('#orbit-map').classList.toggle('folder-open',folderOpen);$('#orbit-map').classList.toggle('folder-selected',selected>=0);
 $('#folder-toggle').setAttribute('aria-expanded',String(selected>=0));$('#folder-toggle').disabled=!rows.length||busy;$('#folder-hint').textContent='Choose a numbered tab to pull out a card';
 $('#relationship-detail').hidden=selected<0;$('.relationship-layout').classList.toggle('has-selection',selected>=0);
 if(selected>=0){detail();$('.flip-front').innerHTML=`<span class="front-index">${String(selected+1).padStart(2,'0')}</span><strong class="front-address">${esc(short(rows[selected].address))}</strong>`;$('#previous-file').disabled=selected===0||busy;$('#next-file').disabled=selected===rows.length-1||busy;}
 $('#network-insight').textContent='Select 01–10 to explore a wallet';window.saveReportView?.();
}
async function openCard(index,card){
 if(busy)return;busy=true;
 const source=card.getBoundingClientRect();selected=index;frontVisible=true;draw();
 const panel=$('#relationship-detail'),target=panel.getBoundingClientRect();
 const dx=source.left+source.width/2-target.left-target.width/2,dy=source.top+source.height/2-target.top-target.height/2;
 returnTransform=`translate(${dx*.2}px,${dy+75}px) scale(.66) rotateY(-180deg)`;
 panel.style.transform='rotateY(-180deg)';
 await motion(panel,[{transform:returnTransform},{transform:'translate(0,0) scale(1) rotateY(-180deg)'}],450);
 await motion(panel,[{transform:'rotateY(-180deg)'},{transform:'rotateY(0deg)'}],480);
 panel.style.transform='';

 frontVisible=false;
 busy=false;draw();if(closeQueued){closeQueued=false;closeDetail();}else $('#close-wallet-detail').focus({preventScroll:true});
}
async function closeDetail(){
 if(busy){closeQueued=true;return;}if(selected<0)return;busy=true;const previous=selected;
 const panel=$('#relationship-detail'),layout=$('.relationship-layout');
 const panelBox=panel.getBoundingClientRect(),cover=$('#folder-toggle'),coverBox=cover.getBoundingClientRect(),layoutBox=layout.getBoundingClientRect();
 panel.style.transform='rotateY(-180deg)';
 await motion(panel,[{transform:'rotateY(0deg)'},{transform:'rotateY(-180deg)'}],480);
 $('#orbit-map').classList.add('folder-returning');
 // The cover occludes the returning sheet, instead of fading the sheet out.
 const lip=cover.cloneNode(true);lip.removeAttribute('id');lip.className='return-cover';lip.disabled=true;lip.setAttribute('aria-hidden','true');
 const cs=getComputedStyle(cover);Object.assign(lip.style,{left:(coverBox.left-layoutBox.left)+'px',top:(coverBox.top-layoutBox.top)+'px',width:coverBox.width+'px',height:coverBox.height+'px',padding:cs.padding});layout.append(lip);
 const scale=Math.min(coverBox.width*.74/panelBox.width,coverBox.height*.68/panelBox.height);
 const dx=coverBox.left+coverBox.width/2-panelBox.left-panelBox.width/2;
 const dy=coverBox.top+coverBox.height*.50-panelBox.top-panelBox.height/2;
 const end=`translate(${dx}px,${dy}px) scale(${scale}) rotateY(-180deg)`;
 await motion(panel,[{transform:'translate(0,0) scale(1) rotateY(-180deg)'},{transform:end}],520);
 panel.style.transform=end;
 panel.hidden=true;lip.remove();$('#orbit-map').classList.remove('folder-returning');panel.style.transform='';
 selected=-1;frontVisible=false;busy=false;draw();$('#relationship-nodes').children[previous]?.querySelector('.file-index')?.focus({preventScroll:true});
}
async function navigateFile(direction){
 const next=selected+direction;if(busy||next<0||next>=rows.length)return;
 busy=true;draw();const content=$('#wallet-detail-content');
 await motion(content,[{transform:'translateX(0px)',opacity:1},{transform:`translateX(${-direction*20}px)`,opacity:0}],170);
 selected=next;draw();
 await motion(content,[{transform:`translateX(${direction*20}px)`,opacity:0},{transform:'translateX(0px)',opacity:1}],250);
 busy=false;draw();if(closeQueued){closeQueued=false;closeDetail();}
}
$('#previous-file').addEventListener('click',()=>navigateFile(-1));$('#next-file').addEventListener('click',()=>navigateFile(1));
$('#close-wallet-detail').addEventListener('click',closeDetail);$('#relationship-detail').addEventListener('keydown',e=>{if(e.key==='Escape')closeDetail();});
window.prepareReportDetails=report=>{
 expanded=false;selected=-1;folderOpen=true;busy=false;renderedPage=-1;isExample=report.example;
 if(isExample)rows=samples();else{const source=Array.isArray(report.data.relationships?.copier)?report.data.relationships.copier:[];rows=source.slice(0,10).map(r=>({address:r.address??r.wallet_address,fills:r.matched_fills,value:r.copied_trade_value_usd,delay:r.average_delay_seconds,strength:r.copy_strength,markets:Array.isArray(r.markets)?r.markets.filter(m=>typeof m==='string').slice(0,4):[],extra:Math.max(0,(r.markets?.length||0)-4),coverage:r.coverage==='full'?'Full coverage':'Partial coverage'}));}
 $('#network-source-address').textContent=short(report.address);$('#network-demo-label').hidden=!isExample;draw();
};
window.getReportNetworkState=()=>({selected,expanded,folderOpen});
window.restoreReportNetworkState=value=>{expanded=value?.expanded===true;selected=Number.isInteger(value?.selected)?value.selected:-1;folderOpen=true;draw();};
window.revealReportWallets=()=>{folderOpen=true;selected=-1;draw();};
$('#folder-toggle').addEventListener('click',()=>{if(selected>=0)closeDetail();else if(rows.length&&!busy)openCard(0,$('#relationship-nodes').children[0]);});
})();
