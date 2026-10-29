/* 2026-10-29 作品小屋的 12 位聖誕 3D 藝術家（從 art.html 抽出來的同一份程式，給遊樂島走格子當角色用）
   art.html 自己那份沒動；改藝術家造型時兩邊要一起改。Artists3D.make(名字) 回傳 Group，userData {head, armR, body} */
(function(){'use strict';
/* THREE 可能比這個檔晚載入（遊樂島）→ 第一次 make 才建 */
function build(){const THREE=window.THREE;
const cvs=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
function rng(seed){seed=Math.abs(Math.floor(seed))%2147483647||1;return()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646}}
/* ================= materials: soft, rounded, painterly ================= */
const gradMap=(()=>{const t=new THREE.DataTexture(new Uint8Array([120,176,222,255]),4,1,THREE.LuminanceFormat);t.minFilter=t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;t.needsUpdate=true;return t})();
const MATS=new Map();
const toon=(c,extra)=>{if(!extra){if(MATS.has(c))return MATS.get(c);const m=new THREE.MeshLambertMaterial({color:c});MATS.set(c,m);return m}return new THREE.MeshLambertMaterial(Object.assign({color:c},extra))};
const SPH=new THREE.SphereGeometry(1,24,16),SPH_LO=new THREE.SphereGeometry(1,12,9);
function ball(c,r,x=0,y=0,z=0,sx=1,sy=1,sz=1,lo){const m=new THREE.Mesh(lo?SPH_LO:SPH,toon(c));m.position.set(x,y,z);m.scale.set(r*sx,r*sy,r*sz);m.castShadow=r>=.14;return m}
function cyl(c,r1,r2,h,x=0,y=0,z=0,seg=16){const g=new THREE.CylinderGeometry(r1,r2,h,seg);g.translate(0,h/2,0);const m=new THREE.Mesh(g,toon(c));m.position.set(x,y,z);m.castShadow=Math.max(r1,r2)>.06;return m}
// canvas patterns for clothes / hair
function texOf(w,h,draw,rx=1,ry=1){const c=cvs(w,h),x=c.getContext('2d');draw(x,w,h);
  const d=x.getImageData(0,0,w,h),p=d.data;for(let i=0;i<p.length;i+=4){const L=p[i]*.3+p[i+1]*.59+p[i+2]*.11;for(let k=0;k<3;k++)p[i+k]=p[i+k]+(L-p[i+k])*.3}x.putImageData(d,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);return t}
const FTEX={};
const ftex=(k,f)=>FTEX[k]||(FTEX[k]=f());
const dotsT=(bg,dot,rx,ry,big)=>texOf(128,128,(x,w,h)=>{x.fillStyle=bg;x.fillRect(0,0,w,h);x.fillStyle=dot;const r=rng(bg.length*7+dot.length);
  for(let i=0;i<(big?7:5);i++){const R=big?8+r()*16:6+r()*9;const cx=r()*w,cy=r()*h;[[0,0],[w,0],[-w,0],[0,h],[0,-h]].forEach(([a,b])=>{x.beginPath();x.arc(cx+a,cy+b,R,0,7);x.fill()})}},rx,ry);
const TX={
  kusamaHair:()=>dotsT('#f2c62e','#16161a',5,3,false),
  kusamaDress:()=>dotsT('#d8312b','#f6f1e7',3,1.6,false),
  kahloDress:()=>texOf(128,128,(x,w,h)=>{x.fillStyle='#2f8a3e';x.fillRect(0,0,w,h);const r=rng(5);for(let i=0;i<10;i++){const cx=r()*w,cy=r()*h;x.fillStyle='#fbf8f0';for(let p=0;p<5;p++){const a=p/5*6.28;x.beginPath();x.arc(cx+Math.cos(a)*4,cy+Math.sin(a)*4,3.4,0,7);x.fill()}x.fillStyle='#f2c230';x.beginPath();x.arc(cx,cy,2.2,0,7);x.fill()}},4,2),
  pinstripe:()=>texOf(64,64,(x,w,h)=>{x.fillStyle='#2a2628';x.fillRect(0,0,w,h);x.fillStyle='#6b6266';for(let i=0;i<4;i++)x.fillRect(i*16+7,0,2,h)},4,1),
  klimt:()=>texOf(256,256,(x,w,h)=>{x.fillStyle='#e2b83f';x.fillRect(0,0,w,h);const r=rng(11);
    for(let i=0;i<400;i++){x.fillStyle=['#f0cd5a','#cf9f2e','#ebd27a'][i%3];x.fillRect(r()*w,r()*h,3,3)}
    for(let i=0;i<34;i++){const cx=r()*w*.5,cy=r()*h;x.fillStyle=i%3?'#141414':'#f3ead6';x.fillRect(cx,cy,8+r()*6,16+r()*14)}
    for(let i=0;i<12;i++){const cx=w*.5+r()*w*.5,cy=r()*h,R=10+r()*8;['#f3ead6','#c7473b','#2f6f6a','#f3ead6'].forEach((c,j)=>{x.fillStyle=c;x.beginPath();x.arc(cx,cy,R*(1-j*.24),0,7);x.fill()})}
    x.strokeStyle='#b88a20';x.lineWidth=2;for(let i=0;i<10;i++){const cx=w*.5+r()*w*.5,cy=r()*h;x.beginPath();for(let t=0;t<14;t+=.3)x.lineTo(cx+Math.cos(t)*t*.8,cy+Math.sin(t)*t*.8);x.stroke()}},2,1),
  miro:()=>texOf(256,256,(x,w,h)=>{x.fillStyle='#f2cc2a';x.fillRect(0,0,w,h);const r=rng(21);
    const dot=(a,b,R,c)=>{x.fillStyle=c;x.beginPath();x.arc(a,b,R,0,7);x.fill()};
    dot(60,70,20,'#d8382c');dot(190,170,18,'#d8382c');x.fillStyle='#1f4fb0';x.beginPath();x.ellipse(170,60,12,22,.4,0,7);x.fill();x.beginPath();x.ellipse(70,200,10,18,-.3,0,7);x.fill();
    [['#2a8a3a',120,120],['#1f4fb0',220,230],['#2a8a3a',30,140]].forEach(([c,a,b])=>{x.fillStyle=c;x.beginPath();x.arc(a,b,18,.3,2.8);x.arc(a,b-8,15,2.6,.5,true);x.fill()});
    x.strokeStyle='#141414';x.lineWidth=2.5;x.lineCap='round';
    [[100,40,140,90],[30,110,80,150],[150,200,230,120],[200,30,240,80]].forEach(([a,b,c,d])=>{x.beginPath();x.moveTo(a,b);x.quadraticCurveTo((a+c)/2+20,(b+d)/2-20,c,d);x.stroke();dot(a,b,4,'#141414');dot(c,d,4,'#141414')});
    [[110,170],[40,40],[230,200]].forEach(([a,b])=>{for(let i=0;i<4;i++){const t=i*Math.PI/4;x.beginPath();x.moveTo(a-Math.cos(t)*11,b-Math.sin(t)*11);x.lineTo(a+Math.cos(t)*11,b+Math.sin(t)*11);x.stroke()}})},2,1),
  wave:()=>texOf(256,256,(x,w,h)=>{x.fillStyle='#f1e9d8';x.fillRect(0,0,w,h);
    for(let k=0;k<2;k++){const o=k*128;
      x.fillStyle='#22407a';x.beginPath();x.moveTo(o-10,h);x.bezierCurveTo(o-6,120,o+40,40,o+100,46);x.bezierCurveTo(o+124,50,o+128,74,o+108,82);x.bezierCurveTo(o+86,66,o+60,90,o+62,130);x.bezierCurveTo(o+64,180,o+100,220,o+130,h);x.fill();
      x.fillStyle='#6f98c8';x.beginPath();x.moveTo(o+6,h);x.bezierCurveTo(o+10,170,o+40,110,o+72,100);x.bezierCurveTo(o+54,130,o+52,190,o+86,h);x.fill();
      x.fillStyle='#fbf7ee';for(let i=0;i<10;i++){const t=i/9;x.beginPath();x.arc(o+60+t*60,48+Math.sin(t*3.1)*-8+t*20,5-t*1.5,0,7);x.fill()}
      x.strokeStyle='#fbf7ee';x.lineWidth=3;for(let i=0;i<4;i++){x.beginPath();x.arc(o+40,200+i*12,26,-2.4,-1.2);x.stroke()}}
    x.fillStyle='#fbf7ee';for(let i=0;i<50;i++){x.beginPath();x.arc((i*53)%w,60+(i*29)%190,1.5,0,7);x.fill()}},1.5,1),
};
const T=k=>ftex(k,TX[k]);
const tm=t=>new THREE.MeshLambertMaterial({map:t});
const mat=c=>typeof c==='string'?toon(c):tm(c);
function flathe(prof,m,seg=24){const g=new THREE.LatheGeometry(prof.map(([r,y])=>new THREE.Vector2(r,y)),seg);const o=new THREE.Mesh(g,m);o.castShadow=true;return o}
function fbox(c,w,h,d,x=0,y=0,z=0){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),toon(c));m.position.set(x,y,z);return m}
function brow(head,c,s,tilt=0,y=.13,w=.09,th=.022){[-1,1].forEach(k=>{const b=new THREE.Mesh(SPH_LO,toon(c));b.scale.set(w*.6,th,th*.8);
  b.rotation.z=-k*tilt;b.position.set(.1*k*s,y,.262);head.add(b)})}

// the shared vinyl body: legs+shoes, torso or long robe, two arms, big head with bead eyes and pink cheeks
function figBase(o){
  const g=new THREE.Group(),body=new THREE.Group();g.add(body);const skin=o.skin||'#f6d5b8';
  const long=!!o.robe;
  // legs / feet
  [-1,1].forEach(s=>{
    if(!long){const L=cyl('#fff',.078,.085,.3,.095*s,.05,0,12);L.material=mat(o.legs||'#2c4f9e');body.add(L)}
    else if(o.feet==='bare'||o.feet==='sandal'||o.feet==='geta')body.add(cyl(skin,.06,.065,.12,.09*s,.04,.01,10));
    if(o.feet==='sandal'||o.feet==='geta'){body.add(fbox(o.sole||'#5b3a26',.13,o.feet==='geta'?.05:.03,.22,.09*s,o.feet==='geta'?.025:.015,.03));body.add(ball(skin,.06,.09*s,.06,.06,1,.5,1.3,true));
      const st=new THREE.Mesh(new THREE.TorusGeometry(.055,.012,4,10,Math.PI),toon(o.strap||'#6b4529'));st.position.set(.09*s,.05,.06);body.add(st)}
    else if(o.feet==='bare')body.add(ball(skin,.07,.09*s,.04,.04,1,.55,1.4,true));
    else if(o.feet==='boot'){body.add(cyl(o.shoe,.07,.075,.2,.095*s,0,0,10));body.add(ball(o.shoe,.09,.095*s,.05,.04,1,.6,1.35,true))}
    else body.add(ball(o.shoe||'#3a2a22',.1,.095*s,.06,.04,1,.6,1.35,true))});
  if(o.cuff)[-1,1].forEach(s=>body.add(cyl(o.cuff,.088,.088,.05,.095*s,.12,0,12)));
  // torso
  if(long){const m=mat(o.robe);body.add(flathe(o.robeProf||[[0,.04],[.27,.04],[.28,.1],[.24,.4],[.2,.6],[.17,.74],[.14,.8],[0,.82]],m))}
  else{const t=new THREE.Mesh(new THREE.CylinderGeometry(.17,.21,o.coatH||.48,18),mat(o.coat));t.position.y=.54;t.castShadow=true;body.add(t)}
  // arms
  const armL=new THREE.Group(),armR=new THREE.Group();armL.position.set(-.21,.74,0);armR.position.set(.21,.74,0);body.add(armL,armR);
  [armL,armR].forEach((a,i)=>{const sl=new THREE.Mesh(new THREE.CylinderGeometry(.068,o.wide?.1:.074,.3,12),mat(o.sleeve||o.coat||o.robe));sl.position.y=-.15;sl.castShadow=true;a.add(sl);
    if(o.cuffArm)a.add(cyl(o.cuffArm,.06,.06,.04,0,-.32,0,10));a.add(ball(skin,.062,0,-.36,0,1,1,1,true));a.rotation.z=i?-.2:.2});
  // head
  const head=new THREE.Group();head.position.y=1.16;head.scale.setScalar(1.32);body.add(head);
  head.add(ball(skin,.3,0,0,0,1,1.06,.96));
  [-1,1].forEach(s=>head.add(ball(skin,.055,.29*s,-.04,0,.7,1,1,true)));        // ears
  if(o.eyes!=='none')[-1,1].forEach(s=>{head.add(ball('#121214',.036,.095*s,.0,.268,1,1.08,.62,true));head.add(ball('#ffffff',.009,.095*s+.012,.018,.29,1,1,1,true))});
  if(o.cheeks!==false)[-1,1].forEach(s=>head.add(ball('#f19aa6',.045,.17*s,-.085,.224,1,.85,.4,true)));
  head.add(ball(o.nose||'#f0b7a2',.032,0,-.06,.285,1,.9,1,true));
  if(o.mouth==='frown'){const m=new THREE.Mesh(new THREE.TorusGeometry(.03,.007,4,10,Math.PI),toon('#5a2a22'));m.position.set(0,-.17,.262);head.add(m)}
  else if(o.mouth==='flat')head.add(fbox('#b4413c',.05,.008,.01,0,-.165,.27));
  else if(o.mouth==='lips'){head.add(ball('#c8283a',.03,-.012,-.16,.265,1.2,.55,.5,true));head.add(ball('#c8283a',.03,.012,-.16,.265,1.2,.55,.5,true))}
  else if(o.mouth==='smile'){const m=new THREE.Mesh(new THREE.TorusGeometry(.03,.007,4,10,Math.PI),toon('#7a3a2c'));m.rotation.z=Math.PI;m.position.set(0,-.14,.268);head.add(m)}
  const brush=cyl('#8b5a3c',.012,.012,.3,0,-.4,.02,6);brush.rotation.x=-1.2;armR.add(brush);armR.add(ball('#d9774f',.025,0,-.42,.3,1,1,1,true));
  return {g,body,armL,armR,head,skin}}
