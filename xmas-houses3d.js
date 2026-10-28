/* 走格子空地的 3D 聖誕小屋（2026-10-29 大熊定案第三版：郵局、雪怪用第一版，蛋糕屋、城堡、調色盤用第二版；邊角圓、顏色微暗）
   來源：Desktop/Otto2/預覽圖/聖誕小屋3D_預覽_v3.html，改造型請兩邊一起改。
   用法：XH3D.make(0～4) 回傳一個 THREE.Group（寬約 1.3、底部在 y=0、正面朝 +z） */
(function(){
/* 2026-10-29 照大熊的「天竺鼠紙箱聖誕小屋」圖，用 3D 自己做的五間（紙箱牆＋拱門洞＋瓦楞邊）
   ?one=0～4 只看一間（會慢慢轉）；不加參數＝五間排在雪地上，鏡頭角度跟走格子差不多 */
const gradMap=(()=>{const t=new THREE.DataTexture(new Uint8Array([100,170,228]),3,1,THREE.LuminanceFormat);t.minFilter=t.magFilter=THREE.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;return t})();
const toon=(c,o={})=>{const m=new THREE.MeshToonMaterial(Object.assign({color:c,gradientMap:gradMap},o));m.color.multiplyScalar(.92);return m}; /* 第三版整體微暗 */
function cv(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t}
/* 紙箱面：淡淡的直紋＋小斑點；瓦楞邊：一條條波浪 */
const CARD=cv(256,256,(x,w,h)=>{x.fillStyle='#dcb684';x.fillRect(0,0,w,h);for(let i=0;i<w;i+=7){x.fillStyle=`rgba(150,100,55,${.06+Math.random()*.06})`;x.fillRect(i,0,2,h)}for(let k=0;k<500;k++){x.fillStyle=`rgba(120,80,40,${Math.random()*.12})`;x.fillRect(Math.random()*w,Math.random()*h,2,2)}});
const EDGE=cv(64,64,(x,w,h)=>{x.fillStyle='#c4925a';x.fillRect(0,0,w,h);x.strokeStyle='#8a6038';x.lineWidth=3;for(let i=-8;i<w+8;i+=8){x.beginPath();x.arc(i+4,h/2,4,Math.PI,0);x.stroke()}x.fillStyle='#a87a48';x.fillRect(0,0,w,6);x.fillRect(0,h-6,w,6)});
EDGE.repeat.set(10,1);
/* 上了顏色的紙板用淡紋路，不然底色會被紙箱黃吃掉變橘 */
const PAINT=cv(256,256,(x,w,h)=>{x.fillStyle='#ffffff';x.fillRect(0,0,w,h);for(let i=0;i<w;i+=7){x.fillStyle=`rgba(120,100,80,${.04+Math.random()*.04})`;x.fillRect(i,0,2,h)}});
const cardM=c=>c?toon(c,{map:PAINT}):toon('#ffffff',{map:CARD}),edgeM=toon('#ffffff',{map:EDGE}),darkM=toon('#4b3322'),floorM=toon('#b98552');
const stripe=(a,b,n=8,ang=0)=>cv(256,256,(x,w,h)=>{x.fillStyle=a;x.fillRect(0,0,w,h);x.save();x.translate(w/2,h/2);x.rotate(ang);x.fillStyle=b;for(let i=-w;i<w;i+=w/n*2)x.fillRect(i,-h,w/n,h*2);x.restore()});
function M(g,m,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;return o}
/* 拱形隧道（外拱減內拱、往後擠出），開口朝 +z，後面封一塊深色 */
function archTunnel(w,h,t,len,m){const s=arch(w,h),hole=new THREE.Path();const iw=w-t*2,ih=h-t;hole.moveTo(-iw/2,0);hole.lineTo(iw/2,0);hole.lineTo(iw/2,ih-iw/2);hole.absarc(0,ih-iw/2,iw/2,0,Math.PI,false);hole.lineTo(-iw/2,0);s.holes.push(hole);
  const g=new THREE.Group(),o=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:len,bevelEnabled:true,bevelThickness:.022,bevelSize:.02,bevelSegments:4,curveSegments:24}),[m,edgeM]);o.position.z=-len;o.castShadow=true;g.add(o);
  const bk=new THREE.Mesh(new THREE.ShapeGeometry(arch(iw,ih),16),darkM);bk.position.z=-len*.8;g.add(bk);g.add(M(new THREE.BoxGeometry(iw*.95,.01,len*.8),floorM,0,.006,-len*.4));return g}
