/* Termodinámica y mecánica estadística: vistas y laboratorios interactivos */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const K={a:'#2453c9',b:'#d9480f',r:'#2b8a3e',d:'#7048e8',w:'#c92a2a',f:'#e67700',ink:'#1c2230',mut:'#5d6577',ax:'#9aa1b0',gr:'#eeeae0',line:'#e3ddcf',soft:'#e6ecfb'};
const TAU=Math.PI*2;
const R=String.raw;

{const st=document.createElement('style');st.textContent=`
.ms-chk{display:inline-flex;align-items:center;gap:6px;font-size:.88rem;color:var(--muted);cursor:pointer}
.ms-chk input{accent-color:var(--fis);width:16px;height:16px}
.ms-sel{font:500 .9rem Inter,sans-serif;border:1px solid var(--line);border-radius:10px;padding:7px 10px;background:var(--kl-raise);color:var(--ink)}
.view[data-view^="tme-"] .canvas-box canvas{cursor:default}
.ms-unit{margin-top:36px}
.ms-unit + .topics{margin-top:14px}
.topic.soon{opacity:.62;box-shadow:none;cursor:default}
.topic.soon:hover{transform:none;border-color:var(--line);box-shadow:none}
.topic.soon .thumb{background:var(--kl-soft)}
.topic.soon .chip{display:inline-block;margin-top:10px}
.ms-map{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.ms-map .law{border-top:4px solid var(--fis)}
`;document.head.appendChild(st);}

/* ---------- formato ---------- */
function nf(x,d=2){if(!isFinite(x))return x>0?'∞':'−∞';const s=(Math.abs(x)<0.5*10**-d?0:x).toFixed(d);return s.replace('-','−').replace('.',',');}
function sci(x,d=3){ // d cifras significativas
  if(x===0)return '0';if(!isFinite(x))return '∞';
  const e=Math.floor(Math.log10(Math.abs(x)));
  if(e>=-3&&e<5)return nf(x,Math.max(0,d-1-e));
  const m=x/10**e;return nf(m,d-1)+'×10<sup>'+String(e).replace('-','−')+'</sup>';}
const row=(k,v)=>`<div><span class="k">${k}</span> = <b>${v}</b></div>`;
const rowT=t=>`<div class="k" style="margin-top:6px">${t}</div>`;
const sep='<div style="border-top:1px solid var(--line);margin:6px 0"></div>';

/* ---------- canvas ---------- */
function fit(cv,aspect,maxH,minH){
  const w=cv.parentElement.clientWidth||600;let h=Math.round(w*aspect);
  if(maxH)h=Math.min(h,maxH);if(minH)h=Math.max(h,minH);
  const dpr=window.devicePixelRatio||1;
  if(cv._w!==w||cv._h!==h||cv._d!==dpr){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);cv.style.height=h+'px';cv._w=w;cv._h=h;cv._d=dpr;}
  const ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  return {ctx,w,h};
}
const vis=el=>el&&el.offsetParent!==null&&el.parentElement.clientWidth>10;
function niceStep(span,n){const raw=span/n,p=10**Math.floor(Math.log10(raw)),m=raw/p;return (m<1.5?1:m<3.5?2:m<7.5?5:10)*p;}
function ticks(a,b,n=5){const s=niceStep(b-a,n),out=[];for(let v=Math.ceil(a/s-1e-9)*s;v<=b+1e-9;v+=s)out.push(Math.abs(v)<s*1e-9?0:v);return out;}
/* ejes: o={l,t,w,h,xr,yr,xl,yl,xt,yt,xf,yf,logy} */
function axes(ctx,o){
  const X=x=>o.l+(x-o.xr[0])/(o.xr[1]-o.xr[0])*o.w;
  const Y=o.logy?(y=>o.t+o.h-(Math.log10(y)-o.yr[0])/(o.yr[1]-o.yr[0])*o.h):(y=>o.t+o.h-(y-o.yr[0])/(o.yr[1]-o.yr[0])*o.h);
  ctx.save();ctx.font='11px Inter, sans-serif';ctx.lineWidth=1;
  const xt=o.xt||ticks(o.xr[0],o.xr[1],Math.max(3,Math.round(o.w/80)));
  const yt=o.yt||(o.logy?null:ticks(o.yr[0],o.yr[1],Math.max(3,Math.round(o.h/50))));
  const dg=t=>t&&t.length>1?Math.max(0,-Math.floor(Math.log10(Math.abs(t[1]-t[0]))+1e-9)):1;
  const xf=o.xf||(v=>nf(v,dg(xt)));const yf=o.yf||(v=>nf(v,dg(yt)));
  ctx.strokeStyle=K.gr;ctx.fillStyle=K.mut;ctx.textAlign='center';ctx.textBaseline='top';
  xt.forEach(v=>{const x=X(v);ctx.beginPath();ctx.moveTo(x,o.t);ctx.lineTo(x,o.t+o.h);ctx.stroke();ctx.fillText(xf(v),x,o.t+o.h+4);});
  ctx.textAlign='right';ctx.textBaseline='middle';
  if(o.logy){for(let e=Math.ceil(o.yr[0]);e<=o.yr[1];e++){const y=Y(10**e);ctx.beginPath();ctx.moveTo(o.l,y);ctx.lineTo(o.l+o.w,y);ctx.stroke();ctx.fillText('10'+String(e).replace('-','−').split('').map(c=>'⁰¹²³⁴⁵⁶⁷⁸⁹'['0123456789'.indexOf(c)]||'⁻').join(''),o.l-5,y);}}
  else yt.forEach(v=>{const y=Y(v);ctx.beginPath();ctx.moveTo(o.l,y);ctx.lineTo(o.l+o.w,y);ctx.stroke();ctx.fillText(yf(v),o.l-5,y);});
  ctx.strokeStyle=K.ax;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(o.l,o.t);ctx.lineTo(o.l,o.t+o.h);ctx.lineTo(o.l+o.w,o.t+o.h);ctx.stroke();
  ctx.font='600 12px Inter, sans-serif';ctx.fillStyle=K.ink;
  if(o.xl){ctx.textAlign='right';ctx.textBaseline='bottom';ctx.fillText(o.xl,o.l+o.w,o.t+o.h-4);}
  if(o.yl){ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText(o.yl,o.l+6,o.t+2);}
  ctx.restore();
  return {X,Y,o};
}
function clipBox(ctx,o){ctx.save();ctx.beginPath();ctx.rect(o.l,o.t,o.w,o.h);ctx.clip();}
function curve(ctx,A,f,x0,x1,col,lw=2.5,dash=null,n=400){
  ctx.save();clipBox(ctx,A.o);ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.lineJoin='round';if(dash)ctx.setLineDash(dash);
  ctx.beginPath();let pen=false;
  for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,y=f(x);
    if(!isFinite(y)||(A.o.logy&&y<=0)){pen=false;continue;}
    let py=A.Y(y);py=Math.max(-5e3,Math.min(5e3,py));
    if(pen)ctx.lineTo(A.X(x),py);else{ctx.moveTo(A.X(x),py);pen=true;}}
  ctx.stroke();ctx.restore();ctx.restore();
}
function dot(ctx,x,y,r,col,stroke){ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=col;ctx.fill();if(stroke){ctx.lineWidth=2;ctx.strokeStyle=stroke;ctx.stroke();}}
function label(ctx,t,x,y,col=K.ink,align='left',base='middle',font='600 12px Inter, sans-serif'){
  ctx.save();ctx.font=font;ctx.textAlign=align;ctx.textBaseline=base;ctx.lineWidth=4;ctx.strokeStyle='rgba(255,255,255,.92)';ctx.lineJoin='round';ctx.strokeText(t,x,y);ctx.fillStyle=col;ctx.fillText(t,x,y);ctx.restore();}
function arrow(ctx,x1,y1,x2,y2,col,lw=2.5,dash){
  const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy);if(L<1)return;const ux=dx/L,uy=dy/L,hd=Math.min(11,L*.45);
  ctx.save();ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=lw;ctx.lineCap='round';if(dash)ctx.setLineDash(dash);
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2-ux*hd*.8,y2-uy*hd*.8);ctx.stroke();ctx.setLineDash([]);
  ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-ux*hd-uy*hd*.5,y2-uy*hd+ux*hd*.5);ctx.lineTo(x2-ux*hd+uy*hd*.5,y2-uy*hd-ux*hd*.5);ctx.closePath();ctx.fill();ctx.restore();}

/* ---------- controles ---------- */
function sl(sec,id,fmt,cb){const el=sec.querySelector('#'+id),b=el.parentElement.querySelector('b');
  const up=()=>{if(b)b.textContent=fmt?fmt(+el.value):el.value;};el.addEventListener('input',()=>{up();cb&&cb();});up();
  const g=()=>+el.value;g.set=v=>{el.value=v;up();};return g;}
function segm(sec,id,attr,cb){const c=sec.querySelector('#'+id);let v=c.querySelector('button.on').dataset[attr];
  c.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;c.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));v=b.dataset[attr];cb&&cb(v);});
  return ()=>v;}
function drag(cv,pick,move,end){
  let on=null;const pos=e=>{const r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];};
  cv.addEventListener('pointerdown',e=>{const p=pos(e);on=pick(p[0],p[1]);if(on!=null){cv.setPointerCapture(e.pointerId);move(on,p[0],p[1]);e.preventDefault();}});
  cv.addEventListener('pointermove',e=>{const p=pos(e);if(on==null){cv.style.cursor=pick(p[0],p[1])!=null?'grab':'default';return;}move(on,p[0],p[1]);});
  const up=()=>{if(on!=null&&end)end(on);on=null;};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
/* polígono relleno en coordenadas de ejes */
function fillPath(ctx,A,pts,fill,stroke,lw=2){ctx.save();clipBox(ctx,A.o);ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(A.X(p[0]),A.Y(p[1])):ctx.moveTo(A.X(p[0]),A.Y(p[1])));ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}ctx.restore();ctx.restore();}
function polyl(ctx,A,pts,col,lw=2.5,dash){ctx.save();clipBox(ctx,A.o);ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.lineJoin='round';if(dash)ctx.setLineDash(dash);ctx.beginPath();
  pts.forEach((p,i)=>i?ctx.lineTo(A.X(p[0]),A.Y(p[1])):ctx.moveTo(A.X(p[0]),A.Y(p[1])));ctx.stroke();ctx.restore();ctx.restore();}
/* generador gaussiano y aleatorio con semilla */
function rng(seed){let s=seed>>>0||1;return ()=>{s^=s<<13;s>>>=0;s^=s>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
function gauss(r){let u=0,v=0;while(!u)u=r();while(!v)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(TAU*v);}
/* bisección */
function bisect(f,a,b,n=80){let fa=f(a);for(let i=0;i<n;i++){const m=(a+b)/2,fm=f(m);if((fm>0)===(fa>0)){a=m;fa=fm;}else b=m;}return (a+b)/2;}
/* ζ(s) y polilogaritmo Li_s(e^{-a}) para s = 3/2, 5/2 (bosones) */
const ZT={'-2.5':0.0085169287,'-1.5':-0.0254852019,'-0.5':-0.2078862250,'0.5':-1.4603545088,'1.5':2.6123753487,'2.5':1.3414872573,'3.5':1.1267338673};
function zeta(s){return ZT[String(s)];}
function LiE(s,a){/* Li_s(z) con z = e^{-a}, a >= 0 */
  if(a<=0)return zeta(s);
  if(a<0.6){const gam={0.5:Math.sqrt(Math.PI),1.5:-2*Math.sqrt(Math.PI),2.5:4*Math.sqrt(Math.PI)/3}[s];let t=gam*Math.pow(a,s-1),f=1;
    for(let k=0;k<4;k++){if(k)f*=k;t+=zeta(s-k)*Math.pow(-a,k)/f;}return t;}
  let t=0;for(let k=1;k<200;k++){const term=Math.exp(-a*k)/Math.pow(k,s);t+=term;if(term<1e-14)break;}return t;}
/* integración de Simpson */
function simpson(f,a,b,n=400){n+=n%2;const h=(b-a)/n;let s=f(a)+f(b);for(let i=1;i<n;i++)s+=(i%2?4:2)*f(a+i*h);return s*h/3;}

/* ---------- plantillas HTML ---------- */
const S=(id,lab,min,max,step,val)=>`<label class="slider">${lab} <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"><b></b></label>`;
const G=(id,attr,opts,on=0)=>`<div class="seg" id="${id}">${opts.map(([v,t],i)=>`<button data-${attr}="${v}"${i===on?' class="on"':''}>${t}</button>`).join('')}</div>`;
const B=(id,t,ghost=true)=>`<button class="btn${ghost?' ghost':''}" id="${id}">${t}</button>`;
const CHK=(id,t,on)=>`<label class="ms-chk"><input type="checkbox" id="${id}"${on?' checked':''}>${t}</label>`;
const PANE=(cv,ctrls,rd,hint)=>`<div class="two"><div><div class="canvas-box"><canvas id="${cv}"></canvas></div>${ctrls.map(c=>`<div class="controls">${c}</div>`).join('')}</div><div><div class="readout" id="${rd}"></div><p class="hint" style="margin-top:12px">${hint}</p></div></div>`;
const TABS=list=>`<div class="tabs">${list.map(([k,t],i)=>`<button data-t="${k}"${i?'':' class="on"'}>${t}</button>`).join('')}</div>`+list.map(([k,,h],i)=>`<div class="tabpane${i?'':' on'}" data-pane="${k}">${h}</div>`).join('');
/* ln Γ(x) (Lanczos) y ln C(n,k) */
function lgam(x){const g=7,c=[0.99999999999980993,676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];
  if(x<0.5)return Math.log(Math.PI/Math.abs(Math.sin(Math.PI*x)))-lgam(1-x);x-=1;let a=c[0];const t=x+g+0.5;for(let i=1;i<9;i++)a+=c[i]/(x+i);return 0.5*Math.log(TAU)+(x+0.5)*Math.log(t)-t+Math.log(a);}
const lC=(n,k)=>lgam(n+1)-lgam(k+1)-lgam(n-k+1);

/* ================= VISTAS ================= */
const V=[];
const UNITS=['Unidad I · Fundamentos de la termodinámica','Unidad II · Segunda y tercera ley','Unidad III · Formalismo y potenciales',
  'Unidad IV · Boltzmann y las bases de la mecánica estadística','Unidad V · Conjuntos estadísticos y las leyes','Unidad VI · Mecánica estadística cuántica'];
const ax2=`<g stroke="#9aa1b0" stroke-width="2"><line x1="30" y1="130" x2="280" y2="130"/><line x1="30" y1="130" x2="30" y2="12"/></g>`;
const tx=(x,y,t,s=17,c='#1c2230')=>`<text x="${x}" y="${y}" font-family="Inter" font-size="${s}" font-weight="700" fill="${c}">${t}</text>`;
const sv=b=>`<svg viewBox="0 0 300 150" aria-hidden="true">${b}</svg>`;
const TOP=[
['tme-estado','Estado, temperatura y ley cero','Equilibrio térmico, variables de estado, gas ideal y gas de van der Waals.',0,
 sv(ax2+`<path d="M45,20 C70,95 120,118 270,124" fill="none" stroke="#2453c9" stroke-width="3"/><path d="M60,15 C90,80 150,108 270,116" fill="none" stroke="#d9480f" stroke-width="3"/><path d="M80,12 C115,66 180,98 270,106" fill="none" stroke="#c92a2a" stroke-width="3"/>`+tx(150,40,'pV = nRT'))],
['tme-trabajo-calor','Trabajo y calor','Trabajo cuasiestático, diferenciales inexactas, capacidades caloríficas y calor latente.',0,
 sv(ax2+`<path d="M70,40 L70,40 L220,40 L220,110 Z" fill="#e6ecfb"/><polyline points="70,40 220,40 220,110" fill="none" stroke="#2453c9" stroke-width="3"/><polyline points="70,40 70,110 220,110" fill="none" stroke="#d9480f" stroke-width="3"/><circle cx="70" cy="40" r="6" fill="#1c2230"/><circle cx="220" cy="110" r="6" fill="#1c2230"/>`+tx(160,30,'∮δQ ≠ 0',16))],
['tme-primera-ley','Primera ley de la termodinámica','Energía interna, procesos isotérmico, isobárico, isocórico y adiabático.',0,
 sv(`<rect x="40" y="30" width="110" height="90" rx="6" fill="#fff4e6" stroke="#1c2230" stroke-width="2.5"/><rect x="150" y="26" width="12" height="98" fill="#9aa1b0"/><line x1="162" y1="75" x2="215" y2="75" stroke="#1c2230" stroke-width="4"/><g fill="#d9480f"><circle cx="70" cy="60" r="4"/><circle cx="100" cy="90" r="4"/><circle cx="125" cy="55" r="4"/><circle cx="85" cy="100" r="4"/></g>`+tx(180,130,'dU = δQ − δW',15))],
['tme-carnot','Máquinas térmicas y ciclo de Carnot','Kelvin-Planck y Clausius, eficiencia de Carnot, ciclos Otto y refrigeradores.',1,
 sv(ax2+`<path d="M70,30 C110,40 140,52 170,58 C200,80 230,98 250,104 C210,100 170,96 140,92 C110,70 85,46 70,30 Z" fill="#e6ecfb" stroke="#2453c9" stroke-width="3"/>`+tx(150,32,'η = 1 − T꜀/Tₕ',15))],
['tme-entropia','Entropía de Clausius','Desigualdad de Clausius, entropía como función de estado y producción de entropía.',1,
 sv(`<rect x="40" y="45" width="90" height="70" rx="8" fill="#ffe3e3" stroke="#c92a2a" stroke-width="2.5"/><rect x="170" y="45" width="90" height="70" rx="8" fill="#e6ecfb" stroke="#2453c9" stroke-width="2.5"/><line x1="132" y1="80" x2="160" y2="80" stroke="#e67700" stroke-width="4"/><polygon points="168,80 156,74 156,86" fill="#e67700"/>`+tx(95,30,'ΔS_univ ≥ 0',16))],
['tme-tercera-ley','Tercera ley','Teorema de Nernst, capacidades caloríficas a baja temperatura e inaccesibilidad del cero absoluto.',1,
 sv(ax2+`<path d="M30,130 C80,128 120,80 270,40" fill="none" stroke="#2453c9" stroke-width="3"/><path d="M30,130 C90,129 140,110 270,80" fill="none" stroke="#d9480f" stroke-width="3"/><polyline points="230,50 230,88 170,88 170,103 130,103 130,113 105,113" fill="none" stroke="#1c2230" stroke-width="2" stroke-dasharray="4 3"/>`+tx(40,30,'S → 0',17))],
['tme-potenciales','Ecuación fundamental y potenciales','U, H, F y G como transformadas de Legendre y sus variables naturales.',2,
 sv(ax2+`<path d="M40,120 C100,110 180,80 270,20" fill="none" stroke="#2453c9" stroke-width="3"/><line x1="60" y1="140" x2="270" y2="38" stroke="#d9480f" stroke-width="2.5"/><circle cx="185" cy="78" r="6" fill="#1c2230"/>`+tx(50,32,'F = U − TS',17))],
['tme-maxwell','Relaciones de Maxwell','Cuadrado termodinámico, derivadas parciales, Cp − Cv y efecto Joule-Thomson.',2,
 sv(`<rect x="95" y="25" width="100" height="100" fill="#e6ecfb" stroke="#2453c9" stroke-width="3"/><line x1="95" y1="125" x2="195" y2="25" stroke="#d9480f" stroke-width="2.5"/><line x1="95" y1="25" x2="195" y2="125" stroke="#d9480f" stroke-width="2.5"/>`+tx(80,22,'V',16)+tx(140,20,'F',16)+tx(200,22,'T',16)+tx(200,82,'G',16)+tx(200,140,'P',16)+tx(140,144,'H',16)+tx(78,140,'S',16)+tx(78,82,'U',16))],
['tme-fases','Equilibrio de fases','Potencial químico, Gibbs-Duhem, Clausius-Clapeyron y la construcción de Maxwell.',2,
 sv(ax2+`<path d="M50,20 C70,110 90,70 120,80 C150,90 170,60 200,85 C230,100 250,110 275,114" fill="none" stroke="#2453c9" stroke-width="3"/><line x1="72" y1="81" x2="232" y2="81" stroke="#d9480f" stroke-width="2.5" stroke-dasharray="6 4"/>`+tx(150,35,'áreas iguales',15))],
['tme-boltzmann','Entropía de Boltzmann','S = k ln Ω, sólidos de Einstein en contacto y la definición estadística de la temperatura.',2,
 sv(`<g fill="#e6ecfb" stroke="#2453c9" stroke-width="2"><rect x="30" y="50" width="100" height="60" rx="6"/><rect x="170" y="50" width="100" height="60" rx="6"/></g><g fill="#d9480f"><circle cx="55" cy="70" r="5"/><circle cx="80" cy="90" r="5"/><circle cx="105" cy="68" r="5"/><circle cx="200" cy="80" r="5"/><circle cx="240" cy="95" r="5"/></g><path d="M118,40 Q150,20 182,40" fill="none" stroke="#e67700" stroke-width="2.5"/>`+tx(100,140,'S = k ln Ω',18))],
['tme-cinetica','Teoría cinética y distribución de Maxwell','Presión molecular, equipartición y la distribución de velocidades de un gas.',3,
 sv(ax2+`<g fill="#e6ecfb" stroke="#9aa1b0">${[[45,110],[70,70],[95,40],[120,30],[145,40],[170,60],[195,85],[220,105],[245,118]].map(([x,y])=>`<rect x="${x}" y="${y}" width="25" height="${130-y}"/>`).join('')}</g><path d="M40,130 C80,40 110,25 140,32 C190,45 220,110 275,126" fill="none" stroke="#d9480f" stroke-width="3"/>`+tx(190,30,'f(v)',17))],
['tme-teorema-h','Ecuación de Boltzmann y teorema H','Caos molecular, la flecha del tiempo y las paradojas de Loschmidt y Zermelo.',3,
 sv(ax2+`<path d="M30,25 C60,90 100,112 270,118" fill="none" stroke="#2453c9" stroke-width="3"/>`+tx(140,50,'dH/dt ≤ 0',18))],
['tme-espacio-fases','Espacio de fases y teorema de Liouville','Microestados, macroestados, hipótesis ergódica e igual probabilidad a priori.',3,
 sv(`<g stroke="#9aa1b0" stroke-width="1.5"><line x1="20" y1="75" x2="280" y2="75"/><line x1="150" y1="10" x2="150" y2="140"/></g><ellipse cx="150" cy="75" rx="110" ry="55" fill="none" stroke="#e3ddcf" stroke-width="2"/><path d="M200,40 q20,-6 30,10 q-6,14 -24,10 q-14,-8 -6,-20z" fill="#e6ecfb" stroke="#2453c9" stroke-width="2.5"/><path d="M90,110 q20,4 40,-4 q2,10 -20,14 q-22,2 -20,-10z" fill="#ffe8d9" stroke="#d9480f" stroke-width="2.5"/>`+tx(20,30,'dρ/dt = 0',16))],
['tme-microcanonico','Conjunto microcanónico','Gas ideal, ecuación de Sackur-Tetrode y la paradoja de Gibbs.',4,
 sv(`<rect x="30" y="30" width="240" height="90" rx="6" fill="#fff" stroke="#1c2230" stroke-width="2.5"/><line x1="150" y1="30" x2="150" y2="120" stroke="#1c2230" stroke-width="3" stroke-dasharray="6 5"/><g fill="#2453c9"><circle cx="60" cy="55" r="5"/><circle cx="95" cy="95" r="5"/><circle cx="120" cy="60" r="5"/></g><g fill="#d9480f"><circle cx="185" cy="80" r="5"/><circle cx="220" cy="50" r="5"/><circle cx="245" cy="100" r="5"/></g>`+tx(115,145,'1/N!',16))],
['tme-canonico','Conjunto canónico','Función de partición, energía libre, fluctuaciones y el sistema de dos niveles.',4,
 sv(`<g stroke="#1c2230" stroke-width="3"><line x1="40" y1="110" x2="130" y2="110"/><line x1="40" y1="45" x2="130" y2="45"/></g><g fill="#2453c9">${[50,65,80,95,110,58,88].map((x,i)=>`<circle cx="${x+5}" cy="${i<5?100:35}" r="5"/>`).join('')}</g>`+tx(150,85,'Z = Σ e^(−βE)',17))],
['tme-leyes-estadistica','Las leyes desde la estadística','Calor y trabajo como cambios de ocupación y de niveles, entropía de Gibbs y tercera ley.',4,
 sv(`<g stroke="#1c2230" stroke-width="2.5"><line x1="40" y1="120" x2="120" y2="120"/><line x1="40" y1="90" x2="120" y2="90"/><line x1="40" y1="50" x2="120" y2="50"/></g><g fill="#d9480f"><rect x="50" y="110" width="50" height="8"/><rect x="50" y="83" width="30" height="5"/><rect x="50" y="45" width="12" height="3"/></g>`+tx(140,60,'δQ = Σ E dpᵢ',15)+tx(140,100,'δW = −Σ pᵢ dE',15))],
['tme-solidos','Calor específico de sólidos','Dulong-Petit, modelos de Einstein y de Debye y la ley T³.',4,
 sv(ax2+`<line x1="30" y1="40" x2="280" y2="40" stroke="#9aa1b0" stroke-dasharray="6 5" stroke-width="2"/><path d="M30,130 C60,129 80,110 110,70 C140,46 190,42 280,41" fill="none" stroke="#2453c9" stroke-width="3"/>`+tx(160,30,'3Nk',16)+tx(60,100,'T³',16,'#d9480f'))],
['tme-gran-canonico','Conjunto gran canónico','Potencial químico, gran función de partición, fluctuaciones de N y adsorción de Langmuir.',4,
 sv(`<g>${Array.from({length:24},(_,i)=>`<rect x="${40+(i%8)*28}" y="${40+Math.floor(i/8)*28}" width="22" height="22" rx="4" fill="${[1,3,4,8,9,12,15,18,20,22].includes(i)?'#2453c9':'#e6ecfb'}"/>`).join('')}</g>`+tx(90,140,'Ξ = Σ e^(βμN) Z_N',15))],
['tme-distribuciones','Partículas idénticas y las tres distribuciones','Simetrización, números de ocupación y las distribuciones de Maxwell-Boltzmann, Bose-Einstein y Fermi-Dirac.',5,
 sv(ax2+`<path d="M30,40 C120,40 140,128 270,129" fill="none" stroke="#2453c9" stroke-width="3"/><path d="M60,12 C90,90 150,124 270,128" fill="none" stroke="#d9480f" stroke-width="3"/><path d="M30,62 C100,90 160,122 270,128" fill="none" stroke="#2b8a3e" stroke-width="3" stroke-dasharray="6 4"/>`+tx(150,40,'1/(e^x ± 1)',16))],
['tme-fermi','Gas de Fermi','Energía de Fermi, expansión de Sommerfeld, electrones en metales y enanas blancas.',5,
 sv(ax2+`<path d="M30,40 L130,40 C150,40 160,130 180,130 L280,130" fill="none" stroke="#2453c9" stroke-width="3"/><line x1="155" y1="20" x2="155" y2="130" stroke="#d9480f" stroke-dasharray="5 4" stroke-width="2"/>`+tx(165,40,'ε_F',17))],
['tme-bose','Gas de Bose y condensación de Bose-Einstein','Temperatura crítica, fracción condensada y el calor específico en λ.',5,
 sv(ax2+`<path d="M30,30 C120,60 170,110 200,130" fill="none" stroke="#2453c9" stroke-width="3"/><line x1="200" y1="20" x2="200" y2="130" stroke="#d9480f" stroke-dasharray="5 4" stroke-width="2"/>`+tx(210,40,'T_c',17)+tx(60,100,'N₀/N',15,'#2453c9'))],
['tme-fotones','Gas de fotones y fonones','La ley de Planck como gas de Bose con μ = 0, Stefan-Boltzmann y presión de radiación.',5,
 sv(ax2+`<path d="M30,130 C60,128 75,30 110,30 C150,30 180,110 280,124" fill="none" stroke="#d9480f" stroke-width="3"/><path d="M30,130 C70,125 100,90 140,10" fill="none" stroke="#9aa1b0" stroke-width="2" stroke-dasharray="5 4"/>`+tx(160,40,'u ∝ T⁴',17))]
];
const ORD=TOP.map(t=>t[0]),TT={};TOP.forEach(t=>TT[t[0]]=t[1]);
const card=t=>`<a class="topic" href="#${t[0]}"><div class="thumb">${t[4]}</div><div class="body"><h3>${t[1]}</h3><p>${t[2]}</p><span class="go">Abrir tema →</span></div></a>`;

V.push(R`
<section class="view" data-view="termo-estadistica">
  <div class="eyebrow">Física · Nivel Callen / Reif / Pathria (introductorio)</div>
  <h1>Termodinámica y mecánica estadística</h1>
  <p class="lead">La termodinámica describe sistemas macroscópicos con pocas variables (\(U, V, N, T, P, S\)) y leyes generales que no dependen de los detalles microscópicos. La mecánica estadística explica de dónde salen esas leyes: la entropía cuenta microestados, \(S = k_B\ln\Omega\), y todas las propiedades de equilibrio se obtienen de una función de partición. El curso termina en la estadística cuántica, donde la indistinguibilidad de las partículas da las distribuciones de Bose-Einstein y Fermi-Dirac.</p>`
+UNITS.map((u,k)=>`<h2 class="ms-unit">${u}</h2><div class="topics">${TOP.filter(t=>t[3]===k).map(card).join('')}</div>`).join('')
+`<h2 class="ms-unit">Cierre</h2><div class="topics"><div class="topic soon" aria-disabled="true"><div class="thumb"><svg viewBox="0 0 300 150" aria-hidden="true"><text x="150" y="86" text-anchor="middle" font-family="Inter" font-size="30" font-weight="700" fill="#888780">✎</text></svg></div><div class="body"><h3>Ejercicios resueltos</h3><p>Problemas guiados de termodinámica y mecánica estadística.</p><span class="chip">próximamente</span></div></div></div>`
+R`
  <div class="block">
    <h2><span class="ico">↝</span>El puente entre las dos teorías</h2>
    <div class="ms-map">
      <div class="law"><h3>1 · Contar estados</h3><div class="eq">\[ S = k_B\ln\Omega(U,V,N) \]</div><p>De la entropía microcanónica salen \(1/T = \partial S/\partial U\), \(P/T = \partial S/\partial V\) y \(\mu/T = -\partial S/\partial N\).</p></div>
      <div class="law"><h3>2 · Pesar estados</h3><div class="eq">\[ F = -k_BT\ln Z,\quad Z=\sum_i e^{-\beta E_i} \]</div><p>Con \(F(T,V,N)\) se obtiene toda la termodinámica; las relaciones de Maxwell son igualdades de derivadas cruzadas de \(\ln Z\).</p></div>
      <div class="law"><h3>3 · Partículas idénticas</h3><div class="eq">\[ \langle n_\varepsilon\rangle=\frac{1}{e^{\beta(\varepsilon-\mu)}\pm1} \]</div><p>El signo \(+\) (fermiones) y \(-\) (bosones) aparece al contar estados de partículas indistinguibles; sin el \(\pm1\) se recupera Maxwell-Boltzmann.</p></div>
    </div>
  </div>
  <div class="block">
    <h2><span class="ico">☰</span>Temario y prerrequisitos</h2>
    <ul class="keypoints">
      <li><b>Unidades I–II · Las cuatro leyes.</b> Amplían el tema de termodinámica de Física 2. Necesitas derivadas parciales y diferenciales totales (Cálculo 3).</li>
      <li><b>Unidad III · Formalismo.</b> Transformadas de Legendre (las mismas de Lagrange y Hamilton en Mecánica clásica) y álgebra de derivadas parciales.</li>
      <li><b>Unidades IV–V · Mecánica estadística clásica.</b> Combinatoria, aproximación de Stirling, integrales gaussianas y la idea de espacio de fases de Mecánica clásica.</li>
      <li><b>Unidad VI · Estadística cuántica.</b> Necesitas niveles de energía cuantizados y spin de Física moderna. Completa el pendiente de ese curso sobre Bose-Einstein y Fermi-Dirac.</li>
    </ul>
  </div>
</section>`);

/* ---------- plantilla de un tema ---------- */
function topic(o){
  const i=ORD.indexOf(o.id),t=TOP[i],p=o.p,pv=ORD[i-1],nx=ORD[i+1];
  const law=([h,eq,tx])=>`<div class="law"><h3>${h}</h3><div class="eq">${[].concat(eq).map(e=>`\\[ ${e} \\]`).join('</div><div class="eq">')}</div>${tx?`<p>${tx}</p>`:''}</div>`;
  return `
<section class="view" data-view="${o.id}">
  <div class="eyebrow">Termodinámica y mecánica estadística · ${UNITS[t[3]]}</div>
  <h1>${t[1]}</h1>
  <p class="lead">${o.lead}</p>
  <div class="toc"><a href="#${p}-res" data-scroll>Resumen</a><a href="#${p}-lab" data-scroll>Visualiza</a><a href="#${p}-leyes" data-scroll>Leyes y fórmulas</a><a href="#${p}-ej" data-scroll>Ejemplo</a></div>
  <div class="block" id="${p}-res"><h2><span class="ico">≡</span>Resumen</h2><ul class="keypoints">${o.res.map(([b,x])=>`<li><b>${b}</b> ${x}</li>`).join('')}</ul></div>
  <div class="block" id="${p}-lab"><h2><span class="ico">◎</span>Visualiza</h2>${o.lab}</div>
  <div class="block" id="${p}-leyes"><h2><span class="ico">§</span>Leyes y fórmulas</h2><div class="laws">${o.laws.map(law).join('')}</div></div>
  <div class="block" id="${p}-ej"><h2><span class="ico">✎</span>Ejemplo resuelto</h2><div class="example"><p><b>${o.ej[0]}</b></p><ol>${o.ej[1].map(s=>`<li>${s}</li>`).join('')}</ol></div></div>
  <div class="pager">${pv?`<a href="#${pv}"><small>← Anterior</small>${TT[pv]}</a>`:`<a href="#termo-estadistica"><small>← Volver</small>Termodinámica y mecánica estadística</a>`}${nx?`<a class="next" href="#${nx}"><small>Siguiente →</small>${TT[nx]}</a>`:`<a class="next" href="#termo-estadistica"><small>Volver →</small>Termodinámica y mecánica estadística</a>`}</div>
  <p class="note">Contenido de referencia: ${o.ref}. Redacción y simulaciones propias.</p>
</section>`;}
const LABS={};

/* ================= UNIDAD I · FUNDAMENTOS ================= */
const RL=0.083145; /* L·bar/(mol·K) */
const GASES={co2:{n:'CO₂',a:3.640,b:0.04267},n2:{n:'N₂',a:1.370,b:0.0387},h2o:{n:'H₂O',a:5.536,b:0.03049}};

V.push(topic({id:'tme-estado',p:'ms01',
lead:R`La termodinámica estudia sistemas con un número enorme de partículas, del orden de \(N_A = 6{,}022\times10^{23}\), usando solo unas pocas variables macroscópicas. Para eso hace falta precisar qué es un estado de equilibrio y qué significa que dos cuerpos tengan la misma temperatura. Esa es la función de la ley cero.`,
res:[
[R`Sistema, entorno y paredes.`,R`Un sistema puede ser aislado (no intercambia energía ni materia), cerrado (intercambia energía) o abierto. Las paredes se clasifican en adiabáticas o diatérmicas, rígidas o móviles, y permeables o impermeables. Cada tipo de pared permite un tipo de equilibrio.`],
[R`Estado de equilibrio.`,R`Es el estado al que llega un sistema aislado cuando deja de cambiar. Queda descrito por pocas variables: <i>extensivas</i>, que escalan con el tamaño (\(U, V, N, S\)), e <i>intensivas</i>, que no lo hacen (\(T, P, \mu\)). El cociente de dos variables extensivas es intensivo, como \(v = V/N\).`],
[R`Ley cero.`,R`Si A está en equilibrio térmico con C, y B también lo está con C, entonces A y B están en equilibrio entre sí. El equilibrio térmico es una relación de equivalencia, y por eso existe una función de estado, la <i>temperatura empírica</i> \(\theta\), que toma el mismo valor en todos los sistemas de una misma clase.`],
[R`Escala Kelvin.`,R`El termómetro de gas a volumen constante define \(T = 273{,}16\ \text{K}\cdot\lim_{P\to0} P/P_{\text{tp}}\), donde \(P_\text{tp}\) es la presión en el punto triple del agua. Desde 2019 el kelvin se define fijando \(k_B = 1{,}380\,649\times10^{-23}\ \text{J/K}\) de forma exacta.`],
[R`Ecuación de estado.`,R`Es una relación \(f(P,V,T)=0\) propia de cada sustancia. Para el gas ideal, \(PV = nRT = Nk_BT\), con \(R = N_Ak_B = 8{,}314\ \text{J/(mol·K)}\). No se deduce de la termodinámica: se mide o se obtiene con la mecánica estadística.`],
[R`Gas de van der Waals.`,R`Corrige el gas ideal con dos parámetros: \(b\), el volumen propio de las moléculas, y \(a\), su atracción mutua. \(\left(P + \dfrac{an^2}{V^2}\right)(V - nb) = nRT\). Por debajo de la temperatura crítica \(T_c = \dfrac{8a}{27Rb}\) las isotermas tienen un lazo que anuncia la transición líquido-gas.`],
[R`Coeficientes de respuesta.`,R`Dilatación \(\alpha = \frac{1}{V}\left(\frac{\partial V}{\partial T}\right)_P\) y compresibilidad isotérmica \(\kappa_T = -\frac{1}{V}\left(\frac{\partial V}{\partial P}\right)_T\). Para el gas ideal, \(\alpha = 1/T\) y \(\kappa_T = 1/P\).`]],
lab:PANE('ms01-cv',[G('ms01-g','g',[['ideal','Gas ideal'],['co2','van der Waals: CO₂'],['h2o','van der Waals: H₂O']],1),S('ms01-t','T (K)',200,700,1,280)],'ms01-read',
 R`Isotermas de 1 mol en el plano \(P\)–\(V\). La isoterma seleccionada está resaltada y las grises son otras temperaturas de referencia. Arrastra el punto para recorrer la isoterma. El factor de compresibilidad \(Z = PV/nRT\) mide cuánto se aparta el gas del comportamiento ideal (\(Z = 1\)). Por debajo de \(T_c\) aparece el lazo de van der Waals, que se resuelve en el tema de equilibrio de fases.`),
laws:[
['Ley cero',R`A\sim C,\; B\sim C \;\Rightarrow\; A\sim B`,'Garantiza que la temperatura es una función de estado bien definida.'],
['Gas ideal',R`PV = nRT = Nk_BT`,R`\(R = 8{,}314\) J/(mol·K), \(k_B = 1{,}381\times10^{-23}\) J/K.`],
['Van der Waals',R`P = \frac{nRT}{V-nb} - \frac{an^2}{V^2}`,R`Punto crítico: \(V_c = 3nb\), \(P_c = \dfrac{a}{27b^2}\), \(T_c = \dfrac{8a}{27Rb}\), \(Z_c = \tfrac38\).`],
['Factor de compresibilidad',R`Z = \frac{PV}{nRT}`,R`Desarrollo del virial: \(Z = 1 + B_2(T)\dfrac{n}{V} + \dots\). Para van der Waals, \(B_2 = b - \dfrac{a}{RT}\).`],
['Coeficientes',R`\alpha = \frac{1}{V}\Big(\frac{\partial V}{\partial T}\Big)_P,\quad \kappa_T = -\frac{1}{V}\Big(\frac{\partial V}{\partial P}\Big)_T`,R`Relación cíclica: \(\left(\frac{\partial P}{\partial T}\right)_V = \dfrac{\alpha}{\kappa_T}\).`]],
ej:[R`Un recipiente de 0,5 L contiene 1 mol de CO₂ a 300 K. Calcula la presión con el modelo ideal y con van der Waals (\(a = 3{,}64\ \text{L}^2\text{bar/mol}^2\), \(b = 0{,}0427\ \text{L/mol}\)). ¿Cuánto vale \(Z\)?`,[
R`Gas ideal: \(P = nRT/V = (0{,}08314)(300)/0{,}5 = 49{,}9\) bar.`,
R`Van der Waals: \(P = \dfrac{RT}{V-b} - \dfrac{a}{V^2} = \dfrac{24{,}94}{0{,}4573} - \dfrac{3{,}64}{0{,}25} = 54{,}5 - 14{,}6 = 40{,}0\) bar.`,
R`\(Z = PV/RT = (40{,}0)(0{,}5)/24{,}94 = 0{,}80\). La atracción \(a\) domina sobre el volumen excluido \(b\): el gas es más compresible que el ideal.`,
R`Como \(T_c(\text{CO}_2) = 8a/27Rb \approx 304\) K, a 300 K estamos justo debajo del punto crítico. Por eso la desviación es tan grande.`]],
ref:'Callen, cap. 1–3; Zemansky & Dittman, cap. 1–2; Reif, cap. 1'}));

LABS['tme-estado']=function(sec){
  const cv=$('#ms01-cv',sec),rd=$('#ms01-read',sec);let gas='co2',Vp=0.5,A=null;
  const gt=sl(sec,'ms01-t',v=>v+' K',()=>draw());segm(sec,'ms01-g','g',v=>{gas=v;draw();});
  const Pof=(V,T)=>{if(gas==='ideal')return RL*T/V;const g=GASES[gas];return RL*T/(V-g.b)-g.a/(V*V);};
  drag(cv,(x,y)=>{if(!A)return null;const p=[A.X(Vp),A.Y(Pof(Vp,gt()))];return Math.hypot(p[0]-x,p[1]-y)<22?1:null;},
    (k,x)=>{Vp=clamp((x-A.o.l)/A.o.w*(A.o.xr[1]-A.o.xr[0])+A.o.xr[0],0.07,1.2);draw();});
  function draw(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.78,470,300),T=gt();
    A=axes(ctx,{l:52,t:16,w:w-68,h:h-50,xr:[0,1.2],yr:[0,200],xl:'V (L)',yl:'P (bar)'});
    const g=GASES[gas];
    [200,250,300,350,400,500,600,700].forEach(Tr=>curve(ctx,A,V=>Pof(V,Tr),gas==='ideal'?0.02:g.b+0.005,1.2,'#d8d4c8',1.4));
    if(gas!=='ideal'){const Tc=8*g.a/(27*RL*g.b),Pc=g.a/(27*g.b*g.b),Vc=3*g.b;
      curve(ctx,A,V=>Pof(V,Tc),g.b+0.005,1.2,K.d,1.8,[6,5]);
      if(Pc<200){dot(ctx,A.X(Vc),A.Y(Pc),5,K.d);label(ctx,'punto crítico',A.X(Vc)+8,A.Y(Pc)-10,K.d);}}
    curve(ctx,A,V=>RL*T/V,0.02,1.2,K.ax,1.6,[3,4]);
    curve(ctx,A,V=>Pof(V,T),gas==='ideal'?0.02:g.b+0.003,1.2,K.b,3);
    const P=Pof(Vp,T);dot(ctx,A.X(Vp),A.Y(clamp(P,-5,205)),7,'#fff',K.b);
    const Z=P*Vp/(RL*T),Pid=RL*T/Vp;
    let extra='';
    if(gas!=='ideal'){const Tc=8*g.a/(27*RL*g.b);
      const dP=(Pof(Vp+1e-4,T)-Pof(Vp-1e-4,T))/2e-4;
      extra=sep+row('T<sub>c</sub>',nf(Tc,0)+' K')+row('T/T<sub>c</sub>',nf(T/Tc,3))+row('B₂ = b − a/RT',nf(g.b-g.a/(RL*T),4)+' L/mol')+
        rowT(dP>0?'Aquí (∂P/∂V)<sub>T</sub> &gt; 0: κ<sub>T</sub> &lt; 0, el estado es mecánicamente inestable. El gas se separa en líquido y vapor.':T<Tc?'Debajo de T<sub>c</sub>: la isoterma tiene un lazo. El tramo horizontal real se obtiene con la construcción de Maxwell.':'Encima de T<sub>c</sub> no hay transición líquido-gas: la isoterma es monótona.');}
    rd.innerHTML=row('V',nf(Vp,3)+' L')+row('P (modelo)',nf(P,1)+' bar')+row('P ideal',nf(Pid,1)+' bar')+row('Z = PV/RT',nf(Z,3))+extra;
  }
  return {draw};
};

/* ---------- trabajo y calor ---------- */
V.push(topic({id:'tme-trabajo-calor',p:'ms02',
lead:R`La energía puede entrar a un sistema de dos maneras: como trabajo, mediante un cambio de una variable macroscópica como el volumen, o como calor, a través de una pared diatérmica por una diferencia de temperatura. Ninguna de las dos es una propiedad del estado: ambas dependen del camino.`,
res:[
[R`Trabajo cuasiestático.`,R`Si el proceso es lo bastante lento como para pasar por estados de equilibrio, el trabajo hecho <i>por</i> el gas es \(\delta W = P\,dV\). En general, \(\delta W = -\sum_i Y_i\,dX_i\), con pares conjugados como \((-P,V)\), \((F,L)\) en un alambre o \((B,M)\) en un imán.`],
[R`Depende del camino.`,R`\(W = \int_A^B P\,dV\) es el área bajo la curva en el diagrama \(P\)–\(V\). Dos caminos entre los mismos estados encierran áreas distintas, así que no existe una función \(W(P,V)\).`],
[R`Diferenciales inexactas.`,R`\(\delta W = P\,dV\) es una forma diferencial \(M\,dP + N\,dV\) con \(\partial M/\partial V \neq \partial N/\partial P\). Por eso se escribe \(\delta\) y no \(d\). Un factor integrante puede volverla exacta: para el calor, \(1/T\) convierte \(\delta Q_\text{rev}\) en \(dS\).`],
[R`Calor.`,R`Es energía transferida por diferencia de temperatura. Joule mostró que el mismo cambio de estado se logra con trabajo mecánico o con calor: \(1\ \text{cal} = 4{,}184\ \text{J}\). El calor no es una sustancia contenida en el cuerpo.`],
[R`Capacidades caloríficas.`,R`\(C_X = (\delta Q/dT)_X\) depende de qué se mantiene constante. \(C_V = (\partial U/\partial T)_V\) y \(C_P = (\partial H/\partial T)_P\), con \(H = U + PV\). Por mol: \(c_V\), \(c_P\).`],
[R`Calor latente.`,R`En un cambio de fase a \(T\) y \(P\) constantes, el calor absorbido no eleva la temperatura: \(Q = mL\). Para el agua, \(L_f = 334\ \text{kJ/kg}\) y \(L_v = 2257\ \text{kJ/kg}\). Es la diferencia de entalpía entre las fases.`]],
lab:PANE('ms02-cv',[G('ms02-c','c',[['1','A → C → B'],['2','A → D → B'],['3','Recta A → B']])],'ms02-read',
 R`1 mol de gas ideal monoatómico (\(U = \tfrac32 PV\)). Arrastra los estados A y B. El área sombreada es el trabajo del camino elegido. Los tres caminos tienen el mismo \(\Delta U\) porque \(U\) es función de estado, pero \(W\) y \(Q = \Delta U + W\) cambian. Unidades: kPa·L = J.`),
laws:[
['Trabajo de expansión',R`W = \int_{V_A}^{V_B} P\,dV`,'Positivo si el gas se expande (trabajo hecho por el sistema).'],
['Inexactitud',R`\oint \delta W \neq 0,\qquad \oint \delta Q \neq 0`,R`En cambio, \(\oint dU = 0\) para cualquier ciclo.`],
['Capacidades',R`C_V = \Big(\frac{\partial U}{\partial T}\Big)_V,\quad C_P = \Big(\frac{\partial H}{\partial T}\Big)_P`,R`Gas ideal: \(c_V = \tfrac{f}{2}R\), \(c_P = c_V + R\).`],
['Calor sensible y latente',[R`Q = mc\,\Delta T`,R`Q = mL`],'La primera vale si c no cambia con T; la segunda, en un cambio de fase.'],
['Prueba de exactitud',R`M\,dx+N\,dy \text{ exacta} \iff \frac{\partial M}{\partial y}=\frac{\partial N}{\partial x}`,R`Para \(P\,dV\) escrita en \((T,V)\): \(M = 0\), \(N = nRT/V\), y \(\partial N/\partial T \neq 0\).`]],
ej:[R`1 mol de gas ideal monoatómico va de A (100 kPa, 10 L) a B (200 kPa, 20 L) por dos caminos: (1) isobárico y luego isocórico; (2) isocórico y luego isobárico. Calcula \(W\), \(\Delta U\) y \(Q\) en cada caso.`,[
R`\(\Delta U = \tfrac32(P_BV_B - P_AV_A) = \tfrac32(4000 - 1000) = 4500\) J para ambos caminos.`,
R`Camino 1: se expande a 100 kPa de 10 a 20 L, \(W_1 = 100 \times 10 = 1000\) J; el tramo isocórico no hace trabajo.`,
R`Camino 2: primero sube la presión sin trabajo y luego se expande a 200 kPa, \(W_2 = 200\times10 = 2000\) J.`,
R`\(Q_1 = 4500 + 1000 = 5500\) J y \(Q_2 = 4500 + 2000 = 6500\) J. El estado final es el mismo, pero el calor absorbido no: \(Q\) no es función de estado.`]],
ref:'Zemansky & Dittman, cap. 3–4; Callen, cap. 1; Reif, cap. 2'}));

LABS['tme-trabajo-calor']=function(sec){
  const cv=$('#ms02-cv',sec),rd=$('#ms02-read',sec);let c='1',A=null;
  const E={A:[10,100],B:[20,200]};
  segm(sec,'ms02-c','c',v=>{c=v;draw();});
  drag(cv,(x,y)=>{if(!A)return null;for(const k of ['A','B']){if(Math.hypot(A.X(E[k][0])-x,A.Y(E[k][1])-y)<20)return k;}return null;},
    (k,x,y)=>{const V=(x-A.o.l)/A.o.w*30,P=(A.o.t+A.o.h-y)/A.o.h*300;E[k]=[clamp(Math.round(V*2)/2,2,29),clamp(Math.round(P/5)*5,10,290)];draw();});
  const paths=()=>{const [Va,Pa]=E.A,[Vb,Pb]=E.B;return {'1':[[Va,Pa],[Vb,Pa],[Vb,Pb]],'2':[[Va,Pa],[Va,Pb],[Vb,Pb]],'3':[[Va,Pa],[Vb,Pb]]};};
  const work=pts=>{let W=0;for(let i=1;i<pts.length;i++)W+=(pts[i][0]-pts[i-1][0])*(pts[i][1]+pts[i-1][1])/2;return W;};
  function draw(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.78,470,300);
    A=axes(ctx,{l:52,t:16,w:w-68,h:h-50,xr:[0,30],yr:[0,300],xl:'V (L)',yl:'P (kPa)'});
    const P=paths(),cols={'1':K.a,'2':K.b,'3':K.r};
    const sel=P[c];fillPath(ctx,A,[[sel[0][0],0],...sel,[sel[sel.length-1][0],0]],'rgba(36,83,201,.13)');
    ['1','2','3'].forEach(k=>polyl(ctx,A,P[k],k===c?cols[k]:'rgba(93,101,119,.35)',k===c?3.5:2,k===c?null:[5,4]));
    const iso=(V,pt)=>pt[0]*pt[1]/V;
    curve(ctx,A,V=>iso(V,E.A),1,30,'rgba(201,42,42,.35)',1.2,[2,4]);curve(ctx,A,V=>iso(V,E.B),1,30,'rgba(201,42,42,.35)',1.2,[2,4]);
    const [Va,Pa]=E.A,[Vb,Pb]=E.B;
    label(ctx,'C',A.X(Vb)+8,A.Y(Pa)+12,K.a);label(ctx,'D',A.X(Va)-14,A.Y(Pb)-10,K.b);
    dot(ctx,A.X(Va),A.Y(Pa),8,K.ink,'#fff');dot(ctx,A.X(Vb),A.Y(Pb),8,K.ink,'#fff');
    label(ctx,'A',A.X(Va)+12,A.Y(Pa)+12,K.ink,'left','middle','700 14px Inter');label(ctx,'B',A.X(Vb)+12,A.Y(Pb)-12,K.ink,'left','middle','700 14px Inter');
    const dU=1.5*(Pb*Vb-Pa*Va),Ws={};['1','2','3'].forEach(k=>Ws[k]=work(P[k]));
    const nm={'1':'A→C→B','2':'A→D→B','3':'recta'};
    rd.innerHTML=row('T<sub>A</sub>',nf(Pa*Va/8.314,0)+' K')+row('T<sub>B</sub>',nf(Pb*Vb/8.314,0)+' K')+row('ΔU = (3/2)(P<sub>B</sub>V<sub>B</sub> − P<sub>A</sub>V<sub>A</sub>)',nf(dU,0)+' J')+sep+
      ['1','2','3'].map(k=>`<div${k===c?' style="font-weight:700"':''}><span class="k" style="color:${cols[k]}">${nm[k]}</span>: W = <b>${nf(Ws[k],0)} J</b>, Q = <b>${nf(dU+Ws[k],0)} J</b></div>`).join('')+sep+
      row('ciclo A→C→B→D→A: ∮δW = ∮δQ',nf(Ws['1']-Ws['2'],0)+' J')+rowT('Las líneas rojas punteadas son las isotermas de A y B.');
  }
  return {draw};
};

