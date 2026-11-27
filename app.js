(function(){
'use strict';
document.documentElement.classList.add('js','locked');
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function escapeHTML(value){return String(value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]})}
var DPR=Math.min(window.devicePixelRatio||1,2);
var WEDDING=window.WEDDING_CONFIG;
if(!WEDDING)throw new Error('Wedding configuration did not load.');
var INFO={
  venue:WEDDING.locations[1].address,
  maps:WEDDING.locations[1].mapUrl,
  target:new Date(WEDDING.date.target).getTime()
};

/* ---------- seeded random ---------- */
function rng(seed){var s=seed>>>0||1;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296}}

/* ---------- rose sprites (drawn once, reused) ---------- */
var PAL={
  pink:{hi:'#fff2ee',mid:'#f3b7c0',lo:'#c4647a',edge:'rgba(120,30,55,.32)',core:'#b44a63'},
  wine:{hi:'#cf6479',mid:'#9a2c44',lo:'#4a1220',edge:'rgba(30,5,12,.4)',core:'#3a0d18'},
  peach:{hi:'#fff3e4',mid:'#f8c9aa',lo:'#d98a74',edge:'rgba(150,70,50,.3)',core:'#c56b57'},
  blush:{hi:'#fffaf5',mid:'#f7d3d2',lo:'#d79aa2',edge:'rgba(150,70,85,.28)',core:'#c47a88'}
};
function roseCanvas(px,pal,seed){
  var c=document.createElement('canvas');c.width=c.height=px;var g=c.getContext('2d');
  var cx=px/2,cy=px/2,R=px*.36;
  for(var k=0;k<6;k++){
    var a=k*1.047+seed;g.save();g.translate(cx,cy);g.rotate(a);
    var lg=g.createLinearGradient(R*.5,0,R*1.45,0);lg.addColorStop(0,'#2b5636');lg.addColorStop(1,'#82b06f');
    g.fillStyle=lg;g.beginPath();g.moveTo(R*.55,0);g.quadraticCurveTo(R*1.1,-R*.34,R*1.42,0);g.quadraticCurveTo(R*1.1,R*.34,R*.55,0);g.fill();
    g.strokeStyle='rgba(20,60,30,.35)';g.lineWidth=px*.004;g.beginPath();g.moveTo(R*.6,0);g.lineTo(R*1.3,0);g.stroke();g.restore();
  }
  g.save();g.shadowColor='rgba(40,8,18,.35)';g.shadowBlur=px*.05;g.shadowOffsetY=px*.02;
  g.fillStyle=pal.lo;g.beginPath();g.arc(cx,cy,R*1.02,0,6.3);g.fill();g.restore();
  var L=8;
  for(var l=0;l<L;l++){
    var t=l/(L-1),r=R*(1-t*.84),n=l<2?7:(l<5?6:5);
    for(var p=0;p<n;p++){
      var an=p*(6.2832/n)+l*.95+seed;
      var pr=r*.6,ox=Math.cos(an),oy=Math.sin(an);
      var X=cx+ox*r*.5,Y=cy+oy*r*.5;
      var gr=g.createRadialGradient(X+ox*pr*.35,Y+oy*pr*.35,pr*.08,X,Y,pr*1.02);
      gr.addColorStop(0,pal.hi);gr.addColorStop(.6,pal.mid);gr.addColorStop(1,pal.lo);
      g.fillStyle=gr;g.beginPath();g.arc(X,Y,pr,0,6.3);g.fill();
      g.strokeStyle=pal.edge;g.lineWidth=px*.005;g.stroke();
    }
  }
  var cg=g.createRadialGradient(cx,cy,0,cx,cy,R*.2);cg.addColorStop(0,pal.core);cg.addColorStop(1,pal.lo);
  g.fillStyle=cg;g.beginPath();g.arc(cx,cy,R*.16,0,6.3);g.fill();
  g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=px*.006;g.beginPath();g.arc(cx,cy,R*.1,.4,3.4);g.stroke();
  return c;
}
function rose(css,palName,seed,soft){
  /* soft>1 draws at a tiny size so the browser scales it up into a natural blur */
  var px=soft?Math.max(24,Math.round(css/soft)):Math.round(css*DPR*1.2);
  var c=roseCanvas(px,PAL[palName],seed||0);
  c.style.width=css+'px';c.style.height=css+'px';
  return c;
}
function petalSprite(c1,c2,w,h){
  var c=document.createElement('canvas');c.width=w*2;c.height=h*2;var g=c.getContext('2d');g.scale(2,2);
  var gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,c1);gr.addColorStop(1,c2);g.fillStyle=gr;
  g.beginPath();g.moveTo(w*.5,0);g.bezierCurveTo(w*1.1,h*.15,w*.95,h*.8,w*.5,h);g.bezierCurveTo(w*.05,h*.8,-.1*w,h*.15,w*.5,0);g.fill();
  g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=.8;g.beginPath();g.moveTo(w*.5,h*.1);g.lineTo(w*.5,h*.85);g.stroke();
  return c;
}
function marigoldCanvas(len,w){
  var c=document.createElement('canvas');c.width=w*2;c.height=len*2;c.style.width=w+'px';c.style.height=len+'px';
  var g=c.getContext('2d');g.scale(2,2);var r=rng(len*7+3);
  g.strokeStyle='#8f6d22';g.lineWidth=1.4;g.beginPath();g.moveTo(w/2,0);g.lineTo(w/2,len);g.stroke();
  var y=8,i=0;
  while(y<len-6){
    var R=w*(.36+r()*.05),cx=w/2+(r()-.5)*1.5;
    for(var p=0;p<11;p++){
      var a=p*.571+i*.4;var X=cx+Math.cos(a)*R*.6,Y=y+Math.sin(a)*R*.6;
      var gr=g.createRadialGradient(X,Y,0,X,Y,R*.55);gr.addColorStop(0,i%2?'#ffc233':'#ffa21f');gr.addColorStop(1,i%2?'#f08a12':'#e0700c');
      g.fillStyle=gr;g.beginPath();g.arc(X,Y,R*.5,0,6.3);g.fill();
    }
    g.fillStyle='#c25a07';g.beginPath();g.arc(cx,y,R*.28,0,6.3);g.fill();
    g.fillStyle='#ffd35c';g.beginPath();g.arc(cx-R*.06,y-R*.06,R*.14,0,6.3);g.fill();
    if(i%3===1){g.fillStyle='#3f7a3d';g.beginPath();g.ellipse(cx+R*.9,y+R*.9,R*.5,R*.2,.7,0,6.3);g.fill();g.beginPath();g.ellipse(cx-R*.9,y+R*.9,R*.5,R*.2,-.7,0,6.3);g.fill();}
    y+=R*1.5;i++;
  }
  return c;
}

