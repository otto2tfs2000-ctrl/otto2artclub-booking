/* OTTO2 空島交通：搭熱氣球去別的島（three.js 立體版）。
   Ferry.go({to,place,from}) 出發：黑熊和三隻吉祥物（十月加畢卡索）站在草地上等，熱氣球降下來，大家跳進籃子，飛走，再換頁。
   到了對面的頁面，這支檔案載入時會自動接著演「降落、大家跳下來」，等頁面準備好才收掉。
   頁面要告訴它「我準備好了」：Ferry.holdUntil(函式)。
   之後換交通工具（11 月雪橇…）改 VEH 和 mkBalloon。需要 three.js r128（頁面已載入就直接用，沒有就自己從 cdnjs 載）。 */
(function(){
if(window.Ferry)return;
var KEY='otto2-ferry',PLACE={art:'作品島',park:'歡樂島'};
var BEAR='<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 40 40"><circle cx="8" cy="9" r="7" fill="#231F20"/><circle cx="32" cy="9" r="7" fill="#231F20"/><path d="M6 8 Q7 4 11 3" stroke="#fff" stroke-width="1.6" fill="none"/><path d="M34 8 Q33 4 29 3" stroke="#fff" stroke-width="1.6" fill="none"/><ellipse cx="20" cy="22" rx="17" ry="16" fill="#231F20"/><circle cx="13" cy="19" r="2.6" fill="#231F20" stroke="#fff" stroke-width="1.6"/><circle cx="27" cy="19" r="2.6" fill="#231F20" stroke="#fff" stroke-width="1.6"/><rect x="15" y="20" width="10" height="10" rx="4" fill="#fff"/><ellipse cx="20" cy="22.5" rx="3" ry="2" fill="#231F20"/></svg>';
var CAST={
  bear:{src:'data:image/svg+xml;utf8,'+encodeURIComponent(BEAR),bare:true},
  gabi:{src:'pets/gabi.webp'},kabu:{src:'pets/kabu.webp'},moka:{src:'pets/moka.webp'},
  picasso:{src:'gacha/picasso2/head.webp',bare:true}};
/* 每個月的交通工具與乘客；沒列到的月份用預設（熱氣球、不帶畢卡索）。畢卡索是十月生日才出場 */
var VEH={'10':{stripes:['#f2c14e','#fff6dc','#e8836b','#fff6dc'],picasso:true},def:{stripes:['#7fb2a0','#fff6dc','#8fa6d9','#fff6dc'],picasso:false}};
function month(){return new Date(Date.now()+8*3600e3).toISOString().slice(5,7)}
function veh(){return VEH[month()]||VEH.def}
function castList(){var a=['bear','gabi','kabu','moka'];if(veh().picasso)a.unshift('picasso');return a}
function reduced(){try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}}

var CSS='.fy{position:fixed;inset:0;z-index:2147483000;overflow:hidden;touch-action:none;font-family:inherit;user-select:none;-webkit-user-select:none}'+
'.fy-sky{position:absolute;inset:0;background:linear-gradient(#86c0de,#c9e3ea 55%,#eef2e4)}'+
'.fy-cv{position:absolute;inset:0;width:100%;height:100%;display:block}'+
'.fy-cap{position:absolute;left:0;right:0;top:11%;text-align:center;z-index:5;color:#fff;font-size:22px;letter-spacing:.18em;text-shadow:0 2px 10px rgba(30,60,80,.5);transition:opacity .35s;pointer-events:none}'+
'.fy-skip{position:absolute;right:14px;top:calc(env(safe-area-inset-top,0px) + 12px);z-index:6;border:0;border-radius:99px;padding:6px 14px;background:rgba(255,255,255,.55);color:#35505a;font:inherit;font-size:13px}'+
'.fy-veil{position:absolute;inset:0;z-index:7;background:#f2f7f6;opacity:0;pointer-events:none}';

function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
var easeOut=function(p){return 1-Math.pow(1-p,3)},easeIn=function(p){return p*p},easeIO=function(p){return p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2};
function tween(S,ms,fn){return new Promise(function(res){var t0=performance.now();(function f(n){var p=Math.min(1,(n-t0)/ms);fn(p);if(p<1&&!S.dead)requestAnimationFrame(f);else res()})(t0)})}

/* ---------- 立體零件 ---------- */
function wAt(y){return y<=110?102*Math.sqrt(Math.max(0,1-Math.pow((110-y)/106,2))):26+76*Math.cos((y-110)/76*Math.PI/2)}
function canvasTex(w,h,draw){var c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c)}
/* 熱氣球：原點在籃子底部中央，往上長 */
function mkBalloon(stripes){
  var g=new THREE.Group(),i,H=3.9,R=2.05,y0=3.15,pts=[];
  for(i=0;i<=30;i++){var t=i/30;pts.push(new THREE.Vector2(wAt(186-t*182)/102*R,y0+t*H))}
  var tex=canvasTex(512,16,function(x,w,h){for(var k=0;k<8;k++){x.fillStyle=stripes[k%stripes.length];x.fillRect(k*w/8,0,w/8+1,h)}});
  g.add(new THREE.Mesh(new THREE.LatheGeometry(pts,40),new THREE.MeshLambertMaterial({map:tex,side:THREE.DoubleSide})));
  var wick=canvasTex(128,64,function(x,w,h){x.fillStyle='#b98a52';x.fillRect(0,0,w,h);x.strokeStyle='rgba(70,45,20,.35)';x.lineWidth=3;for(var a=0;a<w;a+=16){x.beginPath();x.moveTo(a,0);x.lineTo(a,h);x.stroke()}for(var b=8;b<h;b+=16){x.beginPath();x.moveTo(0,b);x.lineTo(w,b);x.stroke()}});
  var basket=new THREE.Mesh(new THREE.BoxGeometry(1.5,.9,1.5),new THREE.MeshLambertMaterial({map:wick}));basket.position.y=.45;g.add(basket);
  var rim=new THREE.Mesh(new THREE.BoxGeometry(1.62,.1,1.62),new THREE.MeshLambertMaterial({color:'#8f6232'}));rim.position.y=.92;g.add(rim);
  var rope=new THREE.MeshLambertMaterial({color:'#6b5a45'}),up=new THREE.Vector3(0,1,0);
  [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(c){var a=new THREE.Vector3(c[0]*.74,.95,c[1]*.74),b=new THREE.Vector3(c[0]*.42,y0+.05,c[1]*.42),d=b.clone().sub(a),len=d.length();
    var m=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,len,5),rope);m.position.copy(a).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(up,d.normalize());g.add(m)});
  var burner=new THREE.Mesh(new THREE.CylinderGeometry(.14,.18,.22,8),new THREE.MeshLambertMaterial({color:'#5a5148'}));burner.position.y=2.35;g.add(burner);
  var flame=new THREE.Mesh(new THREE.ConeGeometry(.12,.5,8),new THREE.MeshBasicMaterial({color:'#ffb347'}));flame.position.y=2.75;g.add(flame);
  return{g:g,flame:flame}}
