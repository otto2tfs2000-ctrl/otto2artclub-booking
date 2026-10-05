/* 2026-10-05 Otto2藝術文創集團 26 週年慶熱氣球（大熊要的，週年慶到 11 月底，12/1 起自動不出現）
   A 款：奶油白氣球、上下彩色三角旗、前後印「26th 周年慶／週週直播抽好禮」。
         每座島都有一顆固定在畫面右上角白雲那邊（不飄走，老闆會看）：每一格照鏡頭重新擺，鏡頭怎麼轉它都在同一個位置。
   B 款：彩條氣球拖「26th 周年慶 滿千送抽獎券！」布條，跟一顆小 A 款繞島飄。
   park.html（遊樂島＋吉祥物島）、art.html（作品小屋）共用，需要 three.js r128（呼叫時才用到全域 THREE）。
   測試：網址加 ?anniv=1 強制出現、?anniv=0 強制不出現。字用系統字型，不另外下載字型。 */
(function(){
var END=Date.parse('2026-12-01T00:00:00+08:00');
function on(){var q=location.search;if(/[?&]anniv=0/.test(q))return false;if(/[?&]anniv=1/.test(q))return true;return Date.now()<END}
var PINK='#e8708f',BLUE='#3d9bd0',ORANGE='#f2a04a',GREEN='#8cc152',YEL='#f6cf4a',CREAM='#fff6e4';
var HEI='"PingFang TC","Noto Sans TC","Microsoft JhengHei","Heiti TC",sans-serif',ROUND='"Arial Rounded MT Bold","Arial Black","Helvetica Neue",Arial,sans-serif';
function cvs(w,h){var c=document.createElement('canvas');c.width=w;c.height=h;return c}
function fleck(x,w,h,n){for(var i=0;i<n;i++){x.fillStyle='rgba('+(Math.random()<.5?'255,250,235':'120,90,40')+','+(.05+Math.random()*.08)+')';x.fillRect(Math.random()*w,Math.random()*h,2+Math.random()*5,1+Math.random()*2)}}
/* 26th 周年慶：照海報配色（2 粉、6 藍、th 咖啡、周 橘、年 藍、慶 粉），白色粗描邊 */
function logo(x,cx,cy,s){x.save();x.translate(cx,cy);x.scale(s,s);x.textBaseline='alphabetic';x.lineJoin='round';x.textAlign='left';
  [['2',PINK,'bold 150px '+ROUND,-255,40],['6',BLUE,'bold 150px '+ROUND,-170,40],['th','#7a4a2a','bold 50px '+ROUND,-86,40],
   ['周',ORANGE,'900 118px '+HEI,-24,38],['年',BLUE,'900 118px '+HEI,96,38],['慶',PINK,'900 118px '+HEI,216,38]].forEach(function(p){
    x.font=p[2];x.lineWidth=22;x.strokeStyle='#fff';x.strokeText(p[0],p[3],p[4]);x.fillStyle=p[1];x.fillText(p[0],p[3],p[4])});
  x.restore()}
function texA(){var w=1024,h=512,c=cvs(w,h),x=c.getContext('2d'),cols=[PINK,BLUE,YEL,GREEN,ORANGE],i;
  x.fillStyle=CREAM;x.fillRect(0,0,w,h);
  for(i=0;i<32;i++){x.fillStyle=cols[i%5];x.fillRect(i*32,0,32,115);x.fillRect(i*32,h-75,32,75)}
  for(i=0;i<32;i++){x.fillStyle=cols[(i+2)%5];x.beginPath();x.moveTo(i*32,115);x.lineTo(i*32+32,115);x.lineTo(i*32+16,150);x.fill()}
  /* 旋轉體的 u=.25 朝 +x、u=.75 朝 -x：前後各印一次 */
  [w*.25,w*.75].forEach(function(cx){logo(x,cx-38,h*.53,.6);x.font='900 32px '+HEI;x.fillStyle='#d9536f';x.textAlign='center';x.fillText('週週直播抽好禮',cx,h*.53+82)});
  fleck(x,w,h,500);var t=new THREE.CanvasTexture(c);t.anisotropy=4;return t}
function texB(){var w=512,h=256,c=cvs(w,h),x=c.getContext('2d'),cols=[PINK,CREAM,BLUE,CREAM,YEL,CREAM,GREEN,CREAM,ORANGE,CREAM];
  for(var i=0;i<20;i++){x.fillStyle=cols[i%10];x.fillRect(i*25.6,0,25.6,h)}fleck(x,w,h,300);return new THREE.CanvasTexture(c)}
function texBanner(){var c=cvs(1024,220),x=c.getContext('2d');x.fillStyle=CREAM;x.fillRect(0,0,1024,220);
  x.fillStyle=PINK;x.fillRect(0,0,1024,14);x.fillRect(0,206,1024,14);logo(x,330,140,.68);
  x.font='900 44px '+HEI;x.fillStyle='#d9536f';x.textAlign='left';x.fillText('滿千送',665,100);x.fillText('抽獎券！',665,158);
  var t=new THREE.CanvasTexture(c);t.anisotropy=4;return t}
var _tA,_tB,_tBn;
/* 跟作品小屋原本的熱氣球同一個外型（同樣的輪廓、籃子、繩子）。原點放在整顆的中心，固定在畫面上比較好對位 */
function body(map,seg,fog){var g=new THREE.Group(),inner=new THREE.Group();inner.position.y=-1.95;g.add(inner);
  var prof=[[0,-1.25],[.32,-1.1],[.7,-.55],[.98,.15],[1.05,.7],[.9,1.25],[.55,1.62],[0,1.75]].map(function(p){return new THREE.Vector2(p[0],p[1])});
  var env=new THREE.Mesh(new THREE.LatheGeometry(prof,seg),new THREE.MeshLambertMaterial({map:map,flatShading:seg<20,fog:fog}));env.position.y=2.1;inner.add(env);
  var bk=new THREE.Mesh(new THREE.BoxGeometry(.42,.32,.42),new THREE.MeshLambertMaterial({color:'#b8865a',fog:fog}));bk.position.y=.2;inner.add(bk);
  var rim=new THREE.Mesh(new THREE.BoxGeometry(.46,.05,.46),new THREE.MeshLambertMaterial({color:'#8a6440',fog:fog}));rim.position.y=.34;inner.add(rim);
  var rope=new THREE.LineBasicMaterial({color:'#f2ead8',fog:fog});[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(p){inner.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(p[0]*.19,.38,p[1]*.19),new THREE.Vector3(p[0]*.28,.95,p[1]*.28)]),rope))});
  g.userData={env:env,inner:inner};return g}
