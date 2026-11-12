/* ---------- 2026-11-12 大熊：雪地跳跳換成 3D（三條跑道、左右滑換道、往上滑跳） ----------
   這支檔案是用 預覽圖/build-jump3d.py 從 預覽圖/bear-jump-3d-demo.html 轉出來的，改玩法請改試玩頁再重轉。
   jump.js 的 play() 會呼叫 window.JumpPlay3D({ov,gone,sfx,bcap,jumps,santaEvery,tutorial,hard})，回傳 {sc,b,crashed,sec}；
   開不了 3D（WebGL 失敗）或網址帶 ?jp2d=1 就用原本平面版。 */
(function(){
  var st=document.createElement('style');st.textContent="#jpFull{color:#fff;font-family:\"PingFang TC\",\"Noto Sans TC\",system-ui,sans-serif}\n\n/* 版面：整個畫面是 3D 雪地跑道（後面一張極光夜空），分數列釘在上方，開始／結算視窗疊在中間 */\n#j3sky,#j3gl{position:absolute;inset:0;width:100%;height:100%;display:block}\n#j3gl{touch-action:none}\n#j3hud{position:absolute;top:0;left:0;right:0;display:flex;gap:6px;justify-content:space-between;align-items:center;pointer-events:none;flex-wrap:wrap;\n  padding-block:calc(env(safe-area-inset-top,0px) + 10px) 0;padding-left:max(12px,env(safe-area-inset-left,0px));padding-right:max(12px,env(safe-area-inset-right,0px))}\n.j3chip{background:rgba(11,20,55,.72);border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:5px 11px;font-weight:800;font-size:15px;white-space:nowrap;font-variant-numeric:tabular-nums}\n.j3chip b{color:#ffd447;font-size:19px}\n.j3chip.y{background:#ffd447;color:#3a2600;border-color:#ffd447}.j3chip.y b{color:#3a2600}\n.j3chip.c{background:#9be7ff;color:#0b2a3a;border-color:#9be7ff}.j3chip.c b{color:#0b2a3a}\n#j3toast{position:absolute;left:0;right:0;top:28%;text-align:center;font-weight:900;font-size:26px;color:#ffd447;text-shadow:0 2px 0 #1a1430,0 0 12px rgba(0,0,0,.6);pointer-events:none;transition:opacity .3s}\n#j3tip{position:absolute;left:0;right:0;bottom:0;margin:0;padding:6px 16px calc(env(safe-area-inset-bottom,0px) + 10px);text-align:center;color:#2b3a6a;font-size:13px;font-weight:700;pointer-events:none}\n#j3tut{position:absolute;left:0;right:0;top:34%;display:flex;justify-content:center;pointer-events:none;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}\n#j3tut .j3tbox{background:rgba(11,20,55,.78);border:2px solid rgba(255,255,255,.35);border-radius:20px;padding:14px 22px 12px;display:flex;flex-direction:column;align-items:center;gap:4px;min-width:220px}\n#j3tut b{display:block;text-align:center;font-size:22px;color:#ffd447}#j3tut small{text-align:center;font-size:13px;color:#dfe6ff}\n#j3tut .j3hand{font-size:44px;line-height:1}\n#j3tut .j3hand.lr{animation:handlr 1.2s ease-in-out infinite}#j3tut .j3hand.up{animation:handup 1s ease-in-out infinite}\n@keyframes handlr{0%,100%{transform:translateX(-46px)}50%{transform:translateX(46px)}}\n@keyframes handup{0%{transform:translateY(24px);opacity:.3}60%{transform:translateY(-24px);opacity:1}100%{transform:translateY(-24px);opacity:0}}\n#j3tut.ok b{color:#7dffb0}\n.j3fly{position:fixed;left:0;top:0;z-index:65;font-size:34px;line-height:1;pointer-events:none;transform:translate(-50%,-50%);transition:transform .55s cubic-bezier(.5,-0.3,.7,1),opacity .55s}\n.j3pop{position:fixed;left:0;top:0;z-index:66;font-weight:900;font-size:30px;pointer-events:none;transform:translate(-50%,-50%);text-shadow:0 2px 0 #1a1430,0 0 8px rgba(0,0,0,.5);animation:popup .8s ease-out forwards}\n@keyframes popup{0%{opacity:0;transform:translate(-50%,-30%) scale(.6)}15%{opacity:1;transform:translate(-50%,-60%) scale(1.25)}100%{opacity:0;transform:translate(-50%,-180%) scale(1)}}\n.j3chip.j3bump{animation:bump .3s ease-out}\n@keyframes bump{40%{transform:scale(1.25)}}\n#jc{position:absolute;left:0;right:0;bottom:33%;text-align:center;font-weight:900;font-size:34px;color:#ffd447;text-shadow:0 2px 0 #1a1430,0 0 12px rgba(0,0,0,.6);pointer-events:none;animation:jcb .4s ease-in-out infinite alternate}\n@keyframes jcb{to{transform:translateY(-8px) scale(1.1)}}\n#j3ring{position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 0 0 rgba(255,212,71,0);transition:box-shadow .25s}\n#j3ring.on{box-shadow:inset 0 0 40px 10px rgba(255,212,71,.55);transition:none}\n@media (prefers-reduced-motion: reduce){.j3fly{transition:none}.j3pop{animation-duration:.01s}}\n";document.head.appendChild(st);
  window.JumpPlay3D=function(O){return new Promise(function(RES,REJ){
    var RR=null,dead=0;
    O.ov.innerHTML="<canvas id=\"j3sky\" aria-hidden=\"true\"></canvas> <canvas id=\"j3gl\" aria-label=\"雪地跳跳 3D 遊戲畫面\"></canvas> <div id=\"j3hud\" hidden> <div class=\"j3chip\">⏱ <b id=\"j3hT\">0</b> 秒</div> <div class=\"j3chip y\" id=\"j3hD\" hidden>🔔 雙倍 <b id=\"j3hDt\">5.0</b></div> <div class=\"j3chip c\" id=\"j3hBo\" hidden>🌟 加速×2 <b id=\"j3hBot\">5.0</b></div> <div class=\"j3chip\" id=\"j3hGB\">🎁 <b id=\"j3hG\">0</b> 🪙 <b id=\"j3hB\">0</b></div> </div> <div id=\"j3ring\"></div> <div id=\"j3jc\" hidden>↑ 跳！</div> <div id=\"j3tut\" hidden><div class=\"j3tbox\"><div class=\"j3hand\" id=\"j3tHand\">👆</div><b id=\"j3tTxt\">左右滑，換跑道</b><small id=\"j3tSub\">試試看往左或往右滑</small></div></div> <div id=\"j3toast\" style=\"opacity:0\"></div> <p id=\"j3tip\" hidden>左右滑（或點左右兩邊）換跑道・往上滑或點中間跳</p>";
    try{

var $=function(id){return document.getElementById('j3'+id)};
var T=THREE;

/* ---------- 天空：極光、星星、月亮（畫在 3D 後面） ---------- */
var sky=$('sky'),sx=sky.getContext('2d');
function vw(){return sky.clientWidth||innerWidth}function vh(){return sky.clientHeight||innerHeight}
function paintSky(){var dp=Math.min(2,devicePixelRatio||1),W=vw(),H=vh();sky.width=W*dp;sky.height=H*dp;sx.setTransform(dp,0,0,dp,0,0);
  var gr=sx.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#060b26');gr.addColorStop(.45,'#12205a');gr.addColorStop(.62,'#2a4090');gr.addColorStop(1,'#2a4090');sx.fillStyle=gr;sx.fillRect(0,0,W,H);
  for(var i=0;i<Math.round(W*H/2400);i++){sx.fillStyle='rgba(255,255,240,'+(.4+Math.random()*.55).toFixed(2)+')';sx.beginPath();sx.arc(Math.random()*W,Math.random()*H*.5,Math.random()*1.2+.3,0,7);sx.fill()}
  var st=document.createElement('canvas');st.width=4;st.height=160;var k=st.getContext('2d'),a=k.createLinearGradient(0,160,0,0);
  a.addColorStop(0,'rgba(170,255,200,0)');a.addColorStop(.06,'rgba(150,255,190,.95)');a.addColorStop(.25,'rgba(70,235,150,.65)');a.addColorStop(.6,'rgba(60,180,170,.25)');a.addColorStop(.85,'rgba(150,100,230,.12)');a.addColorStop(1,'rgba(150,100,230,0)');k.fillStyle=a;k.fillRect(0,0,4,160);
  var RIB=[{b:.24,a:.035,h:.15,k:2.2,ph:0,al:.55},{b:.18,a:.03,h:.11,k:3.1,ph:2,al:.4},{b:.3,a:.025,h:.09,k:1.6,ph:4,al:.3}],tt=Math.random()*20,step=Math.max(2,W/200);
  sx.globalCompositeOperation='lighter';
  RIB.forEach(function(R){for(var x0=0;x0<W;x0+=step){var u=x0/W,y0=H*(R.b+R.a*Math.sin(u*R.k*6.283+tt+R.ph)+R.a*.5*Math.sin(u*R.k*13+tt*1.7));
    var fl=.45+.55*Math.pow(Math.sin(u*17+tt+R.ph),2),ed=Math.min(1,u*5,(1-u)*5),hh=H*R.h*(.8+.4*Math.sin(u*9+tt+R.ph));sx.globalAlpha=R.al*fl*ed;sx.drawImage(st,x0,y0-hh*.94,step+.8,hh)}});
  sx.globalAlpha=1;sx.globalCompositeOperation='source-over';
  sx.fillStyle='rgba(255,244,200,.14)';sx.beginPath();sx.arc(W-58,H*.09+40,44,0,7);sx.fill();sx.fillStyle='#fff3c4';sx.beginPath();sx.arc(W-58,H*.09+40,25,0,7);sx.fill()}

/* ---------- 3D：遊樂島的模型（從 park.html 搬來） ---------- */
var gradMap=(function(){var t=new T.DataTexture(new Uint8Array([90,170,255]),3,1,T.LuminanceFormat);t.minFilter=t.magFilter=T.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;return t})();
function toon(c,ex){return new T.MeshToonMaterial(Object.assign({color:c,gradientMap:gradMap},ex||{}))}
function mesh(geo,mat,x,y,z,p){var m=new T.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);if(p)p.add(m);return m}
/* 2026-11-12 效能（客人說會停頓、當機）：一個模型裡同一種材質的零件併成一塊、顏色寫進頂點（一棵聖誕樹 34 次繪製 → 3 次）。
   併完的模型用 clone() 重複利用（共用同一份形狀和材質），所以玩再久也不會一直吃記憶體。會動的零件（小熊的腳）不要丟進來。 */
function bake(g){if(g.isMesh)return g;g.updateMatrixWorld(true);var inv=new T.Matrix4().copy(g.matrixWorld).invert(),B={},keep=[],c=new T.Color();
  g.traverse(function(o){if(o===g)return;var rel=new T.Matrix4().multiplyMatrices(inv,o.matrixWorld);
    if(o.isSprite||(o.isMesh&&(o.material.map||o.material.transparent))){keep.push([o,rel]);return}
    if(!o.isMesh)return;
    var m=o.material,k=[m.type,m.flatShading?1:0,m.side,m.emissive?m.emissive.getHexString()+'_'+m.emissiveIntensity:''].join('|'),b=B[k]||(B[k]={m:m,p:[],n:[],c:[]});
    var ge=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();ge.applyMatrix4(rel);
    var P=ge.attributes.position.array,N=ge.attributes.normal.array;c.copy(m.color);
    for(var i=0;i<P.length;i+=3){b.p.push(P[i],P[i+1],P[i+2]);b.n.push(N[i],N[i+1],N[i+2]);b.c.push(c.r,c.g,c.b)}
    ge.dispose();o.geometry.dispose()});
  while(g.children.length)g.remove(g.children[0]);
  Object.keys(B).forEach(function(k){var b=B[k],ge=new T.BufferGeometry();ge.setAttribute('position',new T.Float32BufferAttribute(b.p,3));ge.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));ge.setAttribute('color',new T.Float32BufferAttribute(b.c,3));
    var m=b.m.clone();m.color.set('#ffffff');m.vertexColors=true;g.add(new T.Mesh(ge,m))});
  keep.forEach(function(a){var o=a[0];a[1].decompose(o.position,o.quaternion,o.scale);g.add(o)});return g}
function santaHat(y,s){var g=new T.Group(),c=mesh(new T.ConeGeometry(.22,.46,16),toon('#d63a2f'),.05,.2,0);c.rotation.z=-.35;g.add(c);
  var b=mesh(new T.TorusGeometry(.2,.06,8,20),toon('#ffffff'));b.rotation.x=Math.PI/2;g.add(b);g.add(mesh(new T.SphereGeometry(.07,10,8),toon('#ffffff'),.2,.4,0));g.position.y=y;g.scale.setScalar(s);return g}
function makeBear(){var g=new T.Group(),m=toon('#1c1c1f'),snout=toon('#c9a27a'),dark=toon('#1c1c1f'),white=toon('#ffffff');
  var body=mesh(new T.SphereGeometry(.32,24,18),m,0,.36,0,g);body.scale.set(1,1.05,.92);
  mesh(new T.SphereGeometry(.27,24,18),m,0,.84,.02,g);
  var feet=[];
  [-1,1].forEach(function(d){mesh(new T.SphereGeometry(.095,14,10),m,.19*d,1.03,0,g);feet.push(mesh(new T.SphereGeometry(.1,14,10),m,.2*d,.1,.12,g));mesh(new T.SphereGeometry(.085,12,10),m,.3*d,.42,.1,g)});
  var sn=mesh(new T.SphereGeometry(.11,16,12),snout,0,.78,.24,g);sn.scale.set(1.1,.85,.8);
  mesh(new T.SphereGeometry(.045,10,8),dark,0,.82,.33,g);
  [-1,1].forEach(function(d){mesh(new T.SphereGeometry(.04,10,8),white,.1*d,.91,.24,g);mesh(new T.SphereGeometry(.022,8,6),dark,.1*d,.915,.275,g)});
  var v=mesh(new T.TorusGeometry(.14,.035,8,20,Math.PI),toon('#fff3d6'),0,.52,.285,g);v.rotation.z=Math.PI;v.rotation.x=-.25;
  var sc=mesh(new T.TorusGeometry(.2,.055,10,24),toon('#2f8f58'),0,.63,.02,g);sc.rotation.x=Math.PI/2;
  var tl=mesh(new T.BoxGeometry(.1,.2,.05),toon('#2f8f58'),.12,.52,.2,g);tl.rotation.z=-.3;
  g.add(santaHat(1.04,1));g.userData.feet=feet;return g}
function makeXmasTree(){var g=new T.Group(),gm=[toon('#1f6b45',{flatShading:true}),toon('#2a7d50',{flatShading:true})],sm=toon('#eef4fa');
  mesh(new T.CylinderGeometry(.14,.18,.4,8),toon('#6b4128'),0,.2,0,g);
  [[1.0,1.0,.75],[.82,.9,1.25],[.62,.8,1.72],[.42,.7,2.13]].forEach(function(a,i){var r=a[0],h=a[1],y=a[2];mesh(new T.ConeGeometry(r,h,9),gm[i%2],0,y,0,g);mesh(new T.ConeGeometry(r*1.01,h*.22,9,1,true),sm,0,y+h*.06-h*.39,0,g);mesh(new T.ConeGeometry(r*.42,h*.3,9),sm,0,y+h*.36,0,g)});
  var cols=['#ffe9a3','#fff4cf','#ffe9a3','#ff6a5a','#ffe9a3','#6ab8ff'];
  for(var k=0;k<20;k++){var t=k/20,a=k*2.4,y=.45+t*1.9,r=1.0*(1-t*.72)+.03;mesh(new T.SphereGeometry(.065,8,6),new T.MeshBasicMaterial({color:cols[k%6]}),Math.cos(a)*r,y,Math.sin(a)*r,g)}
  mesh(new T.OctahedronGeometry(.22),new T.MeshBasicMaterial({color:'#ffd84a'}),0,2.62,0,g);return g}
function makeSnowman(){var g=new T.Group(),w=toon('#ffffff');mesh(new T.SphereGeometry(.36,16,12),w,0,.32,0,g);mesh(new T.SphereGeometry(.25,16,12),w,0,.8,0,g);
  var n=mesh(new T.ConeGeometry(.05,.22,8),toon('#f08a2c'),0,.8,.3,g);n.rotation.x=Math.PI/2;[-.08,.08].forEach(function(x){mesh(new T.SphereGeometry(.03,6,6),toon('#2b2320'),x,.88,.22,g)});
  var s=mesh(new T.TorusGeometry(.2,.05,8,16),toon('#d63a2f'),0,.6,0,g);s.rotation.x=Math.PI/2;g.add(santaHat(1.02,.9));return g}
/* 2026-11-12 大熊：分不出熊和障礙 → 障礙雪人改戴黑高帽、不戴聖誕帽 */
function makeBadSnowman(){var g=new T.Group(),w=toon('#ffffff');mesh(new T.SphereGeometry(.36,16,12),w,0,.32,0,g);mesh(new T.SphereGeometry(.25,16,12),w,0,.8,0,g);
  var n=mesh(new T.ConeGeometry(.05,.22,8),toon('#f08a2c'),0,.8,.3,g);n.rotation.x=Math.PI/2;[-.08,.08].forEach(function(x){mesh(new T.SphereGeometry(.035,6,6),toon('#2b2320'),x,.88,.22,g);var br=mesh(new T.BoxGeometry(.1,.025,.02),toon('#2b2320'),x,.95,.23,g);br.rotation.z=x>0?.45:-.45});
  var hb=toon('#26232b');mesh(new T.CylinderGeometry(.3,.3,.03,16),hb,0,1.02,0,g);mesh(new T.CylinderGeometry(.19,.19,.3,16),hb,0,1.18,0,g);mesh(new T.CylinderGeometry(.195,.195,.05,16),toon('#d63a2f'),0,1.07,0,g);return g}
function makeSanta(){var em=function(c,e,k){return toon(c,{emissive:new T.Color(e),emissiveIntensity:k==null?.55:k})};
  var red=em('#d0342c','#5a0f0b'),white=em('#f6f2ea','#6b6b6b',.5),gold=em('#e8b94a','#6a4a10'),fur=em('#9a6438','#3a2010'),furD=em('#6e4424','#2a160a'),antl=em('#e8d6b0','#5a4a30',.45),skin=em('#f2c6a0','#5a3a24',.45),sack=em('#3f7d4f','#123a20'),belt=em('#2a2320','#000000',0);
  var g=new T.Group(),M=function(geo,mat,x,y,z,p){return mesh(geo,mat,x,y,z,p||g)};
  M(new T.BoxGeometry(1.25,.4,.82),red,0,.48,0);var bk=M(new T.BoxGeometry(.26,.78,.82),red,-.6,.72,0);bk.rotation.z=.18;
  M(new T.BoxGeometry(1.3,.07,.88),gold,0,.7,0);M(new T.BoxGeometry(.3,.07,.88),gold,-.66,1.1,0).rotation.z=.18;
  [-.34,.34].forEach(function(z){M(new T.BoxGeometry(1.7,.06,.07),gold,.05,.12,z);var cu=M(new T.TorusGeometry(.2,.035,6,12,Math.PI*1.2),gold,.9,.3,z);cu.rotation.z=-1.2;[-.4,.35].forEach(function(x){M(new T.BoxGeometry(.05,.3,.05),gold,x,.27,z)})});
  var sk=M(new T.SphereGeometry(.34,10,8),sack,-.42,1.02,0);sk.scale.set(1,1.15,1);M(new T.CylinderGeometry(.08,.12,.16,8),gold,-.42,1.42,0);
  M(new T.CylinderGeometry(.24,.3,.5,12),red,.12,.95,0);M(new T.CylinderGeometry(.305,.305,.08,12),belt,.12,.82,0);M(new T.SphereGeometry(.17,12,10),skin,.14,1.33,0);
  var bd=M(new T.SphereGeometry(.16,10,8),white,.24,1.24,0);bd.scale.set(.7,1,1.05);
  var hat=M(new T.ConeGeometry(.16,.36,12),red,.1,1.6,0);hat.rotation.z=.5;M(new T.TorusGeometry(.16,.045,6,14),white,.13,1.46,0).rotation.x=Math.PI/2;M(new T.SphereGeometry(.06,8,6),white,-.06,1.72,0);
  var deer=function(x,z,lead){var d=new T.Group();d.position.set(x,.55,z);g.add(d);var b=M(new T.SphereGeometry(.32,10,8),fur,0,0,0,d);b.scale.set(1.25,.7,.62);
    var nk=M(new T.CylinderGeometry(.08,.11,.34,8),fur,.3,.2,0,d);nk.rotation.z=-.6;M(new T.SphereGeometry(.14,10,8),fur,.44,.38,0,d);
    M(new T.SphereGeometry(lead?.055:.035,8,6),lead?em('#ff3b30','#ff2010',1):belt,.65,.34,0,d);
    [-1,1].forEach(function(s){var a=M(new T.CylinderGeometry(.018,.022,.26,5),antl,.4,.58,s*.07,d);a.rotation.x=s*.35});
    [[.22,.12],[.22,-.12],[-.22,.12],[-.22,-.12]].forEach(function(p){M(new T.CylinderGeometry(.035,.03,.22,6),furD,p[0],-.22,p[1],d)})};
  deer(1.75,.3);deer(1.75,-.3);deer(2.85,0,true);return g}

/* ---------- 3D 場景 ---------- */
var cv=$('gl'),R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});RR=R;R.setClearColor(0,0);
var scene=new T.Scene();scene.fog=new T.Fog('#22357a',45,105);
var cam=new T.PerspectiveCamera(55,1,.1,200);
scene.add(new T.AmbientLight('#c8d4ff',.75));var sun=new T.DirectionalLight('#fff4dd',.85);sun.position.set(4,9,6);scene.add(sun);
var QD=Math.min(2,devicePixelRatio||1),qa=0,qn=0;
function fit(){var dp=QD,W=cv.clientWidth||innerWidth,H=cv.clientHeight||innerHeight;R.setPixelRatio(dp);R.setSize(W,H,false);cam.aspect=W/H;
  var portrait=cam.aspect<1;cam.fov=portrait?64:50;cam.position.set(0,portrait?7.2:6,portrait?8.6:7.5);cam.lookAt(0,0,-12);cam.updateProjectionMatrix();paintSky()}
addEventListener('resize',fit);var KD=null;function cleanup(){if(dead)return;dead=1;window.HW_ON=false;try{removeEventListener('resize',fit);if(KD)removeEventListener('keydown',KD)}catch(e){}try{R.dispose();R.forceContextLoss()}catch(e){}if(O.ov.isConnected&&O.gone&&O.gone())O.ov.remove()}
/* 雪地：大片白地＋中間淡藍跑道＋跑道兩邊的雪堆線（跟著速度往後捲） */
var ground=mesh(new T.PlaneGeometry(80,160),new T.MeshBasicMaterial({color:'#dbe4f5'}),0,0,-60,scene);   /* 2026-11-12 大熊：雪地只要暗一點點，不要變成跑道 */   /* 2026-11-12 大熊：雪地太亮看不到障礙 → 調暗 */ground.rotation.x=-Math.PI/2;
var LX=[-1.7,0,1.7];var lane=mesh(new T.PlaneGeometry(5.4,160),new T.MeshBasicMaterial({color:'#dbe4f5'}),0,.01,-60,scene);lane.rotation.x=-Math.PI/2;lane.visible=false;
/* 一整片雪地：散著小雪堆和閃閃的雪，沒有跑道線 */
var dashes=[],TRK=new T.MeshBasicMaterial({color:'#bccae6',transparent:true,opacity:.55});
var i;   /* 2026-11-12 大熊：不要任何線條，雪地就是一整片雪 */
var DRIFT=toon('#f4f8ff');
var DRIFTG=new T.SphereGeometry(.5,12,8,0,Math.PI*2,0,Math.PI/2);
for(i=0;i<34;i++){var dr=mesh(DRIFTG,DRIFT,(Math.random()<.5?-1:1)*(2.9+Math.random()*1.5),0,-Math.random()*104,scene);dr.scale.set(1+Math.random(),.35+Math.random()*.3,.8+Math.random()*.6);dashes.push(dr)}
var SPK=[];
/* 兩旁的聖誕樹、小樹、雪人：前後錯開，經過時看得到立體感 */
var scenery=[],proto={tree:bake(makeXmasTree()),small:null,snow:bake(makeBadSnowman())};
function sceneryAt(z){var r=Math.random(),k=r<.75?'tree':'small',o=k==='snow'?proto.snow.clone():proto.tree.clone();
  var side=Math.random()<.5?-1:1,s=k==='tree'?.9+Math.random()*.7:k==='small'?.45+Math.random()*.25:1.2;o.scale.setScalar(s);
  o.position.set(side*(4.2+Math.random()*7),0,z);o.rotation.y=Math.random()*6;scene.add(o);scenery.push(o)}
for(var zz=8;zz>-75;zz-=2.4)sceneryAt(zz-Math.random()*2);
var bear=makeBear();bear.rotation.y=Math.PI;bear.scale.setScalar(1.15);scene.add(bear);
var shadow=mesh(new T.CircleGeometry(.42,20),new T.MeshBasicMaterial({color:'#1e2a5a',transparent:true,opacity:.2}),0,.03,0,scene);shadow.rotation.x=-Math.PI/2;
var me=mesh(new T.RingGeometry(.5,.62,32),new T.MeshBasicMaterial({color:'#ffc93a',transparent:true,opacity:.95,depthWrite:false}),0,.04,0,scene);me.rotation.x=-Math.PI/2;
var santa=bake(makeSanta());santa.scale.setScalar(1.5);santa.visible=false;scene.add(santa);

/* 掉落物：真的 3D 物件＋上面一張分數小標籤 */
var glowTex=(function(){var c=document.createElement('canvas');c.width=c.height=64;var x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.3,'rgba(255,255,255,.5)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new T.CanvasTexture(c)})();
function glow(col,s){var sp=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:col,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));sp.scale.setScalar(s);return sp}
var glowM={};function glowS(col,s){var sp=new T.Sprite(glowM[col]||(glowM[col]=new T.SpriteMaterial({map:glowTex,color:col,transparent:true,depthWrite:false,blending:T.AdditiveBlending})));sp.scale.setScalar(s);return sp}
var labCache={};
function label(t,bg,fg){var k=t+bg;if(!labCache[k]){var c=document.createElement('canvas');c.width=160;c.height=56;var x=c.getContext('2d');x.font='900 30px sans-serif';var w=Math.min(150,x.measureText(t).width+28);
  x.fillStyle=bg;x.strokeStyle='#2b2320';x.lineWidth=4;x.beginPath();if(x.roundRect)x.roundRect((160-w)/2,6,w,44,22);else x.rect((160-w)/2,6,w,44);x.fill();x.stroke();x.fillStyle=fg||'#2b2320';x.textAlign='center';x.textBaseline='middle';x.fillText(t,80,29);labCache[k]=new T.SpriteMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false})}
  var sp=new T.Sprite(labCache[k]);sp.scale.set(.9,.315,1);return sp}