const MUTE=new Map(),MUTE_S=.58,MUTE_L=.76;
function muteMat(m){if(MUTE.has(m))return MUTE.get(m);const n=m.clone();const hsl={};n.color.getHSL(hsl);
  if(m.map)n.color.setRGB(.78,.76,.74);else n.color.setHSL(hsl.h,hsl.s*MUTE_S,hsl.l*MUTE_L);MUTE.set(m,n);return n}
function figDone(f,A,s=1.05){f.g.traverse(o=>{if(o.isMesh)o.material=muteMat(o.material)});f.g.userData={A,body:f.body,armR:f.armR,head:f.head,pet:f.pet};f.g.traverse(o=>{if(o.isMesh)o.userData.artist=A});f.g.scale.setScalar(s);return f.g}
// fluffy beard: one mass + a few lumps
function beard(head,c,{y=-.17,z=.12,w=1.1,h=.9,lumps=6,long=0}={}){
  head.add(ball(c,.24,0,y,z,w,h+long,.8));
  for(let k=0;k<lumps;k++){const a=Math.PI*(.15+k/(lumps-1)*.7);head.add(ball(c,.075,Math.cos(a)*.2*w,y-Math.sin(a)*(.14+long*.2),z+.1,1,1.2,.8,true))}}
// hair round the back of the head (2026-10-05 大熊：後腦不能是光的). from/to = how far down from the crown (0 top, 1 chin),
// wide = also wraps forward past the ears; a bumpy row of tufts along the lower edge
function backHair(head,c,from,to,wide=0){const m=toon(c),a=wide?Math.PI-.35:Math.PI+.12,L=wide?Math.PI+.7:Math.PI-.24;
  const b=new THREE.Mesh(new THREE.SphereGeometry(.322,28,14,a,L,Math.PI*from,Math.PI*(to-from)),m);b.scale.set(1,1.06,.97);b.castShadow=true;head.add(b);
  const t=Math.PI*to;for(let k=0;k<11;k++){const ph=a+.1+k/10*(L-.2);head.add(ball(c,.055,-Math.cos(ph)*Math.sin(t)*.31,Math.cos(t)*.33,Math.sin(ph)*Math.sin(t)*.3,1,.9,1,true))}}
function sideHair(head,c,n=3,r=.09,top=.08){[-1,1].forEach(s=>{for(let k=0;k<n;k++)head.add(ball(c,r,.25*s,top-k*.1,-.06-k*.03,1,1,1,true))})}
function sunflower(){const f=new THREE.Group();f.add(cyl('#4f8f3a',.012,.012,.55,0,-.35,0,6));
  const L=ball('#4f8f3a',.06,.05,-.15,0,1.5,.5,.8,true);L.rotation.z=.6;f.add(L);
  const h=new THREE.Group();h.position.y=.22;h.rotation.x=.25;f.add(h);
  for(let i=0;i<14;i++){const a=i/14*6.28,p=ball(i%2?'#f2b81c':'#f7c932',.06,Math.cos(a)*.1,Math.sin(a)*.1,0,.55,1.25,.35,true);p.rotation.z=a-Math.PI/2;h.add(p)}
  h.add(ball('#6b3f1d',.07,0,0,.02,1,1,.5,true));return f}
function waterLily(){const f=new THREE.Group();f.add(cyl('#4f8f3a',.012,.012,.3,0,-.25,0,6));
  const pad=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.012,16,1,false,.3,5.8),toon('#3f8a3f'));pad.position.set(-.06,.08,-.04);pad.rotation.set(1.1,0,.3);f.add(pad);
  const h=new THREE.Group();h.position.y=.07;f.add(h);
  for(let i=0;i<8;i++){const a=i/8*6.28,p=ball('#fbf8ef',.045,Math.cos(a)*.045,.03,Math.sin(a)*.045,.5,1.3,.35,true);p.rotation.set(Math.sin(a)*.6,0,-Math.cos(a)*.6);p.lookAt(Math.cos(a)*.3,.3,Math.sin(a)*.3);h.add(p)}
  h.add(ball('#f2c230',.03,0,.04,0,1,.6,1,true));return f}
function cat(){const c=new THREE.Group(),K='#1d1d20',W='#f6f3ec';c.add(ball(K,.1,0,0,0,1,.85,.8));c.add(ball(W,.05,0,-.02,.07,1.2,1,.6,true));
  const h=new THREE.Group();h.position.set(0,.12,.04);c.add(h);h.add(ball(K,.085,0,0,0,1.1,.95,.95));h.add(ball(W,.045,0,-.03,.06,1.3,.8,.7,true));
  [-1,1].forEach(s=>{const e=new THREE.Mesh(new THREE.ConeGeometry(.032,.06,4),toon(K));e.position.set(.05*s,.08,0);e.rotation.z=-.3*s;h.add(e);
    h.add(ball('#121214',.016,.035*s,.01,.078,1,1,.5,true));c.add(ball(W,.028,.05*s,.02,.09,1,.8,1,true))});
  h.add(ball('#f0a2ad',.012,0,-.015,.09,1,.8,.6,true));
  const t=new THREE.Mesh(new THREE.TorusGeometry(.07,.016,6,10,Math.PI*1.2),toon(K));t.position.set(.05,-.08,.02);t.rotation.z=-1;c.add(t);return c}
function monkey(){const m=new THREE.Group(),B='#5a3a22',F='#e7c7a5';m.add(ball(B,.09,0,0,0,.9,1.1,.85));
  const h=new THREE.Group();h.position.set(0,.13,.02);m.add(h);h.add(ball(B,.08,0,0,0));h.add(ball(F,.055,0,-.01,.05,1.1,.9,.6,true));
  [-1,1].forEach(s=>{h.add(ball(F,.03,.08*s,.01,0,.5,1,1,true));h.add(ball('#121214',.013,.025*s,.01,.085,1,1,.5,true));
    const a=cyl(B,.022,.02,.12,.07*s,0,.03,6);a.rotation.z=s*1.9;a.rotation.x=.6;m.add(a)});
  const t=new THREE.Mesh(new THREE.TorusGeometry(.07,.016,6,12,Math.PI*1.5),toon(B));t.position.set(.03,-.15,-.02);t.rotation.set(0,.4,-1.2);m.add(t);return m}
function anteater(){const a=new THREE.Group(),G='#8a7f74',C='#e9e1d2',D='#2a2522';
  a.add(ball(G,.16,0,.2,0,1,.8,1.45));
  const stripe=new THREE.Mesh(new THREE.TorusGeometry(.13,.035,6,16,Math.PI),toon(D));stripe.position.set(0,.23,.04);stripe.rotation.y=Math.PI/2;stripe.rotation.z=.3;a.add(stripe);
  [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([x,z])=>a.add(cyl(z>0?C:G,.035,.04,.16,.08*x,.0,.13*z,8)));
  const h=new THREE.Group();h.position.set(0,.24,.22);a.add(h);h.add(ball(G,.08,0,0,0,1,1,1.1));
  const sn=new THREE.Mesh(new THREE.CylinderGeometry(.018,.042,.26,8),toon(G));sn.rotation.x=Math.PI/2+.5;sn.position.set(0,-.06,.13);h.add(sn);h.add(ball(D,.02,0,-.12,.24,1,1,1,true));
  [-1,1].forEach(s=>{h.add(ball('#121214',.014,.05*s,.03,.06,1,1,.5,true));h.add(ball(G,.025,.05*s,.08,-.02,1,1,.5,true))});
  const col=new THREE.Mesh(new THREE.TorusGeometry(.08,.014,6,14),toon('#7a4a26'));col.position.set(0,.2,.17);col.rotation.x=1.2;a.add(col);
  const tail=ball('#6f655c',.13,0,.24,-.3,.7,.9,1.6);tail.rotation.x=-.4;a.add(tail);
  a.traverse(o=>{if(o.isMesh)o.castShadow=true});return a}
function lanternGhost(){const l=new THREE.Group();const LC='#f2e6c8';
  const rope=new THREE.Mesh(new THREE.TorusGeometry(.04,.006,4,10,Math.PI),toon('#5a4030'));rope.position.y=.03;l.add(rope);
  l.add(cyl('#222',.05,.05,.03,0,-.03,0,10));
  const body=ball(LC,.11,0,-.15,0,1,1.2,1);l.add(body);
  for(let i=0;i<5;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(.105-Math.abs(i-2)*.012,.004,4,18),toon('#d8c9a2'));r.rotation.x=Math.PI/2;r.position.y=-.15+(i-2)*.05;l.add(r)}
  l.add(cyl('#222',.05,.05,.03,0,-.3,0,10));
  [-1,1].forEach(s=>{for(let k=0;k<3;k++)l.add(ball('#2a2420',.04,.09*s,-.1-k*.06,-.02,.5,1.4,.8,true));
    l.add(ball('#ffffff',.02,.035*s,-.12,.1,1,1,.4,true));l.add(ball('#121214',.009,.035*s,-.11,.115,1,1,.5,true))});
  l.add(ball('#7a2a22',.022,0,-.2,.1,1.2,.7,.4,true));return l}