/* 拱門形狀 */
function arch(w,h){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(-w/2,h-w/2);s.absarc(0,h-w/2,w/2,Math.PI,0,true);s.lineTo(w/2,0);s.lineTo(-w/2,0);return s}
/* 一面有拱門洞的紙箱牆：正面材質、瓦楞側邊；洞後面放深色＋淺色地板，看起來是通進去的 */
function doorWall(W,H,doors,face,T=.08,shape){
  const s=shape||(()=>{const r=new THREE.Shape();r.moveTo(-W/2,0);r.lineTo(W/2,0);r.lineTo(W/2,H);r.lineTo(-W/2,H);r.lineTo(-W/2,0);return r})();
  doors.forEach(([x,w,h])=>{const p=new THREE.Path();p.moveTo(x-w/2,.001);p.lineTo(x+w/2,.001);p.lineTo(x+w/2,h-w/2);p.absarc(x,h-w/2,w/2,0,Math.PI,false);p.lineTo(x-w/2,.001);s.holes.push(p)});
  const geo=new THREE.ExtrudeGeometry(s,{depth:T,bevelEnabled:true,bevelThickness:.025,bevelSize:.022,bevelSegments:4,curveSegments:20});
  const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*.9,uv.getY(i)*.9);
  const g=new THREE.Group(),m=new THREE.Mesh(geo,[face,edgeM]);m.castShadow=m.receiveShadow=true;g.add(m);
  doors.forEach(([x,w,h])=>{const tun=new THREE.Mesh(new THREE.ExtrudeGeometry(arch(w*.98,h*.98),{depth:.5,bevelEnabled:false,curveSegments:16}),[darkM,darkM]);tun.position.set(x,0,-.5+T*.2);g.add(tun);
    const fl=M(new THREE.BoxGeometry(w*.9,.01,.5),floorM,x,.006,-.22+T);g.add(fl)});
  return g}
/* 第三版：方塊都改成圓角（大熊要「柔軟一點、可愛一點」） */
const _rb={};function rbox(w,h,d){const k=[w,h,d].map(v=>v.toFixed(3)).join();if(_rb[k])return _rb[k];const r=Math.min(w,h,d)*.22,s=new THREE.Shape(),W=w/2-r,H=h/2-r;
  s.moveTo(-W,-H);s.lineTo(W,-H);s.lineTo(W,H);s.lineTo(-W,H);s.lineTo(-W,-H);
  const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(.001,d-r*2),bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:3,curveSegments:6});g.translate(0,0,-(d-r*2)/2);return _rb[k]=g}
function box(w,h,d,m,x,y,z){return M(rbox(w,h,d),m,x,y+h/2,z)}
function ball(r,c,x,y,z,sx=1,sy=1,sz=1){const o=M(new THREE.SphereGeometry(r,14,10),toon(c),x,y,z);o.scale.set(sx,sy,sz);return o}
function star(r,c,pts=5){const s=new THREE.Shape();for(let i=0;i<pts*2;i++){const a=i/(pts*2)*Math.PI*2+Math.PI/2,rr=i%2?r*.45:r;i?s.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):s.moveTo(Math.cos(a)*rr,Math.sin(a)*rr)}
  return new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:.03,bevelEnabled:true,bevelThickness:.01,bevelSize:.008,bevelSegments:1}),toon(c))}
