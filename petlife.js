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
window.PetLife={ANIMALS:ANIMALS,CARD_AT:CARD_AT,today:today,trip:trip,tripFound:tripFound,tripPlaceName:tripPlaceName,love:love,hearts:hearts,cardDay:cardDay,fedToday:fedToday,heartsHtml:heartsHtml,diarySeen:diarySeen,diaryMark:diaryMark,makeXiong:makeXiong};
})();
