/* OTTO2 空島交通：搭熱氣球去別的島（three.js 立體版）。
   Ferry.go({to,place,from}) 出發：黑熊、三隻天竺鼠（十月加畢卡索）站在浮空島上等，熱氣球降下來，大家跳進籃子，飛走，再換頁。
   到了對面的頁面，這支檔案載入時會自動接著演「降落、大家跳下來」，等頁面準備好才收掉。
   頁面要告訴它「我準備好了」：Ferry.holdUntil(函式)。
   之後換交通工具（11 月雪橇…）改 VEH 和 mkBalloon。需要 three.js r128（頁面已載入就直接用，沒有就自己從 cdnjs 載）。
   角色造型（makeBear / makePet / 畢卡索）是從 park.html 原樣搬來的，park.html 改了造型這裡要跟著改。 */
(function(){
if(window.Ferry)return;
var KEY='otto2-ferry',PLACE={art:'作品島',park:'歡樂島'};
/* 每個月的交通工具與乘客；沒列到的月份用預設（熱氣球、不帶畢卡索）。畢卡索是十月生日才出場 */
var VEH={'10':{stripes:['#cfa94f','#ece3cc','#c0705a','#ece3cc'],picasso:true},def:{stripes:['#7d9e90','#efe6cf','#8a9bbd','#efe6cf'],picasso:false}};
function month(){return new Date(Date.now()+8*3600e3).toISOString().slice(5,7)}
function veh(){return VEH[month()]||VEH.def}
function castList(){var a=['bear','gabi','kabu','moka'];if(veh().picasso)a.unshift('picasso');return a}
function reduced(){try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}}

var CSS='.fy{position:fixed;inset:0;z-index:2147483000;overflow:hidden;touch-action:none;font-family:inherit;user-select:none;-webkit-user-select:none}'+
'.fy-sky{position:absolute;inset:0;background:linear-gradient(#86a9bf,#b7ccd3 52%,#dde3dc)}'+
'.fy-cv{position:absolute;inset:0;width:100%;height:100%;display:block;filter:saturate(.82) brightness(.96)}'+
'.fy-cap{position:absolute;left:0;right:0;top:11%;text-align:center;z-index:5;color:#fff;font-size:22px;letter-spacing:.18em;text-shadow:0 2px 10px rgba(30,60,80,.5);transition:opacity .35s;pointer-events:none}'+
'.fy-skip{position:absolute;right:14px;top:calc(env(safe-area-inset-top,0px) + 12px);z-index:6;border:0;border-radius:99px;padding:6px 14px;background:rgba(255,255,255,.55);color:#35505a;font:inherit;font-size:13px}'+
'.fy-veil{position:absolute;inset:0;z-index:7;background:#f2f7f6;opacity:0;pointer-events:none}';

function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
var easeOut=function(p){return 1-Math.pow(1-p,3)},easeIn=function(p){return p*p},easeIO=function(p){return p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2};
function tween(S,ms,fn){return new Promise(function(res){var t0=performance.now();(function f(n){var p=Math.min(1,(n-t0)/ms);fn(p);if(p<1&&!S.dead)requestAnimationFrame(f);else res()})(t0)})}

/* ================= 角色（從 park.html 原樣搬來；要 three.js 載好才能跑，所以包成函式） ================= */
var models=null;
function getModels(){if(models)return models;
/* ---- 以下原樣搬自 park.html ---- */
const gradMap=(()=>{const t=new THREE.DataTexture(new Uint8Array([90,170,255]),3,1,THREE.LuminanceFormat);t.minFilter=t.magFilter=THREE.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;return t})();
const toon=(color,extra={})=>new THREE.MeshToonMaterial(Object.assign({color,gradientMap:gradMap},extra));
function mesh(geo,mat,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;return m}
const SKIN='#e3a982';
function stripeTex(a='#ffffff',b='#1e1e1e',n=7){const cv=document.createElement('canvas');cv.width=64;cv.height=256;const x=cv.getContext('2d');
  for(let i=0;i<n*2;i++){x.fillStyle=i%2?b:a;x.fillRect(0,i*256/(n*2),64,256/(n*2)+1)}return new THREE.CanvasTexture(cv)}
function santaHat(y,s){const g=new THREE.Group();const cone=mesh(new THREE.ConeGeometry(.22,.46,16),toon('#d63a2f'),.05,.2,0);cone.rotation.z=-.35;g.add(cone);
  const brim=mesh(new THREE.TorusGeometry(.2,.06,8,20),toon('#ffffff'));brim.rotation.x=Math.PI/2;g.add(brim);g.add(mesh(new THREE.SphereGeometry(.07,10,8),toon('#ffffff'),.2,.4,0));g.position.y=y;g.scale.setScalar(s);return g}
function makeBear(fur,s,statue,noHat){
  const g=new THREE.Group(),m=toon(fur),snout=toon(statue?'#efe4d6':'#c9a27a'),dark=toon('#1c1c1f'),white=toon('#ffffff');
  const body=mesh(new THREE.SphereGeometry(.32,24,18),m,0,.36,0);body.scale.set(1,1.05,.92);g.add(body);
  g.add(mesh(new THREE.SphereGeometry(.27,24,18),m,0,.84,.02));
  [-1,1].forEach(d=>{g.add(mesh(new THREE.SphereGeometry(.095,14,10),m,.19*d,1.03,0));g.add(mesh(new THREE.SphereGeometry(.1,14,10),m,.2*d,.1,.12));g.add(mesh(new THREE.SphereGeometry(.085,12,10),m,.3*d,.42,.1))});
  const sn=mesh(new THREE.SphereGeometry(.11,16,12),snout,0,.78,.24);sn.scale.set(1.1,.85,.8);g.add(sn);
  g.add(mesh(new THREE.SphereGeometry(.045,10,8),dark,0,.82,.33));
  [-1,1].forEach(d=>{g.add(mesh(new THREE.SphereGeometry(.04,10,8),statue?dark:white,.1*d,.91,.24));if(!statue)g.add(mesh(new THREE.SphereGeometry(.022,8,6),dark,.1*d,.915,.275))});
  const v=mesh(new THREE.TorusGeometry(.14,.035,8,20,Math.PI),statue?toon('#d63a2f'):toon('#fff3d6'),0,.52,.285);v.rotation.z=Math.PI;v.rotation.x=-.25;g.add(v);
  if(statue){const cols=['#d63a2f','#62a9ff','#f2c14e','#b99af0','#6cd48a'];
    for(let k=0;k<12;k++){const a=k/12*Math.PI*2;const d=mesh(new THREE.SphereGeometry(.05+Math.random()*.03,10,8),toon(cols[k%5]),Math.cos(a)*.25,.62+Math.random()*.1,Math.sin(a)*.25+.02);d.scale.y=1.6;g.add(d)}}
  const scarf=mesh(new THREE.TorusGeometry(.2,.055,10,24),toon('#2f8f58'),0,.63,.02);scarf.rotation.x=Math.PI/2;g.add(scarf);
  if(!statue){const tail=mesh(new THREE.BoxGeometry(.1,.2,.05),toon('#2f8f58'),.12,.52,.2);tail.rotation.z=-.3;g.add(tail)}
  if(!noHat)g.add(santaHat(1.04,1));g.scale.setScalar(s);return g;
}
const PETD={
  gabi:{name:'嘎逼',role:'老大',body:'#d98a2b',face:'#6a4228',top:'#e39a35',capLen:1.42,ear:'#e8a28c',rump:'#6a4228',img:'pets/gabi.webp',line:'沒人看的時候就趴著睡。只要有菜吃，一定第一個衝到。'},
  kabu:{name:'卡布',role:'最無害',body:'#e29a38',ear:'#e7a08a',patch:'#fbf5ea',img:'pets/kabu.webp',line:'最笨的一隻，不會咬人。常常跑錯方向，吃得最慢。'},
  moka:{name:'摩卡',role:'長毛・躲貓貓',body:'#4a4038',face:'#3a322b',top:'#9a9288',capLen:.8,ear:'#5a4a40',hair:'#6b6258',backc:'#52483f',long:true,img:'pets/moka.webp',line:'吃飯也會搶，可是最會躲。躲在後面偷看大家抓卡布和嘎逼。'}};
function petHead(p){const k=1.04,g=new THREE.Group(),fc=p.face||p.body,SGp=(r,a,b)=>new THREE.SphereGeometry(r,a||18,b||12);
  const head=mesh(SGp(.36*k,22,16),toon(fc));head.scale.set(1,.95,1.06);g.add(head);
  if(p.top){const cap=mesh(new THREE.SphereGeometry(.366*k,22,12,0,Math.PI*2,0,p.capLen||1.12),toon(p.top));cap.scale.copy(head.scale);g.add(cap)}
  if(p.id==='gabi'){const bl=mesh(SGp(.08*k,10,8),toon('#ffffff'),0,.262*k,.252*k);bl.scale.set(.55,.22,1.7);bl.rotation.x=.7;g.add(bl)}
  const eyes=new THREE.Group();g.add(eyes);
  [-1,1].forEach(d=>{eyes.add(mesh(SGp(.062,12,10),toon('#16110f'),d*.18,.045,.33));eyes.add(mesh(SGp(.022,8,6),new THREE.MeshBasicMaterial({color:0xffffff}),d*.18+.02,.078,.385))});
  g.add(mesh(SGp(.048,10,8),toon('#e59a98'),0,-.1,.4));
  [-1,1].forEach(d=>{const e=mesh(SGp(.12*k,12,10),toon(p.ear),d*.28,.2,-.03);e.scale.set(1,.85,.4);e.rotation.z=d*-.7;e.rotation.y=d*.5;g.add(e)});
  g.userData.eyes=eyes;return g}
function petZzz(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
  x.fillStyle='#ffffff';x.strokeStyle='#4a5680';x.lineWidth=7;x.font='900 70px sans-serif';x.textAlign='center';x.textBaseline='middle';x.strokeText('Z',50,80);x.fillText('Z',50,80);x.font='900 44px sans-serif';x.strokeText('z',92,40);x.fillText('z',92,40);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));s.scale.set(.6,.6,1);return s}