function blob(){var t=canvasTex(64,64,function(x){var gr=x.createRadialGradient(32,32,2,32,32,30);gr.addColorStop(0,'rgba(30,45,20,.55)');gr.addColorStop(1,'rgba(30,45,20,0)');x.fillStyle=gr;x.fillRect(0,0,64,64)});
  var m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=.03;return m}
function mkCastSprite(id){
  var d=CAST[id],c=document.createElement('canvas');c.width=c.height=256;var x=c.getContext('2d'),tex=new THREE.CanvasTexture(c);
  var im=new Image();im.onload=function(){x.clearRect(0,0,256,256);
    if(d.bare){x.drawImage(im,0,0,256,256)}else{x.save();x.beginPath();x.arc(128,128,118,0,6.283);x.clip();var s=Math.max(256/im.width,256/im.height);x.drawImage(im,(256-im.width*s)/2,(256-im.height*s)/2,im.width*s,im.height*s);x.restore();x.lineWidth=12;x.strokeStyle='#fff';x.beginPath();x.arc(128,128,122,0,6.283);x.stroke()}
    tex.needsUpdate=true};
  im.src=d.src;
  return new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}))}
function cloudSprite(){var t=canvasTex(128,64,function(x){[[40,38,26],[64,30,30],[90,38,24],[64,40,26]].forEach(function(c){var gr=x.createRadialGradient(c[0],c[1],2,c[0],c[1],c[2]);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,128,64)})});
  return new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}))}

