/* ---------- 2026-11-11 晚大熊：「雪地跳跳・小熊搶禮物」（大熊 11/11 改名，不要寫雙 11），只有 11/12 一天（park.html?jump=1 隨時預覽；雪橇丟禮物 sled.js 沒開放，留著備用） ----------
   像沒網路時的小恐龍：小熊一直往前跑，點螢幕跳（空中可再跳一次），吃禮物、紅利；撞到雪堆、石頭這局直接結束（大熊選的）。（11/11 晚改：不限時間、越跑越快，撞到才結束；空中最多連跳 3 下；障礙變少；結束畫面停在遊戲上；特別獎門檻 100）
   🎁 +1、🧸 +2、⭐ +5（只在高處，要二段跳）、金幣 紅利 1／3、鑽石 紅利 5、🔔 5 秒雙倍。
   背景＝平面夜空＋極光＋雪坡，後面捲動島上的聖誕樹、雪人模型；小熊＝遊樂島那隻 makeBear()。
   不限次數；每局結束看成績，玩完自動上排行榜（只留最好的一局，比榜上高才蓋過去；2026-11-12 起老闆、員工也上同一個榜），排名只看禮物數。伺服器 /xmas/jump12；訪客體驗版只記在這支手機、不上榜。
   用到 park.html 的：card toast sfx hud save xcall XS G token gToday sleep busy MGN MGS renderer scene camera makeBear makeXmasTree makeXmasTreeSmall makeSnowman THREE，玩的時候 window.HW_ON 暫停 3D */