function flake(r){const g=new THREE.Group(),m=toon('#ffffff');for(let k=0;k<3;k++){const b=M(new THREE.BoxGeometry(r*2,r*.16,.025),m);b.rotation.z=k*Math.PI/3;g.add(b);
  [-1,1].forEach(sg=>{const t=M(new THREE.BoxGeometry(r*.5,r*.12,.025),m,sg*r*.6,0,0);t.rotation.z=.7*sg;const p=new THREE.Group();p.add(t);p.rotation.z=k*Math.PI/3;g.add(p)})}return g}
/* 天竺鼠（門口探頭用，跟遊戲裡同樣簡單的造型） */
function gp(c1,c2){const g=new THREE.Group();g.add(ball(.16,c1,0,.13,0,1.25,.9,1));g.add(ball(.09,c2,.1,.16,.08,1,1,1));g.add(ball(.032,'#2b2320',.09,.19,.16));g.add(ball(.032,'#2b2320',-.09,.19,.16));
  g.add(ball(.04,'#e9a7a0',.13,.25,.04,1,.7,.5));g.add(ball(.04,'#e9a7a0',-.13,.25,.04,1,.7,.5));g.add(ball(.02,'#d77d78',0,.14,.19));return g}

/* ===== 第二版（2026-10-29）：照大熊的圖補細節，不放天竺鼠（他的圖是空屋） ===== */
const LEAF=(w,h)=>{const s=new THREE.Shape();s.moveTo(0,0);s.quadraticCurveTo(w,h*.35,0,h);s.quadraticCurveTo(-w,h*.35,0,0);return new THREE.ShapeGeometry(s,6)};
/* 拱門外框（只有一圈），正面朝 +z */
function archRing(w,h,t,dep,m){const s=arch(w+t*2,h+t),p=new THREE.Path(),iw=w,ih=h;p.moveTo(-iw/2,0);p.lineTo(iw/2,0);p.lineTo(iw/2,ih-iw/2);p.absarc(0,ih-iw/2,iw/2,0,Math.PI,false);p.lineTo(-iw/2,0);s.holes.push(p);
  const o=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:dep,bevelEnabled:true,bevelThickness:.014,bevelSize:.012,bevelSegments:3,curveSegments:24}),m);o.castShadow=true;return o}
/* 畫在弧面上的門：深色拱＋白框，稍微凸出表面 */
function paintedDoor(w,h,trim){const g=new THREE.Group();g.add(M(new THREE.ShapeGeometry(arch(w,h),20),darkM,0,0,.012));if(trim)g.add(archRing(w,h,.035,.03,toon(trim)));
  const fl=M(new THREE.BoxGeometry(w*.92,.012,.12),floorM,0,.006,.05);g.add(fl);return g}
function holly(sc=1){const g=new THREE.Group(),lm=toon('#2f7a46'),lm2=toon('#3f9258');[[-.5,0],[.5,.1],[0,.6],[2.6,0],[3.6,.1]].forEach(([a,t],k)=>{const l=new THREE.Mesh(LEAF(.045,.16),k%2?lm:lm2);l.rotation.z=a;l.position.z=t*.01;g.add(l)});
  [[0,.02],[.035,-.015],[-.035,-.015]].forEach(([x,y])=>g.add(ball(.026,'#d3231b',x,y,.03)));g.scale.setScalar(sc);return g}
function candyCane(h,r){const g=new THREE.Group(),t=stripe('#ffffff','#d6342c',5,.6);t.repeat.set(1,4);const m=toon('#fff',{map:t});
  g.add(M(new THREE.CylinderGeometry(r,r,h,12),m,0,h/2,0));g.add(M(new THREE.TorusGeometry(h*.14,r,8,16,Math.PI),m,-h*.14,h,0));return g}
