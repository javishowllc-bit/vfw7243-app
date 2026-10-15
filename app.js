const $=s=>document.querySelector(s);
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x==b));document.querySelectorAll('.tab').forEach(t=>t.hidden=t.id!=b.dataset.t);scrollTo(0,0)});
document.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.seg button').forEach(x=>x.classList.toggle('on',x==b));$('#evlist').hidden=b.dataset.v!='list';$('#evgrid').hidden=b.dataset.v!='grid'});
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=d=>new Date(d).toLocaleString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
const t12=t=>{if(!t)return'';let[h,m]=t.split(':');h=+h;return(h%12||12)+':'+m+(h<12?' AM':' PM')};
async function load(){let d;const loc=localStorage.getItem('draftEvents');
 try{d=await (await fetch('events.json')).json()}catch(e){d={events:[],past:[]}}
 $('#note').textContent=d.note||'';
 const ev=d.events.sort((a,b)=>(a.start||'9').localeCompare(b.start||'9'));
 const when=e=>!e.start?'Date and time: details coming soon':e.start.length==10?new Date(e.start+'T12:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})+', time: details coming soon':fmt(e.start)+(e.end?' to '+t12(e.end):'');
 $('#evlist').innerHTML=ev.map(e=>`<div class="card${e.test?' test':''}" id="ev-${esc(e.id)}">${e.flyer?`<img class="f" src="${esc(e.flyer)}" alt="Flyer">`:''}<div class="b">
 ${e.qr?`<img class="qr" src="${esc(e.qr)}" alt="QR code">`:''}<span class="tag">${esc(e.category)}</span><h3>${esc(e.title)}</h3>
 <div><b>When:</b> ${when(e)}</div>${e.location?`<div><b>Where:</b> ${esc(e.location)}</div>`:''}${e.doors?`<div><b>Doors:</b> ${t12(e.doors)}</div>`:''}${e.price?`<div><b>Price:</b> ${esc(e.price)}</div>`:''}<p class="small">${esc(e.description)}</p>
 ${e.potluck?potluckHTML(d):`<a class="big" href="${esc(e.rsvp)}">RSVP</a>`}</div></div>`).join('')||'<p>No events posted yet.</p>';
 const q=new URLSearchParams(location.search).get('today');const now=q?new Date(q+'T09:00'):new Date();(d.reminders||[]).forEach(r=>{const e=ev.find(x=>x.id==r.eventId);if(!e||!e.start)return;const t=new Date(e.start);if(now>=new Date(t-r.remindDaysBefore*864e5)&&now<t){$('#remind').hidden=false;$('#remind').textContent=r.text}});
 const months=[[2026,9],[2026,10]];
 $('#evgrid').innerHTML=months.map(([y,m])=>{const first=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate();let c='SMTWTFS'.split('').map(x=>`<div class="h">${x}</div>`).join('')+'<div></div>'.repeat(first);
  for(let i=1;i<=n;i++){const k=`${y}-${String(m+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;const e=ev.find(x=>x.start&&x.start.startsWith(k));const rr=(d.rentals||[]).find(x=>x.date==k);const cls=(e?'e':'')+(rr?' r':'');const lab=rr?'<small>Rented</small>':'';c+=e?`<div class="${cls}" onclick="document.querySelector('.seg button').click();document.getElementById('ev-${e.id}').scrollIntoView()">${i}${lab}</div>`:`<div class="${cls}">${i}${lab}</div>`}
  return`<div class="mon"><h3>${new Date(y,m,1).toLocaleString('en-US',{month:'long',year:'numeric'})}</h3><div class="g">${c}</div></div>`}).join('')+'<p class="small legend"><span class="lg e"></span> Event &nbsp; <span class="lg r"></span> Hall Rented (private, TEST)</p>';
 $('#rentals').innerHTML=(d.rentals||[]).map(r=>`<div class="rent"><b>Hall Rented${r.test?' (TEST)':''}</b><br>${new Date(r.date+'T12:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}, ${t12(r.start)} to ${t12(r.end)}<br><span class="small">${esc(r.type)}, private event</span></div>`).join('');
 const pf=document.getElementById('potform');if(pf)pf.onsubmit=potSubmit;
 $('#past').innerHTML=(d.past||[]).map(p=>`<div class="past">${p.flyer?`<img src="${esc(p.flyer)}" alt="">`:''}<div><b>${esc(p.title)}</b><br><span class="small">${new Date(p.date+'T12:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</span></div></div>`).join('');
}
load();
$('#hallform').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);let body='Hall rental request\n\n';for(const[k,v]of f)body+=`${k}: ${v}\n`;
 location.href='mailto:VFW7243@yahoo.com?subject='+encodeURIComponent('Hall Rental Request '+f.get('Date'))+'&body='+encodeURIComponent(body)};
const dlg=$('#phone');
function ask(){$('#ph').value=localStorage.getItem('phone')||'';dlg.showModal()}
$('#pf').onsubmit=e=>{if(e.submitter&&e.submitter.value=='save'&&$('#ph').value.trim())localStorage.setItem('phone',$('#ph').value.trim());else if(e.submitter&&e.submitter.value=='skip'&&!$('#ph').value.trim())localStorage.removeItem('phone');localStorage.setItem('asked','1')};
$('#alerts').onclick=ask;
if(!localStorage.getItem('asked'))ask();
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
$('#donateBtn').onclick=()=>$('#donate').showModal();
$('#cause').onchange=()=>$('#cause').classList.toggle('urgent',$('#cause').value=='Utilities');
$('#giveBtn').onclick=()=>{const c=$('#cause').value;location.href='mailto:VFW7243@yahoo.com?subject='+encodeURIComponent('Donation: '+c)+'&body='+encodeURIComponent('I would like to donate to: '+c+'\n\nName:\nPhone:\nAmount:\n')};
$('#closeDonate').onclick=()=>$('#donate').close();

function potluckHTML(d){return`<div class="pot" id="potluck"><h4>Potluck Sign-Up (TEST)</h4><form id="potform">
<label>Name<input name="Name" required></label><label>Phone<input name="Phone" type="tel" required></label>
<label>Number of guests<input name="Guests" type="number" min="1" value="1" required></label>
<label>What will you bring? (category)<select name="Category" required><option value="">Choose one</option><option>Main dish</option><option>Side</option><option>Dessert</option><option>Drinks</option><option>Plates/Utensils</option><option>Other</option></select></label>
<label>What will you bring? (item)<input name="Item" required placeholder="Example: Chicken enchiladas"></label>
<button class="big">Sign Up by Email</button></form><p class="small">Opens your email app addressed to VFW7243@yahoo.com.</p>
<h4>Who's bringing what (TEST sample)</h4><ul class="who">${(d.potluckSample||[]).map(p=>`<li><b>${esc(p.cat)}:</b> ${esc(p.item)} <span class="small">(${esc(p.name)})</span></li>`).join('')}</ul></div>`}
function potSubmit(e){e.preventDefault();const f=new FormData(e.target);let body='Halloween Party Potluck sign-up (TEST)\n\n';for(const[k,v]of f)body+=`${k}: ${v}\n`;
location.href='mailto:VFW7243@yahoo.com?subject='+encodeURIComponent('Potluck Sign-Up: '+f.get('Category'))+'&body='+encodeURIComponent(body)}