(function(){
  const JP_DAY='2026-11-12',JP_SEC=30,JP_FAST=20,JP_GCAP=20,JP_BCAP=15,JP_DBL=5,JP_LIVE=true;
  const PRIZE='🥇 第一名 現金點數 111<br>🥈 第二名 A5 水彩繪本<br>🥉 第三名 聖誕公公娃娃一組';
  const API='/xmas/jump12',JP_SPECIAL=888,JP_HARD=700,   /* 2026-11-12 大熊：今天拿過 700 以上，之後每局困難模式 */   /* 2026-11-12 大熊：換 3D 300→1000→666（炸彈難）→888（大熊 147 秒拿 733） */
  JP_JUMPS=3;   /* 2026-11-11 大熊：4 下太多，改 3 下 */
  const q=id=>document.getElementById(id);
  const jpOn=()=>!window.KIOSK&&(/[?&]jump=1/.test(location.search)||(JP_LIVE&&gToday()===JP_DAY&&new Date(Date.now()+8*3600e3).getUTCHours()>=10));   /* 2026-11-11 大熊：10:00–23:59 */
  const jpReal=()=>!!(window.PROD&&XS&&!window.GUEST&&token());
  const jpExpectReal=()=>!!(window.PROD&&!window.GUEST&&!window.KIOSK&&token());
  let JS=null,RANK=null,_auto=0,_wait=0,_busy=0;
  const KEY='otto2-jump-'+JP_DAY;
  function load(){if(jpReal()&&JS)return JS;try{return Object.assign({plays:0,best:0,bbest:0,top:0,last:0},JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){return{plays:0,best:0,bbest:0,top:0,last:0}}}
  function keep(st){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
  async function sync(){if(!jpReal())return;try{const j=await xcall(API,{op:'info'});JS=j.jp;RANK=j.rank}catch(e){}}

  const css=document.createElement('style');
  css.textContent='#jpBtn{position:fixed;right:12px;top:calc(env(safe-area-inset-top,0px) + 132px);z-index:30;display:flex;align-items:center;gap:4px;height:44px;padding:0 14px 0 10px;border-radius:99px;border:3px solid #2b2320;background:#d63a2f;color:#fff;font:800 15px/1 inherit;box-shadow:0 4px 0 #2b2320;cursor:pointer;animation:hwBob 1.6s ease-in-out infinite;white-space:nowrap}#jpBtn i{font-style:normal;font-size:24px}'  /* 2026-11-11 大熊：小熊圓鈕看不懂 → 紅底膠囊寫字 */

    +'#jpFull{position:fixed;inset:0;z-index:60;background:#0b1437;touch-action:none;user-select:none;-webkit-user-select:none}'
    +'#jpFull canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}'
    +'.jphud{position:absolute;left:0;right:0;top:0;z-index:1;pointer-events:none;display:flex;justify-content:space-between;gap:6px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 0;color:#fff;font-size:16px;font-weight:800}'
    +'.jphud span{background:rgba(11,20,55,.72);border:1px solid rgba(255,255,255,.25);border-radius:20px;padding:5px 11px;white-space:nowrap}.jphud b{color:#ffd447;font-size:20px}'
    +'.jphud .dbl{background:#ffd447;color:#3a2600;border-color:#ffd447}.jphud .dbl b{color:#3a2600}'
    +'.jptip{position:absolute;left:0;right:0;bottom:0;z-index:1;margin:0;padding:6px 0 calc(env(safe-area-inset-bottom,0px) + 10px);text-align:center;color:#2b3a6a;font-size:13px;font-weight:700;pointer-events:none}'
    +'.jprank{list-style:none;margin:8px 0 10px;padding:0;text-align:left;font-size:15px}.jprank li{display:flex;gap:8px;align-items:center;padding:5px 10px;border-radius:10px}'
    +'.jprank li:nth-child(odd){background:#fff6ea}.jprank li.me{background:#ffe08a;font-weight:800}.jprank i{font-style:normal;width:30px;text-align:center}.jprank b{margin-left:auto}'
    +'.jpprize{background:#fff6ea;border:2px solid #f0d2a8;border-radius:12px;padding:6px 10px;font-size:13px;line-height:1.6;margin:6px 0 10px}'
    +'.jpin{display:flex;flex-direction:column;gap:10px;text-align:center}.jpin .jpbear{font-size:46px;line-height:1}'
    +'.jpin h2{margin:0;line-height:1.15}.jpin h2 small{display:block;font-size:17px;color:#2b2320;margin-top:4px;letter-spacing:.04em}'
    +'.jpin .jpsub{margin:0;font-size:13px;color:#6b5d55}.jpin .jpstart{width:100%;font-size:21px;padding:11px 0}'
    +'.jpgrid{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:6px;text-align:left}'
    +'.jpgrid li{display:flex;gap:6px;align-items:center;background:#fff6ea;border-radius:12px;padding:6px 8px;font-size:13px;line-height:1.3;min-width:0}'
    +'.jpgrid i{font-style:normal;font-size:22px;flex:none}.jpgrid small{color:#7a6a60;font-size:11.5px}'
    +'.jpsp{display:flex;flex-direction:column;gap:2px;background:linear-gradient(135deg,#fff3c4,#ffe08a);border:2px solid #e8b94a;border-radius:12px;padding:7px 10px}.jpsp b{font-size:16px;color:#8a5a00}.jpsp span{font-size:12px;color:#6b4a00}'
    +'.jptop{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;text-align:left;font-size:14px}'
    +'.jptop li{display:flex;align-items:center;gap:8px;padding:4px 10px;border-radius:10px;background:#fff}.jptop i{font-style:normal;font-size:20px}.jptop b{margin-left:auto;font-size:14px}'
    +'.jpin .jpme{margin:0;font-size:14px}.jpbtns{display:grid;grid-template-columns:1fr 1fr;gap:8px}.jpbtns .btn{font-size:16px;padding:8px 0;width:100%}'
    +'.jpgrid li span{min-width:0;white-space:nowrap}.jpgrid li{min-height:48px;box-sizing:border-box}.jptop li{min-height:36px;box-sizing:border-box}.jpin>*{box-sizing:border-box;width:100%}.jpin .jpbear{width:auto;align-self:center}';
  document.head.appendChild(css);

  function btn(){let b=q('jpBtn');if(!jpOn()){if(b)b.remove();return}
    if(!b){b=document.createElement('button');b.id='jpBtn';b.type='button';b.setAttribute('aria-label','荷包大補血・雪地跳跳搶禮物');b.onclick=()=>{if(!busy&&q('pop').hidden)intro()};document.body.appendChild(b)}
    b.innerHTML='<i>🐻</i>雪地跳跳'}
  async function maybe(){if(!jpOn())return;
    if(jpReal()&&!JS)sync().then(btn);else if(jpExpectReal()&&!XS&&_wait++<20)setTimeout(()=>{if(jpReal()&&!JS)sync().then(btn)},1500);
    btn();if(_auto)return;
    if(busy||!q('pop').hidden){setTimeout(maybe,1500);return}_auto=1;intro()}

  const MYV=((document.currentScript&&document.currentScript.src)||'').replace(/.*[?&]v=/,'');
  let _fc=0;
  function freshCheck(){if(_fc++||!MYV)return;   /* 2026-11-11：LINE 裡頁面一直開著會停在舊版，打開遊戲時比對一次，舊了就重新整理 */
    fetch('park.html?_='+Date.now(),{cache:'no-store'}).then(r=>r.text()).then(t=>{const m=t.match(/jump\.js\?v=([\w]+)/);
      if(m&&m[1]!==MYV){const u=new URLSearchParams(location.search);u.set('v',String(Date.now()));if(!u.has('jump'))u.set('jump','1');u.set('nogf','1');location.replace('park.html?'+u.toString())}}).catch(()=>{})}
  function intro(){freshCheck();const st=load();if(q('jpBtn'))q('jpBtn').remove();
    /* 2026-11-11 大熊嫌排版醜：重排成 規則兩欄小格＋特別獎一塊＋前三名清單，開始鈕滿寬放最上面 */
    card(`<div class="jpin">${lineBox()}<div class="jpbear">🐻</div><h2>荷包大補血<small>雪地跳跳搶禮物</small></h2>
      <p class="jpsub">三條跑道搶禮物・不限次數・10:00–23:59</p>
      <ul class="jpgrid">
        <li><i>👆</i><span>左右滑換跑道<br><small>往上滑跳，最多連跳 3 下</small></span></li>
        <li><i>🎁</i><span>禮物 +1<br><small>🧸 +2・⭐ +5 在高處</small></span></li>
        <li><i>🪙</i><span>金幣・鑽石<br><small>紅利點數，每場最多 ${JP_BCAP} 點</small></span></li>
        <li><i>🔔</i><span>發光鈴鐺<br><small>5 秒內全部雙倍</small></span></li>
        <li><i>⚠️</i><span>撞到紅圈障礙<br><small>這局就結束</small></span></li>
        <li><i>🎅</i><span>30 秒雪橇空襲<br><small>🎁+10・💣扣半・🌟×2</small></span></li>
      </ul>
      <div class="jpsp"><b>✨ 特別獎 現金點數 1111</b><span>一局拿到 ${JP_SPECIAL} 個禮物・限前 5 位達成的會員（員工也算）<br>獎品二選一：贈送儲值點 1111（3 個月內用）或方案展延 5 個月<br>拿到特別獎的人、員工不列入前三名</span></div>
      <ol class="jptop"><li><i>🥇</i>第一名<b>現金點數 111</b></li><li><i>🥈</i>第二名<b>A5 水彩繪本</b></li><li><i>🥉</i>第三名<b>聖誕公公娃娃一組</b></li></ol>
      ${st.top?`<p class="jpme">你在榜上 🎁 <b>${st.top}</b></p>`:''}
      <div class="jpbtns"><button type="button" class="btn ghost" id="jpRk">排行榜</button><button type="button" class="btn ghost" id="jpNo">晚點再玩</button></div>
      <button type="button" class="btn ${jpExpectReal()?'red':'ghost'} jpstart" id="jpGo">${jpExpectReal()?'開始玩':'先試玩（不算成績）'}</button></div>`);   /* 2026-11-11 大熊：開始玩放最下面 */
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
      try{const g=makeSanta();g.scale.setScalar(1);A.santa=shot(g,420)}catch(e){}
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
  /* 2026-11-12 大熊：第 30 秒起每 30 秒，聖誕老公公拉雪橇飛過一次，丟大禮包 +10、炸彈（禮物扣一半）、加速星（5 秒變快但禮物雙倍） */
  Object.assign(ITEMS,{xg:{e:'🎁',g:10,lab:'+10',w:0,huge:1,glow:'rgba(255,224,90,.6)'},xb:{e:'💣',bomb:1,lab:'扣一半',w:0},xs:{e:'🌟',boost:1,lab:'加速×2',w:0,glow:'rgba(150,220,255,.7)'}});
  const SANTA_EVERY=/[?&]jpsanta=1/.test(location.search)?6:30,   /* ?jpsanta=1：測試用，6 秒就來 */
    SANTA_PASS=6,BOOST=5;
  const IK=Object.keys(ITEMS).filter(k=>ITEMS[k].w>0),IW=IK.reduce((a,k)=>a+ITEMS[k].w,0);

  function closeOv(){const o=q('jpFull');if(o)o.remove();window.HW_ON=false;q('pop').style.zIndex=''}
  /* 2026-11-12 大熊：換成 3D（jump3d.js）；開不了 3D 或 ?jp2d=1 才用下面的平面版 play2d */
  const TKEY='otto2-jump3d-tut';
  /* 2026-11-12 大熊：有人從網頁連結（訪客版／沒登入）玩到 776 沒上榜。沒登入 LINE 的一律先提醒、給一顆直接開 LINE 遊樂島的按鈕 */
  const LINE_JP='https://liff.line.me/2010906803-FMDYktUN?go=jump';
  /* 2026-11-12 13:40 修：剛打開遊樂島時資料還沒載完，jpReal() 暫時是 false，LINE 裡的人也看到紅框。改看有沒有 LINE 登入（jpExpectReal） */
  const lineBox=()=>jpExpectReal()?'':`<div style="background:#d63a2f;color:#fff;border-radius:14px;padding:12px 12px 10px;margin:0 0 12px;text-align:center;font-weight:800;line-height:1.5">⚠️ 你現在是用網頁連結玩<br><span style="font-weight:600;font-size:14px">這裡玩的成績<u>不會</u>上排行榜、也拿不到獎品</span>
    <a href="${LINE_JP}" style="display:block;margin-top:8px;background:#ffd447;color:#5a3a00;border-radius:999px;padding:10px;text-decoration:none;font-size:17px">👉 用 LINE 打開來玩（成績才算）</a></div>`;
  function play(){if(!window.JumpPlay3D||/[?&]jp2d=1/.test(location.search))return play2d();
    closeOv();MGN++;const gone=MGS();const ov=document.createElement('div');ov.id='jpFull';document.body.appendChild(ov);window.HW_ON=true;
    const st=load(),hard=Math.max(+st.top||0,+st.hi||0,+st.last||0)>=JP_HARD;
    let tutorial=true;try{tutorial=!localStorage.getItem(TKEY);localStorage.setItem(TKEY,'1')}catch(e){}
    return window.JumpPlay3D({ov,gone,sfx,bcap:JP_BCAP,jumps:JP_JUMPS,santaEvery:SANTA_EVERY,tutorial:tutorial&&!hard,hard}).catch(e=>{console.warn('3D 開不了，改平面版',e);closeOv();return play2d()})}
  /* 2026-11-12 大熊：平面版也放進一般小遊戲（遊戲室＋走格子一格）。opt.mini＝小遊戲模式：右上多一顆「不玩了」、紅利上限用 opt.bcap */
  function play2d(opt){opt=opt||{};const BC=opt.bcap!=null?opt.bcap:JP_BCAP;closeOv();return new Promise(res=>{MGN++;const gone=MGS();
    const DP=Math.min(2,devicePixelRatio||1),A=art()||{};
    const ov=document.createElement('div');ov.id='jpFull';
    ov.innerHTML=`<div class="jphud"><span>⏱ <b id="jpT">0</b> 秒</span><span class="dbl" id="jpD" hidden>🔔 雙倍 <b id="jpDt">5.0</b></span><span class="dbl" id="jpBo" hidden style="background:#9be7ff;border-color:#9be7ff">🌟 加速×2 <b id="jpBot">5.0</b></span><span>🎁 <b id="jpS">0</b>　🪙 <b id="jpB">0</b></span></div><canvas id="jpCv"></canvas>${opt.mini?'<button type="button" id="jpQuit" style="position:absolute;right:12px;top:calc(env(safe-area-inset-top,0px) + 52px);z-index:2;font:inherit;font-size:14px;color:#2b2320;background:#fffaf2;border:2px solid #2b2320;border-radius:99px;padding:5px 13px;box-shadow:0 3px 0 #2b2320">✕ 不玩了</button>':''}<p class="jptip">點一下跳，在空中還能再點，最多連跳 3 下</p>`;
    document.body.appendChild(ov);window.HW_ON=true;
    if(opt.mini&&q('jpQuit'))q('jpQuit').onclick=e=>{e.stopPropagation();if(opt.quit)opt.quit()};
    const cv=q('jpCv'),x=cv.getContext('2d');let W=0,H=0;
    {const r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*DP;cv.height=H*DP;x.setTransform(DP,0,0,DP,0,0)}
    const U=Math.min(W,560)/400,GROUND=Math.round(H*.64),  /* 2026-11-11 大熊：手指會擋住，地面移到約 2/3 高 */
      GRAV=H*2.9,JUMP=H*1.02,bg=sky(W,H,DP);
    /* 前景大樹：地面下面那一片雪地上，跑得比地面快（1.35 倍）、樹頂不超過跑道，製造前後感 */
    const fronts=[];{let fx0=0;while(fx0<W*2.4){fronts.push({k:Math.random()<.75?'tree':'small',x:fx0,s:.78+Math.random()*.22});fx0+=(120+Math.random()*150)*U}}
    const hills=[];{let hx=0;while(hx<W*2.2){const r=Math.random(),k=r<.18?'tree':r<.32?'snowman':'small';hills.push({k,x:hx,s:k==='tree'?1:.6+Math.random()*.5});hx+=(k==='tree'?150:70+Math.random()*80)*U}}
    const bh=74*U,bear={x:W*.2,y:GROUND,vy:0,air:0,jumps:0,h:bh,w:bh/((A.bear&&A.bear.ar)||1.4),run:0};
    let santa={on:0,t:0,next:SANTA_EVERY,warn:0,drop:0,stars:0},boost=0,things=[],fx=[],gift=0,bon=0,dbl=0,t0=performance.now(),el=0,over=false,crashed=false,flash=0,shake=0,nextItem=.6,nextObs=2.6,scroll=0,coins=0,lastT=-1,fastShown=0;
    const hudUp=()=>{q('jpS').textContent=gift;q('jpB').textContent=bon};
    const jump=e=>{if(e)e.preventDefault();if(over)return;if(bear.jumps<JP_JUMPS){bear.vy=-(bear.jumps?JUMP*.78:JUMP);bear.jumps++;bear.air=1;sfx('tick')}};  /* 2026-11-11 大熊：空中可以多跳幾下 */
    cv.addEventListener('pointerdown',jump);
    const ramp=()=>Math.max(0,Math.min(1,(el-40)/30)),sp1=()=>1+ramp()*.6,speed=()=>sp1()*W*.42*(boost>0?1.35:1);  /* 2026-11-11 大熊：前 40 秒速度不變，第 40 秒起 30 秒內加到 1.6 倍 */
    const pickItem=()=>{for(let n=0;n<6;n++){let r=Math.random()*IW,k=IK[0];for(const kk of IK){if((r-=ITEMS[kk].w)<=0){k=kk;break}}if(ITEMS[k].b&&coins>=6)continue;return k}return'g1'};
    function spawnItem(){const k=pickItem(),I=ITEMS[k];if(I.b)coins++;
      const lv=I.high?2:(Math.random()<.35?0:Math.random()<.75?1:2),y=GROUND-[28,150,250][lv]*U,n=(!I.high&&!I.dbl&&Math.random()<.35)?3:1;
      for(let j=0;j<n;j++)things.push({type:'item',k,x:W+40+j*46*U,y:y-(n>1?Math.sin(j/(n-1)*Math.PI)*30*U:0),r:22*U})}
    /* 聖誕老公公：從右邊飛到左邊，經過畫面右半邊時每 0.45 秒丟一個，東西往下掉到三種高度之一再跟著畫面往左跑 */
    function santaTick(dt){
      if(!santa.on){if(!santa.warn&&el>=santa.next-2){santa.warn=1;fx.push({x:W/2,y:H*.3,t:'🎅 聖誕老公公來了！',c:'#ffd447',a:2,big:true});sfx('chime')}
        if(el>=santa.next){santa.on=1;santa.t=0;santa.drop=.3;santa.stars=0}return}
      santa.t+=dt;const p=santa.t/SANTA_PASS;santa.x=W+150-(W*.95+150)*p;santa.y=H*.2+Math.sin(santa.t*3)*8;
      if(santa.x<W*.98&&santa.x>W*.38){santa.drop-=dt;if(santa.drop<=0){santa.drop=.45;
        let r=Math.random(),k=r<.5?'xg':r<.85?'xb':'xs';if(k==='xs'&&santa.stars++>=1)k='xg';
        things.push({type:'item',k,x:santa.x-30*U,y:santa.y+20*U,ty:GROUND-[28,150,250][Math.floor(Math.random()*3)]*U,fall:1,r:(k==='xg'?26:22)*U})}}
      if(p>=1){santa.on=0;santa.warn=0;santa.next+=SANTA_EVERY}}
    function spawnObs(){const big=el>40&&Math.random()<.25;things.push({type:'obs',k:Math.random()<.5?'pile':'rock',x:W+40,w:(big?70:44)*U,h:(big?50:36)*U})}
    function eat(it){it.done=1;const I=ITEMS[it.k],m=(dbl>0||boost>0)?2:1;
      if(I.bomb){const lost=gift-Math.floor(gift/2);gift=Math.floor(gift/2);flash=.7;shake=.3;fx.push({x:it.x,y:it.y,t:lost?`💣 禮物少一半！-${lost}`:'💣 碰！',c:'#ff6a5a',a:1.4});sfx('thunk');hudUp();return}
      if(I.boost){boost=BOOST;fx.push({x:it.x,y:it.y,t:'🌟 加速！禮物雙倍 5 秒',c:'#9be7ff',a:1.4});sfx('toot');return}
      if(I.dbl){dbl=JP_DBL;fx.push({x:it.x,y:it.y,t:'🔔 雙倍 5 秒！',c:'#ffd447',a:1.3});sfx('chime');return}
      if(I.g){gift+=I.g*m;fx.push({x:it.x,y:it.y,t:'+'+I.g*m,c:m>1||I.g>=5?'#ffd447':'#fff',a:1});sfx(I.g>=5?'sparkle':'pop')}
      if(I.b){const b0=bon;bon=Math.min(BC,bon+I.b*m);const got=bon-b0;fx.push({x:it.x,y:it.y,t:got?(bon>=BC?`紅利 +${got}（滿 ${BC} 點了）`:'紅利 +'+got):`紅利滿 ${BC} 點了`,c:'#ffd447',a:1});sfx('sparkle')}  /* 2026-11-12 大熊：每場紅利最多 15 點 */
      hudUp()}
    function crash(o){o.done=1;over=true;crashed=true;flash=1;shake=.4;fx.push({x:bear.x+30,y:bear.y-bear.h,t:'💥 撞到了！',c:'#ff6a5a',a:1.4});sfx('thunk');setTimeout(end,1000)}
    function drawObs(o){const ox=o.x,w=o.w,h=o.h,gy=GROUND;x.save();
      if(o.k==='pile'){x.fillStyle='#e9f0ff';x.strokeStyle='#2b3a6a';x.lineWidth=3;x.beginPath();x.moveTo(ox-w/2,gy);x.quadraticCurveTo(ox-w*.35,gy-h*1.1,ox,gy-h);x.quadraticCurveTo(ox+w*.4,gy-h*1.05,ox+w/2,gy);x.closePath();x.fill();x.stroke();
        x.fillStyle='#c9d6f2';x.beginPath();x.ellipse(ox+w*.12,gy-h*.35,w*.18,h*.14,0,0,7);x.fill()}
      else{x.fillStyle='#7b7f93';x.strokeStyle='#2b2320';x.lineWidth=3;x.beginPath();x.moveTo(ox-w/2,gy);x.lineTo(ox-w*.42,gy-h*.6);x.lineTo(ox-w*.1,gy-h);x.lineTo(ox+w*.3,gy-h*.85);x.lineTo(ox+w/2,gy-h*.3);x.lineTo(ox+w/2,gy);x.closePath();x.fill();x.stroke();
        x.fillStyle='#f4f7ff';x.beginPath();x.moveTo(ox-w*.42,gy-h*.6);x.lineTo(ox-w*.1,gy-h);x.lineTo(ox+w*.3,gy-h*.85);x.lineTo(ox+w*.15,gy-h*.72);x.lineTo(ox-w*.2,gy-h*.8);x.closePath();x.fill()}
      x.restore()}
    const end=()=>{res({sc:gift,b:bon,crashed,sec:el})};  /* 2026-11-11 大熊：結束不要跳回走格子，畫面留著，結果視窗蓋在上面（closeOv 才收掉） */
    function frame(now){if(!ov.isConnected)return;if(gone()){window.HW_ON=false;ov.remove();return}
      const dt=Math.min(.05,(now-t0)/1000);t0=now;
      const sp=over?0:speed();scroll+=sp*dt;
      if(!over){el+=dt;
        {const k=el>=40?1+Math.floor((el-40)/15):0;if(k>fastShown&&k<=3){fastShown=k;fx.push({x:W/2,y:H*.4,t:'⚡ 加速！',c:'#ffd447',a:1.6,big:true});sfx('toot')}}
        bear.vy+=GRAV*dt;bear.y+=bear.vy*dt;if(bear.y<H*.2+bear.h){bear.y=H*.2+bear.h;if(bear.vy<0)bear.vy=0}if(bear.y>=GROUND){bear.y=GROUND;bear.vy=0;bear.jumps=0;bear.air=0}bear.run+=dt*12*sp1();
        if(dbl>0)dbl=Math.max(0,dbl-dt);if(boost>0)boost=Math.max(0,boost-dt);
        santaTick(dt);
        nextItem-=dt;if(nextItem<=0){spawnItem();nextItem=(.75/Math.sqrt(sp1()))*(.7+Math.random()*.6)}
        nextObs-=dt;if(nextObs<=0){spawnObs();nextObs=(2.4-ramp()*.9)*(.8+Math.random()*.6)}  /* 2026-11-11 大熊：障礙太多太難 */
        const bx0=bear.x-bear.w*.32,bx1=bear.x+bear.w*.32,by0=bear.y-bear.h*.9,by1=bear.y;
        for(const o of things){o.x-=sp*dt;if(o.fall){o.y=Math.min(o.ty,o.y+H*.7*dt);if(o.y>=o.ty)o.fall=0}if(o.done||over)continue;
          if(o.type==='obs'){if(bx1>o.x-o.w*.38&&bx0<o.x+o.w*.38&&by1>GROUND-o.h*.8)crash(o)}
          else{const px=Math.max(bx0,Math.min(o.x,bx1)),py=Math.max(by0,Math.min(o.y,by1));if(Math.hypot(o.x-px,o.y-py)<o.r)eat(o)}}
        things=things.filter(o=>!(o.done&&o.type==='item')&&o.x>-80);
        }
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
      /* 前景：雪地往下漸漸變暗一點，再畫一排會快速經過的大樹（畫在小熊、障礙後面才不會擋到） */
      {const fg=x.createLinearGradient(0,GROUND+30*U,0,H);fg.addColorStop(0,'rgba(200,214,245,0)');fg.addColorStop(1,'rgba(110,135,205,.75)');x.fillStyle=fg;x.fillRect(0,GROUND+30*U,W,H-GROUND);
        const fper=fronts.length?fronts[fronts.length-1].x+200*U:W,room=H-GROUND-26*U;
        for(const f of fronts){const a=A[f.k];const fxp=((f.x-scroll*1.35)%fper+fper)%fper-90*U;if(fxp>W+120)continue;
          const hh=room*(f.k==='tree'?1.02:.66)*f.s;   /* 大樹幾乎佔滿下面那片雪地 */
          x.fillStyle='rgba(30,40,80,.16)';x.beginPath();x.ellipse(fxp,H-4,hh*.32,8,0,0,7);x.fill();
          if(a){const w=hh/a.ar;x.drawImage(a.c,fxp-w/2,H-hh-2,w,hh)}else{x.font=Math.round(hh*.8)+'px sans-serif';x.textAlign='center';x.fillText('🎄',fxp,H-6)}}}
      if(santa.on&&A.santa){const w=Math.min(240,W*.6),h=w*A.santa.ar;x.save();x.translate(santa.x,santa.y);x.scale(-1,1);x.drawImage(A.santa.c,-w/2,-h/2,w,h);x.restore()}
      else if(santa.on){x.font=Math.round(44*U)+'px sans-serif';x.textAlign='center';x.fillText('🎅🛷🦌',santa.x,santa.y)}
      x.textAlign='center';x.textBaseline='middle';
      for(const o of things){if(o.type==='obs'){drawObs(o);continue}if(o.done)continue;const I=ITEMS[o.k],s=(I.huge?60:I.big?50:42)*U,bob=Math.sin(el*5+o.x*.02)*4;
        if(I.dbl){const pu=.5+.5*Math.sin(el*8+o.x*.01),R=s*(1.05+.35*pu),gg=x.createRadialGradient(o.x,o.y+bob,s*.1,o.x,o.y+bob,R);  /* 2026-11-11 大熊：鈴鐺要會發光——金色光暈一閃一閃＋光芒 */
          gg.addColorStop(0,'rgba(255,250,200,.95)');gg.addColorStop(.45,'rgba(255,214,80,.6)');gg.addColorStop(1,'rgba(255,200,40,0)');x.fillStyle=gg;x.beginPath();x.arc(o.x,o.y+bob,R,0,7);x.fill();
          x.save();x.translate(o.x,o.y+bob);x.rotate(el*1.5);x.strokeStyle=`rgba(255,236,150,${.45+.4*pu})`;x.lineWidth=3;x.lineCap='round';
          for(let r=0;r<8;r++){x.rotate(Math.PI/4);x.beginPath();x.moveTo(0,-s*.62);x.lineTo(0,-s*(.82+.25*pu));x.stroke()}x.restore();
          x.save();x.shadowColor='#ffe066';x.shadowBlur=18+14*pu;x.font=Math.round(s*(1+.08*pu))+'px sans-serif';x.fillText(I.e,o.x,o.y+bob);x.restore()}
        else{if(I.glow){x.fillStyle=I.glow;x.beginPath();x.arc(o.x,o.y+bob,s*.75,0,7);x.fill()}
        x.font=Math.round(s)+'px sans-serif';x.fillText(I.e,o.x,o.y+bob)}
        x.font='800 '+Math.round(11*U+1)+'px sans-serif';const tw=x.measureText(I.lab).width+10;
        x.fillStyle=I.bomb?'#e5484d':I.boost?'#9be7ff':I.dbl||I.b||I.g>=5?'#ffd447':'rgba(255,255,255,.95)';x.strokeStyle='#2b2320';x.lineWidth=1.5;x.beginPath();
        if(x.roundRect)x.roundRect(o.x-tw/2,o.y+bob+s*.5,tw,16,8);else x.rect(o.x-tw/2,o.y+bob+s*.5,tw,16);x.fill();x.stroke();x.fillStyle=I.bomb?'#fff':'#2b2320';x.fillText(I.lab,o.x,o.y+bob+s*.5+8.5)}
      {const sq=bear.air?1:1+Math.sin(bear.run)*.05,hop=bear.air||over?0:Math.abs(Math.sin(bear.run))*5*U;
        x.fillStyle='rgba(30,40,80,.18)';x.beginPath();x.ellipse(bear.x,GROUND+3,bear.w*.4*(1-Math.min(.5,(GROUND-bear.y)/400)),6,0,0,7);x.fill();
        x.save();x.translate(bear.x,bear.y-hop);x.rotate(crashed?-.5:bear.air?-.12:Math.sin(bear.run)*.06);x.scale(1/sq,sq);
        if(A.bear)x.drawImage(A.bear.c,-bear.w/2,-bear.h,bear.w,bear.h);else{x.font=Math.round(bear.h*.9)+'px sans-serif';x.fillText('🐻',0,-bear.h/2)}
        x.restore()}
      for(const f of fx){x.globalAlpha=Math.max(0,Math.min(1,f.a));x.font=`900 ${Math.round((f.big?26:22)*U)}px sans-serif`;x.lineWidth=4;x.strokeStyle='#1a1430';x.strokeText(f.t,f.x,f.y);x.fillStyle=f.c;x.fillText(f.t,f.x,f.y);x.globalAlpha=1}
      if(dbl>0&&!over){x.strokeStyle=`rgba(255,212,71,${.55+.3*Math.sin(el*10)})`;x.lineWidth=10;x.strokeRect(5,5,W-10,H-10)}
      if(boost>0&&!over){x.strokeStyle=`rgba(155,231,255,${.55+.3*Math.sin(el*12)})`;x.lineWidth=6;x.strokeRect(14,14,W-28,H-28)}
      if(flash>0){flash-=dt*2.2;x.fillStyle=`rgba(255,60,40,${Math.max(0,flash)*.45})`;x.fillRect(-12,-12,W+24,H+24)}
      if(over&&!crashed){x.fillStyle='rgba(7,13,43,.5)';x.fillRect(-12,-12,W+24,H+24);x.font=`900 ${Math.round(40*U)}px sans-serif`;x.fillStyle='#ffd447';x.strokeStyle='#1a1430';x.lineWidth=6;x.strokeText('時間到！',W/2,H/2);x.fillText('時間到！',W/2,H/2)}
      x.restore();
      const lt=Math.floor(el);if(lt!==lastT){lastT=lt;q('jpT').textContent=lt}
      const dOn=dbl>0&&!over;if(q('jpD').hidden===dOn)q('jpD').hidden=!dOn;if(dOn)q('jpDt').textContent=dbl.toFixed(1);
      const bOn=boost>0&&!over;if(q('jpBo').hidden===bOn)q('jpBo').hidden=!bOn;if(bOn)q('jpBot').textContent=boost.toFixed(1);
      if(ov.isConnected)requestAnimationFrame(frame)}
    requestAnimationFrame(frame)})}

  const rkLine=()=>RANK&&RANK.me?`你在榜上 🎁 <b>${load().top}</b>・第 <b>${RANK.me}</b> 名（共 ${RANK.total} 人）`:(load().top?`你在榜上 🎁 <b>${load().top}</b>`:'玩一局就會自動上榜');
  async function done(r){const st0=load(),sc=r.sc,b=r.b||0;let add=0,addB=0,swap=0,bad=false,spc='',up=false,top0=st0.top||0;
    if(jpReal()){let j=null;for(let i=0;i<3&&!j;i++){try{j=await xcall(API,{op:'end',gift:sc,bonus:b})}catch(e){if(i===2||/結束/.test(e.message||'')){toast(e.message||'連線不穩，成績沒送出去');break}await new Promise(z=>setTimeout(z,1200))}}
      if(j){JS=j.jp;RANK=j.rank;add=j.jpRes.addG;addB=j.jpRes.addB;swap=j.jpRes.swap||0;bad=!!j.jpRes.bad;spc=j.jpRes.special||'';up=!!j.jpRes.up;try{hud()}catch(e){}}}
    else{const g=Math.min(JP_GCAP,sc);add=Math.max(0,g-st0.best);const st=Object.assign({},st0,{plays:st0.plays+1,best:Math.max(st0.best,g),bbest:Math.max(st0.bbest,Math.min(JP_BCAP,b)),last:sc});keep(st);if(add){G.gifts+=add;try{save();hud()}catch(e){}}}
    const st=load();   /* 2026-11-12 大熊：玩完自動上榜（伺服器 end 就寫了），只留最好的一局，不用再按送出 */
    const SPM={won:'✨ 恭喜！你拿到特別獎（前 5 位會員）！明天早上 9 點會傳 LINE 給你，可以選「贈送儲值點 1111（3 個月內用）」或「方案展延 5 個月」',taken:'✨ 達標了！不過特別獎 5 個名額已經送完，排行榜還能拚',notMember:'✨ 達標了！特別獎限會員（有點數或堂數），排行榜照樣算',sim:'✨ 達標了！'},spMsg=SPM[spc]||'';
    const got=[add+swap?`🎁 聖誕禮物 <b>${add+swap}</b> 個`:'',addB?`🪙 紅利 <b>${addB}</b> 點`:''].filter(Boolean).join('、');
    if(q('jpFull'))q('pop').style.zIndex='70';
    card(`<div class="hwbig">${r.crashed?'💥':'🐻'}</div><h2>${r.crashed?`撞到了！跑了 ${Math.floor(r.sec)} 秒`:'時間到！跑完全程'}</h2>
      <div class="hwsc">🎁 ${sc}　🪙 ${b}</div>
      ${got?`<p style="margin:0 0 6px">入帳 ${got}</p>`:''}
      ${spMsg?`<p style="margin:0 0 8px;font-weight:800;color:#b8721a">${spMsg}</p>`:''}
      ${sc>=JP_HARD&&Math.max(+st0.top||0,+st0.hi||0,+st0.last||0)<JP_HARD?`<p style="margin:0 0 8px;font-weight:800;color:#d9542b">🔥 你破 ${JP_HARD} 了！下一局開始是困難模式</p>`:''}
      <p style="margin:0 0 10px;font-size:14px">${jpReal()?(up?`🏆 新紀錄！已經自動放上排行榜${RANK&&RANK.me?`（第 <b>${RANK.me}</b> 名）`:''}`:(st.top?`排行榜保留你最好的 🎁 <b>${st.top}</b>，這局沒超過，再挑戰一次`:'再挑戰一次，拿到分數就會自動上榜')):'這是體驗版，這局成績不算'}</p>${lineBox()}
      <div class="acts"><button type="button" class="btn red" id="jpGo">再玩一次</button><button type="button" class="btn ghost" id="jpRk">排行榜</button><button type="button" class="btn ghost" id="jpNo">回遊樂島</button></div>`);
    q('jpNo').onclick=()=>{q('pop').hidden=true;closeOv();btn()};q('jpGo').onclick=start;q('jpRk').onclick=()=>rankCard();
    if(up)try{sfx('chime')}catch(e){}}

  async function rankCard(msg){
    if(jpReal()&&!msg){try{const j=await xcall(API,{op:'rank'});JS=j.jp;RANK=j.rank}catch(e){}}
    const top=(RANK&&RANK.top)||[],medal=['🥇','🥈','🥉'];
    /* 2026-11-11 大熊：排行榜跟開場一樣的排版——名次清單在上、獎品區（特別獎金色一塊＋前三名清單）在下、兩顆鈕等寬 */
    card(`<div class="jpin"><h2>🏆 荷包大補血排行榜</h2>${msg?`<p class="jpsub" style="color:#2f8f58;font-weight:800">${msg}</p>`:''}
      ${top.length?`<ol class="jprank">${top.map((x,i)=>`<li class="${x.me?'me':''}"><i>${x.sp?'✨':x.pl?medal[x.pl-1]:i+1}</i><span>${x.me?'你':(x.n||'神秘玩家')}</span><b>🎁 ${x.s}</b></li>`).join('')}</ol>`:`<p class="jpme">${jpReal()?'還沒有人上榜，你可以當第一個！':'用 LINE 登入才看得到排行榜'}</p>`}
      ${jpReal()?`<p class="jpme">${rkLine()}</p>`:''}
      <div class="jpsp"><b>✨ 特別獎 現金點數 1111</b><span>一局拿到 ${JP_SPECIAL} 個禮物・限前 5 位達成的會員（員工也算）<br>獎品二選一：贈送儲值點 1111（3 個月內用）或方案展延 5 個月<br>拿到特別獎的人、員工不列入前三名</span></div>
      <ol class="jptop"><li><i>🥇</i>第一名<b>現金點數 111</b></li><li><i>🥈</i>第二名<b>A5 水彩繪本</b></li><li><i>🥉</i>第三名<b>聖誕公公娃娃一組</b></li></ol>
      <p class="jpsub">比的是單局禮物數・10:00–23:59${top.some(x=>x.sp)?'<br>✨＝特別獎得主；特別獎得主和員工不列入前三名，名次往下遞補':''}</p>
      <div class="jpbtns"><button type="button" class="btn ghost" id="jpNo">回遊樂島</button><button type="button" class="btn red" id="jpGo">${load().plays?'再玩一次':'開始玩'}</button></div></div>`);
    q('jpNo').onclick=()=>{q('pop').hidden=true;closeOv();btn()};q('jpGo').onclick=start}

  /* 2026-11-12 大熊：特別獎得主隔天收到 LINE（?go=jump&jpprize=1&c=pts|ext），在這裡選「入儲值點 1111」或「方案展延 5 個月」，伺服器 op:'prize' 直接入帳／展延 */
  const PZ=/[?&]jpprize=1/.test(location.search),PZD=/[?&]demo=1/.test(location.search),PZC=(location.search.match(/[?&]c=(pts|ext)/)||[])[1]||'';
  let _pzTry=0;
  let _pzDemo=null;   /* 後台「傳給我測試」的按鈕：示範畫面，不呼叫伺服器、不入帳 */
  async function prizeCard(pick){
    if(PZD){const d={winner:true,s:1429,choice:_pzDemo,pts:1111,ptsMon:3,extMon:5,deadline:'2026-11-15',ext:{plan:'創意實踐家',from:'2027-03-01',to:'2027-08-01'}};return prizeDraw(d,pick)}
    if(!(window.PROD&&token())){if(_pzTry++<20){setTimeout(()=>prizeCard(pick),1000);return}card(`<div class="jpin"><h2>✨ 特別獎</h2><p class="jpsub">請從 LINE 收到的訊息點按鈕打開</p><div class="jpbtns"><button type="button" class="btn ghost" id="jpNo">關閉</button></div></div>`);q('jpNo').onclick=()=>{q('pop').hidden=true};return}
    let d=null;try{d=(await gcall(API,{op:'prize',choice:'info'})).prize}catch(e){card(`<div class="jpin"><h2>✨ 特別獎</h2><p class="jpsub">${e.message||'讀不到資料'}</p><div class="jpbtns"><button type="button" class="btn ghost" id="jpNo">關閉</button></div></div>`);q('jpNo').onclick=()=>{q('pop').hidden=true};return}
    return prizeDraw(d,pick)}
  function prizeDraw(d,pick){
    const done=d.choice;
    const optP=`<b>① 🎁 贈送金 ${d.pts} 元</b><span>${d.ptsMon} 個月內上課可折抵、可分次用；另外記（不併入儲值金），預約頁看得到，到期自動失效</span>`,optE=d.ext?`<b>② 方案效期展延 ${d.extMon} 個月</b><span>${d.ext.plan}：${d.ext.from} → ${d.ext.to}</span>`:`<b>② 方案效期展延 ${d.extMon} 個月</b><span>你目前沒有帶效期的方案，只能選 ①</span>`;
    const box=(h,on,id)=>`<div ${id?`id="${id}"`:''} style="border:2px solid ${on?'#d63a2f':'#eadfce'};background:${on?'#fff1ec':'#fff'};border-radius:14px;padding:12px;margin:0 0 10px;display:flex;flex-direction:column;gap:4px;text-align:left;${id?'cursor:pointer':''}">${h}</div>`;
    if(done){card(`<div class="jpin"><h2>✨ 特別獎</h2><p class="jpsub">一局 🎁 ${d.s} 個禮物</p>
      ${box(done.c==='pts'?`<b>🎁 贈送金 ${d.pts} 元已發送 ✅</b><span>請在 ${done.exp} 前使用（上課結帳折抵，可分次用），到期自動失效。預約頁「查詢我的點數」看得到</span>`:`<b>方案已展延 ${d.extMon} 個月 ✅</b><span>${done.plan||'方案'}：${done.from} → ${done.to}</span>`,true)}
      <div class="jpbtns"><button type="button" class="btn red" id="jpNo">好的</button></div></div>`);q('jpNo').onclick=()=>{q('pop').hidden=true};return}
    let sel=pick==='ext'&&!d.ext?'':pick;
    const draw=()=>{card(`<div class="jpin"><h2>✨ 恭喜拿到特別獎</h2><p class="jpsub">一局 🎁 ${d.s} 個禮物・獎品兩種選一種</p>
      ${box(optP,sel==='pts','pzP')}${box(optE,sel==='ext',d.ext?'pzE':'')}
      <p class="jpsub" style="font-size:13px">選了就不能改。${d.deadline.slice(5).replace('-','/')} 前沒選，會自動發贈送金。</p>
      <div class="jpbtns"><button type="button" class="btn ghost" id="jpNo">晚點再選</button><button type="button" class="btn red" id="jpOk" ${sel?'':'disabled style="opacity:.5"'}>確定選這個</button></div></div>`);
      q('pzP').onclick=()=>{sel='pts';draw()};if(q('pzE'))q('pzE').onclick=()=>{sel='ext';draw()};
      q('jpNo').onclick=()=>{q('pop').hidden=true};
      q('jpOk').onclick=async()=>{if(!sel)return;const b=q('jpOk');b.disabled=true;b.textContent='處理中…';
        try{if(PZD){const t=new Date(Date.now()+8*3600e3),e=new Date(t);e.setUTCMonth(e.getUTCMonth()+3);_pzDemo=sel==='pts'?{c:'pts',exp:e.toISOString().slice(0,10)}:{c:'ext',plan:'創意實踐家',from:'2027-03-01',to:'2027-08-01'};toast('這是測試畫面，沒有真的入帳')}else await gcall(API,{op:'prize',choice:sel});sfx('chime');prizeCard()}catch(e){b.disabled=false;b.textContent='確定選這個';toast(e.message||'連線不穩，再按一次')}}};
    draw()}

  window.Jump12={intro,on:jpOn,mini:o=>play2d(Object.assign({mini:1},o||{})),close:closeOv};
  if(PZ)setTimeout(()=>{_auto=1;prizeCard(PZC)},900);
  setTimeout(maybe,700);
})();
