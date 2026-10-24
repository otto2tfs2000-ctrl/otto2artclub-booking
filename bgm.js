/* 2026-10-24 遊樂島背景音樂：四首原創小曲，WebAudio 即時合成（沒有音檔、不拖慢開頁、版權是自己的）
   扭蛋島〈轉一下〉／走格子島〈雪夜走格子〉／吉祥物島〈天竺鼠午睡〉／作品小屋〈畫室午後〉
   用法：OttoBGM.init(()=>AudioContext 或 null)，之後每格呼叫 OttoBGM.update(島id, 要不要開, 要不要壓低音量)
   島 id：park walk mascot art；換島會淡出淡入；切到背景會停、回來接著播 */
(function(){
const CH={
  C:{r:36,n:[60,64,67]}, Am:{r:33,n:[57,60,64]}, F:{r:41,n:[57,60,65]}, G:{r:43,n:[55,59,62]},
  Dm:{r:38,n:[57,62,65]}, Bb:{r:34,n:[58,62,65]}, Em:{r:40,n:[55,59,64]}, D:{r:38,n:[57,62,66]},
  Bm:{r:35,n:[59,62,66]}, A:{r:33,n:[57,61,64]}, Fsm:{r:42,n:[57,61,66]}
};
/* 旋律：每小節一列，0＝休止，-1＝延長上一個音；和弦一小節可以兩個（前半、後半） */
const TRACKS={
 park:{bpm:120,swing:0,steps:16,lead:'square',
  chords:[['C'],['Am'],['F'],['G'],['C'],['Am'],['F','G'],['C']],
  mel:[[79,-1,76,0,79,0,84,-1,-1,0,83,0,81,0,79,0],[76,-1,72,0,76,0,81,-1,-1,0,79,0,76,0,0,0],
       [77,0,81,0,84,-1,-1,0,81,0,77,0,81,0,84,0],[83,-1,-1,0,79,0,83,0,86,-1,-1,-1,0,0,0,0],
       [84,0,83,0,81,0,79,0,76,0,79,0,84,-1,0,0],[81,0,79,0,76,0,72,0,76,0,81,0,79,-1,0,0],
       [77,0,76,0,77,0,81,0,79,0,0,79,83,0,86,0],[84,-1,-1,-1,79,0,76,0,72,-1,-1,-1,0,0,0,0]],
  drums:{kick:[0,8,10],clap:[4,12],hat:[2,6,10,14]}},
 walk:{bpm:96,swing:.16,steps:16,lead:'glock',
  chords:[['F'],['Dm'],['Bb'],['C'],['F'],['Am'],['Bb','C'],['F']],
  mel:[[81,-1,-1,0,84,-1,81,0,77,-1,-1,-1,0,0,79,0],[81,-1,-1,0,77,-1,74,0,77,-1,-1,-1,0,0,0,0],
       [82,-1,-1,0,86,-1,82,0,77,-1,79,-1,81,-1,82,-1],[84,-1,-1,-1,-1,-1,-1,0,79,0,81,0,82,0,84,0],
       [86,-1,-1,0,84,-1,81,0,84,-1,-1,0,81,-1,77,0],[76,-1,-1,0,81,-1,-1,0,79,-1,76,0,72,-1,-1,0],
       [74,-1,77,0,82,-1,-1,0,79,-1,82,0,84,-1,79,0],[77,-1,-1,-1,-1,-1,-1,-1,0,0,0,0,0,0,0,0]],
  drums:{kick:[0,8],sleigh:[0,2,4,6,8,10,12,14],tamb:[4,12]}},
 mascot:{bpm:108,swing:.1,steps:16,lead:'marimba',
  chords:[['G'],['Em'],['C'],['D'],['G'],['Em'],['Am','D'],['G']],
  mel:[[67,0,71,0,74,0,0,71,74,0,79,0,0,0,74,0],[76,0,0,74,71,0,67,0,71,0,0,0,64,0,67,0],
       [72,0,76,0,79,0,0,76,72,0,0,0,76,0,74,0],[74,0,0,0,78,0,0,81,78,0,74,0,0,0,0,0],
       [79,0,0,78,79,0,83,0,81,0,79,0,74,0,0,0],[76,0,79,0,83,0,0,81,79,0,76,0,71,0,0,0],
       [72,0,76,0,81,0,0,0,78,0,74,0,72,0,78,0],[79,0,0,0,74,0,71,0,67,0,0,0,0,0,0,0]],
  drums:{kick:[0,8],block:[2,6,10,14]}},
 art:{bpm:84,swing:0,steps:12,lead:'musicbox',
  chords:[['D'],['Bm'],['G'],['A'],['D'],['Fsm'],['G','A'],['D']],
  mel:[[78,-1,-1,-1,81,-1,-1,-1,86,-1,85,-1],[83,-1,-1,-1,-1,-1,-1,-1,78,-1,-1,-1],
       [79,-1,-1,-1,83,-1,-1,-1,86,-1,83,-1],[85,-1,-1,-1,-1,-1,-1,-1,81,-1,-1,-1],
       [86,-1,-1,-1,85,-1,83,-1,81,-1,78,-1],[81,-1,-1,-1,78,-1,-1,-1,73,-1,-1,-1],
       [74,-1,76,-1,79,-1,-1,-1,76,-1,73,-1],[74,-1,-1,-1,-1,-1,-1,-1,0,0,0,0]],
  drums:{}}
};
const VOL=.3,DUCK=.25; /* 背景音樂比音效小聲；店員說話時壓到 1/4 */
let getCtx=()=>null,ac=null,out=null,noiseBuf=null,cur=null,timer=null,want={place:null,on:false,duck:false};
const hz=m=>440*Math.pow(2,(m-69)/12);
function setup(){if(out&&ac)return true;ac=getCtx();if(!ac)return false;
  const comp=ac.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(ac.destination);
  out=ac.createGain();out.gain.value=1;out.connect(comp);
  noiseBuf=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return true}
function env(g,t,peak,a,dec,sus,dur,rel){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);
  g.gain.setTargetAtTime(peak*sus,t+a,dec/3);g.gain.setValueAtTime(Math.max(peak*sus,.0001),t+dur);g.gain.setTargetAtTime(0,t+dur,rel/3)}
function tone(bus,type,f,t,dur,peak,o={}){const os=ac.createOscillator(),g=ac.createGain();os.type=type;os.frequency.setValueAtTime(f,t);
  if(o.to)os.frequency.exponentialRampToValueAtTime(o.to,t+(o.toT||.1));if(o.det)os.detune.value=o.det;
  const r=o.r===undefined?.08:o.r;env(g,t,peak,o.a===undefined?.005:o.a,o.d===undefined?.2:o.d,o.s||0,dur,r);let end=g;
  if(o.lp){const f2=ac.createBiquadFilter();f2.type='lowpass';f2.frequency.value=o.lp;g.connect(f2);end=f2}
  os.connect(g);end.connect(bus);os.start(t);os.stop(t+dur+r*2+.05)}
function noise(bus,t,dur,peak,type,freq,q=1){const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=noiseBuf;
  f.type=type;f.frequency.value=freq;f.Q.value=q;env(g,t,peak,.002,dur,0,dur,.03);s.connect(f);f.connect(g);g.connect(bus);
  s.start(t,Math.random()*.5);s.stop(t+dur+.1)}
const LEAD={
  square:(b,m,t,d)=>{tone(b,'square',hz(m),t,d,.07,{d:.12,s:.55,r:.06,lp:3200});tone(b,'square',hz(m),t,d,.035,{det:9,d:.12,s:.5,r:.06,lp:2400})},
  glock:(b,m,t,d)=>{tone(b,'sine',hz(m+12),t,d,.16,{a:.002,d:1.4,s:0,r:.6});tone(b,'sine',hz(m+12)*2.76,t,.08,.05,{a:.001,d:.25,s:0,r:.1})},
  marimba:(b,m,t)=>{tone(b,'sine',hz(m),t,.05,.22,{a:.002,d:.42,s:0,r:.25});tone(b,'sine',hz(m)*4,t,.02,.06,{a:.001,d:.07,s:0,r:.04})},
  musicbox:(b,m,t,d)=>{tone(b,'sine',hz(m+12),t,d,.15,{a:.002,d:1.8,s:0,r:.9});tone(b,'triangle',hz(m+24),t,.05,.035,{a:.001,d:.3,s:0,r:.15})}
};
function play(id,tr,bus,step,t0){
  const n=tr.steps,bar=Math.floor(step/n),s=step%n,d=60/tr.bpm/4,t=t0+(s%2?tr.swing*d:0);
  const row=tr.mel[bar],m=row[s];
  if(m>0){let len=1;while(s+len<n&&row[s+len]===-1)len++;LEAD[tr.lead](bus,m,t,len*d*.92)}
  const chs=tr.chords[bar],half=n/chs.length,ch=CH[chs[Math.min(chs.length-1,Math.floor(s/half))]];
  if(s%half===0)ch.n.forEach((mm,i)=>tone(bus,'triangle',hz(mm),t,half*d,id==='park'?.022:.03,{a:.25,d:.6,s:.7,r:.5,det:i%2?6:-6,lp:1600}));
  const bass=(mm,dur,pk)=>tone(bus,'triangle',hz(mm),t,dur,pk,{d:.25,s:.3,lp:900});
  if(id==='art'){if(s===0)bass(ch.r+12,4*d,.16);if(s===4||s===8)ch.n.forEach(mm=>tone(bus,'triangle',hz(mm),t,.05,.035,{a:.003,d:.2,s:0,r:.1}))}
  else if(id==='park'){if(s%half===0||s===6||s===14)bass(ch.r+12,2*d,.17);if(s===10)bass(ch.r+19,d,.13)}
  else if(id==='walk'){if(s%half===0)bass(ch.r+12,6*d,.15);if(s===8&&half===16)bass(ch.r+19,6*d,.12)}
  else{if(s%half===0)bass(ch.r+12,2*d,.16);if(s===6||s===12)bass(ch.r+19,d,.11)}
  const dr=tr.drums,has=k=>dr[k]&&dr[k].includes(s);
  if(has('kick'))tone(bus,'sine',120,t,.06,id==='park'?.5:.3,{to:42,toT:.12,a:.002,d:.18,r:.06});
  if(has('clap'))noise(bus,t,.09,.18,'bandpass',1500,1.2);
  if(has('hat'))noise(bus,t,.03,.06,'highpass',8000);
  if(has('tamb'))noise(bus,t,.16,.07,'bandpass',6200,2);
  if(has('block')){tone(bus,'sine',1050,t,.01,.12,{a:.001,d:.05,r:.02});tone(bus,'sine',1580,t,.01,.05,{a:.001,d:.03,r:.02})}
  if(has('sleigh')){noise(bus,t,.07,s%4===0?.08:.045,'highpass',7500);noise(bus,t+.025,.05,.03,'highpass',9000)}
  /* 小彩蛋：扭蛋島第 4、8 小節尾巴「啵」；吉祥物島天竺鼠吱吱兩聲 */
  if((bar===3||bar===7)&&id==='park'&&s===13)tone(bus,'sine',500,t,.04,.12,{to:1400,toT:.08,a:.002,d:.1,r:.05});
  if((bar===3||bar===7)&&id==='mascot'&&s===12){tone(bus,'sine',1300,t,.07,.06,{to:1900,toT:.07,a:.005,d:.1,r:.04});tone(bus,'sine',1500,t+.12,.06,.05,{to:2100,toT:.06,a:.005,d:.08,r:.04})}
}
function level(){return VOL*(want.duck?DUCK:1)}
function fadeOut(c){if(!c)return;const g=c.bus.gain,t=ac.currentTime;try{g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(0,t+.6)}catch(e){}setTimeout(()=>{try{c.bus.disconnect()}catch(e){}},1500)}
function stop(){if(timer){clearInterval(timer);timer=null}if(cur)fadeOut(cur);cur=null}
function start(id){
  const tr=TRACKS[id];if(!tr)return;if(cur)fadeOut(cur);
  const bus=ac.createGain(),t=ac.currentTime;bus.gain.setValueAtTime(0,t);bus.gain.linearRampToValueAtTime(level(),t+1.2);bus.connect(out);
  cur={id,tr,bus,step:0,next:t+.15,duck:want.duck};
  if(!timer)timer=setInterval(tick,40);
}
function tick(){
  if(!cur||!ac)return;
  if(ac.state!=='running'){cur.next=ac.currentTime+.15;return} /* 被系統暫停（來電、切背景）就先不排，回來從現在開始接 */
  if(cur.next<ac.currentTime)cur.next=ac.currentTime+.05;
  while(cur.next<ac.currentTime+.25){const total=cur.tr.steps*cur.tr.mel.length;
    try{play(cur.id,cur.tr,cur.bus,cur.step,cur.next)}catch(e){}
    cur.step=(cur.step+1)%total;cur.next+=60/cur.tr.bpm/4}
}
function update(place,on,duck){
  want.place=place;want.on=!!on;want.duck=!!duck;
  const go=want.on&&want.place&&TRACKS[want.place]&&!document.hidden;
  if(!go){if(cur)stop();return}
  if(!setup())return;
  if(!cur||cur.id!==want.place)start(want.place);
  else if(cur.duck!==want.duck){cur.duck=want.duck;const g=cur.bus.gain;g.setTargetAtTime(level(),ac.currentTime,.15)}
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else update(want.place,want.on,want.duck)});
window.OttoBGM={init(fn){getCtx=fn},update,stop,tracks:Object.keys(TRACKS),now:()=>cur&&{id:cur.id,step:cur.step,gain:+cur.bus.gain.value.toFixed(3)}};
})();
