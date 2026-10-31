/* 2026-10-31 藝術殿堂裡面（3D 圓形大廳）：從作品小屋的萬神殿「走進殿堂」進來。
   跟作品小屋共用同一個 renderer（不開第二個 3D 畫布，手機比較不會被收回），進來時作品小屋不畫，只畫大廳。
   大熊說殿堂只會有 4～5 位 → 壁龕數照 HALL 清單（null＝還沒決定），加上後方一扇大門，左右對稱排；公仔用 art.html 的 makeArtist（聖誕期間就是聖誕造型）。壁龕裡只放雕像，不掛畫（大熊覺得雕像後面掛畫很怪），畫留到展間裡看。
   開放的藝術家（OPEN）亮燈、點了走過去 → 蓋一層 hall/index.html?room=… 看語音和生平；還沒開放的用布蓋著。
   用到 art.html 的：renderer、makeArtist、hallStatue、ARTISTS、XFIGS、picks、lam、toon、cvs、toast、LOWMEM */
(function(){
const OPEN={'梵谷':'vangogh'};
const EPN={'梵谷':7};   // 雕像上方「🎧 語音導覽」徽章顯示的集數，大熊每傳一集就 +1   // 之後開放別人就加一行（id 對到 hall/index.html 的 ROOMS）
const HALL=['梵谷',null,null,null,null];   // 第一位在正前方，其他左右輪流往後排；null＝這格還沒決定是誰
const STATUE=!/[?&]hfig=color/.test(location.search);   // 大熊：裡面放大理石雕像（跟殿堂門口同一種，art.html hallStatue）；?hfig=color 看彩色公仔版
/* 2026-10-31 第二版（大熊嫌平、空、沒焦點）：聚光燈打雕像＋大廳調暗、地板加深、底座加高＋銅牌＋「點我」提示、沒開放的壁龕拉紅絨布簾＋圍欄。?hv=1 看第一版 */
const V2=!/[?&]hv=1/.test(location.search);
const R=6.4,H=4,EYE=1.55,START=new THREE.Vector3(0,EYE,-.4);   // 定點：大熊要正前方的雕像大一點 → 走過中間的星星再停（一進門是 R-.9，慢慢走過來）
let sc=null,cam=null,ui=null,hits=[],folk=[],badges=[],ALIVE={},alive=null,sayEl=null,hintAt=null,hintEl=null,act=false,yaw=0,pitch=.06,pos=null,goal=null,down=null,tPrev=0,lastRoom=0;

/* 2026-10-31 大熊：大家不知道雕像裡有藝術家介紹 → 雕像頭上一直浮著一個發光的「🎧 語音導覽」徽章（像美術館語音導覽的標誌），上下輕輕飄。?guide=0 看沒有的樣子 */
const GUIDE=!/[?&]guide=0/.test(location.search);
function guideBadge(n,eps){const c=cvs(320,200),x=c.getContext('2d');
  x.fillStyle='rgba(255,222,150,.35)';x.beginPath();x.arc(160,70,66,0,7);x.fill();                     // 外圈光暈
  const gr=x.createLinearGradient(0,20,0,120);gr.addColorStop(0,'#f4d27c');gr.addColorStop(1,'#c99a3e');x.fillStyle=gr;x.beginPath();x.arc(160,70,52,0,7);x.fill();
  x.strokeStyle='#3e2c14';x.lineWidth=7;x.lineCap='round';x.beginPath();x.arc(160,78,26,Math.PI*1.08,Math.PI*1.92);x.stroke();   // 耳機
  x.fillStyle='#3e2c14';[[-1,1]].forEach(()=>{});x.beginPath();x.roundRect?x.roundRect(128,74,12,22,5):x.rect(128,74,12,22);x.fill();x.beginPath();x.roundRect?x.roundRect(180,74,12,22,5):x.rect(180,74,12,22);x.fill();
  x.fillStyle='rgba(30,22,10,.72)';x.beginPath();x.roundRect?x.roundRect(40,138,240,50,25):x.rect(40,138,240,50);x.fill();
  x.fillStyle='#ffe9b5';x.font='600 26px "Noto Sans TC",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(`${n}・語音導覽 ${eps} 集`,160,164);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,depthTest:false}));sp.renderOrder=10;sp.scale.set(1.6,1.0,1);return sp}
/* 底座正面的小銅牌：名字＋生卒年（美術館展品標籤那種，不是大招牌） */
function plaque(A,lift){const c=cvs(256,96),x=c.getContext('2d'),gr=x.createLinearGradient(0,0,256,96);gr.addColorStop(0,'#d9b46a');gr.addColorStop(.5,'#f0d898');gr.addColorStop(1,'#b8924c');
  x.fillStyle=gr;x.fillRect(0,0,256,96);x.strokeStyle='rgba(90,60,20,.55)';x.lineWidth=5;x.strokeRect(6,6,244,84);x.fillStyle='#3e2c14';x.textAlign='center';
  x.font='600 38px "Noto Serif TC",serif';x.fillText(A.n,128,46);const life=((typeof INFO!=='undefined'&&INFO[A.n]&&INFO[A.n].life)||'').split('・')[0];x.font='22px "Noto Serif TC",serif';x.fillText(life,128,78);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(.34,.128),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c)}));m.position.set(0,lift+.44,1.1+.224);return m}
