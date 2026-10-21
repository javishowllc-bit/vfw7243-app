/* Join form. Delivery: FormSubmit.co (free) once the Post email confirms activation. Until DELIVERY.enabled is true,
   submit makes the signed PDF and opens an email to the Post instead. No payment data, no SSN. */
const DELIVERY={enabled:false,endpoint:'https://formsubmit.co/VFW7243@yahoo.com',to:'VFW7243@yahoo.com'};
const $=s=>document.querySelector(s);
const QUAL=[['WWII',0,0],['Occupational Service',0,1],['Korean Service (1950-1954)',0,2],['Korea Duty (1955 - present)',0,3],['Vietnam Service',1,0],['Desert Shield/Storm',1,1],['Bosnia/Kosovo',1,2],['Global War on Terrorism Expeditionary',1,3],['Afghanistan (2001 - present)',2,0],['Iraq (2003 - 2011)',2,1],['SSBN Deterrent Patrol Insignia',2,2],['Expeditionary Operations',2,3],['Inherent Resolve (2014 - present)',3,0],['Hostile Fire/Imminent Danger Pay',3,1]];
$('#qual').innerHTML=QUAL.map((q,i)=>`<label class="chk"><input type="checkbox" name="q" value="${i}"> <span>${q[0]}</span></label>`).join('');
/* signature pad */
const cv=$('#sig'),cx=cv.getContext('2d');let drawing=false,inked=false;
function sizePad(){const r=cv.getBoundingClientRect(),d=window.devicePixelRatio||1;const keep=inked?cv.toDataURL():null;cv.width=r.width*d;cv.height=r.height*d;cx.setTransform(d,0,0,d,0,0);cx.lineWidth=2.5;cx.lineCap='round';cx.lineJoin='round';cx.strokeStyle='#0a1a3a';if(keep){const im=new Image();im.onload=()=>cx.drawImage(im,0,0,r.width,r.height);im.src=keep}}
sizePad();addEventListener('resize',sizePad);
const pt=e=>{const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
cv.addEventListener('pointerdown',e=>{e.preventDefault();drawing=true;cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);const[x,y]=pt(e);cx.beginPath();cx.moveTo(x,y)});
cv.addEventListener('pointermove',e=>{if(!drawing)return;e.preventDefault();const[x,y]=pt(e);cx.lineTo(x,y);cx.stroke();inked=true});
['pointerup','pointercancel','pointerleave'].forEach(t=>cv.addEventListener(t,()=>drawing=false));
$('#clr').onclick=()=>{cx.clearRect(0,0,cv.width,cv.height);inked=false};
const v=id=>$('#'+id).value.trim();
const mmyy=s=>s?s.slice(5,7)+'/'+s.slice(0,4):'';
const mdy=s=>s?s.slice(5,7)+'/'+s.slice(8,10)+'/'+s.slice(0,4):'';
function collect(){return{name:v('name'),email:v('email'),phone:v('phone'),dob:mdy(v('dob')),street:v('street'),apt:v('apt'),city:v('city'),state:v('state').toUpperCase(),zip:v('zip'),status:v('status'),branch:v('branch'),from:mmyy(v('from')),to:mmyy(v('to'))||'Present',loc:v('loc'),qual:[...document.querySelectorAll('input[name=q]:checked')].map(x=>+x.value),hfloc:v('hfloc'),hfdates:v('hfdates')}}
function check(d){const miss=[];['name','email','phone','dob','street','city','state','zip','status','branch','from','loc'].forEach(k=>{if(!$('#'+k).value.trim())miss.push($('label[for='+k+']').textContent.replace('*','').trim())});
 if(d.email&&!/^\S+@\S+\.\S+$/.test(d.email))miss.push('a valid email');if(!d.qual.length)miss.push('qualifying foreign service');if(!$('#attest').checked)miss.push('attestation');if(!$('#esign').checked)miss.push('e-signature consent');if(!$('#contact').checked)miss.push('contact consent');if(!inked)miss.push('signature');return miss}