/* ---------- primera ley ---------- */
V.push(topic({id:'tme-primera-ley',p:'ms03',
lead:R`La primera ley es la conservación de la energía aplicada a sistemas macroscópicos. Afirma que, aunque el calor y el trabajo dependen del camino, su diferencia no: existe una función de estado, la energía interna \(U\).`,
res:[
[R`Enunciado.`,R`Para todo proceso, \(dU = \delta Q - \delta W\), con \(\delta Q\) el calor absorbido y \(\delta W\) el trabajo hecho por el sistema. En un ciclo, \(\Delta U = 0\) y por tanto \(Q_\text{neto} = W_\text{neto}\): no hay móvil perpetuo de primera especie.`],
[R`Energía interna del gas ideal.`,R`En la expansión libre de Joule (\(Q = 0\), \(W = 0\)) la temperatura de un gas ideal no cambia, así que \(U = U(T)\). Por equipartición, \(U = \tfrac{f}{2}nRT\), con \(f = 3\) (monoatómico) o \(f = 5\) (diatómico a temperatura ambiente).`],
[R`Entalpía.`,R`\(H = U + PV\). A presión constante, \(\delta Q = dH\): es la magnitud natural en química y en procesos abiertos a la atmósfera.`],
[R`Relación de Mayer.`,R`Para el gas ideal, \(dH = dU + nR\,dT\) implica \(C_P - C_V = nR\). El cociente \(\gamma = C_P/C_V\) vale \(5/3\) (monoatómico) o \(7/5\) (diatómico).`],
[R`Isotérmico e isobárico.`,R`Isotérmico: \(\Delta U = 0\), \(Q = W = nRT\ln(V_2/V_1)\). Isobárico: \(W = P\Delta V\), \(Q = nc_P\Delta T\). Isocórico: \(W = 0\), \(Q = nc_V\Delta T\).`],
[R`Adiabático cuasiestático.`,R`Con \(\delta Q = 0\): \(nc_V\,dT = -P\,dV = -\dfrac{nRT}{V}dV\). Integrando, \(TV^{\gamma-1} = \text{cte}\) y \(PV^\gamma = \text{cte}\). El trabajo es \(W = \dfrac{P_1V_1 - P_2V_2}{\gamma-1} = -\Delta U\).`]],
lab:PANE('ms03-cv',[G('ms03-p','p',[['T','Isotérmico'],['P','Isobárico'],['V','Isocórico'],['Q','Adiabático']]),G('ms03-f','f',[['3','Monoatómico'],['5','Diatómico']]),S('ms03-x','V₂ (L)',3,40,0.5,25)],'ms03-read',
 R`1 mol parte de \(V_1 = 10\) L y \(T_1 = 300\) K. A la izquierda, el diagrama \(P\)–\(V\) con el trabajo sombreado. A la derecha, el pistón (el color indica la temperatura) y las barras de \(Q\), \(W\) y \(\Delta U\). Siempre se cumple \(Q = \Delta U + W\). En el proceso isocórico el control fija \(T_2\).`),
laws:[
['Primera ley',R`dU = \delta Q - \delta W`,'Integrada: ΔU = Q − W.'],
['Gas ideal',R`U = \frac{f}{2}nRT,\qquad C_P - C_V = nR`,R`\(\gamma = \dfrac{f+2}{f}\).`],
['Isotérmico',R`W = Q = nRT\ln\frac{V_2}{V_1}`,'ΔU = 0 para el gas ideal.'],
['Adiabático',[R`PV^{\gamma}=\text{cte},\quad TV^{\gamma-1}=\text{cte}`,R`W = \frac{P_1V_1-P_2V_2}{\gamma-1}`],'La pendiente adiabática es γ veces la isotérmica: dP/dV = −γP/V.'],
['Entalpía',R`H = U+PV,\qquad Q_P = \Delta H`,'Útil en procesos a presión constante y en flujo estacionario.']],
ej:[R`Aire (\(\gamma = 1{,}4\)) a 300 K y 1 bar se comprime adiabáticamente hasta 1/10 de su volumen, como en un motor diésel. Halla la temperatura y la presión finales y el trabajo por mol.`,[
R`\(T_2 = T_1 (V_1/V_2)^{\gamma-1} = 300\cdot10^{0{,}4} = 754\) K.`,
R`\(P_2 = P_1(V_1/V_2)^\gamma = 10^{1{,}4} = 25{,}1\) bar.`,
R`\(W = -\Delta U = -nc_V\Delta T = -\tfrac52(8{,}314)(454) = -9{,}4\) kJ. El signo negativo indica que el entorno hace trabajo sobre el gas.`,
R`Esa temperatura supera la de autoignición del gasóleo (unos 500 K): por eso el motor diésel no necesita bujías.`]],
ref:'Zemansky & Dittman, cap. 4–5; Callen, cap. 1; Serway, cap. 20'}));

LABS['tme-primera-ley']=function(sec){
  const cv=$('#ms03-cv',sec),rd=$('#ms03-read',sec),xin=$('#ms03-x',sec),xl=xin.parentElement;
  let pr='T',f=3,s=0,play=true;
  const n=1,R0=8.314,V1=10,T1=300,P1=n*R0*T1/V1; /* kPa con V en L */
  const gx=sl(sec,'ms03-x',v=>pr==='V'?nf(v,0)+' K':nf(v,1)+' L',()=>{s=0;draw();});
  segm(sec,'ms03-p','p',v=>{pr=v;if(v==='V'){xin.min=100;xin.max=900;xin.step=5;gx.set(600);xl.firstChild.textContent='T₂ (K) ';}else{xin.min=3;xin.max=40;xin.step=0.5;gx.set(25);xl.firstChild.textContent='V₂ (L) ';}s=0;draw();});
  segm(sec,'ms03-f','f',v=>{f=+v;s=0;draw();});
  function proc(){
    const g=(f+2)/f,cv_=f/2*R0,x=gx();let pts=[],V2,T2,W,Q;
    const N=120;
    if(pr==='T'){V2=x;T2=T1;for(let i=0;i<=N;i++){const V=V1+(V2-V1)*i/N;pts.push([V,n*R0*T1/V]);}W=n*R0*T1*Math.log(V2/V1);}
    else if(pr==='P'){V2=x;T2=T1*V2/V1;pts=[[V1,P1],[V2,P1]];W=P1*(V2-V1);}
    else if(pr==='V'){V2=V1;T2=x;pts=[[V1,P1],[V1,n*R0*T2/V1]];W=0;}
    else{V2=x;T2=T1*Math.pow(V1/V2,g-1);for(let i=0;i<=N;i++){const V=V1+(V2-V1)*i/N;pts.push([V,P1*Math.pow(V1/V,g)]);}W=(P1*V1-n*R0*T2)/(g-1);}
    const dU=n*cv_*(T2-T1);Q=dU+W;return {pts,V2,T2,W,Q,dU,g};}
  const tcol=T=>{const u=clamp((T-100)/800,0,1);return `rgb(${Math.round(60+195*u)},${Math.round(110-40*u)},${Math.round(220-190*u)})`;};
  function draw(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.62,440,300),pp=proc();
    const wl=Math.round(w*0.6);
    const pm=Math.max(...pp.pts.map(q=>q[1]));const A=axes(ctx,{l:50,t:16,w:wl-64,h:h-50,xr:[0,42],yr:[0,Math.max(400,pm*1.12)],xl:'V (L)',yl:'P (kPa)'});
    curve(ctx,A,V=>n*R0*T1/V,3,42,'rgba(201,42,42,.35)',1.2,[3,4]);
    curve(ctx,A,V=>P1*Math.pow(V1/V,(f+2)/f),3,42,'rgba(112,72,232,.35)',1.2,[3,4]);
    const P=pp.pts;fillPath(ctx,A,[[P[0][0],0],...P,[P[P.length-1][0],0]],pp.W>=0?'rgba(36,83,201,.15)':'rgba(217,72,15,.15)');
    polyl(ctx,A,P,K.ink,3);
    /* punto animado */
    const k=Math.min(P.length-1,Math.floor(s*(P.length-1)));let cur;
    if(P.length===2){cur=[P[0][0]+(P[1][0]-P[0][0])*s,P[0][1]+(P[1][1]-P[0][1])*s];}else cur=P[k];
    dot(ctx,A.X(P[0][0]),A.Y(P[0][1]),5,K.ink);dot(ctx,A.X(cur[0]),A.Y(cur[1]),7,K.f,'#fff');
    label(ctx,'1',A.X(P[0][0])-12,A.Y(P[0][1])-10,K.ink);
    label(ctx,'isoterma',A.X(38),A.Y(n*R0*T1/38)-10,'rgba(201,42,42,.8)','right');
    /* pistón */
    const Vc=cur[0],Tc=cur[1]*Vc/(n*R0);
    const x0=wl+14,cw=w-x0-14,cy=24,chh=h*0.42,len=clamp(Vc/42,0.05,1)*(cw-20);
    ctx.strokeStyle=K.ink;ctx.lineWidth=2.5;ctx.strokeRect(x0,cy,cw,chh);
    ctx.fillStyle=tcol(Tc);ctx.globalAlpha=.55;ctx.fillRect(x0+2,cy+2,len,chh-4);ctx.globalAlpha=1;
    ctx.fillStyle='#9aa1b0';ctx.fillRect(x0+len,cy+2,10,chh-4);ctx.fillRect(x0+len+10,cy+chh/2-3,cw-len-10,6);
    const rr=rng(7);ctx.fillStyle=K.ink;for(let i=0;i<40;i++){dot(ctx,x0+6+rr()*(len-10),cy+6+rr()*(chh-12),1.8,'rgba(28,34,48,.7)');}
    label(ctx,`T = ${nf(Tc,0)} K`,x0+6,cy+chh+14,K.ink);
    /* barras */
    const by=cy+chh+40,bh=h-by-24,fr=s,vals=[['Q',pp.Q*fr,K.w],['W',pp.W*fr,K.a],['ΔU',pp.dU*fr,K.r]];
    const mx=Math.max(1000,Math.abs(pp.Q),Math.abs(pp.W),Math.abs(pp.dU)),bw=cw/3-14,mid=by+bh/2;
    ctx.strokeStyle=K.ax;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x0,mid);ctx.lineTo(x0+cw,mid);ctx.stroke();
    vals.forEach(([nm,v,col],i)=>{const bx=x0+i*(bw+14)+7,hh=v/mx*(bh/2-10);ctx.fillStyle=col;ctx.globalAlpha=.75;ctx.fillRect(bx,hh>0?mid-hh:mid,bw,Math.abs(hh));ctx.globalAlpha=1;
      label(ctx,nm,bx+bw/2,by+bh+8,col,'center');label(ctx,nf(v/1000,2)+' kJ',bx+bw/2,hh>0?mid-hh-9:mid-hh+9,K.ink,'center','middle','600 10px Inter');});
    const nm={T:'isotérmico',P:'isobárico',V:'isocórico',Q:'adiabático'}[pr];
    rd.innerHTML=row('proceso',nm)+row('γ',nf(pp.g,3))+row('V₂',nf(pp.V2,1)+' L')+row('T₂',nf(pp.T2,0)+' K')+row('P₂',nf(n*R0*pp.T2/pp.V2,0)+' kPa')+sep+
      row('W (hecho por el gas)',nf(pp.W,0)+' J')+row('ΔU = n c<sub>V</sub> ΔT',nf(pp.dU,0)+' J')+row('Q = ΔU + W',nf(pp.Q,0)+' J')+
      rowT(pr==='T'?'Todo el calor absorbido se convierte en trabajo: ΔU = 0.':pr==='Q'?'Q = 0: el trabajo sale de la energía interna y la temperatura cambia.':pr==='V'?'Sin trabajo: todo el calor cambia la energía interna.':'Parte del calor se invierte en trabajo y parte en energía interna: Q = n c<sub>P</sub> ΔT.');
  }
  return {draw,tick(dt){if(!vis(cv))return;s+=dt/3;if(s>1.4)s=0;const keep=s;s=Math.min(1,s);draw();s=keep;}};
};

/* ================= UNIDAD II · SEGUNDA Y TERCERA LEY ================= */
V.push(topic({id:'tme-carnot',p:'ms04',
lead:R`La primera ley no prohíbe convertir todo el calor en trabajo ni que el calor fluya de lo frío a lo caliente. La segunda ley sí lo prohíbe. Carnot (1824) mostró, antes de que existiera el concepto de energía, que el rendimiento máximo de una máquina térmica depende solo de las temperaturas de los focos.`,
res:[
[R`Máquina térmica.`,R`Opera en ciclos entre un foco caliente \(T_h\) y uno frío \(T_c\). Absorbe \(Q_h\), cede \(Q_c\) y entrega \(W = Q_h - Q_c\). Su rendimiento es \(\eta = W/Q_h = 1 - Q_c/Q_h\).`],
[R`Enunciados de la segunda ley.`,R`<i>Kelvin-Planck:</i> ningún ciclo tiene como único efecto extraer calor de un foco y convertirlo íntegramente en trabajo. <i>Clausius:</i> ningún ciclo tiene como único efecto pasar calor de un cuerpo frío a uno caliente. Si se viola uno, se puede construir una máquina que viola el otro, así que son equivalentes.`],
[R`Teorema de Carnot.`,R`Ninguna máquina entre dos focos supera a una reversible, y todas las reversibles tienen el mismo rendimiento. La demostración acopla una máquina hipotéticamente mejor con una reversible funcionando como refrigerador y obtiene una violación de Clausius.`],
[R`Balance de entropía de una máquina.`,R`En cada ciclo la sustancia de trabajo vuelve a su estado, así que solo cambian los focos: \(\Delta S_\text{univ} = -\dfrac{Q_h}{T_h} + \dfrac{Q_c}{T_c}\). La segunda ley exige \(\Delta S_\text{univ}\ge0\), es decir \(\dfrac{Q_c}{Q_h}\ge\dfrac{T_c}{T_h}\), que es lo mismo que \(\eta\le1-\dfrac{T_c}{T_h}\). La igualdad corresponde a la máquina reversible, y el trabajo que se pierde es \(W_\text{perdido} = T_c\,\Delta S_\text{univ}\).`],
[R`Ciclo de Carnot.`,R`Dos isotermas y dos adiabáticas reversibles. Para un gas ideal, las adiabáticas imponen \(V_3/V_2 = V_4/V_1\), y entonces \(Q_c/Q_h = T_c/T_h\). En el diagrama \(T\)–\(S\) el ciclo es un rectángulo.`],
[R`Temperatura termodinámica.`,R`Como el rendimiento reversible no depende de la sustancia, Kelvin definió la temperatura absoluta mediante \(Q_c/Q_h = T_c/T_h\). Coincide con la del termómetro de gas ideal.`],
[R`Refrigeradores y bombas de calor.`,R`Recorren el ciclo al revés. Coeficientes de operación: \(\text{COP}_R = Q_c/W \le \dfrac{T_c}{T_h-T_c}\) y \(\text{COP}_{BC} = Q_h/W \le \dfrac{T_h}{T_h-T_c}\). Pueden ser mayores que 1.`],
[R`Ciclos reales.`,R`El ciclo Otto (gasolina) tiene dos adiabáticas y dos isocóricas: \(\eta = 1 - r^{1-\gamma}\), con \(r\) la razón de compresión. Absorbe calor a temperaturas variables, por eso rinde menos que Carnot entre sus temperaturas extremas.`]],
lab:PANE('ms04-cv',[G('ms04-c','c',[['carnot','Carnot'],['otto','Otto']]),S('ms04-th','T<sub>h</sub> (K)',400,1500,10,800),S('ms04-tc','T<sub>c</sub> (K)',200,600,10,300),S('ms04-r','r (Otto)',2,12,0.5,8),S('ms04-x','Máquina real: η/η<sub>C</sub>',0.2,1.3,0.01,0.7)],'ms04-read',
 R`1 mol de aire (\(\gamma = 1{,}4\)). A la izquierda, el ciclo en el plano \(P\)–\(V\) en escala log-log, donde isotermas y adiabáticas son rectas de pendiente \(-1\) y \(-\gamma\); a la derecha, el mismo ciclo en \(T\)–\(S\), donde el área encerrada es el trabajo neto. Rojo: absorbe calor. Azul: cede calor. El panel de lecturas hace el balance de la segunda ley: la entropía que gana el universo en cada ciclo. Con el control "máquina real" puedes proponer una máquina entre los mismos focos con un rendimiento dado: si supera al de Carnot, el universo perdería entropía y la segunda ley la prohíbe. En el ciclo Otto, \(T_h\) es la temperatura máxima tras la combustión y \(T_c\) la de admisión.`),
laws:[
['Segunda ley (Kelvin-Planck)',R`\text{ciclo en contacto con un solo foco:}\quad W\le0`,'Es imposible convertir íntegramente en trabajo el calor de un solo foco. Toda máquina necesita ceder calor a un foco frío: Q<sub>c</sub> &gt; 0.'],
['Segunda ley (Clausius)',R`\text{ciclo con }W=0:\quad Q_{\,\text{frío}\to\text{caliente}}\le0`,'El calor no pasa espontáneamente de un cuerpo frío a uno caliente: un refrigerador siempre consume trabajo.'],
['Rendimiento',R`\eta = \frac{W}{Q_h} = 1-\frac{Q_c}{Q_h}`,'La primera ley da W = Q<sub>h</sub> − Q<sub>c</sub>; la segunda ley limita cuánto puede valer η.'],
['Teorema de Carnot',R`\eta\le\eta_\text{rev}=1-\frac{T_c}{T_h}`,'Igualdad solo para máquinas reversibles; todas las reversibles entre los mismos focos rinden igual.'],
['Balance de entropía',R`\Delta S_\text{univ} = \frac{Q_c}{T_c}-\frac{Q_h}{T_h}\ge0`,R`Equivale al teorema de Carnot. Trabajo perdido: \(W_\text{perdido} = T_c\,\Delta S_\text{univ}\).`],
['Refrigerador y bomba de calor',[R`\text{COP}_R\le\frac{T_c}{T_h-T_c}`,R`\text{COP}_{BC}\le\frac{T_h}{T_h-T_c}`]],
['Otto',R`\eta_\text{Otto} = 1 - \frac{1}{r^{\gamma-1}}`,R`\(r = V_\text{máx}/V_\text{mín}\). Con \(r = 8\) y \(\gamma = 1{,}4\): \(\eta = 56\%\).`],
['Escala termodinámica',R`\frac{Q_c}{Q_h}\Big|_\text{rev} = \frac{T_c}{T_h}`,'Define T sin referirse a ninguna sustancia.']],
ej:[R`Una central térmica opera entre vapor a 800 K y un río a 300 K. Produce 500 MW con un rendimiento igual al 60% del de Carnot. ¿Cuánto calor cede al río cada segundo?`,[
R`\(\eta_C = 1 - 300/800 = 0{,}625\), así que \(\eta = 0{,}6\times0{,}625 = 0{,}375\).`,
R`\(Q_h = W/\eta = 500/0{,}375 = 1333\) MW.`,
R`\(Q_c = Q_h - W = 833\) MW. El río recibe más energía que la red eléctrica.`,
R`Aumentar \(T_h\) es la vía principal de mejora: con 1000 K, \(\eta_C\) sube a 0,70.`]],
ref:'Zemansky & Dittman, cap. 6–7; Callen, cap. 4; Fermi, <i>Thermodynamics</i>, cap. 3'}));