/* 還沒開放的壁龕：拉起來的深紅絨布簾（直的皺褶）＋上面金色橫桿＋拱頂半圓布＋前面紅絨布圍欄 */
function closedNiche(g,NW,NH){const W=NW*2,cg=new THREE.PlaneGeometry(W,NH,64,1),p=cg.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i);p.setZ(i,Math.sin(x*13)*.05+Math.sin(x*5.3)*.025)}cg.computeVertexNormals();
  const vel=new THREE.MeshLambertMaterial({color:'#7c2a33'});const cu=new THREE.Mesh(cg,vel);cu.position.set(0,.18+NH/2,.15);g.add(cu);
  const sw=new THREE.Mesh(new THREE.CircleGeometry(NW,32,0,Math.PI),new THREE.MeshLambertMaterial({color:'#6a222b'}));sw.position.set(0,.18+NH,.03);g.add(sw);
  const rod=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,W+.2,10),lam('#c9a24f'));rod.rotation.z=Math.PI/2;rod.position.set(0,.18+NH,.22);g.add(rod);
  [-1,1].forEach(s=>{const k=new THREE.Mesh(new THREE.SphereGeometry(.07,12,8),lam('#d8b25a'));k.position.set(s*(W/2+.1),.18+NH,.22);g.add(k)});
  /* 圍欄：兩根銅柱＋中間垂下來的紅繩 */
  const z=1.55,px=1.0;[-1,1].forEach(s=>{const b=new THREE.Mesh(new THREE.CylinderGeometry(.11,.13,.05,16),lam('#b8924c'));b.position.set(s*px,.025,z);g.add(b);
    const c=new THREE.Mesh(new THREE.CylinderGeometry(.03,.035,.9,10),lam('#c9a24f'));c.position.set(s*px,.47,z);g.add(c);
    const t=new THREE.Mesh(new THREE.SphereGeometry(.06,12,8),lam('#d8b25a'));t.position.set(s*px,.94,z);g.add(t)});
  const rope=new THREE.QuadraticBezierCurve3(new THREE.Vector3(-px,.88,z),new THREE.Vector3(0,.5,z),new THREE.Vector3(px,.88,z));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(rope,24,.025,8),new THREE.MeshLambertMaterial({color:'#8e1f2a'})))}

/* 遊客（大熊要大廳有人氣）：用島上公仔同一個身體 figBase，換髮型衣服；站著看雕像、沿著大廳慢慢繞、坐在長椅上。點了沒反應，只是氣氛 */
const FOLK=[
  {coat:'#7d8fa6',legs:'#3f4a5e',hair:'#3a2a22',do:'look',x:-2.35,z:-4.1},
  {coat:'#c99a7a',legs:'#5b4a3e',hair:'#1f1a17',long:1,do:'look',x:2.3,z:-4.0},
  {coat:'#8aa38a',legs:'#4a4f55',hair:'#6b4a2e',do:'walk',r:2.6,a0:.9,spd:.11},
  {coat:'#b07f8e',legs:'#3d3f48',hair:'#2a2420',long:1,do:'walk',r:2.6,a0:3.6,spd:-.09},
  {coat:'#a99a6c',legs:'#4c4337',hair:'#bdb8b0',do:'sit',x:-2.4,z:1.45},
  {coat:'#6f8b9a',legs:'#3a3f47',hair:'#4a3426',long:1,do:'sit',x:2.4,z:1.45}];
function visitor(o,i){const f=figBase({coat:o.coat,sleeve:o.coat,legs:o.legs,shoe:'#3a2a22',skin:['#f3d4bb','#e9c3a0','#f6d6bc'][i%3],mouth:i%2?'smile':'flat',cheeks:false});
  f.armR.children.slice(-2).forEach(c=>f.armR.remove(c));   // figBase 手上有畫筆，遊客不拿
  f.head.add(ball(o.hair,.3,0,.14,-.06,1.05,.78,.95));f.head.add(ball(o.hair,.28,0,-.02,-.11,1,1,.8));if(o.long)f.head.add(ball(o.hair,.26,0,-.22,-.12,1.05,1.25,.7));
  if(XDECO&&i%3===0){const h=new THREE.Mesh(new THREE.ConeGeometry(.22,.4,14),toon('#c8423a'));h.position.set(0,.36,-.02);h.rotation.z=-.25;f.head.add(h);f.head.add(ball('#f4efe6',.06,-.1,.55,-.02))}
  f.g.traverse(m=>{if(m.isMesh){m.material=muteMat(m.material);m.castShadow=false}});f.g.scale.setScalar(.95);
  return Object.assign(f,{o,ph:i*1.7})}