/* ---------- confetti and petals (single shared canvas, runs only while needed) ---------- */
var FX=(function(){
  var cv=$('#fx'),ctx=cv.getContext('2d'),ps=[],run=false,last=0,W=0,H=0,sprites=[];
  function size(){var d=Math.min(window.devicePixelRatio||1,1.5);W=window.innerWidth;H=window.innerHeight;cv.width=W*d;cv.height=H*d;ctx.setTransform(d,0,0,d,0,0)}
  size();window.addEventListener('resize',size);
  function init(){sprites=[petalSprite('#fff0ee','#f0a9b5',16,22),petalSprite('#f6c1c8','#d2677c',16,22),petalSprite('#b2324e','#6e1f2f',15,21),petalSprite('#ffd98a','#e0a63a',14,19)]}
  function loop(t){
    var dt=Math.min(.05,(t-last)/1000||.016);last=t;ctx.clearRect(0,0,W,H);
    for(var i=ps.length-1;i>=0;i--){
      var p=ps[i];p.age+=dt;
      if(p.delay>0){p.delay-=dt;continue}
      p.vy+=p.g*dt;p.vx*=p.drag;p.x+=p.vx*dt+Math.sin(p.age*p.sw+p.ph)*p.sa*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;
      if(p.y>H+30||p.age>p.life){ps.splice(i,1);continue}
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);
      ctx.globalAlpha=Math.min(1,(p.life-p.age)*1.2);
      if(p.type==='p'){var s=sprites[p.k];ctx.scale(p.s,p.s*(.55+.45*Math.cos(p.age*p.fl)));ctx.drawImage(s,-8,-11,16,22)}
      else{ctx.fillStyle=p.col;ctx.scale(1,Math.cos(p.age*p.fl));ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h)}
      ctx.restore();
    }
    if(ps.length){requestAnimationFrame(loop)}else{run=false;ctx.clearRect(0,0,W,H)}
  }
  function start(){if(!run){run=true;last=performance.now();requestAnimationFrame(loop)}}
  function rain(n){
    for(var i=0;i<n;i++)ps.push({type:'p',k:i%4,x:Math.random()*W,y:-20-Math.random()*H*.6,vx:0,vy:50+Math.random()*60,g:6,drag:1,sw:1+Math.random()*1.5,sa:30+Math.random()*30,ph:Math.random()*6,r:Math.random()*6,vr:(Math.random()-.5)*2,s:.8+Math.random()*.7,fl:2+Math.random()*3,age:0,life:12,delay:Math.random()*3});
    start();
  }
  function burst(x,y){
    var cols=['#c9a24b','#efd994','#6e1f2f','#f3b7c0','#ffffff','#d2677c'];
    for(var i=0;i<56;i++){var a=Math.random()*6.283,v=180+Math.random()*340;
      ps.push({type:'c',col:cols[i%cols.length],w:5+Math.random()*5,h:8+Math.random()*7,x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-220,g:520,drag:.985,sw:0,sa:0,ph:0,r:Math.random()*6,vr:(Math.random()-.5)*12,fl:6+Math.random()*8,age:0,life:2.8,delay:0})}
    for(var j=0;j<22;j++){var b=Math.random()*6.283,w=120+Math.random()*260;
      ps.push({type:'p',k:j%4,x:x,y:y,vx:Math.cos(b)*w,vy:Math.sin(b)*w-260,g:230,drag:.985,sw:2,sa:30,ph:Math.random()*6,r:Math.random()*6,vr:(Math.random()-.5)*5,s:.9+Math.random()*.6,fl:3+Math.random()*3,age:0,life:4.5,delay:0})}
    start();
  }
  return{init:init,rain:rain,burst:burst};
})();