var GOLD=toon('#f2c14e',{emissive:new T.Color('#6a4a10'),emissiveIntensity:.6});
function giftBox(s,box,rib){var g=new T.Group();mesh(new T.BoxGeometry(.5,.5,.5),toon(box),0,0,0,g);mesh(new T.BoxGeometry(.52,.52,.1),toon(rib),0,0,0,g);mesh(new T.BoxGeometry(.1,.52,.52),toon(rib),0,0,0,g);
  var b1=mesh(new T.TorusGeometry(.1,.035,6,12),toon(rib),-.08,.3,0,g);b1.rotation.y=.6;var b2=mesh(new T.TorusGeometry(.1,.035,6,12),toon(rib),.08,.3,0,g);b2.rotation.y=-.6;g.scale.setScalar(s);return g}
function starMesh(col,s){var sh=new T.Shape();for(var k=0;k<10;k++){var r=k%2?.18:.42,a=-Math.PI/2+k*Math.PI/5;k?sh.lineTo(Math.cos(a)*r,-Math.sin(a)*r):sh.moveTo(Math.cos(a)*r,-Math.sin(a)*r)}
  var geo=new T.ExtrudeGeometry(sh,{depth:.12,bevelEnabled:true,bevelThickness:.04,bevelSize:.03,bevelSegments:2});geo.center();var m=new T.Mesh(geo,toon(col,{emissive:new T.Color(col),emissiveIntensity:.45}));m.scale.setScalar(s);return m}