function buildFolk(){FOLK.forEach((o,i)=>{const v=visitor(o,i);sc.add(v.g);folk.push(v);
  if(o.do==='look'){v.g.position.set(o.x,0,o.z);v.g.rotation.y=Math.atan2(-o.x,-(R-.3-1.1)-o.z)}   // 面向正前方的雕像
  else if(o.do==='sit'){v.g.position.set(o.x,.18,o.z);v.g.rotation.y=Math.PI;v.armL.rotation.x=v.armR.rotation.x=-.5}});
  /* 長椅：左右對稱各一張，木頭椅腳＋紅絨布坐墊（跟布簾同色），坐著的遊客腿藏在椅子裡 */
  const put=(m,x,y,z)=>{m.position.set(x,y,z);return m};
  [-1,1].forEach(s=>{const b=new THREE.Group();b.position.set(s*2.4,0,1.6);sc.add(b);
    b.add(put(new THREE.Mesh(new THREE.BoxGeometry(1.7,.1,.55),lam('#8a6a4a')),0,.4,0));
    b.add(put(new THREE.Mesh(new THREE.BoxGeometry(1.62,.08,.5),new THREE.MeshLambertMaterial({color:'#7c2a33'})),0,.49,0));
    b.add(put(new THREE.Mesh(new THREE.BoxGeometry(1.7,.36,.06),lam('#7a5c3f')),0,.2,-.25));
    [-1,1].forEach(k=>b.add(put(new THREE.Mesh(new THREE.BoxGeometry(.08,.4,.5),lam('#6e5238')),k*.8,.2,0)))})}
/* 遊客動作：繞圈的人一邊走一邊上下晃、擺手；站著的偶爾轉頭、換重心；坐著的慢慢點頭 */
function folkTick(t,dt){folk.forEach(v=>{const o=v.o,p=t+v.ph;
  if(o.do==='walk'){if(!alive)o.a0+=o.spd*dt;   /* 2026-11-01 大熊：雕像跳下來時有人走過去重疊 → 繞圈半徑縮到 2.6（離落地點 4.15 很遠），雕像活過來時大家先停下來看 */const x=Math.sin(o.a0)*o.r,z=Math.cos(o.a0)*o.r;v.g.position.set(x,Math.abs(Math.sin(p*5))*.03,z);
    v.g.rotation.y=o.a0+(o.spd>0?Math.PI/2:-Math.PI/2);v.armL.rotation.x=Math.sin(p*5)*.4;v.armR.rotation.x=-Math.sin(p*5)*.4}
  else if(o.do==='look'){v.head.rotation.y=Math.sin(p*.45)*.25;v.body.rotation.z=Math.sin(p*.3)*.03}
  else v.head.rotation.x=Math.sin(p*.6)*.06})}