/* 建場景。side：'r' 熱氣球停右邊、大家站左邊（出發）；'l' 反過來（降落） */
function build(side,list){
  var root=el('div','fy','<style>'+CSS+'</style><div class="fy-sky"></div>'),cv=el('canvas','fy-cv');root.appendChild(cv);
  var S={root:root,side:side,list:list,dead:false,cast:[],clouds:[],bal:{x:0,y:16},t:0};
  var R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});R.setPixelRatio(Math.min(window.devicePixelRatio||1,2));R.setClearColor(0x000000,0);
  var scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(40,1,.1,200);
  scene.add(new THREE.HemisphereLight(0xeaf4ff,0x7f9a55,.85));var sun=new THREE.DirectionalLight(0xfff2d6,.8);sun.position.set(-6,10,8);scene.add(sun);
  S.R=R;S.scene=scene;S.cam=cam;
  var hill=new THREE.Mesh(new THREE.SphereGeometry(40,48,24),new THREE.MeshLambertMaterial({color:'#7f9a55'}));hill.scale.set(2.2,.35,1.2);hill.position.y=-14;scene.add(hill);
  [[-9,-6],[-6.5,-9],[8,-7],[10.5,-4.5],[-12,-3]].forEach(function(p,i){var tr=new THREE.Group(),h=2+i%2*.7;
    var k=new THREE.Mesh(new THREE.CylinderGeometry(.14,.2,h*.4,6),new THREE.MeshLambertMaterial({color:'#7a5a3c'}));k.position.y=h*.2;tr.add(k);
    var c=new THREE.Mesh(new THREE.ConeGeometry(.9,h,7),new THREE.MeshLambertMaterial({color:i%2?'#5e7a3d':'#6f8a45',flatShading:true}));c.position.y=h*.9;tr.add(c);tr.position.set(p[0],0,p[1]);scene.add(tr)});
  for(var i=0;i<7;i++){var cl=cloudSprite(),sc=7+(i%3)*2;cl.position.set(-26+i*8,8+Math.sin(i*2.3)*5,-8-i*4);cl.scale.set(sc,sc/2,1);cl.userData.v=.25+(i%3)*.12;scene.add(cl);S.clouds.push(cl)}
  var B=mkBalloon(veh().stripes);S.bg=B.g;S.flame=B.flame;scene.add(B.g);S.bsh=blob();scene.add(S.bsh);
  list.forEach(function(id,k){var sp=mkCastSprite(id),sh=blob();scene.add(sp);scene.add(sh);
    S.cast.push({id:id,sp:sp,sh:sh,i:k,p:new THREE.Vector3(),k:1,on:false,hop:false,sx:list.length>1?-.6+k*1.2/(list.length-1):0})});
  S.landX=side==='r'?1.3:-1.3;
  S.stand=function(i){var xs=side==='r'?-3.9+i*.95:3.9-i*.95;return new THREE.Vector3(xs,.5,2.4+(i%2)*.5)};
  S.bal.x=S.landX;
  S.capEl=el('div','fy-cap','');root.appendChild(S.capEl);
  S.skip=el('button','fy-skip','略過');S.skip.type='button';root.appendChild(S.skip);
  S.veil=el('div','fy-veil');root.appendChild(S.veil);
  function size(){var W=window.innerWidth,H=window.innerHeight,asp=W/H,tf=Math.tan(20*Math.PI/180);
    R.setSize(W,H,false);cam.aspect=asp;
    var dist=Math.max(12.5/(2*tf),10/(asp*2*tf));S.dist=dist;cam.position.set(0,3.4,dist);cam.lookAt(0,3.2,0);cam.updateProjectionMatrix()}
  size();window.addEventListener('resize',size);
  S.frame=function(now){
    if(S.stopped)return;var dt=Math.min(.05,(now-(S.tp||now))/1000);S.tp=now;S.t+=dt;
    S.bg.position.set(S.bal.x,S.bal.y,0);S.bg.rotation.y=Math.sin(S.t*.7)*.5;S.bg.rotation.z=Math.sin(S.t*1.1)*.025;
    S.flame.scale.set(1,.85+Math.sin(S.t*18)*.15+Math.sin(S.t*31)*.1,1);
    var hh=Math.max(0,S.bal.y);S.bsh.position.set(S.bal.x,.03,0);S.bsh.scale.set(3.2+hh*.12,3.2+hh*.12,1);S.bsh.material.opacity=Math.max(0,1-hh/14);
    S.cast.forEach(function(c){
      if(c.on)c.p.set(S.bal.x+c.sx,S.bal.y+1.3,0);
      var bob=(!c.on&&!c.hop)?Math.abs(Math.sin(S.t*4+c.i*1.3))*.08:0,sz=.95*c.k;
      c.sp.position.set(c.p.x,c.p.y+bob,c.p.z);c.sp.scale.set(sz,sz,1);
      c.sp.material.rotation=c.wave?Math.sin(S.t*9)*.18:0;
      c.sh.visible=c.p.y<1.2&&!c.on;c.sh.position.set(c.p.x,.03,c.p.z);c.sh.scale.set(.8,.8,1)});
    S.clouds.forEach(function(c){c.position.x+=c.userData.v*dt;if(c.position.x>34)c.position.x=-34});
    cam.position.x=Math.sin(S.t*.25)*.6;cam.lookAt(0,3.2,0);
    R.render(scene,cam);S.raf=requestAnimationFrame(S.frame)};
  S.raf=requestAnimationFrame(S.frame);
  S.destroy=function(){S.stopped=true;S.dead=true;cancelAnimationFrame(S.raf);window.removeEventListener('resize',size);try{R.dispose();if(R.forceContextLoss)R.forceContextLoss()}catch(e){}root.remove()};
  return S}