const XT={
  snow:(bg,fg,rx,ry)=>texOf(128,128,(x,w,h)=>{x.fillStyle=bg;x.fillRect(0,0,w,h);x.strokeStyle=fg;x.fillStyle=fg;x.lineCap='round';const r=rng(bg.length*31+fg.length);
    for(let i=0;i<7;i++){const cx=r()*w,cy=r()*h,R=5+r()*7;x.lineWidth=R>9?2.2:1.6;
      for(let k=0;k<3;k++){const a=k*Math.PI/3;x.beginPath();x.moveTo(cx-Math.cos(a)*R,cy-Math.sin(a)*R);x.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);x.stroke()}}
    for(let i=0;i<14;i++){x.beginPath();x.arc(r()*w,r()*h,1.4,0,7);x.fill()}},rx,ry),
  // short soft tufts, for the furry onesies
  fur:(bg,hi,lo,rx,ry)=>texOf(128,128,(x,w,h)=>{x.fillStyle=bg;x.fillRect(0,0,w,h);const r=rng(bg.length*17+hi.length);x.lineCap='round';
    for(let i=0;i<420;i++){const cx=r()*w,cy=r()*h,a=1.2+r()*.7;x.strokeStyle=i%3?hi:lo;x.lineWidth=2+r()*1.5;x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+Math.cos(a)*6,cy+Math.sin(a)*6);x.stroke()}},rx,ry),
  dots:(bg,dot,rx,ry,R=9)=>texOf(128,128,(x,w,h)=>{x.fillStyle=bg;x.fillRect(0,0,w,h);x.fillStyle=dot;for(let i=0;i<4;i++)for(let j=0;j<4;j++){x.beginPath();x.arc(i*32+(j%2)*16+8,j*32+8,R,0,7);x.fill()}},rx,ry),
  stripe:(a,b,n,rx,ry)=>texOf(64,64,(x,w,h)=>{for(let i=0;i<n;i++){x.fillStyle=i%2?b:a;x.fillRect(0,i*h/n,w,h/n)}},rx,ry),
  // Klimt tree: green with gold rectangles and little eyes
  ktree:()=>texOf(256,256,(x,w,h)=>{x.fillStyle='#4f8a4a';x.fillRect(0,0,w,h);const r=rng(41);
    for(let i=0;i<300;i++){x.fillStyle=['#5b9a55','#447a40'][i%2];x.fillRect(r()*w,r()*h,4,4)}
    for(let i=0;i<22;i++){const cx=r()*w,cy=r()*h,ww=10+r()*8,hh=30+r()*40;x.fillStyle='#e2b83f';x.fillRect(cx,cy,ww,hh);x.fillStyle='#1d2a1d';for(let k=0;k<3;k++)x.fillRect(cx+ww*.3,cy+6+k*hh/3,ww*.4,5)}},2,1),
  // Hokusai: cream above, big blue waves round the hem
  hwave:()=>texOf(256,256,(x,w,h)=>{x.fillStyle='#e8efe6';x.fillRect(0,0,w,h);x.fillStyle='#bcd8c8';x.fillRect(0,0,w,h*.45);
    for(let k=0;k<2;k++){const o=k*128;x.fillStyle='#2b4f96';x.beginPath();x.moveTo(o-10,h);x.bezierCurveTo(o-6,190,o+40,130,o+100,136);x.bezierCurveTo(o+124,140,o+128,160,o+108,168);x.bezierCurveTo(o+86,156,o+60,176,o+64,206);x.bezierCurveTo(o+66,232,o+100,248,o+130,h);x.fill();
      x.fillStyle='#fbf7ee';for(let i=0;i<9;i++){const t=i/8;x.beginPath();x.arc(o+60+t*60,140+t*22,4.5-t*1.5,0,7);x.fill()}}
    x.strokeStyle='#fbf7ee';x.lineWidth=2;for(let i=0;i<8;i++){const cx=(i*67)%w,cy=20+(i*41)%90;for(let k=0;k<3;k++){const a=k*Math.PI/3;x.beginPath();x.moveTo(cx-Math.cos(a)*6,cy-Math.sin(a)*6);x.lineTo(cx+Math.cos(a)*6,cy+Math.sin(a)*6);x.stroke()}}},1.5,1),
};
const XTX={},xt=(k,...a)=>XTX[k+a.join()]||(XTX[k+a.join()]=XT[k](...a));
const keep=o=>{o.traverse(m=>{if(m.isMesh)m.userData.keep=1});return o};
// 聖誕配件比較多（毛球、裝飾），每格要多畫兩三百次 → 頭、身體、兩隻手各自把不會動的零件合併（同小屋 mergeGroup）；手跟頭會動，所以分開合併
function figDoneX(f,A,s=1.05){f.g.traverse(o=>{if(o.isMesh&&!o.userData.keep)o.material=muteMat(o.material)});
  const parts=[f.head,f.armL,f.armR];parts.forEach(p=>f.body.remove(p));mergeGroup(f.body);parts.forEach(p=>{mergeGroup(p);f.body.add(p)});f.g.userData={A,body:f.body,armR:f.armR,head:f.head,pet:f.pet};
  f.g.traverse(o=>{if(o.isMesh)o.userData.artist=A});f.g.scale.setScalar(s);return f.g}
// drop the paintbrush figBase puts in the right hand, for the ones holding something else there
const noBrush=f=>f.armR.children.slice(-2).forEach(o=>f.armR.remove(o));
const rnose=h=>h.add(keep(ball('#e0352f',.056,0,-.055,.29,1,.95,.9,true)));
function xstar(c='#f0c23a',r=.09,d=.04){const s=new THREE.Shape();for(let i=0;i<10;i++){const a=i/10*Math.PI*2+Math.PI/2,R=i%2?r*.45:r;i?s.lineTo(Math.cos(a)*R,Math.sin(a)*R):s.moveTo(Math.cos(a)*R,Math.sin(a)*R)}
  const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:d*.4,bevelSize:r*.12,bevelSegments:2});g.translate(0,0,-d/2);
  const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:c,emissive:'#6a4a00',emissiveIntensity:.25}));m.userData.keep=1;return m}
// tall cone hat whose tip leans over: bend>0 tips toward -x
function bentCone(c,r,h,bend=0,tilt=0){const g=new THREE.ConeGeometry(r,h,20,8);g.translate(0,h/2,0);const p=g.attributes.position;
  for(let i=0;i<p.count;i++){const t=p.getY(i)/h;p.setX(i,p.getX(i)-bend*t*t*h);p.setZ(i,p.getZ(i)-tilt*t*t*h)}g.computeVertexNormals();const m=new THREE.Mesh(g,mat(c));m.castShadow=true;return m}
// reindeer antler: a curved stem with two tines
function antler(c,s){const a=new THREE.Group();const tube=(pts,r)=>new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p[0]*s,p[1],p[2]))),10,r,6),toon(c));
  a.add(tube([[0,0,0],[.04,.12,0],[.08,.24,0],[.07,.34,0]],.032));a.add(tube([[.05,.15,0],[.13,.2,0],[.17,.27,0]],.026));a.add(tube([[.02,.08,0],[-.05,.14,0],[-.07,.2,0]],.024));
  [[.07,.34],[.17,.27],[-.07,.2]].forEach(([x,y])=>a.add(ball(c,.03,x*s,y,0,1,1,1,true)));return a}
// furry onesie hood: a shell round the back and a fluffy ring framing the face
function hood(h,m,c){const rm=m;const b=new THREE.Mesh(new THREE.SphereGeometry(.35,24,14,Math.PI-.5,Math.PI+1,0,Math.PI*.82),m);b.scale.set(1,1.04,.98);b.castShadow=true;h.add(b);
  for(let k=0;k<20;k++){const a=k/20*Math.PI*2,b=new THREE.Mesh(SPH_LO,rm);b.scale.set(.06,.06,.045);b.position.set(Math.cos(a)*.3,Math.sin(a)*.32+.02,.1);h.add(b)}}
function snowBird(){const b=new THREE.Group(),W='#f6f4ee';b.add(ball(W,.09,0,0,0,1,.85,1.1,true));b.add(ball(W,.065,0,.08,.05,1,1,1,true));
  [-1,1].forEach(s=>{b.add(ball('#1a1a1a',.011,.03*s,.1,.105,1,1,.6,true));const w=ball(W,.05,.08*s,.0,-.01,.5,.8,1.2,true);w.rotation.z=.4*s;b.add(w)});
  b.add(keep(ball('#e0352f',.016,0,.075,.12,1,1,1,true)));b.add(ball('#f2a3ad',.012,.045,.065,.1,1,.7,.5,true));b.add(ball('#f2a3ad',.012,-.045,.065,.1,1,.7,.5,true));return b}
function gingerbread(){const g=new THREE.Group(),C='#b4703a',I='#fbf3e6';const sh=new THREE.Shape();
  sh.absarc(0,.1,.06,0,Math.PI*2);const body=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.03,16),toon(C));body.rotation.x=Math.PI/2;body.position.y=.1;g.add(body);
  const t=new THREE.Mesh(new THREE.BoxGeometry(.11,.12,.03),toon(C));g.add(t);[-1,1].forEach(s=>{const a=fbox(C,.12,.045,.03,.07*s,.02,0);a.rotation.z=.4*s;g.add(a);const l=fbox(C,.045,.1,.03,.03*s,-.08,0);l.rotation.z=-.2*s;g.add(l)});
  [-1,1].forEach(s=>g.add(ball('#2a1a12',.009,.02*s,.11,.02,1,1,.5,true)));g.add(ball(I,.008,0,.02,.02,1,1,.5,true));g.add(ball(I,.008,0,-.01,.02,1,1,.5,true));
  const sm=new THREE.Mesh(new THREE.TorusGeometry(.022,.004,4,8,Math.PI),toon(I));sm.rotation.z=Math.PI;sm.position.set(0,.085,.018);g.add(sm);g.add(ball('#e0607a',.014,0,.055,.02,1.6,.8,.6,true));return g}
function ornament(c,band){const o=new THREE.Group();o.add(ball(c,.07,0,0,0));o.add(cyl('#d8b24a',.022,.022,.03,0,.065,0,8));if(band){const b=new THREE.Mesh(new THREE.TorusGeometry(.07,.008,4,16),toon(band));b.rotation.x=Math.PI/2;o.add(b)}return o}
function lotus(){const f=new THREE.Group();f.add(cyl('#4f8f3a',.012,.012,.26,0,-.2,0,6));const h=new THREE.Group();h.position.y=.07;f.add(h);
  for(let i=0;i<7;i++){const a=i/7*6.28,p=ball(i%2?'#f2a2b8':'#ec8fa8',.05,Math.cos(a)*.05,.05,Math.sin(a)*.05,.55,1.35,.35,true);p.lookAt(Math.cos(a)*.5,.6,Math.sin(a)*.5);h.add(p)}
  for(let i=0;i<4;i++){const a=i/4*6.28+.4,p=ball('#f7c0cf',.04,Math.cos(a)*.025,.07,Math.sin(a)*.025,.5,1.3,.35,true);p.lookAt(Math.cos(a)*.3,.8,Math.sin(a)*.3);h.add(p)}
  h.add(ball('#f2c230',.025,0,.07,0,1,.6,1,true));[-1,1].forEach(s=>{const l=ball('#4f8f3a',.05,.05*s,-.12,0,.5,1.3,.3,true);l.rotation.z=-.6*s;f.add(l)});return f}
function snowSunflower(){const f=sunflower();
  const h=f.children.find(o=>o.isGroup);const fl=new THREE.Group();fl.position.z=.06;h.add(fl);
  for(let k=0;k<3;k++){const a=k*Math.PI/3;const b=fbox('#fbf7ee',.1,.012,.01);b.rotation.z=a;fl.add(b)}return f}
function meltClock(){const c=new THREE.Group();const face=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.02,20),toon('#fbf8ef'));face.rotation.x=Math.PI/2;face.scale.set(.8,1,1.25);c.add(face);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.09,.014,6,20),toon('#d8a838'));rim.scale.set(.8,1.25,1);c.add(rim);
  c.add(ball('#d8a838',.028,.01,-.14,0,.8,1.6,.8,true));c.add(ball('#d8a838',.018,.02,-.19,0,1,1,1,true));
  c.add(fbox('#1a1a1a',.008,.06,.006,0,.03,.016));c.add(fbox('#1a1a1a',.006,.04,.006,.0,-.02,.016));return c}
function plane(){const p=new THREE.Group(),W='#b07a44',D='#8a5a30';const b=cyl(W,.03,.035,.34,0,-.17,0,10);b.rotation.z=Math.PI/2;b.position.set(.17,0,0);p.add(b);
  p.add(fbox(W,.08,.012,.44,0,.02,0));p.add(fbox(D,.05,.01,.18,-.15,.02,0));const fin=fbox(D,.05,.08,.01,-.15,.05,0);p.add(fin);
  p.add(ball(D,.025,.19,0,0,1,1,1,true));const pr=fbox('#6b4429',.01,.12,.02,.21,0,0);p.add(pr);return p}
function briefcase(){const b=new THREE.Group();b.add(fbox('#7a4a2a',.22,.17,.07));b.add(fbox('#6a3e22',.225,.02,.075,0,.06,0));b.add(fbox('#e0b450',.04,.03,.02,0,.04,.04));
  const hd=new THREE.Mesh(new THREE.TorusGeometry(.04,.012,5,10,Math.PI),toon('#5a3420'));hd.position.y=.085;b.add(hd);return b}
