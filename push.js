// Free Web Push for Membership Meeting reminders only.
const VAPID_PUBLIC='BHWLSFHXLq4c1BU93tDYGwrsE5HBycV-q2Q9xfa0Y3X1B16whPmoOTH33eRCwe1ZDccwmJiC9ZSnCmq60_LO-Xs';
// Set to the collection URL once Javier approves a free backend. Empty = "coming soon".
const PUSH_COLLECT_URL='';
function b64u(s){s=s.replace(/-/g,'+').replace(/_/g,'/');s+='='.repeat((4-s.length%4)%4);return Uint8Array.from(atob(s),c=>c.charCodeAt(0))}
async function enableMeetingPush(){
 const msg=document.getElementById('pushMsg');
 const ios=/iphone|ipad/i.test(navigator.userAgent);const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
 if(ios&&!standalone){msg.textContent='On iPhone: tap Share, then Add to Home Screen, open the app from your Home Screen, then tap this button again (iOS 16.4 or newer).';return}
 if(!('serviceWorker'in navigator)||!('PushManager'in window)){msg.textContent='This phone or browser does not support notifications.';return}
 try{const p=await Notification.requestPermission();if(p!=='granted'){msg.textContent='Notifications were not allowed. You can turn them on in your phone settings.';return}
 const reg=await navigator.serviceWorker.ready;
 const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(VAPID_PUBLIC)});
 localStorage.setItem('meetingPushSub',JSON.stringify(sub));
 if(!PUSH_COLLECT_URL){msg.textContent='Reminders are on for this phone. Delivery from the Post is coming soon.';return sub}
 const r=await fetch(PUSH_COLLECT_URL+'/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({topic:'membership-meeting',sub})});
 if(!r.ok)throw new Error('server '+r.status);const o=await r.json();localStorage.setItem('meetingPushId',o.id||'');
 msg.textContent='Reminders are on for this phone.';return sub}
 catch(e){msg.textContent='Could not turn on reminders: '+e.message}}
document.addEventListener('DOMContentLoaded',()=>{const b=document.getElementById('pushBtn');if(b)b.onclick=enableMeetingPush});