function cap(S,t){S.capEl.style.opacity=0;setTimeout(function(){S.capEl.textContent=t;S.capEl.style.opacity=1},180)}
function hop(S,c,to,k1,ms,board){
  var p0=c.p.clone(),k0=c.k;c.on=false;c.hop=true;
  return tween(S,ms,function(p){var e=easeIO(p);c.p.lerpVectors(p0,to,e);c.p.y+=Math.sin(p*Math.PI)*1.8;c.k=k0+(k1-k0)*e}).then(function(){c.p.copy(to);c.k=k1;c.hop=false;c.on=!!board})}
var active=null;

/* ---------- 出發 ---------- */
function go(opt){
  if(active)return Promise.resolve();
  if(!opt||!opt.to)return Promise.resolve();
  var list=castList();
  function leave(){try{sessionStorage.setItem(KEY,JSON.stringify({t:Date.now(),from:opt.from||'',place:opt.place||'art',list:list}))}catch(e){}location.href=opt.to}
  if(reduced()||!window.THREE){leave();return Promise.resolve()}
  var S;try{S=build('r',list)}catch(e){console.error(e);leave();return Promise.resolve()}
  active=S;document.documentElement.appendChild(S.root);
  S.skip.onclick=function(){S.dead=true;leave()};
  S.root.style.opacity=0;S.root.style.transition='opacity .35s';requestAnimationFrame(function(){S.root.style.opacity=1});
  S.cast.forEach(function(c){c.p.copy(S.stand(c.i))});
  var pic=S.cast[0].id==='picasso'?S.cast[0]:null;if(pic)pic.wave=true;
  return (async function(){
    cap(S,'熱氣球快到了…');await sleep(500);if(S.dead)return;
    await tween(S,1900,function(p){var e=easeOut(p);S.bal.y=16*(1-e);S.bal.x=S.landX+Math.sin(p*7)*.9*(1-p)});if(S.dead)return;
    if(pic)pic.wave=false;
    cap(S,'上車囉！');await sleep(350);if(S.dead)return;
    var jobs=[];
    S.cast.forEach(function(c,i){jobs.push(sleep(i*330).then(function(){if(S.dead)return;return hop(S,c,new THREE.Vector3(S.landX+c.sx,1.3,0),.85,700,true)}))});
    await Promise.all(jobs);if(S.dead)return;
    cap(S,'出發！去'+(PLACE[opt.place]||'作品島'));await sleep(550);if(S.dead)return;
    await tween(S,2100,function(p){var e=easeIn(p);S.bal.y=19*e;S.bal.x=S.landX+Math.sin(p*5)*.5+p*1.2;S.veil.style.opacity=p>.55?(p-.55)/.45:0});
    if(S.dead)return;leave()})()}

