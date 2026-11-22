/* Álgebra y Análisis: Álgebra lineal y Variable compleja — vistas y laboratorios */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const K={t:'#0f766e',ts:'#dcf0eb',a:'#2453c9',b:'#d9480f',r:'#2b8a3e',d:'#7048e8',w:'#c92a2a',f:'#e67700',ink:'#1c2230',mut:'#5d6577',ax:'#9aa1b0',gr:'#eeeae0',line:'#e3ddcf'};
const TAU=Math.PI*2;

/* ---------- estilos propios del área ---------- */
{const st=document.createElement('style');st.textContent=`
:root{--aa:#0f766e;--aa-soft:#dcf0eb}
.theme-aa{--fis:var(--aa);--fis-soft:var(--aa-soft)}
.choice.aa:hover{border-color:var(--aa)}
.choice.aa .go{color:var(--aa)}
.course.aa-c .num{color:var(--aa)}
.course.aa-c:hover{border-color:var(--aa)}
.course.aa-c .tag{background:var(--aa-soft);color:var(--aa)}
.sr-gh.aa{color:var(--aa)}
.topic.soon{opacity:.62;box-shadow:none;cursor:default}
.topic.soon:hover{transform:none;border-color:var(--line);box-shadow:none}
.topic.soon .thumb{background:var(--kl-soft)}
.topic.soon .chip{display:inline-block;margin-top:10px}
.aa-unit{margin-top:34px}
.aa-unit + .topics{margin-top:14px}
.aa-mat{display:inline-table;border-collapse:separate;border-spacing:8px 2px;border-left:2px solid var(--ink);border-right:2px solid var(--ink);border-radius:5px;vertical-align:middle;margin:2px 4px;font-family:"JetBrains Mono",monospace;font-size:.86rem}
.aa-mat td{text-align:center;min-width:2.2em;padding:0 2px}
.aa-aug{width:100%;border-collapse:collapse;font-family:"JetBrains Mono",monospace;font-size:.95rem;background:var(--kl-raise)}
.aa-aug td,.aa-aug th{text-align:center;padding:9px 6px;border-bottom:1px solid var(--line)}
.aa-aug th{font:700 .75rem Inter,sans-serif;color:var(--muted);letter-spacing:.06em}
.aa-aug td.bar,.aa-aug th.bar{border-left:2px solid var(--ink)}
.aa-aug tr.chg td{background:rgba(245,184,28,.14)}
.aa-aug td.piv{background:var(--aa-soft);color:var(--aa);font-weight:700;border-radius:6px}
.aa-aug td.lbl{font:600 .78rem Inter,sans-serif;color:var(--muted);text-align:left;width:34px}
.aa-op{margin-top:12px;padding:12px 14px;border-radius:12px;background:var(--kl-soft);font-size:.95rem;min-height:48px}
.aa-op b{font-family:"JetBrains Mono",monospace;font-weight:600;color:var(--aa)}
.aa-steps{font:600 .82rem Inter,sans-serif;color:var(--muted);margin-left:auto}
.aa-thread{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(250px,1fr))}
.aa-thread .law{border-top:4px solid var(--aa)}
.aa-sel{font:500 .9rem Inter,sans-serif;border:1px solid var(--line);border-radius:10px;padding:7px 10px;background:var(--kl-raise);color:var(--ink);max-width:100%}
.view.theme-aa .controls .slider input{width:96px}
.view.theme-aa .controls .slider b{min-width:40px}
.aa-ok{color:var(--kl-c-green);font-weight:700}.aa-no{color:var(--kl-c-red);font-weight:700}
#ag-lab .slider input{width:74px}
#ag-lab .controls .slider b{min-width:34px}
`;document.head.appendChild(st);}

/* ---------- formato ---------- */
function nf(x,d=2){if(!isFinite(x))return x>0?'∞':'−∞';const s=(Math.abs(x)<0.5*10**-d?0:x).toFixed(d);return s.replace('-','−').replace('.',',');}
function nt(x,d=2){/* número sin ceros sobrantes */let s=nf(x,d);if(s.includes(','))s=s.replace(/0+$/,'').replace(/,$/,'');return s==='−0'?'0':s;}
const row=(k,v)=>`<div><span class="k">${k}</span> = <b>${v}</b></div>`;
const rowT=t=>`<div class="k" style="margin-top:6px">${t}</div>`;
const sep='<div style="border-top:1px solid var(--line);margin:6px 0"></div>';
const mat=M=>`<table class="aa-mat">${M.map(r=>`<tr>${r.map(v=>`<td>${typeof v==='number'?nt(v):v}</td>`).join('')}</tr>`).join('')}</table>`;

/* ---------- fracciones exactas ---------- */
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a||1;};
function Q(n,d=1){if(d<0){n=-n;d=-d;}const g=gcd(n,d);return {n:n/g,d:d/g};}
const qadd=(a,b)=>Q(a.n*b.d+b.n*a.d,a.d*b.d),qsub=(a,b)=>Q(a.n*b.d-b.n*a.d,a.d*b.d),
      qmul=(a,b)=>Q(a.n*b.n,a.d*b.d),qdiv=(a,b)=>Q(a.n*b.d,a.d*b.n),qz=a=>a.n===0,qneg=a=>Q(-a.n,a.d);
const qs=a=>{const s=a.d===1?String(Math.abs(a.n)):`${Math.abs(a.n)}/${a.d}`;return (a.n<0?'−':'')+s;};

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
function dot(ctx,x,y,r,col,stroke){ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=col;ctx.fill();if(stroke){ctx.lineWidth=2;ctx.strokeStyle=stroke;ctx.stroke();}}
function label(ctx,t,x,y,col=K.ink,align='left',base='middle',font='600 12px Inter, sans-serif'){
  ctx.save();ctx.font=font;ctx.textAlign=align;ctx.textBaseline=base;ctx.lineWidth=4;ctx.strokeStyle='rgba(255,255,255,.92)';ctx.lineJoin='round';ctx.strokeText(t,x,y);ctx.fillStyle=col;ctx.fillText(t,x,y);ctx.restore();}
function arrow(ctx,x1,y1,x2,y2,col,lw=2.5,dash){
  const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy);if(L<1)return;const ux=dx/L,uy=dy/L,hd=Math.min(11,L*.45);
  ctx.save();ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=lw;ctx.lineCap='round';if(dash)ctx.setLineDash(dash);
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2-ux*hd*.8,y2-uy*hd*.8);ctx.stroke();ctx.setLineDash([]);
  ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-ux*hd-uy*hd*.5,y2-uy*hd+ux*hd*.5);ctx.lineTo(x2-ux*hd+uy*hd*.5,y2-uy*hd-ux*hd*.5);ctx.closePath();ctx.fill();ctx.restore();}
/* plano cartesiano con escala uniforme: R = semiancho visible en unidades */
function plane(ctx,w,h,R,ox=0,ow=w){
  const s=Math.min(ow,h)/(2*R),cx=ox+ow/2,cy=h/2;
  const P={s,cx,cy,X:x=>cx+x*s,Y:y=>cy-y*s,ix:px=>(px-cx)/s,iy:py=>(cy-py)/s,
    xr:[(ox-cx)/s,(ox+ow-cx)/s],yr:[-h/2/s,h/2/s]};
  ctx.save();ctx.beginPath();ctx.rect(ox,0,ow,h);ctx.clip();
  ctx.strokeStyle=K.gr;ctx.lineWidth=1;
  for(let i=Math.ceil(P.xr[0]);i<=P.xr[1];i++){ctx.beginPath();ctx.moveTo(P.X(i),0);ctx.lineTo(P.X(i),h);ctx.stroke();}
  for(let j=Math.ceil(P.yr[0]);j<=P.yr[1];j++){ctx.beginPath();ctx.moveTo(ox,P.Y(j));ctx.lineTo(ox+ow,P.Y(j));ctx.stroke();}
  ctx.strokeStyle=K.ax;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(ox,cy);ctx.lineTo(ox+ow,cy);ctx.moveTo(cx,0);ctx.lineTo(cx,h);ctx.stroke();
  ctx.restore();return P;}
/* malla transformada por A=[[a,b],[c,d]] */
function tgrid(ctx,P,A,N,col){
  const T=(x,y)=>[P.X(A[0][0]*x+A[0][1]*y),P.Y(A[1][0]*x+A[1][1]*y)];
  ctx.save();ctx.strokeStyle=col;ctx.lineWidth=1;
  for(let i=-N;i<=N;i++){let p=T(i,-N),q=T(i,N);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();
    p=T(-N,i);q=T(N,i);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();}
  ctx.restore();}
function poly(ctx,P,pts,A,fill,stroke,lw=2,dash){
  ctx.save();ctx.beginPath();pts.forEach(([x,y],i)=>{const u=A?A[0][0]*x+A[0][1]*y:x,v=A?A[1][0]*x+A[1][1]*y:y;i?ctx.lineTo(P.X(u),P.Y(v)):ctx.moveTo(P.X(u),P.Y(v));});ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;if(dash)ctx.setLineDash(dash);ctx.stroke();}ctx.restore();}
const FIG=[[0,0],[0.5,0],[0.5,1],[1.2,1],[1.2,1.4],[0.5,1.4],[0.5,2],[1.5,2],[1.5,2.5],[0,2.5]]; /* letra F: deja ver giros y reflexiones */

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
const snap=(v,s=0.25)=>Math.round(v/s)*s;

const LABS={};
const DONE=new Set(['al-espacios','al-base','al-coordenadas','al-transformaciones','al-semejanza','al-autovalores','al-diagonalizacion','al-producto-interno','al-gram-schmidt','al-ortogonales','al-cn','al-espectral','al-formas-cuadraticas','algebra-lineal-ejercicios','vc-complejos','vc-polar','vc-topologia','vc-funciones','vc-cauchy-riemann','vc-armonicas','vc-elementales','vc-log-ramas','vc-conformes','vc-contorno','vc-cauchy-goursat','vc-formula-cauchy','vc-series','vc-laurent','vc-residuos','vc-integrales-reales','vc-kramers-kronig','variable-compleja-ejercicios']);

/* ---------- 3D ortográfico con rotación por arrastre ---------- */
function cam3(cv,st,redraw){
  let on=false,px=0,py=0;
  cv.addEventListener('pointerdown',e=>{on=true;px=e.clientX;py=e.clientY;cv.setPointerCapture(e.pointerId);st.auto=false;cv.style.cursor='grabbing';});
  cv.addEventListener('pointermove',e=>{if(!on){cv.style.cursor='grab';return;}st.yaw-=(e.clientX-px)*0.01;st.pitch=Math.max(-1.5,Math.min(1.5,st.pitch+(e.clientY-py)*0.01));px=e.clientX;py=e.clientY;redraw();});
  const up=()=>{on=false;cv.style.cursor='grab';};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);}
function P3(st,w,h,R){
  const cy=Math.cos(st.yaw),sy=Math.sin(st.yaw),cp=Math.cos(st.pitch),sp=Math.sin(st.pitch),s=Math.min(w,h)/(2.3*R);
  const T=(x,y,z)=>{const x1=cy*x-sy*y,y1=sy*x+cy*y,z1=z*cp-y1*sp,d=y1*cp+z*sp;return [w/2+x1*s,h/2-z1*s,d];};
  return {T,s};}
function axes3(ctx,P,R,lab=['x','y','z']){
  [[R,0,0],[0,R,0],[0,0,R]].forEach((v,i)=>{const a=P.T(-v[0],-v[1],-v[2]),b=P.T(...v);
    ctx.save();ctx.strokeStyle=K.ax;ctx.lineWidth=1.2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();ctx.restore();
    label(ctx,lab[i],b[0]+6,b[1],K.mut,'left','middle','600 12px Inter');});}
function arrow3(ctx,P,a,b,col,lw=3,dash){const p=P.T(...a),q=P.T(...b);arrow(ctx,p[0],p[1],q[0],q[1],col,lw,dash);}
function face3(ctx,P,pts,fill,stroke){ctx.save();ctx.beginPath();pts.forEach((v,i)=>{const p=P.T(...v);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);});ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.2;ctx.stroke();}ctx.restore();}
const v3={add:(a,b)=>a.map((x,i)=>x+b[i]),sub:(a,b)=>a.map((x,i)=>x-b[i]),mul:(a,k)=>a.map(x=>x*k),dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
  cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm:a=>Math.hypot(...a)};
const det3=(a,b,c)=>v3.dot(a,v3.cross(b,c));
const vs=(v,d=2)=>'('+v.map(x=>nt(x,d)).join(', ')+')';

/* ---------- números complejos [re, im] ---------- */
const C={
  add:(a,b)=>[a[0]+b[0],a[1]+b[1]],sub:(a,b)=>[a[0]-b[0],a[1]-b[1]],
  mul:(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]],
  div:(a,b)=>{const d=b[0]*b[0]+b[1]*b[1];return [(a[0]*b[0]+a[1]*b[1])/d,(a[1]*b[0]-a[0]*b[1])/d];},
  conj:a=>[a[0],-a[1]],abs:a=>Math.hypot(a[0],a[1]),arg:a=>Math.atan2(a[1],a[0]),
  sc:(a,k)=>[a[0]*k,a[1]*k],
  exp:a=>{const r=Math.exp(a[0]);return [r*Math.cos(a[1]),r*Math.sin(a[1])];},
  log:a=>[Math.log(Math.hypot(a[0],a[1])),Math.atan2(a[1],a[0])],
  pow:(a,n)=>{if(a[0]===0&&a[1]===0)return [0,0];const r=Math.pow(Math.hypot(a[0],a[1]),n),t=Math.atan2(a[1],a[0])*n;return [r*Math.cos(t),r*Math.sin(t)];},
  sin:a=>[Math.sin(a[0])*Math.cosh(a[1]),Math.cos(a[0])*Math.sinh(a[1])],
  cos:a=>[Math.cos(a[0])*Math.cosh(a[1]),-Math.sin(a[0])*Math.sinh(a[1])],
  sqrt:a=>{const r=Math.sqrt(Math.hypot(a[0],a[1])),t=Math.atan2(a[1],a[0])/2;return [r*Math.cos(t),r*Math.sin(t)];},
  polar:(r,t)=>[r*Math.cos(t),r*Math.sin(t)]};
function cs(z,d=2){const a=Math.abs(z[0])<0.5*10**-d?0:z[0],b=Math.abs(z[1])<0.5*10**-d?0:z[1];
  if(b===0)return nt(a,d);const bi=(Math.abs(b)===1?'':nt(Math.abs(b),d))+'i';if(a===0)return (b<0?'−':'')+bi;return nt(a,d)+(b<0?' − ':' + ')+bi;}
const deg=t=>nt(t*180/Math.PI,1)+'°';

/* ---------- coloreado de dominio ---------- */
function hsl2rgb(h,s,l){const k=n=>(n+h*12)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1));return [f(0)*255,f(8)*255,f(4)*255];}
function domainColor(ctx,P,w,h,f,opt={}){
  const st=opt.step||2,W=Math.ceil(w/st),H=Math.ceil(h/st),off=document.createElement('canvas');off.width=W;off.height=H;
  const oc=off.getContext('2d'),img=oc.createImageData(W,H),D=img.data;
  for(let j=0;j<H;j++)for(let i=0;i<W;i++){
    const z=[P.ix(i*st+st/2),P.iy(j*st+st/2)],v=f(z),k=(j*W+i)*4;
    if(!v||!isFinite(v[0])||!isFinite(v[1])){D[k]=D[k+1]=D[k+2]=255;D[k+3]=255;continue;}
    const m=Math.hypot(v[0],v[1]),hue=((Math.atan2(v[1],v[0])/TAU)%1+1)%1;
    const lm=Math.log2(m+1e-300),fr=lm-Math.floor(lm);
    const base=0.08+0.84*(2/Math.PI)*Math.atan(Math.pow(m,0.55));let l=base*(0.86+0.14*fr);if(m<1e-12)l=0;if(m>1e12)l=1;
    if(opt.grid){const ph=Math.atan2(v[1],v[0])*6/Math.PI,g=Math.abs(ph-Math.round(ph));if(g<0.05)l*=0.75;}
    const c=hsl2rgb(hue,0.85,l);D[k]=c[0];D[k+1]=c[1];D[k+2]=c[2];D[k+3]=255;}
  oc.putImageData(img,0,0);ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(off,0,0,w,h);ctx.restore();}
function cplane(ctx,w,h,R,ox=0,ow=w,lab=true){
  const P=plane(ctx,w,h,R,ox,ow);if(lab){label(ctx,'Re',ox+ow-8,P.cy-10,K.mut,'right','middle','600 11px Inter');label(ctx,'Im',P.cx+8,12,K.mut,'left','middle','600 11px Inter');}return P;}
/* integral de contorno por el método de Simpson sobre un camino z(t), t∈[0,1] */
function cint(f,z,N=2000){let s=[0,0];const h=1/N;
  for(let k=0;k<N;k++){const t0=k*h,t1=t0+h,tm=t0+h/2,a=z(t0),b=z(t1),m=z(tm);
    const dz=C.sub(b,a),fv=C.add(C.add(f(a),f(b)),C.sc(f(m),4));s=C.add(s,C.mul(C.sc(fv,1/6),dz));}
  return s;}

/* ---------- constructores de páginas ---------- */
function topicPage(o){const p=o.pre;return `<section class="view theme-aa" data-view="${o.id}">
<div class="eyebrow">${o.course} · ${o.unit}</div><h1>${o.title}</h1><p class="lead">${o.lead}</p>
<div class="toc"><a href="#${p}-res" data-scroll>Resumen</a><a href="#${p}-lab" data-scroll>Visualiza</a><a href="#${p}-leyes" data-scroll>Leyes y fórmulas</a><a href="#${p}-ej" data-scroll>Ejemplo</a></div>
<div class="block" id="${p}-res"><h2><span class="ico">≡</span>Resumen</h2><ul class="keypoints">${o.res.map(r=>`<li>${r}</li>`).join('')}</ul></div>
<div class="block" id="${p}-lab"><h2><span class="ico">◎</span>Visualiza</h2>${o.lab}</div>
<div class="block" id="${p}-leyes"><h2><span class="ico">§</span>Leyes y fórmulas</h2><div class="laws">${o.laws.map(l=>`<div class="law"><h3>${l[0]}</h3><div class="eq">\\[ ${l[1]} \\]</div><p>${l[2]}</p></div>`).join('')}</div></div>
<div class="block" id="${p}-ej"><h2><span class="ico">✎</span>Ejemplo resuelto</h2><div class="example"><p><b>${o.ex[0]}</b></p><ol>${o.ex[1].map(s=>`<li>${s}</li>`).join('')}</ol>${o.ex[2]?`<p style="margin:.6em 0 0">${o.ex[2]}</p>`:''}</div></div>
<div class="pager"><a href="#${o.prev[0]}"><small>← Anterior</small>${o.prev[1]}</a><a class="next" href="#${o.next[0]}"><small>Siguiente →</small>${o.next[1]}</a></div>
<p class="note">Contenido de referencia: ${o.ref}. Redacción y simulaciones propias.</p></section>`;}
const lab2=(cv,ctrl,rd,hint)=>`<div class="two"><div><div class="canvas-box"><canvas id="${cv}"></canvas></div>${ctrl?`<div class="controls">${ctrl}</div>`:''}</div><div><div class="readout" id="${rd}"></div>${hint?`<p class="hint" style="margin-top:12px">${hint}</p>`:''}</div></div>`;
const tabs=T=>`<div class="tabs">${T.map((t,i)=>`<button data-t="${t[0]}"${i?'':' class="on"'}>${t[1]}</button>`).join('')}</div>`+T.map((t,i)=>`<div class="tabpane${i?'':' on'}" data-pane="${t[0]}">${t[2]}</div>`).join('');
const slider=(id,lab,min,max,step,val)=>`<label class="slider">${lab} <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"><b></b></label>`;
const btn=(id,t,ghost=true)=>`<button class="btn${ghost?' ghost':''}" id="${id}">${t}</button>`;
const seg=(id,attr,opts)=>`<div class="seg" id="${id}">${opts.map((o,i)=>`<button data-${attr}="${o[0]}"${i?'':' class="on"'}>${o[1]}</button>`).join('')}</div>`;
const sel=(id,opts)=>`<select id="${id}" class="aa-sel">${opts.map(o=>`<option value="${o[0]}">${o[1]}</option>`).join('')}</select>`;
const AL='Álgebra lineal',VC='Variable compleja';
/* arrastre de varios puntos en un plano P (obtenido con getP) */
function dragPts(cv,getP,pts,cb,opt={}){const R=opt.R||99,sn=opt.snap===undefined?0.25:opt.snap;
  drag(cv,(x,y)=>{const P=getP();if(!P)return null;let best=null,bd=18;pts.forEach((p,i)=>{if(!p)return;const d=Math.hypot(P.X(p[0])-x,P.Y(p[1])-y);if(d<bd){bd=d;best=i;}});return best;},
    (i,x,y)=>{const P=getP(),c=v=>Math.max(-R,Math.min(R,sn?snap(v,sn):v));pts[i][0]=c(P.ix(x));pts[i][1]=c(P.iy(y));if(opt.fix)opt.fix(i);cb();});}
const handle=(ctx,P,p,col)=>dot(ctx,P.X(p[0]),P.Y(p[1]),7,'#fff',col);
const inv2=A=>{const D=det2(A[0][0],A[0][1],A[1][0],A[1][1]);return [[A[1][1]/D,-A[0][1]/D],[-A[1][0]/D,A[0][0]/D]];};
const mv=(A,v)=>[A[0][0]*v[0]+A[0][1]*v[1],A[1][0]*v[0]+A[1][1]*v[1]];
const cols=(a,b)=>[[a[0],b[0]],[a[1],b[1]]];
/* autovalores reales de una 2x2 (o complejos) */
function eig2(A){const t=A[0][0]+A[1][1],d=det2(A[0][0],A[0][1],A[1][0],A[1][1]),D=t*t/4-d;
  if(D<-1e-12)return {cx:true,re:t/2,im:Math.sqrt(-D),t,d};
  const s=Math.sqrt(Math.max(0,D)),l1=t/2+s,l2=t/2-s;
  const vec=l=>{const a=A[0][0]-l,b=A[0][1],c=A[1][0],dd=A[1][1]-l;let v=Math.abs(b)+Math.abs(a)>Math.abs(c)+Math.abs(dd)?[-b,a]:[-dd,c];
    if(Math.hypot(...v)<1e-12)v=[1,0];const n=Math.hypot(...v);return [v[0]/n,v[1]/n];};
  return {cx:false,l1,l2,v1:vec(l1),v2:Math.abs(l1-l2)<1e-12?(Math.abs(A[0][1])+Math.abs(A[1][0])<1e-12?[0,1]:vec(l1)):vec(l2),t,d};}
/* plano cartesiano con ejes numerados */
function axes(ctx,o){
  const X=x=>o.l+(x-o.xr[0])/(o.xr[1]-o.xr[0])*o.w,Y=y=>o.t+o.h-(y-o.yr[0])/(o.yr[1]-o.yr[0])*o.h;
  const tk=(a,b,n)=>{const raw=(b-a)/n,p=10**Math.floor(Math.log10(raw)),m=raw/p,s=(m<1.5?1:m<3.5?2:m<7.5?5:10)*p,out=[];for(let v=Math.ceil(a/s-1e-9)*s;v<=b+1e-9;v+=s)out.push(Math.abs(v)<s*1e-9?0:v);return out;};
  ctx.save();ctx.font='11px Inter, sans-serif';ctx.lineWidth=1;ctx.strokeStyle=K.gr;ctx.fillStyle=K.mut;
  const xt=tk(o.xr[0],o.xr[1],Math.max(3,Math.round(o.w/80))),yt=tk(o.yr[0],o.yr[1],Math.max(3,Math.round(o.h/50)));
  ctx.textAlign='center';ctx.textBaseline='top';xt.forEach(v=>{ctx.beginPath();ctx.moveTo(X(v),o.t);ctx.lineTo(X(v),o.t+o.h);ctx.stroke();ctx.fillText(o.xf?o.xf(v):nt(v,2),X(v),o.t+o.h+4);});
  ctx.textAlign='right';ctx.textBaseline='middle';yt.forEach(v=>{ctx.beginPath();ctx.moveTo(o.l,Y(v));ctx.lineTo(o.l+o.w,Y(v));ctx.stroke();ctx.fillText(nt(v,2),o.l-5,Y(v));});
  ctx.strokeStyle=K.ax;ctx.lineWidth=1.5;ctx.beginPath();
  if(o.yr[0]<0&&o.yr[1]>0){ctx.moveTo(o.l,Y(0));ctx.lineTo(o.l+o.w,Y(0));}
  ctx.moveTo(o.l,o.t);ctx.lineTo(o.l,o.t+o.h);ctx.lineTo(o.l+o.w,o.t+o.h);ctx.stroke();
  ctx.font='600 12px Inter, sans-serif';ctx.fillStyle=K.ink;
  if(o.xl){ctx.textAlign='right';ctx.textBaseline='bottom';ctx.fillText(o.xl,o.l+o.w,o.t+o.h-4);}
  if(o.yl){ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText(o.yl,o.l+6,o.t+2);}
  ctx.restore();return {X,Y,o};}
function curve(ctx,A,f,x0,x1,col,lw=2.5,dash=null,n=400){
  ctx.save();ctx.beginPath();ctx.rect(A.o.l,A.o.t,A.o.w,A.o.h);ctx.clip();ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.lineJoin='round';if(dash)ctx.setLineDash(dash);
  ctx.beginPath();let pen=false;for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,y=f(x);if(!isFinite(y)){pen=false;continue;}const py=Math.max(-5e3,Math.min(5e3,A.Y(y)));if(pen)ctx.lineTo(A.X(x),py);else{ctx.moveTo(A.X(x),py);pen=true;}}
  ctx.stroke();ctx.restore();}

/* ================= VISTAS: ÁREA Y CURSOS ================= */
const V=[];
const svgT=(f,sub)=>`<svg viewBox="0 0 300 150" aria-hidden="true"><text x="150" y="${sub?72:86}" text-anchor="middle" font-family="Inter" font-size="30" font-weight="700" fill="#888780">${f}</text>${sub?`<text x="150" y="108" text-anchor="middle" font-family="Inter,sans-serif" font-size="14" fill="#9aa1b0">${sub}</text>`:''}</svg>`;
const soon=(t,d,f,sub)=>`<div class="topic soon" aria-disabled="true"><div class="thumb">${svgT(f,sub)}</div><div class="body"><h3>${t}</h3><p>${d}</p><span class="chip">próximamente</span></div></div>`;
const live=(id,t,d,svg)=>`<a class="topic" href="#${id}"><div class="thumb">${svg}</div><div class="body"><h3>${t}</h3><p>${d}</p><span class="go">Abrir tema →</span></div></a>`;
const svgF=f=>`<svg viewBox="0 0 300 150" aria-hidden="true"><text x="150" y="86" text-anchor="middle" font-family="Inter" font-size="30" font-weight="700" fill="#0f766e">${f}</text></svg>`;
const card=(id,t,d,f,sub)=>{const ex=id[0]==='#';if(!DONE.has(ex?id.slice(1):id))return soon(t,d,f,sub);return `<a class="topic" href="${ex?id:'#'+id}"><div class="thumb">${svgF(f)}</div><div class="body"><h3>${t}</h3><p>${d}</p><span class="go">${ex?'Ver ejercicios →':'Abrir tema →'}</span></div></a>`;};
const unit=(t,cards)=>`<h2 class="aa-unit">${t}</h2><div class="topics">${cards.join('')}</div>`;

/* ---- área ---- */
V.push(String.raw`
<section class="view theme-aa" data-view="algebra-analisis">
  <div class="eyebrow">Álgebra y Análisis</div>
  <h1>Elige el curso</h1>
  <p class="lead">Tres cursos encadenados. Álgebra lineal da el lenguaje de espacios, transformaciones y autovalores; Variable compleja lo usa para entender \(\mathbb{C}\), las funciones analíticas y la integración por residuos; Ecuaciones diferenciales junta ambos para resolver \(Ly=f\), de las EDO a las funciones especiales y las EDP.</p>
  <a class="course aa-c" href="#algebra-lineal"><div class="num">A</div><div><h3>Álgebra lineal <span style="font-weight:500;color:var(--muted);font-family:Inter;font-size:.85rem">· Strang / Grossman</span></h3><p>Sistemas · Matrices · Determinantes · Espacios vectoriales · Bases · Transformaciones · Autovalores · Producto interno · Teorema espectral</p></div><span class="tag">17 temas</span></a>
  <a class="course aa-c" href="#variable-compleja"><div class="num">ℂ</div><div><h3>Variable compleja <span style="font-weight:500;color:var(--muted);font-family:Inter;font-size:.85rem">· Churchill &amp; Brown</span></h3><p>ℂ como álgebra lineal · Euler · Cauchy-Riemann · Armónicas · Mapeos conformes · Integrales de contorno · Cauchy · Laurent · Residuos · Kramers-Kronig</p></div><span class="tag">18 temas</span></a>
  <a class="course aa-c" href="#ecuaciones-diferenciales"><div class="num">y′</div><div><h3>Ecuaciones diferenciales <span style="font-weight:500;color:var(--muted);font-family:Inter;font-size:.85rem">· Boyce-DiPrima / Arfken</span></h3><p>EDO de primer orden · Lineales · Plano de fase · Frobenius · Legendre y Rodrigues · Hermite · Laguerre · Bessel · Sturm-Liouville · Laplace · Fourier · EDP</p></div><span class="tag">18 temas</span></a>

  <div class="block">
    <h2><span class="ico">↝</span>El hilo conductor</h2>
    <p>Los dos cursos están unidos por una misma idea: los números complejos son un caso particular de matrices \(2\times2\), y la derivada compleja es una condición sobre el jacobiano.</p>
    <div class="aa-thread">
      <div class="law"><h3>1 · Las rotaciones piden \(\mathbb{C}\)</h3><div class="eq">\[ R_\theta=\begin{pmatrix}\cos\theta&-\sin\theta\\ \sin\theta&\cos\theta\end{pmatrix},\quad \lambda=e^{\pm i\theta} \]</div><p>Una rotación no deja fija ninguna dirección real: sus autovalores son complejos.</p></div>
      <div class="law"><h3>2 · \(\mathbb{C}\) es un álgebra de matrices</h3><div class="eq">\[ a+bi\;\longleftrightarrow\; aI+bJ,\qquad J^2=-I \]</div><p>Multiplicar por \(z=re^{i\theta}\) es escalar por \(r\) y rotar \(\theta\): \(e^{\theta J}=R_\theta\).</p></div>
      <div class="law"><h3>3 · Cauchy-Riemann es álgebra lineal</h3><div class="eq">\[ \begin{pmatrix}u_x&u_y\\ v_x&v_y\end{pmatrix}=\begin{pmatrix}a&-b\\ b&a\end{pmatrix} \]</div><p>\(f\) es derivable en sentido complejo si su jacobiano es de la forma \(aI+bJ\): localmente, rota y escala.</p></div>
    </div>
  </div>
</section>`);

/* ---- curso: álgebra lineal ---- */
const ALsvg={
gauss:`<svg viewBox="0 0 300 150" aria-hidden="true"><g stroke="#9aa1b0" stroke-width="1.5"><line x1="20" y1="120" x2="280" y2="120"/><line x1="60" y1="140" x2="60" y2="10"/></g><line x1="30" y1="135" x2="250" y2="20" stroke="#0f766e" stroke-width="3.5"/><line x1="40" y1="25" x2="270" y2="130" stroke="#d9480f" stroke-width="3.5"/><circle cx="150" cy="73" r="7" fill="#1c2230"/><text x="168" y="70" font-family="Inter" font-size="18" font-weight="700" fill="#1c2230">(x, y)</text></svg>`,
mat:`<svg viewBox="0 0 300 150" aria-hidden="true"><g stroke="#e3ddcf"><path d="M40 20v110M80 20v110M120 20v110M20 40h120M20 80h120M20 120h120"/></g><path d="M50 120 L50 60 L90 60 M50 90 L80 90" fill="none" stroke="#9aa1b0" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 8"/><g transform="translate(170 0)"><g stroke="#b7e0d6"><path d="M0 120 L60 100 M10 80 L70 60 M20 40 L80 20 M0 120 L20 40 M30 110 L50 30 M60 100 L80 20"/></g><path d="M5 115 L22 55 L62 42 M14 85 L41 76" fill="none" stroke="#d9480f" stroke-width="6" stroke-linecap="round"/></g><text x="128" y="84" font-family="Inter" font-size="22" font-weight="700" fill="#0f766e">A</text><path d="M118 92 h40" stroke="#0f766e" stroke-width="2.5"/><path d="M158 92 l-8 -5 v10z" fill="#0f766e"/></svg>`,
det:`<svg viewBox="0 0 300 150" aria-hidden="true"><path d="M70 125 L190 105 L250 35 L130 55 Z" fill="#dcf0eb" stroke="#0f766e" stroke-width="2.5"/><line x1="70" y1="125" x2="190" y2="105" stroke="#d9480f" stroke-width="3.5"/><line x1="70" y1="125" x2="130" y2="55" stroke="#2453c9" stroke-width="3.5"/><text x="140" y="92" font-family="Inter" font-size="20" font-weight="700" fill="#0f766e">det A</text></svg>`};
V.push(String.raw`
<section class="view theme-aa" data-view="algebra-lineal">
  <div class="eyebrow">Álgebra y Análisis · Nivel Strang / Grossman / Lay</div>
  <h1>Álgebra lineal</h1>
  <p class="lead">Empieza con lo concreto, los sistemas de ecuaciones y las matrices, y sube hacia lo abstracto: espacios vectoriales, transformaciones lineales, autovalores y producto interno. Termina en \(\mathbb{C}^n\) y el teorema espectral, que es el lenguaje de la mecánica cuántica.</p>`
+unit('Unidad I · Fundamentos matriciales',[
  live('al-gauss','Sistemas lineales y eliminación de Gauss','Forma escalonada, rango y teorema de Rouché-Frobenius. Lectura por filas y por columnas.',ALsvg.gauss),
  live('al-matrices','Álgebra de matrices','Producto como composición, inversa, transpuesta, matrices elementales y factorización LU.',ALsvg.mat),
  live('al-determinantes','Determinantes','Leibniz y Laplace, volumen orientado, propiedades y regla de Cramer.',ALsvg.det)])
+unit('Unidad II · Espacios vectoriales',[
  card('al-espacios','Espacios y subespacios vectoriales','Axiomas sobre un cuerpo 𝕂; ℝⁿ, polinomios, funciones y matrices como vectores.','(V, +, ·)'),
  card('al-base','Independencia lineal, base y dimensión','Combinaciones lineales, conjuntos generadores y teorema de la dimensión.','dim V = n'),
  card('al-coordenadas','Coordenadas y cambio de base','La misma flecha vista desde dos bases distintas.','[v]ʙ′ = P⁻¹[v]ʙ')])
+unit('Unidad III · Transformaciones lineales',[
  card('al-transformaciones','Transformaciones lineales, núcleo e imagen','Teorema rango-nulidad con una cuadrícula que se deforma.','dim ker T + rg T'),
  card('al-semejanza','Matriz asociada y semejanza','Una transformación, muchas matrices; traza y determinante como invariantes.','A′ = P⁻¹AP')])
+unit('Unidad IV · Valores y vectores propios',[
  card('al-autovalores','Autovalores y autovectores','Direcciones que no giran; las rotaciones llevan a λ = e^(±iθ).','Av = λv'),
  card('al-diagonalizacion','Diagonalización y exponencial de matrices','Potencias, eᴬᵗ, sistemas x′ = Ax y modos normales.','A = PDP⁻¹')])
+unit('Unidad V · Producto interno',[
  card('al-producto-interno','Producto interno y norma','Cauchy-Schwarz y desigualdad triangular.','|⟨u,v⟩| ≤ ‖u‖‖v‖'),
  card('al-gram-schmidt','Ortogonalidad, Gram-Schmidt y proyecciones','Bases ortonormales y mínimos cuadrados.','AᵀAx̂ = Aᵀb'),
  card('al-ortogonales','Matrices ortogonales: rotaciones y reflexiones','Grupos O(n) y SO(n).','QᵀQ = I')])
+unit('Unidad VI · Espacios complejos y teorema espectral',[
  card('al-cn','El espacio ℂⁿ y la adjunta','Producto hermítico y matriz adjunta.','A† = Āᵀ'),
  card('al-espectral','Operadores hermíticos, unitarios y teorema espectral','Autovalores reales y bases ortonormales de autovectores.','A = UDU†'),
  card('al-formas-cuadraticas','Formas cuadráticas y aplicaciones físicas','Tensor de inercia, ejes principales y oscilaciones acopladas.','xᵀAx')])
+unit('Cierre',[card('#algebra-lineal-ejercicios','Ejercicios resueltos de Álgebra lineal','Problemas guiados paso a paso.','✎')])
+String.raw`
  <div class="block">
    <h2><span class="ico">☰</span>Temario y prerrequisitos</h2>
    <ul class="keypoints">
      <li><b>Unidad I · Fundamentos matriciales.</b> Solo necesitas álgebra de secundaria y vectores de Física 1. Aquí se fijan las herramientas de cálculo: eliminación, inversa y determinante.</li>
      <li><b>Unidades II y III · Espacios y transformaciones.</b> El salto a lo abstracto: polinomios y funciones también son vectores. El teorema rango-nulidad organiza todo lo visto en la Unidad I.</li>
      <li><b>Unidad IV · Autovalores.</b> Necesitas determinantes y raíces de polinomios. Se usa en EDO (Cálculo 3), oscilaciones acopladas (Mecánica clásica) y la Hessiana.</li>
      <li><b>Unidades V y VI · Producto interno y \(\mathbb{C}^n\).</b> Geometría de ángulos y longitudes; el teorema espectral prepara la notación de Dirac de Física moderna y el curso de Variable compleja.</li>
    </ul>
  </div>
</section>`);

/* ---- curso: variable compleja ---- */
V.push(String.raw`
<section class="view theme-aa" data-view="variable-compleja">
  <div class="eyebrow">Álgebra y Análisis · Nivel Churchill &amp; Brown</div>
  <h1>Variable compleja</h1>
  <p class="lead">Se construye sobre Álgebra lineal y Cálculo 3. Los complejos aparecen como matrices de rotación y escala; la derivada compleja, como un jacobiano con esa misma forma. De ahí salen los mapeos conformes, el teorema de Cauchy y el cálculo de residuos que se usa en física para integrales de Fourier y relaciones de causalidad.</p>`
+unit('Unidad I · Números complejos',[
  card('vc-complejos','El cuerpo ℂ como álgebra lineal','Multiplicar es rotar y escalar.','aI + bJ'),
  card('vc-polar','Forma polar, Euler y De Moivre','Raíces n-ésimas y raíces de la unidad.','eⁱᶿ'),
  card('vc-topologia','Topología del plano y esfera de Riemann','Discos, abiertos, conexos y el punto ∞.','ℂ ∪ {∞}')])
+unit('Unidad II · Funciones analíticas',[
  card('vc-funciones','Funciones de variable compleja','Mapas ℝ² → ℝ² y coloreado de dominio.','w = f(z)'),
  card('vc-cauchy-riemann','Derivada compleja y Cauchy-Riemann','El jacobiano que rota y escala.','uₓ = v_y'),
  card('vc-armonicas','Funciones armónicas','Potencial, flujo y conjugada armónica.','∇²u = 0'),
  card('vc-elementales','Funciones elementales','exp, seno, coseno e hiperbólicas en ℂ.','eᶻ'),
  card('vc-log-ramas','Logaritmo, potencias y ramas','Cortes de rama y superficie de Riemann.','log z'),
  card('vc-conformes','Mapeos conformes y transformaciones de Möbius','Una cuadrícula que se deforma sin perder ángulos.','(az+b)/(cz+d)')])
+unit('Unidad III · Integración compleja',[
  card('vc-contorno','Integrales de contorno','Parametrización y estimación ML.','∫_γ f dz'),
  card('vc-cauchy-goursat','Teorema de Cauchy-Goursat','Independencia del camino y deformación de contornos.','∮ f dz = 0'),
  card('vc-formula-cauchy','Fórmula integral de Cauchy y consecuencias','Liouville, teorema fundamental del álgebra, módulo máximo.','f(z₀)')])
+unit('Unidad IV · Series',[
  card('vc-series','Series de potencias y de Taylor','Radio de convergencia.','Σ aₙ(z−z₀)ⁿ'),
  card('vc-laurent','Series de Laurent y singularidades','Polos, evitables y esenciales.','Σ aₙ zⁿ, n ∈ ℤ')])
+unit('Unidad V · Residuos y aplicaciones',[
  card('vc-residuos','Teorema de los residuos','Contornos que encierran polos.','2πi Σ Res'),
  card('vc-integrales-reales','Integrales reales por residuos','Lema de Jordan y valor principal.','∫ dx/(1+x²)'),
  card('vc-kramers-kronig','Transformadas de Fourier y Laplace, Kramers-Kronig','Causalidad y respuesta lineal.','χ(ω)')])
+unit('Cierre',[card('#variable-compleja-ejercicios','Ejercicios resueltos de Variable compleja','Problemas guiados paso a paso.','✎')])
+String.raw`
  <div class="block">
    <h2><span class="ico">☰</span>Temario y prerrequisitos</h2>
    <ul class="keypoints">
      <li><b>Prerrequisitos.</b> Álgebra lineal (Unidades I, IV y VI), Cálculo 3 (derivadas parciales, jacobiano, integrales de línea y teorema de Green) y series de Cálculo 2.</li>
      <li><b>Unidades I y II.</b> \(\mathbb{C}\) como \(\mathbb{R}^2\) con una multiplicación extra; analiticidad como condición sobre el jacobiano.</li>
      <li><b>Unidades III a V.</b> Green + Cauchy-Riemann \(\Rightarrow\) teorema de Cauchy; de ahí la fórmula integral, las series y los residuos.</li>
    </ul>
  </div>
</section>`);

/* ================= AL · SISTEMAS Y GAUSS ================= */
V.push(String.raw`
<section class="view theme-aa" data-view="al-gauss">
  <div class="eyebrow">Álgebra lineal · Unidad I · Fundamentos matriciales</div>
  <h1>Sistemas lineales y eliminación de Gauss</h1>
  <p class="lead">Un sistema de \(m\) ecuaciones lineales con \(n\) incógnitas se escribe \(A\mathbf{x}=\mathbf{b}\). Resolverlo es responder una pregunta geométrica: ¿es \(\mathbf{b}\) una combinación lineal de las columnas de \(A\)? La eliminación de Gauss responde sin adivinar, con operaciones que no cambian el conjunto solución.</p>
  <div class="toc"><a href="#ag-res" data-scroll>Resumen</a><a href="#ag-lab" data-scroll>Visualiza</a><a href="#ag-leyes" data-scroll>Leyes y fórmulas</a><a href="#ag-ej" data-scroll>Ejemplo</a></div>

  <div class="block" id="ag-res">
    <h2><span class="ico">≡</span>Resumen</h2>
    <ul class="keypoints">
      <li><b>Forma matricial.</b> \(A\in\mathbb{K}^{m\times n}\), \(\mathbf{x}\in\mathbb{K}^n\), \(\mathbf{b}\in\mathbb{K}^m\), con \(\mathbb{K}=\mathbb{R}\) o \(\mathbb{C}\). Toda la información está en la matriz aumentada \([A\,|\,\mathbf{b}]\).</li>
      <li><b>Dos lecturas del mismo sistema.</b> Por filas: cada ecuación es un hiperplano y la solución es su intersección. Por columnas: \(x_1\mathbf{a}_1+x_2\mathbf{a}_2+\dots+x_n\mathbf{a}_n=\mathbf{b}\), es decir, buscar los pesos que combinan las columnas para llegar a \(\mathbf{b}\).</li>
      <li><b>Operaciones elementales de fila.</b> Intercambio \(F_i\leftrightarrow F_j\); escalamiento \(F_i\leftarrow cF_i\) con \(c\neq0\); reemplazo \(F_i\leftarrow F_i+cF_j\). Las tres son invertibles, por eso producen un sistema <i>equivalente</i> (mismo conjunto solución).</li>
      <li><b>Forma escalonada.</b> Cada fila no nula empieza con un <i>pivote</i> a la derecha del pivote de la fila anterior, y las filas nulas van al final. En la forma <i>escalonada reducida</i> (Gauss-Jordan) cada pivote vale 1 y es el único elemento no nulo de su columna; esa forma es única.</li>
      <li><b>Rango.</b> \(\operatorname{rg}A\) es el número de pivotes. Las incógnitas de columnas con pivote son <i>básicas</i>; las demás son <i>libres</i> y hay \(n-\operatorname{rg}A\) de ellas.</li>
      <li><b>Teorema de Rouché-Frobenius.</b> El sistema es compatible si y solo si \(\operatorname{rg}A=\operatorname{rg}[A\,|\,\mathbf{b}]\). Si además el rango es \(n\), la solución es única; si es menor, hay infinitas con \(n-\operatorname{rg}A\) parámetros. Una fila \([0\ \cdots\ 0\,|\,c]\) con \(c\neq0\) delata la incompatibilidad.</li>
      <li><b>Estructura de la solución.</b> El sistema homogéneo \(A\mathbf{x}=\mathbf{0}\) siempre es compatible. Si \(\mathbf{x}_p\) es una solución particular de \(A\mathbf{x}=\mathbf{b}\), todas las soluciones son \(\mathbf{x}=\mathbf{x}_p+\mathbf{x}_h\) con \(A\mathbf{x}_h=\mathbf{0}\). Es la misma estructura que en las EDO lineales.</li>
      <li><b>Costo y estabilidad.</b> Eliminar en una matriz \(n\times n\) cuesta del orden de \(\tfrac23 n^3\) operaciones. En aritmética de punto flotante se elige como pivote el elemento de mayor módulo de la columna (<i>pivoteo parcial</i>) para no amplificar errores de redondeo.</li>
    </ul>
  </div>

  <div class="block" id="ag-lab">
    <h2><span class="ico">◎</span>Visualiza</h2>
    <div class="tabs"><button data-t="rectas" class="on">Dos ecuaciones, dos incógnitas</button><button data-t="gauss">Eliminación paso a paso</button></div>
    <div class="tabpane on" data-pane="rectas">
      <div class="two">
        <div>
          <div class="canvas-box"><canvas id="ag-cv"></canvas></div>
          <div class="controls">
            <div class="seg" id="ag-view"><button class="on" data-v="f">Por filas</button><button data-v="c">Por columnas</button></div>
            <button class="btn ghost" data-p="u">Solución única</button><button class="btn ghost" data-p="p">Paralelas</button><button class="btn ghost" data-p="c">Coincidentes</button>
          </div>
          <div class="controls">
            <span style="font-size:.88rem;font-weight:600;color:var(--aa)">Ecuación 1</span>
            <label class="slider">a₁₁ <input type="range" id="ag-a11" min="-4" max="4" step="0.5" value="1"><b></b></label>
            <label class="slider">a₁₂ <input type="range" id="ag-a12" min="-4" max="4" step="0.5" value="1"><b></b></label>
            <label class="slider">b₁ <input type="range" id="ag-b1" min="-6" max="6" step="0.5" value="3"><b></b></label>
          </div>
          <div class="controls">
            <span style="font-size:.88rem;font-weight:600;color:var(--kl-c-orange)">Ecuación 2</span>
            <label class="slider">a₂₁ <input type="range" id="ag-a21" min="-4" max="4" step="0.5" value="1"><b></b></label>
            <label class="slider">a₂₂ <input type="range" id="ag-a22" min="-4" max="4" step="0.5" value="-1"><b></b></label>
            <label class="slider">b₂ <input type="range" id="ag-b2" min="-6" max="6" step="0.5" value="1"><b></b></label>
          </div>
        </div>
        <div>
          <div class="readout" id="ag-read"></div>
          <p class="hint" style="margin-top:12px"><b>Por filas</b>, cada ecuación \(a_{i1}x+a_{i2}y=b_i\) es una recta y la solución es el punto de corte. <b>Por columnas</b>, se buscan \(x,y\) tales que \(x\,\mathbf{a}_1+y\,\mathbf{a}_2=\mathbf{b}\): la flecha discontinua recorre \(x\,\mathbf{a}_1\) y luego \(y\,\mathbf{a}_2\) hasta llegar a \(\mathbf{b}\). Cuando \(\det A=0\) las columnas son paralelas: solo se alcanza \(\mathbf{b}\) si está sobre esa misma recta.</p>
        </div>
      </div>
    </div>
    <div class="tabpane" data-pane="gauss">
      <div class="controls" style="margin-top:0;margin-bottom:12px">
        <select class="fm-sel" id="ag-pre" style="font:500 .9rem Inter,sans-serif;border:1px solid var(--line);border-radius:10px;padding:7px 10px;background:var(--kl-raise)">
          <option value="0">3×3 con solución única</option>
          <option value="1">3×3 que necesita intercambio de filas</option>
          <option value="2">3×3 con infinitas soluciones</option>
          <option value="3">3×3 incompatible</option>
          <option value="4">3 ecuaciones, 4 incógnitas</option>
        </select>
        <div class="seg" id="ag-mode"><button class="on" data-m="g">Gauss (escalonada)</button><button data-m="j">Gauss-Jordan (reducida)</button></div>
      </div>
      <div class="two">
        <div>
          <div id="ag-tab"></div>
          <div class="aa-op" id="ag-op"></div>
          <div class="controls">
            <button class="btn ghost" id="ag-prev">← Anterior</button>
            <button class="btn" id="ag-next">Siguiente paso →</button>
            <button class="btn ghost" id="ag-reset">Reiniciar</button>
            <span class="aa-steps" id="ag-cnt"></span>
          </div>
        </div>
        <div>
          <div class="readout" id="ag-gread"></div>
          <p class="hint" style="margin-top:12px">La fila resaltada es la que cambió en el último paso y la celda verde es el pivote. Todas las cuentas se hacen con fracciones exactas. Con Gauss la eliminación se detiene en la forma escalonada y se termina por sustitución hacia atrás; con Gauss-Jordan se llega a la forma reducida, donde la solución se lee directamente.</p>
        </div>
      </div>
    </div>
  </div>

  <div class="block" id="ag-leyes">
    <h2><span class="ico">§</span>Leyes y fórmulas</h2>
    <div class="laws">
      <div class="law"><h3>Teorema de Rouché-Frobenius</h3><div class="eq">\[ A\mathbf{x}=\mathbf{b}\ \text{compatible}\iff \operatorname{rg}A=\operatorname{rg}[A\,|\,\mathbf{b}] \]</div><p>Determinado si el rango común es \(n\) (número de incógnitas); indeterminado si es menor.</p></div>
      <div class="law"><h3>Grados de libertad</h3><div class="eq">\[ \#\,\text{parámetros libres}=n-\operatorname{rg}A \]</div><p>Es la dimensión del espacio de soluciones del sistema homogéneo (el núcleo de \(A\)).</p></div>
      <div class="law"><h3>Solución general</h3><div class="eq">\[ \mathbf{x}=\mathbf{x}_p+\mathbf{x}_h,\qquad A\mathbf{x}_h=\mathbf{0} \]</div><p>Por linealidad, la diferencia de dos soluciones de \(A\mathbf{x}=\mathbf{b}\) resuelve el homogéneo.</p></div>
      <div class="law"><h3>Lectura por columnas</h3><div class="eq">\[ A\mathbf{x}=x_1\mathbf{a}_1+\dots+x_n\mathbf{a}_n \]</div><p>\(A\mathbf{x}=\mathbf{b}\) es compatible si y solo si \(\mathbf{b}\in\operatorname{span}\{\mathbf{a}_1,\dots,\mathbf{a}_n\}\).</p></div>
      <div class="law"><h3>Operaciones que no alteran el conjunto solución</h3><div class="eq">\[ F_i\leftrightarrow F_j,\quad F_i\leftarrow cF_i\ (c\neq0),\quad F_i\leftarrow F_i+cF_j \]</div><p>Cada una se deshace con otra del mismo tipo, así que los sistemas son equivalentes.</p></div>
      <div class="law"><h3>Caso \(2\times2\)</h3><div class="eq">\[ \det A=a_{11}a_{22}-a_{12}a_{21}\neq0\iff\text{solución única} \]</div><p>Si \(\det A=0\), las rectas son paralelas (ninguna solución) o coincidentes (infinitas).</p></div>
    </div>
  </div>

  <div class="block" id="ag-ej">
    <h2><span class="ico">✎</span>Ejemplo resuelto</h2>
    <div class="example">
      <p><b>Resuelve \(x+y+z=6\), \(2x+3y+z=11\), \(3x-y+2z=7\).</b></p>
      <ol>
        <li>Matriz aumentada: \(\left[\begin{array}{ccc|c}1&1&1&6\\2&3&1&11\\3&-1&2&7\end{array}\right]\). El pivote de la primera columna es \(a_{11}=1\).</li>
        <li>\(F_2\leftarrow F_2-2F_1\) y \(F_3\leftarrow F_3-3F_1\): \(\left[\begin{array}{ccc|c}1&1&1&6\\0&1&-1&-1\\0&-4&-1&-11\end{array}\right]\).</li>
        <li>\(F_3\leftarrow F_3+4F_2\): \(\left[\begin{array}{ccc|c}1&1&1&6\\0&1&-1&-1\\0&0&-5&-15\end{array}\right]\). Hay tres pivotes: \(\operatorname{rg}A=\operatorname{rg}[A|\mathbf{b}]=3=n\), solución única.</li>
        <li>Sustitución hacia atrás: \(z=-15/(-5)=3\); \(y=-1+z=2\); \(x=6-y-z=1\).</li>
        <li>Comprobación por columnas: \(1\cdot(1,2,3)+2\cdot(1,3,-1)+3\cdot(1,1,2)=(6,11,7)=\mathbf{b}\). ✓</li>
      </ol>
      <p style="margin:.6em 0 0">Sigue los mismos pasos en la pestaña “Eliminación paso a paso” con el primer sistema de la lista.</p>
    </div>
  </div>

  <div class="pager"><a href="#algebra-lineal"><small>← Volver</small>Álgebra lineal</a><a class="next" href="#al-matrices"><small>Siguiente →</small>Álgebra de matrices</a></div>
  <p class="note">Contenido de referencia: Strang, <i>Introduction to Linear Algebra</i>, cap. 2; Grossman, <i>Álgebra lineal</i>, cap. 1; Lay, <i>Álgebra lineal y sus aplicaciones</i>, cap. 1. Redacción y simulaciones propias.</p>
</section>`);

/* ================= AL · ÁLGEBRA DE MATRICES ================= */
V.push(String.raw`
<section class="view theme-aa" data-view="al-matrices">
  <div class="eyebrow">Álgebra lineal · Unidad I · Fundamentos matriciales</div>
  <h1>Álgebra de matrices</h1>
  <p class="lead">Una matriz \(m\times n\) es una transformación lineal \(\mathbb{R}^n\to\mathbb{R}^m\) escrita en coordenadas: su columna \(j\) es la imagen del vector \(\mathbf{e}_j\). Con esa lectura, las reglas del producto dejan de ser arbitrarias: multiplicar matrices es componer transformaciones.</p>
  <div class="toc"><a href="#am-res" data-scroll>Resumen</a><a href="#am-lab" data-scroll>Visualiza</a><a href="#am-leyes" data-scroll>Leyes y fórmulas</a><a href="#am-ej" data-scroll>Ejemplo</a></div>

  <div class="block" id="am-res">
    <h2><span class="ico">≡</span>Resumen</h2>
    <ul class="keypoints">
      <li><b>Las columnas son las imágenes de la base.</b> Como \(\mathbf{x}=\sum_j x_j\mathbf{e}_j\) y \(A\) es lineal, \(A\mathbf{x}=\sum_j x_j\,(A\mathbf{e}_j)=\sum_j x_j\mathbf{a}_j\). Conocer \(A\mathbf{e}_1,\dots,A\mathbf{e}_n\) basta para conocer \(A\) en todo \(\mathbb{R}^n\).</li>
      <li><b>Suma y producto por escalar.</b> Se hacen entrada por entrada. Con ellas, \(\mathbb{K}^{m\times n}\) es un espacio vectorial de dimensión \(mn\).</li>
      <li><b>Producto.</b> Si \(A\) es \(m\times p\) y \(B\) es \(p\times n\), \((AB)_{ij}=\sum_{k=1}^{p}a_{ik}b_{kj}\). La columna \(j\) de \(AB\) es \(A\) aplicada a la columna \(j\) de \(B\). Se define así para que \((AB)\mathbf{x}=A(B\mathbf{x})\): <i>primero</i> actúa \(B\), <i>después</i> \(A\).</li>
      <li><b>Propiedades.</b> Es asociativo y distributivo, pero en general \(AB\neq BA\): componer en otro orden da otra transformación. También hay divisores de cero: \(AB=0\) con \(A\neq0\) y \(B\neq0\).</li>
      <li><b>Transpuesta.</b> \((A^{\mathsf T})_{ij}=a_{ji}\) y \((AB)^{\mathsf T}=B^{\mathsf T}A^{\mathsf T}\). Si \(A=A^{\mathsf T}\) es simétrica; si \(A=-A^{\mathsf T}\), antisimétrica. Toda matriz cuadrada se descompone en una parte simétrica y otra antisimétrica.</li>
      <li><b>Inversa.</b> \(A\) es invertible si existe \(A^{-1}\) con \(AA^{-1}=A^{-1}A=I\). Eso ocurre si y solo si \(\operatorname{rg}A=n\), si y solo si \(\det A\neq0\). Se cumple \((AB)^{-1}=B^{-1}A^{-1}\): para deshacer “ponerse medias y luego zapatos” se quitan primero los zapatos.</li>
      <li><b>Cálculo de la inversa.</b> Se reduce \([A\,|\,I]\) por Gauss-Jordan hasta \([I\,|\,A^{-1}]\). En el caso \(2\times2\) hay fórmula cerrada (ver leyes).</li>
      <li><b>Matrices elementales y LU.</b> Cada operación de fila equivale a multiplicar por la izquierda por una matriz elemental \(E\). La eliminación es \(E_k\cdots E_1A=U\) (triangular superior). Si no hubo intercambios, \(A=LU\), con \(L\) triangular inferior que guarda los multiplicadores. Con intercambios, \(PA=LU\).</li>
    </ul>
  </div>

  <div class="block" id="am-lab">
    <h2><span class="ico">◎</span>Visualiza</h2>
    <div class="tabs"><button data-t="tr" class="on">La matriz como transformación</button><button data-t="co">Composición: AB ≠ BA</button></div>
    <div class="tabpane on" data-pane="tr">
      <div class="two">
        <div>
          <div class="canvas-box"><canvas id="am-cv"></canvas></div>
          <div class="controls">
            <button class="btn ghost" data-p="id">Identidad</button><button class="btn ghost" data-p="rot">Rotación 30°</button><button class="btn ghost" data-p="ciz">Cizalla</button><button class="btn ghost" data-p="ref">Reflexión</button><button class="btn ghost" data-p="esc">Escala</button><button class="btn ghost" data-p="pro">Proyección</button>
          </div>
        </div>
        <div>
          <div class="readout" id="am-read"></div>
          <p class="hint" style="margin-top:12px">Arrastra las puntas de las flechas: la naranja es \(A\mathbf{e}_1\) (primera columna) y la azul es \(A\mathbf{e}_2\) (segunda columna). La cuadrícula verde es la imagen de la cuadrícula original y la letra F muestra si la transformación conserva la orientación. Con la proyección el plano se aplasta sobre una recta: no hay inversa.</p>
        </div>
      </div>
    </div>
    <div class="tabpane" data-pane="co">
      <div class="controls" style="margin-top:0;margin-bottom:12px">
        <label class="slider" style="color:var(--ink)">A = <select id="am-A" style="font:500 .9rem Inter,sans-serif;border:1px solid var(--line);border-radius:10px;padding:7px 10px;background:var(--kl-raise)"></select></label>
        <label class="slider" style="color:var(--ink)">B = <select id="am-B" style="font:500 .9rem Inter,sans-serif;border:1px solid var(--line);border-radius:10px;padding:7px 10px;background:var(--kl-raise)"></select></label>
      </div>
      <div class="two">
        <div><div class="canvas-box"><canvas id="am-cv2"></canvas></div></div>
        <div>
          <div class="readout" id="am-read2"></div>
          <p class="hint" style="margin-top:12px">A la izquierda, la letra F transformada por \(AB\) (primero \(B\), después \(A\)); a la derecha, por \(BA\). Con una rotación y una cizalla el resultado depende del orden. Dos rotaciones, o dos escalas sobre los mismos ejes, sí conmutan.</p>
        </div>
      </div>
    </div>
  </div>

  <div class="block" id="am-leyes">
    <h2><span class="ico">§</span>Leyes y fórmulas</h2>
    <div class="laws">
      <div class="law"><h3>Producto de matrices</h3><div class="eq">\[ (AB)_{ij}=\sum_{k=1}^{p}a_{ik}\,b_{kj} \]</div><p>Fila \(i\) de \(A\) por columna \(j\) de \(B\). Exige que las columnas de \(A\) coincidan con las filas de \(B\).</p></div>
      <div class="law"><h3>Composición</h3><div class="eq">\[ (AB)\mathbf{x}=A(B\mathbf{x}),\qquad (AB)C=A(BC) \]</div><p>La asociatividad del producto es la de la composición de funciones.</p></div>
      <div class="law"><h3>Transpuesta e inversa de un producto</h3><div class="eq">\[ (AB)^{\mathsf T}=B^{\mathsf T}A^{\mathsf T},\qquad (AB)^{-1}=B^{-1}A^{-1} \]</div><p>Ambas invierten el orden de los factores.</p></div>
      <div class="law"><h3>Inversa \(2\times2\)</h3><div class="eq">\[ \begin{pmatrix}a&b\\c&d\end{pmatrix}^{-1}=\frac{1}{ad-bc}\begin{pmatrix}d&-b\\-c&a\end{pmatrix} \]</div><p>Existe solo si \(ad-bc\neq0\).</p></div>
      <div class="law"><h3>Teorema de la matriz invertible</h3><div class="eq">\[ A\ \text{invertible}\iff\operatorname{rg}A=n\iff\det A\neq0\iff\ker A=\{\mathbf{0}\} \]</div><p>También equivale a que \(A\mathbf{x}=\mathbf{b}\) tenga solución única para todo \(\mathbf{b}\), o a que las columnas sean una base de \(\mathbb{K}^n\).</p></div>
      <div class="law"><h3>Factorización LU</h3><div class="eq">\[ A=LU,\qquad L\mathbf{y}=\mathbf{b},\ \ U\mathbf{x}=\mathbf{y} \]</div><p>Se factoriza una vez (\(\sim\tfrac23n^3\)) y cada nuevo \(\mathbf{b}\) se resuelve con dos sustituciones (\(\sim2n^2\)).</p></div>
    </div>
  </div>

  <div class="block" id="am-ej">
    <h2><span class="ico">✎</span>Ejemplo resuelto</h2>
    <div class="example">
      <p><b>Factoriza \(A=\begin{pmatrix}2&1&1\\4&3&3\\8&7&9\end{pmatrix}\) como \(A=LU\).</b></p>
      <ol>
        <li>Pivote \(2\). Multiplicadores \(\ell_{21}=4/2=2\) y \(\ell_{31}=8/2=4\): \(F_2\leftarrow F_2-2F_1=(0,1,1)\), \(F_3\leftarrow F_3-4F_1=(0,3,5)\).</li>
        <li>Pivote \(1\). Multiplicador \(\ell_{32}=3/1=3\): \(F_3\leftarrow F_3-3F_2=(0,0,2)\).</li>
        <li>\(U=\begin{pmatrix}2&1&1\\0&1&1\\0&0&2\end{pmatrix}\) y \(L=\begin{pmatrix}1&0&0\\2&1&0\\4&3&1\end{pmatrix}\): \(L\) guarda los multiplicadores debajo de la diagonal.</li>
        <li>Comprobación de la fila 3: \((4,3,1)\cdot U=4(2,1,1)+3(0,1,1)+1(0,0,2)=(8,7,9)\). ✓</li>
        <li>De paso, \(\det A=\det L\,\det U=1\cdot(2\cdot1\cdot2)=4\neq0\): \(A\) es invertible.</li>
      </ol>
    </div>
  </div>

  <div class="pager"><a href="#al-gauss"><small>← Anterior</small>Sistemas y eliminación de Gauss</a><a class="next" href="#al-determinantes"><small>Siguiente →</small>Determinantes</a></div>
  <p class="note">Contenido de referencia: Strang, <i>Introduction to Linear Algebra</i>, cap. 2; Lay, <i>Álgebra lineal y sus aplicaciones</i>, cap. 2. Redacción y simulaciones propias.</p>
</section>`);

/* ================= AL · DETERMINANTES ================= */
V.push(String.raw`
<section class="view theme-aa" data-view="al-determinantes">
  <div class="eyebrow">Álgebra lineal · Unidad I · Fundamentos matriciales</div>
  <h1>Determinantes</h1>
  <p class="lead">El determinante de una matriz cuadrada es el factor por el que la transformación multiplica volúmenes, con signo: positivo si conserva la orientación y negativo si la invierte. De esa idea salen todas sus propiedades, el criterio de invertibilidad y, en Cálculo 3, el jacobiano del cambio de variables.</p>
  <div class="toc"><a href="#ad-res" data-scroll>Resumen</a><a href="#ad-lab" data-scroll>Visualiza</a><a href="#ad-leyes" data-scroll>Leyes y fórmulas</a><a href="#ad-ej" data-scroll>Ejemplo</a></div>

  <div class="block" id="ad-res">
    <h2><span class="ico">≡</span>Resumen</h2>
    <ul class="keypoints">
      <li><b>Definición axiomática.</b> \(\det\) es la única función de las \(n\) columnas que es (i) lineal en cada columna, (ii) alternante: cambia de signo al intercambiar dos columnas, y por tanto vale 0 si dos son iguales, y (iii) normalizada: \(\det I=1\). Son las propiedades de un volumen orientado.</li>
      <li><b>Fórmula de Leibniz.</b> Desarrollando por multilinealidad, \(\det A=\sum_{\sigma\in S_n}\operatorname{sgn}(\sigma)\,a_{1\sigma(1)}\cdots a_{n\sigma(n)}\): \(n!\) términos. Para \(n=2\) da \(ad-bc\); para \(n=3\), la regla de Sarrus.</li>
      <li><b>Desarrollo de Laplace.</b> Por la fila \(i\): \(\det A=\sum_j(-1)^{i+j}a_{ij}M_{ij}\), donde el menor \(M_{ij}\) es el determinante sin la fila \(i\) ni la columna \(j\). Conviene elegir la fila o columna con más ceros.</li>
      <li><b>Efecto de las operaciones de fila.</b> Un intercambio cambia el signo; multiplicar una fila por \(c\) multiplica el determinante por \(c\); un reemplazo \(F_i\leftarrow F_i+cF_j\) no lo cambia. Por eso, tras la eliminación, \(\det A=(-1)^{s}\,u_{11}u_{22}\cdots u_{nn}\), con \(s\) intercambios. Es el método práctico: \(O(n^3)\) en lugar de \(n!\).</li>
      <li><b>Propiedades.</b> \(\det(AB)=\det A\,\det B\); \(\det A^{\mathsf T}=\det A\); \(\det A^{-1}=1/\det A\); \(\det(cA)=c^n\det A\); el determinante de una triangular es el producto de su diagonal.</li>
      <li><b>Volumen.</b> \(|\det A|\) es el volumen del paralelepípedo generado por las columnas. Para cualquier región \(\Omega\), \(\operatorname{vol}(A\Omega)=|\det A|\operatorname{vol}(\Omega)\). Para una transformación no lineal, localmente esto da \(dx\,dy=|J|\,du\,dv\).</li>
      <li><b>Criterio de invertibilidad.</b> \(\det A=0\) si y solo si las columnas son linealmente dependientes: la transformación aplasta el espacio a una dimensión menor y no puede deshacerse.</li>
      <li><b>Regla de Cramer y adjunta.</b> Si \(\det A\neq0\), la solución de \(A\mathbf{x}=\mathbf{b}\) es \(x_i=\det A_i/\det A\), donde \(A_i\) es \(A\) con la columna \(i\) reemplazada por \(\mathbf{b}\). También \(A^{-1}=\operatorname{adj}(A)/\det A\). Son útiles en teoría y en \(2\times2\) o \(3\times3\), no para cálculo numérico grande.</li>
      <li><b>En física.</b> El producto vectorial \(\mathbf{a}\times\mathbf{b}\) es un determinante simbólico, el producto mixto \(\mathbf{a}\cdot(\mathbf{b}\times\mathbf{c})=\det[\mathbf{a}\ \mathbf{b}\ \mathbf{c}]\) es un volumen, y las rotaciones cumplen \(\det R=+1\).</li>
    </ul>
  </div>

  <div class="block" id="ad-lab">
    <h2><span class="ico">◎</span>Visualiza</h2>
    <div class="tabs"><button data-t="area" class="on">Área orientada</button><button data-t="cramer">Regla de Cramer</button></div>
    <div class="tabpane on" data-pane="area">
      <div class="two">
        <div>
          <div class="canvas-box"><canvas id="ad-cv"></canvas></div>
          <div class="controls">
            <label class="slider">deformación t <input type="range" id="ad-t" min="0" max="1" step="0.01" value="1"><b></b></label>
            <button class="btn ghost" id="ad-play">Animar I → A</button>
          </div>
        </div>
        <div>
          <div class="readout" id="ad-read"></div>
          <p class="hint" style="margin-top:12px">Arrastra las puntas de \(\mathbf{a}_1\) (naranja) y \(\mathbf{a}_2\) (azul). El cuadrado unidad se transforma en el paralelogramo de las columnas: verde si \(\det A>0\), rojo si la orientación se invierte. El deslizador \(t\) recorre \(M(t)=(1-t)I+tA\): cuando el determinante cambia de signo, el paralelogramo tiene que aplastarse (\(\det=0\)) en algún momento.</p>
        </div>
      </div>
    </div>
    <div class="tabpane" data-pane="cramer">
      <div class="two">
        <div><div class="canvas-box"><canvas id="ad-cv2"></canvas></div></div>
        <div>
          <div class="readout" id="ad-read2"></div>
          <p class="hint" style="margin-top:12px">Arrastra \(\mathbf{a}_1\), \(\mathbf{a}_2\) y \(\mathbf{b}\). Como \(\mathbf{b}=x\mathbf{a}_1+y\mathbf{a}_2\) y el determinante es lineal y alternante, \(\det[\mathbf{b}\ \mathbf{a}_2]=x\det[\mathbf{a}_1\ \mathbf{a}_2]\). Así, \(x\) es el cociente entre el área naranja y el área verde, y \(y\) el cociente entre el área morada y la verde.</p>
        </div>
      </div>
    </div>
  </div>

  <div class="block" id="ad-leyes">
    <h2><span class="ico">§</span>Leyes y fórmulas</h2>
    <div class="laws">
      <div class="law"><h3>Fórmula de Leibniz</h3><div class="eq">\[ \det A=\sum_{\sigma\in S_n}\operatorname{sgn}(\sigma)\prod_{i=1}^{n}a_{i\,\sigma(i)} \]</div><p>Para \(n=2\): \(\det\begin{pmatrix}a&b\\c&d\end{pmatrix}=ad-bc\).</p></div>
      <div class="law"><h3>Desarrollo de Laplace</h3><div class="eq">\[ \det A=\sum_{j=1}^{n}(-1)^{i+j}\,a_{ij}\,M_{ij} \]</div><p>Por cualquier fila \(i\), o análogamente por cualquier columna.</p></div>
      <div class="law"><h3>Multiplicatividad</h3><div class="eq">\[ \det(AB)=\det A\,\det B \]</div><p>Componer transformaciones multiplica los factores de volumen. De aquí \(\det A^{-1}=1/\det A\).</p></div>
      <div class="law"><h3>Por eliminación</h3><div class="eq">\[ \det A=(-1)^{s}\prod_{i=1}^{n}u_{ii} \]</div><p>\(U\): forma escalonada obtenida solo con reemplazos e \(s\) intercambios.</p></div>
      <div class="law"><h3>Volumen y jacobiano</h3><div class="eq">\[ \operatorname{vol}(A\Omega)=|\det A|\,\operatorname{vol}(\Omega),\quad dA'=\left|\frac{\partial(x,y)}{\partial(u,v)}\right|du\,dv \]</div><p>La versión infinitesimal es la fórmula de cambio de variables de Cálculo 3.</p></div>
      <div class="law"><h3>Regla de Cramer</h3><div class="eq">\[ x_i=\frac{\det A_i}{\det A} \]</div><p>\(A_i\): \(A\) con la columna \(i\) reemplazada por \(\mathbf{b}\). Requiere \(\det A\neq0\).</p></div>
      <div class="law"><h3>Inversa por adjunta</h3><div class="eq">\[ A^{-1}=\frac{1}{\det A}\,\operatorname{adj}A,\quad (\operatorname{adj}A)_{ij}=(-1)^{i+j}M_{ji} \]</div><p>La adjunta clásica es la transpuesta de la matriz de cofactores.</p></div>
      <div class="law"><h3>Producto mixto</h3><div class="eq">\[ \mathbf{a}\cdot(\mathbf{b}\times\mathbf{c})=\det\begin{pmatrix}a_1&a_2&a_3\\b_1&b_2&b_3\\c_1&c_2&c_3\end{pmatrix} \]</div><p>Volumen con signo del paralelepípedo; es cero si los tres vectores son coplanares.</p></div>
    </div>
  </div>

  <div class="block" id="ad-ej">
    <h2><span class="ico">✎</span>Ejemplo resuelto</h2>
    <div class="example">
      <p><b>Calcula \(\det A\) para \(A=\begin{pmatrix}2&1&1\\4&3&3\\8&7&9\end{pmatrix}\) de dos formas y usa Cramer para hallar \(x_3\) en \(A\mathbf{x}=(4,10,24)^{\mathsf T}\).</b></p>
      <ol>
        <li>Por Laplace en la primera fila: \(2\begin{vmatrix}3&3\\7&9\end{vmatrix}-1\begin{vmatrix}4&3\\8&9\end{vmatrix}+1\begin{vmatrix}4&3\\8&7\end{vmatrix}=2(6)-1(12)+1(4)=4\).</li>
        <li>Por eliminación (ver el ejemplo de matrices): solo hubo reemplazos, así que \(\det A=u_{11}u_{22}u_{33}=2\cdot1\cdot2=4\). ✓</li>
        <li>Para \(x_3\) se reemplaza la tercera columna por \(\mathbf{b}\): \(\det A_3=\begin{vmatrix}2&1&4\\4&3&10\\8&7&24\end{vmatrix}=2(72-70)-1(96-80)+4(28-24)=4-16+16=4\).</li>
        <li>\(x_3=\det A_3/\det A=4/4=1\). Comprobación: \(\mathbf{x}=(1,1,1)\) da \(A\mathbf{x}=(4,10,24)\). ✓</li>
      </ol>
    </div>
  </div>

  <div class="pager"><a href="#al-matrices"><small>← Anterior</small>Álgebra de matrices</a><a class="next" href="#al-espacios"><small>Siguiente →</small>Espacios y subespacios</a></div>
  <p class="note">Contenido de referencia: Strang, <i>Introduction to Linear Algebra</i>, cap. 5; Axler, <i>Linear Algebra Done Right</i>, cap. 10; Grossman, <i>Álgebra lineal</i>, cap. 3. Redacción y simulaciones propias.</p>
</section>`);


/* ================= LABORATORIOS ================= */

const sgnTerm=(v,s,first)=>{if(Math.abs(v)<1e-12)return '';const a=Math.abs(v),c=(a===1?'':nt(a,2))+s;return first?(v<0?'−':'')+c:(v<0?' − ':' + ')+c;};
const eqTxt=(a,b,c)=>{let s=sgnTerm(a,'x',true);s+=sgnTerm(b,'y',!s);return (s||'0')+' = '+nt(c,2);};
const det2=(a,b,c,d)=>a*d-b*c;
const mm=(A,B)=>[[A[0][0]*B[0][0]+A[0][1]*B[1][0],A[0][0]*B[0][1]+A[0][1]*B[1][1]],[A[1][0]*B[0][0]+A[1][1]*B[1][0],A[1][0]*B[0][1]+A[1][1]*B[1][1]]];
const eqM=(A,B)=>A.every((r,i)=>r.every((v,j)=>Math.abs(v-B[i][j])<1e-9));
const ZERO=1e-9;

/* ---------- AL · GAUSS ---------- */
LABS['al-gauss']=function(sec){
  /* ---- pestaña 1: rectas ---- */
  const cv=$('#ag-cv',sec),rd=$('#ag-read',sec),K6=['a11','a12','b1','a21','a22','b2'],g={};
  K6.forEach(k=>g[k]=sl(sec,'ag-'+k,v=>nt(v,1),()=>draw1()));
  const gv=segm(sec,'ag-view','v',()=>draw1());
  const PRE={u:[1,1,3,1,-1,1],p:[1,2,2,1,2,-2],c:[1,-1,1,2,-2,2]};
  $$('button[data-p]',sec).forEach(b=>b.onclick=()=>{PRE[b.dataset.p].forEach((v,i)=>g[K6[i]].set(v));draw1();});
  function lineIn(ctx,P,a,b,c,col,lw,dash){
    ctx.save();ctx.strokeStyle=col;ctx.lineWidth=lw;if(dash)ctx.setLineDash(dash);ctx.beginPath();
    if(Math.abs(b)>ZERO){const x0=P.xr[0],x1=P.xr[1];ctx.moveTo(P.X(x0),P.Y((c-a*x0)/b));ctx.lineTo(P.X(x1),P.Y((c-a*x1)/b));}
    else if(Math.abs(a)>ZERO){const x=c/a;ctx.moveTo(P.X(x),0);ctx.lineTo(P.X(x),P.cy*2);}
    ctx.stroke();ctx.restore();}
  function draw1(){
    if(!vis(cv))return;
    const {ctx,w,h}=fit(cv,.85,470,300);
    const a=g.a11(),b=g.a12(),c=g.b1(),d=g.a21(),e=g.a22(),f=g.b2(),D=det2(a,b,d,e);
    const nzA=[a,b,d,e].some(v=>Math.abs(v)>ZERO);
    const rA=Math.abs(D)>ZERO?2:nzA?1:0;
    const m3=[det2(a,b,d,e),det2(a,c,d,f),det2(b,c,e,f)];
    const rAb=m3.some(v=>Math.abs(v)>ZERO)?2:[a,b,c,d,e,f].some(v=>Math.abs(v)>ZERO)?1:0;
    const ok=rA===rAb,uni=ok&&rA===2,x=uni?(c*e-b*f)/D:NaN,y=uni?(a*f-c*d)/D:NaN;
    if(gv()==='f'){
      const P=plane(ctx,w,h,5.5);
      lineIn(ctx,P,a,b,c,K.t,3.5);
      lineIn(ctx,P,d,e,f,K.b,3,ok&&!uni?[10,8]:null);
      if(uni){dot(ctx,P.X(x),P.Y(y),7,K.ink);label(ctx,`(${nt(x,2)}, ${nt(y,2)})`,P.X(x)+12,P.Y(y)-14,K.ink);}
      label(ctx,'Ecuación 1: '+eqTxt(a,b,c),10,16,K.t);label(ctx,'Ecuación 2: '+eqTxt(d,e,f),10,34,K.b);
    }else{
      const pts=[[a,d],[b,e],[c,f]];if(uni)pts.push([x*a,x*d]);
      const R=Math.min(14,Math.max(3.5,1.18*Math.max(...pts.map(p=>Math.max(Math.abs(p[0]),Math.abs(p[1]))))));
      const P=plane(ctx,w,h,R),O=[P.X(0),P.Y(0)];
      if(!uni&&rA===1){const v=Math.hypot(a,d)>ZERO?[a,d]:[b,e];const L=3*R/Math.hypot(v[0],v[1]);
        ctx.save();ctx.strokeStyle='rgba(15,118,110,.25)';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(P.X(-L*v[0]),P.Y(-L*v[1]));ctx.lineTo(P.X(L*v[0]),P.Y(L*v[1]));ctx.stroke();ctx.restore();
        label(ctx,'span{a₁, a₂}: una sola recta',10,16,K.t);}
      if(uni){arrow(ctx,O[0],O[1],P.X(x*a),P.Y(x*d),K.b,2,[6,5]);arrow(ctx,P.X(x*a),P.Y(x*d),P.X(c),P.Y(f),K.a,2,[6,5]);
        label(ctx,`${nt(x,2)}·a₁`,P.X(x*a/2)+8,P.Y(x*d/2)+12,K.b);label(ctx,`${nt(y,2)}·a₂`,P.X(x*a+y*b/2)+8,P.Y(x*d+y*e/2),K.a);}
      arrow(ctx,O[0],O[1],P.X(a),P.Y(d),K.b,3.5);label(ctx,'a₁',P.X(a)+8,P.Y(d)-10,K.b);
      arrow(ctx,O[0],O[1],P.X(b),P.Y(e),K.a,3.5);label(ctx,'a₂',P.X(b)+8,P.Y(e)-10,K.a);
      arrow(ctx,O[0],O[1],P.X(c),P.Y(f),K.ink,3.5);label(ctx,'b',P.X(c)+8,P.Y(f)-10,K.ink);
    }
    const cls=!ok?'incompatible: no hay solución':uni?'compatible determinado: solución única':rA===0?'0 = 0: todo el plano es solución':'compatible indeterminado: infinitas soluciones';
    rd.innerHTML=rowT('<b style="color:var(--kl-c-teal)">'+eqTxt(a,b,c)+'</b>')+rowT('<b style="color:var(--kl-c-orange)">'+eqTxt(d,e,f)+'</b>')+sep+
      row('det A','a₁₁a₂₂ − a₁₂a₂₁ = '+nt(D,3))+row('rg A',rA)+row('rg [A | b]',rAb)+sep+
      rowT('Rouché-Frobenius: '+cls)+
      (uni?row('x',nt(x,3))+row('y',nt(y,3)):'')+
      (ok&&!uni&&rA===1?rowT('Una de las ecuaciones es múltiplo de la otra: queda una recta de soluciones, con un parámetro libre (2 − 1 = 1).'):'')+
      (!ok?rowT('Las rectas son paralelas y distintas. Por columnas: b no está en la recta generada por a₁ y a₂.'):'');
  }

  /* ---- pestaña 2: eliminación ---- */
  const SYS=[
    [[1,1,1,6],[2,3,1,11],[3,-1,2,7]],
    [[0,2,1,7],[1,1,1,6],[2,1,3,13]],
    [[1,2,-1,3],[2,4,1,9],[3,6,0,12]],
    [[1,1,1,2],[1,2,3,5],[2,3,4,9]],
    [[1,2,0,1,4],[2,4,1,3,11],[1,2,1,2,7]]];
  const tab=$('#ag-tab',sec),op=$('#ag-op',sec),gr=$('#ag-gread',sec),cnt=$('#ag-cnt',sec);
  const sub=i=>String(i).split('').map(c=>'₀₁₂₃₄₅₆₇₈₉'[c]).join('');
  let steps=[],idx=0,info=null;
  const kF=(k,j)=>{const a=Q(Math.abs(k.n),k.d);return (a.n===1&&a.d===1?'':qs(a)+'·')+'F'+sub(j);};
  function build(M0,jordan){
    const M=M0.map(r=>r.map(v=>Q(v))),m=M.length,n=M[0].length-1,S=[];
    const shot=(t,piv,chg)=>S.push({M:M.map(r=>r.slice()),op:t,piv,chg});
    shot('Matriz aumentada inicial [A | b]. Se busca un pivote en la primera columna.',null,[]);
    let r=0;
    for(let c=0;c<n&&r<m;c++){
      let p=-1;for(let i=r;i<m;i++)if(!qz(M[i][c])){p=i;break;}
      if(p<0){shot(`La columna ${c+1} no tiene entradas no nulas desde la fila ${r+1}: no hay pivote en ella.`,null,[]);continue;}
      if(p!==r){[M[p],M[r]]=[M[r],M[p]];shot(`Intercambio <b>F${sub(r+1)} ↔ F${sub(p+1)}</b>: la entrada (${r+1}, ${c+1}) era 0 y hace falta un pivote no nulo.`,[r,c],[r,p]);}
      if(jordan&&!(M[r][c].n===1&&M[r][c].d===1)){const k=qdiv(Q(1),M[r][c]);M[r]=M[r].map(v=>qmul(v,k));shot(`Escalamiento <b>F${sub(r+1)} ← ${qs(k)}·F${sub(r+1)}</b>: el pivote pasa a valer 1.`,[r,c],[r]);}
      for(let i=jordan?0:r+1;i<m;i++){
        if(i===r||qz(M[i][c]))continue;
        const k=qdiv(M[i][c],M[r][c]);M[i]=M[i].map((v,j)=>qsub(v,qmul(k,M[r][j])));
        shot(`Reemplazo <b>F${sub(i+1)} ← F${sub(i+1)} ${k.n>0?'−':'+'} ${kF(k,r+1)}</b>: anula la entrada (${i+1}, ${c+1}) usando el pivote ${qs(M[r][c])}.`,[r,c],[i]);
      }
      r++;
    }
    return {S,M,n,m};
  }
  function analyze(M0){
    const {M,n,m}=build(M0,true);const piv=[];let bad=false;
    for(let i=0;i<m;i++){const j=M[i].slice(0,n).findIndex(v=>!qz(v));if(j<0){if(!qz(M[i][n]))bad=true;}else piv.push([i,j]);}
    const rA=piv.length,rAb=rA+(bad?1:0),pc=piv.map(p=>p[1]),free=[...Array(n).keys()].filter(j=>!pc.includes(j));
    let sol='';
    if(!bad){const tn={};free.forEach((j,k)=>tn[j]='t'+(free.length>1?sub(k+1):''));
      sol=[...Array(n).keys()].map(j=>{
        if(free.includes(j))return row('x'+sub(j+1),tn[j]+' (libre)');
        const i=piv.find(p=>p[1]===j)[0];let s=qz(M[i][n])?'':qs(M[i][n]);
        free.forEach(f=>{const v=qneg(M[i][f]);if(qz(v))return;const a=Q(Math.abs(v.n),v.d),cf=(a.n===1&&a.d===1?'':qs(a))+tn[f];
          s+=s?(v.n<0?' − ':' + ')+cf:(v.n<0?'−':'')+cf;});
        return row('x'+sub(j+1),s||'0');}).join('');}
    return {rA,rAb,n,bad,free,sol};
  }
  function render(){
    const st=steps[idx],n=st.M[0].length-1;
    let h='<table class="aa-aug"><tr><th></th>'+[...Array(n).keys()].map(j=>`<th>x${sub(j+1)}</th>`).join('')+'<th class="bar">b</th></tr>';
    st.M.forEach((r,i)=>{h+=`<tr class="${st.chg.includes(i)?'chg':''}"><td class="lbl">F${sub(i+1)}</td>`+r.map((v,j)=>`<td class="${j===n?'bar':''}${st.piv&&st.piv[0]===i&&st.piv[1]===j?' piv':''}">${qs(v)}</td>`).join('')+'</tr>';});
    tab.innerHTML=h+'</table>';
    const last=idx===steps.length-1,jor=gm()==='j';
    const I0=info,fin=I0.bad?' La última fila dice <b>0 = '+qs(st.M[st.M.length-1][n])+'</b>: el sistema no tiene solución.':I0.free.length?' Las columnas sin pivote dan '+I0.free.length+' variable'+(I0.free.length>1?'s':'')+' libre'+(I0.free.length>1?'s':'')+'.':'';
    op.innerHTML=last&&idx>0?st.op+fin+' '+(jor?'Se llegó a la <b>forma escalonada reducida</b>.':'Se llegó a la <b>forma escalonada</b>; falta la sustitución hacia atrás.'):st.op;
    cnt.textContent=`Paso ${idx} de ${steps.length-1}`;
    const I=info,concl=I.bad?'incompatible (aparece una fila 0 = c con c ≠ 0)':I.rA===I.n?'compatible determinado: solución única':`compatible indeterminado: ${I.n-I.rA} parámetro${I.n-I.rA>1?'s':''} libre${I.n-I.rA>1?'s':''}`;
    gr.innerHTML=row('incógnitas n',I.n)+row('rg A',last?I.rA:'…')+row('rg [A | b]',last?I.rAb:'…')+sep+
      (last?rowT('Rouché-Frobenius: '+concl)+(I.bad?'':sep+rowT(I.free.length?'Solución general (las libres valen cualquier número):':'Solución:')+I.sol)
           :rowT('Avanza hasta el final para leer el rango y la solución.'));
  }
  const gm=segm(sec,'ag-mode','m',()=>reset());
  const pre=$('#ag-pre',sec);
  function reset(){const M0=SYS[+pre.value];steps=build(M0,gm()==='j').S;info=analyze(M0);idx=0;render();}
  pre.onchange=reset;
  $('#ag-next',sec).onclick=()=>{if(idx<steps.length-1){idx++;render();}};
  $('#ag-prev',sec).onclick=()=>{if(idx>0){idx--;render();}};
  $('#ag-reset',sec).onclick=()=>{idx=0;render();};
  reset();
  return {draw:draw1};
};

/* ---------- AL · MATRICES ---------- */
const TR={
  r90:['Rotación 90°',[[0,-1],[1,0]]],
  r45:['Rotación 45°',[[Math.SQRT1_2,-Math.SQRT1_2],[Math.SQRT1_2,Math.SQRT1_2]]],
  ciz:['Cizalla horizontal',[[1,1],[0,1]]],
  esc:['Escala (2, ½)',[[2,0],[0,0.5]]],
  esu:['Escala uniforme ×1,5',[[1.5,0],[0,1.5]]],
  ref:['Reflexión en y = x',[[0,1],[1,0]]],
  pro:['Proyección sobre el eje x',[[1,0],[0,0]]]};
function figure(ctx,P,A,col){
  poly(ctx,P,FIG,null,null,K.ax,1.5,[5,4]);
  poly(ctx,P,FIG,A,col==='o'?'rgba(217,72,15,.30)':'rgba(15,118,110,.28)',col==='o'?K.b:K.t,2.5);}
LABS['al-matrices']=function(sec){
  const cv=$('#am-cv',sec),rd=$('#am-read',sec);
  let A=[[1.5,-0.5],[0.5,1]];const R=4;let P=null;
  const c30=Math.cos(Math.PI/6),s30=0.5;
  const PRE={id:[[1,0],[0,1]],rot:[[c30,-s30],[s30,c30]],ciz:[[1,1],[0,1]],ref:[[-1,0],[0,1]],esc:[[2,0],[0,0.5]],pro:[[1,0],[0,0]]};
  $$('button[data-p]',sec).forEach(b=>b.onclick=()=>{A=PRE[b.dataset.p].map(r=>r.slice());draw1();});
  function draw1(){
    if(!vis(cv))return;
    const {ctx,w,h}=fit(cv,.85,470,300);
    P=plane(ctx,w,h,R);
    tgrid(ctx,P,A,10,'rgba(15,118,110,.30)');
    poly(ctx,P,[[0,0],[1,0],[1,1],[0,1]],A,'rgba(15,118,110,.12)',K.t,1.5);
    figure(ctx,P,A,'o');
    const O=[P.X(0),P.Y(0)],e1=[A[0][0],A[1][0]],e2=[A[0][1],A[1][1]];
    arrow(ctx,O[0],O[1],P.X(e1[0]),P.Y(e1[1]),K.b,3.5);arrow(ctx,O[0],O[1],P.X(e2[0]),P.Y(e2[1]),K.a,3.5);
    dot(ctx,P.X(e1[0]),P.Y(e1[1]),7,'#fff',K.b);dot(ctx,P.X(e2[0]),P.Y(e2[1]),7,'#fff',K.a);
    label(ctx,'Ae₁',P.X(e1[0])+10,P.Y(e1[1])+14,K.b);label(ctx,'Ae₂',P.X(e2[0])+10,P.Y(e2[1])-14,K.a);
    const D=det2(A[0][0],A[0][1],A[1][0],A[1][1]);
    const inv=Math.abs(D)>ZERO?mat([[A[1][1]/D,-A[0][1]/D],[-A[1][0]/D,A[0][0]/D]]):'<span style="color:var(--kl-c-red)">no existe</span>';
    rd.innerHTML=row('A',mat(A))+row('Ae₁ (columna 1)',`(${nt(e1[0])}, ${nt(e1[1])})`)+row('Ae₂ (columna 2)',`(${nt(e2[0])}, ${nt(e2[1])})`)+sep+
      row('det A',nt(D,3))+row('A⁻¹',inv)+sep+
      rowT(Math.abs(D)<ZERO?'det A = 0: las columnas son paralelas y el plano se aplasta sobre una recta (o un punto). Distintos x tienen la misma imagen, así que no se puede deshacer.':
        D<0?`La F aparece reflejada: A invierte la orientación. Las áreas se multiplican por |det A| = ${nt(Math.abs(D),2)}.`:
        `A conserva la orientación. Las áreas se multiplican por det A = ${nt(D,2)}.`);
  }
  drag(cv,(x,y)=>{if(!P)return null;const h=[[A[0][0],A[1][0]],[A[0][1],A[1][1]]];let best=null,bd=18;
      h.forEach((p,i)=>{const d=Math.hypot(P.X(p[0])-x,P.Y(p[1])-y);if(d<bd){bd=d;best=i;}});return best;},
    (i,x,y)=>{const u=Math.max(-R+.2,Math.min(R-.2,snap(P.ix(x)))),v=Math.max(-R+.2,Math.min(R-.2,snap(P.iy(y))));A[0][i]=u;A[1][i]=v;draw1();});

  /* composición */
  const cv2=$('#am-cv2',sec),rd2=$('#am-read2',sec),sA=$('#am-A',sec),sB=$('#am-B',sec);
  const opts=Object.entries(TR).map(([k,v])=>`<option value="${k}">${v[0]}</option>`).join('');
  sA.innerHTML=opts;sB.innerHTML=opts;sA.value='r90';sB.value='ciz';
  sA.onchange=sB.onchange=()=>draw2();
  function draw2(){
    if(!vis(cv2))return;
    const {ctx,w,h}=fit(cv2,.55,380,240),Am=TR[sA.value][1],Bm=TR[sB.value][1],AB=mm(Am,Bm),BA=mm(Bm,Am);
    const P1=plane(ctx,w,h,3.8,0,w/2-4),P2=plane(ctx,w,h,3.8,w/2+4,w/2-4);
    ctx.fillStyle='#fff';ctx.fillRect(w/2-4,0,8,h);ctx.strokeStyle=K.line;ctx.beginPath();ctx.moveTo(w/2,0);ctx.lineTo(w/2,h);ctx.stroke();
    ctx.save();ctx.beginPath();ctx.rect(0,0,w/2-4,h);ctx.clip();figure(ctx,P1,AB,'o');ctx.restore();
    ctx.save();ctx.beginPath();ctx.rect(w/2+4,0,w/2-4,h);ctx.clip();figure(ctx,P2,BA,'t');ctx.restore();
    label(ctx,'AB: primero B, luego A',10,16,K.b);label(ctx,'BA: primero A, luego B',w/2+14,16,K.t);
    const same=eqM(AB,BA);
    rd2.innerHTML=row('A',mat(Am))+row('B',mat(Bm))+sep+row('AB',mat(AB))+row('BA',mat(BA))+sep+
      rowT(same?'<b style="color:var(--kl-c-green)">AB = BA</b>: estas dos transformaciones conmutan.':'<b style="color:var(--kl-c-red)">AB ≠ BA</b>: el orden de composición importa.')+
      rowT(`En cualquier caso det(AB) = det(BA) = det A · det B = ${nt(det2(AB[0][0],AB[0][1],AB[1][0],AB[1][1]),3)}.`);
  }
  return {draw(){draw1();draw2();}};
};

/* ---------- AL · DETERMINANTES ---------- */
LABS['al-determinantes']=function(sec){
  const cv=$('#ad-cv',sec),rd=$('#ad-read',sec);
  const C=[[2,0.5],[1.5,-1]]; /* columnas a1, a2 */
  const R=4;let P=null,play=false;
  const gt=sl(sec,'ad-t',v=>nf(v,2),()=>{play=false;draw1();});
  const pb=$('#ad-play',sec);pb.onclick=()=>{play=true;gt.set(0);};
  const Mt=t=>[[(1-t)+t*C[0][0],t*C[1][0]],[t*C[0][1],(1-t)+t*C[1][1]]];
  const dM=t=>{const M=Mt(t);return det2(M[0][0],M[0][1],M[1][0],M[1][1]);};
  function roots(){const r=[];let p=dM(0);for(let i=1;i<=400;i++){const t=i/400,q=dM(t);if(p*q<0){let a=t-1/400,b=t;for(let k=0;k<40;k++){const m=(a+b)/2;dM(a)*dM(m)<=0?b=m:a=m;}r.push((a+b)/2);}p=q;}return r;}
  function draw1(){
    if(!vis(cv))return;
    const {ctx,w,h}=fit(cv,.85,470,300);P=plane(ctx,w,h,R);
    const t=gt(),M=Mt(t),D=dM(t),DA=dM(1);
    tgrid(ctx,P,M,10,'rgba(15,118,110,.22)');
    const pos=D>ZERO,neg=D<-ZERO;
    poly(ctx,P,[[0,0],[1,0],[1,1],[0,1]],null,null,K.ax,1.5,[5,4]);
    poly(ctx,P,[[0,0],[1,0],[1,1],[0,1]],M,pos?'rgba(15,118,110,.30)':neg?'rgba(201,42,42,.28)':null,pos?K.t:neg?K.w:K.ink,2.5);
    const O=[P.X(0),P.Y(0)];
    arrow(ctx,O[0],O[1],P.X(M[0][0]),P.Y(M[1][0]),K.b,3.5);arrow(ctx,O[0],O[1],P.X(M[0][1]),P.Y(M[1][1]),K.a,3.5);
    dot(ctx,P.X(C[0][0]),P.Y(C[0][1]),7,'#fff',K.b);dot(ctx,P.X(C[1][0]),P.Y(C[1][1]),7,'#fff',K.a);
    label(ctx,'a₁',P.X(C[0][0])+10,P.Y(C[0][1])+14,K.b);label(ctx,'a₂',P.X(C[1][0])+10,P.Y(C[1][1])-14,K.a);
    /* inserto: det M(t) */
    const bw=Math.min(170,w*.36),bh=90,bx=w-bw-10,by=10;
    ctx.fillStyle='rgba(255,255,255,.94)';ctx.fillRect(bx,by,bw,bh);ctx.strokeStyle=K.line;ctx.strokeRect(bx,by,bw,bh);
    let lo=0,hi=0;for(let i=0;i<=60;i++){const v=dM(i/60);lo=Math.min(lo,v);hi=Math.max(hi,v);}if(hi-lo<1e-6)hi=lo+1;
    const pad=(hi-lo)*.12;lo-=pad;hi+=pad;const IX=s=>bx+10+s*(bw-20),IY=v=>by+bh-14-(v-lo)/(hi-lo)*(bh-30);
    ctx.strokeStyle=K.ax;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(IX(0),IY(0));ctx.lineTo(IX(1),IY(0));ctx.stroke();
    ctx.strokeStyle=K.t;ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<=60;i++){const s=i/60;i?ctx.lineTo(IX(s),IY(dM(s))):ctx.moveTo(IX(s),IY(dM(s)));}ctx.stroke();
    dot(ctx,IX(t),IY(D),4.5,pos?K.t:neg?K.w:K.ink);
    label(ctx,'det M(t)',bx+8,by+10,K.mut,'left','middle','600 11px Inter');label(ctx,'t',IX(1),IY(lo)+2,K.mut,'right','middle','600 11px Inter');
    const rt=roots();
    rd.innerHTML=row('A = [a₁ a₂]',mat([[C[0][0],C[1][0]],[C[0][1],C[1][1]]]))+row('det A',nt(DA,3))+sep+
      row('t',nf(t,2))+row('det M(t)',nt(D,3))+row('área del paralelogramo',nt(Math.abs(D),3))+row('orientación',pos?'conservada (+)':neg?'invertida (−)':'degenerado: área 0')+sep+
      rowT(DA<0&&rt.length?`Como det I = 1 > 0 y det A < 0, el determinante se anula en t ≈ ${rt.map(r=>nf(r,3)).join(' y ')}: ahí las columnas son paralelas.`:
        rt.length?`det M(t) se anula en t ≈ ${rt.map(r=>nf(r,3)).join(' y ')}.`:'Durante toda la deformación el área nunca se anula: la orientación se mantiene.');
  }
  drag(cv,(x,y)=>{if(!P)return null;let best=null,bd=18;C.forEach((p,i)=>{const d=Math.hypot(P.X(p[0])-x,P.Y(p[1])-y);if(d<bd){bd=d;best=i;}});return best;},
    (i,x,y)=>{play=false;C[i]=[Math.max(-R+.2,Math.min(R-.2,snap(P.ix(x)))),Math.max(-R+.2,Math.min(R-.2,snap(P.iy(y))))];gt.set(1);draw1();});

  /* Cramer */
  const cv2=$('#ad-cv2',sec),rd2=$('#ad-read2',sec);
  const H=[[2,0.5],[0.5,1.5],[4,3]];const R2=5;let P2=null;
  function para(ctx,P,u,v,fill,stroke){poly(ctx,P,[[0,0],u,[u[0]+v[0],u[1]+v[1]],v],null,fill,stroke,2);}
  function draw2(){
    if(!vis(cv2))return;
    const {ctx,w,h}=fit(cv2,.85,470,300);P2=plane(ctx,w,h,R2);
    const [a1,a2,b]=H,D=det2(a1[0],a2[0],a1[1],a2[1]),Dx=det2(b[0],a2[0],b[1],a2[1]),Dy=det2(a1[0],b[0],a1[1],b[1]);
    para(ctx,P2,a1,a2,'rgba(15,118,110,.22)',K.t);
    para(ctx,P2,b,a2,'rgba(217,72,15,.16)',K.b);
    para(ctx,P2,a1,b,'rgba(112,72,232,.14)',K.d);
    const O=[P2.X(0),P2.Y(0)];
    if(Math.abs(D)>ZERO){const x=Dx/D;arrow(ctx,O[0],O[1],P2.X(x*a1[0]),P2.Y(x*a1[1]),K.ink,1.8,[6,5]);arrow(ctx,P2.X(x*a1[0]),P2.Y(x*a1[1]),P2.X(b[0]),P2.Y(b[1]),K.ink,1.8,[6,5]);}
    arrow(ctx,O[0],O[1],P2.X(a1[0]),P2.Y(a1[1]),K.b,3.5);arrow(ctx,O[0],O[1],P2.X(a2[0]),P2.Y(a2[1]),K.a,3.5);arrow(ctx,O[0],O[1],P2.X(b[0]),P2.Y(b[1]),K.ink,3.5);
    H.forEach((p,i)=>dot(ctx,P2.X(p[0]),P2.Y(p[1]),7,'#fff',[K.b,K.a,K.ink][i]));
    label(ctx,'a₁',P2.X(a1[0])+10,P2.Y(a1[1])+14,K.b);label(ctx,'a₂',P2.X(a2[0])+10,P2.Y(a2[1])-14,K.a);label(ctx,'b',P2.X(b[0])+10,P2.Y(b[1])-12,K.ink);
    const ok=Math.abs(D)>ZERO;
    rd2.innerHTML=row('<span class="sw" style="background:#0f766e"></span>det[a₁ a₂]',nt(D,3))+row('<span class="sw" style="background:#d9480f"></span>det[b a₂]',nt(Dx,3))+row('<span class="sw" style="background:#7048e8"></span>det[a₁ b]',nt(Dy,3))+sep+
      (ok?row('x = det[b a₂] / det[a₁ a₂]',nt(Dx/D,3))+row('y = det[a₁ b] / det[a₁ a₂]',nt(Dy/D,3))+sep+
        row('x·a₁ + y·a₂',`(${nt(Dx/D*a1[0]+Dy/D*a2[0],2)}, ${nt(Dx/D*a1[1]+Dy/D*a2[1],2)})`)+row('b',`(${nt(b[0],2)}, ${nt(b[1],2)})`)
        :rowT('det[a₁ a₂] = 0: las columnas son paralelas y Cramer no se puede aplicar. El sistema no tiene solución única.'));
  }
  drag(cv2,(x,y)=>{if(!P2)return null;let best=null,bd=18;H.forEach((p,i)=>{const d=Math.hypot(P2.X(p[0])-x,P2.Y(p[1])-y);if(d<bd){bd=d;best=i;}});return best;},
    (i,x,y)=>{H[i]=[Math.max(-R2+.2,Math.min(R2-.2,snap(P2.ix(x)))),Math.max(-R2+.2,Math.min(R2-.2,snap(P2.iy(y))))];draw2();});

  return {draw(){draw1();draw2();},tick(dt){if(!play||!vis(cv))return;const t=Math.min(1,gt()+dt/2.5);gt.set(t);if(t>=1)play=false;draw1();}};
};

/* ================= AL · UNIDAD II · ESPACIOS VECTORIALES ================= */
const U2='Unidad II · Espacios vectoriales';
V.push(topicPage({id:'al-espacios',pre:'ae',course:AL,unit:U2,title:'Espacios y subespacios vectoriales',
lead:String.raw`Un espacio vectorial es cualquier conjunto en el que se pueden sumar elementos y multiplicarlos por escalares con las mismas reglas que las flechas del plano. Lo que importa es la estructura, no la naturaleza de los objetos: polinomios, matrices, funciones y soluciones de una EDO lineal también son vectores.`,
res:[String.raw`<b>Definición.</b> Un espacio vectorial sobre el cuerpo \(\mathbb{K}\) es un conjunto \(V\) con una suma \(V\times V\to V\) y un producto por escalares \(\mathbb{K}\times V\to V\) que cumplen ocho axiomas: la suma es conmutativa y asociativa, existe un neutro \(\mathbf{0}\) y cada \(\mathbf{v}\) tiene opuesto \(-\mathbf{v}\); además \(1\mathbf{v}=\mathbf{v}\), \((ab)\mathbf{v}=a(b\mathbf{v})\), \(a(\mathbf{u}+\mathbf{v})=a\mathbf{u}+a\mathbf{v}\) y \((a+b)\mathbf{v}=a\mathbf{v}+b\mathbf{v}\).`,
String.raw`<b>Consecuencias inmediatas.</b> \(0\,\mathbf{v}=\mathbf{0}\), \(a\,\mathbf{0}=\mathbf{0}\), \((-1)\mathbf{v}=-\mathbf{v}\), y el neutro y los opuestos son únicos. Por ejemplo, \(0\mathbf{v}=(0+0)\mathbf{v}=0\mathbf{v}+0\mathbf{v}\), y al sumar \(-0\mathbf{v}\) a ambos lados queda \(\mathbf{0}=0\mathbf{v}\).`,
String.raw`<b>Ejemplos.</b> \(\mathbb{K}^n\); las matrices \(\mathbb{K}^{m\times n}\); los polinomios \(P_n\) de grado \(\le n\); las funciones continuas \(C[a,b]\); las soluciones de \(y''+\omega^2y=0\). \(\mathbb{C}\) es un espacio de dimensión 2 sobre \(\mathbb{R}\) y de dimensión 1 sobre \(\mathbb{C}\): el cuerpo de escalares forma parte de la definición.`,
String.raw`<b>Subespacio.</b> \(W\subseteq V\) es subespacio si es un espacio vectorial con las mismas operaciones. Basta comprobar que \(\mathbf{0}\in W\) y que \(a\mathbf{u}+b\mathbf{v}\in W\) para todo \(\mathbf{u},\mathbf{v}\in W\) y \(a,b\in\mathbb{K}\). Los subespacios de \(\mathbb{R}^3\) son \(\{\mathbf{0}\}\), las rectas y los planos que pasan por el origen, y \(\mathbb{R}^3\).`,
String.raw`<b>Lo que no es subespacio.</b> Una recta que no pasa por el origen (no contiene \(\mathbf{0}\)); el primer cuadrante (no es cerrado bajo multiplicar por \(-1\)); la unión de dos rectas (no es cerrada bajo la suma); una parábola (no es cerrada bajo ninguna de las dos).`,
String.raw`<b>Núcleo, espacio columna y sistemas.</b> \(\ker A=\{\mathbf{x}:A\mathbf{x}=\mathbf{0}\}\) es subespacio de \(\mathbb{K}^n\) y \(\operatorname{col}A\) es subespacio de \(\mathbb{K}^m\). Las soluciones de \(A\mathbf{x}=\mathbf{b}\) con \(\mathbf{b}\neq\mathbf{0}\) <i>no</i> forman un subespacio: forman el conjunto afín \(\mathbf{x}_p+\ker A\), un subespacio trasladado.`,
String.raw`<b>Operaciones con subespacios.</b> La intersección \(U\cap W\) siempre es subespacio; la unión casi nunca lo es. La suma \(U+W=\{\mathbf{u}+\mathbf{w}\}\) es el menor subespacio que contiene a ambos. El span de un conjunto \(S\), \(\operatorname{span}S\), es el conjunto de sus combinaciones lineales finitas: el menor subespacio que contiene a \(S\).`,
String.raw`<b>En física: superposición.</b> Si una ecuación es lineal y homogénea (ondas, Schrödinger, Maxwell en el vacío, circuitos sin fuentes), sus soluciones forman un espacio vectorial: cualquier combinación lineal de soluciones es solución. Si hay una fuente, las soluciones forman un conjunto afín.`],
lab:tabs([['sub','¿Es subespacio de ℝ²?',`<div class="controls" style="margin:0 0 12px">${sel('ae-set',[['recta','Recta y = x/2 (por el origen)'],['afin','Recta y = x/2 + 1'],['ejes','Unión de los dos ejes'],['cuad','Primer cuadrante'],['parab','Parábola y = x²/2'],['cero','Solo el origen {0}'],['todo','Todo ℝ²']])}</div>`+
  lab2('ae-cv',slider('ae-s','u',-3,3,0.1,1.4)+slider('ae-t','v',-3,3,0.1,-0.8)+slider('ae-c','c',-2,2,0.1,-1),'ae-read',String.raw`El conjunto \(W\) está en verde. Mueve \(\mathbf{u}\) y \(\mathbf{v}\) dentro de \(W\) y el escalar \(c\): si \(\mathbf{u}+\mathbf{v}\) (morado) o \(c\,\mathbf{u}\) (naranja) se salen de \(W\) para alguna elección, \(W\) no es subespacio. Basta un contraejemplo.`)],
 ['sup','Superposición de soluciones',`<div class="controls" style="margin:0 0 12px">${seg('ae-mode','m',[['h','y″ + y = 0 (homogénea)'],['n','y″ + y = 1 (con fuente)']])}</div>`+
  lab2('ae-cv2',slider('ae-a','a',-2,2,0.1,1)+slider('ae-b','b',-2,2,0.1,0.5),'ae-read2',String.raw`Se combinan dos soluciones \(y_1,y_2\) de la ecuación: \(y=a\,y_1+b\,y_2\). En la homogénea, \(y_1=\cos x\) e \(y_2=\sin x\), y toda combinación vuelve a ser solución. En la ecuación con fuente, \(y_1=1+\cos x\) e \(y_2=1+\sin x\): la combinación solo es solución si \(a+b=1\), porque las soluciones forman un conjunto afín.`)]]),
laws:[['Criterio de subespacio',String.raw`W\le V\iff \mathbf{0}\in W\ \text{y}\ a\mathbf{u}+b\mathbf{v}\in W\ \ \forall\,\mathbf{u},\mathbf{v}\in W,\ a,b\in\mathbb{K}`,'Una sola condición resume la cerradura bajo suma y bajo producto por escalar.'],
 ['Span',String.raw`\operatorname{span}\{\mathbf{v}_1,\dots,\mathbf{v}_k\}=\Big\{\textstyle\sum_{i}c_i\mathbf{v}_i:\ c_i\in\mathbb{K}\Big\}`,'Siempre es un subespacio: el menor que contiene a los vectores dados.'],
 ['Núcleo y espacio columna',String.raw`\ker A=\{\mathbf{x}:A\mathbf{x}=\mathbf{0}\},\qquad \operatorname{col}A=\{A\mathbf{x}\}`,String.raw`Subespacios de \(\mathbb{K}^n\) y de \(\mathbb{K}^m\), respectivamente.`],
 ['Conjunto solución de un sistema',String.raw`\{\mathbf{x}:A\mathbf{x}=\mathbf{b}\}=\mathbf{x}_p+\ker A`,String.raw`Es subespacio solo si \(\mathbf{b}=\mathbf{0}\).`],
 ['Intersección y suma',String.raw`U\cap W\le V,\qquad U+W=\{\mathbf{u}+\mathbf{w}\}\le V`,String.raw`\(U\cup W\) es subespacio solo si uno contiene al otro.`],
 ['Superposición',String.raw`L[y_1]=L[y_2]=0\ \Rightarrow\ L[a y_1+b y_2]=0`,String.raw`Vale para todo operador lineal \(L\): derivadas, integrales, \(\hat H\) en cuántica.`]],
ex:[String.raw`Sea \(W=\{p\in P_2:\ p(1)=0\}\). ¿Es subespacio de \(P_2\)? ¿Y \(W'=\{p\in P_2:\ p(1)=1\}\)?`,
 [String.raw`El polinomio cero cumple \(0(1)=0\), así que \(\mathbf{0}\in W\).`,
  String.raw`Si \(p,q\in W\): \((ap+bq)(1)=a\,p(1)+b\,q(1)=a\cdot0+b\cdot0=0\). Luego \(ap+bq\in W\) y \(W\) es subespacio.`,
  String.raw`Descripción: por el teorema del factor, \(p\in W\iff p=(x-1)(c_0+c_1x)\). Así que \(W=\operatorname{span}\{x-1,\ x^2-x\}\).`,
  String.raw`\(W'\) no es subespacio: el polinomio cero da \(0(1)=0\neq1\). También falla la suma: si \(p(1)=q(1)=1\), entonces \((p+q)(1)=2\).`],
 String.raw`Es la misma diferencia que entre \(A\mathbf{x}=\mathbf{0}\) y \(A\mathbf{x}=\mathbf{b}\): la condición \(p(1)=0\) es homogénea y \(p(1)=1\) no.`],
prev:['al-determinantes','Determinantes'],next:['al-base','Independencia, base y dimensión'],
ref:'Axler, <i>Linear Algebra Done Right</i>, cap. 1; Grossman, <i>Álgebra lineal</i>, cap. 5; Strang, cap. 3'}));

V.push(topicPage({id:'al-base',pre:'ab',course:AL,unit:U2,title:'Independencia lineal, base y dimensión',
lead:String.raw`Una base es un sistema de referencia mínimo: genera todo el espacio y no tiene vectores de sobra. Que todas las bases de un espacio tengan el mismo número de vectores permite definir la dimensión, el número que clasifica a los espacios de dimensión finita.`,
res:[String.raw`<b>Independencia lineal.</b> \(\{\mathbf{v}_1,\dots,\mathbf{v}_k\}\) es linealmente independiente (LI) si \(c_1\mathbf{v}_1+\dots+c_k\mathbf{v}_k=\mathbf{0}\) implica \(c_1=\dots=c_k=0\). Si no, es dependiente (LD): algún vector es combinación lineal de los demás y no aporta nada nuevo al span.`,
String.raw`<b>Prueba práctica en \(\mathbb{K}^n\).</b> Se ponen los vectores como columnas de \(M\) y se escalona. Son LI si y solo si hay un pivote en cada columna, es decir \(\operatorname{rg}M=k\). Para \(n\) vectores en \(\mathbb{K}^n\), equivale a \(\det M\neq0\).`,
String.raw`<b>Base.</b> Un conjunto LI que genera \(V\). Todo \(\mathbf{v}\in V\) se escribe de <i>manera única</i> como \(\mathbf{v}=\sum c_i\mathbf{b}_i\): si hubiera dos escrituras, su diferencia sería una combinación nula con coeficientes no nulos.`,
String.raw`<b>Dimensión.</b> Por el lema de intercambio de Steinitz, un conjunto LI nunca tiene más vectores que un conjunto generador. Por eso todas las bases tienen el mismo número de vectores, \(\dim V\). Ejemplos: \(\dim\mathbb{K}^n=n\), \(\dim P_n=n+1\), \(\dim\mathbb{K}^{m\times n}=mn\); \(C[a,b]\) tiene dimensión infinita.`,
String.raw`<b>En dimensión \(n\).</b> \(n\) vectores LI ya son base; \(n\) vectores que generan ya son base; más de \(n\) vectores son siempre LD; menos de \(n\) nunca generan.`,
String.raw`<b>Extraer y completar.</b> De un conjunto generador se extrae una base quitando los vectores dependientes (las columnas pivote de \(M\) forman una base de \(\operatorname{col}M\)). Todo conjunto LI se completa hasta una base añadiendo vectores fuera de su span.`,
String.raw`<b>Funciones y wronskiano.</b> Para funciones derivables, si \(W(f_1,\dots,f_n)=\det\big[f_j^{(i-1)}\big]\neq0\) en algún punto, son LI. Por ejemplo, \(W(e^{x},e^{2x})=e^{3x}\neq0\). Así se verifica que dos soluciones de una EDO de segundo orden forman una base del espacio de soluciones.`,
String.raw`<b>Fórmula de Grassmann.</b> \(\dim(U+W)=\dim U+\dim W-\dim(U\cap W)\). Dos planos por el origen en \(\mathbb{R}^3\) se cortan al menos en una recta: \(2+2-3=1\).`],
lab:`<div class="controls" style="margin:0 0 12px">${seg('ab-v2','v',[['i','v₁ y v₂ independientes'],['p','v₂ paralelo a v₁']])}${btn('ab-rot','Girar automáticamente')}</div>`+
 lab2('ab-cv',slider('ab-al','α',-2,2,0.1,0.8)+slider('ab-be','β',-2,2,0.1,0.6)+slider('ab-la','λ',-1.5,1.5,0.05,0.6),'ab-read',String.raw`Arrastra la figura para girarla. \(\mathbf{v}_3=\alpha\mathbf{v}_1+\beta\mathbf{v}_2+\lambda\,\mathbf{n}\), donde \(\mathbf{n}\) es perpendicular al plano de \(\mathbf{v}_1,\mathbf{v}_2\). Con \(\lambda=0\), \(\mathbf{v}_3\) queda dentro del plano verde y el conjunto es dependiente. Con \(\lambda\neq0\) sale del plano: el paralelepípedo tiene volumen \(|\det|\neq0\) y los tres vectores son una base de \(\mathbb{R}^3\).`),
laws:[['Independencia lineal',String.raw`\sum_{i=1}^k c_i\mathbf{v}_i=\mathbf{0}\ \Rightarrow\ c_1=\dots=c_k=0`,'Equivale a que el sistema homogéneo con esas columnas solo tenga la solución trivial.'],
 ['Rango y dependencia',String.raw`\{\mathbf{v}_i\}\ \text{LI}\iff\operatorname{rg}[\mathbf{v}_1\cdots\mathbf{v}_k]=k`,String.raw`Para \(k=n\) en \(\mathbb{K}^n\): LI \(\iff\det\neq0\).`],
 ['Coordenadas únicas',String.raw`\mathbf{v}=\sum_i c_i\mathbf{b}_i\ \ \text{con}\ (c_i)\ \text{único}`,'Es la propiedad que define una base.'],
 ['Dimensión',String.raw`\dim\mathbb{K}^n=n,\quad\dim P_n=n+1,\quad\dim\mathbb{K}^{m\times n}=mn`,'Todas las bases de un mismo espacio tienen el mismo número de vectores.'],
 ['Grassmann',String.raw`\dim(U+W)=\dim U+\dim W-\dim(U\cap W)`,'Análoga a la inclusión-exclusión para conjuntos finitos.'],
 ['Wronskiano',String.raw`W(f_1,f_2)=\begin{vmatrix}f_1&f_2\\ f_1'&f_2'\end{vmatrix}\neq0\ \Rightarrow\ \text{LI}`,'El recíproco falla para funciones arbitrarias, pero vale para soluciones de una misma EDO lineal.']],
ex:[String.raw`¿Son LI \(\mathbf{v}_1=(1,2,3)\), \(\mathbf{v}_2=(2,5,7)\), \(\mathbf{v}_3=(1,3,4)\)? Halla una base y la dimensión de su span.`,
 [String.raw`\(\det\begin{pmatrix}1&2&1\\2&5&3\\3&7&4\end{pmatrix}=1(20-21)-2(8-9)+1(14-15)=-1+2-1=0\). Son linealmente dependientes.`,
  String.raw`Escalonando las columnas: \(F_2-2F_1\) y \(F_3-3F_1\) dan \(\begin{pmatrix}1&2&1\\0&1&1\\0&1&1\end{pmatrix}\); luego \(F_3-F_2\) anula la última fila. Hay pivotes en las columnas 1 y 2.`,
  String.raw`La relación de dependencia sale de la forma reducida: \(\mathbf{v}_3=-\mathbf{v}_1+\mathbf{v}_2\). Comprobación: \((2-1,\ 5-2,\ 7-3)=(1,3,4)\). ✓`,
  String.raw`Base del span: \(\{\mathbf{v}_1,\mathbf{v}_2\}\) (las columnas pivote). \(\dim\operatorname{span}=2\): los tres vectores están en un plano por el origen.`]],
prev:['al-espacios','Espacios y subespacios'],next:['al-coordenadas','Coordenadas y cambio de base'],
ref:'Strang, <i>Introduction to Linear Algebra</i>, cap. 3; Axler, cap. 2; Lay, cap. 4'}));

V.push(topicPage({id:'al-coordenadas',pre:'ac',course:AL,unit:U2,title:'Coordenadas y cambio de base',
lead:String.raw`Un vector no es su lista de componentes: las componentes dependen de la base elegida. Cambiar de base cambia los números y deja intacto el vector. Esa distinción es la que usa la física para definir un vector por su ley de transformación.`,
res:[String.raw`<b>Coordenadas.</b> Si \(B=\{\mathbf{b}_1,\dots,\mathbf{b}_n\}\) es base de \(V\) y \(\mathbf{v}=\sum c_i\mathbf{b}_i\), el vector de coordenadas es \([\mathbf{v}]_B=(c_1,\dots,c_n)\). La función \(\mathbf{v}\mapsto[\mathbf{v}]_B\) es lineal y biyectiva: todo espacio de dimensión \(n\) es isomorfo a \(\mathbb{K}^n\).`,
String.raw`<b>Matriz de la base.</b> En \(\mathbb{K}^n\), con \(P_B=[\mathbf{b}_1\ \cdots\ \mathbf{b}_n]\) (las columnas son los vectores de la base en coordenadas canónicas): \(\mathbf{v}=P_B[\mathbf{v}]_B\), y por tanto \([\mathbf{v}]_B=P_B^{-1}\mathbf{v}\).`,
String.raw`<b>Entre dos bases.</b> \([\mathbf{v}]_C=P_{C\leftarrow B}[\mathbf{v}]_B\), con \(P_{C\leftarrow B}=P_C^{-1}P_B\). Su columna \(j\) es \([\mathbf{b}_j]_C\). La inversa de \(P_{C\leftarrow B}\) es \(P_{B\leftarrow C}\).`,
String.raw`<b>Componentes contravariantes.</b> Si los vectores de la base se duplican, las coordenadas se reducen a la mitad: las componentes se transforman con \(P^{-1}\), al revés que la base. Por eso se llaman contravariantes.`,
String.raw`<b>Bases ortonormales.</b> Si la base es ortonormal, \(P^{-1}=P^{\mathsf T}\) y cada coordenada es un producto escalar: \(c_i=\mathbf{b}_i\cdot\mathbf{v}\). Lo verás en la Unidad V.`,
String.raw`<b>Rotación de ejes.</b> Con ejes girados un ángulo \(\theta\): \(x'=x\cos\theta+y\sin\theta\), \(y'=-x\sin\theta+y\cos\theta\). Es \([\mathbf{v}]_{B'}=R_\theta^{\mathsf T}\mathbf{v}\): los ejes giran \(+\theta\) y las componentes, \(-\theta\).`,
String.raw`<b>Polinomios.</b> En la base \(\{1,(x-a),(x-a)^2,\dots\}\) las coordenadas de \(p\) son \(p(a),\ p'(a),\ p''(a)/2!,\dots\). La fórmula de Taylor es un cambio de base.`],
lab:`<div class="controls" style="margin:0 0 12px">${btn('ac-p0','Canónica')}${btn('ac-p1','Girada 30°')}${btn('ac-p2','Oblicua')}${btn('ac-p3','Escalada ×2')}</div>`+
 lab2('ac-cv','','ac-read',String.raw`Arrastra \(\mathbf{b}_1\) (naranja), \(\mathbf{b}_2\) (azul) y el vector \(\mathbf{v}\) (negro). La cuadrícula verde es la de la base \(B\): las coordenadas \([\mathbf{v}]_B\) se leen contando celdas de esa cuadrícula. Con “Escalada ×2” la base crece y las coordenadas se reducen a la mitad, aunque \(\mathbf{v}\) no cambie.`),
laws:[['Coordenadas en una base',String.raw`\mathbf{v}=P_B\,[\mathbf{v}]_B\ \iff\ [\mathbf{v}]_B=P_B^{-1}\mathbf{v}`,String.raw`\(P_B\) tiene por columnas los vectores de \(B\).`],
 ['Matriz de cambio de base',String.raw`P_{C\leftarrow B}=P_C^{-1}P_B=\big[\,[\mathbf{b}_1]_C\ \cdots\ [\mathbf{b}_n]_C\,\big]`,'Siempre es invertible.'],
 ['Composición e inversa',String.raw`P_{D\leftarrow B}=P_{D\leftarrow C}P_{C\leftarrow B},\qquad P_{C\leftarrow B}^{-1}=P_{B\leftarrow C}`,'Cambiar de B a C y luego de C a D es cambiar de B a D.'],
 ['Base ortonormal',String.raw`P^{-1}=P^{\mathsf T},\qquad c_i=\mathbf{b}_i\cdot\mathbf{v}`,'Las coordenadas se calculan sin resolver ningún sistema.'],
 ['Rotación de ejes',String.raw`\begin{pmatrix}x'\\y'\end{pmatrix}=\begin{pmatrix}\cos\theta&\sin\theta\\-\sin\theta&\cos\theta\end{pmatrix}\begin{pmatrix}x\\y\end{pmatrix}`,'La ley de transformación que, en Mecánica clásica, define qué es un vector.'],
 ['Taylor como cambio de base',String.raw`p(x)=\sum_{k=0}^{n}\frac{p^{(k)}(a)}{k!}(x-a)^k`,String.raw`Coordenadas de \(p\) en la base \(\{(x-a)^k\}\) de \(P_n\).`]],
ex:[String.raw`Halla las coordenadas de \(\mathbf{v}=(3,1)\) en la base \(B=\{(1,1),(1,-1)\}\).`,
 [String.raw`Se plantea \(c_1(1,1)+c_2(1,-1)=(3,1)\), es decir \(c_1+c_2=3\) y \(c_1-c_2=1\).`,
  String.raw`Sumando y restando: \(c_1=2\), \(c_2=1\). Entonces \([\mathbf{v}]_B=(2,1)\).`,
  String.raw`Con la matriz: \(P_B=\begin{pmatrix}1&1\\1&-1\end{pmatrix}\), \(P_B^{-1}=\tfrac12\begin{pmatrix}1&1\\1&-1\end{pmatrix}\), y \(P_B^{-1}\mathbf{v}=\tfrac12(4,2)=(2,1)\). ✓`,
  String.raw`Como la base es ortogonal, también sirve proyectar: \(c_1=\dfrac{\mathbf{v}\cdot\mathbf{b}_1}{\|\mathbf{b}_1\|^2}=\dfrac{4}{2}=2\) y \(c_2=\dfrac{2}{2}=1\).`],
 'Compruébalo en el laboratorio colocando b₁ = (1, 1), b₂ = (1, −1) y v = (3, 1).'],
prev:['al-base','Independencia, base y dimensión'],next:['al-transformaciones','Transformaciones lineales'],
ref:'Lay, <i>Álgebra lineal y sus aplicaciones</i>, cap. 4; Thornton &amp; Marion, cap. 1; Strang, cap. 8'}));

/* ---------- laboratorios ---------- */
LABS['al-espacios']=function(sec){
  const cv=$('#ae-cv',sec),rd=$('#ae-read',sec),ss=$('#ae-set',sec);let P=null;
  const gs=sl(sec,'ae-s',v=>nf(v,1),()=>draw1()),gt=sl(sec,'ae-t',v=>nf(v,1),()=>draw1()),gc=sl(sec,'ae-c',v=>nf(v,1),()=>draw1());
  ss.onchange=()=>draw1();
  const E=1e-6;
  const S={
    recta:{pu:s=>[s,s/2],pv:t=>[t,t/2],in:(x,y)=>Math.abs(y-x/2)<E,z:true},
    afin:{pu:s=>[s,s/2+1],pv:t=>[t,t/2+1],in:(x,y)=>Math.abs(y-x/2-1)<E,z:false},
    ejes:{pu:s=>[s,0],pv:t=>[0,t],in:(x,y)=>Math.abs(x)<E||Math.abs(y)<E,z:true},
    cuad:{pu:s=>[Math.abs(s),0.5*Math.abs(s)+0.4],pv:t=>[0.6*Math.abs(t)+0.2,Math.abs(t)],in:(x,y)=>x>=-E&&y>=-E,z:true},
    parab:{pu:s=>[s,s*s/2],pv:t=>[t,t*t/2],in:(x,y)=>Math.abs(y-x*x/2)<1e-6,z:true},
    cero:{pu:()=>[0,0],pv:()=>[0,0],in:(x,y)=>Math.abs(x)<E&&Math.abs(y)<E,z:true},
    todo:{pu:s=>[s,1],pv:t=>[1.2,t],in:()=>true,z:true}};
  function drawSet(ctx,k,w,h){
    ctx.save();ctx.strokeStyle=K.t;ctx.fillStyle='rgba(15,118,110,.18)';ctx.lineWidth=5;
    const L=(f)=>{ctx.beginPath();for(let i=0;i<=200;i++){const x=P.xr[0]+(P.xr[1]-P.xr[0])*i/200,y=f(x);i?ctx.lineTo(P.X(x),P.Y(y)):ctx.moveTo(P.X(x),P.Y(y));}ctx.stroke();};
    if(k==='recta')L(x=>x/2);else if(k==='afin')L(x=>x/2+1);else if(k==='parab')L(x=>x*x/2);
    else if(k==='ejes'){ctx.beginPath();ctx.moveTo(0,P.cy);ctx.lineTo(w,P.cy);ctx.moveTo(P.cx,0);ctx.lineTo(P.cx,h);ctx.stroke();}
    else if(k==='cuad'){ctx.fillRect(P.cx,0,w-P.cx,P.cy);}
    else if(k==='todo'){ctx.fillRect(0,0,w,h);}
    else if(k==='cero'){dot(ctx,P.cx,P.cy,7,K.t);}
    ctx.restore();}
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.85,460,300);P=plane(ctx,w,h,4.2);
    const k=ss.value,st=S[k],u=st.pu(gs()),v=st.pv(gt()),c=gc(),s=[u[0]+v[0],u[1]+v[1]],cu=[c*u[0],c*u[1]];
    drawSet(ctx,k,w,h);const O=[P.cx,P.cy],inS=st.in(...s),inC=st.in(...cu);
    arrow(ctx,O[0],O[1],P.X(s[0]),P.Y(s[1]),K.d,3);arrow(ctx,O[0],O[1],P.X(cu[0]),P.Y(cu[1]),K.b,3);
    arrow(ctx,O[0],O[1],P.X(u[0]),P.Y(u[1]),K.ink,3.5);arrow(ctx,O[0],O[1],P.X(v[0]),P.Y(v[1]),K.a,3.5);
    ctx.save();ctx.setLineDash([5,4]);ctx.strokeStyle=K.ax;ctx.beginPath();ctx.moveTo(P.X(u[0]),P.Y(u[1]));ctx.lineTo(P.X(s[0]),P.Y(s[1]));ctx.lineTo(P.X(v[0]),P.Y(v[1]));ctx.stroke();ctx.restore();
    const mk=(p,ok)=>{dot(ctx,P.X(p[0]),P.Y(p[1]),6,ok?K.r:K.w);};mk(s,inS);mk(cu,inC);
    label(ctx,'u',P.X(u[0])+8,P.Y(u[1])-10,K.ink);label(ctx,'v',P.X(v[0])+8,P.Y(v[1])-10,K.a);
    label(ctx,'u + v',P.X(s[0])+8,P.Y(s[1])+12,K.d);label(ctx,'c·u',P.X(cu[0])+8,P.Y(cu[1])+12,K.b);
    const yes=t=>t?'<span class="aa-ok">sí ✓</span>':'<span class="aa-no">no ✗</span>';
    const sub={recta:true,afin:false,ejes:false,cuad:false,parab:false,cero:true,todo:true}[k];
    const why={recta:'Es una recta que pasa por el origen: span{(2, 1)}.',afin:'No contiene al vector 0: es la recta del subespacio trasladada.',
      ejes:'Prueba u y v no nulos: u + v queda fuera de ambos ejes.',cuad:'Prueba c < 0: c·u sale del cuadrante.',
      parab:'La suma y los múltiplos se salen de la curva: la parábola no es “recta”.',cero:'El subespacio trivial: 0 + 0 = 0 y c·0 = 0.',todo:'El espacio completo siempre es subespacio de sí mismo.'}[k];
    rd.innerHTML=row('u',vs(u))+row('v',vs(v))+sep+row('0 ∈ W',yes(st.z))+row('u + v ∈ W',yes(inS))+row('c·u ∈ W',yes(inC))+sep+
      rowT('<b>'+(sub?'<span class="aa-ok">W es subespacio</span>':'<span class="aa-no">W no es subespacio</span>')+'</b>')+rowT(why);
  }
  /* superposición */
  const cv2=$('#ae-cv2',sec),rd2=$('#ae-read2',sec);
  const ga=sl(sec,'ae-a',v=>nf(v,1),()=>draw2()),gb=sl(sec,'ae-b',v=>nf(v,1),()=>draw2());
  const gm=segm(sec,'ae-mode','m',()=>draw2());
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.7,400,260);
    const a=ga(),b=gb(),hom=gm()==='h',y1=hom?Math.cos:x=>1+Math.cos(x),y2=hom?Math.sin:x=>1+Math.sin(x),y=x=>a*y1(x)+b*y2(x);
    const A=axes(ctx,{l:40,t:14,w:w-54,h:h-40,xr:[0,4*Math.PI],yr:[-4,4],xl:'x',yl:'y',xf:v=>nt(v,0)});
    curve(ctx,A,y1,0,4*Math.PI,'rgba(36,83,201,.45)',1.5,[5,4]);curve(ctx,A,y2,0,4*Math.PI,'rgba(217,72,15,.45)',1.5,[5,4]);
    curve(ctx,A,y,0,4*Math.PI,K.t,3);
    const L=hom?0:a+b,ok=Math.abs(L-(hom?0:1))<1e-9;
    rd2.innerHTML=row('ecuación',hom?'y″ + y = 0':'y″ + y = 1')+row('y₁',hom?'cos x':'1 + cos x')+row('y₂',hom?'sin x':'1 + sin x')+sep+
      row('y = a·y₁ + b·y₂','y″ + y = '+nt(L,2))+rowT(ok?'<span class="aa-ok">y es solución ✓</span>':'<span class="aa-no">y no es solución ✗</span>')+
      rowT(hom?'Para cualquier a y b: las soluciones de la ecuación homogénea forman un subespacio de dimensión 2.':'Solo cuando a + b = 1. Las soluciones forman el conjunto afín 1 + span{cos x, sin x}, que no contiene a la función 0.');
  }
  return {draw(){draw1();draw2();}};
};

LABS['al-base']=function(sec){
  const cv=$('#ab-cv',sec),rd=$('#ab-read',sec),st={yaw:0.7,pitch:0.45,auto:true};
  const ga=sl(sec,'ab-al',v=>nf(v,1),()=>draw()),gb=sl(sec,'ab-be',v=>nf(v,1),()=>draw()),gl=sl(sec,'ab-la',v=>nf(v,2),()=>draw());
  const gv=segm(sec,'ab-v2','v',()=>draw());
  $('#ab-rot',sec).onclick=()=>{st.auto=!st.auto;};
  cam3(cv,st,()=>draw());
  function draw(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.85,470,300),P=P3(st,w,h,1.9);
    const v1=[1.8,0.4,0.3],v2=gv()==='i'?[0.3,1.6,0.7]:v3.mul(v1,-0.7);
    let n=v3.cross(v1,v2);const nn=v3.norm(n);n=nn>1e-9?v3.mul(n,1/nn):(()=>{const c=v3.cross(v1,[0,0,1]);return v3.mul(c,1/v3.norm(c));})();
    const w2=nn>1e-9?v2:v3.cross(n,v1).map(x=>x/v3.norm(v1));
    const v3v=v3.add(v3.add(v3.mul(v1,ga()),v3.mul(gv()==='i'?v2:w2,gb())),v3.mul(n,gl()));
    axes3(ctx,P,2.4);
    const M=[[v1[0],v2[0],v3v[0]],[v1[1],v2[1],v3v[1]],[v1[2],v2[2],v3v[2]]],D=det3(v1,v2,v3v);
    const r12=nn>1e-9?2:1,rk=Math.abs(D)>1e-9?3:(r12===2?2:(v3.norm(v3.cross(v1,v3v))>1e-9?2:1));
    /* span de v1,v2 */
    if(r12===2){const a=v3.mul(v1,1.3),b=v3.mul(v2,1.3);face3(ctx,P,[v3.add(a,b),v3.sub(a,b),v3.mul(v3.add(a,b),-1),v3.sub(b,a)],'rgba(15,118,110,.16)','rgba(15,118,110,.4)');}
    else{const p=P.T(...v3.mul(v1,-1.6)),q=P.T(...v3.mul(v1,1.6));ctx.save();ctx.strokeStyle='rgba(15,118,110,.35)';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();ctx.restore();}
    if(rk===3){const o=[0,0,0],a=v1,b=v2,c=v3v,ab=v3.add(a,b),ac=v3.add(a,c),bc=v3.add(b,c),abc=v3.add(ab,c);
      [[o,a,ab,b],[c,ac,abc,bc],[o,a,ac,c],[b,ab,abc,bc],[o,b,bc,c],[a,ab,abc,ac]].forEach(f=>face3(ctx,P,f,'rgba(112,72,232,.06)','rgba(112,72,232,.35)'));}
    const proj=v3.sub(v3v,v3.mul(n,v3.dot(v3v,n)));
    if(Math.abs(gl())>1e-6)arrow3(ctx,P,proj,v3v,K.ax,1.5,[4,4]);
    arrow3(ctx,P,[0,0,0],v1,K.b,3.5);arrow3(ctx,P,[0,0,0],v2,K.a,3.5);arrow3(ctx,P,[0,0,0],v3v,K.d,3.5);
    const l=(v,t,c)=>{const p=P.T(...v);label(ctx,t,p[0]+8,p[1]-8,c);};l(v1,'v₁',K.b);l(v2,'v₂',K.a);l(v3v,'v₃',K.d);
    rd.innerHTML=row('v₁',vs(v1))+row('v₂',vs(v2))+row('v₃',vs(v3v))+sep+row('det[v₁ v₂ v₃]',nt(D,3))+row('rango',rk)+row('dim span',rk)+sep+
      rowT(rk===3?'<span class="aa-ok">Linealmente independientes</span>: son una base de ℝ³ y el paralelepípedo tiene volumen '+nt(Math.abs(D),2)+'.':
        '<span class="aa-no">Linealmente dependientes</span>: '+(r12===1?'v₂ es múltiplo de v₁, así que el span tiene dimensión '+rk+'.':'v₃ está en el plano de v₁ y v₂ (v₃ = '+nt(ga(),1)+'·v₁ + '+nt(gb(),1)+'·v₂).'));
  }
  return {draw,tick(dt){if(st.auto&&vis(cv)){st.yaw+=dt*0.35;draw();}}};
};

LABS['al-coordenadas']=function(sec){
  const cv=$('#ac-cv',sec),rd=$('#ac-read',sec);let P=null;const R=4;
  const H=[[2,0.5],[0.5,1.5],[3,2.5]];
  const c30=Math.cos(Math.PI/6),s30=0.5;
  const PR=[[[1,0],[0,1]],[[c30,s30],[-s30,c30]],[[2,0.5],[0.5,1.5]],[[2,0],[0,2]]];
  [0,1,2,3].forEach(i=>$('#ac-p'+i,sec).onclick=()=>{H[0]=PR[i][0].slice();H[1]=PR[i][1].slice();draw();});
  function draw(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.85,470,300);P=plane(ctx,w,h,R);
    const [b1,b2,v]=H,PB=cols(b1,b2),D=det2(PB[0][0],PB[0][1],PB[1][0],PB[1][1]);
    if(Math.abs(D)>1e-9)tgrid(ctx,P,PB,12,'rgba(15,118,110,.32)');
    const O=[P.cx,P.cy];
    if(Math.abs(D)>1e-9){const c=mv(inv2(PB),v),p1=[c[0]*b1[0],c[0]*b1[1]];
      arrow(ctx,O[0],O[1],P.X(p1[0]),P.Y(p1[1]),K.b,2,[6,5]);arrow(ctx,P.X(p1[0]),P.Y(p1[1]),P.X(v[0]),P.Y(v[1]),K.a,2,[6,5]);}
    arrow(ctx,O[0],O[1],P.X(b1[0]),P.Y(b1[1]),K.b,3.5);arrow(ctx,O[0],O[1],P.X(b2[0]),P.Y(b2[1]),K.a,3.5);arrow(ctx,O[0],O[1],P.X(v[0]),P.Y(v[1]),K.ink,3.5);
    handle(ctx,P,b1,K.b);handle(ctx,P,b2,K.a);handle(ctx,P,v,K.ink);
    label(ctx,'b₁',P.X(b1[0])+10,P.Y(b1[1])+12,K.b);label(ctx,'b₂',P.X(b2[0])+10,P.Y(b2[1])-12,K.a);label(ctx,'v',P.X(v[0])+10,P.Y(v[1])-12,K.ink);
    const ok=Math.abs(D)>1e-9,c=ok?mv(inv2(PB),v):null;
    rd.innerHTML=row('P<sub>B</sub> = [b₁ b₂]',mat(PB))+row('det P<sub>B</sub>',nt(D,3))+sep+row('[v]<sub>E</sub> (canónica)',vs(v))+
      (ok?row('[v]<sub>B</sub> = P<sub>B</sub>⁻¹ v',vs(c))+row('P<sub>B</sub>⁻¹',mat(inv2(PB)))+sep+rowT(`v = ${nt(c[0],2)}·b₁ + ${nt(c[1],2)}·b₂: cuenta ${nt(c[0],2)} pasos a lo largo de b₁ y ${nt(c[1],2)} a lo largo de b₂.`)
        :rowT('<span class="aa-no">b₁ y b₂ son paralelos: no forman una base y las coordenadas no están definidas.</span>'));
  }
  dragPts(cv,()=>P,H,draw,{R:R-0.2});
  return {draw};
};

/* ================= AL · UNIDAD III · TRANSFORMACIONES ================= */
const U3='Unidad III · Transformaciones lineales';
V.push(topicPage({id:'al-transformaciones',pre:'at',course:AL,unit:U3,title:'Transformaciones lineales, núcleo e imagen',
lead:String.raw`Una transformación lineal respeta sumas y múltiplos. Esa sola condición tiene una consecuencia fuerte: lo que la transformación “aplasta” (el núcleo) y lo que “alcanza” (la imagen) suman exactamente la dimensión del espacio de partida.`,
res:[String.raw`<b>Definición.</b> \(T:V\to W\) es lineal si \(T(\mathbf{u}+\mathbf{v})=T\mathbf{u}+T\mathbf{v}\) y \(T(c\mathbf{v})=cT\mathbf{v}\). Por tanto \(T(\mathbf{0})=\mathbf{0}\) y \(T\big(\sum c_i\mathbf{v}_i\big)=\sum c_iT\mathbf{v}_i\).`,
String.raw`<b>Ejemplos.</b> Rotaciones, reflexiones y proyecciones; la derivada \(D:P_n\to P_{n-1}\); la integral \(f\mapsto\int_a^x f\); la traza; la transpuesta. No son lineales: la traslación \(\mathbf{x}\mapsto\mathbf{x}+\mathbf{b}\) con \(\mathbf{b}\neq\mathbf{0}\), \(x\mapsto x^2\) ni \(\mathbf{x}\mapsto\|\mathbf{x}\|\).`,
String.raw`<b>Determinada por una base.</b> Si \(\{\mathbf{b}_j\}\) es base de \(V\), los valores \(T\mathbf{b}_j\) determinan \(T\) por completo, y pueden elegirse libremente. En \(\mathbb{K}^n\), \(T\mathbf{x}=A\mathbf{x}\) con columnas \(T\mathbf{e}_j\).`,
String.raw`<b>Núcleo e imagen.</b> \(\ker T=\{\mathbf{v}:T\mathbf{v}=\mathbf{0}\}\) es subespacio de \(V\); \(\operatorname{Im}T=\{T\mathbf{v}\}\) es subespacio de \(W\). Sus dimensiones son la <i>nulidad</i> y el <i>rango</i> de \(T\).`,
String.raw`<b>Inyectividad.</b> \(T\) es inyectiva si y solo si \(\ker T=\{\mathbf{0}\}\): si \(T\mathbf{u}=T\mathbf{v}\), entonces \(T(\mathbf{u}-\mathbf{v})=\mathbf{0}\). Todos los puntos de \(\mathbf{v}+\ker T\) tienen la misma imagen.`,
String.raw`<b>Teorema rango-nulidad.</b> Si \(\dim V=n\): \(n=\dim\ker T+\dim\operatorname{Im}T\). Las dimensiones que se pierden más las que sobreviven dan todas las de partida. Para matrices: número de variables libres + número de pivotes = número de columnas.`,
String.raw`<b>Consecuencias.</b> Si \(\dim V=\dim W\), entonces inyectiva \(\iff\) sobreyectiva \(\iff\) biyectiva. Una \(T:\mathbb{R}^3\to\mathbb{R}^2\) nunca es inyectiva y una \(T:\mathbb{R}^2\to\mathbb{R}^3\) nunca es sobreyectiva.`,
String.raw`<b>Isomorfismos.</b> Una lineal biyectiva tiene inversa lineal. Dos espacios de dimensión finita son isomorfos si y solo si tienen la misma dimensión: \(P_3\cong\mathbb{R}^4\cong\mathbb{R}^{2\times2}\).`],
lab:`<div class="controls" style="margin:0 0 12px">${btn('at-p0','Invertible')}${btn('at-p1','Proyección')}${btn('at-p2','Rango 1 oblicua')}${btn('at-p3','Transformación nula')}</div>`+
 lab2('at-cv',slider('at-a','a',-2,2,0.25,1)+slider('at-b','b',-2,2,0.25,0.5)+slider('at-c','c',-2,2,0.25,2)+slider('at-d','d',-2,2,0.25,1),'at-read',String.raw`\(A=\begin{pmatrix}a&b\\c&d\end{pmatrix}\). A la izquierda, el dominio; a la derecha, la imagen de cada punto de colores. Arrastra el punto negro \(\mathbf{p}\): la recta roja \(\mathbf{p}+\ker A\) entera va a parar al mismo punto \(A\mathbf{p}\). Cuando \(\det A=0\) el plano se aplasta sobre la recta \(\operatorname{Im}A\).`),
laws:[['Linealidad',String.raw`T(a\mathbf{u}+b\mathbf{v})=a\,T\mathbf{u}+b\,T\mathbf{v}`,String.raw`Implica \(T(\mathbf{0})=\mathbf{0}\).`],
 ['Teorema rango-nulidad',String.raw`\dim V=\dim\ker T+\dim\operatorname{Im}T`,String.raw`Para \(A\in\mathbb{K}^{m\times n}\): \(n=\operatorname{nul}A+\operatorname{rg}A\).`],
 ['Inyectividad',String.raw`T\ \text{inyectiva}\iff\ker T=\{\mathbf{0}\}`,'El núcleo mide cuánta información se pierde.'],
 ['Matriz de una transformación',String.raw`T\mathbf{x}=A\mathbf{x},\qquad A=[\,T\mathbf{e}_1\ \cdots\ T\mathbf{e}_n\,]`,'En otras bases se usa la matriz asociada del tema siguiente.'],
 ['Isomorfismo',String.raw`V\cong W\iff\dim V=\dim W`,'Para espacios de dimensión finita sobre el mismo cuerpo.'],
 ['Rango de filas = rango de columnas',String.raw`\operatorname{rg}A=\operatorname{rg}A^{\mathsf T}`,'La dimensión del espacio de filas coincide con la del espacio columna.']],
ex:[String.raw`Sea \(T:\mathbb{R}^3\to\mathbb{R}^2\), \(T(x,y,z)=(x+2y-z,\ 2x+4y-2z)\). Halla bases de \(\ker T\) e \(\operatorname{Im}T\) y verifica el teorema.`,
 [String.raw`Matriz: \(A=\begin{pmatrix}1&2&-1\\2&4&-2\end{pmatrix}\). \(F_2-2F_1\) anula la segunda fila: un pivote, \(\operatorname{rg}A=1\).`,
  String.raw`Núcleo: \(x=-2y+z\) con \(y,z\) libres. \((x,y,z)=y(-2,1,0)+z(1,0,1)\), así que \(\ker T=\operatorname{span}\{(-2,1,0),(1,0,1)\}\), de dimensión 2: un plano por el origen.`,
  String.raw`Imagen: generada por las columnas, todas múltiplos de \((1,2)\). \(\operatorname{Im}T=\operatorname{span}\{(1,2)\}\), de dimensión 1.`,
  String.raw`Rango-nulidad: \(\dim\mathbb{R}^3=3=2+1\). ✓ \(T\) no es inyectiva (núcleo no trivial) ni sobreyectiva (la imagen es una recta de \(\mathbb{R}^2\)).`]],
prev:['al-coordenadas','Coordenadas y cambio de base'],next:['al-semejanza','Matriz asociada y semejanza'],
ref:'Axler, <i>Linear Algebra Done Right</i>, cap. 3; Grossman, cap. 7; Strang, cap. 3 y 8'}));

V.push(topicPage({id:'al-semejanza',pre:'as',course:AL,unit:U3,title:'Matriz asociada y semejanza',
lead:String.raw`Una misma transformación lineal tiene muchas matrices, una por cada base. Pasar de una a otra es una conjugación \(A'=P^{-1}AP\), y lo que no cambia (traza, determinante, autovalores) es lo que pertenece a la transformación y no a la base. El objetivo de la Unidad IV será elegir la base en la que la matriz es lo más simple posible.`,
res:[String.raw`<b>Matriz asociada.</b> Para \(T:V\to W\) con bases \(B\) de \(V\) y \(C\) de \(W\), \([T]_{C\leftarrow B}\) es la matriz cuya columna \(j\) es \([T\mathbf{b}_j]_C\). Con ella, \([T\mathbf{v}]_C=[T]_{C\leftarrow B}[\mathbf{v}]_B\): aplicar \(T\) se reduce a multiplicar coordenadas.`,
String.raw`<b>Composición.</b> \([S\circ T]_{D\leftarrow B}=[S]_{D\leftarrow C}[T]_{C\leftarrow B}\). Es la razón de fondo por la que el producto de matrices se define fila por columna.`,
String.raw`<b>Operadores y cambio de base.</b> Si \(T:\mathbb{K}^n\to\mathbb{K}^n\) tiene matriz \(A\) en la base canónica y \(B\) es otra base con \(P=P_B\), entonces \([T]_B=P^{-1}AP\). Se lee de derecha a izquierda: pasar de coordenadas \(B\) a canónicas, aplicar \(A\), volver a coordenadas \(B\).`,
String.raw`<b>Semejanza.</b> \(A\) y \(A'\) son semejantes si \(A'=P^{-1}AP\) para alguna \(P\) invertible. Es una relación de equivalencia: matrices semejantes representan la misma transformación en bases distintas.`,
String.raw`<b>Invariantes.</b> Matrices semejantes tienen el mismo determinante, la misma traza, el mismo polinomio característico, los mismos autovalores y el mismo rango. Por ejemplo, \(\det(P^{-1}AP)=\det P^{-1}\det A\det P=\det A\), y \(\operatorname{tr}(XY)=\operatorname{tr}(YX)\) da \(\operatorname{tr}(P^{-1}AP)=\operatorname{tr}A\).`,
String.raw`<b>La mejor base.</b> Si la base está formada por vectores \(\mathbf{b}_j\) con \(T\mathbf{b}_j=\lambda_j\mathbf{b}_j\) (autovectores), la matriz asociada es diagonal: \(P^{-1}AP=\operatorname{diag}(\lambda_1,\dots,\lambda_n)\).`,
String.raw`<b>En física.</b> El tensor de inercia de un sólido tiene una matriz distinta en cada sistema de ejes. En los ejes principales es diagonal, y los momentos principales son sus invariantes.`],
lab:`<div class="controls" style="margin:0 0 12px">${sel('as-T',[['st','Estiramiento [[2, 1], [1, 2]]'],['rf','Reflexión en la recta y = x'],['pr','Proyección sobre y = x'],['cz','Cizalla [[1, 1], [0, 1]]'],['rt','Rotación 90°']])}${btn('as-eig','Usar autovectores como base')}${btn('as-can','Base canónica')}</div>`+
 lab2('as-cv','','as-read',String.raw`Arrastra los vectores de la base \(\mathbf{b}_1\) (naranja) y \(\mathbf{b}_2\) (azul). La celda verde es la generada por la base; la naranja es su imagen por \(T\). Las flechas discontinuas son \(T\mathbf{b}_1\) y \(T\mathbf{b}_2\), y sus coordenadas en la base \(B\) son las columnas de \(A'=P^{-1}AP\). Con autovectores como base, \(T\mathbf{b}_j\) es paralelo a \(\mathbf{b}_j\) y \(A'\) es diagonal. La rotación no tiene autovectores reales.`),
laws:[['Matriz asociada',String.raw`[T\mathbf{v}]_C=[T]_{C\leftarrow B}\,[\mathbf{v}]_B`,String.raw`Columna \(j\): \([T\mathbf{b}_j]_C\).`],
 ['Composición',String.raw`[S\circ T]_{D\leftarrow B}=[S]_{D\leftarrow C}\,[T]_{C\leftarrow B}`,'Componer transformaciones es multiplicar sus matrices.'],
 ['Cambio de base de un operador',String.raw`[T]_B=P^{-1}AP,\qquad P=[\mathbf{b}_1\ \cdots\ \mathbf{b}_n]`,'A: matriz en la base canónica.'],
 ['Invariantes de semejanza',String.raw`\det A'=\det A,\quad\operatorname{tr}A'=\operatorname{tr}A,\quad p_{A'}(\lambda)=p_A(\lambda)`,'También el rango y los autovalores.'],
 ['Traza cíclica',String.raw`\operatorname{tr}(XY)=\operatorname{tr}(YX)`,String.raw`Con \(X=P^{-1}\), \(Y=AP\): \(\operatorname{tr}(P^{-1}AP)=\operatorname{tr}(APP^{-1})=\operatorname{tr}A\).`],
 ['Diagonalización (adelanto)',String.raw`A\mathbf{b}_j=\lambda_j\mathbf{b}_j\ \Rightarrow\ P^{-1}AP=\operatorname{diag}(\lambda_j)`,'Una base de autovectores diagonaliza la matriz.']],
ex:[String.raw`Escribe \(A=\begin{pmatrix}2&1\\1&2\end{pmatrix}\) en la base \(B=\{(1,1),(1,-1)\}\).`,
 [String.raw`\(P=\begin{pmatrix}1&1\\1&-1\end{pmatrix}\) y \(P^{-1}=\tfrac12\begin{pmatrix}1&1\\1&-1\end{pmatrix}\).`,
  String.raw`\(AP=\begin{pmatrix}3&1\\3&-1\end{pmatrix}\): sus columnas son \(A\mathbf{b}_1=3\mathbf{b}_1\) y \(A\mathbf{b}_2=\mathbf{b}_2\).`,
  String.raw`\(A'=P^{-1}AP=\tfrac12\begin{pmatrix}6&0\\0&2\end{pmatrix}=\begin{pmatrix}3&0\\0&1\end{pmatrix}\). En esta base, \(T\) estira por 3 en la dirección \((1,1)\) y deja fija la dirección \((1,-1)\).`,
  String.raw`Invariantes: \(\operatorname{tr}A=4=3+1\) y \(\det A=3=3\cdot1\). ✓`],
 'Selecciona el estiramiento en el laboratorio y pulsa “Usar autovectores como base”.'],
prev:['al-transformaciones','Transformaciones lineales'],next:['al-autovalores','Autovalores y autovectores'],
ref:'Axler, cap. 3; Lay, cap. 5; Thornton &amp; Marion, cap. 11 (tensor de inercia)'}));

LABS['al-transformaciones']=function(sec){
  const cv=$('#at-cv',sec),rd=$('#at-read',sec);let PL=null;
  const g={};['a','b','c','d'].forEach(k=>g[k]=sl(sec,'at-'+k,v=>nt(v,2),()=>draw()));
  const PR=[[1,0.5,-0.5,1],[0.5,0.5,0.5,0.5],[1,2,0.5,1],[0,0,0,0]];
  PR.forEach((p,i)=>$('#at-p'+i,sec).onclick=()=>{['a','b','c','d'].forEach((k,j)=>g[k].set(p[j]));draw();});
  const pt=[[1.2,0.8]];
  function draw(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.6,420,260),hw=w/2-4;
    const A=[[g.a(),g.b()],[g.c(),g.d()]],D=det2(A[0][0],A[0][1],A[1][0],A[1][1]);
    const P1=plane(ctx,w,h,3,0,hw),P2=plane(ctx,w,h,3,w/2+4,hw);PL=P1;
    ctx.fillStyle='#fff';ctx.fillRect(hw,0,8,h);ctx.strokeStyle=K.line;ctx.beginPath();ctx.moveTo(w/2,0);ctx.lineTo(w/2,h);ctx.stroke();
    const nz=[A[0][0],A[0][1],A[1][0],A[1][1]].some(v=>Math.abs(v)>1e-9),rk=Math.abs(D)>1e-9?2:nz?1:0;
    /* núcleo */
    let kd=null;if(rk===1){kd=Math.abs(A[0][0])+Math.abs(A[0][1])>1e-9?[-A[0][1],A[0][0]]:[-A[1][1],A[1][0]];const n=Math.hypot(...kd);kd=[kd[0]/n,kd[1]/n];}
    /* puntos */
    ctx.save();ctx.beginPath();ctx.rect(0,0,hw,h);ctx.clip();
    for(let i=-6;i<=6;i++)for(let j=-6;j<=6;j++){const x=i*0.4,y=j*0.4;if(x*x+y*y>5.8)continue;const hu=(Math.atan2(y,x)/TAU+1)%1,col=`hsl(${hu*360},70%,${45+Math.hypot(x,y)*6}%)`;dot(ctx,P1.X(x),P1.Y(y),3,col);}
    ctx.restore();
    ctx.save();ctx.beginPath();ctx.rect(w/2+4,0,hw,h);ctx.clip();
    for(let i=-6;i<=6;i++)for(let j=-6;j<=6;j++){const x=i*0.4,y=j*0.4;if(x*x+y*y>5.8)continue;const q=mv(A,[x,y]),hu=(Math.atan2(y,x)/TAU+1)%1,col=`hsl(${hu*360},70%,${45+Math.hypot(x,y)*6}%)`;dot(ctx,P2.X(q[0]),P2.Y(q[1]),3,col);}
    ctx.restore();
    const p=pt[0],Ap=mv(A,p);
    ctx.save();ctx.beginPath();ctx.rect(0,0,hw,h);ctx.clip();
    if(rk===1||rk===0){ctx.strokeStyle=K.w;ctx.lineWidth=3;ctx.setLineDash([7,5]);ctx.beginPath();
      if(rk===1){ctx.moveTo(P1.X(p[0]-9*kd[0]),P1.Y(p[1]-9*kd[1]));ctx.lineTo(P1.X(p[0]+9*kd[0]),P1.Y(p[1]+9*kd[1]));
        ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='rgba(201,42,42,.45)';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(P1.X(-9*kd[0]),P1.Y(-9*kd[1]));ctx.lineTo(P1.X(9*kd[0]),P1.Y(9*kd[1]));}
      ctx.stroke();}
    ctx.restore();
    if(rk===0){ctx.fillStyle='rgba(201,42,42,.12)';ctx.fillRect(0,0,hw,h);}
    if(rk===1){const im=Math.abs(A[0][0])+Math.abs(A[1][0])>1e-9?[A[0][0],A[1][0]]:[A[0][1],A[1][1]],n=Math.hypot(...im);
      ctx.save();ctx.beginPath();ctx.rect(w/2+4,0,hw,h);ctx.clip();ctx.strokeStyle='rgba(15,118,110,.4)';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(P2.X(-9*im[0]/n),P2.Y(-9*im[1]/n));ctx.lineTo(P2.X(9*im[0]/n),P2.Y(9*im[1]/n));ctx.stroke();ctx.restore();}
    arrow(ctx,P1.cx,P1.cy,P1.X(p[0]),P1.Y(p[1]),K.ink,3);handle(ctx,P1,p,K.ink);
    ctx.save();ctx.beginPath();ctx.rect(w/2+4,0,hw,h);ctx.clip();arrow(ctx,P2.cx,P2.cy,P2.X(Ap[0]),P2.Y(Ap[1]),K.ink,3);dot(ctx,P2.X(Ap[0]),P2.Y(Ap[1]),6,K.ink);ctx.restore();
    label(ctx,'Dominio ℝ²',10,14,K.mut);label(ctx,'Imagen A(ℝ²)',w/2+14,14,K.mut);
    label(ctx,'p',P1.X(p[0])+10,P1.Y(p[1])-10,K.ink);label(ctx,'Ap',P2.X(Ap[0])+10,P2.Y(Ap[1])-10,K.ink);
    const kerTxt=rk===2?'{0}':rk===1?'span{'+vs(kd)+'}':'ℝ²',imTxt=rk===2?'ℝ²':rk===1?'una recta por el origen':'{0}';
    rd.innerHTML=row('A',mat(A))+row('det A',nt(D,3))+sep+row('ker A',kerTxt)+row('dim ker A (nulidad)',2-rk)+row('Im A',imTxt)+row('dim Im A (rango)',rk)+sep+
      row('nulidad + rango',(2-rk)+' + '+rk+' = 2 = dim ℝ²')+rowT(rk===2?'A es inyectiva y sobreyectiva: un isomorfismo de ℝ² en ℝ².':rk===1?'Toda la recta roja p + ker A va al mismo punto Ap: A no es inyectiva.':'Todo el plano va al origen.');
  }
  dragPts(cv,()=>PL,pt,draw,{R:2.8,snap:0.1});
  return {draw};
};

LABS['al-semejanza']=function(sec){
  const cv=$('#as-cv',sec),rd=$('#as-read',sec),sT=$('#as-T',sec);let P=null;
  const T={st:[[2,1],[1,2]],rf:[[0,1],[1,0]],pr:[[0.5,0.5],[0.5,0.5]],cz:[[1,1],[0,1]],rt:[[0,-1],[1,0]]};
  const H=[[1.5,0.5],[0,1]];
  sT.onchange=()=>draw();
  $('#as-can',sec).onclick=()=>{H[0]=[1,0];H[1]=[0,1];draw();};
  $('#as-eig',sec).onclick=()=>{const e=eig2(T[sT.value]);if(e.cx){rd.insertAdjacentHTML('beforeend',rowT('<span class="aa-no">Esta transformación no tiene autovectores reales.</span>'));return;}
    H[0]=[e.v1[0]*1.5,e.v1[1]*1.5];H[1]=[e.v2[0]*1.5,e.v2[1]*1.5];if(det2(H[0][0],H[1][0],H[0][1],H[1][1])<0)H[1]=[-H[1][0],-H[1][1]];draw();};
  function draw(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.85,470,300);P=plane(ctx,w,h,3.5);
    const A=T[sT.value],[b1,b2]=H,Pm=cols(b1,b2),D=det2(Pm[0][0],Pm[0][1],Pm[1][0],Pm[1][1]);
    if(Math.abs(D)>1e-9)tgrid(ctx,P,Pm,10,'rgba(15,118,110,.22)');
    const cell=[[0,0],b1,[b1[0]+b2[0],b1[1]+b2[1]],b2];
    poly(ctx,P,cell,null,'rgba(15,118,110,.2)',K.t,2);poly(ctx,P,cell,A,'rgba(217,72,15,.18)',K.b,2);
    const O=[P.cx,P.cy],Tb1=mv(A,b1),Tb2=mv(A,b2);
    arrow(ctx,O[0],O[1],P.X(Tb1[0]),P.Y(Tb1[1]),K.b,2.5,[6,4]);arrow(ctx,O[0],O[1],P.X(Tb2[0]),P.Y(Tb2[1]),K.a,2.5,[6,4]);
    arrow(ctx,O[0],O[1],P.X(b1[0]),P.Y(b1[1]),K.b,3.5);arrow(ctx,O[0],O[1],P.X(b2[0]),P.Y(b2[1]),K.a,3.5);
    handle(ctx,P,b1,K.b);handle(ctx,P,b2,K.a);
    label(ctx,'b₁',P.X(b1[0])+10,P.Y(b1[1])+12,K.b);label(ctx,'b₂',P.X(b2[0])+10,P.Y(b2[1])-12,K.a);
    label(ctx,'Tb₁',P.X(Tb1[0])+8,P.Y(Tb1[1])+12,K.b);label(ctx,'Tb₂',P.X(Tb2[0])+8,P.Y(Tb2[1])-12,K.a);
    const tr=M=>M[0][0]+M[1][1],dt=M=>det2(M[0][0],M[0][1],M[1][0],M[1][1]);
    if(Math.abs(D)<1e-9){rd.innerHTML=row('A',mat(A))+sep+rowT('<span class="aa-no">b₁ y b₂ son paralelos: no forman una base.</span>');return;}
    const Ap=mm(inv2(Pm),mm(A,Pm)),diag=Math.abs(Ap[0][1])<1e-9&&Math.abs(Ap[1][0])<1e-9;
    rd.innerHTML=row('A (canónica)',mat(A))+row('P = [b₁ b₂]',mat(Pm))+row("A′ = P⁻¹AP",mat(Ap))+sep+
      row('tr A  /  tr A′',nt(tr(A),3)+'  /  '+nt(tr(Ap),3))+row('det A  /  det A′',nt(dt(A),3)+'  /  '+nt(dt(Ap),3))+sep+
      rowT(diag?'<span class="aa-ok">A′ es diagonal</span>: b₁ y b₂ son autovectores, con λ = '+nt(Ap[0][0],2)+' y '+nt(Ap[1][1],2)+'.':'Traza y determinante no cambian con la base: son propiedades de T.');
  }
  dragPts(cv,()=>P,H,draw,{R:3.3});
  return {draw};
};

/* ================= AL · UNIDAD IV · AUTOVALORES ================= */
const U4='Unidad IV · Valores y vectores propios';
V.push(topicPage({id:'al-autovalores',pre:'av',course:AL,unit:U4,title:'Autovalores y autovectores',
lead:String.raw`Un autovector es una dirección que la transformación no gira: solo la estira, la encoge o la invierte. Encontrar esas direcciones es encontrar la base en la que la matriz es diagonal. Además, aquí aparece la razón para usar \(\mathbb{C}\): una rotación del plano no tiene ninguna dirección real invariante.`,
res:[String.raw`<b>Definición.</b> \(\lambda\in\mathbb{K}\) es autovalor de \(A\) si existe \(\mathbf{v}\neq\mathbf{0}\) con \(A\mathbf{v}=\lambda\mathbf{v}\); \(\mathbf{v}\) es un autovector asociado. El autoespacio \(E_\lambda=\ker(A-\lambda I)\) contiene todos los autovectores de \(\lambda\) junto con \(\mathbf{0}\).`,
String.raw`<b>Ecuación característica.</b> \(A\mathbf{v}=\lambda\mathbf{v}\) con \(\mathbf{v}\neq\mathbf{0}\) significa que \(A-\lambda I\) tiene núcleo no trivial, es decir \(p(\lambda)=\det(A-\lambda I)=0\). Para \(n=2\): \(\lambda^2-(\operatorname{tr}A)\lambda+\det A=0\).`,
String.raw`<b>Traza y determinante.</b> Contando multiplicidades en \(\mathbb{C}\): \(\sum\lambda_i=\operatorname{tr}A\) y \(\prod\lambda_i=\det A\). Por eso \(A\) es invertible si y solo si \(0\) no es autovalor.`,
String.raw`<b>Reglas útiles.</b> Si \(A\mathbf{v}=\lambda\mathbf{v}\), entonces \(A^k\mathbf{v}=\lambda^k\mathbf{v}\), \(A^{-1}\mathbf{v}=\lambda^{-1}\mathbf{v}\) y \((A+cI)\mathbf{v}=(\lambda+c)\mathbf{v}\). Los autovalores de una matriz triangular son los elementos de su diagonal.`,
String.raw`<b>Multiplicidades.</b> La algebraica \(m_a\) es la multiplicidad como raíz de \(p\); la geométrica, \(m_g=\dim E_\lambda\). Siempre \(1\le m_g\le m_a\). La cizalla \(\begin{pmatrix}1&1\\0&1\end{pmatrix}\) tiene \(\lambda=1\) con \(m_a=2\) pero \(m_g=1\): le faltan autovectores (es <i>defectiva</i>).`,
String.raw`<b>Independencia.</b> Autovectores de autovalores distintos son linealmente independientes. Con \(n\) autovalores distintos ya hay una base de autovectores.`,
String.raw`<b>Rotaciones y números complejos.</b> \(R_\theta\) tiene \(p(\lambda)=\lambda^2-2\lambda\cos\theta+1\), con raíces \(\lambda=\cos\theta\pm i\sin\theta=e^{\pm i\theta}\) y autovectores \((1,\mp i)\). Sobre \(\mathbb{R}\) no hay autovalores; sobre \(\mathbb{C}\), por el teorema fundamental del álgebra, toda matriz \(n\times n\) tiene \(n\) autovalores contando multiplicidad.`,
String.raw`<b>En física.</b> Los modos normales de oscilación, los ejes principales de inercia y los estados estacionarios de la cuántica (\(\hat H\psi=E\psi\)) son problemas de autovalores.`],
lab:tabs([['dir','Direcciones invariantes',`<div class="controls" style="margin:0 0 12px">${btn('av-p0','Simétrica')}${btn('av-p1','Cizalla')}${btn('av-p2','Rotación')}${btn('av-p3','Reflexión')}${btn('av-p4','Proyección')}${btn('av-pause','Pausa')}</div>`+
  lab2('av-cv',slider('av-a','a',-2,3,0.25,2)+slider('av-b','b',-2,2,0.25,1)+slider('av-c','c',-2,2,0.25,1)+slider('av-d','d',-2,3,0.25,2),'av-read',String.raw`El vector unitario \(\mathbf{x}\) (negro) recorre la circunferencia y \(A\mathbf{x}\) (naranja) deja su rastro, una elipse. Cuando \(A\mathbf{x}\) es paralelo a \(\mathbf{x}\), la flecha se vuelve verde: \(\mathbf{x}\) es autovector y el cociente de longitudes, con signo, es \(\lambda\). Las rectas verdes son los autoespacios.`)],
 ['rot','Rotación: λ complejos',lab2('av-cv2',slider('av-th','θ (grados)',0,180,1,60),'av-read2',String.raw`A la izquierda, \(R_\theta\) gira todos los vectores: ninguna dirección real queda fija (salvo \(\theta=0^\circ\) o \(180^\circ\)). A la derecha, el plano complejo: los autovalores \(e^{\pm i\theta}\) están sobre la circunferencia unidad, en los ángulos \(\pm\theta\). El ángulo de giro aparece como el argumento del autovalor.`)]]),
laws:[['Autovalor y autovector',String.raw`A\mathbf{v}=\lambda\mathbf{v},\qquad\mathbf{v}\neq\mathbf{0}`,String.raw`Autoespacio: \(E_\lambda=\ker(A-\lambda I)\).`],
 ['Polinomio característico',String.raw`p(\lambda)=\det(A-\lambda I)=0`,String.raw`Grado \(n\); sus raíces son los autovalores.`],
 ['Caso \(2\times2\)',String.raw`\lambda=\frac{\operatorname{tr}A}{2}\pm\sqrt{\Big(\frac{\operatorname{tr}A}{2}\Big)^2-\det A}`,'Si el radicando es negativo, los autovalores son complejos conjugados.'],
 ['Traza y determinante',String.raw`\sum_i\lambda_i=\operatorname{tr}A,\qquad\prod_i\lambda_i=\det A`,'Con multiplicidad, sobre ℂ. Sirven para comprobar los cálculos.'],
 ['Multiplicidades',String.raw`1\le\dim E_\lambda=m_g\le m_a`,String.raw`Si \(m_g\lt m_a\) para algún \(\lambda\), la matriz no es diagonalizable.`],
 ['Autovalores de una rotación',String.raw`R_\theta\begin{pmatrix}1\\\mp i\end{pmatrix}=e^{\pm i\theta}\begin{pmatrix}1\\\mp i\end{pmatrix}`,'El puente hacia Variable compleja: girar es multiplicar por un complejo de módulo 1.']],
ex:[String.raw`Halla autovalores y autovectores de \(A=\begin{pmatrix}4&1\\2&3\end{pmatrix}\).`,
 [String.raw`\(p(\lambda)=\lambda^2-7\lambda+10=(\lambda-5)(\lambda-2)\). Autovalores: \(\lambda_1=5\), \(\lambda_2=2\).`,
  String.raw`\(\lambda_1=5\): \(A-5I=\begin{pmatrix}-1&1\\2&-2\end{pmatrix}\), así que \(-x+y=0\) y \(\mathbf{v}_1=(1,1)\).`,
  String.raw`\(\lambda_2=2\): \(A-2I=\begin{pmatrix}2&1\\2&1\end{pmatrix}\), así que \(2x+y=0\) y \(\mathbf{v}_2=(1,-2)\).`,
  String.raw`Comprobación: \(\operatorname{tr}A=7=5+2\), \(\det A=10=5\cdot2\), y \(A\mathbf{v}_1=(5,5)=5\mathbf{v}_1\). ✓`],
 'Pon a = 4, b = 1, c = 2, d = 3 en el laboratorio y observa las dos direcciones invariantes.'],
prev:['al-semejanza','Matriz asociada y semejanza'],next:['al-diagonalizacion','Diagonalización y exponencial'],
ref:'Strang, <i>Introduction to Linear Algebra</i>, cap. 6; Axler, cap. 5; Lay, cap. 5'}));

V.push(topicPage({id:'al-diagonalizacion',pre:'ad2',course:AL,unit:U4,title:'Diagonalización y exponencial de matrices',
lead:String.raw`En una base de autovectores la matriz es diagonal y cada coordenada evoluciona por separado. Con eso se calculan potencias, exponenciales y soluciones de sistemas de ecuaciones diferenciales lineales: el comportamiento a largo plazo lo deciden los autovalores.`,
res:[String.raw`<b>Criterio.</b> \(A\in\mathbb{K}^{n\times n}\) es diagonalizable si y solo si tiene \(n\) autovectores linealmente independientes, es decir, si \(m_g=m_a\) para cada autovalor. Basta que tenga \(n\) autovalores distintos.`,
String.raw`<b>Factorización.</b> \(A=PDP^{-1}\), con \(P=[\mathbf{v}_1\cdots\mathbf{v}_n]\) y \(D=\operatorname{diag}(\lambda_1,\dots,\lambda_n)\). Es el cambio de base del tema de semejanza con la mejor base posible.`,
String.raw`<b>Potencias.</b> \(A^k=PD^kP^{-1}\). Si \(\mathbf{x}_0=\sum c_i\mathbf{v}_i\), entonces \(A^k\mathbf{x}_0=\sum c_i\lambda_i^k\mathbf{v}_i\). A la larga domina el autovalor de mayor módulo (<i>método de la potencia</i>). Para Fibonacci, \(F_{k+1}/F_k\to\varphi=\tfrac{1+\sqrt5}{2}\).`,
String.raw`<b>Funciones de matrices.</b> \(e^{A}=\sum_{k\ge0}A^k/k!\). Si \(A=PDP^{-1}\), \(f(A)=P\,f(D)\,P^{-1}\) con \(f(D)=\operatorname{diag}(f(\lambda_i))\). En particular \(e^{At}=P\,\operatorname{diag}(e^{\lambda_it})\,P^{-1}\).`,
String.raw`<b>Sistemas \(\dot{\mathbf{x}}=A\mathbf{x}\).</b> La solución es \(\mathbf{x}(t)=e^{At}\mathbf{x}_0=\sum c_ie^{\lambda_it}\mathbf{v}_i\). Cada modo crece o decae según el signo de \(\operatorname{Re}\lambda_i\).`,
String.raw`<b>Retrato de fase en 2D.</b> Con \(\tau=\operatorname{tr}A\) y \(\Delta=\det A\): si \(\Delta<0\), silla; si \(\Delta>0\) y \(\tau^2>4\Delta\), nodo; si \(\tau^2<4\Delta\), foco (espiral), o centro si \(\tau=0\). Es estable cuando \(\tau<0\) y \(\Delta>0\).`,
String.raw`<b>Autovalores complejos.</b> Si \(\lambda=\alpha\pm i\beta\), las soluciones reales son combinaciones de \(e^{\alpha t}\cos\beta t\) y \(e^{\alpha t}\sin\beta t\): la parte imaginaria da oscilación y la parte real, crecimiento o amortiguamiento.`,
String.raw`<b>Cuando no se puede.</b> Una matriz defectiva no es diagonalizable; su forma canónica tiene bloques de Jordan y \(e^{At}\) incluye términos \(t\,e^{\lambda t}\). Es el amortiguamiento crítico de un oscilador.`],
lab:tabs([['fase','Retrato de fase ẋ = Ax',`<div class="controls" style="margin:0 0 12px">${btn('dg-p0','Nodo estable')}${btn('dg-p1','Silla')}${btn('dg-p2','Foco estable')}${btn('dg-p3','Centro')}${btn('dg-p4','Defectiva')}${btn('dg-clr','Borrar trayectorias')}</div>`+
  lab2('dg-cv',slider('dg-a','a',-3,3,0.25,-1)+slider('dg-b','b',-3,3,0.25,0.5)+slider('dg-c','c',-3,3,0.25,0.25)+slider('dg-d','d',-3,3,0.25,-1.5),'dg-read',String.raw`Las flechas grises son el campo \(A\mathbf{x}\). Haz clic en cualquier punto para soltar una partícula que sigue \(\dot{\mathbf{x}}=A\mathbf{x}\). Las rectas verdes son los autovectores: una partícula que empieza sobre ellas se queda en la recta y solo cambia su distancia al origen como \(e^{\lambda t}\).`)],
 ['pot','Potencias Aᵏx',`<div class="controls" style="margin:0 0 12px">${sel('dg-M',[['fib','Fibonacci [[1, 1], [1, 0]]'],['mk','Markov [[0,9, 0,2], [0,1, 0,8]]'],['ej','Ejemplo [[4, 1], [2, 3]] / 5']])}${btn('dg-step','Aplicar A',false)}${btn('dg-reset','Reiniciar')}</div>`+
  lab2('dg-cv2','','dg-read2',String.raw`Arrastra el vector inicial \(\mathbf{x}_0\) y pulsa “Aplicar A” varias veces. Los iterados se muestran normalizados: su dirección converge al autovector del autovalor de mayor módulo, porque \(A^k\mathbf{x}_0=\sum c_i\lambda_i^k\mathbf{v}_i\) y \(\lambda_1^k\) acaba dominando. En la cadena de Markov, ese autovector es la distribución estacionaria (\(\lambda=1\)).`)]]),
laws:[['Diagonalización',String.raw`A=PDP^{-1},\qquad P=[\mathbf{v}_1\cdots\mathbf{v}_n],\ D=\operatorname{diag}(\lambda_i)`,String.raw`Existe si y solo si hay \(n\) autovectores LI.`],
 ['Potencias',String.raw`A^k=PD^kP^{-1},\qquad A^k\mathbf{x}_0=\sum_i c_i\lambda_i^k\mathbf{v}_i`,'Para k grande domina el autovalor de mayor módulo.'],
 ['Exponencial de una matriz',String.raw`e^{At}=\sum_{k=0}^\infty\frac{(At)^k}{k!}=P\,\operatorname{diag}(e^{\lambda_it})\,P^{-1}`,String.raw`Cumple \(\tfrac{d}{dt}e^{At}=Ae^{At}\) y \(e^{A\cdot0}=I\).`],
 ['Solución de \(\dot{\mathbf{x}}=A\mathbf{x}\)',String.raw`\mathbf{x}(t)=\sum_i c_i\,e^{\lambda_it}\,\mathbf{v}_i,\qquad\mathbf{x}(0)=\sum_ic_i\mathbf{v}_i`,'Superposición de modos que evolucionan de forma independiente.'],
 ['Clasificación en 2D',String.raw`\lambda^2-\tau\lambda+\Delta=0,\qquad\tau=\operatorname{tr}A,\ \Delta=\det A`,String.raw`Silla si \(\Delta<0\); nodo o foco según el signo de \(\tau^2-4\Delta\).`],
 ['Exponencial de una rotación',String.raw`e^{\theta J}=\cos\theta\,I+\sin\theta\,J=R_\theta,\qquad J^2=-I`,'La fórmula de Euler en versión matricial.']],
ex:[String.raw`Resuelve \(\dot{\mathbf{x}}=A\mathbf{x}\) con \(A=\begin{pmatrix}4&1\\2&3\end{pmatrix}\) y \(\mathbf{x}(0)=(2,-1)\). Calcula también \(A^k\mathbf{x}(0)\).`,
 [String.raw`Del tema anterior: \(\lambda_1=5\), \(\mathbf{v}_1=(1,1)\); \(\lambda_2=2\), \(\mathbf{v}_2=(1,-2)\).`,
  String.raw`Descomponer el dato inicial: \(c_1(1,1)+c_2(1,-2)=(2,-1)\Rightarrow c_1+c_2=2,\ c_1-2c_2=-1\Rightarrow c_2=1,\ c_1=1\).`,
  String.raw`\(\mathbf{x}(t)=e^{5t}(1,1)+e^{2t}(1,-2)=\big(e^{5t}+e^{2t},\ e^{5t}-2e^{2t}\big)\). Ambos autovalores son positivos: el origen es un nodo inestable.`,
  String.raw`Con potencias: \(A^k\mathbf{x}(0)=5^k(1,1)+2^k(1,-2)\). Para \(k\) grande, \(A^k\mathbf{x}(0)\approx5^k(1,1)\): la dirección converge a \(\mathbf{v}_1\).`]],
prev:['al-autovalores','Autovalores y autovectores'],next:['al-producto-interno','Producto interno y norma'],
ref:'Strang, cap. 6; Boyce &amp; DiPrima, <i>Ecuaciones diferenciales</i>, cap. 7; Thornton &amp; Marion, cap. 12'}));

const PRE4=[[2,1,1,2],[1,1,0,1],[0,-1,1,0],[1,0,0,-1],[1,0,0,0]];
LABS['al-autovalores']=function(sec){
  const cv=$('#av-cv',sec),rd=$('#av-read',sec);let th=0.3,paused=false,trail=[];
  const g={};['a','b','c','d'].forEach(k=>g[k]=sl(sec,'av-'+k,v=>nt(v,2),()=>{trail=[];draw1();}));
  PRE4.forEach((p,i)=>$('#av-p'+i,sec).onclick=()=>{['a','b','c','d'].forEach((k,j)=>g[k].set(p[j]));trail=[];draw1();});
  $('#av-pause',sec).onclick=e=>{paused=!paused;e.target.textContent=paused?'Seguir':'Pausa';};
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.85,470,300);
    const A=[[g.a(),g.b()],[g.c(),g.d()]],e=eig2(A),sv=Math.max(1.2,...[[1,0],[0,1],[0.7,0.7],[0.7,-0.7]].map(v=>Math.hypot(...mv(A,v))));
    const P=plane(ctx,w,h,Math.min(5,sv*1.15+0.3));
    ctx.save();ctx.strokeStyle=K.ax;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(P.cx,P.cy,P.s,0,TAU);ctx.stroke();ctx.restore();
    ctx.save();ctx.strokeStyle='rgba(217,72,15,.35)';ctx.lineWidth=1.5;ctx.beginPath();for(let i=0;i<=200;i++){const t=i/200*TAU,q=mv(A,[Math.cos(t),Math.sin(t)]);i?ctx.lineTo(P.X(q[0]),P.Y(q[1])):ctx.moveTo(P.X(q[0]),P.Y(q[1]));}ctx.stroke();ctx.restore();
    if(!e.cx){[e.v1,e.v2].forEach(v=>{ctx.save();ctx.strokeStyle='rgba(43,138,62,.45)';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(P.X(-9*v[0]),P.Y(-9*v[1]));ctx.lineTo(P.X(9*v[0]),P.Y(9*v[1]));ctx.stroke();ctx.restore();});}
    const x=[Math.cos(th),Math.sin(th)],Ax=mv(A,x),cr=x[0]*Ax[1]-x[1]*Ax[0],par=Math.abs(cr)<0.06*Math.max(1,Math.hypot(...Ax));
    arrow(ctx,P.cx,P.cy,P.X(Ax[0]),P.Y(Ax[1]),par?K.r:K.b,3.5);arrow(ctx,P.cx,P.cy,P.X(x[0]),P.Y(x[1]),K.ink,3);
    label(ctx,'x',P.X(x[0])+8,P.Y(x[1])-10,K.ink);label(ctx,'Ax',P.X(Ax[0])+8,P.Y(Ax[1])+12,par?K.r:K.b);
    const p=`λ² ${e.t>=0?'−':'+'} ${nt(Math.abs(e.t),2)}λ ${e.d>=0?'+':'−'} ${nt(Math.abs(e.d),2)}`;
    rd.innerHTML=row('A',mat(A))+row('p(λ)',p)+sep+
      (e.cx?row('λ',cs([e.re,e.im],3)+' y '+cs([e.re,-e.im],3))+rowT('<span class="aa-no">Autovalores complejos</span>: ninguna dirección real es invariante; A gira todos los vectores.')
        :row('λ₁',nt(e.l1,3))+row('v₁',vs(e.v1))+row('λ₂',nt(e.l2,3))+row('v₂',vs(e.v2))+
         rowT(Math.abs(e.l1-e.l2)<1e-9&&Math.abs(e.v1[0]*e.v2[1]-e.v1[1]*e.v2[0])<1e-6?'<span class="aa-no">Autovalor doble con una sola dirección propia</span>: m<sub>g</sub> = 1 < m<sub>a</sub> = 2 (defectiva).':''))+
      sep+row('λ₁ + λ₂ = tr A',nt(e.t,3))+row('λ₁ · λ₂ = det A',nt(e.d,3))+
      (par?rowT(`<span class="aa-ok">Ahora x es autovector</span>: Ax = ${nt((Ax[0]*x[0]+Ax[1]*x[1]),2)}·x`):'');
  }
  /* rotación */
  const cv2=$('#av-cv2',sec),rd2=$('#av-read2',sec),gth=sl(sec,'av-th',v=>nt(v,0)+'°',()=>draw2());
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.55,380,240),hw=w/2-4,t=gth()*Math.PI/180;
    const P1=plane(ctx,w,h,1.6,0,hw),P2=cplane(ctx,w,h,1.6,w/2+4,hw);
    ctx.fillStyle='#fff';ctx.fillRect(hw,0,8,h);
    const R=[[Math.cos(t),-Math.sin(t)],[Math.sin(t),Math.cos(t)]];
    ctx.save();ctx.beginPath();ctx.rect(0,0,hw,h);ctx.clip();
    for(let k=0;k<8;k++){const a=k*Math.PI/4,v=[Math.cos(a),Math.sin(a)],q=mv(R,v);arrow(ctx,P1.cx,P1.cy,P1.X(v[0]),P1.Y(v[1]),'rgba(28,34,48,.25)',2);arrow(ctx,P1.cx,P1.cy,P1.X(q[0]),P1.Y(q[1]),K.b,2.5);}
    ctx.restore();
    ctx.save();ctx.beginPath();ctx.rect(w/2+4,0,hw,h);ctx.clip();ctx.strokeStyle=K.ax;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(P2.cx,P2.cy,P2.s,0,TAU);ctx.stroke();ctx.restore();
    const l1=[Math.cos(t),Math.sin(t)],l2=[Math.cos(t),-Math.sin(t)];
    arrow(ctx,P2.cx,P2.cy,P2.X(l1[0]),P2.Y(l1[1]),K.t,2,[5,4]);arrow(ctx,P2.cx,P2.cy,P2.X(l2[0]),P2.Y(l2[1]),K.d,2,[5,4]);
    dot(ctx,P2.X(l1[0]),P2.Y(l1[1]),7,K.t);dot(ctx,P2.X(l2[0]),P2.Y(l2[1]),7,K.d);
    label(ctx,'e^{iθ}',P2.X(l1[0])+10,P2.Y(l1[1])-10,K.t);label(ctx,'e^{−iθ}',P2.X(l2[0])+10,P2.Y(l2[1])+12,K.d);
    label(ctx,'Plano real: R_θ',10,14,K.mut);label(ctx,'Plano complejo: autovalores',w/2+14,14,K.mut);
    rd2.innerHTML=row('R<sub>θ</sub>',mat(R))+row('p(λ)','λ² − '+nt(2*Math.cos(t),3)+'λ + 1')+sep+
      row('λ₁ = e^{iθ}',cs(l1,3))+row('λ₂ = e^{−iθ}',cs(l2,3))+row('|λ|','1')+row('arg λ₁','θ = '+nt(gth(),0)+'°')+sep+
      rowT(gth()===0?'θ = 0: es la identidad y todo vector es autovector (λ = 1).':gth()===180?'θ = 180°: R = −I, todo vector es autovector con λ = −1.':'Autovectores complejos: (1, −i) para e^{iθ} y (1, i) para e^{−iθ}.');
  }
  return {draw(){draw1();draw2();},tick(dt){if(paused||!vis(cv))return;th+=dt*0.7;draw1();}};
};

LABS['al-diagonalizacion']=function(sec){
  const cv=$('#dg-cv',sec),rd=$('#dg-read',sec);let P=null,parts=[],paths=[];
  const g={};['a','b','c','d'].forEach(k=>g[k]=sl(sec,'dg-'+k,v=>nt(v,2),()=>{paths=[];parts=[];seed();draw1();}));
  const PR=[[-1,0.5,0.25,-1.5],[1,1,1,-1],[-0.5,-2,2,-0.5],[0,-1.5,1.5,0],[-1,1,0,-1]];
  PR.forEach((p,i)=>$('#dg-p'+i,sec).onclick=()=>{['a','b','c','d'].forEach((k,j)=>g[k].set(p[j]));paths=[];parts=[];seed();draw1();});
  $('#dg-clr',sec).onclick=()=>{paths=[];parts=[];draw1();};
  const A=()=>[[g.a(),g.b()],[g.c(),g.d()]];
  function rk4(x,h){const M=A(),f=v=>mv(M,v),k1=f(x),k2=f([x[0]+h/2*k1[0],x[1]+h/2*k1[1]]),k3=f([x[0]+h/2*k2[0],x[1]+h/2*k2[1]]),k4=f([x[0]+h*k3[0],x[1]+h*k3[1]]);
    return [x[0]+h/6*(k1[0]+2*k2[0]+2*k3[0]+k4[0]),x[1]+h/6*(k1[1]+2*k2[1]+2*k3[1]+k4[1])];}
  function traj(x0){const pts=[x0];let x=x0;for(let i=0;i<600;i++){x=rk4(x,0.02);if(Math.hypot(...x)>12)break;pts.push(x);}
    const back=[];x=x0;for(let i=0;i<600;i++){x=rk4(x,-0.02);if(Math.hypot(...x)>12||Math.hypot(...x)<1e-3)break;back.push(x);}return back.reverse().concat(pts);}
  function seed(){for(let k=0;k<10;k++){const a=k*TAU/10+0.2;paths.push(traj([3.2*Math.cos(a),3.2*Math.sin(a)]));}}
  seed();
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.85,470,300);P=plane(ctx,w,h,4);
    const M=A(),e=eig2(M);
    for(let i=-8;i<=8;i++)for(let j=-8;j<=8;j++){const x=i*0.5,y=j*0.5;if(Math.abs(x)>P.xr[1]||Math.abs(y)>P.yr[1])continue;const v=mv(M,[x,y]),n=Math.hypot(...v);if(n<1e-9)continue;const L=0.22;
      arrow(ctx,P.X(x),P.Y(y),P.X(x+L*v[0]/n),P.Y(y+L*v[1]/n),'rgba(93,101,119,.45)',1.2);}
    if(!e.cx){[e.v1,e.v2].forEach(v=>{ctx.save();ctx.strokeStyle='rgba(43,138,62,.5)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(P.X(-9*v[0]),P.Y(-9*v[1]));ctx.lineTo(P.X(9*v[0]),P.Y(9*v[1]));ctx.stroke();ctx.restore();});}
    paths.forEach(pt=>{ctx.save();ctx.strokeStyle=K.t;ctx.lineWidth=1.8;ctx.beginPath();pt.forEach((q,i)=>i?ctx.lineTo(P.X(q[0]),P.Y(q[1])):ctx.moveTo(P.X(q[0]),P.Y(q[1])));ctx.stroke();ctx.restore();});
    parts.forEach(p=>dot(ctx,P.X(p[0]),P.Y(p[1]),5.5,K.b,'#fff'));
    const tau=e.t,D=e.d,disc=tau*tau-4*D;
    let cl=D<-1e-9?'silla (inestable)':Math.abs(D)<1e-9?'degenerado (det A = 0): una recta de equilibrios':Math.abs(tau)<1e-9&&disc<0?'centro (órbitas cerradas)':disc<-1e-9?(tau<0?'foco estable (espiral hacia dentro)':'foco inestable (espiral hacia fuera)'):Math.abs(disc)<1e-9?(tau<0?'nodo impropio estable':'nodo impropio inestable'):(tau<0?'nodo estable':'nodo inestable');
    rd.innerHTML=row('A',mat(M))+row('τ = tr A',nt(tau,2))+row('Δ = det A',nt(D,2))+row('τ² − 4Δ',nt(disc,2))+sep+
      (e.cx?row('λ',cs([e.re,e.im],2)+' y '+cs([e.re,-e.im],2))+rowT(`x(t) = e^{${nt(e.re,2)}t}·(combinación de cos ${nt(e.im,2)}t y sin ${nt(e.im,2)}t)`)
        :row('λ₁, λ₂',nt(e.l1,2)+', '+nt(e.l2,2))+rowT('x(t) = c₁e^{λ₁t}v₁ + c₂e^{λ₂t}v₂'))+sep+rowT('<b>'+cl+'</b>');
  }
  cv.addEventListener('pointerdown',ev=>{if(!P)return;const r=cv.getBoundingClientRect(),x=[P.ix(ev.clientX-r.left),P.iy(ev.clientY-r.top)];parts.push(x);paths.push(traj(x));draw1();});
  /* potencias */
  const cv2=$('#dg-cv2',sec),rd2=$('#dg-read2',sec),sM=$('#dg-M',sec);let P2=null;
  const MS={fib:[[1,1],[1,0]],mk:[[0.9,0.2],[0.1,0.8]],ej:[[0.8,0.2],[0.4,0.6]]};
  const X0=[[-0.6,1]];let it=[];
  const reset=()=>{it=[X0[0].slice()];draw2();};
  sM.onchange=reset;$('#dg-reset',sec).onclick=reset;
  $('#dg-step',sec).onclick=()=>{const M=MS[sM.value];it.push(mv(M,it[it.length-1]));draw2();};
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.85,470,300);P2=plane(ctx,w,h,1.6);
    const M=MS[sM.value],e=eig2(M);
    ctx.save();ctx.strokeStyle=K.ax;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(P2.cx,P2.cy,P2.s,0,TAU);ctx.stroke();ctx.restore();
    [e.v1,e.v2].forEach((v,i)=>{ctx.save();ctx.strokeStyle=i?'rgba(93,101,119,.35)':'rgba(43,138,62,.5)';ctx.lineWidth=i?2:5;ctx.beginPath();ctx.moveTo(P2.X(-3*v[0]),P2.Y(-3*v[1]));ctx.lineTo(P2.X(3*v[0]),P2.Y(3*v[1]));ctx.stroke();ctx.restore();});
    it.forEach((x,k)=>{const n=Math.hypot(...x),u=[x[0]/n,x[1]/n],last=k===it.length-1;arrow(ctx,P2.cx,P2.cy,P2.X(u[0]),P2.Y(u[1]),last?K.b:`rgba(217,72,15,${0.15+0.5*k/Math.max(1,it.length)})`,last?3.5:1.5);
      if(last)label(ctx,'Aᵏx₀ / ‖Aᵏx₀‖',P2.X(u[0])+8,P2.Y(u[1])-12,K.b);});
    arrow(ctx,P2.cx,P2.cy,P2.X(X0[0][0]),P2.Y(X0[0][1]),K.ink,2.5);handle(ctx,P2,X0[0],K.ink);label(ctx,'x₀',P2.X(X0[0][0])+10,P2.Y(X0[0][1])+12,K.ink);
    const k=it.length-1,x=it[k],ratio=k>0?Math.hypot(...x)/Math.hypot(...it[k-1]):NaN;
    rd2.innerHTML=row('A',mat(M))+row('λ₁ (dominante)',nt(e.l1,4))+row('λ₂',nt(e.l2,4))+row('v₁',vs(e.v1,3))+sep+
      row('k',k)+row('Aᵏx₀',vs(x,3))+(k>0?row('‖Aᵏx₀‖ / ‖Aᵏ⁻¹x₀‖',nt(ratio,4)):'')+
      row('ángulo con v₁',nt(Math.acos(Math.min(1,Math.abs((x[0]*e.v1[0]+x[1]*e.v1[1])/Math.hypot(...x))))*180/Math.PI,2)+'°')+sep+
      rowT(sM.value==='fib'?'Fibonacci: (F<sub>k+1</sub>, F<sub>k</sub>) = Aᵏ(1, 0). El cociente tiende a φ ≈ 1,6180.':sM.value==='mk'?'Cadena de Markov: λ₁ = 1 y v₁ ∝ (2, 1), la distribución estacionaria (2/3, 1/3).':'λ₁ = 1 y λ₂ = 0,4: la componente en v₂ se reduce a 0,4ᵏ.');
  }
  dragPts(cv2,()=>P2,X0,reset,{R:1.5,snap:0.05});
  reset();
  return {draw(){draw1();draw2();},tick(dt){if(!parts.length||!vis(cv))return;for(let s=0;s<3;s++)parts=parts.map(p=>rk4(p,dt/3)).filter(p=>Math.hypot(...p)<12);draw1();}};
};

/* ================= AL · UNIDAD V · PRODUCTO INTERNO ================= */
const U5='Unidad V · Producto interno';
V.push(topicPage({id:'al-producto-interno',pre:'pi',course:AL,unit:U5,title:'Producto interno y norma',
lead:String.raw`Un espacio vectorial no trae consigo longitudes ni ángulos: hay que añadirlos. El producto interno es esa estructura extra. Con él aparecen la norma, la distancia, la ortogonalidad y las desigualdades de Cauchy-Schwarz y triangular, tanto para flechas como para funciones.`,
res:[String.raw`<b>Definición (caso real).</b> Un producto interno es una función \(\langle\cdot,\cdot\rangle:V\times V\to\mathbb{R}\) lineal en cada argumento, simétrica (\(\langle\mathbf{u},\mathbf{v}\rangle=\langle\mathbf{v},\mathbf{u}\rangle\)) y definida positiva (\(\langle\mathbf{v},\mathbf{v}\rangle>0\) si \(\mathbf{v}\neq\mathbf{0}\)).`,
String.raw`<b>Ejemplos.</b> El producto escalar \(\mathbf{u}\cdot\mathbf{v}=\sum u_iv_i\). Con una matriz simétrica definida positiva \(G\), \(\langle\mathbf{u},\mathbf{v}\rangle_G=\mathbf{u}^{\mathsf T}G\mathbf{v}\) (una <i>métrica</i>). Para funciones, \(\langle f,g\rangle=\int_a^b f(x)g(x)\,dx\), a veces con un peso \(w(x)\).`,
String.raw`<b>Norma y distancia.</b> \(\|\mathbf{v}\|=\sqrt{\langle\mathbf{v},\mathbf{v}\rangle}\) y \(d(\mathbf{u},\mathbf{v})=\|\mathbf{u}-\mathbf{v}\|\). Cumple \(\|c\mathbf{v}\|=|c|\,\|\mathbf{v}\|\).`,
String.raw`<b>Cauchy-Schwarz.</b> \(|\langle\mathbf{u},\mathbf{v}\rangle|\le\|\mathbf{u}\|\,\|\mathbf{v}\|\), con igualdad solo si son linealmente dependientes. Demostración: \(0\le\|\mathbf{u}-t\mathbf{v}\|^2=\|\mathbf{u}\|^2-2t\langle\mathbf{u},\mathbf{v}\rangle+t^2\|\mathbf{v}\|^2\) para todo \(t\), así que el discriminante de esa cuadrática no puede ser positivo.`,
String.raw`<b>Ángulo y ortogonalidad.</b> Gracias a Cauchy-Schwarz, \(\cos\theta=\dfrac{\langle\mathbf{u},\mathbf{v}\rangle}{\|\mathbf{u}\|\|\mathbf{v}\|}\in[-1,1]\) define un ángulo en cualquier espacio con producto interno. \(\mathbf{u}\perp\mathbf{v}\) si \(\langle\mathbf{u},\mathbf{v}\rangle=0\), y entonces vale Pitágoras: \(\|\mathbf{u}+\mathbf{v}\|^2=\|\mathbf{u}\|^2+\|\mathbf{v}\|^2\).`,
String.raw`<b>Desigualdad triangular.</b> \(\|\mathbf{u}+\mathbf{v}\|\le\|\mathbf{u}\|+\|\mathbf{v}\|\). Sale de desarrollar \(\|\mathbf{u}+\mathbf{v}\|^2\) y acotar el término cruzado con Cauchy-Schwarz.`,
String.raw`<b>Proyección sobre un vector.</b> \(\operatorname{proj}_{\mathbf{v}}\mathbf{u}=\dfrac{\langle\mathbf{u},\mathbf{v}\rangle}{\langle\mathbf{v},\mathbf{v}\rangle}\mathbf{v}\), y \(\mathbf{u}-\operatorname{proj}_{\mathbf{v}}\mathbf{u}\perp\mathbf{v}\). Es la componente de \(\mathbf{u}\) en la dirección de \(\mathbf{v}\) (como el trabajo \(W=\mathbf{F}\cdot\mathbf{d}\)).`,
String.raw`<b>Funciones ortogonales.</b> En \([-\pi,\pi]\), \(\int\sin mx\,\sin nx\,dx=0\) si \(m\neq n\): los senos y cosenos son una familia ortogonal, la base de las series de Fourier. En relatividad, el “producto” de Minkowski \(c^2t_1t_2-\mathbf{x}_1\cdot\mathbf{x}_2\) no es definido positivo: es una métrica indefinida.`],
lab:tabs([['vec','Vectores del plano',`<div class="controls" style="margin:0 0 12px">${seg('pi-G','g',[['e','Producto escalar usual'],['d','Métrica G = diag(2, ½)'],['o','Métrica G = [[2, 1], [1, 1]]']])}</div>`+
  lab2('pi-cv','','pi-read',String.raw`Arrastra \(\mathbf{u}\) (negro) y \(\mathbf{v}\) (azul). La flecha naranja es \(\operatorname{proj}_{\mathbf{v}}\mathbf{u}\) y el segmento discontinuo, la parte ortogonal. La curva verde es la “circunferencia unidad” \(\{\mathbf{x}:\langle\mathbf{x},\mathbf{x}\rangle=1\}\): con otra métrica se vuelve una elipse, y cambian las longitudes, los ángulos y qué vectores son ortogonales.`)],
 ['fun','Funciones ortogonales',`<div class="controls" style="margin:0 0 12px">f = ${sel('pi-f',[['s1','sin x'],['s2','sin 2x'],['c1','cos x'],['x','x'],['one','1'],['x2','x²']])} g = ${sel('pi-g',[['s2','sin 2x'],['s1','sin x'],['c1','cos x'],['x','x'],['one','1'],['x2','x²']])}</div>`+
  lab2('pi-cv2','','pi-read2',String.raw`Con \(\langle f,g\rangle=\int_{-\pi}^{\pi}f(x)g(x)\,dx\), el producto interno es el área con signo bajo \(f\cdot g\) (sombreada). Si las partes positivas y negativas se compensan, las funciones son ortogonales. Prueba \(\sin x\) con \(\sin2x\), o \(x\) con \(1\) (una impar y otra par).`)]]),
laws:[['Axiomas',String.raw`\langle a\mathbf{u}+b\mathbf{w},\mathbf{v}\rangle=a\langle\mathbf{u},\mathbf{v}\rangle+b\langle\mathbf{w},\mathbf{v}\rangle,\ \ \langle\mathbf{u},\mathbf{v}\rangle=\langle\mathbf{v},\mathbf{u}\rangle,\ \ \langle\mathbf{v},\mathbf{v}\rangle>0`,'Lineal, simétrico y definido positivo.'],
 ['Cauchy-Schwarz',String.raw`|\langle\mathbf{u},\mathbf{v}\rangle|\le\|\mathbf{u}\|\,\|\mathbf{v}\|`,'Igualdad si y solo si u y v son paralelos.'],
 ['Desigualdad triangular',String.raw`\|\mathbf{u}+\mathbf{v}\|\le\|\mathbf{u}\|+\|\mathbf{v}\|`,'Un lado de un triángulo no supera la suma de los otros dos.'],
 ['Ángulo',String.raw`\cos\theta=\frac{\langle\mathbf{u},\mathbf{v}\rangle}{\|\mathbf{u}\|\,\|\mathbf{v}\|}`,'Definido en cualquier espacio con producto interno.'],
 ['Pitágoras y paralelogramo',String.raw`\|\mathbf{u}+\mathbf{v}\|^2+\|\mathbf{u}-\mathbf{v}\|^2=2\|\mathbf{u}\|^2+2\|\mathbf{v}\|^2`,String.raw`Si \(\mathbf{u}\perp\mathbf{v}\): \(\|\mathbf{u}+\mathbf{v}\|^2=\|\mathbf{u}\|^2+\|\mathbf{v}\|^2\). Una norma viene de un producto interno solo si cumple la ley del paralelogramo.`],
 ['Proyección',String.raw`\operatorname{proj}_{\mathbf{v}}\mathbf{u}=\frac{\langle\mathbf{u},\mathbf{v}\rangle}{\langle\mathbf{v},\mathbf{v}\rangle}\,\mathbf{v}`,String.raw`El residuo \(\mathbf{u}-\operatorname{proj}_{\mathbf{v}}\mathbf{u}\) es ortogonal a \(\mathbf{v}\).`]],
ex:[String.raw`Para \(\mathbf{u}=(1,2,2)\) y \(\mathbf{v}=(3,0,4)\), calcula \(\langle\mathbf{u},\mathbf{v}\rangle\), las normas, el ángulo y \(\operatorname{proj}_{\mathbf{v}}\mathbf{u}\).`,
 [String.raw`\(\langle\mathbf{u},\mathbf{v}\rangle=3+0+8=11\); \(\|\mathbf{u}\|=\sqrt{1+4+4}=3\); \(\|\mathbf{v}\|=\sqrt{9+16}=5\).`,
  String.raw`Cauchy-Schwarz: \(11\le3\cdot5=15\). ✓ Ángulo: \(\cos\theta=11/15\approx0{,}733\), \(\theta\approx42{,}8^\circ\).`,
  String.raw`\(\operatorname{proj}_{\mathbf{v}}\mathbf{u}=\tfrac{11}{25}(3,0,4)=(1{,}32;\ 0;\ 1{,}76)\).`,
  String.raw`Residuo: \(\mathbf{u}-\operatorname{proj}=(-0{,}32;\ 2;\ 0{,}24)\), y \((-0{,}32)(3)+0+(0{,}24)(4)=0\): es ortogonal a \(\mathbf{v}\). ✓`]],
prev:['al-diagonalizacion','Diagonalización y exponencial'],next:['al-gram-schmidt','Gram-Schmidt y proyecciones'],
ref:'Axler, cap. 6; Strang, cap. 4; Arfken, <i>Mathematical Methods for Physicists</i>, cap. 5'}));

V.push(topicPage({id:'al-gram-schmidt',pre:'gs',course:AL,unit:U5,title:'Ortogonalidad, Gram-Schmidt y proyecciones',
lead:String.raw`En una base ortonormal las coordenadas se calculan con productos escalares y las proyecciones son sumas. Gram-Schmidt construye esa base a partir de cualquier otra, y la proyección ortogonal resuelve el problema de mínimos cuadrados: la mejor aproximación cuando un sistema no tiene solución.`,
res:[String.raw`<b>Conjuntos ortogonales.</b> Vectores no nulos y ortogonales dos a dos son linealmente independientes. En una base ortonormal \(\{\mathbf{q}_i\}\): \(\mathbf{v}=\sum\langle\mathbf{q}_i,\mathbf{v}\rangle\mathbf{q}_i\) y \(\|\mathbf{v}\|^2=\sum\langle\mathbf{q}_i,\mathbf{v}\rangle^2\) (Parseval).`,
String.raw`<b>Proyección sobre un subespacio.</b> Si \(\{\mathbf{q}_1,\dots,\mathbf{q}_k\}\) es base ortonormal de \(W\), \(\operatorname{proj}_W\mathbf{v}=\sum_i\langle\mathbf{q}_i,\mathbf{v}\rangle\mathbf{q}_i\), y \(\mathbf{v}-\operatorname{proj}_W\mathbf{v}\perp W\). Es el punto de \(W\) más cercano a \(\mathbf{v}\).`,
String.raw`<b>Matriz de proyección.</b> Con \(Q=[\mathbf{q}_1\cdots\mathbf{q}_k]\), \(P=QQ^{\mathsf T}\). Si la base de \(W\) son las columnas (no ortonormales) de \(A\), \(P=A(A^{\mathsf T}A)^{-1}A^{\mathsf T}\). Toda proyección ortogonal cumple \(P^2=P\) y \(P^{\mathsf T}=P\).`,
String.raw`<b>Gram-Schmidt.</b> A partir de \(\mathbf{v}_1,\dots,\mathbf{v}_n\) LI: \(\mathbf{u}_k=\mathbf{v}_k-\sum_{j\lt k}\langle\mathbf{q}_j,\mathbf{v}_k\rangle\mathbf{q}_j\) y \(\mathbf{q}_k=\mathbf{u}_k/\|\mathbf{u}_k\|\). A cada paso se quita a \(\mathbf{v}_k\) su parte en las direcciones ya construidas. Los primeros \(k\) vectores generan siempre el mismo subespacio que \(\mathbf{v}_1,\dots,\mathbf{v}_k\).`,
String.raw`<b>Factorización QR.</b> Gram-Schmidt aplicado a las columnas de \(A\) da \(A=QR\), con \(Q\) de columnas ortonormales y \(R\) triangular superior, \(r_{ij}=\langle\mathbf{q}_i,\mathbf{a}_j\rangle\).`,
String.raw`<b>Mínimos cuadrados.</b> Si \(A\mathbf{x}=\mathbf{b}\) no tiene solución, se busca \(\hat{\mathbf{x}}\) que minimice \(\|A\mathbf{x}-\mathbf{b}\|\). Entonces \(A\hat{\mathbf{x}}=\operatorname{proj}_{\operatorname{col}A}\mathbf{b}\), y el residuo es ortogonal a las columnas: \(A^{\mathsf T}A\hat{\mathbf{x}}=A^{\mathsf T}\mathbf{b}\) (ecuaciones normales). Con QR: \(R\hat{\mathbf{x}}=Q^{\mathsf T}\mathbf{b}\).`,
String.raw`<b>Complemento ortogonal.</b> \(W^\perp=\{\mathbf{v}:\mathbf{v}\perp W\}\) cumple \(V=W\oplus W^\perp\) y \(\dim W+\dim W^\perp=n\). Además \((\operatorname{col}A)^\perp=\ker A^{\mathsf T}\).`,
String.raw`<b>Polinomios de Legendre.</b> Gram-Schmidt sobre \(1,x,x^2,\dots\) con \(\langle f,g\rangle=\int_{-1}^1fg\,dx\) da, salvo normalización, \(P_0=1\), \(P_1=x\), \(P_2=\tfrac12(3x^2-1)\): los polinomios que aparecen en electrostática y en el átomo de hidrógeno.`],
lab:tabs([['gs','Gram-Schmidt en ℝ³',`<div class="controls" style="margin:0 0 12px">${btn('gs-prev','← Paso anterior')}${btn('gs-next','Siguiente paso →',false)}${btn('gs-new','Otros vectores')}</div>`+
  lab2('gs-cv','','gs-read',String.raw`Arrastra para girar. Paso a paso: se normaliza \(\mathbf{v}_1\); a \(\mathbf{v}_2\) se le quita su proyección sobre \(\mathbf{q}_1\); a \(\mathbf{v}_3\) se le quita su proyección sobre el plano de \(\mathbf{q}_1,\mathbf{q}_2\) (verde). Las flechas discontinuas son las proyecciones que se restan.`)],
 ['mc','Mínimos cuadrados',lab2('gs-cv2',btn('gs-add','Añadir punto')+btn('gs-rm','Quitar punto'),'gs-read2',String.raw`Arrastra los puntos. La recta \(y=c_0+c_1t\) minimiza la suma de los cuadrados de los residuos verticales (segmentos rojos). Equivale a proyectar \(\mathbf{b}=(y_i)\) sobre el espacio columna de \(A=[\mathbf{1}\ \ \mathbf{t}]\): el vector de residuos es ortogonal a \(\mathbf{1}\) y a \(\mathbf{t}\).`)]]),
laws:[['Proyección sobre un subespacio',String.raw`\operatorname{proj}_W\mathbf{v}=\sum_{i=1}^k\langle\mathbf{q}_i,\mathbf{v}\rangle\,\mathbf{q}_i=QQ^{\mathsf T}\mathbf{v}`,String.raw`\(\{\mathbf{q}_i\}\): base ortonormal de \(W\).`],
 ['Gram-Schmidt',String.raw`\mathbf{u}_k=\mathbf{v}_k-\sum_{j\lt k}\langle\mathbf{q}_j,\mathbf{v}_k\rangle\mathbf{q}_j,\qquad\mathbf{q}_k=\frac{\mathbf{u}_k}{\|\mathbf{u}_k\|}`,String.raw`Si algún \(\mathbf{u}_k=\mathbf{0}\), los \(\mathbf{v}\) eran dependientes.`],
 ['Factorización QR',String.raw`A=QR,\qquad Q^{\mathsf T}Q=I,\quad r_{ij}=\langle\mathbf{q}_i,\mathbf{a}_j\rangle\ (i\le j)`,'R es triangular superior con diagonal positiva.'],
 ['Ecuaciones normales',String.raw`A^{\mathsf T}A\,\hat{\mathbf{x}}=A^{\mathsf T}\mathbf{b}`,String.raw`Solución única si las columnas de \(A\) son LI.`],
 ['Matriz de proyección',String.raw`P=A(A^{\mathsf T}A)^{-1}A^{\mathsf T},\qquad P^2=P=P^{\mathsf T}`,'Proyecta sobre el espacio columna de A.'],
 ['Parseval',String.raw`\|\mathbf{v}\|^2=\sum_i\langle\mathbf{q}_i,\mathbf{v}\rangle^2`,'Pitágoras en n dimensiones; en Fourier relaciona energía y coeficientes.']],
ex:[String.raw`Ajusta una recta \(y=c_0+c_1t\) a los puntos \((0,1)\), \((1,3)\), \((2,4)\), \((3,4)\) por mínimos cuadrados.`,
 [String.raw`\(A=\begin{pmatrix}1&0\\1&1\\1&2\\1&3\end{pmatrix}\), \(\mathbf{b}=(1,3,4,4)\). Entonces \(A^{\mathsf T}A=\begin{pmatrix}4&6\\6&14\end{pmatrix}\) y \(A^{\mathsf T}\mathbf{b}=(12,\ 23)\).`,
  String.raw`\(\det A^{\mathsf T}A=56-36=20\). Por Cramer: \(c_0=\dfrac{14\cdot12-6\cdot23}{20}=1{,}5\) y \(c_1=\dfrac{4\cdot23-6\cdot12}{20}=1\).`,
  String.raw`Recta: \(y=1{,}5+t\). Residuos \(\mathbf{b}-A\hat{\mathbf{x}}=(-0{,}5;\ 0{,}5;\ 0{,}5;\ -0{,}5)\), con suma de cuadrados \(1\).`,
  String.raw`Ortogonalidad: \(\sum r_i=0\) y \(\sum t_ir_i=0+0{,}5+1-1{,}5=0\). El residuo es perpendicular a ambas columnas. ✓`],
 'Coloca esos cuatro puntos en la pestaña de mínimos cuadrados.'],
prev:['al-producto-interno','Producto interno y norma'],next:['al-ortogonales','Matrices ortogonales'],
ref:'Strang, cap. 4; Lay, cap. 6; Trefethen &amp; Bau, <i>Numerical Linear Algebra</i>, lect. 7–11'}));

V.push(topicPage({id:'al-ortogonales',pre:'or',course:AL,unit:U5,title:'Matrices ortogonales: rotaciones y reflexiones',
lead:String.raw`Las matrices ortogonales son las transformaciones que conservan longitudes y ángulos: las simetrías del espacio euclídeo. Son exactamente las rotaciones y las reflexiones, y las matrices de cambio entre sistemas de referencia ortonormales.`,
res:[String.raw`<b>Definición y equivalencias.</b> \(Q\in\mathbb{R}^{n\times n}\) es ortogonal si \(Q^{\mathsf T}Q=I\). Equivale a: columnas (o filas) ortonormales; \(Q^{-1}=Q^{\mathsf T}\); \(\langle Q\mathbf{u},Q\mathbf{v}\rangle=\langle\mathbf{u},\mathbf{v}\rangle\); \(\|Q\mathbf{v}\|=\|\mathbf{v}\|\) para todo \(\mathbf{v}\) (isometría).`,
String.raw`<b>Determinante y autovalores.</b> \(\det(Q^{\mathsf T}Q)=(\det Q)^2=1\), así que \(\det Q=\pm1\). Si \(Q\mathbf{v}=\lambda\mathbf{v}\), entonces \(\|\mathbf{v}\|=|\lambda|\|\mathbf{v}\|\): todo autovalor (real o complejo) tiene módulo 1.`,
String.raw`<b>En el plano.</b> Con \(\det=+1\), rotaciones \(R_\theta=\begin{pmatrix}\cos\theta&-\sin\theta\\\sin\theta&\cos\theta\end{pmatrix}\). Con \(\det=-1\), reflexiones respecto a la recta de ángulo \(\varphi\): \(F_\varphi=\begin{pmatrix}\cos2\varphi&\sin2\varphi\\\sin2\varphi&-\cos2\varphi\end{pmatrix}\), con autovalores \(+1\) (la recta) y \(-1\) (su normal).`,
String.raw`<b>Grupos.</b> Las ortogonales forman el grupo \(O(n)\); las de determinante \(+1\), el subgrupo \(SO(n)\) de rotaciones. \(R_\alpha R_\beta=R_{\alpha+\beta}\): las rotaciones del plano conmutan. En 3D no conmutan.`,
String.raw`<b>Dos reflexiones hacen una rotación.</b> \(F_{\varphi_2}F_{\varphi_1}=R_{2(\varphi_2-\varphi_1)}\): reflejar en dos rectas que forman un ángulo \(\alpha\) equivale a rotar \(2\alpha\).`,
String.raw`<b>Reflexión de Householder.</b> \(H=I-2\dfrac{\mathbf{n}\mathbf{n}^{\mathsf T}}{\mathbf{n}^{\mathsf T}\mathbf{n}}\) refleja respecto al hiperplano perpendicular a \(\mathbf{n}\). Toda ortogonal de \(n\times n\) es producto de a lo sumo \(n\) reflexiones (Cartan-Dieudonné); los algoritmos numéricos de QR usan estas reflexiones.`,
String.raw`<b>Rotaciones en 3D.</b> Toda \(R\in SO(3)\) tiene el autovalor 1: hay un eje fijo (teorema de rotación de Euler). El ángulo se lee en la traza: \(\operatorname{tr}R=1+2\cos\theta\).`,
String.raw`<b>En física.</b> La matriz \(\lambda_{ij}\) de cambio entre sistemas cartesianos de Mecánica clásica es ortogonal. La paridad \(\mathbf{x}\mapsto-\mathbf{x}\) tiene \(\det=-1\) en 3D. Las leyes que se escriben con productos escalares no dependen de la orientación de los ejes.`],
lab:tabs([['rf','Rotación o reflexión',`<div class="controls" style="margin:0 0 12px">${seg('or-m','m',[['r','Rotación R_θ'],['f','Reflexión F_φ']])}</div>`+
  lab2('or-cv',slider('or-a','ángulo (°)',-180,180,1,40),'or-read',String.raw`La letra F punteada es la original y la naranja, su imagen. En modo reflexión, la recta verde es el eje de simetría (ángulo \(\varphi\)): la F aparece “al revés”, porque \(\det F_\varphi=-1\). Las longitudes y los ángulos se conservan en ambos casos.`)],
 ['dos','Dos reflexiones',lab2('or-cv2',slider('or-p1','φ₁ (°)',-90,90,1,10)+slider('or-p2','φ₂ (°)',-90,90,1,40),'or-read2',String.raw`La F original (gris) se refleja primero en la recta \(\varphi_1\) (azul, resultado azul claro) y después en la recta \(\varphi_2\) (naranja). El resultado final coincide con rotar la original \(2(\varphi_2-\varphi_1)\): dos determinantes \(-1\) dan uno \(+1\).`)]]),
laws:[['Definición',String.raw`Q^{\mathsf T}Q=QQ^{\mathsf T}=I\iff Q^{-1}=Q^{\mathsf T}`,'Columnas y filas ortonormales.'],
 ['Isometría',String.raw`\langle Q\mathbf{u},Q\mathbf{v}\rangle=\langle\mathbf{u},\mathbf{v}\rangle,\qquad\|Q\mathbf{v}\|=\|\mathbf{v}\|`,'Conserva longitudes, ángulos y distancias.'],
 ['Determinante y autovalores',String.raw`\det Q=\pm1,\qquad|\lambda|=1`,String.raw`\(+1\): rotación (propia); \(-1\): incluye una reflexión (impropia).`],
 ['Reflexión en el plano',String.raw`F_\varphi=\begin{pmatrix}\cos2\varphi&\sin2\varphi\\\sin2\varphi&-\cos2\varphi\end{pmatrix}`,String.raw`Deja fija la recta de ángulo \(\varphi\) e invierte su normal.`],
 ['Composición',String.raw`R_\alpha R_\beta=R_{\alpha+\beta},\qquad F_{\varphi_2}F_{\varphi_1}=R_{2(\varphi_2-\varphi_1)}`,'Las rotaciones del plano conmutan; las reflexiones no.'],
 ['Householder',String.raw`H=I-2\,\frac{\mathbf{n}\mathbf{n}^{\mathsf T}}{\mathbf{n}^{\mathsf T}\mathbf{n}},\qquad H^2=I,\ \det H=-1`,'Reflexión respecto al hiperplano normal a n.'],
 ['Ángulo de una rotación 3D',String.raw`\operatorname{tr}R=1+2\cos\theta`,'El eje es el autovector de autovalor 1.']],
ex:[String.raw`Comprueba que \(Q=\tfrac13\begin{pmatrix}2&-2&1\\1&2&2\\2&1&-2\end{pmatrix}\) es ortogonal y clasifícala.`,
 [String.raw`Columnas: \(\mathbf{c}_1=\tfrac13(2,1,2)\), \(\mathbf{c}_2=\tfrac13(-2,2,1)\), \(\mathbf{c}_3=\tfrac13(1,2,-2)\). Cada una tiene norma \(\tfrac13\sqrt9=1\).`,
  String.raw`Productos cruzados: \(\mathbf{c}_1\cdot\mathbf{c}_2=\tfrac19(-4+2+2)=0\), \(\mathbf{c}_1\cdot\mathbf{c}_3=\tfrac19(2+2-4)=0\), \(\mathbf{c}_2\cdot\mathbf{c}_3=\tfrac19(-2+4-2)=0\). Columnas ortonormales: \(Q^{\mathsf T}Q=I\).`,
  String.raw`\(\det Q=\tfrac1{27}\big[2(-4-2)+2(-2-4)+1(1-4)\big]=\tfrac{-27}{27}=-1\).`,
  String.raw`Como \(\det Q=-1\), \(Q\) no es una rotación: es una transformación impropia (una rotación compuesta con una reflexión) y tiene \(-1\) como autovalor.`]],
prev:['al-gram-schmidt','Gram-Schmidt y proyecciones'],next:['al-cn','El espacio ℂⁿ y la adjunta'],
ref:'Strang, cap. 4; Thornton &amp; Marion, cap. 1; Goldstein, <i>Classical Mechanics</i>, cap. 4'}));

LABS['al-producto-interno']=function(sec){
  const cv=$('#pi-cv',sec),rd=$('#pi-read',sec);let P=null;const H=[[2.5,1],[1,2]];
  const gG=segm(sec,'pi-G','g',()=>draw1());
  const GM={e:[[1,0],[0,1]],d:[[2,0],[0,0.5]],o:[[2,1],[1,1]]};
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.85,470,300);P=plane(ctx,w,h,3.5);
    const G=GM[gG()],ip=(a,b)=>a[0]*(G[0][0]*b[0]+G[0][1]*b[1])+a[1]*(G[1][0]*b[0]+G[1][1]*b[1]),[u,v]=H;
    ctx.save();ctx.strokeStyle=K.t;ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<=200;i++){const t=i/200*TAU,d=[Math.cos(t),Math.sin(t)],r=1/Math.sqrt(ip(d,d));i?ctx.lineTo(P.X(r*d[0]),P.Y(r*d[1])):ctx.moveTo(P.X(r*d[0]),P.Y(r*d[1]));}ctx.stroke();ctx.restore();
    const uv=ip(u,v),uu=ip(u,u),vv=ip(v,v),pr=[uv/vv*v[0],uv/vv*v[1]];
    ctx.save();ctx.strokeStyle='rgba(36,83,201,.25)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(P.X(-9*v[0]),P.Y(-9*v[1]));ctx.lineTo(P.X(9*v[0]),P.Y(9*v[1]));ctx.stroke();ctx.restore();
    arrow(ctx,P.cx,P.cy,P.X(pr[0]),P.Y(pr[1]),K.b,4);
    ctx.save();ctx.setLineDash([5,4]);ctx.strokeStyle=K.mut;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(P.X(u[0]),P.Y(u[1]));ctx.lineTo(P.X(pr[0]),P.Y(pr[1]));ctx.stroke();ctx.restore();
    arrow(ctx,P.cx,P.cy,P.X(v[0]),P.Y(v[1]),K.a,3.5);arrow(ctx,P.cx,P.cy,P.X(u[0]),P.Y(u[1]),K.ink,3.5);handle(ctx,P,u,K.ink);handle(ctx,P,v,K.a);
    label(ctx,'u',P.X(u[0])+10,P.Y(u[1])-10,K.ink);label(ctx,'v',P.X(v[0])+10,P.Y(v[1])-10,K.a);label(ctx,'proj_v u',P.X(pr[0])+8,P.Y(pr[1])+14,K.b);
    const nu=Math.sqrt(uu),nv=Math.sqrt(vv),cth=uv/(nu*nv),s=[u[0]+v[0],u[1]+v[1]],ns=Math.sqrt(ip(s,s));
    rd.innerHTML=row('G',mat(G))+row('⟨u, v⟩',nt(uv,3))+row('‖u‖, ‖v‖',nt(nu,3)+', '+nt(nv,3))+sep+
      row('cos θ',nt(cth,3))+row('θ',nt(Math.acos(Math.max(-1,Math.min(1,cth)))*180/Math.PI,1)+'°')+
      row('Cauchy-Schwarz',nt(Math.abs(uv),3)+' ≤ '+nt(nu*nv,3))+row('triangular',nt(ns,3)+' ≤ '+nt(nu+nv,3))+sep+
      rowT(Math.abs(uv)<0.02?'<span class="aa-ok">u ⊥ v con esta métrica</span>.':Math.abs(Math.abs(cth)-1)<1e-3?'u y v son paralelos: Cauchy-Schwarz se cumple con igualdad.':'');
  }
  dragPts(cv,()=>P,H,draw1,{R:3.3,snap:0.1});
  const cv2=$('#pi-cv2',sec),rd2=$('#pi-read2',sec),sf=$('#pi-f',sec),sg=$('#pi-g',sec);
  const F={s1:[Math.sin,'sin x'],s2:[x=>Math.sin(2*x),'sin 2x'],c1:[Math.cos,'cos x'],x:[x=>x,'x'],one:[()=>1,'1'],x2:[x=>x*x,'x²']};
  sf.onchange=sg.onchange=()=>draw2();
  const integ=f=>{let s=0;const N=2000,a=-Math.PI,hh=2*Math.PI/N;for(let i=0;i<=N;i++){const c=i===0||i===N?1:i%2?4:2;s+=c*f(a+i*hh);}return s*hh/3;};
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.7,400,260);
    const f=F[sf.value][0],g=F[sg.value][0],fg=x=>f(x)*g(x);
    let m=1;for(let i=0;i<=200;i++){const x=-Math.PI+i/100*Math.PI;m=Math.max(m,Math.abs(f(x)),Math.abs(g(x)),Math.abs(fg(x)));}m=Math.min(m*1.1,12);
    const A=axes(ctx,{l:40,t:14,w:w-54,h:h-40,xr:[-Math.PI,Math.PI],yr:[-m,m],xl:'x'});
    ctx.save();ctx.beginPath();ctx.moveTo(A.X(-Math.PI),A.Y(0));for(let i=0;i<=300;i++){const x=-Math.PI+i/150*Math.PI;ctx.lineTo(A.X(x),A.Y(fg(x)));}ctx.lineTo(A.X(Math.PI),A.Y(0));ctx.closePath();ctx.fillStyle='rgba(112,72,232,.2)';ctx.fill();ctx.restore();
    curve(ctx,A,f,-Math.PI,Math.PI,K.b,2.5);curve(ctx,A,g,-Math.PI,Math.PI,K.a,2.5);curve(ctx,A,fg,-Math.PI,Math.PI,K.d,1.5,[5,4]);
    const ip=integ(fg),nf2=Math.sqrt(integ(x=>f(x)**2)),ng=Math.sqrt(integ(x=>g(x)**2));
    rd2.innerHTML=row('<span class="sw" style="background:#d9480f"></span>f',F[sf.value][1])+row('<span class="sw" style="background:#2453c9"></span>g',F[sg.value][1])+sep+
      row('⟨f, g⟩ = ∫ f g dx',nt(ip,4))+row('‖f‖',nt(nf2,4))+row('‖g‖',nt(ng,4))+row('cos θ',nt(ip/(nf2*ng),4))+sep+
      rowT(Math.abs(ip)<1e-6?'<span class="aa-ok">f y g son ortogonales en [−π, π]</span>.':'No son ortogonales.');
  }
  return {draw(){draw1();draw2();}};
};

LABS['al-gram-schmidt']=function(sec){
  const cv=$('#gs-cv',sec),rd=$('#gs-read',sec),st={yaw:0.6,pitch:0.4,auto:false};let step=0;
  const SETS=[[[2,0.3,0.4],[1.2,1.6,0.2],[0.6,0.8,1.8]],[[1,1,0],[1,0,1],[0,1,1]],[[1.8,-0.6,0.5],[0.4,1.5,-0.3],[1.2,1.0,1.4]]];let si=0;
  $('#gs-next',sec).onclick=()=>{step=Math.min(5,step+1);draw1();};$('#gs-prev',sec).onclick=()=>{step=Math.max(0,step-1);draw1();};
  $('#gs-new',sec).onclick=()=>{si=(si+1)%SETS.length;step=0;draw1();};
  cam3(cv,st,()=>draw1());
  const N=v=>v3.mul(v,1/v3.norm(v));
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.85,470,300),P=P3(st,w,h,1.9);axes3(ctx,P,2.2);
    const [a1,a2,a3]=SETS[si],q1=N(a1),p2=v3.mul(q1,v3.dot(q1,a2)),u2=v3.sub(a2,p2),q2=N(u2),p3=v3.add(v3.mul(q1,v3.dot(q1,a3)),v3.mul(q2,v3.dot(q2,a3))),u3=v3.sub(a3,p3),q3=N(u3);
    if(step>=4){const s=1.6,A=v3.mul(q1,s),B=v3.mul(q2,s);face3(ctx,P,[v3.add(A,B),v3.sub(A,B),v3.mul(v3.add(A,B),-1),v3.sub(B,A)],'rgba(15,118,110,.14)','rgba(15,118,110,.35)');}
    const o=[0,0,0],lab=(v,t,c)=>{const p=P.T(...v);label(ctx,t,p[0]+8,p[1]-8,c);};
    const faint='rgba(93,101,119,.45)';
    arrow3(ctx,P,o,a1,step>=1?faint:K.b,step>=1?2:3.5);lab(a1,'v₁',step>=1?K.mut:K.b);
    arrow3(ctx,P,o,a2,step>=3?faint:K.a,step>=3?2:3.5);lab(a2,'v₂',step>=3?K.mut:K.a);
    arrow3(ctx,P,o,a3,step>=5?faint:K.d,step>=5?2:3.5);lab(a3,'v₃',step>=5?K.mut:K.d);
    if(step>=1){arrow3(ctx,P,o,q1,K.t,4);lab(q1,'q₁',K.t);}
    if(step===2){arrow3(ctx,P,o,p2,K.b,2,[5,4]);arrow3(ctx,P,p2,a2,K.a,2,[5,4]);arrow3(ctx,P,o,u2,K.a,3);lab(u2,'u₂',K.a);}
    if(step>=3){arrow3(ctx,P,o,q2,K.t,4);lab(q2,'q₂',K.t);}
    if(step===4){arrow3(ctx,P,o,p3,K.b,2,[5,4]);arrow3(ctx,P,p3,a3,K.d,2,[5,4]);arrow3(ctx,P,o,u3,K.d,3);lab(u3,'u₃',K.d);}
    if(step>=5){arrow3(ctx,P,o,q3,K.t,4);lab(q3,'q₃',K.t);}
    const txt=['Vectores de partida v₁, v₂, v₃ (linealmente independientes).','q₁ = v₁ / ‖v₁‖.','u₂ = v₂ − ⟨q₁, v₂⟩q₁: se resta la proyección sobre q₁.','q₂ = u₂ / ‖u₂‖. Ya q₁ ⊥ q₂.','u₃ = v₃ − proyección sobre el plano de q₁ y q₂.','q₃ = u₃ / ‖u₃‖. Base ortonormal completa.'][step];
    const Q=[q1,q2,q3],R=[[v3.dot(q1,a1),v3.dot(q1,a2),v3.dot(q1,a3)],[0,v3.dot(q2,a2),v3.dot(q2,a3)],[0,0,v3.dot(q3,a3)]];
    const QT=[[q1[0],q2[0],q3[0]],[q1[1],q2[1],q3[1]],[q1[2],q2[2],q3[2]]];
    rd.innerHTML=row('paso',step+' de 5')+rowT(txt)+sep+row('v₁, v₂, v₃',vs(a1,1)+' '+vs(a2,1)+' '+vs(a3,1))+
      (step>=5?row('Q',mat(QT.map(r=>r.map(v=>nt(v,3)))))+row('R',mat(R.map(r=>r.map(v=>nt(v,3)))))+rowT('A = QR, con r<sub>ij</sub> = ⟨q<sub>i</sub>, v<sub>j</sub>⟩.')
        :step>=1?row('⟨q₁, q₂⟩',step>=3?nt(v3.dot(q1,q2),4):'—'):'');
  }
  /* mínimos cuadrados */
  const cv2=$('#gs-cv2',sec),rd2=$('#gs-read2',sec);let P2=null;
  const pts=[[0,1],[1,3],[2,4],[3,4]];
  $('#gs-add',sec).onclick=()=>{pts.push([Math.random()*5-0.5,Math.random()*5]);draw2();};
  $('#gs-rm',sec).onclick=()=>{if(pts.length>2)pts.pop();draw2();};
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.85,470,300);
    P2={};const A=axes(ctx,{l:40,t:14,w:w-54,h:h-40,xr:[-1,5],yr:[-1,6],xl:'t',yl:'y'});
    P2={X:A.X,Y:A.Y,ix:px=>-1+(px-40)/(w-54)*6,iy:py=>-1+(h-26-py)/(h-40)*7};
    const n=pts.length;let S1=0,St=0,Stt=0,Sy=0,Sty=0;pts.forEach(([t,y])=>{S1++;St+=t;Stt+=t*t;Sy+=y;Sty+=t*y;});
    const D=S1*Stt-St*St,c0=(Stt*Sy-St*Sty)/D,c1=(S1*Sty-St*Sy)/D;
    curve(ctx,A,t=>c0+c1*t,-1,5,K.t,3);
    let sse=0,r1=0,rt=0;pts.forEach(([t,y])=>{const yh=c0+c1*t,r=y-yh;sse+=r*r;r1+=r;rt+=t*r;
      ctx.save();ctx.strokeStyle=K.w;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(A.X(t),A.Y(y));ctx.lineTo(A.X(t),A.Y(yh));ctx.stroke();ctx.restore();});
    pts.forEach(p=>dot(ctx,A.X(p[0]),A.Y(p[1]),7,'#fff',K.ink));
    rd2.innerHTML=row('puntos',n)+row('AᵀA',mat([[S1,St],[St,Stt]].map(r=>r.map(v=>nt(v,2)))))+row('Aᵀb',vs([Sy,Sty]))+sep+
      row('c₀',nt(c0,3))+row('c₁',nt(c1,3))+rowT(`recta: y = ${nt(c0,3)} ${c1<0?'−':'+'} ${nt(Math.abs(c1),3)} t`)+sep+
      row('Σ residuos²',nt(sse,4))+row('Σ rᵢ (⟂ a 1)',nt(r1,6))+row('Σ tᵢ rᵢ (⟂ a t)',nt(rt,6));
  }
  drag(cv2,(x,y)=>{if(!P2)return null;let b=null,bd=16;pts.forEach((p,i)=>{const d=Math.hypot(P2.X(p[0])-x,P2.Y(p[1])-y);if(d<bd){bd=d;b=i;}});return b;},
    (i,x,y)=>{pts[i]=[Math.max(-0.9,Math.min(4.9,snap(P2.ix(x),0.1))),Math.max(-0.9,Math.min(5.9,snap(P2.iy(y),0.1)))];draw2();});
  return {draw(){draw1();draw2();}};
};

LABS['al-ortogonales']=function(sec){
  const cv=$('#or-cv',sec),rd=$('#or-read',sec),ga=sl(sec,'or-a',v=>nt(v,0)+'°',()=>draw1()),gm=segm(sec,'or-m','m',()=>draw1());
  const Rm=t=>[[Math.cos(t),-Math.sin(t)],[Math.sin(t),Math.cos(t)]],Fm=p=>[[Math.cos(2*p),Math.sin(2*p)],[Math.sin(2*p),-Math.cos(2*p)]];
  const line=(ctx,P,p,col)=>{ctx.save();ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(P.X(-9*Math.cos(p)),P.Y(-9*Math.sin(p)));ctx.lineTo(P.X(9*Math.cos(p)),P.Y(9*Math.sin(p)));ctx.stroke();ctx.restore();};
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.85,470,300),P=plane(ctx,w,h,3.2),a=ga()*Math.PI/180,rot=gm()==='r',Q=rot?Rm(a):Fm(a);
    if(!rot)line(ctx,P,a,'rgba(43,138,62,.6)');
    tgrid(ctx,P,Q,8,'rgba(15,118,110,.18)');figure(ctx,P,Q,'o');
    const e=eig2(Q),QtQ=mm([[Q[0][0],Q[1][0]],[Q[0][1],Q[1][1]]],Q);
    rd.innerHTML=row(rot?'R<sub>θ</sub>':'F<sub>φ</sub>',mat(Q))+row('QᵀQ',mat(QtQ.map(r=>r.map(v=>nt(v,3)))))+row('det Q',nt(det2(Q[0][0],Q[0][1],Q[1][0],Q[1][1]),3))+sep+
      (e.cx?row('λ',cs([e.re,e.im],3)+', '+cs([e.re,-e.im],3))+row('|λ|','1'):row('λ',nt(e.l1,3)+', '+nt(e.l2,3)))+sep+
      rowT(rot?'Rotación: conserva la orientación (la F no se invierte).':'Reflexión: λ = +1 en la recta verde y λ = −1 en su normal; la orientación se invierte.');
  }
  const cv2=$('#or-cv2',sec),rd2=$('#or-read2',sec),g1=sl(sec,'or-p1',v=>nt(v,0)+'°',()=>draw2()),g2=sl(sec,'or-p2',v=>nt(v,0)+'°',()=>draw2());
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.85,470,300),P=plane(ctx,w,h,3.2),p1=g1()*Math.PI/180,p2=g2()*Math.PI/180;
    line(ctx,P,p1,'rgba(36,83,201,.55)');line(ctx,P,p2,'rgba(217,72,15,.55)');
    const F1=Fm(p1),F2=Fm(p2),T=mm(F2,F1);
    poly(ctx,P,FIG,null,'rgba(93,101,119,.15)',K.ax,1.5,[5,4]);
    poly(ctx,P,FIG,F1,'rgba(36,83,201,.18)',K.a,2);
    poly(ctx,P,FIG,T,'rgba(217,72,15,.30)',K.b,2.5);
    const ang=2*(g2()-g1());
    rd2.innerHTML=row('F<sub>φ₂</sub>F<sub>φ₁</sub>',mat(T.map(r=>r.map(v=>nt(v,3)))))+row('R<sub>2(φ₂−φ₁)</sub>',mat(Rm(ang*Math.PI/180).map(r=>r.map(v=>nt(v,3)))))+sep+
      row('ángulo de la rotación',nt(ang,0)+'°')+row('det',nt(det2(T[0][0],T[0][1],T[1][0],T[1][1]),3))+rowT('(−1)·(−1) = +1: la composición de dos reflexiones es una rotación.');
  }
  return {draw(){draw1();draw2();}};
};

/* ================= AL · UNIDAD VI · ESPACIOS COMPLEJOS ================= */
const U6='Unidad VI · Espacios complejos y teorema espectral';
V.push(topicPage({id:'al-cn',pre:'cn',course:AL,unit:U6,title:'El espacio ℂⁿ y la adjunta',
lead:String.raw`La mecánica cuántica, la óptica y los circuitos de corriente alterna trabajan con vectores de componentes complejas. Para que la longitud siga siendo real y positiva, el producto escalar tiene que conjugar una de las componentes. De ahí salen la adjunta \(A^\dagger\) y la notación de Dirac.`,
res:[String.raw`<b>El espacio.</b> \(\mathbb{C}^n\) es un espacio vectorial sobre \(\mathbb{C}\) de dimensión \(n\) (y de dimensión \(2n\) visto sobre \(\mathbb{R}\)). Todo lo de las Unidades I a IV vale con escalares complejos.`,
String.raw`<b>Por qué conjugar.</b> Con \(\sum u_iv_i\), el vector \((i)\) tendría “longitud al cuadrado” \(i\cdot i=-1\). Se define \(\langle\mathbf{u},\mathbf{v}\rangle=\sum_i\overline{u_i}\,v_i\), y entonces \(\langle\mathbf{v},\mathbf{v}\rangle=\sum|v_i|^2\ge0\).`,
String.raw`<b>Propiedades.</b> Simetría conjugada \(\langle\mathbf{u},\mathbf{v}\rangle=\overline{\langle\mathbf{v},\mathbf{u}\rangle}\); lineal en el segundo argumento y antilineal en el primero: \(\langle c\mathbf{u},\mathbf{v}\rangle=\bar c\,\langle\mathbf{u},\mathbf{v}\rangle\). Es la convención de la física; muchos libros de matemáticas conjugan el segundo argumento.`,
String.raw`<b>Adjunta.</b> \(A^\dagger=\overline{A}^{\mathsf T}\) (conjugada transpuesta). Es la única matriz que cumple \(\langle A\mathbf{u},\mathbf{v}\rangle=\langle\mathbf{u},A^\dagger\mathbf{v}\rangle\). Además \((AB)^\dagger=B^\dagger A^\dagger\) y \((A^\dagger)^\dagger=A\). Para matrices reales coincide con la transpuesta.`,
String.raw`<b>Notación de Dirac.</b> Un vector columna es un <i>ket</i> \(|v\rangle\); su adjunto, el vector fila \(\langle v|=|v\rangle^\dagger\), es un <i>bra</i>. El producto interno es \(\langle u|v\rangle\) y \(|v\rangle\langle u|\) es una matriz (un operador). Si \(\|q\|=1\), \(|q\rangle\langle q|\) proyecta sobre la dirección de \(q\).`,
String.raw`<b>Fase global.</b> \(e^{i\varphi}\mathbf{v}\) tiene la misma norma que \(\mathbf{v}\), y \(\langle e^{i\varphi}\mathbf{u},e^{i\varphi}\mathbf{v}\rangle=\langle\mathbf{u},\mathbf{v}\rangle\). En cuántica, \(\mathbf{v}\) y \(e^{i\varphi}\mathbf{v}\) describen el mismo estado; las fases <i>relativas</i> entre componentes sí importan.`,
String.raw`<b>Ortogonalidad compleja.</b> \((1,i)\) y \((1,-i)\) son ortogonales: \(\overline{1}\cdot1+\overline{i}\cdot(-i)=1+(-i)(-i)=1-1=0\). Sin conjugar daría \(1+i(-i)=2\). Cauchy-Schwarz, Gram-Schmidt y las proyecciones funcionan igual con el producto conjugado.`,
String.raw`<b>Polarización de la luz.</b> El campo de una onda plana se describe con el vector de Jones \((E_x,E_y)\in\mathbb{C}^2\). \((1,0)\) es polarización lineal horizontal; \(\tfrac{1}{\sqrt2}(1,\pm i)\), circular. Las dos polarizaciones circulares son ortogonales, como se vio arriba.`],
lab:tabs([['ip','Producto hermítico en ℂ²',lab2('cn-cv',slider('cn-ph','fase global φ (°)',0,360,1,0),'cn-read',String.raw`Cada panel es un plano complejo: el izquierdo muestra la primera componente de \(\mathbf{u}\) (negro) y de \(\mathbf{v}\) (azul), y el derecho, la segunda. Arrastra las cuatro puntas. La fase global multiplica todo por \(e^{i\varphi}\): las flechas giran, pero \(\langle\mathbf{u},\mathbf{v}\rangle\) y las normas no cambian.`)],
 ['pol','Polarización (vector de Jones)',`<div class="controls" style="margin:0 0 12px">${btn('cn-l','Lineal 45°')}${btn('cn-r','Circular (1, i)/√2')}${btn('cn-lft','Circular (1, −i)/√2')}${btn('cn-e','Elíptica')}</div>`+
  lab2('cn-cv2',slider('cn-ax','|E_y| / |E_x|',0,2,0.05,1)+slider('cn-de','desfase δ (°)',-180,180,1,90),'cn-read2',String.raw`El vector de Jones \((E_x,E_y)=(1,\ r\,e^{i\delta})\) da el campo físico \(\mathbf{E}(t)=\operatorname{Re}\big[(E_x,E_y)e^{-i\omega t}\big]\). La punta del campo recorre una elipse: con \(\delta=0\) una recta, con \(r=1\) y \(\delta=\pm90^\circ\) una circunferencia.`)]]),
laws:[['Producto hermítico',String.raw`\langle\mathbf{u},\mathbf{v}\rangle=\sum_{i=1}^n\overline{u_i}\,v_i=\mathbf{u}^\dagger\mathbf{v}`,'Antilineal en el primer argumento (convención de la física).'],
 ['Simetría conjugada',String.raw`\langle\mathbf{u},\mathbf{v}\rangle=\overline{\langle\mathbf{v},\mathbf{u}\rangle},\qquad\langle\mathbf{v},\mathbf{v}\rangle=\sum|v_i|^2\ge0`,'La norma es real y positiva.'],
 ['Adjunta',String.raw`A^\dagger=\overline{A}^{\mathsf T},\qquad\langle A\mathbf{u},\mathbf{v}\rangle=\langle\mathbf{u},A^\dagger\mathbf{v}\rangle`,'Generaliza la transpuesta a escalares complejos.'],
 ['Adjunta de un producto',String.raw`(AB)^\dagger=B^\dagger A^\dagger,\qquad(cA)^\dagger=\bar c\,A^\dagger`,'Igual que con la transpuesta, se invierte el orden.'],
 ['Notación de Dirac',String.raw`\langle u|v\rangle=\mathbf{u}^\dagger\mathbf{v},\qquad P_q=|q\rangle\langle q|\ \ (\langle q|q\rangle=1)`,'Bra por ket es un número; ket por bra es un operador.'],
 ['Invariancia de fase',String.raw`\langle e^{i\varphi}\mathbf{u},e^{i\varphi}\mathbf{v}\rangle=e^{-i\varphi}e^{i\varphi}\langle\mathbf{u},\mathbf{v}\rangle=\langle\mathbf{u},\mathbf{v}\rangle`,'La fase global no es observable.']],
ex:[String.raw`Para \(\mathbf{u}=(1,\ i)\) y \(\mathbf{v}=(2i,\ 1+i)\), calcula \(\langle\mathbf{u},\mathbf{v}\rangle\) y las normas. Halla también \(A^\dagger\) si \(A=\begin{pmatrix}1&i\\2&3-i\end{pmatrix}\).`,
 [String.raw`\(\langle\mathbf{u},\mathbf{v}\rangle=\overline{1}(2i)+\overline{i}(1+i)=2i+(-i)(1+i)=2i-i-i^2=1+i\).`,
  String.raw`\(\|\mathbf{u}\|^2=|1|^2+|i|^2=2\) y \(\|\mathbf{v}\|^2=|2i|^2+|1+i|^2=4+2=6\).`,
  String.raw`Cauchy-Schwarz: \(|1+i|=\sqrt2\le\sqrt2\cdot\sqrt6=\sqrt{12}\). ✓ Además \(\langle\mathbf{v},\mathbf{u}\rangle=\overline{1+i}=1-i\).`,
  String.raw`\(A^\dagger\): se conjuga y se transpone, \(A^\dagger=\begin{pmatrix}1&2\\-i&3+i\end{pmatrix}\).`]],
prev:['al-ortogonales','Matrices ortogonales'],next:['al-espectral','Teorema espectral'],
ref:'Axler, cap. 6–7; Sakurai, <i>Modern Quantum Mechanics</i>, cap. 1; Hecht, <i>Óptica</i>, cap. 8'}));

V.push(topicPage({id:'al-espectral',pre:'es',course:AL,unit:U6,title:'Operadores hermíticos, unitarios y teorema espectral',
lead:String.raw`Las matrices hermíticas (en el caso real, las simétricas) tienen autovalores reales y una base ortonormal de autovectores. Ese es el teorema espectral, y es la razón por la que en mecánica cuántica las magnitudes medibles se representan con operadores hermíticos.`,
res:[String.raw`<b>Tres familias.</b> Hermítica: \(A=A^\dagger\) (real: simétrica). Unitaria: \(U^\dagger U=I\) (real: ortogonal). Normal: \(AA^\dagger=A^\dagger A\), que incluye a las dos anteriores.`,
String.raw`<b>Autovalores reales.</b> Si \(A=A^\dagger\) y \(A\mathbf{v}=\lambda\mathbf{v}\): \(\lambda\langle\mathbf{v},\mathbf{v}\rangle=\langle\mathbf{v},A\mathbf{v}\rangle=\langle A\mathbf{v},\mathbf{v}\rangle=\bar\lambda\langle\mathbf{v},\mathbf{v}\rangle\). Como \(\langle\mathbf{v},\mathbf{v}\rangle>0\), \(\lambda=\bar\lambda\in\mathbb{R}\).`,
String.raw`<b>Autovectores ortogonales.</b> Si \(A\mathbf{v}_1=\lambda_1\mathbf{v}_1\), \(A\mathbf{v}_2=\lambda_2\mathbf{v}_2\) con \(\lambda_1\neq\lambda_2\): \(\lambda_2\langle\mathbf{v}_1,\mathbf{v}_2\rangle=\langle\mathbf{v}_1,A\mathbf{v}_2\rangle=\langle A\mathbf{v}_1,\mathbf{v}_2\rangle=\lambda_1\langle\mathbf{v}_1,\mathbf{v}_2\rangle\), así que \(\langle\mathbf{v}_1,\mathbf{v}_2\rangle=0\).`,
String.raw`<b>Teorema espectral.</b> Toda matriz hermítica se diagonaliza con una matriz unitaria: \(A=UDU^\dagger\), con \(D\) real. En el caso real simétrico, \(A=QDQ^{\mathsf T}\) con \(Q\) ortogonal. Más en general, una matriz es diagonalizable por una unitaria si y solo si es normal.`,
String.raw`<b>Descomposición espectral.</b> \(A=\sum_i\lambda_i\,\mathbf{q}_i\mathbf{q}_i^\dagger=\sum_i\lambda_i|i\rangle\langle i|\): una suma de proyectores ortogonales pesados por los autovalores.`,
String.raw`<b>Unitarias.</b> Conservan el producto interno, sus autovalores tienen \(|\lambda|=1\) y son de la forma \(U=e^{iH}\) con \(H\) hermítica. La evolución temporal cuántica es \(U(t)=e^{-i\hat Ht/\hbar}\).`,
String.raw`<b>Matrices de Pauli.</b> \(\sigma_x=\begin{pmatrix}0&1\\1&0\end{pmatrix}\), \(\sigma_y=\begin{pmatrix}0&-i\\i&0\end{pmatrix}\), \(\sigma_z=\begin{pmatrix}1&0\\0&-1\end{pmatrix}\) son hermíticas con autovalores \(\pm1\). Toda hermítica \(2\times2\) de traza nula es \(\mathbf{n}\cdot\boldsymbol\sigma\), con autovalores \(\pm\|\mathbf{n}\|\): el espín ½ en un campo magnético.`,
String.raw`<b>Contraste.</b> Una matriz real no simétrica puede tener autovalores complejos o autovectores reales que no son perpendiculares. La simetría garantiza ejes principales ortogonales: tensor de inercia, tensor de esfuerzos, formas cuadráticas.`],
lab:tabs([['sim','Simétrica frente a no simétrica',lab2('es-cv',slider('es-a','a',-2,3,0.1,2)+slider('es-b','b',-2,2,0.1,0.8)+slider('es-d','d',-2,3,0.1,1)+slider('es-s','asimetría s',-1.5,1.5,0.05,0),'es-read',String.raw`\(A=\begin{pmatrix}a&b+s\\b-s&d\end{pmatrix}\). Con \(s=0\) la matriz es simétrica: los autovectores (verdes) son perpendiculares y coinciden con los ejes de la elipse imagen de la circunferencia unidad. Al aumentar \(|s|\), los autovectores dejan de ser perpendiculares y, si \(s\) es grande, desaparecen (autovalores complejos).`)],
 ['her','Hermítica 2×2 y espín',lab2('es-cv2',slider('es-x','n_x',-1.5,1.5,0.05,0.6)+slider('es-y','n_y',-1.5,1.5,0.05,0.5)+slider('es-z','n_z',-1.5,1.5,0.05,0.8),'es-read2',String.raw`\(H=n_x\sigma_x+n_y\sigma_y+n_z\sigma_z=\begin{pmatrix}n_z&n_x-in_y\\n_x+in_y&-n_z\end{pmatrix}\). Arrastra para girar la esfera. Los autovalores son \(\pm\|\mathbf{n}\|\), siempre reales, y los dos autovectores (complejos) son ortogonales. En la esfera de Bloch corresponden a los puntos \(\pm\mathbf{n}/\|\mathbf{n}\|\).`)]]),
laws:[['Hermítica y unitaria',String.raw`A=A^\dagger,\qquad U^\dagger U=I`,'En el caso real: simétrica y ortogonal.'],
 ['Autovalores',String.raw`A=A^\dagger\Rightarrow\lambda\in\mathbb{R};\qquad U^\dagger U=I\Rightarrow|\lambda|=1`,'Los resultados de una medición cuántica son reales.'],
 ['Teorema espectral',String.raw`A=A^\dagger\ \Rightarrow\ A=UDU^\dagger,\quad D=\operatorname{diag}(\lambda_i)\ \text{real}`,'Base ortonormal de autovectores.'],
 ['Descomposición espectral',String.raw`A=\sum_i\lambda_i\,|i\rangle\langle i|,\qquad f(A)=\sum_if(\lambda_i)\,|i\rangle\langle i|`,'Permite definir funciones de operadores, como la exponencial.'],
 ['Exponencial unitaria',String.raw`H=H^\dagger\ \Rightarrow\ U=e^{iH}\ \text{es unitaria}`,String.raw`Evolución cuántica: \(|\psi(t)\rangle=e^{-i\hat Ht/\hbar}|\psi(0)\rangle\).`],
 ['Espín ½',String.raw`(\mathbf{n}\cdot\boldsymbol\sigma)^2=\|\mathbf{n}\|^2I\ \Rightarrow\ \lambda=\pm\|\mathbf{n}\|`,String.raw`De las relaciones \(\sigma_i\sigma_j+\sigma_j\sigma_i=2\delta_{ij}I\).`]],
ex:[String.raw`Escribe la descomposición espectral de \(A=\begin{pmatrix}2&1\\1&2\end{pmatrix}\) y halla los autovectores de \(\sigma_y\).`,
 [String.raw`Autovalores \(3\) y \(1\), con autovectores unitarios \(\mathbf{q}_1=\tfrac1{\sqrt2}(1,1)\) y \(\mathbf{q}_2=\tfrac1{\sqrt2}(1,-1)\), que son ortogonales.`,
  String.raw`\(\mathbf{q}_1\mathbf{q}_1^{\mathsf T}=\tfrac12\begin{pmatrix}1&1\\1&1\end{pmatrix}\) y \(\mathbf{q}_2\mathbf{q}_2^{\mathsf T}=\tfrac12\begin{pmatrix}1&-1\\-1&1\end{pmatrix}\).`,
  String.raw`\(3\,\mathbf{q}_1\mathbf{q}_1^{\mathsf T}+1\,\mathbf{q}_2\mathbf{q}_2^{\mathsf T}=\tfrac12\begin{pmatrix}3+1&3-1\\3-1&3+1\end{pmatrix}=\begin{pmatrix}2&1\\1&2\end{pmatrix}\). ✓`,
  String.raw`\(\sigma_y\): \(\det(\sigma_y-\lambda I)=\lambda^2-1\), así que \(\lambda=\pm1\). Para \(+1\): \(-\lambda x-iy=0\Rightarrow y=ix\), \(\mathbf{v}_+=\tfrac1{\sqrt2}(1,i)\). Para \(-1\): \(\mathbf{v}_-=\tfrac1{\sqrt2}(1,-i)\). Son las polarizaciones circulares, ortogonales en \(\mathbb{C}^2\).`]],
prev:['al-cn','El espacio ℂⁿ y la adjunta'],next:['al-formas-cuadraticas','Formas cuadráticas'],
ref:'Axler, cap. 7; Strang, cap. 6; Griffiths, <i>Introduction to Quantum Mechanics</i>, cap. 3 y 4'}));

V.push(topicPage({id:'al-formas-cuadraticas',pre:'fq',course:AL,unit:U6,title:'Formas cuadráticas y aplicaciones físicas',
lead:String.raw`Una forma cuadrática \(q(\mathbf{x})=\mathbf{x}^{\mathsf T}A\mathbf{x}\) es el término de segundo orden de casi todo: energías, segundas derivadas, cónicas. El teorema espectral la escribe sin términos cruzados en los ejes principales, y con eso se clasifican los puntos críticos y se calculan los modos normales de oscilación.`,
res:[String.raw`<b>Definición.</b> \(q(\mathbf{x})=\mathbf{x}^{\mathsf T}A\mathbf{x}\) con \(A\) simétrica (toda matriz puede reemplazarse por su parte simétrica sin cambiar \(q\)). En el plano: \(q=ax^2+2bxy+cy^2\) con \(A=\begin{pmatrix}a&b\\b&c\end{pmatrix}\).`,
String.raw`<b>Ejes principales.</b> Con \(A=QDQ^{\mathsf T}\) y el cambio \(\mathbf{x}=Q\mathbf{y}\): \(q=\sum_i\lambda_iy_i^2\). Los términos cruzados desaparecen en la base de autovectores, que son perpendiculares.`,
String.raw`<b>Clasificación.</b> Definida positiva si todos los \(\lambda_i>0\) (\(q>0\) para \(\mathbf{x}\neq\mathbf{0}\)); semidefinida si algún \(\lambda_i=0\); indefinida si hay signos distintos. En el plano, la curva \(q=1\) es una elipse, una hipérbola o un par de rectas.`,
String.raw`<b>Criterio de Sylvester.</b> \(A\) es definida positiva si y solo si todos sus menores principales líderes son positivos. En \(2\times2\): \(a>0\) y \(ac-b^2>0\).`,
String.raw`<b>Cociente de Rayleigh.</b> \(\lambda_{\min}\le\dfrac{\mathbf{x}^{\mathsf T}A\mathbf{x}}{\mathbf{x}^{\mathsf T}\mathbf{x}}\le\lambda_{\max}\). Sobre la esfera unidad, \(q\) alcanza sus extremos en los autovectores: es el resultado de aplicar multiplicadores de Lagrange.`,
String.raw`<b>Puntos críticos.</b> Cerca de un punto crítico, \(f(\mathbf{x}_0+\mathbf{h})\approx f(\mathbf{x}_0)+\tfrac12\mathbf{h}^{\mathsf T}H\mathbf{h}\), con \(H\) la Hessiana. Mínimo si \(H\) es definida positiva, máximo si es definida negativa, silla si es indefinida.`,
String.raw`<b>Energía de rotación.</b> \(T=\tfrac12\boldsymbol\omega^{\mathsf T}I\boldsymbol\omega\), con el tensor de inercia \(I\) simétrico. En los ejes principales: \(T=\tfrac12(I_1\omega_1^2+I_2\omega_2^2+I_3\omega_3^2)\).`,
String.raw`<b>Oscilaciones pequeñas.</b> Con energías \(T=\tfrac12\dot{\mathbf{q}}^{\mathsf T}M\dot{\mathbf{q}}\) y \(V=\tfrac12\mathbf{q}^{\mathsf T}K\mathbf{q}\), las ecuaciones son \(M\ddot{\mathbf{q}}=-K\mathbf{q}\). Las frecuencias normales cumplen \(\det(K-\omega^2M)=0\), y cada modo normal oscila con una sola frecuencia.`],
lab:tabs([['niv','Curvas de nivel y ejes principales',lab2('fq-cv',slider('fq-a','a',-3,3,0.1,2)+slider('fq-b','b',-2,2,0.1,0.8)+slider('fq-c','c',-3,3,0.1,1),'fq-read',String.raw`Curvas \(q(x,y)=k\) para \(k=\pm1,\pm2,\pm3\) (verde \(k>0\), naranja \(k<0\)). Las rectas grises son los ejes principales (autovectores de \(A\)). Sobre la circunferencia unidad, \(q\) es máximo y mínimo justo en esos ejes, con valores \(\lambda_{\max}\) y \(\lambda_{\min}\).`)],
 ['osc','Osciladores acoplados',`<div class="controls" style="margin:0 0 12px">${btn('fq-m1','Modo 1 (en fase)')}${btn('fq-m2','Modo 2 (en oposición)')}${btn('fq-m3','Solo la masa 1 (batidos)')}</div>`+
  lab2('fq-cv2',slider('fq-k','acoplamiento κ/k',0.02,1.5,0.01,0.15),'fq-read2',String.raw`Dos masas iguales unidas a las paredes por resortes \(k\) y entre sí por un resorte \(\kappa\). \(K=\begin{pmatrix}k+\kappa&-\kappa\\-\kappa&k+\kappa\end{pmatrix}\). Sus autovectores \((1,1)\) y \((1,-1)\) son los modos normales. Si solo se desplaza una masa, se excitan los dos modos y la energía pasa de una masa a la otra (batidos).`)]]),
laws:[['Forma cuadrática',String.raw`q(\mathbf{x})=\mathbf{x}^{\mathsf T}A\mathbf{x}=\sum_{i,j}a_{ij}x_ix_j,\quad A=A^{\mathsf T}`,String.raw`En 2D: \(ax^2+2bxy+cy^2\).`],
 ['Ejes principales',String.raw`\mathbf{x}=Q\mathbf{y}\ \Rightarrow\ q=\lambda_1y_1^2+\dots+\lambda_ny_n^2`,'Sin términos cruzados.'],
 ['Sylvester (2×2)',String.raw`A>0\iff a>0\ \ \text{y}\ \ ac-b^2>0`,'En general, todos los menores principales líderes positivos.'],
 ['Rayleigh',String.raw`\lambda_{\min}\le\frac{\mathbf{x}^{\mathsf T}A\mathbf{x}}{\mathbf{x}^{\mathsf T}\mathbf{x}}\le\lambda_{\max}`,'Igualdades en los autovectores correspondientes.'],
 ['Modos normales',String.raw`\det(K-\omega^2M)=0,\qquad(K-\omega^2M)\mathbf{a}=\mathbf{0}`,'Problema de autovalores generalizado.'],
 ['Dos osciladores acoplados',String.raw`\omega_1=\sqrt{\tfrac{k}{m}},\qquad\omega_2=\sqrt{\tfrac{k+2\kappa}{m}}`,String.raw`Modo en fase \((1,1)\) y en oposición \((1,-1)\). Periodo de batido: \(2\pi/(\omega_2-\omega_1)\).`]],
ex:[String.raw`Lleva \(q=5x^2+4xy+2y^2\) a sus ejes principales y clasifícala.`,
 [String.raw`\(A=\begin{pmatrix}5&2\\2&2\end{pmatrix}\): \(p(\lambda)=\lambda^2-7\lambda+6=(\lambda-6)(\lambda-1)\).`,
  String.raw`\(\lambda=6\): \(\begin{pmatrix}-1&2\\2&-4\end{pmatrix}\mathbf{v}=\mathbf{0}\Rightarrow\mathbf{v}_1=\tfrac1{\sqrt5}(2,1)\). \(\lambda=1\): \(\begin{pmatrix}4&2\\2&1\end{pmatrix}\mathbf{v}=\mathbf{0}\Rightarrow\mathbf{v}_2=\tfrac1{\sqrt5}(1,-2)\). Son perpendiculares.`,
  String.raw`Con \(y_1=\tfrac{2x+y}{\sqrt5}\), \(y_2=\tfrac{x-2y}{\sqrt5}\): \(q=6y_1^2+y_2^2\).`,
  String.raw`Ambos autovalores positivos: definida positiva (Sylvester: \(5>0\) y \(10-4=6>0\)). La curva \(q=1\) es una elipse de semiejes \(1/\sqrt6\) (eje \((2,1)\)) y \(1\) (eje \((1,-2)\)).`],
 'Pon a = 5, b = 2, c = 2 en el laboratorio.'],
prev:['al-espectral','Teorema espectral'],next:['algebra-lineal-ejercicios','Ejercicios resueltos'],
ref:'Strang, cap. 7; Thornton &amp; Marion, cap. 11–12; Goldstein, cap. 6'}));

LABS['al-cn']=function(sec){
  const cv=$('#cn-cv',sec),rd=$('#cn-read',sec);let P1=null,P2=null;const gp=sl(sec,'cn-ph',v=>nt(v,0)+'°',()=>draw1());
  const U=[[1,0],[0,1]],W=[[0.8,0.6],[0.6,-0.8]];/* u=(u1,u2), v=(v1,v2) como complejos */
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.6,400,250),hw=w/2-4;P1=cplane(ctx,w,h,1.6,0,hw);P2=cplane(ctx,w,h,1.6,w/2+4,hw);
    ctx.fillStyle='#fff';ctx.fillRect(hw,0,8,h);
    const ph=C.polar(1,gp()*Math.PI/180),u=U.map(z=>C.mul(ph,z)),v=W.map(z=>C.mul(ph,z));
    [[P1,0],[P2,1]].forEach(([P,i])=>{ctx.save();ctx.beginPath();ctx.rect(i?w/2+4:0,0,hw,h);ctx.clip();
      ctx.strokeStyle=K.ax;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(P.cx,P.cy,P.s,0,TAU);ctx.stroke();ctx.setLineDash([]);
      arrow(ctx,P.cx,P.cy,P.X(u[i][0]),P.Y(u[i][1]),K.ink,3);arrow(ctx,P.cx,P.cy,P.X(v[i][0]),P.Y(v[i][1]),K.a,3);
      dot(ctx,P.X(u[i][0]),P.Y(u[i][1]),7,'#fff',K.ink);dot(ctx,P.X(v[i][0]),P.Y(v[i][1]),7,'#fff',K.a);
      label(ctx,'u'+(i?'₂':'₁'),P.X(u[i][0])+10,P.Y(u[i][1])-10,K.ink);label(ctx,'v'+(i?'₂':'₁'),P.X(v[i][0])+10,P.Y(v[i][1])+12,K.a);
      label(ctx,i?'componente 2':'componente 1',(i?w/2+14:10),h-12,K.mut);ctx.restore();});
    const t1=C.mul(C.conj(u[0]),v[0]),t2=C.mul(C.conj(u[1]),v[1]),ip=C.add(t1,t2),nn=a=>Math.sqrt(a.reduce((s,z)=>s+z[0]*z[0]+z[1]*z[1],0)),bad=C.add(C.mul(u[0],v[0]),C.mul(u[1],v[1]));
    rd.innerHTML=row('u',`(${cs(u[0])}, ${cs(u[1])})`)+row('v',`(${cs(v[0])}, ${cs(v[1])})`)+sep+
      row('ū₁v₁',cs(t1,3))+row('ū₂v₂',cs(t2,3))+row('⟨u, v⟩',cs(ip,3))+row('|⟨u, v⟩|',nt(C.abs(ip),3))+row('‖u‖ ‖v‖',nt(nn(u),3)+' · '+nt(nn(v),3))+sep+
      row('Σ uᵢvᵢ (sin conjugar)',cs(bad,3))+rowT(C.abs(ip)<0.02?'<span class="aa-ok">u ⊥ v en ℂ²</span>.':'Gira la fase global: ⟨u, v⟩ no cambia, pero Σ uᵢvᵢ sí. Por eso esa fórmula no sirve como producto interno.');
  }
  const getP=()=>P1;
  drag(cv,(x,y)=>{if(!P1)return null;const ph=C.polar(1,gp()*Math.PI/180);let b=null,bd=16;
      [[U,0],[W,1]].forEach(([A,k])=>[0,1].forEach(i=>{const P=i?P2:P1,z=C.mul(ph,A[i]),d=Math.hypot(P.X(z[0])-x,P.Y(z[1])-y);if(d<bd){bd=d;b=[k,i];}}));return b;},
    (b,x,y)=>{const [k,i]=b,P=i?P2:P1,ph=C.polar(1,-gp()*Math.PI/180),z=[snap(P.ix(x),0.05),snap(P.iy(y),0.05)],r=C.mul(ph,z);(k?W:U)[i]=[Math.max(-1.5,Math.min(1.5,r[0])),Math.max(-1.5,Math.min(1.5,r[1]))];draw1();});
  /* polarización */
  const cv2=$('#cn-cv2',sec),rd2=$('#cn-read2',sec),gr=sl(sec,'cn-ax',v=>nt(v,2),()=>{tr=[];}),gd=sl(sec,'cn-de',v=>nt(v,0)+'°',()=>{tr=[];});let t=0,tr=[];
  [['cn-l',1,0],['cn-r',1,90],['cn-lft',1,-90],['cn-e',0.6,50]].forEach(([id,r,d])=>$('#'+id,sec).onclick=()=>{gr.set(r);gd.set(d);tr=[];});
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.85,420,280),P=plane(ctx,w,h,2.2),r=gr(),d=gd()*Math.PI/180;
    const Ey=C.polar(r,d),E=z=>{const e=C.polar(1,-z);return [C.mul([1,0],e)[0],C.mul(Ey,e)[0]];};
    ctx.save();ctx.strokeStyle='rgba(15,118,110,.35)';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<=200;i++){const q=E(i/200*TAU);i?ctx.lineTo(P.X(q[0]),P.Y(q[1])):ctx.moveTo(P.X(q[0]),P.Y(q[1]));}ctx.stroke();ctx.restore();
    const q=E(t);arrow(ctx,P.cx,P.cy,P.X(q[0]),P.Y(q[1]),K.b,4);label(ctx,'E(t)',P.X(q[0])+8,P.Y(q[1])-10,K.b);
    const n=Math.sqrt(1+r*r),j=[[1/n,0],[Ey[0]/n,Ey[1]/n]],R=[[1/Math.SQRT2,0],[0,1/Math.SQRT2]];
    const ipR=C.add(C.mul(C.conj([R[0][0],R[0][1]]),j[0]),C.mul(C.conj([R[1][0],R[1][1]]),j[1]));
    const sd=Math.sin(d),kind=r<1e-6||Math.abs(sd)<1e-6?'lineal':Math.abs(r-1)<1e-6&&Math.abs(Math.abs(sd)-1)<1e-6?'circular':'elíptica';
    rd2.innerHTML=row('Jones (normalizado)',`(${cs(j[0],3)}, ${cs(j[1],3)})`)+row('polarización',kind+(kind!=='lineal'?(sd>0?' (giro antihorario en este dibujo)':' (giro horario en este dibujo)'):''))+sep+
      row('|⟨(1, i)/√2, E⟩|²',nt(C.abs(ipR)**2,3))+rowT('Es la fracción de intensidad en la polarización circular (1, i)/√2. Vale 1/2 para cualquier polarización lineal.');
  }
  return {draw(){draw1();draw2();},tick(dt){if(!vis(cv2))return;t+=dt*2;draw2();}};
};

LABS['al-espectral']=function(sec){
  const cv=$('#es-cv',sec),rd=$('#es-read',sec);const g={};['a','b','d','s'].forEach(k=>g[k]=sl(sec,'es-'+k,v=>nt(v,2),()=>draw1()));
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.85,470,300),A=[[g.a(),g.b()+g.s()],[g.b()-g.s(),g.d()]],e=eig2(A);
    let m=1.2;for(let i=0;i<24;i++){const t=i/24*TAU;m=Math.max(m,Math.hypot(...mv(A,[Math.cos(t),Math.sin(t)])));}
    const P=plane(ctx,w,h,Math.min(5,m*1.15));
    ctx.save();ctx.strokeStyle=K.ax;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(P.cx,P.cy,P.s,0,TAU);ctx.stroke();ctx.restore();
    ctx.save();ctx.fillStyle='rgba(217,72,15,.12)';ctx.strokeStyle=K.b;ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<=200;i++){const q=mv(A,[Math.cos(i/200*TAU),Math.sin(i/200*TAU)]);i?ctx.lineTo(P.X(q[0]),P.Y(q[1])):ctx.moveTo(P.X(q[0]),P.Y(q[1]));}ctx.fill();ctx.stroke();ctx.restore();
    let ang=null;
    if(!e.cx){[e.v1,e.v2].forEach((v,i)=>{ctx.save();ctx.strokeStyle='rgba(43,138,62,.6)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(P.X(-9*v[0]),P.Y(-9*v[1]));ctx.lineTo(P.X(9*v[0]),P.Y(9*v[1]));ctx.stroke();ctx.restore();
        const q=mv(A,v);arrow(ctx,P.cx,P.cy,P.X(q[0]),P.Y(q[1]),K.r,3);label(ctx,'λ'+(i?'₂':'₁')+'v'+(i?'₂':'₁'),P.X(q[0])+8,P.Y(q[1])-10,K.r);});
      ang=Math.acos(Math.min(1,Math.abs(e.v1[0]*e.v2[0]+e.v1[1]*e.v2[1])))*180/Math.PI;}
    const sym=Math.abs(g.s())<1e-9;
    rd.innerHTML=row('A',mat(A))+row('simétrica',sym?'sí':'no')+sep+
      (e.cx?row('λ',cs([e.re,e.im],3)+', '+cs([e.re,-e.im],3))+rowT('<span class="aa-no">Autovalores complejos: no hay autovectores reales.</span>')
       :row('λ₁, λ₂',nt(e.l1,3)+', '+nt(e.l2,3))+row('ángulo entre autovectores',nt(ang,1)+'°')+(sym?rowT('<span class="aa-ok">Teorema espectral</span>: autovalores reales y autovectores ortogonales; son los ejes de la elipse. A = QDQᵀ.'):rowT('Sin simetría, los autovectores no son perpendiculares y ya no coinciden con los ejes de la elipse.')));
  }
  const cv2=$('#es-cv2',sec),rd2=$('#es-read2',sec),st={yaw:0.6,pitch:0.35,auto:false};const gx=sl(sec,'es-x',v=>nt(v,2),()=>draw2()),gy=sl(sec,'es-y',v=>nt(v,2),()=>draw2()),gz=sl(sec,'es-z',v=>nt(v,2),()=>draw2());
  cam3(cv2,st,()=>draw2());
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.85,470,300),P=P3(st,w,h,1.25);
    const n=[gx(),gy(),gz()],L=v3.norm(n);
    ctx.save();ctx.strokeStyle='rgba(15,118,110,.35)';ctx.lineWidth=1.2;
    for(const pl of [[0,1],[1,2],[0,2]]){ctx.beginPath();for(let i=0;i<=80;i++){const t=i/80*TAU,v=[0,0,0];v[pl[0]]=Math.cos(t);v[pl[1]]=Math.sin(t);const p=P.T(...v);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);}ctx.stroke();}ctx.restore();
    axes3(ctx,P,1.3,['x','y','z']);
    if(L>1e-9){const u=v3.mul(n,1/L);arrow3(ctx,P,[0,0,0],n,K.d,3);const a=P.T(...u),b=P.T(...v3.mul(u,-1));dot(ctx,a[0],a[1],7,K.r);dot(ctx,b[0],b[1],7,K.b);
      label(ctx,'+',a[0]+9,a[1]-9,K.r);label(ctx,'−',b[0]+9,b[1]-9,K.b);}
    const Hm=[[[gz(),0],[gx(),-gy()]],[[gx(),gy()],[-gz(),0]]];
    let v1=null,v2=null;if(L>1e-9){if(Math.abs(L+gz())>1e-9){v1=[[L+gz(),0],[gx(),gy()]];v2=[[-gx(),gy()],[L+gz(),0]];}else{v1=[[0,0],[1,0]];v2=[[1,0],[0,0]];}
      const nm=a=>Math.sqrt(a.reduce((s,z)=>s+z[0]**2+z[1]**2,0));const n1=nm(v1),n2=nm(v2);v1=v1.map(z=>C.sc(z,1/n1));v2=v2.map(z=>C.sc(z,1/n2));}
    const ip=v1?C.add(C.mul(C.conj(v1[0]),v2[0]),C.mul(C.conj(v1[1]),v2[1])):[0,0];
    rd2.innerHTML=row('H',mat(Hm.map(r=>r.map(z=>cs(z,2)))))+row('H = H†','sí')+sep+row('λ₊ = +‖n‖',nt(L,3))+row('λ₋ = −‖n‖',nt(-L,3))+
      (v1?row('v₊',`(${cs(v1[0],3)}, ${cs(v1[1],3)})`)+row('v₋',`(${cs(v2[0],3)}, ${cs(v2[1],3)})`)+row('⟨v₊, v₋⟩',cs(ip,4)):'')+
      sep+rowT('Autovalores reales y autovectores ortogonales, aunque H tenga entradas complejas.');
  }
  return {draw(){draw1();draw2();}};
};

LABS['al-formas-cuadraticas']=function(sec){
  const cv=$('#fq-cv',sec),rd=$('#fq-read',sec);const g={};['a','b','c'].forEach(k=>g[k]=sl(sec,'fq-'+k,v=>nt(v,2),()=>draw1()));
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.85,470,300),P=plane(ctx,w,h,3);
    const A=[[g.a(),g.b()],[g.b(),g.c()]],e=eig2(A),l1=e.l1,l2=e.l2,q1=e.v1,q2=[-e.v1[1],e.v1[0]];
    [q1,q2].forEach(v=>{ctx.save();ctx.strokeStyle='rgba(93,101,119,.5)';ctx.lineWidth=1.5;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(P.X(-9*v[0]),P.Y(-9*v[1]));ctx.lineTo(P.X(9*v[0]),P.Y(9*v[1]));ctx.stroke();ctx.restore();});
    const toX=(y1,y2)=>[y1*q1[0]+y2*q2[0],y1*q1[1]+y2*q2[1]];
    const drawLevel=k=>{const col=k>0?K.t:K.b;ctx.save();ctx.strokeStyle=col;ctx.lineWidth=Math.abs(k)===1?2.5:1.3;
      const seg=(f,a,b)=>{ctx.beginPath();let pen=false;for(let i=0;i<=240;i++){const t=a+(b-a)*i/240,p=f(t);if(!p||!isFinite(p[0])){pen=false;continue;}const x=toX(...p);if(pen)ctx.lineTo(P.X(x[0]),P.Y(x[1]));else{ctx.moveTo(P.X(x[0]),P.Y(x[1]));pen=true;}}ctx.stroke();};
      const s1=k/l1,s2=k/l2;
      if(s1>0&&s2>0)seg(t=>[Math.sqrt(s1)*Math.cos(t),Math.sqrt(s2)*Math.sin(t)],0,TAU);
      else if(s1>0&&s2<0){[1,-1].forEach(sg=>seg(t=>[sg*Math.sqrt(s1)*Math.cosh(t),Math.sqrt(-s2)*Math.sinh(t)],-3,3));}
      else if(s1<0&&s2>0){[1,-1].forEach(sg=>seg(t=>[Math.sqrt(-s1)*Math.sinh(t),sg*Math.sqrt(s2)*Math.cosh(t)],-3,3));}
      else if(Math.abs(l2)<1e-9&&s1>0){[1,-1].forEach(sg=>seg(t=>[sg*Math.sqrt(s1),t],-9,9));}
      else if(Math.abs(l1)<1e-9&&s2>0){[1,-1].forEach(sg=>seg(t=>[t,sg*Math.sqrt(s2)],-9,9));}
      ctx.restore();};
    [1,2,3,-1,-2,-3].forEach(drawLevel);
    ctx.save();ctx.strokeStyle=K.ax;ctx.setLineDash([3,4]);ctx.beginPath();ctx.arc(P.cx,P.cy,P.s,0,TAU);ctx.stroke();ctx.restore();
    dot(ctx,P.X(q1[0]),P.Y(q1[1]),6,K.d);dot(ctx,P.X(-q1[0]),P.Y(-q1[1]),6,K.d);dot(ctx,P.X(q2[0]),P.Y(q2[1]),6,K.a);dot(ctx,P.X(-q2[0]),P.Y(-q2[1]),6,K.a);
    const cls=l1>1e-9&&l2>1e-9?'definida positiva (elipses)':l1<-1e-9&&l2<-1e-9?'definida negativa (elipses con k < 0)':l1*l2<-1e-12?'indefinida (hipérbolas)':'semidefinida (rectas paralelas)';
    rd.innerHTML=row('q',`${nt(g.a(),2)}x² ${g.b()<0?'−':'+'} ${nt(Math.abs(2*g.b()),2)}xy ${g.c()<0?'−':'+'} ${nt(Math.abs(g.c()),2)}y²`)+row('A',mat(A))+sep+
      row('λ₁ (máx)',nt(l1,3))+row('λ₂ (mín)',nt(l2,3))+row('ejes principales',vs(q1)+', '+vs(q2))+row('ac − b²',nt(g.a()*g.c()-g.b()**2,3))+sep+
      rowT(`q = ${nt(l1,2)}·y₁² ${l2<0?'−':'+'} ${nt(Math.abs(l2),2)}·y₂²`)+rowT('<b>'+cls+'</b>');
  }
  const cv2=$('#fq-cv2',sec),rd2=$('#fq-read2',sec),gk=sl(sec,'fq-k',v=>nt(v,2),()=>{hist=[];});let X=[1,1],Vv=[0,0],t=0,hist=[];
  const setIC=(a,b)=>{X=[a,b];Vv=[0,0];t=0;hist=[];};
  $('#fq-m1',sec).onclick=()=>setIC(1,1);$('#fq-m2',sec).onclick=()=>setIC(1,-1);$('#fq-m3',sec).onclick=()=>setIC(1.2,0);
  setIC(1.2,0);
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.75,440,280),k=1,kp=gk(),top=60,yb=40;
    const L=w-40,x0=20,eq=[x0+L/3,x0+2*L/3],sc=L/12,px=[eq[0]+X[0]*sc,eq[1]+X[1]*sc];
    const spring=(a,b,col)=>{ctx.save();ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a,yb);const n=12;for(let i=1;i<n;i++){ctx.lineTo(a+(b-a)*i/n,yb+(i%2?-8:8));}ctx.lineTo(b,yb);ctx.stroke();ctx.restore();};
    ctx.fillStyle=K.ink;ctx.fillRect(x0-6,yb-22,6,44);ctx.fillRect(x0+L,yb-22,6,44);
    spring(x0,px[0]-16,K.mut);spring(px[0]+16,px[1]-16,K.t);spring(px[1]+16,x0+L,K.mut);
    [K.b,K.a].forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(px[i]-16,yb-16,32,32);});
    const A=axes(ctx,{l:36,t:top+14,w:w-50,h:h-top-40,xr:[Math.max(0,t-30),Math.max(30,t)],yr:[-1.6,1.6],xl:'t',xf:v=>nt(v,0)});
    [0,1].forEach(i=>{ctx.save();ctx.strokeStyle=i?K.a:K.b;ctx.lineWidth=2;ctx.beginPath();hist.forEach((p,j)=>{const xx=A.X(p[0]),yy=A.Y(p[1+i]);j?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);});ctx.stroke();ctx.restore();});
    const w1=Math.sqrt(k),w2=Math.sqrt(k+2*kp);
    rd2.innerHTML=row('K',mat([[1+kp,-kp],[-kp,1+kp]].map(r=>r.map(v=>nt(v,2)))))+row('ω₁ (en fase)',nt(w1,3))+row('ω₂ (en oposición)',nt(w2,3))+sep+
      row('periodo de batido 2π/(ω₂ − ω₁)',nt(TAU/(w2-w1),2))+rowT('Masa 1 naranja, masa 2 azul (k = m = 1).');
  }
  return {draw(){draw1();draw2();},tick(dt){if(!vis(cv2))return;const kp=gk(),acc=x=>[-(1+kp)*x[0]+kp*x[1],kp*x[0]-(1+kp)*x[1]];
    const n=8,hh=Math.min(dt,0.05)*2.5/n;for(let s=0;s<n;s++){const a=acc(X);Vv=[Vv[0]+a[0]*hh,Vv[1]+a[1]*hh];X=[X[0]+Vv[0]*hh,X[1]+Vv[1]*hh];t+=hh;}
    hist.push([t,X[0],X[1]]);while(hist.length&&hist[0][0]<t-30)hist.shift();draw2();}};
};

/* ================= VC · UNIDAD I · NÚMEROS COMPLEJOS ================= */
const W1='Unidad I · Números complejos';
V.push(topicPage({id:'vc-complejos',pre:'cx',course:VC,unit:W1,title:'El cuerpo ℂ como álgebra lineal',
lead:String.raw`\(\mathbb{C}\) es el plano \(\mathbb{R}^2\) con una multiplicación extra. Esa multiplicación no es arbitraria: multiplicar por \(z\) es aplicar la matriz \(aI+bJ\), que rota un ángulo \(\arg z\) y escala por \(|z|\). Es el puente entre el curso de Álgebra lineal y todo lo que sigue.`,
res:[String.raw`<b>Definición.</b> \(\mathbb{C}=\{a+bi:\ a,b\in\mathbb{R}\}\) con \(i^2=-1\). Suma por componentes y producto \((a+bi)(c+di)=(ac-bd)+(ad+bc)i\). Es un cuerpo: todo \(z\neq0\) tiene inverso \(1/z=\bar z/|z|^2\).`,
String.raw`<b>Plano de Argand.</b> \(z=a+bi\leftrightarrow(a,b)\), con \(\operatorname{Re}z=a\) e \(\operatorname{Im}z=b\). El conjugado \(\bar z=a-bi\) es la reflexión en el eje real, el módulo \(|z|=\sqrt{a^2+b^2}\) es la distancia al origen, y \(|z|^2=z\bar z\).`,
String.raw`<b>Representación matricial.</b> \(z=a+bi\ \leftrightarrow\ M_z=\begin{pmatrix}a&-b\\b&a\end{pmatrix}=aI+bJ\), con \(J=\begin{pmatrix}0&-1\\1&0\end{pmatrix}\) y \(J^2=-I\). Se cumple \(M_{z+w}=M_z+M_w\), \(M_{zw}=M_zM_w\), \(M_{\bar z}=M_z^{\mathsf T}\) y \(\det M_z=|z|^2\): \(\mathbb{C}\) es un cuerpo conmutativo de matrices \(2\times2\).`,
String.raw`<b>Multiplicar es rotar y escalar.</b> \(M_z=|z|\,R_{\arg z}\). Multiplicar por \(i\) gira \(90^\circ\); por \(e^{i\theta}\), un ángulo \(\theta\); por un real positivo, solo escala.`,
String.raw`<b>Lineal sobre \(\mathbb{C}\) frente a lineal sobre \(\mathbb{R}\).</b> Una transformación \(\mathbb{R}\)-lineal \(T:\mathbb{R}^2\to\mathbb{R}^2\) es multiplicación por un complejo si y solo si conmuta con \(J\), es decir, si su matriz es de la forma \(aI+bJ\). Esta condición, aplicada al jacobiano, será la de Cauchy-Riemann.`,
String.raw`<b>Propiedades del módulo.</b> \(|zw|=|z||w|\), \(|z/w|=|z|/|w|\), \(|z+w|\le|z|+|w|\) y \(\big||z|-|w|\big|\le|z-w|\). Además \(|\operatorname{Re}z|\le|z|\) y \(|\operatorname{Im}z|\le|z|\).`,
String.raw`<b>Sin orden.</b> \(\mathbb{C}\) no admite un orden compatible con las operaciones: si \(i>0\) o \(i<0\), en ambos casos \(i^2=-1>0\), absurdo. Solo se comparan módulos o partes reales.`,
String.raw`<b>En física.</b> Los fasores de corriente alterna (\(V=V_0e^{i\omega t}\)) y las impedancias \(Z=R+i\omega L+\tfrac{1}{i\omega C}\) usan exactamente esta aritmética: multiplicar por \(Z\) escala la amplitud y desfasa.`],
lab:tabs([['op','Operaciones en el plano',`<div class="controls" style="margin:0 0 12px">${seg('cx-op','o',[['s','z + w'],['p','z · w'],['q','z / w'],['c','z̄ y 1/z']])}</div>`+
  lab2('cx-cv','','cx-read',String.raw`Arrastra \(z\) (naranja) y \(w\) (azul). En la suma se ve la regla del paralelogramo. En el producto, los ángulos se suman (arcos) y los módulos se multiplican. En el cociente, los ángulos se restan y los módulos se dividen. La circunferencia punteada es \(|z|=1\).`)],
 ['mat','Multiplicar por z = matriz aI + bJ',lab2('cx-cv2','','cx-read2',String.raw`Arrastra \(z\). La letra F se transforma con \(M_z=aI+bJ\): siempre gira y escala, sin deformarse ni reflejarse. Compara con el laboratorio de matrices de Álgebra lineal, donde una matriz cualquiera también puede cizallar o reflejar.`)]]),
laws:[['Producto',String.raw`(a+bi)(c+di)=(ac-bd)+(ad+bc)\,i`,String.raw`Se obtiene distribuyendo y usando \(i^2=-1\).`],
 ['Conjugado e inverso',String.raw`z\bar z=|z|^2,\qquad\frac1z=\frac{\bar z}{|z|^2}`,'Para dividir, se multiplica arriba y abajo por el conjugado del denominador.'],
 ['Representación matricial',String.raw`z=a+bi\ \longleftrightarrow\ aI+bJ=\begin{pmatrix}a&-b\\b&a\end{pmatrix}`,String.raw`\(J^2=-I\) hace el papel de \(i^2=-1\).`],
 ['Rotar y escalar',String.raw`M_z=|z|\begin{pmatrix}\cos\theta&-\sin\theta\\\sin\theta&\cos\theta\end{pmatrix},\qquad\theta=\arg z`,String.raw`\(\det M_z=|z|^2\ge0\): nunca invierte la orientación.`],
 ['Módulo',String.raw`|zw|=|z|\,|w|,\qquad|z+w|\le|z|+|w|`,'Multiplicativo y con desigualdad triangular.'],
 ['Conjugado',String.raw`\overline{z+w}=\bar z+\bar w,\quad\overline{zw}=\bar z\,\bar w,\quad\operatorname{Re}z=\tfrac{z+\bar z}{2},\ \operatorname{Im}z=\tfrac{z-\bar z}{2i}`,'El conjugado respeta suma y producto.']],
ex:[String.raw`Con \(z=3+4i\) y \(w=1-2i\), calcula \(zw\), \(z/w\) y comprueba \(|zw|=|z||w|\) y \(M_{zw}=M_zM_w\).`,
 [String.raw`\(zw=3-6i+4i-8i^2=11-2i\).`,
  String.raw`\(\dfrac zw=\dfrac{(3+4i)(1+2i)}{(1-2i)(1+2i)}=\dfrac{3+6i+4i+8i^2}{5}=\dfrac{-5+10i}{5}=-1+2i\).`,
  String.raw`\(|z|=5\), \(|w|=\sqrt5\), \(|zw|=\sqrt{121+4}=\sqrt{125}=5\sqrt5\). ✓`,
  String.raw`\(M_zM_w=\begin{pmatrix}3&-4\\4&3\end{pmatrix}\begin{pmatrix}1&2\\-2&1\end{pmatrix}=\begin{pmatrix}11&2\\-2&11\end{pmatrix}=M_{11-2i}\). ✓`]],
prev:['variable-compleja','Variable compleja'],next:['vc-polar','Forma polar, Euler y De Moivre'],
ref:'Churchill &amp; Brown, <i>Variable compleja y aplicaciones</i>, cap. 1; Needham, <i>Visual Complex Analysis</i>, cap. 1'}));

V.push(topicPage({id:'vc-polar',pre:'po',course:VC,unit:W1,title:'Forma polar, Euler y De Moivre',
lead:String.raw`En forma polar el producto se vuelve trivial: los módulos se multiplican y los ángulos se suman. La fórmula de Euler \(e^{i\theta}=\cos\theta+i\sin\theta\) convierte esa regla en la ley de los exponentes, y de ahí salen las potencias, las raíces y casi toda la trigonometría.`,
res:[String.raw`<b>Forma polar.</b> \(z=r(\cos\theta+i\sin\theta)\), con \(r=|z|\) y \(\theta=\arg z\). El argumento es multivaluado (\(\theta+2\pi k\)); el argumento principal \(\operatorname{Arg}z\) se toma en \((-\pi,\pi]\).`,
String.raw`<b>Fórmula de Euler.</b> \(e^{i\theta}=\cos\theta+i\sin\theta\). Separando la serie \(e^{i\theta}=\sum(i\theta)^n/n!\) en términos pares e impares aparecen exactamente las series del coseno y del seno. Así, \(z=re^{i\theta}\), y en particular \(e^{i\pi}+1=0\).`,
String.raw`<b>Producto y cociente.</b> \(r_1e^{i\theta_1}\cdot r_2e^{i\theta_2}=r_1r_2\,e^{i(\theta_1+\theta_2)}\) y \(\dfrac{r_1e^{i\theta_1}}{r_2e^{i\theta_2}}=\dfrac{r_1}{r_2}e^{i(\theta_1-\theta_2)}\).`,
String.raw`<b>De Moivre.</b> \((\cos\theta+i\sin\theta)^n=\cos n\theta+i\sin n\theta\). Desarrollando el lado izquierdo se obtienen identidades como \(\cos3\theta=4\cos^3\theta-3\cos\theta\) y \(\sin3\theta=3\sin\theta-4\sin^3\theta\).`,
String.raw`<b>Raíces \(n\)-ésimas.</b> Si \(z=re^{i\theta}\neq0\), la ecuación \(w^n=z\) tiene exactamente \(n\) soluciones, \(w_k=r^{1/n}e^{i(\theta+2\pi k)/n}\) con \(k=0,\dots,n-1\): los vértices de un polígono regular de radio \(r^{1/n}\).`,
String.raw`<b>Raíces de la unidad.</b> \(\omega=e^{2\pi i/n}\) y sus potencias \(1,\omega,\dots,\omega^{n-1}\). Para \(n>1\) suman cero: \(1+\omega+\dots+\omega^{n-1}=\dfrac{\omega^n-1}{\omega-1}=0\).`,
String.raw`<b>Seno y coseno con exponenciales.</b> \(\cos\theta=\dfrac{e^{i\theta}+e^{-i\theta}}{2}\), \(\sin\theta=\dfrac{e^{i\theta}-e^{-i\theta}}{2i}\). Integrar o multiplicar senos y cosenos se reduce a operar con exponenciales.`,
String.raw`<b>Versión matricial y física.</b> \(e^{\theta J}=\cos\theta\,I+\sin\theta\,J=R_\theta\), la misma fórmula con matrices. En física, la superposición de ondas de igual frecuencia es una suma de fasores: \(A_1e^{i\varphi_1}+A_2e^{i\varphi_2}\).`],
lab:tabs([['rz','Raíces n-ésimas',lab2('po-cv',slider('po-n','n',2,12,1,5),'po-read',String.raw`Arrastra \(z\) (negro). Las \(n\) raíces de \(w^n=z\) forman un polígono regular de radio \(|z|^{1/n}\). La raíz principal (naranja) tiene argumento \(\operatorname{Arg}z/n\), y las demás se obtienen girando \(2\pi/n\) cada vez.`)],
 ['pw','Potencias zᵏ (De Moivre)',lab2('po-cv2',slider('po-k','potencia máxima N',1,24,1,12),'po-read2',String.raw`Arrastra \(z\). Los puntos \(z,z^2,\dots,z^N\) forman una espiral: cada potencia gira el ángulo \(\arg z\) y multiplica el módulo por \(|z|\). Si \(|z|=1\) los puntos quedan sobre la circunferencia; si \(|z|<1\), la espiral cae hacia el origen.`)]]),
laws:[['Fórmula de Euler',String.raw`e^{i\theta}=\cos\theta+i\sin\theta`,String.raw`Con \(\theta=\pi\): \(e^{i\pi}=-1\).`],
 ['Forma polar',String.raw`z=re^{i\theta},\qquad r=|z|,\ \ \theta=\arg z`,'El argumento está definido salvo múltiplos de 2π.'],
 ['Producto en forma polar',String.raw`r_1e^{i\theta_1}\,r_2e^{i\theta_2}=r_1r_2\,e^{i(\theta_1+\theta_2)}`,'Se multiplican los módulos y se suman los argumentos.'],
 ['De Moivre',String.raw`\big(re^{i\theta}\big)^n=r^ne^{in\theta}`,String.raw`Equivale a \((\cos\theta+i\sin\theta)^n=\cos n\theta+i\sin n\theta\).`],
 ['Raíces n-ésimas',String.raw`w_k=r^{1/n}\exp\!\Big(i\,\frac{\theta+2\pi k}{n}\Big),\quad k=0,\dots,n-1`,'n raíces distintas para todo z ≠ 0.'],
 ['Raíces de la unidad',String.raw`\sum_{k=0}^{n-1}e^{2\pi ik/n}=0\quad(n>1)`,'Su centro de masa es el origen.']],
ex:[String.raw`Halla las raíces cúbicas de \(-8\).`,
 [String.raw`Forma polar: \(-8=8e^{i\pi}\).`,
  String.raw`\(w_k=8^{1/3}e^{i(\pi+2\pi k)/3}=2e^{i(\pi+2\pi k)/3}\), con \(k=0,1,2\).`,
  String.raw`\(w_0=2e^{i\pi/3}=1+i\sqrt3\), \(w_1=2e^{i\pi}=-2\), \(w_2=2e^{i5\pi/3}=1-i\sqrt3\).`,
  String.raw`Comprobación: \((1+i\sqrt3)^2=1+2i\sqrt3-3=-2+2i\sqrt3\); por \((1+i\sqrt3)\): \(-2-2i\sqrt3+2i\sqrt3+2\cdot3i^2=-2-6=-8\). ✓`],
 'En el laboratorio: n = 3 y z = −8 (aleja la vista con el punto en −8).'],
prev:['vc-complejos','ℂ como álgebra lineal'],next:['vc-topologia','Topología y esfera de Riemann'],
ref:'Churchill &amp; Brown, cap. 1; Needham, cap. 1–2'}));

V.push(topicPage({id:'vc-topologia',pre:'tp',course:VC,unit:W1,title:'Topología del plano y esfera de Riemann',
lead:String.raw`Los teoremas de variable compleja exigen dominios con ciertas propiedades: abiertos, conexos y, a veces, sin agujeros. Además conviene añadir un punto en el infinito; la proyección estereográfica muestra que \(\mathbb{C}\cup\{\infty\}\) es una esfera.`,
res:[String.raw`<b>Distancia y discos.</b> \(|z-w|\) es la distancia euclídea de \(\mathbb{R}^2\). El disco abierto \(D(z_0,r)=\{|z-z_0|\lt r\}\) es el entorno básico.`,
String.raw`<b>Abiertos, cerrados y frontera.</b> \(S\) es abierto si cada punto de \(S\) tiene un disco contenido en \(S\). Un punto es de frontera si todo disco a su alrededor corta a \(S\) y a su complemento. \(S\) es cerrado si contiene su frontera. \(|z|<1\) es abierto, \(|z|\le1\) es cerrado y \(0<|z|\le1\) no es ninguna de las dos cosas.`,
String.raw`<b>Conexo y dominio.</b> Un abierto es conexo si dos puntos cualesquiera se unen con una poligonal dentro de él. Un <i>dominio</i> es un abierto conexo: el lugar natural para las funciones analíticas.`,
String.raw`<b>Simplemente conexo.</b> Un dominio sin agujeros: toda curva cerrada puede contraerse a un punto sin salir de él. El disco y el semiplano lo son; el anillo \(1<|z|<2\) y el disco perforado no. Esta propiedad es la hipótesis clave del teorema de Cauchy.`,
String.raw`<b>Acotado y compacto.</b> \(S\) es acotado si está dentro de algún disco. Cerrado y acotado equivale a compacto; en un compacto, toda función continua alcanza su máximo de \(|f|\).`,
String.raw`<b>El punto en el infinito.</b> \(\hat{\mathbb{C}}=\mathbb{C}\cup\{\infty\}\). Los entornos de \(\infty\) son los exteriores \(|z|>R\). Decir \(f(z)\to\infty\) significa \(|f(z)|\to\infty\), sin importar la dirección.`,
String.raw`<b>Proyección estereográfica.</b> Con la esfera unidad y el polo norte \(N=(0,0,1)\): \(z=x+iy\mapsto\dfrac{(2x,\,2y,\,|z|^2-1)}{|z|^2+1}\). El disco unidad va al hemisferio sur, \(|z|=1\) al ecuador y \(\infty\) a \(N\). Las circunferencias y las rectas del plano van a circunferencias de la esfera; las rectas son las que pasan por \(N\).`,
String.raw`<b>Inversión.</b> En la esfera, \(z\mapsto1/z\) es una rotación de \(180^\circ\) alrededor del eje real: intercambia \(0\) e \(\infty\). Por eso conviene tratar \(\infty\) como un punto más.`],
lab:tabs([['es','Esfera de Riemann',`<div class="controls" style="margin:0 0 12px">${sel('tp-c',[['p','Un punto z'],['c','Circunferencia |z| = R'],['r','Recta vertical Re z = a'],['o','Recta por el origen']])}${btn('tp-rot','Girar automáticamente')}</div>`+
  lab2('tp-cv',slider('tp-a','parámetro',-3,3,0.05,1.2)+slider('tp-b','Im z (punto)',-3,3,0.05,0.8),'tp-read',String.raw`Arrastra para girar. El rayo discontinuo une el polo norte \(N\) con \(z\) en el plano: corta la esfera en la imagen de \(z\). Las circunferencias centradas en el origen van a paralelos; las rectas, a circunferencias que pasan por \(N\), porque se van al infinito.`)],
 ['to','Abiertos, cerrados y conexos',`<div class="controls" style="margin:0 0 12px">${sel('tp-s',[['do','Disco abierto |z| < 1'],['dc','Disco cerrado |z| ≤ 1'],['an','Anillo 1 < |z| < 2'],['sp','Semiplano Re z > 0'],['dp','Disco perforado 0 < |z| < 1,5'],['dd','Dos discos disjuntos']])}</div>`+
  lab2('tp-cv2',slider('tp-e','radio ε del disco de prueba',0.05,0.8,0.01,0.25),'tp-read2',String.raw`Arrastra el punto de prueba. Si el disco de radio \(\varepsilon\) cabe dentro de \(S\), el punto es interior; si corta a \(S\) y a su complemento para cualquier \(\varepsilon\), es de frontera. La línea continua es frontera incluida; la discontinua, frontera excluida.`)]]),
laws:[['Disco abierto',String.raw`D(z_0,r)=\{z\in\mathbb{C}:\ |z-z_0|\lt r\}`,'El entorno básico de un punto.'],
 ['Abierto',String.raw`S\ \text{abierto}\iff\forall z\in S\ \exists r>0:\ D(z,r)\subseteq S`,'Ningún punto de un abierto está en su frontera.'],
 ['Dominio',String.raw`D\ \text{dominio}\iff D\ \text{abierto y conexo}`,'Donde se definen las funciones analíticas.'],
 ['Proyección estereográfica',String.raw`z\mapsto\left(\frac{2\operatorname{Re}z}{|z|^2+1},\ \frac{2\operatorname{Im}z}{|z|^2+1},\ \frac{|z|^2-1}{|z|^2+1}\right)`,'Biyección de ℂ en la esfera menos el polo norte.'],
 ['Inversa',String.raw`(X,Y,Z)\mapsto z=\frac{X+iY}{1-Z}`,String.raw`El polo norte \(Z=1\) corresponde a \(z=\infty\).`],
 ['Entornos de ∞',String.raw`\lim_{z\to\infty}f(z)=L\iff\lim_{w\to0}f(1/w)=L`,'El cambio w = 1/z lleva ∞ al origen.']],
ex:[String.raw`Halla la imagen en la esfera de \(z=i\) y de \(z=1+i\), y verifica la fórmula inversa.`,
 [String.raw`\(z=i\): \(|z|^2=1\), así que \((X,Y,Z)=\tfrac{(0,2,0)}{2}=(0,1,0)\), sobre el ecuador.`,
  String.raw`\(z=1+i\): \(|z|^2=2\), así que \((X,Y,Z)=\tfrac{(2,2,1)}{3}\), en el hemisferio norte porque \(|z|>1\).`,
  String.raw`Comprobación: \(X^2+Y^2+Z^2=\tfrac{4+4+1}{9}=1\), está en la esfera. ✓`,
  String.raw`Inversa: \(\dfrac{X+iY}{1-Z}=\dfrac{2/3+2i/3}{2/3}=1+i\). ✓`]],
prev:['vc-polar','Forma polar, Euler y De Moivre'],next:['vc-funciones','Funciones de variable compleja'],
ref:'Churchill &amp; Brown, cap. 1–2; Needham, cap. 3; Ahlfors, <i>Complex Analysis</i>, cap. 1'}));

/* ---------- laboratorios ---------- */
function arc(ctx,P,r,a0,a1,col,lw=2){ctx.save();ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();const n=40;for(let i=0;i<=n;i++){const t=a0+(a1-a0)*i/n;const x=P.X(r*Math.cos(t)),y=P.Y(r*Math.sin(t));i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();ctx.restore();}
const unitC=(ctx,P,r=1)=>{ctx.save();ctx.strokeStyle=K.ax;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(P.cx,P.cy,P.s*r,0,TAU);ctx.stroke();ctx.restore();};
LABS['vc-complejos']=function(sec){
  const cv=$('#cx-cv',sec),rd=$('#cx-read',sec);let P=null;const H=[[1.5,1],[0.5,-1.2]];const go=segm(sec,'cx-op','o',()=>draw1());
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.85,470,300);P=cplane(ctx,w,h,3.2);unitC(ctx,P);
    const [z,wv]=H,o=go(),O=[P.cx,P.cy];let res,lab='';
    if(o==='s'){res=C.add(z,wv);lab='z + w';ctx.save();ctx.setLineDash([5,4]);ctx.strokeStyle=K.ax;ctx.beginPath();ctx.moveTo(P.X(z[0]),P.Y(z[1]));ctx.lineTo(P.X(res[0]),P.Y(res[1]));ctx.lineTo(P.X(wv[0]),P.Y(wv[1]));ctx.stroke();ctx.restore();}
    else if(o==='p'){res=C.mul(z,wv);lab='z · w';const a=C.arg(z),b=C.arg(wv);arc(ctx,P,0.45,0,a,K.b);arc(ctx,P,0.6,0,b,K.a);arc(ctx,P,0.75,0,a+b,K.d,2.5);}
    else if(o==='q'){res=C.div(z,wv);lab='z / w';const a=C.arg(z),b=C.arg(wv);arc(ctx,P,0.45,0,a,K.b);arc(ctx,P,0.6,0,b,K.a);arc(ctx,P,0.75,0,a-b,K.d,2.5);}
    else{res=C.conj(z);const inv=C.div([1,0],z);arrow(ctx,O[0],O[1],P.X(inv[0]),P.Y(inv[1]),K.r,3);label(ctx,'1/z',P.X(inv[0])+8,P.Y(inv[1])+12,K.r);lab='z̄';
      ctx.save();ctx.setLineDash([3,4]);ctx.strokeStyle=K.ax;ctx.beginPath();ctx.moveTo(P.X(z[0]),P.Y(z[1]));ctx.lineTo(P.X(res[0]),P.Y(res[1]));ctx.stroke();ctx.restore();}
    arrow(ctx,O[0],O[1],P.X(res[0]),P.Y(res[1]),K.d,3.5);label(ctx,lab,P.X(res[0])+8,P.Y(res[1])-12,K.d);
    arrow(ctx,O[0],O[1],P.X(z[0]),P.Y(z[1]),K.b,3.5);if(o!=='c')arrow(ctx,O[0],O[1],P.X(wv[0]),P.Y(wv[1]),K.a,3.5);
    handle(ctx,P,z,K.b);if(o!=='c')handle(ctx,P,wv,K.a);label(ctx,'z',P.X(z[0])+10,P.Y(z[1])-10,K.b);if(o!=='c')label(ctx,'w',P.X(wv[0])+10,P.Y(wv[1])+12,K.a);
    const M=q=>[[q[0],-q[1]],[q[1],q[0]]];
    rd.innerHTML=row('z',cs(z))+row('w',cs(wv))+row(lab,cs(res,3))+sep+
      row('|z|, arg z',nt(C.abs(z),3)+', '+deg(C.arg(z)))+row('|w|, arg w',nt(C.abs(wv),3)+', '+deg(C.arg(wv)))+row('|'+lab+'|, arg',nt(C.abs(res),3)+', '+deg(C.arg(res)))+sep+
      (o==='p'?row('M<sub>z</sub>M<sub>w</sub>',mat(mm(M(z),M(wv)).map(r=>r.map(v=>nt(v,2)))))+rowT('Igual a M<sub>zw</sub>: el producto de complejos es el producto de sus matrices.'):
       o==='c'?row('1/z = z̄/|z|²',cs(C.div([1,0],z),3))+rowT('z̄ es la reflexión de z en el eje real; 1/z tiene argumento −arg z y módulo 1/|z|.'):
       o==='s'?rowT('La suma es la de vectores de ℝ²: regla del paralelogramo.'):rowT('arg(z/w) = arg z − arg w y |z/w| = |z|/|w|.'));
  }
  dragPts(cv,()=>P,H,draw1,{R:3,snap:0.1});
  const cv2=$('#cx-cv2',sec),rd2=$('#cx-read2',sec);let P2=null;const Z=[[1.2,0.7]];
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.85,470,300);P2=cplane(ctx,w,h,3.4);
    const z=Z[0],M=[[z[0],-z[1]],[z[1],z[0]]];tgrid(ctx,P2,M,10,'rgba(15,118,110,.22)');figure(ctx,P2,M,'o');unitC(ctx,P2);
    arrow(ctx,P2.cx,P2.cy,P2.X(z[0]),P2.Y(z[1]),K.ink,3);handle(ctx,P2,z,K.ink);label(ctx,'z',P2.X(z[0])+10,P2.Y(z[1])-10,K.ink);
    rd2.innerHTML=row('z',cs(z))+row('M<sub>z</sub> = aI + bJ',mat(M))+sep+row('|z|',nt(C.abs(z),3))+row('arg z',deg(C.arg(z)))+row('det M<sub>z</sub> = |z|²',nt(C.abs(z)**2,3))+
      rowT('M<sub>z</sub> = |z|·R<sub>arg z</sub>: una rotación compuesta con una homotecia. Nunca cizalla ni refleja.');
  }
  dragPts(cv2,()=>P2,Z,draw2,{R:2.2,snap:0.05});
  return {draw(){draw1();draw2();}};
};

LABS['vc-polar']=function(sec){
  const cv=$('#po-cv',sec),rd=$('#po-read',sec);let P=null;const Z=[[-2,1.5]];const gn=sl(sec,'po-n',v=>v,()=>draw1());
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.85,470,300),z=Z[0],n=gn(),r=C.abs(z),t=C.arg(z),R=Math.max(2.4,r*1.15,Math.pow(r,1/n)*1.3);
    P=cplane(ctx,w,h,R);unitC(ctx,P);const rr=Math.pow(r,1/n);unitC(ctx,P,rr);
    const roots=[...Array(n).keys()].map(k=>C.polar(rr,(t+TAU*k)/n));
    ctx.save();ctx.strokeStyle=K.t;ctx.lineWidth=2;ctx.fillStyle='rgba(15,118,110,.12)';ctx.beginPath();roots.forEach((q,i)=>i?ctx.lineTo(P.X(q[0]),P.Y(q[1])):ctx.moveTo(P.X(q[0]),P.Y(q[1])));ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
    roots.forEach((q,k)=>{dot(ctx,P.X(q[0]),P.Y(q[1]),6,k?K.t:K.b);label(ctx,'w'+String(k).split('').map(c=>'₀₁₂₃₄₅₆₇₈₉'[c]).join(''),P.X(q[0])+9,P.Y(q[1])-9,k?K.t:K.b);});
    arrow(ctx,P.cx,P.cy,P.X(z[0]),P.Y(z[1]),K.ink,3);handle(ctx,P,z,K.ink);label(ctx,'z',P.X(z[0])+10,P.Y(z[1])-10,K.ink);
    let sum=[0,0];roots.forEach(q=>sum=C.add(sum,q));
    rd.innerHTML=row('z',cs(z,2)+' = '+nt(r,3)+'·e^{i'+nt(t,3)+'}')+row('n',n)+row('|wₖ| = |z|^{1/n}',nt(rr,4))+row('ángulo entre raíces','2π/'+n+' = '+nt(360/n,1)+'°')+sep+
      roots.slice(0,6).map((q,k)=>row('w'+k,cs(q,3))).join('')+(n>6?rowT('…'):'')+sep+row('Σ wₖ',cs(sum,4))+rowT('Las raíces suman 0: son los vértices de un polígono regular centrado en el origen.');
  }
  dragPts(cv,()=>P,Z,draw1,{R:9,snap:0.1});
  const cv2=$('#po-cv2',sec),rd2=$('#po-read2',sec);let P2=null;const Z2=[[0.95,0.35]];const gk=sl(sec,'po-k',v=>v,()=>draw2());
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.85,470,300),z=Z2[0],N=gk();P2=cplane(ctx,w,h,2.4);unitC(ctx,P2);
    const pts=[[1,0]];for(let k=1;k<=N;k++)pts.push(C.mul(pts[k-1],z));
    ctx.save();ctx.strokeStyle='rgba(217,72,15,.5)';ctx.lineWidth=1.5;ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(P2.X(q[0]),P2.Y(q[1])):ctx.moveTo(P2.X(q[0]),P2.Y(q[1])));ctx.stroke();ctx.restore();
    pts.forEach((q,k)=>{if(Math.abs(q[0])<20&&Math.abs(q[1])<20){dot(ctx,P2.X(q[0]),P2.Y(q[1]),k?4.5:4,k?K.b:K.mut);if(k<=6&&k>0)label(ctx,'z'+['','','²','³','⁴','⁵','⁶'][k],P2.X(q[0])+8,P2.Y(q[1])-8,K.b,'left','middle','600 11px Inter');}});
    handle(ctx,P2,z,K.ink);label(ctx,'z',P2.X(z[0])+10,P2.Y(z[1])-12,K.ink);
    const r=C.abs(z),t=C.arg(z),zN=pts[N];
    rd2.innerHTML=row('z',cs(z,3))+row('|z|, arg z',nt(r,4)+', '+deg(t))+sep+row('z^N (directo)',cs(zN,3))+row('|z|^N',nt(Math.pow(r,N),4))+row('N·arg z',nt(N*t*180/Math.PI,1)+'°')+
      row('De Moivre',cs(C.polar(Math.pow(r,N),N*t),3))+rowT(Math.abs(r-1)<0.02?'|z| ≈ 1: las potencias recorren la circunferencia unidad.':r<1?'|z| < 1: espiral hacia el origen.':'|z| > 1: espiral hacia afuera.');
  }
  dragPts(cv2,()=>P2,Z2,draw2,{R:2.2,snap:0.01});
  return {draw(){draw1();draw2();}};
};

LABS['vc-topologia']=function(sec){
  const cv=$('#tp-cv',sec),rd=$('#tp-read',sec),sc=$('#tp-c',sec),st={yaw:0.9,pitch:0.32,auto:true};
  const ga=sl(sec,'tp-a',v=>nf(v,2),()=>draw1()),gb=sl(sec,'tp-b',v=>nf(v,2),()=>draw1());sc.onchange=()=>draw1();
  $('#tp-rot',sec).onclick=()=>{st.auto=!st.auto;};cam3(cv,st,()=>draw1());
  const S=z=>{const m=z[0]*z[0]+z[1]*z[1];return [2*z[0]/(m+1),2*z[1]/(m+1),(m-1)/(m+1)];};
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.85,470,300),P=P3(st,w,h,1.6);
    const L=3.2;face3(ctx,P,[[-L,-L,0],[L,-L,0],[L,L,0],[-L,L,0]],'rgba(220,240,235,.55)','rgba(15,118,110,.25)');
    ctx.save();ctx.strokeStyle='rgba(28,34,48,.18)';ctx.lineWidth=1;
    for(const pl of [[0,1,2],[0,2,1],[1,2,0]])for(let s=-2;s<=2;s++){if(pl[2]===2&&false)continue;}
    for(let la=-60;la<=60;la+=30){const zz=Math.sin(la*Math.PI/180),rr=Math.cos(la*Math.PI/180);ctx.beginPath();for(let i=0;i<=72;i++){const t=i/72*TAU,p=P.T(rr*Math.cos(t),rr*Math.sin(t),zz);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);}ctx.stroke();}
    for(let lo=0;lo<180;lo+=30){ctx.beginPath();for(let i=0;i<=72;i++){const t=i/72*TAU,p=P.T(Math.cos(lo*Math.PI/180)*Math.cos(t),Math.sin(lo*Math.PI/180)*Math.cos(t),Math.sin(t));i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);}ctx.stroke();}
    ctx.restore();
    const Np=P.T(0,0,1);dot(ctx,Np[0],Np[1],5,K.ink);label(ctx,'N = ∞',Np[0]+8,Np[1]-8,K.ink);
    const k=sc.value,a=ga(),b=gb();let pts=[];
    if(k==='p')pts=[[a,b]];
    else if(k==='c')for(let i=0;i<=120;i++){const t=i/120*TAU;pts.push([Math.abs(a)*Math.cos(t),Math.abs(a)*Math.sin(t)]);}
    else if(k==='r')for(let i=0;i<=300;i++){const t=Math.tan((i/300-0.5)*Math.PI*0.995);pts.push([a,t]);}
    else for(let i=0;i<=300;i++){const t=Math.tan((i/300-0.5)*Math.PI*0.995),ang=a;pts.push([t*Math.cos(ang),t*Math.sin(ang)]);}
    if(k!=='p'){ctx.save();ctx.strokeStyle=K.b;ctx.lineWidth=2;ctx.beginPath();let pen=false;pts.forEach(z=>{if(Math.abs(z[0])>L||Math.abs(z[1])>L){pen=false;return;}const p=P.T(z[0],z[1],0);pen?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);pen=true;});ctx.stroke();
      ctx.strokeStyle=K.d;ctx.lineWidth=3;ctx.beginPath();pts.forEach((z,i)=>{const p=P.T(...S(z));i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);});ctx.stroke();ctx.restore();}
    const z0=k==='p'?[a,b]:k==='c'?[Math.abs(a),0]:k==='r'?[a,b]:[b*Math.cos(a),b*Math.sin(a)],s0=S(z0);
    ctx.save();ctx.setLineDash([5,4]);ctx.strokeStyle=K.ink;ctx.lineWidth=1.3;const pz=P.T(z0[0],z0[1],0);ctx.beginPath();ctx.moveTo(Np[0],Np[1]);ctx.lineTo(pz[0],pz[1]);ctx.stroke();ctx.restore();
    dot(ctx,pz[0],pz[1],5.5,K.b);const ps=P.T(...s0);dot(ctx,ps[0],ps[1],6,K.d);label(ctx,'z',pz[0]+8,pz[1]+10,K.b);label(ctx,'imagen',ps[0]+8,ps[1]-8,K.d);
    const m=z0[0]**2+z0[1]**2;
    rd.innerHTML=row('z',cs(z0,2))+row('|z|',nt(Math.sqrt(m),3))+row('(X, Y, Z)',vs(s0,3))+sep+
      rowT(k==='c'?`|z| = ${nt(Math.abs(a),2)} va a un paralelo a altura Z = ${nt((a*a-1)/(a*a+1),3)}. ${Math.abs(Math.abs(a)-1)<0.03?'Con R = 1 es el ecuador.':''}`:
        k==='p'?(m<1?'|z| < 1: hemisferio sur.':m>1?'|z| > 1: hemisferio norte; al alejarse, la imagen se acerca a N.':'|z| = 1: ecuador.'):
        'Una recta va a una circunferencia que pasa por N: sus dos extremos “se juntan” en ∞.');
  }
  /* abiertos y cerrados */
  const cv2=$('#tp-cv2',sec),rd2=$('#tp-read2',sec),ss=$('#tp-s',sec),ge=sl(sec,'tp-e',v=>nf(v,2),()=>draw2());let P2=null;const T=[[1,0.2]];ss.onchange=()=>draw2();
  const SETS={do:{in:z=>C.abs(z)<1,b:[['c',0,0,1,false]],o:1,c:0,a:1,cx:1,sc:1},dc:{in:z=>C.abs(z)<=1,b:[['c',0,0,1,true]],o:0,c:1,a:1,cx:1,sc:1},
    an:{in:z=>C.abs(z)>1&&C.abs(z)<2,b:[['c',0,0,1,false],['c',0,0,2,false]],o:1,c:0,a:1,cx:1,sc:0},sp:{in:z=>z[0]>0,b:[['v',0,0,0,false]],o:1,c:0,a:0,cx:1,sc:1},
    dp:{in:z=>C.abs(z)>0&&C.abs(z)<1.5,b:[['c',0,0,1.5,false],['p',0,0,0,false]],o:1,c:0,a:1,cx:1,sc:0},dd:{in:z=>C.abs(C.sub(z,[-1.2,0]))<0.9||C.abs(C.sub(z,[1.2,0]))<0.9,b:[['c',-1.2,0,0.9,false],['c',1.2,0,0.9,false]],o:1,c:0,a:1,cx:0,sc:0}};
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.85,470,300);P2=cplane(ctx,w,h,2.6);const S2=SETS[ss.value];
    const step=4;ctx.save();ctx.fillStyle='rgba(15,118,110,.18)';for(let y=0;y<h;y+=step)for(let x=0;x<w;x+=step){if(S2.in([P2.ix(x+2),P2.iy(y+2)]))ctx.fillRect(x,y,step,step);}ctx.restore();
    S2.b.forEach(([t,x0,y0,r,inc])=>{ctx.save();ctx.strokeStyle=K.t;ctx.lineWidth=2.5;if(!inc)ctx.setLineDash([7,5]);ctx.beginPath();
      if(t==='c')ctx.arc(P2.X(x0),P2.Y(y0),r*P2.s,0,TAU);else if(t==='v'){ctx.moveTo(P2.X(0),0);ctx.lineTo(P2.X(0),h);}ctx.stroke();ctx.restore();
      if(t==='p')dot(ctx,P2.X(0),P2.Y(0),5,'#fff',K.t);});
    const z=T[0],e=ge();let nin=0,N=48;for(let i=0;i<N;i++){const q=C.add(z,C.polar(e,i/N*TAU));if(S2.in(q))nin++;}
    const cin=S2.in(z),cl=cin&&nin===N?'interior':!cin&&nin===0?'exterior':'de frontera (con este ε)';
    ctx.save();ctx.strokeStyle=cl==='interior'?K.r:cl==='exterior'?K.mut:K.w;ctx.lineWidth=2;ctx.beginPath();ctx.arc(P2.X(z[0]),P2.Y(z[1]),e*P2.s,0,TAU);ctx.stroke();ctx.restore();
    handle(ctx,P2,z,K.ink);
    const yn=v=>v?'<span class="aa-ok">sí</span>':'<span class="aa-no">no</span>';
    rd2.innerHTML=row('punto',cs(z))+row('¿z ∈ S?',yn(cin))+row('clasificación',cl)+sep+row('abierto',yn(S2.o))+row('cerrado',yn(S2.c))+row('acotado',yn(S2.a))+row('conexo',yn(S2.cx))+row('simplemente conexo',S2.cx?yn(S2.sc):'—')+
      sep+rowT(S2.cx&&S2.o?(S2.sc?'Es un dominio simplemente conexo: el teorema de Cauchy se aplica sin restricciones.':'Es un dominio, pero tiene un agujero: una curva que lo rodee no se puede contraer.'):!S2.cx?'No es conexo: no es un dominio.':'No es abierto: no es un dominio.');
  }
  dragPts(cv2,()=>P2,T,draw2,{R:2.5,snap:0.02});
  return {draw(){draw1();draw2();},tick(dt){if(st.auto&&vis(cv)){st.yaw+=dt*0.3;draw1();}}};
};

/* ================= VC · UNIDAD II · FUNCIONES ANALÍTICAS ================= */
const W2='Unidad II · Funciones analíticas';
/* catálogo de funciones */
const FN={
  id:['z',z=>z,z=>[1,0]],
  z2:['z²',z=>C.mul(z,z),z=>C.sc(z,2)],
  z3m1:['z³ − 1',z=>C.sub(C.mul(z,C.mul(z,z)),[1,0]),z=>C.sc(C.mul(z,z),3)],
  inv:['1/z',z=>C.div([1,0],z),z=>C.div([-1,0],C.mul(z,z))],
  mob:['(z − 1)/(z + 1)',z=>C.div(C.sub(z,[1,0]),C.add(z,[1,0])),z=>C.div([2,0],C.mul(C.add(z,[1,0]),C.add(z,[1,0])))],
  lor:['1/(z² + 1)',z=>C.div([1,0],C.add(C.mul(z,z),[1,0])),null],
  exp:['e^z',C.exp,C.exp],
  sin:['sin z',C.sin,C.cos],
  conj:['z̄ (no analítica)',C.conj,null],
  ratio:['z̄ / z (no analítica)',z=>C.div(C.conj(z),z),null],
  abs2:['|z|² (no analítica)',z=>[z[0]*z[0]+z[1]*z[1],0],null],
  zre:['z · Re z (no analítica)',z=>C.sc(z,z[0]),null],
  xiy2:['x² + i y² (no analítica)',z=>[z[0]*z[0],z[1]*z[1]],null]};
const fopts=keys=>keys.map(k=>[k,FN[k][0]]);
function wheel(){return `<div style="display:flex;align-items:center;gap:10px;font-size:.82rem;color:var(--muted);margin-top:10px"><span style="width:44px;height:44px;border-radius:50%;background:conic-gradient(from 90deg,hsl(0,85%,50%),hsl(300,85%,50%),hsl(240,85%,50%),hsl(180,85%,50%),hsl(120,85%,50%),hsl(60,85%,50%),hsl(0,85%,50%));flex:none"></span><span>Color = argumento de f(z): rojo 0, amarillo 60°, verde 120°, cian 180°, azul 240°, magenta 300°. Las bandas de brillo marcan |f| al duplicarse.</span></div>`;}

V.push(topicPage({id:'vc-funciones',pre:'fn',course:VC,unit:W2,title:'Funciones de variable compleja',
lead:String.raw`Una función \(w=f(z)\) lleva un plano a otro: su gráfica vive en cuatro dimensiones. Para verla se usan dos trucos: transformar curvas del plano \(z\) al plano \(w\), o pintar cada punto \(z\) con el color del argumento de \(f(z)\) (coloreado de dominio).`,
res:[String.raw`<b>Partes real e imaginaria.</b> \(f(z)=u(x,y)+i\,v(x,y)\). Por ejemplo, \(z^2=(x^2-y^2)+i\,2xy\) y \(1/z=\dfrac{x}{x^2+y^2}-i\dfrac{y}{x^2+y^2}\).`,
String.raw`<b>Coloreado de dominio.</b> A cada \(z\) se le asigna un color según \(\arg f(z)\) y un brillo según \(|f(z)|\). Alrededor de un cero de orden \(n\) los colores recorren el círculo cromático \(n\) veces en sentido antihorario (rojo→amarillo→verde→…); alrededor de un polo de orden \(n\), \(n\) veces en sentido horario.`,
String.raw`<b>Mapeo de curvas.</b> Se dibuja una cuadrícula en el plano \(z\) y su imagen en el plano \(w\). Así se ve, por ejemplo, que \(z^2\) duplica los ángulos en el origen y que \(e^z\) convierte rectas en circunferencias y rayos.`,
String.raw`<b>Límite.</b> \(\lim_{z\to z_0}f(z)=L\) si para todo \(\varepsilon>0\) existe \(\delta>0\) tal que \(0<|z-z_0|<\delta\Rightarrow|f(z)-L|<\varepsilon\). El límite tiene que ser el mismo por <i>todas</i> las direcciones: \(\bar z/z\) no tiene límite en 0 (vale 1 en el eje real y \(-1\) en el imaginario).`,
String.raw`<b>Continuidad.</b> \(f\) es continua si y solo si \(u\) y \(v\) lo son. Polinomios, funciones racionales (fuera de sus polos), \(e^z\), \(\sin z\) y \(\cos z\) son continuas.`,
String.raw`<b>Límites en el infinito.</b> \(\lim_{z\to\infty}f(z)=L\) significa \(\lim_{w\to0}f(1/w)=L\). Un polinomio de grado \(\ge1\) tiende a \(\infty\) en todas las direcciones; \(e^z\) no tiene límite en \(\infty\).`,
String.raw`<b>Funciones multivaluadas.</b> \(\sqrt z\) y \(\log z\) no son funciones en el sentido usual: al dar una vuelta alrededor de 0 cambian de valor. Se tratarán con ramas en esta misma unidad.`],
lab:tabs([['dc','Coloreado de dominio',`<div class="controls" style="margin:0 0 12px">${sel('fn-f',fopts(['z2','z3m1','inv','mob','lor','exp','sin','conj','ratio']))}<label class="fm-chk"><input type="checkbox" id="fn-g"> líneas de fase</label></div>`+
  lab2('fn-cv',slider('fn-R','zoom (radio visible)',0.5,8,0.1,2.5),'fn-read',String.raw`Mueve el cursor sobre el plano para leer \(z\) y \(f(z)\). Los ceros son los puntos donde confluyen todos los colores y el brillo se apaga; los polos, donde confluyen y el brillo crece. Cuenta cuántas veces gira el arcoíris alrededor de cada uno: es el orden.`)+wheel()],
 ['map','Imagen de una cuadrícula',`<div class="controls" style="margin:0 0 12px">${sel('fn-m',[['z2','z²'],['exp','e^z'],['inv','1/z'],['jk','z + 1/z'],['sin','sin z']])}</div>`+
  lab2('fn-cv2',slider('fn-x','centro x',-2,2,0.1,0.8)+slider('fn-y','centro y',-2,2,0.1,0.6)+slider('fn-s','tamaño',0.2,3,0.05,1),'fn-read2',String.raw`A la izquierda, una cuadrícula con líneas horizontales (naranja) y verticales (azul); a la derecha, su imagen por \(f\). Donde \(f\) es analítica y \(f'\neq0\), las curvas imagen se siguen cortando en ángulo recto.`)]]),
laws:[['Partes real e imaginaria',String.raw`f(x+iy)=u(x,y)+i\,v(x,y)`,'Una función compleja equivale a un par de funciones reales de dos variables.'],
 ['Límite',String.raw`\lim_{z\to z_0}f(z)=L\iff\forall\varepsilon>0\ \exists\delta>0:\ 0<|z-z_0|<\delta\Rightarrow|f(z)-L|<\varepsilon`,'Independiente de la dirección de acercamiento.'],
 ['Límite por componentes',String.raw`\lim f=L\iff\lim u=\operatorname{Re}L\ \text{y}\ \lim v=\operatorname{Im}L`,'Reduce los límites complejos a límites de dos variables.'],
 ['Límites en ∞',String.raw`\lim_{z\to\infty}f(z)=L\iff\lim_{w\to0}f(1/w)=L`,'Se trabaja en la esfera de Riemann.'],
 ['Orden de un cero o polo',String.raw`f(z)=(z-z_0)^{\pm n}g(z),\quad g(z_0)\neq0`,'En el coloreado: n vueltas del arcoíris, antihorarias en un cero y horarias en un polo.'],
 ['Ejemplo',String.raw`z^2=(x^2-y^2)+i\,(2xy),\qquad e^{z}=e^x\cos y+i\,e^x\sin y`,'Parte real e imaginaria de dos funciones básicas.']],
ex:[String.raw`Estudia \(\lim_{z\to0}\dfrac{\bar z}{z}\) y \(\lim_{z\to0}\dfrac{\bar z^{\,2}}{z}\).`,
 [String.raw`Por el eje real (\(z=x\)): \(\bar z/z=x/x=1\). Por el eje imaginario (\(z=iy\)): \(\bar z/z=-iy/iy=-1\). Los valores son distintos: el límite no existe.`,
  String.raw`En polares \(z=re^{i\theta}\): \(\bar z/z=e^{-2i\theta}\), que depende solo de la dirección. En el coloreado de \(\bar z/z\) los colores giran alrededor del 0 sin cambiar el brillo.`,
  String.raw`En cambio \(\left|\dfrac{\bar z^{\,2}}{z}\right|=\dfrac{r^2}{r}=r\to0\), así que \(\lim_{z\to0}\bar z^{\,2}/z=0\) aunque la dirección importe en la fase.`],
 'Compruébalo en el laboratorio con la opción z̄ / z.'],
prev:['vc-topologia','Topología y esfera de Riemann'],next:['vc-cauchy-riemann','Derivada y Cauchy-Riemann'],
ref:'Churchill &amp; Brown, cap. 2; Needham, cap. 2; Wegert, <i>Visual Complex Functions</i>'}));

V.push(topicPage({id:'vc-cauchy-riemann',pre:'cr',course:VC,unit:W2,title:'Derivada compleja y Cauchy-Riemann',
lead:String.raw`La derivada compleja exige que el cociente incremental tenga el mismo límite desde todas las direcciones del plano. Esa exigencia es mucho más fuerte que la diferenciabilidad en \(\mathbb{R}^2\): obliga al jacobiano a ser de la forma \(aI+bJ\), es decir, a rotar y escalar. Esas son las ecuaciones de Cauchy-Riemann.`,
res:[String.raw`<b>Definición.</b> \(f'(z_0)=\lim_{h\to0}\dfrac{f(z_0+h)-f(z_0)}{h}\), con \(h\in\mathbb{C}\) acercándose a 0 por cualquier camino. \(f\) es <i>holomorfa</i> (o analítica) en un abierto si es derivable en cada uno de sus puntos; <i>entera</i> si lo es en todo \(\mathbb{C}\).`,
String.raw`<b>Deducción de Cauchy-Riemann.</b> Con \(h\) real: \(f'=u_x+iv_x\). Con \(h=ik\) imaginario: \(f'=\dfrac{u_y+iv_y}{i}=v_y-iu_y\). Igualando: \(u_x=v_y\) y \(u_y=-v_x\).`,
String.raw`<b>Condición suficiente.</b> Si \(u,v\) tienen derivadas parciales continuas en un abierto y cumplen Cauchy-Riemann, \(f\) es holomorfa allí, con \(f'=u_x+iv_x\).`,
String.raw`<b>Lectura con álgebra lineal.</b> El jacobiano \(\begin{pmatrix}u_x&u_y\\v_x&v_y\end{pmatrix}\) cumple Cauchy-Riemann si y solo si es \(\begin{pmatrix}a&-b\\b&a\end{pmatrix}=aI+bJ\) con \(f'=a+ib\). Es decir: localmente \(f\) es multiplicar por \(f'(z_0)\), una rotación de ángulo \(\arg f'\) y una escala \(|f'|\). Además \(\det J=|f'|^2\).`,
String.raw`<b>Conformalidad.</b> Donde \(f'(z_0)\neq0\), un cuadradito alrededor de \(z_0\) va a otro cuadradito (girado y escalado): \(f\) conserva ángulos. En una función no analítica, el cuadradito se deforma en un paralelogramo cualquiera.`,
String.raw`<b>Wirtinger.</b> Con \(\partial_z=\tfrac12(\partial_x-i\partial_y)\) y \(\partial_{\bar z}=\tfrac12(\partial_x+i\partial_y)\), Cauchy-Riemann se resume en \(\partial f/\partial\bar z=0\): \(f\) depende de \(z\) pero no de \(\bar z\). Por eso \(\bar z\), \(\operatorname{Re}z\) y \(|z|^2=z\bar z\) no son holomorfas.`,
String.raw`<b>Reglas de derivación.</b> Valen las mismas que en una variable real: suma, producto, cociente y regla de la cadena. Polinomios, \(e^z\), \(\sin z\) y \(\cos z\) son enteras; las racionales son holomorfas fuera de sus polos.`,
String.raw`<b>En polares.</b> \(u_r=\dfrac1r v_\theta\) y \(v_r=-\dfrac1r u_\theta\). Útil para funciones como \(\log z\) o \(z^n\).`],
lab:`<div class="controls" style="margin:0 0 12px">${sel('cr-f',fopts(['z2','exp','inv','z3m1','sin','conj','abs2','zre','xiy2']))}</div>`+
 lab2('cr-cv',slider('cr-h','tamaño del cuadradito',0.05,0.6,0.01,0.25),'cr-read',String.raw`Arrastra \(z_0\) en el plano izquierdo. Se dibuja un cuadradito con un círculo inscrito y su imagen por \(f\) en el plano derecho, centrada y ampliada \(1/|f'|\) veces. Si \(f\) es holomorfa, la imagen vuelve a ser un cuadrado girado y el círculo, un círculo. Si no, se deforma en un paralelogramo y una elipse.`),
laws:[['Derivada compleja',String.raw`f'(z_0)=\lim_{h\to0}\frac{f(z_0+h)-f(z_0)}{h},\qquad h\in\mathbb{C}`,'El límite debe ser el mismo por cualquier camino.'],
 ['Cauchy-Riemann',String.raw`\frac{\partial u}{\partial x}=\frac{\partial v}{\partial y},\qquad\frac{\partial u}{\partial y}=-\frac{\partial v}{\partial x}`,'Necesarias; con derivadas parciales continuas, también suficientes.'],
 ['Derivada en función de u y v',String.raw`f'(z)=u_x+i\,v_x=v_y-i\,u_y`,'Se calcula con derivadas parciales.'],
 ['Jacobiano',String.raw`J=\begin{pmatrix}u_x&u_y\\v_x&v_y\end{pmatrix}=\begin{pmatrix}a&-b\\b&a\end{pmatrix},\quad\det J=|f'|^2`,'Una rotación compuesta con una homotecia.'],
 ['Forma compleja (Wirtinger)',String.raw`\frac{\partial f}{\partial\bar z}=\frac12\left(\frac{\partial f}{\partial x}+i\frac{\partial f}{\partial y}\right)=0`,String.raw`Equivale a las dos ecuaciones de Cauchy-Riemann.`],
 ['Cauchy-Riemann en polares',String.raw`u_r=\frac1r\,v_\theta,\qquad v_r=-\frac1r\,u_\theta`,'Útil cuando la función se expresa con r y θ.']],
ex:[String.raw`¿Dónde es derivable \(f(z)=z^3\)? ¿Y \(g(z)=|z|^2\)?`,
 [String.raw`\(z^3=(x+iy)^3\): \(u=x^3-3xy^2\), \(v=3x^2y-y^3\).`,
  String.raw`\(u_x=3x^2-3y^2=v_y\) y \(u_y=-6xy=-v_x\): Cauchy-Riemann se cumple en todo el plano, con parciales continuas. \(z^3\) es entera, y \(f'=u_x+iv_x=3x^2-3y^2+6ixy=3z^2\).`,
  String.raw`\(|z|^2\): \(u=x^2+y^2\), \(v=0\). \(u_x=2x\) debe igualar \(v_y=0\), y \(u_y=2y\) debe igualar \(-v_x=0\). Solo se cumple en \(z=0\).`,
  String.raw`\(|z|^2\) es derivable únicamente en el origen (con \(g'(0)=0\)) y no es holomorfa en ningún abierto: \(\partial_{\bar z}(z\bar z)=z\neq0\).`]],
prev:['vc-funciones','Funciones de variable compleja'],next:['vc-armonicas','Funciones armónicas'],
ref:'Churchill &amp; Brown, cap. 2; Needham, cap. 4; Ahlfors, cap. 2'}));

V.push(topicPage({id:'vc-armonicas',pre:'ha',course:VC,unit:W2,title:'Funciones armónicas',
lead:String.raw`Las partes real e imaginaria de una función analítica cumplen la ecuación de Laplace. Por eso la variable compleja resuelve problemas de potencial en dos dimensiones: electrostática, flujo ideal de fluidos y conducción del calor estacionaria.`,
res:[String.raw`<b>Armónicas.</b> \(u\) es armónica si \(\nabla^2u=u_{xx}+u_{yy}=0\). Si \(f=u+iv\) es holomorfa, \(u\) y \(v\) son armónicas: de Cauchy-Riemann, \(u_{xx}=v_{yx}\) y \(u_{yy}=-v_{xy}\), que se cancelan.`,
String.raw`<b>Conjugada armónica.</b> Si \(u\) es armónica en un dominio simplemente conexo, existe \(v\) (única salvo constante) tal que \(u+iv\) es holomorfa. Se obtiene integrando \(v_y=u_x\) y \(v_x=-u_y\). Ejemplo: \(u=x^2-y^2\) da \(v=2xy\) y \(f=z^2\).`,
String.raw`<b>Familias ortogonales.</b> Las curvas \(u=\text{cte}\) y \(v=\text{cte}\) se cortan en ángulo recto donde \(f'\neq0\): por Cauchy-Riemann, \(\nabla u\cdot\nabla v=u_xv_x+u_yv_y=-u_xu_y+u_yu_x=0\).`,
String.raw`<b>Valor medio y máximo.</b> Una armónica vale en el centro de un disco el promedio de sus valores en la circunferencia. Como consecuencia no tiene máximos ni mínimos en el interior de un dominio (principio del máximo).`,
String.raw`<b>Potencial complejo.</b> En un flujo ideal (incompresible e irrotacional) se escribe \(\Omega(z)=\phi+i\psi\): \(\phi\) es el potencial de velocidades y \(\psi\) la función de corriente. La velocidad es \(v_x-iv_y=\Omega'(z)\), y las líneas \(\psi=\text{cte}\) son las líneas de corriente.`,
String.raw`<b>Catálogo.</b> Flujo uniforme \(Uz\); fuente \(\tfrac{m}{2\pi}\log z\); vórtice \(-\tfrac{i\Gamma}{2\pi}\log z\); dipolo \(\mu/z\); flujo alrededor de un cilindro \(U\big(z+\tfrac{a^2}{z}\big)\); flujo en una esquina \(z^2\). Se pueden sumar: la ecuación es lineal.`,
String.raw`<b>Electrostática.</b> El mismo formalismo sirve con \(\phi\) como potencial electrostático y \(\psi=\text{cte}\) como líneas de campo. Un hilo cargado da \(\phi\propto-\ln r\), la parte real de \(-\log z\).`,
String.raw`<b>Mapeos conformes.</b> Si \(u\) es armónica y \(g\) es holomorfa, \(u\circ g\) también es armónica. Un problema en una geometría complicada se lleva a otra sencilla, se resuelve allí y se devuelve.`],
lab:`<div class="controls" style="margin:0 0 12px">${sel('ha-f',[['un','Flujo uniforme Ω = z'],['fu','Fuente Ω = log z'],['vo','Vórtice Ω = −i log z'],['di','Dipolo Ω = 1/z'],['ci','Cilindro Ω = z + a²/z'],['es','Esquina Ω = z²'],['fs','Fuente + sumidero'],['cv','Cilindro con circulación']])}${btn('ha-p','Pausa')}</div>`+
 lab2('ha-cv',slider('ha-a','parámetro (a o Γ)',0.3,2,0.05,1),'ha-read',String.raw`Las curvas verdes son líneas de corriente (\(\psi=\text{cte}\)) y las naranjas discontinuas, equipotenciales (\(\phi=\text{cte}\)): se cortan en ángulo recto. Las partículas siguen la velocidad \(\overline{\Omega'(z)}\). En el cilindro, el parámetro es el radio \(a\); con circulación, es \(\Gamma\).`),
laws:[['Ecuación de Laplace',String.raw`\nabla^2u=\frac{\partial^2u}{\partial x^2}+\frac{\partial^2u}{\partial y^2}=0`,'Se cumple para u = Re f y v = Im f si f es holomorfa.'],
 ['Conjugada armónica',String.raw`v(x,y)=\int\big(-u_y\,dx+u_x\,dy\big)`,'Integral independiente del camino en un dominio simplemente conexo.'],
 ['Ortogonalidad',String.raw`\nabla u\cdot\nabla v=0`,'Equipotenciales y líneas de corriente son perpendiculares.'],
 ['Potencial complejo',String.raw`\Omega=\phi+i\psi,\qquad v_x-i\,v_y=\Omega'(z)`,String.raw`La velocidad es \(\overline{\Omega'(z)}\).`],
 ['Flujo alrededor de un cilindro',String.raw`\Omega(z)=U\Big(z+\frac{a^2}{z}\Big)-\frac{i\Gamma}{2\pi}\log z`,String.raw`En \(|z|=a\), \(\psi\) es constante: la circunferencia es una línea de corriente.`],
 ['Valor medio',String.raw`u(z_0)=\frac1{2\pi}\int_0^{2\pi}u(z_0+re^{i\theta})\,d\theta`,'De aquí sale el principio del máximo.']],
ex:[String.raw`Comprueba que \(u=x^3-3xy^2\) es armónica, halla su conjugada armónica y la función analítica correspondiente.`,
 [String.raw`\(u_{xx}=6x\) y \(u_{yy}=-6x\): \(\nabla^2u=0\). ✓`,
  String.raw`\(v_y=u_x=3x^2-3y^2\Rightarrow v=3x^2y-y^3+h(x)\).`,
  String.raw`\(v_x=6xy+h'(x)\) debe ser \(-u_y=6xy\), así que \(h'=0\) y \(v=3x^2y-y^3+C\).`,
  String.raw`\(f=u+iv=(x+iy)^3+iC=z^3+iC\). Las curvas \(u=\text{cte}\) y \(v=\text{cte}\) son dos familias de “hipérbolas de tres ramas” ortogonales.`]],
prev:['vc-cauchy-riemann','Derivada y Cauchy-Riemann'],next:['vc-elementales','Funciones elementales'],
ref:'Churchill &amp; Brown, cap. 2 y 10; Needham, cap. 11; Batchelor, <i>An Introduction to Fluid Dynamics</i>, cap. 6'}));

V.push(topicPage({id:'vc-elementales',pre:'el',course:VC,unit:W2,title:'Funciones elementales',
lead:String.raw`La exponencial compleja es la función central del curso: de ella salen el seno, el coseno, las hiperbólicas y el logaritmo. En \(\mathbb{C}\) se descubren propiedades invisibles en \(\mathbb{R}\): \(e^z\) es periódica y \(\sin z\) no está acotada.`,
res:[String.raw`<b>Exponencial.</b> \(e^z=e^x(\cos y+i\sin y)\). Es entera, \((e^z)'=e^z\), \(e^{z+w}=e^ze^w\), \(|e^z|=e^x\) y \(\arg e^z=y\). Nunca se anula.`,
String.raw`<b>Periodicidad.</b> \(e^{z+2\pi i}=e^z\): la exponencial tiene periodo imaginario \(2\pi i\). La franja \(-\pi\lt y\le\pi\) se aplica biyectivamente sobre \(\mathbb{C}\setminus\{0\}\).`,
String.raw`<b>Geometría de \(e^z\).</b> Las rectas horizontales \(y=c\) van a rayos de ángulo \(c\); las verticales \(x=c\), a circunferencias de radio \(e^c\). La cuadrícula cartesiana se convierte en una polar.`,
String.raw`<b>Seno y coseno.</b> \(\sin z=\dfrac{e^{iz}-e^{-iz}}{2i}\), \(\cos z=\dfrac{e^{iz}+e^{-iz}}{2}\). Son enteras y conservan las identidades (\(\sin^2z+\cos^2z=1\), fórmulas de adición, \((\sin z)'=\cos z\)). Sus ceros son solo los reales \(n\pi\) y \(\pi/2+n\pi\).`,
String.raw`<b>No están acotadas.</b> \(\sin(iy)=i\sinh y\) y \(|\sin z|^2=\sin^2x+\sinh^2y\), que crece como \(e^{|y|}/2\). Es un caso del teorema de Liouville: una función entera acotada es constante.`,
String.raw`<b>Hiperbólicas.</b> \(\sinh z=\tfrac{e^z-e^{-z}}{2}\), \(\cosh z=\tfrac{e^z+e^{-z}}{2}\). En \(\mathbb{C}\) son el seno y el coseno girados: \(\sin(iz)=i\sinh z\), \(\cos(iz)=\cosh z\).`,
String.raw`<b>Tangente.</b> \(\tan z=\sin z/\cos z\) es holomorfa salvo en los polos simples \(\pi/2+n\pi\).`,
String.raw`<b>En física.</b> Una onda plana \(e^{i(kx-\omega t)}\) con \(k\) imaginario se vuelve una onda evanescente \(e^{-\kappa x}\): es lo que ocurre en la reflexión total interna y en el efecto túnel.`],
lab:tabs([['map','Imagen de una cuadrícula',`<div class="controls" style="margin:0 0 12px">${sel('el-f',[['exp','e^z'],['sin','sin z'],['cos','cos z'],['cosh','cosh z']])}</div>`+
  lab2('el-cv',slider('el-h','altura de la franja',0.2,3.2,0.05,3.14)+slider('el-w','ancho',0.2,3.2,0.05,2),'el-read',String.raw`A la izquierda, un rectángulo con líneas horizontales (naranja) y verticales (azul); a la derecha, su imagen. Con \(e^z\) y altura \(\pi\), la franja completa cubre todo el plano salvo el 0. Con \(\sin z\), las verticales van a hipérbolas y las horizontales a elipses confocales.`)],
 ['abs','sin z no está acotado',lab2('el-cv2',slider('el-x','x fijo',-3.14,3.14,0.01,0.5),'el-read2',String.raw`Se grafica \(|\sin(x+iy)|\) a lo largo de una recta vertical en función de \(y\). En el eje real (\(y=0\)) nunca pasa de 1, pero al salir del eje crece exponencialmente, como \(\sinh|y|\).`)]]),
laws:[['Exponencial',String.raw`e^{x+iy}=e^x(\cos y+i\sin y)`,String.raw`\(|e^z|=e^x\), \(\arg e^z=y\).`],
 ['Periodo',String.raw`e^{z+2\pi i}=e^z`,'La exponencial no es inyectiva en ℂ.'],
 ['Seno y coseno',String.raw`\sin z=\frac{e^{iz}-e^{-iz}}{2i},\qquad\cos z=\frac{e^{iz}+e^{-iz}}{2}`,'Definiciones válidas en todo ℂ.'],
 ['Módulo del seno',String.raw`|\sin(x+iy)|^2=\sin^2x+\sinh^2y`,'Crece exponencialmente lejos del eje real.'],
 ['Relación con las hiperbólicas',String.raw`\sin(iz)=i\sinh z,\qquad\cos(iz)=\cosh z`,'Seno y coseno girados 90°.'],
 ['Derivadas',String.raw`(e^z)'=e^z,\quad(\sin z)'=\cos z,\quad(\cos z)'=-\sin z`,'Las mismas fórmulas que en ℝ.']],
ex:[String.raw`Resuelve \(\sin z=2\).`,
 [String.raw`Con \(w=e^{iz}\): \(\dfrac{w-w^{-1}}{2i}=2\Rightarrow w^2-4iw-1=0\).`,
  String.raw`\(w=\dfrac{4i\pm\sqrt{-16+4}}{2}=i(2\pm\sqrt3)\).`,
  String.raw`\(iz=\log w=\ln(2\pm\sqrt3)+i\big(\tfrac\pi2+2\pi k\big)\), así que \(z=\tfrac\pi2+2\pi k-i\ln(2\pm\sqrt3)\).`,
  String.raw`Como \(\ln(2-\sqrt3)=-\ln(2+\sqrt3)\): \(z=\tfrac\pi2+2\pi k\pm i\ln(2+\sqrt3)\approx\tfrac\pi2+2\pi k\pm1{,}317\,i\). Comprobación: \(\sin(\tfrac\pi2+iy)=\cos(iy)=\cosh y=\cosh1{,}317=2\). ✓`],
 'En ℝ la ecuación no tiene solución; en ℂ tiene infinitas.'],
prev:['vc-armonicas','Funciones armónicas'],next:['vc-log-ramas','Logaritmo, potencias y ramas'],
ref:'Churchill &amp; Brown, cap. 3; Needham, cap. 2'}));

V.push(topicPage({id:'vc-log-ramas',pre:'lg',course:VC,unit:W2,title:'Logaritmo, potencias y ramas',
lead:String.raw`Como \(e^z\) es periódica, invertirla da infinitos valores: el logaritmo complejo es multivaluado. Para trabajar con él se elige una rama, a costa de un corte donde la función salta. La superficie de Riemann es el objeto geométrico en el que el logaritmo vuelve a ser una función continua.`,
res:[String.raw`<b>Logaritmo.</b> \(\log z=\ln|z|+i\arg z\), con todos los valores del argumento: \(\log z=\operatorname{Log}z+2\pi ik\), \(k\in\mathbb{Z}\). Siempre \(e^{\log z}=z\), pero \(\log e^z=z+2\pi ik\).`,
String.raw`<b>Rama principal.</b> \(\operatorname{Log}z=\ln|z|+i\operatorname{Arg}z\), con \(\operatorname{Arg}\in(-\pi,\pi]\). Es holomorfa en \(\mathbb{C}\setminus(-\infty,0]\) con \((\operatorname{Log}z)'=1/z\), y salta \(2\pi i\) al cruzar el semieje real negativo (el <i>corte de rama</i>).`,
String.raw`<b>Punto de ramificación.</b> Al dar una vuelta completa alrededor de 0, el valor continuo del logaritmo aumenta \(2\pi i\). Ninguna elección de rama puede ser continua en un lazo que rodee 0: el corte tiene que ir de 0 a \(\infty\), aunque su dirección es libre.`,
String.raw`<b>Potencias complejas.</b> \(z^c=e^{c\log z}\). Si \(c\) es entero, tiene un solo valor; si \(c=p/q\), \(q\) valores; si \(c\) es irracional o no real, infinitos. Ejemplo: \(i^i=e^{i\log i}=e^{i\cdot i(\pi/2+2\pi k)}=e^{-\pi/2-2\pi k}\), todos reales.`,
String.raw`<b>Raíz cuadrada.</b> \(\sqrt z=e^{\frac12\log z}\) tiene dos ramas que difieren en el signo. Tras una vuelta alrededor de 0 se pasa a la otra rama; tras dos vueltas se vuelve a la primera.`,
String.raw`<b>Superficies de Riemann.</b> Se apilan copias del plano cortado y se pegan a lo largo de los cortes. Para \(\log z\) resulta una hélice infinita; para \(\sqrt z\), dos hojas pegadas en cruz. Sobre ellas la función es univaluada y holomorfa.`,
String.raw`<b>Cuidado con las identidades.</b> \(\operatorname{Log}(zw)\neq\operatorname{Log}z+\operatorname{Log}w\) en general: con \(z=w=-1\), \(\operatorname{Log}1=0\) pero \(\operatorname{Log}(-1)+\operatorname{Log}(-1)=2\pi i\). Las identidades valen módulo \(2\pi i\).`,
String.raw`<b>En física.</b> La fase de la función de onda alrededor de un vórtice cuántico gira \(2\pi n\); el potencial de un vórtice \(-\tfrac{i\Gamma}{2\pi}\log z\) es multivaluado, y la circulación es justamente ese salto. En dispersión aparecen cortes de rama en las energías complejas.`],
lab:tabs([['rs','Superficie de Riemann',`<div class="controls" style="margin:0 0 12px">${seg('lg-f','f',[['l','log z'],['s','√z']])}${btn('lg-play','Dar vueltas')}</div>`+
  lab2('lg-cv',slider('lg-t','ángulo acumulado θ (vueltas)',-2,2,0.01,0.3),'lg-read',String.raw`Arrastra para girar. La hélice es la superficie de Riemann: la altura es el ángulo acumulado \(\theta\). El punto recorre la circunferencia \(|z|=1\) en el plano de abajo, pero en la hélice sube un piso por vuelta. El valor continuo de \(\log z\) (o \(\sqrt z\)) cambia suavemente, mientras que la rama principal salta al cruzar el corte.`)],
 ['cut','Cortes de rama',`<div class="controls" style="margin:0 0 12px">${seg('lg-g','g',[['l','Log z'],['s','√z']])}</div>`+
  lab2('lg-cv2',slider('lg-a','dirección del corte α (°)',-180,180,1,180),'lg-read2',String.raw`Coloreado de dominio de la rama elegida. El corte (línea negra) sale del origen en la dirección \(\alpha\); al cruzarlo, el color salta. Con \(\alpha=180^\circ\) se obtiene la rama principal. Mover el corte no elimina la discontinuidad: solo la cambia de lugar.`)+wheel()]]),
laws:[['Logaritmo complejo',String.raw`\log z=\ln|z|+i\arg z=\operatorname{Log}z+2\pi ik`,'Infinitos valores, separados por 2πi.'],
 ['Rama principal',String.raw`\operatorname{Log}z=\ln|z|+i\operatorname{Arg}z,\quad-\pi<\operatorname{Arg}z\le\pi`,String.raw`Holomorfa en \(\mathbb{C}\setminus(-\infty,0]\).`],
 ['Derivada',String.raw`\frac{d}{dz}\operatorname{Log}z=\frac1z`,'Fuera del corte de rama.'],
 ['Potencia compleja',String.raw`z^c=e^{c\log z}`,'Multivaluada salvo para c entero.'],
 ['Raíz cuadrada',String.raw`\sqrt z=\sqrt{|z|}\,e^{i\arg z/2}`,'Dos valores opuestos; una vuelta los intercambia.'],
 ['Salto en el corte',String.raw`\operatorname{Log}(x+i0^+)-\operatorname{Log}(x-i0^+)=2\pi i\quad(x<0)`,'La discontinuidad de la rama principal.']],
ex:[String.raw`Calcula todos los valores de \(\log(-1-i)\) y de \((1+i)^{i}\).`,
 [String.raw`\(-1-i=\sqrt2\,e^{-3\pi i/4}\). Entonces \(\log(-1-i)=\ln\sqrt2+i\big(-\tfrac{3\pi}4+2\pi k\big)\), y \(\operatorname{Log}(-1-i)=\tfrac12\ln2-\tfrac{3\pi}{4}i\).`,
  String.raw`\((1+i)^i=e^{i\log(1+i)}\), con \(\log(1+i)=\tfrac12\ln2+i\big(\tfrac\pi4+2\pi k\big)\).`,
  String.raw`\(i\log(1+i)=-\big(\tfrac\pi4+2\pi k\big)+\tfrac i2\ln2\).`,
  String.raw`\((1+i)^i=e^{-\pi/4-2\pi k}\big[\cos(\tfrac12\ln2)+i\sin(\tfrac12\ln2)\big]\). Valor principal (\(k=0\)): \(\approx0{,}456\,(0{,}941+0{,}339i)\approx0{,}429+0{,}155i\).`]],
prev:['vc-elementales','Funciones elementales'],next:['vc-conformes','Mapeos conformes y Möbius'],
ref:'Churchill &amp; Brown, cap. 3; Needham, cap. 2; Ahlfors, cap. 2'}));

V.push(topicPage({id:'vc-conformes',pre:'cf',course:VC,unit:W2,title:'Mapeos conformes y transformaciones de Möbius',
lead:String.raw`Una función analítica con derivada no nula conserva ángulos: es un mapeo conforme. Las transformaciones de Möbius son las más rígidas de todas: llevan circunferencias en circunferencias, se componen como matrices \(2\times2\) y permiten transformar un semiplano en un disco.`,
res:[String.raw`<b>Conformalidad.</b> Si \(f\) es holomorfa y \(f'(z_0)\neq0\), dos curvas que se cortan en \(z_0\) con ángulo \(\alpha\) tienen imágenes que se cortan con el mismo ángulo y la misma orientación. En un punto crítico (\(f'=0\)) los ángulos se multiplican: \(z^2\) los duplica en el origen.`,
String.raw`<b>Möbius.</b> \(T(z)=\dfrac{az+b}{cz+d}\) con \(ad-bc\neq0\). Es una biyección de la esfera de Riemann, con \(T(-d/c)=\infty\) y \(T(\infty)=a/c\).`,
String.raw`<b>Composición = producto de matrices.</b> A \(T\) se le asocia \(\begin{pmatrix}a&b\\c&d\end{pmatrix}\); componer transformaciones equivale a multiplicar sus matrices, y la inversa corresponde a la matriz inversa. Las matrices \(\lambda M\) dan la misma \(T\).`,
String.raw`<b>Generadores.</b> Toda Möbius es composición de traslaciones \(z+b\), giros con homotecia \(az\) y la inversión \(1/z\).`,
String.raw`<b>Circunferencias.</b> Las Möbius llevan rectas y circunferencias en rectas y circunferencias (en la esfera de Riemann, todas son circunferencias). Una circunferencia que pasa por el polo \(-d/c\) va a una recta.`,
String.raw`<b>Tres puntos determinan T.</b> Existe una única Möbius que lleva tres puntos distintos a otros tres. La razón doble \((z,z_1,z_2,z_3)=\dfrac{(z-z_1)(z_2-z_3)}{(z-z_3)(z_2-z_1)}\) es invariante.`,
String.raw`<b>Transformación de Cayley.</b> \(w=\dfrac{z-i}{z+i}\) lleva el semiplano superior al disco unidad y el eje real a la circunferencia. Los automorfismos del disco son \(e^{i\theta}\dfrac{z-a}{1-\bar az}\) con \(|a|<1\).`,
String.raw`<b>Teorema de Riemann y aplicaciones.</b> Todo dominio simplemente conexo distinto de \(\mathbb{C}\) es conforme al disco. Como la armonicidad se conserva, los problemas de potencial se resuelven llevando la geometría a una sencilla. El perfil de ala de Joukowski sale de \(z+1/z\) aplicada a una circunferencia desplazada.`],
lab:tabs([['mb','Imagen de una cuadrícula',`<div class="controls" style="margin:0 0 12px">${sel('cf-f',[['inv','Inversión 1/z'],['cay','Cayley (z − i)/(z + i)'],['dsk','Disco (z − ½)/(1 − ½z)'],['z2','z² (no Möbius)'],['jk','Joukowski z + 1/z (no Möbius)']])}</div>`+
  lab2('cf-cv','','cf-read',String.raw`Izquierda: cuadrícula del plano \(z\) (horizontales naranja, verticales azul). Derecha: su imagen. Arrastra el punto negro: el par de segmentos perpendiculares que lo marcan se transforma en un par que sigue siendo perpendicular, salvo en los puntos críticos (como \(z=0\) para \(z^2\)).`)],
 ['cy','Cayley: semiplano → disco',lab2('cf-cv2','','cf-read2',String.raw`Arrastra \(z\) en el plano izquierdo. Si \(\operatorname{Im}z>0\) (zona verde), su imagen \(w=\frac{z-i}{z+i}\) cae dentro del disco unidad. El eje real va a la circunferencia, \(i\) va al centro y \(\infty\) va a \(1\).`)]]),
laws:[['Conformalidad',String.raw`f'(z_0)\neq0\ \Rightarrow\ \text{conserva ángulos en }z_0`,'Localmente f es una rotación y una homotecia.'],
 ['Transformación de Möbius',String.raw`T(z)=\frac{az+b}{cz+d},\qquad ad-bc\neq0`,'Biyección de la esfera de Riemann.'],
 ['Composición',String.raw`T_{M}\circ T_{N}=T_{MN}`,'Componer Möbius es multiplicar sus matrices 2×2.'],
 ['Razón doble',String.raw`(z,z_1,z_2,z_3)=\frac{(z-z_1)(z_2-z_3)}{(z-z_3)(z_2-z_1)}`,'Invariante bajo cualquier Möbius.'],
 ['Cayley',String.raw`w=\frac{z-i}{z+i}:\ \{\operatorname{Im}z>0\}\to\{|w|<1\}`,'El eje real va a la circunferencia unidad.'],
 ['Automorfismos del disco',String.raw`w=e^{i\theta}\,\frac{z-a}{1-\bar a z},\qquad|a|<1`,'Llevan el disco unidad en sí mismo y a en 0.']],
ex:[String.raw`Halla la Möbius que lleva \(0\mapsto-1\), \(1\mapsto0\) y \(\infty\mapsto1\), y la imagen del eje imaginario.`,
 [String.raw`Como \(1\mapsto0\) y \(\infty\mapsto1\): \(T(z)=\dfrac{a(z-1)}{z+d}\) con \(T(\infty)=a=1\).`,
  String.raw`\(T(0)=\dfrac{-1}{d}=-1\Rightarrow d=1\). Entonces \(T(z)=\dfrac{z-1}{z+1}\), con matriz \(\begin{pmatrix}1&-1\\1&1\end{pmatrix}\) y determinante \(2\neq0\).`,
  String.raw`Eje imaginario, \(z=iy\): \(|T(iy)|=\dfrac{|iy-1|}{|iy+1|}=1\). Va a la circunferencia unidad (el semiplano \(\operatorname{Re}z>0\) va al disco).`,
  String.raw`Es la variante de Cayley para el semiplano derecho; su inversa es \(z=\dfrac{1+w}{1-w}\), con matriz inversa proporcional a \(\begin{pmatrix}1&1\\-1&1\end{pmatrix}\).`]],
prev:['vc-log-ramas','Logaritmo, potencias y ramas'],next:['vc-contorno','Integrales de contorno'],
ref:'Churchill &amp; Brown, cap. 8–9; Needham, cap. 3 y 12; Ahlfors, cap. 3'}));

/* ---------- utilidades de estos laboratorios ---------- */
function gridMap(ctx,P,f,x0,x1,y0,y1,nx,ny,opt={}){
  const hcol=opt.h||K.b,vcol=opt.v||K.a,N=opt.n||160,ok=w=>w&&isFinite(w[0])&&isFinite(w[1])&&Math.abs(w[0])<1e3&&Math.abs(w[1])<1e3;
  const line=(pt,col)=>{ctx.save();ctx.strokeStyle=col;ctx.lineWidth=opt.lw||1.4;ctx.beginPath();let pen=false,prev=null;
    for(let i=0;i<=N;i++){const w=f(pt(i/N));if(!ok(w)){pen=false;prev=null;continue;}const X=P.X(w[0]),Y=P.Y(w[1]);
      if(pen&&prev&&Math.hypot(X-prev[0],Y-prev[1])>220){pen=false;}
      if(pen)ctx.lineTo(X,Y);else{ctx.moveTo(X,Y);pen=true;}prev=[X,Y];}ctx.stroke();ctx.restore();};
  for(let j=0;j<=ny;j++){const y=y0+(y1-y0)*j/ny;line(t=>[x0+(x1-x0)*t,y],hcol);}
  for(let i=0;i<=nx;i++){const x=x0+(x1-x0)*i/nx;line(t=>[x,y0+(y1-y0)*t],vcol);}}
function split(ctx,w,h,R1,R2){const hw=w/2-4,P1=cplane(ctx,w,h,R1,0,hw),P2=cplane(ctx,w,h,R2,w/2+4,hw);ctx.fillStyle='#fff';ctx.fillRect(hw,0,8,h);ctx.strokeStyle=K.line;ctx.beginPath();ctx.moveTo(w/2,0);ctx.lineTo(w/2,h);ctx.stroke();return [P1,P2,hw];}
function clipR(ctx,x,w,h,fn){ctx.save();ctx.beginPath();ctx.rect(x,0,w,h);ctx.clip();fn();ctx.restore();}
/* curvas de nivel por cuadrados en marcha */
function contours(ctx,P,F,levels,col,opt={}){
  const nx=opt.nx||120,ny=opt.ny||90,xr=P.xr,yr=P.yr,dx=(xr[1]-xr[0])/nx,dy=(yr[1]-yr[0])/ny,G=[];
  for(let j=0;j<=ny;j++){G.push([]);for(let i=0;i<=nx;i++)G[j].push(F(xr[0]+i*dx,yr[0]+j*dy));}
  ctx.save();ctx.strokeStyle=col;ctx.lineWidth=opt.lw||1.4;if(opt.dash)ctx.setLineDash(opt.dash);ctx.beginPath();
  const jump=opt.jump||Infinity;
  for(const L of levels)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
    const v=[G[j][i],G[j][i+1],G[j+1][i+1],G[j+1][i]];if(v.some(x=>!isFinite(x)))continue;
    if(Math.max(...v)-Math.min(...v)>jump)continue;
    const c=[[i,j],[i+1,j],[i+1,j+1],[i,j+1]],pts=[];
    for(let e=0;e<4;e++){const a=v[e]-L,b=v[(e+1)%4]-L;if((a<0)!==(b<0)){const t=a/(a-b),p=c[e],q=c[(e+1)%4];pts.push([xr[0]+(p[0]+(q[0]-p[0])*t)*dx,yr[0]+(p[1]+(q[1]-p[1])*t)*dy]);}}
    if(pts.length>=2){ctx.moveTo(P.X(pts[0][0]),P.Y(pts[0][1]));ctx.lineTo(P.X(pts[1][0]),P.Y(pts[1][1]));}
    if(pts.length===4){ctx.moveTo(P.X(pts[2][0]),P.Y(pts[2][1]));ctx.lineTo(P.X(pts[3][0]),P.Y(pts[3][1]));}}
  ctx.stroke();ctx.restore();}

/* ---------- laboratorios ---------- */
LABS['vc-funciones']=function(sec){
  const cv=$('#fn-cv',sec),rd=$('#fn-read',sec),sf=$('#fn-f',sec),gR=sl(sec,'fn-R',v=>nf(v,1),()=>draw1()),gg=$('#fn-g',sec);let P=null,hov=null;
  sf.onchange=gg.onchange=()=>draw1();
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.85,470,300);P=cplane(ctx,w,h,gR(),0,w,false);
    const f=FN[sf.value][1];domainColor(ctx,P,w,h,f,{grid:gg.checked,step:2});
    ctx.save();ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,P.cy);ctx.lineTo(w,P.cy);ctx.moveTo(P.cx,0);ctx.lineTo(P.cx,h);ctx.stroke();ctx.restore();
    if(hov){dot(ctx,P.X(hov[0]),P.Y(hov[1]),5,'#fff',K.ink);}
    const z=hov||[1,0.5],v=f(z);
    rd.innerHTML=row('f(z)',FN[sf.value][0])+sep+row('z',cs(z,3))+row('f(z)',v&&isFinite(v[0])?cs(v,3):'no definida')+row('|f(z)|',v?nt(C.abs(v),3):'—')+row('arg f(z)',v?deg(C.arg(v)):'—')+sep+
      rowT({z2:'Un cero doble en 0: el arcoíris da dos vueltas.',z3m1:'Tres ceros simples: las raíces cúbicas de la unidad.',inv:'Un polo simple en 0: colores en sentido horario.',mob:'Un cero en 1 y un polo en −1.',lor:'Polos simples en ±i: invisibles en el eje real, pero explican el comportamiento de 1/(1+x²).',exp:'Sin ceros ni polos; los colores se repiten cada 2π en vertical (periodo 2πi).',sin:'Ceros simples en nπ, y crece rápido lejos del eje real.',conj:'El arcoíris gira en sentido horario alrededor de 0, aunque no hay polo: z̄ no es analítica.',ratio:'|f| = 1 en todas partes y el color depende solo de la dirección: no hay límite en 0.'}[sf.value]||'');
  }
  cv.addEventListener('pointermove',e=>{if(!P)return;const r=cv.getBoundingClientRect();hov=[P.ix(e.clientX-r.left),P.iy(e.clientY-r.top)];draw1();});
  /* cuadrícula */
  const cv2=$('#fn-cv2',sec),rd2=$('#fn-read2',sec),sm=$('#fn-m',sec);const gx=sl(sec,'fn-x',v=>nf(v,1),()=>draw2()),gy=sl(sec,'fn-y',v=>nf(v,1),()=>draw2()),gs=sl(sec,'fn-s',v=>nf(v,2),()=>draw2());sm.onchange=()=>draw2();
  const MF={z2:z=>C.mul(z,z),exp:C.exp,inv:z=>C.div([1,0],z),jk:z=>C.add(z,C.div([1,0],z)),sin:C.sin};
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.55,380,240),f=MF[sm.value],cx=gx(),cy=gy(),s=gs();
    let m=1;for(let i=0;i<=8;i++)for(let j=0;j<=8;j++){const q=f([cx-s+2*s*i/8,cy-s+2*s*j/8]);if(q&&isFinite(q[0]))m=Math.max(m,Math.abs(q[0]),Math.abs(q[1]));}
    const [P1,P2,hw]=split(ctx,w,h,Math.max(2.5,Math.abs(cx)+s+0.3,Math.abs(cy)+s+0.3),Math.min(12,m*1.1));
    clipR(ctx,0,hw,h,()=>gridMap(ctx,P1,z=>z,cx-s,cx+s,cy-s,cy+s,8,8));
    clipR(ctx,w/2+4,hw,h,()=>gridMap(ctx,P2,f,cx-s,cx+s,cy-s,cy+s,8,8));
    label(ctx,'plano z',10,14,K.mut);label(ctx,'plano w = f(z)',w/2+14,14,K.mut);
    rd2.innerHTML=row('región',`[${nt(cx-s,2)}, ${nt(cx+s,2)}] × [${nt(cy-s,2)}, ${nt(cy+s,2)}]`)+sep+rowT({z2:'Las horizontales y verticales van a parábolas que se cortan en ángulo recto. Si la región contiene 0, allí los ángulos se duplican.',exp:'Horizontales → rayos; verticales → circunferencias.',inv:'Rectas → circunferencias que pasan por 0.',jk:'Joukowski: las circunferencias centradas en 0 van a elipses.',sin:'Verticales → hipérbolas; horizontales → elipses.'}[sm.value]);
  }
  return {draw(){draw1();draw2();}};
};

LABS['vc-cauchy-riemann']=function(sec){
  const cv=$('#cr-cv',sec),rd=$('#cr-read',sec),sf=$('#cr-f',sec),gh=sl(sec,'cr-h',v=>nf(v,2),()=>draw());let P1=null;const Z=[[0.8,0.6]];sf.onchange=()=>draw();
  function draw(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.55,400,250),f=FN[sf.value][1],z0=Z[0],hh=gh();
    const [Pa,Pb,hw]=split(ctx,w,h,2.4,1.4);P1=Pa;
    const e=1e-5,fz=f(z0),fx=C.sc(C.sub(f([z0[0]+e,z0[1]]),f([z0[0]-e,z0[1]])),1/(2*e)),fy=C.sc(C.sub(f([z0[0],z0[1]+e]),f([z0[0],z0[1]-e])),1/(2*e));
    const J=[[fx[0],fy[0]],[fx[1],fy[1]]],cr1=fx[0]-fy[1],cr2=fy[0]+fx[1],ok=Math.abs(cr1)<1e-4&&Math.abs(cr2)<1e-4,fp=[fx[0],fx[1]],nfp=C.abs(fp),Jn=Math.sqrt(Math.abs(det2(J[0][0],J[0][1],J[1][0],J[1][1])))||Math.hypot(...J.flat())/2||1;
    const sq=[[-1,-1],[1,-1],[1,1],[-1,1]].map(p=>[z0[0]+hh*p[0],z0[1]+hh*p[1]]),circ=[...Array(61).keys()].map(i=>[z0[0]+hh*Math.cos(i/60*TAU),z0[1]+hh*Math.sin(i/60*TAU)]);
    clipR(ctx,0,hw,h,()=>{poly(ctx,P1,sq,null,'rgba(15,118,110,.18)',K.t,2);poly(ctx,P1,circ,null,null,K.b,2);
      arrow(ctx,P1.X(z0[0]),P1.Y(z0[1]),P1.X(z0[0]+hh),P1.Y(z0[1]),K.b,2.5);arrow(ctx,P1.X(z0[0]),P1.Y(z0[1]),P1.X(z0[0]),P1.Y(z0[1]+hh),K.a,2.5);handle(ctx,P1,z0,K.ink);});
    const sc=1/(Jn||1),T=q=>{const d=C.sub(f(q),fz);return [d[0]*sc,d[1]*sc];};
    clipR(ctx,w/2+4,hw,h,()=>{const P=Pb,m=q=>{const t=T(q);return [t[0]+0,t[1]+0];};
      poly(ctx,P,sq.map(m),null,'rgba(217,72,15,.18)',K.b,2);poly(ctx,P,circ.map(m),null,null,K.b,2);
      const a=m([z0[0]+hh,z0[1]]),b=m([z0[0],z0[1]+hh]);arrow(ctx,P.cx,P.cy,P.X(a[0]),P.Y(a[1]),K.b,2.5);arrow(ctx,P.cx,P.cy,P.X(b[0]),P.Y(b[1]),K.a,2.5);dot(ctx,P.cx,P.cy,5,K.ink);});
    label(ctx,'plano z',10,14,K.mut);label(ctx,'imagen (centrada en f(z₀), ampliada)',w/2+14,14,K.mut);
    rd.innerHTML=row('f',FN[sf.value][0])+row('z₀',cs(z0,2))+row('f(z₀)',cs(fz,3))+sep+row('J = [[uₓ, u_y], [vₓ, v_y]]',mat(J.map(r=>r.map(v=>nt(v,3)))))+
      row('uₓ − v_y',nt(cr1,4))+row('u_y + vₓ',nt(cr2,4))+sep+
      (ok?row("f′(z₀)",cs(fp,3))+row("|f′|, arg f′",nt(nfp,3)+', '+deg(C.arg(fp)))+rowT(nfp>1e-6?'<span class="aa-ok">Cauchy-Riemann se cumple</span>: J = aI + bJ, el cuadradito solo gira y se escala.':'f′(z₀) = 0: punto crítico, aquí la función no es conforme.')
        :rowT('<span class="aa-no">Cauchy-Riemann falla</span>: J no es de la forma aI + bJ y el cuadradito se deforma. f no es derivable en sentido complejo en z₀.'));
  }
  dragPts(cv,()=>P1,Z,draw,{R:2.2,snap:0.05});
  return {draw};
};

LABS['vc-armonicas']=function(sec){
  const cv=$('#ha-cv',sec),rd=$('#ha-read',sec),sf=$('#ha-f',sec),ga=sl(sec,'ha-a',v=>nf(v,2),()=>{reset();draw();});let P=null,paused=false,parts=[];
  $('#ha-p',sec).onclick=e=>{paused=!paused;e.target.textContent=paused?'Seguir':'Pausa';};sf.onchange=()=>{reset();draw();};
  const L=C.log,mi=[0,-1];
  const OM={un:{f:z=>z,d:z=>[1,0],t:'Ω = z'},fu:{f:L,d:z=>C.div([1,0],z),t:'Ω = log z'},vo:{f:z=>C.mul(mi,L(z)),d:z=>C.div(mi,z),t:'Ω = −i log z'},
    di:{f:z=>C.div([1,0],z),d:z=>C.div([-1,0],C.mul(z,z)),t:'Ω = 1/z'},ci:{f:z=>C.add(z,C.div([ga()**2,0],z)),d:z=>C.sub([1,0],C.div([ga()**2,0],C.mul(z,z))),t:'Ω = z + a²/z'},
    es:{f:z=>C.mul(z,z),d:z=>C.sc(z,2),t:'Ω = z²'},fs:{f:z=>C.sub(L(C.add(z,[1,0])),L(C.sub(z,[1,0]))),d:z=>C.sub(C.div([1,0],C.add(z,[1,0])),C.div([1,0],C.sub(z,[1,0]))),t:'Ω = log(z + 1) − log(z − 1)'},
    cv:{f:z=>C.add(C.add(z,C.div([1,0],z)),C.sc(C.mul(mi,L(z)),ga()/TAU*4)),d:z=>C.add(C.sub([1,0],C.div([1,0],C.mul(z,z))),C.sc(C.div(mi,z),ga()/TAU*4)),t:'Ω = z + 1/z − i(Γ/2π) log z'}};
  function reset(){parts=[];for(let i=0;i<60;i++)parts.push(seed());}
  const seed=()=>{const k=sf.value;if(k==='un'||k==='ci'||k==='cv')return [-3+Math.random()*0.3,-2.2+Math.random()*4.4];if(k==='fu'||k==='fs')return C.add(k==='fs'?[-1,0]:[0,0],C.polar(0.15+Math.random()*0.2,Math.random()*TAU));return [Math.random()*6-3,Math.random()*4.4-2.2];};
  function draw(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.75,440,280);P=cplane(ctx,w,h,2.6,0,w,false);const o=OM[sf.value];
    const k=sf.value,inside=z=>(k==='ci'&&C.abs(z)<ga())||(k==='cv'&&C.abs(z)<1);
    const phi=(x,y)=>{const z=[x,y];if(inside(z))return NaN;const v=o.f(z);return v[0];},psi=(x,y)=>{const z=[x,y];if(inside(z))return NaN;const v=o.f(z);return v[1];};
    let lv=[];for(let i=-30;i<=30;i++)lv.push(i*(k==='un'||k==='ci'||k==='cv'?0.3:k==='es'?0.6:k==='di'?0.25:0.4));
    contours(ctx,P,phi,lv,'rgba(217,72,15,.6)',{dash:[4,3],lw:1.2,jump:2.5});
    contours(ctx,P,psi,lv,K.t,{lw:1.6,jump:2.5});
    if(k==='ci'||k==='cv'){const r=k==='ci'?ga():1;ctx.save();ctx.fillStyle='#e9e5da';ctx.strokeStyle=K.ink;ctx.lineWidth=2;ctx.beginPath();ctx.arc(P.cx,P.cy,r*P.s,0,TAU);ctx.fill();ctx.stroke();ctx.restore();}
    parts.forEach(p=>dot(ctx,P.X(p[0]),P.Y(p[1]),2.8,K.d));
    const ex={un:'Flujo uniforme hacia la derecha.',fu:'Fuente en el origen: líneas de corriente radiales y equipotenciales circulares.',vo:'Vórtice: los papeles se intercambian; el fluido gira.',di:'Dipolo: líneas de corriente circulares tangentes al eje real.',ci:'Cilindro de radio a: la circunferencia |z| = a es una línea de corriente; puntos de estancamiento en ±a.',es:'Flujo en una esquina de 90°: líneas hiperbólicas xy = cte.',fs:'Fuente en −1 y sumidero en +1: las líneas van de una a otro (como las de campo de dos cargas opuestas).',cv:'Cilindro con circulación: los puntos de estancamiento bajan; aparece una fuerza de sustentación (Kutta-Joukowski).'}[k];
    rd.innerHTML=row('potencial complejo',o.t)+row('velocidad','v = conj(Ω′(z))')+sep+rowT('<span class="sw" style="background:#0f766e"></span>líneas de corriente ψ = cte')+rowT('<span class="sw" style="background:#d9480f"></span>equipotenciales φ = cte')+sep+rowT(ex);
  }
  reset();
  return {draw,tick(dt){if(paused||!vis(cv))return;const o=OM[sf.value],k=sf.value;parts=parts.map(p=>{const d=o.d(p),v=[d[0],-d[1]],s=Math.hypot(...v),st=Math.min(dt*0.8,0.08/(s+1e-9))*s;
      let q=[p[0]+v[0]*Math.min(dt*0.8,0.08/(s+1e-9)),p[1]+v[1]*Math.min(dt*0.8,0.08/(s+1e-9))];
      if(!isFinite(q[0])||Math.abs(q[0])>4||Math.abs(q[1])>2.8||C.abs(q)<0.05||((k==='ci')&&C.abs(q)<ga()*0.98)||(k==='fs'&&C.abs(C.sub(q,[1,0]))<0.06))q=seed();return q;});draw();}};
};

LABS['vc-elementales']=function(sec){
  const cv=$('#el-cv',sec),rd=$('#el-read',sec),sf=$('#el-f',sec),gh=sl(sec,'el-h',v=>nf(v,2),()=>draw1()),gw=sl(sec,'el-w',v=>nf(v,2),()=>draw1());sf.onchange=()=>draw1();
  const F={exp:C.exp,sin:C.sin,cos:C.cos,cosh:z=>C.cos(C.mul([0,1],z))};
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.55,380,240),k=sf.value,f=F[k],H=gh(),Wd=gw();
    const x0=k==='exp'?-Wd/2:-Wd/2,x1=Wd/2,y0=-H,y1=H;
    let m=1;for(let i=0;i<=10;i++)for(let j=0;j<=10;j++){const q=f([x0+(x1-x0)*i/10,y0+(y1-y0)*j/10]);m=Math.max(m,Math.abs(q[0]),Math.abs(q[1]));}
    const [P1,P2,hw]=split(ctx,w,h,Math.max(3.4,H+0.3),Math.min(14,m*1.1));
    clipR(ctx,0,hw,h,()=>{ctx.fillStyle='rgba(15,118,110,.08)';ctx.fillRect(P1.X(x0),P1.Y(y1),(x1-x0)*P1.s,(y1-y0)*P1.s);gridMap(ctx,P1,z=>z,x0,x1,y0,y1,8,12);});
    clipR(ctx,w/2+4,hw,h,()=>gridMap(ctx,P2,f,x0,x1,y0,y1,8,12));
    label(ctx,'plano z',10,14,K.mut);label(ctx,'plano w',w/2+14,14,K.mut);
    rd.innerHTML=row('f',{exp:'e^z',sin:'sin z',cos:'cos z',cosh:'cosh z'}[k])+row('rectángulo',`|x| ≤ ${nt(Wd/2,2)}, |y| ≤ ${nt(H,2)}`)+sep+
      rowT({exp:`Horizontales → rayos de ángulo y; verticales → circunferencias de radio eˣ (de ${nt(Math.exp(x0),2)} a ${nt(Math.exp(x1),2)}). ${Math.abs(H-Math.PI)<0.05?'Con |y| ≤ π la imagen da una vuelta completa.':H>Math.PI?'Con |y| > π la imagen se superpone: e^z no es inyectiva.':''}`,
        sin:'sin(x + iy) = sin x cosh y + i cos x sinh y: las verticales van a hipérbolas y las horizontales a elipses, todas con focos en ±1.',cos:'Igual que sin z, desplazado π/2.',cosh:'cosh z = cos(iz): la figura de cos girada 90° en el dominio.'}[k]);
  }
  const cv2=$('#el-cv2',sec),rd2=$('#el-read2',sec),gx=sl(sec,'el-x',v=>nf(v,2),()=>draw2());
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.6,360,240),x=gx();
    const A=axes(ctx,{l:40,t:14,w:w-54,h:h-40,xr:[-3,3],yr:[0,10],xl:'y',yl:'|sin(x + iy)|'});
    curve(ctx,A,y=>C.abs(C.sin([x,y])),-3,3,K.t,3);curve(ctx,A,y=>Math.sinh(Math.abs(y)),-3,3,K.b,1.5,[5,4]);curve(ctx,A,()=>1,-3,3,K.ax,1,[3,3]);
    rd2.innerHTML=row('x',nf(x,2))+row('|sin x| (en y = 0)',nt(Math.abs(Math.sin(x)),3))+row('|sin(x + 3i)|',nt(C.abs(C.sin([x,3])),3))+sep+
      rowT('<span class="sw" style="background:#0f766e"></span>|sin(x + iy)| = √(sin²x + sinh²y)')+rowT('<span class="sw" style="background:#d9480f"></span>sinh|y|, cota inferior')+rowT('En ℝ, |sin x| ≤ 1; en ℂ, el seno no está acotado (Liouville).');
  }
  return {draw(){draw1();draw2();}};
};

LABS['vc-log-ramas']=function(sec){
  const cv=$('#lg-cv',sec),rd=$('#lg-read',sec),st={yaw:0.7,pitch:0.45,auto:false},gt=sl(sec,'lg-t',v=>nf(v,2),()=>draw1()),gf=segm(sec,'lg-f','f',()=>draw1());let play=false;
  $('#lg-play',sec).onclick=()=>{play=!play;};cam3(cv,st,()=>draw1());
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.85,470,300),P=P3(st,w,h,1.7),th=gt()*TAU,sq=gf()==='s',hs=0.22;
    const L=1.4;face3(ctx,P,[[-L,-L,-1.4],[L,-L,-1.4],[L,L,-1.4],[-L,L,-1.4]],'rgba(220,240,235,.5)','rgba(15,118,110,.25)');
    ctx.save();ctx.strokeStyle=K.ink;ctx.lineWidth=2;const a=P.T(0,0,-1.4),b=P.T(-L,0,-1.4);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();ctx.restore();
    const T0=-2*TAU,T1=2*TAU;
    for(let r=0.3;r<=1.2;r+=0.3){ctx.save();ctx.strokeStyle='rgba(15,118,110,.35)';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<=400;i++){const t=T0+(T1-T0)*i/400,p=P.T(r*Math.cos(t),r*Math.sin(t),t*hs/ (sq?2:1)*(sq?1:1)*(1/1));i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);}ctx.stroke();ctx.restore();}
    for(let i=0;i<=48;i++){const t=T0+(T1-T0)*i/48;const p=P.T(0.3*Math.cos(t),0.3*Math.sin(t),t*hs),q=P.T(1.2*Math.cos(t),1.2*Math.sin(t),t*hs);
      const sheet=Math.floor((t+Math.PI)/TAU);ctx.save();ctx.strokeStyle=sq?(((sheet%2)+2)%2?'rgba(217,72,15,.45)':'rgba(36,83,201,.45)'):'rgba(15,118,110,.35)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();ctx.restore();}
    const pz=P.T(Math.cos(th),Math.sin(th),-1.4),ps=P.T(Math.cos(th),Math.sin(th),th*hs);
    ctx.save();ctx.setLineDash([4,4]);ctx.strokeStyle=K.ax;ctx.beginPath();ctx.moveTo(pz[0],pz[1]);ctx.lineTo(ps[0],ps[1]);ctx.stroke();ctx.restore();
    dot(ctx,pz[0],pz[1],5,K.ink);dot(ctx,ps[0],ps[1],7,K.b);
    const z=C.polar(1,th),Arg=C.arg(z),cont=sq?C.polar(1,th/2):[0,th],prin=sq?C.polar(1,Arg/2):[0,Arg];
    const k=Math.round((th-Arg)/TAU);
    rd.innerHTML=row('z',cs(z,3))+row('θ acumulado',nt(th,3)+' rad ('+nt(gt(),2)+' vueltas)')+row('Arg z (principal)',nt(Arg,3))+sep+
      (sq?row('√z continuo','e^{iθ/2} = '+cs(cont,3))+row('√z rama principal',cs(prin,3))+rowT(Math.abs(cont[0]-prin[0])+Math.abs(cont[1]-prin[1])<1e-6?'Estás en la hoja principal.':'Estás en la otra hoja: el valor continuo es −(rama principal). Dos vueltas te devuelven a la hoja de partida.')
        :row('log z continuo','i·θ = '+cs(cont,3))+row('Log z principal',cs(prin,3))+row('diferencia','2πi · '+k)+rowT(k?'Diste '+Math.abs(k)+' vuelta'+(Math.abs(k)>1?'s':'')+' alrededor de 0: el logaritmo continuo difiere de la rama principal en 2πi·'+k+'.':'Sin vueltas completas: coincide con la rama principal.'));
  }
  const cv2=$('#lg-cv2',sec),rd2=$('#lg-read2',sec),ga=sl(sec,'lg-a',v=>nt(v,0)+'°',()=>draw2()),gg=segm(sec,'lg-g','g',()=>draw2());
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.85,470,300),P=cplane(ctx,w,h,2.2,0,w,false),al=ga()*Math.PI/180,sq=gg()==='s';
    const br=z=>{let t=Math.atan2(z[1],z[0]);while(t>al)t-=TAU;while(t<=al-TAU)t+=TAU;return t;};
    const f=z=>{const r=C.abs(z),t=br(z);return sq?C.polar(Math.sqrt(r),t/2):[Math.log(r),t];};
    domainColor(ctx,P,w,h,f,{grid:true});
    ctx.save();ctx.strokeStyle='#000';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(P.cx,P.cy);ctx.lineTo(P.X(9*Math.cos(al)),P.Y(9*Math.sin(al)));ctx.stroke();ctx.restore();dot(ctx,P.cx,P.cy,5,'#fff',K.ink);
    rd2.innerHTML=row('rama',sq?'√z':'log z')+row('corte',`rayo de ángulo ${nt(ga(),0)}°`)+row('argumento usado',`(${nt(ga()-360,0)}°, ${nt(ga(),0)}°]`)+sep+
      rowT(sq?'Al cruzar el corte, √z cambia de signo: el color salta 180°.':'Al cruzar el corte, la parte imaginaria salta 2π. El color (argumento de log z) cambia bruscamente.')+rowT(Math.abs(ga()-180)<1?'α = 180°: rama principal, con el corte sobre el semieje real negativo.':'');
  }
  return {draw(){draw1();draw2();},tick(dt){if(!play||!vis(cv))return;let v=gt()+dt*0.25;if(v>2)v=-2;gt.set(v);draw1();}};
};

LABS['vc-conformes']=function(sec){
  const cv=$('#cf-cv',sec),rd=$('#cf-read',sec),sf=$('#cf-f',sec);let P1=null;const Z=[[0.6,0.5]];sf.onchange=()=>draw1();
  const F={inv:{f:z=>C.div([1,0],z),M:[[0,1],[1,0]],R2:3},cay:{f:z=>C.div(C.sub(z,[0,1]),C.add(z,[0,1])),M:[['1','−i'],['1','i']],R2:2},dsk:{f:z=>C.div(C.sub(z,[0.5,0]),C.sub([1,0],C.sc(z,0.5))),M:[['1','−½'],['−½','1']],R2:2.5},
    z2:{f:z=>C.mul(z,z),M:null,R2:4},jk:{f:z=>C.add(z,C.div([1,0],z)),M:null,R2:3.5}};
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.55,380,240),o=F[sf.value],[Pa,Pb,hw]=split(ctx,w,h,2,o.R2);P1=Pa;
    clipR(ctx,0,hw,h,()=>gridMap(ctx,Pa,z=>z,-2,2,-2,2,16,16,{lw:1}));
    clipR(ctx,w/2+4,hw,h,()=>{gridMap(ctx,Pb,o.f,-2,2,-2,2,16,16,{lw:1,n:240});if(sf.value==='cay'||sf.value==='dsk'){unitC(ctx,Pb);}});
    const z=Z[0],d=0.35,a=[z[0]+d,z[1]],b=[z[0],z[1]+d];
    clipR(ctx,0,hw,h,()=>{ctx.save();ctx.strokeStyle=K.ink;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(Pa.X(a[0]),Pa.Y(a[1]));ctx.lineTo(Pa.X(z[0]),Pa.Y(z[1]));ctx.lineTo(Pa.X(b[0]),Pa.Y(b[1]));ctx.stroke();ctx.restore();handle(ctx,Pa,z,K.ink);});
    const seg=(p,q)=>{const pts=[];for(let i=0;i<=20;i++)pts.push(o.f([p[0]+(q[0]-p[0])*i/20,p[1]+(q[1]-p[1])*i/20]));return pts;};
    clipR(ctx,w/2+4,hw,h,()=>{ctx.save();ctx.strokeStyle=K.ink;ctx.lineWidth=3;ctx.beginPath();[seg(z,a),seg(z,b)].forEach(s=>s.forEach((q,i)=>i?ctx.lineTo(Pb.X(q[0]),Pb.Y(q[1])):ctx.moveTo(Pb.X(q[0]),Pb.Y(q[1]))));ctx.stroke();ctx.restore();
      const fz=o.f(z);if(isFinite(fz[0]))dot(ctx,Pb.X(fz[0]),Pb.Y(fz[1]),5,K.ink);});
    const e=1e-5,fp=C.sc(C.sub(o.f([z[0]+e,z[1]]),o.f([z[0]-e,z[1]])),1/(2*e)),A1=C.sub(o.f([z[0]+e,z[1]]),o.f(z)),A2=C.sub(o.f([z[0],z[1]+e]),o.f(z));
    const ang=Math.abs(C.arg(C.div(A2,A1)))*180/Math.PI;
    label(ctx,'plano z',10,14,K.mut);label(ctx,'plano w',w/2+14,14,K.mut);
    rd.innerHTML=(o.M?row('matriz',mat(o.M)):row('tipo','no es Möbius'))+row('z',cs(z,2))+row('w = f(z)',cs(o.f(z),3))+row("|f′(z)|",nt(C.abs(fp),3))+row('ángulo entre las imágenes',nt(ang,1)+'°')+sep+
      rowT(C.abs(fp)<0.02?'<span class="aa-no">Punto crítico (f′ ≈ 0)</span>: el ángulo no se conserva.':'<span class="aa-ok">Conforme</span>: el ángulo recto se conserva.')+
      rowT({inv:'1/z intercambia 0 e ∞ y lleva rectas a circunferencias por 0.',cay:'El semiplano superior va al disco unidad; el eje real, a la circunferencia.',dsk:'Automorfismo del disco: lleva ½ al centro.',z2:'En z = 0 los ángulos se duplican.',jk:'Lleva la circunferencia |z| = 1 al segmento [−2, 2]; puntos críticos en ±1.'}[sf.value]);
  }
  dragPts(cv,()=>P1,Z,draw1,{R:1.9,snap:0.05});
  const cv2=$('#cf-cv2',sec),rd2=$('#cf-read2',sec);let Pq=null;const Q=[[0.7,0.9]];
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.55,380,240),[Pa,Pb,hw]=split(ctx,w,h,2.5,1.5);Pq=Pa;const f=F.cay.f;
    clipR(ctx,0,hw,h,()=>{ctx.fillStyle='rgba(43,138,62,.12)';ctx.fillRect(0,0,hw,Pa.cy);gridMap(ctx,Pa,z=>z,-2.5,2.5,0,2.5,10,5,{lw:1});});
    clipR(ctx,w/2+4,hw,h,()=>{ctx.fillStyle='rgba(43,138,62,.12)';ctx.beginPath();ctx.arc(Pb.cx,Pb.cy,Pb.s,0,TAU);ctx.fill();gridMap(ctx,Pb,f,-2.5,2.5,0.001,2.5,10,5,{lw:1,n:240});unitC(ctx,Pb);});
    const z=Q[0],wv=f(z);clipR(ctx,0,hw,h,()=>handle(ctx,Pa,z,K.ink));clipR(ctx,w/2+4,hw,h,()=>{if(C.abs(wv)<5)dot(ctx,Pb.X(wv[0]),Pb.Y(wv[1]),6,K.ink);});
    dot(ctx,Pa.X(0),Pa.Y(1),4,K.d);label(ctx,'i',Pa.X(0)+6,Pa.Y(1)-8,K.d);
    rd2.innerHTML=row('z',cs(z,2))+row('Im z',nt(z[1],2))+row('w',cs(wv,3))+row('|w|',nt(C.abs(wv),3))+sep+
      rowT(z[1]>0?'<span class="aa-ok">Im z > 0 ⇒ |w| < 1</span>: el punto cae dentro del disco.':z[1]<0?'Im z < 0 ⇒ |w| > 1: fuera del disco.':'Im z = 0 ⇒ |w| = 1: sobre la circunferencia.')+rowT('|w| = |z − i| / |z + i| es el cociente de las distancias a i y a −i.');
  }
  dragPts(cv2,()=>Pq,Q,draw2,{R:2.4,snap:0.05});
  return {draw(){draw1();draw2();}};
};

/* ================= VC · UNIDAD III · INTEGRACIÓN ================= */
const W3='Unidad III · Integración compleja';
V.push(topicPage({id:'vc-contorno',pre:'ct',course:VC,unit:W3,title:'Integrales de contorno',
lead:String.raw`Integrar en el plano complejo es integrar a lo largo de una curva. La definición se reduce a una integral real con un parámetro, pero el resultado clave del tema es una sola cuenta: \(\oint(z-z_0)^n\,dz\) vale \(2\pi i\) si \(n=-1\) y cero en cualquier otro caso. De ahí sale todo el resto del curso.`,
res:[String.raw`<b>Curvas.</b> Un contorno es una curva \(\gamma:[a,b]\to\mathbb{C}\), \(t\mapsto z(t)\), de clase \(C^1\) a trozos. Es cerrado si \(z(a)=z(b)\); la orientación positiva deja el interior a la izquierda (antihoraria para una circunferencia).`,
String.raw`<b>Definición.</b> \(\displaystyle\int_\gamma f(z)\,dz=\int_a^b f(z(t))\,z'(t)\,dt\). No depende de la parametrización mientras se conserve el sentido; si se invierte, cambia de signo.`,
String.raw`<b>Como integrales de línea.</b> Con \(f=u+iv\) y \(dz=dx+i\,dy\): \(\int_\gamma f\,dz=\int_\gamma(u\,dx-v\,dy)+i\int_\gamma(v\,dx+u\,dy)\). Son dos integrales de línea reales de Cálculo 3.`,
String.raw`<b>Estimación ML.</b> Si \(|f|\le M\) sobre \(\gamma\) y \(L\) es la longitud de \(\gamma\), entonces \(\left|\int_\gamma f\,dz\right|\le ML\). Es la herramienta para probar que una integral sobre un arco grande tiende a cero.`,
String.raw`<b>La integral fundamental.</b> Sobre \(|z-z_0|=r\) con \(z=z_0+re^{it}\): \(\displaystyle\oint(z-z_0)^n\,dz=\int_0^{2\pi}r^ne^{int}\,ire^{it}\,dt=ir^{n+1}\int_0^{2\pi}e^{i(n+1)t}dt\), que vale \(2\pi i\) si \(n=-1\) y \(0\) si \(n\neq-1\). No depende de \(r\).`,
String.raw`<b>Primitivas.</b> Si \(F'=f\) en un dominio que contiene a \(\gamma\), entonces \(\int_\gamma f\,dz=F(z_{\text{fin}})-F(z_{\text{inicio}})\): la integral no depende del camino y es cero sobre curvas cerradas. Por eso \(1/z\) no tiene primitiva en \(\mathbb{C}\setminus\{0\}\): su integral sobre una vuelta es \(2\pi i\neq0\), el salto del logaritmo.`,
String.raw`<b>Dependencia del camino.</b> Para funciones no analíticas, la integral entre dos puntos sí depende del camino. Por ejemplo, de 0 a \(1+i\), \(\int\bar z\,dz\) vale \(1\) por el segmento recto y \(1+i\) por el camino que pasa por \(1\).`,
String.raw`<b>En física: circulación y flujo.</b> Si \(\mathbf{F}=(F_x,F_y)\) y \(f=F_x-iF_y\), entonces \(\oint f\,dz=\oint\mathbf{F}\cdot d\mathbf{r}+i\oint\mathbf{F}\cdot\hat{\mathbf{n}}\,ds\): la parte real es la circulación y la imaginaria, el flujo a través de la curva.`],
lab:`<div class="controls" style="margin:0 0 12px">f = ${sel('ct-f',[['inv','1/z'],['z','z'],['conj','z̄'],['z2','z²'],['inv2','1/z²']])} camino = ${sel('ct-g',[['c','circunferencia (cerrada)'],['s','segmento 0 → 1 + i'],['l','0 → 1 → 1 + i'],['p','parábola y = x², de 0 a 1 + i']])}${btn('ct-play','Animar')}</div>`+
 lab2('ct-cv',slider('ct-r','radio',0.3,2,0.05,1),'ct-read',String.raw`Izquierda: el camino \(\gamma\) en el plano \(z\); arrastra el centro de la circunferencia. Derecha: la suma parcial \(S(t)=\int_{\gamma[0,t]}f\,dz\) en el plano complejo: cada paso añade el vector \(f(z)\,\Delta z\). Su punto final es la integral. Con \(1/z\) alrededor del origen llega a \(2\pi i\); si el origen queda fuera, vuelve a 0.`),
laws:[['Definición',String.raw`\int_\gamma f(z)\,dz=\int_a^bf\big(z(t)\big)\,z'(t)\,dt`,'Se reduce a dos integrales reales.'],
 ['Integral fundamental',String.raw`\oint_{|z-z_0|=r}(z-z_0)^n\,dz=\begin{cases}2\pi i,&n=-1\\0,&n\neq-1\end{cases}`,'Válida para todo entero n y todo r > 0.'],
 ['Estimación ML',String.raw`\Big|\int_\gamma f\,dz\Big|\le M\,L,\qquad M=\max_\gamma|f|`,'L: longitud del contorno.'],
 ['Primitiva',String.raw`F'=f\ \Rightarrow\ \int_\gamma f\,dz=F\big(z(b)\big)-F\big(z(a)\big)`,'Independencia del camino; integral nula en curvas cerradas.'],
 ['Sentido opuesto',String.raw`\int_{-\gamma}f\,dz=-\int_\gamma f\,dz`,'Invertir el recorrido cambia el signo.'],
 ['Circulación y flujo',String.raw`\oint(F_x-iF_y)\,dz=\oint\mathbf{F}\cdot d\mathbf{r}+i\oint\mathbf{F}\cdot\hat{\mathbf{n}}\,ds`,'Interpretación física de la integral compleja.']],
ex:[String.raw`Calcula \(\int_\gamma\bar z\,dz\) de \(0\) a \(1+i\) por el segmento recto y por el camino \(0\to1\to1+i\).`,
 [String.raw`Segmento: \(z=(1+i)t\), \(dz=(1+i)dt\), \(\bar z=(1-i)t\). \(\int_0^1(1-i)(1+i)t\,dt=2\int_0^1t\,dt=1\).`,
  String.raw`Tramo \(0\to1\): \(z=t\), \(\int_0^1t\,dt=\tfrac12\).`,
  String.raw`Tramo \(1\to1+i\): \(z=1+it\), \(dz=i\,dt\), \(\bar z=1-it\). \(\int_0^1(1-it)\,i\,dt=i+\tfrac12\). Total: \(\tfrac12+\tfrac12+i=1+i\).`,
  String.raw`Los resultados difieren: \(\bar z\) no tiene primitiva. La diferencia, \(i\), es \(2i\) veces el área del triángulo encerrado (\(\tfrac12\)), como predice \(\oint\bar z\,dz=2i\cdot\text{Área}\).`]],
prev:['vc-conformes','Mapeos conformes y Möbius'],next:['vc-cauchy-goursat','Teorema de Cauchy-Goursat'],
ref:'Churchill &amp; Brown, cap. 4; Needham, cap. 8 y 11'}));

V.push(topicPage({id:'vc-cauchy-goursat',pre:'cg',course:VC,unit:W3,title:'Teorema de Cauchy-Goursat',
lead:String.raw`Si \(f\) es holomorfa dentro y sobre una curva cerrada, su integral sobre la curva es cero. Es el teorema central de la variable compleja: implica que las integrales no dependen del camino y que los contornos se pueden deformar libremente mientras no crucen una singularidad.`,
res:[String.raw`<b>Enunciado.</b> Si \(f\) es holomorfa en un dominio simplemente conexo \(D\) y \(\gamma\) es una curva cerrada en \(D\), entonces \(\oint_\gamma f\,dz=0\).`,
String.raw`<b>Idea de la prueba (Cauchy).</b> Con Green: \(\oint(u\,dx-v\,dy)=\iint(-v_x-u_y)\,dA\) y \(\oint(v\,dx+u\,dy)=\iint(u_x-v_y)\,dA\). Por Cauchy-Riemann ambos integrandos son cero. Goursat demostró el teorema sin suponer que \(f'\) sea continua, subdividiendo triángulos.`,
String.raw`<b>Independencia del camino.</b> En un dominio simplemente conexo, \(\int_{z_1}^{z_2}f\,dz\) no depende del camino, y \(F(z)=\int_{z_0}^zf\) es una primitiva holomorfa de \(f\).`,
String.raw`<b>Deformación de contornos.</b> Si \(f\) es holomorfa en la región entre dos curvas cerradas \(\gamma_1\) y \(\gamma_2\) recorridas en el mismo sentido, \(\oint_{\gamma_1}f\,dz=\oint_{\gamma_2}f\,dz\). Un contorno puede encogerse hasta rodear de cerca cada singularidad.`,
String.raw`<b>Dominios con agujeros.</b> Si \(\gamma\) encierra los agujeros \(\gamma_1,\dots,\gamma_k\): \(\oint_\gamma f\,dz=\sum_j\oint_{\gamma_j}f\,dz\). La integral solo “ve” las singularidades encerradas.`,
String.raw`<b>Las hipótesis importan.</b> \(1/z\) es holomorfa en \(\mathbb{C}\setminus\{0\}\), que no es simplemente conexo, y \(\oint_{|z|=1}dz/z=2\pi i\). \(\bar z\) no es holomorfa y \(\oint\bar z\,dz=2i\cdot\text{Área}\neq0\).`,
String.raw`<b>Teorema de Morera (recíproco).</b> Si \(f\) es continua en un dominio y \(\oint_Tf\,dz=0\) para todo triángulo \(T\), entonces \(f\) es holomorfa.`,
String.raw`<b>En física.</b> Un flujo ideal sin fuentes ni vórtices dentro de una curva tiene circulación y flujo nulos a través de ella: \(\oint\Omega'(z)\,dz=0\).`],
lab:`<div class="controls" style="margin:0 0 12px">f = ${sel('cg-f',[['exp','e^z (entera)'],['inv','1/z (polo en 0)'],['lor','1/(z² + 1) (polos en ±i)'],['inv2','1/z² (polo doble en 0)'],['conj','z̄ (no holomorfa)']])}${btn('cg-reset','Contorno inicial')}</div>`+
 lab2('cg-cv','','cg-read',String.raw`Arrastra los vértices del contorno (recorrido en sentido antihorario). Las cruces son las singularidades. Mientras no encierres ninguna, \(\oint f\,dz=0\) aunque deformes mucho la curva. Al encerrar un polo de \(1/z\) aparece \(2\pi i\); con \(\bar z\) la integral nunca es cero y vale \(2i\) veces el área.`),
laws:[['Teorema de Cauchy-Goursat',String.raw`f\ \text{holomorfa en }D\ \text{simplemente conexo}\ \Rightarrow\ \oint_\gamma f\,dz=0`,'Para toda curva cerrada γ en D.'],
 ['Vía Green',String.raw`\oint_\gamma f\,dz=\iint_R\Big(-\frac{\partial v}{\partial x}-\frac{\partial u}{\partial y}\Big)dA+i\iint_R\Big(\frac{\partial u}{\partial x}-\frac{\partial v}{\partial y}\Big)dA`,'Ambas integrales se anulan por Cauchy-Riemann.'],
 ['Forma compleja de Green',String.raw`\oint_\gamma f\,dz=2i\iint_R\frac{\partial f}{\partial\bar z}\,dA`,String.raw`Con \(f=\bar z\): \(\partial f/\partial\bar z=1\) y la integral es \(2i\cdot\text{Área}\).`],
 ['Deformación',String.raw`\oint_{\gamma_1}f\,dz=\oint_{\gamma_2}f\,dz`,'Si f es holomorfa en la región entre γ₁ y γ₂.'],
 ['Varios agujeros',String.raw`\oint_\gamma f\,dz=\sum_{j=1}^k\oint_{\gamma_j}f\,dz`,'Cada γⱼ rodea una singularidad.'],
 ['Morera',String.raw`\oint_Tf\,dz=0\ \ \forall\,T\ \Rightarrow\ f\ \text{holomorfa}`,'f continua; T recorre los triángulos del dominio.']],
ex:[String.raw`Calcula \(\oint_\gamma\dfrac{dz}{z^2+1}\) cuando \(\gamma\) es (a) \(|z|=\tfrac12\), (b) \(|z-i|=1\), (c) \(|z|=2\).`,
 [String.raw`(a) Los polos \(\pm i\) están fuera de \(|z|=\tfrac12\): \(f\) es holomorfa dentro y, por Cauchy-Goursat, la integral es \(0\).`,
  String.raw`(b) Solo \(i\) queda dentro. Fracciones parciales: \(\dfrac{1}{z^2+1}=\dfrac{1}{2i}\Big(\dfrac{1}{z-i}-\dfrac{1}{z+i}\Big)\). El segundo término es holomorfo dentro; el primero da \(\tfrac1{2i}\cdot2\pi i=\pi\).`,
  String.raw`(c) Encierra ambos polos: \(\tfrac{1}{2i}(2\pi i-2\pi i)=0\). La contribución de los dos polos se cancela.`,
  String.raw`Comprobación de (c) con ML sobre \(|z|=R\): \(\big|\oint\big|\le\dfrac{2\pi R}{R^2-1}\to0\) cuando \(R\to\infty\), y por deformación la integral es la misma para todo \(R>1\): tiene que ser \(0\).`],
 'Reprodúcelo en el laboratorio con 1/(z² + 1).'],
prev:['vc-contorno','Integrales de contorno'],next:['vc-formula-cauchy','Fórmula integral de Cauchy'],
ref:'Churchill &amp; Brown, cap. 4; Ahlfors, cap. 4; Needham, cap. 8'}));

V.push(topicPage({id:'vc-formula-cauchy',pre:'fc',course:VC,unit:W3,title:'Fórmula integral de Cauchy y consecuencias',
lead:String.raw`Los valores de una función holomorfa en el interior de una curva quedan determinados por sus valores en la curva. De esa fórmula salen resultados sin análogo real: una función holomorfa tiene infinitas derivadas, una función entera acotada es constante y todo polinomio tiene raíces en \(\mathbb{C}\).`,
res:[String.raw`<b>Fórmula integral.</b> Si \(f\) es holomorfa dentro y sobre \(\gamma\) (simple, positiva) y \(z_0\) está dentro: \(f(z_0)=\dfrac{1}{2\pi i}\oint_\gamma\dfrac{f(z)}{z-z_0}\,dz\). Prueba: se deforma \(\gamma\) a un círculo pequeño alrededor de \(z_0\), donde \(f(z)\approx f(z_0)\), y se usa \(\oint dz/(z-z_0)=2\pi i\).`,
String.raw`<b>Derivadas.</b> Derivando bajo la integral: \(f^{(n)}(z_0)=\dfrac{n!}{2\pi i}\oint_\gamma\dfrac{f(z)}{(z-z_0)^{n+1}}\,dz\). Una función holomorfa es infinitamente derivable, algo que en \(\mathbb{R}\) no ocurre (\(x|x|\) es derivable una vez y no dos).`,
String.raw`<b>Valor medio.</b> Sobre \(|z-z_0|=r\): \(f(z_0)=\dfrac1{2\pi}\int_0^{2\pi}f(z_0+re^{i\theta})\,d\theta\). El valor en el centro es el promedio sobre la circunferencia.`,
String.raw`<b>Desigualdades de Cauchy.</b> Si \(|f|\le M\) en \(|z-z_0|=r\): \(|f^{(n)}(z_0)|\le\dfrac{n!\,M}{r^n}\).`,
String.raw`<b>Liouville.</b> Una función entera y acotada es constante: con \(n=1\), \(|f'(z_0)|\le M/r\to0\) al hacer \(r\to\infty\). Por eso \(\sin z\) y \(\cos z\) no pueden estar acotadas en \(\mathbb{C}\).`,
String.raw`<b>Teorema fundamental del álgebra.</b> Si un polinomio \(p\) no constante no tuviera raíces, \(1/p\) sería entera y acotada (porque \(|p|\to\infty\)), luego constante: absurdo. Todo polinomio de grado \(n\) tiene \(n\) raíces complejas contando multiplicidad.`,
String.raw`<b>Módulo máximo.</b> Si \(f\) es holomorfa y no constante en un dominio, \(|f|\) no alcanza un máximo en su interior. En un dominio acotado, el máximo de \(|f|\) en la clausura está en la frontera.`,
String.raw`<b>En física.</b> Es la versión compleja de que un potencial armónico queda determinado por sus valores en la frontera (problema de Dirichlet). La fórmula de Poisson para el disco es su parte real.`],
lab:tabs([['vm','Valor medio',`<div class="controls" style="margin:0 0 12px">f = ${sel('fc-f',[['exp','e^z'],['z2','z² + 1'],['sin','sin z'],['cub','z³ − z']])}</div>`+
  lab2('fc-cv',slider('fc-r','radio r',0.1,1.8,0.05,1),'fc-read',String.raw`Izquierda: arrastra \(z_0\); la circunferencia de radio \(r\) está coloreada según el ángulo. Derecha: la curva imagen \(f(z_0+re^{i\theta})\) en el plano \(w\), con los mismos colores. Su promedio (cruz) coincide con \(f(z_0)\) (punto negro) para cualquier radio.`)],
 ['mm','Módulo máximo',`<div class="controls" style="margin:0 0 12px">f = ${sel('fc-g',[['exp','e^z'],['z2','z² + 1'],['sin','sin z'],['cub','z³ − z']])}</div>`+
  lab2('fc-cv2',slider('fc-R','radio del disco',0.3,2,0.05,1.2),'fc-read2',String.raw`Mapa de calor de \(|f|\) en el disco (arrastra el centro). El punto negro marca dónde \(|f|\) es máximo en el disco cerrado: siempre queda en el borde, nunca en el interior. El blanco marca el mínimo de \(|f|\), que puede estar dentro, pero solo si allí \(f=0\).`)]]),
laws:[['Fórmula integral de Cauchy',String.raw`f(z_0)=\frac1{2\pi i}\oint_\gamma\frac{f(z)}{z-z_0}\,dz`,'Para z₀ dentro de γ, con f holomorfa dentro y sobre γ.'],
 ['Fórmula para las derivadas',String.raw`f^{(n)}(z_0)=\frac{n!}{2\pi i}\oint_\gamma\frac{f(z)}{(z-z_0)^{n+1}}\,dz`,'Holomorfa implica infinitamente derivable.'],
 ['Valor medio',String.raw`f(z_0)=\frac1{2\pi}\int_0^{2\pi}f\big(z_0+re^{i\theta}\big)\,d\theta`,'La parte real da el valor medio de las armónicas.'],
 ['Desigualdades de Cauchy',String.raw`|f^{(n)}(z_0)|\le\frac{n!\,M_r}{r^n},\qquad M_r=\max_{|z-z_0|=r}|f|`,'Controlan las derivadas con el tamaño de f.'],
 ['Liouville',String.raw`f\ \text{entera},\ |f|\le M\ \Rightarrow\ f\ \text{constante}`,'De la desigualdad de Cauchy con n = 1 y r → ∞.'],
 ['Módulo máximo',String.raw`\max_{\overline{D}}|f|=\max_{\partial D}|f|`,'Para f holomorfa en un dominio acotado D y continua en su clausura.']],
ex:[String.raw`Calcula \(\oint_{|z|=2}\dfrac{e^z}{(z-1)^3}\,dz\).`,
 [String.raw`Es la fórmula para la segunda derivada con \(f(z)=e^z\), \(z_0=1\) (dentro de \(|z|=2\)) y \(n=2\).`,
  String.raw`\(\oint\dfrac{f(z)}{(z-1)^3}dz=\dfrac{2\pi i}{2!}f''(1)\).`,
  String.raw`\(f''(z)=e^z\), así que \(f''(1)=e\).`,
  String.raw`Resultado: \(\dfrac{2\pi i}{2}\,e=\pi i\,e\approx8{,}54\,i\).`]],
prev:['vc-cauchy-goursat','Teorema de Cauchy-Goursat'],next:['vc-series','Series de potencias y Taylor'],
ref:'Churchill &amp; Brown, cap. 4; Ahlfors, cap. 4; Needham, cap. 9'}));

/* ---------- laboratorios ---------- */
const CF={inv:z=>C.div([1,0],z),z:z=>z,conj:C.conj,z2:z=>C.mul(z,z),inv2:z=>C.div([1,0],C.mul(z,z)),exp:C.exp,lor:z=>C.div([1,0],C.add(C.mul(z,z),[1,0])),sin:C.sin,
  cub:z=>C.sub(C.mul(z,C.mul(z,z)),z),z2p:z=>C.add(C.mul(z,z),[1,0])};
LABS['vc-contorno']=function(sec){
  const cv=$('#ct-cv',sec),rd=$('#ct-read',sec),sf=$('#ct-f',sec),sg=$('#ct-g',sec),gr=sl(sec,'ct-r',v=>nf(v,2),()=>{tt=1;draw();});let P1=null,tt=1,play=false;const Cc=[[0,0]];
  sf.onchange=sg.onchange=()=>{tt=1;draw();};$('#ct-play',sec).onclick=()=>{tt=0;play=true;};
  const path=()=>{const g=sg.value,c=Cc[0],r=gr();
    if(g==='c')return t=>C.add(c,C.polar(r,TAU*t));if(g==='s')return t=>[t,t];if(g==='l')return t=>t<0.5?[2*t,0]:[1,2*t-1];return t=>[t,t*t];};
  const exact=()=>{const f=sf.value,g=sg.value,c=Cc[0],r=gr(),inside=C.abs(c)<r-1e-9;
    if(g==='c'){if(f==='inv')return inside?[0,TAU]:[0,0];if(f==='conj')return [0,2*Math.PI*r*r];return [0,0];}
    const e=[1,1];if(f==='inv')return g==='s'||g==='p'?null:null;if(f==='z')return [0,1];if(f==='z2')return C.sc(C.mul(e,C.mul(e,e)),1/3);if(f==='conj')return g==='s'?[1,0]:g==='l'?[1,1]:[1,1/3];if(f==='inv2')return null;return null;};
  function draw(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.55,380,250),f=CF[sf.value],z=path(),N=600,n=Math.max(1,Math.round(N*tt));
    const [Pa,Pb,hw]=split(ctx,w,h,2.4,7.5);P1=Pa;
    clipR(ctx,0,hw,h,()=>{ctx.save();ctx.lineWidth=3;for(let k=0;k<N;k++){const a=z(k/N),b=z((k+1)/N);ctx.strokeStyle=k<n?K.b:'rgba(217,72,15,.25)';ctx.beginPath();ctx.moveTo(Pa.X(a[0]),Pa.Y(a[1]));ctx.lineTo(Pa.X(b[0]),Pa.Y(b[1]));ctx.stroke();}ctx.restore();
      const m=z(0.25),m2=z(0.26);arrow(ctx,Pa.X(m[0]),Pa.Y(m[1]),Pa.X(m2[0]),Pa.Y(m2[1]),K.b,2.5);
      if(['inv','inv2'].includes(sf.value)){ctx.save();ctx.strokeStyle=K.w;ctx.lineWidth=2.5;const X=Pa.cx,Y=Pa.cy;ctx.beginPath();ctx.moveTo(X-6,Y-6);ctx.lineTo(X+6,Y+6);ctx.moveTo(X+6,Y-6);ctx.lineTo(X-6,Y+6);ctx.stroke();ctx.restore();}
      const q=z(Math.min(1,n/N));dot(ctx,Pa.X(q[0]),Pa.Y(q[1]),5,K.ink);if(sg.value==='c')handle(ctx,Pa,Cc[0],K.ink);});
    let S=[0,0];const pts=[[0,0]];for(let k=0;k<n;k++){const a=z(k/N),b=z((k+1)/N),m=z((k+0.5)/N),fv=C.add(C.add(f(a),f(b)),C.sc(f(m),4));S=C.add(S,C.mul(C.sc(fv,1/6),C.sub(b,a)));pts.push(S);}
    clipR(ctx,w/2+4,hw,h,()=>{ctx.save();ctx.strokeStyle=K.t;ctx.lineWidth=2;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(Pb.X(p[0]),Pb.Y(p[1])):ctx.moveTo(Pb.X(p[0]),Pb.Y(p[1])));ctx.stroke();ctx.restore();
      arrow(ctx,Pb.cx,Pb.cy,Pb.X(S[0]),Pb.Y(S[1]),K.d,3);dot(ctx,Pb.X(0),Pb.Y(TAU),4,K.ax);label(ctx,'2πi',Pb.X(0)+8,Pb.Y(TAU),K.mut,'left','middle','600 11px Inter');});
    label(ctx,'camino γ',10,14,K.mut);label(ctx,'suma parcial S(t)',w/2+14,14,K.mut);
    const ex=tt>=1?exact():null,full=cint(f,z,2000),inside=sg.value==='c'&&C.abs(Cc[0])<gr();
    if(sg.value!=='c'&&(sf.value==='inv'||sf.value==='inv2')){rd.innerHTML=rowT('<span class="aa-no">El camino empieza en z = 0, donde f tiene un polo: la integral diverge.</span>')+rowT('Elige la circunferencia, o una función sin singularidad en 0.');return;}
    rd.innerHTML=row('∫ f dz (numérico)',cs(tt>=1?full:S,4))+(ex?row('valor exacto',cs(ex,4)):'')+row('t',nf(tt,2))+sep+
      rowT(sg.value==='c'?(sf.value==='inv'?(inside?'El origen está dentro: ∮ dz/z = 2πi.':'El origen está fuera: ∮ dz/z = 0.'):sf.value==='conj'?'z̄ no es holomorfa: ∮ z̄ dz = 2i·(área) = 2πr² i.':sf.value==='inv2'?'1/z² tiene primitiva −1/z: su integral cerrada es 0 aunque haya un polo.':'f tiene primitiva: la integral cerrada es 0.')
        :sf.value==='conj'?'Compara los tres caminos: con z̄ el resultado depende del camino.':'f es holomorfa en la región: el resultado no depende del camino (prueba los tres).');
  }
  dragPts(cv,()=>P1,Cc,()=>{tt=1;draw();},{R:2,snap:0.05});
  return {draw,tick(dt){if(!play||!vis(cv))return;tt=Math.min(1,tt+dt/3);if(tt>=1)play=false;draw();}};
};

LABS['vc-cauchy-goursat']=function(sec){
  const cv=$('#cg-cv',sec),rd=$('#cg-read',sec),sf=$('#cg-f',sec);let P=null;
  const init=()=>[[1.6,0.4],[1.0,1.5],[-0.3,1.6],[-1.4,0.6],[-1.2,-1.0],[0.6,-1.3]];let V=init();
  sf.onchange=()=>draw();$('#cg-reset',sec).onclick=()=>{V=init();pts.length=0;V.forEach(v=>pts.push(v));draw();};
  const pts=V;
  const sing={exp:[],inv:[[0,0]],lor:[[0,1],[0,-1]],inv2:[[0,0]],conj:[]};
  const wind=(p)=>{let s=0;for(let i=0;i<pts.length;i++){const a=C.sub(pts[i],p),b=C.sub(pts[(i+1)%pts.length],p);s+=C.arg(C.div(b,a));}return Math.round(s/TAU);};
  function draw(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.85,470,300);P=cplane(ctx,w,h,2.4);
    ctx.save();ctx.fillStyle='rgba(15,118,110,.12)';ctx.strokeStyle=K.t;ctx.lineWidth=2.5;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(P.X(p[0]),P.Y(p[1])):ctx.moveTo(P.X(p[0]),P.Y(p[1])));ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
    pts.forEach((p,i)=>{const q=pts[(i+1)%pts.length],m=[(p[0]+q[0])/2,(p[1]+q[1])/2],d=C.sub(q,p),u=C.sc(d,0.08/C.abs(d));arrow(ctx,P.X(m[0]-u[0]),P.Y(m[1]-u[1]),P.X(m[0]+u[0]),P.Y(m[1]+u[1]),K.t,2.5);});
    pts.forEach(p=>handle(ctx,P,p,K.t));
    const S=sing[sf.value];S.forEach(s=>{const X=P.X(s[0]),Y=P.Y(s[1]);ctx.save();ctx.strokeStyle=K.w;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X-7,Y-7);ctx.lineTo(X+7,Y+7);ctx.moveTo(X+7,Y-7);ctx.lineTo(X-7,Y+7);ctx.stroke();ctx.restore();});
    const f=CF[sf.value],seg=pts.map((p,i)=>[p,pts[(i+1)%pts.length]]);let I=[0,0];seg.forEach(([a,b])=>{I=C.add(I,cint(f,t=>C.add(a,C.sc(C.sub(b,a),t)),400));});
    let area=0;pts.forEach((p,i)=>{const q=pts[(i+1)%pts.length];area+=p[0]*q[1]-q[0]*p[1];});area/=2;
    const ws=S.map(wind);let expct=[0,0];
    if(sf.value==='inv')expct=[0,TAU*ws[0]];else if(sf.value==='lor')expct=C.add(C.sc([Math.PI,0],ws[0]),C.sc([-Math.PI,0],ws[1]));else if(sf.value==='conj')expct=[0,2*area];
    rd.innerHTML=row('∮ f dz (numérico)',cs(I,4))+row('predicción',cs(expct,4))+sep+
      (S.length?S.map((s,k)=>row('vueltas alrededor de '+cs(s),ws[k])).join(''):'')+(sf.value==='conj'?row('área encerrada',nt(area,3)):'')+sep+
      rowT(sf.value==='exp'?'e^z es entera: la integral es 0 para cualquier contorno cerrado.':sf.value==='inv'?(ws[0]?'El polo está dentro: la integral vale 2πi por cada vuelta.':'El polo está fuera: Cauchy-Goursat da 0.'):sf.value==='lor'?'Cada polo encerrado aporta ±π (residuos ±1/(2i)). Si encierras los dos, se cancelan.':sf.value==='inv2'?'Aunque encierres el polo, la integral es 0: 1/z² tiene primitiva −1/z (residuo nulo).':'z̄ no es holomorfa: ∮ z̄ dz = 2i·Área, nunca 0.');
  }
  dragPts(cv,()=>P,pts,draw,{R:2.3,snap:0.05});
  return {draw};
};

LABS['vc-formula-cauchy']=function(sec){
  const cv=$('#fc-cv',sec),rd=$('#fc-read',sec),sf=$('#fc-f',sec),gr=sl(sec,'fc-r',v=>nf(v,2),()=>draw1());let P1=null;const Z=[[0.4,0.3]];sf.onchange=()=>draw1();
  const F={exp:C.exp,z2:CF.z2p,sin:C.sin,cub:CF.cub};
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.55,380,250),f=F[sf.value],z0=Z[0],r=gr(),N=180,img=[];
    let mx=1;for(let i=0;i<N;i++){const v=f(C.add(z0,C.polar(r,i/N*TAU)));img.push(v);mx=Math.max(mx,Math.abs(v[0]),Math.abs(v[1]));}
    const [Pa,Pb,hw]=split(ctx,w,h,2.4,Math.min(10,mx*1.15));P1=Pa;
    clipR(ctx,0,hw,h,()=>{for(let i=0;i<N;i++){const a=C.add(z0,C.polar(r,i/N*TAU)),b=C.add(z0,C.polar(r,(i+1)/N*TAU));ctx.strokeStyle=`hsl(${i/N*360},75%,48%)`;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(Pa.X(a[0]),Pa.Y(a[1]));ctx.lineTo(Pa.X(b[0]),Pa.Y(b[1]));ctx.stroke();}handle(ctx,Pa,z0,K.ink);});
    let avg=[0,0];img.forEach(v=>avg=C.add(avg,v));avg=C.sc(avg,1/N);const fz=f(z0);
    clipR(ctx,w/2+4,hw,h,()=>{for(let i=0;i<N;i++){const a=img[i],b=img[(i+1)%N];ctx.strokeStyle=`hsl(${i/N*360},75%,48%)`;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(Pb.X(a[0]),Pb.Y(a[1]));ctx.lineTo(Pb.X(b[0]),Pb.Y(b[1]));ctx.stroke();}
      dot(ctx,Pb.X(fz[0]),Pb.Y(fz[1]),7,K.ink);ctx.save();ctx.strokeStyle='#fff';ctx.lineWidth=5;const X=Pb.X(avg[0]),Y=Pb.Y(avg[1]);ctx.beginPath();ctx.moveTo(X-9,Y);ctx.lineTo(X+9,Y);ctx.moveTo(X,Y-9);ctx.lineTo(X,Y+9);ctx.stroke();ctx.strokeStyle=K.d;ctx.lineWidth=2.5;ctx.stroke();ctx.restore();});
    label(ctx,'plano z',10,14,K.mut);label(ctx,'plano w = f(z)',w/2+14,14,K.mut);
    rd.innerHTML=row('z₀',cs(z0,2))+row('r',nf(r,2))+sep+row('f(z₀)',cs(fz,4))+row('promedio en la circunferencia',cs(avg,4))+row('diferencia',nt(C.abs(C.sub(fz,avg)),6))+sep+
      rowT('Es la fórmula de Cauchy con z = z₀ + re^{iθ}: (1/2πi)∮ f/(z − z₀) dz = (1/2π)∫ f(z₀ + re^{iθ}) dθ.');
  }
  dragPts(cv,()=>P1,Z,draw1,{R:2.2,snap:0.05});
  const cv2=$('#fc-cv2',sec),rd2=$('#fc-read2',sec),sg=$('#fc-g',sec),gR=sl(sec,'fc-R',v=>nf(v,2),()=>draw2());let P2=null;const Q=[[0.2,0.1]];sg.onchange=()=>draw2();
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.85,470,300),f=F[sg.value],c=Q[0],R=gR();P2=cplane(ctx,w,h,2.6);
    let mx=0,mn=Infinity,pmx=null,pmn=null;const st=4;const vals=[];
    for(let y=0;y<h;y+=st)for(let x=0;x<w;x+=st){const z=[P2.ix(x+2),P2.iy(y+2)];if(C.abs(C.sub(z,c))>R)continue;const m=C.abs(f(z));vals.push([x,y,m]);if(m>mx){mx=m;pmx=z;}if(m<mn){mn=m;pmn=z;}}
    for(let i=0;i<=360;i++){const z=C.add(c,C.polar(R,i/360*TAU)),m=C.abs(f(z));if(m>=mx){mx=m;pmx=z;}}
    vals.forEach(([x,y,m])=>{const t=(m-mn)/(mx-mn||1);ctx.fillStyle=`hsl(${200-170*t},70%,${85-40*t}%)`;ctx.fillRect(x,y,st,st);});
    ctx.save();ctx.strokeStyle=K.ink;ctx.lineWidth=2;ctx.beginPath();ctx.arc(P2.X(c[0]),P2.Y(c[1]),R*P2.s,0,TAU);ctx.stroke();ctx.restore();
    dot(ctx,P2.X(pmx[0]),P2.Y(pmx[1]),7,K.ink);dot(ctx,P2.X(pmn[0]),P2.Y(pmn[1]),6,'#fff',K.ink);handle(ctx,P2,c,K.d);
    const onB=Math.abs(C.abs(C.sub(pmx,c))-R)<0.03;
    rd2.innerHTML=row('máx |f| en el disco',nt(mx,4))+row('alcanzado en',cs(pmx,3))+row('mín |f|',nt(mn,4))+sep+rowT(onB?'<span class="aa-ok">El máximo está en la frontera</span>, como exige el principio del módulo máximo.':'(máximo en el borde de la resolución)')+
      rowT(mn<0.02?'El mínimo interior es un cero de f: el principio del mínimo solo vale si f no se anula.':'f no se anula en el disco: el mínimo también está en la frontera.');
  }
  dragPts(cv2,()=>P2,Q,draw2,{R:2,snap:0.05});
  return {draw(){draw1();draw2();}};
};

/* ================= VC · UNIDAD IV · SERIES ================= */
const W4='Unidad IV · Series';
V.push(topicPage({id:'vc-series',pre:'se',course:VC,unit:W4,title:'Series de potencias y de Taylor',
lead:String.raw`En \(\mathbb{C}\), holomorfa y analítica (desarrollable en serie de potencias) son lo mismo. Además, el radio de convergencia de la serie de Taylor es exactamente la distancia a la singularidad más cercana. Eso explica fenómenos que en la recta real parecen misteriosos, como que la serie de \(1/(1+x^2)\) diverja para \(|x|>1\).`,
res:[String.raw`<b>Disco de convergencia.</b> Toda serie \(\sum a_n(z-z_0)^n\) converge absolutamente en un disco \(|z-z_0|\lt R\) y diverge fuera de él. Fórmula de Cauchy-Hadamard: \(1/R=\limsup|a_n|^{1/n}\); si existe, también \(R=\lim|a_n/a_{n+1}|\).`,
String.raw`<b>Dentro del disco.</b> La convergencia es uniforme en cada disco cerrado más pequeño. La suma es holomorfa y se puede derivar e integrar término a término, sin cambiar el radio.`,
String.raw`<b>Teorema de Taylor.</b> Si \(f\) es holomorfa en \(|z-z_0|<\rho\), entonces \(f(z)=\sum_n\dfrac{f^{(n)}(z_0)}{n!}(z-z_0)^n\) en todo ese disco. Se deduce de la fórmula integral desarrollando \(\dfrac{1}{w-z}\) como serie geométrica.`,
String.raw`<b>Radio = distancia a la singularidad.</b> El radio de convergencia de la serie de Taylor de \(f\) en \(z_0\) es la distancia de \(z_0\) a la singularidad más cercana de \(f\) (polo, punto de ramificación…).`,
String.raw`<b>El misterio de \(1/(1+x^2)\).</b> Es suave en todo \(\mathbb{R}\), pero su serie en 0, \(1-x^2+x^4-\cdots\), solo converge para \(|x|<1\). La razón está fuera de la recta: tiene polos en \(\pm i\), a distancia 1 del origen.`,
String.raw`<b>Series básicas.</b> \(\dfrac{1}{1-z}=\sum z^n\) (\(R=1\)); \(e^z=\sum\dfrac{z^n}{n!}\), \(\sin z\), \(\cos z\) (\(R=\infty\)); \(\operatorname{Log}(1+z)=\sum_{n\ge1}\dfrac{(-1)^{n+1}}{n}z^n\) (\(R=1\)).`,
String.raw`<b>Teorema de identidad.</b> Los ceros de una función holomorfa no nula están aislados. Si dos funciones holomorfas coinciden en un conjunto con un punto de acumulación dentro de un dominio, coinciden en todo el dominio. Por eso las identidades trigonométricas reales valen automáticamente en \(\mathbb{C}\).`,
String.raw`<b>En la frontera.</b> Sobre \(|z-z_0|=R\) puede pasar de todo: \(\sum z^n\) diverge en toda la circunferencia, \(\sum z^n/n^2\) converge en toda ella y \(\sum z^n/n\) converge en todos los puntos menos en \(z=1\).`],
lab:tabs([['tc','Convergencia en el plano',`<div class="controls" style="margin:0 0 12px">f = ${sel('se-f',[['geo','1/(1 − z)'],['lor','1/(1 + z²)'],['exp','e^z'],['log','Log(1 + z)'],['tan','tan z']])}</div>`+
  lab2('se-cv',slider('se-N','términos N',1,40,1,10),'se-read',String.raw`Arrastra el centro \(z_0\). El color mide el error \(|S_N(z)-f(z)|\) de la suma parcial de grado \(N\): verde donde es menor que \(10^{-3}\), rojo donde es mayor que 1. La circunferencia es el borde del disco de convergencia, y las cruces, las singularidades. Al aumentar \(N\), la zona verde llena el disco, pero nunca sale de él.`)],
 ['re','La recta real',lab2('se-cv2',slider('se-M','grado 2M',2,40,2,10),'se-read2',String.raw`\(f(x)=\dfrac1{1+x^2}\) (verde) y su polinomio de Taylor en 0 (naranja). Dentro de \((-1,1)\) se ajusta cada vez mejor; fuera, diverge sin importar el grado. Ningún punto de la recta real explica por qué: el motivo son los polos \(\pm i\).`)]]),
laws:[['Cauchy-Hadamard',String.raw`\frac1R=\limsup_{n\to\infty}|a_n|^{1/n}`,'Radio de convergencia de Σ aₙ(z − z₀)ⁿ.'],
 ['Serie de Taylor',String.raw`f(z)=\sum_{n=0}^\infty\frac{f^{(n)}(z_0)}{n!}(z-z_0)^n`,'Válida en el mayor disco centrado en z₀ donde f es holomorfa.'],
 ['Coeficientes como integrales',String.raw`a_n=\frac{1}{2\pi i}\oint_{|z-z_0|=\rho}\frac{f(z)}{(z-z_0)^{n+1}}\,dz`,'De la fórmula integral de Cauchy para las derivadas.'],
 ['Serie geométrica',String.raw`\frac{1}{1-z}=\sum_{n=0}^\infty z^n,\qquad|z|<1`,'La base de todos los desarrollos.'],
 ['Radio y singularidades',String.raw`R=\operatorname{dist}\big(z_0,\ \text{singularidades de }f\big)`,'Para la serie de Taylor de f en z₀.'],
 ['Derivación término a término',String.raw`f'(z)=\sum_{n=1}^\infty n\,a_n(z-z_0)^{n-1}`,'Con el mismo radio de convergencia.']],
ex:[String.raw`Halla la serie de Taylor de \(f(z)=\dfrac{1}{1+z^2}\) en \(z_0=0\) y en \(z_0=1\), con sus radios.`,
 [String.raw`En 0: \(\dfrac{1}{1+z^2}=\dfrac1{1-(-z^2)}=\sum_{n\ge0}(-1)^nz^{2n}\), válida si \(|z^2|<1\): \(R=1\).`,
  String.raw`Singularidades: \(\pm i\). Distancia desde 0: \(1\). ✓`,
  String.raw`En \(z_0=1\): la distancia a \(\pm i\) es \(|1\mp i|=\sqrt2\), así que \(R=\sqrt2\approx1{,}414\), mayor que en 0.`,
  String.raw`Primeros términos (fracciones parciales \(\tfrac1{2i}\big[\tfrac{1}{z-i}-\tfrac{1}{z+i}\big]\) desarrolladas en \(z-1\)): \(\tfrac12-\tfrac12(z-1)+\tfrac14(z-1)^2+0\cdot(z-1)^3-\tfrac18(z-1)^4+\cdots\)`],
 'En el laboratorio, con 1/(1 + z²), mueve z₀ y observa cómo cambia el radio.'],
prev:['vc-formula-cauchy','Fórmula integral de Cauchy'],next:['vc-laurent','Series de Laurent y singularidades'],
ref:'Churchill &amp; Brown, cap. 5; Needham, cap. 2 y 9; Ahlfors, cap. 5'}));

V.push(topicPage({id:'vc-laurent',pre:'la',course:VC,unit:W4,title:'Series de Laurent y singularidades',
lead:String.raw`Cerca de una singularidad no hay serie de Taylor, pero sí una serie con potencias negativas: la serie de Laurent. Su parte negativa clasifica la singularidad (evitable, polo o esencial), y su coeficiente \(a_{-1}\) será el residuo del próximo tema.`,
res:[String.raw`<b>Serie de Laurent.</b> Si \(f\) es holomorfa en el anillo \(r<|z-z_0|\lt R\), entonces \(f(z)=\sum_{n=-\infty}^{\infty}a_n(z-z_0)^n\), con \(a_n=\dfrac1{2\pi i}\oint\dfrac{f(z)}{(z-z_0)^{n+1}}dz\) sobre cualquier circunferencia del anillo. La parte con \(n<0\) es la <i>parte principal</i>.`,
String.raw`<b>Un desarrollo por anillo.</b> La misma función tiene series distintas en anillos distintos. Para \(f=\dfrac{1}{(z-1)(z-2)}\) hay tres: en \(|z|<1\) (Taylor), en \(1<|z|<2\) y en \(|z|>2\).`,
String.raw`<b>Técnica.</b> Fracciones parciales y serie geométrica, eligiendo en cada término la forma que converge: \(\dfrac1{z-a}=-\dfrac1a\sum\big(\tfrac za\big)^n\) si \(|z|<|a|\), y \(\dfrac1{z-a}=\dfrac1z\sum\big(\tfrac az\big)^n\) si \(|z|>|a|\).`,
String.raw`<b>Singularidad evitable.</b> Sin parte principal. \(f\) se extiende holomorfamente a \(z_0\). Ejemplo: \(\dfrac{\sin z}{z}=1-\dfrac{z^2}{6}+\cdots\). Teorema de Riemann: si \(f\) está acotada cerca de \(z_0\), la singularidad es evitable.`,
String.raw`<b>Polo de orden \(m\).</b> La parte principal tiene un número finito de términos, el último \(a_{-m}(z-z_0)^{-m}\). Equivale a \(f=g(z)/(z-z_0)^m\) con \(g(z_0)\neq0\), y \(|f|\to\infty\). Un cero de orden \(m\) de \(h\) es un polo de orden \(m\) de \(1/h\).`,
String.raw`<b>Singularidad esencial.</b> Infinitos términos negativos. Ejemplo: \(e^{1/z}=\sum\dfrac{1}{n!\,z^n}\). Casorati-Weierstrass: en cualquier entorno de \(z_0\), \(f\) se acerca tanto como se quiera a cualquier número complejo. Picard: de hecho alcanza todos los valores salvo, a lo sumo, uno.`,
String.raw`<b>En el coloreado de dominio.</b> Una evitable no se ve (colores suaves); un polo de orden \(m\) da \(m\) vueltas horarias del arcoíris con brillo creciente; una esencial muestra una mezcla caótica de todos los colores y brillos.`,
String.raw`<b>En física.</b> Las expansiones multipolares (\(1/r\), \(1/r^2\), …) son series de Laurent en la variable de distancia, válidas fuera de la región de las cargas, igual que el desarrollo en \(|z|>2\).`],
lab:tabs([['an','Tres anillos, tres series',`<div class="controls" style="margin:0 0 12px">${seg('la-reg','r',[['a','|z| < 1'],['b','1 < |z| < 2'],['c','|z| > 2']])}</div>`+
  lab2('la-cv',slider('la-N','términos por lado N',1,30,1,8),'la-read',String.raw`\(f(z)=\dfrac{1}{(z-1)(z-2)}\). El color mide el error de la serie truncada en cada anillo (verde: error pequeño). Cada serie solo converge en su propio anillo, delimitado por los polos \(1\) y \(2\) (cruces). Fuera del anillo, la serie diverge aunque \(f\) esté bien definida.`)],
 ['si','Tipos de singularidad',`<div class="controls" style="margin:0 0 12px">${sel('la-f',[['sinc','sin z / z (evitable)'],['cosc','(1 − cos z)/z² (evitable)'],['p2','1/z² (polo de orden 2)'],['p3','(z + 1)/z³ (polo de orden 3)'],['e1z','e^{1/z} (esencial)'],['s1z','sin(1/z) (esencial)']])}</div>`+
  lab2('la-cv2',slider('la-R','zoom (radio visible)',0.05,2,0.01,1),'la-read2',String.raw`Coloreado de dominio alrededor de \(z=0\). Acerca el zoom: una evitable se vuelve un color uniforme; un polo, un arcoíris horario cada vez más brillante; una esencial nunca se simplifica, porque en cualquier disco alrededor de 0 aparecen todos los colores.`)+wheel()]]),
laws:[['Serie de Laurent',String.raw`f(z)=\sum_{n=-\infty}^{\infty}a_n(z-z_0)^n,\qquad r\lt|z-z_0|\lt R`,'Convergente en el anillo donde f es holomorfa.'],
 ['Coeficientes',String.raw`a_n=\frac1{2\pi i}\oint_{|z-z_0|=\rho}\frac{f(z)}{(z-z_0)^{n+1}}\,dz`,'Para cualquier ρ entre r y R.'],
 ['Polo de orden m',String.raw`f(z)=\frac{a_{-m}}{(z-z_0)^m}+\dots+\frac{a_{-1}}{z-z_0}+\sum_{n\ge0}a_n(z-z_0)^n`,'Parte principal finita, con aₘ ≠ 0.'],
 ['Criterio de polo',String.raw`\lim_{z\to z_0}(z-z_0)^mf(z)\ \text{existe y es}\ \neq0`,'Determina el orden m.'],
 ['Riemann (evitable)',String.raw`f\ \text{acotada cerca de }z_0\ \Rightarrow\ z_0\ \text{evitable}`,'No hace falta calcular la serie.'],
 ['Ejemplo esencial',String.raw`e^{1/z}=\sum_{n=0}^{\infty}\frac{1}{n!}\,z^{-n},\qquad z\neq0`,'Infinitos términos negativos.']],
ex:[String.raw`Desarrolla \(f(z)=\dfrac{1}{(z-1)(z-2)}\) en el anillo \(1<|z|<2\).`,
 [String.raw`Fracciones parciales: \(f=\dfrac{1}{z-2}-\dfrac{1}{z-1}\).`,
  String.raw`Como \(|z|<2\): \(\dfrac1{z-2}=-\dfrac12\cdot\dfrac{1}{1-z/2}=-\sum_{n\ge0}\dfrac{z^n}{2^{n+1}}\).`,
  String.raw`Como \(|z|>1\): \(-\dfrac1{z-1}=-\dfrac1z\cdot\dfrac1{1-1/z}=-\sum_{n\ge1}z^{-n}\).`,
  String.raw`Resultado: \(f(z)=\cdots-\dfrac1{z^2}-\dfrac1z-\dfrac12-\dfrac z4-\dfrac{z^2}{8}-\cdots\). El coeficiente \(a_{-1}=-1\) no es el residuo en ningún polo: este anillo rodea al polo \(z=1\) (residuo \(-1\)), así que \(\oint_{|z|=1{,}5}f\,dz=2\pi i\cdot(-1)\).`]],
prev:['vc-series','Series de potencias y Taylor'],next:['vc-residuos','Teorema de los residuos'],
ref:'Churchill &amp; Brown, cap. 5–6; Needham, cap. 9; Ahlfors, cap. 5'}));

/* ---------- laboratorios ---------- */
const TF={geo:{f:z=>C.div([1,0],C.sub([1,0],z)),s:[[1,0]],t:'1/(1 − z)'},lor:{f:z=>C.div([1,0],C.add(C.mul(z,z),[1,0])),s:[[0,1],[0,-1]],t:'1/(1 + z²)'},
  exp:{f:C.exp,s:[],t:'e^z'},log:{f:z=>C.log(C.add(z,[1,0])),s:[[-1,0]],t:'Log(1 + z)',cut:true},tan:{f:z=>C.div(C.sin(z),C.cos(z)),s:[-3,-2,-1,0,1,2].map(k=>[Math.PI/2+k*Math.PI,0]),t:'tan z'}};
function taylor(f,z0,rho,N){const M=256,a=[];const v=[];for(let k=0;k<M;k++)v.push(f(C.add(z0,C.polar(rho,k/M*TAU))));
  for(let n=0;n<=N;n++){let s=[0,0];for(let k=0;k<M;k++)s=C.add(s,C.mul(v[k],C.polar(1,-n*k/M*TAU)));a.push(C.sc(s,1/(M*Math.pow(rho,n))));}return a;}
function errColor(e){const l=Math.log10(e+1e-16),t=Math.max(0,Math.min(1,(l+3)/3));return `hsl(${130-130*t},65%,${60-12*t}%)`;}
LABS['vc-series']=function(sec){
  const cv=$('#se-cv',sec),rd=$('#se-read',sec),sf=$('#se-f',sec),gN=sl(sec,'se-N',v=>v,()=>draw1());let P=null;const Z=[[0,0]];sf.onchange=()=>draw1();
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.85,470,300);P=cplane(ctx,w,h,2.6);const o=TF[sf.value],z0=Z[0],N=gN();
    let R=Infinity;o.s.forEach(s=>R=Math.min(R,C.abs(C.sub(s,z0))));const rho=Math.min(isFinite(R)?R*0.55:1.5,1.5);
    const a=taylor(o.f,z0,rho,N),S=z=>{const d=C.sub(z,z0);let s=[0,0],p=[1,0];for(let n=0;n<=N;n++){s=C.add(s,C.mul(a[n],p));p=C.mul(p,d);}return s;};
    const st=5;for(let y=0;y<h;y+=st)for(let x=0;x<w;x+=st){const z=[P.ix(x+2.5),P.iy(y+2.5)],fv=o.f(z);if(!isFinite(fv[0]))continue;const e=C.abs(C.sub(S(z),fv));ctx.fillStyle=errColor(e);ctx.fillRect(x,y,st,st);}
    ctx.save();ctx.strokeStyle='rgba(28,34,48,.25)';ctx.beginPath();ctx.moveTo(0,P.cy);ctx.lineTo(w,P.cy);ctx.moveTo(P.cx,0);ctx.lineTo(P.cx,h);ctx.stroke();ctx.restore();
    if(isFinite(R)){ctx.save();ctx.strokeStyle=K.ink;ctx.lineWidth=2.5;ctx.setLineDash([7,5]);ctx.beginPath();ctx.arc(P.X(z0[0]),P.Y(z0[1]),R*P.s,0,TAU);ctx.stroke();ctx.restore();}
    if(o.cut){ctx.save();ctx.strokeStyle='#000';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(P.X(-1),P.cy);ctx.lineTo(0,P.cy);ctx.stroke();ctx.restore();}
    o.s.forEach(s=>{const X=P.X(s[0]),Y=P.Y(s[1]);ctx.save();ctx.strokeStyle=K.ink;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X-7,Y-7);ctx.lineTo(X+7,Y+7);ctx.moveTo(X+7,Y-7);ctx.lineTo(X-7,Y+7);ctx.stroke();ctx.restore();});
    handle(ctx,P,z0,K.d);
    const near=o.s.length?o.s.reduce((b,s)=>C.abs(C.sub(s,z0))<C.abs(C.sub(b,z0))?s:b):null;
    rd.innerHTML=row('f',o.t)+row('z₀',cs(z0,2))+row('radio R',isFinite(R)?nt(R,3):'∞ (entera)')+(near?row('singularidad más cercana',cs(near,3)):'')+sep+
      a.slice(0,5).map((c,n)=>row('a'+['₀','₁','₂','₃','₄'][n],cs(c,4))).join('')+sep+rowT('Verde: |S<sub>N</sub> − f| < 10⁻³. Rojo: error > 1.');
  }
  dragPts(cv,()=>P,Z,draw1,{R:2.4,snap:0.05});
  const cv2=$('#se-cv2',sec),rd2=$('#se-read2',sec),gM=sl(sec,'se-M',v=>v,()=>draw2());
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.6,360,240),M=gM();
    const A=axes(ctx,{l:40,t:14,w:w-54,h:h-40,xr:[-2,2],yr:[-1,2],xl:'x'});
    ctx.fillStyle='rgba(15,118,110,.08)';ctx.fillRect(A.X(-1),A.o.t,A.X(1)-A.X(-1),A.o.h);
    const T=x=>{let s=0;for(let n=0;2*n<=M;n++)s+=(n%2?-1:1)*Math.pow(x,2*n);return s;};
    curve(ctx,A,x=>1/(1+x*x),-2,2,K.t,3);curve(ctx,A,T,-2,2,K.b,2.5);
    rd2.innerHTML=row('polinomio','1 − x² + x⁴ − … ± x^'+M)+row('error en x = 0,9',nt(Math.abs(T(0.9)-1/(1+0.81)),4))+row('error en x = 1,1',nt(Math.abs(T(1.1)-1/(1+1.21)),4))+sep+
      rowT('Dentro de (−1, 1) el error baja al subir el grado; fuera, crece sin límite. Los polos ±i están a distancia 1 del origen.');
  }
  return {draw(){draw1();draw2();}};
};

LABS['vc-laurent']=function(sec){
  const cv=$('#la-cv',sec),rd=$('#la-read',sec),gN=sl(sec,'la-N',v=>v,()=>draw1()),gr=segm(sec,'la-reg','r',()=>draw1());
  const f=z=>C.div([1,0],C.mul(C.sub(z,[1,0]),C.sub(z,[2,0])));
  function S(z,reg,N){let s=[0,0];
    if(reg==='a'){let p=[1,0];for(let n=0;n<=N;n++){s=C.add(s,C.sc(p,1-Math.pow(2,-(n+1))));p=C.mul(p,z);}}
    else if(reg==='b'){let p=[1,0];for(let n=0;n<=N;n++){s=C.sub(s,C.sc(p,Math.pow(2,-(n+1))));p=C.mul(p,z);}const iz=C.div([1,0],z);let q=iz;for(let n=1;n<=N;n++){s=C.sub(s,q);q=C.mul(q,iz);}}
    else{const iz=C.div([1,0],z);let q=iz;for(let n=1;n<=N;n++){s=C.add(s,C.sc(q,Math.pow(2,n-1)-1));q=C.mul(q,iz);}}
    return s;}
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.85,470,300),P=cplane(ctx,w,h,3.4),reg=gr(),N=gN(),st=5;
    for(let y=0;y<h;y+=st)for(let x=0;x<w;x+=st){const z=[P.ix(x+2.5),P.iy(y+2.5)],fv=f(z);if(!isFinite(fv[0])||C.abs(z)<1e-6)continue;ctx.fillStyle=errColor(C.abs(C.sub(S(z,reg,N),fv)));ctx.fillRect(x,y,st,st);}
    [1,2].forEach(r=>{ctx.save();ctx.strokeStyle=K.ink;ctx.lineWidth=2;ctx.setLineDash([7,5]);ctx.beginPath();ctx.arc(P.cx,P.cy,r*P.s,0,TAU);ctx.stroke();ctx.restore();});
    [[1,0],[2,0]].forEach(s=>{const X=P.X(s[0]),Y=P.Y(s[1]);ctx.save();ctx.strokeStyle=K.ink;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X-7,Y-7);ctx.lineTo(X+7,Y+7);ctx.moveTo(X+7,Y-7);ctx.lineTo(X-7,Y+7);ctx.stroke();ctx.restore();});
    const T={a:'Σ (1 − 2^{−(n+1)}) zⁿ (Taylor, sin potencias negativas)',b:'−Σ zⁿ/2^{n+1} − Σ z^{−n}',c:'Σ (2^{n−1} − 1) z^{−n} (solo potencias negativas)'}[reg];
    rd.innerHTML=row('anillo',{a:'|z| < 1',b:'1 < |z| < 2',c:'|z| > 2'}[reg])+rowT('serie: '+T)+sep+row('a₋₁',{a:'0',b:'−1',c:'0'}[reg])+
      rowT({a:'Dentro de |z| < 1, f es holomorfa: no hay parte principal.',b:'La parte principal −Σ z^{−n} viene del polo z = 1, que queda “dentro del agujero”.',c:'Fuera de los dos polos: a₋₁ = 0 porque sus residuos (−1 y +1) se cancelan.'}[reg]);
  }
  const cv2=$('#la-cv2',sec),rd2=$('#la-read2',sec),sf=$('#la-f',sec),gR=sl(sec,'la-R',v=>nf(v,2),()=>draw2());sf.onchange=()=>draw2();
  const SF={sinc:{f:z=>C.div(C.sin(z),z),t:'evitable',s:'1 − z²/6 + z⁴/120 − …'},cosc:{f:z=>C.div(C.sub([1,0],C.cos(z)),C.mul(z,z)),t:'evitable',s:'1/2 − z²/24 + …'},
    p2:{f:z=>C.div([1,0],C.mul(z,z)),t:'polo de orden 2',s:'z⁻²'},p3:{f:z=>C.div(C.add(z,[1,0]),C.mul(z,C.mul(z,z))),t:'polo de orden 3',s:'z⁻³ + z⁻²'},
    e1z:{f:z=>C.exp(C.div([1,0],z)),t:'esencial',s:'1 + z⁻¹ + z⁻²/2! + z⁻³/3! + …'},s1z:{f:z=>C.sin(C.div([1,0],z)),t:'esencial',s:'z⁻¹ − z⁻³/3! + z⁻⁵/5! − …'}};
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.85,470,300),P=cplane(ctx,w,h,gR(),0,w,false),o=SF[sf.value];
    domainColor(ctx,P,w,h,o.f,{step:2});dot(ctx,P.cx,P.cy,3,'#fff',K.ink);
    rd2.innerHTML=row('f',sf.options[sf.selectedIndex].text.split(' (')[0])+row('tipo en z = 0',o.t)+row('Laurent',o.s)+sep+
      rowT(o.t==='evitable'?'Sin parte principal: al acercarse, el color se vuelve uniforme (f tiene límite finito).':o.t.startsWith('polo')?'Parte principal finita: el arcoíris gira en sentido horario tantas veces como el orden del polo.':'Infinitos términos negativos: Casorati-Weierstrass. Todo color y todo brillo aparecen en cualquier disco alrededor de 0.');
  }
  return {draw(){draw1();draw2();}};
};

/* ================= VC · UNIDAD V · RESIDUOS ================= */
const W5='Unidad V · Residuos y aplicaciones';
V.push(topicPage({id:'vc-residuos',pre:'rs',course:VC,unit:W5,title:'Teorema de los residuos',
lead:String.raw`Toda la información que una curva cerrada “ve” de una singularidad aislada está en un solo número: el coeficiente \(a_{-1}\) de la serie de Laurent, el residuo. La integral sobre la curva es \(2\pi i\) por la suma de los residuos encerrados, y el cálculo de integrales se reduce a álgebra.`,
res:[String.raw`<b>Residuo.</b> Si \(z_0\) es una singularidad aislada, \(\operatorname{Res}(f,z_0)=a_{-1}=\dfrac1{2\pi i}\oint_{|z-z_0|=\varepsilon}f\,dz\). Integrando la serie de Laurent término a término, solo sobrevive \(a_{-1}\), por la integral fundamental.`,
String.raw`<b>Teorema.</b> Si \(f\) es holomorfa dentro y sobre \(\gamma\) salvo en singularidades aisladas \(z_1,\dots,z_k\) interiores, \(\oint_\gamma f\,dz=2\pi i\sum_j\operatorname{Res}(f,z_j)\). Prueba: deformar \(\gamma\) en pequeñas circunferencias alrededor de cada \(z_j\).`,
String.raw`<b>Número de vueltas.</b> Para curvas que se cruzan o dan varias vueltas: \(\oint_\gamma f\,dz=2\pi i\sum_jn(\gamma,z_j)\operatorname{Res}(f,z_j)\), con \(n(\gamma,z_j)=\dfrac1{2\pi i}\oint_\gamma\dfrac{dz}{z-z_j}\).`,
String.raw`<b>Polo simple.</b> \(\operatorname{Res}(f,z_0)=\lim_{z\to z_0}(z-z_0)f(z)\). Si \(f=g/h\) con \(g(z_0)\neq0\) y \(h\) con un cero simple: \(\operatorname{Res}=g(z_0)/h'(z_0)\).`,
String.raw`<b>Polo de orden \(m\).</b> \(\operatorname{Res}(f,z_0)=\dfrac{1}{(m-1)!}\lim_{z\to z_0}\dfrac{d^{m-1}}{dz^{m-1}}\big[(z-z_0)^mf(z)\big]\).`,
String.raw`<b>Singularidad esencial.</b> No hay atajo: se lee \(a_{-1}\) de la serie de Laurent. Ejemplo: \(\operatorname{Res}(e^{1/z},0)=1\), porque \(e^{1/z}=1+z^{-1}+\dots\)`,
String.raw`<b>Residuo en el infinito.</b> Para una función racional, la suma de todos sus residuos (incluido el de \(\infty\)) es cero. Si \(f=O(1/z^2)\), los residuos finitos ya suman cero: una curva que los encierra a todos da integral nula.`,
String.raw`<b>Aplicaciones.</b> Integrales reales (siguiente tema), transformadas inversas de Laplace (suma de residuos de \(F(s)e^{st}\)), funciones de Green y propagadores, sumas de series como \(\sum1/n^2=\pi^2/6\).`],
lab:`<div class="controls" style="margin:0 0 12px">f = ${sel('rs-f',[['lor','1/(z² + 1)'],['ezz','e^z / (z(z − 1))'],['q4','1/(z⁴ + 1)'],['d2','1/(z²(z − 2))'],['csc','1/sin z']])}</div>`+
 lab2('rs-cv',slider('rs-r','radio del contorno',0.2,3.5,0.05,1.5),'rs-read',String.raw`Fondo: coloreado de dominio de \(f\). Arrastra el centro del contorno circular y cambia su radio. Las etiquetas muestran el residuo de cada polo. Se comparan \(2\pi i\sum\operatorname{Res}\) de los polos encerrados con la integral calculada numéricamente sobre la circunferencia.`)+wheel(),
laws:[['Residuo',String.raw`\operatorname{Res}(f,z_0)=a_{-1}=\frac1{2\pi i}\oint_{|z-z_0|=\varepsilon}f(z)\,dz`,'Coeficiente de (z − z₀)⁻¹ en la serie de Laurent.'],
 ['Teorema de los residuos',String.raw`\oint_\gamma f\,dz=2\pi i\sum_{j}n(\gamma,z_j)\,\operatorname{Res}(f,z_j)`,'n(γ, zⱼ): número de vueltas de γ alrededor de zⱼ.'],
 ['Polo simple',String.raw`\operatorname{Res}(f,z_0)=\lim_{z\to z_0}(z-z_0)f(z)=\frac{g(z_0)}{h'(z_0)}`,'La segunda forma, si f = g/h y h tiene un cero simple en z₀.'],
 ['Polo de orden m',String.raw`\operatorname{Res}(f,z_0)=\frac1{(m-1)!}\lim_{z\to z_0}\frac{d^{m-1}}{dz^{m-1}}\Big[(z-z_0)^mf(z)\Big]`,'Para m = 1 se recupera la fórmula anterior.'],
 ['Número de vueltas',String.raw`n(\gamma,z_0)=\frac1{2\pi i}\oint_\gamma\frac{dz}{z-z_0}\in\mathbb{Z}`,'Cuenta las vueltas, con signo.'],
 ['Suma total',String.raw`\sum_{z_j\in\mathbb{C}}\operatorname{Res}(f,z_j)+\operatorname{Res}(f,\infty)=0`,'Para funciones racionales.']],
ex:[String.raw`Calcula \(\oint_{|z|=2}\dfrac{e^z}{z(z-1)}\,dz\).`,
 [String.raw`Polos simples en \(0\) y en \(1\), ambos dentro de \(|z|=2\).`,
  String.raw`\(\operatorname{Res}(f,0)=\lim_{z\to0}\dfrac{e^z}{z-1}=-1\).`,
  String.raw`\(\operatorname{Res}(f,1)=\lim_{z\to1}\dfrac{e^z}{z}=e\).`,
  String.raw`\(\oint=2\pi i(e-1)\approx10{,}80\,i\).`],
 'Selecciona e^z / (z(z − 1)) en el laboratorio y encierra ambos polos.'],
prev:['vc-laurent','Series de Laurent y singularidades'],next:['vc-integrales-reales','Integrales reales por residuos'],
ref:'Churchill &amp; Brown, cap. 6; Ahlfors, cap. 4; Arfken, cap. 11'}));

V.push(topicPage({id:'vc-integrales-reales',pre:'ir',course:VC,unit:W5,title:'Integrales reales por residuos',
lead:String.raw`Muchas integrales reales que resisten a las técnicas de Cálculo 2 se resuelven cerrando el camino en el plano complejo. La estrategia: completar el eje real con un arco cuya contribución se anula, y sumar residuos.`,
res:[String.raw`<b>Tipo 1: integrales trigonométricas.</b> \(\int_0^{2\pi}R(\cos\theta,\sin\theta)\,d\theta\). Con \(z=e^{i\theta}\): \(\cos\theta=\tfrac12(z+z^{-1})\), \(\sin\theta=\tfrac1{2i}(z-z^{-1})\), \(d\theta=\dfrac{dz}{iz}\). Queda una integral sobre \(|z|=1\) de una función racional.`,
String.raw`<b>Tipo 2: racionales en toda la recta.</b> \(\int_{-\infty}^{\infty}\dfrac{P(x)}{Q(x)}dx\) con \(\deg Q\ge\deg P+2\) y \(Q\) sin raíces reales. Se cierra con un semicírculo superior de radio \(R\): por ML el arco aporta \(\le\pi R\cdot C/R^2\to0\). Resultado: \(2\pi i\sum_{\operatorname{Im}z_j>0}\operatorname{Res}\).`,
String.raw`<b>Tipo 3: transformadas de Fourier.</b> \(\int_{-\infty}^\infty f(x)e^{ikx}dx\) con \(k>0\). Basta \(f\to0\) en el semiplano superior: el lema de Jordan acota el arco por \(\pi\max|f|/k\to0\). Si \(k<0\), se cierra por abajo.`,
String.raw`<b>Lema de Jordan.</b> \(\displaystyle\int_0^\pi e^{-kR\sin\theta}d\theta<\frac{\pi}{kR}\). Por eso \(e^{ikz}\) decae en el semiplano superior lo suficiente para matar el arco aunque \(f\) solo decaiga como \(1/R\).`,
String.raw`<b>Valor principal.</b> Si hay un polo simple sobre el eje real, se esquiva con un semicírculo pequeño, que aporta \(-\pi i\,\operatorname{Res}\) (medio residuo). Así se obtiene \(\int_{-\infty}^\infty\dfrac{\sin x}{x}dx=\pi\).`,
String.raw`<b>Cortes de rama.</b> Integrales como \(\int_0^\infty\dfrac{x^{a-1}}{1+x}dx=\dfrac{\pi}{\sin\pi a}\) se calculan con un contorno de “ojo de cerradura” alrededor del corte.`,
String.raw`<b>En física.</b> La transformada de Fourier de una lorentziana es una exponencial decreciente: \(\int\dfrac{e^{ikx}}{x^2+a^2}dx=\dfrac{\pi}{a}e^{-|k|a}\). Así se obtienen funciones de Green, propagadores y respuestas causales.`],
lab:tabs([['sc','Semicírculo',`<div class="controls" style="margin:0 0 12px">integrando = ${sel('ir-f',[['lor','1/(x² + 1)'],['q4','1/(x⁴ + 1)'],['l2','1/(x² + 1)²'],['four','e^{ikx}/(x² + 1)']])}</div>`+
  lab2('ir-cv',slider('ir-R','radio R',1.1,12,0.1,3)+slider('ir-k','k (Fourier)',0,3,0.1,1),'ir-read',String.raw`El contorno es el segmento \([-R,R]\) más el semicírculo superior. La integral total siempre vale \(2\pi i\sum\operatorname{Res}\) de los polos encerrados. Al crecer \(R\), la contribución del arco tiende a cero y el segmento converge a la integral real buscada.`)],
 ['tr','Integral trigonométrica',lab2('ir-cv2',slider('ir-a','a',1.05,4,0.01,2),'ir-read2',String.raw`\(\int_0^{2\pi}\dfrac{d\theta}{a+\cos\theta}\). Con \(z=e^{i\theta}\) se transforma en \(\oint_{|z|=1}\dfrac{2\,dz}{i(z^2+2az+1)}\). Los polos están en \(z=-a\pm\sqrt{a^2-1}\); su producto es 1, así que exactamente uno queda dentro de la circunferencia unidad.`)]]),
laws:[['Sustitución trigonométrica',String.raw`z=e^{i\theta}:\quad\cos\theta=\frac{z+z^{-1}}{2},\ \ \sin\theta=\frac{z-z^{-1}}{2i},\ \ d\theta=\frac{dz}{iz}`,'Convierte la integral en una sobre |z| = 1.'],
 ['Racionales',String.raw`\int_{-\infty}^{\infty}\frac{P(x)}{Q(x)}dx=2\pi i\sum_{\operatorname{Im}z_j>0}\operatorname{Res}\Big(\frac PQ,z_j\Big)`,'Si deg Q ≥ deg P + 2 y Q no se anula en ℝ.'],
 ['Lema de Jordan',String.raw`\Big|\int_{C_R}f(z)e^{ikz}dz\Big|\le\frac{\pi}{k}\max_{C_R}|f|\ \xrightarrow{R\to\infty}\ 0`,'Para k > 0 y f → 0 en el semiplano superior.'],
 ['Lorentziana',String.raw`\int_{-\infty}^{\infty}\frac{\cos kx}{x^2+a^2}\,dx=\frac{\pi}{a}e^{-|k|a}`,String.raw`Residuo de \(e^{ikz}/(z^2+a^2)\) en \(ia\).`],
 ['Medio residuo',String.raw`\lim_{\varepsilon\to0}\int_{C_\varepsilon}f\,dz=-\pi i\operatorname{Res}(f,x_0)`,'Semicírculo pequeño superior, recorrido en sentido horario, alrededor de un polo simple real.'],
 ['Ejemplo clásico',String.raw`\int_0^{2\pi}\frac{d\theta}{a+\cos\theta}=\frac{2\pi}{\sqrt{a^2-1}},\quad a>1`,'Uno de los dos polos queda dentro del círculo unidad.']],
ex:[String.raw`Calcula \(\displaystyle\int_{-\infty}^{\infty}\frac{dx}{x^4+1}\).`,
 [String.raw`Polos: raíces de \(z^4=-1\), \(z_k=e^{i\pi(2k+1)/4}\). En el semiplano superior: \(z_0=e^{i\pi/4}\) y \(z_1=e^{3i\pi/4}\).`,
  String.raw`Polos simples con \(h=z^4+1\): \(\operatorname{Res}=\dfrac{1}{4z_k^3}=-\dfrac{z_k}{4}\), porque \(z_k^4=-1\).`,
  String.raw`Suma: \(-\tfrac14\big(e^{i\pi/4}+e^{3i\pi/4}\big)=-\tfrac14\cdot i\sqrt2\).`,
  String.raw`\(\int=2\pi i\cdot\Big(-\dfrac{i\sqrt2}{4}\Big)=\dfrac{\pi\sqrt2}{2}=\dfrac{\pi}{\sqrt2}\approx2{,}221\).`],
 'Selecciona 1/(x⁴ + 1) en el laboratorio y aumenta R.'],
prev:['vc-residuos','Teorema de los residuos'],next:['vc-kramers-kronig','Fourier, Laplace y Kramers-Kronig'],
ref:'Churchill &amp; Brown, cap. 7; Arfken, cap. 11; Boas, <i>Mathematical Methods in the Physical Sciences</i>, cap. 14'}));

V.push(topicPage({id:'vc-kramers-kronig',pre:'kk',course:VC,unit:W5,title:'Transformadas de Fourier y Laplace, Kramers-Kronig',
lead:String.raw`La causalidad (ningún efecto antes de su causa) obliga a que la función de respuesta de un sistema lineal sea analítica en el semiplano superior de frecuencias. Con el teorema de Cauchy, eso liga la parte real y la imaginaria: conocer la absorción de un material determina su dispersión, y viceversa.`,
res:[String.raw`<b>Respuesta lineal.</b> Un sistema lineal e invariante en el tiempo responde a una fuerza \(F(t)\) con \(x(t)=\int G(t-t')F(t')\,dt'\). Causalidad: \(G(\tau)=0\) para \(\tau<0\).`,
String.raw`<b>Susceptibilidad.</b> \(\chi(\omega)=\int_0^\infty G(\tau)e^{i\omega\tau}d\tau\) (convención \(e^{-i\omega t}\) para la dependencia temporal). Como solo intervienen \(\tau>0\), el factor \(e^{i\omega\tau}=e^{i\operatorname{Re}\omega\,\tau}e^{-\operatorname{Im}\omega\,\tau}\) decae si \(\operatorname{Im}\omega>0\): \(\chi\) es holomorfa en el semiplano superior.`,
String.raw`<b>Oscilador amortiguado.</b> \(\chi(\omega)=\dfrac{1}{\omega_0^2-\omega^2-i\gamma\omega}\), con polos en \(\omega_\pm=-\tfrac{i\gamma}{2}\pm\sqrt{\omega_0^2-\gamma^2/4}\): ambos en el semiplano inferior, como exige la causalidad.`,
String.raw`<b>Relaciones de Kramers-Kronig.</b> Con \(\chi=\chi'+i\chi''\): \(\chi'(\omega)=\dfrac1\pi\,\mathrm{P}\!\!\int_{-\infty}^{\infty}\dfrac{\chi''(\omega')}{\omega'-\omega}d\omega'\) y \(\chi''(\omega)=-\dfrac1\pi\,\mathrm{P}\!\!\int_{-\infty}^{\infty}\dfrac{\chi'(\omega')}{\omega'-\omega}d\omega'\).`,
String.raw`<b>Deducción.</b> Se aplica Cauchy a \(\chi(\omega')/(\omega'-\omega)\) sobre el eje real más un semicírculo grande superior (que no aporta si \(\chi\to0\)), esquivando \(\omega\) con un semicírculo pequeño (medio residuo): \(\mathrm{P}\!\int\dfrac{\chi(\omega')}{\omega'-\omega}d\omega'=i\pi\chi(\omega)\). Separando parte real e imaginaria salen las dos relaciones.`,
String.raw`<b>Significado físico.</b> \(\chi''\) describe la absorción y \(\chi'\) la dispersión (el índice de refracción). Cerca de una línea de absorción, \(\chi'\) cambia bruscamente: dispersión anómala. Una no puede existir sin la otra.`,
String.raw`<b>Transformada de Laplace.</b> \(F(s)=\int_0^\infty f(t)e^{-st}dt\) es holomorfa para \(\operatorname{Re}s\) suficientemente grande. La inversa (integral de Bromwich) se calcula cerrando a la izquierda: \(f(t)=\sum\operatorname{Res}\big(F(s)e^{st}\big)\). Es la versión rotada de la misma idea.`,
String.raw`<b>Función de Green por residuos.</b> \(G(t)=\dfrac1{2\pi}\int\chi(\omega)e^{-i\omega t}d\omega\). Para \(t<0\) se cierra por arriba (no hay polos): \(G=0\). Para \(t>0\) se cierra por abajo y aparece \(G(t)=e^{-\gamma t/2}\dfrac{\sin\omega_1t}{\omega_1}\), con \(\omega_1=\sqrt{\omega_0^2-\gamma^2/4}\).`],
lab:tabs([['kk','Absorción y dispersión',lab2('kk-cv',slider('kk-w0','ω₀',0.5,3,0.05,1.5)+slider('kk-g','γ',0.05,2,0.01,0.3),'kk-read',String.raw`Curvas: \(\chi'\) (verde, dispersión) y \(\chi''\) (naranja, absorción) del oscilador amortiguado. Los puntos violeta son \(\chi'\) reconstruida <i>solo a partir de</i> \(\chi''\) con la integral de Kramers-Kronig, calculada numéricamente. Coinciden con la curva verde.`)],
 ['gr','Causalidad y polos',lab2('kk-cv2',slider('kk-w1','ω₀',0.5,3,0.05,1.5)+slider('kk-g1','γ',0.05,2,0.01,0.3),'kk-read2',String.raw`Izquierda: plano complejo de \(\omega\) con los dos polos de \(\chi\), siempre en el semiplano inferior. Derecha: la función de Green \(G(t)\), nula para \(t<0\) y oscilante amortiguada para \(t>0\). Más amortiguamiento aleja los polos del eje real y acorta la respuesta.`)]]),
laws:[['Susceptibilidad causal',String.raw`\chi(\omega)=\int_0^\infty G(\tau)\,e^{i\omega\tau}\,d\tau`,'Holomorfa en Im ω > 0.'],
 ['Kramers-Kronig',String.raw`\chi'(\omega)=\frac1\pi\,\mathrm{P}\!\!\int_{-\infty}^{\infty}\frac{\chi''(\omega')}{\omega'-\omega}\,d\omega'`,'Y la relación inversa con signo menos.'],
 ['Origen',String.raw`\mathrm{P}\!\!\int_{-\infty}^{\infty}\frac{\chi(\omega')}{\omega'-\omega}\,d\omega'=i\pi\,\chi(\omega)`,'Cauchy con un semicírculo grande superior y medio residuo en ω.'],
 ['Oscilador amortiguado',String.raw`\chi(\omega)=\frac{1}{\omega_0^2-\omega^2-i\gamma\omega},\qquad\omega_\pm=-\frac{i\gamma}{2}\pm\omega_1`,String.raw`\(\omega_1=\sqrt{\omega_0^2-\gamma^2/4}\).`],
 ['Función de Green',String.raw`G(t)=\Theta(t)\,e^{-\gamma t/2}\,\frac{\sin\omega_1t}{\omega_1}`,'Se obtiene por residuos cerrando en el semiplano inferior.'],
 ['Inversión de Laplace',String.raw`f(t)=\frac1{2\pi i}\int_{c-i\infty}^{c+i\infty}F(s)e^{st}ds=\sum\operatorname{Res}\big(F(s)e^{st}\big)`,'Integral de Bromwich cerrada a la izquierda.']],
ex:[String.raw`Calcula por residuos \(G(t)=\dfrac1{2\pi}\displaystyle\int_{-\infty}^\infty\frac{e^{-i\omega t}}{\omega_0^2-\omega^2-i\gamma\omega}d\omega\).`,
 [String.raw`Denominador: \(-(\omega-\omega_+)(\omega-\omega_-)\), con \(\omega_\pm=-\tfrac{i\gamma}2\pm\omega_1\), ambos en \(\operatorname{Im}\omega<0\).`,
  String.raw`\(t<0\): \(e^{-i\omega t}\) decae en el semiplano superior; se cierra por arriba, no hay polos y \(G=0\). Es la causalidad.`,
  String.raw`\(t>0\): se cierra por abajo (sentido horario, factor \(-2\pi i\)). Residuos: \(\dfrac{e^{-i\omega_+t}}{-(\omega_+-\omega_-)}\) y \(\dfrac{e^{-i\omega_-t}}{-(\omega_--\omega_+)}\). Suman \(\dfrac{e^{-\gamma t/2}(e^{i\omega_1t}-e^{-i\omega_1t})}{2\omega_1}=\dfrac{i\,e^{-\gamma t/2}\sin\omega_1t}{\omega_1}\).`,
  String.raw`\(G(t)=\dfrac{-2\pi i}{2\pi}\cdot\dfrac{i\,e^{-\gamma t/2}\sin\omega_1t}{\omega_1}=e^{-\gamma t/2}\dfrac{\sin\omega_1t}{\omega_1}\) para \(t>0\). ✓ Es la respuesta del oscilador a un golpe instantáneo.`]],
prev:['vc-integrales-reales','Integrales reales por residuos'],next:['variable-compleja-ejercicios','Ejercicios resueltos'],
ref:'Jackson, <i>Classical Electrodynamics</i>, sec. 7.10; Arfken, cap. 11–12; Landau-Lifshitz, <i>Física estadística</i>, §123'}));

/* ---------- laboratorios ---------- */
LABS['vc-residuos']=function(sec){
  const cv=$('#rs-cv',sec),rd=$('#rs-read',sec),sf=$('#rs-f',sec),gr=sl(sec,'rs-r',v=>nf(v,2),()=>draw());let P=null;const Cc=[[0.3,0.4]];sf.onchange=()=>draw();
  const r4=[1,3,5,7].map(k=>C.polar(1,k*Math.PI/4));
  const RF={lor:{f:z=>C.div([1,0],C.add(C.mul(z,z),[1,0])),p:[[[0,1],[0,-0.5]],[[0,-1],[0,0.5]]]},
    ezz:{f:z=>C.div(C.exp(z),C.mul(z,C.sub(z,[1,0]))),p:[[[0,0],[-1,0]],[[1,0],[Math.E,0]]]},
    q4:{f:z=>C.div([1,0],C.add(C.mul(C.mul(z,z),C.mul(z,z)),[1,0])),p:r4.map(z=>[z,C.sc(z,-0.25)])},
    d2:{f:z=>C.div([1,0],C.mul(C.mul(z,z),C.sub(z,[2,0]))),p:[[[0,0],[-0.25,0]],[[2,0],[0.25,0]]]},
    csc:{f:z=>C.div([1,0],C.sin(z)),p:[-3,-2,-1,0,1,2,3].map(k=>[[k*Math.PI,0],[k%2?-1:1,0]])}};
  function draw(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.85,470,300),o=RF[sf.value],c=Cc[0],r=gr();P=cplane(ctx,w,h,3.4,0,w,false);
    domainColor(ctx,P,w,h,o.f,{step:3});ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(0,0,w,h);
    ctx.save();ctx.strokeStyle=K.ink;ctx.lineWidth=3;ctx.beginPath();ctx.arc(P.X(c[0]),P.Y(c[1]),r*P.s,0,TAU);ctx.stroke();ctx.restore();
    const a=C.add(c,C.polar(r,0.3)),b=C.add(c,C.polar(r,0.42));arrow(ctx,P.X(a[0]),P.Y(a[1]),P.X(b[0]),P.Y(b[1]),K.ink,3);
    let sum=[0,0];const ins=[];
    o.p.forEach(([z,res])=>{const d=C.abs(C.sub(z,c)),inside=d<r;if(inside){sum=C.add(sum,res);ins.push([z,res]);}
      const X=P.X(z[0]),Y=P.Y(z[1]);if(X<-10||X>w+10)return;ctx.save();ctx.strokeStyle=inside?K.r:K.ink;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X-7,Y-7);ctx.lineTo(X+7,Y+7);ctx.moveTo(X+7,Y-7);ctx.lineTo(X-7,Y+7);ctx.stroke();ctx.restore();
      label(ctx,'Res = '+cs(res,3),X+10,Y-12,inside?K.r:K.ink,'left','middle','700 11px Inter');});
    handle(ctx,P,c,K.ink);
    const near=o.p.some(([z])=>Math.abs(C.abs(C.sub(z,c))-r)<0.04);
    const I=near?null:cint(o.f,t=>C.add(c,C.polar(r,TAU*t)),3000),pred=C.mul([0,TAU],sum);
    rd.innerHTML=row('polos encerrados',ins.length?ins.map(([z])=>cs(z,2)).join(', '):'ninguno')+row('Σ Res',cs(sum,4))+row('2πi Σ Res',cs(pred,4))+row('∮ f dz (numérico)',I?cs(I,4):'—')+sep+
      rowT(near?'<span class="aa-no">El contorno pasa por un polo: la integral no está definida.</span>':ins.length?'Coinciden: la integral solo depende de los residuos encerrados.':'Sin polos dentro: la integral es 0 (Cauchy-Goursat).');
  }
  dragPts(cv,()=>P,Cc,draw,{R:3.3,snap:0.05});
  return {draw};
};

LABS['vc-integrales-reales']=function(sec){
  const cv=$('#ir-cv',sec),rd=$('#ir-read',sec),sf=$('#ir-f',sec),gR=sl(sec,'ir-R',v=>nf(v,1),()=>draw1()),gk=sl(sec,'ir-k',v=>nf(v,1),()=>draw1());sf.onchange=()=>draw1();
  const IF={lor:{f:z=>C.div([1,0],C.add(C.mul(z,z),[1,0])),poles:k=>[[[0,1],[0,-0.5]]],ex:()=>Math.PI,t:'∫ dx/(x² + 1) = π'},
    q4:{f:z=>C.div([1,0],C.add(C.pow(z,4),[1,0])),poles:()=>[1,3].map(j=>{const z=C.polar(1,j*Math.PI/4);return [z,C.sc(z,-0.25)];}),ex:()=>Math.PI/Math.SQRT2,t:'∫ dx/(x⁴ + 1) = π/√2'},
    l2:{f:z=>C.div([1,0],C.mul(C.add(C.mul(z,z),[1,0]),C.add(C.mul(z,z),[1,0]))),poles:()=>[[[0,1],[0,-0.25]]],ex:()=>Math.PI/2,t:'∫ dx/(x² + 1)² = π/2'},
    four:{f:z=>C.div(C.exp(C.mul([0,gk()],z)),C.add(C.mul(z,z),[1,0])),poles:k=>[[[0,1],[0,-Math.exp(-k)/2]]],ex:k=>Math.PI*Math.exp(-k),t:'∫ e^{ikx}/(x² + 1) dx = π e^{−k}'}};
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.75,440,280),o=IF[sf.value],R=gR(),k=gk();
    const P=plane(ctx,w,h*1.0,Math.max(R*1.15,1.6));
    const Pc={...P,cy:h-28,Y:y=>h-28-y*P.s};const PP=Pc;
    ctx.clearRect(0,0,w,h);const P2=(()=>{const s=Math.min(w/(2.3*R),(h-40)/(1.2*R));return {s,X:x=>w/2+x*s,Y:y=>h-28-y*s};})();
    ctx.strokeStyle=K.gr;ctx.lineWidth=1;const stp=R>6?2:1;for(let i=-Math.ceil(R*1.2);i<=R*1.2;i+=stp){ctx.beginPath();ctx.moveTo(P2.X(i),0);ctx.lineTo(P2.X(i),h);ctx.stroke();}
    ctx.strokeStyle=K.ax;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,P2.Y(0));ctx.lineTo(w,P2.Y(0));ctx.moveTo(P2.X(0),0);ctx.lineTo(P2.X(0),h);ctx.stroke();
    ctx.save();ctx.strokeStyle=K.t;ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(P2.X(-R),P2.Y(0));ctx.lineTo(P2.X(R),P2.Y(0));ctx.stroke();
    ctx.strokeStyle=K.b;ctx.beginPath();for(let i=0;i<=100;i++){const t=i/100*Math.PI;i?ctx.lineTo(P2.X(R*Math.cos(t)),P2.Y(R*Math.sin(t))):ctx.moveTo(P2.X(R),P2.Y(0));}ctx.stroke();ctx.restore();
    const ps=o.poles(k);ps.forEach(([z])=>{const X=P2.X(z[0]),Y=P2.Y(z[1]);ctx.save();ctx.strokeStyle=z[1]<R?K.r:K.ink;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X-6,Y-6);ctx.lineTo(X+6,Y+6);ctx.moveTo(X+6,Y-6);ctx.lineTo(X-6,Y+6);ctx.stroke();ctx.restore();});
    label(ctx,'segmento [−R, R]',P2.X(-R)+4,P2.Y(0)+14,K.t);label(ctx,'arco C_R',P2.X(R*0.7),P2.Y(R*0.71)-10,K.b);
    const seg=cint(o.f,t=>[-R+2*R*t,0],3000),arcI=cint(o.f,t=>C.polar(R,Math.PI*t),3000),tot=C.add(seg,arcI);
    let sum=[0,0];ps.forEach(([z,res])=>{if(C.abs(z)<R)sum=C.add(sum,res);});const pred=C.mul([0,TAU],sum);
    rd.innerHTML=row('∫ sobre [−R, R]',cs(seg,5))+row('∫ sobre el arco',cs(arcI,5))+row('total',cs(tot,5))+row('2πi Σ Res (Im z > 0)',cs(pred,5))+sep+
      row('valor exacto (R → ∞)',nt(o.ex(k),5))+rowT(o.t)+rowT(R<1?'R < 1: el polo i aún no está dentro.':'Al crecer R, el arco → 0 y el segmento → la integral real.');
  }
  const cv2=$('#ir-cv2',sec),rd2=$('#ir-read2',sec),ga=sl(sec,'ir-a',v=>nf(v,2),()=>draw2());
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.85,420,280),a=ga(),P=cplane(ctx,w,h,Math.max(2,a+Math.sqrt(a*a-1))*1.1+0.2);unitC(ctx,P);
    ctx.save();ctx.strokeStyle=K.t;ctx.lineWidth=3;ctx.setLineDash([]);ctx.beginPath();ctx.arc(P.cx,P.cy,P.s,0,TAU);ctx.stroke();ctx.restore();
    const s=Math.sqrt(a*a-1),p1=[-a+s,0],p2=[-a-s,0];
    [[p1,true],[p2,false]].forEach(([z,ins])=>{const X=P.X(z[0]),Y=P.Y(z[1]);ctx.save();ctx.strokeStyle=ins?K.r:K.ink;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X-7,Y-7);ctx.lineTo(X+7,Y+7);ctx.moveTo(X+7,Y-7);ctx.lineTo(X-7,Y+7);ctx.stroke();ctx.restore();label(ctx,nt(z[0],3),X,Y-16,ins?K.r:K.ink,'center');});
    const N=4000;let num=0;for(let i=0;i<N;i++){const t=(i+0.5)/N*TAU;num+=1/(a+Math.cos(t));}num*=TAU/N;
    const res=1/(2*s),I=2*Math.PI/s;
    rd2.innerHTML=row('polo dentro',nt(p1[0],4))+row('polo fuera',nt(p2[0],4))+row('producto de los polos','1')+sep+
      row('Res de 2/(i(z² + 2az + 1))','2/(i·2√(a² − 1)) = '+cs([0,-1/s],4))+row('2πi · Res',nt(I,5))+row('integral numérica',nt(num,5))+row('2π/√(a² − 1)',nt(I,5))+
      rowT(a<1.15?'Si a → 1⁺, el polo interior se acerca a −1 (en la circunferencia) y la integral diverge.':'');
  }
  return {draw(){draw1();draw2();}};
};

LABS['vc-kramers-kronig']=function(sec){
  const cv=$('#kk-cv',sec),rd=$('#kk-read',sec),gw=sl(sec,'kk-w0',v=>nf(v,2),()=>draw1()),gg=sl(sec,'kk-g',v=>nf(v,2),()=>draw1());
  const chi=(w,w0,g)=>C.div([1,0],[w0*w0-w*w,-g*w]);
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.7,400,260),w0=gw(),g=gg();
    let mx=0;for(let i=0;i<=400;i++){const v=chi(i/400*4,w0,g);mx=Math.max(mx,Math.abs(v[0]),Math.abs(v[1]));}mx=Math.min(mx*1.1,60);
    const A=axes(ctx,{l:44,t:14,w:w-58,h:h-40,xr:[0,4],yr:[-mx*0.6,mx],xl:'ω'});
    curve(ctx,A,x=>chi(x,w0,g)[0],0,4,K.t,2.5);curve(ctx,A,x=>chi(x,w0,g)[1],0,4,K.b,2.5);
    /* KK numérica: χ'(ω) = (2/π) P∫₀^∞ ω' χ''(ω') / (ω'^2 − ω^2) dω' */
    const W=80,M=16000,dw=W/M,c2=x=>chi(x,w0,g)[1],kk=x=>{const gx=x*c2(x);let s=0;for(let i=0;i<M;i++){const wp=(i+0.5)*dw;s+=(wp*c2(wp)-gx)/(wp*wp-x*x)*dw;}
      s+=gx*Math.log((W-x)/(W+x))/(2*x);return 2/Math.PI*s;};
    for(let i=1;i<=32;i++){const x=i/32*4-0.05;const y=kk(x);dot(ctx,A.X(x),A.Y(Math.max(-mx*0.6,Math.min(mx,y))),3.5,K.d);}
    label(ctx,"χ′ (dispersión)",A.X(0.1),A.Y(chi(0.1,w0,g)[0])-14,K.t);label(ctx,"χ″ (absorción)",A.X(w0)+8,A.Y(chi(w0,w0,g)[1])+4,K.b);
    rd.innerHTML=row('ω₀',nf(w0,2))+row('γ',nf(g,2))+row("χ″ máx (en ω ≈ ω₀)",nt(1/(g*w0),3))+row('anchura de la línea','≈ γ = '+nf(g,2))+sep+
      rowT('<span class="sw" style="background:#7048e8"></span>puntos: χ′ calculada solo con χ″ mediante Kramers-Kronig')+rowT('Cerca de ω₀, χ′ cambia de signo bruscamente: dispersión anómala.');
  }
  const cv2=$('#kk-cv2',sec),rd2=$('#kk-read2',sec),gw1=sl(sec,'kk-w1',v=>nf(v,2),()=>draw2()),gg1=sl(sec,'kk-g1',v=>nf(v,2),()=>draw2());
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.55,360,240),w0=gw1(),g=gg1(),hw=w/2-4;
    const P1=cplane(ctx,w,h,3.2,0,hw);ctx.fillStyle='#fff';ctx.fillRect(hw,0,8,h);
    clipR(ctx,0,hw,h,()=>{ctx.fillStyle='rgba(43,138,62,.1)';ctx.fillRect(0,0,hw,P1.cy);label(ctx,'holomorfa (Im ω > 0)',8,14,K.r);
      const D=w0*w0-g*g/4;const ps=D>=0?[[Math.sqrt(D),-g/2],[-Math.sqrt(D),-g/2]]:[[0,-g/2+Math.sqrt(-D)],[0,-g/2-Math.sqrt(-D)]];
      ps.forEach(z=>{const X=P1.X(z[0]),Y=P1.Y(z[1]);ctx.save();ctx.strokeStyle=K.w;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X-7,Y-7);ctx.lineTo(X+7,Y+7);ctx.moveTo(X+7,Y-7);ctx.lineTo(X-7,Y+7);ctx.stroke();ctx.restore();});});
    ctx.save();ctx.translate(w/2+4,0);const A=axes(ctx,{l:30,t:14,w:hw-40,h:h-40,xr:[-5,20],yr:[-1/Math.max(0.3,w0)*1.1,1/Math.max(0.3,w0)*1.1],xl:'t',xf:v=>nt(v,0)});
    const D=w0*w0-g*g/4,G=t=>t<0?0:D>0?Math.exp(-g*t/2)*Math.sin(Math.sqrt(D)*t)/Math.sqrt(D):D===0?t*Math.exp(-g*t/2):Math.exp(-g*t/2)*Math.sinh(Math.sqrt(-D)*t)/Math.sqrt(-D);
    curve(ctx,A,G,-5,20,K.t,2.5,null,800);ctx.restore();
    const w1=Math.sqrt(Math.max(0,D));
    rd2.innerHTML=row('polos',D>=0?`±${nt(w1,3)} − ${nt(g/2,3)}i`:`(${nt(-g/2+Math.sqrt(-D),3)})i y (${nt(-g/2-Math.sqrt(-D),3)})i`)+row('Im ω (ambos)','< 0 ✓')+sep+
      row('ω₁',D>=0?nt(w1,3):'imaginaria (sobreamortiguado)')+row('tiempo de decaimiento 2/γ',nt(2/g,2))+rowT('G(t) = 0 para t < 0: la respuesta nunca precede al impulso.');
  }
  return {draw(){draw1();draw2();}};
};
/* ---- insertar vistas antes de la de ejercicios ---- */
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
