/* 2026-10-05 Otto2藝術文創集團 26 週年慶熱氣球（大熊要的，週年慶到 11 月底，12/1 起自動不出現）
   A 款：奶油白氣球、上下彩色三角旗、前後印「26th 周年慶／週週直播抽好禮」。
         每座島都有一顆固定在畫面右上角白雲那邊（不飄走，老闆會看）：每一格照鏡頭重新擺，鏡頭怎麼轉它都在同一個位置。
   B 款：彩條氣球拖「26th 周年慶 滿千送抽獎券！」布條，跟一顆小 A 款繞島飄。
   park.html（遊樂島＋吉祥物島）、art.html（作品小屋）共用，需要 three.js r128（呼叫時才用到全域 THREE）。
   測試：網址加 ?anniv=1 強制出現、?anniv=0 強制不出現。字用系統字型，不另外下載字型。 */
(function(){
var END=Date.parse('2026-12-01T00:00:00+08:00');
function on(){var q=location.search;if(/[?&]anniv=0/.test(q))return false;if(/[?&]anniv=1/.test(q))return true;return false} /* 2026-10-13 預設關閉：先不放 26 週年慶預設氣球，等後台「熱氣球」上傳資料才出現（原本是 Date.now()<END） */
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
/* 2026-10-10 活動公告用：同 B 款外型，布條換成傳進來的貼圖（ev 活動倒數布條） */
function Bx(tex,size,len){var g=body(_tB||(_tB=texB()),14,true),ban=new THREE.Group(),m=new THREE.MeshLambertMaterial({map:tex});len=len||3;
  var geo=new THREE.PlaneGeometry(len,len*.2148,16,1),p=geo.attributes.position;for(var i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*2.4)*.1);geo.computeVertexNormals();
  var f=new THREE.Mesh(geo,m),bk=new THREE.Mesh(geo,m);f.position.x=-len/2-.25;bk.position.x=-len/2-.25;bk.rotation.y=Math.PI;bk.position.z=-.01;ban.add(f);ban.add(bk);
  var rp=new THREE.LineBasicMaterial({color:'#8a6440'});[.3,-.3].forEach(function(y){ban.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.2,.15,0),new THREE.Vector3(-.25,y,0)]),rp))});
  ban.position.set(0,-.4,0);g.userData.inner.add(ban);g.userData.banner=ban;g.scale.setScalar(size||1);return g}

/* ───────── 2026-10-12 後台可設定的熱氣球（A／B／C 款，同時最多 3 顆）─────────
   A 大氣球：固定在畫面角落（大熊要的位置），字：主標＋副標；顏色六選一
   B 直式飄帶：彩條氣球底下垂一條直的飄帶（日期＋活動名＋倒數，或自己寫字），只在島的「後面」左右慢慢飄，不經過島上方
   C 單色大字球：一句話（歡迎新同學之類），固定在畫面角落
   資料來自伺服器 /event/list 的 balloons（後台「🎈 熱氣球」設定，到期自動消失）。全部用 pin() 擺在畫面上：
   A／C 用前面的深度、B 用很遠的深度（一定被島擋在後面，不管鏡頭怎麼轉）。 */
var PAL={pink:['#e8708f','#c93f66'],blue:['#3d9bd0','#226a97'],orange:['#f2a04a','#b8651a'],green:['#8cc152','#4d7f1f'],yellow:['#f6cf4a','#9a7608'],purple:['#9b7fd0','#5e43a0']};
function pal(c){return PAL[c]||PAL.pink}
function fit(x,txt,maxW,fs,w){x.font=w+' '+fs+'px '+HEI;var m=x.measureText(txt).width;if(m>maxW){fs=Math.floor(fs*maxW/m);x.font=w+' '+fs+'px '+HEI}return fs}
function splitTitle(t){t=String(t||'');if(t.length<=4)return [t];var h=Math.ceil(t.length/2);return [t.slice(0,h),t.slice(h)]}
/* 氣球上的字：綁了活動（eventId）就自動寫「活動名」＋「日期・還有N天」，沒綁就用自己填的 */
function btxt(b,ctx){var t=b.title||'',s=b.sub||'';
  if(b.eventId){var d=b.evDate||'';t=b.evTitle||t;var n=Math.round((Date.parse(d+'T00:00:00+08:00')-Date.parse((ctx&&ctx.today||d)+'T00:00:00+08:00'))/864e5);
    s=(d?(+d.slice(5,7))+'/'+(+d.slice(8,10))+'　':'')+(isNaN(n)?'':n<=0?'今天！':'還有'+n+'天')}
  return {t:t,s:s}}