function peppermint(r){const t=cv(128,128,(x,w)=>{x.fillStyle='#fff';x.fillRect(0,0,w,w);x.fillStyle='#d6342c';for(let k=0;k<8;k+=2){x.beginPath();x.moveTo(64,64);x.arc(64,64,64,k/8*6.283,(k+1)/8*6.283);x.fill()}});
  const o=M(new THREE.CylinderGeometry(r,r,r*.35,20),[toon('#fff',{map:t}),toon('#fff',{map:t}),toon('#fff',{map:t})]);o.rotation.x=Math.PI/2;return o}
function ginger(sc=1){const g=new THREE.Group(),c='#b5662e';g.add(ball(.07,c,0,.25,0,1,1,.32));g.add(ball(.085,c,0,.1,0,1,1.15,.32));
  [-1,1].forEach(s=>{const a=ball(.035,c,s*.1,.15,0,1.6,.75,.32);a.rotation.z=s*.4;g.add(a);g.add(ball(.038,c,s*.05,-.01,0,.8,1.6,.32))});
  [.026,-.026].forEach(x=>g.add(ball(.011,'#2b2320',x,.27,.024)));g.add(M(new THREE.TorusGeometry(.025,.006,4,10,Math.PI),toon('#fff'),0,.24,.024).rotateZ(Math.PI));
  [.13,.08].forEach(y=>g.add(ball(.012,'#ffffff',0,y,.028)));g.add(M(new THREE.TorusGeometry(.07,.006,4,16,Math.PI*.8),toon('#fff'),0,.25,.022).rotateZ(.3));
  g.scale.setScalar(sc);return g}
function crystal(r,h,c){const g=new THREE.Group(),m=toon(c);g.add(M(new THREE.CylinderGeometry(r,r*.95,h*.62,6),m,0,h*.31,0));g.add(M(new THREE.ConeGeometry(r,h*.38,6),m,0,h*.62+h*.19,0));
  g.add(M(new THREE.CylinderGeometry(r*.25,r*.25,h*.5,4),toon('#ffffff',{transparent:true,opacity:.55}),r*.45,h*.38,r*.5));return g}

/* ---------- 01 禮物精靈的郵局 ---------- */
function postOffice(){const g=new THREE.Group(),W=1.2,H=.62,D=.85;
  const wt=stripe('#f5e6cc','#e0675a',16,.75);wt.repeat.set(.8,.8);const wrap=toon('#ffffff',{map:wt});
  g.add(doorWall(W,H,[[.12,.36,.42]],wrap).translateZ(D/2-.08));
  g.add(box(W,H,D-.1,wrap,0,0,-.05));
  /* 紅白斜紋包裝帶 */
  [[-.48,1],[.5,-1]].forEach(([x,s])=>{const b=box(.08,H+.02,D+.02,toon('#d63a2f'),x,0,0);g.add(b)});
  g.add(box(W+.02,.08,D+.02,toon('#d63a2f'),0,H*.7,0));
  /* 屋頂上的紙箱信箱 */
  g.add(box(.42,.2,.32,cardM(),.05,H,-.05));g.add(box(.24,.025,.02,darkM,.05,H+.13,.12));
  /* 大蝴蝶結 */
  const bow=new THREE.Group();bow.position.set(.1,H*.7+.02,D/2+.02);
  [-1,1].forEach(s=>{const l=ball(.11,'#e04236',s*.12,0,0,1.2,.75,.45);l.rotation.z=s*.35;bow.add(l)});bow.add(ball(.055,'#b52b22',0,0,.02));
  [-1,1].forEach(s=>{const t=box(.05,.16,.02,toon('#d63a2f'),s*.05,-.2,0);t.rotation.z=s*.25;bow.add(t)});g.add(bow);
  /* 冬青葉＋紅果 */
  [-.12,.32].forEach(x=>{g.add(ball(.06,'#2f7a46',x,H*.7+.03,D/2+.03,1.4,.6,.4));g.add(ball(.03,'#c8241c',x+.05,H*.7+.05,D/2+.05))});
  /* 郵票 */
  const st=box(.16,.2,.01,toon('#fffaf0'),-.32,.2,D/2+.005);g.add(st);g.add(box(.11,.14,.012,toon('#3e8a57'),-.32,.23,D/2+.008));
  /* 左邊紅色隧道 */
  const tg=archTunnel(.42,.4,.06,.36,cardM('#d23e33'));tg.position.set(-.66,0,D/2+.04);g.add(tg);
  /* 雪 */
  for(let k=0;k<9;k++)g.add(ball(.05+Math.random()*.03,'#ffffff',-.55+k*.13,H+.01,D/2-.05-Math.random()*.6,1.3,.45,1.1));
  return g}