function build(){
  sc=new THREE.Scene();sc.background=new THREE.Color('#d9e6ee');
  cam=new THREE.PerspectiveCamera(62,1,.1,80);pos=new THREE.Vector3(0,EYE,0);
  sc.add(new THREE.HemisphereLight('#fff8ec','#b9a98d',V2?.5:.72));
  const top=new THREE.DirectionalLight('#fff3dc',V2?.32:.5);top.position.set(1.5,10,1);sc.add(top);
  /* 地板：一圈一圈的大理石，中間一個八角星 */
  const fc=cvs(1024,1024),fx=fc.getContext('2d');fx.translate(512,512);
  [[512,'#b9a789'],[470,'#a38e6b'],[455,'#c6b596'],[300,'#977f5e'],[285,'#cbbb9c'],[150,'#9d8664'],[136,'#d0c1a3']].forEach(([r,c])=>{fx.fillStyle=c;fx.beginPath();fx.arc(0,0,r,0,7);fx.fill()});
  fx.fillStyle='#8a7050';fx.beginPath();for(let i=0;i<16;i++){const a=i/16*Math.PI*2,r=i%2?40:118;fx[i?'lineTo':'moveTo'](Math.cos(a)*r,Math.sin(a)*r)}fx.fill();
  for(let i=0;i<24;i++){const a=i/24*Math.PI*2;fx.strokeStyle='rgba(120,100,70,.18)';fx.lineWidth=3;fx.beginPath();fx.moveTo(Math.cos(a)*300,Math.sin(a)*300);fx.lineTo(Math.cos(a)*455,Math.sin(a)*455);fx.stroke()}
  const ft=new THREE.CanvasTexture(fc);const fl=new THREE.Mesh(new THREE.CircleGeometry(R,64),new THREE.MeshLambertMaterial({map:ft,color:V2?'#9a9082':'#b4ab9b'}));fl.rotation.x=-Math.PI/2;sc.add(fl);
  /* 牆＋上緣線腳 */
  const wall=new THREE.Mesh(new THREE.CylinderGeometry(R,R,H,72,1,true),new THREE.MeshLambertMaterial({color:'#e3d8c4',side:THREE.BackSide}));wall.position.y=H/2;sc.add(wall);
  [[H,.16,'#d2c3a6'],[H+.22,.1,'#e8dfcd'],[.18,.18,'#c9b99a']].forEach(([y,h,c])=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(R-.12,R-.12,h,72,1,true),new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide}));m.position.y=y;sc.add(m)});
  /* 圓頂：格子天花板（萬神殿那種一格一格往內凹的方格），中間留圓洞透光 */
  const dc=cvs(512,256),dx=dc.getContext('2d');dx.fillStyle='#ece4d3';dx.fillRect(0,0,512,256);
  for(let i=0;i<16;i++)for(let j=0;j<5;j++){const w=512/16,h=256/5;dx.fillStyle='#d6c9b0';dx.fillRect(i*w+4,j*h+5,w-8,h-10);dx.fillStyle='#e2d7c2';dx.fillRect(i*w+8,j*h+10,w-16,h-20)}
  const dt=new THREE.CanvasTexture(dc);dt.wrapS=THREE.RepeatWrapping;dt.repeat.set(2,1);
  const dome=new THREE.Mesh(new THREE.SphereGeometry(R,64,20,0,Math.PI*2,.11,Math.PI/2-.11),new THREE.MeshLambertMaterial({map:dt,side:THREE.BackSide}));dome.position.y=H+.2;sc.add(dome);
  const ocR=R*Math.sin(.11),ocY=H+.2+R*Math.cos(.11);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(ocR,.08,8,40),new THREE.MeshLambertMaterial({color:'#cdbd9e'}));ring.rotation.x=Math.PI/2;ring.position.y=ocY;sc.add(ring);
  const sky=new THREE.Mesh(new THREE.CircleGeometry(ocR+.05,32),new THREE.MeshBasicMaterial({color:XDECO?'#2f4c8c':'#a9d3ec'}));sky.rotation.x=Math.PI/2;sky.position.y=ocY+.3;sc.add(sky);
  /* 圓洞透下來的光柱＋地上的光斑 */
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(ocR*.95,ocR*1.6,ocY,32,1,true),new THREE.MeshBasicMaterial({color:XDECO?'#c8d6ff':'#fff2cf',transparent:true,opacity:.07,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));beam.position.y=ocY/2;sc.add(beam);
  const spot=new THREE.Mesh(new THREE.CircleGeometry(ocR*1.6,40),new THREE.MeshBasicMaterial({color:'#fff6dc',transparent:true,opacity:.28,depthWrite:false}));spot.rotation.x=-Math.PI/2;spot.position.y=.01;sc.add(spot);
  /* 壁龕＋後方大門平均分一圈（大門在背後），HALL[0] 正前方，其他左右對稱往後排（奇數個：0,-1,+1,-2,+2；偶數個：±.5,±1.5） */
  const n=HALL.length,step=Math.PI*2/(n+1),offs=HALL.map((_,i)=>n%2?(i?Math.ceil(i/2)*(i%2?-1:1):0):(Math.floor(i/2)+.5)*(i%2?1:-1));
  const arch=(w,h)=>{const s=new THREE.Shape();s.moveTo(-w,0);s.lineTo(w,0);s.lineTo(w,h);s.absarc(0,h,w,0,Math.PI,false);s.lineTo(-w,0);return new THREE.ShapeGeometry(s,20)};
  const NW=1.55,NH=2.1,nicheG=arch(NW,NH);   // 大熊嫌灰綠那塊太小 → 壁龕加寬加高（頂端剛好在牆的線腳下面）
  const place=a=>{const g=new THREE.Group();g.position.set(Math.sin(a)*(R-.3),0,Math.cos(a)*(R-.3));g.rotation.y=a+Math.PI;sc.add(g);return g};   // 每格的 +z 朝大廳中心；往內 .3，平的壁龕兩邊才不會被彎的牆吃掉
  HALL.forEach((nm,i)=>{const A=nm&&ARTISTS.find(x=>x.n===nm),open=!!(A&&OPEN[nm]),g=place(Math.PI+offs[i]*step);
    /* 雕像版：壁龕裡面深青綠，白色雕像才跳得出來 */
    const back=new THREE.Mesh(nicheG,new THREE.MeshLambertMaterial({color:STATUE?(open?'#55706b':'#6b7b77'):(open?'#cfbf9f':'#d8ccb5')}));back.position.set(0,.18,.01);g.add(back);
    [-1,1].forEach(s=>{const p=new THREE.Mesh(new THREE.BoxGeometry(.24,3.7,.24),lam('#e9e0cf'));p.position.set(s*(NW+.38),1.85,.12);g.add(p);
      const e=new THREE.Mesh(new THREE.BoxGeometry(.16,NH,.06),lam('#d2c3a6'));e.position.set(s*(NW+.08),.18+NH/2,.04);g.add(e)});   // 壁龕兩邊的框
    const top=new THREE.Mesh(new THREE.RingGeometry(NW,NW+.16,28,1,0,Math.PI),lam('#d2c3a6'));top.position.set(0,.18+NH,.04);g.add(top);
    if(V2&&!open){closedNiche(g,NW,NH)}
    else{const lift=V2?.4:0;   // 第二版底座加高：下面多墊一層
      if(lift){const b0=new THREE.Mesh(new THREE.BoxGeometry(.8,lift,.8),lam('#a39e96'));b0.position.set(0,lift/2,1.1);g.add(b0)}
      const ped=hallStatue(STATUE&&open?A.n:'');ped.position.set(0,lift,1.1);g.add(ped);   // 方形石頭底座（開放的上面站雕像）
      if(open&&STATUE&&ped.children[3]){const M=ped.children[3];let mc=null;M.traverse(m=>{if(m.isMesh){mc=mc||m.material.clone();m.material=mc}});   // 雕像自己一份材質，發光時不會連門口的雕像一起亮
        ALIVE[nm]={g,lift,A,M,mc,C:null}}
      if(open){if(!STATUE){const n0=picks.length,f=makeArtist(A);picks.length=n0;f.position.set(0,lift+.75,1.1);f.scale.multiplyScalar(1.05);g.add(f)}
        if(V2){/* 聚光燈從前上方打下來＋地上一圈暖光 */
          const sp=new THREE.SpotLight('#ffe4b5',1.7,9,.58,.55,1);sp.position.set(0,3.9,3.4);sp.target.position.set(0,lift+1.2,1.1);g.add(sp,sp.target);
          const pool=new THREE.Mesh(new THREE.CircleGeometry(1.05,40),new THREE.MeshBasicMaterial({color:'#ffd89a',transparent:true,opacity:.22,depthWrite:false,blending:THREE.AdditiveBlending}));pool.rotation.x=-Math.PI/2;pool.position.set(0,.015,1.5);g.add(pool);
          g.add(plaque(A,lift));g.updateMatrixWorld(true);hintAt=g.localToWorld(new THREE.Vector3(0,lift+2.95,1.1));
          if(GUIDE){const b=guideBadge(A.n,EPN[A.n]||0);b.position.set(0,lift+3.4,1.1);b.userData.y0=lift+3.4;g.add(b);badges.push(b)}}
        else{const lt=new THREE.PointLight('#ffe2b0',.9,4.5,2);lt.position.set(0,2.4,2);g.add(lt)}}
      else{/* 還沒開放（第一版）：布蓋著 */
        const prof=[[0,1.5],[.18,1.46],[.32,1.3],[.38,.9],[.44,.4],[.52,.02],[.5,0]].map(([x,y])=>new THREE.Vector2(x,y));
        const cl=new THREE.Mesh(new THREE.LatheGeometry(prof,18),new THREE.MeshLambertMaterial({color:'#bfb29a',flatShading:true}));cl.position.set(0,.75,1.1);g.add(cl)}}
    const hit=new THREE.Mesh(new THREE.BoxGeometry(2.6,3.6,1.8),new THREE.MeshBasicMaterial({visible:false}));hit.position.set(0,1.8,.9);hit.userData={A,open};g.add(hit);hits.push(hit)});
  /* 後方大門：外面的天光（聖誕期間是夜空），點了回作品小屋 */
  const dg=place(0),door=new THREE.Mesh(arch(1.15,2.3),new THREE.MeshBasicMaterial({color:XDECO?'#3d5a99':'#f4eedf'}));door.position.set(0,0,.02);dg.add(door);
  const dfr=new THREE.Mesh(new THREE.RingGeometry(1.15,1.38,24,1,0,Math.PI),lam('#d2c3a6'));dfr.position.set(0,2.3,.04);dg.add(dfr);
  [-1,1].forEach(s=>{const p=new THREE.Mesh(new THREE.BoxGeometry(.23,2.3,.1),lam('#d2c3a6'));p.position.set(s*1.265,1.15,.04);dg.add(p)});
  const dh=new THREE.Mesh(new THREE.BoxGeometry(2.6,3.6,.6),new THREE.MeshBasicMaterial({visible:false}));dh.position.set(0,1.8,.3);dh.userData={door:true};dg.add(dh);hits.push(dh);
  buildFolk();
  /* 介面：左上回作品小屋、中間標題、下方提示 */
  ui=document.createElement('div');ui.id='hallUI';
  ui.innerHTML='<button type="button" id="hallBack">← 回作品小屋</button><div class="ht">畫框背後<small>大師開講</small></div><div class="hh">左右滑動看看四周・點亮燈的藝術家走進展間</div><div class="hint" hidden>點我，進入展間</div><div class="hsay" hidden></div>';hintEl=ui.querySelector('.hint');sayEl=ui.querySelector('.hsay');
  const st=document.createElement('style');st.textContent=`
    body.inhall #hud,body.inhall #tags,body.inhall #say,body.inhall #sheet,body.inhall .say,body.inhall .pcTag{display:none!important}
    #hallUI{position:fixed;inset:0;z-index:50;touch-action:none;user-select:none;-webkit-user-select:none}
    #hallUI button{position:absolute;left:16px;top:calc(12px + env(safe-area-inset-top));font:500 14px var(--sans,system-ui);padding:9px 15px;border-radius:999px;border:1.5px solid #d6c7a9;background:rgba(251,247,239,.92);color:#2f3a34;cursor:pointer}
    #hallUI .ht{position:absolute;left:0;right:0;top:calc(14px + env(safe-area-inset-top));text-align:center;font:600 17px var(--serif,serif);letter-spacing:.2em;color:#4a3a2c;pointer-events:none}
    #hallUI .ht small{display:block;font:500 11px var(--sans,system-ui);letter-spacing:.3em;color:#6e5232;margin-top:2px}
    #hallUI .hh{position:absolute;left:16px;right:16px;bottom:calc(18px + env(safe-area-inset-bottom));text-align:center;font:14px var(--sans,system-ui);color:#4a3a2c;pointer-events:none;text-shadow:0 1px 6px rgba(255,250,240,.9)}
    #hallUI .hint{position:absolute;transform:translate(-50%,-100%);padding:7px 13px;border-radius:999px;background:rgba(251,247,239,.95);color:#4a3a2c;font:500 13.5px var(--sans,system-ui);box-shadow:0 4px 14px rgba(60,40,20,.18);pointer-events:none;white-space:nowrap;animation:hb 1.6s ease-in-out infinite}
    #hallUI .hint::after{content:'';position:absolute;left:50%;bottom:-6px;margin-left:-6px;border:6px solid transparent;border-top-color:rgba(251,247,239,.95);border-bottom:0}
    @keyframes hb{50%{margin-top:-5px}}
    #hallUI .hsay{position:absolute;transform:translate(-50%,-100%);max-width:72vw;padding:9px 15px;border-radius:16px;background:#fffaf0;color:#3a2c1c;font:500 15px var(--sans,system-ui);box-shadow:0 6px 18px rgba(40,25,10,.25);pointer-events:none;animation:sp .25s ease-out}
    #hallUI .hsay::after{content:'';position:absolute;left:50%;bottom:-7px;margin-left:-7px;border:7px solid transparent;border-top-color:#fffaf0;border-bottom:0}
    @keyframes sp{from{opacity:0;transform:translate(-50%,-80%) scale(.8)}}`;
  document.head.appendChild(st);
  ui.addEventListener('pointerdown',e=>{if(e.target.id==='hallBack')return;down={x:e.clientX,y:e.clientY,yaw,pitch,moved:false}});
  ui.addEventListener('pointermove',e=>{if(!down||(goal&&!goal.slow))return;if(goal)goal=null;const dx=e.clientX-down.x,dy=e.clientY-down.y;if(Math.hypot(dx,dy)>8)down.moved=true;
    yaw=down.yaw+dx*.005;pitch=Math.max(-.25,Math.min(.55,down.pitch+dy*.003))});
  ui.addEventListener('pointerup',e=>{const d=down;down=null;if(!d||d.moved)return;if(goal&&goal.slow)goal=null;else if(goal)return;tap(e)});   // 走進來的過場還沒停也可以直接點（不然點了沒反應）
  ui.querySelector('#hallBack').onclick=leave}