/* ---------- stage roses ---------- */
var backs=[],fronts=[];
function buildStage(){
  var vw=window.innerWidth,vh=window.innerHeight;
  var B=$('#roseBack'),F=$('#roseFront');
  var spec=[
    [B,-.10,.06,190,'pink',1,6,.45],[B,.70,.04,170,'peach',2,6,.4],[B,.60,.62,200,'blush',3,6,.5],[B,-.12,.50,170,'wine',4,5,.35],
    [B,.18,.78,150,'pink',5,5,.3],[B,.82,.34,120,'wine',6,5,.3],
    [F,-.20,.74,250,'pink',7,3,0],[F,.62,.80,270,'wine',8,3,0],[F,.74,-.08,190,'blush',9,3.6,0],[F,-.14,-.07,200,'peach',10,3.6,0]
  ];
  spec.forEach(function(s){
    var c=rose(s[3],s[4],s[5],s[6]);c.style.left=(s[1]*vw)+'px';c.style.top=(s[2]*vh)+'px';
    c.dataset.k=s[7];c.dataset.s=s[5];s[0].appendChild(c);(s[0]===B?backs:fronts).push(c);
  });
}
var px=0,py=0,tx=0,ty=0,stageOn=true,stageRaf=0;
function stageParallax(){
  stageRaf=0;
  if(!stageOn||document.hidden)return;
  px+=(tx-px)*.08;py+=(ty-py)*.08;
  backs.forEach(function(c,i){var k=(i%3+1)*7;c.style.transform='translate3d('+(px*k)+'px,'+(py*k)+'px,0) rotate('+(i*13+px*6)+'deg)'});
  fronts.forEach(function(c,i){var k=(i%2+2)*16;c.style.transform='translate3d('+(-px*k)+'px,'+(-py*k)+'px,0) rotate('+(i*21-px*8)+'deg)'});
  if(Math.abs(tx-px)>.001||Math.abs(ty-py)>.001)stageRaf=requestAnimationFrame(stageParallax);
}
function requestStageParallax(){if(stageOn&&!document.hidden&&!stageRaf)stageRaf=requestAnimationFrame(stageParallax)}
window.addEventListener('pointermove',function(e){tx=e.clientX/window.innerWidth-.5;ty=e.clientY/window.innerHeight-.5;requestStageParallax()});
window.addEventListener('deviceorientation',function(e){if(e.gamma==null)return;tx=Math.max(-.5,Math.min(.5,e.gamma/45));ty=Math.max(-.5,Math.min(.5,(e.beta-45)/60));requestStageParallax()});
document.addEventListener('visibilitychange',requestStageParallax);

/* ---------- preloading ---------- */
var PHOTOS=WEDDING.gallery.map(function(photo){return photo.src});
var audio=new Audio();audio.loop=true;audio.preload='none';audio.volume=0;audio.src=WEDDING.musicFile;
function withTimeout(p,ms){return Promise.race([p,new Promise(function(r){setTimeout(r,ms)})])}
function loadImg(src){return new Promise(function(res){var i=new Image();i.onload=function(){(i.decode?i.decode().catch(function(){}):Promise.resolve()).then(function(){res(i)})};i.onerror=function(){res(null)};i.src=src})}
function loadFonts(){
  if(!document.fonts||!document.fonts.load)return Promise.resolve();
  return Promise.all([document.fonts.load('500 40px "Playfair Display"'),document.fonts.load('italic 400 20px "Playfair Display"'),document.fonts.load('600 12px Montserrat'),document.fonts.load('400 14px "Tiro Devanagari Hindi"','श्री')]).catch(function(){});
}
/* smooth blur without ctx.filter (not supported in Safari): repeated half-size redraws */
function softPhoto(img){
  var w=img.naturalWidth,h=img.naturalHeight;
  var c=document.createElement('canvas');c.width=96;c.height=Math.round(96*h/w);var g=c.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(img,0,0,c.width,c.height);
  for(var s=0;s<4;s++){var n=document.createElement('canvas');n.width=c.width*2;n.height=c.height*2;var x=n.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(c,0,0,n.width,n.height);c=n}
  return c.toDataURL('image/jpeg',.82);
}

/* ---------- build content ---------- */
var FUNCS=WEDDING.events;