function snowLantern(){const l=new THREE.Group();l.add(cyl('#7a4a26',.012,.012,.12,0,.0,0,6));l.add(ball('#7a4a26',.025,0,.13,0,1,1.6,1,true));
  l.add(cyl('#7a4a26',.05,.06,.03,0,-.03,0,10));const gl=new THREE.Mesh(SPH,new THREE.MeshLambertMaterial({color:'#e9eef0',transparent:true,opacity:.75,emissive:'#fff2c8',emissiveIntensity:.35}));gl.scale.setScalar(.1);gl.position.y=-.13;gl.userData.keep=1;l.add(gl);
  const fl=new THREE.Group();fl.position.set(0,-.13,.09);l.add(fl);for(let k=0;k<3;k++){const b=fbox('#ffffff',.12,.012,.01);b.rotation.z=k*Math.PI/3;fl.add(b)}keep(fl);
  l.add(cyl('#7a4a26',.05,.04,.03,0,-.25,0,10));l.add(ball('#7a4a26',.02,0,-.27,0,1,1.4,1,true));return l}
function crystalCrown(c,flowers){const g=new THREE.Group();const M=new THREE.MeshLambertMaterial({color:c,transparent:true,opacity:.92,emissive:c,emissiveIntensity:.25});
  for(let i=0;i<7;i++){const a=Math.PI*(.15+i/6*.7),hh=.14+(3-Math.abs(i-3))*.04;const cr=new THREE.Mesh(new THREE.ConeGeometry(.04,hh,5),M);cr.userData.keep=1;cr.position.set(Math.cos(a)*.24,hh/2,Math.sin(a)*.12);cr.rotation.z=(Math.PI/2-a)*-.4;g.add(cr)}
  if(flowers)for(let i=0;i<7;i++){const a=Math.PI*(.12+i/6*.76);const fx=Math.cos(a)*.26,fz=Math.sin(a)*.14+.02;for(let p=0;p<5;p++){const pa=p/5*6.28;g.add(ball('#f2a0b4',.022,fx+Math.cos(pa)*.022,.0+Math.sin(pa)*.022,fz+.01,1,1,.5,true))}g.add(ball('#e8b42a',.014,fx,0,fz+.02,1,1,1,true))}
  return g}

// 介紹卡用的正面圖檔案順序（xmas-figs/f01～f12.webp）
const XFIGS=['梵谷','莫內','達利','克林姆','米羅','卡蘿','達文西','畢卡索','林布蘭','草間彌生','馬格利特','葛飾北齋'];
/* 2026-10-30 大熊參考圖要的小道具：五瓣花、畫筆、調色盤、蒙德里安色塊衣 */
function pflower(c,mid,r){const g=new THREE.Group();for(let i=0;i<5;i++){const a=i/5*Math.PI*2;const p=ball(c,r*.55,Math.cos(a)*r*.6,Math.sin(a)*r*.6,0,1,1,.45,true);g.add(p)}g.add(ball(mid,r*.38,0,0,r*.12,1,1,.6,true));return keep(g)}
function pbrush(tip){const b=new THREE.Group();const st=cyl('#8a5634',.018,.022,.36,0,0,0,8);b.add(st);b.add(cyl('#c9c4bc',.024,.024,.05,0,.36,0,8));const t=new THREE.Mesh(new THREE.ConeGeometry(.03,.09,10),toon(tip));t.position.y=.45;b.add(t);b.rotation.x=.4;return keep(b)}
function palette(){const p=new THREE.Group();const s=new THREE.Shape();s.absellipse(0,0,.19,.15,0,Math.PI*2,false,0);const ho=new THREE.Path();ho.absellipse(-.1,-.05,.035,.03,0,Math.PI*2,true,0);s.holes.push(ho);
  const g=new THREE.ExtrudeGeometry(s,{depth:.025,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:2});const m=new THREE.Mesh(g,toon('#ecd7ae'));p.add(m);
  [['#e2402a',-.02,.08],['#2f6fd0',.07,.07],['#f2c42a',.12,-.01],['#1a1a1a',.06,-.08],['#ffffff',-.03,-.08],['#3f9a5a',-.1,.04]].forEach(([c,x,y])=>p.add(ball(c,.032,x,y,.035,1,1,.5,true)));
  p.rotation.set(-.2,.5,.3);return keep(p)}
function mondrian(){const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');
  x.fillStyle='#f6f2e8';x.fillRect(0,0,512,256);
  const R=(col,a,b,w,h)=>{x.fillStyle=col;x.fillRect(a,b,w,h)};
  R('#d8382c',150,0,80,256);R('#2f5fb8',300,0,70,90);R('#f0c23a',300,110,60,70);R('#2f5fb8',380,160,132,96);R('#f0c23a',0,0,90,110);R('#d8382c',430,0,82,70);
  x.fillStyle='#1a1a1a';[[150,0,7,256],[230,0,7,256],[300,0,7,256],[370,0,7,256],[90,0,7,256],[237,90,140,7],[237,180,140,7],[0,110,90,7],[377,160,135,7],[430,0,7,160]].forEach(a=>x.fillRect(...a));
  x.save();x.translate(268,52);x.strokeStyle='#1a1a1a';x.lineWidth=5;x.beginPath();x.moveTo(-26,0);x.quadraticCurveTo(0,-22,26,0);x.quadraticCurveTo(0,22,-26,0);x.stroke();x.fillStyle='#1a1a1a';x.beginPath();x.arc(0,0,9,0,7);x.fill();x.restore();
  [[255,215],[275,225],[300,215],[320,228]].forEach(([a,b])=>{x.fillStyle='#d8382c';x.beginPath();x.arc(a,b,4,0,7);x.fill()});
  const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;t.offset.x=268/512;return t}
const FIGX={
'梵谷'(A){const P='#eaa0aa';const f=figBase({coat:P,sleeve:P,legs:'#4a6ea8',cuff:'#4a6ea8',shoe:'#3a2a20',cuffArm:P,skin:'#f6d6bc',mouth:'none',coatH:.52}),h=f.head,R='#c46a2c';
  f.body.add(flathe([[.2,.26],[.24,.28],[.2,.52]],toon(P,{side:THREE.DoubleSide}),18));
  f.body.add(fbox('#8cc7b4',.16,.36,.05,0,.58,.17));[-1,1].forEach(s=>[0,1,2].forEach(i=>f.body.add(keep(ball('#e2b13a',.02,.05*s,.68-i*.09,.2,1,1,.6,true)))));
  [-1,1].forEach(s=>{const lp=fbox('#e094a0',.06,.16,.03,.085*s,.7,.17);lp.rotation.z=-.4*s;f.body.add(lp)});
  backHair(h,R,.05,.8,1);sideHair(h,R,3,.09);beard(h,R,{y:-.2,lumps:7});brow(h,R,1,.35,.14);rnose(h);
  const hat=new THREE.Group();hat.position.y=.2;h.add(hat);const S='#e0b35c';
  hat.add(cyl(S,.5,.5,.03,0,0,0,28));const rim=new THREE.Mesh(new THREE.TorusGeometry(.49,.035,6,28),toon(S));rim.rotation.x=Math.PI/2;rim.position.y=.03;hat.add(rim);
  const cn=bentCone('#86c4a4',.3,.56,.12,.0);hat.add(cn);const band=new THREE.Mesh(new THREE.TorusGeometry(.29,.02,6,24),toon('#d8b24a'));band.rotation.x=Math.PI/2;band.position.y=.05;hat.add(band);
  const st=xstar();st.position.set(-.07,.6,0);hat.add(st);
  const sf=xstar('#fbf7ee',.045,.01);sf.position.set(0,.2,.22);sf.rotation.x=-.4;hat.add(sf);
  const fl=snowSunflower();fl.scale.setScalar(1.5);fl.position.set(-.04,-.3,.1);fl.rotation.set(.35,0,.35);f.armL.add(fl);f.armL.rotation.set(-.75,0,-.6);return figDoneX(f,A)},
'莫內'(A){const f=figBase({robe:'#f4f1ea',sleeve:xt('snow','#7fbca6','#f6f1e7',1,1),feet:'shoe',shoe:'#f4f1ea',skin:'#f6d6bc',mouth:'none',
    robeProf:[[0,.0],[.16,.0],[.28,.08],[.33,.24],[.3,.44],[.22,.62],[.17,.76],[.13,.82],[0,.84]]}),h=f.head,W='#f4f1ea';
  [0,1].forEach(i=>f.body.add(ball('#4a3226',.04,0,.42-i*.15,.31-i*.01,1,1,.5,true)));
  const sc=new THREE.Mesh(new THREE.TorusGeometry(.17,.07,8,20),mat(xt('snow','#7fbca6','#f6f1e7',3,1)));sc.rotation.x=Math.PI/2;sc.position.y=.78;f.body.add(sc);
  const tail=fbox('#7fbca6',.12,.3,.04,.16,.6,.25);tail.rotation.set(-.2,0,.25);f.body.add(tail);[0,1,2].forEach(k=>{const q=fbox('#6faa94',.022,.06,.04,.12+k*.035,.43,.28);q.rotation.z=.25;f.body.add(q)});
  backHair(h,W,.2,.8,1);sideHair(h,W,3,.1);beard(h,W,{y:-.17,lumps:8,w:.95,h:.75});brow(h,'#d8d6d0',1,-.2,.13,.1,.026);rnose(h);
  [-1,1].forEach(s=>{const m=ball(W,.06,.06*s,-.11,.28,1.6,.7,.7,true);m.rotation.z=.4*s;h.add(m)});
  const b=new THREE.Group();b.position.set(-.04,.22,0);b.rotation.z=.18;h.add(b);b.add(ball('#a58ccc',.38,0,0,0,1,.32,1));b.add(cyl('#957cbc',.27,.28,.06,0,-.08,0,22));b.add(ball('#8a70b8',.045,0,.12,0,1,1,1,true));
  const sf=xstar('#fbf7ee',.05,.01);sf.position.set(.2,.0,.27);sf.rotation.x=-.3;b.add(sf);
  noBrush(f);const lo=lotus();lo.scale.setScalar(2);lo.position.set(0,-.36,.1);lo.rotation.set(.3,0,0);f.armR.add(lo);
  return figDoneX(f,A)},
'達利'(A){const P='#e6a0ae';const f=figBase({robe:P,sleeve:P,wide:1,feet:'shoe',shoe:'#3a2422',cuffArm:'#c06070',skin:'#f6d6bc',mouth:'smile',
    robeProf:[[0,.1],[.3,.1],[.3,.16],[.26,.4],[.21,.62],[.17,.76],[.14,.82],[0,.84]]}),h=f.head,H='#2a2228';
  [-1,1].forEach(s=>f.body.add(cyl('#7a2a36',.07,.075,.14,.09*s,.0,0,10)));
  f.body.add(fbox('#b8445a',.15,.4,.05,0,.56,.2));[0,1,2].forEach(i=>f.body.add(keep(ball('#e2b13a',.02,0,.68-i*.09,.23,1,1,.6,true))));f.body.add(ball('#f6f1e7',.06,0,.78,.13,1.4,1,.8,true));
  const hem=new THREE.Mesh(new THREE.TorusGeometry(.3,.012,4,28),toon('#e8c070'));hem.rotation.x=Math.PI/2;hem.position.y=.13;f.body.add(hem);
  const ck=meltClock();ck.position.set(.17,.42,.22);ck.rotation.set(-.1,.4,.2);f.body.add(ck);
  backHair(h,H,.2,.8,1);[-1,1].forEach(s=>{for(let k=0;k<4;k++)h.add(ball(H,.08,.25*s,.06-k*.08,-.04-k*.03,1,1,1,true))});
  [-1,1].forEach(s=>{const b=new THREE.Mesh(new THREE.TorusGeometry(.06,.012,4,12,Math.PI*.8),toon(H));b.position.set(.1*s,.1,.262);b.rotation.z=Math.PI*.1;h.add(b)});
  [-1,1].forEach(s=>{const cv=new THREE.CatmullRomCurve3([[.012,-.11,.292],[.06,-.12,.285],[.11,-.105,.268],[.14,-.065,.255],[.15,-.025,.25],[.135,-.01,.252]].map(([x,y,z])=>new THREE.Vector3(x*s,y,z)));h.add(new THREE.Mesh(new THREE.TubeGeometry(cv,24,.012,5),toon('#121214')))});
  rnose(h);
  const hat=new THREE.Group();hat.position.y=.16;h.add(hat);const cn=bentCone('#7fbca6',.33,.7,-.42,.05);hat.add(cn);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.32,.04,6,24),toon('#74b09a'));rim.rotation.x=Math.PI/2;hat.add(rim);
  const c2=meltClock();c2.scale.setScalar(1.3);c2.position.set(.36,.42,0);c2.rotation.z=-.2;hat.add(c2);
  noBrush(f);const st=cyl('#6b4429',.018,.018,.6,0,-.84,.04,8);f.armR.add(st);f.armR.add(ball('#6b4429',.03,0,-.24,.04,1,1,1,true));
  return figDoneX(f,A)},
