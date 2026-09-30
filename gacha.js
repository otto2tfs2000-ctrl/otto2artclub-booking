/* ══ 十月黑熊扭蛋（2026-09-30）══════════════════════════════
   預約頁首頁最上面的「十月黑熊扭蛋」卡片點下去才會載入這支，平常不佔頁面載入時間。

   這支只負責畫面跟動畫：要不要中、中什麼，全部是伺服器
   （otto2-notify 的 /gacha/spin）抽完告訴我們的，網頁改不了結果。
   身分用 LIFF 的 access token 證明，伺服器會拿去跟 LINE 確認。

   需要 index.html 提供的全域變數：NOTIFY_URL、liff、lineUser、customer、setStep
   所有 class 都用 gc- 開頭，避免跟預約頁原本的樣式（.bar、.top、.next…）撞名。
   ══════════════════════════════════════════════════════════ */
(function(){
"use strict";

var CSS = `
#gcOv{position:fixed;inset:0;z-index:60;background:#F6F4EF;overflow-y:auto;-webkit-overflow-scrolling:touch;
  font-family:'Noto Sans TC',system-ui,sans-serif;color:#2A2E38;opacity:0;transition:opacity .3s}
#gcOv.show{opacity:1}
#gcOv *{box-sizing:border-box}
#gcOv button{font-family:inherit}
.gc-top{background:#1E2B4F;color:#fff;padding:14px 18px 50px;position:relative;overflow:hidden}
.gc-top::after{content:"";position:absolute;right:-40px;top:-40px;width:160px;height:160px;border-radius:50%;background:rgba(227,179,76,.18)}
.gc-ttl{font-size:11.5px;letter-spacing:2px;color:#E3B34C;font-weight:700}
.gc-top h1{font-size:21px;font-weight:900;margin:4px 0 0}
.gc-top p{font-size:12.5px;opacity:.8;margin:4px 0 0}
.gc-x{position:absolute;right:10px;top:10px;z-index:2;width:34px;height:34px;border-radius:50%;border:none;background:rgba(255,255,255,.14);color:#fff;font-size:18px;cursor:pointer}
.gc-me{margin:-38px 14px 0;background:#fff;border-radius:16px;padding:13px 15px;box-shadow:0 4px 14px rgba(30,43,79,.10);position:relative;z-index:2}
.gc-me-row{display:flex;justify-content:space-between;align-items:center}
.gc-name{font-weight:700;font-size:15px}
.gc-tag{font-size:11.5px;padding:2px 8px;border-radius:20px;font-weight:700;margin-left:6px;background:#E7ECF7;color:#1E2B4F}
.gc-tag.mem{background:#E3B34C}
.gc-bal{display:grid;grid-template-columns:repeat(3,1fr);margin-top:11px;text-align:center;border-top:1px dashed #E4E1D9;padding-top:9px}
.gc-bal b{display:block;font-size:19px;color:#1E2B4F;font-weight:900;font-variant-numeric:tabular-nums}
.gc-bal .hl b{color:#E8836B}
.gc-bal b.bump{animation:gcBump .6s cubic-bezier(.22,1,.36,1)}
@keyframes gcBump{40%{transform:scale(1.35);color:#E8836B}}
.gc-bal span{font-size:11.5px;color:#6B7180}
.gc-sec{margin:16px 14px 0}
.gc-sh{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px}
.gc-sh h2{font-size:15px;font-weight:900;color:#1E2B4F;margin:0}
.gc-sh small{font-size:12px;color:#6B7180}
.gc-banner{border-radius:12px;padding:9px 12px;font-size:12.5px;margin-bottom:10px;line-height:1.6;background:linear-gradient(90deg,#FFE9C2,#FFF6E3);border:1.5px solid #E3B34C}
.gc-banner b{color:#E8836B}
.gc-banner.test{background:#EEF1FA;border-color:#8FA6D9}
.gc-ticker{overflow:hidden;white-space:nowrap;background:#1E2B4F;color:#fff;border-radius:10px;font-size:12px;padding:6px 0;margin-bottom:10px}
.gc-ticker span{display:inline-block;padding-left:100%;animation:gcTick var(--t,30s) linear infinite}
.gc-ticker em{font-style:normal;color:#E3B34C;margin:0 4px}
@keyframes gcTick{to{transform:translateX(-100%)}}

/* ── 紅色扭蛋機 ── */
.gc-g{position:relative;width:280px;height:424px;margin:0 auto}
.gc-sun{position:absolute;left:0;top:6px;width:280px;height:350px;border-radius:30px;overflow:hidden;
  background:radial-gradient(circle at 50% 44%,#FFFBEF 0,#FCEBC2 50%,#F5D38A 100%)}
.gc-sun::before{content:"";position:absolute;left:50%;top:44%;width:720px;height:720px;margin:-360px 0 0 -360px;
  background:repeating-conic-gradient(rgba(255,255,255,.55) 0 7deg,transparent 7deg 18deg);animation:gcRays 60s linear infinite}
.gc-sun i{position:absolute;font-style:normal;line-height:1;animation:gcTw 2.8s ease-in-out infinite;animation-delay:var(--d)}
@keyframes gcTw{50%{transform:scale(.7);opacity:.55}}
@keyframes gcRays{to{transform:rotate(360deg)}}
.gc-floor{position:absolute;left:10px;right:10px;top:392px;height:26px;border-radius:50%;background:rgba(120,80,20,.12)}
.gc-mach{position:absolute;inset:0;transform-origin:50% 90%;animation:gcBreathe 3.4s ease-in-out infinite;z-index:1}
.gc-mach.wobble{animation:gcWob 1.4s cubic-bezier(.45,0,.25,1)}
@keyframes gcBreathe{50%{transform:scale(1.014,.99)}}
@keyframes gcWob{0%,100%{transform:rotate(0)}18%{transform:rotate(-3deg)}38%{transform:rotate(2.6deg)}58%{transform:rotate(-1.8deg)}78%{transform:rotate(1deg)}}
.gc-svg{position:absolute;left:0;top:0;width:280px;height:424px;overflow:visible}
.gc-svg.up{z-index:3;pointer-events:none}
.gc-globe{position:absolute;left:28px;top:44px;width:216px;height:216px;border-radius:50%;overflow:hidden;z-index:2;
  background:radial-gradient(circle at 45% 40%,#fff 0,#F4F7FB 60%,#E1E9F3 100%);border:4px solid #1A1A1A}
.gc-gl{position:absolute;inset:10px;border-radius:50%;border:7px solid transparent;border-top-color:rgba(255,255,255,.75);transform:rotate(-38deg);z-index:4}
.gc-peek{position:absolute;top:26px;width:86px;height:86px}
.gc-peek.l{left:16px;transform:rotate(-8deg)}.gc-peek.r{right:16px;transform:rotate(8deg)}
.gc-swirl{position:absolute;inset:0;z-index:2;will-change:transform}
.gc-swirl.spin{animation:gcSwirl 1.4s cubic-bezier(.45,0,.25,1)}
@keyframes gcSwirl{to{transform:rotate(360deg)}}
.gc-ball{position:absolute;width:36px;height:36px;border-radius:50%;border:2.5px solid #1A1A1A;background:var(--c);animation:gcFloat 3.2s ease-in-out infinite;animation-delay:var(--d)}
.gc-ball.bh{background:none;border:none;width:40px;height:40px}
.gc-ball svg{width:100%;height:100%}
@keyframes gcFloat{50%{translate:0 -4px}}
.gc-love{position:absolute;left:156px;top:40px;width:26px;height:46px;background:#F1DDB5;border:2px solid #1A1A1A;border-radius:4px;z-index:5;
  display:flex;align-items:center;justify-content:center;writing-mode:vertical-rl;font-size:10px;font-weight:900;letter-spacing:1px;color:#1A1A1A;
  transform-origin:50% 0;transform:rotate(12deg);animation:gcSwing 3s ease-in-out infinite}
@keyframes gcSwing{50%{transform:rotate(4deg)}}
.gc-luck{position:absolute;left:70px;top:344px;background:#1A1A1A;color:#fff;font-size:9px;font-weight:900;letter-spacing:2px;padding:3px 7px;transform:rotate(-5deg);z-index:4}
.gc-knob{position:absolute;left:92px;top:292px;width:96px;height:38px;border-radius:19px;border:3px solid #1A1A1A;cursor:pointer;z-index:4;padding:0;
  background:linear-gradient(180deg,#D5D5D5,#8E8E8E);color:#fff;font-size:14px;font-weight:900;letter-spacing:3px;text-shadow:0 1px 0 #333;will-change:transform}
.gc-knob.turn{animation:gcTurn 1.4s cubic-bezier(.45,0,.25,1)}
@keyframes gcTurn{to{transform:rotate(720deg)}}
.gc-exit{position:absolute;left:116px;top:342px;width:48px;height:42px;background:#9A9A9A;border:3px solid #1A1A1A;border-radius:6px;z-index:4}
.gc-exit::after{content:"";position:absolute;inset:6px;background:#2A2A2A;border-radius:3px}
.gc-crowd{position:absolute;inset:0;z-index:5;pointer-events:none}
.gc-bb{position:absolute;width:38px;height:58px;transform-origin:50% 100%;animation:gcHop 2.6s ease-in-out infinite;animation-delay:var(--d)}
@keyframes gcHop{0%,100%{transform:scale(var(--s,1))}50%{transform:translateY(-3px) scale(var(--s,1))}}
.gc-bb svg{width:100%;height:100%;overflow:visible}
.gc-bal2{transform-origin:50% 100%;animation:gcBob 2.6s ease-in-out infinite;animation-delay:var(--d)}
.gc-g.party .gc-bb{animation-duration:.6s}
.gc-g.party .gc-bal2{animation-duration:.9s}
@keyframes gcBob{0%,100%{transform:rotate(-5deg)}50%{transform:translateY(-7px) rotate(5deg)}}

/* 扭蛋掉出來之後，後面的機台淡掉、模糊，讓人一眼看到扭蛋 */
.gc-mach,.gc-crowd,.gc-sun,.gc-floor{transition:filter .6s ease,opacity .6s ease}
.gc-g.focus .gc-mach,.gc-g.focus .gc-crowd,.gc-g.focus .gc-sun,.gc-g.focus .gc-floor{filter:blur(3px) saturate(.55) brightness(.9);opacity:.75}
.gc-cap::before{content:"";position:absolute;inset:-12px;border-radius:50%;border:3px solid #E3B34C;opacity:0;pointer-events:none}
.gc-cap.ready::before{animation:gcRing 1.4s ease-out infinite}
@keyframes gcRing{0%{transform:scale(.85);opacity:.9}100%{transform:scale(1.35);opacity:0}}
.gc-cap.ready{filter:drop-shadow(0 6px 14px rgba(0,0,0,.25))}
.gc-tapme{position:absolute;left:50%;top:274px;transform:translateX(-50%);z-index:10;pointer-events:none;
  background:#1E2B4F;color:#fff;font-size:14px;font-weight:900;padding:8px 16px;border-radius:20px;white-space:nowrap;
  box-shadow:0 6px 16px rgba(30,43,79,.35);opacity:0;transition:opacity .4s}
.gc-tapme::before{content:"";position:absolute;left:50%;top:-6px;margin-left:-6px;border:6px solid transparent;border-top:0;border-bottom-color:#1E2B4F}
.gc-g.tap .gc-tapme{opacity:1;animation:gcTap 1.2s ease-in-out infinite}
@keyframes gcTap{50%{transform:translateX(-50%) translateY(-5px)}}


/* ── 多拿扭蛋機會 ── */
.gc-game{background:#fff;border:1px solid #E4E1D9;border-radius:14px;padding:12px 14px;margin-bottom:8px}
.gc-game.row{display:flex;align-items:center;gap:10px;justify-content:space-between}
.gc-gh{font-size:14px;font-weight:900;color:#1E2B4F}
.gc-gh span{display:block;font-size:11.5px;font-weight:500;color:#8A90A0;margin-top:2px}
.gc-q{font-size:15px;font-weight:700;margin:10px 0 8px;line-height:1.6}
.gc-opts{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.gc-opt{padding:10px 8px;border-radius:10px;border:1.5px solid #E4E1D9;background:#FAF8F3;font-size:13.5px;text-align:left;cursor:pointer;color:#2A2E38;line-height:1.4}
.gc-opt:active{transform:scale(.97)}
.gc-opt.picked{border-color:#1E2B4F}
.gc-opt.right{background:#E3F4EA;border-color:#2E7D4F;color:#1F5C39;font-weight:700}
.gc-opt.wrong{background:#FCE3DC;border-color:#C0392B;color:#8A2A1F}
.gc-opt.dim{opacity:.5}
.gc-qres{margin-top:10px;font-size:13.5px;font-weight:700;line-height:1.6}
.gc-qres.ok{color:#2E7D4F}.gc-qres.no{color:#B85F10}
.gc-qres small{display:block;font-weight:400;color:#6B7180;font-size:12.5px;margin-top:4px}
.gc-mini{flex:0 0 auto;padding:8px 14px;border-radius:10px;border:none;background:#1E2B4F;color:#fff;font-size:13px;font-weight:700;cursor:pointer;margin-left:8px}
.gc-mini.done{background:#E3F4EA;color:#2E7D4F}

/* ── 翻牌配對 ── */
.gc-mem{position:fixed;inset:0;z-index:75;background:rgba(20,26,45,.72);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .3s}
.gc-mem.show{opacity:1}
.gc-mem-in{background:#F6F4EF;border-radius:20px;padding:14px;width:100%;max-width:380px}
.gc-mem-top{display:flex;align-items:center;gap:10px;font-size:16px;color:#1E2B4F;position:relative;padding-right:40px}
.gc-mem-top span{margin-left:auto;font-size:20px;font-weight:900;font-variant-numeric:tabular-nums;color:#E8836B}
.gc-mem-top .gc-x{top:-4px;right:0;background:#E4E1D9;color:#1E2B4F}
.gc-mem-bar{height:6px;border-radius:6px;background:#E4E1D9;margin:10px 0 12px;overflow:hidden}
.gc-mem-bar i{display:block;height:100%;width:100%;background:#E3B34C;transition:width 1s linear}
.gc-mem-bar i.hurry{background:#E0322F}
.gc-mem-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.gc-card2{aspect-ratio:3/4;border:none;padding:0;background:none;perspective:600px;cursor:pointer}
.gc-card2 .in{position:relative;display:block;width:100%;height:100%;transition:transform .45s cubic-bezier(.3,1.3,.5,1);transform-style:preserve-3d}
.gc-card2.flip .in{transform:rotateY(180deg)}
.gc-card2 .bk,.gc-card2 .fr{position:absolute;inset:0;border-radius:10px;backface-visibility:hidden;-webkit-backface-visibility:hidden;display:flex;align-items:center;justify-content:center}
.gc-card2 .bk{background:#D7262E;border:2.5px solid #1A1A1A;color:#fff;font-size:11px;font-weight:900;letter-spacing:1px}
.gc-card2 .fr{background:#fff;border:2.5px solid #E4E1D9;transform:rotateY(180deg)}
.gc-card2 .fr svg{width:78%;height:78%}
.gc-card2.got .fr{border-color:#2E7D4F;background:#E3F4EA;animation:gcGot .5s ease}
@keyframes gcGot{50%{transform:rotateY(180deg) scale(1.1)}}
.gc-mem-msg{text-align:center;font-size:13.5px;color:#1E2B4F;font-weight:700;margin-top:12px;min-height:34px;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px}

/* ── 黑熊圖鑑 ── */
.gc-dex{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.gc-dx{position:relative;text-align:center;background:#F3F1EC;border-radius:12px;padding:8px 4px 6px}
.gc-dx svg{width:52px;height:56px;display:block;margin:0 auto}
.gc-dx span{display:block;font-size:11.5px;color:#B3B0A8;margin-top:2px}
.gc-dx.got{background:#FFF6E3}
.gc-dx.got span{color:#1E2B4F;font-weight:700}
.gc-dx em{position:absolute;right:5px;top:4px;font-style:normal;font-size:10.5px;color:#8A90A0}
.gc-dx i{position:absolute;left:4px;top:4px;font-style:normal;font-size:9.5px;background:#E3B34C;color:#1E2B4F;padding:0 5px;border-radius:6px;font-weight:900}
.gc-dex-note{font-size:12px;color:#6B7180;margin-top:10px;line-height:1.7}
.gc-mbear{display:flex;align-items:center;gap:10px;background:#F3F1EC;border-radius:12px;padding:8px 12px;margin-top:12px;text-align:left;font-size:13px;line-height:1.5}
.gc-mbear svg{width:46px;height:50px;flex:0 0 auto}
.gc-mbear b{color:#1E2B4F}
.gc-mbear .nw{display:inline-block;background:#E0322F;color:#fff;font-size:10px;font-weight:900;padding:0 6px;border-radius:6px;margin-left:4px}

/* ── 萬聖節造型 ── */
#gcOv.hw .gc-sun{background:radial-gradient(circle at 50% 44%,#FFE9C9 0,#F6B26B 50%,#7D4CA8 100%)}
#gcOv.hw .gc-red{fill:#F08A24}
#gcOv.hw .gc-red2{fill:#6E3FA3}
#gcOv.hw .gc-love{background:#F08A24;color:#fff}
#gcOv.hw .gc-luck{background:#6E3FA3}
#gcOv.hw .gc-top{background:linear-gradient(135deg,#3B2459,#1E2B4F)}

/* 掉出來的扭蛋 */
.gc-cap{position:absolute;left:95px;top:318px;width:90px;height:90px;z-index:8;opacity:0;pointer-events:none;will-change:transform,opacity}
.gc-cap.go{animation:gcCapOut 1.8s cubic-bezier(.3,.7,.3,1) forwards;pointer-events:auto;cursor:pointer}
/* 扭蛋從出口滾出來：先在出口轉一圈，再一邊轉一邊變大飛到中間，最後轉正停住 */
@keyframes gcCapOut{
  0%{transform:translate(0,0) rotate(0) scale(.22);opacity:0}
  8%{opacity:1}
  25%{transform:translate(0,18px) rotate(-360deg) scale(.42)}
  75%{transform:translate(0,-150px) rotate(-900deg) scale(1.65)}
  90%{transform:translate(0,-184px) rotate(-1070deg) scale(1.85)}
  100%{transform:translate(0,-180px) rotate(-1080deg) scale(1.8);opacity:1}}
.gc-capin{position:relative;width:100%;height:100%}
.gc-cap.ready:not(.held) .gc-capin{animation:gcBob 1.8s ease-in-out infinite}
.gc-capin i{position:absolute;left:0;width:100%;height:50%;border:2.5px solid rgba(30,43,79,.18)}
.gc-capin .t{top:0;border-radius:90px 90px 0 0;border-bottom:none;background:var(--c);
  background-image:radial-gradient(circle at 30% 35%,rgba(255,255,255,.6) 0 12%,transparent 13%);
  transition:transform .8s cubic-bezier(.22,1,.36,1),opacity .5s .25s ease}
.gc-capin .b{bottom:0;border-radius:0 0 90px 90px;border-top:none;background:#fff}
.gc-cap.open .t{transform:translate(-22px,-56px) rotate(-40deg);opacity:0}
.gc-burst{position:absolute;left:50%;top:50%;width:12px;height:12px;margin:-6px;border-radius:50%;
  background:radial-gradient(circle,#fff 0,rgba(255,236,190,.9) 35%,rgba(227,179,76,0) 70%);opacity:0;pointer-events:none}
.gc-cap.open .gc-burst{animation:gcBurst .9s cubic-bezier(.22,1,.36,1) forwards}
@keyframes gcBurst{0%{opacity:1;transform:scale(0)}60%{opacity:.9}100%{opacity:0;transform:scale(26)}}

/* 趴在 OTTO2 牌子上的小黑熊 */
.gc-pg{position:absolute;left:117px;top:258px;width:46px;height:42px;z-index:9;pointer-events:none;transform-origin:50% 60%}
.gc-pb{position:absolute;left:0;top:0;width:46px;height:34px;overflow:hidden;animation:gcPeek 3.6s ease-in-out infinite;transform-origin:50% 100%}
.gc-pb svg{width:46px;height:46px;display:block}
@keyframes gcPeek{0%,70%,100%{rotate:0deg}78%{rotate:-8deg}86%{rotate:6deg}}
.gc-paw{position:absolute;top:28px;width:15px;height:12px;border-radius:50% 50% 45% 45%;background:#231F20}
.gc-paw::after{content:"";position:absolute;left:3px;right:3px;bottom:2px;height:2px;border-top:2px dotted rgba(255,255,255,.7)}
.gc-paw.l{left:5px}.gc-paw.r{left:26px}
.gc-pg.fling .gc-pb,.gc-pg.land .gc-pb,.gc-pg.lift .gc-pb{height:46px;animation:none}
.gc-pg.fling,.gc-pg.land,.gc-pg.lift{filter:drop-shadow(0 0 1.5px #fff) drop-shadow(0 0 1.5px #fff) drop-shadow(0 2px 3px rgba(0,0,0,.25))}
.gc-pg.fling{animation:gcFling 1s cubic-bezier(.3,.6,.4,1) forwards}
@keyframes gcFling{0%{transform:none}12%{transform:translate(6px,-14px) rotate(40deg)}45%{transform:translate(70px,-150px) rotate(360deg)}100%{transform:translate(160px,-330px) rotate(900deg) scale(.5);opacity:0}}
.gc-pg.wait{opacity:0}
.gc-pg.land{animation:gcLand .75s cubic-bezier(.3,0,.4,1) forwards}
@keyframes gcLand{0%{transform:translate(-30px,-440px) rotate(-200deg);opacity:1}62%{transform:translate(0,-172px) rotate(0) scale(1.18,.8)}80%{transform:translate(0,-186px) scale(.94,1.08)}100%{transform:translate(0,-178px)}}
.gc-pg.land .gc-paw,.gc-pg.lift .gc-paw{top:30px}
.gc-pg.land .gc-paw.l,.gc-pg.lift .gc-paw.l{left:-2px;rotate:-25deg}
.gc-pg.land .gc-paw.r,.gc-pg.lift .gc-paw.r{left:33px;rotate:25deg}
.gc-pg.lift{animation:gcLift .9s cubic-bezier(.22,1,.36,1) forwards}
@keyframes gcLift{0%{transform:translate(0,-178px)}35%{transform:translate(-6px,-202px) rotate(-12deg)}100%{transform:translate(-40px,-256px) rotate(-40deg);opacity:0}}
.gc-pg.back{animation:gcBack .6s cubic-bezier(.22,1.5,.36,1)}
@keyframes gcBack{from{transform:translateY(24px) scale(.3);opacity:0}to{transform:none;opacity:1}}

.gc-go{display:block;margin:6px auto 0;width:200px;padding:13px;border-radius:14px;border:none;background:#E3B34C;color:#1E2B4F;font-size:16px;font-weight:900;cursor:pointer;box-shadow:0 4px 0 #B8892E}
.gc-go:active{transform:translateY(3px);box-shadow:0 1px 0 #B8892E}
.gc-go:disabled{opacity:.45;cursor:default;transform:none;box-shadow:0 4px 0 #B8892E}
.gc-hint{text-align:center;font-size:12.5px;color:#6B7180;margin-top:10px;min-height:18px;line-height:1.6}
.gc-hint.done{color:#2E7D4F;font-weight:700}
.gc-why{text-align:center;font-size:11.5px;color:#8A90A0;margin-top:4px;line-height:1.6}
.gc-why a{color:#1E2B4F;font-weight:700;text-decoration:underline;cursor:pointer}

/* 集章 */
.gc-card{background:#fff;border-radius:14px;padding:12px;border:1px solid #E4E1D9}
.gc-wk,.gc-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}
.gc-wk{margin-bottom:5px}
.gc-wk span{text-align:center;font-size:10.5px;color:#6B7180}
.gc-d{aspect-ratio:1;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;color:#B3B0A8;border:1.5px dashed #DDD9CF;font-variant-numeric:tabular-nums}
.gc-d.blank{border:none}
.gc-d.off{border:none;color:#D8D5CD}
.gc-d.on{background:#1E2B4F;color:#E3B34C;border:none;font-size:13px}
.gc-d.today{border:2px solid #E3B34C;color:#1E2B4F;font-weight:900}
.gc-d.new{animation:gcStamp .6s cubic-bezier(.22,1.4,.36,1)}
@keyframes gcStamp{0%{transform:scale(1.8);opacity:0}100%{transform:scale(1);opacity:1}}
.gc-barw{height:8px;border-radius:8px;background:#EEEBE4;overflow:hidden;margin-top:12px}
.gc-barw i{display:block;height:100%;background:linear-gradient(90deg,#E3B34C,#E8836B);border-radius:8px;transition:width .8s cubic-bezier(.22,1,.36,1)}
.gc-miles{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;font-size:10.5px;color:#6B7180;margin-top:6px;text-align:center;line-height:1.4}
.gc-miles span.got{color:#2E7D4F;font-weight:700}
.gc-pool{background:#fff;border-radius:14px;border:1px solid #E4E1D9;overflow:hidden}
.gc-pr{display:flex;align-items:center;gap:10px;padding:9px 12px;border-top:1px solid #E4E1D9;font-size:13px}
.gc-pr:first-child{border-top:none}
.gc-pr .ic{font-size:20px;width:26px;text-align:center}
.gc-pr .nm{flex:1}
.gc-pr .nm small{display:block;font-size:11px;color:#6B7180}
.gc-pr .left{font-size:11px;color:#E8836B;font-weight:700;white-space:nowrap}
.gc-pr.out{opacity:.4}
.gc-lock{font-size:11px;background:#F3F1EC;color:#6B7180;padding:8px 12px;text-align:center;line-height:1.6}
.gc-rules{font-size:11.5px;color:#8A90A0;line-height:1.8;margin:14px 16px 0;padding:0 0 0 16px}
.gc-cta{margin:16px 14px 28px;display:grid;gap:8px}
.gc-btn{display:block;width:100%;padding:13px;border-radius:12px;border:none;font-size:15px;font-weight:700;cursor:pointer}
.gc-btn.pri{background:#E3B34C;color:#1E2B4F}
.gc-btn.sec{background:#fff;color:#1E2B4F;border:1.5px solid #E4E1D9}

/* 綁電話 */
.gc-form{background:#fff;border-radius:16px;padding:18px;margin:14px;box-shadow:0 4px 14px rgba(30,43,79,.08)}
.gc-form h3{font-size:16px;color:#1E2B4F;margin:0 0 6px}
.gc-form p{font-size:12.5px;color:#6B7180;line-height:1.7;margin:0 0 12px}
.gc-form label{display:block;font-size:12.5px;color:#6B7180;margin:10px 0 4px}
.gc-form input{width:100%;padding:11px 12px;border:1.5px solid #E4E1D9;border-radius:10px;font-size:16px;font-family:inherit}
.gc-err{color:#C0392B;font-size:12.5px;min-height:18px;margin-top:8px;line-height:1.6}
.gc-msg{text-align:center;padding:40px 24px;font-size:14px;color:#6B7180;line-height:1.8}

/* 中獎視窗 */
.gc-modal{position:fixed;inset:0;background:rgba(20,26,45,.55);display:flex;align-items:center;justify-content:center;z-index:70;padding:24px;
  opacity:0;visibility:hidden;transition:opacity .35s ease,visibility .35s}
.gc-modal.show{opacity:1;visibility:visible}
.gc-mbox{background:#fff;border-radius:22px;padding:22px 20px 18px;text-align:center;width:100%;max-width:340px;
  transform:translateY(20px) scale(.94);transition:transform .5s cubic-bezier(.22,1,.36,1)}
.gc-modal.show .gc-mbox{transform:none}
.gc-prize{position:relative;height:110px;display:flex;align-items:center;justify-content:center}
.gc-rays{position:absolute;left:50%;top:50%;width:190px;height:190px;margin:-95px;border-radius:50%;
  background:repeating-conic-gradient(rgba(227,179,76,.32) 0 10deg,transparent 10deg 30deg);
  -webkit-mask:radial-gradient(circle,#000 25%,transparent 68%);mask:radial-gradient(circle,#000 25%,transparent 68%);animation:gcRays 14s linear infinite}
.gc-modal.nowin .gc-rays{display:none}
.gc-big{position:relative;font-size:62px;line-height:1}
.gc-modal.show .gc-big{animation:gcPop .7s .15s cubic-bezier(.22,1.3,.36,1) both}
@keyframes gcPop{from{transform:scale(.2) rotate(-20deg);opacity:0}to{transform:none;opacity:1}}
.gc-mbox h3{font-size:20px;color:#1E2B4F;margin:6px 0 0;font-weight:900}
.gc-mbox p{font-size:13.5px;color:#6B7180;margin:6px 0 0;line-height:1.6}
.gc-mbal{background:#FBF3DF;border-radius:12px;padding:10px;margin:14px 0 12px;font-size:13px;line-height:1.7}
.gc-mbal b{color:#1E2B4F;font-size:15px}
.gc-mbal .next{font-size:12px;color:#E8836B;margin-top:4px;font-weight:700}
.gc-conf{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:80}
.gc-conf i{position:absolute;top:-16px;width:9px;height:13px;border-radius:2px;will-change:transform,opacity;animation:gcFall var(--t) cubic-bezier(.25,.46,.45,.94) var(--dl) forwards}
.gc-conf i.o{border-radius:50%}
.gc-conf i.s{width:4px!important;height:18px}
.gc-conf i.k{top:auto;bottom:-16px;animation:gcShoot var(--t) cubic-bezier(.2,.7,.4,1) var(--dl) forwards}
@keyframes gcFall{0%{transform:translate3d(0,0,0) rotate(0);opacity:1}85%{opacity:1}100%{transform:translate3d(var(--dx),105vh,0) rotate(var(--r));opacity:0}}
@keyframes gcShoot{0%{transform:translate3d(0,0,0) rotate(0);opacity:1}38%{transform:translate3d(var(--px),var(--py),0) rotate(calc(var(--r) * .4))}88%{opacity:1}100%{transform:translate3d(calc(var(--px) * 1.35),30vh,0) rotate(var(--r));opacity:0}}
.gc-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);background:#2A2E38;color:#fff;font-size:13px;padding:10px 16px;border-radius:12px;z-index:90;max-width:88%;line-height:1.6;text-align:center}
/* 不做「減少動態效果」的縮短：扭蛋遊戲本身就是動畫，縮成一瞬間的話
   扭蛋不會繞、方向盤不會轉、小黑熊看起來像直接消失（2026-09-30 大熊實機回報）。 */
`;

var SYMBOLS = '<svg width="0" height="0" style="position:absolute" aria-hidden="true">' +
  '<symbol id="gcBh" viewBox="0 0 40 40">' +
  '<circle cx="8" cy="9" r="7" fill="#231F20"/><circle cx="32" cy="9" r="7" fill="#231F20"/>' +
  '<path d="M6 8 Q7 4 11 3" stroke="#fff" stroke-width="1.6" fill="none"/><path d="M34 8 Q33 4 29 3" stroke="#fff" stroke-width="1.6" fill="none"/>' +
  '<ellipse cx="20" cy="22" rx="17" ry="16" fill="#231F20"/>' +
  '<circle cx="13" cy="19" r="2.6" fill="#231F20" stroke="#fff" stroke-width="1.6"/><circle cx="27" cy="19" r="2.6" fill="#231F20" stroke="#fff" stroke-width="1.6"/>' +
  '<rect x="15" y="20" width="10" height="10" rx="4" fill="#fff"/><ellipse cx="20" cy="22.5" rx="3" ry="2" fill="#231F20"/></symbol>' +
  '<symbol id="gcBody" viewBox="0 0 38 58">' +
  '<ellipse cx="8" cy="20" rx="6" ry="5" fill="#231F20"/><ellipse cx="30" cy="20" rx="6" ry="5" fill="#231F20"/>' +
  '<path d="M6 30 C6 20 12 17 19 17 C26 17 32 20 32 30 L33 52 Q33 57 28 57 L10 57 Q5 57 5 52 Z" fill="#231F20"/>' +
  '<circle cx="14" cy="26" r="2.2" fill="#231F20" stroke="#fff" stroke-width="1.4"/><circle cx="24" cy="26" r="2.2" fill="#231F20" stroke="#fff" stroke-width="1.4"/>' +
  '<rect x="15.5" y="26" width="7" height="7" rx="3" fill="#fff"/><ellipse cx="19" cy="27.6" rx="2" ry="1.4" fill="#231F20"/>' +
  '<path d="M13 38 L18 42 L25 37 L24 36 L18 40 L14 37 Z" fill="#fff"/></symbol></svg>';

/* 紅利兌換表（跟店裡的「紅利點數兌換」海報一致），中獎時提示下一個目標 */
var TIERS = [[15,"一塊 6 號畫布"],[35,"23cm 流動熊"],[55,"33cm 流動熊"],[85,"30cm 流動畫"],[105,"40cm 水晶掛畫"],[150,"60x60cm 地毯作品"],[170,"3500 儲值點"]];
var CAPC = ["#E8836B","#E3B34C","#7FB2A0","#8FA6D9","#D98FB8","#F2C14E"];
var BALLC = ["#E0322F","#F2C94C","#7BBF3F","#6E3FA3","#F08A3C","#4FA3C7","#E88BB0","#3E7BC4"];

var ov = null, st = null, busy = false, pending = null, spun = null;
var $ = function(id){ return document.getElementById(id) };
var esc = function(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c] }) };
var md = function(d){ return String(d || "").slice(5).replace("-", "/") };