function tap(e){const v=new THREE.Vector2(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1),rc=new THREE.Raycaster();rc.setFromCamera(v,cam);
  const h=rc.intersectObjects(hits,false)[0];if(!h)return;const {A,open,door}=h.object.userData;
  if(door)return leave();
  if(open){try{localStorage.setItem('otto2-hall-hint','1')}catch(e){}}
  if(open&&ALIVE[A.n]){if(!alive)comeAlive(ALIVE[A.n]);return}
  if(!open){toast(A?`${A.n}的展間還在準備中，之後會開放`:'這個展間還在準備中，之後會開放');return}
  /* 走到藝術家前面再打開展間 */
  const w=new THREE.Vector3();h.object.getWorldPosition(w);const dir=w.clone().setY(0).normalize();
  goal={pos:dir.clone().multiplyScalar(R-3.6).setY(EYE),yaw:Math.atan2(-dir.x,-dir.z),pitch:.04,then:()=>openRoom(OPEN[A.n])}}

function openRoom(id){let o=document.getElementById('hallov');if(o)o.remove();
  o=document.createElement('div');o.id='hallov';o.style.cssText='position:fixed;inset:0;z-index:99999;background:#efe7d8';
  o.innerHTML='<iframe src="hall/index.html?v=20261101b&room='+id+'" style="width:100%;height:100%;border:0" allow="autoplay"></iframe>';document.body.appendChild(o)}