var KIND={
  g1:{g:1,lab:['+1','#ffffff'],w:44,mk:function(){return giftBox(1,'#d63a2f','#f2c14e')}},
  g2:{g:2,lab:['+2','#ffd0dc'],w:14,mk:function(){var g=new T.Group(),m=toon('#a8703c');mesh(new T.SphereGeometry(.24,14,10),m,0,-.05,0,g);mesh(new T.SphereGeometry(.19,14,10),m,0,.3,0,g);[-1,1].forEach(function(d){mesh(new T.SphereGeometry(.08,10,8),m,.15*d,.45,0,g)});mesh(new T.SphereGeometry(.07,8,6),toon('#e8c9a0'),0,.27,.16,g);return g}},
  g5:{g:5,lab:['+5','#ffd447'],w:6,high:1,glow:'#ffe066',mk:function(){return starMesh('#ffd84a',1.1)}},
  c1:{b:1,lab:['紅利 1','#ffd447'],w:7,mk:function(){var m=mesh(new T.CylinderGeometry(.28,.28,.08,20),GOLD);m.rotation.x=Math.PI/2;return m}},
  c3:{b:3,lab:['紅利 3','#ffd447'],w:2.5,glow:'#ffe066',mk:function(){var m=mesh(new T.CylinderGeometry(.38,.38,.1,24),GOLD);m.rotation.x=Math.PI/2;return m}},
  c5:{b:5,lab:['紅利 5','#9be7ff'],w:1,high:1,glow:'#9be7ff',mk:function(){var m=mesh(new T.OctahedronGeometry(.34),toon('#9be7ff',{emissive:new T.Color('#2a8ab0'),emissiveIntensity:.6}));m.scale.y=1.3;return m}},
  bell:{dbl:1,lab:['雙倍','#ffd447'],w:6,glow:'#fff3b0',big:1,mk:function(){var g=new T.Group();mesh(new T.CylinderGeometry(.14,.32,.4,16,1,true),GOLD,0,0,0,g).material.side=T.DoubleSide;mesh(new T.SphereGeometry(.15,12,8),GOLD,0,.18,0,g);mesh(new T.SphereGeometry(.07,8,6),GOLD,0,-.22,0,g);mesh(new T.TorusGeometry(.12,.04,6,14),toon('#d63a2f'),0,.36,0,g);return g}},
  xg:{g:10,lab:['+10','#ffd447'],w:0,glow:'#ffe066',mk:function(){return giftBox(1.6,'#2f8f58','#ffd447')}},
  xb:{bomb:1,lab:['扣一半','#e5484d','#fff'],w:0,mk:function(){var g=new T.Group();mesh(new T.SphereGeometry(.32,16,12),toon('#26262e'),0,0,0,g);mesh(new T.CylinderGeometry(.05,.05,.18,6),toon('#8a7a60'),0,.38,0,g);g.add(glow('#ff7a3a',.5));g.children[2].position.y=.5;return g}},
  xs:{boost:1,lab:['加速×2','#9be7ff'],w:0,glow:'#9be7ff',mk:function(){return starMesh('#9be7ff',1.2)}}
};
var IK=Object.keys(KIND).filter(function(k){return KIND[k].w>0}),IW=IK.reduce(function(a,k){return a+KIND[k].w},0);
for(var q=0;q<60;q++){var sk=glow('#ffffff',.18);sk.position.set((Math.random()-.5)*14,.06,-Math.random()*100);scene.add(sk);SPK.push(sk)}