function makePet(id){const p=PETD[id];p.id=id;const g=new THREE.Group(),SGp=(r,a,b)=>new THREE.SphereGeometry(r,a||18,b||12);
  const body=mesh(SGp(.5,22,16),toon(p.body),0,.42,-.05);body.scale.set(.88,.78,1.2);g.add(body);
  if(p.patch){const pt=mesh(SGp(.3,14,10),toon(p.patch),0,.745,-.1);pt.scale.set(.95,.42,1.25);g.add(pt)}
  if(p.rump){const r=mesh(SGp(.33,14,10),toon(p.rump),0,.46,-.5);r.scale.set(1.05,.9,.85);g.add(r)}
  if(p.long){const sk=mesh(SGp(.5,20,10),toon(p.hair),0,.24,-.12);sk.scale.set(1.25,.46,1.5);g.add(sk);
    const back=mesh(new THREE.SphereGeometry(.52,20,10,0,Math.PI*2,0,1.25),toon(p.backc),0,.42,-.08);back.scale.set(.92,.82,1.25);g.add(back);
    const tail=mesh(SGp(.3,12,10),toon(p.hair),0,.32,-.78);tail.scale.set(1,.7,.8);g.add(tail)}
  const head=petHead(p);head.position.set(0,.5,.52);g.add(head);
  const feet=[];[[-.2,.34],[.2,.34],[-.24,-.34],[.24,-.34]].forEach(([x,z])=>{const f=mesh(SGp(.085,10,8),toon('#c9a58a'),x,.07,z);f.scale.set(1,.6,1.35);g.add(f);feet.push(f)});
  const zzz=petZzz();zzz.position.set(.2,1.5,.5);zzz.visible=false;g.add(zzz);
  g.userData={id,head,eyes:head.userData.eyes,feet,body,zzz};return g}
