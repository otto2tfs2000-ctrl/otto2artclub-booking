/* ---------- 2026-11-11 晚大熊：「雪地跳跳・小熊搶禮物」（大熊 11/11 改名，不要寫雙 11），只有 11/12 一天（park.html?jump=1 隨時預覽；雪橇丟禮物 sled.js 沒開放，留著備用） ----------
   像沒網路時的小恐龍：小熊一直往前跑，點螢幕跳（空中可再跳一次），吃禮物、紅利；撞到雪堆、石頭這局直接結束（大熊選的）。最長 30 秒、最後 10 秒加速。
   🎁 +1、🧸 +2、⭐ +5（只在高處，要二段跳）、金幣 紅利 1／3、鑽石 紅利 5、🔔 5 秒雙倍。
   背景＝平面夜空＋極光＋雪坡，後面捲動島上的聖誕樹、雪人模型；小熊＝遊樂島那隻 makeBear()。
   不限次數；每局結束看成績，按「送出成績」才上排行榜（比榜上高才蓋過去），排名只看禮物數。伺服器 /xmas/jump12；訪客體驗版只記在這支手機、不上榜。
   用到 park.html 的：card toast sfx hud save xcall XS G token gToday sleep busy MGN MGS renderer scene camera makeBear makeXmasTree makeXmasTreeSmall makeSnowman THREE，玩的時候 window.HW_ON 暫停 3D */