/* ---------- 遊戲 ---------- */
/* 2026-11-12 大熊：同一個人今天已經拿過 700 以上，之後每局都是困難模式（一開始就比較快、更早加速、障礙更多）。試玩頁用 ?hard=1 看 */
var HARD=!!O.hard;
var LV=[.6,2.0,3.3],JUMPS=O.jumps||3,G=-30,V0=11.2,DBLT=5,BOOST=5,SANTA_FIRST=O.santaEvery,SANTA_EVERY=O.santaEvery,SANTA_PASS=6;
var on=false,el=0,last=0,gift=0,bon=0,dbl=0,boost=0,things=[],ni=.6,no=2.6,coins=0,by=0,vy=0,jumps=0,run=0,fastShown=0,sn=SANTA_FIRST,sOn=false,sT=0,sDrop=0,sStars=0,sWarn=false,shake=0,AC=null;
function beep(f,d,ty,v){try{var s=O.sfx;if(!s)return;if(ty==='sawtooth')s('thunk');else if(f>=1500)s('sparkle');else if(f>=1300)s('chime');else if(f===990)s('toot');else if(f>=1100)s('sparkle');else if(ty==='triangle')s('tick');else s('pop')}catch(e){}}
var toastT=0;function toast(t,c){var e=$('toast');e.textContent=t;e.style.color=c||'#ffd447';e.style.opacity=1;toastT=1.4}
function ramp(){return HARD?Math.max(0,Math.min(1,(el-20)/30)):Math.max(0,Math.min(1,(el-40)/30))}
function speed(){return (HARD?15:14)*(1+ramp()*(HARD?.7:.6))*(boost>0?1.35:1)}
var SHG=new T.CircleGeometry(.32,16),SHM=new T.MeshBasicMaterial({color:'#1e2a5a',transparent:true,opacity:.22,depthWrite:false});
/* 2026-11-12 大熊：大家不知道什麼時候跳 → 天上的東西，地上對應位置畫金色圈圈；快到時畫面跳出「↑ 跳！」 */
var JRING=new T.RingGeometry(.45,.62,28),JRM=new T.MeshBasicMaterial({color:'#ffc93a',transparent:true,opacity:.85,depthWrite:false,side:T.DoubleSide});
function add(o,k,x,y,z){var I=KIND[k],obj=(I.pr||(I.pr=bake(I.mk()))).clone();if((o.fall?o.ty:y)>1){var jr=new T.Mesh(JRING,JRM);jr.rotation.x=-Math.PI/2;jr.position.set(x,.03,z);scene.add(jr);o.jr=jr}var g=new T.Group();g.add(obj);var sh=new T.Mesh(SHG,SHM);sh.rotation.x=-Math.PI/2;scene.add(sh);o.sh=sh;if(I.glow){var gl=glowS(I.glow,1.5);g.add(gl)}var lb=label(I.lab[0],I.lab[1],I.lab[2]);lb.position.y=-.55;g.add(lb);
  g.position.set(x,y,z);scene.add(g);o.g=g;o.spin=obj;o.k=k;things.push(o);return o}