/* ---- 搬來的部分到此為止 ---- */
/* 畢卡索公仔（經典條紋款 p01，park.html 的 makePicasso 去掉其他款式） */
function makePicassoP01(){
  const g=new THREE.Group(),M=c=>toon(c);
  const legs=[];[-1,1].forEach(d=>{const lg=new THREE.Group();lg.position.set(d*.085,.24,0);lg.add(mesh(new THREE.CylinderGeometry(.065,.07,.2,10),M('#2b2b2b'),0,-.1,0));
    const sh=mesh(new THREE.SphereGeometry(.085,12,8),M('#1a1a1a'),0,-.2,.03);sh.scale.set(1,.6,1.3);lg.add(sh);g.add(lg);legs.push(lg)});
  const tm=toon('#ffffff',{map:stripeTex()});const torso=mesh(new THREE.CylinderGeometry(.16,.2,.34,16),tm,0,.42,0);g.add(torso);
  const arms=[];
  [-1,1].forEach(d=>{const ar=new THREE.Group();ar.position.set(d*.19,.55,0);const sl=mesh(new THREE.CylinderGeometry(.05,.055,.2,8),tm,0,-.08,0);ar.add(sl);
    ar.add(mesh(new THREE.SphereGeometry(.05,10,8),M(SKIN),0,-.2,0));ar.rotation.z=d*.75;g.add(ar);arms.push(ar)});
  const head=mesh(new THREE.SphereGeometry(.34,28,20),M(SKIN),0,.92,0);head.scale.set(1,1.04,.92);g.add(head);
  [-1,1].forEach(d=>{const ch=new THREE.Mesh(new THREE.CircleGeometry(.05,14),new THREE.MeshBasicMaterial({color:'#f2a0a0',transparent:true,opacity:.55}));ch.position.set(d*.2,.84,.29);ch.rotation.y=d*.55;g.add(ch)});
  [-1,1].forEach(d=>g.add(mesh(new THREE.SphereGeometry(.07,10,8),M(SKIN),d*.33,.88,0)));
  [-1,1].forEach(d=>{const h=mesh(new THREE.SphereGeometry(.14,14,10),M('#f2eee6'),d*.3,1.0,-.03);h.scale.set(.75,1.25,1.1);h.rotation.z=d*-.3;g.add(h)});
  const eyes=new THREE.Group();eyes.position.set(0,.93,.3);g.add(eyes);
  [-1,1].forEach(d=>{eyes.add(mesh(new THREE.SphereGeometry(.058,14,10),toon('#ffffff'),d*.068,0,0));eyes.add(mesh(new THREE.SphereGeometry(.026,10,8),toon('#111111'),d*.068,0,.05))});
  g.add(mesh(new THREE.SphereGeometry(.03,10,8),M('#f4a19a'),0,.86,.32));
  g.add(mesh(new THREE.BoxGeometry(.04,.008,.01),M('#c0392b'),0,.78,.315));
  g.userData.legs=legs;g.userData.eyes=eyes;g.userData.arms=arms;return g}
