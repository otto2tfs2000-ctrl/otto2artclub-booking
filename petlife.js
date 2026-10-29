/* 吉祥物島的「小動物生活」（2026-10-05 大熊選的三個點子），park.html 和 art.html 共用：
   1. 親密度愛心：每隻每天餵一次 +1；集滿 5 顆解鎖牠的小卡。存在這台手機（localStorage otto2-petlove）
   2. 小熊每天翹家：照日期決定今天跑去「遊樂島」還是「作品小屋」，大家同一天都在同一個地方；找到了小熊愛心 +1
   3. 動物日記：老師上傳的照片＋一句話（伺服器 /pets/diary），有新的島上會冒「新日記」
   獎勵目前只有愛心和小卡，大熊之後想好真正的獎勵再加。 */
(function(){
var TZ=8*3600e3,KEY='otto2-petlove',CARD_AT=5;
var ANIMALS=[
  {id:'gabi',name:'嘎逼',role:'老大',img:'pets/gabi.webp'},
  {id:'kabu',name:'卡布',role:'最無害',img:'pets/kabu.webp'},
  {id:'moka',name:'摩卡',role:'長毛・躲貓貓',img:'pets/moka.webp'},
  {id:'xiong',name:'小熊',role:'倉鼠・翹家大王',img:'pets/xiong.webp'},
  {id:'frog',name:'蛙蛙叫',role:'角蛙・躲貓貓高手',img:'pets/frog.webp'}];
function today(){return new Date(Date.now()+TZ).toISOString().slice(0,10)}
function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}
function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
/* 小熊今天去哪：place 'park'（遊樂島：十月扭蛋廣場／走格子島）或 'art'（作品小屋）；spot 給各頁挑位置用 */
function trip(){var d=today(),h=hash('xiong-trip-'+d);return{day:d,place:(h%2)?'art':'park',spot:(h>>>4)%9973}}
function tripFound(){return load().trip===today()}
function tripPlaceName(){return trip().place==='art'?'作品小屋':'遊樂島'}
/* 愛心：why＝'feed'（餵食）或 'find'（找到翹家的小熊），每種每天一次。回傳 {added, n, card} */
function love(id,why){var s=load(),d=today(),k=id+':'+why;s.n=s.n||{};s.d=s.d||{};s.c=s.c||{};
  if(s.d[k]===d)return{added:false,n:s.n[id]||0,card:false};
  s.d[k]=d;s.n[id]=(s.n[id]||0)+1;var card=false;if(s.n[id]>=CARD_AT&&!s.c[id]){s.c[id]=d;card=true}
  if(why==='find'&&id==='xiong')s.trip=d;save(s);return{added:true,n:s.n[id],card:card}}
function hearts(id){return(load().n||{})[id]||0}
function cardDay(id){return(load().c||{})[id]||''}
function fedToday(id){return(load().d||{})[id+':feed']===today()}
function heartsHtml(id){var n=hearts(id),k=Math.min(CARD_AT,n),out='';for(var i=0;i<CARD_AT;i++)out+=i<k?'♥':'♡';return out+(n>CARD_AT?' '+n:'')}
/* 動物日記：看過的最新時間記在手機 */
function diarySeen(id){try{return+(localStorage.getItem('otto2-diary-'+id)||0)}catch(e){return 0}}
function diaryMark(id,ts){try{localStorage.setItem('otto2-diary-'+id,String(ts))}catch(e){}}
/* 翹家用的小熊（給作品小屋用；遊樂島直接用 park 自己的 makeXiong）：mat(color) 回傳材質 */
function makeXiong(THREE,mat){var g=new THREE.Group(),P=new THREE.Group();g.add(P);
  function m(geo,c,x,y,z){var o=new THREE.Mesh(geo,mat(c));o.position.set(x||0,y||0,z||0);o.castShadow=true;return o}
  function S(r,a,b){return new THREE.SphereGeometry(r,a||16,b||12)}
  var fur='#a9835f',lt='#dcc6aa';
  var body=m(S(.5),fur,0,.42,-.05);body.scale.set(1,.85,1.08);P.add(body);
  var skirt=m(S(.52,18,10),lt,0,.3,-.12);skirt.scale.set(1.12,.55,1.15);P.add(skirt);
  var bel=m(S(.3,12,9),'#f1e6d6',0,.32,.28);bel.scale.set(1,.8,.6);P.add(bel);
  var head=new THREE.Group();head.position.set(0,.55,.36);P.add(head);
  var hd=m(S(.36),fur);hd.scale.set(1,.92,.95);head.add(hd);
  head.add(m(S(.16,12,9),'#ecdcc6',0,-.1,.27));
  [-1,1].forEach(function(d){head.add(m(S(.17,12,9),lt,d*.2,-.08,.14));head.add(m(S(.065,10,8),'#120e0c',d*.17,.07,.28));
    var e=m(S(.11,10,8),'#5e4535',d*.22,.27,-.04);e.scale.set(1,1,.35);head.add(e)});
  head.add(m(S(.05,8,6),'#eaa0a0',0,-.02,.42));
  g.userData={P:P,head:head};return g}

/* ===== 小屋認養天竺鼠（2026-10-05）：蓋到 3 樓（8 件作品）可以認養一隻；品種只選一次，花色、名字可以改 =====
   造型跟遊樂島的嘎逼／卡布／摩卡同一套（petHead／makePet），預覽圖在 Desktop/Otto2/預覽圖/認養天竺鼠_*.jpg */
var GP_FLOOR=3,GP_WORKS=8;
var GP_BREEDS=[{id:'american',n:'短毛'},{id:'crested',n:'冠毛'},{id:'abyssinian',n:'旋毛'},{id:'teddy',n:'泰迪'},{id:'peruvian',n:'長毛'},{id:'texel',n:'捲毛'},{id:'sheltie',n:'雪莉'},{id:'skinny',n:'無毛'}];
var GP_COLORS=[{id:'cream',n:'奶油黃',m:'#f0d9a8',l:'#fbf1dc'},{id:'caramel',n:'焦糖',m:'#c98a4e',l:'#e3b07c'},{id:'choco',n:'巧克力',m:'#6b4a33',l:'#8e6a4f'},{id:'grey',n:'灰色',m:'#9a9288',l:'#c4beb5'},
  {id:'bw',n:'黑白',m:'#f7f4ee',l:'#ffffff',d:'#2a2420'},{id:'tri',n:'三色',m:'#e29a38',l:'#fbf5ea',d:'#2a2420'},{id:'white',n:'白色',m:'#f7f4ee',l:'#ffffff'},{id:'gold',n:'金棕',m:'#b98035',l:'#dcae6b'}];
function gpFind(L,id){for(var i=0;i<L.length;i++)if(L[i].id===id)return L[i];return L[0]}
/* 品種＋花色 → 造型參數 */
function gpParams(breed,color){var c=gpFind(GP_COLORS,color),m=c.m,l=c.l,d=c.d,b=gpFind(GP_BREEDS,breed).id;
  var p={body:m,face:m,chin:l,ear:'#e8a28c'};
  var pat=c.id==='tri'?[[l,0,1,.3,1.1],[d,0,.8,-.6,1.15],[d,.9,.4,-.2,.8]]:c.id==='bw'?[[d,0,.8,-.6,1.2]]:[];
  if(c.id==='bw')p.face=d;
  if(b==='american'){p.bib=l;p.patches=pat}
  else if(b==='crested'){p.crest=c.id==='white'?'#fffdf6':'#ffffff';p.patches=pat}
  else if(b==='abyssinian'){p.body=l;p.face=l;p.top=m;p.capLen=1.2;p.tufts=d?[m,l,d,m]:[m,l,m,l];p.patches=pat}
  else if(b==='teddy'){p.fuzz=d?[m,d,m]:[m,l,m];p.patches=[[l,0,.6,-.9,1.1]]}
  else if(b==='peruvian'){p.long=2;p.hair=d||m;p.hair2=l;p.backc=m;p.fringe=true}
  else if(b==='texel'){p.curly=d?[m,d,l]:[m,l,m]}
  else if(b==='sheltie'){p.top=d||l;p.capLen=.8;p.long=1;p.hair=m;p.hair2=l;p.backc=m}
  else if(b==='skinny'){p.body='#f2c4b8';p.face='#f2c4b8';p.chin='#f6d5cc';p.ear='#e6a596';p.wrinkle='#e2aa9c';p.patches=[[d||m,.6,.7,-.3,.9]]}
  return p}
/* 做出 3D 天竺鼠：mat(color) 回傳材質；回傳 Group（userData.head 給動畫用） */
function makeGP(THREE,mat,breed,color){var p=gpParams(breed,color);
  function S(r,a,b){return new THREE.SphereGeometry(r,a||18,b||12)}
  function M(geo,c,x,y,z){var o=new THREE.Mesh(geo,mat(c));o.position.set(x||0,y||0,z||0);o.castShadow=true;return o}
  var g=new THREE.Group(),C=new THREE.Vector3(0,.42,-.05),RR=new THREE.Vector3(.44,.39,.6),up=new THREE.Vector3(0,1,0);
  var body=M(S(.5,22,16),p.body,0,.42,-.05);body.scale.set(.88,.78,1.2);g.add(body);
  function on(x,y,z,k){var dv=new THREE.Vector3(x,y,z).normalize();return{d:dv,pos:C.clone().add(new THREE.Vector3(dv.x*RR.x,dv.y*RR.y,dv.z*RR.z).multiplyScalar(k||.93))}}
  (p.patches||[]).forEach(function(a){var o=on(a[1],a[2],a[3],.9),q=M(S(.26*(a[4]||1),14,10),a[0]);q.position.copy(o.pos);q.scale.set(1,.7,1);q.quaternion.setFromUnitVectors(up,o.d);g.add(q)});
  if(p.tufts)[[0,.95,.25],[.55,.75,0],[-.55,.75,0],[.35,.8,-.45],[-.35,.8,-.45],[0,.85,-.7],[.7,.45,-.4],[-.7,.45,-.4],[0,.6,-.95],[.6,.6,.35],[-.6,.6,.35]].forEach(function(a,i){
    var o=on(a[0],a[1],a[2]),t=M(new THREE.ConeGeometry(.12,.26,6),p.tufts[i%p.tufts.length]);t.position.copy(o.pos);t.quaternion.setFromUnitVectors(up,o.d);g.add(t)});
  if(p.fuzz)for(var i=0;i<60;i++){var u=(i*0.6180339)%1*2-1,a=i*2.399,r=Math.sqrt(1-u*u),o=on(Math.cos(a)*r,Math.abs(u)*.9+.1,Math.sin(a)*r,.98),f=M(S(.075,8,6),p.fuzz[i%p.fuzz.length]);f.position.copy(o.pos);g.add(f)}
  if(p.long){var L2=p.long>1,sk=M(S(.5,20,10),p.hair,0,L2?.2:.24,-.12);sk.scale.set(L2?1.4:1.25,L2?.44:.46,L2?1.75:1.5);g.add(sk);
    var back=M(new THREE.SphereGeometry(.52,20,10,0,Math.PI*2,0,1.25),p.backc||p.hair,0,.42,-.08);back.scale.set(.92,.82,1.25);g.add(back);
    var tail=M(S(.3,12,10),p.hair,0,.32,L2?-.95:-.78);tail.scale.set(1,.7,L2?1.2:.8);g.add(tail);
    [-1,1].forEach(function(dd){[.15,-.18,-.5,-.8].forEach(function(z,j){var h=M(S(.2,10,8),j%2?p.hair:(p.hair2||p.hair),dd*(L2?.5:.42),.24,z);h.scale.set(.55,.8,.9);h.rotation.z=dd*.25;g.add(h)})})}
  if(p.curly){for(var row=0;row<4;row++)for(var k=0;k<14;k++){var aa=k/14*Math.PI*2+row*.3,rr=.6-row*.09,cu=M(S(.1,10,8),p.curly[(k+row)%p.curly.length],Math.cos(aa)*rr*.95,.16+row*.17,Math.sin(aa)*rr*1.25-.12);cu.scale.set(.8,1.25,.8);g.add(cu)}
    for(var k2=0;k2<26;k2++){var a2=k2*2.399,u2=(k2*.37)%1,o2=on(Math.cos(a2)*.6,.6+u2*.4,Math.sin(a2)*.8-.2,1),c2=M(S(.1,10,8),p.curly[k2%p.curly.length]);c2.position.copy(o2.pos);g.add(c2)}}
  if(p.bib){var bb=M(S(.27,14,10),p.bib,0,.34,.4);bb.scale.set(1,.85,.5);g.add(bb)}
  if(p.wrinkle)[-.2,.05,.3].forEach(function(z){var w=M(new THREE.TorusGeometry(.43,.018,6,24,Math.PI),p.wrinkle,0,.43,z-.1);w.rotation.y=Math.PI/2;w.scale.set(1,.9,.85);g.add(w)});
  /* 頭 */
  var hk=1.04,H=new THREE.Group();H.position.set(0,.5,.52);g.add(H);
  var hd=M(S(.36*hk,22,16),p.face);hd.scale.set(1,.95,1.06);H.add(hd);
  if(p.top){var cap=M(new THREE.SphereGeometry(.366*hk,22,12,0,Math.PI*2,0,p.capLen||1.12),p.top);cap.scale.copy(hd.scale);H.add(cap)}
  if(p.crest){/* 冠毛：額頭上一大朵白色旋毛（大熊：要大一點，這是特色） */var cr=new THREE.Group();cr.position.set(0,.3,.16);cr.rotation.x=.42;H.add(cr);
    cr.add(M(S(.12,12,9),p.crest,0,.06,0));
    for(var q1=0;q1<12;q1++){var a3=q1/12*Math.PI*2,pe=M(S(.1,10,8),q1%2?p.crest:'#f3efe6',Math.cos(a3)*.17,.03,Math.sin(a3)*.17);pe.scale.set(1.25,.45,.7);pe.rotation.y=-a3;pe.rotation.z=.35;cr.add(pe)}
    for(var q2=0;q2<7;q2++){var a4=q2/7*Math.PI*2+.3,pe2=M(S(.08,10,8),p.crest,Math.cos(a4)*.09,.1,Math.sin(a4)*.09);pe2.scale.set(1.1,.5,.7);pe2.rotation.y=-a4;pe2.rotation.z=.6;cr.add(pe2)}}
  [-1,1].forEach(function(dd){H.add(M(S(.062,12,10),'#16110f',dd*.18,.045,.33));var hl=new THREE.Mesh(S(.022,8,6),new THREE.MeshBasicMaterial({color:0xffffff}));hl.position.set(dd*.18+.02,.078,.385);H.add(hl)});
  [-1,1].forEach(function(dd){var ch=M(S(.1,12,9),p.chin,dd*.075,-.15,.33);ch.scale.set(1,.8,.9);H.add(ch)});
  H.add(M(S(.048,10,8),'#e59a98',0,-.1,.4));
  [-1,1].forEach(function(dd){var e=M(S(.12*hk,12,10),p.ear,dd*.28,.2,-.03);e.scale.set(1,.85,.4);e.rotation.z=dd*-.7;e.rotation.y=dd*.5;H.add(e)});
  if(p.fringe)[-.12,0,.12].forEach(function(x,j){var f=M(S(.13,10,8),j===1?p.hair2:p.hair,x,.18,.22);f.scale.set(.8,1.3,.6);f.rotation.x=.5;H.add(f)});
  [[-.2,.34],[.2,.34],[-.24,-.34],[.24,-.34]].forEach(function(a){var f=M(S(.085,10,8),'#eab3a6',a[0],.07,a[1]);f.scale.set(1,.6,1.35);g.add(f)});
  g.userData={head:H,body:body};return g}
/* ===== 小屋認養青蛙（2026-10-05）：跟天竺鼠一樣蓋到 3 樓才能認養；種類只選一次，顏色、名字可以改 =====
   種類決定身形（樹蛙坐得比較挺、有吸盤；角蛙扁扁大嘴有小角…），顏色是八種調色盤，花紋跟著種類走 */
var FR_SPECIES=[{id:'horned',n:'角蛙',c:'gold'},{id:'tomato',n:'番茄蛙',c:'tomato'},{id:'redeye',n:'紅眼樹蛙',c:'green'},{id:'dart',n:'箭毒蛙',c:'sky'},
  {id:'whites',n:'老爺樹蛙',c:'mint'},{id:'painted',n:'亞洲錦蛙',c:'caramel'},{id:'moltrecht',n:'莫氏樹蛙',c:'green'},{id:'milk',n:'牛奶蛙',c:'snow'}];
var FR_COLORS=[{id:'green',n:'翠綠',m:'#7cc35a',l:'#eef5cf',a:'#3f7f35'},{id:'gold',n:'黃金',m:'#f3d43a',l:'#f6e5d8',a:'#ee8a4c'},{id:'strawberry',n:'草莓粉',m:'#f29ab0',l:'#fde6ec',a:'#d9546f'},
  {id:'snow',n:'雪白',m:'#f4f1e8',l:'#ffffff',a:'#5a4a3e'},{id:'sky',n:'天空藍',m:'#4fa3e8',l:'#dff0fc',a:'#1d2f55'},{id:'caramel',n:'焦糖',m:'#c98a4e',l:'#f1dcc0',a:'#5a3a24'},
  {id:'grape',n:'紫葡萄',m:'#9a74c9',l:'#efe6f8',a:'#3f2a66'},{id:'tomato',n:'番茄紅',m:'#e8583a',l:'#fbd9c8',a:'#a8321f'},{id:'mint',n:'薄荷',m:'#8fd6c0',l:'#eefaf5',a:'#3f8f7a'}];
function frParams(sp){var b=gpFind(FR_SPECIES,sp).id;
  var P={bw:1.15,bh:.66,bd:1.05,eye:.15,ex:.25,ez:.2,iris:null,pupil:'#1a0e0a',tilt:0,pads:false,leg:1,pat:null,horn:false,brow:false,mouth:.52,head:0};
  if(b==='horned'){P.horn=true;P.pat='spots'}
  else if(b==='tomato'){P.bw=1.05;P.bh=.92;P.bd=1.0;P.eye=.11;P.ex=.2;P.ez=.32;P.mouth=.38;P.leg=.7}
  else if(b==='redeye'){P.bw=.8;P.bh=.62;P.bd=1.0;P.eye=.17;P.ex=.27;P.ez=.38;P.iris='#e8322a';P.tilt=.32;P.pads=true;P.leg=1.15;P.pat='sides';P.mouth=.36}
  else if(b==='dart'){P.bw=.78;P.bh=.6;P.bd=.95;P.eye=.12;P.ex=.22;P.ez=.36;P.tilt=.2;P.pat='net';P.mouth=.34;P.leg=.9}
  else if(b==='whites'){P.bw=1.1;P.bh=.8;P.bd=1.0;P.eye=.13;P.ex=.27;P.ez=.33;P.iris='#e6c45a';P.tilt=.18;P.pads=true;P.brow=true;P.mouth=.44}
  else if(b==='painted'){P.bw=1.08;P.bh=.84;P.bd=1.08;P.eye=.1;P.ex=.17;P.ez=.42;P.pat='stripe';P.mouth=.3;P.leg=.75}
  else if(b==='moltrecht'){P.bw=.82;P.bh=.62;P.bd=1.0;P.eye=.14;P.ex=.25;P.ez=.38;P.iris='#e8b04a';P.tilt=.28;P.pads=true;P.pat='thigh';P.mouth=.36}
  else if(b==='milk'){P.bw=.92;P.bh=.68;P.bd=1.0;P.eye=.16;P.ex=.26;P.ez=.36;P.iris='#3a2a20';P.tilt=.26;P.pads=true;P.pat='bands';P.mouth=.4}
  return P}
/* 做出 3D 青蛙：大小跟蛙蛙叫（park makeFrog）差不多。userData.eyes 給眨眼、P 給跳 */
function makeFrogPet(THREE,mat,sp,color){var P=frParams(sp),C=gpFind(FR_COLORS,color||gpFind(FR_SPECIES,sp).c);
  function S(r,a,b){return new THREE.SphereGeometry(r,a||18,b||12)}
  function M(geo,c,x,y,z){var o=new THREE.Mesh(geo,mat(c));o.position.set(x||0,y||0,z||0);o.castShadow=true;return o}
  var g=new THREE.Group(),Q=new THREE.Group(),B=new THREE.Group();g.add(Q);Q.add(B);
  var R=.55,by=.2+R*P.bh;B.position.y=by;B.rotation.x=-P.tilt;
  var sx=R*P.bw,sy=R*P.bh,sz=R*P.bd;
  function top(x,z){return sy*Math.sqrt(Math.max(0,1-(x/sx)*(x/sx)-(z/sz)*(z/sz)))}
  var body=M(S(R,24,16),C.m);body.scale.set(P.bw,P.bh,P.bd);B.add(body);
  var bel=M(S(R*.92,18,10),C.l,0,-sy*.38,.06);bel.scale.set(P.bw,P.bh*.6,P.bd*.95);B.add(bel);
  var mx=Math.min(P.mouth,sx*.97),mo=M(new THREE.TorusGeometry(mx,.028,6,30,Math.PI),'#8a5040',0,-sy*.12,0);mo.rotation.x=Math.PI/2;mo.scale.set(1,sz*.985/mx,1);B.add(mo); /* 大嘴巴線：貼著身體前緣 */
  /* 花紋 */
  function dot(x,z,r,c,fl){var d=M(S(r,10,6),c,x,top(x,z)-r*.35,z);d.scale.set(1.15,fl||.4,1.15);B.add(d)}
  if(P.pat==='spots')[[-.18,-.05],[.2,-.12],[0,.08],[-.38,.08],[.4,.06],[-.1,-.32],[.25,-.35],[.45,-.2],[-.42,-.18]].forEach(function(a,i){dot(a[0]*P.bw,a[1]*P.bd,.075+(i%3)*.02,C.a)});
  if(P.pat==='net')[[-.15,0],[.17,-.1],[0,-.3],[-.28,-.25],[.3,-.33],[.08,.14],[-.25,.16],[.28,.12],[0,-.05]].forEach(function(a,i){dot(a[0],a[1],.07+(i%2)*.03,C.a)});
  if(P.pat==='stripe'){[-1,1].forEach(function(d){for(var k=0;k<7;k++){var z=.32-k*.12;dot(d*.2*P.bw,z*P.bd,.085,C.a,.35)}})}
  if(P.pat==='bands')[.1,-.12,-.34].forEach(function(z){for(var k=-3;k<=3;k++)dot(k*.075*P.bw*1.3,z*P.bd,.07,C.a,.3)});
  if(P.pat==='sides')[-1,1].forEach(function(d){var s1=M(S(.2,12,8),C.a==='#3f7f35'?'#3b6fc4':C.a,d*sx*.92,-sy*.05,-.02);s1.scale.set(.25,.55,1.3);B.add(s1);var s2=M(S(.08,8,6),'#f2f2e8',d*sx*.95,-sy*.05,.12);s2.scale.set(.4,.5,.4);B.add(s2)});
  /* 眼睛：鼓在頭頂兩側 */
  var eyes=[-1,1].map(function(d){var e=new THREE.Group(),x=d*P.ex*P.bw,z=P.ez*P.bd;e.position.set(x,top(x,z)-P.eye*.25,z);
    e.add(M(S(P.eye,14,10),C.m));var ir=M(S(P.eye*.72,12,9),P.iris||'#f6e47a',d*P.eye*.28,P.eye*.22,P.eye*.5);e.add(ir);
    e.add(M(S(P.eye*.36,8,6),P.pupil,d*P.eye*.36,P.eye*.3,P.eye*1.02));
    var hl=new THREE.Mesh(S(P.eye*.14,6,5),new THREE.MeshBasicMaterial({color:0xffffff}));hl.position.set(d*P.eye*.2,P.eye*.55,P.eye*1.0);e.add(hl);
    if(P.horn){var h=M(new THREE.ConeGeometry(P.eye*.4,P.eye*.95,6),C.m,0,P.eye*1.0,-P.eye*.3);h.rotation.x=-.3;e.add(h)}
    if(P.brow){var bw=M(S(P.eye*1.05,12,8),C.m,0,P.eye*.55,-P.eye*.15);bw.scale.set(1.15,.45,1.05);e.add(bw)}
    B.add(e);return e});
  /* 腳：前腳小、後腳折起來；樹蛙腳趾有圓圓的吸盤 */
  var L=P.leg,fy=.08;
  [-1,1].forEach(function(d){
    var fl=M(S(.1*L,10,8),C.m,d*sx*.72,fy+.04,sz*.55);fl.scale.set(.8,.7,1.2);Q.add(fl);
    if(P.pads){var arm=M(new THREE.CylinderGeometry(.055,.07,.34,8),C.m,d*sx*.6,.2,sz*.62);arm.rotation.z=d*.25;arm.rotation.x=-.2;Q.add(arm)} /* 樹蛙坐得挺，看得到前腳撐著 */
    var bl=M(S(.18*L,12,9),C.m,d*sx*.95,.16*L,-sz*.35);bl.scale.set(.75,.7,1.45);Q.add(bl);
    var ft=M(S(.09*L,8,6),C.m,d*sx*.85,fy,-sz*.05);ft.scale.set(1.2,.5,1.8);Q.add(ft);
    if(P.pat==='thigh'){var th=M(S(.1*L,8,6),'#f08a3a',d*sx*1.02,.12*L,-sz*.48);th.scale.set(.5,.6,1.1);Q.add(th)}
    if(P.pads)[[sx*.72,sz*.7],[sx*.95,.05]].forEach(function(a,j){for(var k=-1;k<=1;k++){var t=M(S(.035,6,5),C.l,d*a[0]+k*.06*d,.03,a[1]+(j?-.0:.08)+Math.abs(k)*-.03);Q.add(t)}})});
  g.userData={P:Q,body:B,eyes:eyes,frog:true};return g}
/* ===== 聖誕衣櫥（2026-10-29 大熊：用走格子的聖誕禮物幫小熊和天竺鼠換裝）=====
   OUTFITS 價格以伺服器為準（XMAS_DEFAULT.outfits），這裡只放名字和部位給畫面用。
   dress(THREE,mat,g,wear,kind)：kind 'bear'（遊樂島小黑熊）或 'gp'（天竺鼠，用 makeGP 的 userData.head）；重複呼叫會先拿掉舊的 */
var OUTFITS=[{id:'santa',slot:'head',nm:'聖誕帽'},{id:'antler',slot:'head',nm:'麋鹿角'},{id:'elf',slot:'head',nm:'精靈帽'},
  {id:'scarfR',slot:'neck',nm:'紅條紋圍巾'},{id:'bell',slot:'neck',nm:'鈴鐺項圈'},{id:'sweater',slot:'body',nm:'聖誕毛衣'},
  /* 2026-10-29 大熊：衣櫥東西太少 → 加作品小屋島民藝術家的招牌裝扮；新部位 face（臉上） */
  {id:'beret',slot:'head',nm:'林布蘭貝雷帽'},{id:'straw',slot:'head',nm:'梵谷草帽'},{id:'bowler',slot:'head',nm:'馬格利特禮帽'},{id:'flower',slot:'head',nm:'卡蘿花冠'},
  {id:'mustache',slot:'face',nm:'達利翹鬍子'},{id:'bowtie',slot:'neck',nm:'草間點點蝴蝶結'},{id:'marin',slot:'body',nm:'畢卡索條紋衫'},{id:'klimt',slot:'body',nm:'克林姆金色衣'}];
var _dt={};
function dTex(k){if(_dt[k])return _dt[k];var c=document.createElement('canvas');c.width=c.height=128;var x=c.getContext('2d');
  if(k==='stripe'){x.fillStyle='#d63a2f';x.fillRect(0,0,128,128);x.fillStyle='#fff6ea';for(var i=0;i<128;i+=32)x.fillRect(i,0,14,128)}
  else if(k==='marin'){x.fillStyle='#fbf6ec';x.fillRect(0,0,128,128);x.fillStyle='#1f3a72';for(var m2=4;m2<128;m2+=16)x.fillRect(0,m2,128,7)}
  else if(k==='dots'){x.fillStyle='#d8282b';x.fillRect(0,0,128,128);x.fillStyle='#fff8ee';for(var a=0;a<4;a++)for(var b2=0;b2<4;b2++){x.beginPath();x.arc(a*32+(b2%2)*16+8,b2*32+16,7,0,7);x.fill()}}
  else if(k==='klimt'){x.fillStyle='#d9a52c';x.fillRect(0,0,128,128);var cs=['#f4d36b','#7a4a1a','#2f6a8a','#b8322c','#fff1c2'];
    for(var q=0;q<70;q++){var px=(q*47)%120,py=(q*29+Math.floor(q/9)*13)%120;x.fillStyle=cs[q%5];if(q%3){x.fillRect(px,py,10,10)}else{x.beginPath();x.arc(px+6,py+6,6,0,7);x.fill();x.strokeStyle='#7a4a1a';x.lineWidth=2;x.beginPath();x.arc(px+6,py+6,3,0,7);x.stroke()}}}
  else{x.fillStyle='#c8362c';x.fillRect(0,0,128,128);x.fillStyle='#fff6ea';x.fillRect(0,54,128,20);x.fillStyle='#2f7a46';for(var j=0;j<128;j+=16){x.beginPath();x.moveTo(j,58);x.lineTo(j+8,70);x.lineTo(j+16,58);x.closePath();x.fill()}
    x.fillStyle='#fff6ea';for(var k2=0;k2<10;k2++){x.beginPath();x.arc((k2*37)%128,(k2*53)%40+6,3,0,7);x.fill();x.beginPath();x.arc((k2*29)%128,(k2*41)%40+84,3,0,7);x.fill()}}
  var t=new window.THREE.CanvasTexture(c);t.wrapS=t.wrapT=window.THREE.RepeatWrapping;return _dt[k]=t}
function dress(THREE,mat,g,wear,kind){wear=wear||{};
  (g.userData.dress||[]).forEach(function(o){if(o.parent)o.parent.remove(o)});var out=[];g.userData.dress=out;
  var gp=kind==='gp',R=gp?.37:.27;
  function M(geo,c,x,y,z){var o=new THREE.Mesh(geo,typeof c==='string'?mat(c):c);o.position.set(x||0,y||0,z||0);o.castShadow=true;return o}
  function tm(k){var m=mat('#ffffff').clone();m.map=dTex(k);return m}
  var head=gp?g.userData.head:null;if(!head){head=new THREE.Group();head.position.set(0,.84,.02);g.add(head);out.push(head)}
  function H(o){head.add(o);if(gp)out.push(o);return o}   /* 小熊的頭是另外加的一個 group（整個會被拿掉）；天竺鼠的頭是本體的，要一個一個記 */
  if(wear.head==='santa'){var sh=new THREE.Group();var cone=M(new THREE.ConeGeometry(R*.78,R*1.55,16),'#d63a2f',R*.12,R*.62,0);cone.rotation.z=-.35;sh.add(cone);
    var br=M(new THREE.TorusGeometry(R*.74,R*.2,8,20),'#ffffff');br.rotation.x=Math.PI/2;sh.add(br);sh.add(M(new THREE.SphereGeometry(R*.24,10,8),'#ffffff',R*.62,R*1.3,0));
    sh.position.set(0,R*.82,-R*.08);sh.rotation.x=-.18;H(sh)}
  if(wear.head==='antler'){[-1,1].forEach(function(d){var a=new THREE.Group(),c='#8a5a36';var m1=M(new THREE.CylinderGeometry(R*.07,R*.1,R*1.0,8),c,0,R*.5,0);a.add(m1);
      var b1=M(new THREE.CylinderGeometry(R*.06,R*.07,R*.5,8),c,d*R*.18,R*.62,0);b1.rotation.z=-d*.9;a.add(b1);var b2=M(new THREE.CylinderGeometry(R*.05,R*.06,R*.4,8),c,-d*R*.12,R*.85,0);b2.rotation.z=d*.8;a.add(b2);
      a.add(M(new THREE.SphereGeometry(R*.08,8,6),c,0,R*1.0,0));a.position.set(d*R*.5,R*.62,-R*.05);a.rotation.z=-d*.35;H(a)});
    H(M(new THREE.SphereGeometry(R*.16,10,8),'#d3231b',0,gp?-R*.25:-R*.2,gp?R*1.05:R*1.15))} /* 魯道夫紅鼻子 */
  if(wear.head==='elf'){var e=new THREE.Group();var cn=M(new THREE.ConeGeometry(R*.72,R*2.0,16),'#2f8f58',0,R*.95,0);e.add(cn);
    var eb=M(new THREE.TorusGeometry(R*.7,R*.17,8,20),'#d63a2f');eb.rotation.x=Math.PI/2;e.add(eb);e.add(M(new THREE.SphereGeometry(R*.2,10,8),'#f2c14e',0,R*1.95,0));
    e.position.set(0,R*.8,-R*.1);e.rotation.x=-.55;H(e)}
  if(wear.head==='beret'){var bt=M(new THREE.SphereGeometry(R*.82,20,12),'#8a2f3c',R*.12,R*.78,-R*.05);bt.scale.set(1,.34,1);bt.rotation.z=-.22;H(bt);
    H(M(new THREE.CylinderGeometry(R*.05,R*.07,R*.18,8),'#8a2f3c',R*.05,R*1.08,-R*.05))}
  if(wear.head==='straw'){var sw0=new THREE.Group();sw0.add(M(new THREE.CylinderGeometry(R*1.25,R*1.3,R*.06,28),'#e6c46a'));
    sw0.add(M(new THREE.CylinderGeometry(R*.58,R*.66,R*.5,20),'#e6c46a',0,R*.25,0));var sb=M(new THREE.CylinderGeometry(R*.665,R*.665,R*.13,20),'#3d5fa8',0,R*.07,0);sw0.add(sb);
    sw0.position.set(0,R*.82,-R*.05);sw0.rotation.x=-.12;H(sw0)}
  if(wear.head==='bowler'){var bw0=new THREE.Group();var bc=M(new THREE.SphereGeometry(R*.6,20,12,0,Math.PI*2,0,Math.PI/2),'#1e1d22');bc.scale.y=1.15;bw0.add(bc);
    bw0.add(M(new THREE.CylinderGeometry(R*.9,R*.9,R*.06,28),'#1e1d22'));bw0.add(M(new THREE.CylinderGeometry(R*.61,R*.61,R*.1,20),'#5a2a2a',0,R*.06,0));
    bw0.position.set(0,R*.84,-R*.05);bw0.rotation.x=-.1;H(bw0)}
  if(wear.head==='flower'){var fc=new THREE.Group();var vine=M(new THREE.TorusGeometry(R*.7,R*.07,8,26),'#3f7d3a');vine.rotation.x=Math.PI/2;fc.add(vine);
    ['#e2463a','#f2c14e','#e86fa0','#ff8a3d','#e2463a','#b04fc4','#f2c14e'].forEach(function(c,i){var a=-Math.PI/2+(i-3)*.42,f=M(new THREE.SphereGeometry(R*(i===3?.24:.18),10,8),c,Math.cos(a)*R*.7,R*.06,-Math.sin(a)*R*.7);f.scale.y=.7;fc.add(f);
      fc.add(M(new THREE.SphereGeometry(R*.07,6,5),'#fff3c4',Math.cos(a)*R*.7,R*.17,-Math.sin(a)*R*.7))});
    fc.position.set(0,R*.78,-R*.02);fc.rotation.x=-.2;H(fc)}
  /* 臉上：達利翹鬍子（鼻子下面，兩邊往上捲） */
  if(wear.face==='mustache'){var mu=new THREE.Group();[-1,1].forEach(function(d){var a1=M(new THREE.CylinderGeometry(R*.025,R*.06,R*.4,8),'#1b1714',d*R*.19,R*.04,0);a1.rotation.z=d*(Math.PI/2-.3);mu.add(a1);
      var cu=M(new THREE.TorusGeometry(R*.075,R*.024,6,14,Math.PI*1.3),'#1b1714',d*R*.42,R*.15,0);cu.rotation.z=d>0?-.9:Math.PI-.4;cu.scale.x=d;mu.add(cu)});
    mu.position.set(0,gp?-R*.44:-R*.4,gp?R*1.15:R*1.26);H(mu)}
  /* 脖子 */
  var nk=new THREE.Group();if(gp){nk.position.set(0,.34,.3);nk.rotation.x=-.3}else nk.position.set(0,.63,.02);g.add(nk);out.push(nk);var NR=gp?.42:.2; /* 天竺鼠頭很大會擋住，圍巾放低、放寬一點 */
  if(wear.neck==='scarfR'){var sc=M(new THREE.TorusGeometry(NR,NR*.3,10,24),tm('stripe'));sc.rotation.x=Math.PI/2;nk.add(sc);
    var tl=M(new THREE.BoxGeometry(NR*.45,NR*1.1,NR*.18),tm('stripe'),NR*.55,-NR*.45,NR*.85);tl.rotation.z=-.3;nk.add(tl)}
  if(wear.neck==='bell'){var cl=M(new THREE.TorusGeometry(NR*.98,NR*.12,8,24),'#c8362c');cl.rotation.x=Math.PI/2;nk.add(cl);
    var bl=M(new THREE.SphereGeometry(NR*.32,12,10),'#f2c14e',0,-NR*.22,NR*1.05);nk.add(bl);nk.add(M(new THREE.BoxGeometry(NR*.35,NR*.06,NR*.06),'#6a4a1a',0,-NR*.3,NR*1.33))}
  if(wear.neck==='bowtie'){var bo=new THREE.Group();[-1,1].forEach(function(d){var w2=M(new THREE.ConeGeometry(NR*.32,NR*.6,4),tm('dots'),d*NR*.28,0,0);w2.rotation.z=d*Math.PI/2;bo.add(w2)});
    bo.add(M(new THREE.SphereGeometry(NR*.13,10,8),tm('dots')));if(gp){bo.scale.setScalar(1.05);bo.position.set(0,.2,.86);g.add(bo);out.push(bo)}else{bo.position.set(0,-NR*.12,NR*1.0);nk.add(bo)}} /* 天竺鼠沒有脖子：蝴蝶結放在下巴前面 */
  /* 身體：聖誕毛衣、畢卡索條紋衫、克林姆金色衣（同一個殼，換花紋） */
  ['sweater','marin','klimt'].forEach(function(k){if(wear.body!==k||k==='sweater')return;var sh2=M(new THREE.SphereGeometry(gp?.5:.32,24,16),tm(k),0,gp?.43:.36,gp?-.05:0);
    if(gp)sh2.scale.set(.93,.83,1.24);else sh2.scale.set(1.06,1.1,.97);g.add(sh2);out.push(sh2)});
  /* 身體：聖誕毛衣 */
  if(wear.body==='sweater'){var sw=M(new THREE.SphereGeometry(gp?.5:.32,24,16),tm('sweater'),0,gp?.43:.36,gp?-.05:0);
    if(gp)sw.scale.set(.93,.83,1.24);else sw.scale.set(1.06,1.1,.97);g.add(sw);out.push(sw)}
  return g}
window.PetLife={OUTFITS:OUTFITS,dress:dress,ANIMALS:ANIMALS,CARD_AT:CARD_AT,today:today,trip:trip,tripFound:tripFound,tripPlaceName:tripPlaceName,love:love,hearts:hearts,cardDay:cardDay,fedToday:fedToday,heartsHtml:heartsHtml,diarySeen:diarySeen,diaryMark:diaryMark,makeXiong:makeXiong,GP_FLOOR:GP_FLOOR,GP_WORKS:GP_WORKS,GP_BREEDS:GP_BREEDS,GP_COLORS:GP_COLORS,gpFind:gpFind,makeGP:makeGP,FR_SPECIES:FR_SPECIES,FR_COLORS:FR_COLORS,makeFrogPet:makeFrogPet};
})();