function scene(kind){
  var r=rng(kind.length*97+kind.charCodeAt(0)),s='',i;
  var open='<svg class="scene" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">';
  if(kind==='haldi'){
    s+='<defs><linearGradient id="hb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b8"/><stop offset="1" stop-color="#f7c948"/></linearGradient><radialGradient id="hm"><stop offset="0" stop-color="#ffd24a"/><stop offset="1" stop-color="#e8870f"/></radialGradient></defs><rect width="300" height="150" fill="url(#hb)"/>';
    for(i=0;i<34;i++){var x=r()*300,y=20+r()*130,R=10+r()*16;s+='<circle cx="'+x+'" cy="'+y+'" r="'+R+'" fill="url(#hm)" opacity="'+(.6+r()*.4)+'"/><circle cx="'+x+'" cy="'+y+'" r="'+R*.35+'" fill="#c25a07" opacity=".6"/>'}
  }else if(kind==='mehendi'){
    s+='<defs><linearGradient id="mb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfe6b8"/><stop offset="1" stop-color="#7fb06b"/></linearGradient></defs><rect width="300" height="150" fill="url(#mb)"/>';
    for(i=0;i<8;i++){var lx=r()*300,ly=r()*150;s+='<ellipse cx="'+lx+'" cy="'+ly+'" rx="26" ry="9" fill="#3f7a3d" opacity=".35" transform="rotate('+(r()*180)+' '+lx+' '+ly+')"/>'}
    s+='<g fill="#f3cfae"><ellipse cx="150" cy="104" rx="40" ry="42"/><rect x="108" y="30" width="15" height="70" rx="7.5" transform="rotate(-9 115 100)"/><rect x="127" y="16" width="15" height="82" rx="7.5" transform="rotate(-3 134 100)"/><rect x="146" y="12" width="15" height="86" rx="7.5" transform="rotate(3 153 100)"/><rect x="165" y="24" width="15" height="74" rx="7.5" transform="rotate(10 172 100)"/><rect x="186" y="74" width="15" height="52" rx="7.5" transform="rotate(54 190 100)"/></g>';
    s+='<g fill="none" stroke="#6b3a1c" stroke-width="2" stroke-linecap="round"><circle cx="150" cy="104" r="14"/><circle cx="150" cy="104" r="26"/><path d="M118 90q10-14 20 0M162 90q10-14 20 0M130 130q20 10 40 0"/>';
    [[115,40],[134,28],[153,26],[172,36]].forEach(function(p){s+='<path d="M'+p[0]+' '+p[1]+'v44" stroke-dasharray="1 7"/>'});
    s+='</g>';
  }else if(kind==='tilak'){
    s+='<defs><radialGradient id="tb" cx=".5" cy=".4"><stop offset="0" stop-color="#fff6e6"/><stop offset="1" stop-color="#e6d0aa"/></radialGradient><linearGradient id="tp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e3a1"/><stop offset="1" stop-color="#a67c26"/></linearGradient></defs><rect width="300" height="150" fill="url(#tb)"/>';
    s+='<ellipse cx="150" cy="96" rx="104" ry="46" fill="url(#tp)"/><ellipse cx="150" cy="92" rx="88" ry="36" fill="#fbeed2"/>';
    s+='<circle cx="150" cy="90" r="17" fill="#c8202f"/><circle cx="150" cy="90" r="9" fill="#e8c35a"/>';
    [[98,92],[202,92],[124,112],[176,112]].forEach(function(p){s+='<path d="M'+(p[0]-9)+' '+p[1]+'h18a9 9 0 0 1-18 0z" fill="#b8801f"/><path d="M'+p[0]+' '+(p[1]-3)+'c-6-8-3-14 0-18 3 4 6 10 0 18z" fill="#ff9a1f"/>'});
    for(i=0;i<22;i++){s+='<ellipse cx="'+(70+r()*160)+'" cy="'+(76+r()*40)+'" rx="3" ry="1.6" fill="#fffdf6"/>'}
  }else if(kind==='ring'){
    s+='<defs><linearGradient id="rb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde6e2"/><stop offset="1" stop-color="#ecc3c7"/></linearGradient><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e3a1"/><stop offset="1" stop-color="#a67c26"/></linearGradient></defs><rect width="300" height="150" fill="url(#rb)"/>';
    s+='<circle cx="126" cy="82" r="40" fill="none" stroke="url(#rg)" stroke-width="9"/><circle cx="176" cy="82" r="40" fill="none" stroke="url(#rg)" stroke-width="9"/><path d="M151 18l14 16-14 14-14-14z" fill="#ffffff" stroke="#d9c9ff" stroke-width="2"/>';
    for(i=0;i<16;i++){s+='<circle cx="'+r()*300+'" cy="'+r()*150+'" r="'+(1.5+r()*3)+'" fill="#fff" opacity=".8"/>'}
  }else if(kind==='sangeet'){
    s+='<defs><linearGradient id="sb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a2f8a"/><stop offset="1" stop-color="#e0598f"/></linearGradient><linearGradient id="sl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect width="300" height="150" fill="url(#sb)"/>';
    s+='<path d="M60 0L20 150H110z" fill="url(#sl)"/><path d="M240 0L190 150H290z" fill="url(#sl)"/>';
    [[110,.9],[190,1]].forEach(function(d){var x=d[0];s+='<g fill="#2a1042"><circle cx="'+x+'" cy="58" r="9"/><path d="M'+x+' 66l-10 30 -22 38h64l-22-38z"/><path d="M'+(x-8)+' 72L'+(x-26)+' 46M'+(x+8)+' 72L'+(x+24)+' 50" stroke="#2a1042" stroke-width="5" stroke-linecap="round"/></g>'});
    s+='<g fill="#fff" opacity=".8" font-size="22" font-family="serif"><text x="40" y="48">♪</text><text x="240" y="40">♫</text><text x="150" y="30">♪</text></g>';
  }else{
    s+='<defs><linearGradient id="mbk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a1a2e"/><stop offset="1" stop-color="#d9a441"/></linearGradient></defs><rect width="300" height="150" fill="url(#mbk)"/>';
    s+='<g fill="#f6e3a1"><rect x="78" y="40" width="9" height="96" rx="3"/><rect x="213" y="40" width="9" height="96" rx="3"/><rect x="104" y="46" width="7" height="90" rx="3"/><rect x="189" y="46" width="7" height="90" rx="3"/></g><path d="M60 42L150 12 240 42z" fill="#f6e3a1"/><path d="M72 42h156" stroke="#8a1a2e" stroke-width="3"/>';
    for(i=0;i<14;i++){s+='<circle cx="'+(70+i*12.5)+'" cy="50" r="4.5" fill="#ff9a1f"/>'}
    s+='<rect x="124" y="112" width="52" height="14" rx="3" fill="#6b2a14"/><path d="M150 112c-18-12-8-26 0-38 8 12 18 26 0 38z" fill="#ff7a14"/><path d="M150 112c-9-8-3-16 0-24 3 8 9 16 0 24z" fill="#ffd45a"/>';
  }
  return open+s+'</svg>';
}
function icon(k){
  var st='fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  var m={
   sun:'<svg viewBox="0 0 26 26" '+st+'><g class="a-spin"><circle cx="13" cy="13" r="4"/><path d="M13 2v4M13 20v4M2 13h4M20 13h4M5.2 5.2L8 8M18 18l2.8 2.8M5.2 20.8L8 18M18 8l2.8-2.8"/></g></svg>',
   leaf:'<svg viewBox="0 0 26 26" '+st+'><g class="a-sway"><path d="M13 24V9"/><path d="M13 9C13 4 17 2 22 2c0 5-3 8-9 7zM13 15c0-4-3-6-8-6 0 5 3 8 8 6z"/></g></svg>',
   diya:'<svg viewBox="0 0 26 26" '+st+'><path d="M3 15h20c0 5-4 8-10 8S3 20 3 15z"/><g class="a-flick"><path d="M13 13c-4-4-2-8 0-11 2 3 4 7 0 11z" fill="currentColor" fill-opacity=".25"/></g></svg>',
   ring:'<svg viewBox="0 0 26 26" '+st+'><g class="a-pulse"><circle cx="9.5" cy="15" r="6"/><circle cx="16.5" cy="15" r="6"/><path d="M13 2l3 3-3 3-3-3z"/></g></svg>',
   note:'<svg viewBox="0 0 26 26" '+st+'><g class="a-bounce"><path d="M9 20V6l12-3v14"/><circle cx="6.5" cy="20" r="3"/><circle cx="18.5" cy="17" r="3"/></g></svg>',
   fire:'<svg viewBox="0 0 26 26" '+st+'><g class="a-flick"><path d="M13 24c-5 0-8-3-8-7 0-4 3-6 4-10 3 2 4 4 4 6 2-1 3-3 3-5 3 3 5 6 5 9 0 4-3 7-8 7z" fill="currentColor" fill-opacity=".2"/></g></svg>'
  };
  return m[k];
}
function buildFest(){
  var st=$('#cfF .cf-stage');
  FUNCS.forEach(function(f){
    var d=document.createElement('article');d.className='cf-card fcard';
    d.innerHTML='<div class="art">'+scene(f.scene)+'<div class="ico">'+icon(f.icon)+'</div></div><div class="bd"><h3>'+escapeHTML(f.name)+'</h3><div class="day">'+escapeHTML(f.day)+'</div><div class="tm">'+escapeHTML(f.time)+'</div><div class="pl">'+escapeHTML(f.place)+'</div><div class="dress"><em>Dress code</em><span>'+escapeHTML(f.dressCode)+'</span><span class="sw">'+f.colors.map(function(c){return '<i style="background:'+escapeHTML(c)+'"></i>'}).join('')+'</span></div></div><div class="shade"></div>';
    st.appendChild(d);
  });
}
function buildStory(){
  var st=$('#cfP .cf-stage');
  WEDDING.gallery.forEach(function(photo){
    var d=document.createElement('figure');d.className='cf-card pcard';d.style.margin='';
    d.innerHTML='<img src="'+escapeHTML(photo.src)+'" alt="'+escapeHTML(photo.caption)+'" loading="lazy" decoding="async" draggable="false"><p>'+escapeHTML(photo.caption)+'</p><div class="shade"></div>';
    d.style.margin='0';d.style.marginLeft='calc(var(--cw)/-2)';
    st.appendChild(d);
  });
}