function rrect(x,l,t,w,h,r){x.beginPath();x.moveTo(l+r,t);x.lineTo(l+w-r,t);x.quadraticCurveTo(l+w,t,l+w,t+r);x.lineTo(l+w,t+h-r);x.quadraticCurveTo(l+w,t+h,l+w-r,t+h);x.lineTo(l+r,t+h);x.quadraticCurveTo(l,t+h,l,t+h-r);x.lineTo(l,t+r);x.quadraticCurveTo(l,t,l+r,t);x.closePath()}
/* 圖片（2026-10-13）：載入完才畫上去（先用沒有圖的樣子頂著）。Cloudinary 有開跨網域，所以能當貼圖 */
function loadImg(url,cb){var im=new Image();im.crossOrigin='anonymous';im.onload=function(){cb(im)};im.src=url}
function drawCover(x,im,l,t,w,h,r){x.save();rrect(x,l,t,w,h,r);x.clip();var s=Math.max(w/im.width,h/im.height),dw=im.width*s,dh=im.height*s;x.drawImage(im,l+(w-dw)/2,t+(h-dh)/2,dw,dh);x.restore()}
/* 圖片字牌：外框＋圖，底下壓一條小標籤（倒數／一句話）。寬度壓在 316 內，側面看才不會被轉到後面 */
function imgCard(x,cx,cy,im,label,edge,tag){var cw=316,ch=392,l=cx-cw/2,t=cy-ch/2;
  x.fillStyle='#fff6e4';rrect(x,l,t,cw,ch,36);x.fill();x.lineWidth=8;x.strokeStyle=edge;x.stroke();
  if(im)drawCover(x,im,l+12,t+12,cw-24,ch-24,26);
  if(label){x.textAlign='center';x.textBaseline='middle';var pw=cw-60,py=t+ch-84;x.fillStyle=tag;rrect(x,cx-pw/2,py-30,pw,60,30);x.fill();x.fillStyle='#fff';fit(x,label,pw-30,40,'900');x.fillText(label,cx,py+2)}}
function lastPart(s){return s?String(s).split('　').pop():''}
/* A 大氣球：純色氣球身＋中間一大塊奶油白字牌，主標超大、副標在字牌下半（字牌寬度壓在 330 內，側面看才不會被轉到後面）。有圖就把字牌換成圖 */
function texAx(b,ctx){var w=1024,h=512,c=cvs(w,h),x=c.getContext('2d'),p=pal(b.color),T=btxt(b,ctx),t=new THREE.CanvasTexture(c);t.anisotropy=4;
  function paint(im){var i;x.clearRect(0,0,w,h);
    x.fillStyle=p[0];x.fillRect(0,0,w,h);x.fillStyle='rgba(255,255,255,.14)';for(i=0;i<32;i+=2)x.fillRect(i*32,0,32,h);
    if(b.img){[w*.25,w*.75].forEach(function(cx){imgCard(x,cx,h*.46,im,lastPart(T.s),p[1],p[1])})}
    else{
      var L=splitTitle(T.t);
      var SL=T.s?String(T.s).split('　').slice(0,2):[],sh=SL.length*64+(SL.length?14:0),th0=SL.length?196:250;  /* 副標最多兩行（日期／倒數），各自放大 */
      [w*.25,w*.75].forEach(function(cx){var ph=th0+sh,top=h*.5-ph/2-4;
        x.fillStyle='#fff6e4';rrect(x,cx-172,top,344,ph,40);x.fill();x.lineWidth=8;x.strokeStyle=p[1];x.stroke();
        x.textAlign='center';x.textBaseline='middle';
        var fs=L.length>1?108:140;L.forEach(function(s2){fs=Math.min(fs,fit(x,s2,312,fs,'900'))});
        var lh=fs*1.06,th=lh*L.length,ty=top+th0/2+4;
        L.forEach(function(s2,k){x.font='900 '+fs+'px '+HEI;x.fillStyle=p[1];x.fillText(s2,cx,ty-th/2+lh*(k+.5))});
        SL.forEach(function(s2,k){x.fillStyle='#1e2b4f';fit(x,s2,312,58,'900');x.fillText(s2,cx,top+th0+14+k*64+26)})})}
    fleck(x,w,h,300)}
  paint(null);if(b.img)loadImg(b.img,function(im){paint(im);t.needsUpdate=true});return t}