(function(){
  const JP_DAY='2026-11-12',JP_SEC=30,JP_FAST=20,JP_GCAP=20,JP_BCAP=10,JP_DBL=5,JP_LIVE=true;
  const PRIZE='🥇 第一名 現金點數 111<br>🥈 第二名 A5 水彩繪本<br>🥉 第三名 聖誕公公娃娃一組';
  const API='/xmas/jump12',JP_SPECIAL=150;
  const q=id=>document.getElementById(id);
  const jpOn=()=>!window.KIOSK&&(/[?&]jump=1/.test(location.search)||(JP_LIVE&&gToday()===JP_DAY));
  const jpReal=()=>!!(window.PROD&&XS&&!window.GUEST&&token());
  const jpExpectReal=()=>!!(window.PROD&&!window.GUEST&&!window.KIOSK&&token());
  let JS=null,RANK=null,_auto=0,_wait=0,_busy=0;
  const KEY='otto2-jump-'+JP_DAY;
  function load(){if(jpReal()&&JS)return JS;try{return Object.assign({plays:0,best:0,bbest:0,top:0,last:0},JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){return{plays:0,best:0,bbest:0,top:0,last:0}}}
  function keep(st){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
  async function sync(){if(!jpReal())return;try{const j=await xcall(API,{op:'info'});JS=j.jp;RANK=j.rank}catch(e){}}

  const css=document.createElement('style');
  css.textContent='#jpBtn{position:fixed;right:12px;top:calc(env(safe-area-inset-top,0px) + 132px);z-index:30;width:54px;height:54px;border-radius:50%;border:3px solid #2b2320;background:#2f8f58;font-size:28px;box-shadow:0 4px 0 #2b2320;cursor:pointer;animation:hwBob 1.6s ease-in-out infinite}'
    +'#jpBtn small{position:absolute;right:-8px;top:-8px;background:#ffd447;color:#2b2320;font-size:11px;font-weight:800;border-radius:10px;padding:1px 6px;border:2px solid #2b2320}'
    +'#jpFull{position:fixed;inset:0;z-index:60;background:#0b1437;touch-action:none;user-select:none;-webkit-user-select:none}'
    +'#jpFull canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}'
    +'.jphud{position:absolute;left:0;right:0;top:0;z-index:1;pointer-events:none;display:flex;justify-content:space-between;gap:6px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 0;color:#fff;font-size:16px;font-weight:800}'
    +'.jphud span{background:rgba(11,20,55,.72);border:1px solid rgba(255,255,255,.25);border-radius:20px;padding:5px 11px;white-space:nowrap}.jphud b{color:#ffd447;font-size:20px}'
    +'.jphud .dbl{background:#ffd447;color:#3a2600;border-color:#ffd447}.jphud .dbl b{color:#3a2600}'
    +'.jptip{position:absolute;left:0;right:0;bottom:0;z-index:1;margin:0;padding:6px 0 calc(env(safe-area-inset-bottom,0px) + 10px);text-align:center;color:#2b3a6a;font-size:13px;font-weight:700;pointer-events:none}'
    +'.jprank{list-style:none;margin:8px 0 10px;padding:0;text-align:left;font-size:15px}.jprank li{display:flex;gap:8px;align-items:center;padding:5px 10px;border-radius:10px}'
    +'.jprank li:nth-child(odd){background:#fff6ea}.jprank li.me{background:#ffe08a;font-weight:800}.jprank i{font-style:normal;width:30px;text-align:center}.jprank b{margin-left:auto}'
    +'.jpprize{background:#fff6ea;border:2px solid #f0d2a8;border-radius:12px;padding:6px 10px;font-size:13px;line-height:1.6;margin:6px 0 10px}';
  document.head.appendChild(css);

  function btn(){let b=q('jpBtn');if(!jpOn()){if(b)b.remove();return}
    if(!b){b=document.createElement('button');b.id='jpBtn';b.type='button';b.setAttribute('aria-label','荷包大補血・雪地跳跳搶禮物');b.onclick=()=>{if(!busy&&q('pop').hidden)intro()};document.body.appendChild(b)}
    b.innerHTML='🐻<small>今天</small>'}
  async function maybe(){if(!jpOn())return;
    if(jpReal()&&!JS)sync().then(btn);else if(jpExpectReal()&&!XS&&_wait++<20)setTimeout(()=>{if(jpReal()&&!JS)sync().then(btn)},1500);
    btn();if(_auto)return;
    if(busy||!q('pop').hidden){setTimeout(maybe,1500);return}_auto=1;intro()}

  function intro(){const st=load();if(q('jpBtn'))q('jpBtn').remove();
    card(`<div class="hwbig">🐻</div><h2>荷包大補血<br>雪地跳跳搶禮物</h2><p style="margin:0">小熊往前衝，點螢幕跳起來拿禮物！只到今晚 12 點，不限次數</p>
      <div class="hwrule">👆 點螢幕跳，空中再點一下二段跳<br>🎁 +1、🧸 +2、⭐ +5（在高處）<br>🪙 金幣、鑽石是紅利點數（今天最多 ${JP_BCAP} 點）<br>🔔 拿到鈴鐺，5 秒內全部雙倍<br>⛄ 撞到雪堆、石頭，這局就結束<br>🏆 玩完按「送出成績」，比榜上高就蓋過去</div>
      <div class="jpprize">✨ 特別獎：一局拿到 ${JP_SPECIAL} 個禮物 → 現金點數 1111<br><small>限第一位達成的會員（有點數或堂數）</small><br>${PRIZE}</div>
      ${st.top?`<p style="margin:0 0 8px">你在榜上的成績 🎁 <b>${st.top}</b></p>`:''}
      <div class="acts"><button type="button" class="btn ghost" id="jpNo">晚點再玩</button><button type="button" class="btn ghost" id="jpRk">排行榜</button><button type="button" class="btn red" id="jpGo">開始</button></div>`);
    q('jpNo').onclick=()=>{q('pop').hidden=true;btn()};q('jpRk').onclick=()=>rankCard();q('jpGo').onclick=start;
    setTimeout(()=>{try{art()}catch(e){}},60)}

  async function start(){if(_busy)return;_busy=1;sfx('tap');{const b=q('jpGo');if(b){b.disabled=true;b.textContent='小熊準備中…'}}
    for(let i=0;i<40&&jpExpectReal()&&!XS;i++)await sleep(250);
    try{if(jpReal()){const j=await xcall(API,{op:'start'});JS=j.jp;RANK=j.rank}}
    catch(e){_busy=0;const b=q('jpGo');if(b){b.disabled=false;b.textContent='再試一次'}toast(e.message||'連線不穩，稍後再試');return}
    _busy=0;q('pop').hidden=true;done(await play())}

  /* 島上的 3D 模型畫成透明底的圖（借主畫面的 renderer，不另開 WebGL）。回傳 {c, ar 高/寬} */
  function shot(g,px,rotY){g.rotation.y=rotY||0;const sc=new THREE.Scene();sc.add(g);sc.add(new THREE.AmbientLight('#ffffff',.85));const dl=new THREE.DirectionalLight('#fff4dd',.9);dl.position.set(2,4,6);sc.add(dl);
    const box=new THREE.Box3().setFromObject(g),ctr=box.getCenter(new THREE.Vector3()),sz=box.getSize(new THREE.Vector3());
    const mw=Math.max(sz.x,.2)*1.1,mh=Math.max(sz.y,.2)*1.1,d=renderer.domElement;
    let hw=mw/2,hh=hw*d.height/d.width;if(hh<mh/2){hh=mh/2;hw=hh*d.width/d.height}
    const cam=new THREE.OrthographicCamera(-hw,hw,hh,-hh,.1,200);cam.position.set(ctr.x,ctr.y,ctr.z+40);cam.lookAt(ctr);
    const oc=new THREE.Color();renderer.getClearColor(oc);const oa=renderer.getClearAlpha();
    renderer.setClearColor(0x000000,0);renderer.render(sc,cam);
    const ppu=d.width/(2*hw),cw=Math.min(d.width,mw*ppu),ch=Math.min(d.height,mh*ppu),c=document.createElement('canvas');
    c.width=Math.max(8,Math.round(px));c.height=Math.max(8,Math.round(px*ch/cw));
    c.getContext('2d').drawImage(d,(d.width-cw)/2,(d.height-ch)/2,cw,ch,0,0,c.width,c.height);
    renderer.setClearColor(oc,oa);g.traverse(o=>{if(o.geometry)o.geometry.dispose()});
    return{c,ar:ch/cw}}
  let _art;
  function art(){if(_art!==undefined)return _art;_art=null;
    try{const A={};
      try{A.bear=shot(makeBear('#1c1c1f',1,false),300,.95)}catch(e){}
      try{A.tree=shot(makeXmasTree(1),300)}catch(e){}
      try{A.small=shot(makeXmasTreeSmall(),200)}catch(e){}
      try{A.snowman=shot(makeSnowman(),160,.5)}catch(e){}
      _art=A}catch(e){_art=null}
    try{renderer.render(scene,camera)}catch(e){}
    return _art}
  function sky(W,H,DP){const c=document.createElement('canvas');c.width=Math.ceil(W*DP);c.height=Math.ceil(H*DP);const g=c.getContext('2d');g.setTransform(DP,0,0,DP,0,0);
    const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#060b26');gr.addColorStop(.6,'#12205a');gr.addColorStop(1,'#2a4090');g.fillStyle=gr;g.fillRect(0,0,W,H);
    for(let i=0;i<Math.round(W*H/2600);i++){g.fillStyle=`rgba(255,255,240,${(.4+Math.random()*.55).toFixed(2)})`;g.beginPath();g.arc(Math.random()*W,Math.random()*H*.6,Math.random()*1.2+.3,0,7);g.fill()}
    const strip=document.createElement('canvas');strip.width=4;strip.height=160;{const k=strip.getContext('2d'),a=k.createLinearGradient(0,160,0,0);a.addColorStop(0,'rgba(170,255,200,0)');a.addColorStop(.06,'rgba(150,255,190,.95)');a.addColorStop(.25,'rgba(70,235,150,.65)');a.addColorStop(.6,'rgba(60,180,170,.25)');a.addColorStop(.85,'rgba(150,100,230,.12)');a.addColorStop(1,'rgba(150,100,230,0)');k.fillStyle=a;k.fillRect(0,0,4,160)}
    const RIB=[{b:.3,a:.04,h:.17,k:2.2,ph:0,al:.5},{b:.23,a:.035,h:.12,k:3.1,ph:2,al:.38},{b:.38,a:.025,h:.1,k:1.6,ph:4,al:.28}],tt=Math.random()*20,step=Math.max(2,W/200);
    g.globalCompositeOperation='lighter';
    for(const R of RIB)for(let x0=0;x0<W;x0+=step){const u=x0/W,y0=H*(R.b+R.a*Math.sin(u*R.k*6.283+tt+R.ph)+R.a*.5*Math.sin(u*R.k*13+tt*1.7));
      const fl=.45+.55*Math.pow(Math.sin(u*17+tt+R.ph),2),ed=Math.min(1,u*5,(1-u)*5),hh=H*R.h*(.8+.4*Math.sin(u*9+tt+R.ph));g.globalAlpha=R.al*fl*ed;g.drawImage(strip,x0,y0-hh*.94,step+.8,hh)}
    g.globalAlpha=1;g.globalCompositeOperation='source-over';
    g.fillStyle='rgba(255,244,200,.14)';g.beginPath();g.arc(W-58,H*.1+50,44,0,7);g.fill();g.fillStyle='#fff3c4';g.beginPath();g.arc(W-58,H*.1+50,25,0,7);g.fill();
    return c}

  const ITEMS={g1:{e:'🎁',g:1,lab:'+1',w:44},g2:{e:'🧸',g:2,lab:'+2',w:14},g5:{e:'⭐',g:5,lab:'+5',w:6,high:1,glow:'rgba(255,224,90,.55)'},
    c1:{e:'🪙',b:1,lab:'紅利 1',w:7},c3:{e:'🪙',b:3,lab:'紅利 3',w:2.5,big:1,glow:'rgba(255,224,90,.5)'},c5:{e:'💎',b:5,lab:'紅利 5',w:1,high:1,glow:'rgba(155,231,255,.6)'},
    bell:{e:'🔔',dbl:1,lab:'雙倍',w:6,glow:'rgba(255,243,176,.6)'}};
  const IK=Object.keys(ITEMS),IW=IK.reduce((a,k)=>a+ITEMS[k].w,0);

  function play(){return new Promise(res=>{MGN++;const gone=MGS();
    const DP=Math.min(2,devicePixelRatio||1),A=art()||{};
    const ov=document.createElement('div');ov.id='jpFull';
    ov.innerHTML=`<div class="jphud"><span>⏱ <b id="jpT">${JP_SEC}</b></span><span class="dbl" id="jpD" hidden>🔔 雙倍 <b id="jpDt">5.0</b></span><span>🎁 <b id="jpS">0</b>　🪙 <b id="jpB">0</b></span></div><canvas id="jpCv"></canvas><p class="jptip">點一下跳，空中再點一下可以二段跳</p>`;
    document.body.appendChild(ov);window.HW_ON=true;
    const cv=q('jpCv'),x=cv.getContext('2d');let W=0,H=0;
    {const r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*DP;cv.height=H*DP;x.setTransform(DP,0,0,DP,0,0)}
    const U=Math.min(W,560)/400,GROUND=H-Math.max(90,H*.16),GRAV=H*2.9,JUMP=H*1.02,bg=sky(W,H,DP);
    const hills=[];{let hx=0;while(hx<W*2.2){const r=Math.random(),k=r<.18?'tree':r<.32?'snowman':'small';hills.push({k,x:hx,s:k==='tree'?1:.6+Math.random()*.5});hx+=(k==='tree'?150:70+Math.random()*80)*U}}
    const bh=74*U,bear={x:W*.2,y:GROUND,vy:0,air:0,jumps:0,h:bh,w:bh/((A.bear&&A.bear.ar)||1.4),run:0};
    let things=[],fx=[],gift=0,bon=0,dbl=0,t0=performance.now(),el=0,over=false,crashed=false,flash=0,shake=0,nextItem=.6,nextObs=1.8,scroll=0,coins=0,lastT=-1,fastShown=false;
    const hudUp=()=>{q('jpS').textContent=gift;q('jpB').textContent=bon};
    const jump=e=>{if(e)e.preventDefault();if(over)return;if(bear.jumps<2){bear.vy=-(bear.jumps?JUMP*.85:JUMP);bear.jumps++;bear.air=1;sfx('tick')}};
    cv.addEventListener('pointerdown',jump);
    const speed=()=>(el>=JP_FAST?1.4:1)*W*.42+Math.min(el,JP_FAST)*W*.004;
    const pickItem=()=>{for(let n=0;n<6;n++){let r=Math.random()*IW,k=IK[0];for(const kk of IK){if((r-=ITEMS[kk].w)<=0){k=kk;break}}if(ITEMS[k].b&&coins>=6)continue;return k}return'g1'};
    function spawnItem(){const k=pickItem(),I=ITEMS[k];if(I.b)coins++;
      const lv=I.high?2:(Math.random()<.35?0:Math.random()<.75?1:2),y=GROUND-[28,150,250][lv]*U,n=(!I.high&&!I.dbl&&Math.random()<.35)?3:1;
      for(let j=0;j<n;j++)things.push({type:'item',k,x:W+40+j*46*U,y:y-(n>1?Math.sin(j/(n-1)*Math.PI)*30*U:0),r:22*U})}
    function spawnObs(){const big=el>8&&Math.random()<.35;things.push({type:'obs',k:Math.random()<.5?'pile':'rock',x:W+40,w:(big?70:44)*U,h:(big?50:36)*U})}
    function eat(it){it.done=1;const I=ITEMS[it.k],m=dbl>0?2:1;
      if(I.dbl){dbl=JP_DBL;fx.push({x:it.x,y:it.y,t:'🔔 雙倍 5 秒！',c:'#ffd447',a:1.3});sfx('chime');return}
      if(I.g){gift+=I.g*m;fx.push({x:it.x,y:it.y,t:'+'+I.g*m,c:m>1||I.g>=5?'#ffd447':'#fff',a:1});sfx(I.g>=5?'sparkle':'pop')}
      if(I.b){bon+=I.b*m;fx.push({x:it.x,y:it.y,t:'紅利 +'+I.b*m,c:'#ffd447',a:1});sfx('sparkle')}
      hudUp()}
    function crash(o){o.done=1;over=true;crashed=true;flash=1;shake=.4;fx.push({x:bear.x+30,y:bear.y-bear.h,t:'💥 撞到了！',c:'#ff6a5a',a:1.4});sfx('thunk');setTimeout(end,1300)}
    function drawObs(o){const ox=o.x,w=o.w,h=o.h,gy=GROUND;x.save();
      if(o.k==='pile'){x.fillStyle='#e9f0ff';x.strokeStyle='#2b3a6a';x.lineWidth=3;x.beginPath();x.moveTo(ox-w/2,gy);x.quadraticCurveTo(ox-w*.35,gy-h*1.1,ox,gy-h);x.quadraticCurveTo(ox+w*.4,gy-h*1.05,ox+w/2,gy);x.closePath();x.fill();x.stroke();
        x.fillStyle='#c9d6f2';x.beginPath();x.ellipse(ox+w*.12,gy-h*.35,w*.18,h*.14,0,0,7);x.fill()}
      else{x.fillStyle='#7b7f93';x.strokeStyle='#2b2320';x.lineWidth=3;x.beginPath();x.moveTo(ox-w/2,gy);x.lineTo(ox-w*.42,gy-h*.6);x.lineTo(ox-w*.1,gy-h);x.lineTo(ox+w*.3,gy-h*.85);x.lineTo(ox+w/2,gy-h*.3);x.lineTo(ox+w/2,gy);x.closePath();x.fill();x.stroke();
        x.fillStyle='#f4f7ff';x.beginPath();x.moveTo(ox-w*.42,gy-h*.6);x.lineTo(ox-w*.1,gy-h);x.lineTo(ox+w*.3,gy-h*.85);x.lineTo(ox+w*.15,gy-h*.72);x.lineTo(ox-w*.2,gy-h*.8);x.closePath();x.fill()}
      x.restore()}
    const end=()=>{window.HW_ON=false;ov.remove();res({sc:gift,b:bon,crashed,sec:el})};
    function frame(now){if(!ov.isConnected)return;if(gone()){window.HW_ON=false;ov.remove();return}
      const dt=Math.min(.05,(now-t0)/1000);t0=now;
      const sp=over?0:speed();scroll+=sp*dt;
      if(!over){el+=dt;
        if(!fastShown&&el>=JP_FAST){fastShown=true;fx.push({x:W/2,y:H*.4,t:'⚡ 最後 10 秒加速！',c:'#ffd447',a:1.6,big:true});sfx('toot')}
        bear.vy+=GRAV*dt;bear.y+=bear.vy*dt;if(bear.y>=GROUND){bear.y=GROUND;bear.vy=0;bear.jumps=0;bear.air=0}bear.run+=dt*(el>=JP_FAST?16:12);
        if(dbl>0)dbl=Math.max(0,dbl-dt);
        nextItem-=dt;if(nextItem<=0){spawnItem();nextItem=(el>=JP_FAST?.55:.75)*(.7+Math.random()*.6)}
        nextObs-=dt;if(nextObs<=0){spawnObs();nextObs=(el>=JP_FAST?1.0:1.35)*(.75+Math.random()*.6)}
        const bx0=bear.x-bear.w*.32,bx1=bear.x+bear.w*.32,by0=bear.y-bear.h*.9,by1=bear.y;
        for(const o of things){o.x-=sp*dt;if(o.done||over)continue;
          if(o.type==='obs'){if(bx1>o.x-o.w*.38&&bx0<o.x+o.w*.38&&by1>GROUND-o.h*.8)crash(o)}
          else{const px=Math.max(bx0,Math.min(o.x,bx1)),py=Math.max(by0,Math.min(o.y,by1));if(Math.hypot(o.x-px,o.y-py)<o.r)eat(o)}}
        things=things.filter(o=>!(o.done&&o.type==='item')&&o.x>-80);
        if(!over&&el>=JP_SEC){over=true;sfx('chime');setTimeout(end,1200)}}
      fx.forEach(f=>{f.y-=56*dt;f.a-=dt*1.3});fx=fx.filter(f=>f.a>0);
      x.save();if(shake>0){shake-=dt;x.translate((Math.random()-.5)*12,(Math.random()-.5)*12)}
      x.drawImage(bg,0,0,W,H);
      const far=GROUND-26*U;x.fillStyle='#a9bce6';x.beginPath();x.moveTo(0,H);x.lineTo(0,far);for(let hx=0;hx<=W;hx+=20)x.lineTo(hx,far-14*U*Math.sin((hx+scroll*.25)/90));x.lineTo(W,H);x.fill();
      const period=hills.length?hills[hills.length-1].x+120*U:W;
      for(const h of hills){const a=A[h.k];const hx=((h.x-scroll*.35)%period+period)%period-60*U;if(hx>W+80)continue;
        const hh=(h.k==='tree'?150:h.k==='snowman'?62:78)*U*h.s,base=far-14*U*Math.sin((hx+scroll*.25)/90)+6;
        if(a){const w=hh/a.ar;x.drawImage(a.c,hx-w/2,base-hh,w,hh)}else{x.font=Math.round(hh*.8)+'px sans-serif';x.textAlign='center';x.fillText(h.k==='snowman'?'⛄':'🎄',hx,base)}}
      x.fillStyle='#eef3ff';x.fillRect(0,GROUND-2,W,H-GROUND+2);x.fillStyle='#c9d6f2';for(let gx=-(scroll%60);gx<W;gx+=60)x.fillRect(gx,GROUND+16*U,26,4);
      x.strokeStyle='#ffffff';x.lineWidth=3;x.beginPath();x.moveTo(0,GROUND);x.lineTo(W,GROUND);x.stroke();
      x.textAlign='center';x.textBaseline='middle';
      for(const o of things){if(o.type==='obs'){drawObs(o);continue}if(o.done)continue;const I=ITEMS[o.k],s=(I.big?50:42)*U,bob=Math.sin(el*5+o.x*.02)*4;
        if(I.glow){x.fillStyle=I.glow;x.beginPath();x.arc(o.x,o.y+bob,s*.75,0,7);x.fill()}
        x.font=Math.round(s)+'px sans-serif';x.fillText(I.e,o.x,o.y+bob);
        x.font='800 '+Math.round(11*U+1)+'px sans-serif';const tw=x.measureText(I.lab).width+10;
        x.fillStyle=I.dbl||I.b||I.g>=5?'#ffd447':'rgba(255,255,255,.95)';x.strokeStyle='#2b2320';x.lineWidth=1.5;x.beginPath();
        if(x.roundRect)x.roundRect(o.x-tw/2,o.y+bob+s*.5,tw,16,8);else x.rect(o.x-tw/2,o.y+bob+s*.5,tw,16);x.fill();x.stroke();x.fillStyle='#2b2320';x.fillText(I.lab,o.x,o.y+bob+s*.5+8.5)}
      {const sq=bear.air?1:1+Math.sin(bear.run)*.05,hop=bear.air||over?0:Math.abs(Math.sin(bear.run))*5*U;
        x.fillStyle='rgba(30,40,80,.18)';x.beginPath();x.ellipse(bear.x,GROUND+3,bear.w*.4*(1-Math.min(.5,(GROUND-bear.y)/400)),6,0,0,7);x.fill();
        x.save();x.translate(bear.x,bear.y-hop);x.rotate(crashed?-.5:bear.air?-.12:Math.sin(bear.run)*.06);x.scale(1/sq,sq);
        if(A.bear)x.drawImage(A.bear.c,-bear.w/2,-bear.h,bear.w,bear.h);else{x.font=Math.round(bear.h*.9)+'px sans-serif';x.fillText('🐻',0,-bear.h/2)}
        x.restore()}
      for(const f of fx){x.globalAlpha=Math.max(0,Math.min(1,f.a));x.font=`900 ${Math.round((f.big?26:22)*U)}px sans-serif`;x.lineWidth=4;x.strokeStyle='#1a1430';x.strokeText(f.t,f.x,f.y);x.fillStyle=f.c;x.fillText(f.t,f.x,f.y);x.globalAlpha=1}
      if(dbl>0&&!over){x.strokeStyle=`rgba(255,212,71,${.55+.3*Math.sin(el*10)})`;x.lineWidth=10;x.strokeRect(5,5,W-10,H-10)}
      if(flash>0){flash-=dt*2.2;x.fillStyle=`rgba(255,60,40,${Math.max(0,flash)*.45})`;x.fillRect(-12,-12,W+24,H+24)}
      if(over&&!crashed){x.fillStyle='rgba(7,13,43,.5)';x.fillRect(-12,-12,W+24,H+24);x.font=`900 ${Math.round(40*U)}px sans-serif`;x.fillStyle='#ffd447';x.strokeStyle='#1a1430';x.lineWidth=6;x.strokeText('時間到！',W/2,H/2);x.fillText('時間到！',W/2,H/2)}
      x.restore();
      const lt=Math.ceil(Math.max(0,JP_SEC-el));if(lt!==lastT){lastT=lt;q('jpT').textContent=lt}
      const dOn=dbl>0&&!over;if(q('jpD').hidden===dOn)q('jpD').hidden=!dOn;if(dOn)q('jpDt').textContent=dbl.toFixed(1);
      if(ov.isConnected)requestAnimationFrame(frame)}
    requestAnimationFrame(frame)})}

  const rkLine=()=>RANK&&RANK.me?`你在榜上 🎁 <b>${load().top}</b>・第 <b>${RANK.me}</b> 名（共 ${RANK.total} 人）`:(load().top?`你在榜上 🎁 <b>${load().top}</b>`:'你還沒有送出成績');
  async function done(r){const st0=load(),sc=r.sc,b=r.b||0;let add=0,addB=0,swap=0,bad=false,spc='';
    if(jpReal()){let j=null;for(let i=0;i<3&&!j;i++){try{j=await xcall(API,{op:'end',gift:sc,bonus:b})}catch(e){if(i===2||/結束/.test(e.message||'')){toast(e.message||'連線不穩，成績沒送出去');break}await new Promise(z=>setTimeout(z,1200))}}
      if(j){JS=j.jp;RANK=j.rank;add=j.jpRes.addG;addB=j.jpRes.addB;swap=j.jpRes.swap||0;bad=!!j.jpRes.bad;spc=j.jpRes.special||'';try{hud()}catch(e){}}}
    else{const g=Math.min(JP_GCAP,sc);add=Math.max(0,g-st0.best);const st=Object.assign({},st0,{plays:st0.plays+1,best:Math.max(st0.best,g),bbest:Math.max(st0.bbest,Math.min(JP_BCAP,b)),last:sc});keep(st);if(add){G.gifts+=add;try{save();hud()}catch(e){}}}
    const st=load(),can=jpReal()&&!bad&&sc>st.top;
    const SPM={won:'✨ 恭喜！你是第一位拿到特別獎的會員，現金點數 1111，工作室會跟你聯絡',taken:'✨ 拿到 150 個了！不過特別獎已經有人先拿走，排行榜還能拚',notMember:'✨ 拿到 150 個了！特別獎限會員（有點數或堂數），排行榜照樣算',sim:'✨ 示範模式：這局有達到特別獎門檻（不會真的發）'},spMsg=SPM[spc]||'';
    const got=[add+swap?`🎁 聖誕禮物 <b>${add+swap}</b> 個`:'',addB?`🪙 紅利 <b>${addB}</b> 點`:''].filter(Boolean).join('、');
    card(`<div class="hwbig">${r.crashed?'💥':'🐻'}</div><h2>${r.crashed?`撞到了！跑了 ${Math.floor(r.sec)} 秒`:'時間到！跑完全程'}</h2>
      <div class="hwsc">🎁 ${sc}　🪙 ${b}</div>
      ${got?`<p style="margin:0 0 6px">入帳 ${got}</p>`:''}
      ${spMsg?`<p style="margin:0 0 8px;font-weight:800;color:#b8721a">${spMsg}</p>`:''}
      <p style="margin:0 0 10px;font-size:14px">${jpReal()?(can?(st.top?`比你榜上的 🎁 ${st.top} 高，送出去就會蓋過去`:'送出成績就能上排行榜'):(st.top?`沒有超過你榜上的 🎁 <b>${st.top}</b>，再挑戰一次`:'再挑戰一次，拿到分數就能上榜')):'這是體驗版，用 LINE 登入才能上排行榜'}</p>
      <div class="acts">${can?`<button type="button" class="btn red" id="jpUp">送出成績</button>`:''}<button type="button" class="btn ${can?'ghost':'red'}" id="jpGo">再玩一次</button><button type="button" class="btn ghost" id="jpRk">排行榜</button><button type="button" class="btn ghost" id="jpNo">先這樣</button></div>`);
    q('jpNo').onclick=()=>{q('pop').hidden=true;btn()};q('jpGo').onclick=start;q('jpRk').onclick=()=>rankCard();
    if(q('jpUp'))q('jpUp').onclick=async()=>{const u=q('jpUp');u.disabled=true;u.textContent='送出中…';
      try{const j=await xcall(API,{op:'submit'});JS=j.jp;RANK=j.rank;sfx('chime');rankCard('成績送出去了！')}catch(e){u.disabled=false;u.textContent='送出成績';toast(e.message||'連線不穩，再按一次')}}}

  async function rankCard(msg){
    if(jpReal()&&!msg){try{const j=await xcall(API,{op:'rank'});JS=j.jp;RANK=j.rank}catch(e){}}
    const top=(RANK&&RANK.top)||[],medal=['🥇','🥈','🥉'];
    card(`<h2>🏆 荷包大補血排行榜</h2>${msg?`<p style="margin:0 0 4px">${msg}</p>`:''}
      <div class="jpprize">✨ 特別獎：一局拿到 ${JP_SPECIAL} 個禮物 → 現金點數 1111<br><small>限第一位達成的會員（有點數或堂數）</small><br>${PRIZE}<br>只到今晚 12 點，比的是禮物數</div>
      ${top.length?`<ol class="jprank">${top.map((x,i)=>`<li class="${x.me?'me':''}"><i>${medal[i]||i+1}</i><span>${x.me?'你':(x.n||'神秘玩家')}</span><b>🎁 ${x.s}</b></li>`).join('')}</ol>`:`<p style="margin:10px 0">${jpReal()?'還沒有人送出成績，你可以當第一個！':'用 LINE 登入才看得到排行榜'}</p>`}
      <p style="margin:0 0 10px;font-size:14px">${jpReal()?rkLine():''}</p>
      <div class="acts"><button type="button" class="btn ghost" id="jpNo">關閉</button><button type="button" class="btn red" id="jpGo">${load().plays?'再玩一次':'開始玩'}</button></div>`);
    q('jpNo').onclick=()=>{q('pop').hidden=true;btn()};q('jpGo').onclick=start}

  window.Jump12={intro,on:jpOn};
  setTimeout(maybe,700);
})();