'克林姆'(A){const f=figBase({robe:xt('ktree'),sleeve:xt('ktree'),wide:1,feet:'shoe',shoe:'#3a2a20',skin:'#f6d6bc',mouth:'none',
    robeProf:[[0,.06],[.33,.06],[.34,.12],[.3,.3],[.26,.46],[.22,.62],[.17,.76],[.13,.82],[0,.84]]}),h=f.head,B='#5a3420';
  // ruffled tree tiers and ornaments
  [[.32,.14],[.28,.34],[.23,.54]].forEach(([r,y])=>{const t=new THREE.Mesh(new THREE.TorusGeometry(r,.035,6,28),toon('#477e43'));t.rotation.x=Math.PI/2;t.position.y=y;f.body.add(t)});
  [['#f2a3b8',.22,.24,.2],['#e2b13a',-.2,.3,.2],['#f2a3b8',-.26,.16,-.12],['#e2b13a',.16,.48,-.15],['#f2a3b8',.0,.18,-.32],['#e2b13a',.25,.16,-.15],['#f2a3b8',-.14,.5,.12]].forEach(([c,x,y,z])=>f.body.add(ball(c,.055,x,y,z,1,1,1,true)));
  [-1,1].forEach(s=>{for(let k=0;k<4;k++)h.add(ball(B,.085,.24*s,.18-k*.08,-.08-k*.02,1,1,1,true))});
  backHair(h,B,.34,.76);beard(h,B,{y:-.19,lumps:7});brow(h,B,1,-.05,.13,.09,.024);rnose(h);
  [-1,1].forEach(s=>{const m=ball(B,.05,.05*s,-.11,.27,1.6,.7,.7,true);m.rotation.z=-.25*s;h.add(m)});
  // tree hat: stacked green cones, ornaments, star
  const hat=new THREE.Group();hat.position.y=.2;h.add(hat);
  [[.3,.26,0],[.24,.24,.16],[.17,.22,.3]].forEach(([r,hh,y])=>{const c=new THREE.Mesh(new THREE.ConeGeometry(r,hh,18),toon('#4f8a4a'));c.position.y=y+hh/2;c.castShadow=true;hat.add(c)});
  [['#f2a3b8',.18,.08,.12],['#e2b13a',-.15,.12,.14],['#f2a3b8',.0,.3,.15],['#e2b13a',.1,.36,-.1]].forEach(([c,x,y,z])=>hat.add(ball(c,.04,x,y,z,1,1,1,true)));
  hat.add(ball('#f4f1ea',.05,0,.0,.24,1.8,.5,.6,true));
  const st=xstar();st.position.y=.6;hat.add(st);
  const c=cat();c.position.set(.06,.46,.32);c.rotation.y=-.15;c.scale.setScalar(1.5);f.body.add(c);f.pet=c;
  f.armL.rotation.set(-1.0,0,-.7);f.armR.rotation.z=-.5;return figDoneX(f,A)},
'米羅'(A){const FM=mat(xt('fur','#f494ac','#fbb3c4','#e07c96',3,2));const f=figBase({coat:xt('fur','#f494ac','#fbb3c4','#e07c96',3,2),sleeve:xt('fur','#f494ac','#fbb3c4','#e07c96',3,2),legs:xt('fur','#f494ac','#fbb3c4','#e07c96',3,2),shoe:'#f4efe6',skin:'#f6d6bc',mouth:'smile'}),h=f.head,G='#f2f0ea';
  /* 2026-10-30 大熊給參考圖：顏色不要灰（keep）、加紅花、左手調色盤右手畫筆、肚子大藍圓 */
  [-1,1].forEach(s=>{f.body.add(ball('#f4efe6',.09,.095*s,.05,.05,1,.6,1.3,true));[-1,0,1].forEach(k=>f.body.add(ball('#f4efe6',.03,.095*s+k*.035,.04,.15,1,.8,1,true)))});
  const tm2=new THREE.Mesh(new THREE.CylinderGeometry(.2,.22,.12,18),FM);tm2.position.y=.32;f.body.add(tm2);
  const st=xstar('#f2c42a',.08,.03);st.position.set(-.06,.6,.2);f.body.add(st);
  f.body.add(ball('#2340b8',.07,.09,.5,.19,1,1,.45,true));
  [['#e2402a',-.12,.42],['#e2402a',.0,.38],['#1a1a1a',.12,.64],['#3f8a4a',-.14,.52]].forEach(([c,x,y])=>f.body.add(ball(c,.03,x,y,.205,1,1,.5,true)));
  [-1,1].forEach(s=>{for(let k=0;k<3;k++)h.add(ball(G,.09,.27*s,.06-k*.09,.02-k*.03,1,1.1,1,true))});
  hood(h,FM,'#eea5b6');brow(h,'#b4b4b2',1,-.1,.13,.09,.026);rnose(h);
  [-1,1].forEach(s=>{const a=antler('#7fbca6',s);a.position.set(.2*s,.24,-.02);a.rotation.z=-.25*s;h.add(a)});
  const c=new THREE.Group();c.position.set(.02,.33,0);c.rotation.y=-.3;h.add(c);const B='#2340b8';
  c.add(ball(B,.13,.04,0,0,1.6,.55,1.05));
  const fh=new THREE.Group();fh.position.set(-.14,.08,.08);c.add(fh);fh.add(ball(B,.11,0,0,0,1,.9,.9));
  fh.add(ball('#f2e08a',.07,0,0,.08,1.2,.8,.35,true));[-1,1].forEach(s=>fh.add(ball('#1a1a1a',.014,.025*s,.0,.105,1,1,.5,true)));
  [-1,0,1].forEach(k=>{const cv=new THREE.CatmullRomCurve3([[k*.05,.08,0],[k*.07,.15,0],[k*.09,.19,.03],[k*.06,.2,.06]].map(p=>new THREE.Vector3(...p)));fh.add(new THREE.Mesh(new THREE.TubeGeometry(cv,10,.018,6),toon(B)));fh.add(ball(B,.03,k*.06,.2,.06,1,1,1,true))});
  [[.2,-.04,.1,.5],[.16,-.05,-.12,-.4],[-.06,-.06,.14,.2]].forEach(([x,y,z,r])=>{const l=ball(B,.04,x,y-.04,z,1,2,1,true);l.rotation.x=r;c.add(l)});
  const fl=pflower('#e2402a','#f2c42a',.075);fl.position.set(.22,.28,.17);fl.rotation.set(-.5,.5,0);h.add(fl);
  f.g.add(ball('#eea5b6',.08,0,.35,-.22,1,1,1,true));
  noBrush(f);const br=pbrush('#e2402a');br.position.set(0,-.36,.05);f.armR.add(br);f.armR.rotation.set(-.35,0,.25);
  const pl=palette();pl.position.set(-.04,-.38,.1);f.armL.add(pl);f.armL.rotation.set(-.55,0,-.35);
  keep(f.g);return figDoneX(f,A)},
'卡蘿'(A){const f=figBase({robe:xt('snow','#7cc79f','#f6f1e7',4,2),sleeve:'#7cc79f',feet:'shoe',shoe:'#3a2a20',skin:'#f3cfac',mouth:'smile',
    robeProf:[[0,.04],[.31,.04],[.32,.1],[.25,.4],[.19,.62],[.16,.76],[.13,.82],[0,.84]]}),h=f.head,H='#1a1517';
  /* 2026-10-30 大熊給參考圖：顏色不要灰、頭上粉紅花、裙子和披肩有小花 */
  const cape=flathe([[.34,.03],[.35,.08],[.29,.36],[.24,.58],[.2,.72],[.17,.82],[.13,.86]],mat(xt('snow','#f4ecd8','#e8a0b0',3,2)),20);cape.material.side=THREE.DoubleSide;
  const cp=new THREE.Group();cp.add(cape);cape.geometry=new THREE.LatheGeometry([[.34,.03],[.35,.08],[.29,.36],[.24,.58],[.2,.72],[.17,.82],[.13,.86]].map(([r,y])=>new THREE.Vector2(r,y)),20,Math.PI*.22,Math.PI*1.56);f.body.add(cp);
  [[-.06,.22,.292],[.08,.36,.26],[-.1,.5,.222],[.02,.12,.316]].forEach(([x,y,r],i)=>{const fl=pflower('#ffffff',i%2?'#f2c42a':'#e85a7a',.035);const R=r;fl.position.set(x,y,Math.sqrt(Math.max(0,R*R-x*x))+.012);fl.rotation.set(-.25,Math.asin(x/R),0);f.body.add(fl)});
  const hb=new THREE.Mesh(SPH,toon(H));hb.scale.set(.32,.3,.3);hb.position.set(0,.1,-.05);h.add(hb);
  for(let i=0;i<9;i++){const a=Math.PI*(-.1+i/8*1.2);h.add(ball(H,.075,Math.cos(a)*.27,.2+Math.sin(a)*.08,-.04-Math.sin(a)*.1,1,1,1,true))}
  [-1,1].forEach(s=>h.add(ball(H,.13,.24*s,.02,-.1,1,1,1)));h.add(ball(H,.15,0,.05,-.25,1.3,1,.8));backHair(h,H,.0,.84,1);
  h.add(fbox('#3a3034',.006,.06,.01,0,.25,.24));
  h.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-.18,.09,.24],[-.1,.125,.265],[0,.1,.285],[.1,.125,.265],[.18,.09,.24]].map(p=>new THREE.Vector3(...p))),20,.014,5),toon(H)));
  [-1,1].forEach(s=>h.add(ball('#e9b42a',.035,.3*s,-.14,0,1,1.2,1,true)));rnose(h);
  [-1,1].forEach(s=>[[.12,.27,.2],[.23,.22,.14]].forEach(([x,y,z],k)=>{const fl=pflower('#f39ab0','#f2c42a',k?.055:.065);fl.position.set(x*s,y,z);fl.rotation.set(-.6,.5*s,0);h.add(fl)})); /* 頭上的粉紅花 */
  const cr=crystalCrown('#bfe6f6',false);cr.position.set(0,.26,0);h.add(cr);
  const m=monkey();m.position.set(.24,.6,.18);m.rotation.y=-.3;m.scale.setScalar(1.3);f.body.add(m);f.pet=m;
  f.armL.rotation.set(-.9,0,-.4);keep(f.g);return figDoneX(f,A)},