function texCx(b,ctx){var w=1024,h=512,c=cvs(w,h),x=c.getContext('2d'),p=pal(b.color),T=btxt(b,ctx),t=new THREE.CanvasTexture(c),img=b.img;b={title:T.t,sub:T.s};t.anisotropy=4;
  function paint(im){var i;x.clearRect(0,0,w,h);
    x.fillStyle=p[0];x.fillRect(0,0,w,h);x.fillStyle='rgba(255,255,255,.16)';for(i=0;i<16;i++)x.fillRect(i*64,0,32,h);
    if(img){[w*.25,w*.75].forEach(function(cx){imgCard(x,cx,h*.46,im,T.s?lastPart(T.s):T.t,'#fff',p[1])})}
    else{
      var L=splitTitle(b.title);
      [w*.25,w*.75].forEach(function(cx){x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';
        var fs=L.length>1?110:128;L.forEach(function(s2){fs=Math.min(fs,fit(x,s2,370,fs,'900'))});
        L.forEach(function(s2,k){x.font='900 '+fs+'px '+HEI;x.fillText(s2,cx,h*(L.length>1?.4:.5)+k*(fs+12)-(b.sub?18:0)*(k?0:0))});
        if(b.sub){x.font='900 44px '+HEI;x.fillStyle='rgba(255,255,255,.92)';x.fillText(b.sub,cx,h*.86)}})}
    fleck(x,w,h,200)}
  paint(null);if(img)loadImg(img,function(im){paint(im);t.needsUpdate=true});return t}