LABS['tme-carnot']=function(sec){
  const cv=$('#ms04-cv',sec),rd=$('#ms04-read',sec);let cy='carnot',s=0;
  const g=1.4,R0=8.314,cvm=R0/(g-1);
  const gth=sl(sec,'ms04-th',v=>v+' K',()=>draw()),gtc=sl(sec,'ms04-tc',v=>v+' K',()=>draw()),gr=sl(sec,'ms04-r',v=>nf(v,1),()=>draw()),gx=sl(sec,'ms04-x',v=>nf(100*v,0)+' %',()=>draw());
  segm(sec,'ms04-c','c',v=>{cy=v;draw();});
  function cycle(){
    const Th=gth(),Tc=Math.min(gtc(),Th-20),N=60,legs=[];
    if(cy==='carnot'){const V1=4,V2=16,k=Math.pow(Th/Tc,1/(g-1)),V3=V2*k,V4=V1*k;
      const iso=(Va,Vb,T)=>Array.from({length:N+1},(_,i)=>{const V=Va*Math.pow(Vb/Va,i/N);return [V,R0*T/V,T];});
      const adi=(Va,Vb,Ta)=>Array.from({length:N+1},(_,i)=>{const V=Va*Math.pow(Vb/Va,i/N),T=Ta*Math.pow(Va/V,g-1);return [V,R0*T/V,T];});
      legs.push({p:iso(V1,V2,Th),q:R0*Th*Math.log(V2/V1)},{p:adi(V2,V3,Th),q:0},{p:iso(V3,V4,Tc),q:-R0*Tc*Math.log(V3/V4)},{p:adi(V4,V1,Tc),q:0});
      return {legs,Th,Tc,ok:true};}
    const r=gr(),Vmax=20,Vmin=Vmax/r,T2=Tc*Math.pow(r,g-1),T3=Math.max(Th,T2+1),T4=T3/Math.pow(r,g-1);
    const adi=(Va,Vb,Ta)=>Array.from({length:N+1},(_,i)=>{const V=Va+(Vb-Va)*i/N,T=Ta*Math.pow(Va/V,g-1);return [V,R0*T/V,T];});
    const icv=(V,Ta,Tb)=>Array.from({length:N+1},(_,i)=>{const T=Ta+(Tb-Ta)*i/N;return [V,R0*T/V,T];});
    legs.push({p:adi(Vmax,Vmin,Tc),q:0},{p:icv(Vmin,T2,T3),q:cvm*(T3-T2)},{p:adi(Vmin,Vmax,T3),q:0},{p:icv(Vmax,T4,Tc),q:-cvm*(T4-Tc)});
    return {legs,Th:T3,Tc,ok:Th>T2,T2,T4};}
  function draw(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.6,430,300),C=cycle();
    const all=C.legs.flatMap(l=>l.p),Vm=Math.max(...all.map(q=>q[0])),Pm=Math.max(...all.map(q=>q[1]));
    const S=(V,T)=>cvm*Math.log(T/C.Tc)+R0*Math.log(V/all[0][0]);
    const hw=Math.round(w/2);
    const lg=Math.log10,Vn=Math.min(...all.map(q=>q[0])),Pn=Math.min(...all.map(q=>q[1]));
    const lt=(a,b)=>{const o=[];for(let e=Math.floor(a)-1;e<=b+1;e++)[1,2,5].forEach(m=>{const v=lg(m)+e;if(v>=a&&v<=b)o.push(v);});return o;};
    const xr=[lg(Vn)-0.12,lg(Vm)+0.12],yr=[lg(Pn)-0.12,lg(Pm)+0.15];
    const A=axes(ctx,{l:50,t:16,w:hw-62,h:h-50,xr,yr,xl:'V (L), log',yl:'P (kPa), log',xt:lt(...xr),yt:lt(...yr),xf:v=>nf(10**v,10**v<10?1:0),yf:v=>nf(10**v,10**v<10?1:0)});
    const L=q=>[lg(q[0]),lg(q[1])];
    const ss=all.map(q=>S(q[0],q[2])),smin=Math.min(...ss),smax=Math.max(...ss);
    const B=axes(ctx,{l:hw+44,t:16,w:w-hw-56,h:h-50,xr:[smin-(smax-smin)*.15,smax+(smax-smin)*.15],yr:[0,C.Th*1.15],xl:'S (J/K)',yl:'T (K)'});
    const pts=C.legs[0].p.concat(C.legs[1].p,C.legs[2].p,C.legs[3].p);
    fillPath(ctx,A,pts.map(L),'rgba(36,83,201,.10)');fillPath(ctx,B,pts.map(q=>[S(q[0],q[2]),q[2]]),'rgba(36,83,201,.10)');
    C.legs.forEach(l=>{const col=l.q>0?K.w:l.q<0?K.a:K.ink;polyl(ctx,A,l.p.map(L),col,3);polyl(ctx,B,l.p.map(q=>[S(q[0],q[2]),q[2]]),col,3);});
    [C.Th,C.Tc].forEach((T,i)=>{polyl(ctx,B,[[B.o.xr[0],T],[B.o.xr[1],T]],i?'rgba(36,83,201,.35)':'rgba(201,42,42,.35)',1.2,[4,4]);});
    const k=Math.floor(s*4),u=s*4-k,lp=C.legs[Math.min(3,k)].p,q=lp[Math.min(lp.length-1,Math.round(u*(lp.length-1)))];
    dot(ctx,A.X(lg(q[0])),A.Y(lg(q[1])),7,K.f,'#fff');dot(ctx,B.X(S(q[0],q[2])),B.Y(q[2]),7,K.f,'#fff');
    ['1','2','3','4'].forEach((t,i)=>{const p=C.legs[i].p[0];label(ctx,t,A.X(lg(p[0]))+8,A.Y(lg(p[1]))-10,K.ink,'left','middle','700 12px Inter');label(ctx,t,B.X(S(p[0],p[2]))+8,B.Y(p[2])-10,K.ink,'left','middle','700 12px Inter');});
    const Qh=C.legs.reduce((a,l)=>a+Math.max(0,l.q),0),Qc=-C.legs.reduce((a,l)=>a+Math.min(0,l.q),0),W=Qh-Qc,eta=W/Qh,ec=1-C.Tc/C.Th;
    /* ∮δQ/T del gas: suma sobre los tramos con la temperatura del propio gas */
    let clau=0;C.legs.forEach(l=>{if(!l.q)return;const p=l.p;for(let i=1;i<p.length;i++){const Tm=(p[i][2]+p[i-1][2])/2,dQ=l.q/(p.length-1);clau+=dQ/Tm;}});
    const dSu=Qc/C.Tc-Qh/C.Th,ex=gx()*ec,dSr=1000*(1-ex)/C.Tc-1000/C.Th;
    rd.innerHTML=row('Q<sub>h</sub> absorbido',nf(Qh,0)+' J')+row('Q<sub>c</sub> cedido',nf(Qc,0)+' J')+row('W = Q<sub>h</sub> − Q<sub>c</sub>',nf(W,0)+' J')+sep+
      row('η del ciclo',nf(100*eta,1)+' %')+row('η de Carnot entre '+nf(C.Tc,0)+' K y '+nf(C.Th,0)+' K',nf(100*ec,1)+' %')+
      (cy==='carnot'?row('Q<sub>c</sub>/Q<sub>h</sub> = T<sub>c</sub>/T<sub>h</sub>',nf(Qc/Qh,4)+' = '+nf(C.Tc/C.Th,4))+row('COP refrigerador (al revés)',nf(C.Tc/(C.Th-C.Tc),2))
        :row('T tras compresión (2)',nf(C.T2,0)+' K')+row('T de escape (4)',nf(C.T4,0)+' K')+row('1 − r<sup>1−γ</sup>',nf(100*(1-Math.pow(gr(),1-g)),1)+' %')+
         rowT(C.ok?'El Otto absorbe calor entre T₂ y T<sub>h</sub>, no siempre a T<sub>h</sub>: por eso η &lt; η<sub>Carnot</sub>.':'T<sub>h</sub> es menor que la temperatura tras la compresión: se ajustó para que el ciclo exista.'))+
      sep+'<div style="font-weight:700;margin:2px 0 4px">Segunda ley</div>'+row('∮ δQ/T del gas',nf(clau,3)+' J/K')+
      row('ΔS<sub>univ</sub> = Q<sub>c</sub>/T<sub>c</sub> − Q<sub>h</sub>/T<sub>h</sub> (focos)',nf(dSu,2)+' J/K')+row('trabajo perdido T<sub>c</sub>ΔS<sub>univ</sub>',nf(C.Tc*dSu,0)+' J')+
      rowT(cy==='carnot'?'Carnot es reversible: el gas y los focos intercambian calor a la misma temperatura, así que ΔS<sub>univ</sub> = 0 y ningún trabajo se desperdicia.':'El gas recorre un ciclo reversible (∮δQ/T = 0), pero si el calor viene de un foco a T<sub>h</sub> y va a uno a T<sub>c</sub>, cada intercambio ocurre con diferencia de temperatura y el universo gana entropía.')+
      sep+'<div style="font-weight:700;margin:2px 0 4px">Máquina real entre los mismos focos (Q<sub>h</sub> = 1000 J)</div>'+row('η propuesta',nf(100*ex,1)+' %')+row('W',nf(1000*ex,0)+' J')+row('Q<sub>c</sub>',nf(1000*(1-ex),0)+' J')+
      `<div><span class="k">ΔS<sub>univ</sub></span> = <b style="color:${dSr<-1e-9?'#e03131':'inherit'}">${nf(dSr,3)} J/K</b></div>`+
      rowT(dSr<-1e-9?'Imposible: el universo perdería entropía. Acoplada a un Carnot funcionando al revés, esta máquina pasaría calor del foco frío al caliente sin gastar trabajo (viola Clausius).':Math.abs(dSr)<1e-6?'Límite reversible: ΔS<sub>univ</sub> = 0. Es la máquina de Carnot.':'Permitida: ΔS<sub>univ</sub> &gt; 0. Respecto de Carnot se pierden '+nf(C.Tc*dSr,0)+' J por cada 1000 J absorbidos.');
  }
  return {draw,tick(dt){if(!vis(cv))return;s=(s+dt/6)%1;draw();}};
};

/* ---------- entropía ---------- */
V.push(topic({id:'tme-entropia',p:'ms05',
lead:R`Del teorema de Carnot sale una consecuencia sorprendente: en un ciclo reversible, la suma de los calores divididos por la temperatura es cero. Eso define una nueva función de estado, la entropía, y convierte la segunda ley en una desigualdad cuantitativa.`,
res:[
[R`Desigualdad de Clausius.`,R`Para cualquier ciclo, \(\oint \dfrac{\delta Q}{T} \le 0\), con igualdad si el ciclo es reversible. Se demuestra descomponiendo el ciclo en muchos ciclos de Carnot infinitesimales.`],
[R`Definición de entropía.`,R`Como \(\oint \delta Q_\text{rev}/T = 0\), la integral \(\int_A^B \delta Q_\text{rev}/T\) no depende del camino: define \(S(B) - S(A)\). La temperatura es el factor integrante que vuelve exacta a \(\delta Q_\text{rev}\): \(dS = \delta Q_\text{rev}/T\).`],
[R`Procesos irreversibles.`,R`Para cualquier proceso, \(dS \ge \delta Q/T\). En un sistema aislado (\(\delta Q = 0\)), \(\Delta S \ge 0\): la entropía nunca disminuye y el equilibrio es el estado de entropía máxima.`],
[R`Relación fundamental.`,R`Combinando la primera ley con \(\delta Q_\text{rev} = T\,dS\): \(dU = T\,dS - P\,dV\). Relaciona solo funciones de estado, así que vale para cualquier proceso entre estados de equilibrio.`],
[R`Gas ideal.`,R`\(\Delta S = nc_V\ln\dfrac{T_2}{T_1} + nR\ln\dfrac{V_2}{V_1}\). En la expansión libre al doble de volumen, \(Q = 0\) pero \(\Delta S = nR\ln2 > 0\): para calcularlo hay que usar un camino reversible entre los mismos estados.`],
[R`Conducción de calor.`,R`Si dos cuerpos con la misma capacidad calorífica \(C\), a temperaturas \(T_1\) y \(T_2\), se ponen en contacto, llegan a \(T_f = (T_1+T_2)/2\) y, \(\Delta S = C\ln\dfrac{T_f^2}{T_1T_2} \ge 0\), porque la media aritmética es mayor o igual que la geométrica. La tasa de producción es \(\dot S = \dot Q\left(\dfrac1{T_c} - \dfrac1{T_h}\right) \ge 0\).`],
[R`Trabajo perdido.`,R`La irreversibilidad desperdicia trabajo: \(W_\text{perdido} = T_0\,\Delta S_\text{univ}\), con \(T_0\) la temperatura del ambiente.`]],
lab:PANE('ms05-cv',[S('ms05-t1','T₁ (K)',250,600,5,500),S('ms05-t2','T₂ (K)',100,500,5,200),S('ms05-c','C₂/C₁',0.2,5,0.1,1),B('ms05-go','Poner en contacto',false)],'ms05-read',
 R`Dos cuerpos con capacidades \(C_1 = 1\) kJ/K y \(C_2\) se ponen en contacto por una pared diatérmica (ley de enfriamiento de Newton). Arriba, las temperaturas tienden a \(T_f\). Abajo, la entropía de cada cuerpo y la total: la del cuerpo caliente baja, la del frío sube más, y la total solo puede crecer.`),
laws:[
['Desigualdad de Clausius',R`\oint\frac{\delta Q}{T}\le 0`,'Igualdad solo para ciclos reversibles.'],
['Definición',R`dS = \frac{\delta Q_\text{rev}}{T}`,'S es extensiva y función de estado.'],
['Segunda ley',R`\Delta S_\text{aislado}\ge0`,'Para el universo: ΔS<sub>sist</sub> + ΔS<sub>entorno</sub> ≥ 0.'],
['Relación fundamental',R`dU = T\,dS - P\,dV`,'Combina la primera y la segunda ley.'],
['Gas ideal',R`\Delta S = nc_V\ln\frac{T_2}{T_1}+nR\ln\frac{V_2}{V_1}`,R`Equivale a \(nc_P\ln\frac{T_2}{T_1} - nR\ln\frac{P_2}{P_1}\).`],
['Cuerpo con C constante',R`\Delta S = C\ln\frac{T_2}{T_1}`,'Se obtiene integrando C dT/T.']],
ej:[R`1 kg de agua a 20 °C se pone en contacto con un foco a 80 °C hasta equilibrarse (\(c = 4{,}18\ \text{kJ/(kg·K)}\)). Halla \(\Delta S\) del agua, del foco y del universo.`,[
R`Agua: \(\Delta S_a = mc\ln(T_f/T_i) = 4{,}18\ln(353/293) = 0{,}779\) kJ/K.`,
R`El foco cede \(Q = mc\Delta T = 4{,}18\times60 = 250{,}8\) kJ a temperatura constante: \(\Delta S_f = -250{,}8/353 = -0{,}710\) kJ/K.`,
R`\(\Delta S_\text{univ} = 0{,}069\) kJ/K \(> 0\): el proceso es irreversible.`,
R`Calentar con una sucesión de focos cada vez más calientes reduce \(\Delta S_\text{univ}\); en el límite de infinitos focos el proceso se vuelve reversible.`]],
ref:'Zemansky & Dittman, cap. 8; Callen, cap. 4; Fermi, <i>Thermodynamics</i>, cap. 4'}));

LABS['tme-entropia']=function(sec){
  const cv=$('#ms05-cv',sec),rd=$('#ms05-read',sec);let t=0,run=false,hist=[],st=null;
  const g1=sl(sec,'ms05-t1',v=>v+' K',reset),g2=sl(sec,'ms05-t2',v=>v+' K',reset),gc=sl(sec,'ms05-c',v=>nf(v,1),reset);
  const btn=$('#ms05-go',sec);btn.onclick=()=>{if(!run&&t>0)reset();run=!run;btn.textContent=run?'Pausa':'Poner en contacto';};
  function reset(){t=0;run=false;btn.textContent='Poner en contacto';st={T1:g1(),T2:g2()};hist=[[0,st.T1,st.T2]];draw();}
  const C1=1,kap=0.04; /* kJ/K, kJ/(K·s) */
  function step(dt){const C2=gc()*C1,q=kap*(st.T1-st.T2)*dt;st.T1-=q/C1;st.T2+=q/C2;t+=dt;hist.push([t,st.T1,st.T2]);}
  function draw(){
    if(!vis(cv))return;if(!st){st={T1:g1(),T2:g2()};hist=[[0,st.T1,st.T2]];}
    const {ctx,w,h}=fit(cv,.8,480,320),T10=hist[0][1],T20=hist[0][2],C2=gc()*C1,Tf=(C1*T10+C2*T20)/(C1+C2);
    const tm=Math.max(60,t),hh=(h-70)/2;
    const A=axes(ctx,{l:52,t:14,w:w-66,h:hh,xr:[0,tm],yr:[0,650],yl:'T (K)'});
    polyl(ctx,A,[[0,Tf],[tm,Tf]],K.ax,1.3,[5,4]);label(ctx,'T_f = '+nf(Tf,1)+' K',A.X(tm)-4,A.Y(Tf)-9,K.mut,'right');
    polyl(ctx,A,hist.map(q=>[q[0],q[1]]),K.w,3);polyl(ctx,A,hist.map(q=>[q[0],q[2]]),K.a,3);
    const S1=q=>C1*Math.log(q[1]/T10),S2=q=>C2*Math.log(q[2]/T20);
    const Sf1=C1*Math.log(Tf/T10),Sf2=C2*Math.log(Tf/T20),lim=Math.max(0.05,Math.abs(Sf1),Math.abs(Sf2))*1.15;
    const B=axes(ctx,{l:52,t:hh+44,w:w-66,h:hh,xr:[0,tm],yr:[-lim,lim],xl:'t (s)',yl:'ΔS (kJ/K)'});
    polyl(ctx,B,hist.map(q=>[q[0],S1(q)]),K.w,2.5);polyl(ctx,B,hist.map(q=>[q[0],S2(q)]),K.a,2.5);polyl(ctx,B,hist.map(q=>[q[0],S1(q)+S2(q)]),K.r,3.5);
    polyl(ctx,B,[[0,Sf1+Sf2],[tm,Sf1+Sf2]],K.r,1.2,[5,4]);
    const L=hist[hist.length-1];label(ctx,'ΔS₁',B.X(L[0])-6,B.Y(S1(L))+12,K.w,'right');label(ctx,'ΔS₂',B.X(L[0])-6,B.Y(S2(L))-12,K.a,'right');label(ctx,'ΔS total',B.X(L[0])-6,B.Y(S1(L)+S2(L))-12,K.r,'right');
    const dS=kap*(L[1]-L[2])**2/(L[1]*L[2]);
    rd.innerHTML=row('T₁',nf(L[1],1)+' K')+row('T₂',nf(L[2],1)+' K')+row('T<sub>f</sub> = (C₁T₁ + C₂T₂)/(C₁ + C₂)',nf(Tf,1)+' K')+sep+
      row('ΔS₁',nf(S1(L)*1000,1)+' J/K')+row('ΔS₂',nf(S2(L)*1000,1)+' J/K')+row('ΔS<sub>total</sub>',nf((S1(L)+S2(L))*1000,2)+' J/K')+
      row('dS/dt = κ(T₁−T₂)²/(T₁T₂)',nf(dS*1000,2)+' W/K')+sep+row('ΔS<sub>total</sub> final',nf((Sf1+Sf2)*1000,2)+' J/K')+
      rowT(Math.abs(T10-T20)<1?'Con T₁ = T₂ no hay flujo de calor ni producción de entropía.':'La producción de entropía es positiva mientras haya diferencia de temperaturas.');
  }
  return {draw,tick(dt){if(!run||!vis(cv))return;for(let i=0;i<6;i++)step(dt*2);if(t>400){run=false;btn.textContent='Poner en contacto';}draw();}};
};

/* ---------- tercera ley ---------- */
V.push(topic({id:'tme-tercera-ley',p:'ms06',
lead:R`La segunda ley define diferencias de entropía, pero no fija su valor absoluto. Nernst (1906), estudiando reacciones químicas a baja temperatura, encontró que los cambios de entropía tienden a cero cuando \(T\to0\). Ese resultado empírico es la tercera ley, y su explicación completa llega con la mecánica estadística cuántica.`,
res:[
[R`Teorema de Nernst.`,R`Para cualquier proceso isotérmico entre estados de equilibrio, \(\lim_{T\to0}\Delta S = 0\). Planck lo reforzó: la entropía de un cristal perfecto tiende a una constante universal que se puede tomar como cero.`],
[R`Interpretación estadística.`,R`\(S = k_B\ln g_0\), con \(g_0\) la degeneración del estado fundamental. Si \(g_0\) no crece exponencialmente con \(N\), \(S/N\to0\).`],
[R`Capacidades caloríficas.`,R`Como \(S(T) = \int_0^T \dfrac{C(T')}{T'}\,dT'\) debe ser finita, \(C\to0\) cuando \(T\to0\). Para sólidos aislantes, \(C\propto T^3\) (Debye); para metales, \(C\propto T\) (gas de Fermi).`],
[R`Otros coeficientes.`,R`Por las relaciones de Maxwell, \(\alpha = -\frac1V\left(\frac{\partial S}{\partial P}\right)_T\to0\) y \(\left(\frac{\partial P}{\partial T}\right)_V\to0\). La dilatación térmica desaparece en el cero absoluto.`],
[R`El gas ideal clásico falla.`,R`Su entropía \(S = nc_V\ln T + \dots\) diverge a \(-\infty\) cuando \(T\to0\). No es un error de la tercera ley: a baja temperatura el gas deja de ser clásico y hace falta la estadística cuántica (Unidad VI).`],
[R`Inaccesibilidad del cero absoluto.`,R`Ningún procedimiento con un número finito de pasos alcanza \(T = 0\). Como todas las curvas \(S(T, X)\) convergen al mismo punto en \(T = 0\), cada ciclo de enfriamiento logra una fracción cada vez menor del camino.`],
[R`Entropía residual.`,R`Los vidrios, el CO sólido o el hielo conservan entropía a \(T\to0\) porque quedan atrapados fuera del equilibrio. Para el hielo, Pauling estimó \(S_0 = R\ln\tfrac32 \approx 3{,}4\ \text{J/(mol·K)}\), en acuerdo con la medida.`]],
lab:PANE('ms06-cv',[S('ms06-r','B₁/B₀',2,20,0.5,4),B('ms06-step','Un ciclo más',false),B('ms06-rst','Reiniciar')],'ms06-read',
 R`Enfriamiento por desmagnetización adiabática de una sal paramagnética de spin ½. Las dos curvas son \(S(T)\) con campo bajo \(B_0\) (rojo) y alto \(B_1\) (azul); ambas convergen a \(S = 0\) en \(T = 0\). Cada ciclo es una magnetización isotérmica (bajada vertical, el calor va a un baño) y una desmagnetización adiabática (tramo horizontal). El eje de \(T\) es logarítmico: cada paso divide \(T\) por \(B_1/B_0\), así que hacen falta infinitos pasos para llegar a 0.`),
laws:[
['Tercera ley (Nernst-Planck)',R`\lim_{T\to0}S(T,X) = S_0 = 0`,'El límite no depende de los demás parámetros X (presión, campo…).'],
['Entropía absoluta',R`S(T) = \int_0^T\frac{C(T')}{T'}\,dT'`,'Exige C → 0 para que la integral converja.'],
['Coeficientes en T → 0',[R`C\to0,\qquad\alpha\to0`,R`\Big(\frac{\partial P}{\partial T}\Big)_V\to0`]],
['Paramagneto de spin ½',R`\frac{S}{Nk_B}=\ln\!\big(2\cosh x\big)-x\tanh x,\quad x=\frac{\mu B}{k_BT}`,'Solo depende de B/T: la desmagnetización adiabática conserva B/T.'],
['Estadística',R`S_0 = k_B\ln g_0`,'g₀: degeneración del estado fundamental.']],
ej:[R`Una sal paramagnética se magnetiza a 1 K con \(B_1 = 1\) T y luego se desmagnetiza adiabáticamente hasta el campo interno residual \(B_0 = 0{,}01\) T. ¿Qué temperatura final se alcanza? ¿Y tras un segundo ciclo con el mismo baño?`,[
R`Para spins independientes, \(S\) depende solo de \(B/T\). Un proceso adiabático reversible conserva \(S\), así que conserva \(B/T\).`,
R`\(T_f = T_i\,B_0/B_1 = 1\ \text{K}\times0{,}01 = 10\) mK.`,
R`Un segundo ciclo usaría como baño la sal ya fría y bajaría a 0,1 mK, y así sucesivamente: \(T_n = T_0(B_0/B_1)^n\), que solo es cero para \(n\to\infty\).`,
R`En la práctica, las interacciones entre spins (el campo \(B_0\)) limitan el método a temperaturas del orden de mK; con spins nucleares se llega a μK.`]],
ref:'Callen, cap. 10; Zemansky & Dittman, cap. 19; Reif, cap. 3 y 11'}));

LABS['tme-tercera-ley']=function(sec){
  const cv=$('#ms06-cv',sec),rd=$('#ms06-read',sec);let path=[],n=0;const T0=1;
  const gr=sl(sec,'ms06-r',v=>nf(v,1),()=>reset());
  const Sx=x=>x>30?0:Math.log(2*Math.cosh(x))-x*Math.tanh(x);
  const B0=0.2;/* en unidades de kT a T=1 K */
  const Sof=(B,T)=>Sx(B/T);
  function reset(){n=0;path=[[T0,Sof(B0,T0)]];draw();}
  $('#ms06-step',sec).onclick=()=>{const r=gr(),B1=B0*r,last=path[path.length-1],T=last[0];
    const s1=Sof(B1,T);path.push([T,s1]);const T2=T/r;path.push([T2,s1]);n++;draw();};
  $('#ms06-rst',sec).onclick=reset;
  function draw(){
    if(!vis(cv))return;if(!path.length)path=[[T0,Sof(B0,T0)]];const {ctx,w,h}=fit(cv,.75,460,300),r=gr(),B1=B0*r;
    const A=axes(ctx,{l:52,t:16,w:w-68,h:h-50,xr:[-6,0.5],yr:[0,0.75],xl:'T (K), escala log',yl:'S / Nk',xt:[-6,-5,-4,-3,-2,-1,0],xf:v=>v===0?'1':'10'+'⁻'+'⁰¹²³⁴⁵⁶'[-v]});
    polyl(ctx,A,[[-6,Math.log(2)],[0.5,Math.log(2)]],K.ax,1.2,[4,4]);label(ctx,'ln 2',A.X(0.45),A.Y(Math.log(2))-9,K.mut,'right');
    curve(ctx,A,u=>Sof(B0,10**u),-6,0.5,K.w,3);curve(ctx,A,u=>Sof(B1,10**u),-6,0.5,K.a,3);
    label(ctx,'B₀',A.X(-0.2),A.Y(Sof(B0,10**-0.2))+14,K.w);label(ctx,'B₁ = '+nf(r,1)+' B₀',A.X(-0.4),A.Y(Sof(B1,10**-0.4))+14,K.a);
    const L=path.map(q=>[Math.log10(q[0]),q[1]]);polyl(ctx,A,L,K.ink,2.2);
    L.forEach((q,i)=>dot(ctx,A.X(Math.max(-6,q[0])),A.Y(q[1]),i===L.length-1?6:3.5,i===L.length-1?K.f:K.ink));
    const T=path[path.length-1][0];
    rd.innerHTML=row('ciclos realizados',n)+row('temperatura actual',T>=1e-3?nf(T*1000,3)+' mK':sci(T*1e6,3)+' μK')+row('factor por ciclo',nf(1/r,3))+
      row('S/Nk actual',nf(path[path.length-1][1],4))+sep+row('ciclos para llegar a 1 μK',Math.ceil(Math.log(1e6)/Math.log(r)))+
      rowT('T<sub>n</sub> = T₀ (B₀/B₁)<sup>n</sup> nunca vale 0 para n finito. Si las dos curvas no se juntaran en T = 0, un número finito de pasos bastaría: eso es lo que prohíbe la tercera ley.');
  }
  return {draw};
};

/* ================= UNIDAD III · FORMALISMO ================= */
V.push(topic({id:'tme-potenciales',p:'ms07',
lead:R`Toda la información termodinámica de un sistema simple está en una sola función: la ecuación fundamental \(U(S,V,N)\). En la práctica controlamos la temperatura o la presión, no la entropía. Las transformadas de Legendre cambian de variables sin perder información y producen los potenciales \(H\), \(F\) y \(G\).`,
res:[
[R`Ecuación fundamental.`,R`\(dU = T\,dS - P\,dV + \mu\,dN\). Las variables intensivas son derivadas: \(T = (\partial U/\partial S)_{V,N}\), \(P = -(\partial U/\partial V)_{S,N}\), \(\mu = (\partial U/\partial N)_{S,V}\). Cada una es una ecuación de estado.`],
[R`Relación de Euler.`,R`\(U\) es homogénea de grado 1 en sus variables extensivas: \(U(\lambda S,\lambda V,\lambda N) = \lambda U\). Derivando respecto de \(\lambda\): \(U = TS - PV + \mu N\).`],
[R`Por qué Legendre.`,R`Sustituir \(S(T)\) en \(U\) da \(U(T,V)\), pero se pierde información: curvas trasladadas tienen la misma \(U(T)\). La transformada describe la curva por la familia de sus tangentes: \(F(T) = U - TS\) es la ordenada al origen de la tangente de pendiente \(T\).`],
[R`Los cuatro potenciales.`,R`\(F = U - TS\) (Helmholtz), \(H = U + PV\) (entalpía), \(G = U - TS + PV = \mu N\) (Gibbs). Cada uno tiene sus <i>variables naturales</i>: \(F(T,V,N)\), \(H(S,P,N)\), \(G(T,P,N)\).`],
[R`Principios de extremo.`,R`Un sistema aislado maximiza \(S\) (o minimiza \(U\) a \(S\) fija). En contacto con un baño a \(T\) y volumen fijo, minimiza \(F\); a \(T\) y \(P\) fijas, minimiza \(G\). Por eso \(G\) gobierna las reacciones químicas y los cambios de fase.`],
[R`Significado físico.`,R`A temperatura constante, el trabajo máximo que puede entregar un sistema es \(-\Delta F\): la energía "libre" para hacer trabajo. A \(T\) y \(P\) constantes, el trabajo útil máximo (aparte del de expansión) es \(-\Delta G\).`],
[R`Gran potencial.`,R`Para sistemas abiertos, \(\Omega = U - TS - \mu N = -PV\), con variables naturales \((T,V,\mu)\). Reaparece en el conjunto gran canónico.`]],
lab:PANE('ms07-cv',[CHK('ms07-env','Mostrar la envolvente de tangentes',false)],'ms07-read',
 R`Izquierda: \(U(S)\) a \(V,N\) fijos para un gas ideal monoatómico (unidades adimensionales, \(U = e^{2S/3}\)). Arrastra el punto: la tangente tiene pendiente \(T = dU/dS\) y corta el eje vertical en \(F = U - TS\). Derecha: la función \(F(T)\) que se va construyendo. Su pendiente es \(-S\): la transformada inversa devuelve la curva original.`),
laws:[
['Ecuación fundamental',R`dU = T\,dS - P\,dV + \mu\,dN`,'Variables naturales: S, V, N.'],
['Helmholtz',R`F = U-TS,\quad dF = -S\,dT - P\,dV + \mu\,dN`,'Mínima a T y V fijas.'],
['Entalpía',R`H = U+PV,\quad dH = T\,dS + V\,dP + \mu\,dN`,'Calor a presión constante.'],
['Gibbs',R`G = H-TS,\quad dG = -S\,dT + V\,dP + \mu\,dN`,'Mínima a T y P fijas. G = μN.'],
['Euler y Gibbs-Duhem',[R`U = TS - PV + \mu N`,R`S\,dT - V\,dP + N\,d\mu = 0`],'Las tres intensivas no son independientes.'],
['Transformada de Legendre',R`g(p) = f(x) - p\,x,\quad p = f'(x)`,R`Inversa: \(f(x) = g(p) + px\) con \(x = -g'(p)\).`]],
ej:[R`Para un gas ideal monoatómico, \(F(T,V,N) = -Nk_BT\left[\ln\!\left(\dfrac{V}{N\lambda_T^3}\right)+1\right]\), con \(\lambda_T = h/\sqrt{2\pi mk_BT}\). Obtén \(P\), \(S\) y \(U\).`,[
R`\(P = -(\partial F/\partial V)_{T,N} = Nk_BT/V\): la ecuación del gas ideal.`,
R`Como \(\lambda_T^3\propto T^{-3/2}\), \(\partial(\ln\lambda_T^{-3})/\partial T = \tfrac{3}{2T}\). Entonces \(S = -(\partial F/\partial T)_{V,N} = Nk_B\left[\ln\!\left(\dfrac{V}{N\lambda_T^3}\right)+\tfrac52\right]\) (Sackur-Tetrode).`,
R`\(U = F + TS = -Nk_BT[\ln(\cdot)+1] + Nk_BT[\ln(\cdot)+\tfrac52] = \tfrac32Nk_BT\).`,
R`Un solo potencial en sus variables naturales contiene toda la termodinámica del sistema.`]],
ref:'Callen, cap. 2, 5 y 6; Zemansky & Dittman, cap. 10'}));