function pick(){for(var n=0;n<6;n++){var r=Math.random()*IW,k=IK[0];for(var i=0;i<IK.length;i++){r-=KIND[IK[i]].w;if(r<=0){k=IK[i];break}}if(KIND[k].b&&coins>=6)continue;return k}return 'g1'}
function spawnItem(){var k=pick(),I=KIND[k];if(I.b)coins++;var ln=Math.floor(Math.random()*3);
  if(I.high){var nh=I.g?3:1;for(var h3=0;h3<nh;h3++)add({type:'item'},k,LX[ln],3.3,-80-h3*1.6);return}   /* 2026-11-12 大熊：天上的禮物一次三個 */                      /* 星星、鑽石：高處，要連跳 */
  if(k==='g1'&&Math.random()<.75){var n=4+Math.floor(Math.random()*3);for(var j=0;j<n;j++)add({type:'item'},k,LX[ln],.55,-80-j*1.6);return}   /* 地上一排禮物 */
  var yy0=Math.random()<.5?.55:2.1,n3=(yy0>1&&I.g)?3:1;for(var j3=0;j3<n3;j3++)add({type:'item'},k,LX[ln],yy0,-80-j3*1.6)}                    /* 其他：地上或半空 */
/* 障礙：一次佔 1～2 條跑道（不會三條全擋）。矮的（雪堆、石頭）可以跳；聖誕樹路障只能閃 */
var DANGER=new T.MeshBasicMaterial({color:'#ff3b2f',transparent:true,opacity:.8,depthWrite:false,side:T.DoubleSide}),DRING=new T.RingGeometry(.62,.86,32),DFILL=new T.CircleGeometry(.62,32),DFM=new T.MeshBasicMaterial({color:'#ff3b2f',transparent:true,opacity:.18,depthWrite:false});
function obsWrap(model,lx,h,txt,ly){var w=new T.Group();w.add(model);var r=new T.Mesh(DRING,DANGER);r.rotation.x=-Math.PI/2;r.position.y=.04;w.add(r);var f=new T.Mesh(DFILL,DFM);f.rotation.x=-Math.PI/2;f.position.y=.035;w.add(f);
  var lb=label(txt,'#ff3b2f','#ffffff');lb.scale.set(1.8,.63,1);lb.position.y=ly;w.add(lb);w.position.set(lx,0,-80);scene.add(w);things.push({type:'obs',g:w,h:h,tall:h>50?1:0})}
