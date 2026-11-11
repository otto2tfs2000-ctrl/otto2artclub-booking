/* ---------- 2026-11-11 大熊：雙 11 限定「雪橇丟禮物」（只到 11/11 晚上 12 點；park.html?sled=1 隨時預覽） ----------
   全螢幕 30 秒（最後 10 秒加速）。背景＝當下的遊樂島畫面（極光＋3D 島）拍一張；聖誕老公公＝天上飛的那一組 makeSanta()，先畫成一張圖。
   東西從雪橇掉下來，點到就拿：🎁 +1、🧸 +2、⭐ +5、金幣 紅利 1／3、鑽石 紅利 5、🔔 5 秒雙倍、💣 這一局全部歸零。
   不限次數；每局結束看成績，按「送出成績」才上排行榜（比榜上高才蓋過去）。排名只看禮物數。
   伺服器 /xmas/sled11（op info/start/end/submit/rank）；訪客體驗版只記在這支手機、不上榜。
   用到 park.html 的：card toast sfx hud save xcall XS G token gToday sleep busy MGN MGS renderer scene camera makeSanta THREE，玩的時候 window.HW_ON 暫停 3D */
(function(){
  const SL_DAY='2026-11-11',SL_SEC=30,SL_FAST=20,SL_GCAP=20,SL_BCAP=10,SL_DBL=5,SL_LIVE=false;
  const PRIZE='🥇 第一名 現金點數 111<br>🥈 第二名 A5 水彩繪本<br>🥉 第三名 聖誕公公娃娃一組';
  const q=id=>document.getElementById(id);
  const slOn=()=>!window.KIOSK&&(/[?&]sled=1/.test(location.search)||(SL_LIVE&&gToday()===SL_DAY));
  const slReal=()=>!!(window.PROD&&XS&&!window.GUEST&&token());
  const slExpectReal=()=>!!(window.PROD&&!window.GUEST&&!window.KIOSK&&token());
  let SLS=null,RANK=null,_auto=0,_wait=0,_busy=0;
  const KEY='otto2-sled-'+SL_DAY;
  function load(){if(slReal()&&SLS)return SLS;try{return Object.assign({plays:0,best:0,bbest:0,top:0,last:0},JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){return{plays:0,best:0,bbest:0,top:0,last:0}}}
  function keep(st){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
  async function sync(){if(!slReal())return;try{const j=await xcall('/xmas/sled11',{op:'info'});SLS=j.sl;RANK=j.rank}catch(e){}}

  const css=document.createElement('style');
  css.textContent='#slBtn{position:fixed;right:12px;top:calc(env(safe-area-inset-top,0px) + 132px);z-index:30;width:54px;height:54px;border-radius:50%;border:3px solid #2b2320;background:#d0342c;font-size:28px;box-shadow:0 4px 0 #2b2320;cursor:pointer;animation:hwBob 1.6s ease-in-out infinite}'
    +'#slBtn small{position:absolute;right:-8px;top:-8px;background:#ffd447;color:#2b2320;font-size:11px;font-weight:800;border-radius:10px;padding:1px 6px;border:2px solid #2b2320}'
    +'#slFull{position:fixed;inset:0;z-index:60;background:#0b1437;touch-action:none;user-select:none;-webkit-user-select:none}'
    +'#slFull canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}'
    +'.slhud{position:absolute;left:0;right:0;top:0;z-index:1;pointer-events:none;display:flex;justify-content:space-between;gap:6px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 0;color:#fff;font-size:16px;font-weight:800}'
    +'.slhud span{background:rgba(11,20,55,.72);border:1px solid rgba(255,255,255,.25);border-radius:20px;padding:5px 11px;white-space:nowrap}.slhud b{color:#ffd447;font-size:20px}'
    +'.slhud .dbl{background:#ffd447;color:#3a2600;border-color:#ffd447}.slhud .dbl b{color:#3a2600}'
    +'.sltip{position:absolute;left:0;right:0;bottom:0;z-index:1;margin:0;padding:6px 0 calc(env(safe-area-inset-bottom,0px) + 10px);text-align:center;color:#e6ecff;font-size:13px;pointer-events:none;text-shadow:0 1px 3px #000}'
    +'.slrank{list-style:none;margin:8px 0 10px;padding:0;text-align:left;font-size:15px}.slrank li{display:flex;gap:8px;align-items:center;padding:5px 10px;border-radius:10px}'
    +'.slrank li:nth-child(odd){background:#fff6ea}.slrank li.me{background:#ffe08a;font-weight:800}.slrank i{font-style:normal;width:30px;text-align:center}.slrank b{margin-left:auto}'
    +'.slprize{background:#fff6ea;border:2px solid #f0d2a8;border-radius:12px;padding:6px 10px;font-size:13px;line-height:1.6;margin:6px 0 10px}';
  document.head.appendChild(css);

  function btn(){let b=q('slBtn');if(!slOn()){if(b)b.remove();return}
    if(!b){b=document.createElement('button');b.id='slBtn';b.type='button';b.setAttribute('aria-label','雙 11 雪橇丟禮物');b.onclick=()=>{if(!busy&&q('pop').hidden)intro()};document.body.appendChild(b)}
    b.innerHTML='🛷<small>11/11</small>'}
  async function maybe(){if(!slOn())return;
    if(slReal()&&!SLS)sync().then(btn);else if(slExpectReal()&&!XS&&_wait++<20)setTimeout(()=>{if(slReal()&&!SLS)sync().then(btn)},1500);
    btn();if(_auto)return;
    if(busy||!q('pop').hidden){setTimeout(maybe,1500);return}_auto=1;intro()}

  function intro(){const st=load();if(q('slBtn'))q('slBtn').remove();
    card(`<div class="hwbig">🛷</div><h2>雙 11 限定｜雪橇丟禮物</h2><p style="margin:0">只到今晚 12 點，不限次數</p>
      <div class="hwrule">🎁 點禮物累積分數（🧸 +2、⭐ +5）<br>🪙 金幣、鑽石是紅利點數（今天最多 ${SL_BCAP} 點）<br>🔔 點到鈴鐺，5 秒內全部雙倍<br>💣 點到炸彈，這一局全部歸零<br>🏆 玩完按「送出成績」，比榜上高就蓋過去</div>
      <div class="slprize">${PRIZE}</div>
      ${st.top?`<p style="margin:0 0 8px">你在榜上的成績 🎁 <b>${st.top}</b></p>`:''}
      <div class="acts"><button type="button" class="btn ghost" id="slNo">晚點再玩</button><button type="button" class="btn ghost" id="slRk">排行榜</button><button type="button" class="btn red" id="slGo">開始</button></div>`);
    q('slNo').onclick=()=>{q('pop').hidden=true;btn()};q('slRk').onclick=()=>rankCard();q('slGo').onclick=start;
    setTimeout(()=>{try{sprites(size(),Math.min(2,devicePixelRatio||1));santaSprite()}catch(e){}},60)}

  async function start(){if(_busy)return;_busy=1;sfx('tap');{const b=q('slGo');if(b){b.disabled=true;b.textContent='雪橇準備中…'}}
    for(let i=0;i<40&&slExpectReal()&&!XS;i++)await sleep(250);
    try{if(slReal()){const j=await xcall('/xmas/sled11',{op:'start'});SLS=j.sl;RANK=j.rank}}
    catch(e){_busy=0;const b=q('slGo');if(b){b.disabled=false;b.textContent='再試一次'}toast(e.message||'連線不穩，稍後再試');return}
    _busy=0;q('pop').hidden=true;done(await play())}

  /* 掉下來的東西 */
  const KINDS=[{k:'g1',w:50,g:1},{k:'g2',w:14,g:2},{k:'g5',w:5,g:5},{k:'c1',w:6,b:1},{k:'c3',w:2.5,b:3},{k:'c5',w:1,b:5},{k:'bell',w:7,dbl:1},{k:'bomb',w:20,bomb:1}];
  const KSUM=KINDS.reduce((a,o)=>a+o.w,0);
  const size=()=>Math.max(40,Math.min(60,innerWidth/6.6));
  let _spr=null;
  function sprites(S,DP){if(_spr&&_spr.S===S&&_spr.DP===DP)return _spr;
    const mk=(w,h,f)=>{const c=document.createElement('canvas');c.width=Math.ceil(w*DP);c.height=Math.ceil(h*DP);const g=c.getContext('2d');g.setTransform(DP,0,0,DP,0,0);g.textAlign='center';g.textBaseline='middle';f(g);return c};
    const SW=S*2,SH=S*2.5,CY=S*1.05;
    const badge=(g,t,bgc,fg)=>{g.font=`bold ${Math.round(S*.26)}px sans-serif`;const w=g.measureText(t).width+12,h=S*.38,cx=S,cy=CY+S*.64;
      g.fillStyle=bgc;g.strokeStyle='#2b2320';g.lineWidth=2;g.beginPath();g.roundRect?g.roundRect(cx-w/2,cy-h/2,w,h,h/2):g.rect(cx-w/2,cy-h/2,w,h);g.fill();g.stroke();g.fillStyle=fg||'#2b2320';g.fillText(t,cx,cy+1)};
    const halo=(g,c1,c2)=>{const hr=S*.85,hg=g.createRadialGradient(S,CY,S*.2,S,CY,hr);hg.addColorStop(0,c1);hg.addColorStop(.55,c2);hg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=hg;g.beginPath();g.arc(S,CY,hr,0,7);g.fill()};
    const emo=(g,e,k)=>{g.font=`${Math.round(S*(k||1))}px sans-serif`;g.fillText(e,S,CY)};
    const coin=(g,k,txt)=>{const r=S*k,gr=g.createRadialGradient(S-r*.3,CY-r*.3,r*.1,S,CY,r);gr.addColorStop(0,'#fff3a8');gr.addColorStop(1,'#e8a200');g.shadowColor='#ffd447';g.shadowBlur=14;g.fillStyle=gr;g.beginPath();g.arc(S,CY,r,0,7);g.fill();g.shadowBlur=0;
      g.strokeStyle='#9a6a00';g.lineWidth=3;g.stroke();g.beginPath();g.arc(S,CY,r*.74,0,7);g.lineWidth=1.5;g.stroke();g.fillStyle='#7a4f00';g.font=`900 ${Math.round(r*.62)}px sans-serif`;g.fillText('紅利',S,CY+1);badge(g,txt,'#ffd447')};
    const SPR={
      g1:mk(SW,SH,g=>{emo(g,'🎁');badge(g,'+1','#fff')}),
      g2:mk(SW,SH,g=>{emo(g,'🧸',1.08);badge(g,'+2','#ffd0dc')}),
      g5:mk(SW,SH,g=>{halo(g,'rgba(255,224,90,.85)','rgba(255,200,40,.35)');emo(g,'⭐',1.05);badge(g,'+5','#ffd447')}),
      c1:mk(SW,SH,g=>coin(g,.38,'紅利 1')),
      c3:mk(SW,SH,g=>{halo(g,'rgba(255,224,90,.6)','rgba(255,200,40,.25)');coin(g,.48,'紅利 3')}),
      c5:mk(SW,SH,g=>{halo(g,'rgba(155,231,255,.85)','rgba(120,200,255,.35)');emo(g,'💎',1.02);badge(g,'紅利 5','#9be7ff')}),
      bell:mk(SW,SH,g=>{halo(g,'rgba(255,243,176,.8)','rgba(255,220,120,.3)');emo(g,'🔔',1.02);badge(g,'雙倍','#ffd447')}),
      bomb:mk(SW,SH,g=>{emo(g,'💣',1.05);badge(g,'歸零','#e5484d','#fff')}),
    };
    return _spr={S,DP,SW,SH,CY,SPR}}

  /* 聖誕老公公：用遊樂島天上飛的那一組模型，借主畫面的 renderer 畫一張透明底的圖（不另開 WebGL，手機才不會被收回） */
  let _santa;
  function santaSprite(){if(_santa!==undefined)return _santa;_santa=null;
    try{const g=makeSanta();g.scale.setScalar(1);
      const sc=new THREE.Scene();sc.add(g);sc.add(new THREE.AmbientLight('#ffffff',.8));const dl=new THREE.DirectionalLight('#fff4dd',.9);dl.position.set(2,4,6);sc.add(dl);
      const d=renderer.domElement,hw=2.6,hh=hw*d.height/d.width,cam=new THREE.OrthographicCamera(-hw,hw,hh,-hh,.1,50);cam.position.set(.2,1.7,8);cam.lookAt(1.35,.85,0);
      const oc=new THREE.Color();renderer.getClearColor(oc);const oa=renderer.getClearAlpha();
      renderer.setClearColor(0x000000,0);renderer.render(sc,cam);
      const band=Math.min(d.height,d.height*1.2/hh),c=document.createElement('canvas');c.width=640;c.height=Math.max(8,Math.round(640*band/d.width));
      c.getContext('2d').drawImage(d,0,(d.height-band)/2,d.width,band,0,0,c.width,c.height);
      renderer.setClearColor(oc,oa);g.traverse(o=>{if(o.geometry)o.geometry.dispose()});
      try{renderer.render(scene,camera)}catch(e){}
      _santa=c}catch(e){_santa=null;try{renderer.render(scene,camera)}catch(_){}}
    return _santa}

  /* 背景：現在的遊樂島（夜空底色＋極光畫布＋3D 島），拍一張當背景，稍微壓暗讓掉下來的東西清楚 */
  function snap(W,H,DP){const c=document.createElement('canvas');c.width=Math.ceil(W*DP);c.height=Math.ceil(H*DP);const g=c.getContext('2d');g.setTransform(DP,0,0,DP,0,0);
    const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#070d2b');gr.addColorStop(.7,'#16245e');gr.addColorStop(1,'#22367c');g.fillStyle=gr;g.fillRect(0,0,W,H);
    for(let i=0;i<50;i++){g.fillStyle=`rgba(255,255,255,${.35+Math.random()*.45})`;g.beginPath();g.arc(Math.random()*W,Math.random()*H*.6,Math.random()*1.4+.4,0,7);g.fill()}
    try{const a=q('aurora');if(a&&a.width&&getComputedStyle(a).display!=='none'){const r=a.getBoundingClientRect();g.drawImage(a,r.left,r.top,r.width,r.height)}}catch(e){}
    try{renderer.render(scene,camera);const d=renderer.domElement,r=d.getBoundingClientRect();g.drawImage(d,r.left,r.top,r.width,r.height)}catch(e){}
    g.fillStyle='rgba(7,13,43,.3)';g.fillRect(0,0,W,H);return c}

  function play(){return new Promise(res=>{MGN++;const gone=MGS();
    const DP=Math.min(2,devicePixelRatio||1),S=size(),santa=santaSprite(),bg=snap(innerWidth,innerHeight,DP);
    const ov=document.createElement('div');ov.id='slFull';
    ov.innerHTML=`<div class="slhud"><span>⏱ <b id="slT">${SL_SEC}</b></span><span class="dbl" id="slD" hidden>🔔 雙倍 <b id="slDt">5.0</b></span><span>🎁 <b id="slS">0</b>　🪙 <b id="slB">0</b></span></div><canvas id="slCv"></canvas><p class="sltip">點禮物和紅利，小心炸彈 💣</p>`;
    document.body.appendChild(ov);window.HW_ON=true;
    const cv=q('slCv'),x=cv.getContext('2d');let W=0,H=0;
    const fit=()=>{const r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*DP;cv.height=H*DP;x.setTransform(DP,0,0,DP,0,0)};fit();
    const {SW,SH,CY,SPR}=sprites(S,DP);
    let gift=0,bon=0,boom=false,items=[],fx=[],acc=0,t0=performance.now(),el=0,over=false,flash=0,shake=0,dbl=0,coins=0,lastT=-1,fastShown=false;
    const hudUp=()=>{q('slS').textContent=gift;q('slB').textContent=bon};
    const sPos=()=>{const a=el*1.15;return{x:W/2+Math.sin(a)*(W/2-60)*.8,y:Math.max(110,H*.15)+Math.sin(el*2.6)*7,right:Math.cos(a)>=0}};
    cv.addEventListener('pointerdown',e=>{if(over)return;const r=cv.getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top;
      let hit=null,bd=S*.78;items.forEach(it=>{const d=Math.hypot(it.x-px,it.y-py);if(!it.hit&&d<bd){bd=d;hit=it}});if(!hit)return;hit.hit=true;const m=dbl>0?2:1;
      if(hit.bomb){const lost=gift+bon;gift=0;bon=0;dbl=0;boom=true;flash=1;shake=.4;fx.push({x:hit.x,y:hit.y,t:lost?'💥 全部歸零！':'💥 碰！',c:'#ff6a5a',a:1.2});sfx('thunk')}
      else if(hit.dbl){dbl=SL_DBL;fx.push({x:hit.x,y:hit.y,t:'🔔 雙倍 5 秒！',c:'#ffd447',a:1.3});sfx('chime')}
      else if(hit.b){bon+=hit.b*m;boom=false;fx.push({x:hit.x,y:hit.y,t:`紅利 +${hit.b*m}`,c:'#ffd447',a:1});sfx('sparkle')}
      else{gift+=hit.g*m;boom=false;fx.push({x:hit.x,y:hit.y,t:`+${hit.g*m}`,c:m>1||hit.g>=5?'#ffd447':'#fff',a:1});sfx(hit.g>=5?'sparkle':'pop')}
      hudUp()});
    const pick=()=>{for(let n=0;n<6;n++){let r=Math.random()*KSUM,o=KINDS[0];for(const k of KINDS){if((r-=k.w)<0){o=k;break}}
        if(o.b&&coins>=6)continue;if(o.bomb&&el<1.5)continue;return Object.assign({},o)}return Object.assign({},KINDS[0])};
    const end=()=>{window.HW_ON=false;ov.remove();res({sc:gift,b:bon,boom})};
    function frame(now){if(gone()){window.HW_ON=false;ov.remove();return}
      const dt=Math.min(.05,(now-t0)/1000);t0=now;if(!over)el+=dt;
      const fast=el>=SL_FAST,spd=fast?1.4:1;
      if(!over&&!fastShown&&fast){fastShown=true;fx.push({x:W/2,y:H*.42,t:'⚡ 最後 10 秒加速！',c:'#ffd447',a:1.6,big:true});sfx('toot')}
      const sp=sPos();
      if(!over){acc+=dt;const gap=fast?.36:.52;while(acc>=gap){acc-=gap;const o=pick();if(o.b)coins++;o.x=sp.x;o.y=sp.y+S*.5;o.vx=(Math.random()-.5)*90;o.v=(H/3.3)*(.85+Math.random()*.35);o.rot=Math.random()*6;items.push(o)}
        if(dbl>0)dbl=Math.max(0,dbl-dt);
        items.forEach(it=>{it.x+=it.vx*dt;it.y+=it.v*dt*spd;it.rot+=dt*1.5*spd;if(it.x<S*.6){it.x=S*.6;it.vx=Math.abs(it.vx)}if(it.x>W-S*.6){it.x=W-S*.6;it.vx=-Math.abs(it.vx)}});
        items=items.filter(it=>!it.hit&&it.y<H+S)}
      fx.forEach(f=>{f.y-=46*dt;f.a-=dt*1.3});fx=fx.filter(f=>f.a>0);
      x.save();if(shake>0){shake-=dt;x.translate((Math.random()-.5)*12,(Math.random()-.5)*12)}
      x.drawImage(bg,0,0,W,H);
      /* 雪橇：圖是往右飛的，往左飛就翻過來；圖裡雪橇在左邊 24% 的位置，對準掉東西的地方 */
      x.save();x.translate(sp.x,sp.y);x.scale(sp.right?1:-1,1);x.rotate(Math.sin(el*2.6)*.035);
      if(santa){const w=Math.min(270,W*.64),h=w*santa.height/santa.width;x.drawImage(santa,-w*.24,-h*.6,w,h)}
      else{x.textAlign='center';x.textBaseline='middle';x.scale(-1,1);x.font='40px sans-serif';x.fillText('🦌',-46,0);x.font='46px sans-serif';x.fillText('🛷',22,8);x.font='34px sans-serif';x.fillText('🎅',24,-16)}
      x.restore();
      items.forEach(it=>{const c=SPR[it.k]||SPR.g1;x.save();x.translate(it.x,it.y);x.rotate(Math.sin(it.rot)*.2);x.drawImage(c,-S,-CY,SW,SH);x.restore()});
      x.textAlign='center';x.textBaseline='middle';
      fx.forEach(f=>{x.globalAlpha=Math.max(0,Math.min(1,f.a));x.font=`900 ${Math.round(S*(f.big?.62:.46))}px sans-serif`;x.fillStyle=f.c;x.strokeStyle='#1a1430';x.lineWidth=4;x.strokeText(f.t,f.x,f.y);x.fillText(f.t,f.x,f.y);x.globalAlpha=1});
      if(dbl>0){x.strokeStyle=`rgba(255,212,71,${.55+.3*Math.sin(el*10)})`;x.lineWidth=10;x.strokeRect(5,5,W-10,H-10)}
      if(flash>0){flash-=dt*2.2;x.fillStyle=`rgba(255,60,40,${Math.max(0,flash)*.45})`;x.fillRect(-12,-12,W+24,H+24)}
      if(over){x.fillStyle='rgba(7,13,43,.55)';x.fillRect(-12,-12,W+24,H+24);x.font=`900 ${Math.round(S*.9)}px sans-serif`;x.fillStyle='#ffd447';x.strokeStyle='#1a1430';x.lineWidth=6;x.strokeText('時間到！',W/2,H/2);x.fillText('時間到！',W/2,H/2)}
      x.restore();
      const left=Math.max(0,SL_SEC-el),lt=Math.ceil(left);if(lt!==lastT){lastT=lt;q('slT').textContent=lt}
      const dOn=dbl>0&&!over;if(q('slD').hidden===dOn)q('slD').hidden=!dOn;if(dOn)q('slDt').textContent=dbl.toFixed(1);
      if(left<=0&&!over){over=true;sfx('chime');setTimeout(end,1200)}
      if(ov.isConnected)requestAnimationFrame(frame)}
    requestAnimationFrame(frame)})}

  const rkLine=()=>RANK&&RANK.me?`你在榜上 🎁 <b>${load().top}</b>・第 <b>${RANK.me}</b> 名（共 ${RANK.total} 人）`:(load().top?`你在榜上 🎁 <b>${load().top}</b>`:'你還沒有送出成績');
  async function done(r){const st0=load(),sc=r.sc,b=r.b||0;let add=0,addB=0,swap=0,bad=false;
    if(slReal()){let j=null;for(let i=0;i<3&&!j;i++){try{j=await xcall('/xmas/sled11',{op:'end',gift:sc,bonus:b})}catch(e){if(i===2||/結束/.test(e.message||'')){toast(e.message||'連線不穩，成績沒送出去');break}await new Promise(z=>setTimeout(z,1200))}}
      if(j){SLS=j.sl;RANK=j.rank;add=j.slRes.addG;addB=j.slRes.addB;swap=j.slRes.swap||0;bad=!!j.slRes.bad;try{hud()}catch(e){}}}
    else{const g=Math.min(SL_GCAP,sc);add=Math.max(0,g-st0.best);const st=Object.assign({},st0,{plays:st0.plays+1,best:Math.max(st0.best,g),bbest:Math.max(st0.bbest,Math.min(SL_BCAP,b)),last:sc});keep(st);if(add){G.gifts+=add;try{save();hud()}catch(e){}}}
    const st=load(),zero=!sc&&!b&&r.boom,can=slReal()&&!bad&&sc>st.top;
    const got=[add+swap?`🎁 聖誕禮物 <b>${add+swap}</b> 個`:'',addB?`🪙 紅利 <b>${addB}</b> 點`:''].filter(Boolean).join('、');
    card(`<div class="hwbig">${zero?'💣':'🛷'}</div><h2>${zero?'被炸彈炸到了！':'時間到！'}</h2>
      <div class="hwsc">🎁 ${sc}　🪙 ${b}</div>
      ${got?`<p style="margin:0 0 6px">入帳 ${got}</p>`:''}
      <p style="margin:0 0 10px;font-size:14px">${slReal()?(can?(st.top?`比你榜上的 🎁 ${st.top} 高，送出去就會蓋過去`:'送出成績就能上排行榜'):(st.top?`沒有超過你榜上的 🎁 <b>${st.top}</b>，再挑戰一次`:'再挑戰一次，拿到分數就能上榜')):'這是體驗版，用 LINE 登入才能上排行榜'}</p>
      <div class="acts">${can?`<button type="button" class="btn red" id="slUp">送出成績</button>`:''}<button type="button" class="btn ${can?'ghost':'red'}" id="slGo">再玩一次</button><button type="button" class="btn ghost" id="slRk">排行榜</button><button type="button" class="btn ghost" id="slNo">先這樣</button></div>`);
    q('slNo').onclick=()=>{q('pop').hidden=true;btn()};q('slGo').onclick=start;q('slRk').onclick=()=>rankCard();
    if(q('slUp'))q('slUp').onclick=async()=>{const u=q('slUp');u.disabled=true;u.textContent='送出中…';
      try{const j=await xcall('/xmas/sled11',{op:'submit'});SLS=j.sl;RANK=j.rank;sfx('chime');rankCard('成績送出去了！')}catch(e){u.disabled=false;u.textContent='送出成績';toast(e.message||'連線不穩，再按一次')}}}

  async function rankCard(msg){
    if(slReal()&&!msg){try{const j=await xcall('/xmas/sled11',{op:'rank'});SLS=j.sl;RANK=j.rank}catch(e){}}
    const top=(RANK&&RANK.top)||[],medal=['🥇','🥈','🥉'];
    card(`<h2>🏆 雪橇丟禮物排行榜</h2>${msg?`<p style="margin:0 0 4px">${msg}</p>`:''}
      <div class="slprize">${PRIZE}<br>只到今晚 12 點，比的是禮物數</div>
      ${top.length?`<ol class="slrank">${top.map((x,i)=>`<li class="${x.me?'me':''}"><i>${medal[i]||i+1}</i><span>${x.me?'你':(x.n||'神秘玩家')}</span><b>🎁 ${x.s}</b></li>`).join('')}</ol>`:`<p style="margin:10px 0">${slReal()?'還沒有人送出成績，你可以當第一個！':'用 LINE 登入才看得到排行榜'}</p>`}
      <p style="margin:0 0 10px;font-size:14px">${slReal()?rkLine():''}</p>
      <div class="acts"><button type="button" class="btn ghost" id="slNo">關閉</button><button type="button" class="btn red" id="slGo">${load().plays?'再玩一次':'開始玩'}</button></div>`);
    q('slNo').onclick=()=>{q('pop').hidden=true;btn()};q('slGo').onclick=start}

  window.Sled11={intro,on:slOn};
  setTimeout(maybe,700);
})();