/* ---------- 02 薑餅烘焙師的蛋糕屋 ---------- */
function bakery(){const g=new THREE.Group(),gb=cardM('#c8874d');
  const cyl=(r,h,y)=>M(new THREE.CylinderGeometry(r,r,h,48),[gb,toon('#f7ead6'),toon('#f7ead6')],0,y+h/2,0);
  g.add(cyl(.64,.5,0));g.add(cyl(.42,.3,.5));
  /* 一圈波浪奶油（上緣厚邊＋往下垂的圓弧） */
  [[.64,.5,20],[.42,.8,14]].forEach(([r,y,n])=>{g.add(M(new THREE.CylinderGeometry(r+.02,r+.02,.05,48),toon('#fbf1df'),0,y-.01,0));
    for(let k=0;k<n;k++){const a=(k+.5)/n*Math.PI*2;g.add(ball(.07*r/.64+.02,'#fbf1df',Math.sin(a)*(r+.005),y-.06,Math.cos(a)*(r+.005),1.1,.9,.45).rotateY(a))}});
  /* 前門：深色拱＋奶油色門框 */
  const dr=paintedDoor(.42,.42,'#fbf1df');dr.position.set(0,0,.632);g.add(dr);
  /* 上層小窗戶 */
  [-.6,0,.6].forEach(a=>{const w=paintedDoor(.1,.14,'#fbf1df');w.position.set(Math.sin(a)*.418,.58,Math.cos(a)*.418);w.rotation.y=a;g.add(w)});
  /* 糖粒＋小星星 */
  const cols=['#d6342c','#3e8a57','#f2c14e','#ffffff','#5bb6e0'];
  for(let k=0;k<46;k++){const a=(Math.random()-.5)*2.6,y=.06+Math.random()*.36;if(Math.abs(a)<.42&&y<.48)continue;g.add(ball(.017,cols[k%5],Math.sin(a)*.645,y,Math.cos(a)*.645))}
  [[.75,.32],[-.8,.2],[.95,.12],[.15,.68]].forEach(([a,y])=>{const s=star(.035,'#f2c14e');s.position.set(Math.sin(a)*.65,y,Math.cos(a)*.65);s.rotation.y=a;g.add(s)});
  /* 拐杖糖、薄荷糖、薑餅人 */
  [[-.66,.28,.75,1],[.62,.34,.65,-1],[.3,.4,.5,-1]].forEach(([x,z,h,s])=>{const c=candyCane(h,.035);c.position.set(x,0,z);c.rotation.y=s>0?0:Math.PI;g.add(c)});
  [[-.22,.88,.22,.065],[.26,.87,.18,.055],[-.05,.88,-.26,.05]].forEach(([x,y,z,r])=>{const p=peppermint(r);p.position.set(x,y,z);p.rotation.y=Math.atan2(x,z);g.add(p)});
  const gm=ginger(1);gm.position.set(.16,.82,.05);g.add(gm);
  const gm2=ginger(1.25);gm2.position.set(-.42,.02,.5);gm2.rotation.y=-.6;g.add(gm2);
  /* 右邊黑板招牌 */
  const bd=new THREE.Group();bd.add(box(.3,.32,.04,toon('#a87447'),0,0,0));bd.add(box(.24,.26,.045,toon('#2b2622'),0,.03,0));const gs=ginger(.6);gs.position.set(0,.06,.03);bd.add(gs);
  bd.position.set(.5,.48,.38);bd.rotation.y=.9;g.add(bd);
  return g}