/* A 款：字樣轉到 +z（group 的 +z 朝鏡頭就看得到字） */
function A(size,fixed){var g=body(_tA||(_tA=texA()),36,!fixed);g.userData.env.rotation.y=-Math.PI/2;g.scale.setScalar(size||1);return g}
/* B 款：+x 是前進方向，布條拖在 -x 後面（正反兩面各一片，從哪邊看字都是正的） */
function B(size){var g=body(_tB||(_tB=texB()),14,true),ban=new THREE.Group(),m=new THREE.MeshLambertMaterial({map:_tBn||(_tBn=texBanner())});
  var geo=new THREE.PlaneGeometry(3,.64,16,1),p=geo.attributes.position;for(var i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*2.4)*.1);geo.computeVertexNormals();
  var f=new THREE.Mesh(geo,m),bk=new THREE.Mesh(geo,m);f.position.x=-1.75;bk.position.x=-1.75;bk.rotation.y=Math.PI;bk.position.z=-.01;ban.add(f);ban.add(bk);
  var rp=new THREE.LineBasicMaterial({color:'#8a6440'});[.3,-.3].forEach(function(y){ban.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.2,.15,0),new THREE.Vector3(-.25,y,0)]),rp))});
  ban.position.set(0,-.4,0);g.userData.inner.add(ban);g.userData.banner=ban;g.scale.setScalar(size||1);return g}
/* 把固定款擺在畫面 (nx,ny)（-1～1）那個點、離鏡頭 dist 的深度，高度約佔畫面 frac；直立、字面向鏡頭，輕輕上下浮 */
var _v,_f;  /* 這支檔比 three.js 早載入，向量等第一次用到才建 */
function pin(b,cam,nx,ny,frac,dist,now){if(!_v){_v=new THREE.Vector3();_f=new THREE.Vector3()}cam.updateMatrixWorld();_v.set(nx,ny,.5).unproject(cam).sub(cam.position).normalize();cam.getWorldDirection(_f);
  var t=dist/Math.max(.2,_v.dot(_f)),wh=2*dist*Math.tan(cam.fov*Math.PI/360);
  b.position.copy(cam.position).addScaledVector(_v,t);b.position.y+=Math.sin(now/1700)*wh*.008;
  b.scale.setScalar(frac*wh/3.8);b.rotation.set(0,Math.atan2(cam.position.x-b.position.x,cam.position.z-b.position.z)+Math.sin(now/2600)*.12,Math.sin(now/2100)*.025)}
/* 繞 (cx,cz) 飄：o={cx,cz,rad,y,a,sp,bob} */
function drift(b,dt,now){var o=b.userData.o;o.a+=o.sp*dt;b.position.set(o.cx+Math.cos(o.a)*o.rad,o.y+Math.sin(now/2200+o.bob)*.6,o.cz+Math.sin(o.a)*o.rad);
  b.rotation.y=-o.a+(o.sp>0?-Math.PI/2:Math.PI/2);if(b.userData.banner)b.userData.banner.rotation.x=Math.sin(now/700)*.12}
window.Anniv26={on:on,A:A,B:B,pin:pin,drift:drift};
})();