function texBodyX(color){var w=512,h=256,c=cvs(w,h),x=c.getContext('2d'),p=pal(color),i;for(i=0;i<20;i++){x.fillStyle=i%2?CREAM:p[0];x.fillRect(i*25.6,0,25.6,h)}fleck(x,w,h,300);return new THREE.CanvasTexture(c)}
/* 直式飄帶：上面日期、（有圖就放圖）、中間活動名一個字一個字往下排、下面倒數／副標。2026-10-13 加寬（256→320）字才讀得到 */
function texStreamer(b,ctx){var w=320,h=1152,c=cvs(w,h),x=c.getContext('2d'),p=pal(b.color),top='',mid=b.title||'',bot=b.sub||'',t=new THREE.CanvasTexture(c);t.anisotropy=4;
  if(b.eventId){var d=b.evDate||'';top=d?(+d.slice(5,7))+'/'+(+d.slice(8,10)):'';mid=b.evTitle||mid;
    var n=Math.round((Date.parse(d+'T00:00:00+08:00')-Date.parse((ctx&&ctx.today||d)+'T00:00:00+08:00'))/864e5);bot=n<=0?'今天！':'還有'+n+'天'}
  function paint(im){x.clearRect(0,0,w,h);
    x.fillStyle=p[0];x.fillRect(0,0,w,h);x.fillStyle='rgba(255,255,255,.55)';x.fillRect(0,0,w,14);x.fillRect(0,h-14,w,14);
    x.fillStyle='#fff';x.fillRect(14,0,6,h);x.fillRect(w-20,0,6,h);
    x.textAlign='center';x.textBaseline='middle';var y=70;
    if(top){x.fillStyle='#fff6c9';x.font='900 70px '+HEI;x.fillText(top,w/2,y);y+=80;x.fillStyle='rgba(255,255,255,.6)';x.fillRect(70,y-20,w-140,4)}
    if(b.img){var s=w-90,l=(w-s)/2,ih=Math.round(s*1.3);y+=10;x.fillStyle='#fff6e4';rrect(x,l-8,y-8,s+16,ih+16,24);x.fill();if(im)drawCover(x,im,l,y,s,ih,18);y+=ih+34}
    var chars=Array.from(mid).slice(0,10),room=h-y-(bot?150:50),fs=Math.min(130,Math.floor(room/Math.max(1,chars.length)*.92));
    if(chars.length&&fs>=40){x.fillStyle='#fff';x.font='900 '+fs+'px '+HEI;chars.forEach(function(ch,k){x.fillText(ch,w/2,y+fs*.55+k*fs*1.02)})}
    if(bot){x.fillStyle='#fff6c9';x.font='900 52px '+HEI;fit(x,bot,w-70,52,'900');x.fillText(bot,w/2,h-78)}}
  paint(null);if(b.img)loadImg(b.img,function(im){paint(im);t.needsUpdate=true});return t}
function makeX(b,ctx){var g,tex=[];
  if(b.style==='A'){var ta=texAx(b,ctx);g=body(ta,36,false);flat(g,ta);g.userData.env.rotation.y=-Math.PI/2;tex.push(ta);g.userData.kind='pin'}
  else if(b.style==='C'){var tc=texCx(b,ctx);g=body(tc,36,false);flat(g,tc);g.userData.env.rotation.y=-Math.PI/2;tex.push(tc);g.userData.kind='pin'}
  else{var tb=texBodyX(b.color),ts=texStreamer(b,ctx);g=body(tb,14,false);flat(g,tb);tex.push(tb,ts);g.userData.kind='drift';
    var geo=new THREE.PlaneGeometry(.98,3.5,1,12);geo.translate(0,-1.75,0);var m=new THREE.MeshBasicMaterial({map:ts,side:THREE.FrontSide,fog:false}),sw=new THREE.Group();
    var f=new THREE.Mesh(geo,m),bk=new THREE.Mesh(geo,m);bk.rotation.y=Math.PI;bk.position.z=-.012;sw.add(f);sw.add(bk);sw.position.set(0,-.05,0);g.userData.inner.add(sw);g.userData.sway=sw;
    var rp=new THREE.LineBasicMaterial({color:'#8a6440'});sw.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.25,.18,0),new THREE.Vector3(-.2,0,0)]),rp));sw.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(.25,.18,0),new THREE.Vector3(.2,0,0)]),rp))}
  g.traverse(function(m){if(m.material){m.material.transparent=true;m.material.depthTest=false;m.material.depthWrite=false}m.renderOrder=10}) /* A／B／C 都不看深度（雲是立體的會擋住它），靠位置留在島後面上方的天空：不蓋到島、不像貼在廣場上 */
  g.userData.tex=tex;g.userData.ph=Math.random()*6.28;g.userData.id=b.id;g.userData.pos=b.pos||'';return g}