function token(){
  try { return (window.liff && liff.isLoggedIn && liff.isLoggedIn()) ? liff.getAccessToken() : "" } catch(e){ return "" }
}
async function call(path, body){
  var r = await fetch(NOTIFY_URL.replace(/\/$/, "") + path, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Object.assign({ accessToken: token() }, body || {})) });
  var j = null;
  try { j = await r.json() } catch(e){}
  if (!j) throw new Error("連線不穩，請稍後再試");
  if (!j.ok) { var e = new Error(j.error || "發生錯誤"); e.code = j.code; throw e }
  return j;
}
function toast(msg){
  var t = document.createElement("div"); t.className = "gc-toast"; t.textContent = msg;
  document.body.appendChild(t); setTimeout(function(){ t.remove() }, 3600);
}

/* ── 開啟／關閉 ── */
function open(){
  if (!document.getElementById("gcCss")) {
    var s = document.createElement("style"); s.id = "gcCss"; s.textContent = CSS; document.head.appendChild(s);
  }
  if (!ov) {
    ov = document.createElement("div"); ov.id = "gcOv";
    ov.setAttribute("role", "dialog"); ov.setAttribute("aria-label", "扭蛋活動");
    document.body.appendChild(ov);
    var m = document.createElement("div"); m.className = "gc-modal"; m.id = "gcModal";
    m.innerHTML = '<div class="gc-mbox"><div class="gc-prize"><div class="gc-rays"></div><div class="gc-big" id="gcMIc"></div></div>' +
      '<h3 id="gcMT"></h3><p id="gcMP"></p><div id="gcMBear"></div><div class="gc-mbal" id="gcMBal"></div>' +
      '<button class="gc-btn pri" id="gcMBook">📅 順便預約下一堂</button>' +
      '<button class="gc-btn sec" id="gcMClose" style="margin-top:8px">知道了</button></div>';
    document.body.appendChild(m);
    var c = document.createElement("div"); c.className = "gc-conf"; c.id = "gcConf"; document.body.appendChild(c);
    $("gcMClose").onclick = closeModal;
    $("gcMBook").onclick = function(){ closeModal(); close(); if (window.setStep) setStep(1) };
  }
  ov.style.display = "block";
  requestAnimationFrame(function(){ ov.classList.add("show") });
  document.body.style.overflow = "hidden";
  ov.innerHTML = shell('<div class="gc-msg">載入中…</div>');
  bindShell();
  load();
}
function close(){
  if (!ov) return;
  ov.classList.remove("show");
  setTimeout(function(){ ov.style.display = "none" }, 300);
  document.body.style.overflow = "";
}
function shell(inner){
  var t = (st && st.title) || "十月黑熊扭蛋";
  return SYMBOLS + '<div class="gc-top"><button class="gc-x" id="gcX" aria-label="關閉">✕</button>' +
    '<div class="gc-ttl">OTTO2 ARTCLUB · OCTOBER</div><h1>' + (st && st.halloween ? '🎃 萬聖節・' : '🐻 ') + esc(t) + '</h1>' +
    '<p>每天轉一次，紅利、課程券等你拿</p></div>' + inner;
}
function bindShell(){ var x = $("gcX"); if (x) x.onclick = close }