LABS['tme-potenciales']=function(sec){
  const cv=$('#ms07-cv',sec),rd=$('#ms07-read',sec),env=$('#ms07-env',sec);let S0=1.6,A=null;env.onchange=()=>draw();
  const U=s=>Math.exp(2*s/3),T=s=>2/3*Math.exp(2*s/3),Fof=t=>{const s=1.5*Math.log(1.5*t);return U(s)-t*s;};
  drag(cv,(x,y)=>{if(!A)return null;return Math.hypot(A.X(S0)-x,A.Y(U(S0))-y)<22?1:null;},(k,x)=>{S0=clamp((x-A.o.l)/A.o.w*(A.o.xr[1]-A.o.xr[0])+A.o.xr[0],-0.6,2.9);draw();});
  function draw(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.6,430,300),hw=Math.round(w*0.55);
    A=axes(ctx,{l:46,t:16,w:hw-58,h:h-50,xr:[-1,3],yr:[-3,7.5],xl:'S',yl:'U'});
    polyl(ctx,A,[[0,-3],[0,7.5]],K.ink,1.2);
    if(env.checked)for(let s=-0.9;s<=2.95;s+=0.15){const t=T(s);curve(ctx,A,x=>U(s)+t*(x-s),-1,3,'rgba(217,72,15,.25)',1);}
    curve(ctx,A,U,-1,3,K.a,3.5);
    const t=T(S0),F=U(S0)-t*S0;curve(ctx,A,x=>U(S0)+t*(x-S0),-1,3,K.b,2.2);
    dot(ctx,A.X(S0),A.Y(U(S0)),8,'#fff',K.a);dot(ctx,A.X(0),A.Y(F),7,K.d);
    label(ctx,'F = U − TS',A.X(0)+10,A.Y(F)+(F>3?14:-12),K.d,'left','middle','700 12px Inter');
    label(ctx,'pendiente T',A.X(Math.min(2.6,S0+0.8)),A.Y(U(S0)+t*(Math.min(2.6,S0+0.8)-S0))+14,K.b,'center');
    polyl(ctx,A,[[S0,U(S0)],[S0,F+t*S0]],'rgba(0,0,0,0)',1);
    /* panel F(T) */
    const B=axes(ctx,{l:hw+40,t:16,w:w-hw-52,h:h-50,xr:[0,4],yr:[-8,2],xl:'T',yl:'F'});
    curve(ctx,B,Fof,0.02,4,K.d,3);dot(ctx,B.X(t),B.Y(F),7,'#fff',K.d);
    const s=S0;curve(ctx,B,x=>F-s*(x-t),Math.max(0.02,t-1.2),Math.min(4,t+1.2),K.r,2,[5,4]);
    label(ctx,'pendiente −S',B.X(Math.min(3.6,t+0.9)),B.Y(F-s*(Math.min(3.6,t+0.9)-t))-12,K.r,'center');
    rd.innerHTML=row('S',nf(S0,3))+row('U(S)',nf(U(S0),3))+row('T = dU/dS',nf(t,3))+row('F = U − TS',nf(F,3))+sep+
      row('dF/dT (numérico)',nf((Fof(t+1e-4)-Fof(t-1e-4))/2e-4,3))+row('−S',nf(-S0,3))+
      rowT('U es convexa en S (C<sub>V</sub> &gt; 0), así que cada pendiente T corresponde a un único punto y la transformada es invertible. F resulta cóncava en T.');
  }
  return {draw};
};

/* ---------- relaciones de Maxwell ---------- */
V.push(topic({id:'tme-maxwell',p:'ms08',
lead:R`Si un potencial es una función de estado, sus derivadas cruzadas son iguales (teorema de Schwarz). Esa observación trivial produce relaciones no triviales entre magnitudes que se miden de forma muy distinta: por ejemplo, cuánto cambia la entropía al expandir un gas se obtiene midiendo presiones y temperaturas.`,
res:[
[R`Origen.`,R`Si \(dF = -S\,dT - P\,dV\), entonces \(\dfrac{\partial^2F}{\partial V\partial T} = \dfrac{\partial^2F}{\partial T\partial V}\) implica \(\left(\dfrac{\partial S}{\partial V}\right)_T = \left(\dfrac{\partial P}{\partial T}\right)_V\). Cada potencial da una relación.`],
[R`Las cuatro relaciones.`,R`De \(U\): \((\partial T/\partial V)_S = -(\partial P/\partial S)_V\). De \(H\): \((\partial T/\partial P)_S = (\partial V/\partial S)_P\). De \(F\): \((\partial S/\partial V)_T = (\partial P/\partial T)_V\). De \(G\): \((\partial S/\partial P)_T = -(\partial V/\partial T)_P\).`],
[R`Cuadrado termodinámico.`,R`Regla mnemotécnica de Born: en los lados van los potenciales \(F, G, H, U\) y en las esquinas sus variables naturales. Las flechas diagonales dan los signos.`],
[R`Herramientas.`,R`Regla cíclica \(\left(\frac{\partial x}{\partial y}\right)_z\left(\frac{\partial y}{\partial z}\right)_x\left(\frac{\partial z}{\partial x}\right)_y = -1\), cadena y jacobianos \(\frac{\partial(u,v)}{\partial(x,y)}\). Con ellas toda derivada se reduce a tres medibles: \(c_P\), \(\alpha\) y \(\kappa_T\).`],
[R`\(C_P - C_V\).`,R`\(C_P - C_V = \dfrac{TV\alpha^2}{\kappa_T} \ge 0\), porque la estabilidad exige \(\kappa_T > 0\). Para el gas ideal da \(nR\); para sólidos y líquidos es pequeño pero no nulo.`],
[R`Ecuación de la energía.`,R`\(\left(\dfrac{\partial U}{\partial V}\right)_T = T\left(\dfrac{\partial P}{\partial T}\right)_V - P\). Para el gas ideal vale 0 (justifica \(U = U(T)\)); para van der Waals, \(an^2/V^2\).`],
[R`Efecto Joule-Thomson.`,R`Un gas que pasa por una válvula a presión menor conserva la entalpía. \(\mu_{JT} = \left(\dfrac{\partial T}{\partial P}\right)_H = \dfrac{V}{C_P}(T\alpha - 1)\). Si \(\mu_{JT} > 0\), el gas se enfría al expandirse: así se licúan el aire y el hidrógeno.`]],
lab:TABS([['sq','Cuadrado termodinámico',PANE('ms08-cv',[G('ms08-p','p',[['U','U'],['H','H'],['F','F'],['G','G']],2)],'ms08-read',
 R`Elige un potencial. Sus variables naturales son las dos esquinas adyacentes, y su diferencial se lee con las flechas diagonales: el coeficiente de cada término es la esquina opuesta, con signo + si la flecha apunta hacia el coeficiente y − si sale de él. La relación de Maxwell compara las dos derivadas cruzadas que forman las esquinas del lado opuesto.`)],
 ['jt','Joule-Thomson',PANE('ms08-jt',[G('ms08-g','g',[['n2','N₂'],['co2','CO₂'],['h2','H₂'],['he','He']]),S('ms08-t','T (K)',20,1000,5,300)],'ms08-jread',
 R`Coeficiente de Joule-Thomson de un gas de van der Waals a baja densidad: \(\mu_{JT}\approx\dfrac{1}{c_P}\left(\dfrac{2a}{RT}-b\right)\). Cambia de signo en la temperatura de inversión \(T_\text{inv} = 2a/Rb\). Debajo, la expansión enfría. El modelo de van der Waals sobreestima \(T_\text{inv}\) (valores reales: N₂ 621 K, H₂ 202 K, He 40 K).`)]]),
laws:[
['Desde F',R`\Big(\frac{\partial S}{\partial V}\Big)_T = \Big(\frac{\partial P}{\partial T}\Big)_V`,'La más usada: convierte un cambio de entropía en una medida mecánica.'],
['Desde G',R`\Big(\frac{\partial S}{\partial P}\Big)_T = -\Big(\frac{\partial V}{\partial T}\Big)_P = -V\alpha`],
['Desde U y H',[R`\Big(\frac{\partial T}{\partial V}\Big)_S = -\Big(\frac{\partial P}{\partial S}\Big)_V`,R`\Big(\frac{\partial T}{\partial P}\Big)_S = \Big(\frac{\partial V}{\partial S}\Big)_P`]],
['Capacidades',R`C_P - C_V = \frac{TV\alpha^2}{\kappa_T}`,R`También \(\dfrac{C_P}{C_V} = \dfrac{\kappa_T}{\kappa_S}\).`],
['Ecuación de la energía',R`\Big(\frac{\partial U}{\partial V}\Big)_T = T\Big(\frac{\partial P}{\partial T}\Big)_V - P`],
['Joule-Thomson',R`\mu_{JT} = \frac{V}{C_P}\,(T\alpha-1)`,'Gas ideal: Tα = 1 y μ<sub>JT</sub> = 0.']],
ej:[R`Calcula \(C_P - C_V\) para 1 mol de agua líquida a 20 °C: \(V = 18{,}05\) cm³, \(\alpha = 2{,}07\times10^{-4}\ \text{K}^{-1}\), \(\kappa_T = 4{,}59\times10^{-10}\ \text{Pa}^{-1}\).`,[
R`\(C_P - C_V = \dfrac{TV\alpha^2}{\kappa_T} = \dfrac{(293)(18{,}05\times10^{-6})(2{,}07\times10^{-4})^2}{4{,}59\times10^{-10}}\).`,
R`Numerador: \(293\times1{,}805\times10^{-5}\times4{,}28\times10^{-8} = 2{,}26\times10^{-10}\).`,
R`\(C_P - C_V \approx 0{,}49\) J/(mol·K), frente a \(C_P = 75{,}3\) J/(mol·K): menos del 1%.`,
R`Por eso en líquidos y sólidos se suele hablar de "el" calor específico. Cerca de 4 °C, donde \(\alpha = 0\), la diferencia se anula.`]],
ref:'Callen, cap. 7; Zemansky & Dittman, cap. 10–11; Reif, cap. 5'}));

LABS['tme-maxwell']=function(sec){
  const cv=$('#ms08-cv',sec),rd=$('#ms08-read',sec),jv=$('#ms08-jt',sec),jrd=$('#ms08-jread',sec);let pot='F',gas='n2';
  segm(sec,'ms08-p','p',v=>{pot=v;draw();});segm(sec,'ms08-g','g',v=>{gas=v;draw();});const gT=sl(sec,'ms08-t',v=>v+' K',()=>draw());
  /* esquinas: V (sup-izq), T (sup-der), P (inf-der), S (inf-izq); lados: F (sup), G (der), H (inf), U (izq) */
  const C={V:[0,0],T:[1,0],P:[1,1],S:[0,1]},SIDE={F:['V','T'],G:['T','P'],H:['P','S'],U:['S','V']};
  const DIFF={U:'dU = T dS − P dV',H:'dH = T dS + V dP',F:'dF = −S dT − P dV',G:'dG = −S dT + V dP'};
  const MAX={U:'(∂T/∂V)<sub>S</sub> = −(∂P/∂S)<sub>V</sub>',H:'(∂T/∂P)<sub>S</sub> = (∂V/∂S)<sub>P</sub>',F:'(∂S/∂V)<sub>T</sub> = (∂P/∂T)<sub>V</sub>',G:'(∂S/∂P)<sub>T</sub> = −(∂V/∂T)<sub>P</sub>'};
  const NAT={U:'S, V',H:'S, P',F:'T, V',G:'T, P'},CONJ={S:'T',T:'S',V:'P',P:'V'};
  function drawSq(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.8,440,300),L=Math.min(w,h)*0.55,x0=(w-L)/2,y0=(h-L)/2+6;
    const P=k=>[x0+C[k][0]*L,y0+C[k][1]*L];
    ctx.fillStyle='#f3f6fd';ctx.fillRect(x0,y0,L,L);ctx.strokeStyle=K.ax;ctx.lineWidth=2;ctx.strokeRect(x0,y0,L,L);
    const sh=(a,b,f)=>{const p=P(a),q=P(b),d=Math.hypot(q[0]-p[0],q[1]-p[1]);return [p[0]+(q[0]-p[0])*f/d,p[1]+(q[1]-p[1])*f/d];};arrow(ctx,...sh('S','T',24),...sh('T','S',24),K.ax,2.4);arrow(ctx,...sh('P','V',24),...sh('V','P',24),K.ax,2.4);
    const [a,b]=SIDE[pot],pa=P(a),pb=P(b);
    ctx.strokeStyle=K.b;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(...pa);ctx.lineTo(...pb);ctx.stroke();
    /* conjugadas resaltadas */
    [a,b].forEach(k=>{dot(ctx,...P(k),18,K.b);});[CONJ[a],CONJ[b]].forEach(k=>dot(ctx,...P(k),18,'#fff',K.a));
    Object.keys(C).forEach(k=>{const p=P(k);ctx.save();ctx.font='700 18px Inter';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=[a,b].includes(k)?'#fff':K.a;ctx.fillText(k,p[0],p[1]+1);ctx.restore();});
    Object.entries(SIDE).forEach(([s,[u,v]])=>{const p=P(u),q=P(v),m=[(p[0]+q[0])/2,(p[1]+q[1])/2],c=[x0+L/2,y0+L/2],d=[m[0]-c[0],m[1]-c[1]],n=Math.hypot(...d);
      label(ctx,s,m[0]+d[0]/n*30,m[1]+d[1]/n*30,s===pot?K.b:K.mut,'center','middle','700 20px Inter');});
    rd.innerHTML=row('potencial',pot)+row('variables naturales',NAT[pot])+row('diferencial',DIFF[pot])+sep+row('relación de Maxwell',MAX[pot])+
      rowT('Esquinas naranjas: variables naturales. Esquinas azules: sus conjugadas, que son los coeficientes del diferencial. El signo es + si la flecha diagonal apunta hacia el coeficiente y − si sale de él.');
  }
  const JG={n2:{n:'N₂',a:1.370,b:0.0387,cp:29.1},co2:{n:'CO₂',a:3.640,b:0.04267,cp:37.1},h2:{n:'H₂',a:0.2476,b:0.02661,cp:28.8},he:{n:'He',a:0.0346,b:0.0238,cp:20.8}};
  function drawJT(){
    if(!vis(jv))return;const {ctx,w,h}=fit(jv,.72,430,300),g=JG[gas],T=gT();
    const mu=t=>(2*g.a/(RL*t)-g.b)*100/g.cp,Ti=2*g.a/(RL*g.b);
    const A=axes(ctx,{l:52,t:16,w:w-68,h:h-50,xr:[0,1000],yr:[-0.4,1.6],xl:'T (K)',yl:'μ_JT (K/bar)'});
    fillPath(ctx,A,[[0,0],[Math.min(Ti,1000),0],[Math.min(Ti,1000),1.6],[0,1.6]],'rgba(36,83,201,.06)');
    polyl(ctx,A,[[0,0],[1000,0]],K.ink,1.3);
    Object.entries(JG).forEach(([k,q])=>curve(ctx,A,t=>(2*q.a/(RL*t)-q.b)*100/q.cp,10,1000,k===gas?K.b:'rgba(93,101,119,.3)',k===gas?3:1.5));
    if(Ti<1000){dot(ctx,A.X(Ti),A.Y(0),6,K.d);label(ctx,'T_inv = '+nf(Ti,0)+' K',A.X(Ti)+6,A.Y(0)+14,K.d);}
    dot(ctx,A.X(T),A.Y(clamp(mu(T),-0.4,1.6)),7,'#fff',K.b);
    label(ctx,'se enfría',A.X(20),A.Y(1.45),K.a);label(ctx,'se calienta',A.X(980),A.Y(-0.3),K.w,'right');
    const m=mu(T);
    jrd.innerHTML=row('gas',g.n)+row('a',nf(g.a,3)+' L²bar/mol²')+row('b',nf(g.b,4)+' L/mol')+row('c<sub>P</sub>',nf(g.cp,1)+' J/(mol·K)')+sep+
      row('μ<sub>JT</sub>('+T+' K)',nf(m,3)+' K/bar')+row('T<sub>inv</sub> = 2a/Rb',nf(Ti,0)+' K')+row('ΔT para una caída de 100 bar',nf(-100*m,1)+' K')+
      rowT(m>0?'μ &gt; 0: al bajar la presión, el gas se enfría (dominan las atracciones a).':'μ &lt; 0: el gas se calienta al expandirse (domina el volumen excluido b). Para licuarlo hay que preenfriarlo por debajo de T<sub>inv</sub>.');
  }
  function draw(){drawSq();drawJT();}
  return {draw};
};

/* ---------- equilibrio de fases ---------- */
V.push(topic({id:'tme-fases',p:'ms09',
lead:R`Dos fases de una sustancia coexisten cuando ninguna puede bajar su energía libre de Gibbs pasando materia a la otra. Esa condición, \(\mu_1 = \mu_2\), explica la curva de presión de vapor, la ecuación de Clausius-Clapeyron y cómo arreglar el lazo inestable de van der Waals.`,
res:[
[R`Condiciones de equilibrio.`,R`Entre dos fases que intercambian energía, volumen y partículas se igualan \(T\), \(P\) y \(\mu\). La curva de coexistencia en el plano \(P\)–\(T\) es \(\mu_1(T,P) = \mu_2(T,P)\).`],
[R`Gibbs-Duhem.`,R`\(d\mu = -s\,dT + v\,dP\), con \(s\) y \(v\) por partícula. Las intensivas de una fase no son independientes.`],
[R`Clausius-Clapeyron.`,R`A lo largo de la coexistencia, \(d\mu_1 = d\mu_2\) da \(\dfrac{dP}{dT} = \dfrac{s_2 - s_1}{v_2 - v_1} = \dfrac{L}{T\Delta v}\). Si el vapor es ideal y \(v_l\ll v_g\): \(\ln P = -\dfrac{L}{RT} + \text{cte}\).`],
[R`Regla de las fases.`,R`Con \(C\) componentes y \(\Phi\) fases, los grados de libertad son \(F = C - \Phi + 2\). Para el agua pura, el punto triple (\(\Phi = 3\)) es un punto aislado: 273,16 K y 611,7 Pa.`],
[R`Inestabilidad de van der Waals.`,R`Donde \((\partial P/\partial V)_T > 0\), la compresibilidad es negativa y el estado es inestable. El sistema se separa en líquido y vapor a una presión de saturación constante.`],
[R`Construcción de Maxwell.`,R`La presión de coexistencia hace iguales las dos áreas entre la isoterma y la recta horizontal, porque \(\mu_g - \mu_l = \int_l^g v\,dP = 0\) a lo largo de la isoterma. En el gráfico de \(\mu(P)\) aparece como el cruce de las ramas de la "cola de golondrina".`],
[R`Punto crítico y estados correspondientes.`,R`En \(T_c\), \((\partial P/\partial V)_T = (\partial^2P/\partial V^2)_T = 0\) y desaparece la diferencia entre líquido y gas. En variables reducidas \(p = P/P_c\), \(v = V/V_c\), \(t = T/T_c\), todas las sustancias de van der Waals cumplen \(\left(p + \frac{3}{v^2}\right)(3v-1) = 8t\).`]],
lab:PANE('ms09-cv',[S('ms09-t','t = T/T<sub>c</sub>',0.8,1.08,0.005,0.9),CHK('ms09-dome','Curva de coexistencia y espinodal',true)],'ms09-read',
 R`Izquierda: isoterma reducida de van der Waals con la construcción de Maxwell. Las dos áreas sombreadas son iguales. La línea violeta punteada es la espinodal (límite de estabilidad) y la curva sólida, la de coexistencia. Derecha: \(\mu(p) = \int v\,dp\) a lo largo de la misma isoterma. Las ramas estables (líquido y gas) se cruzan justo en \(p_\text{sat}\); la rama del medio es inestable.`),
laws:[
['Coexistencia',R`\mu_1(T,P) = \mu_2(T,P)`,'También T₁ = T₂ y P₁ = P₂.'],
['Clausius-Clapeyron',R`\frac{dP}{dT} = \frac{L}{T\,\Delta v}`,'L: calor latente por partícula o por mol (con Δv en las mismas unidades).'],
['Presión de vapor',R`P(T)\approx P_0\,e^{-L/RT}`,R`Vale si \(L\) es constante, \(v_l\ll v_g\) y el vapor es ideal.`],
['Regla de las fases',R`F = C - \Phi + 2`],
['Áreas iguales',R`\int_{v_l}^{v_g}\big[p(v) - p_\text{sat}\big]\,dv = 0`],
['Van der Waals reducido',R`\Big(p+\frac{3}{v^2}\Big)(3v-1) = 8t`,R`Válido para toda sustancia si se mide en unidades de \(P_c\), \(V_c\) y \(T_c\).`]],
ej:[R`El agua hierve a 100 °C a 1 atm, con \(L = 40{,}7\) kJ/mol. ¿A qué temperatura hierve en Cusco, donde la presión es 0,68 atm?`,[
R`Integrando Clausius-Clapeyron: \(\ln\dfrac{P_2}{P_1} = -\dfrac{L}{R}\left(\dfrac1{T_2}-\dfrac1{T_1}\right)\).`,
R`\(\dfrac1{T_2} = \dfrac1{373{,}15} - \dfrac{8{,}314}{40\,700}\ln0{,}68 = 2{,}680\times10^{-3} + 7{,}88\times10^{-5} = 2{,}759\times10^{-3}\ \text{K}^{-1}\).`,
R`\(T_2 = 362{,}5\) K \(\approx 89\) °C.`,
R`Por eso en la altura los alimentos tardan más en cocerse y se usan ollas a presión.`]],
ref:'Callen, cap. 9; Reif, cap. 8; Zemansky & Dittman, cap. 11'}));

LABS['tme-fases']=function(sec){
  const cv=$('#ms09-cv',sec),rd=$('#ms09-read',sec),dm=$('#ms09-dome',sec);dm.onchange=()=>draw();
  const gt=sl(sec,'ms09-t',v=>nf(v,3),()=>draw());
  const p=(v,t)=>8*t/(3*v-1)-3/(v*v),Ip=(v,t)=>8*t/3*Math.log(3*v-1)+3/v;
  function extrema(t){/* v donde dp/dv = 0: 4 t v³ = (3v−1)² */const f=v=>4*t*v*v*v-(3*v-1)**2,out=[];let a=0.34,fa=f(a);
    for(let v=0.345;v<6;v+=0.005){const fv=f(v);if((fv>0)!==(fa>0))out.push(bisect(f,v-0.005,v));fa=fv;a=v;}return out;}
  function roots(ps,t){const f=v=>p(v,t)-ps,out=[];let fa=f(0.34);for(let v=0.345;v<60;v+=v<3?0.002:0.05){const fv=f(v);if((fv>0)!==(fa>0))out.push(bisect(f,v-(v<3?0.002:0.05),v));fa=fv;}return out;}
  function maxwell(t){if(t>=1)return null;const ex=extrema(t);if(ex.length<2)return null;const pmin=Math.max(1e-4,p(ex[0],t)),pmax=p(ex[1],t);
    const area=ps=>{const r=roots(ps,t);if(r.length<3)return NaN;const [a,,c]=r;return Ip(c,t)-Ip(a,t)-ps*(c-a);};
    const ps=bisect(ps=>area(ps),pmin+(pmax-pmin)*0.002,pmax-(pmax-pmin)*0.002,50);const r=roots(ps,t);return {ps,vl:r[0],vm:r[1],vg:r[2],ex};}
  const DOME=[];for(let t=0.80;t<0.9995;t+=0.004){const m=maxwell(t);if(m)DOME.push([t,m]);}
  function draw(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.62,440,300),t=gt(),hw=Math.round(w*0.58);
    const A=axes(ctx,{l:44,t:16,w:hw-56,h:h-50,xr:[0.4,4],yr:[0,1.8],xl:'v = V/V_c',yl:'p = P/P_c'});
    if(dm.checked&&DOME.length){const L=DOME.map(([,m])=>[m.vl,m.ps]),G=DOME.map(([,m])=>[m.vg,m.ps]).reverse();polyl(ctx,A,[...L,[1,1],...G],K.ink,1.6);
      const sp=DOME.map(([t,m])=>[m.ex[0],p(m.ex[0],t)]),sp2=DOME.map(([t,m])=>[m.ex[1],p(m.ex[1],t)]).reverse();polyl(ctx,A,[...sp,[1,1],...sp2],K.d,1.6,[5,4]);}
    curve(ctx,A,v=>p(v,1),0.45,4,K.ax,1.4,[3,4]);
    const m=maxwell(t);
    if(m){const N=80,up=[],dn=[];
      for(let i=0;i<=N;i++){const v=m.vl+(m.vm-m.vl)*i/N;dn.push([v,p(v,t)]);}
      for(let i=0;i<=N;i++){const v=m.vm+(m.vg-m.vm)*i/N;up.push([v,p(v,t)]);}
      fillPath(ctx,A,[[m.vl,m.ps],...dn,[m.vm,m.ps]],'rgba(217,72,15,.25)');fillPath(ctx,A,[[m.vm,m.ps],...up,[m.vg,m.ps]],'rgba(36,83,201,.25)');
      curve(ctx,A,v=>p(v,t),0.45,4,K.ink,2,[2,3]);
      curve(ctx,A,v=>p(v,t),0.45,m.vl,K.ink,3.2);curve(ctx,A,v=>p(v,t),m.vg,4,K.ink,3.2);polyl(ctx,A,[[m.vl,m.ps],[m.vg,m.ps]],K.r,3.2);
      dot(ctx,A.X(m.vl),A.Y(m.ps),6,K.r);dot(ctx,A.X(m.vg),A.Y(m.ps),6,K.r);label(ctx,'líquido',A.X(m.vl)-4,A.Y(m.ps)+14,K.r,'right');label(ctx,'vapor',A.X(m.vg)+4,A.Y(m.ps)-12,K.r,'left');}
    else curve(ctx,A,v=>p(v,t),0.45,4,K.ink,3.2);
    dot(ctx,A.X(1),A.Y(1),5,K.d);
    /* μ(p) */
    const mu=v=>p(v,t)*v-Ip(v,t),pts=[];for(let v=0.42;v<8;v+=0.01){const pv=p(v,t);if(pv>0&&pv<1.8)pts.push([pv,mu(v)]);}
    const ys=pts.map(q=>q[1]),yl=[Math.min(...ys),Math.max(...ys)];
    const B=axes(ctx,{l:hw+44,t:16,w:w-hw-56,h:h-50,xr:[0,1.8],yr:[yl[0]-0.1*(yl[1]-yl[0]),yl[1]+0.1*(yl[1]-yl[0])],xl:'p',yl:'μ (reducido)',yf:()=>''});
    if(m){const seg=(a,b,col,lw,d)=>{const q=[];for(let v=a;v<=b;v+=0.002){q.push([p(v,t),mu(v)]);}polyl(ctx,B,q,col,lw,d);};
      seg(0.42,m.vl,K.b,3);seg(m.vl,m.ex[0],K.b,2,[4,4]);seg(m.ex[0],m.ex[1],K.d,2,[2,3]);seg(m.ex[1],m.vg,K.a,2,[4,4]);seg(m.vg,8,K.a,3);
      dot(ctx,B.X(m.ps),B.Y(mu(m.vl)),6,K.r);polyl(ctx,B,[[m.ps,B.o.yr[0]],[m.ps,B.o.yr[1]]],K.r,1.2,[4,4]);label(ctx,'p_sat',B.X(m.ps)+4,B.o.t+12,K.r);
      label(ctx,'líquido',B.X(Math.min(1.7,m.ps+0.35)),B.Y(mu(m.vl)+0.02)-14,K.b,'center');}
    else polyl(ctx,B,pts,K.ink,3);
    const area=m?(Ip(m.vm,t)-Ip(m.vl,t)-m.ps*(m.vm-m.vl)):0,area2=m?(Ip(m.vg,t)-Ip(m.vm,t)-m.ps*(m.vg-m.vm)):0;
    rd.innerHTML=row('t = T/T<sub>c</sub>',nf(t,3))+(m?row('p<sub>sat</sub>',nf(m.ps,4))+row('v<sub>líquido</sub>',nf(m.vl,3))+row('v<sub>vapor</sub>',nf(m.vg,3))+sep+
      row('área bajo la recta (naranja)',nf(-area,4))+row('área sobre la recta (azul)',nf(area2,4))+row('μ<sub>g</sub> − μ<sub>l</sub>',nf(mu(m.vg)-mu(m.vl),5))+
      rowT('Calor latente reducido: L ∝ T Δs = ∫ p dv − p<sub>sat</sub> Δv a lo largo de la isoterma. Al subir t, el tramo horizontal se acorta y desaparece en t = 1.')
      :rowT(t>=1?'Encima del punto crítico la isoterma es monótona: no hay coexistencia y μ(p) es una sola rama.':'Isoterma sin lazo resoluble.'));
  }
  return {draw};
};

/* ---------- entropía de Boltzmann ---------- */
V.push(topic({id:'tme-boltzmann',p:'ms10',
lead:R`Hasta aquí la entropía era una magnitud macroscópica definida por calores. Boltzmann le dio un significado microscópico: mide el número de configuraciones atómicas compatibles con lo que observamos. Con esa idea, la segunda ley pasa a ser una afirmación de probabilidad abrumadora.`,
res:[
[R`Microestados y macroestados.`,R`Un microestado especifica el estado de cada partícula; un macroestado, solo las variables macroscópicas (\(U, V, N\)). La multiplicidad \(\Omega(U,V,N)\) cuenta los microestados de un macroestado.`],
[R`Fórmula de Boltzmann.`,R`\(S = k_B\ln\Omega\). El logaritmo hace que la entropía sea aditiva: si dos sistemas son independientes, \(\Omega = \Omega_A\Omega_B\) y \(S = S_A + S_B\). Está grabada en la tumba de Boltzmann en Viena (como \(S = k\log W\)).`],
[R`Sólido de Einstein.`,R`\(N\) osciladores con niveles \(\varepsilon\,n\) y \(q\) cuantos en total. Repartir \(q\) cuantos entre \(N\) osciladores es contar "estrellas y barras": \(\Omega(N,q) = \dbinom{q+N-1}{q}\).`],
[R`Dos sistemas en contacto.`,R`Si A y B comparten \(q = q_A + q_B\) cuantos, el macroestado más probable maximiza \(\Omega_A\Omega_B\): \(\dfrac{\partial\ln\Omega_A}{\partial q_A} = \dfrac{\partial\ln\Omega_B}{\partial q_B}\). Esa igualdad define la temperatura: \(\dfrac1T = \dfrac{\partial S}{\partial U}\).`],
[R`Nitidez del máximo.`,R`El ancho relativo de la distribución de \(q_A\) escala como \(1/\sqrt N\). Para \(N\sim10^{23}\) las fluctuaciones son de una parte en \(10^{11}\): el sistema parece ir siempre al equilibrio, aunque solo es lo más probable.`],
[R`Aproximación de Stirling.`,R`\(\ln N!\approx N\ln N - N\). Con ella, para el sólido de Einstein grande, \(S/k_B = (q+N)\ln(q+N) - q\ln q - N\ln N\) y \(k_BT = \varepsilon/\ln(1+N/q)\). A alta temperatura se recupera \(U = Nk_BT\).`]],
lab:PANE('ms10-cv',[S('ms10-na','N<sub>A</sub>',5,300,1,60),S('ms10-nb','N<sub>B</sub>',5,300,1,40),S('ms10-q','q total',10,400,1,100),B('ms10-a','Todo en A',false),B('ms10-run','Pausa')],'ms10-read',
 R`Dos sólidos de Einstein intercambian cuantos de energía. Arriba: \(\Omega_A\Omega_B\) normalizada en función de \(q_A\) (distribución de probabilidad) y el histograma de los valores que visita la simulación. Abajo: \(q_A(t)\) en una dinámica en la que un cuanto salta al azar de un oscilador a otro. Empieza con "Todo en A": la energía fluye hasta el máximo de multiplicidad y luego fluctúa alrededor.`),
laws:[
['Boltzmann',R`S = k_B\ln\Omega`,R`\(k_B = 1{,}380\,649\times10^{-23}\) J/K.`],
['Sólido de Einstein',R`\Omega(N,q) = \binom{q+N-1}{q} = \frac{(q+N-1)!}{q!\,(N-1)!}`],
['Temperatura estadística',R`\frac{1}{T} = \Big(\frac{\partial S}{\partial U}\Big)_{V,N}`,'Se iguala entre sistemas en equilibrio térmico.'],
['Stirling',R`\ln N! \approx N\ln N - N + \tfrac12\ln(2\pi N)`],
['Einstein en el límite grande',R`k_BT = \frac{\varepsilon}{\ln(1+N/q)}`,R`Alta temperatura (\(q\gg N\)): \(U = q\varepsilon\approx Nk_BT\).`]],
ej:[R`Dos sólidos de Einstein tienen \(N_A = 300\) y \(N_B = 200\) osciladores y comparten \(q = 100\) cuantos. ¿Cuál es el reparto más probable? ¿Cuántas veces menos probable es encontrar todos los cuantos en B?`,[
R`El máximo de \(\Omega_A\Omega_B\) ocurre cuando las temperaturas se igualan: \(q_A/N_A = q_B/N_B\), es decir \(q_A = 60\), \(q_B = 40\).`,
R`\(\ln\Omega_A(60) = \ln\binom{359}{60} \approx 159{,}1\) y \(\ln\Omega_B(40) = \ln\binom{239}{40} \approx 105{,}3\); suma \(\approx 264{,}4\).`,
R`Todo en B: \(\ln\Omega_B(100) = \ln\binom{299}{100} \approx 187{,}5\) y \(\Omega_A(0) = 1\).`,
R`El cociente es \(e^{264{,}4-187{,}5} = e^{76{,}9}\approx 10^{33}\). Aun con solo 500 osciladores, el estado "fuera de equilibrio" es prácticamente imposible.`]],
ref:'Schroeder, <i>An Introduction to Thermal Physics</i>, cap. 2–3; Reif, cap. 3; Callen, cap. 15'}));