function spawnObs(){var lanes=[0,1,2].sort(function(){return Math.random()-.5}).slice(0,HARD?(el>12&&Math.random()<.5?2:1):(el>20&&Math.random()<.45?2:1));
  lanes.forEach(function(ln,i){var tall=el>8&&Math.random()<.35;if(tall){var t=proto.tree.clone();t.scale.setScalar(1.1);obsWrap(t,LX[ln],99,'⚠ 閃開',3.45)}else oneObs(LX[ln])})}
/* 2026-11-12 大熊：雪堆改成立體雪人（遊樂島那個）、石頭大一點 */
var RKP={};function rockP(big){var k=big?1:0;if(!RKP[k]){var w=new T.Group(),g=mesh(new T.DodecahedronGeometry(big?.82:.68,0),toon('#6b6f84',{flatShading:true}),0,0,0,w);g.scale.set(1,1.5,1);var cap=mesh(new T.DodecahedronGeometry(big?.55:.45,0),toon('#f4f7ff',{flatShading:true}),0,(big?.62:.5),0,g);cap.scale.y=.3;RKP[k]=bake(w)}return RKP[k]}
function oneObs(lx){var big=HARD?(el>25&&Math.random()<.3):(el>40&&Math.random()<.25),rock=Math.random()<.5,g,h;
  if(rock){g=rockP(big).clone();h=big?1.4:1.15}   /* 2026-11-12 大熊：石頭再大、跟雪人一樣高 */
  else{g=proto.snow.clone();g.scale.setScalar(big?1.25:1.05);g.rotation.y=0;h=big?1.4:1.15}
  obsWrap(g,lx,h,'⚠ 跳過',h+.55)}
/* 2026-11-12 大熊：3D 看不出有沒有真的碰到 → 碰到時：東西飛向右上角分數、原地閃一圈金光、跳出 +N、分數跳一下、畫面邊緣亮一下 */
var EMO={g1:'🎁',g2:'🧸',g5:'⭐',c1:'🪙',c3:'🪙',c5:'💎',bell:'🔔',xg:'🎁',xb:'💣',xs:'🌟'},bursts=[];
function scr(v){var p=v.clone().project(cam);return{x:(p.x+1)/2*cv.clientWidth,y:(1-p.y)/2*cv.clientHeight}}
function pop(t,c,pt){var e=document.createElement('div');e.className='j3pop';e.textContent=t;e.style.color=c;e.style.left=pt.x+'px';e.style.top=pt.y+'px';document.body.appendChild(e);setTimeout(function(){e.remove()},850)}
function flyTo(k,pt){var e=document.createElement('div');e.className='j3fly';e.textContent=EMO[k]||'🎁';e.style.left=pt.x+'px';e.style.top=pt.y+'px';document.body.appendChild(e);
  var r=$('hGB').getBoundingClientRect();requestAnimationFrame(function(){requestAnimationFrame(function(){e.style.transform='translate('+(r.left+r.width*.3-pt.x)+'px,'+(r.top+r.height/2-pt.y)+'px) translate(-50%,-50%) scale(.5)';e.style.opacity='.2'})});
  setTimeout(function(){e.remove();var c=$('hGB');c.classList.remove('j3bump');void c.offsetWidth;c.classList.add('j3bump')},560)}
function burst(pos,col){for(var i=0;i<10;i++){var sp=glow(col,.35);sp.position.copy(pos);var a=i/10*Math.PI*2;sp.userData.v=new T.Vector3(Math.cos(a)*3,Math.sin(a)*3+1.5,0);sp.userData.t=0;scene.add(sp);bursts.push(sp)}
  var big=glow(col,.4);big.position.copy(pos);big.userData.grow=1;big.userData.t=0;scene.add(big);bursts.push(big);
  var rg=$('ring');rg.classList.add('on');setTimeout(function(){rg.classList.remove('on')},60)}