async function load(extra){
  if (!token()) return renderNoLine();
  try {
    var j = await call("/gacha/state", extra);
    if (j.needPhone) { st = j; return renderPhone(j.guess) }
    st = j; render(false);
  } catch(e) {
    if (e.code === "PHONE_TAKEN" || e.code === "BAD_PHONE") { renderPhone(extra && extra.phone, e.message); return }
    ov.innerHTML = shell('<div class="gc-msg">' + esc(e.message) + '<br><br><button class="gc-btn sec" id="gcRe" style="max-width:200px;margin:0 auto">再試一次</button></div>');
    bindShell(); $("gcRe").onclick = function(){ load() };
  }
}
function renderNoLine(){
  var canLogin = window.liff && liff.login && !(liff.isLoggedIn && liff.isLoggedIn());
  ov.innerHTML = shell('<div class="gc-msg">扭蛋活動要從 Otto2 的 LINE 官方帳號打開預約頁才能玩，<br>我們才知道獎品要送給誰。' +
    (canLogin ? '<br><br><button class="gc-btn pri" id="gcLogin" style="max-width:220px;margin:0 auto">用 LINE 登入</button>' : '') + '</div>');
  bindShell();
  if (canLogin) $("gcLogin").onclick = function(){ try { liff.login({ redirectUri: location.href }) } catch(e){} };
}
function renderPhone(guess, err){
  var c = window.customer || {};
  ov.innerHTML = shell('<div class="gc-form"><h3>先告訴我們你是誰 🐻</h3>' +
    '<p>輸入上課留的手機號碼，抽到的紅利和票券會直接存進這支電話的帳戶，順便幫你查點數還剩多少。</p>' +
    '<label for="gcName">姓名</label><input id="gcName" autocomplete="name" value="' + esc(c.name || (st && st.lineName) || "") + '">' +
    '<label for="gcPhone">手機號碼</label><input id="gcPhone" inputmode="numeric" autocomplete="tel" placeholder="09xxxxxxxx" value="' + esc(guess || c.phone || "") + '">' +
    '<div class="gc-err" id="gcErr">' + esc(err || "") + '</div>' +
    '<button class="gc-btn pri" id="gcBind" style="margin-top:6px">開始玩</button>' +
    '<p style="margin:12px 0 0;font-size:11.5px">一個 LINE 帳號只能綁一支電話，綁好之後就不能自己更改，打錯請私訊小編。</p></div>');
  bindShell();
  $("gcBind").onclick = function(){
    var ph = $("gcPhone").value.replace(/\D/g, "").replace(/^886/, "0");
    var nm = $("gcName").value.trim();
    if (!/^09\d{8}$/.test(ph)) { $("gcErr").textContent = "手機號碼格式不對，請輸入 09 開頭的 10 碼"; return }
    if (!nm) { $("gcErr").textContent = "請填姓名，小編才知道是誰中獎"; return }
    $("gcBind").disabled = true; $("gcBind").textContent = "確認中…";
    load({ phone: ph, name: nm });
  };
}