models={makeBear:makeBear,makePet:makePet,makePicassoP01:makePicassoP01};return models}
/* 角色大小：站在島上和坐在籃子裡用同一個大小，跳進籃子時不用縮放 */
function mkChar(id){var m=getModels(),g;
  if(id==='bear'){g=m.makeBear('#1c1c1f',1,false,month()!=='11'&&month()!=='12')}
  else if(id==='picasso'){g=m.makePicassoP01();g.scale.setScalar(1.15)}
  else{g=m.makePet(id);g.scale.setScalar(.95)}
  return g}

/* ================= 浮空島場景（風格照吉祥物島 MIB：低多邊形、Lambert、層層岩壁） ================= */
var GR={g1:'#687f41',g3:'#7d9444',sand:'#bfae82',rock:'#a38d68',deep:'#7a6a4c',wood:'#a07446',wood2:'#80593a',cream:'#efe6cf',roof:'#c9755a'};
function hash(x,y,z){var s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return s-Math.floor(s)-.5}
function fl(g,j){if(j){var p=g.attributes.position;for(var i=0;i<p.count;i++){var x=p.getX(i),y=p.getY(i),z=p.getZ(i);p.setXYZ(i,x+hash(x,y,z)*j,y+hash(y,z,x)*j,z+hash(z,x,y)*j)}}if(g.index)g=g.toNonIndexed();g.computeVertexNormals();return g}
function lam(c,o){return new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}))}
function M(g,m,x,y,z){var o=new THREE.Mesh(g,m);o.position.set(x||0,y||0,z||0);return o}
function ICO(r,d,j){return fl(new THREE.IcosahedronGeometry(r,d===undefined?1:d),j)}
function CYL(a,b,h,s,j){return fl(new THREE.CylinderGeometry(a,b,h,s||10),j)}
function CON(r,h,s,j){return fl(new THREE.ConeGeometry(r,h,s||8),j)}
function lathe(g,R,pts,col,j){var geo=fl(new THREE.LatheGeometry(pts.map(function(a){return new THREE.Vector2(a[0]*R,a[1])}),20),j||.12);g.add(new THREE.Mesh(geo,lam(col,{side:THREE.DoubleSide})))}
function islandBase(R){var g=new THREE.Group();
  lathe(g,R,[[0,0],[.9,0],[.98,-.28],[.99,-.52]],GR.g1,.06);lathe(g,R,[[.99,-.52],[1,-1.2],[.92,-1.9]],GR.sand);
  lathe(g,R,[[.92,-1.9],[.8,-2.8],[.6,-3.6]],GR.rock);lathe(g,R,[[.6,-3.6],[.38,-4.5],[.12,-5.2],[0,-5.4]],GR.deep);return g}
function lpTree(kind,s){var g=new THREE.Group();g.add(M(CYL(.12,.2,1.1,6),lam(GR.wood2),0,.55,0));
  if(kind==='pine'){[[1.0,1.2,1.2],[.78,1.1,1.95],[.52,.95,2.65]].forEach(function(a,i){g.add(M(CON(a[0],a[1],8,.05),lam(i%2?'#5d7a3a':'#566d2f'),0,a[2],0))})}
  else{var cols=kind==='blossom'?['#d9c3bb','#e2d0c8','#cdb4ad']:['#7d9444','#6c843a','#6f8a40'];
    [[0,1.6,0,.95],[-.5,1.35,.25,.62],[.5,1.4,-.2,.66]].forEach(function(a,i){var c=M(ICO(a[3],1,.1),lam(cols[i%3]),a[0],a[1],a[2]);c.scale.y=.88;g.add(c)})}
  g.scale.setScalar(s||1);return g}