/* 顏色要看得清楚：不吃場景的暗光，用不受光材質 */
function flat(g,map){g.userData.env.material=new THREE.MeshBasicMaterial({map:map,fog:false})}
/* cfg: {scene,camera,slots:[{nx,ny,frac}],bx,by,bamp,bfrac}；slots 給 A／C 用（照順序），B 在 bx±bamp 左右慢慢飄 */
function Mgr(cfg){this.cfg=cfg;this.objs=[];this.key=''}
Mgr.prototype.count=function(){return this.objs.length};
Mgr.prototype.set=function(list,ctx){list=(list||[]).slice(0,3);var key=JSON.stringify(list)+'|'+((ctx&&ctx.today)||'');if(key===this.key)return;this.key=key;var me=this;
  this.objs.forEach(function(o){me.cfg.scene.remove(o);o.traverse(function(m){if(m.geometry)m.geometry.dispose();if(m.material)m.material.dispose()});(o.userData.tex||[]).forEach(function(t){t.dispose()})});
  this.objs=list.map(function(b){var o=makeX(b,ctx);me.cfg.scene.add(o);return o})};
/* 位置（2026-10-13）：T 上排／M 中排 × L 左／M 中／R 右，共 6 格。後台指定了就固定放那格；沒指定的自動挑空格：
   橫向螢幕照老樣子（1 顆放中間、2 顆左右、3 顆左中右，都在上排）；直式手機上排左邊／中間會被畫面大標題蓋住，所以先排右上、再排標題下面的中排 */
var POS={TL:[-.45,0],TM:[.05,0],TR:[.5,0],ML:[-.45,1],MM:[.05,1],MR:[.5,1]},ROWY=[.72,.45];
function assign(pl,portrait){var used={},res=[],auto=[],pref;
  pl.forEach(function(p,i){if(p&&POS[p]&&!used[p]){used[p]=1;res[i]=p}else auto.push(i)});
  if(auto.length){pref=portrait?['TR','ML','MM','TM','TL','MR']:pl.every(function(p){return !p})?(pl.length===1?['TM']:pl.length===2?['TL','TR']:['TL','TM','TR']):['TM','TR','TL','MM','ML','MR'];
    var free=pref.filter(function(k){return !used[k]});auto.forEach(function(i,j){res[i]=free[j]||'TM'})}
  return res}
Mgr.prototype.tick=function(now,show,dist){var cfg=this.cfg,asp=cfg.camera.aspect||1.3,
    k=Math.max(.6,Math.min(1,asp/1.1)),py=cfg.py||.72,pf=cfg.pfrac||.19,at=assign(this.objs.map(function(o){return o.userData.pos}),asp<.9);  /* 直式手機窄，氣球縮小一點才排得下三顆 */
  this.objs.forEach(function(o,i){o.visible=!!show;if(!show)return;var u=o.userData,B=u.kind==='drift',P=POS[at[i]]||POS.TM,
    nx=P[0]+Math.sin(now*.00007+u.ph)*.04,ny=ROWY[P[1]]-(asp<.9&&!P[1]?.08:0)+(B?(cfg.by-py):0)+Math.sin(now/1900+u.ph)*.012;  /* 直式手機上排再低一點，不碰右上角的音效／選單鈕 */
    pin(o,cfg.camera,nx,ny,(B?(cfg.bfrac||.11)*1.3:pf)*k,dist*1.9,now);
    if(u.sway){u.sway.rotation.z=Math.sin(now/950+u.ph)*.08;u.sway.rotation.x=Math.sin(now/1300+u.ph)*.05}})};
/* 後台沒設定任何熱氣球時的預設：26 週年慶（到 11 月底，on() 為 false 就沒有）。也是新款（A 大氣球＋B 直式飄帶），不再有橫幅 */
function def26(){return on()?[{id:'d26a',style:'A',title:'26th 周年慶',sub:'週週直播抽好禮',color:'pink',from:'2026-10-01'},{id:'d26b',style:'B',title:'滿千送抽獎券',sub:'26th 周年慶',color:'blue',from:'2026-10-02'}]:[]}
window.Anniv26={on:on,A:A,B:B,Bx:Bx,pin:pin,drift:drift,Mgr:Mgr,def26:def26};
})();