/* ---------- coverflow ---------- */
function Coverflow(root,dotsEl){
  var cards=$$('.cf-card',root),N=cards.length,i=0,sx=0,sy=0,dx=0,drag=false,horiz=null,w=300,id=null;
  var dots=[];for(var k=0;k<N;k++){var e=document.createElement('i');dotsEl.appendChild(e);dots.push(e)}
  function layout(off){
    off=off||0;
    for(var k=0;k<N;k++){
      var d=((k-i)%N+N)%N;if(d>N/2)d-=N;d+=off;
      var a=Math.abs(d),c=cards[k];
      c.style.transform='translate3d('+(d*60)+'%,0,'+(-a*150)+'px) rotateY('+(-d*30)+'deg) scale('+(1-Math.min(a,2)*.06)+')';
      c.style.zIndex=20-Math.round(a*2);
      c.style.opacity=a>1.7?0:1;
      c.style.pointerEvents=a<.5?'auto':'none';
      c.classList.toggle('side',Math.round(a)>=1);
    }
    dots.forEach(function(e,k){e.classList.toggle('on',k===i)});
  }
  function go(n){i=((n%N)+N)%N;layout(0)}
  root.addEventListener('pointerdown',function(e){if(e.target.closest('.cf-nav'))return;drag=true;horiz=null;sx=e.clientX;sy=e.clientY;dx=0;id=e.pointerId;w=cards[0].getBoundingClientRect().width||300});
  root.addEventListener('pointermove',function(e){
    if(!drag||e.pointerId!==id)return;
    var mx=e.clientX-sx,my=e.clientY-sy;
    if(horiz===null&&(Math.abs(mx)>8||Math.abs(my)>8)){horiz=Math.abs(mx)>Math.abs(my);if(horiz){try{root.setPointerCapture(id)}catch(x){}root.classList.add('drag')}}
    if(horiz){dx=mx;layout(Math.max(-1,Math.min(1,dx/(w*.62))))}
  });
  function end(e){
    if(!drag)return;drag=false;root.classList.remove('drag');
    if(horiz){if(dx<-w*.14)i=(i+1)%N;else if(dx>w*.14)i=(i-1+N)%N}
    horiz=null;dx=0;layout(0);
  }
  root.addEventListener('pointerup',end);root.addEventListener('pointercancel',end);
  var pn=$('.cf-nav.p',root),nx=$('.cf-nav.n',root);
  if(pn)pn.addEventListener('click',function(){go(i-1)});
  if(nx)nx.addEventListener('click',function(){go(i+1)});
  layout(0);
  return{go:go};
}