function signTex(txt){var c=document.createElement('canvas');c.width=256;c.height=100;var x=c.getContext('2d');x.fillStyle='#e9c98f';x.fillRect(0,0,256,100);x.strokeStyle='#8b5e34';x.lineWidth=8;x.strokeRect(4,4,248,92);
  x.fillStyle='#4a2f17';x.font='900 50px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,128,54);return new THREE.CanvasTexture(c)}
function lpCloud(){var g=new THREE.Group(),m=lam('#ffffff',{flatShading:true,emissive:'#c9d6de'});
  [[0,0,0,1.5],[1.5,-.15,.2,1.1],[-1.5,-.2,-.1,1.15],[.6,.55,0,1.05]].forEach(function(a){var c=M(ICO(a[3],1,.18),m,a[0],a[1],a[2]);c.scale.y=.7;g.add(c)});return g}
function mkIsland(destName){
  var g=new THREE.Group(),R=12,sd=11,rnd=function(){sd=(sd*16807)%2147483647;return sd/2147483647};
  g.add(islandBase(R));
  /* 這一帶留給停機坪和角色，其他地方才種東西 */
  var free=function(x,z){return Math.hypot(x/6.6,(z-.4)/4.6)>1&&Math.hypot(x,z)<R*.88&&z<6.5};
  var pick=function(){for(var k=0;k<60;k++){var a=rnd()*6.283,d=Math.sqrt(rnd())*R*.88,x=Math.cos(a)*d,z=Math.sin(a)*d;if(free(x,z))return[x,z]}return[R*.8,0]};
  var i,p;
  for(i=0;i<16;i++){p=pick();var m=M(ICO(.9+rnd()*.9,2,.05),lam(i%2?GR.g3:'#72893f'),p[0],0,p[1]);m.scale.y=.18;g.add(m)}
  var kinds=['pine','round','pine','blossom','round','pine','round'];
  for(i=0;i<26;i++){p=pick();for(var q=0;q<40&&p[1]>1.2;q++)p=pick();if(p[1]>1.2)continue;var t=lpTree(kinds[i%kinds.length],.85+rnd()*.35);t.position.set(p[0],0,p[1]);t.rotation.y=rnd()*6;g.add(t)}
  for(i=0;i<9;i++){p=pick();var r=.3+rnd()*.3,k=M(ICO(r,0,.08),lam('#cdbf9e'),p[0],r*.45,p[1]);k.scale.y=.62;g.add(k)}
  var cols=['#e0c067','#d99aa8','#efe9dc','#9fbad0','#d9a67a'];
  for(i=0;i<130;i++){p=pick();var f=M(new THREE.OctahedronGeometry(.1),lam(cols[i%5]),p[0],.1,p[1]);f.rotation.set(rnd()*3,rnd()*3,0);g.add(f)}
  /* 木棧橋停機坪：熱氣球降在這裡 */
  var pad=new THREE.Group();pad.add(M(CYL(2.0,2.1,.16,14,.03),lam('#96693a'),0,.08,0));
  for(var k2=-2;k2<=2;k2++){pad.add(M(new THREE.BoxGeometry(3.6,.05,.42),lam(k2%2?'#a87a45':'#b08350'),0,.18,k2*.62*.6))}
  g.add(pad);
  /* 木牌：寫這裡是哪一個島 */
  var sg=new THREE.Group();sg.add(M(CYL(.07,.08,1.5,6),lam(GR.wood2),0,.75,0));
  sg.add(M(new THREE.BoxGeometry(1.6,.62,.09),[lam(GR.wood),lam(GR.wood),lam(GR.wood),lam(GR.wood),new THREE.MeshLambertMaterial({map:signTex(destName)}),lam(GR.wood)],0,1.45,0));
  g.add(sg);g.userData.sign=sg;
  /* 一疊箱子 */
  var cr=new THREE.Group();cr.add(M(new THREE.BoxGeometry(.7,.6,.7),lam('#b8935c'),0,.3,0));cr.add(M(new THREE.BoxGeometry(.55,.5,.55),lam('#a37a49'),.05,.85,0).rotateY(.4));cr.position.set(-4.4,0,-2.6);g.add(cr);
  return g}
/* 熱氣球：原點在籃子底部中央，往上長 */
function wAt(y){return y<=110?102*Math.sqrt(Math.max(0,1-Math.pow((110-y)/106,2))):26+76*Math.cos((y-110)/76*Math.PI/2)}
function canvasTex(w,h,draw){var c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c)}
function mkBalloon(stripes){
  var g=new THREE.Group(),i,H=3.9,R=2.1,y0=3.3,pts=[];
  for(i=0;i<=30;i++){var t=i/30;pts.push(new THREE.Vector2(wAt(186-t*182)/102*R,y0+t*H))}
  var tex=canvasTex(512,16,function(x,w,h){for(var k=0;k<8;k++){x.fillStyle=stripes[k%stripes.length];x.fillRect(k*w/8,0,w/8+1,h)}});
  var env=new THREE.Mesh(fl(new THREE.LatheGeometry(pts,24),.0),new THREE.MeshLambertMaterial({map:tex,side:THREE.DoubleSide}));g.add(env);
  var wick=canvasTex(128,64,function(x,w,h){x.fillStyle='#b98a52';x.fillRect(0,0,w,h);x.strokeStyle='rgba(70,45,20,.35)';x.lineWidth=3;for(var a=0;a<w;a+=16){x.beginPath();x.moveTo(a,0);x.lineTo(a,h);x.stroke()}for(var b=8;b<h;b+=16){x.beginPath();x.moveTo(0,b);x.lineTo(w,b);x.stroke()}});
  var basket=new THREE.Mesh(new THREE.BoxGeometry(2.2,.95,1.8),new THREE.MeshLambertMaterial({map:wick}));basket.position.y=.48;g.add(basket);
  var rim=new THREE.Mesh(new THREE.BoxGeometry(2.34,.1,1.94),lam('#8f6232'));rim.position.y=.98;g.add(rim);
  var rope=lam('#6b5a45'),up=new THREE.Vector3(0,1,0);
  [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(c){var a=new THREE.Vector3(c[0]*1.05,1.0,c[1]*.85),b=new THREE.Vector3(c[0]*.5,y0+.05,c[1]*.5),d=b.clone().sub(a),len=d.length();
    var m=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,len,5),rope);m.position.copy(a).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(up,d.normalize());g.add(m)});
  var burner=new THREE.Mesh(new THREE.CylinderGeometry(.14,.18,.22,8),lam('#5a5148'));burner.position.y=2.55;g.add(burner);
  var flame=new THREE.Mesh(new THREE.ConeGeometry(.12,.55,8),new THREE.MeshBasicMaterial({color:'#ffb347'}));flame.position.y=2.98;g.add(flame);
  return{g:g,flame:flame}}