/* 從展間回來：退回大廳中間，雕像回到底座上 */
function back(){resetAlive();goal={pos:START.clone(),yaw,pitch:.06}}

/* 2026-10-31 大熊的點子：點雕像 → 雕像抖一抖、發光 → 變回彩色的藝術家 → 從底座跳下來 → 揮手打招呼 → 打開展間
   彩色那隻用 art.html 的 makeArtist（聖誕期間就是聖誕造型），第一次點才做 */
function comeAlive(o){const w=new THREE.Vector3();o.g.getWorldPosition(w);const d=w.setY(0).normalize();
  goal={pos:pos.clone(),yaw:Math.atan2(-d.x,-d.z),pitch:.03};   // 原地轉過去看著他
  if(!o.C){const n0=picks.length;o.C=makeArtist(o.A);picks.length=n0;o.C.scale.multiplyScalar(1.1);o.C.visible=false;o.g.add(o.C)}
  o.C.position.set(0,o.lift+.75,1.1);alive={o,t0:performance.now(),burst:null,opened:false}}
function burst(g,y){const N=46,P=new Float32Array(N*3),V=[];for(let i=0;i<N;i++){const a=Math.random()*6.28,e=Math.random()*1.2-.2,sp=1.2+Math.random()*1.6;V.push([Math.cos(a)*Math.cos(e)*sp,Math.sin(e)*sp+.8,Math.sin(a)*Math.cos(e)*sp]);P[i*3]=0;P[i*3+1]=y;P[i*3+2]=1.1}
  const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.BufferAttribute(P,3));
  const m=new THREE.Points(ge,new THREE.PointsMaterial({color:'#ffe6a3',size:.09,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));g.add(m);return {m,V,y}}
