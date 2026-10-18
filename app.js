const $=s=>document.querySelector(s);
let _eventsLoaded=false,_firstPopupTimer=null,_flowPhonePending=false;
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x==b));document.querySelectorAll('.tab').forEach(t=>t.hidden=t.id!=b.dataset.t);scrollTo(0,0)});
function setView(v){document.querySelectorAll('.seg button').forEach(x=>x.classList.toggle('on',x.dataset.v==v));$('#evlist').hidden=v!='list';$('#evgrid').hidden=v!='grid'}
document.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>setView(b.dataset.v));
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=d=>new Date(d).toLocaleString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
const t12=t=>{if(!t)return'';let[h,m]=t.split(':');h=+h;return(h%12||12)+':'+m+(h<12?' AM':' PM')};
async function load(){let d;const loc=localStorage.getItem('draftEvents');
 try{d=await (await fetch('events.json')).json()}catch(e){d={events:[],past:[]}}
 $('#note').textContent=d.note||'';
 const q=new URLSearchParams(location.search).get('today');const now=q?new Date(q+'T09:00'):new Date();
 d.events=expand(d.events,now);
 const ev=d.events.sort((a,b)=>(a.start||'9').localeCompare(b.start||'9'));_events=ev;_now=now;buildMemberReminders();
 const when=e=>!e.start?'Date and time: details coming soon':e.start.length==10?new Date(e.start+'T12:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})+', time: details coming soon':fmt(e.start)+(e.end?' to '+t12(e.end):'');
 $('#evlist').innerHTML=ev.map(e=>`<div class="card${e.test?' test':''}" id="ev-${esc(e.id)}">${e.flyer?`<img class="f" src="${esc(e.flyer)}" alt="Flyer">`:''}<div class="b">
 ${e.qr?`<img class="qr" src="${esc(e.qr)}" alt="QR code">`:''}<span class="tag">${esc(e.category)}</span><h3>${esc(e.title)}</h3>
 <div><b>When:</b> ${when(e)}</div>${e.location?`<div><b>Where:</b> ${esc(e.location)}</div>`:''}${e.doors?`<div><b>Doors:</b> ${t12(e.doors)}</div>`:''}${e.price?`<div><b>Price:</b> ${esc(e.price)}</div>`:''}<p class="small">${esc(e.description)}</p>
 ${(e.recurring||e.category=='Meeting'||e.zoomUrl)?zoomHTML(e,now):''}<a class="big" href="${esc(e.rsvp)}">RSVP</a></div></div>`).join('')||'<p>No events posted yet.</p>';
const _rtexts=[];(d.reminders||[]).forEach(r=>{const pd=x=>new Date(x.length==10?x+'T00:00':x);const e=ev.filter(x=>x.id==r.eventId||x.id.startsWith(r.eventId+'-')).find(x=>pd(x.start)>now);if(!e||!e.start)return;const t=pd(e.start);if(now>=new Date(t-r.remindDaysBefore*864e5)&&now<t){_rtexts.push(r.text.replace('{date}',new Date(e.start.length==10?e.start+'T12:00':e.start).toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})))}});if(_rtexts.length){const _rel=$('#remind');_rel.hidden=false;_rel.innerHTML=_rtexts.map(t=>`<div>${esc(t)}</div>`).join('')}
 const months=[0,1].map(i=>{const x=new Date(now.getFullYear(),now.getMonth()+i,1);return[x.getFullYear(),x.getMonth()]});
 $('#evgrid').innerHTML=months.map(([y,m])=>{const first=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate();let c='SMTWTFS'.split('').map(x=>`<div class="h">${x}</div>`).join('')+'<div></div>'.repeat(first);
  for(let i=1;i<=n;i++){const k=`${y}-${String(m+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;const e=ev.find(x=>x.start&&x.start.startsWith(k));const rr=(d.rentals||[]).find(x=>x.date==k);const cls=(e?'e':'')+(e&&!e.test?' real':'')+(rr?' r':'');const lab=rr?'<small>Rented</small>':'';c+=e?`<div class="${cls}" onclick="document.querySelector('.seg button').click();document.getElementById('ev-${e.id}').scrollIntoView()">${i}${lab}</div>`:`<div class="${cls}">${i}${lab}</div>`}
  return`<div class="mon"><h3>${new Date(y,m,1).toLocaleString('en-US',{month:'long',year:'numeric'})}</h3><div class="g">${c}</div></div>`}).join('')+'<p class="small legend"><span class="lg e"></span> Event &nbsp; <span class="lg r"></span> Hall Rented (private)</p>';
 $('#rentals').innerHTML=(d.rentals||[]).map(r=>`<div class="rent"><b>Hall Rented${r.test?' (TEST)':''}</b><br>${new Date(r.date+'T12:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}, ${t12(r.start)} to ${t12(r.end)}<br><span class="small">${esc(r.type)}, private event</span></div>`).join('');
 prefillContactForms();
 _whenFn=when;_eventsLoaded=true;maybeShowFirstEventPopup();
 $('#past').innerHTML=(d.past||[]).map(p=>`<div class="past">${p.flyer?`<img src="${esc(p.flyer)}" alt="">`:''}<div><b>${esc(p.title)}</b><br><span class="small">${new Date(p.date+'T12:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</span></div></div>`).join('');
}
load();
prefillContactForms();
$('#hallform').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);const mem=f.get('Member');if(mem){saveSignup(f.get('Phone'),mem=='yes');if(mem=='yes'&&f.get('Date'))addMemberReminders('Hall Rental ('+(f.get('Date'))+')',f.get('Date')+'T'+(f.get('Start')||'12:00'),f.get('Phone'))}let body='Hall rental request\n\n';for(const[k,v]of f)body+=`${k}: ${v}\n`;
 location.href='mailto:VFW7243@yahoo.com?subject='+encodeURIComponent('Hall Rental Request '+f.get('Date'))+'&body='+encodeURIComponent(body)};
const dlg=$('#phone');
function ask(){prefillContactForms();const ans=getStoredContact().memberAnswer;const y=$('#memYes'),n=$('#memNo');if(y)y.checked=ans=='yes';if(n)n.checked=ans=='no';const er=$('#memErr');if(er)er.hidden=true;dlg.showModal()}
$('#pf').onsubmit=e=>{const save=e.submitter&&e.submitter.value=='save';if(save&&$('#ph').value.trim()){const c=document.querySelector('input[name="isMember"]:checked');if(!c){e.preventDefault();$('#memErr').hidden=false;return}localStorage.setItem('phone',$('#ph').value.trim());saveSignup($('#ph').value.trim(),c.value=='yes')}else if(e.submitter&&e.submitter.value=='skip'&&!$('#ph').value.trim()){localStorage.removeItem('phone');localStorage.removeItem('reminderSignup');localStorage.removeItem('isMember');localStorage.setItem('memberReminders','[]')}localStorage.setItem('asked','1')};
$('#alerts').onclick=ask;
/* First-open flow (Javier spec, v12): phone FIRST, then 4-second first-event pop-up, then calendar.
   What was wrong before: a permanent localStorage 'asked' flag was set on ANY Skip / empty Save
   (and by other saves), so after one dismissal the modal never auto-showed again even with no
   phone saved; it was also not sequenced with load/calendar. Now the auto-ask is gated on
   having NO saved phone, shows right away on script load, and only suppresses repeats for
   that session on Skip/close (sessionStorage), so a saved phone never asks again while an
   unsaved visitor is asked again on a later fresh open until they save. */
setView('grid');
(function firstOpenPhone(){
  const saved=getStoredContact().phone;
  if(saved){return}
  if(sessionStorage.getItem('phoneAskDoneThisSession')=='1'){return}
  _flowPhonePending=true;
  try{ask()}catch(e){_flowPhonePending=false}
})();
$('#phone').addEventListener('close',()=>{sessionStorage.setItem('phoneAskDoneThisSession','1');if(_flowPhonePending){_flowPhonePending=false;maybeShowFirstEventPopup()}});
$('#firstEventClose').onclick=e=>{e.stopPropagation();closeFirstEventPopup()};
$('#firstEvent').addEventListener('close',()=>{if(_firstPopupTimer){clearTimeout(_firstPopupTimer);_firstPopupTimer=null}});
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
$('#donateBtn').onclick=()=>$('#donate').showModal();
$('#cause').onchange=()=>$('#cause').classList.toggle('urgent',$('#cause').value=='Utilities');
$('#giveBtn').onclick=()=>{const c=$('#cause').value;location.href='mailto:VFW7243@yahoo.com?subject='+encodeURIComponent('Donation: '+c)+'&body='+encodeURIComponent('I would like to donate to: '+c+'\n\nName:\nPhone:\nAmount:\n')};
$('#closeDonate').onclick=()=>$('#donate').close();


function firstSat(y,m){const d=new Date(y,m,1);d.setDate(1+(6-d.getDay()+7)%7);return d}
function nextFirstSats(now,n,time){const out=[];let y=now.getFullYear(),m=now.getMonth();while(out.length<n){const d=firstSat(y,m);const[h,mi]=time.split(':');d.setHours(+h,+mi);if(d>now)out.push(d);m++;if(m>11){m=0;y++}}return out}
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
function expand(list,now){const out=[];list.forEach(e=>{if(e.recurring!='firstSaturday'){out.push(e);return}nextFirstSats(now,3,e.time).forEach((d,i)=>out.push({...e,id:e.id+'-'+iso(d).slice(0,10),start:iso(d),flyer:'',title:e.title+(i?'':' (Next)')}))});return out}
const TZ='America/Los_Angeles';let _events=[],_now=new Date();
const laDay=d=>new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).format(d instanceof Date?d:new Date(d));
function zoomHTML(e,now){const day=e.start?String(e.start).slice(0,10):'';const isDay=!!day&&day===laDay(now||new Date());const txt='Join on Zoom \u2014 Click here';
 if(isDay)return e.zoomUrl?`<a class="big zoom" href="${esc(e.zoomUrl)}" target="_blank" rel="noopener">${txt}</a>${e.zoomMeetingId?`<p class="small zoomday">Meeting ID: ${esc(e.zoomMeetingId)}${e.zoomPasscode?' &middot; Passcode: '+esc(e.zoomPasscode):''}</p>`:''}`:`<button class="big zoom" disabled>${txt}: Zoom link coming soon</button>`;
 return `<p class="small zoomday">On Zoom: the &ldquo;${txt}&rdquo; button appears here on meeting day${day?' ('+day+')':''}.${e.zoomUrl?'':' Zoom link coming soon.'}</p>`}
function getSignup(){try{return JSON.parse(localStorage.getItem('reminderSignup')||'null')}catch(x){return null}}
function memberSchedule(events,signup,now){if(!signup||!signup.isMember||!signup.phone)return[];const out=[];(events||[]).forEach(e=>{if(!e.start)return;const isMeeting=e.category=='Meeting'||e.recurring||String(e.id).startsWith('membership');if(!isMeeting)return;const st=new Date(e.start.length==10?e.start+'T12:00':e.start);if(!(st>now))return;[14,1].forEach(off=>{const rd=new Date(st);rd.setDate(rd.getDate()-off);if(rd<=now)return;out.push({eventId:e.id,title:e.title,eventStart:e.start,remindAt:rd.toISOString(),remindDaysBefore:off,channel:'sms',phone:signup.phone,timezone:TZ,status:'scheduled-pending-sms-backend'})})});return out.sort((a,b)=>a.remindAt.localeCompare(b.remindAt))}
function buildMemberReminders(){const s=getSignup();const sched=s?memberSchedule(_events,s,_now):[];try{localStorage.setItem('memberReminders',JSON.stringify(sched))}catch(x){}return sched}
function getStoredContact(){const s=getSignup();const phone=(s&&s.phone)||localStorage.getItem('phone')||'';const ans=(s&&s.memberAnswer)||localStorage.getItem('isMember')||'';return{phone:String(phone).trim(),memberAnswer:ans}}
function prefillContactForms(){const c=getStoredContact();if(!c.phone&&!c.memberAnswer)return;document.querySelectorAll('input[name="Phone"],input#ph').forEach(i=>{if(c.phone)i.value=c.phone});document.querySelectorAll('input[name="Member"],input[name="isMember"]').forEach(r=>{if(c.memberAnswer)r.checked=r.value==c.memberAnswer});}
function saveSignup(phone,isMember){const s={phone:String(phone||'').trim(),isMember:!!isMember,memberAnswer:isMember?'yes':'no',signedUpAt:new Date().toISOString(),timezone:TZ,reminderOffsetsDays:isMember?[14,1]:[]};try{localStorage.setItem('reminderSignup',JSON.stringify(s));localStorage.setItem('isMember',s.memberAnswer);if(s.phone){localStorage.setItem('phone',s.phone);localStorage.setItem('asked','1')}}catch(x){}buildMemberReminders();prefillContactForms();return s}
function addMemberReminders(title,startIso,phone){if(!startIso)return;const st=new Date(startIso.length==10?startIso+'T12:00':startIso);if(isNaN(st))return;let cur=[];try{cur=JSON.parse(localStorage.getItem('memberReminders')||'[]')}catch(x){}[14,1].forEach(off=>{const rd=new Date(st);rd.setDate(rd.getDate()-off);const r={eventId:'',title:title,eventStart:startIso,remindAt:rd.toISOString(),remindDaysBefore:off,channel:'sms',phone:String(phone||'').trim(),timezone:TZ,status:'scheduled-pending-sms-backend'};if(!cur.some(x=>x.title==r.title&&x.remindDaysBefore==off))cur.push(r)});cur.sort((a,b)=>a.remindAt.localeCompare(b.remindAt));try{localStorage.setItem('memberReminders',JSON.stringify(cur))}catch(x){}}

let _whenFn=null;
function eventWhenForPopup(e){if(_whenFn)return _whenFn(e);return e&&e.start?String(e.start):''}
function firstUpcomingEvent(){
  if(!_events||!_events.length)return null;
  const now=_now||new Date();
  for(const e of _events){
    if(!e.start)continue;
    // Date-only (all-day) events count as upcoming through the end of that day.
    const end=new Date(e.start.length==10?e.start+'T23:59:59':e.start);
    if(!isNaN(end)&&end>=now)return e;
  }
  return null;
}
function closeFirstEventPopup(){const d=$('#firstEvent');if(d&&d.open)d.close()}
function openFirstEvent(e){
  closeFirstEventPopup();
  // Landing view is the calendar, but tapping the pop-up opens the event card (list view).
  setView('list');
  const el=document.getElementById('ev-'+e.id);
  if(el){el.scrollIntoView({behavior:'smooth',block:'start'});el.style.outline='3px solid #9B1B30';setTimeout(()=>{el.style.outline=''},2500)}
}
function maybeShowFirstEventPopup(){
  const dlg=$('#firstEvent');if(!dlg||dlg.open)return;
  if(sessionStorage.getItem('firstEventPopupShown')=='1')return; // once per open/session
  const phoneDlg=$('#phone');if(phoneDlg&&phoneDlg.open)return; // phone first; close handler re-calls this
  if(!_eventsLoaded)return; // load() re-calls this
  const e=firstUpcomingEvent();if(!e)return;
  sessionStorage.setItem('firstEventPopupShown','1');
  const body=$('#firstEventBody');
  body.innerHTML=e.flyer
    ? `<div class="firstpop-kicker">Coming up at the Post</div><img src="${esc(e.flyer)}" alt="Flyer for ${esc(e.title)}"><h3 style="text-align:center;color:#1B2A4A">${esc(e.title)}</h3><p style="text-align:center"><b>${esc(eventWhenForPopup(e))}</b></p>`
    : `<div class="firstpop-card"><div class="firstpop-kicker">Coming up at the Post</div><h3>${esc(e.title)}</h3><p><b>${esc(eventWhenForPopup(e))}</b></p>${e.location?`<p>${esc(e.location)}</p>`:''}</div>`;
  body.onclick=()=>openFirstEvent(e);
  try{dlg.showModal()}catch(x){return}
  if(_firstPopupTimer)clearTimeout(_firstPopupTimer);
  _firstPopupTimer=setTimeout(()=>{closeFirstEventPopup()},4000); // auto-dismiss after exactly 4 seconds
}
