// Sends the Membership Meeting reminder. Subscriptions come from the SUBSCRIPTIONS secret (JSON array), never the public repo.
const wp=require('web-push');const cfg=require('./reminders.json').membershipMeeting;
const manual=process.env.EVENT==='workflow_dispatch';
const due=new Date(Date.parse(cfg.date)-cfg.daysBefore*864e5).toISOString().slice(0,10);
const today=new Date().toLocaleDateString('en-CA',{timeZone:'America/Los_Angeles'});
if(!manual&&!(cfg.approved===true&&today===due)){console.log(`Not sending. today=${today} due=${due} approved=${cfg.approved}`);process.exit(0)}
if(manual&&process.env.CONFIRM!=='SEND'){console.log('Manual run needs confirm=SEND');process.exit(0)}
wp.setVapidDetails('mailto:VFW7243@yahoo.com',process.env.VAPID_PUBLIC,process.env.VAPID_PRIVATE);
const subs=JSON.parse(process.env.SUBSCRIPTIONS||'[]');
(async()=>{let ok=0;for(const s of subs){try{await wp.sendNotification(s,JSON.stringify(cfg));ok++}catch(e){console.log('fail',e.statusCode)}}console.log(`sent ${ok}/${subs.length}`)})();