function aliveTick(now,dt){const a=alive,o=a.o,t=(now-a.t0)/1000,M=o.M,C=o.C,y0=o.lift+.75;
  if(t<.7){const k=t/.7;M.rotation.z=Math.sin(t*55)*.06*k;o.mc.emissive.setRGB(.75*k,.62*k,.35*k)}                     // 抖＋越來越亮
  else if(!a.burst){M.visible=false;M.rotation.z=0;o.mc.emissive.setRGB(0,0,0);C.visible=true;a.burst=burst(o.g,y0+.9)}  // 變彩色＋金色光點
  if(a.burst){const b=a.burst,p=b.m.geometry.attributes.position,bt=t-.7;for(let i=0;i<b.V.length;i++){p.setXYZ(i,b.V[i][0]*bt,b.y+b.V[i][1]*bt-1.6*bt*bt,1.1+b.V[i][2]*bt)}
    p.needsUpdate=true;b.m.material.opacity=Math.max(0,1-bt/1.1);if(bt>1.2&&b.m.parent){b.m.parent.remove(b.m);b.m.geometry.dispose()}}
  if(t>=.7&&t<1.45){const p=(t-.7)/.75;C.position.set(0,y0*(1-p)+Math.sin(p*Math.PI)*.9,1.1+.85*p);C.rotation.x=Math.sin(p*Math.PI)*-.25}   // 跳下來
  else if(t>=1.45&&t<1.7){C.position.set(0,0,1.95);C.rotation.x=0;const q=Math.sin((t-1.45)/.25*Math.PI);C.scale.y=C.scale.x*(1-.16*q)}      // 落地壓一下
  else if(t>=1.7){C.scale.y=C.scale.x;const arm=C.userData.armR;if(arm)arm.rotation.z=-2.4+Math.sin(t*11)*.35}                              // 揮手
  if(sayEl){if(t>=1.75&&!a.opened){const h=new THREE.Vector3(0,2.55,1.95);o.g.localToWorld(h);h.project(cam);
      sayEl.textContent=`嗨！我是${o.A.n}，帶你看看我的畫 🎨`;sayEl.style.left=(h.x+1)/2*innerWidth+'px';sayEl.style.top=(1-h.y)/2*innerHeight+'px';sayEl.hidden=false}else sayEl.hidden=true}
  if(t>=3.5&&!a.opened){a.opened=true;openRoom(OPEN[o.A.n])}}