/* ── 主畫面 ── */
function left(){ return st ? Math.max(0, st.chances.total - st.chances.used) : 0 }
function render(anim){
  var me = st.me, s = st.status;
  var banner = "";
  if (s === "soon") banner = '<div class="gc-banner">🎉 活動 <b>' + md(st.start) + '</b> 開始！到時候每天都能來轉一次，先看看有什麼獎品吧。</div>';
  else if (s === "ended") banner = '<div class="gc-banner">活動已經結束囉，謝謝你這個月的參與 🐻</div>';
  else if (s === "test") banner = '<div class="gc-banner test">🔧 測試模式：活動 ' + md(st.start) + ' 才開始，館內老師可以先無限次玩。<b>抽到的紅利和票券都不會入帳</b>，每轉一次算集一天，正式開始前會清空。</div>';
  if (s === "test") banner += '<div style="text-align:right;margin:-4px 0 10px"><a class="gc-hwlink" id="gcHwPrev" style="font-size:12px;color:#6E3FA3;text-decoration:underline;cursor:pointer">' +
    (st.halloween ? "看平常的造型" : "🎃 預覽萬聖節造型") + '</a></div>';
  if (s === "on") {
    var extras = st.chances.reasons.slice(1).map(function(r){ return r.label + (r.sure ? "（保證中）" : "") });
    if (st.doubleToday) banner += '<div class="gc-banner">🎃 今天是加碼日：多一次機會，而且每一次都一定中！</div>';
    else if (extras.length) banner += '<div class="gc-banner">🎉 ' + esc(extras.join("、")) + '，今天<b>多送 ' + extras.length + ' 次</b>！</div>';
  }
  var tk = (st.ticker || []);
  var ticker = tk.length ? '<div class="gc-ticker"><span style="--t:' + Math.max(18, tk.length * 6) + 's">' +
    tk.map(function(t){ return esc(t.who) + ' 抽到<em>' + esc(t.ic + " " + t.nm) + '</em>' }).join("　·　") + '</span></div>' : "";

  ov.innerHTML = shell(
    '<div class="gc-me"><div class="gc-me-row"><div><span class="gc-name">' + esc(me.name || "你好") + '</span>' +
    '<span class="gc-tag' + (me.member ? " mem" : "") + '">' + (me.member ? "會員" : "新朋友") + '</span></div>' +
    '<small style="color:#6B7180;font-size:11.5px">' + esc(me.phone) + '</small></div>' +
    '<div class="gc-bal"><div><b>' + me.points.toLocaleString() + '</b><span>儲值點數</span></div>' +
    '<div><b>' + me.sessions + '</b><span>剩餘堂數</span></div>' +
    '<div class="hl"><b id="gcBB">' + me.bonus + '</b><span>紅利</span></div></div></div>' +
    '<div class="gc-sec"><div class="gc-sh"><h2>今天的扭蛋</h2><small id="gcChance"></small></div>' + banner + ticker + machine() +
    '<button class="gc-go" id="gcGo">轉一下 🐻</button><div class="gc-hint" id="gcHint"></div></div>' +
    gamesHtml() + bearsHtml() +
    '<div class="gc-sec"><div class="gc-sh"><h2>十月集章</h2><small>已集 ' + st.days.length + ' 天</small></div>' + stamps(anim) + '</div>' +
    '<div class="gc-sec"><div class="gc-sh"><h2>本月獎品</h2><small>大獎限量，抽完就沒了</small></div>' + pool() + '</div>' +
    '<ul class="gc-rules"><li>活動期間 ' + md(st.start) + '～' + md(st.end) + '，每天可以轉一次；當天有來上課、用線上預約系統約課、答對藝術小問答、翻牌配對過關，各多一次。</li>' +
    '<li>每日扭蛋最多拿 ' + st.cap + ' 點紅利（你已經拿了 ' + me.gotBonus + ' 點），拿滿之後改送「月底大抽獎券」' + (me.lottery ? '，你目前有 <b>' + me.lottery + '</b> 張' : '') + '。集章保底另外送，不算在裡面。</li>' +
    '<li>抽到的票券請在 ' + md(st.expiry) + ' 前來店出示使用，一次上課限用一張。</li></ul>' +
    '<div class="gc-cta"><button class="gc-btn pri" id="gcBook">📅 我要預約課程</button><button class="gc-btn sec" id="gcBack">回預約頁</button></div>');
  ov.classList.toggle("hw", !!st.halloween);
  bindShell();
  fillMachine();
  bindGames();
  $("gcGo").onclick = spin; $("gcKnob").onclick = spin; $("gcCap").onclick = openCap;
  var goBook = function(){ close(); if (window.setStep) setStep(1) };
  $("gcBook").onclick = goBook;
  if ($("gcBookLink")) $("gcBookLink").onclick = goBook;
  if ($("gcHwPrev")) $("gcHwPrev").onclick = function(){ st.halloween = !st.halloween; render(false) };
  $("gcBack").onclick = close;
  updChance();
}
function updChance(){
  var n = left(), s = st.status;
  var can = (s === "on" || s === "test") && n > 0;
  $("gcChance").textContent = s === "soon" ? md(st.start) + " 開始" : s === "ended" ? "活動已結束" : (n > 0 ? "剩 " + n + " 次機會" : "今天玩完囉");
  $("gcGo").disabled = busy || !can;
  $("gcGo").textContent = s === "soon" ? md(st.start) + " 開始 🐻" : "轉一下 🐻";
  if (busy) return;
  var h = $("gcHint");
  h.className = "gc-hint" + (can ? "" : (s === "on" || s === "test" ? " done" : ""));
  h.textContent = can ? "按「轉一下」，或直接轉 OTTO2 旋鈕 👆" : (s === "on" || s === "test") ? "✅ 今天已簽到，明天再來轉！" : "";
}
function machine(){
  return '<div class="gc-g" id="gcG">' +
    (st && st.halloween
      ? '<div class="gc-sun"><i style="left:16px;top:24px;font-size:22px;--d:0s">🎃</i><i style="left:232px;top:56px;font-size:20px;--d:.7s">🦇</i><i style="left:24px;top:206px;font-size:18px;--d:1.3s">🦇</i><i style="left:238px;top:220px;font-size:20px;--d:.4s">🎃</i><i style="left:248px;top:146px;font-size:14px;--d:1.9s">🕸️</i><i style="left:8px;top:116px;font-size:14px;--d:2.2s">🍬</i></div>'
      : '<div class="gc-sun"><i style="left:22px;top:30px;color:#E0322F;font-size:16px;--d:0s">❤</i><i style="left:238px;top:62px;color:#E3B34C;font-size:18px;--d:.7s">✦</i><i style="left:30px;top:210px;color:#E3B34C;font-size:14px;--d:1.3s">✦</i><i style="left:244px;top:226px;color:#E0322F;font-size:14px;--d:.4s">❤</i><i style="left:252px;top:150px;color:#E3B34C;font-size:11px;--d:1.9s">✦</i><i style="left:12px;top:120px;color:#E3B34C;font-size:11px;--d:2.2s">✦</i></div>') +
    '<div class="gc-floor"></div>' +
    '<div class="gc-mach" id="gcMach">' +
      '<div class="gc-globe"><svg class="gc-peek l"><use href="#gcBh"/></svg><svg class="gc-peek r"><use href="#gcBh"/></svg><div class="gc-swirl" id="gcSwirl"></div><div class="gc-gl"></div></div>' +
      '<svg class="gc-svg up" viewBox="0 0 280 424" aria-hidden="true">' +
        '<rect class="gc-red" x="122" y="6" width="36" height="16" rx="7" fill="#D7262E" stroke="#1A1A1A" stroke-width="3"/>' +
        '<path class="gc-red" d="M86 52 Q88 20 140 18 Q192 20 194 52 Z" fill="#D7262E" stroke="#1A1A1A" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M104 30 Q116 24 132 23" stroke="#fff" stroke-opacity=".45" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '<rect class="gc-red2" x="76" y="46" width="128" height="16" rx="8" fill="#B81E25" stroke="#1A1A1A" stroke-width="3"/>' +
        '<path class="gc-red" d="M80 250 C70 264 66 290 62 318 L54 386 Q52 398 68 398 L212 398 Q228 398 226 386 L218 318 C214 290 210 264 200 250 Z" fill="#D7262E" stroke="#1A1A1A" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M200 284 C204 310 208 340 211 376" stroke="#fff" stroke-opacity=".28" stroke-width="7" fill="none" stroke-linecap="round"/>' +
        '<rect class="gc-red2" x="68" y="236" width="144" height="20" rx="10" fill="#B81E25" stroke="#1A1A1A" stroke-width="3"/>' +
        '<path d="M84 243 L140 243" stroke="#fff" stroke-opacity=".35" stroke-width="4" stroke-linecap="round"/>' +
      '</svg>' +
      '<div class="gc-love">' + (st && st.halloween ? "BOO" : "LOVE") + '</div><div class="gc-luck">' + (st && st.halloween ? "TRICK" : "LUCK") + '</div>' +
      '<button class="gc-knob" id="gcKnob" aria-label="轉一下">OTTO2</button><div class="gc-exit"></div>' +
    '</div>' +
    '<div class="gc-crowd" id="gcCrowd"></div>' +
    '<div class="gc-cap" id="gcCap"><div class="gc-capin"><i class="t"></i><i class="b"></i><div class="gc-burst"></div></div></div>' +
    '<div class="gc-tapme">👆 點扭蛋打開！</div>' +
    '<div class="gc-pg" id="gcPg"><div class="gc-pb">' + (st && st.halloween ? bearSvg("pumpkin") : '<svg viewBox="0 0 40 40"><use href="#gcBh"/></svg>') + '</div><div class="gc-paw l"></div><div class="gc-paw r"></div></div>' +
  '</div>';
}
var BALLC_HW = ["#F08A24","#6E3FA3","#231F20","#7BBF3F","#F2C94C","#F08A24","#6E3FA3","#E88BB0"];
function fillMachine(){
  var hw = st && st.halloween, pal = hw ? BALLC_HW : BALLC;
  var rows = [[176,6],[146,6],[116,5],[90,4]], h = "", k = 0;
  rows.forEach(function(r, ri){
    var w = 208 / r[1];
    for (var i = 0; i < r[1]; i++) {
      var x = Math.round(i * w + (w - 36) / 2 + (ri % 2 ? 6 : -4)), d = (k * .29).toFixed(2);
      h += (k % 4 === 1)
        ? '<div class="gc-ball bh" style="left:' + (x - 2) + 'px;top:' + (r[0] - 4) + 'px;--d:' + d + 's"><svg viewBox="0 0 40 40"><use href="#gcBh"/></svg></div>'
        : '<div class="gc-ball" style="left:' + x + 'px;top:' + r[0] + 'px;--c:' + pal[k % pal.length] + ';--d:' + d + 's"></div>';
      k++;
    }
  });
  $("gcSwirl").innerHTML = h;
  var C = [[4,330,.8,1],[238,330,.8,1],[36,346,.72,0],[206,346,.72,0],[-6,362,1,0],[26,370,1,1],[60,376,.95,0],[184,376,.95,1],[216,370,1,0],[248,362,1,1]];
  $("gcCrowd").innerHTML = C.map(function(c, i){
    var bx = i % 2 ? 14 : 24;
    var bal = c[3] ? '<g class="gc-bal2"><path d="M' + bx + ' -2 L' + (bx - 2) + ' 30" stroke="#555" stroke-width="1"/><ellipse cx="' + bx + '" cy="-14" rx="11" ry="13" fill="' + (hw ? (i % 3 ? "#F08A24" : "#6E3FA3") : "#E0322F") + '" stroke="#1A1A1A" stroke-width="1.5"/><ellipse cx="' + (bx - 4) + '" cy="-19" rx="3" ry="4" fill="#fff" opacity=".5"/></g>' : "";
    return '<div class="gc-bb" style="left:' + c[0] + 'px;top:' + c[1] + 'px;--s:' + c[2] + ';--d:' + (i * .27).toFixed(2) + 's"><svg viewBox="0 0 38 58">' + bal + '<use href="#gcBody"/></svg></div>';
  }).join("");
}
function stamps(anim){
  var y = +st.start.slice(0, 4), m = +st.start.slice(5, 7);
  var first = new Date(y, m - 1, 1).getDay(), dim = new Date(y, m, 0).getDate();
  var played = {}; st.days.forEach(function(d){ played[d] = 1 });
  var h = '<div class="gc-card"><div class="gc-wk"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div><div class="gc-grid">';
  for (var i = 0; i < first; i++) h += '<div class="gc-d blank"></div>';
  for (var d = 1; d <= dim; d++) {
    var key = st.start.slice(0, 8) + String(d).padStart(2, "0");
    var c = "gc-d", t = d;
    if (key < st.start || key > st.end) c += " off";
    else if (played[key]) { c += " on"; t = "★"; if (anim && key === st.today) c += " new" }
    else if (key === st.today) c += " today";
    h += '<div class="' + c + '">' + t + '</div>';
  }
  var ms = st.milestones || [], top = ms.length ? ms[ms.length - 1].d : 28;
  h += '</div><div class="gc-barw"><i style="width:' + Math.min(100, st.days.length / top * 100) + '%"></i></div><div class="gc-miles">' +
    ms.map(function(x){ return '<span class="' + (x.got ? "got" : "") + '">' + (x.got ? "✓ " : "") + x.d + ' 天<br>' + esc(x.nm) + '</span>' }).join("") +
    '</div><div style="font-size:11px;color:#8A90A0;margin-top:8px">累積天數就好，不用連續 🐻</div></div>';
  return h;
}
function pool(){
  var mem = st.me.member;
  var row = function(p){
    return '<div class="gc-pr' + (p.left === 0 ? " out" : "") + '"><span class="ic">' + esc(p.ic) + '</span><span class="nm">' + esc(p.nm) +
      '<small>' + esc(p.sub || "") + '</small></span>' + (p.left === 0 ? '<span class="left">已抽完</span>' : "") + '</div>';
  };
  var list = st.prizes.filter(function(p){ return p.type !== "none" && (p.who === "all" || p.who === (mem ? "mem" : "new")) });
  var h = list.map(row).join("");
  if (!mem) {
    var lk = st.prizes.filter(function(p){ return p.who === "mem" && p.type !== "none" }).map(function(p){ return esc(p.nm) });
    if (lk.length) h += '<div class="gc-lock">🔒 會員限定：' + lk.join("、") + '<br>購買任一方案就能解鎖</div>';
  }
  return '<div class="gc-pool">' + h + '</div>';
}