/* ---------- 03 粉雪女王的水晶城堡 ---------- */
function castle(){const g=new THREE.Group(),pink=cardM('#f4bfd2'),lil=cardM('#d9c7f2');
  const s=new THREE.Shape();s.moveTo(-.7,0);s.lineTo(.7,0);s.lineTo(.7,.42);s.lineTo(.48,.42);s.lineTo(.48,.56);s.lineTo(.28,.56);s.lineTo(.28,.66);s.quadraticCurveTo(.1,.72,0,.9);s.quadraticCurveTo(-.1,.72,-.28,.66);s.lineTo(-.28,.56);s.lineTo(-.48,.56);s.lineTo(-.48,.42);s.lineTo(-.7,.42);s.lineTo(-.7,0);
  g.add(doorWall(0,0,[[0,.36,.48],[-.5,.18,.26],[.5,.18,.26]],pink,.08,s).translateZ(.3));
  g.add(box(1.4,.42,.6,lil,0,0,-.05));g.add(box(.96,.56,.5,pink,0,0,-.1));
  /* 層層拱門框：外淡紫、內粉 */
  [[0,.36,.48],[-.5,.18,.26],[.5,.18,.26]].forEach(([x,w,h],k)=>{const r1=archRing(w,h,.04,.03,toon('#c9b3ef'));r1.position.set(x,0,.39);g.add(r1);const r2=archRing(w+.08,h+.04,.035,.03,toon('#fbd9e6'));r2.position.set(x,0,.385);g.add(r2)});
  /* 水晶群 */
  [[0,.55,-.12,.13,.75,'#ef8fb8'],[-.2,.5,-.2,.1,.55,'#a891e6'],[.2,.5,-.2,.1,.6,'#b9a6f5'],[-.38,.42,-.1,.08,.42,'#f3a6c6'],[.38,.42,-.1,.08,.46,'#a995ea'],[.1,.55,-.32,.08,.62,'#cdbff7'],[-.1,.55,-.3,.08,.5,'#f7b5d1'],
    [-.62,.42,-.05,.06,.3,'#d9cbff'],[.62,.42,-.05,.06,.3,'#f9c9dc'],[.3,.56,-.02,.05,.24,'#ffffff'],[-.3,.56,-.02,.05,.22,'#ffffff']].forEach(([x,y,z,r,h,c])=>{const cr=crystal(r*1.15,h*1.05,c);cr.position.set(x,y+.12,z);cr.rotation.y=x*2;g.add(cr)});
  /* 兩側白色樓梯 */
  [-1,1].forEach(sg=>{for(let k=0;k<5;k++)g.add(box(.2,.07,.13,toon(k%2?'#f3eefb':'#e6dcf6'),sg*.86,0,.32-k*.11).translateY(k*.07))});
  /* 雪花＋珍珠 */
  [[-.28,.38,.4,.1],[.28,.38,.4,.1],[0,.64,.4,.07],[.62,.12,.42,.1],[-.62,.3,.41,.06]].forEach(([x,y,z,r])=>{const f=flake(r);f.position.set(x,y,z);g.add(f)});
  for(let k=0;k<16;k++)g.add(ball(.028,'#fffaf5',-.68+k*.09,.028,.42));
  [[-.7,.42],[-.48,.56],[.48,.56],[.7,.42]].forEach(([x,y])=>{for(let k=0;k<3;k++)g.add(ball(.022,'#fffaf5',x+(x<0?k:-k)*.07,y+.02,.39))});
  return g}