/* ---------- fixed flora and garlands ---------- */
var flora=[];
function buildFlora(){
  var host=$('#fixed-flora');
  var spec=[
    {l:-58,t:'12%',s:124,p:'pink',sd:1,ph:0},
    {r:-62,t:'30%',s:140,p:'wine',sd:2,ph:1.3},
    {l:-64,t:'52%',s:132,p:'peach',sd:3,ph:2.2},
    {r:-56,t:'68%',s:120,p:'blush',sd:4,ph:3.1},
    {l:-50,b:'-4%',s:150,p:'wine',sd:5,ph:4.0},
    {r:-48,b:'-6%',s:128,p:'pink',sd:6,ph:5.0}
  ];
  spec.forEach(function(s,i){
    var o=document.createElement('div');o.className='fr';o.style.width=s.s+'px';
    if(s.l!==undefined)o.style.left=s.l+'px';if(s.r!==undefined)o.style.right=s.r+'px';
    if(s.t)o.style.top=s.t;if(s.b)o.style.bottom=s.b;
    var inn=document.createElement('div');inn.className='in-sway';inn.style.animationDelay=(-i*1.1)+'s';inn.style.animationDuration=(6+i)+'s';
    var c=rose(s.s,s.p,s.sd);c.style.width='100%';c.style.height='auto';c.style.animationDelay=(i*.25)+'s';
    inn.appendChild(c);o.appendChild(inn);host.appendChild(o);flora.push({el:o,ph:s.ph});
  });
}
var garl=[];
function buildGarlands(){
  var host=$('#garlands'),vw=window.innerWidth;
  var n=Math.max(5,Math.round(vw/78)),lens=[];
  for(var i=0;i<n;i++){var u=i/(n-1);var d=Math.abs(u-.5)*2;lens.push(Math.round(34+d*d*74+(i%2?16:0)))}
  for(i=0;i<n;i++){
    var o=document.createElement('div');o.className='gl';o.style.left=((i+.5)/n*vw-11)+'px';
    var inn=document.createElement('div');inn.className='in-sway';inn.style.animationDelay=(-i*.7)+'s';inn.style.animationDuration=(3.6+(i%3)*.8)+'s';
    inn.appendChild(marigoldCanvas(lens[i],22));o.appendChild(inn);host.appendChild(o);garl.push(o);
  }
}
var lastY=0,swing=0,ticking=false;
function onScroll(){
  if(ticking)return;ticking=true;
  requestAnimationFrame(function(){
    ticking=false;var y=window.pageYOffset||0,dy=y-lastY;lastY=y;
    swing=Math.max(-14,Math.min(14,swing*.4+dy*.35));
    for(var i=0;i<garl.length;i++){garl[i].style.transform='rotate('+(swing*(.7+(i%3)*.15)).toFixed(2)+'deg)'}
    for(var j=0;j<flora.length;j++){var f=flora[j];
      f.el.style.transform='translate3d('+(Math.cos(y*.003+f.ph)*12).toFixed(1)+'px,'+(Math.sin(y*.0035+f.ph)*34).toFixed(1)+'px,0) rotate('+(Math.sin(y*.002+f.ph)*14).toFixed(1)+'deg)'}
    clearTimeout(onScroll.t);onScroll.t=setTimeout(function(){for(var i=0;i<garl.length;i++)garl[i].style.transform='rotate(0deg)'},140);
  });
}