function blob(){var t=canvasTex(64,64,function(x){var gr=x.createRadialGradient(32,32,2,32,32,30);gr.addColorStop(0,'rgba(30,45,20,.5)');gr.addColorStop(1,'rgba(30,45,20,0)');x.fillStyle=gr;x.fillRect(0,0,64,64)});
  var m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=.2;return m}

/* 建場景。side：'r' 熱氣球停右邊、大家站左邊（出發）；'l' 反過來（降落） */
function build(side,list,siteName){
  var root=el('div','fy','<style>'+CSS+'</style><div class="fy-sky"></div>'),cv=el('canvas','fy-cv');root.appendChild(cv);
  var S={root:root,side:side,list:list,dead:false,cast:[],clouds:[],bal:{x:0,y:18},t:0};
  var R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});R.setPixelRatio(Math.min(window.devicePixelRatio||1,2));R.setClearColor(0x000000,0);
  var scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(40,1,.1,300);
  scene.fog=new THREE.Fog('#bccdd3',40,110);
  scene.add(new THREE.HemisphereLight(0xe4eef5,0x8a9a68,.8));var sun=new THREE.DirectionalLight(0xfff0d4,.75);sun.position.set(-6,12,9);scene.add(sun);
  S.R=R;S.scene=scene;S.cam=cam;
  var isl=mkIsland(siteName);scene.add(isl);S.island=isl;
  isl.userData.sign.position.set(side==='r'?-3.4:3.4,0,-2.6);isl.userData.sign.rotation.y=side==='r'?.35:-.35;
  /* 遠方的小浮島（霧中）和低多邊形的雲 */
  [[-17,3,-24,.34],[19,-2,-30,.42],[-6,-6,-40,.5]].forEach(function(a){var b=islandBase(7);b.position.set(a[0],a[1],a[2]);b.scale.setScalar(a[3]);scene.add(b)});
  for(var i=0;i<9;i++){var cl=lpCloud(),sc=1+(i%3)*.5;cl.position.set(-30+i*7.5,2+Math.sin(i*2.3)*7+(i%2?8:-2),-10-i*3.5);cl.scale.setScalar(sc);cl.userData.v=.3+(i%3)*.15;scene.add(cl);S.clouds.push(cl)}
  var B=mkBalloon(veh().stripes);S.bg=B.g;S.flame=B.flame;scene.add(B.g);S.bsh=blob();scene.add(S.bsh);
  var tall={picasso:1,bear:1},nT=list.filter(function(x){return tall[x]}).length,nP=list.length-nT,ti=0,pi=0;
  list.forEach(function(id,k){var g=mkChar(id),sh=blob(),slot;
    if(tall[id]){slot=new THREE.Vector3(nT>1?-.45+ti*.9:0,.12,-.4);ti++}else{slot=new THREE.Vector3(nP>1?-.8+pi*1.6/(nP-1):0,0,.45);pi++}
    g.rotation.y=0;scene.add(g);scene.add(sh);S.cast.push({id:id,g:g,sh:sh,i:k,p:new THREE.Vector3(),on:false,hop:false,slot:slot,u:g.userData})});
  S.landX=side==='r'?1.5:-1.5;S.bal.x=S.landX;
  S.stand=function(i){var xs=side==='r'?-4.1+i*1.0:4.1-i*1.0;return new THREE.Vector3(xs,0,2.3+(i%2)*.55)};
  S.slotPos=function(c){return c.slot.clone().applyEuler(S.bg.rotation).add(new THREE.Vector3(S.bal.x,S.bal.y+.62,0))};
  S.capEl=el('div','fy-cap','');root.appendChild(S.capEl);
  S.skip=el('button','fy-skip','略過');S.skip.type='button';root.appendChild(S.skip);
  S.veil=el('div','fy-veil');root.appendChild(S.veil);
  function size(){var W=window.innerWidth,H=window.innerHeight,asp=W/H,tf=Math.tan(20*Math.PI/180);
    R.setSize(W,H,false);cam.aspect=asp;
    var dist=Math.max(12.5/(2*tf),10.5/(asp*2*tf)),pit=.4;S.dist=dist;cam.position.set(0,1.6+Math.sin(pit)*dist,Math.cos(pit)*dist);cam.lookAt(0,1.6,0);cam.updateProjectionMatrix()}
  size();window.addEventListener('resize',size);
  S.frame=function(now){
    if(S.stopped)return;var dt=Math.min(.05,(now-(S.tp||now))/1000);S.tp=now;S.t+=dt;
    S.bg.position.set(S.bal.x,S.bal.y,0);S.bg.rotation.y=Math.sin(S.t*.7)*.45;S.bg.rotation.z=Math.sin(S.t*1.1)*.02;
    S.flame.scale.set(1,.85+Math.sin(S.t*18)*.15+Math.sin(S.t*31)*.1,1);
    var hh=Math.max(0,S.bal.y),near=hh<8;S.bsh.visible=near;S.bsh.position.set(S.bal.x,.21,0);S.bsh.scale.set(3.4+hh*.1,3.4+hh*.1,1);S.bsh.material.opacity=Math.max(0,1-hh/8);
    S.cast.forEach(function(c){
      var g=c.g;
      if(c.on){g.position.copy(S.slotPos(c));g.rotation.y=S.bg.rotation.y;g.scale.y=1}
      else if(!c.hop){var b=Math.abs(Math.sin(S.t*4+c.i*1.3))*.07;g.position.set(c.p.x,c.p.y+b,c.p.z);g.rotation.y=Math.sin(S.t*.8+c.i)*.15;
        if(c.u.arms){c.u.arms[1].rotation.z=c.wave?.75+Math.abs(Math.sin(S.t*8))*1.1:.75}}
      var onGround=!c.on&&g.position.y<1;c.sh.visible=onGround;c.sh.position.set(g.position.x,.21,g.position.z);c.sh.scale.set(.9,.9,1)});
    S.clouds.forEach(function(c){c.position.x+=c.userData.v*dt;if(c.position.x>34)c.position.x=-34});
    isl.position.y=Math.sin(S.t*.8)*.05;
    cam.position.x=Math.sin(S.t*.25)*.7;cam.lookAt(0,1.6,0);
    R.render(scene,cam);S.raf=requestAnimationFrame(S.frame)};
  S.raf=requestAnimationFrame(S.frame);
  S.destroy=function(){S.stopped=true;S.dead=true;cancelAnimationFrame(S.raf);window.removeEventListener('resize',size);try{R.dispose();if(R.forceContextLoss)R.forceContextLoss()}catch(e){}root.remove()};
  return S}