/* ══ 第二波小遊戲（2026-09-30）══════════════════════════════
   藝術小問答、翻牌配對、黑熊圖鑑、萬聖節造型。
   一樣只負責畫面：答對了沒、過關了沒、抽到哪隻熊，都是伺服器說了算。 */

/* 造型小黑熊：同一顆黑熊頭，加上不同的配件 */
function bearSvg(id, ghost){
  var k = ghost ? "#D8D5CD" : id === "gold" ? "#E3B34C" : "#231F20";
  var ln = ghost ? "#EEEBE4" : "#fff";
  var head =
    '<circle cx="8" cy="9" r="7" fill="' + k + '"/><circle cx="32" cy="9" r="7" fill="' + k + '"/>' +
    '<path d="M6 8 Q7 4 11 3" stroke="' + ln + '" stroke-width="1.6" fill="none"/><path d="M34 8 Q33 4 29 3" stroke="' + ln + '" stroke-width="1.6" fill="none"/>' +
    '<ellipse cx="20" cy="22" rx="17" ry="16" fill="' + k + '"/>' +
    (ghost ? '<text x="20" y="28" text-anchor="middle" font-size="14" font-weight="900" fill="#fff">?</text>' :
    '<circle cx="13" cy="19" r="2.6" fill="#231F20" stroke="#fff" stroke-width="1.6"/><circle cx="27" cy="19" r="2.6" fill="#231F20" stroke="#fff" stroke-width="1.6"/>' +
    '<rect x="15" y="20" width="10" height="10" rx="4" fill="#fff"/><ellipse cx="20" cy="22.5" rx="3" ry="2" fill="#231F20"/>');
  var acc = "";
  if (!ghost) {
    if (id === "paint") acc = '<ellipse cx="22" cy="4" rx="12" ry="5" fill="#E0322F"/><circle cx="23" cy="-1" r="1.8" fill="#E0322F"/>' +
      '<ellipse cx="34" cy="36" rx="6.5" ry="4.8" fill="#F1DDB5" stroke="#8A6A3A" stroke-width=".8"/><circle cx="32" cy="35" r="1.2" fill="#E0322F"/><circle cx="35" cy="34" r="1.2" fill="#4FA3C7"/><circle cx="36.5" cy="37" r="1.2" fill="#F2C94C"/>';
    else if (id === "sketch") acc = '<g transform="rotate(35 32 6)"><rect x="30" y="-7" width="4.5" height="18" fill="#F2C94C" stroke="#8A6A1A" stroke-width=".6"/>' +
      '<path d="M30 11 L34.5 11 L32.25 15.5 Z" fill="#F1DDB5"/><path d="M31.5 13.6 L33 13.6 L32.25 15.5 Z" fill="#333"/><rect x="30" y="-7" width="4.5" height="2.6" fill="#E88BB0"/></g>';
    else if (id === "pour") acc = '<path d="M5 14 Q8 5 20 5 Q32 5 35 14 L35 16 Q33 20 32 15 Q30 12 28.5 18 Q27 22 25.5 15 Q24 12 22 19 Q20.5 23 19 15 Q17.5 12 16 18 Q14.5 21 13 15 Q11.5 12 10 17 Q8 20 7 15 Z" fill="#E88BB0"/>' +
      '<path d="M8 11 Q11 7 20 7 Q29 7 32 11 Q30 14 28 11 Q25 9 23 13 Q21 10 18 13 Q15 9 13 12 Q10 14 8 11 Z" fill="#4FA3C7"/><path d="M13 8 Q20 5.5 27 8 Q24 10 20 8.5 Q16 10 13 8 Z" fill="#F2C94C"/>';
    else if (id === "yarn") acc = '<circle cx="33" cy="35" r="6.5" fill="#E88BB0"/><path d="M27.5 33 Q33 29.5 38.5 34 M27.5 37 Q33 33.5 38.5 38 M30 29.5 Q35.5 35 33 41.5" stroke="#fff" stroke-width=".9" fill="none"/>' +
      '<path d="M27 38 Q20 43 11 40" stroke="#E88BB0" stroke-width="1.1" fill="none"/>';
    else if (id === "crystal") acc = '<path d="M29 -3 L36 -3 L39.5 1.5 L32.5 9.5 L25.5 1.5 Z" fill="#9FE3F0" stroke="#2F8FB0" stroke-width=".8"/>' +
      '<path d="M25.5 1.5 L39.5 1.5 M29 -3 L32.5 9.5 L36 -3" stroke="#2F8FB0" stroke-width=".5" fill="none"/><path d="M6 1 L7 3.5 L9.5 4 L7 5 L6 7.5 L5 5 L2.5 4 L5 3.5 Z" fill="#9FE3F0"/>';
    else if (id === "aroma") acc = '<ellipse cx="33" cy="37.5" rx="7" ry="4.5" fill="#D8D2C4" stroke="#9A9384" stroke-width=".8"/>' +
      '<circle cx="31.5" cy="32" r="1.8" fill="#E88BB0"/><circle cx="34.5" cy="32" r="1.8" fill="#E88BB0"/><circle cx="33" cy="29.6" r="1.8" fill="#E88BB0"/><circle cx="33" cy="34.2" r="1.8" fill="#E88BB0"/><circle cx="33" cy="32" r="1.3" fill="#F2C94C"/>';
    else if (id === "pumpkin") acc = '<ellipse cx="20" cy="4" rx="11.5" ry="6.5" fill="#F08A24" stroke="#B85F10" stroke-width=".8"/>' +
      '<path d="M14 4 Q20 -2 26 4 M20 -2.5 L20 10.5" stroke="#B85F10" stroke-width=".7" fill="none"/><rect x="19" y="-6" width="2.6" height="4.5" rx="1" fill="#4E8A2E"/>';
    else if (id === "gold") acc = '<path d="M34 -3 L35.2 1 L39 2 L35.2 3 L34 7 L32.8 3 L29 2 L32.8 1 Z" fill="#FFF3C4"/><path d="M5 0 L5.8 2.4 L8 3 L5.8 3.6 L5 6 L4.2 3.6 L2 3 L4.2 2.4 Z" fill="#FFF3C4"/>';
  }
  return '<svg viewBox="-2 -7 44 50" aria-hidden="true">' + head + acc + '</svg>';
}