/* ---------- typed names ---------- */
function typeName(el,name){
  el.innerHTML='';
  name.split('').forEach(function(ch,k){var s=document.createElement('span');s.className='l';s.style.setProperty('--i',k);s.textContent=ch;el.appendChild(s)});
}
function applyWeddingConfig(){
  var names=WEDDING.couple;
  document.title=WEDDING.pageTitle;
  var coverTitle=$('.cover-title');
  coverTitle.lastChild.textContent=names.bride+' & '+names.groom;
  $('#bname').setAttribute('aria-label',names.bride);
  $('#gname').setAttribute('aria-label',names.groom);
  var relations=$$('.rel b');
  relations[0].textContent=WEDDING.families.bride;
  relations[1].textContent=WEDDING.families.groom;
  $('.inv b').textContent=names.bride+' & '+names.groom;
  var dates=$$('.sd-m');
  dates[0].textContent=WEDDING.date.displayDay;
  $('.sd-d').textContent=WEDDING.date.dayNumber;
  dates[1].textContent=WEDDING.date.month;
  $('.sd-w').textContent=WEDDING.date.baraat;
  $('.sd-p').textContent=WEDDING.date.pheras;
  var locations=$$('.mapc');
  WEDDING.locations.forEach(function(location,index){
    var card=locations[index];
    card.href=location.mapUrl;
    card.setAttribute('aria-label','Open '+location.address+' in Google Maps');
    $('.cap b',card).textContent=location.name;
    $('.cap div',card).textContent=location.address;
  });
  var familyValues=$$('#close .fam span');
  familyValues[0].textContent=WEDDING.families.bride;
  familyValues[1].textContent=WEDDING.families.groom;
  $('.with').textContent='With love, the '+names.bride+' and '+names.groom+' families';
}

/* ---------- save the date (pull the tassel) ---------- */
function setupScroll(){
  var paper=$('#paper'),pin=$('#paperIn'),tassel=$('#tassel'),wrap=$('#sdw'),full=0,prog=0,done=false,y0=0,drag=false,moved=0;
  function measure(){full=pin.offsetHeight+6;if(done)paper.style.height=full+'px'}
  ['tl','tr','bl','br'].forEach(function(k,i){$('.corner.'+k).appendChild(rose(96,i%2?'pink':'blush',i+11))});
  setTimeout(measure,50);window.addEventListener('resize',measure);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);
  function set(p){prog=Math.max(0,Math.min(1,p));paper.style.height=(full*prog)+'px'}
  function finish(){
    done=true;tassel.classList.add('pulled');wrap.classList.add('done');
    var s=prog,t0=performance.now();
    (function step(t){var k=Math.min(1,(t-t0)/700),e=1-Math.pow(1-k,3);set(s+(1-s)*e);if(k<1)requestAnimationFrame(step);else{var r=paper.getBoundingClientRect();FX.burst(r.left+r.width/2,r.top+r.height*.4)}})(t0);
  }
  function back(){var s=prog,t0=performance.now();(function step(t){var k=Math.min(1,(t-t0)/380);set(s*(1-k));if(k<1)requestAnimationFrame(step)})(t0)}
  tassel.addEventListener('pointerdown',function(e){if(done)return;drag=true;moved=0;y0=e.clientY;try{tassel.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault()});
  tassel.addEventListener('pointermove',function(e){if(!drag||done)return;var dy=e.clientY-y0;moved=Math.max(moved,Math.abs(dy));set(dy/Math.max(1,full-30))});
  function up(){if(!drag)return;drag=false;if(done)return;if(moved<6||prog>.35)finish();else back()}
  tassel.addEventListener('pointerup',up);tassel.addEventListener('pointercancel',up);
  tassel.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!done)finish()}});
}