function cap(S,t){S.capEl.style.opacity=0;setTimeout(function(){S.capEl.textContent=t;S.capEl.style.opacity=1},180)}
/* 跳：往 target（函式，每一幀重算，因為熱氣球還在轉）拋物線過去 */
function hop(S,c,target,ms,board){
  var p0=c.g.position.clone();c.on=false;c.hop=true;
  return tween(S,ms,function(p){var e=easeIO(p),t=target();c.g.position.lerpVectors(p0,t,e);c.g.position.y+=Math.sin(p*Math.PI)*1.8;c.g.rotation.y*=.9}).then(function(){var t=target();c.p.copy(t);c.g.position.copy(t);c.hop=false;c.on=!!board})}
var active=null;

/* ---------- 出發 ---------- */
function go(opt){
  if(active)return Promise.resolve();
  if(!opt||!opt.to)return Promise.resolve();
  var list=castList();
  function leave(){try{sessionStorage.setItem(KEY,JSON.stringify({t:Date.now(),from:opt.from||'',place:opt.place||'art',list:list}))}catch(e){}location.href=opt.to}
  if(reduced()||!window.THREE){leave();return Promise.resolve()}
  var S;try{S=build('r',list,PLACE[opt.from]||'歡樂島')}catch(e){console.error(e);leave();return Promise.resolve()}
  active=S;document.documentElement.appendChild(S.root);
  S.skip.onclick=function(){S.dead=true;leave()};
  S.root.style.opacity=0;S.root.style.transition='opacity .35s';requestAnimationFrame(function(){S.root.style.opacity=1});
  S.cast.forEach(function(c){c.p.copy(S.stand(c.i));c.g.position.copy(c.p)});
  var pic=S.cast[0].id==='picasso'?S.cast[0]:null;if(pic)pic.wave=true;
  return (async function(){
    cap(S,'熱氣球快到了…');await sleep(500);if(S.dead)return;
    await tween(S,1900,function(p){var e=easeOut(p);S.bal.y=18*(1-e);S.bal.x=S.landX+Math.sin(p*7)*.9*(1-p)});if(S.dead)return;
    if(pic)pic.wave=false;
    cap(S,'上車囉！');await sleep(350);if(S.dead)return;
    var jobs=[];
    S.cast.forEach(function(c,i){jobs.push(sleep(i*330).then(function(){if(S.dead)return;return hop(S,c,function(){return S.slotPos(c)},750,true)}))});
    await Promise.all(jobs);if(S.dead)return;
    cap(S,'出發！去'+(PLACE[opt.place]||'作品島'));await sleep(550);if(S.dead)return;
    await tween(S,2100,function(p){var e=easeIn(p);S.bal.y=21*e;S.bal.x=S.landX+Math.sin(p*5)*.5+p*1.2;S.veil.style.opacity=p>.55?(p-.55)/.45:0});
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
    var S;try{S=build('l',d.list,PLACE[d.place]||'作品島')}catch(e){console.error(e);pre.remove();return}
    active=S;document.documentElement.appendChild(S.root);pre.remove();S.veil.style.opacity=1;
    var home=PLACE[d.place]||'作品島';
    S.skip.onclick=function(){S.dead=true;waitReady({dead:false},12000).then(function(){S.destroy();active=null})};
    S.cast.forEach(function(c){c.on=true});
    S.bal.y=18;
    (async function(){
      await sleep(120);
      tween(S,800,function(p){S.veil.style.opacity=1-p});
      cap(S,'到囉！'+home);
      await tween(S,1900,function(p){var e=easeOut(p);S.bal.y=18*(1-e);S.bal.x=S.landX+Math.sin(p*7)*.9*(1-p)});if(S.dead)return;
      await sleep(250);
      var jobs=[];
      S.cast.slice().reverse().forEach(function(c,i){jobs.push(sleep(i*300).then(function(){if(S.dead)return;var to=S.stand(c.i);return hop(S,c,function(){return to},750,false)}))});
      await Promise.all(jobs);if(S.dead)return;
      var pic=S.cast[0].id==='picasso'?S.cast[0]:null;if(pic)pic.wave=true;
      cap(S,'謝謝你搭熱氣球');await sleep(900);if(S.dead)return;
      var x0=S.bal.x;
      await tween(S,1700,function(p){var e=easeIn(p);S.bal.y=21*e;S.bal.x=x0+Math.sin(p*5)*.4-p*1.2});if(S.dead)return;
      await waitReady(S,15000);if(S.dead)return;
      S.root.style.transition='opacity .7s';S.root.style.opacity=0;await sleep(750);S.destroy();active=null})()})}

window.Ferry={go:go,arrive:arrive,holdUntil:holdUntil};
/* 從瀏覽器「上一頁」回來時，頁面會被原樣還原（包含蓋住畫面的雲），要清掉 */
window.addEventListener('pageshow',function(e){if(e.persisted){var o=document.querySelectorAll('.fy');for(var i=0;i<o.length;i++)o[i].remove();if(active&&active.destroy)try{active.destroy()}catch(x){}active=null}});
try{arrive()}catch(e){console.error(e)}
})();