/* ── 多拿扭蛋機會：小問答＋翻牌＋線上預約 ── */
function gamesHtml(){
  var s = st.status;
  if (!(s === "on" || s === "test")) return "";
  var h = '<div class="gc-sec"><div class="gc-sh"><h2>多拿扭蛋機會</h2><small>每天都能挑戰</small></div>';
  var q = st.quiz;
  if (q) {
    h += '<div class="gc-game"><div class="gc-gh">🎨 今日藝術小問答<span>答對多一次扭蛋</span></div>' +
      '<div class="gc-q">' + esc(q.q) + '</div><div class="gc-opts">' +
      q.o.map(function(o, i){
        var c = "";
        if (q.answered) c = i === q.a ? " right" : (i === q.c ? " wrong" : " dim");
        return '<button class="gc-opt' + c + '" data-i="' + i + '"' + (q.answered ? " disabled" : "") + '>' + "ABCD"[i] + '. ' + esc(o) + '</button>';
      }).join("") + '</div>';
    if (q.answered) h += '<div class="gc-qres ' + (q.ok ? "ok" : "no") + '">' + (q.ok ? "🎉 答對了！今天多送你一次扭蛋" : "差一點點！明天再來挑戰") +
      (q.t ? '<small>💡 ' + esc(q.t) + '</small>' : '') + '</div>';
    h += '</div>';
  }
  if (st.memory) {
    h += '<div class="gc-game row"><div><div class="gc-gh">🃏 翻牌配對<span>60 秒內配完 6 對，多一次扭蛋</span></div></div>' +
      (st.memory.done ? '<button class="gc-mini done" id="gcMem">✅ 已過關・再玩</button>' : '<button class="gc-mini" id="gcMem">開始挑戰</button>') + '</div>';
  }
  h += '<div class="gc-game row"><div><div class="gc-gh">📅 線上預約<span>今天用預約系統約課，多一次扭蛋</span></div></div>' +
    '<button class="gc-mini" id="gcBookLink">去預約</button></div>';
  return h + '</div>';
}
function bindGames(){
  document.querySelectorAll(".gc-opt:not([disabled])").forEach(function(b){ b.onclick = function(){ answer(+b.dataset.i, b) } });
  var m = $("gcMem"); if (m) m.onclick = memoryGame;
}
async function answer(i, btn){
  if (busy) return toast("扭蛋轉完再來答題喔");
  document.querySelectorAll(".gc-opt").forEach(function(b){ b.disabled = true });
  btn.classList.add("picked");
  try {
    var j = await call("/gacha/quiz", { choice: i });
    var sim = st.sim;
    st = j.state;
    if (sim) {
      /* 測試模式每答一題就換下一題，先把這一題的結果秀出來 */
      document.querySelectorAll(".gc-opt").forEach(function(b){
        var k = +b.dataset.i; b.classList.add(k === j.a ? "right" : (k === i ? "wrong" : "dim")) });
      btn.parentNode.insertAdjacentHTML("afterend", '<div class="gc-qres ' + (j.correct ? "ok" : "no") + '">' +
        (j.correct ? "🎉 答對了！" : "答錯了") + (j.t ? '<small>💡 ' + esc(j.t) + '</small>' : '') +
        '<small style="color:#8FA6D9">（測試模式可以一直答，3 秒後換下一題）</small></div>');
      setTimeout(function(){ render(false) }, 3000);
      return;
    }
    render(false);
    if (j.correct) { confetti(false); toast("答對了！多送你一次扭蛋 🎉") }
  } catch(e) { toast(e.message); load() }
}