function eat(o){o.done=1;var I=KIND[o.k],m=(dbl>0||boost>0)?2:1;var wp=o.g.getWorldPosition(new T.Vector3()),pt=scr(wp);
  burst(wp,I.bomb?'#ff5a3a':I.boost?'#9be7ff':'#ffe066');
  if(I.g)pop('+'+I.g*m,m>1||I.g>=5?'#ffd447':'#ffffff',pt);else if(I.b)pop('紅利 +'+I.b*m,'#ffd447',pt);
  if(I.g||I.b)flyTo(o.k,pt);
  if(I.bomb){var lost=gift-Math.floor(gift/2);gift=Math.floor(gift/2);shake=.35;toast(lost?'💣 禮物少一半！-'+lost:'💣 碰！','#ff6a5a');beep(110,.4,'sawtooth',.15);return}
  if(I.boost){boost=BOOST;toast('🌟 加速！禮物雙倍 5 秒','#9be7ff');beep(990,.2,'triangle');return}
  if(I.dbl){dbl=DBLT;toast('🔔 雙倍 5 秒！');beep(1320,.15);return}
  if(I.g){gift+=I.g*m;beep(I.g>=5?1175:880,.07)}
  if(I.b){var b0=bon;bon=Math.min(O.bcap,bon+I.b*m);if(bon>=O.bcap&&b0<O.bcap)toast('🪙 紅利滿 '+O.bcap+' 點了');beep(1568,.12)}}
var li=1,bx=0,tut=0,tutT=0;   /* tut：0 沒有、1 教左右滑、2 教往上滑、3 教完 */
function tutShow(step){tut=step;tutT=0;var b=$('tut'),h=$('tHand');b.classList.remove('ok');
  if(step===1){b.hidden=false;h.className='j3hand lr';h.textContent='👆';$('tTxt').textContent='← 左右滑，換跑道 →';$('tSub').textContent='試試看往左或往右滑'}
  else if(step===2){b.hidden=false;h.className='j3hand up';h.textContent='👆';$('tTxt').textContent='↑ 往上滑，跳起來';$('tSub').textContent='空中再滑一次可以連跳，最多 3 下'}
  else if(step===3){b.hidden=false;h.className='j3hand';h.textContent='⚠️';$('tTxt').textContent='紅圈＋⚠ 牌子＝障礙';$('tSub').textContent='「跳過」的往上滑跳過去，「閃開」的要換跑道';setTimeout(function(){if(tut===3)tutShow(4)},3200)}
  else{b.hidden=true}}
function tutDone(step){if(tut!==step)return;var b=$('tut');b.classList.add('ok');$('tSub').textContent='很好！';tut=step+.5;setTimeout(function(){tutShow(step+1);if(step===2)no=1.2},700)}
function move(d){if(!on)return;var n=Math.max(0,Math.min(2,li+d));if(n!==li){li=n;beep(520,.05,'triangle',.06)}tutDone(1)}
function jump(e){if(e&&e.preventDefault)e.preventDefault();if(!on)return;if(jumps<JUMPS){vy=jumps?V0*.8:V0;jumps++;beep(jumps>1?880:660,.06,'triangle',.08)}tutDone(2)}
var ptr=null;
cv.addEventListener('pointerdown',function(e){e.preventDefault();ptr={x:e.clientX,y:e.clientY,done:false}});
cv.addEventListener('pointermove',function(e){if(!ptr||ptr.done)return;var dx=e.clientX-ptr.x,dy=e.clientY-ptr.y;
  if(Math.abs(dx)>28&&Math.abs(dx)>Math.abs(dy)){move(dx>0?1:-1);ptr.done=true}else if(dy<-28&&-dy>Math.abs(dx)){jump();ptr.done=true}});
cv.addEventListener('pointerup',function(e){if(!ptr)return;if(!ptr.done){var W=cv.clientWidth,x=e.clientX;if(x<W*.3)move(-1);else if(x>W*.7)move(1);else jump()}ptr=null});
addEventListener('keydown',KD=function(e){if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();jump()}else if(e.code==='ArrowLeft'){e.preventDefault();move(-1)}else if(e.code==='ArrowRight'){e.preventDefault();move(1)}});

function santaTick(dt){
  if(!sOn){if(!sWarn&&el>=sn-2){sWarn=true;toast('🎅 聖誕老公公來了！')}if(el>=sn){sOn=true;sT=0;sDrop=.4;sStars=0;santa.visible=true}return}
  sT+=dt;var p=sT/SANTA_PASS;santa.position.set(14-28*p,8.5+Math.sin(sT*3)*.3,-28);santa.rotation.set(0,Math.PI,Math.sin(sT*2)*.06);
  if(p>.12&&p<.82){sDrop-=dt;if(sDrop<=0){sDrop=.45;var r=Math.random(),k=r<.5?'xg':r<.85?'xb':'xs';if(k==='xs'&&sStars++>=1)k='xg';
    add({type:'item',fall:1,tx:LX[Math.floor(Math.random()*3)],ty:Math.random()<.6?.55:2.1},k,santa.position.x,santa.position.y-.8,-30)}}
  if(p>=1){sOn=false;sWarn=false;sn+=SANTA_EVERY;santa.visible=false}}

