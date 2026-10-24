/* 2026-10-24 訪客體驗版：park.html?guest=1（同一個分頁記住，?guest=0 取消）
   不用 LINE 登入、完全不連伺服器（不讀也不寫資料庫）：所有打到 otto2-notify 的請求都在手機裡攔下來，回假資料。
   扭蛋照真的機率在本機抽，但不入帳，每天 3 次；作品小屋用示範資料（不顯示真的學員名字和作品）。
   最後導到「加 LINE 好友」和「預約體驗課」。要放在其他 script 前面載入 */
(function(){
var q=location.search;
try{if(/[?&]guest=1/.test(q))sessionStorage.setItem('otto2-guest','1');if(/[?&]guest=0/.test(q)){sessionStorage.removeItem('otto2-guest');if(sessionStorage.getItem('otto2-liff-tk')==='guest')sessionStorage.removeItem('otto2-liff-tk')}}catch(e){}
var on=false;try{on=sessionStorage.getItem('otto2-guest')==='1'}catch(e){}
window.GUEST=on;if(!on)return;
try{sessionStorage.setItem('otto2-liff-tk','guest');localStorage.removeItem('otto2-kiosk')}catch(e){}

var LINE_URL='https://line.me/R/ti/p/@otto2artclub',BOOK_URL='https://liff.line.me/2010906803-FMDYktUN?go=book',SPINS=3;
var HOST='otto2-notify-production.up.railway.app';
var BEARS=[{id:'p01',nm:'經典條紋'},{id:'p02',nm:'和平鴿'},{id:'p06',nm:'花冠少年'},{id:'p05',nm:'藍色吉他'},{id:'p03',nm:'哭泣的女人'},{id:'p04',nm:'自畫像'},
  {id:'p07',nm:'彩色劍客',rare:true,w:.5},{id:'p08',nm:'幾何面具',rare:true,w:.5}];
/* 跟新朋友的獎池同一組機率（不入帳） */
var PRIZES=[{id:'n1',ic:'✨',nm:'紅利 1 點',type:'bonus',v:1,w:600},{id:'n2',ic:'🌟',nm:'紅利 2 點',type:'bonus',v:2,w:110},{id:'n3',ic:'💫',nm:'紅利 3 點',type:'bonus',v:3,w:50},
  {id:'c50',ic:'🎟️',nm:'下次上課折抵 $50',type:'ticket',w:15},{id:'c100',ic:'🎟️',nm:'下次上課折抵 $100',type:'ticket',w:5},{id:'none',ic:'🍀',nm:'明天再來',type:'none',w:220}];
var XM=new Date(Date.now()+8*3600e3).toISOString().slice(0,10)>='2026-11-01'; /* 11/1 起跟正式版一樣換聖誕扭扭樂、先不送公仔 */
var G_START=XM?'2026-11-01':'2026-10-01',G_END=XM?'2026-12-25':'2026-10-31',X_START='2026-10-16',X_END='2026-12-25',G_TITLE=XM?'聖誕扭扭樂':'世界藝術日・畢卡索扭扭樂';
function today(){return new Date(Date.now()+8*3600e3).toISOString().slice(0,10)}
function pick(a){var t=0,i;for(i=0;i<a.length;i++)t+=a[i].w||1;var r=Math.random()*t;for(i=0;i<a.length;i++){if((r-=a[i].w||1)<0)return a[i]}return a[a.length-1]}
function load(){var L=null;try{L=JSON.parse(localStorage.getItem('otto2-guest-g'))}catch(e){}L=L||{};L.bears=L.bears||{};L.dupes=L.dupes||0;L.bonus=L.bonus||0;L.days=L.days||[];
  if(L.day!==today()){L.day=today();L.used=0}return L}
function save(L){try{localStorage.setItem('otto2-guest-g',JSON.stringify(L))}catch(e){}}
function status(t,s,e){return t<s?'soon':t>e?'ended':'on'}
function state(L){var t=today(),r=[];for(var i=0;i<SPINS;i++)r.push({why:'guest',label:'體驗版'});
  return{ok:true,title:G_TITLE,start:G_START,end:G_END,today:t,expiry:'',sim:false,guest:true,cap:30,status:status(t,G_START,G_END),
    me:{name:'訪客',phone:'',member:false,points:0,sessions:0,bonus:L.bonus,gotBonus:L.bonus,lottery:0,tickets:[]},
    chances:{total:SPINS,used:Math.min(SPINS,L.used),reasons:r},days:L.days,milestones:[],
    prizes:PRIZES.map(function(p){return{id:p.id,ic:p.ic,nm:p.nm,sub:'',who:'new',type:p.type,left:null}}),
    ticker:[],doubleToday:false,doubleLabel:'',halloween:false,quiz:null,memory:null,
    bears:XM?null:{list:BEARS.map(function(b){return{id:b.id,nm:b.nm,rare:!!b.rare,hidden:false}}),title:'畢卡索圖鑑',unit:'畢卡索公仔',img:'gacha/picasso2/',
      have:L.bears,dupes:L.dupes,done:false,reward:'',limit:0,left:null},
    bonusToday:0,maxDaily:5,bonusDaily:1}}
function spin(){var L=load(),t=today();
  if(status(t,G_START,G_END)!=='on')return{ok:false,code:'ENDED',error:'扭蛋活動已經結束囉，先去走格子島逛逛吧'};
  if(L.used>=SPINS){setTimeout(function(){cta('spins')},300);return{ok:false,code:'NO_CHANCE',error:'體驗版今天的 3 次轉完了'}}
  var hit=pick(PRIZES),b=XM?null:pick(BEARS),isNew=b?!(L.bears[b.id]>0):false;
  L.used++;if(b){L.bears[b.id]=(L.bears[b.id]||0)+1;if(!isNew)L.dupes++}if(hit.type==='bonus')L.bonus+=hit.v;if(L.days.indexOf(t)<0)L.days.push(t);save(L);
  var owned=BEARS.filter(function(x){return L.bears[x.id]>0}).length;
  if(L.used>=SPINS)ctaSoon('spins');
  return{ok:true,prize:{id:hit.id,ic:hit.ic,nm:hit.nm,sub:'',type:hit.type,v:hit.v||0},milestone:null,
    bear:b?{id:b.id,nm:b.nm,rare:!!b.rare,hidden:false,isNew:isNew,count:owned,total:BEARS.length}:null,collect:null,sure:false,why:'guest',sim:false,state:state(L)}}
var NO={ok:false,code:'GUEST',error:'體驗版不能用這個功能，來 OTTO2 上過課就能玩完整版'};
function api(path){
  if(path==='/gacha/info'){var t=today();return{ok:true,today:t,start:G_START,end:G_END,title:G_TITLE,status:status(t,G_START,G_END),bears:BEARS.length,img:'gacha/picasso2/'}}
  if(path==='/gacha/state')return state(load());
  if(path==='/gacha/spin')return spin();
  if(path==='/xmas/info'){var x=today();return{ok:true,today:x,start:X_START,end:X_END,status:status(x,X_START,X_END),tiles:[34,16]}}
  if(path==='/event/list')return{ok:true,today:today(),events:[],balloons:[]};
  if(path==='/pets/diary')return{ok:true,list:[]};
  if(path==='/shop/list')return{ok:true,today:today(),me:{},products:[],cfg:{name:'藝享選品館',sub:'',greeting:'',greetingSub:'',cats:[],open:false,pending:true,openAt:'',openText:'',
    closedLine:'體驗版看不到選品館',closedSub:'來 OTTO2 上過課的學員，就能用紅利換選品館的好東西'}};
  return NO}
function pathOf(u){try{var x=new URL(u,location.href);return x.host===HOST?x.pathname.replace(/\/$/,''):null}catch(e){return null}}
var realFetch=window.fetch.bind(window);
window.fetch=function(input,init){var u=typeof input==='string'?input:(input&&input.url)||'',p=pathOf(u);
  if(p===null)return realFetch(input,init);
  var j=api(p);return Promise.resolve(new Response(JSON.stringify(j),{status:200,headers:{'Content-Type':'application/json'}}))};
/* 伺服器圖片（作品照片、商品圖）一律不載入 */
var realSrc=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
if(realSrc&&realSrc.set)Object.defineProperty(HTMLImageElement.prototype,'src',{configurable:true,enumerable:realSrc.enumerable,get:function(){return realSrc.get.call(this)},
  set:function(v){if(pathOf(String(v))!==null)v='data:image/gif;base64,R0lGODlhAQABAAAAACw=';realSrc.set.call(this,v)}});

/* ---------- 加 LINE／預約的邀請 ---------- */
var css='.gu-bg{position:fixed;inset:0;z-index:2147483000;background:rgba(29,34,48,.55);display:grid;place-items:center;padding:max(16px,env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) max(16px,env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px))}'+
 '.gu-card{width:min(360px,100%);background:#fffaf2;color:#2b2320;border:3px solid #2b2320;border-radius:22px;box-shadow:0 6px 0 #2b2320;padding:22px 20px 18px;font-family:"Noto Sans TC","PingFang TC",sans-serif;text-align:center}'+
 '.gu-card h3{margin:0 0 8px;font-size:21px;font-weight:900;line-height:1.3}.gu-card p{margin:0 0 16px;font-size:14.5px;line-height:1.65;color:#5d524c}'+
 '.gu-card a,.gu-card button{display:block;width:100%;box-sizing:border-box;margin-top:10px;padding:13px 10px;border-radius:14px;font:900 16px/1.2 inherit;text-decoration:none;cursor:pointer;border:2.5px solid #2b2320}'+
 '.gu-line{background:#06c755;color:#fff}.gu-book{background:#d63a2f;color:#fff}.gu-card .gu-x{background:transparent;color:#7a6d66;border-color:transparent;font-weight:700;font-size:14px;padding:8px}'+
 '.gu-card a:focus-visible,.gu-card button:focus-visible{outline:3px solid #f2c14e;outline-offset:2px}';
function cta(why){if(document.getElementById('guCta'))return;
  if(!document.getElementById('guCss')){var s=document.createElement('style');s.id='guCss';s.textContent=css;document.head.appendChild(s)}
  var T={spins:['今天的 3 次轉完了','來 OTTO2 上過課的孩子，用自己的帳號每天都能轉，還能拿真的紅利。先預約一堂體驗課吧！'],
    end:['喜歡這座島嗎？','體驗版只能逛逛。來 OTTO2 上過課的孩子，就能用自己的帳號玩：轉扭蛋拿真的紅利、走格子幫聖誕樹點燈、作品搬進作品小屋。先預約一堂體驗課吧！'],
    house:['想要一間自己的小屋？','來 OTTO2 上過課的孩子，作品都能搬進作品小屋，家人朋友都看得到。先預約一堂體驗課吧！']}[why]||null;
  T=T||['喜歡這座島嗎？','來 OTTO2 上過課的孩子才能玩完整版。先預約一堂體驗課吧！'];
  var bg=document.createElement('div');bg.className='gu-bg';bg.id='guCta';bg.setAttribute('role','dialog');bg.setAttribute('aria-modal','true');
  bg.innerHTML='<div class="gu-card"><h3></h3><p></p><a class="gu-line" href="'+LINE_URL+'" target="_blank" rel="noopener">加入 LINE 好友</a><a class="gu-book" href="'+BOOK_URL+'" target="_blank" rel="noopener">預約體驗課</a><button type="button" class="gu-x">繼續逛逛</button></div>';
  bg.querySelector('h3').textContent=T[0];bg.querySelector('p').textContent=T[1];
  var close=function(){bg.remove()};bg.querySelector('.gu-x').onclick=close;bg.addEventListener('click',function(e){if(e.target===bg)close()});
  ['pointerdown','touchstart','wheel'].forEach(function(ev){bg.addEventListener(ev,function(e){e.stopPropagation()},{passive:true})});
  document.body.appendChild(bg);setTimeout(function(){var a=bg.querySelector('.gu-line');a&&a.focus()},50)}
/* 等畫面上的獎品視窗都關掉再跳 */
function busyUI(){var ids=['pop','ggPrize'],i,e;for(i=0;i<ids.length;i++){e=document.getElementById(ids[i]);if(e&&!e.hidden)return true}
  var m=document.getElementById('gcModal');if(m&&m.classList.contains('show'))return true;var o=document.querySelector('.gc-open,#gcRoot.on');return !!o}
function ctaSoon(why,n){n=n||0;setTimeout(function(){if(busyUI()&&n<120)return ctaSoon(why,n+1);cta(why)},n?1000:5000)}
/* 逛一陣子之後邀請一次（同一個分頁只跳一次） */
function idleInvite(){try{if(sessionStorage.getItem('otto2-guest-inv'))return;sessionStorage.setItem('otto2-guest-inv','1')}catch(e){}ctaSoon('end')}
setTimeout(idleInvite,150000);
window.GuestCTA=cta;
})();