/* ---------- 04 薄荷雪怪的毛毛屋 ---------- */
function monster(){const g=new THREE.Group();
  const dome=M(new THREE.SphereGeometry(.62,32,18,0,Math.PI*2,0,Math.PI/2),toon('#9fd3b4'),0,0,0);dome.scale.set(1,1.05,.95);g.add(dome);
  /* 一片片葉子毛 */
  for(let r=0;r<6;r++){const ph=.12+r*.24,n=Math.round(22*Math.cos(ph)+4);for(let k=0;k<n;k++){const th=k/n*Math.PI*2+r*.3;if(Math.abs(th-Math.PI*2)%(Math.PI*2)<.0)continue;
    const x=Math.cos(ph)*Math.sin(th)*.63,y=Math.sin(ph)*.66,z=Math.cos(ph)*Math.cos(th)*.6;if(z>.3&&y<.42&&Math.abs(x)<.26)continue;
    const l=ball(.085,r%2?'#86c79e':'#a9dcbc',x,y,z,1,.55,.35);l.lookAt(x*2,y*2+.4,z*2);g.add(l)}}
  /* 嘴巴門＋牙齒 */
  const mouth=new THREE.Mesh(new THREE.ExtrudeGeometry(arch(.4,.42),{depth:.4,bevelEnabled:false,curveSegments:16}),darkM);mouth.position.set(0,0,.25);g.add(mouth);
  g.add(M(new THREE.BoxGeometry(.36,.01,.35),floorM,0,.006,.45));
  [-.042,.042].forEach(x=>{const t=box(.08,.03,.12,toon("#fffdf6"),x,.395,.56);t.rotation.x=.75;g.add(t)}); /* 門牙從綠毛和咖啡色交界處長出來、貼著嘴巴頂面往前（大熊畫的位置） */ /* 一排尖牙改成兩顆門牙 */
  /* 大眼睛 */
  [-.17,.17].forEach(x=>{g.add(ball(.1,'#ffffff',x,.6,.36,1,1,.5));g.add(ball(.05,'#1f1a17',x,.6,.41,1,1,.5));g.add(ball(.016,'#ffffff',x+.02,.62,.44))});
  /* 角 */
  [-1,1].forEach(s=>{const h=M(new THREE.ConeGeometry(.06,.17,12),cardM('#b98852'),s*.34,.72,0);h.rotation.z=-s*.5;g.add(h)});
  const top=M(new THREE.ConeGeometry(.045,.13,12),cardM('#b98852'),0,.71,-.05);g.add(top);
  /* 腳掌 */
  [-1,1].forEach(s=>{const pw=new THREE.Group();pw.add(ball(.16,'#d8b689',0,.06,0,1,.5,1.1));pw.add(ball(.06,'#5f9c74',0,.12,.06,1,.4,1));[-.07,0,.07].forEach(x=>pw.add(ball(.032,'#5f9c74',x,.12,.15,1,.4,1)));pw.position.set(s*.5,0,.48);pw.rotation.y=-s*.3;g.add(pw)});
  return g}