function frame(now){if(!O.ov.isConnected||(O.gone&&O.gone())){cleanup();return}var raw=now-last;if(on&&raw>0&&raw<250){qa+=raw;qn++;if(qn>=90){var av=qa/qn;qa=qn=0;if(av>30&&QD>1){QD=QD>1.5?1.5:Math.max(1,QD-.25);R.setPixelRatio(QD);R.setSize(cv.clientWidth||innerWidth,cv.clientHeight||innerHeight,false)}}}
  var dt=Math.min(.05,(now-last)/1000||0);last=now;
  var sp=on?speed():3;
  if(on){el+=dt;
    var k=el>=40?1+Math.floor((el-40)/15):0;if(k>fastShown&&k<=3){fastShown=k;toast('⚡ 加速！')}
    vy+=G*dt;by+=vy*dt;if(by<=0){by=0;vy=0;jumps=0}
    if(dbl>0)dbl=Math.max(0,dbl-dt);if(boost>0)boost=Math.max(0,boost-dt);
    if(tut===1||tut===2){tutT+=dt;if(tutT>5)tutDone(tut)}
    if(tut&&tut<3)no=Math.max(no,1);   /* 教學中不出障礙 */
    santaTick(dt);
    ni-=dt;if(ni<=0){spawnItem();ni=(.75/Math.sqrt(1+ramp()*.6))*(.7+Math.random()*.6)}
    no-=dt;if(no<=0){spawnObs();no=(HARD?2.1-ramp()*.85:2.4-ramp()*.9)*(.8+Math.random()*.6)}
    for(var i=0;i<things.length;i++){var o=things[i];o.g.position.z+=sp*dt;
      if(o.fall){o.g.position.x+=(o.tx-o.g.position.x)*Math.min(1,dt*2.5);o.g.position.y=Math.max(o.ty,o.g.position.y-9*dt);if(o.g.position.y<=o.ty&&Math.abs(o.g.position.x-o.tx)<.05)o.fall=0}
      if(o.spin){o.spin.rotation.y+=dt*2.4}
      if(o.jr){if(o.fall)o.jr.position.x=o.tx;else o.jr.position.x=o.g.position.x;o.jr.position.z=o.g.position.z}
      if(o.sh){o.sh.position.set(o.g.position.x,.025,o.g.position.z);var hh=o.g.position.y;o.sh.scale.setScalar(Math.max(.35,1-hh*.15))}
      if(o.done)continue;var z=o.g.position.z;
      if(o.type==='obs'){if(z>-.45&&z<.45&&Math.abs(o.g.position.x-bx)<.8&&by<o.h*.85){on=false;shake=.4;beep(110,.45,'sawtooth',.18);toast('💥 撞到了！','#ff6a5a');setTimeout(finish,900)}}
      else if(z>-.8&&z<.8&&Math.abs(o.g.position.x-bx)<.85){var bt=by+.2,tp=by+1.25,yy=o.g.position.y;if(yy>bt-.55&&yy<tp+.55)eat(o)}}
    things=things.filter(function(o){if((o.done&&o.type==='item')||o.g.position.z>9){scene.remove(o.g);if(o.sh)scene.remove(o.sh);if(o.jr)scene.remove(o.jr);return false}return true});
    {var need=false;if(by<.4)for(var q2=0;q2<things.length;q2++){var o2=things[q2];if(o2.done||o2.type!=='item'||!o2.jr||KIND[o2.k].bomb)continue;var tt2=-o2.g.position.z/sp;if(Math.abs(o2.g.position.x-LX[li])<.3&&tt2>.08&&tt2<.6){need=true;break}}if($('jc').hidden===need)$('jc').hidden=!need}
    run+=dt*12*(1+ramp()*.6)}
  /* 小熊：跑步時上下彈、腳交替；空中往前傾 */
  bx+=(LX[li]-bx)*Math.min(1,dt*14);bear.position.x=bx;shadow.position.x=bx;bear.rotation.z=(bx-LX[li])*.25;
  bear.position.y=by+(by>0?0:Math.abs(Math.sin(run))*.12);bear.rotation.x=by>0?-.25:Math.sin(run)*.06;
  var f=bear.userData.feet;f[0].position.z=.12+Math.sin(run)*.12;f[1].position.z=.12-Math.sin(run)*.12;
  shadow.scale.setScalar(Math.max(.4,1-by*.15));
  /* 場景往後捲 */
  for(var j=0;j<scenery.length;j++){var s=scenery[j];s.position.z+=sp*dt;if(s.position.z>10){s.position.z-=85;s.position.x=(Math.random()<.5?-1:1)*(4.2+Math.random()*7)}}
  for(j=0;j<dashes.length;j++){var d=dashes[j];d.position.z+=sp*dt;if(d.position.z>8)d.position.z-=d.geometry.type==='PlaneGeometry'?112:104}
  for(j=0;j<SPK.length;j++){var k2=SPK[j];k2.position.z+=sp*dt;if(k2.position.z>8){k2.position.z-=100;k2.position.x=(Math.random()-.5)*14}k2.material.opacity=.35+.5*Math.abs(Math.sin(el*3+j))}
  for(var b=bursts.length-1;b>=0;b--){var q=bursts[b];q.userData.t+=dt;if(q.userData.grow){q.scale.setScalar(.4+q.userData.t*6);q.material.opacity=Math.max(0,1-q.userData.t*3.5)}else{q.position.addScaledVector(q.userData.v,dt);q.userData.v.y-=6*dt;q.material.opacity=Math.max(0,1-q.userData.t*2)}
    if(q.material.opacity<=0){scene.remove(q);q.material.dispose();bursts.splice(b,1)}}
  DANGER.opacity=.55+.4*Math.abs(Math.sin(last/1000*5));me.position.x=bx;
  if(toastT>0){toastT-=dt;if(toastT<=0)$('toast').style.opacity=0}
  var cy=cam.position.y;if(shake>0){shake-=dt;cam.position.x=(Math.random()-.5)*.25}else cam.position.x=0;
  R.render(scene,cam);
  if(on){$('hT').textContent=Math.floor(el);$('hG').textContent=gift;$('hB').textContent=bon;$('hD').hidden=!(dbl>0);if(dbl>0)$('hDt').textContent=dbl.toFixed(1);$('hBo').hidden=!(boost>0);if(boost>0)$('hBot').textContent=boost.toFixed(1)}
  requestAnimationFrame(frame)}

function start(){
  things.forEach(function(o){scene.remove(o.g);if(o.sh)scene.remove(o.sh);if(o.jr)scene.remove(o.jr)});$('jc').hidden=true;things=[];el=0;gift=0;bon=0;dbl=0;boost=0;ni=.6;no=2.6;coins=0;by=0;vy=0;jumps=0;fastShown=0;li=1;bx=0;sn=SANTA_FIRST;sOn=false;sWarn=false;santa.visible=false;
  if(HARD)setTimeout(function(){toast('🔥 困難模式：你已經破 700，更快、障礙更多！','#ff8a5c');toastT=3},300);
  on=true;$('hud').hidden=false;$('tip').hidden=false;if(O.tutorial)tutShow(1);else{tut=0;$('tut').hidden=true}}
function finish(){$('jc').hidden=true;$('tut').hidden=true;tut=0;$('tip').hidden=true;RES({sc:gift,b:bon,crashed:true,sec:el})}
function prewarm(){try{var i=0;Object.keys(KIND).forEach(function(k){add({type:'item'},k,LX[i%3],i%2?2.1:.55,-6-i*2);i++});
    obsWrap(rockP(0).clone(),LX[0],1,'⚠ 跳過',1.7);obsWrap(rockP(1).clone(),LX[1],1,'⚠ 跳過',1.7);obsWrap(proto.snow.clone(),LX[2],1,'⚠ 跳過',1.7);obsWrap(proto.tree.clone(),LX[1],99,'⚠ 閃開',3.45);
    things.forEach(function(o){if(o.type==='obs')o.g.position.z=-30});
    for(var b=0;b<2;b++){var sp=glow('#ffe066',.35);sp.position.set(0,1,-8);scene.add(sp);bursts.push(sp)}
    santa.visible=true;santa.position.set(0,6,-28);R.render(scene,cam);santa.visible=false;
    things.forEach(function(o){scene.remove(o.g);if(o.sh)scene.remove(o.sh);if(o.jr)scene.remove(o.jr)});things=[];
    bursts.forEach(function(q){scene.remove(q);q.material.dispose()});bursts=[]}catch(e){santa.visible=false}}
fit();prewarm();start();requestAnimationFrame(function(n){last=n;frame(n)});

    }catch(e){try{if(RR){RR.dispose();RR.forceContextLoss()}}catch(_){}REJ(e)}
  })};
})();