/* Coordinates in PDF points on the official form (612 x 788), measured from the top. */
async function makePDF(d,when){const L=PDFLib;const src=await (await fetch('VFW-Membership-Application.pdf')).arrayBuffer();const pdf=await L.PDFDocument.load(src);const f=await pdf.embedFont(L.StandardFonts.Helvetica),fb=await pdf.embedFont(L.StandardFonts.HelveticaBold);
 const p=pdf.getPage(0),H=p.getHeight();const T=(t,x,y,s=9)=>{if(t)p.drawText(String(t),{x,y:H-y,size:s,font:f,color:L.rgb(0,0,.55)})};const X=(x,y)=>p.drawText('X',{x,y:H-y,size:10,font:fb,color:L.rgb(0,0,.55)});
 T(when.date,498,40);T(d.name,52,68);T(d.email,372,68);T(d.street,52,98);T(d.apt,288,98,8);T(d.city,354,98,8);T(d.state,462,98);T(d.zip,506,98,8);
 T(d.from,52,126,8);T(d.to,118,126,8);T(d.loc,183,126,8);T(d.dob,333,126,8);T(d.phone,443,126,8);
 X({'Active Duty':112,'Veteran':170,'Nat. Guard/Reserve':213}[d.status],157);X({'Army':366,'Navy':394,'Air Force':421,'Marines':467,'Coast Guard':505,'Space Force':560}[d.branch],157);
 const cols=[50,187.5,323,460],rows=[181.5,191.5,201.5,212];d.qual.forEach(i=>{const q=QUAL[i];X(cols[q[1]],rows[q[2]])});T(d.hfloc,500,203,7);T(d.hfdates,495,219,7);
 const png=await pdf.embedPng(cv.toDataURL('image/png'));const sc=Math.min(150/png.width,22/png.height);p.drawImage(png,{x:44,y:H-729,width:png.width*sc,height:png.height*sc});T(when.date,190,726,8);
 const q=pdf.addPage([612,792]);let y=750;const W=(t,s=10,b=false)=>{q.drawText(String(t),{x:50,y,size:s,font:b?fb:f});y-=s+6};
 W('VFW Post 7243: online membership application summary',14,true);W('Not an official membership until dues are paid via vfw.org/join or the Post Quartermaster.',9);y-=6;
 [['Name',d.name],['Email',d.email],['Phone',d.phone],['Date of birth',d.dob],['Address',[d.street,d.apt].filter(Boolean).join(', ')+', '+d.city+', '+d.state+' '+d.zip],['Military service',d.status],['Branch',d.branch],['Dates of service',d.from+' to '+d.to],['Location of foreign service',d.loc],['Qualifying service',d.qual.map(i=>QUAL[i][0]).join('; ')],['Hostile fire/IDP location and dates',[d.hfloc,d.hfdates].filter(Boolean).join(', ')||'n/a']].forEach(([k,val])=>{W(k+':',10,true);String(val).match(/.{1,95}(\s|$)/g)?.forEach(l=>W('   '+l.trim()))});
 y-=6;W('Attested to the VFW eligibility statement: yes',10);W('Agreed to sign electronically: yes',10);W('Agreed to be contacted by the Post: yes',10);W('Signed: '+when.stamp,10);
 q.drawImage(png,{x:50,y:y-60,width:png.width*Math.min(220/png.width,60/png.height),height:png.height*Math.min(220/png.width,60/png.height)});
 return pdf.save()}
$('#f').onsubmit=async e=>{e.preventDefault();const m=$('#msg');m.className='';const d=collect();const miss=check(d);if(miss.length){m.className='err';m.textContent='Please complete: '+miss.join(', ')+'.';return}
 m.textContent='Making your signed application...';const now=new Date();const when={date:now.toLocaleDateString('en-US',{month:'2-digit',day:'2-digit',year:'numeric'}),stamp:now.toLocaleString('en-US',{timeZone:'America/Los_Angeles'})+' Pacific'};
 let bytes;try{bytes=await makePDF(d,when)}catch(x){m.className='err';m.textContent='Could not make the PDF. Please use the paper application above.';return}
 const blob=new Blob([bytes],{type:'application/pdf'});const fn='VFW7243-application-'+d.name.replace(/[^A-Za-z]+/g,'-')+'.pdf';
 const summary=`VFW Post 7243 membership application\n\nName: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone}\nDate of birth: ${d.dob}\nAddress: ${[d.street,d.apt].filter(Boolean).join(', ')}, ${d.city}, ${d.state} ${d.zip}\nMilitary service: ${d.status}\nBranch: ${d.branch}\nDates of service: ${d.from} to ${d.to}\nLocation of foreign service: ${d.loc}\nQualifying service: ${d.qual.map(i=>QUAL[i][0]).join('; ')}\nHostile fire/IDP: ${[d.hfloc,d.hfdates].filter(Boolean).join(', ')||'n/a'}\nSigned: ${when.stamp}\n`;
 if(DELIVERY.enabled){try{const fm=document.createElement('form');fm.method='POST';fm.action=DELIVERY.endpoint;fm.enctype='multipart/form-data';fm.hidden=true;
   const add=(k,val)=>{const i=document.createElement('input');i.type='hidden';i.name=k;i.value=val;fm.appendChild(i)};add('_subject','New VFW Post 7243 membership application: '+d.name);add('_replyto',d.email);add('_template','box');add('_captcha','true');add('_next',new URL('thanks.html',location.href).href);add('Application',summary);
   const fi=document.createElement('input');fi.type='file';fi.name='attachment';const dt=new DataTransfer();dt.items.add(new File([blob],fn,{type:'application/pdf'}));fi.files=dt.files;fm.appendChild(fi);document.body.appendChild(fm);m.textContent='Sending...';fm.submit();return}catch(x){/* fall through to manual */}}
 const url=URL.createObjectURL(blob);$('#dl').href=url;$('#dl').download=fn;$('#mail').href='mailto:'+DELIVERY.to+'?subject='+encodeURIComponent('VFW Post 7243 membership application: '+d.name)+'&body='+encodeURIComponent(summary+'\nSigned PDF attached.');$('#after').hidden=false;
 m.textContent='Your signed application is ready. Save your copy, then email it to the Post.'};