/* ---------- 05 彩繪精靈的調色盤隧道 ---------- */
function palette(){const g=new THREE.Group(),L=1.05,AW=.7,AH=.6;
  /* 隧道身體：拱形往 x 方向擠出，正面是直的牆，開兩個小門 */
  const body=new THREE.Mesh(new THREE.ExtrudeGeometry(arch(AW,AH),{depth:L,bevelEnabled:true,bevelThickness:.03,bevelSize:.028,bevelSegments:4,curveSegments:24}),[cardM('#f3e0bd'),edgeM]);
  body.rotation.y=Math.PI/2;body.position.set(-L/2,0,0);body.castShadow=true;g.add(body);
  [-.12,.26].forEach((x,k)=>{const d=paintedDoor(k?.22:.26,k?.26:.3,'#e7c48f');d.position.set(x,0,AW/2+.016);g.add(d)});
  /* 右端開口 */
  const end=paintedDoor(.42,.46,'#d9b07a');end.rotation.y=Math.PI/2;end.position.set(L/2+.017,0,0);g.add(end);
  /* 顏料：頂上一團一團、往下滴 */
  const cols=['#f2c14e','#e46a8a','#8b6fd1','#5bb6e0','#6cc07a','#f08a3c'];
  for(let k=0;k<11;k++){const x=-.4+k*.085,c=cols[k%6],a=.35+((k*37)%10)/10*1.1;
    const p=new THREE.Vector3(x,AH-AW/2+Math.sin(a)*AW/2,Math.cos(a)*AW/2);const b=ball(.075,c,p.x,p.y,p.z,1.2,.5,1.2);b.lookAt(x,p.y*3,p.z*3);g.add(b);
    if(k%2===0){const len=.12+((k*13)%5)*.04;g.add(M(new THREE.CylinderGeometry(.025,.025,len,8),toon(c),x,AH-AW/2-len/2+.02,AW/2+.018));g.add(ball(.034,c,x,AH-AW/2-len+.02,AW/2+.02))}}
  /* 左邊灰藍色帶 */
  const band=archRing(AW+.02,AH+.01,.05,.12,toon('#7f8fb0'));band.rotation.y=Math.PI/2;band.position.set(-.3,0,0);g.add(band);
  /* 左端：彩色筆刷毛 */
  const bt=cv(256,64,(x,w,h)=>{const bc=['#24527f','#3f86b8','#5bb6e0','#a9dceb','#f2d38a','#e8b46a'];for(let i=0;i<w;i+=8){x.fillStyle=bc[Math.floor(i/8)%6];x.fillRect(i,0,8,h)}x.fillStyle='rgba(0,0,0,.12)';for(let i=0;i<w;i+=4)x.fillRect(i,0,1,h)});
  [[.36,.62,0],[.3,.5,.3]].forEach(([r,len,off])=>{const c=M(new THREE.ConeGeometry(r,len,32,1,true),toon('#fff',{map:bt,side:THREE.DoubleSide}),-L/2-len/2+.04,AH-AW/2+.02,0);c.rotation.z=Math.PI/2;c.rotation.x=off;g.add(c)});
  g.add(M(new THREE.CylinderGeometry(.37,.37,.08,32),toon('#d7c36e'),-L/2,AH-AW/2+.02,0).rotateZ(Math.PI/2)); /* 筆頭金屬圈 */
  /* 右後方立著的調色盤 */
  const ps=new THREE.Shape();ps.moveTo(0,-.32);ps.bezierCurveTo(.42,-.34,.5,.1,.3,.3);ps.bezierCurveTo(.12,.45,-.32,.4,-.4,.1);ps.bezierCurveTo(-.46,-.12,-.3,-.3,0,-.32);
  const hole=new THREE.Path();hole.absarc(-.12,-.12,.07,0,Math.PI*2,true);ps.holes.push(hole);
  const pal=new THREE.Mesh(new THREE.ExtrudeGeometry(ps,{depth:.05,bevelEnabled:true,bevelThickness:.025,bevelSize:.022,bevelSegments:4,curveSegments:20}),[cardM('#ddb57c'),edgeM]);pal.castShadow=true;
  pal.position.set(.48,.62,-.28);pal.rotation.set(-.08,-.25,-.12);g.add(pal);
  cols.forEach((c,k)=>{const a=k/6*Math.PI*1.5-.2,f=new THREE.Group();for(let p=0;p<5;p++){const q=p/5*Math.PI*2;f.add(ball(.032,c,Math.cos(q)*.035,Math.sin(q)*.035,0,1,1,.45))}f.add(ball(.022,'#fff7e0',0,0,.012,1,1,.5));
    f.position.set(.06+Math.cos(a)*.24,.02+Math.sin(a)*.2,.07);pal.add(f)});
  return g}

const MAKERS=[postOffice,bakery,castle,monster,palette],NAMES=['禮物精靈的郵局','薑餅烘焙師的蛋糕屋','粉雪女王的水晶城堡','薄荷雪怪的毛毛屋','彩繪精靈的調色盤隧道'];

window.XH3D={make:k=>MAKERS[k](),names:NAMES};
})();