/* ── 翻牌配對 ── */
var MEM_BEARS = ["paint","sketch","pour","yarn","crystal","aroma"];
function memoryGame(){
  if (busy) return toast("扭蛋轉完再來玩喔");
  var deck = MEM_BEARS.concat(MEM_BEARS).map(function(id){ return { id:id, r:Math.random() } })
    .sort(function(a, b){ return a.r - b.r });
  var box = document.createElement("div"); box.className = "gc-mem"; box.id = "gcMemBox";
  box.innerHTML = '<div class="gc-mem-in"><div class="gc-mem-top"><b>🃏 翻牌配對</b><span id="gcMemT">60</span><button class="gc-x" id="gcMemX" aria-label="關閉">✕</button></div>' +
    '<div class="gc-mem-bar"><i id="gcMemBar"></i></div>' +
    '<div class="gc-mem-grid">' + deck.map(function(c, i){
      return '<button class="gc-card2" data-i="' + i + '" aria-label="翻牌"><span class="in"><span class="bk">OTTO2</span><span class="fr">' + bearSvg(c.id) + '</span></span></button>' }).join("") +
    '</div><div class="gc-mem-msg" id="gcMemMsg">翻開兩張一樣的小黑熊就會消掉</div></div>';
  document.body.appendChild(box);
  requestAnimationFrame(function(){ box.classList.add("show") });
  var open1 = null, lock = false, done = 0, left = 60, over = false;
  var tick = setInterval(function(){
    left--; $("gcMemT").textContent = left; $("gcMemBar").style.width = (left / 60 * 100) + "%";
    if (left <= 10) $("gcMemBar").classList.add("hurry");
    if (left <= 0) { clearInterval(tick); over = true; lose() }
  }, 1000);
  function shut(){ clearInterval(tick); box.classList.remove("show"); setTimeout(function(){ box.remove() }, 300) }
  $("gcMemX").onclick = shut;
  box.querySelectorAll(".gc-card2").forEach(function(el){
    el.onclick = function(){
      if (lock || over || el.classList.contains("flip")) return;
      el.classList.add("flip");
      if (!open1) { open1 = el; return }
      var a = open1, b = el; open1 = null;
      if (deck[+a.dataset.i].id === deck[+b.dataset.i].id) {
        setTimeout(function(){ a.classList.add("got"); b.classList.add("got") }, 250);
        if (++done === MEM_BEARS.length) { clearInterval(tick); over = true; setTimeout(win, 500) }
      } else {
        lock = true;
        setTimeout(function(){ a.classList.remove("flip"); b.classList.remove("flip"); lock = false }, 750);
      }
    };
  });
  function lose(){
    $("gcMemMsg").innerHTML = '⏰ 時間到了！<button class="gc-mini" id="gcMemRe">再試一次</button>';
    $("gcMemRe").onclick = function(){ shut(); setTimeout(memoryGame, 320) };
  }
  async function win(){
    $("gcMemMsg").textContent = "全部配對完成！確認中…";
    try {
      var j = await call("/gacha/memory");
      st = j.state;
      confetti(false);
      $("gcMemMsg").innerHTML = (st.sim ? "🎉 過關！（測試模式，可以一直玩）" : j.first ? "🎉 過關！今天多送你一次扭蛋" : "🎉 過關！今天的加碼已經領過囉") +
        '<button class="gc-mini" id="gcMemOk">回去轉扭蛋</button>';
      $("gcMemOk").onclick = function(){ shut(); render(false) };
    } catch(e) {
      $("gcMemMsg").innerHTML = esc(e.message) + '<button class="gc-mini" id="gcMemOk">關閉</button>';
      $("gcMemOk").onclick = shut;
    }
  }
}

