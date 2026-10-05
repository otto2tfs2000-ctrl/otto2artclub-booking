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
window.PetLife={ANIMALS:ANIMALS,CARD_AT:CARD_AT,today:today,trip:trip,tripFound:tripFound,tripPlaceName:tripPlaceName,love:love,hearts:hearts,cardDay:cardDay,fedToday:fedToday,heartsHtml:heartsHtml,diarySeen:diarySeen,diaryMark:diaryMark,makeXiong:makeXiong,GP_FLOOR:GP_FLOOR,GP_WORKS:GP_WORKS,GP_BREEDS:GP_BREEDS,GP_COLORS:GP_COLORS,gpFind:gpFind,makeGP:makeGP};
})();
