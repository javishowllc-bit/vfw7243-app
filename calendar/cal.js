const $=s=>document.querySelector(s);const TZ='America/Los_Angeles';let EV=[],Y,M;
const pad=n=>String(n).padStart(2,'0');
const laNow=()=>{const p=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());return p};
function firstSats(n){const out=[];const t=laNow();let y=+t.slice(0,4),m=+t.slice(5,7)-1;while(out.length<n){const d=new Date(y,m,1);d.setDate(1+(6-d.getDay()+7)%7);const k=y+'-'+pad(m+1)+'-'+pad(d.getDate());if(k>=t)out.push(k);m++;if(m>11){m=0;y++}}return out}
function expand(list){const out=[];list.forEach(e=>{if(e.recurring=='firstSaturday'){firstSats(3).forEach(k=>out.push({...e,id:e.id+'-'+k,start:k+'T'+e.time}))}else if(e.start)out.push(e)});return out.sort((a,b)=>a.start.localeCompare(b.start))}
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function t12(hm){let[h,m]=hm.split(':').map(Number);const ap=h>=12?'PM':'AM';h=h%12||12;return h+':'+pad(m)+' '+ap}
function when(e){const d=new Date(e.start.slice(0,10)+'T12:00');const ds=d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});if(e.start.length==10)return ds+', all day';return ds+', '+t12(e.start.slice(11,16))+(e.end?' to '+t12(e.end):'')}
function gcal(e){const s=e.start.replace(/[-:]/g,'');let dates;if(e.start.length==10){const n=new Date(e.start+'T12:00');n.setDate(n.getDate()+1);dates=s+'/'+n.getFullYear()+pad(n.getMonth()+1)+pad(n.getDate())}else{const end=e.end?s.slice(0,9)+e.end.replace(':','')+'00':s.slice(0,9)+pad(+s.slice(9,11)+2)+s.slice(11,13)+'00';dates=s.slice(0,13)+'00/'+end}
return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(e.title)+'&dates='+dates+'&ctz='+TZ+'&details='+encodeURIComponent(e.description||'')+'&location='+encodeURIComponent(e.location||'')}
function icsHref(e){const s=e.start.replace(/[-:]/g,'');const st=e.start.length==10?'DTSTART;VALUE=DATE:'+s:'DTSTART;TZID='+TZ+':'+s+'00';const en=e.end&&e.start.length>10?'\r\nDTEND;TZID='+TZ+':'+s.slice(0,9)+e.end.replace(':','')+'00':'';const x=v=>String(v||'').replace(/([,;\\])/g,'\\$1');
const body='BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//VFW Post 7243//EN\r\nBEGIN:VEVENT\r\nUID:'+e.id+'@vfw7243-app\r\nDTSTAMP:20261021T000000Z\r\n'+st+en+'\r\nSUMMARY:'+x(e.title)+'\r\nLOCATION:'+x(e.location)+'\r\nDESCRIPTION:'+x(e.description)+'\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n';return 'data:text/calendar;charset=utf-8,'+encodeURIComponent(body)}
function evHTML(e){const f=e.id=='veterans-day-2026-city'?'../city/veterans-day-2026.ics':icsHref(e);return `<div class="ev"><b>${esc(e.title)}</b><div class="when">${esc(when(e))}</div>${e.location?`<div class="small">${esc(e.location)}</div>`:''}<div class="small">${esc(e.description)}</div><div class="acts"><a class="big alt" href="${f}" download="${esc(e.id)}.ics">Add to Calendar</a><a class="big ghost" href="${gcal(e)}" target="_blank" rel="noopener">Google Calendar</a></div></div>`}
const kind=e=>String(e.id).startsWith('veterans-day')?'vet':String(e.id).startsWith('membership')?'meet':'';
function render(){const first=new Date(Y,M,1).getDay(),n=new Date(Y,M+1,0).getDate(),tk=laNow();$('#mname').textContent=new Date(Y,M,1).toLocaleDateString('en-US',{month:'long',year:'numeric'});
let h=['S','M','T','W','T','F','S'].map(x=>`<div class="dow">${x}</div>`).join('');for(let i=0;i<first;i++)h+='<div></div>';
for(let d=1;d<=n;d++){const k=Y+'-'+pad(M+1)+'-'+pad(d);const l=EV.filter(e=>e.start.slice(0,10)==k);const kk=l.map(kind).find(Boolean)||'';const lab=kk=='vet'?'Veterans Day':kk=='meet'?'Meeting':l.length?l.length+(l.length>1?' games':' game'):'';
h+=`<button class="day ${l.length?'has':''} ${kk} ${k==tk?'today':''}" data-k="${k}" aria-label="${k}">${d}<span class="dot">${lab}</span></button>`}
$('#grid').innerHTML=h;document.querySelectorAll('.day.has').forEach(b=>b.onclick=()=>{const l=EV.filter(e=>e.start.slice(0,10)==b.dataset.k);$('#dayList').innerHTML=l.map(evHTML).join('');$('#dayList').scrollIntoView({behavior:'smooth'})})}
function openCal(){render();const c=$('#cal');if(c.showModal)c.showModal();else c.setAttribute('open','')}
async function init(){let d={events:[]};try{d=await(await fetch('../events.json',{cache:'no-store'})).json()}catch(x){}
const t=laNow();EV=expand(d.events||[]).filter(e=>e.start.slice(0,10)>=t);Y=+t.slice(0,4);M=+t.slice(5,7)-1;
const vet=EV.find(e=>kind(e)=='vet');const meet=EV.find(e=>kind(e)=='meet');
$('#featured').innerHTML=[vet,meet].filter(Boolean).map(e=>`<div class="feat">${evHTML(e)}</div>`).join('');
$('#list').innerHTML='<h2 style="margin-top:14px">Coming up</h2>'+EV.filter(e=>kind(e)).concat(EV.filter(e=>!kind(e)).slice(0,8)).sort((a,b)=>a.start.localeCompare(b.start)).map(evHTML).join('');
$('#prev').onclick=()=>{M--;if(M<0){M=11;Y--}render()};$('#next').onclick=()=>{M++;if(M>11){M=0;Y++}render()};
$('#openCal').onclick=openCal;$('#closeCal').onclick=()=>$('#cal').close();$('#goSign').onclick=()=>{$('#cal').close();$('#ph').focus()};
if(!/nopop/.test(location.hash))openCal()}
$('#sf').onsubmit=ev=>{ev.preventDefault();const ph=$('#ph').value.trim(),em=$('#em').value.trim(),m=(document.querySelector('input[name=mem]:checked')||{}).value||'Not answered';const er=$('#err');
if(ph.replace(/\D/g,'').length<10){er.textContent='Please enter a 10 digit cell phone number.';er.hidden=false;return}
if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){er.textContent='Please enter a valid email.';er.hidden=false;return}er.hidden=true;
try{localStorage.setItem('vfw7243Signup',JSON.stringify({ph,em,m,at:new Date().toISOString()}))}catch(x){}
const body='Please add me to VFW Post 7243 event notifications.\n\nCell phone: '+ph+'\nEmail: '+em+'\nVFW member: '+m+'\n\nI agree the Post may text and email me event reminders.';
location.href='mailto:VFW7243@yahoo.com?subject='+encodeURIComponent('Event notifications sign-up')+'&body='+encodeURIComponent(body);
$('#done').innerHTML='Thank you. Your email app opened with your sign-up. Tap Send to finish.';$('#done').hidden=false};
init();