/* ---------- 降落 ---------- */
var holds=[];
function holdUntil(fn){holds.push(fn)}
function pageReady(){if(document.readyState!=='complete')return false;
  for(var i=0;i<holds.length;i++){try{if(!holds[i]())return false}catch(e){}}return true}
function waitReady(S,max){return new Promise(function(res){var t0=Date.now();(function f(){if(S.dead||pageReady()||Date.now()-t0>max)res();else setTimeout(f,150)})()})}
function waitThree(cb){var t0=Date.now(),inj=false;(function w(){if(window.THREE)return cb(true);
  if(!inj&&Date.now()-t0>2500){inj=true;var s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';document.head.appendChild(s)}
  if(Date.now()-t0>12000)return cb(false);setTimeout(w,80)})()}

function arrive(){
  var d=null;try{d=JSON.parse(sessionStorage.getItem(KEY)||'null');sessionStorage.removeItem(KEY)}catch(e){}
  if(!d||!d.list||Date.now()-d.t>60000||reduced())return;
  /* 先用一層純色蓋住頁面，等 three.js 載好再開始演 */
  var pre=el('div','','');pre.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#f2f7f6';document.documentElement.appendChild(pre);
  waitThree(function(ok){
    if(!ok){pre.remove();return}
    var S;try{S=build('l',d.list)}catch(e){console.error(e);pre.remove();return}
    active=S;document.documentElement.appendChild(S.root);pre.remove();S.veil.style.opacity=1;
    var home=d.place==='park'?'歡樂島':'作品島';
    S.skip.onclick=function(){S.dead=true;waitReady({dead:false},12000).then(function(){S.destroy();active=null})};
    S.cast.forEach(function(c){c.on=true});
    S.bal.y=16;
    (async function(){
      await sleep(120);
      tween(S,800,function(p){S.veil.style.opacity=1-p});
      cap(S,'到囉！'+home);
      await tween(S,1900,function(p){var e=easeOut(p);S.bal.y=16*(1-e);S.bal.x=S.landX+Math.sin(p*7)*.9*(1-p)});if(S.dead)return;
      await sleep(250);
      var jobs=[];
      S.cast.slice().reverse().forEach(function(c,i){jobs.push(sleep(i*300).then(function(){if(S.dead)return;return hop(S,c,S.stand(c.i),1,700,false)}))});
      await Promise.all(jobs);if(S.dead)return;
      var pic=S.cast[0].id==='picasso'?S.cast[0]:null;if(pic)pic.wave=true;
      cap(S,'謝謝你搭熱氣球');await sleep(900);if(S.dead)return;
      var x0=S.bal.x;
      await tween(S,1700,function(p){var e=easeIn(p);S.bal.y=19*e;S.bal.x=x0+Math.sin(p*5)*.4-p*1.2});if(S.dead)return;
      await waitReady(S,15000);if(S.dead)return;
      S.root.style.transition='opacity .7s';S.root.style.opacity=0;await sleep(750);S.destroy();active=null})()})}

window.Ferry={go:go,arrive:arrive,holdUntil:holdUntil};
/* 從瀏覽器「上一頁」回來時，頁面會被原樣還原（包含蓋住畫面的雲），要清掉 */
window.addEventListener('pageshow',function(e){if(e.persisted){var o=document.querySelectorAll('.fy');for(var i=0;i<o.length;i++)o[i].remove();if(active&&active.destroy)try{active.destroy()}catch(x){}active=null}});
try{arrive()}catch(e){console.error(e)}
})();