'達文西'(A){const M='#86c49c',R='#b2506a';const f=figBase({robe:M,sleeve:M,wide:1,feet:'shoe',shoe:'#4a3022',skin:'#f6d6bc',mouth:'smile',
    robeProf:[[0,.1],[.28,.1],[.29,.16],[.25,.4],[.21,.62],[.17,.76],[.14,.82],[0,.84]]}),h=f.head,G='#e9e6de';
  /* 2026-10-30 大熊給參考圖：粉紅扁帽、白鬍子、綠袍＋酒紅披掛、皮帶兩個小包、左手卷軸右手三角尺 */
  [-1,1].forEach(s=>f.body.add(cyl('#3a6a50',.07,.075,.14,.09*s,.0,0,10)));
  const sash=new THREE.Mesh(new THREE.LatheGeometry([[.29,.14],[.27,.32],[.245,.5],[.215,.66],[.18,.78]].map(([r,y])=>new THREE.Vector2(r,y)),14,Math.PI*.12,Math.PI*.5),toon(R,{side:THREE.DoubleSide}));f.body.add(sash);
  const belt=new THREE.Mesh(new THREE.TorusGeometry(.245,.028,6,22),toon('#7a4a2a'));belt.rotation.x=Math.PI/2;belt.position.y=.42;f.body.add(belt);
  f.body.add(fbox('#d8a83a',.06,.05,.02,0,.42,.262));
  [-1,1].forEach(s=>{const p=fbox('#8a5634',.1,.1,.05,.12*s,.36,.24);p.rotation.y=.45*s;f.body.add(p);const fl=fbox('#6b4429',.105,.04,.055,.12*s,.4,.243);fl.rotation.y=.45*s;f.body.add(fl);f.body.add(ball('#d8a83a',.012,.12*s+.01*s,.38,.275,1,1,.6,true))});
  [-1,1].forEach(s=>{for(let k=0;k<6;k++)h.add(ball(G,.09,.24*s,.06-k*.1,-.08-k*.02,1,1.2,1,true))});
  backHair(h,G,.24,.86,1);beard(h,'#f6f4ee',{y:-.24,lumps:9,long:.5,w:1.15});brow(h,'#bdbdbb',1,-.15,.13,.09,.026);rnose(h);
  [-1,1].forEach(s=>{const m=ball('#f6f4ee',.06,.06*s,-.11,.28,1.6,.7,.7,true);m.rotation.z=.35*s;h.add(m)});
  const cap=new THREE.Group();cap.position.y=.22;h.add(cap);cap.add(ball('#ec8fa8',.4,0,.06,-.02,1,.4,1));cap.add(cyl('#e07f99',.31,.32,.08,0,-.08,0,24));
  noBrush(f);
  const sc=new THREE.Group();sc.add(fbox('#f6efdf',.13,.26,.012,0,0,0));[-1,1].forEach(k=>{const r=cyl('#efe5cf',.035,.035,.16,-.08,k*.13,0,12);r.rotation.z=Math.PI/2;r.position.set(.08,k*.13,0);sc.add(r)});
  sc.position.set(.03,-.4,.12);sc.rotation.set(.35,.4,-.15);f.armL.add(keep(sc));f.armL.rotation.set(-.4,0,-.3); /* 卷軸 */
  const ts=new THREE.Shape();ts.moveTo(0,0);ts.lineTo(.26,0);ts.lineTo(0,.3);ts.lineTo(0,0);const th=new THREE.Path();th.moveTo(.045,.045);th.lineTo(.045,.19);th.lineTo(.165,.045);th.lineTo(.045,.045);ts.holes.push(th);
  const tri=new THREE.Mesh(new THREE.ExtrudeGeometry(ts,{depth:.025,bevelEnabled:false}),toon('#8a5634'));tri.position.set(-.04,-.5,.1);tri.rotation.set(0,-.2,.1);f.armR.add(tri);f.armR.rotation.set(-.6,0,.25); /* 三角尺 */
  keep(f.g);return figDoneX(f,A)},
'畢卡索'(A){const f=figBase({coat:mondrian(),sleeve:'#2f5fb8',legs:'#2b4a9a',shoe:'#1a1a1c',skin:'#f3cfb4',mouth:'smile'}),h=f.head,W='#b9b8b4';
  /* 2026-10-30 大熊給參考圖：黑色貝雷帽、灰捲髮、臉上藍三角＋黃線（立體派）、蒙德里安色塊上衣上有眼睛、調色盤和藍筆 */
  f.armL.children[0].material=toon('#d8382c');
  backHair(h,W,.36,.8,1);for(let k=0;k<4;k++)[-1,1].forEach(s=>h.add(ball(W,.085,.27*s,.04-k*.07,-.02-k*.05,1,1.1,1,true)));
  for(let k=0;k<7;k++){const a=Math.PI+.35+k/6*(Math.PI-.7);h.add(ball(W,.085,-Math.cos(a)*.3,-.1-(k%2)*.04,Math.sin(a)*.29,1,1,1,true))}
  brow(h,'#9a9a98',1,-.1,.13,.09,.026);rnose(h);
  const ts=new THREE.Shape();ts.moveTo(-.075,.08);ts.lineTo(.085,.075);ts.lineTo(.01,-.1);ts.lineTo(-.075,.08);
  const tr=new THREE.Mesh(new THREE.ShapeGeometry(ts),toon('#3f7fd6'));tr.position.set(.1,.02,.262);tr.rotation.y=.36;h.add(tr);
  [[-.12,-.06,.4],[-.17,-.02,.6],[.06,-.19,-.3]].forEach(([x,y,r])=>{const k=fbox('#f0c23a',.08,.016,.006,x,y,0);const R=.3;k.position.z=Math.sqrt(Math.max(0,R*R-x*x-y*y))*.96+.006;k.rotation.set(-y*2.5,Math.asin(x/R),r);h.add(k)});
  [-1,1].forEach(s=>{h.children.filter(o=>o.position&&Math.abs(o.position.x-.095*s)<.001&&Math.abs(o.position.z-.268)<.001).forEach(o=>o.position.z=.275)});
  const bt=new THREE.Group();bt.position.set(.02,.24,0);bt.rotation.z=-.22;h.add(bt);bt.add(ball('#1c1c1f',.34,0,0,0,1.1,.36,1.05));bt.add(cyl('#1c1c1f',.025,.03,.09,0,.09,0,8));
  noBrush(f);const br=pbrush('#3f7fd6');br.position.set(0,-.36,.05);f.armR.add(br);f.armR.rotation.set(-.35,0,.25);
  const pl=palette();pl.position.set(-.04,-.38,.1);f.armL.add(pl);f.armL.rotation.set(-.55,0,-.35);
  keep(f.g);return figDoneX(f,A)},
'林布蘭'(A){const f=figBase({robe:'#5a5650',sleeve:'#5a5650',feet:'boot',shoe:'#3a2a20',skin:'#f6d6bc',mouth:'smile',
    robeProf:[[0,.2],[.26,.2],[.27,.24],[.24,.46],[.2,.62],[.17,.76],[.14,.82],[0,.84]]}),h=f.head,H='#8e8a88';
  [-1,1].forEach(s=>f.body.add(cyl('#3a3634',.075,.08,.24,.095*s,.0,0,10)));
  f.body.add(fbox('#9ccfb8',.14,.3,.04,0,.5,.24));f.body.add(fbox('#f2ede0',.16,.12,.045,0,.36,.235));
  const cape=new THREE.Mesh(new THREE.LatheGeometry([[.34,.16],[.32,.3],[.27,.52],[.21,.7],[.17,.8],[.13,.86]].map(([r,y])=>new THREE.Vector2(r,y)),22,Math.PI*.2,Math.PI*1.6),mat(xt('snow','#eea0b0','#fbf7ee',3,2)));cape.material.side=THREE.DoubleSide;cape.castShadow=true;f.body.add(cape);
  const col=new THREE.Mesh(new THREE.TorusGeometry(.15,.05,8,20),toon('#e894a6'));col.rotation.x=Math.PI/2;col.position.y=.83;f.body.add(col);f.body.add(ball('#e2b13a',.03,0,.8,.17,1,1,.6,true));
  [-1,1].forEach(s=>{for(let k=0;k<4;k++)h.add(ball(H,.1,.25*s,.06-k*.08,-.06-k*.02,1,1,1,true))});
  backHair(h,H,.05,.8,1);brow(h,H,1,-.1,.13,.09,.026);rnose(h);
  [-1,1].forEach(s=>{const m=ball(H,.05,.06*s,-.11,.27,1.7,.7,.7,true);m.rotation.z=.4*s;h.add(m)});h.add(ball(H,.045,0,-.24,.25,1,1.6,.7,true));
  const b=new THREE.Group();b.position.set(.02,.24,0);b.rotation.z=-.12;h.add(b);b.add(ball('#7fbca6',.38,0,0,0,1,.3,1));b.add(cyl('#72ae98',.29,.3,.07,0,-.09,0,22));b.add(ball('#72ae98',.035,0,.11,0,1,1,1,true));
  const fe=new THREE.Group();fe.position.set(-.3,.02,.1);fe.rotation.set(0,0,.9);b.add(fe);fe.add(ball('#f4ead2',.05,0,0,0,.7,3,.4,true));for(let k=0;k<5;k++)[-1,1].forEach(s=>{const q=ball('#f4ead2',.03,.03*s,-.08+k*.04,0,1.4,.5,.4,true);q.rotation.z=.6*s;fe.add(q)});
  noBrush(f);const gb=gingerbread();gb.scale.setScalar(1.5);gb.position.set(0,-.42,.08);f.armR.add(gb);f.armR.rotation.set(-.5,0,.15);
  const or=ornament('#f6f1e7','#e2b13a');or.position.set(0,-.42,.06);f.armL.add(or);f.armL.rotation.set(-.6,0,-.1);
  return figDoneX(f,A)},
'草間彌生'(A){const D=xt('dots','#eea0b0','#fbf7ee',3,1.6,8);const f=figBase({robe:D,sleeve:D,feet:'shoe',shoe:'#16161a',skin:'#f6d6bc',mouth:'smile',eyes:'none',
    robeProf:[[0,.1],[.3,.1],[.31,.14],[.26,.4],[.2,.62],[.16,.76],[.13,.82],[0,.84]]}),h=f.head;
  [-1,1].forEach(s=>f.body.add(cyl('#f4efe6',.055,.06,.14,.09*s,.0,0,10)));
  for(let k=0;k<10;k++){const a=k/10*6.28;f.body.add(ball('#fbf7ee',.04,Math.cos(a)*.14,.82,Math.sin(a)*.13,1,.6,1,true))}
  const hm=tm(T('kusamaHair'));
  for(let i=0;i<9;i++){const a=Math.PI*(-.18+i/8*1.36);const l=new THREE.Mesh(SPH,hm);l.scale.set(.17,.3,.17);l.position.set(Math.cos(a)*.27,-.0,-Math.sin(a)*.2-.04);l.castShadow=true;h.add(l)}
  const top=new THREE.Mesh(SPH,hm);top.scale.set(.42,.27,.36);top.position.set(0,.17,-.03);h.add(top);
  for(let i=0;i<5;i++){const b=new THREE.Mesh(SPH,hm);b.scale.set(.08,.1,.07);b.position.set((i-2)*.085,.2,.22-Math.abs(i-2)*.025);h.add(b)}
  const st=new THREE.Mesh(new THREE.TorusGeometry(.06,.025,6,10,Math.PI*.9),toon('#16161a'));st.position.set(.03,.46,-.03);st.rotation.z=.6;h.add(st);
  h.add(ball('#ec7a96',.075,-.03,.52,-.03,1,1,1));
  const gl=new THREE.Group();gl.position.set(0,.03,.28);h.add(gl);
  [-1,1].forEach(s=>{const fr=new THREE.Mesh(new THREE.TorusGeometry(.08,.026,6,4),toon('#16161a'));fr.rotation.z=Math.PI/4;fr.scale.set(1.15,1,1);fr.position.x=.095*s;gl.add(fr);
    const ln=new THREE.Mesh(new THREE.CircleGeometry(.08,4),toon('#f6efe4'));ln.rotation.z=Math.PI/4;ln.scale.set(1.15,1,1);ln.position.set(.095*s,0,-.005);gl.add(ln);
    gl.add(ball('#121214',.03,.095*s,-.005,.005,1,1.08,.5,true));
    for(let k=0;k<8;k++){const a=k/8*6.28;gl.add(ball('#f6f1e7',.008,.095*s+Math.cos(a+.4)*.098,Math.sin(a+.4)*.08,.03,1,1,.5,true))}});
  gl.add(fbox('#16161a',.04,.012,.012,0,.02,0));rnose(h);[-1,1].forEach(s=>h.add(ball('#f19aa6',.04,.17*s,-.1,.224,1,.85,.4,true)));
  const pk=new THREE.Group();pk.position.set(0,-.42,.12);pk.scale.setScalar(1.4);f.armL.add(pk);for(let i=0;i<6;i++){const a=i/6*6.28;const l=new THREE.Mesh(SPH,hm);l.scale.set(.07,.1,.07);l.position.set(Math.cos(a)*.06,0,Math.sin(a)*.06);pk.add(l)}
  pk.add(cyl('#16161a',.012,.01,.06,0,.08,0,6));f.armL.rotation.set(-.9,0,-.35);
  return figDoneX(f,A)},