LABS['tme-boltzmann']=function(sec){
  const cv=$('#ms10-cv',sec),rd=$('#ms10-read',sec);let run=true,occ=null,hist=[],trace=[],stp=0,r=rng(11),key='';
  const gA=sl(sec,'ms10-na',null,init),gB=sl(sec,'ms10-nb',null,init),gq=sl(sec,'ms10-q',null,init);
  const rb=$('#ms10-run',sec);rb.onclick=()=>{run=!run;rb.textContent=run?'Pausa':'Seguir';};
  $('#ms10-a',sec).onclick=()=>{init(true);};
  function init(allA){const NA=gA(),NB=gB(),q=gq();occ=new Int32Array(NA+NB);
    if(allA===true){for(let i=0;i<q;i++)occ[Math.floor(r()*NA)]++;}else{for(let i=0;i<q;i++)occ[Math.floor(r()*(NA+NB))]++;}
    hist=new Float64Array(q+1);trace=[];stp=0;draw();}
  const qA=()=>{let s=0;for(let i=0;i<gA();i++)s+=occ[i];return s;};
  function step(n){const N=occ.length,NA=gA();for(let k=0;k<n;k++){let i;do{i=Math.floor(r()*N);}while(!occ[i]);const j=Math.floor(r()*N);occ[i]--;occ[j]++;}
    stp+=n;const a=qA();hist[a]++;trace.push(a);if(trace.length>600)trace.shift();}
  function draw(){
    if(!vis(cv))return;if(!occ)init(true);const {ctx,w,h}=fit(cv,.8,480,320),NA=gA(),NB=gB(),q=gq();
    const lw=qa=>lC(qa+NA-1,qa)+lC(q-qa+NB-1,q-qa);let mx=-1e9,arg=0;for(let a=0;a<=q;a++){const v=lw(a);if(v>mx){mx=v;arg=a;}}
    const prob=[];let Z=0;for(let a=0;a<=q;a++){const v=Math.exp(lw(a)-mx);prob.push(v);Z+=v;}
    const hh=(h-76)*0.58,tot=hist.reduce((x,y)=>x+y,0)||1,hmax=Math.max(...prob)/Z;
    const A=axes(ctx,{l:52,t:14,w:w-66,h:hh,xr:[0,q],yr:[0,hmax*1.25],xl:'q_A',yl:'P(q_A)',yf:v=>nf(v,3)});
    ctx.save();clipBox(ctx,A.o);const bw=Math.max(1,A.o.w/(q+1));ctx.fillStyle='rgba(230,119,0,.45)';for(let a=0;a<=q;a++){if(!hist[a])continue;const y=A.Y(hist[a]/tot);ctx.fillRect(A.X(a)-bw/2,y,bw,A.Y(0)-y);}ctx.restore();ctx.restore();
    polyl(ctx,A,prob.map((v,a)=>[a,v/Z]),K.a,2.6);
    const cur=qA();polyl(ctx,A,[[cur,0],[cur,hmax*1.2]],K.b,2,[4,3]);
    const B=axes(ctx,{l:52,t:hh+52,w:w-66,h:h-hh-80,xr:[0,600],yr:[0,q],xl:'tiempo (lotes de saltos)',yl:'q_A'});
    polyl(ctx,B,[[0,arg],[600,arg]],K.a,1.3,[5,4]);polyl(ctx,B,trace.map((v,i)=>[i,v]),K.b,2);
    const SA=lC(cur+NA-1,cur),SB=lC(q-cur+NB-1,q-cur),kT=(n,qq)=>qq>0?1/Math.log(1+n/qq):0;
    const mean=prob.reduce((s,v,a)=>s+a*v,0)/Z,sd=Math.sqrt(prob.reduce((s,v,a)=>s+(a-mean)**2*v,0)/Z);
    rd.innerHTML=row('q<sub>A</sub> actual',cur)+row('q<sub>A</sub> más probable',arg+' (≈ qN<sub>A</sub>/(N<sub>A</sub>+N<sub>B</sub>) = '+nf(q*NA/(NA+NB),1)+')')+row('ancho σ / ⟨q<sub>A</sub>⟩',nf(sd/Math.max(1,mean),3))+sep+
      row('S<sub>A</sub>/k = ln Ω<sub>A</sub>',nf(SA,2))+row('S<sub>B</sub>/k = ln Ω<sub>B</sub>',nf(SB,2))+row('S/k total',nf(SA+SB,2)+' (máx. '+nf(mx,2)+')')+sep+
      row('kT<sub>A</sub>/ε',nf(kT(NA,cur),3))+row('kT<sub>B</sub>/ε',nf(kT(NB,q-cur),3))+
      rowT('Mientras T<sub>A</sub> ≠ T<sub>B</sub>, la energía fluye en promedio hacia el sólido más frío. Aumenta N para ver cómo el pico se vuelve más estrecho.');
  }
  return {draw,tick(dt){if(!run||!vis(cv))return;if(!occ)init(true);for(let k=0;k<2;k++)step(Math.max(1,Math.round(occ.length/4)));draw();}};
};

/* ================= UNIDAD IV · BOLTZMANN ================= */
/* gas de discos duros en 2D (dinámica con paso fijo y choques elásticos) */
function DiskGas(N,seed){
  const r=rng(seed),R0=0.012,x=new Float64Array(N),y=new Float64Array(N),vx=new Float64Array(N),vy=new Float64Array(N);
  const g={N,x,y,vx,vy,R:R0,t:0,col:0};
  g.reset=(v0=1)=>{const n=Math.ceil(Math.sqrt(N));for(let i=0;i<N;i++){x[i]=(0.5+(i%n))/n;y[i]=(0.5+Math.floor(i/n))/n;const a=TAU*r();vx[i]=v0*Math.cos(a);vy[i]=v0*Math.sin(a);}g.t=0;g.col=0;};
  g.step=dt=>{for(let i=0;i<N;i++){x[i]+=vx[i]*dt;y[i]+=vy[i]*dt;
      if(x[i]<R0){x[i]=2*R0-x[i];vx[i]=Math.abs(vx[i]);}else if(x[i]>1-R0){x[i]=2*(1-R0)-x[i];vx[i]=-Math.abs(vx[i]);}
      if(y[i]<R0){y[i]=2*R0-y[i];vy[i]=Math.abs(vy[i]);}else if(y[i]>1-R0){y[i]=2*(1-R0)-y[i];vy[i]=-Math.abs(vy[i]);}}
    const d2=4*R0*R0*4.0;
    for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){const dx=x[j]-x[i];if(dx>2*R0*2||dx<-2*R0*2)continue;const dy=y[j]-y[i],rr=dx*dx+dy*dy;
      if(rr<d2&&rr>0){const dvx=vx[j]-vx[i],dvy=vy[j]-vy[i],dot_=dvx*dx+dvy*dy;if(dot_<0){const k=dot_/rr;vx[i]+=k*dx;vy[i]+=k*dy;vx[j]-=k*dx;vy[j]-=k*dy;g.col++;}}}
    g.t+=dt;};
  g.v2=()=>{let s=0;for(let i=0;i<N;i++)s+=vx[i]*vx[i]+vy[i]*vy[i];return s/N;};
  g.H=()=>{/* H = Σ f ln f en una rejilla de velocidades */const M=12,L=3,c=new Float64Array(M*M);let n=0;
    for(let i=0;i<N;i++){const a=Math.floor((vx[i]+L)/(2*L)*M),b=Math.floor((vy[i]+L)/(2*L)*M);if(a>=0&&a<M&&b>=0&&b<M){c[a*M+b]++;n++;}}
    const dA=(2*L/M)**2;let H=0;for(const k of c)if(k){const f=k/n/dA;H+=f*Math.log(f)*dA;}return H;};
  g.reset();return g;}

V.push(topic({id:'tme-cinetica',p:'ms11',
lead:R`La teoría cinética fue el primer puente entre la mecánica de las moléculas y la termodinámica. Bernoulli explicó la presión como choques contra las paredes; Maxwell (1860) dedujo la distribución de velocidades con un argumento de simetría, y Boltzmann la generalizó a cualquier energía.`,
res:[
[R`Presión cinética.`,R`Cada choque contra una pared transfiere \(2mv_x\). Sumando sobre las moléculas: \(PV = Nm\langle v_x^2\rangle = \tfrac13Nm\langle v^2\rangle\). Comparado con \(PV = Nk_BT\): \(\tfrac12m\langle v^2\rangle = \tfrac32k_BT\). La temperatura mide la energía cinética media de traslación.`],
[R`Equipartición.`,R`En equilibrio clásico, cada término cuadrático de la energía (\(\tfrac12mv_x^2\), \(\tfrac12kx^2\), \(\tfrac12I\omega^2\)) aporta \(\tfrac12k_BT\) en promedio. Gas monoatómico: \(U = \tfrac32Nk_BT\); diatómico: \(\tfrac52Nk_BT\).`],
[R`Argumento de Maxwell.`,R`Si las tres componentes son independientes y la distribución solo depende de \(|\vec v|\), entonces \(\phi(v_x)\phi(v_y)\phi(v_z) = F(v_x^2+v_y^2+v_z^2)\). La única solución es una gaussiana: \(\phi(v_x)\propto e^{-mv_x^2/2k_BT}\).`],
[R`Distribución de rapideces.`,R`En 3D, el volumen de la cáscara \(4\pi v^2dv\) da \(f(v) = 4\pi\left(\dfrac{m}{2\pi k_BT}\right)^{3/2}v^2e^{-mv^2/2k_BT}\). En 2D (la simulación) es \(f(v) = \dfrac{mv}{k_BT}e^{-mv^2/2k_BT}\).`],
[R`Velocidades características.`,R`Más probable \(v_p = \sqrt{2k_BT/m}\), media \(\bar v = \sqrt{8k_BT/\pi m}\), cuadrática media \(v_\text{rms} = \sqrt{3k_BT/m}\). Para N₂ a 300 K: 422, 476 y 517 m/s.`],
[R`Camino libre medio.`,R`Una molécula de diámetro \(d\) choca con las que están en un cilindro de sección \(\pi d^2\): \(\ell = \dfrac{1}{\sqrt2\,\pi d^2 n}\). En aire a 1 atm, \(\ell\approx 70\) nm, unas 200 veces el tamaño molecular.`],
[R`El factor de Boltzmann.`,R`Boltzmann extendió el resultado a cualquier energía, incluida la potencial: la densidad en el espacio de fases es \(\propto e^{-E/k_BT}\). La atmósfera isoterma, \(n(z) = n_0e^{-mgz/k_BT}\), es un ejemplo.`]],
lab:PANE('ms11-cv',[G('ms11-h','h',[['v','Rapidez |v|'],['x','Componente vₓ']]),B('ms11-rst','Reiniciar (todas con la misma rapidez)'),B('ms11-run','Pausa')],'ms11-read',
 R`Gas de 160 discos duros en una caja. Todos empiezan con la <i>misma</i> rapidez y direcciones al azar: la distribución inicial es una delta. Los choques elásticos conservan la energía total, y en pocos tiempos de colisión el histograma converge a la distribución de Maxwell-Boltzmann en 2D (curva roja), con \(k_BT/m = \langle v^2\rangle/2\). Los discos más rápidos se pintan de rojo. El histograma es un promedio móvil de los últimos instantes.`),
laws:[
['Presión cinética',R`PV = \tfrac13Nm\langle v^2\rangle`,R`Junto con el gas ideal: \(\tfrac12m\langle v^2\rangle = \tfrac32k_BT\).`],
['Maxwell (3D)',R`f(v) = 4\pi\Big(\frac{m}{2\pi k_BT}\Big)^{3/2}v^2e^{-mv^2/2k_BT}`],
['Componente',R`\phi(v_x) = \sqrt{\frac{m}{2\pi k_BT}}\;e^{-mv_x^2/2k_BT}`,R`Gaussiana con varianza \(k_BT/m\).`],
['Velocidades',R`v_p = \sqrt{\tfrac{2k_BT}{m}},\quad \bar v = \sqrt{\tfrac{8k_BT}{\pi m}},\quad v_\text{rms} = \sqrt{\tfrac{3k_BT}{m}}`],
['Equipartición',R`\langle\varepsilon\rangle = \tfrac{f}{2}k_BT`,'f: número de términos cuadráticos en la energía.'],
['Camino libre medio',R`\ell = \frac{1}{\sqrt2\,\pi d^2n}`]],
ej:[R`¿Qué fracción de las moléculas de N₂ a 300 K tiene rapidez mayor que la velocidad de escape terrestre (11,2 km/s)? ¿Y para H₂ en la alta atmósfera a 1000 K?`,[
R`Para \(v\gg v_p\), \(\int_v^\infty f\,dv\approx \dfrac{2}{\sqrt\pi}\,u\,e^{-u^2}\) con \(u = v/v_p\).`,
R`N₂, 300 K: \(v_p = 422\) m/s, \(u = 26{,}5\), fracción \(\sim 30\,e^{-703}\approx10^{-304}\): nula.`,
R`H₂, 1000 K: \(v_p = \sqrt{2k_BT/m} = 2{,}87\) km/s, \(u = 3{,}9\), fracción \(\approx 4{,}4\,e^{-15{,}2}\approx 10^{-6}\).`,
R`Una fracción de \(10^{-6}\) que se renueva continuamente basta para que la Tierra pierda su hidrógeno en tiempos geológicos, mientras retiene el nitrógeno.`]],
ref:'Reif, cap. 7; Schroeder, cap. 6; Blundell & Blundell, cap. 5–8'}));

LABS['tme-cinetica']=function(sec){
  const cv=$('#ms11-cv',sec),rd=$('#ms11-read',sec);const g=DiskGas(160,5);let run=true,mode='v',acc=null;const sm=(c)=>{if(!acc||acc.length!==c.length)acc=Float64Array.from(c);else for(let k=0;k<c.length;k++)acc[k]=0.85*acc[k]+0.15*c[k];return acc;};
  segm(sec,'ms11-h','h',v=>{mode=v;acc=null;draw();});$('#ms11-rst',sec).onclick=()=>{g.reset();acc=null;draw();};
  const rb=$('#ms11-run',sec);rb.onclick=()=>{run=!run;rb.textContent=run?'Pausa':'Seguir';};
  function draw(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.55,400,280),bw=Math.min(h-20,w*0.45),x0=10,y0=10;
    ctx.fillStyle='#faf8f3';ctx.fillRect(x0,y0,bw,bw);ctx.strokeStyle=K.ink;ctx.lineWidth=2;ctx.strokeRect(x0,y0,bw,bw);
    const v2=g.v2();
    for(let i=0;i<g.N;i++){const s=Math.hypot(g.vx[i],g.vy[i])/Math.sqrt(v2),u=clamp(s/2.2,0,1);
      dot(ctx,x0+g.x[i]*bw,y0+(1-g.y[i])*bw,Math.max(2,g.R*bw),`rgb(${Math.round(36+190*u)},${Math.round(83-10*u)},${Math.round(201-180*u)})`);}
    const kT=v2/2,M=24;let A;
    if(mode==='v'){const vm=3.2*Math.sqrt(v2/2)*1.0,dv=vm/M,c=new Float64Array(M);for(let i=0;i<g.N;i++){const s=Math.hypot(g.vx[i],g.vy[i]);const k=Math.floor(s/dv);if(k<M)c[k]++;}const cc=g.t<0.02?c:sm(c);
      A=axes(ctx,{l:x0+bw+44,t:14,w:w-x0-bw-58,h:h-48,xr:[0,vm],yr:[0,1.6/Math.sqrt(kT)*0.75],xl:'|v|',yl:'f(v)',xf:v=>nf(v,1),yf:()=>''});
      ctx.fillStyle='rgba(36,83,201,.35)';for(let k=0;k<M;k++){const hgt=cc[k]/g.N/dv;const X=A.X(k*dv),Y=A.Y(Math.min(hgt,A.o.yr[1]));ctx.fillRect(X,Y,A.X((k+1)*dv)-X-1,A.Y(0)-Y);}
      curve(ctx,A,v=>v/kT*Math.exp(-v*v/(2*kT)),0,vm,K.w,3);
      const v0=Math.sqrt(v2);polyl(ctx,A,[[v0,0],[v0,A.o.yr[1]]],K.mut,1.2,[4,4]);label(ctx,'v_rms',A.X(v0)+4,A.o.t+10,K.mut);}
    else{const vm=3.2*Math.sqrt(kT),dv=2*vm/M,c=new Float64Array(M);for(let i=0;i<g.N;i++){const k=Math.floor((g.vx[i]+vm)/dv);if(k>=0&&k<M)c[k]++;}const cc=g.t<0.02?c:sm(c);
      A=axes(ctx,{l:x0+bw+44,t:14,w:w-x0-bw-58,h:h-48,xr:[-vm,vm],yr:[0,0.75/Math.sqrt(kT)],xl:'vₓ',yl:'φ(vₓ)',xf:v=>nf(v,1),yf:()=>''});
      ctx.fillStyle='rgba(36,83,201,.35)';for(let k=0;k<M;k++){const hgt=cc[k]/g.N/dv;const X=A.X(-vm+k*dv),Y=A.Y(Math.min(hgt,A.o.yr[1]));ctx.fillRect(X,Y,A.X(-vm+(k+1)*dv)-X-1,A.Y(0)-Y);}
      curve(ctx,A,v=>Math.exp(-v*v/(2*kT))/Math.sqrt(TAU*kT),-vm,vm,K.w,3);}
    let mx=0;for(let i=0;i<g.N;i++)mx=Math.max(mx,Math.hypot(g.vx[i],g.vy[i]));
    rd.innerHTML=row('tiempo',nf(g.t,2))+row('choques',g.col)+row('choques por partícula',nf(2*g.col/g.N,1))+sep+
      row('⟨v²⟩ (se conserva)',nf(v2,4))+row('k<sub>B</sub>T/m = ⟨v²⟩/2',nf(kT,4))+row('v<sub>p</sub> = √(k<sub>B</sub>T/m) (2D)',nf(Math.sqrt(kT),3))+row('rapidez máxima / v<sub>rms</sub>',nf(mx/Math.sqrt(v2),2))+
      sep+row('H = ∫ f ln f d²v',nf(g.H(),3))+rowT('H solo puede bajar en promedio (teorema H): la distribución inicial, una delta en la rapidez, tiene H grande.');
  }
  return {draw,tick(dt){if(!run||!vis(cv))return;for(let k=0;k<4;k++)g.step(0.0025);draw();}};
};

/* ---------- teorema H ---------- */
V.push(topic({id:'tme-teorema-h',p:'ms12',
lead:R`¿Por qué un gas evoluciona hacia la distribución de Maxwell y nunca al revés, si las leyes de Newton son reversibles? Boltzmann (1872) escribió una ecuación para la distribución de velocidades y demostró que una cierta cantidad \(H\) nunca crece. La discusión sobre ese resultado aclaró qué significa la flecha del tiempo.`,
res:[
[R`Ecuación de Boltzmann.`,R`Describe la evolución de \(f(\vec r,\vec v,t)\): \(\dfrac{\partial f}{\partial t} + \vec v\cdot\nabla_{\vec r}f + \dfrac{\vec F}{m}\cdot\nabla_{\vec v}f = \left(\dfrac{\partial f}{\partial t}\right)_\text{col}\). El término de colisiones cuenta pares que entran y salen de cada celda de velocidad.`],
[R`Caos molecular (Stosszahlansatz).`,R`Boltzmann supuso que las velocidades de dos moléculas que <i>van a chocar</i> no están correlacionadas: la probabilidad del par es \(f(\vec v_1)f(\vec v_2)\). Es aquí, y no en la mecánica, donde entra la asimetría temporal.`],
[R`Teorema H.`,R`Con \(H(t) = \int f\ln f\,d^3v\), la ecuación de Boltzmann implica \(\dfrac{dH}{dt}\le0\), con igualdad solo para la distribución de Maxwell. Para un gas ideal, \(S = -k_BH\cdot V + \text{cte}\): el teorema H es la segunda ley.`],
[R`Paradoja de Loschmidt (1876).`,R`Si se invierten todas las velocidades en un instante, la mecánica obliga al sistema a deshacer su evolución y \(H\) crecería. Respuesta: esos estados invertidos existen, pero son una fracción ínfima, y además tienen correlaciones sutiles que violan el caos molecular.`],
[R`Paradoja de Zermelo (1896).`,R`El teorema de recurrencia de Poincaré asegura que un sistema finito vuelve arbitrariamente cerca de su estado inicial. Respuesta de Boltzmann: el tiempo de recurrencia crece como \(e^N\), mucho más que la edad del universo para \(N\sim10^{23}\).`],
[R`El anillo de Kac.`,R`Modelo determinista y reversible en el que se ve todo: \(N\) bolas en un anillo avanzan un sitio por paso y cambian de color al cruzar un marcador. La hipótesis de caos molecular predice \(\Delta(t) = (1-2\mu)^t\Delta_0\). La evolución exacta sigue esa curva, se invierte si se invierte el movimiento y vuelve al estado inicial a los \(2N\) pasos.`]],
lab:TABS([['kac','Anillo de Kac',PANE('ms12-cv',[S('ms12-mu','fracción de marcadores μ',0.02,0.3,0.01,0.1),B('ms12-run','Pausa'),B('ms12-rev','Invertir el tiempo'),B('ms12-rst','Reiniciar')],'ms12-read',
 R`400 sitios en un anillo (la banda), todas las bolas blancas al empezar; los marcadores son las rayas rojas exteriores. En cada paso cada bola avanza un sitio (sentido horario) y cambia de color si cruza un marcador rojo. Abajo: \(\Delta = (N_\text{blancas} - N_\text{negras})/N\) frente a la predicción con caos molecular (gris). "Invertir el tiempo" cambia el sentido de giro: el sistema deshace su evolución, como en la objeción de Loschmidt. Déjalo correr 800 pasos para ver la recurrencia de Zermelo.`)],
 ['gas','H(t) en un gas',PANE('ms12-gv',[B('ms12-grst','Reiniciar'),B('ms12-grev','Invertir velocidades')],'ms12-gread',
 R`El gas de discos duros del tema anterior, con \(H = \int f\ln f\,d^2v\) calculado sobre una rejilla de velocidades. Parte de rapideces iguales y \(H\) baja hasta fluctuar alrededor del valor de Maxwell. Si inviertes las velocidades al principio, \(H\) sube durante un tiempo corto (la simulación numérica no es exactamente reversible y el caos amplifica los errores de redondeo) y luego vuelve a bajar.`)]]),
laws:[
['Ecuación de Boltzmann',R`\frac{\partial f}{\partial t}+\vec v\cdot\nabla_{\vec r}f+\frac{\vec F}{m}\cdot\nabla_{\vec v}f = \Big(\frac{\partial f}{\partial t}\Big)_\text{col}`],
['Teorema H',R`H = \int f\ln f\,d^3v,\qquad \frac{dH}{dt}\le0`,'La igualdad se alcanza solo para la distribución de Maxwell-Boltzmann.'],
['Balance detallado',R`f(\vec v_1')f(\vec v_2') = f(\vec v_1)f(\vec v_2)`,R`Implica que \(\ln f\) es suma de invariantes de colisión: \(\ln f = a + \vec b\cdot\vec v - \beta\tfrac12mv^2\).`],
['Kac con caos molecular',R`\Delta(t) = (1-2\mu)^t\,\Delta(0)`,'Exacta en promedio sobre configuraciones de marcadores, no para una configuración dada.'],
['Tiempo de recurrencia',R`t_\text{rec}\sim\tau\,e^{cN}`,R`Para el anillo de Kac es exactamente \(2N\) pasos; en un gas real, astronómico.`]],
ej:[R`En el anillo de Kac con \(N = 400\) y \(\mu = 0{,}1\), ¿cuántos pasos tarda \(\Delta\) en bajar de 1 a 0,01 según la hipótesis de caos molecular? Compáralo con el tiempo de recurrencia.`,[
R`\(\Delta(t) = (0{,}8)^t\). Pedimos \(0{,}8^t = 0{,}01\): \(t = \ln0{,}01/\ln0{,}8 = 20{,}6\) pasos.`,
R`El tiempo de recurrencia es \(2N = 800\) pasos: 40 veces mayor.`,
R`Si el número de marcadores es par, el anillo vuelve al estado inicial ya a los \(N = 400\) pasos.`,
R`Con \(N = 10^{23}\), el decaimiento sigue durando unos 20 pasos, pero la recurrencia tarda \(10^{23}\) pasos: la irreversibilidad práctica viene de la separación entre esas dos escalas.`]],
ref:'Huang, <i>Statistical Mechanics</i>, cap. 3–4; Kac, <i>Probability and Related Topics</i> (1959); Reif, cap. 14'}));

LABS['tme-teorema-h']=function(sec){
  const cv=$('#ms12-cv',sec),rd=$('#ms12-read',sec),gv=$('#ms12-gv',sec),grd=$('#ms12-gread',sec);
  const N=400;let mark=new Uint8Array(N),ball=new Int8Array(N),t=0,dir=1,run=true,hist=[],acc=0,r=rng(3),TT_=[0];
  const gm=sl(sec,'ms12-mu',v=>nf(v,2),()=>reset());
  function reset(){r=rng(3);const m=gm();for(let i=0;i<N;i++)mark[i]=r()<m?1:0;ball.fill(1);t=0;dir=1;hist=[[0,1]];TT_=[0];draw();}
  $('#ms12-rst',sec).onclick=reset;const rb=$('#ms12-run',sec);rb.onclick=()=>{run=!run;rb.textContent=run?'Pausa':'Seguir';};
  $('#ms12-rev',sec).onclick=()=>{dir=-dir;};
  function step(){const nb=new Int8Array(N);if(dir>0){for(let i=0;i<N;i++){const j=(i+1)%N;nb[j]=mark[i]?-ball[i]:ball[i];}}else{for(let j=0;j<N;j++){const i=(j-1+N)%N;nb[i]=mark[i]?-ball[j]:ball[j];}}
    ball=nb;t+=dir;let s=0;for(let i=0;i<N;i++)s+=ball[i];hist.push([hist.length,s/N]);TT_.push(t);}
  function drawKac(){
    if(!vis(cv))return;if(!hist.length)reset();const {ctx,w,h}=fit(cv,.95,560,360),cx=w/2,R1=Math.min(w,h*0.55)*0.42,cy=R1+20;
    ctx.strokeStyle=K.line;ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,R1,0,TAU);ctx.stroke();
    for(let i=0;i<N;i++){const a=-Math.PI/2+TAU*i/N,a2=-Math.PI/2+TAU*(i+0.5)/N;
      const a0=a-Math.PI/N,a1=a+Math.PI/N;ctx.beginPath();ctx.arc(cx,cy,R1+5,a0,a1);ctx.arc(cx,cy,R1-5,a1,a0,true);ctx.closePath();ctx.fillStyle=ball[i]>0?'#e6ecfb':K.ink;ctx.fill();}
    ctx.strokeStyle=K.ax;ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,R1+5,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(cx,cy,R1-5,0,TAU);ctx.stroke();
    for(let i=0;i<N;i++)if(mark[i]){const a2=-Math.PI/2+TAU*(i+0.5)/N;ctx.strokeStyle=K.w;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx+(R1+7)*Math.cos(a2),cy+(R1+7)*Math.sin(a2));ctx.lineTo(cx+(R1+15)*Math.cos(a2),cy+(R1+15)*Math.sin(a2));ctx.stroke();}
    label(ctx,dir>0?'↻ adelante':'↺ invertido',cx,cy-8,dir>0?K.a:K.b,'center','middle','700 14px Inter');label(ctx,'paso '+t,cx,cy+14,K.mut,'center');
    const tm=Math.max(100,hist.length);const A=axes(ctx,{l:46,t:2*R1+44,w:w-60,h:h-2*R1-74,xr:[0,tm],yr:[-1,1],xl:'pasos',yl:'Δ'});
    const m=mark.reduce((a,b)=>a+b,0)/N;
    polyl(ctx,A,[[0,0],[tm,0]],K.ax,1);
    const pt=hist.map(([k],i)=>[k,Math.pow(1-2*m,Math.abs(TT_[i]||0))]);
    polyl(ctx,A,pt,K.ax,2.2,[5,4]);polyl(ctx,A,hist,K.a,2.4);
    const D=hist[hist.length-1][1],pw=(1+D)/2,S=pw>0&&pw<1?-(pw*Math.log(pw)+(1-pw)*Math.log(1-pw)):0;
    rd.innerHTML=row('paso t',t)+row('marcadores',Math.round(m*N)+' ('+nf(m,3)+')')+row('Δ = (N<sub>b</sub> − N<sub>n</sub>)/N',nf(D,3))+row('predicción (1 − 2μ)<sup>|t|</sup>',nf(Math.pow(1-2*m,Math.abs(t)),3))+
      row('S/Nk = −Σ p ln p',nf(S,3)+' (máx. ln 2 = 0,693)')+sep+rowT(hist.length>1&&t!==0&&t%(2*N)===0||t===0&&hist.length>1&&D>0.999?'¡Recurrencia! El anillo volvió exactamente al estado inicial.':dir<0?'Movimiento invertido: Δ vuelve a crecer, en contra de la predicción de caos molecular.':Math.abs(t)>40?'Δ fluctúa cerca de 0 con amplitud ~1/√N: el "equilibrio".':'Δ decae casi exactamente como predice la hipótesis de caos molecular.');
  }
  /* gas */
  const g=DiskGas(160,9);let Hh=[],gt0=0;
  function gReset(){g.reset();Hh=[[0,g.H()]];drawGas();}
  $('#ms12-grst',sec).onclick=gReset;$('#ms12-grev',sec).onclick=()=>{for(let i=0;i<g.N;i++){g.vx[i]*=-1;g.vy[i]*=-1;}};
  function drawGas(){
    if(!vis(gv))return;if(!Hh.length)Hh=[[0,g.H()]];const {ctx,w,h}=fit(gv,.6,420,280),bw=Math.min(h-20,w*0.4),x0=10,y0=10;
    ctx.fillStyle='#faf8f3';ctx.fillRect(x0,y0,bw,bw);ctx.strokeStyle=K.ink;ctx.lineWidth=2;ctx.strokeRect(x0,y0,bw,bw);
    const v2=g.v2();for(let i=0;i<g.N;i++){const u=clamp(Math.hypot(g.vx[i],g.vy[i])/Math.sqrt(v2)/2.2,0,1);dot(ctx,x0+g.x[i]*bw,y0+(1-g.y[i])*bw,Math.max(2,g.R*bw),`rgb(${Math.round(36+190*u)},${Math.round(83-10*u)},${Math.round(201-180*u)})`);}
    const kT=v2/2,Heq=-Math.log(TAU*kT)-1;
    const tm=Math.max(1,Hh[Hh.length-1][0]);const ys=Hh.map(q=>q[1]),lo=Math.min(Heq-0.3,...ys),hi=Math.max(...ys,Heq)+0.3;
    const A=axes(ctx,{l:x0+bw+46,t:14,w:w-x0-bw-60,h:h-48,xr:[0,tm],yr:[lo,hi],xl:'t',yl:'H(t)'});
    polyl(ctx,A,[[0,Heq],[tm,Heq]],K.w,1.5,[5,4]);label(ctx,'Maxwell',A.X(tm)-4,A.Y(Heq)-9,K.w,'right');polyl(ctx,A,Hh,K.a,2.5);
    grd.innerHTML=row('t',nf(g.t,2))+row('H(t)',nf(Hh[Hh.length-1][1],3))+row('H de Maxwell = −ln(2πk<sub>B</sub>T/m) − 1',nf(Heq,3))+
      rowT('El valor medido queda un poco por encima del teórico por el tamaño finito de la rejilla y de la muestra.');
  }
  function draw(){drawKac();drawGas();}
  return {draw,tick(dt){
    if(vis(cv)&&run){if(hist.length>1600){run=false;rb.textContent="Seguir";}acc+=dt*25;let k=0;while(acc>=1&&k<5){acc--;k++;step();if(Math.abs(t)>=2*N){/* recurrencia */}}drawKac();}
    if(vis(gv)){for(let k=0;k<4;k++)g.step(0.0025);Hh.push([g.t,g.H()]);if(Hh.length>1500)Hh.shift();drawGas();}}};
};

