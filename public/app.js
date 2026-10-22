(() => {
'use strict';
const $ = s => document.querySelector(s), stage=$('#stage'), address=$('#address');
const sample='0xecb63caa47c7c4e77f60f1ce858cf28dc2b82b00';
const valid=s=>/^0x[0-9a-f]{40}$/i.test(s), short=s=>s.slice(0,6)+'…'+s.slice(-4), reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let busy=false,report=null,generation=0,unlocked=false,restoring=false;
const viewKey='shieldtx.report-view.v1';
function saveReportView(){if(restoring)return;try{sessionStorage.setItem(viewKey,JSON.stringify({version:1,page:$('#results').hidden?'landing':'results',report,unlocked,network:window.getReportNetworkState?.(),scrollY:window.scrollY}));}catch{}}
window.saveReportView=saveReportView;
window.addEventListener('pagehide',saveReportView);
const sleep=ms=>new Promise(r=>setTimeout(r,reduced?40:ms));
function state(s,label){stage.dataset.state=s;$('#machine-state').textContent=label;$('#scan-progress').textContent=label;}
function reset(){generation++;busy=false;state('idle','');$('#demo-hint').textContent='30-day public exposure analysis';$('#demo-caption').textContent='SCANNER PREVIEW';$('#submit').disabled=false;$('#example').disabled=false;}
address.addEventListener('input',()=>{$('#clear').hidden=!address.value;$('#error').textContent='';address.removeAttribute('aria-invalid');});
$('#clear').addEventListener('click',()=>{address.value='';address.dispatchEvent(new Event('input'));address.focus();});
const apiUrl=a=>'https://scanner.shieldtx.xyz/api/v1/scan/'+encodeURIComponent(a);
async function run(example=false){if(busy)return;const a=example?sample:address.value.trim().toLowerCase();if(!valid(a)){$('#error').textContent='Enter a valid address: 0x followed by 40 hexadecimal characters.';address.setAttribute('aria-invalid','true');address.focus();return;}
 reset();const runId=generation;address.value=a;$('#clear').hidden=false;$('#error').textContent='';$('#submit').disabled=true;$('#example').disabled=true;$('#demo-caption').textContent=example?'EXAMPLE REPORT':'PUBLIC DATA SCAN';busy=true;
 const controller=new AbortController(), timeout=setTimeout(()=>controller.abort(),12000);
 const dataPromise=(async()=>{if(example){const r=await fetch('assets/example-report.json');if(!r.ok)throw Error('Example unavailable');return r.json();}const r=await fetch(apiUrl(a),{signal:controller.signal,headers:{Accept:'application/json'},credentials:'omit'});if(!r.ok)throw Error('Scan unavailable');const d=await r.json();if(d.address?.toLowerCase()!==a)throw Error('Invalid response');return d;})().then(data=>({data}),error=>({error}));
 state('scanning','CHECKING PATTERNS');$('#demo-hint').textContent='Looking for matching trading activity';
 try{const [outcome]=await Promise.all([dataPromise,sleep(1700)]);if(outcome.error)throw outcome.error;const data=outcome.data;if(generation!==runId)return;report={data,address:a,example};state('done','COMPLETE');$('#demo-hint').textContent='Your report is ready';await sleep(400);if(generation===runId)renderReport();}
 catch(e){if(generation!==runId)return;reset();$('#error').textContent='The scanner is unavailable right now. Please retry, or explore the example report.';$('#demo-hint').textContent='Try the example to explore the design';}
 finally{clearTimeout(timeout);if(generation===runId){busy=false;$('#submit').disabled=false;$('#example').disabled=false;}}
}
$('#scan-form').addEventListener('submit',e=>{e.preventDefault();run();});$('#example').addEventListener('click',()=>run(true));
function renderReport(){window.prepareExposureShare?.(report);const {data:d,address:a,example}=report;$('#landing').hidden=true;$('#results').hidden=false;$('#back').hidden=false;$('.header-link').hidden=true;$('#result-address').textContent=a;$('#score').textContent=Number.isFinite(d.exposure_score)?d.exposure_score:'—';$('#followers').textContent=Number.isFinite(d.copier_count)?d.copier_count.toLocaleString('en-US'):'—';$('#score-label').textContent=Number.isFinite(d.exposure_score)?(d.exposure_score>70?'High exposure':d.exposure_score>40?'Moderate exposure':'Lower exposure'):'Insufficient data';$('.score-card').dataset.exposure=Number.isFinite(d.exposure_score)?(d.exposure_score>70?'high':d.exposure_score>40?'medium':'low'):'unknown';$('#meter').style.width=Math.max(0,Math.min(100,d.exposure_score||0))+'%';$('#source-note').textContent=example?'Official example snapshot retrieved 19 Oct 2026 · Dataset through 16 Sep 2026 · Partial coverage. These are saved results, not a fresh scan.':`ShieldTX public scanner · ${d.stale?'Delayed dataset · ':''}${d.data_quality==='partial'?'Partial coverage':'See full report for coverage'}.`;window.prepareReportDetails(report);$('#followers-status').textContent=d.copier_count_status==='partial'?'Partial coverage':'30-day analysis';setReportUnlocked(false);history.replaceState(null,'','#results');$('#result-title').focus({preventScroll:true});window.scrollTo(0,0);}
function setReportUnlocked(value){unlocked=value;$('.unlock').hidden=value;$('#unlocked-toolbar').hidden=!value;$('#wallet-lock-box').hidden=value;$('#unlocked-details').hidden=!value;if(value)window.revealReportWallets?.();$('#impact-blur').hidden=value;$('#impact-lock').hidden=value;$('#impact-unavailable').hidden=!value;if(value)window.animateImpact?.();$('#delay').textContent=value&&report?.example?'27.6s':'—';$('#delay-note').textContent=value&&report?.example?'Illustrative average copy time':'Not available in this report';if(report&&!$('#results').hidden)history.replaceState(null,'',value?'#unlocked':'#results');saveReportView();}
$('#email-unlock').addEventListener('submit',e=>{e.preventDefault();if(!$('#email-unlock').reportValidity()||!report)return;$('#report-email').value='';setReportUnlocked(true);$('#back-to-summary').focus();});
$('#back-to-summary').addEventListener('click',()=>{setReportUnlocked(false);$('#report-email').focus();});
function home(e){e?.preventDefault();reset();history.replaceState(null,'',location.pathname);$('#results').hidden=true;$('#landing').hidden=false;$('#back').hidden=true;$('.header-link').hidden=false;$('#error').textContent='';unlocked=false;window.scrollTo(0,0);saveReportView();}
$('#back').addEventListener('click',home);$('.brand').addEventListener('click',home);
$('#share').addEventListener('click',()=>{if(report)window.openExposureShare(report);});
function restoreReportView(){
 let saved;try{saved=JSON.parse(sessionStorage.getItem(viewKey));}catch{return false;}
 if(!saved||saved.version!==1||saved.page!=='results'||!saved.report||!valid(saved.report.address)||!saved.report.data||typeof saved.report.data!=='object')return false;
 restoring=true;
 try{report=saved.report;address.value=report.address;$('#clear').hidden=false;renderReport();setReportUnlocked(saved.unlocked===true);window.restoreReportNetworkState?.(saved.network);requestAnimationFrame(()=>requestAnimationFrame(()=>window.scrollTo(0,Number.isFinite(saved.scrollY)?saved.scrollY:0)));return true;}finally{restoring=false;}
}
if(!restoreReportView()&&['#results','#unlocked'].includes(location.hash)){const startUnlocked=location.hash==='#unlocked';run(true).then(()=>{if(startUnlocked&&report)setReportUnlocked(true);});}
})();
