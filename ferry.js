/* OTTO2 空島交通：搭熱氣球去別的島。
   Ferry.go({to,place,from}) 出發：黑熊和三隻吉祥物（十月加畢卡索）在草地上等，熱氣球降下來，大家跳上去，飛走，再換頁。
   到了對面的頁面，這支檔案載入時會自動接著演「降落、大家跳下來」，等頁面準備好才收掉。
   頁面要告訴它「我準備好了」：window.__ferryReady = true（或 Ferry.holdUntil(函式)）。
   之後換交通工具（11 月雪橇…）只要改 VEH 和 balloonSvg。 */
(function(){
if(window.Ferry)return;
var KEY='otto2-ferry',PLACE={art:'作品島',park:'歡樂島'};
var BEAR='<svg viewBox="0 0 40 40"><circle cx="8" cy="9" r="7" fill="#231F20"/><circle cx="32" cy="9" r="7" fill="#231F20"/><path d="M6 8 Q7 4 11 3" stroke="#fff" stroke-width="1.6" fill="none"/><path d="M34 8 Q33 4 29 3" stroke="#fff" stroke-width="1.6" fill="none"/><ellipse cx="20" cy="22" rx="17" ry="16" fill="#231F20"/><circle cx="13" cy="19" r="2.6" fill="#231F20" stroke="#fff" stroke-width="1.6"/><circle cx="27" cy="19" r="2.6" fill="#231F20" stroke="#fff" stroke-width="1.6"/><rect x="15" y="20" width="10" height="10" rx="4" fill="#fff"/><ellipse cx="20" cy="22.5" rx="3" ry="2" fill="#231F20"/></svg>';
var CAST={
  bear:{svg:BEAR},
  gabi:{img:'pets/gabi.webp'},kabu:{img:'pets/kabu.webp'},moka:{img:'pets/moka.webp'},
  picasso:{img:'gacha/picasso2/head.webp',bare:true}};
/* 每個月的交通工具與乘客；沒列到的月份用預設（熱氣球、不帶畢卡索）。畢卡索是十月生日才出場 */
var VEH={'10':{stripes:['#f2c14e','#fff6dc','#e8836b','#fff6dc'],picasso:true},def:{stripes:['#7fb2a0','#fff6dc','#8fa6d9','#fff6dc'],picasso:false}};
function month(){return new Date(Date.now()+8*3600e3).toISOString().slice(5,7)}
function veh(){return VEH[month()]||VEH.def}
function castList(){var a=['bear','gabi','kabu','moka'];if(veh().picasso)a.unshift('picasso');return a}
function reduced(){try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}}

/* ---------- 熱氣球圖 ---------- */
function wAt(y){return y<=110?102*Math.sqrt(Math.max(0,1-Math.pow((110-y)/106,2))):26+76*Math.cos((y-110)/76*Math.PI/2)}
function panel(f0,f1){var p=[],y;for(y=4;y<=186;y+=6)p.push((110+f0*wAt(y)).toFixed(1)+','+y);for(y=186;y>=4;y-=6)p.push((110+f1*wAt(y)).toFixed(1)+','+y);return p.join(' ')}
function balloonBack(st){
  var s='<svg viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg">',i;
  for(i=0;i<8;i++)s+='<polygon points="'+panel(-1+i*.25,-.75+i*.25)+'" fill="'+st[i%st.length]+'"/>';
  s+='<polygon points="'+panel(-1,1)+'" fill="none" stroke="rgba(60,45,30,.35)" stroke-width="2"/>';
  s+='<g stroke="#6b5a45" stroke-width="2"><line x1="84" y1="186" x2="48" y2="236"/><line x1="136" y1="186" x2="172" y2="236"/><line x1="100" y1="186" x2="84" y2="236"/><line x1="120" y1="186" x2="136" y2="236"/></g>';
  s+='<rect x="40" y="232" width="140" height="52" rx="8" fill="#b98a52"/></svg>';
  return s}
function balloonFront(){
  return '<svg viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg"><path d="M40 252 H180 V276 a8 8 0 0 1 -8 8 H48 a8 8 0 0 1 -8 -8 Z" fill="#a8763f"/><rect x="38" y="246" width="144" height="9" rx="4" fill="#8f6232"/><g stroke="rgba(60,40,20,.28)" stroke-width="2"><line x1="40" y1="264" x2="180" y2="264"/><line x1="76" y1="255" x2="76" y2="284"/><line x1="110" y1="255" x2="110" y2="284"/><line x1="144" y1="255" x2="144" y2="284"/></g></svg>'}

var CSS='.fy{position:fixed;inset:0;z-index:2147483000;overflow:hidden;touch-action:none;font-family:inherit;user-select:none;-webkit-user-select:none}'+
'.fy *{box-sizing:border-box}'+
'.fy-sky{position:absolute;inset:0;background:linear-gradient(#8ec5e0,#cfe6ea 55%,#eef2e4)}'+
'.fy-cl{position:absolute;left:0;width:90px;height:26px;border-radius:99px;background:#fff;opacity:.92;box-shadow:34px -12px 0 6px #fff,66px 2px 0 0 #fff;animation:fy-cl linear infinite}'+
'@keyframes fy-cl{from{transform:translateX(-160px)}to{transform:translateX(130vw)}}'+
'.fy-gr{position:absolute;left:-25%;width:150%;border-radius:50% 50% 0 0/22% 22% 0 0;background:linear-gradient(#a3bb6e,#7f9a55 40%,#6a8447)}'+
'.fy-bk,.fy-fr{position:absolute;left:0;top:0;will-change:transform;pointer-events:none}'+
'.fy-bk svg,.fy-fr svg{display:block;width:100%;height:100%}'+
'.fy-bk{z-index:1}.fy-fr{z-index:3}'+
'.fy-c{position:absolute;left:0;top:0;z-index:2;transform-origin:50% 100%;will-change:transform;pointer-events:none}'+
'.fy-h{width:100%;aspect-ratio:1;animation:fy-bob 1.1s ease-in-out infinite}'+
'.fy-h svg,.fy-h img{display:block;width:100%;height:100%}'+
'.fy-h img{object-fit:cover}'+
'.fy-h.ring img{border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(40,60,40,.35)}'+
'.fy-h.wave{animation:fy-wave .7s ease-in-out infinite}'+
'.fy-f{height:14%;margin:-2% 14% 0;display:flex;justify-content:space-between}'+
'.fy-f i{width:38%;height:100%;border-radius:50%;background:rgba(35,31,32,.85)}'+
'.fy-c.bare .fy-f{display:none}'+
'@keyframes fy-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}'+
'@keyframes fy-wave{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}'+
'.fy-cap{position:absolute;left:0;right:0;top:13%;text-align:center;z-index:5;color:#fff;font-size:22px;letter-spacing:.18em;text-shadow:0 2px 10px rgba(30,60,80,.45);transition:opacity .35s;pointer-events:none}'+
'.fy-skip{position:absolute;right:14px;top:calc(env(safe-area-inset-top,0px) + 12px);z-index:6;border:0;border-radius:99px;padding:6px 14px;background:rgba(255,255,255,.55);color:#35505a;font:inherit;font-size:13px}'+
'.fy-veil{position:absolute;inset:0;z-index:7;background:#f2f7f6;opacity:0;pointer-events:none}';

function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
var easeOut=function(p){return 1-Math.pow(1-p,3)},easeIn=function(p){return p*p},easeIO=function(p){return p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2};
function tween(S,ms,fn){return new Promise(function(res){var t0=performance.now();(function f(n){var p=Math.min(1,(n-t0)/ms);fn(p);if(p<1&&!S.dead)requestAnimationFrame(f);else res()})(t0)})}

var active=null;

/* 建場景。side：'r' 熱氣球停右邊、大家站左邊（出發）；'l' 反過來（降落） */
function build(side,list){
  var W=innerWidth,H=innerHeight,root=el('div','fy'),S={root:root,W:W,H:H,side:side,list:list,dead:false,cast:[]};
  var gt=Math.round(H*.74),bw=Math.round(Math.min(W*.5,240)),s=bw/220,cs=Math.round(Math.min(52,Math.max(38,W*.11)));
  S.gt=gt;S.s=s;S.cs=cs;S.bw=bw;
  var clouds='';[[8,50,-20],[22,64,-35],[34,40,-5],[48,58,-44],[14,72,-12],[40,46,-28]].forEach(function(c){clouds+='<span class="fy-cl" style="top:'+c[0]+'%;transform:scale('+(c[1]/60)+');animation-duration:'+(c[1]*.7)+'s;animation-delay:'+c[2]+'s"></span>'});
  root.innerHTML='<style>'+CSS+'</style><div class="fy-sky"></div>'+clouds+'<div class="fy-gr" style="top:'+gt+'px;height:'+(H-gt+30)+'px"></div>';
  S.bk=el('div','fy-bk',balloonBack(veh().stripes));S.fr=el('div','fy-fr',balloonFront());
  [S.bk,S.fr].forEach(function(e){e.style.width=bw+'px';e.style.height=Math.round(bw*300/220)+'px'});
  root.appendChild(S.bk);
  list.forEach(function(id,i){
    var d=CAST[id],c=el('div','fy-c'+(d.bare?' bare':'')),h=el('div','fy-h'+(d.bare?'':(d.img?' ring':'')),d.svg||'<img alt="" src="'+d.img+'">'),f=el('div','fy-f','<i></i><i></i>');
    h.style.animationDelay=(-i*.23)+'s';c.style.width=cs+'px';c.appendChild(h);c.appendChild(f);
    root.appendChild(c);S.cast.push({id:id,el:c,h:h,i:i,x:0,y:0,k:1,on:false,sx:62+i*(list.length>1?96/(list.length-1):0)})});
  root.appendChild(S.fr);
  S.capEl=el('div','fy-cap','');root.appendChild(S.capEl);
  S.skip=el('button','fy-skip','略過');S.skip.type='button';root.appendChild(S.skip);
  S.veil=el('div','fy-veil');root.appendChild(S.veil);
  S.bal={x:0,y:0};
  S.landX=W*(side==='r'?.66:.34)-bw/2;S.landY=gt+12-284*s;S.topY=-Math.round(bw*300/220)-40;
  /* 站著等的位置：離熱氣球遠的那一邊 */
  S.stand=function(i){var n=list.length,x=side==='r'?W*(.06+i*.09)+cs/2:W*(.94-i*.09)-cs/2;return{x:x,y:gt+16+(i%2)*6}};
  return S}
function place(S){
  S.bk.style.transform=S.fr.style.transform='translate('+S.bal.x+'px,'+S.bal.y+'px)';
  S.cast.forEach(function(c){
    if(c.on){c.x=S.bal.x+c.sx*S.s;c.y=S.bal.y+264*S.s;c.k=.85*S.s}
    c.el.style.transform='translate('+(c.x-S.cs/2)+'px,'+(c.y-S.cs*1.14)+'px) scale('+c.k+')'})}
function cap(S,t){S.capEl.style.opacity=0;setTimeout(function(){S.capEl.textContent=t;S.capEl.style.opacity=1},180)}
function hop(S,c,toX,toY,toK,ms,onBoard){
  var x0=c.x,y0=c.y,k0=c.k;c.on=false;
  return tween(S,ms,function(p){var e=easeIO(p);c.x=x0+(toX-x0)*e;c.y=y0+(toY-y0)*e-Math.sin(p*Math.PI)*S.H*.1;c.k=k0+(toK-k0)*e;place(S)}).then(function(){c.on=!!onBoard;c.x=toX;c.y=toY;c.k=toK;place(S)})}

/* ---------- 出發 ---------- */
function go(opt){
  if(active)return Promise.resolve();
  if(!opt||!opt.to)return Promise.resolve();
  var list=castList();
  function leave(){try{sessionStorage.setItem(KEY,JSON.stringify({t:Date.now(),from:opt.from||'',place:opt.place||'art',list:list}))}catch(e){}location.href=opt.to}
  if(reduced()){leave();return Promise.resolve()}
  var S=build('r',list);active=S;
  document.documentElement.appendChild(S.root);
  S.skip.onclick=function(){S.dead=true;leave()};
  S.root.style.opacity=0;S.root.style.transition='opacity .35s';
  S.bal.x=S.landX;S.bal.y=S.topY;
  S.cast.forEach(function(c){var p=S.stand(c.i);c.x=p.x;c.y=p.y;c.k=1});
  place(S);requestAnimationFrame(function(){S.root.style.opacity=1});
  var pic=S.cast[0].id==='picasso'?S.cast[0]:null;if(pic)pic.h.classList.add('wave');
  return (async function(){
    cap(S,'熱氣球快到了…');await sleep(500);if(S.dead)return;
    await tween(S,1700,function(p){var e=easeOut(p);S.bal.y=S.topY+(S.landY-S.topY)*e;S.bal.x=S.landX+Math.sin(p*7)*14*(1-p);place(S)});if(S.dead)return;
    if(pic)pic.h.classList.remove('wave');
    cap(S,'上車囉！');await sleep(350);if(S.dead)return;
    var jobs=[];
    for(var i=0;i<S.cast.length;i++){(function(c,d){jobs.push(sleep(d).then(function(){if(S.dead)return;return hop(S,c,S.landX+c.sx*S.s,S.landY+264*S.s,.85*S.s,650,true)}))})(S.cast[i],i*320)}
    await Promise.all(jobs);if(S.dead)return;
    cap(S,'出發！去'+(PLACE[opt.place]||'作品島'));await sleep(550);if(S.dead)return;
    var x0=S.bal.x,y0=S.bal.y,dir=S.side==='r'?1:-1;
    await tween(S,2000,function(p){var e=easeIn(p);S.bal.y=y0-(y0+Math.round(S.bw*1.4)+40)*e;S.bal.x=x0+Math.sin(p*5)*10+dir*30*p;S.veil.style.opacity=p>.55?(p-.55)/.45:0;place(S)});
    if(S.dead)return;leave()})()}

/* ---------- 降落 ---------- */
var holds=[];
function holdUntil(fn){holds.push(fn)}
function pageReady(){if(document.readyState!=='complete')return false;if(window.__ferryReady===false)return false;
  for(var i=0;i<holds.length;i++){try{if(!holds[i]())return false}catch(e){}}return true}
function waitReady(S,max){return new Promise(function(res){var t0=Date.now();(function f(){if(S.dead||pageReady()||Date.now()-t0>max)res();else setTimeout(f,150)})()})}

function arrive(){
  var d=null;try{d=JSON.parse(sessionStorage.getItem(KEY)||'null');sessionStorage.removeItem(KEY)}catch(e){}
  if(!d||!d.list||Date.now()-d.t>60000||reduced())return;
  var S=build('l',d.list);active=S;
  document.documentElement.appendChild(S.root);
  S.veil.style.opacity=1;
  var home=d.place==='park'?'歡樂島':'作品島';
  function end(){S.dead=true;S.root.remove();active=null}
  S.skip.onclick=function(){S.dead=true;waitReady({dead:false},12000).then(function(){S.root.remove();active=null})};
  /* 熱氣球帶著大家從天上降下來 */
  S.cast.forEach(function(c){c.on=true});
  S.bal.x=S.landX;S.bal.y=S.topY;place(S);
  return (async function(){
    await sleep(120);
    tween(S,800,function(p){S.veil.style.opacity=1-p});
    cap(S,'到囉！'+home);
    await tween(S,1700,function(p){var e=easeOut(p);S.bal.y=S.topY+(S.landY-S.topY)*e;S.bal.x=S.landX+Math.sin(p*7)*14*(1-p);place(S)});if(S.dead)return;
    await sleep(250);
    var jobs=[];
    for(var i=0;i<S.cast.length;i++){(function(c,dl){jobs.push(sleep(dl).then(function(){if(S.dead)return;var p=S.stand(c.i);return hop(S,c,p.x,p.y,1,650,false)}))})(S.cast[S.cast.length-1-i],i*300)}
    await Promise.all(jobs);if(S.dead)return;
    var pic=S.cast[0].id==='picasso'?S.cast[0]:null;if(pic)pic.h.classList.add('wave');
    cap(S,'謝謝你搭熱氣球');await sleep(900);if(S.dead)return;
    var x0=S.bal.x,y0=S.bal.y;
    await tween(S,1500,function(p){var e=easeIn(p);S.bal.y=y0-(y0+Math.round(S.bw*1.4)+40)*e;S.bal.x=x0+Math.sin(p*5)*8-24*p;place(S)});if(S.dead)return;
    await waitReady(S,15000);if(S.dead)return;
    S.root.style.transition='opacity .7s';S.root.style.opacity=0;await sleep(750);end()})()}

window.Ferry={go:go,arrive:arrive,holdUntil:holdUntil};
/* 從瀏覽器「上一頁」回來時，頁面會被原樣還原（包含蓋住畫面的雲），要清掉 */
window.addEventListener('pageshow',function(e){if(e.persisted){var o=document.querySelectorAll('.fy');for(var i=0;i<o.length;i++)o[i].remove();active=null}});
try{arrive()}catch(e){console.error(e)}
})();
