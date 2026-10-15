// Sends the Membership Meeting reminder. Subscriptions come from the SUBSCRIPTIONS secret (JSON array), never the public repo.
const wp=require('web-push');const cfg=require('./reminders.json').membershipMeeting;
const manual=process.env.EVENT==='workflow_dispatch';
const today=process.env.TODAY||new Date().toLocaleDateString('en-CA',{timeZone:'America/Los_Angeles'});
// Next first-Saturday meeting on or after today (LA date), then due = meeting minus daysBefore.
function firstSat(y,m){const d=new Date(Date.UTC(y,m,1));d.setUTCDate(1+(6-d.getUTCDay()+7)%7);return d}
let [ty,tm]=today.split('-').map(Number);tm--;let mt=firstSat(ty,tm);if(mt.toISOString().slice(0,10)<today)mt=firstSat(tm==11?ty+1:ty,(tm+1)%12);
const meeting=mt.toISOString().slice(0,10);
// Reminder 14 days ahead may target next month's meeting too:
let cand=firstSat(tm==11?ty+1:ty,(tm+1)%12);const candDue=new Date(cand-cfg.daysBefore*864e5).toISOString().slice(0,10);
const target=candDue===today?cand.toISOString().slice(0,10):meeting;
const due=new Date(Date.parse(target)-cfg.daysBefore*864e5).toISOString().slice(0,10);
cfg.body=cfg.body.replace('{date}',new Date(target+'T12:00:00Z').toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric',timeZone:'UTC'}));
if(!manual&&!(cfg.approved===true&&today===due)){console.log(`Not sending. today=${today} meeting=${target} due=${due} approved=${cfg.approved}`);process.exit(0)}
if(manual&&process.env.CONFIRM!=='SEND'){console.log('Manual run needs confirm=SEND');process.exit(0)}
wp.setVapidDetails('mailto:VFW7243@yahoo.com',process.env.VAPID_PUBLIC,process.env.VAPID_PRIVATE);
const subs=JSON.parse(process.env.SUBSCRIPTIONS||'[]');
(async()=>{let ok=0;for(const s of subs){try{await wp.sendNotification(s,JSON.stringify(cfg));ok++}catch(e){console.log('fail',e.statusCode)}}console.log(`sent ${ok}/${subs.length}`)})();