/* ---------- countdown ---------- */
function pad(n){return n<10?'0'+n:''+n}
function tick(){
  var el=$('#cd'),d=INFO.target-Date.now();
  if(d<=0){el.textContent='Today is the day';return}
  var s=Math.floor(d/1000),D=Math.floor(s/86400),H=Math.floor(s%86400/3600),M=Math.floor(s%3600/60),S=s%60;
  el.innerHTML='<span>'+D+'<small>d</small></span><span>'+pad(H)+'<small>hrs</small></span><span>'+pad(M)+'<small>min</small></span><span>'+pad(S)+'<small>sec</small></span>';
}

/* ---------- misc ---------- */
function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(function(){t.classList.remove('show')},1800)}
function setupActions(){
  $('#calBtn').href='https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(WEDDING.couple.bride+' weds '+WEDDING.couple.groom)+'&dates='+encodeURIComponent(WEDDING.date.calendarStart+'/'+WEDDING.date.calendarEnd)+'&ctz=Asia/Kolkata&location='+encodeURIComponent(INFO.venue)+'&details='+encodeURIComponent(WEDDING.date.calendarDetails+' Map: '+INFO.maps);
}
function setupObservers(){
  if(!('IntersectionObserver' in window)){$$('.rv').forEach(function(e){e.classList.add('in')});$$('.sec').forEach(function(e){e.classList.add('vis')});return}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.15,rootMargin:'0px 0px -6% 0px'});
  $$('.rv').forEach(function(e){io.observe(e)});
  var vo=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('vis',e.isIntersecting)})},{rootMargin:'80px'});
  $$('.sec').forEach(function(e){vo.observe(e)});
  var cdVis=false,cdIO=new IntersectionObserver(function(es){cdVis=es[0].isIntersecting;if(cdVis)tick()});cdIO.observe($('#cd'));
  setInterval(function(){if(cdVis&&!document.hidden)tick()},1000);
}

/* ---------- music ---------- */
var musicBtn=$('#music'),wantPlay=false,fadeT=0;
function fadeTo(v,ms){clearInterval(fadeT);var from=audio.volume,t0=Date.now();fadeT=setInterval(function(){var k=Math.min(1,(Date.now()-t0)/ms);try{audio.volume=from+(v-from)*k}catch(e){}if(k>=1){clearInterval(fadeT);if(v===0)audio.pause()}},60)}
function musicFailed(error){wantPlay=false;clearInterval(fadeT);musicBtn.classList.remove('playing');audio.pause();audio.volume=0;toast('Music could not be played');console.error('Wedding music playback failed:',error)}
function playMusic(){
  wantPlay=true;
  var p;
  try{p=audio.play()}catch(error){musicFailed(error);return}
  if(p&&p.then){
    p.then(function(){if(!wantPlay){audio.pause();return}musicBtn.classList.add('playing');fadeTo(.55,3200)},musicFailed);
  }else{musicBtn.classList.add('playing');fadeTo(.55,3200)}
}
function pauseMusic(){wantPlay=false;musicBtn.classList.remove('playing');fadeTo(0,500)}
musicBtn.addEventListener('click',function(){wantPlay?pauseMusic():playMusic()});
document.addEventListener('visibilitychange',function(){if(document.hidden){if(wantPlay)audio.pause()}else if(wantPlay){playMusic()}});

/* ---------- open the book ---------- */
var opened=false;
function openBook(){
  if(opened||!$('#stage').classList.contains('ready'))return;opened=true;
  var st=$('#stage');st.classList.add('opening');
  musicBtn.classList.add('on');playMusic();
  setTimeout(function(){FX.rain(30)},1000);
  setTimeout(function(){
    st.classList.add('gone');
    document.documentElement.classList.remove('locked');
    window.scrollTo(0,0);
    $('#hero').classList.add('go');
    stageOn=false;cancelAnimationFrame(stageRaf);
    setTimeout(function(){st.classList.add('removed')},1000);
  },2300);
}

/* ---------- boot ---------- */
function boot(){
  applyWeddingConfig();FX.init();buildStage();buildFlora();buildGarlands();buildFest();buildStory();setupScroll();setupActions();
  typeName($('#bname'),WEDDING.couple.bride);typeName($('#gname'),WEDDING.couple.groom);
  var cf1=Coverflow($('#cfF'),$('#dF')),cf2=Coverflow($('#cfP'),$('#dP'));
  setupObservers();tick();
  window.addEventListener('scroll',onScroll,{passive:true});
  requestStageParallax();
  Promise.all([withTimeout(loadImg(PHOTOS[0]),9000),withTimeout(loadFonts(),6000)]).then(function(r){
    var first=r[0];
    if(first){try{$('#bgph').src=softPhoto(first)}catch(e){$('#bgph').src=PHOTOS[0]}}
    else $('#bgph').src=PHOTOS[0];
    $('#stage').classList.add('ready');
  });
  var bk=$('#book');
  $('#stage').addEventListener('click',openBook);
  bk.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();openBook()}});
}
/* let the loader paint first, then do the one-time rendering work */
requestAnimationFrame(function(){setTimeout(boot,30)});
})();