/* ---------- espacio de fases ---------- */
V.push(topic({id:'tme-espacio-fases',p:'ms13',
lead:R`La mecánica estadística no sigue a cada molécula: trabaja con un conjunto (ensemble) de copias del sistema distribuidas en el espacio de fases. El teorema de Liouville dice cómo evoluciona esa nube de puntos y justifica el postulado central de la teoría: todos los microestados accesibles son igualmente probables.`,
res:[
[R`Espacio de fases.`,R`Para \(N\) partículas en 3D, el microestado es un punto \((q_1,\dots,q_{3N},p_1,\dots,p_{3N})\) en un espacio de \(6N\) dimensiones. Su movimiento lo dictan las ecuaciones de Hamilton \(\dot q_i = \partial H/\partial p_i\), \(\dot p_i = -\partial H/\partial q_i\). Dos trayectorias nunca se cruzan.`],
[R`Ensemble y densidad.`,R`Un conjunto de muchas copias con el mismo macroestado se describe con una densidad \(\rho(q,p,t)\). Los promedios macroscópicos son \(\langle A\rangle = \int A\,\rho\,d\Gamma\).`],
[R`Teorema de Liouville.`,R`El flujo hamiltoniano es incompresible: \(\nabla\cdot(\dot q,\dot p) = \sum_i\left(\dfrac{\partial^2H}{\partial q_i\partial p_i} - \dfrac{\partial^2H}{\partial p_i\partial q_i}\right) = 0\). Por eso \(\dfrac{d\rho}{dt} = \dfrac{\partial\rho}{\partial t} + \{\rho,H\} = 0\) y el volumen de cualquier región se conserva.`],
[R`Equilibrio.`,R`Una densidad estacionaria cumple \(\{\rho,H\} = 0\). Cualquier \(\rho = \rho(H)\) lo cumple. El caso más simple, \(\rho\) constante sobre la superficie \(H = E\), es el conjunto microcanónico.`],
[R`Postulado de igual probabilidad a priori.`,R`En un sistema aislado en equilibrio, todos los microestados accesibles con la misma energía son igualmente probables. Liouville lo hace consistente (la densidad uniforme no cambia), pero no lo demuestra.`],
[R`Hipótesis ergódica y mezcla.`,R`Boltzmann supuso que una trayectoria recorre toda la superficie de energía, de modo que el promedio temporal coincide con el promedio sobre el ensemble. Un sistema "mezclador" deforma cualquier región inicial en filamentos que acaban cubriendo la superficie: el volumen se conserva, pero la región ya no se distingue a escala gruesa.`]],
lab:PANE('ms13-cv',[G('ms13-s','s',[['osc','Oscilador armónico'],['pen','Péndulo'],['dmp','Oscilador amortiguado']],1),B('ms13-run','Pausa'),B('ms13-rst','Reiniciar')],'ms13-read',
 R`Un conjunto de 2500 sistemas idénticos con condiciones iniciales dentro de un cuadrado del espacio de fases \((q,p)\). En el oscilador armónico la región solo gira. En el péndulo, los puntos con más energía tardan más en dar la vuelta (el período depende de la amplitud) y la región se estira en un filamento: el área se conserva, pero se "mezcla". En el oscilador amortiguado el sistema no es hamiltoniano y el área se contrae.`),
laws:[
['Ecuaciones de Hamilton',R`\dot q_i = \frac{\partial H}{\partial p_i},\qquad \dot p_i = -\frac{\partial H}{\partial q_i}`],
['Liouville',R`\frac{d\rho}{dt} = \frac{\partial\rho}{\partial t}+\{\rho,H\} = 0`,'La densidad es constante a lo largo de cada trayectoria.'],
['Incompresibilidad',R`\nabla\cdot\vec v_\Gamma = \sum_i\Big(\frac{\partial\dot q_i}{\partial q_i}+\frac{\partial\dot p_i}{\partial p_i}\Big)=0`],
['Microcanónico',R`\rho(q,p) = \frac{\delta\big(H(q,p)-E\big)}{\Omega(E)}`],
['Promedio ergódico',R`\lim_{T\to\infty}\frac1T\int_0^TA\big(q(t),p(t)\big)dt = \langle A\rangle_\text{ensemble}`],
['Amortiguado',R`\dot p = -kq-\gamma p\;\Rightarrow\;\text{Área}(t) = \text{Área}(0)\,e^{-\gamma t/m}`,'La disipación rompe Liouville.']],
ej:[R`Para un oscilador armónico \(H = \dfrac{p^2}{2m} + \dfrac12m\omega^2q^2\), calcula el volumen del espacio de fases con energía menor que \(E\) y el número de estados cuánticos que contiene.`,[
R`La región \(H\le E\) es una elipse de semiejes \(q_0 = \sqrt{2E/m\omega^2}\) y \(p_0 = \sqrt{2mE}\).`,
R`Área: \(\Phi(E) = \pi q_0p_0 = \pi\sqrt{\dfrac{2E}{m\omega^2}\cdot2mE} = \dfrac{2\pi E}{\omega}\).`,
R`Los niveles cuánticos son \(E_n = \hbar\omega(n+\tfrac12)\): por debajo de \(E\) hay \(\approx E/\hbar\omega = \Phi/2\pi\hbar = \Phi/h\) estados.`,
R`Cada estado cuántico ocupa un área \(h\) en el espacio de fases. Ese es el origen del factor \(1/h^{3N}\) en la mecánica estadística clásica.`]],
ref:'Pathria & Beale, cap. 2; Huang, cap. 6; Goldstein, cap. 9'}));

LABS['tme-espacio-fases']=function(sec){
  const cv=$('#ms13-cv',sec),rd=$('#ms13-read',sec);let sys='pen',run=true,P=null,Bd=null,t=0,A0=1;
  segm(sec,'ms13-s','s',v=>{sys=v;reset();});$('#ms13-rst',sec).onclick=reset;const rb=$('#ms13-run',sec);rb.onclick=()=>{run=!run;rb.textContent=run?'Pausa':'Seguir';};
  const q0=0.6,p0=0.4,dq=0.7,dp=0.7;
  function reset(){const r=rng(21);P=[];for(let i=0;i<2500;i++)P.push([q0+dq*r(),p0+dp*r()]);Bd=[];const n=150;
    for(let i=0;i<n;i++)Bd.push([q0+dq*i/n,p0]);for(let i=0;i<n;i++)Bd.push([q0+dq,p0+dp*i/n]);for(let i=0;i<n;i++)Bd.push([q0+dq-dq*i/n,p0+dp]);for(let i=0;i<n;i++)Bd.push([q0,p0+dp-dp*i/n]);
    t=0;A0=area();draw();}
  const force=q=>sys==='pen'?-Math.sin(q):-q;
  function adv(pt,dt){/* leapfrog; amortiguamiento exacto en p */let [q,p]=pt;p+=0.5*dt*force(q);if(sys==='dmp')p*=Math.exp(-0.15*dt*0.5);q+=dt*p;if(sys==='dmp')p*=Math.exp(-0.15*dt*0.5);p+=0.5*dt*force(q);pt[0]=q;pt[1]=p;}
  function refine(){/* agrega puntos donde el borde se estira */const out=[];for(let i=0;i<Bd.length;i++){const a=Bd[i],b=Bd[(i+1)%Bd.length];out.push(a);if(Math.hypot(a[0]-b[0],a[1]-b[1])>0.05&&Bd.length+out.length<12000)out.push(mid(a,b));}Bd=out;}
  let midMap=null;function mid(a,b){return [(a[0]+b[0])/2,(a[1]+b[1])/2];}
  /* el punto medio se vuelve a integrar desde t=0 sería caro: aproximación con interpolación lineal (error pequeño si se refina a menudo) */
  function area(){let s=0;for(let i=0;i<Bd.length;i++){const a=Bd[i],b=Bd[(i+1)%Bd.length];s+=a[0]*b[1]-b[0]*a[1];}return Math.abs(s)/2;}
  function draw(){
    if(!vis(cv))return;if(!P)reset();const {ctx,w,h}=fit(cv,.75,470,300);
    const Q=sys==='pen'?Math.PI:2.5;const A=axes(ctx,{l:46,t:14,w:w-60,h:h-48,xr:[-Q,Q],yr:[-2.4,2.4],xl:'q',yl:'p'});
    const E=(q,p)=>p*p/2+(sys==='pen'?1-Math.cos(q):q*q/2);
    [0.1,0.3,0.6,1,1.5,2,2.6].forEach(e=>{const pts=[],pts2=[];for(let i=0;i<=300;i++){const q=-Q+2*Q*i/300,v=2*(e-(sys==='pen'?1-Math.cos(q):q*q/2));if(v>=0){pts.push([q,Math.sqrt(v)]);pts2.push([q,-Math.sqrt(v)]);}}
      const col=sys==='pen'&&Math.abs(e-2)<1e-9?K.d:K.gr;polyl(ctx,A,pts,col,sys==='pen'&&e===2?2:1.4,sys==='pen'&&e===2?[5,4]:null);polyl(ctx,A,pts2,col,sys==='pen'&&e===2?2:1.4,sys==='pen'&&e===2?[5,4]:null);});
    if(sys==='pen')label(ctx,'separatriz',A.X(2.2),A.Y(1.15),K.d);
    ctx.save();clipBox(ctx,A.o);ctx.fillStyle='rgba(36,83,201,.55)';P.forEach(([q,p])=>{ctx.fillRect(A.X(q)-1,A.Y(p)-1,2,2);});ctx.restore();ctx.restore();
    polyl(ctx,A,[...Bd,Bd[0]],K.b,1.4);
    const Ar=area();
    rd.innerHTML=row('t',nf(t,2))+row('área inicial',nf(A0,4))+row('área actual (borde)',nf(Ar,4))+row('cociente',nf(Ar/A0,4))+
      (sys==='dmp'?row('teoría e<sup>−γt</sup>',nf(Math.exp(-0.15*t),4)):row('teoría (Liouville)','1'))+row('puntos del borde',Bd.length)+
      rowT(sys==='pen'?'La región se estira en espiral pero su área no cambia. A escala gruesa parece llenar un anillo de energías: así se ve la mezcla.':sys==='osc'?'Todas las órbitas tienen el mismo período: la región gira rígidamente y nunca se mezcla.':'Con fricción, las trayectorias convergen al origen y el área se contrae: no hay Liouville sin Hamilton.');
  }
  return {draw,tick(dt){if(!run||!vis(cv)||!P)return;const h=0.02;for(let k=0;k<3;k++){P.forEach(pt=>adv(pt,h));Bd.forEach(pt=>adv(pt,h));t+=h;}refine();if(t>60)reset();draw();}};
};

/* ================= UNIDAD V · CONJUNTOS ================= */
V.push(topic({id:'tme-microcanonico',p:'ms14',
lead:R`El conjunto microcanónico describe un sistema aislado con \(U\), \(V\) y \(N\) fijos. Todo se reduce a contar microestados: con \(\Omega(U,V,N)\) se obtiene la entropía y de ella la termodinámica. Aplicado al gas ideal, el cálculo obliga a reconocer que las partículas idénticas son indistinguibles.`,
res:[
[R`Receta.`,R`(1) Contar \(\Omega(U,V,N)\), los microestados con energía entre \(U\) y \(U+\delta U\). (2) \(S = k_B\ln\Omega\). (3) Derivar: \(\dfrac1T = \dfrac{\partial S}{\partial U}\), \(\dfrac PT = \dfrac{\partial S}{\partial V}\), \(\dfrac\mu T = -\dfrac{\partial S}{\partial N}\).`],
[R`Gas ideal: volumen de la hiperesfera.`,R`La condición \(\sum p_i^2 = 2mU\) es una esfera de radio \(\sqrt{2mU}\) en \(3N\) dimensiones. Su volumen es \(\dfrac{\pi^{3N/2}}{(3N/2)!}(2mU)^{3N/2}\). Con el volumen \(V^N\) de las posiciones y una celda \(h^{3N}\) por estado, se obtiene \(\Omega\).`],
[R`Casi todo el volumen está en la cáscara.`,R`En \(d = 3N\) dimensiones, la fracción del volumen de una esfera a menos de \(\delta R\) de la superficie es \(1-(1-\delta R/R)^d\approx1\). Por eso da igual contar estados "con energía \(\le U\)" o "entre \(U\) y \(U+\delta U\)".`],
[R`Paradoja de Gibbs.`,R`Sin más correcciones, la entropía no es extensiva: al quitar un tabique entre dos muestras del <i>mismo</i> gas sale \(\Delta S = 2Nk_B\ln2\), aunque nada observable cambió. Gibbs propuso dividir \(\Omega\) por \(N!\): las permutaciones de partículas idénticas no son estados distintos.`],
[R`Sackur-Tetrode.`,R`Con el \(1/N!\) y Stirling: \(S = Nk_B\left[\ln\!\left(\dfrac{V}{N\lambda_T^3}\right)+\dfrac52\right]\), con \(\lambda_T = \dfrac{h}{\sqrt{2\pi mk_BT}}\). Es extensiva, contiene \(h\) (una huella cuántica en un resultado clásico) y concuerda con medidas de la entropía del vapor de mercurio y de gases nobles.`],
[R`Entropía de mezcla.`,R`Para dos gases <i>distintos</i>, \(\Delta S_\text{mezcla} = -Nk_B\sum_i x_i\ln x_i\), que es \(2Nk_B\ln2\) para mitades iguales. Para el mismo gas, cero. El salto discontinuo entre "casi iguales" e "iguales" es la esencia de la paradoja.`]],
lab:PANE('ms14-cv',[G('ms14-k','k',[['d','Gases distintos'],['i','Idénticos (con 1/N!)'],['x','Idénticos sin 1/N!']]),B('ms14-go','Quitar el tabique',false),B('ms14-rst','Reiniciar')],'ms14-read',
 R`Caja con 100 partículas a cada lado, a la misma temperatura y densidad. Al quitar el tabique cada partícula puede ocupar toda la caja. La curva es la entropía de mezcla de grano grueso: se cuenta cuántas partículas de cada especie hay en cada mitad. Si las especies son distinguibles, \(\Delta S\to2Nk_B\ln2\). Si son idénticas, solo cuenta el total en cada mitad, que ya era el de equilibrio: \(\Delta S = 0\). Tratarlas como distinguibles (sin \(1/N!\)) reproduce la paradoja.`),
laws:[
['Entropía microcanónica',R`S(U,V,N) = k_B\ln\Omega(U,V,N)`],
['Gas ideal clásico',R`\Omega = \frac{V^N}{N!\,h^{3N}}\;\frac{\pi^{3N/2}}{\Gamma\!\left(\frac{3N}{2}+1\right)}\,(2mU)^{3N/2}`,R`Se usa el volumen \(\le U\); la diferencia con la cáscara es despreciable.`],
['Sackur-Tetrode',R`S = Nk_B\left[\ln\!\Big(\frac{V}{N\lambda_T^3}\Big)+\frac52\right]`,R`\(\lambda_T = h/\sqrt{2\pi mk_BT}\): longitud de onda térmica de De Broglie.`],
['Ecuaciones de estado',[R`\frac1T = \frac{\partial S}{\partial U}\Rightarrow U = \tfrac32Nk_BT`,R`\frac PT = \frac{\partial S}{\partial V}\Rightarrow PV = Nk_BT`]],
['Mezcla',R`\Delta S_\text{mezcla} = -Nk_B\sum_i x_i\ln x_i`,'Solo para especies distinguibles.']],
ej:[R`Calcula la entropía molar del argón a 298 K y 1 bar con Sackur-Tetrode (\(m = 39{,}95\) u). El valor medido es 154,8 J/(mol·K).`,[
R`\(\lambda_T = \dfrac{h}{\sqrt{2\pi mk_BT}} = \dfrac{6{,}626\times10^{-34}}{\sqrt{2\pi(6{,}634\times10^{-26})(1{,}381\times10^{-23})(298)}} = 1{,}60\times10^{-11}\) m.`,
R`\(V/N = k_BT/P = 4{,}12\times10^{-26}\ \text{m}^3\), y \(\lambda_T^3 = 4{,}10\times10^{-33}\ \text{m}^3\).`,
R`\(\ln\dfrac{V}{N\lambda_T^3} = \ln(1{,}005\times10^{7}) = 16{,}12\). Entonces \(S/R = 16{,}12 + 2{,}5 = 18{,}62\).`,
R`\(S = 18{,}62\times8{,}314 = 154{,}8\) J/(mol·K), en acuerdo con la calorimetría. El \(1/N!\) y la constante de Planck son imprescindibles para ese acuerdo.`]],
ref:'Pathria & Beale, cap. 1–2; Callen, cap. 16; Schroeder, cap. 2'}));

LABS['tme-microcanonico']=function(sec){
  const cv=$('#ms14-cv',sec),rd=$('#ms14-read',sec);let kind='d',open=false,P=[],hist=[],t=0;const Nh=100;
  segm(sec,'ms14-k','k',v=>{kind=v;draw();});
  const btn=$('#ms14-go',sec);btn.onclick=()=>{open=true;btn.disabled=true;};$('#ms14-rst',sec).onclick=reset;
  function reset(){const r=rng(17);P=[];for(let i=0;i<2*Nh;i++){const sp=i<Nh?0:1,a=TAU*r();P.push({x:(sp?0.5:0)+0.5*r(),y:r(),vx:0.25*Math.cos(a),vy:0.25*Math.sin(a),s:sp});}open=false;btn.disabled=false;t=0;hist=[[0,0,0,0]];draw();}
  const xl=x=>x>0&&x<1?x*Math.log(x):0;
  function dS(){/* entropía de grano grueso en unidades de Nk_B (N = 2Nh) */
    const c=[[0,0],[0,0]];P.forEach(p=>c[p.s][p.x<0.5?0:1]++);
    const Sd=[0,1].reduce((a,s)=>a-Nh*(xl(c[s][0]/Nh)+xl(c[s][1]/Nh)),0);
    const tot=[c[0][0]+c[1][0],c[0][1]+c[1][1]],Si=-2*Nh*(xl(tot[0]/(2*Nh))+xl(tot[1]/(2*Nh)))-(-2*Nh*Math.log(0.5));
    return {Sd:Sd/(2*Nh),Si:Si/(2*Nh),c};}
  function draw(){
    if(!vis(cv))return;if(!P.length)reset();const {ctx,w,h}=fit(cv,.75,460,300),bh=h*0.46,bw=w-24,x0=12,y0=10;
    ctx.fillStyle='#faf8f3';ctx.fillRect(x0,y0,bw,bh);ctx.strokeStyle=K.ink;ctx.lineWidth=2.5;ctx.strokeRect(x0,y0,bw,bh);
    if(!open){ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x0+bw/2,y0);ctx.lineTo(x0+bw/2,y0+bh);ctx.stroke();}
    else{ctx.setLineDash([4,6]);ctx.lineWidth=1;ctx.strokeStyle=K.ax;ctx.beginPath();ctx.moveTo(x0+bw/2,y0);ctx.lineTo(x0+bw/2,y0+bh);ctx.stroke();ctx.setLineDash([]);}
    const same=kind!=='d';P.forEach(p=>dot(ctx,x0+p.x*bw,y0+(1-p.y)*bh,4,same?K.d:(p.s?K.b:K.a)));
    const m=dS();const val=kind==='d'||kind==='x'?m.Sd:m.Si;
    const A=axes(ctx,{l:52,t:bh+34,w:w-66,h:h-bh-62,xr:[0,Math.max(10,t)],yr:[-0.05,0.8],xl:'t',yl:'ΔS / Nk'});
    polyl(ctx,A,[[0,Math.log(2)],[Math.max(10,t),Math.log(2)]],K.ax,1.2,[5,4]);label(ctx,'ln 2',A.X(Math.max(10,t))-4,A.Y(Math.log(2))-9,K.mut,'right');
    polyl(ctx,A,hist.map(q=>[q[0],kind==='i'?q[2]:q[1]]),kind==='i'?K.d:K.b,2.6);
    const nm={d:'distintos',i:'idénticos (contando con 1/N!)',x:'idénticos tratados como distinguibles'}[kind];
    rd.innerHTML=row('caso',nm)+row('azules a la izquierda / derecha',m.c[0][0]+' / '+m.c[0][1])+row('naranjas a la izquierda / derecha',m.c[1][0]+' / '+m.c[1][1])+sep+
      row('ΔS/Nk (grano grueso)',nf(val,3))+row('ΔS/Nk teórico final',kind==='i'?'0':nf(Math.log(2),3))+
      rowT(kind==='x'?'Paradoja: el estado macroscópico final es idéntico al inicial (misma T, misma densidad), pero la cuenta da ΔS &gt; 0. La entropía así calculada no sería extensiva.':kind==='i'?'Para partículas idénticas, intercambiar dos de ellas no produce un microestado nuevo: no hay entropía de mezcla.':'Para especies distintas la mezcla es irreversible: separarlas exige trabajo ≥ T ΔS.');
  }
  function tick(dt){if(!vis(cv)||!P.length)return;const h=dt;P.forEach(p=>{p.x+=p.vx*h;p.y+=p.vy*h;
      const lo=open?0:(p.s?0.5:0),hi=open?1:(p.s?1:0.5);
      if(p.x<lo){p.x=2*lo-p.x;p.vx=Math.abs(p.vx);}if(p.x>hi){p.x=2*hi-p.x;p.vx=-Math.abs(p.vx);}if(p.y<0){p.y=-p.y;p.vy=Math.abs(p.vy);}if(p.y>1){p.y=2-p.y;p.vy=-Math.abs(p.vy);}});
    if(open){t+=dt;const m=dS();hist.push([t,m.Sd,m.Si]);}draw();}
  return {draw,tick};
};

/* ---------- canónico ---------- */
V.push(topic({id:'tme-canonico',p:'ms15',
lead:R`Casi nunca un sistema está aislado: suele estar en contacto con un baño térmico mucho mayor que fija su temperatura. Contando los microestados del baño se obtiene el factor de Boltzmann, y toda la termodinámica queda contenida en una sola suma, la función de partición.`,
res:[
[R`Derivación.`,R`Sistema S en contacto con un baño R, con energía total \(E_0\) fija. La probabilidad de que S esté en el microestado \(i\) es proporcional a los microestados del baño: \(p_i\propto\Omega_R(E_0-E_i) = e^{S_R(E_0-E_i)/k_B}\approx e^{S_R(E_0)/k_B}e^{-E_i/k_BT}\).`],
[R`Distribución de Boltzmann.`,R`\(p_i = \dfrac{e^{-\beta E_i}}{Z}\), con \(\beta = 1/k_BT\) y \(Z = \sum_ie^{-\beta E_i}\). Los niveles degenerados se suman con su degeneración \(g_n\).`],
[R`Termodinámica desde Z.`,R`\(U = -\dfrac{\partial\ln Z}{\partial\beta}\), \(F = -k_BT\ln Z\), \(S = -\left(\dfrac{\partial F}{\partial T}\right)_V\), \(P = -\left(\dfrac{\partial F}{\partial V}\right)_T\). Si el sistema son \(N\) partes independientes y distinguibles, \(Z = z^N\); si son idénticas en el límite clásico, \(Z = z^N/N!\).`],
[R`Fluctuaciones de energía.`,R`\(\langle\Delta E^2\rangle = \dfrac{\partial^2\ln Z}{\partial\beta^2} = k_BT^2C_V\). Como \(U\) y \(C_V\) son extensivos, \(\Delta E/U\sim1/\sqrt N\): para sistemas grandes, el canónico y el microcanónico dan la misma termodinámica.`],
[R`Sistema de dos niveles.`,R`Niveles \(0\) y \(\varepsilon\): \(z = 1+e^{-\beta\varepsilon}\), \(U = \dfrac{N\varepsilon}{e^{\beta\varepsilon}+1}\). La capacidad calorífica \(C = Nk_B\dfrac{x^2e^x}{(e^x+1)^2}\), con \(x = \varepsilon/k_BT\), tiene un máximo en \(k_BT\approx0{,}42\,\varepsilon\): la <i>anomalía de Schottky</i>.`],
[R`Paramagneto.`,R`Spins \(\tfrac12\) en un campo \(B\) son un sistema de dos niveles con \(\varepsilon = 2\mu B\). La magnetización media es \(M = N\mu\tanh(\mu B/k_BT)\), y a campo débil se obtiene la ley de Curie, \(\chi\propto1/T\).`]],
lab:PANE('ms15-cv',[S('ms15-t','k<sub>B</sub>T/ε',0.05,3,0.01,0.6),G('ms15-n','n',[['100','N = 100'],['400','N = 400'],['1600','N = 1600']])],'ms15-read',
 R`\(N\) sistemas de dos niveles en contacto con un baño (algoritmo de Metropolis). La rejilla muestra cuáles están excitados. Arriba a la derecha, \(U/N\varepsilon\) y \(C/Nk_B\) en función de \(k_BT/\varepsilon\), con la anomalía de Schottky. Abajo, la energía instantánea \(E(t)\): fluctúa alrededor de \(U\) con una desviación \(\sqrt{k_BT^2C}\), relativamente menor cuanto mayor es \(N\).`),
laws:[
['Factor de Boltzmann',R`p_i = \frac{e^{-\beta E_i}}{Z},\qquad Z = \sum_i e^{-\beta E_i}`],
['Energía libre',R`F = -k_BT\ln Z`,'Puente entre la estadística y la termodinámica.'],
['Energía y entropía',[R`U = -\frac{\partial\ln Z}{\partial\beta}`,R`S = -k_B\sum_ip_i\ln p_i = \frac{U-F}{T}`]],
['Fluctuaciones',R`\langle\Delta E^2\rangle = k_BT^2C_V`,'Relación de fluctuación-respuesta.'],
['Dos niveles',R`\frac{C}{Nk_B} = \frac{x^2e^x}{(1+e^x)^2},\quad x = \frac{\varepsilon}{k_BT}`],
['Partículas idénticas (clásico)',R`Z_N = \frac{z^N}{N!}`]],
ej:[R`Un gas de iones con un nivel excitado a \(\varepsilon = 0{,}01\) eV sobre el fundamental (ambos no degenerados). ¿Qué fracción está excitada a 77 K y a 300 K? ¿Dónde está el máximo de su contribución a \(C\)?`,[
R`\(p_1 = \dfrac{1}{e^{\varepsilon/k_BT}+1}\). A 77 K: \(k_BT = 6{,}64\) meV, \(x = 1{,}51\), \(p_1 = 0{,}18\).`,
R`A 300 K: \(k_BT = 25{,}9\) meV, \(x = 0{,}386\), \(p_1 = 0{,}40\). Nunca supera 1/2: a \(T\to\infty\) los dos niveles se igualan.`,
R`El máximo de Schottky está en \(x\approx2{,}40\), es decir \(T = \varepsilon/(2{,}40k_B) = 48\) K, con \(C_\text{máx}\approx0{,}44\,Nk_B\).`,
R`Un pico así en una medida de \(C(T)\) revela niveles discretos ocultos: se usa para detectar desdoblamientos de campo cristalino.`]],
ref:'Reif, cap. 6; Schroeder, cap. 6; Pathria & Beale, cap. 3'}));

LABS['tme-canonico']=function(sec){
  const cv=$('#ms15-cv',sec),rd=$('#ms15-read',sec);let N=100,s=null,trace=[],r=rng(5),E=0;
  const gT=sl(sec,'ms15-t',v=>nf(v,2),()=>{trace=[];});segm(sec,'ms15-n','n',v=>{N=+v;init();});
  function init(){s=new Uint8Array(N);E=0;const p=1/(Math.exp(1/gT())+1);for(let i=0;i<N;i++){s[i]=r()<p?1:0;E+=s[i];}trace=[];}
  const Uof=T=>1/(Math.exp(1/T)+1),Cof=T=>{const x=1/T;return x*x*Math.exp(x)/(1+Math.exp(x))**2;};
  function sweep(){const b=1/gT();for(let k=0;k<N;k++){const i=Math.floor(r()*N),dE=s[i]?-1:1;if(dE<0||r()<Math.exp(-b*dE)){s[i]^=1;E+=dE;}}trace.push(E);if(trace.length>300)trace.shift();}
  function draw(){
    if(!vis(cv))return;if(!s)init();const {ctx,w,h}=fit(cv,.8,480,320),T=gT();
    const gw=Math.min(w*0.4,h*0.55),n=Math.ceil(Math.sqrt(N)),c=gw/n;
    for(let i=0;i<N;i++){ctx.fillStyle=s[i]?K.b:'#e6ecfb';ctx.fillRect(10+(i%n)*c,10+Math.floor(i/n)*c,c-(n>30?0:1),c-(n>30?0:1));}
    label(ctx,'excitados: '+E,10,gw+24,K.b);
    const A=axes(ctx,{l:gw+56,t:12,w:w-gw-70,h:gw-6,xr:[0,3],yr:[0,0.55],xl:'kT/ε'});
    curve(ctx,A,Uof,0.01,3,K.a,2.6);curve(ctx,A,Cof,0.01,3,K.w,2.6);
    label(ctx,'U/Nε',A.X(2.6),A.Y(Uof(2.6))-10,K.a,'center');label(ctx,'C/Nk',A.X(0.42),A.Y(0.44)-10,K.w,'center');
    polyl(ctx,A,[[T,0],[T,0.55]],K.ink,1.2,[4,4]);dot(ctx,A.X(T),A.Y(Uof(T)),5,K.a);dot(ctx,A.X(T),A.Y(Cof(T)),5,K.w);
    const U=N*Uof(T),sd=Math.sqrt(N*T*T*Cof(T));
    const B=axes(ctx,{l:52,t:gw+44,w:w-66,h:h-gw-72,xr:[0,300],yr:[0,N*0.55],xl:'barridos de Metropolis',yl:'E/ε'});
    fillPath(ctx,B,[[0,U-sd],[300,U-sd],[300,U+sd],[0,U+sd]],'rgba(201,42,42,.10)');polyl(ctx,B,[[0,U],[300,U]],K.w,1.5,[5,4]);
    polyl(ctx,B,trace.map((v,i)=>[i,v]),K.b,1.8);
    const m=trace.length?trace.reduce((a,b)=>a+b,0)/trace.length:0,v=trace.length>1?trace.reduce((a,b)=>a+(b-m)**2,0)/(trace.length-1):0;
    rd.innerHTML=row('k<sub>B</sub>T/ε',nf(T,2))+row('Z por sistema = 1 + e<sup>−ε/kT</sup>',nf(1+Math.exp(-1/T),4))+row('p(excitado)',nf(Uof(T),4))+sep+
      row('U teórica',nf(U,1)+' ε')+row('⟨E⟩ medida',nf(m,1)+' ε')+row('σ<sub>E</sub> teórica = √(kT²C)',nf(sd,2)+' ε')+row('σ<sub>E</sub> medida',nf(Math.sqrt(v),2)+' ε')+row('σ<sub>E</sub>/U',nf(sd/U,3))+
      rowT(T<0.2?'kT ≪ ε: casi nadie está excitado y C → 0 exponencialmente.':T>1.5?'kT ≫ ε: los dos niveles se igualan, U → Nε/2 y C → 0 como 1/T².':'Cerca del máximo de Schottky: un pequeño cambio de T cambia mucho la población.');
  }
  return {draw,tick(dt){if(!vis(cv))return;if(!s)init();sweep();sweep();draw();}};
};

/* ---------- leyes desde la estadística ---------- */
V.push(topic({id:'tme-leyes-estadistica',p:'ms16',
lead:R`Con la distribución canónica ya se puede responder la pregunta del curso: ¿de dónde salen las leyes de la termodinámica? Calor y trabajo resultan ser dos maneras distintas de cambiar la energía media: el trabajo mueve los niveles de energía; el calor cambia cómo están ocupados.`,
res:[
[R`Primera ley microscópica.`,R`\(U = \sum_ip_iE_i\), así que \(dU = \sum_iE_i\,dp_i + \sum_ip_i\,dE_i\). El primer término es el calor \(\delta Q\): cambian las probabilidades con los niveles fijos. El segundo es el trabajo hecho <i>sobre</i> el sistema, \(-\delta W\): se desplazan los niveles al cambiar un parámetro externo como \(V\).`],
[R`Trabajo y presión.`,R`Si los niveles dependen del volumen, \(\sum_ip_i\,dE_i = \left\langle\dfrac{\partial E_i}{\partial V}\right\rangle dV = -P\,dV\), con \(P = -\left\langle\dfrac{\partial E_i}{\partial V}\right\rangle\). Para una partícula en una caja, \(E_n\propto L^{-2}\): comprimir eleva todos los niveles.`],
[R`Segunda ley: entropía de Gibbs.`,R`\(S = -k_B\sum_ip_i\ln p_i\). Para el canónico, \(dS = -k_B\sum_i\ln p_i\,dp_i = \dfrac1T\sum_iE_i\,dp_i = \dfrac{\delta Q_\text{rev}}{T}\). La definición de Clausius es una consecuencia, y \(1/T\) resulta ser el factor integrante.`],
[R`Procesos adiabáticos.`,R`Si un parámetro cambia muy lentamente, el teorema adiabático cuántico asegura que cada estado sigue siendo el mismo autoestado: \(dp_i = 0\). Entonces \(\delta Q = 0\) y \(dS = 0\): adiabático reversible es isentrópico. Para la caja, \(T\propto L^{-2}\), equivalente a \(TV^{2/3}=\) cte en 3D (\(\gamma = 5/3\)).`],
[R`Máxima entropía.`,R`Entre todas las distribuciones con \(\langle E\rangle = U\) fijo, la que maximiza \(S\) (con multiplicadores de Lagrange) es la de Boltzmann. El equilibrio es el estado menos sesgado compatible con lo que sabemos (Jaynes, 1957).`],
[R`Tercera ley.`,R`Cuando \(T\to0\), solo se ocupa el nivel fundamental: \(p_0 = 1/g_0\) para sus \(g_0\) estados y \(S\to k_B\ln g_0\). Si el fundamental no es degenerado, \(S\to0\).`],
[R`Relaciones de Maxwell.`,R`Son igualdades entre derivadas cruzadas de \(\ln Z(\beta,V)\): por ejemplo, \(\left(\dfrac{\partial S}{\partial V}\right)_T = \left(\dfrac{\partial P}{\partial T}\right)_V\) porque ambas son \(k_B\dfrac{\partial^2(T\ln Z)}{\partial T\,\partial V}\).`]],
lab:PANE('ms16-cv',[S('ms16-t','T (calentar)',0.2,6,0.05,1.5),S('ms16-l','L (comprimir)',0.5,1.6,0.01,1),G('ms16-m','m',[['ad','L lento: adiabático'],['iso','L en contacto con baño']]),B('ms16-rst','Reiniciar contadores')],'ms16-read',
 R`Partícula en una caja 1D con niveles \(E_n = n^2\varepsilon_0/L^2\) (unidades de \(\varepsilon_0\)). Las barras son las probabilidades \(p_n\). Mover \(T\) pone el sistema en contacto con un baño: cambian las \(p_n\) a niveles fijos, es decir, calor. Mover \(L\) en modo adiabático desplaza los niveles sin cambiar las \(p_n\): trabajo puro y \(S\) constante. En modo baño, mover \(L\) produce trabajo y calor a la vez. Los contadores verifican \(\Delta U = Q + W_\text{sobre}\).`),
laws:[
['Energía media',R`U = \sum_ip_iE_i`],
['Calor y trabajo',[R`\delta Q = \sum_iE_i\,dp_i`,R`-\delta W = \sum_ip_i\,dE_i`],'δW: trabajo hecho por el sistema.'],
['Entropía de Gibbs',R`S = -k_B\sum_ip_i\ln p_i`,R`Para \(p_i = 1/\Omega\) se recupera \(S = k_B\ln\Omega\).`],
['Clausius desde Gibbs',R`dS = \frac{1}{T}\sum_iE_i\,dp_i = \frac{\delta Q_\text{rev}}{T}`,R`Se usa \(\ln p_i = -\beta E_i - \ln Z\) y \(\sum dp_i = 0\).`],
['Presión',R`P = -\Big\langle\frac{\partial E_i}{\partial V}\Big\rangle = k_BT\Big(\frac{\partial\ln Z}{\partial V}\Big)_T`],
['Tercera ley',R`\lim_{T\to0}S = k_B\ln g_0`]],
ej:[R`Una partícula en una caja 1D está a una temperatura tan baja que solo ocupa \(n = 1\) y \(n = 2\), con \(p_1 = 0{,}9\) y \(p_2 = 0{,}1\). Se comprime adiabáticamente de \(L\) a \(L/2\). ¿Cuánto trabajo se hace sobre ella y cuánto cambia su entropía?`,[
R`Adiabático: las \(p_n\) no cambian y \(\delta Q = 0\), así que \(\Delta S = 0\).`,
R`Los niveles se cuadruplican: \(E_n = n^2\varepsilon_0/L^2\to4n^2\varepsilon_0/L^2\).`,
R`\(U_i = (0{,}9\cdot1 + 0{,}1\cdot4)\varepsilon_0/L^2 = 1{,}3\,\varepsilon_0/L^2\) y \(U_f = 5{,}2\,\varepsilon_0/L^2\).`,
R`\(W_\text{sobre} = \Delta U = 3{,}9\,\varepsilon_0/L^2\). Como las \(p_n\) siguen siendo de Boltzmann con \(E_n\) cuadruplicadas, la nueva temperatura es \(4T\): \(T\propto L^{-2}\).`]],
ref:'Reif, cap. 6; Schroeder, cap. 6; Jaynes, <i>Phys. Rev.</i> 106 (1957)'}));