/* ── 黑熊圖鑑 ── */
function bearsHtml(){
  var b = st.bears; if (!b) return "";
  var have = b.have || {}, n = b.list.filter(function(x){ return have[x.id] > 0 }).length;
  return '<div class="gc-sec"><div class="gc-sh"><h2>黑熊圖鑑</h2><small>已收集 ' + n + '／' + b.list.length + '</small></div>' +
    '<div class="gc-card"><div class="gc-dex">' + b.list.map(function(x){
      var got = have[x.id] > 0;
      return '<div class="gc-dx' + (got ? " got" : "") + (x.rare ? " rare" : "") + '">' + bearSvg(x.id, !got) +
        '<span>' + (got ? esc(x.nm) : "？？？") + '</span>' + (got && have[x.id] > 1 ? '<em>×' + have[x.id] + '</em>' : '') + (x.rare ? '<i>稀有</i>' : '') + '</div>';
    }).join("") + '</div>' +
    '<div class="gc-dex-note">' + (b.done ? '✅ 已集滿！' + esc(b.reward) + ' 已送出' :
      '每轉一次扭蛋，就會多一隻造型小黑熊。集滿 ' + b.list.length + ' 款送 <b>' + esc(b.reward) + '</b>') + '</div></div></div>';
}

/* ── 轉扭蛋 ── */
function restart(el, cls){ el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls) }
function spin(){
  if (busy || left() <= 0 || !(st.status === "on" || st.status === "test")) return;
  busy = true; spun = null; updChance();
  var cap = $("gcCap"), pg = $("gcPg");
  var cp = st.halloween ? ["#F08A24","#6E3FA3","#7BBF3F"] : CAPC;
  cap.className = "gc-cap"; cap.style.setProperty("--c", cp[Math.floor(Math.random() * cp.length)]);
  restart($("gcKnob"), "turn"); restart($("gcSwirl"), "spin"); restart($("gcMach"), "wobble");
  $("gcG").classList.add("party");
  try { $("gcG").scrollIntoView({ behavior:"smooth", block:"center" }) } catch(e){}
  setTimeout(function(){ pg.className = "gc-pg fling" }, 180);
  $("gcHint").className = "gc-hint"; $("gcHint").textContent = "轉轉轉…";
  pending = call("/gacha/spin").then(function(j){ spun = j; return j });
  var animDone = new Promise(function(r){ setTimeout(r, 1250) });
  Promise.all([pending, animDone]).then(function(){
    cap.classList.add("go");
    $("gcG").classList.add("focus");
    setTimeout(function(){
      cap.classList.add("held"); pg.className = "gc-pg land";
      setTimeout(function(){ cap.classList.add("ready"); $("gcG").classList.add("tap"); $("gcHint").textContent = "小黑熊抓到扭蛋了！點一下讓牠幫你打開 👆" }, 750);
    }, 1800);
  }).catch(function(e){
    busy = false;
    $("gcG").classList.remove("party", "focus", "tap");
    pg.className = "gc-pg back";
    toast(e.message || "扭蛋卡住了，請再試一次");
    if (e.code === "NO_CHANCE" || e.code === "SOON" || e.code === "ENDED") load(); else updChance();
  });
}
function openCap(){
  var cap = $("gcCap");
  if (!cap.classList.contains("ready") || cap.classList.contains("open") || !spun) return;
  cap.classList.add("open");
  $("gcG").classList.remove("tap");
  $("gcPg").className = "gc-pg lift";
  var p = spun.prize;
  if (p.type === "bonus") { $("gcBB").textContent = spun.state.me.bonus; restart($("gcBB"), "bump") }
  setTimeout(function(){ showModal(p) }, 650);
}
var afterModal = null;
function showModal(p){
  var me = spun.state.me, none = p.type === "none";
  $("gcMIc").textContent = p.ic;
  $("gcMT").textContent = none ? "今天沒中，別灰心" : p.type === "lottery" ? "紅利已經領滿了！" : "恭喜獲得！";
  $("gcMP").innerHTML = none ? "今天的集章已經幫你蓋好了<br>明天再來試試手氣 🍀"
    : p.type === "ticket" ? '<b style="color:#1E2B4F">' + esc(p.nm) + '</b><br>已放進你的票券，請在 ' + esc(md(spun.state.expiry)) + ' 前來店出示使用'
    : p.type === "lottery" ? '這次送你 <b style="color:#1E2B4F">' + esc(p.nm) + '</b> 一張<br>活動結束後抽出幸運得主'
    : '<b style="color:#1E2B4F">' + esc(p.nm) + '</b> 已存進你的帳戶';
  var next = TIERS.filter(function(t){ return t[0] > me.bonus })[0];
  $("gcMBal").innerHTML = (me.member
    ? '你目前有：儲值點數 <b>' + me.points.toLocaleString() + '</b>　堂數 <b>' + me.sessions + '</b>　紅利 <b>' + me.bonus + '</b>'
    : '你目前有：紅利 <b>' + me.bonus + '</b> 點') +
    (next ? '<div class="next">再 ' + (next[0] - me.bonus) + ' 點紅利就能換' + next[1] + ' 🎁</div>' : '<div class="next">紅利可以換好禮了！來店告訴小編 🎁</div>');
  if (spun.state.sim) $("gcMP").innerHTML += '<br><span style="font-size:12px;color:#8FA6D9">（測試模式，不會入帳）</span>';
  var bb = spun.bear;
  $("gcMBear").innerHTML = bb ? '<div class="gc-mbear">' + bearSvg(bb.id) + '<div>還扭到了 <b>' + esc(bb.nm) + '</b>' +
    (bb.isNew ? '<span class="nw">NEW</span>' : '') + (bb.rare ? '<span class="nw" style="background:#E3B34C;color:#1E2B4F">稀有</span>' : '') +
    '<br><span style="color:#8A90A0;font-size:12px">黑熊圖鑑 ' + bb.count + '／' + bb.total + '</span></div></div>' : '';
  $("gcMBal").style.display = "";
  $("gcModal").classList.toggle("nowin", none);
  $("gcModal").classList.add("show");
  if (!none) confetti(p.type === "ticket" || (p.v || 0) >= 10);
  afterModal = function(){
    if (spun.milestone) {
      var ms = spun.milestone; spun.milestone = null;
      setTimeout(function(){
        showModal2("🏅", "集滿 " + ms.d + " 天！", '集章保底送你 <b style="color:#1E2B4F">' + esc(ms.nm) + '</b>' +
          (ms.type === "ticket" ? "<br>已放進你的票券，來店出示就能領" : "<br>已存進你的帳戶"));
      }, 400);
      return;
    }
    if (spun.collect) {
      var co = spun.collect; spun.collect = null;
      setTimeout(function(){
        showModal2("📖", "黑熊圖鑑集滿了！", '恭喜集齊全部造型小黑熊<br>送你 <b style="color:#1E2B4F">' + esc(co.nm) + '</b>' +
          (co.type === "bonus" ? "<br>已存進你的帳戶" : "<br>已放進你的票券，來店出示就能領"));
      }, 400);
      return;
    }
    finish();
  };
}
function showModal2(ic, title, html){
  $("gcMBear").innerHTML = "";
  $("gcMIc").textContent = ic; $("gcMT").textContent = title;
  $("gcMP").innerHTML = html + (st && st.sim ? '<br><span style="font-size:12px;color:#8FA6D9">（測試模式，不會入帳）</span>' : '');
  $("gcModal").classList.remove("nowin"); $("gcModal").classList.add("show"); confetti(true);
  afterModal = function(){ spun && spun.collect ? showModalNext() : finish() };
}
/* 集章保底之後如果圖鑑也剛好集滿，接著再跳一個 */
function showModalNext(){
  if (spun.collect) {
    var co = spun.collect; spun.collect = null;
    setTimeout(function(){
      showModal2("📖", "黑熊圖鑑集滿了！", '恭喜集齊全部造型小黑熊<br>送你 <b style="color:#1E2B4F">' + esc(co.nm) + '</b>' +
        (co.type === "bonus" ? "<br>已存進你的帳戶" : "<br>已放進你的票券，來店出示就能領"));
    }, 400);
  } else finish();
}
function closeModal(){
  $("gcModal").classList.remove("show");
  var f = afterModal; afterModal = null;
  if (f) f();
}
function finish(){
  if (spun && spun.state) st = spun.state;
  busy = false; spun = null;
  render(true);
}
function confetti(big){
  var cs = ["#E3B34C","#E8836B","#1E2B4F","#7FB2A0","#8FA6D9","#E0322F","#F2C94C","#fff"];
  var shape = function(i){ return ["", "o", "s"][i % 3] };
  var W = window.innerWidth, H = window.innerHeight, h = "", fallN = big ? 200 : 120, shotN = big ? 60 : 32;
  for (var i = 0; i < fallN; i++) {
    h += '<i class="' + shape(i) + '" style="left:' + (Math.random() * 100).toFixed(1) + '%;background:' + cs[i % cs.length] +
      ';--t:' + (2.4 + Math.random() * 1.8).toFixed(2) + 's;--dl:' + (Math.random() * .9).toFixed(2) + 's;--dx:' + Math.round((Math.random() - .5) * 180) +
      'px;--r:' + Math.round((Math.random() - .5) * 1260) + 'deg;width:' + (6 + Math.round(Math.random() * 5)) + 'px"></i>';
  }
  [0, 1].forEach(function(side){
    for (var i = 0; i < shotN; i++) {
      var px = Math.round((side ? -1 : 1) * (W * .15 + Math.random() * W * .55)), py = -Math.round(H * .45 + Math.random() * H * .45);
      h += '<i class="k ' + shape(i) + '" style="' + (side ? "right" : "left") + ':' + Math.round(Math.random() * 20) + 'px;background:' + cs[(i + side) % cs.length] +
        ';--t:' + (1.8 + Math.random() * 1.2).toFixed(2) + 's;--dl:' + (Math.random() * .25).toFixed(2) + 's;--px:' + px + 'px;--py:' + py +
        'px;--r:' + Math.round((Math.random() - .5) * 1440) + 'deg;width:' + (6 + Math.round(Math.random() * 5)) + 'px"></i>';
    }
  });
  var c = $("gcConf"); c.innerHTML = h;
  clearTimeout(confetti._t); confetti._t = setTimeout(function(){ c.innerHTML = "" }, 5600);
}

window.Gacha = { open: open, close: close };
})();
