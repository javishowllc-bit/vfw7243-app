const $=s=>document.querySelector(s);
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x==b));document.querySelectorAll('.tab').forEach(t=>t.hidden=t.id!=b.dataset.t);scrollTo(0,0)});
document.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.seg button').forEach(x=>x.classList.toggle('on',x==b));$('#evlist').hidden=b.dataset.v!='list';$('#evgrid').hidden=b.dataset.v!='grid'});
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=d=>new Date(d).toLocaleString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
const t12=t=>{if(!t)return'';let[h,m]=t.split(':');h=+h;return(h%12||12)+':'+m+(h<12?' AM':' PM')};
async function load(){let d;const loc=localStorage.getItem('draftEvents');
 try{d=await (await fetch('events.json')).json()}catch(e){d={events:[],past:[]}}
 $('#note').textContent=d.note||'';
 const ev=d.events.sort((a,b)=>a.start.localeCompare(b.start));
 $('#evlist').innerHTML=ev.map(e=>`<div class="card" id="ev-${esc(e.id)}"><img class="f" src="${esc(e.flyer)}" alt="Flyer"><div class="b">
 <img class="qr" src="${esc(e.qr)}" alt="QR code for event info"><span class="tag">${esc(e.category)}</span><h3>${esc(e.title)}</h3>
 <div><b>When:</b> ${fmt(e.start)}</div><div><b>Doors:</b> ${t12(e.doors)}</div><div><b>Price:</b> ${esc(e.price)}</div><p class="small">${esc(e.description)}</p>
 <a class="big" href="${esc(e.rsvp)}">RSVP</a></div></div>`).join('')||'<p>No events posted yet.</p>';
 const months=[[2026,9],[2026,10]];
 $('#evgrid').innerHTML=months.map(([y,m])=>{const first=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate();let c='SMTWTFS'.split('').map(x=>`<div class="h">${x}</div>`).join('')+'<div></div>'.repeat(first);
  for(let i=1;i<=n;i++){const k=`${y}-${String(m+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;const e=ev.find(x=>x.start.startsWith(k));c+=e?`<div class="e" onclick="document.querySelector('.seg button').click();document.getElementById('ev-${e.id}').scrollIntoView()">${i}</div>`:`<div>${i}</div>`}
  return`<div class="mon"><h3>${new Date(y,m,1).toLocaleString('en-US',{month:'long',year:'numeric'})}</h3><div class="g">${c}</div></div>`}).join('');
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