LABS['tme-leyes-estadistica']=function(sec){
  const cv=$('#ms16-cv',sec),rd=$('#ms16-read',sec);const NL=12;let mode='ad',p=null,L=1,Q=0,W=0,U0=0,Teff=1.5;
  const En=(n,l)=>n*n/(l*l);
  const boltz=(T,l)=>{const w=[];let z=0;for(let n=1;n<=NL;n++){const e=Math.exp(-(En(n,l)-En(1,l))/T);w.push(e);z+=e;}return w.map(x=>x/z);};
  const Uof=(pp,l)=>pp.reduce((s,x,i)=>s+x*En(i+1,l),0);
  const gT=sl(sec,'ms16-t',v=>nf(v,2),()=>{const T=gT();const np=boltz(T,L);Q+=np.reduce((s,x,i)=>s+(x-p[i])*En(i+1,L),0);p=np;Teff=T;draw();});
  const gL=sl(sec,'ms16-l',v=>nf(v,2),()=>{const l=gL();
    if(mode==='ad'){W+=p.reduce((s,x,i)=>s+x*(En(i+1,l)-En(i+1,L)),0);Teff=Teff*(L/l)**2;L=l;}
    else{/* isotérmico: pasos pequeños, trabajo con p fijas y luego calor al reequilibrar */const T=Teff;W+=p.reduce((s,x,i)=>s+x*(En(i+1,l)-En(i+1,L)),0);L=l;const np=boltz(T,L);Q+=np.reduce((s,x,i)=>s+(x-p[i])*En(i+1,L),0);p=np;}
    draw();});
  segm(sec,'ms16-m','m',v=>{mode=v;draw();});
  function init(){L=gL();Teff=gT();p=boltz(Teff,L);Q=0;W=0;U0=Uof(p,L);}
  function draw(){
    if(!vis(cv))return;if(!p)init();const {ctx,w,h}=fit(cv,.8,480,320);
    const Emax=40,bxW=Math.min(w*0.42,220)*L/1.6+40,x0=30,yb=h-26,sc=(h-50)/Emax;
    ctx.strokeStyle=K.ink;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x0,14);ctx.lineTo(x0,yb);ctx.lineTo(x0+bxW,yb);ctx.lineTo(x0+bxW,14);ctx.stroke();
    label(ctx,'L = '+nf(L,2),x0+bxW/2,yb+14,K.mut,'center');
    const bx=x0+bxW+50,bwid=w-bx-20;
    for(let n=1;n<=NL;n++){const E=En(n,L);if(E>Emax)break;const y=yb-E*sc;ctx.strokeStyle=K.ax;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x0+4,y);ctx.lineTo(x0+bxW-4,y);ctx.stroke();
      ctx.fillStyle=K.b;ctx.globalAlpha=.8;ctx.fillRect(bx,y-5,bwid*p[n-1],10);ctx.globalAlpha=1;label(ctx,'n='+n,bx-6,y,K.mut,'right','middle','11px Inter');
      if(p[n-1]>0.005)label(ctx,nf(p[n-1],2),bx+bwid*p[n-1]+4,y,K.b,'left','middle','10px Inter');}
    label(ctx,'pₙ',bx+bwid/2,10,K.b,'center');label(ctx,'Eₙ = n²/L²',x0+bxW/2,10,K.mut,'center');
    const U=Uof(p,L),S=-p.reduce((s,x)=>s+(x>0?x*Math.log(x):0),0);
    rd.innerHTML=row('U = Σ pₙEₙ',nf(U,3))+row('S/k = −Σ p ln p',nf(S,4))+row('T del estado (Boltzmann)',nf(Teff,3))+sep+
      row('Q acumulado = Σ E dp',nf(Q,3))+row('W sobre el sistema = Σ p dE',nf(W,3))+row('Q + W',nf(Q+W,3))+row('ΔU',nf(U-U0,3))+
      rowT(mode==='ad'?'Modo adiabático: al cambiar L, las pₙ no cambian. S queda fija y T·L² se conserva.':'Modo baño: al cambiar L, la partícula se reequilibra a T fija, y entra o sale calor.');
  }
  $('#ms16-rst',sec).onclick=()=>{init();draw();};
  return {draw};
};

/* ---------- sólidos ---------- */
V.push(topic({id:'tme-solidos',p:'ms17',
lead:R`La ley de Dulong y Petit (1819) dice que la capacidad calorífica molar de los sólidos es \(3R\approx25\) J/(mol·K). Funciona a temperatura ambiente, pero a baja temperatura \(C\) cae a cero. Ese fallo de la equipartición fue uno de los primeros indicios de la cuantización, y Einstein (1907) y Debye (1912) lo explicaron.`,
res:[
[R`Dulong-Petit.`,R`Cada átomo vibra en 3 direcciones, con energía cinética y potencial cuadráticas: 6 términos de \(\tfrac12k_BT\). Entonces \(U = 3Nk_BT\) y \(C_V = 3Nk_B = 3R\) por mol, independiente de \(T\) y del material.`],
[R`Modelo de Einstein.`,R`Los \(3N\) osciladores son cuánticos e independientes, con la misma frecuencia \(\omega_E\). La energía media de cada uno es \(\langle\varepsilon\rangle = \dfrac{\hbar\omega_E}{e^{\hbar\omega_E/k_BT}-1}\) (más la de punto cero). Con \(\theta_E = \hbar\omega_E/k_B\): \(C_V = 3Nk_B\dfrac{x^2e^x}{(e^x-1)^2}\), \(x = \theta_E/T\).`],
[R`Por qué cae C.`,R`Cuando \(k_BT\ll\hbar\omega\), la probabilidad de excitar un cuanto es \(\sim e^{-\hbar\omega/k_BT}\): los modos se "congelan". Einstein predice un descenso exponencial, más rápido que el observado.`],
[R`Modelo de Debye.`,R`Las vibraciones son ondas sonoras (fonones) con \(\omega = v_sk\) y densidad de modos \(g(\omega)\propto\omega^2\), cortada en \(\omega_D\) para que haya \(3N\) modos. Los modos de baja frecuencia siempre se excitan, lo que da \(C_V = \dfrac{12\pi^4}{5}Nk_B\left(\dfrac{T}{\theta_D}\right)^3\) a baja temperatura.`],
[R`Temperatura de Debye.`,R`\(\theta_D = \hbar\omega_D/k_B\) mide la rigidez de la red: plomo 105 K, cobre 343 K, aluminio 428 K, silicio 645 K, diamante 2230 K. Por eso el diamante está lejos de Dulong-Petit a temperatura ambiente.`],
[R`Metales.`,R`Los electrones de conducción añaden \(C_e = \gamma T\) (gas de Fermi). A pocos kelvin domina: \(C/T = \gamma + AT^2\), una recta en función de \(T^2\).`]],
lab:PANE('ms17-cv',[G('ms17-m','m',[['105','Plomo'],['343','Cobre'],['645','Silicio'],['2230','Diamante']],1),S('ms17-t','T (K)',2,1200,1,300),CHK('ms17-log','Escala log-log',false)],'ms17-read',
 R`Capacidad calorífica molar según Dulong-Petit (gris), Einstein (azul, con \(\theta_E = \sqrt{3/5}\,\theta_D\approx0{,}775\,\theta_D\), que hace coincidir ambos modelos a alta temperatura hasta orden \((\theta/T)^2\)) y Debye (rojo). En escala log-log, Debye es una recta de pendiente 3 a baja temperatura, mientras que Einstein cae exponencialmente.`),
laws:[
['Dulong-Petit',R`C_V = 3Nk_B = 3R`,'Límite clásico (equipartición).'],
['Einstein',R`C_V = 3Nk_B\,\frac{x^2e^x}{(e^x-1)^2},\quad x = \frac{\theta_E}{T}`],
['Debye',R`C_V = 9Nk_B\Big(\frac{T}{\theta_D}\Big)^3\int_0^{\theta_D/T}\frac{x^4e^x}{(e^x-1)^2}\,dx`],
['Ley T³',R`C_V\approx\frac{12\pi^4}{5}Nk_B\Big(\frac{T}{\theta_D}\Big)^3`,R`Válida para \(T\lesssim\theta_D/20\).`],
['Densidad de modos',R`g(\omega) = \frac{9N\omega^2}{\omega_D^3},\quad 0\le\omega\le\omega_D`],
['Oscilador cuántico',R`\langle\varepsilon\rangle = \frac{\hbar\omega}{2}+\frac{\hbar\omega}{e^{\hbar\omega/k_BT}-1}`,'Es la distribución de Planck (Bose-Einstein con μ = 0).']],
ej:[R`El cobre tiene \(\theta_D = 343\) K. Estima su capacidad calorífica molar a 10 K y compárala con la de Dulong-Petit.`,[
R`A \(T = 10\) K, \(T/\theta_D = 0{,}029\): vale la ley \(T^3\).`,
R`\(C = \dfrac{12\pi^4}{5}R\left(\dfrac{T}{\theta_D}\right)^3 = 1944\times(0{,}0292)^3\) J/(mol·K).`,
R`\((0{,}0292)^3 = 2{,}48\times10^{-5}\), así que \(C\approx0{,}048\) J/(mol·K), unas 500 veces menos que \(3R = 24{,}9\).`,
R`A esta temperatura el término electrónico \(\gamma T = 0{,}0069\) J/(mol·K) ya supera el 10% del total.`]],
ref:'Kittel, <i>Introducción a la física del estado sólido</i>, cap. 5; Ashcroft & Mermin, cap. 23; Schroeder, cap. 7'}));

LABS['tme-solidos']=function(sec){
  const cv=$('#ms17-cv',sec),rd=$('#ms17-read',sec),lg=$('#ms17-log',sec);let thD=343;lg.onchange=()=>draw();
  segm(sec,'ms17-m','m',v=>{thD=+v;draw();});const gT=sl(sec,'ms17-t',v=>v+' K',()=>draw());
  const R0=8.314,Ein=(T,th)=>{const x=th/T;if(x>50)return 0;return 3*R0*x*x*Math.exp(x)/(Math.exp(x)-1)**2;};
  const Deb=(T,th)=>{const xd=th/T;if(xd>60)return 3*R0*(4*Math.PI**4/5)*(T/th)**3;return 9*R0*(T/th)**3*simpson(x=>x<1e-6?x*x:x**4*Math.exp(x)/(Math.exp(x)-1)**2,0,xd,200);};
  function draw(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.72,440,300),T=gT(),thE=0.806*thD,lo=lg.checked;
    let A;
    if(!lo){A=axes(ctx,{l:52,t:16,w:w-68,h:h-50,xr:[0,1200],yr:[0,28],xl:'T (K)',yl:'C (J/mol·K)'});
      polyl(ctx,A,[[0,3*R0],[1200,3*R0]],K.ax,2,[6,5]);curve(ctx,A,t=>Ein(t,thE),1,1200,K.a,2.6);curve(ctx,A,t=>Deb(t,thD),1,1200,K.w,3,null,240);
      polyl(ctx,A,[[thD,0],[thD,28]],K.d,1.2,[3,4]);label(ctx,'θ_D',A.X(thD)+4,A.o.t+10,K.d);
      dot(ctx,A.X(T),A.Y(Deb(T,thD)),6,'#fff',K.w);dot(ctx,A.X(T),A.Y(Ein(T,thE)),5,K.a);}
    else{const xr=[0,Math.log10(1200)],yr=[-5,1.6];A=axes(ctx,{l:52,t:16,w:w-68,h:h-50,xr,yr,xl:'T (K), log',yl:'C, log',xt:[0,1,2,3],xf:v=>nf(10**v,0),yt:[-5,-4,-3,-2,-1,0,1],yf:v=>v>=0?nf(10**v,0):'10⁻'+'⁰¹²³⁴⁵'[-v]});
      curve(ctx,A,u=>Math.log10(3*R0),0,xr[1],K.ax,2,[6,5]);curve(ctx,A,u=>{const c=Ein(10**u,thE);return c>0?Math.log10(c):NaN;},0.3,xr[1],K.a,2.6);
      curve(ctx,A,u=>Math.log10(Deb(10**u,thD)),0.3,xr[1],K.w,3,null,240);curve(ctx,A,u=>Math.log10(3*R0*(4*Math.PI**4/5)*(10**u/thD)**3),0.3,Math.log10(thD/3),K.w,1.3,[3,4]);
      label(ctx,'∝ T³',A.X(Math.log10(thD/12)),A.Y(Math.log10(3*R0*(4*Math.PI**4/5)*(1/12)**3))+16,K.w);
      dot(ctx,A.X(Math.log10(T)),A.Y(Math.log10(Deb(T,thD))),6,'#fff',K.w);}
    const cd=Deb(T,thD),ce=Ein(T,thE);
    rd.innerHTML=row('θ<sub>D</sub>',thD+' K')+row('θ<sub>E</sub> = √(3/5) θ<sub>D</sub>',nf(thE,0)+' K')+row('T/θ<sub>D</sub>',nf(T/thD,3))+sep+
      row('C Debye',nf(cd,cd<0.1?4:2)+' J/(mol·K)')+row('C Einstein',nf(ce,ce<0.1?4:2)+' J/(mol·K)')+row('C/3R (Debye)',nf(cd/(3*R0),3))+
      rowT(T<thD/20?'Régimen T³: solo se excitan fonones acústicos de baja frecuencia, con ħω ≲ k<sub>B</sub>T.':T>thD?'T &gt; θ<sub>D</sub>: todos los modos están excitados y se recupera Dulong-Petit.':'Régimen intermedio: parte de los modos están congelados.');
  }
  return {draw};
};

/* ---------- gran canónico ---------- */
V.push(topic({id:'tme-gran-canonico',p:'ms18',
lead:R`Si el sistema intercambia partículas además de energía con un reservorio, el número \(N\) también fluctúa. El reservorio fija la temperatura y el potencial químico \(\mu\). Este conjunto es el más cómodo para tratar gases cuánticos, porque en él los niveles de una partícula se ocupan de forma independiente.`,
res:[
[R`Derivación.`,R`Igual que en el canónico, pero el baño cede energía y partículas: \(p_{N,i}\propto e^{S_R(E_0-E_i,N_0-N)/k_B}\approx e^{-\beta(E_i-\mu N)}\), porque \(\partial S_R/\partial N_R = -\mu/T\).`],
[R`Gran función de partición.`,R`\(\Xi(T,V,\mu) = \sum_N\sum_ie^{-\beta(E_{N,i}-\mu N)} = \sum_Nz^NZ_N\), con la fugacidad \(z = e^{\beta\mu}\). El potencial termodinámico es el gran potencial \(\Omega_G = -k_BT\ln\Xi = -PV\).`],
[R`Promedios.`,R`\(\langle N\rangle = k_BT\dfrac{\partial\ln\Xi}{\partial\mu}\), \(P = \dfrac{k_BT}{V}\ln\Xi\), \(S = -\left(\dfrac{\partial\Omega_G}{\partial T}\right)_{V,\mu}\).`],
[R`Fluctuaciones del número.`,R`\(\langle\Delta N^2\rangle = k_BT\left(\dfrac{\partial\langle N\rangle}{\partial\mu}\right)_T = \langle N\rangle\,\dfrac{k_BT}{v}\,\kappa_T\). Para un gas ideal, \(\langle\Delta N^2\rangle = \langle N\rangle\) (estadística de Poisson). Cerca del punto crítico, \(\kappa_T\to\infty\) y las fluctuaciones crecen: opalescencia crítica.`],
[R`Adsorción de Langmuir.`,R`Una superficie con \(M\) sitios; cada sitio está vacío o tiene una molécula con energía \(-\varepsilon\). Por sitio, \(\xi = 1 + e^{\beta(\varepsilon+\mu)}\), y la ocupación es \(\theta = \dfrac{1}{e^{-\beta(\varepsilon+\mu)}+1}\). Con \(\mu = k_BT\ln(P/P_0)\) del gas: \(\theta = \dfrac{P}{P+P_0e^{-\beta\varepsilon}}\).`],
[R`Anticipo cuántico.`,R`La ocupación de Langmuir tiene la misma forma que la de Fermi-Dirac: un sitio que admite 0 o 1 partícula es como un nivel de un fermión. En la Unidad VI cada nivel de una partícula será un "sitio" del conjunto gran canónico.`]],
lab:PANE('ms18-cv',[S('ms18-mu','(μ + ε)/k<sub>B</sub>T',-4,4,0.05,0),S('ms18-t','k<sub>B</sub>T/ε',0.2,2,0.05,1)],'ms18-read',
 R`Superficie de 20 × 20 sitios en contacto con un gas a potencial químico \(\mu\). En cada paso se elige un sitio al azar y se ocupa con la probabilidad de equilibrio. Arriba a la derecha, la isoterma \(\theta(\mu)\) con el punto actual. Abajo, \(N(t)\) con la banda \(\pm\sigma_N\) teórica, \(\sigma_N^2 = M\theta(1-\theta) = k_BT\,\partial\langle N\rangle/\partial\mu\).`),
laws:[
['Probabilidad gran canónica',R`p_{N,i} = \frac{e^{-\beta(E_{N,i}-\mu N)}}{\Xi}`],
['Gran función de partición',R`\Xi = \sum_{N}e^{\beta\mu N}Z_N(T,V)`],
['Gran potencial',R`\Omega_G = -k_BT\ln\Xi = U - TS - \mu N = -PV`],
['Número medio',R`\langle N\rangle = k_BT\Big(\frac{\partial\ln\Xi}{\partial\mu}\Big)_{T,V}`],
['Fluctuaciones',R`\langle\Delta N^2\rangle = k_BT\Big(\frac{\partial\langle N\rangle}{\partial\mu}\Big)_{T,V}`],
['Langmuir',R`\theta = \frac{1}{e^{-\beta(\mu+\varepsilon)}+1}`,'Fracción de sitios ocupados.']],
ej:[R`Muestra que para un gas ideal clásico \(\Xi = \exp(zV/\lambda_T^3)\) y deduce \(PV = \langle N\rangle k_BT\) y \(\langle\Delta N^2\rangle = \langle N\rangle\).`,[
R`\(Z_N = \dfrac{1}{N!}\left(\dfrac{V}{\lambda_T^3}\right)^N\), así que \(\Xi = \sum_N\dfrac{1}{N!}\left(\dfrac{zV}{\lambda_T^3}\right)^N = \exp\!\left(\dfrac{zV}{\lambda_T^3}\right)\).`,
R`\(\langle N\rangle = z\dfrac{\partial\ln\Xi}{\partial z} = \dfrac{zV}{\lambda_T^3}\), y \(PV = k_BT\ln\Xi = \langle N\rangle k_BT\).`,
R`\(\langle\Delta N^2\rangle = z\dfrac{\partial\langle N\rangle}{\partial z} = \langle N\rangle\): fluctuaciones de Poisson.`,
R`De \(\langle N\rangle = zV/\lambda_T^3\) se obtiene \(\mu = k_BT\ln(n\lambda_T^3)\): el gas es clásico cuando \(n\lambda_T^3\ll1\), es decir, \(\mu\ll-k_BT\).`]],
ref:'Pathria & Beale, cap. 4; Reif, cap. 8; Schroeder, cap. 7'}));

LABS['tme-gran-canonico']=function(sec){
  const cv=$('#ms18-cv',sec),rd=$('#ms18-read',sec);const M=400;let s=new Uint8Array(M),Nn=0,trace=[],r=rng(8);
  const gmu=sl(sec,'ms18-mu',v=>nf(v,2),()=>draw()),gt=sl(sec,'ms18-t',v=>nf(v,2),()=>draw());
  const th=x=>1/(Math.exp(-x)+1);
  function sweep(){const p=th(gmu());for(let k=0;k<M;k++){const i=Math.floor(r()*M),o=r()<p?1:0;Nn+=o-s[i];s[i]=o;}trace.push(Nn);if(trace.length>300)trace.shift();}
  function draw(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.8,480,320),x=gmu(),T=gt(),q=th(x);
    const gw=Math.min(w*0.4,h*0.55),c=gw/20;
    for(let i=0;i<M;i++){const X=10+(i%20)*c,Y=10+Math.floor(i/20)*c;ctx.fillStyle='#e6ecfb';ctx.fillRect(X,Y,c-1,c-1);if(s[i])dot(ctx,X+c/2,Y+c/2,c*0.38,K.a);}
    const A=axes(ctx,{l:gw+56,t:12,w:w-gw-70,h:gw-6,xr:[-4,4],yr:[0,1],xl:'(μ+ε)/kT',yl:'θ'});
    curve(ctx,A,th,-4,4,K.a,3);dot(ctx,A.X(x),A.Y(q),6,'#fff',K.a);
    const sd=Math.sqrt(M*q*(1-q));
    const B=axes(ctx,{l:52,t:gw+44,w:w-66,h:h-gw-72,xr:[0,300],yr:[0,M],xl:'barridos',yl:'N'});
    fillPath(ctx,B,[[0,M*q-sd],[300,M*q-sd],[300,M*q+sd],[0,M*q+sd]],'rgba(36,83,201,.12)');polyl(ctx,B,[[0,M*q],[300,M*q]],K.a,1.4,[5,4]);polyl(ctx,B,trace.map((v,i)=>[i,v]),K.b,1.8);
    const m=trace.length?trace.reduce((a,b)=>a+b,0)/trace.length:0,v=trace.length>1?trace.reduce((a,b)=>a+(b-m)**2,0)/(trace.length-1):0;
    rd.innerHTML=row('k<sub>B</sub>T/ε',nf(T,2))+row('μ/ε',nf(x*T-1,3))+row('θ = ⟨N⟩/M',nf(q,3))+row('ξ por sitio = 1 + e<sup>β(μ+ε)</sup>',nf(1+Math.exp(x),3))+sep+
      row('⟨N⟩ teórico',nf(M*q,1))+row('⟨N⟩ medido',nf(m,1))+row('σ<sub>N</sub> teórica',nf(sd,2))+row('σ<sub>N</sub> medida',nf(Math.sqrt(v),2))+
      rowT('Ocupación con la forma de Fermi-Dirac: cada sitio admite 0 o 1 molécula. Las fluctuaciones son máximas para θ = 1/2.');
  }
  return {draw,tick(){if(!vis(cv))return;sweep();draw();}};
};

/* ================= UNIDAD VI · ESTADÍSTICA CUÁNTICA ================= */
V.push(topic({id:'tme-distribuciones',p:'ms19',
lead:R`En mecánica cuántica las partículas idénticas son realmente indistinguibles: intercambiar dos de ellas no produce un estado nuevo. El \(1/N!\) de Gibbs era una aproximación a esa idea. Contar bien los estados de bosones y fermiones lleva a las distribuciones de Bose-Einstein y de Fermi-Dirac, que se reducen a la de Maxwell-Boltzmann cuando el gas está diluido o caliente.`,
res:[
[R`Simetría de intercambio.`,R`Para dos partículas idénticas, \(|\psi(1,2)|^2 = |\psi(2,1)|^2\), así que \(\psi(2,1) = \pm\psi(1,2)\). Las de signo \(+\) son <i>bosones</i> (spin entero: fotones, fonones, ⁴He); las de signo \(-\), <i>fermiones</i> (spin semientero: electrones, protones, ³He).`],
[R`Exclusión de Pauli.`,R`Si dos fermiones están en el mismo estado de una partícula, la función antisimétrica se anula. Cada estado admite 0 o 1 fermión; un bosón admite cualquier número.`],
[R`Números de ocupación.`,R`Un microestado del gas queda determinado por \(\{n_k\}\), cuántas partículas hay en cada estado \(k\) de una partícula, sin decir cuál es cuál. Con \(E = \sum_kn_k\varepsilon_k\) y \(N = \sum_kn_k\), la gran función de partición se factoriza: \(\Xi = \prod_k\xi_k\).`],
[R`Bose-Einstein.`,R`\(\xi_k = \sum_{n=0}^\infty e^{-\beta(\varepsilon_k-\mu)n} = \dfrac{1}{1-e^{-\beta(\varepsilon_k-\mu)}}\), y \(\langle n_k\rangle = \dfrac{1}{e^{\beta(\varepsilon_k-\mu)}-1}\). Exige \(\mu<\varepsilon_0\) (el nivel más bajo) para que no diverja.`],
[R`Fermi-Dirac.`,R`\(\xi_k = 1 + e^{-\beta(\varepsilon_k-\mu)}\) y \(\langle n_k\rangle = \dfrac{1}{e^{\beta(\varepsilon_k-\mu)}+1}\le1\). A \(T = 0\) es un escalón: todos los estados con \(\varepsilon<\mu = \varepsilon_F\) llenos, los demás vacíos.`],
[R`Límite clásico.`,R`Si \(e^{\beta(\varepsilon-\mu)}\gg1\) para todos los estados ocupados, las dos se reducen a \(\langle n\rangle\approx e^{-\beta(\varepsilon-\mu)}\) (Maxwell-Boltzmann). La condición es \(n\lambda_T^3\ll1\): la distancia entre partículas debe ser mucho mayor que la longitud de onda térmica \(\lambda_T = h/\sqrt{2\pi mk_BT}\).`],
[R`Agrupamiento y antiagrupamiento.`,R`Con dos partículas en \(g\) estados, la probabilidad de que compartan estado es \(1/g\) para partículas distinguibles, \(2/(g+1)\) para bosones (tienden a juntarse) y 0 para fermiones (se evitan). El efecto Hanbury Brown-Twiss mide justamente esto.`]],
lab:TABS([['cur','Las tres curvas',PANE('ms19-cv',[S('ms19-x','(ε − μ)/k<sub>B</sub>T',-3,5,0.05,1)],'ms19-read',
 R`Ocupación media de un estado en función de \(x = (\varepsilon-\mu)/k_BT\). Fermi-Dirac (azul) nunca supera 1 y vale 1/2 en \(x = 0\). Bose-Einstein (naranja) solo existe para \(x>0\) y diverge en \(x\to0\): ahí empieza la condensación. Maxwell-Boltzmann (verde) queda en medio. Para \(x\gtrsim3\) las tres coinciden: es el límite clásico.`)],
 ['cont','Contar estados',PANE('ms19-cc',[G('ms19-n','n',[['2','N = 2'],['3','N = 3']]),G('ms19-g','g',[['2','g = 2'],['3','g = 3'],['4','g = 4']],1),G('ms19-k','k',[['mb','Distinguibles'],['be','Bosones'],['fd','Fermiones']],1)],'ms19-cread',
 R`Todas las maneras de poner \(N\) partículas en \(g\) estados de igual energía. Con partículas distinguibles (A, B, C) importa cuál está dónde; con bosones solo cuántas hay en cada estado; con fermiones, además, como máximo una por estado. Las configuraciones resaltadas tienen dos o más partículas en el mismo estado.`)]]),
laws:[
['Bose-Einstein',R`\langle n_k\rangle = \frac{1}{e^{\beta(\varepsilon_k-\mu)}-1}`,R`Requiere \(\mu<\varepsilon_\text{mín}\).`],
['Fermi-Dirac',R`\langle n_k\rangle = \frac{1}{e^{\beta(\varepsilon_k-\mu)}+1}`,R`\(0\le\langle n_k\rangle\le1\).`],
['Maxwell-Boltzmann',R`\langle n_k\rangle = e^{-\beta(\varepsilon_k-\mu)}`],
['Gran función de partición',R`\ln\Xi = \mp\sum_k\ln\!\big(1\mp e^{-\beta(\varepsilon_k-\mu)}\big)`,'Signo superior: bosones; inferior: fermiones.'],
['Número de estados (N en g)',[R`W_\text{BE} = \binom{g+N-1}{N},\quad W_\text{FD} = \binom{g}{N}`,R`W_\text{MB} = g^N\;\;(\text{distinguibles})`]],
['Criterio clásico',R`n\lambda_T^3\ll1,\qquad \lambda_T = \frac{h}{\sqrt{2\pi mk_BT}}`]],
ej:[R`¿Es clásico el gas de electrones de conducción del cobre a 300 K (\(n = 8{,}5\times10^{28}\ \text{m}^{-3}\))? ¿Y el helio gaseoso a 300 K y 1 atm?`,[
R`Electrones: \(\lambda_T = h/\sqrt{2\pi m_ek_BT} = 4{,}3\) nm, así que \(n\lambda_T^3 = 8{,}5\times10^{28}\times7{,}9\times10^{-26}\approx6700\gg1\). Es un gas de Fermi totalmente degenerado.`,
R`Helio: \(m = 6{,}6\times10^{-27}\) kg, \(\lambda_T = 0{,}050\) nm y \(n = P/k_BT = 2{,}4\times10^{25}\ \text{m}^{-3}\).`,
R`\(n\lambda_T^3 = 2{,}4\times10^{25}\times1{,}27\times10^{-31}\approx3\times10^{-6}\ll1\): el helio gaseoso es clásico.`,
R`La diferencia viene de la masa (\(m_\text{He}/m_e\approx7300\)) y de la densidad. El helio líquido a 2 K, en cambio, tiene \(n\lambda_T^3\sim1\) y muestra efectos cuánticos macroscópicos (superfluidez).`]],
ref:'Pathria & Beale, cap. 6; Reif, cap. 9; Huang, cap. 8'}));

LABS['tme-distribuciones']=function(sec){
  const cv=$('#ms19-cv',sec),rd=$('#ms19-read',sec),cc=$('#ms19-cc',sec),crd=$('#ms19-cread',sec);let N=2,g=3,kd='be';
  const gx=sl(sec,'ms19-x',v=>nf(v,2),()=>draw());
  segm(sec,'ms19-n','n',v=>{N=+v;draw();});segm(sec,'ms19-g','g',v=>{g=+v;draw();});segm(sec,'ms19-k','k',v=>{kd=v;draw();});
  const FD=x=>1/(Math.exp(x)+1),BE=x=>x>0?1/(Math.exp(x)-1):NaN,MB=x=>Math.exp(-x);
  function drawC(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.72,440,300),x=gx();
    const A=axes(ctx,{l:46,t:16,w:w-62,h:h-50,xr:[-3,5],yr:[0,3],xl:'(ε − μ)/kT',yl:'⟨n⟩'});
    polyl(ctx,A,[[0,0],[0,3]],K.ax,1.2,[3,4]);polyl(ctx,A,[[-3,1],[5,1]],K.ax,1.2,[3,4]);
    curve(ctx,A,MB,-3,5,K.r,2.6,[7,4]);curve(ctx,A,BE,0.005,5,K.b,3,null,800);curve(ctx,A,FD,-3,5,K.a,3);
    label(ctx,'Fermi-Dirac',A.X(-2.6),A.Y(1)-12,K.a);label(ctx,'Bose-Einstein',A.X(0.35),A.Y(2.6),K.b);label(ctx,'Maxwell-Boltzmann',A.X(-1.05),A.Y(2.75),K.r,'right');
    polyl(ctx,A,[[x,0],[x,3]],K.ink,1.4);[FD,BE,MB].forEach((f,i)=>{const v=f(x);if(isFinite(v)&&v<3)dot(ctx,A.X(x),A.Y(v),5,[K.a,K.b,K.r][i]);});
    const b=BE(x),f=FD(x),m=MB(x);
    rd.innerHTML=row('x = (ε − μ)/kT',nf(x,2))+row('Fermi-Dirac',nf(f,4))+row('Bose-Einstein',x>0?nf(b,4):'no definido (μ &gt; ε)')+row('Maxwell-Boltzmann',nf(m,4))+sep+
      (x>0?row('FD / MB',nf(f/m,3))+row('BE / MB',nf(b/m,3)):'')+
      rowT(x>3?'Límite clásico: ⟨n⟩ ≪ 1, los estados casi nunca se ocupan dos veces y la estadística no importa.':x>0?'Los fermiones ocupan menos que la predicción clásica (exclusión) y los bosones más (agrupamiento).':'Para ε &lt; μ, los estados de fermiones están casi llenos: 1 − ⟨n⟩ ≈ e<sup>x</sup> es la ocupación de "huecos".');
  }
  function configs(){const out=[];
    if(kd==='mb'){const tot=g**N;for(let c=0;c<tot;c++){const a=[];let v=c;for(let i=0;i<N;i++){a.push(v%g);v=Math.floor(v/g);}out.push(a);}}
    else{const rec=(st,arr)=>{if(arr.length===N){out.push(arr.slice());return;}for(let k=st;k<g;k++){if(kd==='fd'&&arr.includes(k))continue;arr.push(k);rec(kd==='fd'?k+1:k,arr);arr.pop();}};rec(0,[]);}
    return out;}
  function drawK(){
    if(!vis(cc))return;const {ctx,w,h}=fit(cc,.8,480,320),C=configs(),n=C.length;
    let cols=Math.ceil(Math.sqrt(n*w/h*0.9)),rows=Math.ceil(n/cols);const cw=(w-20)/cols,ch=(h-20)/Math.max(rows,1),bs=Math.min((cw-14)/g,ch-14,34);
    C.forEach((a,idx)=>{const cx=10+(idx%cols)*cw,cy=10+Math.floor(idx/cols)*ch,x0=cx+(cw-bs*g)/2,y0=cy+(ch-bs)/2;
      const cnt=new Array(g).fill(0);a.forEach(k=>cnt[k]++);const dbl=cnt.some(c=>c>1);
      if(dbl){ctx.fillStyle='rgba(217,72,15,.08)';ctx.fillRect(cx+2,cy+2,cw-4,ch-4);}
      for(let k=0;k<g;k++){ctx.strokeStyle=K.ax;ctx.lineWidth=1.2;ctx.strokeRect(x0+k*bs,y0,bs,bs);}
      if(kd==='mb'){a.forEach((k,i)=>{const j=a.slice(0,i).filter(q=>q===k).length,tot=cnt[k];const px=x0+k*bs+bs*(j+1)/(tot+1);
        ctx.save();ctx.font=`700 ${Math.max(9,bs*0.42)}px Inter`;ctx.fillStyle=[K.a,K.b,K.r][i];ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('ABC'[i],px,y0+bs/2);ctx.restore();});}
      else cnt.forEach((c,k)=>{for(let j=0;j<c;j++)dot(ctx,x0+k*bs+bs*(j+1)/(c+1),y0+bs/2,Math.max(2.5,bs*0.13),kd==='fd'?K.a:K.b);});});
    const nd=C.filter(a=>new Set(a).size<a.length).length;
    const mb=g**N,be=Math.round(Math.exp(lC(g+N-1,N))),fd=N>g?0:Math.round(Math.exp(lC(g,N)));
    crd.innerHTML=row('distinguibles g<sup>N</sup>',mb)+row('bosones C(g+N−1, N)',be)+row('fermiones C(g, N)',fd)+row('MB corregida g<sup>N</sup>/N!',nf(mb/(N===2?2:6),2))+sep+
      row('configuraciones con estados compartidos',nd+' de '+n)+row('P(compartir), N = 2',N===2?nf(kd==='mb'?1/g:kd==='be'?2/(g+1):0,3):'—')+
      rowT('g<sup>N</sup>/N! no es entero: el 1/N! de Gibbs solo es exacto cuando casi ningún estado está ocupado dos veces (límite diluido, g ≫ N).');
  }
  function draw(){drawC();drawK();}
  return {draw};
};