'馬格利特'(A){const P='#e8a2ae';const f=figBase({coat:P,coatH:.56,legs:'#26262a',cuff:'#26262a',shoe:'#18181a',cuffArm:'#f2ede0',skin:'#f3d0b0',mouth:'smile'}),h=f.head,H='#1e1a1c';
  f.body.add(flathe([[.21,.24],[.24,.28],[.2,.52]],toon(P,{side:THREE.DoubleSide}),18));
  f.body.add(fbox('#2a2a2e',.15,.34,.04,0,.6,.18));f.body.add(ball('#f2ede0',.07,0,.78,.13,1.4,.8,.8,true));f.body.add(fbox('#1a1a1c',.04,.18,.02,0,.68,.205));
  [-1,1].forEach(s=>{const lp=fbox('#de94a2',.07,.18,.03,.085*s,.72,.17);lp.rotation.z=-.35*s;f.body.add(lp);[0,1].forEach(i=>f.body.add(keep(ball('#d8b04a',.02,.11*s,.56-i*.12,.2,1,1,.6,true))))});
  [-1,1].forEach(s=>f.body.add(fbox('#de94a2',.1,.05,.02,.13*s,.4,.205)));
  [-1,1].forEach(s=>{for(let k=0;k<3;k++)h.add(ball(H,.09,.26*s,.04-k*.08,-.06-k*.03,1,1.1,1,true))});backHair(h,H,.25,.82,1);
  brow(h,H,1,-.05,.13,.09,.024);rnose(h);
  const hat=new THREE.Group();hat.position.y=.17;h.add(hat);const K='#2a2a2e';
  hat.add(cyl(K,.44,.44,.025,0,0,0,28));const rim=new THREE.Mesh(new THREE.TorusGeometry(.43,.03,6,28),toon(K));rim.rotation.x=Math.PI/2;rim.position.y=.03;rim.scale.set(1,1.15,1);hat.add(rim);
  hat.add(cyl(K,.3,.31,.1,0,0,0,24));hat.add(ball(K,.3,0,.1,0,1,.82,1));hat.add(cyl('#1c1c20',.312,.312,.04,0,.03,0,24));
  const ap=new THREE.Group();ap.position.set(0,.2,.24);hat.add(ap);ap.add(ball('#7fc24a',.15,0,0,0,1,.95,.9));ap.add(cyl('#6b4429',.01,.008,.07,0,.12,0,6));
  [-1,1].forEach(s=>{const l=ball('#3f8a3a',.06,.06*s,.16,.0,1.3,.25,.7,true);l.rotation.set(.3,0,-.5*s);ap.add(l)});
  const bc=briefcase();bc.position.set(0,-.46,.02);bc.scale.setScalar(1.2);f.armL.add(bc);
  return figDoneX(f,A)},
'葛飾北齋'(A){const f=figBase({robe:xt('hwave'),sleeve:xt('hwave'),wide:1,feet:'geta',sole:'#8a5a30',strap:'#2f4a8a',skin:'#f3cfac',mouth:'smile',
    robeProf:[[0,.08],[.29,.08],[.3,.13],[.27,.4],[.22,.62],[.17,.76],[.14,.82],[0,.84]]}),h=f.head,W='#f4f1ea';
  const obi=new THREE.Mesh(new THREE.CylinderGeometry(.22,.23,.11,20),toon('#eea0b0'));obi.position.y=.52;f.body.add(obi);
  const cd=new THREE.Mesh(new THREE.TorusGeometry(.228,.012,4,24),toon('#d8b04a'));cd.rotation.x=Math.PI/2;cd.position.y=.52;f.body.add(cd);
  f.body.add(fbox('#eea0b0',.24,.12,.08,0,.52,-.24));
  [-1,1].forEach(s=>{const c=fbox(s>0?'#9ccfb8':'#f6f1e7',.035,.26,.02,.04*s,.7,.17);c.rotation.z=.45*s;f.body.add(c)});
  for(let r=0;r<3;r++)for(let k=0;k<9;k++){const a=Math.PI/2+.35+k/8*(Math.PI-.7);h.add(ball(W,.1,Math.sin(a)*.3,.1-r*.12,Math.cos(a)*.28-.02,1,1,1,true))}
  [-1,1].forEach(s=>{for(let k=0;k<4;k++)h.add(ball(W,.09,.27*s,.08-k*.08,-.04-k*.04,1,1,1,true))});
  backHair(h,W,.36,.8,1);brow(h,'#a8a8a6',1,.1,.13,.09,.026);rnose(h);
  const cap=new THREE.Mesh(new THREE.SphereGeometry(.325,24,10,0,Math.PI*2,0,Math.PI*.36),mat(T('wave')));cap.position.y=.0;cap.rotation.x=-.25;h.add(cap);
  const fl=xstar('#fbf7ee',.06,.015);fl.position.set(-.06,.3,.12);fl.rotation.x=-.6;h.add(fl);
  const sb=snowBird();sb.position.set(.3,.9,.08);sb.rotation.y=-.3;f.body.add(sb);
  noBrush(f);const lg=snowLantern();lg.position.set(0,-.4,.08);lg.scale.setScalar(1.3);f.armR.add(lg);f.armR.rotation.set(-.4,0,.3);lg.rotation.z=-.3;
  return figDoneX(f,A)},
};
function mergeGroup(R){R.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(R.matrixWorld).invert(),groups=new Map(),mtx=new THREE.Matrix4();
  R.traverse(c=>{if(!c.isMesh||c.userData.keep||c.isInstancedMesh||Array.isArray(c.material)||c.material.map||c.material.transparent||!c.material.color||c.children.length)return;
    const m=c.material,k=[m.type,m.side,!!m.flatShading,!!m.vertexColors,c.castShadow,c.receiveShadow].join('|');if(!groups.has(k))groups.set(k,[]);groups.get(k).push(c)});
  groups.forEach(list=>{if(list.length<2)return;const P=[],N=[],C=[];
    list.forEach(c=>{const g=c.geometry.index?c.geometry.toNonIndexed():c.geometry.clone();mtx.multiplyMatrices(inv,c.matrixWorld);g.applyMatrix4(mtx);if(!g.attributes.normal)g.computeVertexNormals();
      const pa=g.attributes.position,na=g.attributes.normal,ca=c.material.vertexColors&&g.attributes.color,col=c.material.color,flip=mtx.determinant()<0;
      for(let t=0;t<pa.count;t+=3)for(const v of flip?[0,2,1]:[0,1,2]){const i=t+v;P.push(pa.getX(i),pa.getY(i),pa.getZ(i));N.push(na.getX(i),na.getY(i),na.getZ(i));if(ca)C.push(ca.getX(i)*col.r,ca.getY(i)*col.g,ca.getZ(i)*col.b);else C.push(col.r,col.g,col.b)}
      g.dispose();c.parent.remove(c)});
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
    const m=list[0].material.clone();m.color.set('#ffffff');m.vertexColors=true;const M=new THREE.Mesh(g,m);M.castShadow=list[0].castShadow;M.receiveShadow=list[0].receiveShadow;M.userData.mg=1;R.add(M)})}
function flake(c,r){const g=new THREE.Group(),m=toon(c);for(let i=0;i<3;i++){const bx=new THREE.Mesh(new THREE.BoxGeometry(r*2,r*.22,r*.18),m);bx.rotation.z=i*Math.PI/3;g.add(bx)}
  for(let i=0;i<6;i++){const a=i*Math.PI/3;const t=new THREE.Mesh(SPH_LO,m);t.scale.setScalar(r*.2);t.position.set(Math.cos(a)*r,Math.sin(a)*r,0);g.add(t)}return keep(g)}