function resetAlive(){if(!alive)return;const o=alive.o;if(alive.burst&&alive.burst.m.parent)alive.burst.m.parent.remove(alive.burst.m);
  o.M.visible=true;o.M.rotation.z=0;o.mc.emissive.setRGB(0,0,0);if(o.C){o.C.visible=false;o.C.rotation.x=0;o.C.scale.y=o.C.scale.x;const arm=o.C.userData.armR;if(arm)arm.rotation.z=0}
  if(sayEl)sayEl.hidden=true;alive=null}

function frame(now){const dt=Math.min(.05,(now-tPrev)/1000||0);tPrev=now;folkTick(now/1000,dt);
  if(document.getElementById('hallov')){if(now-lastRoom<1000)return;lastRoom=now}   // 展間蓋著時一秒只畫一次
  if(alive)aliveTick(now,dt);
  if(goal){const k=Math.min(1,dt*(goal.slow?1.3:3));pos.lerp(goal.pos,k);
    let dy=((goal.yaw-yaw+Math.PI*3)%(Math.PI*2))-Math.PI;yaw+=dy*k;pitch+=(goal.pitch-pitch)*k;
    if(pos.distanceTo(goal.pos)<(goal.slow?.12:.04)&&Math.abs(dy)<.01){const t=goal.then;goal=null;if(t)t()}}
  const w=renderer.domElement;if(cam.aspect!==w.clientWidth/w.clientHeight){cam.aspect=w.clientWidth/Math.max(1,w.clientHeight);cam.fov=cam.aspect<.8?74:62;cam.updateProjectionMatrix()}
  cam.position.copy(pos);cam.rotation.set(pitch,yaw,0,'YXZ');renderer.render(sc,cam);
  /* 「點我」提示：走到定點後才出現，點過一次就不再出現 */
  badges.forEach(b=>{b.position.y=b.userData.y0+Math.sin(now/600)*.06;b.visible=!alive});
  if(hintEl){let show=false;if(hintAt&&!goal&&!alive&&!GUIDE){let seen=false;try{seen=localStorage.getItem('otto2-hall-hint')==='1'}catch(e){}
      if(!seen){const v=hintAt.clone().project(cam);if(v.z<1&&Math.abs(v.x)<.9&&Math.abs(v.y)<.9){show=true;hintEl.style.left=(v.x+1)/2*innerWidth+'px';hintEl.style.top=(1-v.y)/2*innerHeight+'px'}}}
    hintEl.hidden=!show}}

/* intro：從大門內側慢慢走到定點（走進來的感覺） */
function enter(intro){if(!sc)build();act=true;yaw=0;pitch=.06;goal=null;tPrev=performance.now();
  if(intro){pos.set(0,EYE+.15,R-.6);pitch=.1;   // 先站在大門內側看整個大廳一下，再慢慢走到雕像前
    setTimeout(()=>{if(act&&!goal&&!alive)goal={pos:START.clone(),yaw:0,pitch:.06,slow:1}},1100)}else pos.copy(START);
  document.body.classList.add('inhall');document.body.appendChild(ui);try{closeSheet()}catch(e){}}
function exit(){resetAlive();act=false;goal=null;document.body.classList.remove('inhall');if(ui&&ui.parentNode)ui.remove();const o=document.getElementById('hallov');if(o)o.remove()}

/* 過場：整個畫面淡成米白再淡回來（進出殿堂都用） */
let fadeEl=null;
function fade(on){if(!fadeEl){fadeEl=document.createElement('div');fadeEl.style.cssText='position:fixed;inset:0;z-index:60;background:#f4eedf;opacity:0;pointer-events:none;transition:opacity .45s ease';document.body.appendChild(fadeEl)}
  fadeEl.style.pointerEvents=on?'auto':'none';fadeEl.style.opacity=on?1:0}
/* 作品小屋那邊鏡頭飛到大門口之後呼叫：淡出 → 換成大廳、從門口走進來 → 淡回來 */
function walkIn(){fade(true);setTimeout(()=>{enter(true);requestAnimationFrame(()=>fade(false))},480)}
/* 回作品小屋：淡出 → 換回島（art.html onHallExit 把鏡頭放在殿堂門口再慢慢拉遠）→ 淡回來 */
function leave(){fade(true);setTimeout(()=>{exit();try{window.onHallExit&&window.onHallExit()}catch(e){}requestAnimationFrame(()=>fade(false))},480)}
window.Hall3D={enter,exit,leave,walkIn,back,frame,get active(){return act}};
})();