/* ---------- gas de Fermi ---------- */
V.push(topic({id:'tme-fermi',p:'ms20',
lead:R`Un gas de fermiones a baja temperatura no se "congela" en el estado de mínima energía: la exclusión de Pauli obliga a llenar niveles hasta una energía de Fermi que puede equivaler a decenas de miles de kelvin. Este gas degenerado explica los metales y la estabilidad de las enanas blancas.`,
res:[
[R`Densidad de estados.`,R`Para partículas libres en una caja de volumen \(V\) con degeneración de spin \(g_s = 2\): \(g(\varepsilon)\,d\varepsilon = \dfrac{g_sV}{4\pi^2}\left(\dfrac{2m}{\hbar^2}\right)^{3/2}\sqrt\varepsilon\,d\varepsilon\).`],
[R`Energía de Fermi.`,R`A \(T = 0\) se llenan los estados hasta \(\varepsilon_F\): \(N = \int_0^{\varepsilon_F}g\,d\varepsilon\) da \(\varepsilon_F = \dfrac{\hbar^2}{2m}(3\pi^2n)^{2/3}\). En el espacio de momentos, los estados ocupados forman la esfera de Fermi de radio \(k_F = (3\pi^2n)^{1/3}\).`],
[R`Energía y presión a T = 0.`,R`\(U_0 = \tfrac35N\varepsilon_F\) y \(P_0 = \tfrac25n\varepsilon_F\). Aunque \(T = 0\), los electrones se mueven con velocidades del orden de \(v_F\sim10^6\) m/s y ejercen una presión de degeneración enorme.`],
[R`Degeneración.`,R`La temperatura de Fermi \(T_F = \varepsilon_F/k_B\) es de \(10^4\)–\(10^5\) K en metales. A temperatura ambiente, \(T/T_F\sim0{,}005\): el gas está casi en su estado fundamental.`],
[R`Expansión de Sommerfeld.`,R`Solo los electrones a menos de \(\sim k_BT\) de \(\varepsilon_F\) pueden excitarse. Resultado: \(\mu\approx\varepsilon_F\left[1-\dfrac{\pi^2}{12}\left(\dfrac{T}{T_F}\right)^2\right]\), \(U\approx\tfrac35N\varepsilon_F+\dfrac{\pi^2}{4}N\dfrac{(k_BT)^2}{\varepsilon_F}\) y \(C_V\approx\dfrac{\pi^2}{2}Nk_B\dfrac{T}{T_F}\).`],
[R`El enigma resuelto.`,R`La teoría clásica (Drude) predecía \(\tfrac32Nk_B\) de calor específico electrónico, que no se observaba. Con \(T/T_F\sim0{,}005\), la contribución real es unas 100 veces menor.`],
[R`Enanas blancas.`,R`Una estrella sin combustible se sostiene por la presión de degeneración de los electrones. Si son relativistas, \(P\propto n^{4/3}\) y existe una masa máxima, el límite de Chandrasekhar \(M_\text{Ch}\approx1{,}4\,M_\odot\).`]],
lab:PANE('ms20-cv',[G('ms20-m','m',[['3.24','Sodio'],['7.00','Cobre'],['11.7','Aluminio']],1),S('ms20-t','T/T<sub>F</sub>',0.002,1.2,0.002,0.08)],'ms20-read',
 R`Izquierda: \(f(\varepsilon)\) de Fermi-Dirac (línea) y la distribución de electrones \(g(\varepsilon)f(\varepsilon)\propto\sqrt\varepsilon f\) (área), en unidades de \(\varepsilon_F\). El potencial químico se calcula numéricamente imponiendo \(N\) fijo. Derecha: \(\mu/\varepsilon_F\) y \(C_V/Nk_B\) frente a \(T/T_F\), con la aproximación de Sommerfeld en línea discontinua. A alta temperatura el gas se vuelve clásico y \(C_V\to\tfrac32Nk_B\).`),
laws:[
['Energía de Fermi',R`\varepsilon_F = \frac{\hbar^2}{2m}\big(3\pi^2n\big)^{2/3}`,R`Con \(g_s = 2\).`],
['Densidad de estados',R`g(\varepsilon) = \frac{3N}{2\varepsilon_F^{3/2}}\sqrt\varepsilon`,'Normalizada con N.'],
['Estado fundamental',R`U_0 = \tfrac35N\varepsilon_F,\qquad P_0 = \tfrac25n\varepsilon_F`],
['Sommerfeld',[R`\mu\approx\varepsilon_F\Big[1-\frac{\pi^2}{12}\Big(\frac{T}{T_F}\Big)^2\Big]`,R`C_V\approx\frac{\pi^2}{2}Nk_B\frac{T}{T_F}`]],
['Integral de Sommerfeld',R`\int_0^\infty\phi(\varepsilon)f(\varepsilon)\,d\varepsilon\approx\int_0^\mu\phi\,d\varepsilon+\frac{\pi^2}{6}(k_BT)^2\phi'(\mu)`],
['Chandrasekhar',R`M_\text{Ch}\approx\frac{5{,}83}{\mu_e^2}M_\odot\approx1{,}4\,M_\odot`,R`\(\mu_e = 2\) nucleones por electrón.`]],
ej:[R`Para el cobre (un electrón de conducción por átomo, \(\rho = 8{,}96\) g/cm³, \(M = 63{,}5\) g/mol) calcula \(n\), \(\varepsilon_F\), \(T_F\) y la velocidad de Fermi.`,[
R`\(n = \rho N_A/M = (8{,}96\times10^6)(6{,}022\times10^{23})/63{,}5 = 8{,}50\times10^{28}\ \text{m}^{-3}\).`,
R`\(k_F = (3\pi^2n)^{1/3} = 1{,}36\times10^{10}\ \text{m}^{-1}\) y \(\varepsilon_F = \hbar^2k_F^2/2m = 1{,}13\times10^{-18}\) J \(= 7{,}0\) eV.`,
R`\(T_F = \varepsilon_F/k_B = 8{,}2\times10^4\) K y \(v_F = \hbar k_F/m = 1{,}57\times10^6\) m/s.`,
R`A 300 K, \(T/T_F = 0{,}0037\) y \(C_e = \tfrac{\pi^2}{2}R\,(0{,}0037) = 0{,}15\) J/(mol·K): menos del 1% de la red.`]],
ref:'Ashcroft & Mermin, cap. 2; Kittel, cap. 6; Pathria & Beale, cap. 8'}));

LABS['tme-fermi']=function(sec){
  const cv=$('#ms20-cv',sec),rd=$('#ms20-read',sec);let eF=7.0;
  segm(sec,'ms20-m','m',v=>{eF=+v;draw();});const gt=sl(sec,'ms20-t',v=>nf(v,3),()=>draw());
  const cache={};
  function muOf(t){const k=t.toFixed(4);if(cache[k])return cache[k];
    const Nint=m=>simpson(x=>Math.sqrt(x)/(Math.exp(clamp((x-m)/t,-700,700))+1),0,Math.max(1,m)+40*t,1200);
    const m=bisect(m=>Nint(m)-2/3,-20,1.5,60);
    const U=1.5*simpson(x=>x*Math.sqrt(x)/(Math.exp(clamp((x-m)/t,-700,700))+1),0,Math.max(1,m)+40*t,1200);
    return cache[k]={m,U};}
  const Cof=t=>{const d=Math.max(0.001,t*0.02);return (muOf(t+d).U-muOf(Math.max(1e-4,t-d)).U)/(t+d-Math.max(1e-4,t-d));};
  const CURVE=[];for(let t=0.01;t<=1.2001;t+=0.02)CURVE.push([t,muOf(t).m,Cof(t)]);
  function draw(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.6,430,300),t=gt(),{m,U}=muOf(t),hw=Math.round(w*0.52);
    const A=axes(ctx,{l:44,t:16,w:hw-56,h:h-50,xr:[0,2.5],yr:[0,1.6],xl:'ε/ε_F'});
    const f=x=>1/(Math.exp(clamp((x-m)/t,-700,700))+1);
    const pts=[[0,0]];for(let i=0;i<=300;i++){const x=2.5*i/300;pts.push([x,Math.sqrt(x)*f(x)]);}pts.push([2.5,0]);fillPath(ctx,A,pts,'rgba(36,83,201,.22)');
    curve(ctx,A,x=>Math.sqrt(x),0,2.5,K.ax,1.4,[4,4]);curve(ctx,A,f,0,2.5,K.b,2.8);
    polyl(ctx,A,[[1,0],[1,1.6]],K.ink,1,[3,3]);polyl(ctx,A,[[m,0],[m,1.6]],K.d,1.8);label(ctx,'μ',A.X(m)+4,A.o.t+10,K.d);
    label(ctx,'f(ε)',A.X(0.15),A.Y(1)-10,K.b);label(ctx,'g(ε) ∝ √ε',A.X(2.4),A.Y(Math.sqrt(2.4))-10,K.mut,'right');
    const B=axes(ctx,{l:hw+40,t:16,w:w-hw-52,h:h-50,xr:[0,1.2],yr:[-0.6,1.6],xl:'T/T_F'});
    polyl(ctx,B,[[0,1.5],[1.2,1.5]],K.ax,1.2,[4,4]);label(ctx,'3/2 clásico',B.X(1.18),B.Y(1.5)-9,K.mut,'right');
    polyl(ctx,B,CURVE.map(q=>[q[0],q[1]]),K.d,2.6);polyl(ctx,B,CURVE.map(q=>[q[0],q[2]]),K.w,2.6);
    curve(ctx,B,x=>1-Math.PI**2/12*x*x,0,0.6,K.d,1.4,[5,4]);curve(ctx,B,x=>Math.PI**2/2*x,0,0.3,K.w,1.4,[5,4]);
    label(ctx,'μ/ε_F',B.X(0.05),B.Y(1)-12,K.d);label(ctx,'C/Nk',B.X(0.75),B.Y(Cof(0.75))+14,K.w);
    polyl(ctx,B,[[t,-0.6],[t,1.6]],K.ink,1.2,[3,4]);
    const TF=eF*11604.5,C=Cof(t);
    rd.innerHTML=row('ε<sub>F</sub>',nf(eF,2)+' eV')+row('T<sub>F</sub>',sci(TF,3)+' K')+row('T',sci(t*TF,3)+' K')+sep+
      row('μ/ε<sub>F</sub>',nf(m,4))+row('Sommerfeld 1 − π²τ²/12',nf(1-Math.PI**2/12*t*t,4))+row('U/(Nε<sub>F</sub>)',nf(U,4)+' (T = 0: 0,6)')+
      row('C<sub>V</sub>/Nk<sub>B</sub>',nf(C,4))+row('Sommerfeld π²τ/2',nf(Math.PI**2/2*t,4))+
      rowT(t<0.1?'Gas degenerado: solo se redistribuyen los electrones a ~k<sub>B</sub>T de ε<sub>F</sub>.':t>0.8?'μ ya es negativo o pequeño: el gas se acerca al régimen clásico y C → 3/2 Nk.':'Régimen intermedio: Sommerfeld empieza a fallar.');
  }
  return {draw};
};

/* ---------- gas de Bose ---------- */
V.push(topic({id:'tme-bose',p:'ms21',
lead:R`Einstein (1925), extendiendo el método de Bose para fotones a átomos con masa, encontró que por debajo de una temperatura crítica una fracción macroscópica de las partículas cae al estado fundamental. La condensación de Bose-Einstein se observó en 1995 en gases de rubidio y sodio enfriados a unos 100 nK.`,
res:[
[R`Número de partículas.`,R`\(N = \sum_k\dfrac{1}{e^{\beta(\varepsilon_k-\mu)}-1}\), con \(\mu<0\) si el nivel más bajo es \(\varepsilon_0 = 0\). Al pasar al continuo con \(g(\varepsilon)\propto\sqrt\varepsilon\): \(N_\text{ex} = \dfrac{V}{\lambda_T^3}\,\text{Li}_{3/2}(z)\), con \(z = e^{\beta\mu}\).`],
[R`El techo de los estados excitados.`,R`\(\text{Li}_{3/2}(z)\) crece con \(z\) pero está acotada: su máximo es \(\zeta(3/2) = 2{,}612\) en \(z = 1\). Los estados excitados pueden alojar como mucho \(N_\text{ex}^\text{máx} = 2{,}612\,V/\lambda_T^3\), y ese número baja con \(T\).`],
[R`Temperatura crítica.`,R`Cuando \(N\) supera ese techo, el resto debe ir al estado fundamental, que el continuo había ignorado (\(g(0) = 0\)). La condición \(n\lambda_{T_c}^3 = \zeta(3/2)\) da \(T_c = \dfrac{2\pi\hbar^2}{mk_B}\left(\dfrac{n}{2{,}612}\right)^{2/3}\).`],
[R`Fracción condensada.`,R`Para \(T<T_c\), \(\mu = 0\) y \(\dfrac{N_0}{N} = 1-\left(\dfrac{T}{T_c}\right)^{3/2}\). En \(T = 0\) todas las partículas están en el fundamental.`],
[R`Termodinámica.`,R`Debajo de \(T_c\): \(U = \tfrac32k_BT\,\dfrac{V}{\lambda_T^3}\zeta(5/2)\) y \(C_V\propto T^{3/2}\). En \(T_c\), \(C_V = 1{,}925\,Nk_B\), por encima del valor clásico, y su derivada es discontinua (una "cúspide"). La presión debajo de \(T_c\) no depende del volumen.`],
[R`Helio-4 y átomos fríos.`,R`Para la densidad del ⁴He líquido, la fórmula ideal da \(T_c = 3{,}1\) K; la transición superfluida real (punto λ) está en 2,17 K, con un pico de \(C\) en forma de λ. Las interacciones fuertes del líquido explican la diferencia. Los gases atómicos diluidos sí se comportan casi como el gas ideal de Bose.`]],
lab:PANE('ms21-cv',[S('ms21-t','T/T<sub>c</sub>',0.02,2.5,0.01,0.7)],'ms21-read',
 R`Izquierda: distribución de las partículas en energía. El área azul son los estados excitados, \(\propto\sqrt\varepsilon/(e^{(\varepsilon-\mu)/k_BT}-1)\), y la barra naranja en \(\varepsilon = 0\) es el condensado \(N_0/N\). Derecha: fracción condensada y \(C_V/Nk_B\) frente a \(T/T_c\). El potencial químico se obtiene resolviendo \(\text{Li}_{3/2}(z) = \zeta(3/2)\,(T_c/T)^{3/2}\) por encima de \(T_c\).`),
laws:[
['Número de partículas',R`N = N_0 + \frac{V}{\lambda_T^3}\,\text{Li}_{3/2}(z)`,R`\(\text{Li}_s(z) = \sum_{k\ge1}z^k/k^s\).`],
['Temperatura crítica',R`T_c = \frac{2\pi\hbar^2}{mk_B}\Big(\frac{n}{\zeta(3/2)}\Big)^{2/3}`,R`Equivale a \(n\lambda_{T_c}^3 = 2{,}612\).`],
['Fracción condensada',R`\frac{N_0}{N} = 1-\Big(\frac{T}{T_c}\Big)^{3/2}`],
['Calor específico (T < T_c)',R`\frac{C_V}{Nk_B} = \frac{15}{4}\frac{\zeta(5/2)}{\zeta(3/2)}\Big(\frac{T}{T_c}\Big)^{3/2}`,'Vale 1,925 en T = T<sub>c</sub>.'],
['Calor específico (T > T_c)',R`\frac{C_V}{Nk_B} = \frac{15}{4}\frac{\text{Li}_{5/2}(z)}{\text{Li}_{3/2}(z)}-\frac94\frac{\text{Li}_{3/2}(z)}{\text{Li}_{1/2}(z)}`,'Tiende a 3/2 a alta temperatura.'],
['Presión',R`P = \frac{k_BT}{\lambda_T^3}\,\text{Li}_{5/2}(z)`,'Debajo de T<sub>c</sub>: P ∝ T<sup>5/2</sup>, independiente de V.']],
ej:[R`En 1995, el grupo de Cornell y Wieman condensó ⁸⁷Rb (\(m = 1{,}44\times10^{-25}\) kg). Estima \(T_c\) con la fórmula del gas ideal para una densidad de \(3\times10^{19}\ \text{m}^{-3}\), típica del centro de la nube.`,[
R`\(T_c = \dfrac{2\pi\hbar^2}{mk_B}\left(\dfrac{n}{2{,}612}\right)^{2/3}\).`,
R`\(\dfrac{2\pi\hbar^2}{mk_B} = \dfrac{2\pi(1{,}055\times10^{-34})^2}{(1{,}44\times10^{-25})(1{,}381\times10^{-23})} = 3{,}52\times10^{-20}\ \text{K·m}^2\).`,
R`\((n/2{,}612)^{2/3} = (1{,}15\times10^{19})^{2/3} = 5{,}1\times10^{12}\ \text{m}^{-2}\), así que \(T_c\approx1{,}8\times10^{-7}\) K \(= 180\) nK.`,
R`Es comparable a los 170 nK medidos. Para condensar hay que llegar a temperaturas diez millones de veces menores que las del helio líquido, porque la densidad del gas es unas \(10^{9}\) veces menor.`]],
ref:'Pathria & Beale, cap. 7; Huang, cap. 12; Pethick & Smith, <i>Bose-Einstein Condensation in Dilute Gases</i>, cap. 2'}));

LABS['tme-bose']=function(sec){
  const cv=$('#ms21-cv',sec),rd=$('#ms21-read',sec);const z32=zeta(1.5),z52=zeta(2.5);
  const gt=sl(sec,'ms21-t',v=>nf(v,2),()=>draw());
  const aOf=t=>t<=1?0:bisect(a=>LiE(1.5,a)-z32/Math.pow(t,1.5),1e-9,30,70);
  const Cof=t=>{if(t<=1)return 3.75*z52/z32*Math.pow(t,1.5);const a=aOf(t);return 3.75*LiE(2.5,a)/LiE(1.5,a)-2.25*LiE(1.5,a)/LiE(0.5,a);};
  function draw(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.6,430,300),t=gt(),a=aOf(t),N0=t<1?1-Math.pow(t,1.5):0,hw=Math.round(w*0.52);
    const norm=2/(Math.sqrt(Math.PI)*z32),dens=x=>x<=0?0:norm*Math.sqrt(x)/(Math.exp(x/t+a)-1);
    const A=axes(ctx,{l:44,t:16,w:hw-56,h:h-50,xr:[-0.15,5],yr:[0,1.05],xl:'ε / k_BT_c',yl:'fracción por unidad de ε'});
    const pts=[[0.002,0]];for(let i=1;i<=300;i++){const x=5*i/300;pts.push([x,Math.min(1.05,dens(x))]);}pts.push([5,0]);fillPath(ctx,A,pts,'rgba(36,83,201,.25)');
    polyl(ctx,A,pts.slice(1,-1),K.a,2.4);
    ctx.fillStyle=K.b;const bx=A.X(-0.1),by=A.Y(N0);ctx.fillRect(bx,by,A.X(0.02)-bx,A.Y(0)-by);
    if(N0>0.02)label(ctx,'N₀/N = '+nf(N0,2),A.X(0.08),by-10,K.b);
    const B=axes(ctx,{l:hw+40,t:16,w:w-hw-52,h:h-50,xr:[0,2.5],yr:[0,2.1],xl:'T/T_c'});
    curve(ctx,B,x=>x<1?1-Math.pow(x,1.5):0,0,2.5,K.b,2.6);curve(ctx,B,Cof,0.01,2.5,K.d,2.6,null,300);
    polyl(ctx,B,[[0,1.5],[2.5,1.5]],K.ax,1.2,[4,4]);label(ctx,'3/2 clásico',B.X(2.45),B.Y(1.5)+11,K.mut,'right');
    label(ctx,'N₀/N',B.X(0.12),B.Y(0.92),K.b);label(ctx,'C/Nk',B.X(1.05),B.Y(1.95),K.d);
    polyl(ctx,B,[[t,0],[t,2.1]],K.ink,1.2,[3,4]);dot(ctx,B.X(t),B.Y(Cof(t)),5,K.d);dot(ctx,B.X(t),B.Y(N0),5,K.b);
    const mu=-a*t;
    rd.innerHTML=row('T/T<sub>c</sub>',nf(t,2))+row('μ/k<sub>B</sub>T<sub>c</sub>',t<=1?'0':nf(mu,4))+row('fugacidad z = e<sup>βμ</sup>',nf(Math.exp(-a),4))+sep+
      row('N₀/N (condensado)',nf(N0,4))+row('N<sub>ex</sub>/N',nf(1-N0,4))+row('C<sub>V</sub>/Nk<sub>B</sub>',nf(Cof(t),4))+
      rowT(t<1?'Debajo de T<sub>c</sub>: μ = 0, los estados excitados están "saturados" y el exceso de partículas se acumula en el fundamental.':t<1.2?'Justo encima de T<sub>c</sub>: μ ≈ 0⁻, la ocupación de los niveles bajos es muy grande pero aún no macroscópica.':'Lejos de T<sub>c</sub>: μ muy negativo y el gas se comporta casi clásicamente.');
  }
  return {draw};
};

/* ---------- gas de fotones ---------- */
V.push(topic({id:'tme-fotones',p:'ms22',
lead:R`La radiación en una cavidad a temperatura \(T\) es un gas de fotones: bosones sin masa cuyo número no se conserva, porque las paredes los absorben y emiten. Esa sola observación fija \(\mu = 0\), y la estadística de Bose-Einstein reproduce la ley de Planck que abrió la física cuántica en 1900.`,
res:[
[R`Por qué μ = 0.`,R`Si \(N\) no está fijado, el equilibrio minimiza \(F\) también respecto de \(N\): \(\left(\dfrac{\partial F}{\partial N}\right)_{T,V} = \mu = 0\). La ocupación de cada modo es \(\langle n\rangle = \dfrac{1}{e^{\hbar\omega/k_BT}-1}\), la distribución de Planck.`],
[R`Densidad de modos.`,R`Ondas electromagnéticas en una caja con dos polarizaciones: \(g(\nu)\,d\nu = \dfrac{8\pi V\nu^2}{c^3}\,d\nu\). Es la misma cuenta de Rayleigh-Jeans; lo que cambia es la energía media por modo.`],
[R`Ley de Planck.`,R`\(u(\nu,T) = \dfrac{8\pi h\nu^3}{c^3}\,\dfrac{1}{e^{h\nu/k_BT}-1}\). Para \(h\nu\ll k_BT\), \(\langle\varepsilon\rangle\to k_BT\) y se recupera Rayleigh-Jeans, que diverge a altas frecuencias. Para \(h\nu\gg k_BT\), los modos se congelan: así se evita la catástrofe ultravioleta.`],
[R`Stefan-Boltzmann y Wien.`,R`Integrando: \(u = aT^4\), con \(a = \dfrac{8\pi^5k_B^4}{15h^3c^3} = 7{,}566\times10^{-16}\ \text{J/(m}^3\text{K}^4)\), y la potencia emitida por un cuerpo negro es \(\sigma T^4\), con \(\sigma = ac/4\). El máximo en frecuencia está en \(h\nu_\text{máx} = 2{,}821\,k_BT\).`],
[R`Termodinámica del gas de fotones.`,R`\(F = -\tfrac13aVT^4\), \(S = \tfrac43aVT^3\), \(P = \tfrac13u\). Una expansión adiabática conserva \(VT^3\): por eso la radiación cósmica de fondo se enfrió de unos 3000 K a 2,725 K mientras el universo se expandía un factor 1100.`],
[R`Número de fotones.`,R`\(n = \dfrac{2\zeta(3)}{\pi^2}\left(\dfrac{k_BT}{\hbar c}\right)^3\approx2{,}03\times10^7\,T^3\ \text{m}^{-3}\). La energía media por fotón es \(2{,}70\,k_BT\). En el fondo cósmico hay unos 411 fotones por cm³.`],
[R`Fonones.`,R`Las vibraciones de un sólido son el mismo problema con tres polarizaciones, la velocidad del sonido en lugar de \(c\) y un corte en \(\omega_D\). Por eso la ley \(T^3\) de Debye es la ley de Stefan-Boltzmann de los fonones.`]],
lab:PANE('ms22-cv',[S('ms22-t','T (K)',1000,10000,100,5800),CHK('ms22-rj','Rayleigh-Jeans',true)],'ms22-read',
 R`Arriba, los dos ingredientes de la ley de Planck: la densidad de modos \(g(\nu)\propto\nu^2\) (crece sin límite) y la ocupación de Bose-Einstein con \(\mu = 0\), \(\langle n\rangle = 1/(e^{h\nu/k_BT}-1)\) (cae exponencialmente). Abajo, su producto por \(h\nu\): la densidad espectral de energía \(u(\nu)\). La banda de colores marca el visible. Las curvas grises son 3000 K y 6000 K como referencia; 5800 K es aproximadamente la superficie del Sol.`),
laws:[
['Planck',R`u(\nu,T) = \frac{8\pi h\nu^3}{c^3}\,\frac{1}{e^{h\nu/k_BT}-1}`],
['Stefan-Boltzmann',[R`u = aT^4,\qquad a = \frac{8\pi^5k_B^4}{15h^3c^3}`,R`j = \sigma T^4,\qquad\sigma = \frac{ac}{4} = 5{,}670\times10^{-8}\ \tfrac{\text{W}}{\text{m}^2\text{K}^4}`]],
['Wien',R`h\nu_\text{máx} = 2{,}821\,k_BT,\qquad\lambda_\text{máx}T = 2{,}898\ \text{mm·K}`,'Los dos máximos no corresponden a la misma longitud de onda.'],
['Presión y entropía',R`P = \frac{u}{3},\qquad S = \frac43aVT^3`],
['Número de fotones',R`n = \frac{2\zeta(3)}{\pi^2}\Big(\frac{k_BT}{\hbar c}\Big)^3`],
['Adiabática',R`VT^3 = \text{cte}\;\Leftrightarrow\;PV^{4/3} = \text{cte}`,'γ efectivo = 4/3.']],
ej:[R`Para la radiación cósmica de fondo (\(T = 2{,}725\) K), calcula la densidad de energía, el número de fotones por cm³ y la frecuencia del máximo.`,[
R`\(u = aT^4 = 7{,}566\times10^{-16}\times(2{,}725)^4 = 4{,}17\times10^{-14}\ \text{J/m}^3\), unos 0,26 eV/cm³.`,
R`\(n = 2{,}03\times10^7\times(2{,}725)^3 = 4{,}11\times10^8\ \text{m}^{-3} = 411\ \text{cm}^{-3}\).`,
R`\(\nu_\text{máx} = 2{,}821\,k_BT/h = 160\) GHz, en microondas (λ ≈ 1,9 mm).`,
R`Energía media por fotón: \(u/n = 1{,}01\times10^{-22}\) J \(= 2{,}70\,k_BT\), como predice la estadística de Bose.`]],
ref:'Reif, cap. 9; Pathria & Beale, cap. 7; Schroeder, cap. 7'}));

LABS['tme-fotones']=function(sec){
  const cv=$('#ms22-cv',sec),rd=$('#ms22-read',sec),rj=$('#ms22-rj',sec);rj.onchange=()=>draw();
  const gt=sl(sec,'ms22-t',v=>v+' K',()=>draw());
  const h=6.62607e-34,kB=1.380649e-23,c=2.99792458e8;
  const u=(nu,T)=>8*Math.PI*h*nu**3/c**3/(Math.exp(h*nu/(kB*T))-1);
  const wl=l=>{let r=0,g=0,b=0;if(l>=380&&l<440){r=-(l-440)/60;b=1;}else if(l<490){g=(l-440)/50;b=1;}else if(l<510){g=1;b=-(l-510)/20;}else if(l<580){r=(l-510)/70;g=1;}else if(l<645){r=1;g=-(l-645)/65;}else if(l<=780){r=1;}return `rgba(${Math.round(255*r)},${Math.round(255*g)},${Math.round(255*b)},.35)`;};
  function draw(){
    if(!vis(cv))return;const {ctx,w,h:H}=fit(cv,.8,480,320),T=gt(),nmax=1.2e15,s=1e14;
    const hh=(H-70)*0.4;
    const A=axes(ctx,{l:56,t:14,w:w-72,h:hh,xr:[0,12],yr:[0,1.1],yl:'⟨n⟩  ·  g/g(12)',xf:v=>'',yf:v=>nf(v,1)});
    curve(ctx,A,x=>(x/12)**2,0,12,K.d,2.6);curve(ctx,A,x=>1/(Math.exp(h*x*s/(kB*T))-1),0.05,12,K.r,2.6);
    label(ctx,'g(ν) ∝ ν²',A.X(10.5),A.Y(0.8),K.d,'right');label(ctx,'⟨n⟩ = 1/(e^(hν/kT) − 1)',A.X(2.2),A.Y(0.85),K.r);
    const umax=u(2.821*kB*T/h,T);
    const E15=1e15;const B=axes(ctx,{l:56,t:hh+42,w:w-72,h:H-hh-72,xr:[0,12],yr:[0,umax*1.25*E15],xl:'ν (10¹⁴ Hz)',yl:'u(ν) (10⁻¹⁵ J·s/m³)'});
    for(let l=380;l<780;l+=4){const x1=c/(l*1e-9)/s,x2=c/((l+4)*1e-9)/s;ctx.fillStyle=wl(l);ctx.fillRect(B.X(x2),B.o.t,B.X(x1)-B.X(x2)+1,B.o.h);}
    [3000,6000].forEach(T2=>{if(Math.abs(T2-T)>50)curve(ctx,B,x=>E15*u(x*s,T2),0.01,12,'rgba(93,101,119,.45)',1.5);});
    if(rj.checked)curve(ctx,B,x=>E15*8*Math.PI*(x*s)**2*kB*T/c**3,0.01,12,K.mut,1.8,[6,4]);
    curve(ctx,B,x=>E15*u(x*s,T),0.01,12,K.b,3);
    const numax=2.821*kB*T/h;polyl(ctx,B,[[numax/s,0],[numax/s,umax*E15]],K.b,1.2,[3,3]);
    const a=7.5657e-16,U=a*T**4,n=2.0287e7*T**3;
    rd.innerHTML=row('T',T+' K')+row('ν<sub>máx</sub> = 2,821 kT/h',sci(numax,3)+' Hz')+row('λ<sub>máx</sub> = 2,898 mm·K / T',nf(2.898e6/T,0)+' nm')+sep+
      row('u = aT⁴',sci(U,3)+' J/m³')+row('emitancia σT⁴',sci(5.670e-8*T**4,3)+' W/m²')+row('n de fotones',sci(n,3)+' m⁻³')+row('energía media por fotón',nf(U/n/(kB*T),2)+' k<sub>B</sub>T')+row('presión u/3',sci(U/3,3)+' Pa')+
      rowT('Rayleigh-Jeans usa ⟨ε⟩ = k<sub>B</sub>T para todos los modos y diverge. La ocupación de Bose-Einstein apaga los modos con hν ≫ k<sub>B</sub>T.');
  }
  return {draw};
};

/* ---------- insertar vistas ---------- */
{const anchor=document.querySelector('.view[data-view="ejercicios"]');const tmp=document.createElement('div');tmp.innerHTML=V.join('\n');
 [...tmp.children].forEach(n=>anchor.parentNode.insertBefore(n,anchor));}

/* ---------- integración con el router ---------- */
const inst={};let cur=null;
function hook(){
  const id=(location.hash||'').slice(1);cur=null;
  if(!LABS[id])return;const sec=document.querySelector(`.view[data-view="${id}"]`);if(!sec)return;
  if(!inst[id]){
    try{inst[id]=LABS[id](sec)||{};}catch(e){console.error(e);return;}
    $$('.tabs',sec).forEach(bar=>bar.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
      bar.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
      const blk=bar.closest('.block');blk.querySelectorAll('.tabpane').forEach(p=>p.classList.toggle('on',p.dataset.pane===b.dataset.t));
      if(inst[id].tab)inst[id].tab(b.dataset.t);requestAnimationFrame(()=>inst[id].draw&&inst[id].draw());}));
  }
  cur=id;requestAnimationFrame(()=>{try{inst[id].draw&&inst[id].draw();}catch(e){console.error(e);}});
}
addEventListener('hashchange',()=>requestAnimationFrame(hook));
requestAnimationFrame(hook);
let rz=0;addEventListener('resize',()=>{cancelAnimationFrame(rz);rz=requestAnimationFrame(()=>{if(cur&&inst[cur]&&inst[cur].draw)inst[cur].draw();});});
let last=performance.now();
(function loop(t){const dt=Math.min(.05,Math.max(0,(t-last)/1000));last=t;
  if(cur&&inst[cur]&&inst[cur].tick&&!document.hidden){try{inst[cur].tick(dt);}catch(e){console.error(e);}}
  requestAnimationFrame(loop);})(last);
})();