/* ===== 2026-10-29 五間聖誕小屋的主人（Claude 用同一套公仔零件設計，大熊看過再調） ===== */
const FOLK={
'禮物精靈'(A){const R='#c8443a',G='#3f8a5a';const f=figBase({coat:R,sleeve:R,legs:G,cuff:'#f6f1e7',shoe:'#5a3a24',cuffArm:'#f6f1e7',skin:'#f6d6bc',mouth:'smile'}),h=f.head;
  [0,1,2].forEach(i=>f.body.add(keep(ball('#e2b13a',.022,0,.7-i*.1,.205,1,1,.6,true))));
  f.body.add(cyl('#5a3a24',.215,.215,.05,0,.38,0,20));f.body.add(fbox('#e2b13a',.08,.06,.03,0,.405,.21));
  const bag=fbox('#9a6a3e',.18,.15,.08,-.24,.42,.06);f.body.add(bag);f.body.add(fbox('#f6f1e7',.12,.07,.01,-.24,.47,.105)); /* 郵差包＋露出一封信 */
  const strap=fbox('#7a4e2c',.035,.62,.02,0,.66,.0);strap.rotation.z=.75;strap.position.set(-.04,.72,.2);f.body.add(strap);
  backHair(h,'#c9874a',.36,.72);sideHair(h,'#c9874a',2,.08,.06);brow(h,'#a8673a',1,.1);
  [-1,1].forEach(s=>{const e=new THREE.Mesh(new THREE.ConeGeometry(.06,.2,10),toon('#f6d6bc'));e.rotation.z=-s*1.25;e.position.set(.33*s,.02,0);h.add(e)}); /* 尖耳朵 */
  const hat=new THREE.Group();hat.position.y=.2;h.add(hat);const cn=bentCone(G,.3,.62,.16,.0);hat.add(cn);
  const band=new THREE.Mesh(new THREE.TorusGeometry(.29,.05,8,24),toon('#f6f1e7'));band.rotation.x=Math.PI/2;band.position.y=.03;hat.add(band);
  const pom=keep(ball('#f6f1e7',.07,-.1,.6,0,1,1,1,true));hat.add(pom);
  const gift=new THREE.Group();gift.add(fbox('#e85a6a',.22,.18,.18));gift.add(fbox('#f2c14e',.05,.185,.185));gift.add(fbox('#f2c14e',.225,.185,.05));
  [-1,1].forEach(s=>{const b=keep(ball('#f2c14e',.05,.04*s,.11,0,1.3,.7,.6,true));gift.add(b)});
  gift.position.set(.05,-.42,.16);f.armL.add(gift);f.armL.rotation.set(-.9,0,-.35);return figDoneX(f,A)},
'薑餅烘焙師'(A){const C='#b4703a',I='#fbf3e6';const f=figBase({coat:C,sleeve:C,legs:C,shoe:C,skin:C,mouth:'smile',cheeks:true,nose:'#9a5a2c'}),h=f.head;
  const ap=flathe([[0,.36],[.215,.36],[.205,.6],[.17,.76],[0,.76]],toon(I,{side:THREE.DoubleSide}),20);ap.scale.set(1,1,.6);ap.position.z=.05;f.body.add(ap); /* 白圍裙 */
  f.body.add(fbox('#e98aa0',.14,.08,.02,0,.5,.21));[0,1].forEach(i=>f.body.add(keep(ball('#e85a6a',.022,0,.66-i*.1,.215,1,1,.6,true))));
  [-1,1].forEach(s=>{const w=new THREE.Mesh(new THREE.TorusGeometry(.05,.012,4,12,Math.PI),toon(I));w.position.set(0,-.29,0);f[s<0?'armL':'armR'].add(w)});
  const sm=new THREE.Mesh(new THREE.TorusGeometry(.05,.01,4,12,Math.PI),toon(I));sm.rotation.z=Math.PI;sm.position.set(0,-.13,.27);h.add(sm); /* 糖霜笑臉 */
  [-1,1].forEach(s=>{const z=new THREE.Mesh(new THREE.TorusGeometry(.035,.008,4,10,Math.PI),toon(I));z.position.set(.17*s,-.06,.23);z.rotation.y=.5*s;h.add(z)});
  const chef=new THREE.Group();chef.position.y=.22;h.add(chef);chef.add(cyl(I,.2,.22,.2,0,0,0,20));
  [[0,.28,0,.17],[-.12,.24,.05,.12],[.12,.24,.05,.12],[0,.24,-.1,.13],[-.09,.26,-.07,.11],[.09,.26,-.07,.11]].forEach(([x,y,z,r])=>chef.add(ball(I,r,x,y,z,1,.85,1)));
  noBrush(f);const pin=new THREE.Group();const rod=cyl('#d9b27a',.045,.045,.34,0,-.17,0,14);rod.rotation.z=Math.PI/2;rod.position.set(.17,0,0);pin.add(rod);
  [-1,1].forEach(s=>{const hd=cyl('#9a6a3e',.022,.022,.1,0,0,0,8);hd.rotation.z=Math.PI/2;hd.position.set(.17*s+(s>0?0:-.1),0,0);pin.add(hd)});
  pin.position.set(0,-.38,.1);f.armR.add(pin);f.armR.rotation.set(-.5,0,.25);
  const gb=gingerbread();gb.scale.setScalar(1.2);gb.position.set(0,-.42,.12);f.armL.add(gb);f.armL.rotation.set(-.6,0,-.3);return figDoneX(f,A)},
/* 2026-10-30 大熊給參考圖重捏：粉雪女王＝紫色捲髮＋金皇冠＋白毛領＋粉紅雪花長裙＋雪花魔杖；薄荷雪怪＝一整顆毛毛圓球、大肚子、咖啡色角、兩顆門牙。顏色照參考圖不做灰化（keep） */
'粉雪女王'(A){const P='#f5b9c9',W='#ffffff',HR='#c4a6d8',GD='#e3b64c',SK='#f7d4b8';
  const f=figBase({robe:P,sleeve:P,feet:'shoe',shoe:W,skin:SK,mouth:'none',nose:'#f2a07c',
    robeProf:[[0,0],[.42,0],[.43,.05],[.35,.28],[.25,.55],[.18,.74],[.15,.8],[0,.82]]}),h=f.head,b=f.body;
  const sm=new THREE.Mesh(new THREE.TorusGeometry(.035,.009,6,12,Math.PI),toon('#e0607a'));sm.rotation.z=Math.PI;sm.position.set(0,-.13,.27);h.add(sm);
  brow(h,'#a68ac2',1,0,.15,.08,.018);
  backHair(h,HR,0,.8,1);
  const cap=new THREE.Mesh(new THREE.SphereGeometry(.33,28,14,0,Math.PI*2,0,Math.PI*.33),toon(HR));cap.scale.set(1,1.04,.98);h.add(cap); /* 瀏海 */
  [[-.16,.15,.2,.11,1.3],[-.02,.18,.23,.1,1.1],[.14,.15,.21,.11,1.3]].forEach(([x,y,z,r,sx],i)=>{const l=ball(HR,r,x,y,z,sx,.75,.55);l.rotation.z=(i-1)*-.35;h.add(l)}); /* 額頭上三撮瀏海 */
  [-1,1].forEach(s=>{[[.31,.02,-.02,.14],[.35,-.2,-.04,.15],[.3,-.42,-.06,.14],[.2,-.05,-.22,.15],[.22,-.3,-.24,.15]].forEach(([x,y,z,r])=>h.add(ball(HR,r,x*s,y,z,1,1,1)));
    [[.4,-.08,.08],[.36,-.36,.07],[.3,.12,.1]].forEach(([x,y,z])=>h.add(ball(W,.026,x*s,y,z,1,1,1,true))); /* 頭髮上的珍珠 */
    const fl=flake(W,.07);fl.position.set(.3*s,-.06,.17);fl.rotation.y=.6*s;h.add(fl)});
  const cr=new THREE.Group();cr.position.y=.26;h.add(cr);cr.add(cyl(GD,.16,.17,.09,0,0,0,24));
  for(let i=0;i<3;i++){const a=(i-1)*.75,x=Math.sin(a)*.16,z=Math.cos(a)*.16,big=i===1;const sp=new THREE.Mesh(new THREE.ConeGeometry(big?.07:.06,big?.19:.15,8),toon(GD));sp.position.set(x,big?.17:.15,z);cr.add(sp);cr.add(ball(GD,big?.036:.032,x,big?.27:.23,z,1,1,1,true))}
  cr.add(ball('#e8789a',.035,0,.06,.17,1,1,.6,true));cr.rotation.x=-.12;
  const col=new THREE.Mesh(new THREE.TorusGeometry(.17,.075,10,24),toon(W));col.rotation.x=Math.PI/2;col.position.y=.79;col.scale.set(1.15,1,1);b.add(col);
  b.add(ball(GD,.035,0,.74,.22,1,1,.6,true)); /* 毛領的金扣子 */
  b.add(cyl(W,.43,.43,.05,0,.0,0,32)); /* 裙擺白邊 */
  const sk=(y)=>{const pr=[[.43,.05],[.35,.28],[.25,.55]];for(let i=0;i<2;i++){const[r0,y0]=pr[i],[r1,y1]=pr[i+1];if(y<=y1)return r0+(r1-r0)*(y-y0)/(y1-y0)}return .25};
  [[0,.36,.07],[-.17,.15,.065],[.17,.15,.065]].forEach(([x,y,r])=>{const R=sk(y),fl=flake(W,r);fl.position.set(x,y,Math.sqrt(Math.max(0,R*R-x*x))+.01);fl.rotation.set(-.3,Math.asin(x/R),0);b.add(fl)});
  [[0,.53],[-.09,.25],[.09,.25],[0,.12]].forEach(([x,y])=>{const R=sk(y),d=fbox(W,.035,.035,.01,x,y,Math.sqrt(Math.max(0,R*R-x*x))+.01);d.rotation.set(-.3,Math.asin(x/R),Math.PI/4);b.add(d)});
  const cape=new THREE.Mesh(new THREE.CylinderGeometry(.2,.47,.8,28,1,true,Math.PI*.42,Math.PI*1.16),new THREE.MeshLambertMaterial({color:'#fbf3f6',transparent:true,opacity:.85,side:THREE.DoubleSide}));cape.position.set(0,.42,-.02);b.add(cape);
  [f.armL,f.armR].forEach(a=>{const c=new THREE.Mesh(new THREE.TorusGeometry(.068,.03,8,16),toon(W));c.rotation.x=Math.PI/2;c.position.y=-.3;a.add(c)});
  noBrush(f);const wand=new THREE.Group();wand.add(cyl(GD,.015,.015,.46,0,-.2,0,8));const st=flake(W,.1);st.position.y=.3;wand.add(st);wand.add(ball('#f2a6b8',.03,0,.3,.02,1,1,1,true));
  wand.position.set(0,-.38,.06);wand.rotation.x=.15;f.armR.add(wand);f.armR.rotation.set(-.6,0,.3);
  keep(f.g);return figDoneX(f,A,1.08)},
'薄荷雪怪'(A){const M='#93d3b8',D='#7cc2a5',L='#d6eedc',HN='#8a5a3a';
  const g=new THREE.Group(),body=new THREE.Group();g.add(body);
  body.add(ball(M,.5,0,.58,0,1,1.06,.9));
  const R=rng(7);for(let i=0;i<46;i++){const th=R()*Math.PI*2,ph=.15+R()*1.25,x=Math.sin(ph)*Math.sin(th)*.5,y=.58+Math.cos(ph)*.53,z=Math.sin(ph)*Math.cos(th)*.45;
    if(z>.18&&y<.95&&Math.abs(x)<.38)continue; /* 臉和肚子不放毛 */
    const t=ball(i%3?M:D,.1,x,y,z,1,.75,.6);t.lookAt(x*3,y*3-1.2,z*3);body.add(t)}
  [[-.12,1.12,.08,.13],[.1,1.13,.1,.12],[0,1.15,-.05,.14],[-.24,1.06,.0,.11],[.25,1.05,.0,.11],[0,1.08,.2,.1]].forEach(([x,y,z,r])=>body.add(ball(M,r,x,y,z,1.2,.8,1))); /* 頭頂捲毛 */
  body.add(ball(L,.3,0,.42,.27,1.05,1.12,.5)); /* 大肚子 */
  [-1,1].forEach(s=>body.add(ball('#6fb898',.14,.2*s,.06,.08,1.15,.6,1.3)));
  const head=new THREE.Group();head.position.set(0,.76,0);body.add(head);
  [-1,1].forEach(s=>{head.add(ball('#121214',.055,.16*s,0,.39,1,1.1,.6,true));head.add(ball('#ffffff',.015,.16*s+.02,.025,.42,1,1,1,true));
    head.add(ball('#f19aa6',.06,.3*s,-.1,.33,1,.8,.4,true));
    const hn=new THREE.Mesh(new THREE.ConeGeometry(.075,.22,12),toon(HN));hn.position.set(.3*s,.42,-.02);hn.rotation.z=-.55*s;head.add(hn)}); /* 咖啡色角 */
  head.add(ball('#ee9a6a',.04,0,-.07,.45,1.2,.9,.8,true));
  head.add(ball('#7a4a32',.08,0,-.18,.42,1.5,.7,.45,true));
  [-1,1].forEach(s=>head.add(keep(fbox('#ffffff',.045,.055,.02,.026*s,-.155,.465))));
  const armL=new THREE.Group(),armR=new THREE.Group();armL.position.set(-.44,.72,0);armR.position.set(.44,.72,0);body.add(armL,armR);
  [armL,armR].forEach((a,i)=>{const s=i?1:-1;a.add(ball(M,.14,.03*s,-.16,0,.85,1.5,.85));[[.0,-.04],[.06,-.2],[-.02,-.32]].forEach(([x,y])=>a.add(ball(D,.07,x*s+.05*s,y,.04,1,.8,.8,true)));a.rotation.z=.15*s});
  const f={g,body,armL,armR,head};keep(g);return figDoneX(f,A,1.05)},
'彩繪精靈'(A){const S='#f6efe0';const f=figBase({coat:xt('dots','#8fc6e8','#ffffff',1,1,6),sleeve:'#8fc6e8',legs:'#e98aa0',cuff:'#e98aa0',shoe:'#f2c14e',skin:'#f6d6bc',mouth:'smile'}),h=f.head;
  const sm=flathe([[0,.3],[.23,.3],[.215,.55],[.18,.74],[0,.74]],toon(S,{side:THREE.DoubleSide}),20);sm.scale.set(1,1,.62);sm.position.z=.04;f.body.add(sm);
  [['#e85a6a',-.06,.62],['#f2c14e',.07,.52],['#5aa0e8',-.02,.45],['#6cc08a',.08,.66]].forEach(([c,x,y])=>f.body.add(keep(ball(c,.03,x,y,.215,1.3,1,.4,true)))); /* 圍裙上的顏料 */
  backHair(h,'#f2a3b8',.34,.72);sideHair(h,'#f2a3b8',2,.085,.04);brow(h,'#d0788a',1,.08);
  [-1,1].forEach(s=>{const e=new THREE.Mesh(new THREE.ConeGeometry(.055,.18,10),toon('#f6d6bc'));e.rotation.z=-s*1.25;e.position.set(.33*s,.02,0);h.add(e)});
  const bt=new THREE.Group();bt.position.set(.03,.24,0);bt.rotation.z=-.25;h.add(bt);const top=ball('#7a5ac8',.3,0,0,0,1.15,.35,1.1);bt.add(top);bt.add(cyl('#7a5ac8',.02,.03,.08,0,.08,0,8));
  ['#e85a6a','#f2c14e','#6cc08a','#5aa0e8'].forEach((c,i)=>{const a=i*1.5+.4;bt.add(keep(ball(c,.04,Math.cos(a)*.22,.07,Math.sin(a)*.22,1,.5,1,true)))}); /* 貝雷帽上的彩色顏料點 */
  const pal=new THREE.Group();const pl=new THREE.Mesh(new THREE.CylinderGeometry(.17,.17,.025,24),toon('#d9a86a'));pl.scale.set(1,1,.75);pal.add(pl);
  ['#e85a6a','#f2c14e','#6cc08a','#5aa0e8','#ffffff'].forEach((c,i)=>{const a=i*1.1+.3;pal.add(keep(ball(c,.03,Math.cos(a)*.11,.02,Math.sin(a)*.08,1,.5,1,true)))});
  pal.rotation.x=1.2;pal.position.set(0,-.42,.12);f.armL.add(pal);f.armL.rotation.set(-.8,0,-.4);return figDoneX(f,A)},
};

return {FIGX,FOLK}}
let API=null;
window.Artists3D={NAMES:['梵谷','莫內','達利','克林姆','米羅','卡蘿','達文西','畢卡索','林布蘭','草間彌生','馬格利特','葛飾北齋'],FOLK:['禮物精靈','薑餅烘焙師','粉雪女王','薄荷雪怪','彩繪精靈'],
  make:n=>{if(!window.THREE)return null;if(!API)API=build();return API.FIGX[n]?API.FIGX[n]({n}):API.FOLK[n]?API.FOLK[n]({n}):null}};
})();
