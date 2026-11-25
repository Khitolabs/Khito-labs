/* Dinámica no lineal y caos — vistas y laboratorios (área Álgebra y Análisis). Fuente: Strogatz, Nonlinear Dynamics and Chaos, 3.ª ed. */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const K={t:'#0f766e',ts:'#dcf0eb',a:'#2453c9',b:'#d9480f',r:'#2b8a3e',d:'#7048e8',w:'#c92a2a',f:'#e67700',ink:'#1c2230',mut:'#5d6577',ax:'#9aa1b0',gr:'#eeeae0',line:'#e3ddcf'};
const TAU=Math.PI*2;
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

const lab2=(cv,ctrl,rd,hint)=>`<div class="two"><div><div class="canvas-box"><canvas id="${cv}"></canvas></div>${ctrl?`<div class="controls">${ctrl}</div>`:''}</div><div><div class="readout" id="${rd}"></div>${hint?`<p class="hint" style="margin-top:12px">${hint}</p>`:''}</div></div>`;
const tabs=T=>`<div class="tabs">${T.map((t,i)=>`<button data-t="${t[0]}"${i?'':' class="on"'}>${t[1]}</button>`).join('')}</div>`+T.map((t,i)=>`<div class="tabpane${i?'':' on'}" data-pane="${t[0]}">${t[2]}</div>`).join('');
const slider=(id,lab,min,max,step,val)=>`<label class="slider">${lab} <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"><b></b></label>`;
const btn=(id,t,ghost=true)=>`<button class="btn${ghost?' ghost':''}" id="${id}">${t}</button>`;
const seg=(id,attr,opts)=>`<div class="seg" id="${id}">${opts.map((o,i)=>`<button data-${attr}="${o[0]}"${i?'':' class="on"'}>${o[1]}</button>`).join('')}</div>`;
const sel=(id,opts)=>`<select id="${id}" class="aa-sel">${opts.map(o=>`<option value="${o[0]}">${o[1]}</option>`).join('')}</select>`;
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

const det2=(a,b,c,d)=>a*d-b*c;
/* ================= utilidades propias de Ecuaciones diferenciales ================= */
{const st=document.createElement('style');st.textContent=`
.dx-legend{display:flex;flex-wrap:wrap;gap:10px 16px;font:500 .82rem Inter,sans-serif;color:var(--muted);margin-top:8px}
.dx-legend span{display:inline-flex;align-items:center;gap:6px}
.dx-legend i{display:inline-block;width:16px;height:3px;border-radius:2px}
.view.theme-aa canvas.dx-click{cursor:crosshair}
`;document.head.appendChild(st);}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const leg=items=>`<div class="dx-legend">${items.map(([c,t])=>`<span><i style="background:${c}"></i>${t}</span>`).join('')}</div>`;
const sw=c=>`<span class="sw" style="background:${c}"></span>`;
/* ---- integración numérica ---- */
function rk4(f,t,y,h){const k1=f(t,y),y2=y.map((v,i)=>v+h/2*k1[i]),k2=f(t+h/2,y2),y3=y.map((v,i)=>v+h/2*k2[i]),k3=f(t+h/2,y3),y4=y.map((v,i)=>v+h*k3[i]),k4=f(t+h,y4);
  return y.map((v,i)=>v+h/6*(k1[i]+2*k2[i]+2*k3[i]+k4[i]));}
/* trayectoria desde (t0,y0) hasta t1 con n pasos; devuelve [[t,y...],...] y se detiene si diverge */
function orbit(f,t0,y0,t1,n,lim=1e6){const h=(t1-t0)/n,out=[[t0,...y0]];let y=y0.slice(),t=t0;
  for(let i=0;i<n;i++){y=rk4(f,t,y,h);t+=h;if(!y.every(v=>isFinite(v)&&Math.abs(v)<lim))break;out.push([t,...y]);}return out;}
function simpson(f,a,b,n=400){if(n%2)n++;const h=(b-a)/n;let s=f(a)+f(b);for(let i=1;i<n;i++)s+=(i%2?4:2)*f(a+i*h);return s*h/3;}
function bisect(f,a,b,it=60){let fa=f(a);for(let k=0;k<it;k++){const m=(a+b)/2,fm=f(m);if(fa*fm<=0)b=m;else{a=m;fa=fm;}}return (a+b)/2;}
function zeros(f,a,b,n=800){const r=[];let x0=a,f0=f(a);for(let i=1;i<=n;i++){const x1=a+(b-a)*i/n,f1=f(x1);if(isFinite(f0)&&isFinite(f1)&&f0*f1<0)r.push(bisect(f,x0,x1));x0=x1;f0=f1;}return r;}
/* ---- funciones especiales ---- */
const LG=[0.99999999999980993,676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];
function gamma(x){if(x<0.5)return Math.PI/(Math.sin(Math.PI*x)*gamma(1-x));x-=1;let a=LG[0];const t=x+7.5;for(let i=1;i<9;i++)a+=LG[i]/(x+i);return Math.sqrt(TAU)*Math.pow(t,x+0.5)*Math.exp(-t)*a;}
const fact=n=>{let p=1;for(let i=2;i<=n;i++)p*=i;return p;};
const binom=(n,k)=>fact(n)/(fact(k)*fact(n-k));
function erf(x){const s=x<0?-1:1;x=Math.abs(x);const t=1/(1+0.3275911*x),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return s*y;}
const erfc=x=>1-erf(x);
function legendre(n,x){if(n===0)return 1;let p0=1,p1=x;for(let k=1;k<n;k++){const p2=((2*k+1)*x*p1-k*p0)/(k+1);p0=p1;p1=p2;}return p1;}
/* P_l^m con fase de Condon-Shortley */
function assocLeg(l,m,x){let pmm=1;if(m>0){const s=Math.sqrt(Math.max(0,1-x*x));let f=1;for(let i=1;i<=m;i++){pmm*=-f*s;f+=2;}}
  if(l===m)return pmm;let pm1=x*(2*m+1)*pmm;if(l===m+1)return pm1;let pl=0;for(let ll=m+2;ll<=l;ll++){pl=(x*(2*ll-1)*pm1-(ll+m-1)*pmm)/(ll-m);pmm=pm1;pm1=pl;}return pl;}
function hermite(n,x){if(n===0)return 1;let h0=1,h1=2*x;for(let k=1;k<n;k++){const h2=2*x*h1-2*k*h0;h0=h1;h1=h2;}return h1;}
/* autofunciones normalizadas del oscilador armónico, recurrencia estable */
function psiHO(n,x){let p0=Math.pow(Math.PI,-0.25)*Math.exp(-x*x/2);if(n===0)return p0;let p1=Math.SQRT2*x*p0;for(let k=1;k<n;k++){const p2=Math.sqrt(2/(k+1))*x*p1-Math.sqrt(k/(k+1))*p0;p0=p1;p1=p2;}return p1;}
function laguerre(n,a,x){if(n===0)return 1;let l0=1,l1=1+a-x;for(let k=1;k<n;k++){const l2=((2*k+1+a-x)*l1-(k+a)*l0)/(k+1);l0=l1;l1=l2;}return l1;}
/* función radial del hidrógeno, r en unidades de a0 */
function Rnl(n,l,r){const rho=2*r/n,N=Math.sqrt(Math.pow(2/n,3)*fact(n-l-1)/(2*n*fact(n+l)));return N*Math.pow(rho,l)*Math.exp(-rho/2)*laguerre(n-l-1,2*l+1,rho);}
/* Bessel de orden entero por representación integral */
function besselJ(n,x){if(x<0)return (n%2?-1:1)*besselJ(n,-x);if(x===0)return n===0?1:0;return simpson(t=>Math.cos(n*t-x*Math.sin(t)),0,Math.PI,Math.max(200,Math.ceil(x*8)))/Math.PI;}
function besselY(n,x){if(x<=0)return -Infinity;const a=simpson(t=>Math.sin(x*Math.sin(t)-n*t),0,Math.PI,Math.max(200,Math.ceil(x*8)))/Math.PI;
  let T=1;while(n*T-x*Math.sinh(T)>-40&&T<40)T+=0.25;const b=simpson(t=>(Math.exp(n*t)+(n%2?-1:1)*Math.exp(-n*t))*Math.exp(-x*Math.sinh(t)),0,T,800)/Math.PI;return a-b;}
function besselI(n,x){return simpson(t=>Math.exp(x*Math.cos(t))*Math.cos(n*t),0,Math.PI,300)/Math.PI;}
function besselK(n,x){let T=1;while(n*T-x*Math.cosh(T)>-40&&T<40)T+=0.25;return simpson(t=>Math.exp(-x*Math.cosh(t))*Math.cosh(n*t),0,T,800);}
/* Bessel de orden real por serie (x moderado) */
function besselJs(nu,x){let s=0,term=Math.pow(x/2,nu)/gamma(nu+1);for(let k=0;k<80;k++){s+=term;term*=-(x*x/4)/((k+1)*(k+1+nu));if(Math.abs(term)<1e-17*Math.abs(s))break;}return s;}
const _jz={};function besselZeros(n,k){const key=n+':'+k;if(_jz[key])return _jz[key];const z=zeros(x=>besselJ(n,x),0.5,k*3.3+n+6,Math.ceil((k*3.3+n+6)*12)).slice(0,k);return _jz[key]=z;}
/* ---- mapas de color ---- */
function divColor(v){/* v en [-1,1] → azul–blanco–naranja */v=clamp(v,-1,1);const a=Math.abs(v);
  const c=v<0?[36,83,201]:[217,72,15];return [Math.round(255+(c[0]-255)*a),Math.round(255+(c[1]-255)*a),Math.round(255+(c[2]-255)*a)];}
function heat(ctx,x0,y0,w,h,fn,step=2){const W=Math.ceil(w/step),H=Math.ceil(h/step),off=document.createElement('canvas');off.width=W;off.height=H;
  const oc=off.getContext('2d'),img=oc.createImageData(W,H),D=img.data;
  for(let j=0;j<H;j++)for(let i=0;i<W;i++){const v=fn((i+0.5)/W,(j+0.5)/H),k=(j*W+i)*4;if(v===null){D[k+3]=0;continue;}const c=divColor(v);D[k]=c[0];D[k+1]=c[1];D[k+2]=c[2];D[k+3]=255;}
  oc.putImageData(img,0,0);ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(off,x0,y0,w,h);ctx.restore();}
/* campo de direcciones normalizado en un sistema de ejes A */
function slopeField(ctx,A,f,nx=22,ny=15,col='#9aa1b0'){const o=A.o;ctx.save();ctx.strokeStyle=col;ctx.lineWidth=1.3;
  for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){const x=o.xr[0]+(i+0.5)/nx*(o.xr[1]-o.xr[0]),y=o.yr[0]+(j+0.5)/ny*(o.yr[1]-o.yr[0]);
    const m=f(x,y);if(!isFinite(m))continue;const px=A.X(x),py=A.Y(y),dx=1,dy=-(m*o.h/(o.yr[1]-o.yr[0]))/(o.w/(o.xr[1]-o.xr[0]));const L=Math.hypot(dx,dy),s=Math.min(o.w/nx,o.h/ny)*0.36;
    ctx.beginPath();ctx.moveTo(px-dx/L*s,py-dy/L*s);ctx.lineTo(px+dx/L*s,py+dy/L*s);ctx.stroke();}ctx.restore();}
/* campo vectorial de un sistema plano (flechas cortas, opacidad según módulo) */
function vecField(ctx,A,F,nx=20,ny=14){const o=A.o;ctx.save();
  for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){const x=o.xr[0]+(i+0.5)/nx*(o.xr[1]-o.xr[0]),y=o.yr[0]+(j+0.5)/ny*(o.yr[1]-o.yr[0]);
    const v=F(x,y),px=A.X(x),py=A.Y(y),dx=v[0]*o.w/(o.xr[1]-o.xr[0]),dy=-v[1]*o.h/(o.yr[1]-o.yr[0]),L=Math.hypot(dx,dy);if(!(L>1e-9))continue;
    const s=Math.min(o.w/nx,o.h/ny)*0.4,ux=dx/L,uy=dy/L;ctx.strokeStyle=ctx.fillStyle=`rgba(93,101,119,${0.35+0.4*Math.min(1,Math.log10(1+Math.hypot(v[0],v[1]))) })`;ctx.lineWidth=1.2;
    ctx.beginPath();ctx.moveTo(px-ux*s,py-uy*s);ctx.lineTo(px+ux*s,py+uy*s);ctx.stroke();
    ctx.beginPath();ctx.moveTo(px+ux*s,py+uy*s);ctx.lineTo(px+ux*s-ux*4-uy*2.5,py+uy*s-uy*4+ux*2.5);ctx.lineTo(px+ux*s-ux*4+uy*2.5,py+uy*s-uy*4-ux*2.5);ctx.closePath();ctx.fill();}
  ctx.restore();}
function path(ctx,A,pts,col,lw=2.5,dash){ctx.save();ctx.beginPath();ctx.rect(A.o.l,A.o.t,A.o.w,A.o.h);ctx.clip();ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.lineJoin='round';if(dash)ctx.setLineDash(dash);
  ctx.beginPath();let pen=false;pts.forEach(p=>{if(!isFinite(p[0])||!isFinite(p[1])){pen=false;return;}const X=A.X(p[0]),Y=clamp(A.Y(p[1]),-5e3,5e3);pen?ctx.lineTo(X,Y):ctx.moveTo(X,Y);pen=true;});ctx.stroke();ctx.restore();}
function xmark(ctx,X,Y,col,s=6){ctx.save();ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X-s,Y-s);ctx.lineTo(X+s,Y+s);ctx.moveTo(X+s,Y-s);ctx.lineTo(X-s,Y+s);ctx.stroke();ctx.restore();}
const clickPos=(cv,cb)=>cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect();cb(e.clientX-r.left,e.clientY-r.top,e);});
const sgnS=(v,d=2)=>(v<0?' − ':' + ')+nt(Math.abs(v),d);
/* curva de nivel F = c por marching squares sobre los ejes A */
function contour(ctx,A,F,c,col,lw=1.5,nx=90,ny=70,dash){const o=A.o,xs=i=>o.xr[0]+i/nx*(o.xr[1]-o.xr[0]),ys=j=>o.yr[0]+j/ny*(o.yr[1]-o.yr[0]);
  const G=[];for(let i=0;i<=nx;i++){G.push([]);for(let j=0;j<=ny;j++)G[i].push(F(xs(i),ys(j))-c);}
  ctx.save();ctx.beginPath();ctx.rect(o.l,o.t,o.w,o.h);ctx.clip();ctx.strokeStyle=col;ctx.lineWidth=lw;if(dash)ctx.setLineDash(dash);ctx.beginPath();
  const ip=(x0,y0,v0,x1,y1,v1)=>{const t=v0/(v0-v1);return [A.X(x0+(x1-x0)*t),A.Y(y0+(y1-y0)*t)];};
  for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){const a=G[i][j],b=G[i+1][j],cc=G[i+1][j+1],d=G[i][j+1];if(![a,b,cc,d].every(isFinite))continue;
    if(Math.max(Math.abs(a),Math.abs(b),Math.abs(cc),Math.abs(d))>1e6)continue;
    const x0=xs(i),x1=xs(i+1),y0=ys(j),y1=ys(j+1),P=[];
    if(a*b<0)P.push(ip(x0,y0,a,x1,y0,b));if(b*cc<0)P.push(ip(x1,y0,b,x1,y1,cc));if(cc*d<0)P.push(ip(x1,y1,cc,x0,y1,d));if(d*a<0)P.push(ip(x0,y1,d,x0,y0,a));
    if(P.length>=2){ctx.moveTo(P[0][0],P[0][1]);ctx.lineTo(P[1][0],P[1][1]);}if(P.length===4){ctx.moveTo(P[2][0],P[2][1]);ctx.lineTo(P[3][0],P[3][1]);}}
  ctx.stroke();ctx.restore();}
/* ejes en un sub-rectángulo [x,y,w,h] del canvas */
const box=(ctx,x,y,w,h,xr,yr,xl,yl,xf)=>axes(ctx,{l:x+40,t:y+10,w:w-52,h:h-34,xr,yr,xl,yl,xf});
const V=[];
const invA=(A,px,py)=>[A.o.xr[0]+(px-A.o.l)/A.o.w*(A.o.xr[1]-A.o.xr[0]),A.o.yr[0]+(A.o.t+A.o.h-py)/A.o.h*(A.o.yr[1]-A.o.yr[0])];
const inA=(A,px,py)=>px>=A.o.l&&px<=A.o.l+A.o.w&&py>=A.o.t&&py<=A.o.t+A.o.h;
const PAL=['#2b8a3e','#2453c9','#d9480f','#7048e8','#c92a2a','#e67700','#0f766e','#1c2230'];

/* ---- vista del curso ---- */
{const T=[
 ['Unidad I · Flujos en una dimensión',[
  ['dn-flujos-1d','Flujos en la recta: puntos fijos, estabilidad lineal y potencial','Línea de fase, f′(x*) y el potencial V(x).','ẋ = f(x)'],
  ['dn-bifurcaciones-1d','Bifurcaciones silla-nodo, transcrítica y tridente','Formas normales, histéresis y catástrofe en cúspide.','ẋ = r + x²'],
  ['dn-circulo','Flujos en el círculo: osciladores no uniformes y sincronización','Cuellos de botella, T ∝ (ω − a)^(−1/2) y enganche de fase.','θ̇ = ω − a sin θ']]],
 ['Unidad II · Sistemas lineales',[
  ['dn-lineales-2d','Sistemas lineales en el plano y clasificación por traza y determinante','Nodos, sillas, focos y centros en el plano (τ, Δ).','τ² − 4Δ']]],
 ['Unidad III · Plano de fase no lineal',[
  ['dn-plano-fase','Linealización, nulclinas y especies en competencia','Jacobiano, Hartman-Grobman y cuencas de atracción.','J = ∂(f,g)/∂(x,y)'],
  ['dn-conservativos','Sistemas conservativos, reversibles, el péndulo e índice','Energía, centros no lineales, separatrices e índice de Poincaré.','E = ½ẋ² + V(x)'],
  ['dn-ciclos-limite','Ciclos límite, Poincaré-Bendixson y van der Pol','Regiones atrapantes, Liénard y oscilaciones de relajación.','ẍ + μ(x² − 1)ẋ + x = 0']]],
 ['Unidad IV · Bifurcaciones en el plano',[
  ['dn-hopf','Bifurcación de Hopf supercrítica y subcrítica','Nacimiento de un ciclo límite y el Brusselator.','ṙ = μr − r³'],
  ['dn-globales','Bifurcaciones globales de ciclos y osciladores acoplados','Período infinito, homoclínica y cuasiperiodicidad en el toro.','φ̇ = Δω − 2K sin φ'],
  ['dn-poincare','Mapa de Poincaré y estabilidad de órbitas periódicas','Mapa de retorno y multiplicadores de Floquet.','x_{k+1} = P(x_k)']]],
 ['Unidad V · Caos',[
  ['dn-lorenz','Las ecuaciones de Lorenz: propiedades y atractor extraño','Simetría, disipación, bifurcaciones y el atractor de mariposa.','ẋ = σ(y − x)'],
  ['dn-lorenz-mapa','Mapa de Lorenz, exponentes de Lyapunov y predictibilidad','Mapa de máximos, λ ≈ 0,9 y horizonte de predicción.','‖δ‖ ∼ ‖δ₀‖e^{λt}'],
  ['dn-mapas-1d','Mapas unidimensionales, puntos fijos y telaraña','Iteración gráfica, estabilidad |f′(x*)| &lt; 1 y ciclos.','x_{n+1} = f(x_n)'],
  ['dn-logistico','Mapa logístico: duplicación de período, ventanas y exponente de Lyapunov','Cascada de duplicaciones, ventana de período 3 y λ(r).','x_{n+1} = rx_n(1 − x_n)'],
  ['dn-universalidad','Universalidad, constante de Feigenbaum y renormalización','δ ≈ 4,669 y α ≈ −2,503 para todo mapa unimodal.','δ = 4,6692…']]],
 ['Unidad VI · Fractales y atractores extraños',[
  ['dn-fractales','Fractales: Cantor, Koch y dimensiones de similaridad y de conteo de cajas','Autosemejanza y dimensión no entera.','d = ln m / ln r'],
  ['dn-henon','Mapa del panadero, mapa de Hénon y atractor de Rössler','Estirar y plegar: la anatomía de un atractor extraño.','x_{n+1} = y_n + 1 − ax_n²'],
  ['dn-pendulo-forzado','Péndulo forzado amortiguado, Duffing y secciones de Poincaré','Caos en un sistema mecánico real.','θ̈ + bθ̇ + sin θ = F cos t']]],
 ['Cierre',[['dinamica-no-lineal-ejercicios','Ejercicios resueltos de Dinámica no lineal y caos','Problemas guiados paso a paso.','✎']]]];
 const card=([id,t,p,f])=>`<a class="topic" href="#${id}"><div class="thumb"><svg viewBox="0 0 300 150" aria-hidden="true"><text x="150" y="86" text-anchor="middle" font-family="Inter" font-size="${f.length>16?24:30}" font-weight="700" fill="#0f766e">${f}</text></svg></div><div class="body"><h3>${t}</h3><p>${p}</p><span class="go">${id.endsWith('-ejercicios')?'Ver ejercicios':'Abrir tema'} →</span></div></a>`;
 V.push(String.raw`<section class="view theme-aa" data-view="dinamica-no-lineal">
  <div class="eyebrow">Álgebra y Análisis · Nivel Strogatz</div>
  <h1>Dinámica no lineal y caos</h1>
  <p class="lead">Qué hacer cuando la ecuación diferencial no se puede resolver: entenderla geométricamente. Del flujo \(\dot x=f(x)\) en la recta a los ciclos límite del plano y al caos determinista de Lorenz y del mapa logístico, con bifurcaciones, exponentes de Lyapunov y fractales como herramientas.</p>`
 +T.map(([u,L])=>`<h2 class="aa-unit">${u}</h2><div class="topics">${L.map(card).join('')}</div>`).join('\n')
 +String.raw`
<div class="block">
    <h2><span class="ico">☰</span>Temario y prerrequisitos</h2>
    <ul class="keypoints">
      <li><b>Prerrequisitos.</b> <a href="#ecuaciones-diferenciales">Ecuaciones diferenciales</a> (EDO autónomas y sistemas \(\mathbf x'=A\mathbf x\)), <a href="#algebra-lineal">Álgebra lineal</a> (autovalores, traza y determinante) y la parte de oscilaciones de <a href="#mecanica-clasica">Mecánica clásica</a>.</li>
      <li><b>Unidades I y II.</b> En una dimensión todo se decide con el signo de \(f\): puntos fijos, estabilidad \(f'(x^*)\lessgtr0\) y bifurcaciones. En el plano lineal, la clasificación por \(\tau=\operatorname{tr}A\) y \(\Delta=\det A\).</li>
      <li><b>Unidades III y IV.</b> Linealización (Hartman-Grobman), sistemas conservativos, ciclos límite (Poincaré-Bendixson) y sus bifurcaciones locales (Hopf) y globales. En el plano no hay caos.</li>
      <li><b>Unidades V y VI.</b> Con tres dimensiones o con mapas aparece el caos: sensibilidad a condiciones iniciales \(\|\boldsymbol\delta(t)\|\sim\|\boldsymbol\delta_0\|e^{\lambda t}\), universalidad de Feigenbaum \(\delta\approx4{,}6692\) y atractores extraños de dimensión fractal.</li>
      <li><b>Fuente.</b> S. H. Strogatz, <i>Nonlinear Dynamics and Chaos</i>, 3.ª ed., CRC Press, 2024. Complementarias: Alligood, Sauer y Yorke, <i>Chaos: An Introduction to Dynamical Systems</i>; Cvitanović et al., <i>ChaosBook.org</i>.</li>
    </ul>
  </div>
</section>`);}

/* ================= PARTE A · temas 1–6 ================= */
/* utilidades de la parte A */
const pA_d=(f,x,e=1e-5)=>(f(x+e)-f(x-e))/(2*e);
/* raíces de f en [a,b] (cambios de signo) + raíces dobles aproximadas (mínimos de |f| ≈ 0) */
function pA_roots(f,a,b,n=1600){const r=zeros(f,a,b,n);const h=(b-a)/n;
  for(let i=1;i<n;i++){const x0=a+(i-1)*h,x1=a+i*h,x2=a+(i+1)*h,f0=Math.abs(f(x0)),f1=Math.abs(f(x1)),f2=Math.abs(f(x2));
    if(f1<=f0&&f1<=f2&&f1<1e-6&&!r.some(q=>Math.abs(q-x1)<3*h))r.push(x1);}
  return r.sort((p,q)=>p-q);}
const pA_stab=(fp)=>Math.abs(fp)<1e-6?'semiestable / no hiperbólico':fp<0?'estable':'inestable';
/* flechas de la línea de fase sobre el eje y = 0 del sistema A */
function pA_phaseLine(ctx,A,f,xr,col=K.ink){const R=pA_roots(f,xr[0],xr[1]);const pts=[xr[0],...R,xr[1]];
  for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];if(b-a<(xr[1]-xr[0])*0.03)continue;const m=(a+b)/2,s=Math.sign(f(m));if(!s)continue;
    const L=Math.min(28,A.X(b)-A.X(a)-14)/2;if(L<5)continue;arrow(ctx,A.X(m)-s*L,A.Y(0),A.X(m)+s*L,A.Y(0),col,2.5);}
  return R;}

/* ================= 1 · FLUJOS EN LA RECTA ================= */
V.push(String.raw`<section class="view theme-aa" data-view="dn-flujos-1d">
<div class="eyebrow">Dinámica no lineal y caos · Unidad I · Flujos en una dimensión</div><h1>Flujos en la recta: puntos fijos, estabilidad lineal y potencial</h1><p class="lead">La ecuación \(\dot x=f(x)\) define un campo de velocidades sobre la recta. Sin resolverla, el signo de \(f\) dice hacia dónde fluye cada punto: el retrato de fase se reduce a puntos fijos y flechas, y toda trayectoria es monótona.</p>
<div class="toc"><a href="#dn1-res" data-scroll>Resumen</a><a href="#dn1-lab" data-scroll>Visualiza</a><a href="#dn1-leyes" data-scroll>Leyes y fórmulas</a><a href="#dn1-ej" data-scroll>Ejemplo</a></div>
<div class="block" id="dn1-res"><h2><span class="ico">≡</span>Resumen</h2><ul class="keypoints"><li><b>Sistema dinámico de primer orden.</b> \(\dot x=f(x)\), con \(x\in\mathbb R\) y \(f\) suave. Es autónomo: \(f\) no depende de \(t\). El espacio de fases es la recta y la solución \(x(t)\) es la trayectoria de una partícula imaginaria con velocidad \(f(x)\).</li><li><b>Puntos fijos.</b> Los \(x^*\) con \(f(x^*)=0\) son soluciones de equilibrio. Son <i>estables</i> si el flujo converge hacia ellos (sumideros) e <i>inestables</i> si se aleja (fuentes). Entre dos puntos fijos consecutivos el signo de \(f\) es constante.</li><li><b>Estabilidad lineal.</b> Con \(x=x^*+\eta\): \(\dot\eta=f(x^*+\eta)\approx f'(x^*)\,\eta\), así que \(\eta(t)\approx\eta_0e^{f'(x^*)t}\). Si \(f'(x^*)\lt0\) es estable, si \(f'(x^*)>0\) inestable, y \(\tau=1/|f'(x^*)|\) es su tiempo característico. Si \(f'(x^*)=0\), la linealización no decide (por ejemplo \(\dot x=x^2\) es semiestable).</li><li><b>Imposibilidad de oscilar.</b> Por unicidad, dos trayectorias no se cruzan, y en la recta una trayectoria no puede volver atrás: \(x(t)\) es monótona y converge a un punto fijo o diverge. No hay soluciones periódicas en flujos 1D.</li><li><b>Existencia y unicidad.</b> Si \(f\) y \(f'\) son continuas en un intervalo abierto que contiene \(x_0\), el problema \(\dot x=f(x),\ x(0)=x_0\) tiene solución única para \(t\) cercano a 0. Sin la hipótesis falla: \(\dot x=x^{1/3}\) tiene infinitas soluciones desde \(x_0=0\). La solución puede explotar en tiempo finito (\(\dot x=1+x^2\Rightarrow x=\tan t\)).</li><li><b>Potencial.</b> Siempre se puede escribir \(f(x)=-\dfrac{dV}{dx}\), y entonces \(\dfrac{dV}{dt}=V'(x)\dot x=-\big(V'(x)\big)^2\le0\): la partícula baja por \(V\) como en un fluido muy viscoso (límite sobreamortiguado). Los mínimos de \(V\) son los puntos fijos estables y los máximos, los inestables.</li><li><b>Crecimiento logístico.</b> \(\dot N=rN(1-N/K)\) tiene \(N^*=0\) inestable (\(f'=r\)) y \(N^*=K\) estable (\(f'=-r\)). La gráfica \(N(t)\) es sigmoidea si \(N_0\lt K/2\): el punto de inflexión está donde \(f\) es máxima.</li></ul></div>
<div class="block" id="dn1-lab"><h2><span class="ico">◎</span>Visualiza</h2><div class="controls">`+sel('dn1-f',[['q','ẋ = 4x² − 16'],['s','ẋ = sin x'],['c','ẋ = x − x³'],['l','ẋ = x(1 − x/2)  (logística)'],['e','ẋ = x − cos x'],['h','ẋ = x²  (semiestable)']])+`</div>`+tabs([
['fase','Línea de fase y x(t)',lab2('dn1-cv','<button class="btn ghost" id="dn1-clr">Borrar trayectorias</button>','dn1-read','Izquierda: gráfica de \\(f(x)\\) y línea de fase (● estable, ○ inestable). Derecha: \\(x(t)\\) desde varios datos iniciales. Haz clic en cualquiera de los dos paneles para lanzar una trayectoria desde ese \\(x_0\\).')],
['pot','Potencial V(x)',lab2('dn1-cv2','<button class="btn" id="dn1-play">▶ Soltar</button>','dn1-read2','\\(V(x)=-\\int f\\,dx\\). Haz clic sobre la curva para colocar la bolita y suéltala: se mueve con \\(\\dot x=-V\'(x)\\), sin inercia, y se detiene en un mínimo. Observa cómo frena al acercarse (decaimiento exponencial con \\(\\tau=1/|f\'(x^*)|\\)).')]])+String.raw`</div>
<div class="block" id="dn1-leyes"><h2><span class="ico">§</span>Leyes y fórmulas</h2><div class="laws"><div class="law"><h3>Criterio de estabilidad lineal</h3><div class="eq">\[ f(x^*)=0,\qquad \eta(t)\approx\eta_0\,e^{f'(x^*)\,t} \]</div><p>\(f'(x^*)\lt0\): estable; \(f'(x^*)>0\): inestable; \(f'(x^*)=0\): hay que mirar términos de orden superior.</p></div><div class="law"><h3>Teorema de existencia y unicidad</h3><div class="eq">\[ f,\ f'\in C^0(I),\ x_0\in I\ \Rightarrow\ \exists!\ x(t)\ \text{en}\ (-\tau,\tau) \]</div><p>La solución local puede no extenderse a todo \(t\): explosión en tiempo finito si \(f\) crece más rápido que lineal.</p></div><div class="law"><h3>Solución por cuadratura</h3><div class="eq">\[ t=\int_{x_0}^{x}\frac{dx'}{f(x')} \]</div><p>Toda ecuación autónoma de primer orden es separable; la integral puede no tener forma cerrada, pero el análisis cualitativo no la necesita.</p></div><div class="law"><h3>Potencial</h3><div class="eq">\[ \dot x=-\frac{dV}{dx},\qquad \frac{dV}{dt}=-\Big(\frac{dV}{dx}\Big)^2\le0 \]</div><p>\(V\) es una función de Lyapunov: decrece estrictamente fuera de los puntos fijos.</p></div><div class="law"><h3>Ecuación logística</h3><div class="eq">\[ \dot N=rN\Big(1-\frac NK\Big),\qquad N(t)=\frac{K}{1+\big(\frac{K}{N_0}-1\big)e^{-rt}} \]</div><p>Inflexión en \(N=K/2\), donde la tasa de crecimiento es máxima, \(rK/4\).</p></div><div class="law"><h3>Sobreamortiguamiento</h3><div class="eq">\[ m\ddot x+b\dot x=F(x)\ \xrightarrow{\ b^2\gg mk\ }\ b\dot x\approx F(x) \]</div><p>Justificación física de los flujos 1D: si la inercia es despreciable frente al rozamiento, la dinámica es de primer orden.</p></div></div></div>
<div class="block" id="dn1-ej"><h2><span class="ico">✎</span>Ejemplo resuelto</h2><div class="example"><p><b>Analiza \(\dot x=4x^2-16\): puntos fijos, estabilidad, potencial y la solución exacta con \(x(0)=0\). ¿Cuánto tarda en llegar a \(x=-1{,}9\)?</b></p><ol><li>Puntos fijos: \(4x^2-16=0\Rightarrow x^*=\pm2\).</li><li>Estabilidad: \(f'(x)=8x\). En \(x^*=2\), \(f'=16>0\): inestable. En \(x^*=-2\), \(f'=-16\lt0\): estable, con tiempo característico \(\tau=1/16\).</li><li>Línea de fase: \(f>0\) para \(|x|>2\) y \(f\lt0\) para \(|x|\lt2\). Todo dato con \(x_0\lt2\) tiende a \(-2\); con \(x_0>2\), explota en tiempo finito.</li><li>Potencial: \(V=-\int(4x^2-16)\,dx=-\tfrac43x^3+16x\). \(V''(x)=-8x\): mínimo en \(x=-2\) (\(V=-64/3\)) y máximo en \(x=2\) (\(V=64/3\)).</li><li>Solución: \(\dfrac{dx}{x^2-4}=4\,dt\Rightarrow\dfrac14\ln\Big|\dfrac{x-2}{x+2}\Big|=4t+C\). Con \(x(0)=0\): \(\dfrac{x-2}{x+2}=-e^{16t}\Rightarrow x(t)=2\,\dfrac{1-e^{16t}}{1+e^{16t}}=-2\tanh(8t)\).</li><li>Comprobación: \(\dot x=-16\,\mathrm{sech}^2(8t)\) y \(4x^2-16=16\tanh^2(8t)-16=-16\,\mathrm{sech}^2(8t)\). ✓</li><li>Tiempo hasta \(x=-1{,}9\): \(\tanh(8t)=0{,}95\Rightarrow 8t=\operatorname{artanh}0{,}95=1{,}832\Rightarrow t\approx0{,}229\), unas \(3{,}7\) veces \(\tau\).</li></ol><p style="margin:.6em 0 0">El punto fijo estable nunca se alcanza en tiempo finito: \(x+2\approx4e^{-16t}\) decae exponencialmente con la tasa \(|f'(x^*)|\).</p></div></div>
<div class="pager"><a href="#dinamica-no-lineal"><small>← Anterior</small>Dinámica no lineal y caos</a><a class="next" href="#dn-bifurcaciones-1d"><small>Siguiente →</small>Bifurcaciones silla-nodo, transcrítica y tridente</a></div>
<p class="note">Contenido de referencia: Strogatz, <i>Nonlinear Dynamics and Chaos</i>, 3.ª ed., §2.1–2.7. Redacción y simulaciones propias.</p></section>`);

LABS['dn-flujos-1d']=function(sec){
  const cv=$('#dn1-cv',sec),rd=$('#dn1-read',sec),sf=$('#dn1-f',sec),cv2=$('#dn1-cv2',sec),rd2=$('#dn1-read2',sec),pb=$('#dn1-play',sec);
  cv.classList.add('dx-click');cv2.classList.add('dx-click');
  const F={
    q:{f:x=>4*x*x-16,xr:[-4,4],T:0.5,sp:0.06,note:'x* = −2 estable (f′ = −16), x* = 2 inestable (f′ = 16). Para x₀ > 2 la solución explota en tiempo finito.'},
    s:{f:x=>Math.sin(x),xr:[-7,7],T:8,sp:1,note:'Puntos fijos en x = kπ: estables los impares (f′ = −1), inestables los pares (f′ = 1).'},
    c:{f:x=>x-x*x*x,xr:[-2,2],T:6,sp:1,note:'Biestable: x = ±1 estables (f′ = −2), x = 0 inestable (f′ = 1). Es el tridente supercrítico con r = 1.'},
    l:{f:x=>x*(1-x/2),xr:[-0.6,3.2],T:9,sp:1,note:'Logística con r = 1 y K = 2: N = 0 inestable, N = K estable. Para N₀ < K/2 la curva es sigmoidea.'},
    e:{f:x=>x-Math.cos(x),xr:[-3,3],T:4,sp:0.8,note:'Un único punto fijo, x* ≈ 0,739 (solución de x = cos x), inestable: f′ = 1 + sin x* ≈ 1,67.'},
    h:{f:x=>x*x,xr:[-2,2],T:3,sp:0.4,note:'f′(0) = 0: la linealización no decide. Es semiestable: atrae desde la izquierda y repele hacia la derecha. x = x₀/(1 − x₀t) explota en t = 1/x₀ si x₀ > 0.'}};
  let extra=[],A1=null,B1=null,A2=null,xb=null,play=false;
  const cur=()=>F[sf.value];
  sf.addEventListener('change',()=>{extra=[];xb=null;play=false;pb.textContent='▶ Soltar';draw();});
  $('#dn1-clr',sec).addEventListener('click',()=>{extra=[];draw1();});
  clickPos(cv,(px,py)=>{if(A1&&inA(A1,px,py)){extra.push(invA(A1,px,py)[0]);draw1();}else if(B1&&inA(B1,px,py)){extra.push(invA(B1,px,py)[1]);draw1();}});
  const traj=(f,x0,T)=>orbit((t,u)=>[f(u[0])],0,[x0],T,500,1e3);
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.5,400,260),S=cur(),f=S.f,hw=Math.floor(w*0.48);
    let ym=0;for(let i=0;i<=200;i++){const v=Math.abs(f(S.xr[0]+(S.xr[1]-S.xr[0])*i/200));if(isFinite(v))ym=Math.max(ym,v);}ym=Math.min(ym*1.1,60)||1;
    A1=axes(ctx,{l:36,t:10,w:hw-46,h:h-34,xr:S.xr,yr:[-ym,ym],xl:'x',yl:'ẋ = f(x)'});
    curve(ctx,A1,f,S.xr[0],S.xr[1],K.t,2.6);
    const R=pA_phaseLine(ctx,A1,f,S.xr,K.b);
    R.forEach(r=>{const d=pA_d(f,r);dot(ctx,A1.X(r),A1.Y(0),6.5,Math.abs(d)<1e-6?K.f:d<0?K.ink:'#fff',Math.abs(d)<1e-6?K.ink:d<0?null:K.ink);});
    B1=axes(ctx,{l:hw+34,t:10,w:w-hw-44,h:h-34,xr:[0,S.T],yr:S.xr,xl:'t',yl:'x'});
    R.forEach(r=>{ctx.save();ctx.strokeStyle=K.mut;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(B1.X(0),B1.Y(r));ctx.lineTo(B1.X(S.T),B1.Y(r));ctx.stroke();ctx.restore();});
    const n=9;for(let i=0;i<n;i++){const x0=S.xr[0]+(S.xr[1]-S.xr[0])*(i+0.5)/n;path(ctx,B1,traj(f,x0,S.T).map(p=>[p[0],p[1]]),'rgba(15,118,110,.45)',1.6);}
    extra.forEach((x0,i)=>{const col=PAL[(i+1)%PAL.length];path(ctx,B1,traj(f,x0,S.T).map(p=>[p[0],p[1]]),col,2.6);dot(ctx,B1.X(0),B1.Y(x0),4.5,col);dot(ctx,A1.X(x0),A1.Y(f(x0)),4.5,col);});
    let s=row('sistema',sf.options[sf.selectedIndex].text.split('  ')[0])+sep;
    R.slice(0,6).forEach(r=>{const d=pA_d(f,r);s+=`<div><span class="k">x* = ${nt(r,3)}</span>: f′ = ${nt(d,3)} · <b>${pA_stab(d)}</b>${Math.abs(d)>1e-6?' · τ = '+nt(1/Math.abs(d),3):''}</div>`;});
    if(extra.length){const x0=extra[extra.length-1];s+=sep+row('último x₀',nt(x0,3))+row('f(x₀)',nt(f(x0),3));}
    rd.innerHTML=s+sep+rowT(S.note);
  }
  /* ---- potencial ---- */
  let Vg=null;
  function buildV(){const S=cur(),N=500,xs=[],vs=[0];for(let i=0;i<=N;i++)xs.push(S.xr[0]+(S.xr[1]-S.xr[0])*i/N);
    for(let i=1;i<=N;i++)vs.push(vs[i-1]-(S.f(xs[i-1])+S.f(xs[i]))/2*(xs[i]-xs[i-1]));Vg={xs,vs,key:sf.value};}
  const Vat=x=>{const S=cur(),N=Vg.xs.length-1,u=clamp((x-S.xr[0])/(S.xr[1]-S.xr[0])*N,0,N),i=Math.min(N-1,Math.floor(u)),t=u-i;return Vg.vs[i]*(1-t)+Vg.vs[i+1]*t;};
  pb.addEventListener('click',()=>{if(xb===null)xb=cur().xr[0]+0.62*(cur().xr[1]-cur().xr[0]);play=!play;pb.textContent=play?'❚❚ Pausa':'▶ Soltar';});
  clickPos(cv2,(px,py)=>{if(A2&&px>=A2.o.l&&px<=A2.o.l+A2.o.w){xb=invA(A2,px,py)[0];play=false;pb.textContent='▶ Soltar';draw2();}});
  function draw2(){
    if(!vis(cv2))return;if(!Vg||Vg.key!==sf.value)buildV();const {ctx,w,h}=fit(cv2,.5,380,240),S=cur();
    let lo=Infinity,hi=-Infinity;Vg.vs.forEach(v=>{if(isFinite(v)){lo=Math.min(lo,v);hi=Math.max(hi,v);}});const pad=(hi-lo)*0.12||1;
    A2=axes(ctx,{l:44,t:10,w:w-54,h:h-34,xr:S.xr,yr:[lo-pad,hi+pad],xl:'x',yl:'V(x)'});
    ctx.save();ctx.fillStyle='rgba(15,118,110,.08)';ctx.beginPath();ctx.moveTo(A2.X(S.xr[0]),A2.Y(lo-pad));Vg.xs.forEach((x,i)=>ctx.lineTo(A2.X(x),A2.Y(Vg.vs[i])));ctx.lineTo(A2.X(S.xr[1]),A2.Y(lo-pad));ctx.closePath();ctx.fill();ctx.restore();
    path(ctx,A2,Vg.xs.map((x,i)=>[x,Vg.vs[i]]),K.t,2.6);
    const R=pA_roots(S.f,S.xr[0],S.xr[1]);R.forEach(r=>{const d=pA_d(S.f,r);dot(ctx,A2.X(r),A2.Y(Vat(r)),5,d<0?K.ink:'#fff',d<0?null:K.ink);});
    let s=row('V(x)','−∫ f(x) dx');
    if(xb!==null){dot(ctx,A2.X(xb),A2.Y(Vat(xb))-9,9,K.b,'#fff');s+=row('x',nt(xb,3))+row('V(x)',nt(Vat(xb),3))+row('ẋ = −V′(x)',nt(S.f(xb),3))+row('dV/dt = −(V′)²',nt(-(S.f(xb)**2),3));}
    rd2.innerHTML=s+sep+rowT('Mínimos de V ⇔ f′(x*) < 0 (estables). Máximos ⇔ f′(x*) > 0 (inestables). La bolita no tiene inercia: no sobrepasa los mínimos ni oscila.');
  }
  function draw(){draw1();draw2();}
  return {draw,tick(dt){if(play&&xb!==null&&vis(cv2)&&$('.tabpane[data-pane="pot"]',sec).classList.contains('on')){const S=cur();
    for(let k=0;k<10;k++)xb=rk4((t,u)=>[S.f(u[0])],0,[xb],dt*S.sp/10)[0];
    if(!isFinite(xb)||xb<S.xr[0]||xb>S.xr[1]){xb=clamp(isFinite(xb)?xb:S.xr[1],S.xr[0],S.xr[1]);play=false;pb.textContent='▶ Soltar';}draw2();}}};
};

/* ================= 2 · BIFURCACIONES EN 1D ================= */
V.push(String.raw`<section class="view theme-aa" data-view="dn-bifurcaciones-1d">
<div class="eyebrow">Dinámica no lineal y caos · Unidad I · Flujos en una dimensión</div><h1>Bifurcaciones silla-nodo, transcrítica y tridente</h1><p class="lead">Si \(f\) depende de un parámetro, \(\dot x=f(x;r)\), los puntos fijos pueden nacer, morir o intercambiar estabilidad cuando \(r\) cruza un valor crítico. Cerca de ese valor, todo sistema se parece a una de pocas <i>formas normales</i>.</p>
<div class="toc"><a href="#dn2-res" data-scroll>Resumen</a><a href="#dn2-lab" data-scroll>Visualiza</a><a href="#dn2-leyes" data-scroll>Leyes y fórmulas</a><a href="#dn2-ej" data-scroll>Ejemplo</a></div>
<div class="block" id="dn2-res"><h2><span class="ico">≡</span>Resumen</h2><ul class="keypoints"><li><b>Bifurcación.</b> Cambio cualitativo del retrato de fase al variar \(r\). En 1D sólo puede ocurrir donde un punto fijo deja de ser hiperbólico: \(f(x^*;r_c)=0\) y \(\partial_xf(x^*;r_c)=0\). El <i>diagrama de bifurcación</i> grafica \(x^*\) frente a \(r\), con trazo continuo para las ramas estables y discontinuo para las inestables.</li><li><b>Silla-nodo.</b> Forma normal \(\dot x=r+x^2\). Para \(r\lt0\) hay dos puntos fijos \(x^*=\pm\sqrt{-r}\) (el negativo estable); chocan en \(r=0\) y desaparecen. Es el mecanismo genérico de creación y destrucción de equilibrios. Justo después queda un <i>cuello de botella</i> con tiempo de paso \(T\approx\pi/\sqrt r\).</li><li><b>Transcrítica.</b> \(\dot x=rx-x^2\). El punto fijo \(x=0\) existe para todo \(r\) y en \(r=0\) intercambia estabilidad con \(x^*=r\). Aparece cuando la física impone un equilibrio trivial que no puede desaparecer (población nula, láser apagado).</li><li><b>Tridente supercrítico.</b> \(\dot x=rx-x^3\), típico de problemas con simetría \(x\to-x\). Para \(r>0\) el origen se desestabiliza y nacen dos ramas estables \(x^*=\pm\sqrt r\): ruptura espontánea de simetría, con amplitud \(\propto(r-r_c)^{1/2}\).</li><li><b>Tridente subcrítico.</b> \(\dot x=rx+x^3-x^5\). Las ramas que salen de \(r=0\) son inestables; el término \(-x^5\) las estabiliza a amplitud finita. Hay biestabilidad para \(-\tfrac14\lt r\lt0\), saltos bruscos e <b>histéresis</b>.</li><li><b>Bifurcación imperfecta.</b> Una pequeña asimetría \(h\) en \(\dot x=h+rx-x^3\) rompe el tridente. En el plano \((r,h)\), la región con tres puntos fijos está limitada por dos curvas silla-nodo que se juntan en una <i>cúspide</i>: \(h=\pm\dfrac{2r}{3}\sqrt{\dfrac r3}\).</li><li><b>Láser y buckling.</b> Láser: \(\dot n=(GN_0-k)n-\alpha Gn^2\), transcrítica en el umbral \(N_0=k/G\). Cuenta en un aro que gira: tridente cuando \(r\omega^2/g\) cruza 1. Las mismas formas normales en sistemas muy distintos: eso es la universalidad local de las bifurcaciones.</li></ul></div>
<div class="block" id="dn2-lab"><h2><span class="ico">◎</span>Visualiza</h2>`+tabs([
['nf','Formas normales',lab2('dn2-cv','<select id="dn2-f" class="aa-sel"><option value="sn">silla-nodo: ẋ = r + x²</option><option value="tc">transcrítica: ẋ = rx − x²</option><option value="ps">tridente supercrítico: ẋ = rx − x³</option><option value="pu">tridente subcrítico: ẋ = rx + x³ − x⁵</option></select>'+slider('dn2-r','r',-1,1,0.01,-0.3),'dn2-read','Izquierda: \\(f(x;r)\\) con la línea de fase. Derecha: diagrama de bifurcación (● rama estable, ○ inestable); la línea vertical marca el \\(r\\) actual. Mueve \\(r\\) a través de 0 y mira cómo se reorganizan los puntos fijos.')],
['imp','Bifurcación imperfecta y cúspide',lab2('dn2-cv2','<button class="btn ghost" id="dn2-rst">Reiniciar</button>','dn2-read2','Izquierda: plano de control \\((r,h)\\); arrastra el punto. Dentro de la cúspide hay tres puntos fijos. Derecha: curva \\(h=x^3-rx\\) de equilibrios para el \\(r\\) elegido; si \\(r>0\\) tiene forma de S y, al barrer \\(h\\), el estado salta entre ramas (histéresis).')]])+String.raw`</div>
<div class="block" id="dn2-leyes"><h2><span class="ico">§</span>Leyes y fórmulas</h2><div class="laws"><div class="law"><h3>Condición de bifurcación local</h3><div class="eq">\[ f(x^*;r_c)=0,\qquad \frac{\partial f}{\partial x}(x^*;r_c)=0 \]</div><p>Si además \(\partial_rf\ne0\) y \(\partial_x^2f\ne0\), es silla-nodo (teorema de la forma normal).</p></div><div class="law"><h3>Forma normal silla-nodo</h3><div class="eq">\[ \dot x\approx\partial_rf\,(r-r_c)+\tfrac12\,\partial_x^2f\,(x-x^*)^2 \]</div><p>Taylor alrededor de \((x^*,r_c)\); reescalando se obtiene \(\dot X=\mu+X^2\).</p></div><div class="law"><h3>Cuello de botella</h3><div class="eq">\[ T=\int_{-\infty}^{\infty}\frac{dx}{r+x^2}=\frac{\pi}{\sqrt r} \]</div><p>Ley de escala \(T\propto(r-r_c)^{-1/2}\) universal cerca de cualquier silla-nodo.</p></div><div class="law"><h3>Formas normales con equilibrio trivial</h3><div class="eq">\[ \dot x=rx-x^2,\qquad \dot x=rx\mp x^3 \]</div><p>Transcrítica (sin simetría) y tridente super/subcrítico (simetría \(x\to-x\)).</p></div><div class="law"><h3>Tridente subcrítico</h3><div class="eq">\[ \dot x=rx+x^3-x^5,\qquad x^{*2}=\frac{1\pm\sqrt{1+4r}}{2} \]</div><p>Silla-nodo de las ramas grandes en \(r_s=-\tfrac14\): intervalo de biestabilidad \(r_s\lt r\lt0\).</p></div><div class="law"><h3>Cúspide</h3><div class="eq">\[ h+rx-x^3=0,\ \ r-3x^2=0\ \Rightarrow\ h_c(r)=\pm\frac{2r}{3}\sqrt{\frac r3} \]</div><p>Catástrofe en cúspide: dos curvas silla-nodo que se unen tangencialmente en \((0,0)\).</p></div></div></div>
<div class="block" id="dn2-ej"><h2><span class="ico">✎</span>Ejemplo resuelto</h2><div class="example"><p><b>Estudia \(\dot x=rx-\ln(1+x)\) para \(x>-1\) cerca de \(x=0\). Encuentra la bifurcación, su tipo y la forma normal, y compara con el valor numérico del punto fijo no trivial para \(r=0{,}9\).</b></p><ol><li>\(x^*=0\) es punto fijo para todo \(r\). Con \(f'(x)=r-\dfrac{1}{1+x}\): \(f'(0)=r-1\). El origen es estable si \(r\lt1\) e inestable si \(r>1\): bifurcación en \(r_c=1\).</li><li>Taylor: \(\ln(1+x)=x-\tfrac{x^2}{2}+\tfrac{x^3}{3}-\dots\Rightarrow\dot x=(r-1)x+\tfrac12x^2+O(x^3)\).</li><li>Es una transcrítica: equilibrio trivial que no desaparece y un término cuadrático. El otro punto fijo es \(x^*\approx2(1-r)\), que pasa por 0 en \(r=1\).</li><li>Forma normal: con \(x=-2X\) y \(\mu=r-1\), \(-2\dot X=-2\mu X+2X^2\Rightarrow\dot X=\mu X-X^2\).</li><li>Para \(r=0{,}9\): la aproximación da \(x^*\approx0{,}20\). Resolviendo \(0{,}9x=\ln(1+x)\) con bisección, \(x^*=0{,}2302\). La diferencia viene del término \(x^3/3\): \(0{,}1=\tfrac x2-\tfrac{x^2}{3}+\dots\) corrige hacia arriba.</li><li>Estabilidad: \(f'(0{,}2302)=0{,}9-1/1{,}2302=+0{,}087>0\), inestable; y \(f'(0)=-0{,}1\), estable. Para \(r=1{,}1\): \(x^*=-0{,}1761\) con \(f'=-0{,}114\) (estable) y el origen pasa a inestable. Las ramas intercambiaron estabilidad.</li></ol><p style="margin:.6em 0 0">Un cálculo de dos líneas (Taylor a segundo orden) basta para clasificar la bifurcación; los detalles finos sólo cambian las ramas de manera cuantitativa.</p></div></div>
<div class="pager"><a href="#dn-flujos-1d"><small>← Anterior</small>Flujos en la recta: puntos fijos, estabilidad lineal y potencial</a><a class="next" href="#dn-circulo"><small>Siguiente →</small>Flujos en el círculo: osciladores no uniformes y sincronización</a></div>
<p class="note">Contenido de referencia: Strogatz, <i>Nonlinear Dynamics and Chaos</i>, 3.ª ed., §3.1–3.6. Redacción y simulaciones propias.</p></section>`);

LABS['dn-bifurcaciones-1d']=function(sec){
  const cv=$('#dn2-cv',sec),rd=$('#dn2-read',sec),sf=$('#dn2-f',sec),gr=sl(sec,'dn2-r',v=>nf(v,2),()=>draw1());
  const FN={sn:(x,r)=>r+x*x,tc:(x,r)=>r*x-x*x,ps:(x,r)=>r*x-x*x*x,pu:(x,r)=>r*x+x*x*x-Math.pow(x,5)};
  const XR={sn:[-1.6,1.6],tc:[-1.3,1.3],ps:[-1.3,1.3],pu:[-1.5,1.5]};
  const NOTE={sn:'Dos puntos fijos ±√(−r) para r < 0; se funden en r = 0 y desaparecen. Para r > 0 queda un cuello de botella cerca de x = 0.',
    tc:'x = 0 y x = r intercambian estabilidad en r = 0. Ninguno desaparece.',
    ps:'Para r > 0 el origen se vuelve inestable y nacen ±√r estables (simetría rota). Amplitud ∝ r^(1/2).',
    pu:'Ramas grandes estables para r > −1/4: biestabilidad entre −1/4 y 0. Al cruzar r = 0 el sistema salta a amplitud finita (histéresis).'};
  let diag=null;
  function build(){const k=sf.value,f=FN[k],xr=XR[k],pts=[];
    for(let i=0;i<=260;i++){const r=-1+2*i/260;let R=zeros(x=>f(x,r),xr[0]-0.0137,xr[1]+0.0071,700);if(k!=='sn'&&!R.some(q=>Math.abs(q)<1e-6))R.push(0);
      R.forEach(x=>{const d=(f(x+1e-5,r)-f(x-1e-5,r))/2e-5;pts.push([r,x,d<0]);});}
    diag={k,pts};}
  sf.addEventListener('change',()=>{diag=null;draw1();});
  function draw1(){
    if(!vis(cv))return;if(!diag||diag.k!==sf.value)build();const {ctx,w,h}=fit(cv,.5,400,260),k=sf.value,f=x=>FN[k](x,gr()),xr=XR[k],r=gr(),hw=Math.floor(w*0.46);
    const A=axes(ctx,{l:36,t:10,w:hw-46,h:h-34,xr,yr:[-1.2,1.2],xl:'x',yl:'f(x; r)'});
    curve(ctx,A,f,xr[0],xr[1],K.t,2.6);
    let R=zeros(f,xr[0]-0.0137,xr[1]+0.0071,900);if(k!=='sn'&&!R.some(q=>Math.abs(q)<1e-6))R.push(0);R.sort((a,b)=>a-b);
    {const pts=[xr[0],...R,xr[1]];for(let i=0;i<pts.length-1;i++){const m=(pts[i]+pts[i+1])/2,s=Math.sign(f(m)),L=Math.min(24,(A.X(pts[i+1])-A.X(pts[i])-14)/2);if(s&&L>5)arrow(ctx,A.X(m)-s*L,A.Y(0),A.X(m)+s*L,A.Y(0),K.b,2.5);}}
    R.forEach(x=>{const d=pA_d(f,x);dot(ctx,A.X(x),A.Y(0),6.5,Math.abs(d)<1e-4?K.f:d<0?K.ink:'#fff',d<0&&Math.abs(d)>=1e-4?null:K.ink);});
    const B=axes(ctx,{l:hw+34,t:10,w:w-hw-44,h:h-34,xr:[-1,1],yr:xr,xl:'r',yl:'x*'});
    diag.pts.forEach(p=>{if(p[2])dot(ctx,B.X(p[0]),B.Y(p[1]),1.9,K.t);else dot(ctx,B.X(p[0]),B.Y(p[1]),1.3,K.w);});
    ctx.save();ctx.strokeStyle=K.b;ctx.lineWidth=1.5;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(B.X(r),B.o.t);ctx.lineTo(B.X(r),B.o.t+B.o.h);ctx.stroke();ctx.restore();
    R.forEach(x=>{const d=pA_d(f,x);dot(ctx,B.X(r),B.Y(x),6,d<0?K.ink:'#fff',d<0?null:K.ink);});
    label(ctx,'● estable',B.o.l+B.o.w-6,B.o.t+B.o.h-30,K.t,'right');label(ctx,'● inestable',B.o.l+B.o.w-6,B.o.t+B.o.h-14,K.w,'right');
    let s=row('r',nf(r,2))+row('n.º de puntos fijos',R.length)+sep;R.forEach(x=>{const d=pA_d(f,x);s+=`<div><span class="k">x* = ${nt(x,3)}</span>: f′ = ${nt(d,3)} · <b>${pA_stab(d)}</b></div>`;});
    if(k==='sn'&&r>0)s+=row('cuello de botella T ≈ π/√r',nt(Math.PI/Math.sqrt(r),2));
    rd.innerHTML=s+sep+rowT(NOTE[k]);
  }
  /* ---- imperfecta ---- */
  const cv2=$('#dn2-cv2',sec),rd2=$('#dn2-read2',sec);const P=[0.9,0.12];let PA=null;
  $('#dn2-rst',sec).addEventListener('click',()=>{P[0]=0.9;P[1]=0.12;draw2();});
  drag(cv2,(x,y)=>PA&&Math.hypot(PA.X(P[0])-x,PA.Y(P[1])-y)<20?0:null,(i,x,y)=>{const q=invA(PA,x,y);P[0]=clamp(q[0],-1,2);P[1]=clamp(q[1],-1.2,1.2);draw2();});
  const hc=r=>r>0?2*r/3*Math.sqrt(r/3):0;
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.5,400,260),hw=Math.floor(w*0.46),[r,hh]=P;
    PA=axes(ctx,{l:36,t:10,w:hw-46,h:h-34,xr:[-1,2],yr:[-1.2,1.2],xl:'r',yl:'h'});
    ctx.save();ctx.fillStyle='rgba(15,118,110,.12)';ctx.beginPath();ctx.moveTo(PA.X(0),PA.Y(0));for(let i=0;i<=80;i++){const x=2*i/80;ctx.lineTo(PA.X(x),PA.Y(hc(x)));}for(let i=80;i>=0;i--){const x=2*i/80;ctx.lineTo(PA.X(x),PA.Y(-hc(x)));}ctx.closePath();ctx.fill();ctx.restore();
    curve(ctx,PA,hc,0,2,K.t,2.2);curve(ctx,PA,x=>-hc(x),0,2,K.t,2.2);label(ctx,'3 puntos fijos',PA.X(1.35),PA.Y(0),K.t,'center');label(ctx,'1 punto fijo',PA.X(-0.5),PA.Y(0.8),K.mut,'center');
    dot(ctx,PA.X(r),PA.Y(hh),8,'#fff',K.b);
    const B=axes(ctx,{l:hw+34,t:10,w:w-hw-44,h:h-34,xr:[-1.2,1.2],yr:[-1.6,1.6],xl:'h',yl:'x*'});
    /* curva h = x³ − r x parametrizada por x; estable donde r − 3x² < 0 */
    let seg=[],stab=null;const flush=()=>{if(seg.length>1)path(ctx,B,seg,stab?K.t:K.w,stab?2.8:2,stab?null:[6,4]);};
    for(let i=0;i<=400;i++){const x=-1.6+3.2*i/400,H=x*x*x-r*x,s=r-3*x*x<0;if(s!==stab){flush();seg=seg.length?[seg[seg.length-1]]:[];stab=s;}seg.push([H,x]);}flush();
    ctx.save();ctx.strokeStyle=K.b;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(B.X(hh),B.o.t);ctx.lineTo(B.X(hh),B.o.t+B.o.h);ctx.stroke();ctx.restore();
    const R=zeros(x=>hh+r*x-x*x*x,-2.013,2.007,900);R.forEach(x=>{const d=r-3*x*x;dot(ctx,B.X(hh),B.Y(x),6,d<0?K.ink:'#fff',d<0?null:K.ink);});
    let s=row('(r, h)',`(${nt(r,2)}, ${nt(hh,2)})`)+row('h_c(r) = ±(2r/3)√(r/3)',r>0?'±'+nt(hc(r),3):'—')+row('n.º de puntos fijos',R.length)+sep;
    R.forEach(x=>{const d=r-3*x*x;s+=`<div><span class="k">x* = ${nt(x,3)}</span>: <b>${pA_stab(d)}</b></div>`;});
    rd2.innerHTML=s+sep+rowT(r>0?'Con r > 0, al barrer h de un extremo a otro el sistema sigue la rama estable hasta su silla-nodo (|h| = h_c) y salta a la otra: ciclo de histéresis.':'Con r ≤ 0 hay un único punto fijo y x* depende suavemente de h: no hay saltos.');
  }
  return {draw(){draw1();draw2();}};
};

/* ================= 3 · FLUJOS EN EL CÍRCULO ================= */
V.push(String.raw`<section class="view theme-aa" data-view="dn-circulo">
<div class="eyebrow">Dinámica no lineal y caos · Unidad I · Flujos en una dimensión</div><h1>Flujos en el círculo: osciladores no uniformes y sincronización</h1><p class="lead">Si la variable es un ángulo, \(\dot\theta=f(\theta)\) con \(f\) de período \(2\pi\), la partícula puede dar vueltas sin fin: aparece la oscilación más simple posible. Un oscilador que gira de forma no uniforme, al acercarse a una bifurcación silla-nodo, pasa casi todo su tiempo en un cuello de botella.</p>
<div class="toc"><a href="#dn3-res" data-scroll>Resumen</a><a href="#dn3-lab" data-scroll>Visualiza</a><a href="#dn3-leyes" data-scroll>Leyes y fórmulas</a><a href="#dn3-ej" data-scroll>Ejemplo</a></div>
<div class="block" id="dn3-res"><h2><span class="ico">≡</span>Resumen</h2><ul class="keypoints"><li><b>Flujo en el círculo.</b> \(\dot\theta=f(\theta)\) con \(f(\theta+2\pi)=f(\theta)\). A diferencia de la recta, sin puntos fijos el flujo da vueltas para siempre: hay soluciones periódicas, con período \(T=\oint d\theta/f(\theta)\).</li><li><b>Oscilador uniforme.</b> \(\dot\theta=\omega\Rightarrow\theta=\omega t+\theta_0\), \(T=2\pi/\omega\). Dos osciladores uniformes \(\omega_1>\omega_2\) se reencuentran cada \(T_{\text{lap}}=2\pi/(\omega_1-\omega_2)\) (pulsaciones).</li><li><b>Oscilador no uniforme.</b> \(\dot\theta=\omega-a\sin\theta\), con \(\omega,a\ge0\). Si \(a\lt\omega\) gira con velocidad variable: lento cerca de \(\theta=\pi/2\), rápido en \(-\pi/2\). Si \(a=\omega\) hay una silla-nodo en \(\theta=\pi/2\); si \(a>\omega\) aparecen dos puntos fijos con \(\sin\theta^*=\omega/a\), uno estable y otro inestable.</li><li><b>Período y cuello de botella.</b> \(T=\displaystyle\int_0^{2\pi}\frac{d\theta}{\omega-a\sin\theta}=\frac{2\pi}{\sqrt{\omega^2-a^2}}\). Cerca de la bifurcación \(T\approx\dfrac{\pi\sqrt2}{\sqrt\omega}\,(\omega-a)^{-1/2}\): diverge con exponente \(-\tfrac12\), igual que cualquier silla-nodo.</li><li><b>Péndulo sobreamortiguado y unión Josephson.</b> \(b\dot\theta+mgL\sin\theta=\Gamma\) da \(\dot\theta=\omega-a\sin\theta\) con \(\omega=\Gamma/b\), \(a=mgL/b\): si el torque supera \(mgL\) el péndulo gira. La unión Josephson (\(\tfrac{\hbar}{2eR}\dot\phi+I_c\sin\phi=I\)) obedece la misma ecuación: \(\langle V\rangle=0\) para \(I\lt I_c\) y \(\langle V\rangle=IR\sqrt{1-(I_c/I)^2}\) para \(I>I_c\).</li><li><b>Sincronización (luciérnagas).</b> Una luciérnaga con frecuencia natural \(\omega\) ajusta su fase hacia un estímulo de frecuencia \(\Omega\): \(\dot\theta=\omega+A\sin(\Theta-\theta)\). La diferencia de fase \(\phi=\Theta-\theta\) cumple \(\dot\phi=\Omega-\omega-A\sin\phi\): ¡el mismo oscilador no uniforme!</li><li><b>Rango de arrastre.</b> Hay sincronización (punto fijo estable de \(\phi\)) si \(|\Omega-\omega|\le A\), con desfase \(\sin\phi^*=(\Omega-\omega)/A\). Fuera del rango, la fase se desliza con período \(T_{\text{drift}}=2\pi/\sqrt{(\Omega-\omega)^2-A^2}\).</li></ul></div>
<div class="block" id="dn3-lab"><h2><span class="ico">◎</span>Visualiza</h2>`+tabs([
['osc','Oscilador no uniforme',lab2('dn3-cv',slider('dn3-a','a/ω',0,1.5,0.01,0.8)+'<button class="btn" id="dn3-play">❚❚ Pausa</button>','dn3-read','Izquierda: la partícula sobre el círculo, con \\(\\omega=1\\) (● punto fijo estable, ○ inestable). Derecha: \\(\\dot\\theta=\\omega-a\\sin\\theta\\) y la serie temporal \\(\\sin\\theta(t)\\). Lleva \\(a/\\omega\\) hacia 1: los pulsos se espacian (cuello de botella) y en \\(a=\\omega\\) el movimiento se congela.')],
['sinc','Sincronización',lab2('dn3-cv2',slider('dn3-W','Ω (estímulo)',0.2,2.2,0.01,1.3)+slider('dn3-A','A (acoplamiento)',0,1,0.01,0.4)+'<button class="btn ghost" id="dn3-rst">Reiniciar fases</button>','dn3-read2','Luciérnaga con \\(\\omega=1\\) (naranja) frente a un estímulo de frecuencia \\(\\Omega\\) (azul). Destellan al pasar por \\(\\theta=0\\). Abajo, la diferencia de fase \\(\\phi=\\Theta-\\theta\\): se estabiliza si \\(|\\Omega-\\omega|\\le A\\) y se desliza si no.')]])+String.raw`</div>
<div class="block" id="dn3-leyes"><h2><span class="ico">§</span>Leyes y fórmulas</h2><div class="laws"><div class="law"><h3>Oscilador no uniforme</h3><div class="eq">\[ \dot\theta=\omega-a\sin\theta,\qquad T=\frac{2\pi}{\sqrt{\omega^2-a^2}}\ \ (a\lt\omega) \]</div><p>Se obtiene con \(u=\tan(\theta/2)\) o por residuos sobre \(|z|=1\).</p></div><div class="law"><h3>Puntos fijos para a &gt; ω</h3><div class="eq">\[ \sin\theta^*=\frac{\omega}{a},\qquad f'(\theta^*)=-a\cos\theta^* \]</div><p>Estable el de \(\cos\theta^*>0\) y inestable el de \(\cos\theta^*\lt0\).</p></div><div class="law"><h3>Ley de escala del cuello de botella</h3><div class="eq">\[ T\approx\frac{\pi\sqrt2}{\sqrt\omega}\,\frac{1}{\sqrt{\omega-a}}\quad(a\to\omega^-) \]</div><p>El tiempo se gasta casi todo en atravesar la "sombra" del punto fijo que va a nacer.</p></div><div class="law"><h3>Ecuación de la fase relativa</h3><div class="eq">\[ \dot\phi=\Omega-\omega-A\sin\phi,\qquad \phi=\Theta-\theta \]</div><p>Modelo de Ermentrout-Rinzel para el arrastre de luciérnagas por un estímulo periódico.</p></div><div class="law"><h3>Rango de arrastre</h3><div class="eq">\[ \omega-A\le\Omega\le\omega+A,\qquad \sin\phi^*=\frac{\Omega-\omega}{A} \]</div><p>Fuera de él: \(T_{\text{drift}}=2\pi/\sqrt{(\Omega-\omega)^2-A^2}\).</p></div><div class="law"><h3>Unión Josephson (RSJ sobreamortiguada)</h3><div class="eq">\[ \frac{\hbar}{2eR}\dot\phi+I_c\sin\phi=I,\qquad \langle V\rangle=\frac{\hbar}{2e}\langle\dot\phi\rangle \]</div><p>Característica \(\langle V\rangle=R\sqrt{I^2-I_c^2}\) para \(I>I_c\).</p></div></div></div>
<div class="block" id="dn3-ej"><h2><span class="ico">✎</span>Ejemplo resuelto</h2><div class="example"><p><b>Un péndulo muy amortiguado con \(\omega=1\ \mathrm{s^{-1}}\) cumple \(\dot\theta=\omega-a\sin\theta\). Calcula el período para \(a=0{,}8\) y \(a=0{,}99\), compara con la ley de escala y halla el porcentaje del período que pasa en \(\theta\in[0,\pi]\) para \(a=0{,}99\).</b></p><ol><li>Fórmula exacta: \(T=2\pi/\sqrt{\omega^2-a^2}\). Para \(a=0{,}8\): \(\sqrt{1-0{,}64}=0{,}6\Rightarrow T=10{,}47\ \mathrm s\) (frente a \(2\pi=6{,}28\ \mathrm s\) sin la parte no uniforme).</li><li>Para \(a=0{,}99\): \(\sqrt{1-0{,}9801}=\sqrt{0{,}0199}=0{,}1411\Rightarrow T=44{,}54\ \mathrm s\).</li><li>Ley de escala: \(T\approx\dfrac{\pi\sqrt2}{\sqrt{\omega-a}}=\dfrac{4{,}443}{\sqrt{0{,}01}}=44{,}43\ \mathrm s\). Error relativo \(0{,}25\,\%\): la aproximación ya es excelente.</li><li>Tiempo en la mitad superior: con \(u=\tan(\theta/2)\), \(d\theta=\dfrac{2\,du}{1+u^2}\) y \(\sin\theta=\dfrac{2u}{1+u^2}\), así que \(t=\displaystyle\int\frac{2\,du}{\omega(1+u^2)-2au}\). Para \(\theta\in[0,\pi]\), \(u\in[0,\infty)\).</li><li>Completando el cuadrado (\(\omega=1\)): \(\displaystyle\int_0^\infty\frac{2\,du}{(u-a)^2+(1-a^2)}=\frac{2}{\sqrt{1-a^2}}\Big[\frac\pi2+\arctan\frac{a}{\sqrt{1-a^2}}\Big]\). Con \(a=0{,}99\): \(\arctan(7{,}018)=1{,}429\), luego \(t_{\text{arriba}}=\dfrac{2}{0{,}1411}(1{,}571+1{,}429)=42{,}52\ \mathrm s\).</li><li>Fracción: \(42{,}52/44{,}54=95{,}5\,\%\). Casi todo el período transcurre cerca de \(\theta=\pi/2\), donde \(\dot\theta=\omega-a=0{,}01\).</li></ol><p style="margin:.6em 0 0">Observable: la señal \(\sin\theta(t)\) es una sucesión de pulsos rápidos separados por largas mesetas, típico de la proximidad a una silla-nodo en el círculo (neuronas tipo I, unión Josephson cerca de \(I_c\)).</p></div></div>
<div class="pager"><a href="#dn-bifurcaciones-1d"><small>← Anterior</small>Bifurcaciones silla-nodo, transcrítica y tridente</a><a class="next" href="#dn-lineales-2d"><small>Siguiente →</small>Sistemas lineales en el plano y clasificación por traza y determinante</a></div>
<p class="note">Contenido de referencia: Strogatz, <i>Nonlinear Dynamics and Chaos</i>, 3.ª ed., §4.1–4.6. Redacción y simulaciones propias.</p></section>`);

LABS['dn-circulo']=function(sec){
  const cv=$('#dn3-cv',sec),rd=$('#dn3-read',sec),ga=sl(sec,'dn3-a',v=>nf(v,2),()=>{hist=[];draw1();}),pb=$('#dn3-play',sec);
  let th=-Math.PI/2,t=0,hist=[],play=true;
  pb.addEventListener('click',()=>{play=!play;pb.textContent=play?'❚❚ Pausa':'▶ Reanudar';});
  const fth=(x,a)=>1-a*Math.sin(x);
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.5,400,260),a=ga(),cw=Math.min(Math.floor(w*0.38),h),R=cw*0.36,cx=cw/2+4,cy=h/2;
    ctx.save();ctx.strokeStyle=K.ax;ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,R,0,TAU);ctx.stroke();
    /* velocidad local: grosor/color del anillo */
    for(let i=0;i<120;i++){const x=i/120*TAU,v=fth(x,a);ctx.strokeStyle=v>0?`rgba(15,118,110,${clamp(v/2.5,0.08,1)})`:`rgba(201,42,42,${clamp(-v/1.5,0.15,1)})`;ctx.lineWidth=7;ctx.beginPath();ctx.arc(cx,cy,R,-x,-x-TAU/120,true);ctx.stroke();}
    ctx.restore();
    if(a>=1){const t1=Math.asin(1/a),t2=Math.PI-t1;[[t1,true],[t2,false]].forEach(([x,s])=>dot(ctx,cx+R*Math.cos(x),cy-R*Math.sin(x),7,s?K.ink:'#fff',s?null:K.ink));}
    dot(ctx,cx+R*Math.cos(th),cy-R*Math.sin(th),9,K.b,'#fff');label(ctx,'θ = π/2',cx,cy-R-14,K.mut,'center');label(ctx,'0',cx+R+12,cy,K.mut,'left');
    const x0=cw+20,ww=w-x0,hh=(h-20)/2;
    const A=axes(ctx,{l:x0+34,t:6,w:ww-44,h:hh-26,xr:[-Math.PI,Math.PI],yr:[1-1.6,1+1.6],xl:'θ',yl:'θ̇',xf:v=>nt(v,1)});
    curve(ctx,A,x=>fth(x,a),-Math.PI,Math.PI,K.t,2.4);
    ctx.save();ctx.strokeStyle=K.b;ctx.setLineDash([4,4]);const tw=((th+Math.PI)%TAU+TAU)%TAU-Math.PI;ctx.beginPath();ctx.moveTo(A.X(tw),A.o.t);ctx.lineTo(A.X(tw),A.o.t+A.o.h);ctx.stroke();ctx.restore();
    const B=axes(ctx,{l:x0+34,t:hh+14,w:ww-44,h:hh-26,xr:[0,40],yr:[-1.2,1.2],xl:'t',yl:'sin θ'});
    path(ctx,B,hist.map(p=>[p[0]-Math.max(0,t-40),p[1]]),K.d,2);
    const T=a<1?TAU/Math.sqrt(1-a*a):Infinity;
    let s=row('ω','1')+row('a',nf(a,2))+row('período T = 2π/√(ω² − a²)',a<1?nt(T,2):'∞ (puntos fijos)');
    if(a<1)s+=row('aprox. cuello π√2/√(ω − a)',nt(Math.PI*Math.SQRT2/Math.sqrt(1-a),2));
    if(a>=1){const t1=Math.asin(1/a);s+=row('θ* estable',nt(t1,3)+' rad')+row('θ* inestable',nt(Math.PI-t1,3)+' rad');}
    rd.innerHTML=s+sep+rowT(a<1?(a>0.85?'Cerca de la bifurcación: el punto se arrastra por θ ≈ π/2 y luego da la vuelta rápido. La serie temporal es pulsátil.':'Rotación no uniforme: más lenta donde ω − a sin θ es pequeño (zona clara del anillo).'):'a ≥ ω: la partícula queda atrapada en el punto fijo estable; ya no hay rotación.');
  }
  /* ---- sincronización ---- */
  const cv2=$('#dn3-cv2',sec),rd2=$('#dn3-read2',sec),gW=sl(sec,'dn3-W',v=>nf(v,2),()=>draw2()),gA=sl(sec,'dn3-A',v=>nf(v,2),()=>draw2());
  let Th=0,tf=2.5,t2=0,ph=[],flashS=0,flashF=0;
  $('#dn3-rst',sec).addEventListener('click',()=>{Th=0;tf=2.5;t2=0;ph=[];draw2();});
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.5,400,260),W=gW(),Ac=gA(),hh=h*0.5,R=Math.min(hh*0.36,w*0.12);
    const c1=[w*0.25,hh/2+4],c2=[w*0.62,hh/2+4];
    [[c1,Th,K.a,'estímulo Ω',flashS],[c2,tf,K.b,'luciérnaga ω = 1',flashF]].forEach(([c,a,col,lab,fl])=>{
      ctx.save();ctx.strokeStyle=K.ax;ctx.lineWidth=2;ctx.beginPath();ctx.arc(c[0],c[1],R,0,TAU);ctx.stroke();ctx.restore();
      if(fl>0){ctx.save();ctx.fillStyle=`rgba(230,119,0,${0.5*fl})`;ctx.beginPath();ctx.arc(c[0],c[1],R*0.8,0,TAU);ctx.fill();ctx.restore();}
      dot(ctx,c[0]+R*Math.cos(a),c[1]-R*Math.sin(a),8,col,'#fff');label(ctx,lab,c[0],c[1]+R+14,col,'center');});
    const B=axes(ctx,{l:40,t:hh+6,w:w-50,h:h-hh-30,xr:[0,60],yr:[-Math.PI,Math.PI],xl:'t',yl:'φ = Θ − θ',});
    const lock=Math.abs(W-1)<=Ac;
    if(lock&&Ac>0){const ps=Math.asin((W-1)/Ac);ctx.save();ctx.strokeStyle=K.r;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(B.X(0),B.Y(ps));ctx.lineTo(B.X(60),B.Y(ps));ctx.stroke();ctx.restore();}
    const off=Math.max(0,t2-60);let seg=[];ph.forEach((p,i)=>{if(i&&Math.abs(p[1]-ph[i-1][1])>Math.PI){path(ctx,B,seg,K.d,2);seg=[];}seg.push([p[0]-off,p[1]]);});path(ctx,B,seg,K.d,2);
    let s=row('Ω − ω',nf(W-1,2))+row('A',nf(Ac,2))+row('|Ω − ω| ≤ A',lock?'<span class="aa-ok">sí: arrastre</span>':'<span class="aa-no">no: deslizamiento</span>');
    s+=lock&&Ac>0?row('φ* = arcsin((Ω − ω)/A)',nt(Math.asin((W-1)/Ac),3)+' rad'):row('T_drift',nt(TAU/Math.sqrt(Math.max(1e-9,(W-1)**2-Ac*Ac)),2));
    rd2.innerHTML=s+sep+rowT(lock?'La luciérnaga destella con la frecuencia del estímulo, adelantada o retrasada un ángulo fijo φ*.':'La diferencia de fase crece de forma no uniforme: largos tramos casi sincronizados y saltos de 2π (fase que se desliza).');
  }
  const wrap=x=>((x+Math.PI)%TAU+TAU)%TAU-Math.PI;
  return {draw(){draw1();draw2();},tick(dt){
    if(play&&vis(cv)&&$('.tabpane[data-pane="osc"]',sec).classList.contains('on')){const a=ga(),h=dt*2;for(let k=0;k<8;k++)th=rk4((s,u)=>[fth(u[0],a)],0,[th],h/8)[0];t+=h;hist.push([t,Math.sin(th)]);while(hist.length&&hist[0][0]<t-40)hist.shift();draw1();}
    if(vis(cv2)&&$('.tabpane[data-pane="sinc"]',sec).classList.contains('on')){const W=gW(),Ac=gA(),h=dt*2;
      for(let k=0;k<8;k++){const hs=h/8,Tn=Th+W*hs,fn=rk4((s,u)=>[1+Ac*Math.sin(Th+W*s-u[0])],0,[tf],hs)[0];
        if(Math.floor(Tn/TAU)>Math.floor(Th/TAU))flashS=1;if(Math.floor(fn/TAU)>Math.floor(tf/TAU))flashF=1;Th=Tn;tf=fn;}
      flashS=Math.max(0,flashS-dt*3);flashF=Math.max(0,flashF-dt*3);t2+=h;ph.push([t2,wrap(Th-tf)]);while(ph.length&&ph[0][0]<t2-60)ph.shift();draw2();}}};
};

/* ================= 4 · SISTEMAS LINEALES 2D ================= */
V.push(String.raw`<section class="view theme-aa" data-view="dn-lineales-2d">
<div class="eyebrow">Dinámica no lineal y caos · Unidad II · Sistemas lineales</div><h1>Sistemas lineales en el plano y clasificación por traza y determinante</h1><p class="lead">Antes de linealizar sistemas no lineales hay que conocer a fondo \(\dot{\mathbf x}=A\mathbf x\) con \(A\in\mathbb R^{2\times2}\). Dos números, la traza \(\tau\) y el determinante \(\Delta\), deciden toda la geometría del retrato de fase.</p>
<div class="toc"><a href="#dn4-res" data-scroll>Resumen</a><a href="#dn4-lab" data-scroll>Visualiza</a><a href="#dn4-leyes" data-scroll>Leyes y fórmulas</a><a href="#dn4-ej" data-scroll>Ejemplo</a></div>
<div class="block" id="dn4-res"><h2><span class="ico">≡</span>Resumen</h2><ul class="keypoints"><li><b>Sistema lineal.</b> \(\dot x=ax+by,\ \dot y=cx+dy\), o \(\dot{\mathbf x}=A\mathbf x\). El origen siempre es punto fijo y, por linealidad, las soluciones se superponen. Ejemplo físico: el oscilador \(m\ddot x+kx=0\) con \(\mathbf x=(x,v)\) da \(A=\begin{pmatrix}0&1\\-\omega^2&0\end{pmatrix}\), un centro con órbitas elípticas.</li><li><b>Soluciones rectilíneas.</b> Si \(A\mathbf v=\lambda\mathbf v\), entonces \(\mathbf x(t)=e^{\lambda t}\mathbf v\) es solución: la trayectoria se mueve sobre la recta generada por \(\mathbf v\). Con autovalores distintos, \(\mathbf x(t)=c_1e^{\lambda_1t}\mathbf v_1+c_2e^{\lambda_2t}\mathbf v_2\).</li><li><b>Autovalores.</b> \(\lambda^2-\tau\lambda+\Delta=0\Rightarrow\lambda_{1,2}=\dfrac{\tau\pm\sqrt{\tau^2-4\Delta}}{2}\), con \(\tau=\lambda_1+\lambda_2=\operatorname{tr}A\) y \(\Delta=\lambda_1\lambda_2=\det A\).</li><li><b>Sillas, nodos y focos.</b> \(\Delta\lt0\): silla (autovalores reales de signo opuesto; variedades estable e inestable rectas). \(\Delta>0\) y \(\tau^2>4\Delta\): nodo (las trayectorias llegan tangentes a la dirección lenta, la de \(|\lambda|\) menor). \(\tau^2\lt4\Delta\): foco o espiral, con \(\lambda=\alpha\pm i\omega\); estable si \(\tau\lt0\).</li><li><b>Casos frontera.</b> \(\tau=0,\ \Delta>0\): centro (órbitas cerradas, neutralmente estable). \(\tau^2=4\Delta\): nodo estrella o degenerado (un solo autovector). \(\Delta=0\): una recta de puntos fijos. Son estructuralmente inestables: una perturbación pequeña de \(A\) los cambia de tipo.</li><li><b>Estabilidad.</b> Atractor si toda trayectoria tiende al origen (\(\tau\lt0,\ \Delta>0\)); estable de Liapunov si las que empiezan cerca permanecen cerca (el centro lo es, pero no es atractor). Asintóticamente estable = ambas cosas.</li><li><b>Romeo y Julieta.</b> \(\dot R=aR+bJ,\ \dot J=cR+dJ\) (Strogatz §5.3): con \(\dot R=aJ,\ \dot J=-bR\) los sentimientos oscilan en un ciclo eterno de amor y odio (centro); con \(a=d\lt0\) cauto y \(b=c\), el desenlace depende de si \(a^2\gtrless b^2\).</li></ul></div>
<div class="block" id="dn4-lab"><h2><span class="ico">◎</span>Visualiza</h2>`+lab2('dn4-cv',sel('dn4-pre',[['m','Matriz libre'],['s','Silla [1 1; 4 −2]'],['n','Nodo estable [−3 1; 1 −2]'],['f','Foco estable [−0,3 −1; 1 −0,3]'],['c','Centro [0 1; −2 0]'],['e','Estrella [−1 0; 0 −1]'],['d','Nodo degenerado [−1 1; 0 −1]'],['z','Recta de puntos fijos [1 2; 0,5 1]']])+slider('dn4-a','a',-5,5,0.1,1)+slider('dn4-b','b',-5,5,0.1,1)+slider('dn4-c','c',-5,5,0.1,4)+slider('dn4-d','d',-5,5,0.1,-2)+'<button class="btn" id="dn4-play">▶ Nube de puntos</button><button class="btn ghost" id="dn4-clr">Borrar</button>','dn4-read','Izquierda: plano \\((\\tau,\\Delta)\\) con la parábola \\(\\tau^2=4\\Delta\\); el punto naranja es tu matriz. Derecha: retrato de fase con las rectas propias (violeta) cuando los autovalores son reales. Haz clic para lanzar trayectorias; con la nube verás cómo el flujo deforma un disco de condiciones iniciales.')+String.raw`</div>
<div class="block" id="dn4-leyes"><h2><span class="ico">§</span>Leyes y fórmulas</h2><div class="laws"><div class="law"><h3>Ecuación característica</h3><div class="eq">\[ \det(A-\lambda I)=\lambda^2-\tau\lambda+\Delta=0 \]</div><p>\(\tau=a+d\), \(\Delta=ad-bc\).</p></div><div class="law"><h3>Solución general</h3><div class="eq">\[ \mathbf x(t)=c_1e^{\lambda_1t}\mathbf v_1+c_2e^{\lambda_2t}\mathbf v_2=e^{At}\mathbf x_0 \]</div><p>Con \(\lambda=\alpha\pm i\omega\): combinaciones de \(e^{\alpha t}\cos\omega t\) y \(e^{\alpha t}\sin\omega t\).</p></div><div class="law"><h3>Clasificación</h3><div class="eq">\[ \Delta\lt0:\ \text{silla};\quad \tau^2\gtrless4\Delta:\ \text{nodo / foco};\quad \tau=0:\ \text{centro} \]</div><p>Para \(\Delta>0\), el signo de \(\tau\) decide estabilidad.</p></div><div class="law"><h3>Rapidez de giro de un foco</h3><div class="eq">\[ \omega=\tfrac12\sqrt{4\Delta-\tau^2},\qquad \frac{r(t+2\pi/\omega)}{r(t)}=e^{2\pi\tau/(2\omega)} \]</div><p>Cociente de amplitudes entre vueltas sucesivas (decremento logarítmico).</p></div><div class="law"><h3>Sentido de giro</h3><div class="eq">\[ \dot y\big|_{(1,0)}=c \]</div><p>En un foco o centro, si \(c>0\) el giro es antihorario.</p></div><div class="law"><h3>Teorema de Liouville (área)</h3><div class="eq">\[ \frac{d}{dt}\,\text{Área}=\tau\cdot\text{Área}\ \Rightarrow\ \text{Área}(t)=\text{Área}(0)\,e^{\tau t} \]</div><p>\(\tau=\nabla\cdot\mathbf f\): la traza mide la contracción del área de fase (la nube del laboratorio).</p></div></div></div>
<div class="block" id="dn4-ej"><h2><span class="ico">✎</span>Ejemplo resuelto</h2><div class="example"><p><b>Resuelve \(\dot x=x+y,\ \dot y=4x-2y\) con \(\mathbf x(0)=(2,-3)\), clasifica el origen y describe el retrato de fase.</b></p><ol><li>\(A=\begin{pmatrix}1&1\\4&-2\end{pmatrix}\): \(\tau=-1\), \(\Delta=-2-4=-6\lt0\Rightarrow\) silla.</li><li>Autovalores: \(\lambda^2+\lambda-6=0\Rightarrow\lambda_1=2,\ \lambda_2=-3\).</li><li>Autovectores: para \(\lambda_1=2\), \((1-2)v_x+v_y=0\Rightarrow\mathbf v_1=(1,1)\). Para \(\lambda_2=-3\), \(4v_x+v_y=0\Rightarrow\mathbf v_2=(1,-4)\).</li><li>Solución general: \(\mathbf x(t)=c_1e^{2t}(1,1)+c_2e^{-3t}(1,-4)\). Condición inicial: \(c_1+c_2=2\), \(c_1-4c_2=-3\Rightarrow c_2=1,\ c_1=1\).</li><li>\(x(t)=e^{2t}+e^{-3t}\), \(y(t)=e^{2t}-4e^{-3t}\). Comprobación: \(\dot x=2e^{2t}-3e^{-3t}=x+y\) ✓; \(\dot y=2e^{2t}+12e^{-3t}=4x-2y=4e^{2t}+4e^{-3t}-2e^{2t}+8e^{-3t}\) ✓.</li><li>Retrato: la variedad estable es la recta \(y=-4x\) y la inestable \(y=x\). Las demás trayectorias son hipérbolas que llegan paralelas a \(\mathbf v_2\) y salen paralelas a \(\mathbf v_1\). Esta en particular termina pegada a \(y=x\), con \(x\approx y\approx e^{2t}\).</li></ol><p style="margin:.6em 0 0">Área de fase: \(\tau=-1\), así que cualquier región se contrae como \(e^{-t}\) aunque las trayectorias escapen: se estira en \(\mathbf v_1\) y se aplasta más rápido en \(\mathbf v_2\).</p></div></div>
<div class="pager"><a href="#dn-circulo"><small>← Anterior</small>Flujos en el círculo: osciladores no uniformes y sincronización</a><a class="next" href="#dn-plano-fase"><small>Siguiente →</small>Linealización, nulclinas y especies en competencia</a></div>
<p class="note">Contenido de referencia: Strogatz, <i>Nonlinear Dynamics and Chaos</i>, 3.ª ed., §5.1–5.3. Redacción y simulaciones propias.</p></section>`);

function pA_classify(t,d){const e=1e-9;if(Math.abs(d)<e)return 'puntos fijos no aislados (Δ = 0)';if(d<0)return 'silla';
  if(Math.abs(t)<e)return 'centro';const D=t*t-4*d,st=t<0?'estable':'inestable';if(Math.abs(D)<1e-6)return 'nodo degenerado / estrella '+st;return (D>0?'nodo ':'foco ')+st;}
function pA_eigTxt(t,d){const D=t*t/4-d;if(D>=0)return nt(t/2+Math.sqrt(D),3)+', '+nt(t/2-Math.sqrt(D),3);return nt(t/2,3)+' ± '+nt(Math.sqrt(-D),3)+'i';}

LABS['dn-lineales-2d']=function(sec){
  const cv=$('#dn4-cv',sec),rd=$('#dn4-read',sec),pre=$('#dn4-pre',sec),pb=$('#dn4-play',sec);cv.classList.add('dx-click');
  const ids=['a','b','c','d'],g={};ids.forEach(k=>g[k]=sl(sec,'dn4-'+k,v=>nf(v,1),()=>{pre.value='m';cloud=null;draw();}));
  const PRE={s:[1,1,4,-2],n:[-3,1,1,-2],f:[-0.3,-1,1,-0.3],c:[0,1,-2,0],e:[-1,0,0,-1],d:[-1,1,0,-1],z:[1,2,0.5,1]};
  pre.addEventListener('change',()=>{const p=PRE[pre.value];if(p)ids.forEach((k,i)=>g[k].set(p[i]));orbs=[];cloud=null;draw();});
  let orbs=[],B=null,cloud=null,play=false;
  const newCloud=()=>{cloud=[];for(let i=0;i<140;i++){const r=0.5*Math.sqrt(Math.random()),a=Math.random()*TAU;cloud.push([1.3+r*Math.cos(a),0.9+r*Math.sin(a)]);}};
  pb.addEventListener('click',()=>{play=!play;if(play)newCloud();pb.textContent=play?'❚❚ Detener':'▶ Nube de puntos';draw();});
  $('#dn4-clr',sec).addEventListener('click',()=>{orbs=[];cloud=null;play=false;pb.textContent='▶ Nube de puntos';draw();});
  clickPos(cv,(px,py)=>{if(B&&inA(B,px,py)){orbs.push(invA(B,px,py));draw();}});
  const M=()=>[[g.a(),g.b()],[g.c(),g.d()]];
  function draw(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.55,430,270),A=M(),t=A[0][0]+A[1][1],d=det2(A[0][0],A[0][1],A[1][0],A[1][1]),hw=Math.floor(w*0.36);
    const TA=axes(ctx,{l:34,t:10,w:hw-44,h:h-34,xr:[-6,6],yr:[-6,9],xl:'τ',yl:'Δ'});
    ctx.save();ctx.fillStyle='rgba(201,42,42,.07)';ctx.fillRect(TA.o.l,TA.Y(0),TA.o.w,TA.Y(-6)-TA.Y(0));ctx.restore();
    curve(ctx,TA,x=>x*x/4,-6,6,K.t,2);ctx.save();ctx.strokeStyle=K.d;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(TA.X(0),TA.Y(0));ctx.lineTo(TA.X(0),TA.Y(9));ctx.stroke();ctx.restore();
    label(ctx,'sillas',TA.X(-5.5),TA.Y(-4),K.w);label(ctx,'focos',TA.X(-1.6),TA.Y(7.5),K.mut);label(ctx,'nodos',TA.X(-5.6),TA.Y(2.5),K.mut);label(ctx,'centros',TA.X(0.2),TA.Y(8.3),K.d);
    dot(ctx,TA.X(clamp(t,-6,6)),TA.Y(clamp(d,-6,9)),8,'#fff',K.b);
    const F=(x,y)=>[A[0][0]*x+A[0][1]*y,A[1][0]*x+A[1][1]*y];
    B=axes(ctx,{l:hw+30,t:10,w:w-hw-40,h:h-34,xr:[-3,3],yr:[-3,3],xl:'x',yl:'y'});vecField(ctx,B,F,18,16);
    const E=eig2(A);
    if(!E.cx){[E.v1,E.v2].forEach(v=>{ctx.save();ctx.beginPath();ctx.rect(B.o.l,B.o.t,B.o.w,B.o.h);ctx.clip();ctx.strokeStyle=K.d;ctx.lineWidth=2;ctx.setLineDash([7,4]);ctx.beginPath();ctx.moveTo(B.X(-6*v[0]),B.Y(-6*v[1]));ctx.lineTo(B.X(6*v[0]),B.Y(6*v[1]));ctx.stroke();ctx.restore();});}
    const seeds=[];for(let k=0;k<10;k++){const a=k/10*TAU+0.2;seeds.push([2.8*Math.cos(a),2.8*Math.sin(a)]);}
    seeds.forEach((p,k)=>{const f=orbit((s,u)=>F(u[0],u[1]),0,p,8,800,40),b=orbit((s,u)=>F(u[0],u[1]),0,p,-8,800,40);path(ctx,B,b.map(q=>[q[1],q[2]]),'rgba(28,34,48,.2)',1.3);path(ctx,B,f.map(q=>[q[1],q[2]]),'rgba(15,118,110,.55)',1.6);});
    orbs.forEach((p,i)=>{const col=PAL[(i+1)%PAL.length],f=orbit((s,u)=>F(u[0],u[1]),0,p,12,1200,40),b=orbit((s,u)=>F(u[0],u[1]),0,p,-4,400,40);path(ctx,B,b.map(q=>[q[1],q[2]]),'rgba(28,34,48,.3)',1.4);path(ctx,B,f.map(q=>[q[1],q[2]]),col,2.6);dot(ctx,B.X(p[0]),B.Y(p[1]),4.5,col);});
    if(cloud)cloud.forEach(p=>{if(Math.abs(p[0])<3.2&&Math.abs(p[1])<3.2)dot(ctx,B.X(p[0]),B.Y(p[1]),2.6,K.b);});
    dot(ctx,B.X(0),B.Y(0),5,K.ink);
    let s=row('A',mat(A))+row('τ = tr A',nt(t,2))+row('Δ = det A',nt(d,2))+row('τ² − 4Δ',nt(t*t-4*d,2))+row('λ₁, λ₂',pA_eigTxt(t,d));
    if(!E.cx)s+=row('v₁, v₂',vs(E.v1,2)+', '+vs(E.v2,2));
    s+=sep+row('tipo',pA_classify(t,d))+row('área de fase ∝ e^{τt}',t<0?'se contrae':t>0?'se expande':'se conserva');
    rd.innerHTML=s;
  }
  return {draw,tick(dt){if(play&&cloud&&vis(cv)){const A=M();const F=(x,y)=>[A[0][0]*x+A[0][1]*y,A[1][0]*x+A[1][1]*y];cloud=cloud.map(p=>rk4((s,u)=>F(u[0],u[1]),0,p,dt*0.6));if(cloud.every(p=>Math.abs(p[0])>3.2||Math.abs(p[1])>3.2||Math.hypot(p[0],p[1])<0.02))newCloud();draw();}}};
};

/* ================= 5 · PLANO DE FASE NO LINEAL ================= */
V.push(String.raw`<section class="view theme-aa" data-view="dn-plano-fase">
<div class="eyebrow">Dinámica no lineal y caos · Unidad III · Plano de fase no lineal</div><h1>Linealización, nulclinas y especies en competencia</h1><p class="lead">Para \(\dot{\mathbf x}=\mathbf f(\mathbf x)\) en el plano casi nunca hay solución cerrada, pero el retrato de fase se reconstruye a partir de los puntos fijos, su linealización, las nulclinas y algunas trayectorias especiales que separan cuencas.</p>
<div class="toc"><a href="#dn5-res" data-scroll>Resumen</a><a href="#dn5-lab" data-scroll>Visualiza</a><a href="#dn5-leyes" data-scroll>Leyes y fórmulas</a><a href="#dn5-ej" data-scroll>Ejemplo</a></div>
<div class="block" id="dn5-res"><h2><span class="ico">≡</span>Resumen</h2><ul class="keypoints"><li><b>Retrato de fase.</b> \(\dot x=f(x,y),\ \dot y=g(x,y)\) define un campo vectorial; las trayectorias son sus curvas integrales. Lo esencial: puntos fijos, órbitas cerradas, la estabilidad de cada uno y la disposición de las trayectorias que los conectan.</li><li><b>Existencia, unicidad y no cruce.</b> Si \(\mathbf f\in C^1\), por cada punto pasa una única trayectoria: dos trayectorias distintas nunca se cortan. En el plano esto es muy restrictivo (una órbita cerrada encierra una región de la que no se puede escapar) y es la razón de que no haya caos en 2D.</li><li><b>Linealización.</b> Cerca de \(\mathbf x^*\), con \(\mathbf u=\mathbf x-\mathbf x^*\): \(\dot{\mathbf u}\approx J\mathbf u\), donde \(J=\begin{pmatrix}f_x&f_y\\g_x&g_y\end{pmatrix}_{\mathbf x^*}\) es el jacobiano. Se clasifica \(\mathbf x^*\) con \(\tau=\operatorname{tr}J\) y \(\Delta=\det J\).</li><li><b>Hartman-Grobman.</b> Si \(\mathbf x^*\) es hiperbólico (\(\operatorname{Re}\lambda\ne0\) para ambos autovalores), el retrato no lineal es topológicamente equivalente al lineal cerca de \(\mathbf x^*\). Los casos frontera (centros, nodos degenerados, estrellas, \(\Delta=0\)) son frágiles: los términos no lineales deciden.</li><li><b>Nulclinas.</b> Curvas donde \(\dot x=0\) (el flujo es vertical) o \(\dot y=0\) (horizontal). Sus intersecciones son los puntos fijos, y dividen el plano en regiones con sentido de flujo constante (↗, ↖, ↙, ↘).</li><li><b>Competencia de Lotka-Volterra.</b> Conejos y ovejas: \(\dot x=x(3-x-2y),\ \dot y=y(2-x-y)\). Dos nodos estables (sólo conejos o sólo ovejas) y una silla interior cuya variedad estable es la <i>separatriz</i> entre las dos cuencas: principio de exclusión competitiva.</li><li><b>Cuenca de atracción.</b> Conjunto de condiciones iniciales que tienden a un atractor dado. Las fronteras entre cuencas son variedades estables de sillas: cerca de ellas, el destino final es sensible a pequeñas perturbaciones.</li></ul></div>
<div class="block" id="dn5-lab"><h2><span class="ico">◎</span>Visualiza</h2>`+tabs([
['comp','Competencia y cuencas',lab2('dn5-cv',slider('dn5-a','a (efecto de ovejas sobre conejos)',0,3,0.05,2)+slider('dn5-b','b (efecto de conejos sobre ovejas)',0,3,0.05,1)+seg('dn5-bas','v',[['1','cuencas'],['0','sin cuencas']])+'<button class="btn ghost" id="dn5-clr">Borrar</button>','dn5-read','Sistema \\(\\dot x=x(3-x-ay)\\), \\(\\dot y=y(2-bx-y)\\). Nulclinas: \\(\\dot x=0\\) en naranja y \\(\\dot y=0\\) en azul. El fondo colorea la cuenca de cada atractor. Haz clic para lanzar trayectorias. Con \\(ab\\lt1\\) aparece coexistencia estable.')],
['hg','Casos frontera',lab2('dn5-cv2',slider('dn5-k','k',-0.5,0.5,0.01,-0.2),'dn5-read2','\\(\\dot x=-y+kx(x^2+y^2)\\), \\(\\dot y=x+ky(x^2+y^2)\\). La linealización en el origen es siempre un centro (\\(\\lambda=\\pm i\\)), pero el término cúbico lo convierte en foco estable (\\(k\\lt0\\)) o inestable (\\(k>0\\)). Hartman-Grobman no aplica: el centro no es hiperbólico.')]])+String.raw`</div>
<div class="block" id="dn5-leyes"><h2><span class="ico">§</span>Leyes y fórmulas</h2><div class="laws"><div class="law"><h3>Jacobiano</h3><div class="eq">\[ \dot{\mathbf u}=J\mathbf u,\qquad J=\begin{pmatrix}\partial_xf&\partial_yf\\ \partial_xg&\partial_yg\end{pmatrix}_{\mathbf x^*} \]</div><p>Se desprecian términos \(O(|\mathbf u|^2)\).</p></div><div class="law"><h3>Teorema de Hartman-Grobman</h3><div class="eq">\[ \operatorname{Re}\lambda_i(J)\ne0\ \Rightarrow\ \text{flujo}\ \simeq\ e^{Jt}\ \text{cerca de}\ \mathbf x^* \]</div><p>Equivalencia topológica (homeomorfismo que conserva el sentido del tiempo).</p></div><div class="law"><h3>Teorema de existencia y unicidad</h3><div class="eq">\[ \mathbf f\in C^1(D)\ \Rightarrow\ \exists!\ \mathbf x(t),\ \mathbf x(0)=\mathbf x_0\in D \]</div><p>Consecuencia: las trayectorias no se cruzan.</p></div><div class="law"><h3>Nulclinas</h3><div class="eq">\[ f(x,y)=0\ (\dot x=0),\qquad g(x,y)=0\ (\dot y=0) \]</div><p>Puntos fijos = intersecciones.</p></div><div class="law"><h3>Competencia</h3><div class="eq">\[ \dot x=x(r_1-x-ay),\qquad \dot y=y(r_2-bx-y) \]</div><p>Equilibrio interior \(x^*=\dfrac{r_1-ar_2}{1-ab},\ y^*=\dfrac{r_2-br_1}{1-ab}\); es estable si \(ab\lt1\) y silla si \(ab>1\) (cuando está en el primer cuadrante).</p></div><div class="law"><h3>Centro no lineal en polares</h3><div class="eq">\[ \dot r=kr^3,\ \ \dot\theta=1\ \Rightarrow\ r(t)=\frac{r_0}{\sqrt{1-2kr_0^2t}} \]</div><p>Decaimiento algebraico \(r\sim(2|k|t)^{-1/2}\) (no exponencial) para \(k\lt0\); explosión en \(t=1/(2kr_0^2)\) si \(k>0\).</p></div></div></div>
<div class="block" id="dn5-ej"><h2><span class="ico">✎</span>Ejemplo resuelto</h2><div class="example"><p><b>Clasifica los puntos fijos de \(\dot x=x(3-x-2y),\ \dot y=y(2-x-y)\) y describe el desenlace de la competencia.</b></p><ol><li>Puntos fijos: \(x=0\) o \(x+2y=3\); \(y=0\) o \(x+y=2\). Combinando: \((0,0)\), \((0,2)\), \((3,0)\) y \((1,1)\).</li><li>Jacobiano: \(J=\begin{pmatrix}3-2x-2y&-2x\\-y&2-x-2y\end{pmatrix}\).</li><li>\((0,0)\): \(J=\operatorname{diag}(3,2)\), nodo inestable. \((0,2)\): \(J=\begin{pmatrix}-1&0\\-2&-2\end{pmatrix}\), \(\lambda=-1,-2\), nodo estable. \((3,0)\): \(J=\begin{pmatrix}-3&-6\\0&-1\end{pmatrix}\), \(\lambda=-3,-1\), nodo estable.</li><li>\((1,1)\): \(J=\begin{pmatrix}-1&-2\\-1&-1\end{pmatrix}\), \(\tau=-2\), \(\Delta=1-2=-1\lt0\): silla, con \(\lambda=-1\pm\sqrt2\approx0{,}414\) y \(-2{,}414\).</li><li>Autovector estable de la silla (\(\lambda=-1-\sqrt2\)): \((\sqrt2)v_x-2v_y=0\Rightarrow\mathbf v=(\sqrt2,1)\), de pendiente \(1/\sqrt2\approx0{,}71\). Por él pasa la separatriz.</li><li>Desenlace: según el lado de la separatriz donde empiece, el sistema termina en \((3,0)\) (sólo conejos) o en \((0,2)\) (sólo ovejas). No hay coexistencia: \(ab=2>1\), la competencia entre especies supera a la autolimitación.</li></ol><p style="margin:.6em 0 0">En el laboratorio, baja \(a\) hasta que \(ab\lt1\): la silla se convierte en nodo estable y los dos equilibrios de frontera en sillas, y ambas especies coexisten.</p></div></div>
<div class="pager"><a href="#dn-lineales-2d"><small>← Anterior</small>Sistemas lineales en el plano y clasificación por traza y determinante</a><a class="next" href="#dn-conservativos"><small>Siguiente →</small>Sistemas conservativos, reversibles, el péndulo e índice</a></div>
<p class="note">Contenido de referencia: Strogatz, <i>Nonlinear Dynamics and Chaos</i>, 3.ª ed., §6.1–6.4. Redacción y simulaciones propias.</p></section>`);

/* jacobiano numérico y puntos fijos por Newton en una malla */
function pA_jac(F,x,y){const e=1e-5,a=F(x+e,y),b=F(x-e,y),p=F(x,y+e),q=F(x,y-e);return [[(a[0]-b[0])/(2*e),(p[0]-q[0])/(2*e)],[(a[1]-b[1])/(2*e),(p[1]-q[1])/(2*e)]];}
function pA_equil(F,xr,yr,nx=12,ny=10){const out=[];
  for(let i=0;i<=nx;i++)for(let j=0;j<=ny;j++){let x=xr[0]+(xr[1]-xr[0])*i/nx,y=yr[0]+(yr[1]-yr[0])*j/ny;
    for(let k=0;k<50;k++){const f=F(x,y),M=pA_jac(F,x,y),D=det2(M[0][0],M[0][1],M[1][0],M[1][1]);if(Math.abs(D)<1e-12)break;x-=(M[1][1]*f[0]-M[0][1]*f[1])/D;y-=(-M[1][0]*f[0]+M[0][0]*f[1])/D;if(!isFinite(x)||!isFinite(y))break;}
    const f=F(x,y);if(isFinite(x)&&isFinite(y)&&Math.hypot(...f)<1e-9&&x>=xr[0]-1e-6&&x<=xr[1]+1e-6&&y>=yr[0]-1e-6&&y<=yr[1]+1e-6&&!out.some(q=>Math.hypot(q[0]-x,q[1]-y)<1e-4))out.push([x+0,y+0,pA_jac(F,x,y)]);}
  return out;}

LABS['dn-plano-fase']=function(sec){
  const cv=$('#dn5-cv',sec),rd=$('#dn5-read',sec);cv.classList.add('dx-click');
  const ga=sl(sec,'dn5-a',v=>nf(v,2),()=>{bas=null;draw1();}),gb=sl(sec,'dn5-b',v=>nf(v,2),()=>{bas=null;draw1();}),gbas=segm(sec,'dn5-bas','v',()=>draw1());
  let orbs=[[0.5,2.6],[2.6,2.6],[0.3,0.25],[3.6,0.6]],B=null,bas=null;
  $('#dn5-clr',sec).addEventListener('click',()=>{orbs=[];draw1();});
  clickPos(cv,(px,py)=>{if(B&&inA(B,px,py)){orbs.push(invA(B,px,py));draw1();}});
  const XR=[0,4],YR=[0,3];
  function basins(F,att){const nx=70,ny=52,G=[];for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){let u=[XR[0]+(i+0.5)/nx*(XR[1]-XR[0]),YR[0]+(j+0.5)/ny*(YR[1]-YR[0])];
      for(let s=0;s<200;s++){u=rk4((t,v)=>F(v[0],v[1]),0,u,0.15);if(!isFinite(u[0]))break;}let best=-1,bd=0.3;att.forEach((a,k)=>{const d=Math.hypot(u[0]-a[0],u[1]-a[1]);if(d<bd){bd=d;best=k;}});G.push(best);}
    return {nx,ny,G};}
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.62,440,280),a=ga(),b=gb(),F=(x,y)=>[x*(3-x-a*y),y*(2-b*x-y)];
    B=axes(ctx,{l:36,t:10,w:w-46,h:h-34,xr:XR,yr:YR,xl:'x (conejos)',yl:'y (ovejas)'});
    const E=pA_equil(F,[-0.01,XR[1]],[-0.01,YR[1]],10,8).filter(e=>e[0]>-1e-6&&e[1]>-1e-6);
    const att=E.filter(e=>{const M=e[2],t=M[0][0]+M[1][1],d=det2(M[0][0],M[0][1],M[1][0],M[1][1]);return d>0&&t<0;});
    if(gbas()==='1'){if(!bas)bas=basins(F,att);const cols=['rgba(217,72,15,.22)','rgba(36,83,201,.22)','rgba(43,138,62,.24)','rgba(112,72,232,.22)'];
      const cw=B.o.w/bas.nx,ch=B.o.h/bas.ny;ctx.save();for(let j=0;j<bas.ny;j++)for(let i=0;i<bas.nx;i++){const k=bas.G[j*bas.nx+i];if(k<0)continue;ctx.fillStyle=cols[k%4];ctx.fillRect(B.o.l+i*cw,B.o.t+B.o.h-(j+1)*ch,cw+0.6,ch+0.6);}ctx.restore();}
    vecField(ctx,B,F,22,15);
    /* nulclinas */
    ctx.save();ctx.lineWidth=2.4;ctx.strokeStyle=K.b;ctx.beginPath();ctx.moveTo(B.X(0),B.Y(0));ctx.lineTo(B.X(0),B.Y(3));ctx.stroke();ctx.restore();
    curve(ctx,B,x=>a>1e-6?(3-x)/a:NaN,0,4,K.b,2.4);if(a<1e-6){ctx.save();ctx.strokeStyle=K.b;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(B.X(3),B.Y(0));ctx.lineTo(B.X(3),B.Y(3));ctx.stroke();ctx.restore();}
    ctx.save();ctx.lineWidth=2.4;ctx.strokeStyle=K.a;ctx.beginPath();ctx.moveTo(B.X(0),B.Y(0));ctx.lineTo(B.X(4),B.Y(0));ctx.stroke();ctx.restore();
    curve(ctx,B,x=>2-b*x,0,4,K.a,2.4);
    /* separatrices de sillas */
    E.forEach(e=>{const M=e[2],t=M[0][0]+M[1][1],d=det2(M[0][0],M[0][1],M[1][0],M[1][1]);if(d<0){const Ei=eig2(M),v=Ei.v2;[1,-1].forEach(sg=>{const p=[e[0]+sg*0.01*v[0],e[1]+sg*0.01*v[1]];const o=orbit((s,u)=>F(u[0],u[1]),0,p,-12,1500,20);path(ctx,B,o.map(q=>[q[1],q[2]]),K.d,2.4,[7,4]);});}});
    orbs.forEach((p,i)=>{const col=PAL[i%PAL.length],o=orbit((s,u)=>F(u[0],u[1]),0,p,20,2000,50);path(ctx,B,o.map(q=>[q[1],q[2]]),col,2.4);dot(ctx,B.X(p[0]),B.Y(p[1]),4.5,col);});
    let s=row('a · b',nt(a*b,3))+sep;
    E.sort((p,q)=>p[0]-q[0]||p[1]-q[1]).forEach(e=>{const M=e[2],t=M[0][0]+M[1][1],d=det2(M[0][0],M[0][1],M[1][0],M[1][1]);const st=d>0&&t<0;
      dot(ctx,B.X(e[0]),B.Y(e[1]),6.5,st?K.ink:'#fff',st?null:K.ink);
      s+=`<div><span class="k">(${nt(e[0],2)}, ${nt(e[1],2)})</span>: <b>${pA_classify(t,d)}</b> · λ = ${pA_eigTxt(t,d)}</div>`;});
    rd.innerHTML=s+sep+rowT(a*b>1?'ab > 1: exclusión competitiva. La separatriz (violeta, variedad estable de la silla) divide las cuencas de los dos ganadores posibles.':'ab < 1: la autolimitación domina y hay un equilibrio de coexistencia estable (si está en el primer cuadrante).');
  }
  /* ---- caso frontera ---- */
  const cv2=$('#dn5-cv2',sec),rd2=$('#dn5-read2',sec),gk=sl(sec,'dn5-k',v=>nf(v,2),()=>draw2());
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.5,400,260),k=gk(),F=(x,y)=>{const r2=x*x+y*y;return [-y+k*x*r2,x+k*y*r2];},hw=Math.floor(w*0.5);
    const Bq=axes(ctx,{l:30,t:10,w:Math.min(hw-40,h-34),h:h-34,xr:[-1.5,1.5],yr:[-1.5,1.5],xl:'x',yl:'y'});vecField(ctx,Bq,F,15,15);
    const r0=k>0?0.4:1.2,o=orbit((s,u)=>F(u[0],u[1]),0,[r0,0],40,6000,3);path(ctx,Bq,o.map(q=>[q[1],q[2]]),K.b,1.8);dot(ctx,Bq.X(r0),Bq.Y(0),4.5,K.b);
    const T=40,C=axes(ctx,{l:hw+30,t:10,w:w-hw-40,h:h-34,xr:[0,T],yr:[0,1.6],xl:'t',yl:'r(t)'});
    path(ctx,C,o.map(q=>[q[0],Math.hypot(q[1],q[2])]),K.b,2.4);
    curve(ctx,C,t=>{const z=1-2*k*r0*r0*t;return z>0?r0/Math.sqrt(z):NaN;},0,T,K.ink,1.4,[5,4]);
    const tb=k>0?1/(2*k*r0*r0):null;
    rd2.innerHTML=row('k',nf(k,2))+row('linealización','λ = ±i (centro)')+row('ṙ',`${nt(k,2)} r³`)+row('r(t)','r₀/√(1 − 2k r₀² t)')+(tb?row('explosión en t',nt(tb,2)):'')+sep+
      rowT(k<0?'Foco estable débil: r decae como t^(−1/2), mucho más lento que un foco hiperbólico.':k>0?'Foco inestable: la órbita se aleja y diverge en tiempo finito.':'k = 0: centro genuino (oscilador armónico).')+rowT('Línea discontinua: solución exacta en polares; color: integración numérica.');
  }
  return {draw(){draw1();draw2();}};
};

/* ================= 6 · CONSERVATIVOS, REVERSIBLES, PÉNDULO, ÍNDICE ================= */
V.push(String.raw`<section class="view theme-aa" data-view="dn-conservativos">
<div class="eyebrow">Dinámica no lineal y caos · Unidad III · Plano de fase no lineal</div><h1>Sistemas conservativos, reversibles, el péndulo e índice</h1><p class="lead">Cuando hay una cantidad conservada o una simetría de inversión temporal, los centros de la linealización sobreviven en el sistema no lineal. La teoría del índice añade una restricción topológica global: qué combinaciones de puntos fijos puede encerrar una órbita cerrada.</p>
<div class="toc"><a href="#dn6-res" data-scroll>Resumen</a><a href="#dn6-lab" data-scroll>Visualiza</a><a href="#dn6-leyes" data-scroll>Leyes y fórmulas</a><a href="#dn6-ej" data-scroll>Ejemplo</a></div>
<div class="block" id="dn6-res"><h2><span class="ico">≡</span>Resumen</h2><ul class="keypoints"><li><b>Sistemas conservativos.</b> \(m\ddot x=F(x)=-V'(x)\) conserva \(E=\tfrac12m\dot x^2+V(x)\). Las trayectorias en el plano \((x,\dot x)\) son curvas de nivel de \(E\). Un sistema con cantidad conservada no tiene atractores: si los tuviera, \(E\) sería constante en toda su cuenca.</li><li><b>Teorema de los centros no lineales.</b> Si \(\mathbf x^*\) es un mínimo local aislado de una cantidad conservada \(E\), todas las trayectorias suficientemente cercanas son cerradas: \(\mathbf x^*\) es un centro genuino, aunque la linealización sea un caso frontera.</li><li><b>Sistemas reversibles.</b> Invariantes bajo \(t\to-t,\ y\to-y\) (todo \(\ddot x=F(x)\) lo es). Si el origen es un centro lineal, también lo es para el sistema no lineal: cada órbita se refleja en el eje \(x\) y se cierra sobre sí misma.</li><li><b>Órbitas homoclínicas y heteroclínicas.</b> Una homoclínica sale de una silla y vuelve a ella (el doble pozo \(\ddot x=x-x^3\)); una heteroclínica conecta dos sillas distintas (las separatrices del péndulo entre \(\theta=-\pi\) y \(\theta=\pi\)). En sistemas conservativos son frecuentes; en disipativos, no genéricas.</li><li><b>El péndulo.</b> \(\ddot\theta+\sin\theta=0\) con \(E=\tfrac12\dot\theta^2-\cos\theta\). \(E\lt1\): libraciones alrededor de \(\theta=0\) (centro). \(E>1\): rotaciones. \(E=1\): separatriz, que se acerca a la silla \(\theta=\pi\) en tiempo infinito. En el cilindro \(\theta\in S^1\) el retrato es más claro.</li><li><b>Péndulo amortiguado.</b> \(\ddot\theta+b\dot\theta+\sin\theta=0\Rightarrow\dot E=-b\dot\theta^2\le0\). Los centros pasan a focos estables (\(b\lt2\)) o nodos (\(b>2\)); el péndulo puede dar varias vueltas antes de caer en un pozo.</li><li><b>Índice de una curva.</b> Para una curva cerrada \(C\) que no pasa por puntos fijos, \(I_C\) es el número de vueltas del vector \(\mathbf f\) al recorrer \(C\) una vez en sentido antihorario. Sólo depende de los puntos fijos encerrados: nodos, focos y centros tienen índice \(+1\); sillas, \(-1\).</li><li><b>Consecuencias.</b> Una órbita cerrada tiene \(I=+1\) (el campo es tangente a ella), así que debe encerrar puntos fijos con índices que sumen \(+1\): al menos uno, y nunca una sola silla. Una curva que no encierra puntos fijos tiene índice 0.</li></ul></div>
<div class="block" id="dn6-lab"><h2><span class="ico">◎</span>Visualiza</h2>`+tabs([
['pend','Péndulo',lab2('dn6-cv',slider('dn6-b','amortiguamiento b',0,1.5,0.01,0)+'<button class="btn ghost" id="dn6-clr">Borrar</button>','dn6-read','\\(\\ddot\\theta+b\\dot\\theta+\\sin\\theta=0\\). Con \\(b=0\\) se dibujan las curvas de nivel de \\(E\\) y en rojo la separatriz \\(E=1\\). Haz clic para lanzar una trayectoria: el péndulo de la esquina la reproduce. Sube \\(b\\) y mira cómo los centros se vuelven focos.')],
['ind','Índice de una curva',lab2('dn6-cv2',sel('dn6-sys',[['duf','ẍ = x − x³ (doble pozo)'],['lv','Competencia (cap. 6.4)'],['z2','ẋ = x² − y², ẏ = 2xy'],['pen','Péndulo θ̈ = −sin θ']])+slider('dn6-R','radio',0.1,3,0.05,1.5),'dn6-read2','Arrastra el centro del círculo. Las flechas muestran \\(\\mathbf f\\) sobre la curva; el diagrama pequeño muestra cómo gira el vector al recorrerla. El índice es el número neto de vueltas y coincide con la suma de índices de los puntos fijos encerrados.')]])+String.raw`</div>
<div class="block" id="dn6-leyes"><h2><span class="ico">§</span>Leyes y fórmulas</h2><div class="laws"><div class="law"><h3>Energía conservada</h3><div class="eq">\[ \ddot x=-V'(x)\ \Rightarrow\ E=\tfrac12\dot x^2+V(x),\ \ \frac{dE}{dt}=0 \]</div><p>Órbitas = curvas de nivel \(E=\text{cte}\).</p></div><div class="law"><h3>Centros no lineales</h3><div class="eq">\[ \nabla E(\mathbf x^*)=0,\ \ \mathbf x^*\ \text{mínimo aislado}\ \Rightarrow\ \text{centro} \]</div><p>Lo mismo si el sistema es reversible y el origen es un centro lineal.</p></div><div class="law"><h3>Reversibilidad</h3><div class="eq">\[ \dot x=f(x,y),\ \dot y=g(x,y),\quad f(x,-y)=-f(x,y),\ g(x,-y)=g(x,y) \]</div><p>El cambio \(t\to-t,\ y\to-y\) deja el sistema invariante.</p></div><div class="law"><h3>Péndulo</h3><div class="eq">\[ E=\tfrac12\dot\theta^2-\cos\theta,\qquad \text{separatriz: }\dot\theta=\pm2\cos\frac\theta2 \]</div><p>Período de libración \(T=4K(k)\), \(k=\sin(\theta_0/2)\); diverge logarítmicamente al acercarse a la separatriz.</p></div><div class="law"><h3>Disipación</h3><div class="eq">\[ \ddot\theta+b\dot\theta+\sin\theta=0\ \Rightarrow\ \dot E=-b\,\dot\theta^2 \]</div><p>\(E\) es una función de Liapunov: no hay órbitas cerradas.</p></div><div class="law"><h3>Índice</h3><div class="eq">\[ I_C=\frac{1}{2\pi}\oint_C d\phi,\qquad \phi=\arctan\frac{g}{f},\qquad I_C=\sum_{\mathbf x^*\in\operatorname{int}C}I(\mathbf x^*) \]</div><p>Nodo, foco, centro: \(+1\); silla: \(-1\); \(z^n\): \(n\). Teorema: toda órbita cerrada encierra puntos fijos de índice total \(+1\).</p></div></div></div>
<div class="block" id="dn6-ej"><h2><span class="ico">✎</span>Ejemplo resuelto</h2><div class="example"><p><b>Doble pozo: \(\ddot x=x-x^3\). Encuentra los puntos fijos y su tipo, la cantidad conservada, las órbitas homoclínicas y el período de las oscilaciones pequeñas en cada pozo. ¿Puede haber una órbita cerrada que rodee sólo al origen?</b></p><ol><li>Como sistema: \(\dot x=y,\ \dot y=x-x^3\). Puntos fijos: \(y=0,\ x(1-x^2)=0\Rightarrow(0,0),\ (\pm1,0)\).</li><li>Jacobiano: \(J=\begin{pmatrix}0&1\\1-3x^2&0\end{pmatrix}\). En \((0,0)\): \(\Delta=-1\), silla con \(\lambda=\pm1\). En \((\pm1,0)\): \(\tau=0,\ \Delta=2\), centros lineales con \(\lambda=\pm i\sqrt2\).</li><li>Energía: \(V(x)=-\tfrac{x^2}{2}+\tfrac{x^4}{4}\), \(E=\tfrac{y^2}{2}-\tfrac{x^2}{2}+\tfrac{x^4}{4}\). Los puntos \((\pm1,0)\) son mínimos aislados (\(E=-\tfrac14\)), por el teorema son centros genuinos.</li><li>Homoclínicas: tienen la energía de la silla, \(E=0\): \(y=\pm x\sqrt{1-\tfrac{x^2}{2}}\). Llegan hasta \(x=\pm\sqrt2\approx\pm1{,}414\) y forman un "ocho" que separa las órbitas internas a cada pozo de las que rodean los tres puntos fijos.</li><li>Oscilaciones pequeñas: \(V''(\pm1)=-1+3=2\Rightarrow\omega=\sqrt2\), \(T=2\pi/\sqrt2\approx4{,}44\). (La simulación con amplitud \(0{,}05\) da \(4{,}45\); con amplitud mayor, \(T\) crece y diverge al llegar a la homoclínica.)</li><li>Índice: una órbita cerrada debe tener \(I=+1\). Alrededor sólo del origen tendría \(I=-1\) (silla): imposible. Las órbitas que rodean todo encierran \(+1-1+1=+1\) ✓.</li></ol><p style="margin:.6em 0 0">Con rozamiento (\(\ddot x+b\dot x=x-x^3\)) los centros pasan a focos estables y las variedades estables de la silla pasan a ser la frontera entre las cuencas de los dos pozos.</p></div></div>
<div class="pager"><a href="#dn-plano-fase"><small>← Anterior</small>Linealización, nulclinas y especies en competencia</a><a class="next" href="#dn-ciclos-limite"><small>Siguiente →</small>Ciclos límite, Poincaré-Bendixson y van der Pol</a></div>
<p class="note">Contenido de referencia: Strogatz, <i>Nonlinear Dynamics and Chaos</i>, 3.ª ed., §6.5–6.8; Thornton y Marion, cap. 4. Redacción y simulaciones propias.</p></section>`);

LABS['dn-conservativos']=function(sec){
  const cv=$('#dn6-cv',sec),rd=$('#dn6-read',sec),gb=sl(sec,'dn6-b',v=>nf(v,2),()=>draw1());cv.classList.add('dx-click');
  let orbs=[[0,1.6]],B=null,anim=0,lastO=null,snap=null;
  function drawPend(ctx,w,h){if(!lastO)return;const q=lastO.o[Math.min(lastO.o.length-1,Math.floor(anim))],th=q[1],R=Math.min(48,h*0.13),cx=w-R-24,cy=R+26;
      ctx.save();ctx.fillStyle='rgba(255,255,255,.85)';ctx.fillRect(cx-R-14,cy-R-14,2*R+28,2*R+28);ctx.strokeStyle=K.line;ctx.strokeRect(cx-R-14,cy-R-14,2*R+28,2*R+28);
      ctx.strokeStyle=K.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+R*Math.sin(th),cy+R*Math.cos(th));ctx.stroke();ctx.restore();
      dot(ctx,cx,cy,3,K.ink);dot(ctx,cx+R*Math.sin(th),cy+R*Math.cos(th),7,lastO.col,'#fff');dot(ctx,B.X(th),B.Y(q[2]),6,lastO.col,'#fff');}
  $('#dn6-clr',sec).addEventListener('click',()=>{orbs=[];lastO=null;draw1();});
  clickPos(cv,(px,py)=>{if(B&&inA(B,px,py)){orbs.push(invA(B,px,py));anim=0;draw1();}});
  const F=b=>(x,y)=>[y,-Math.sin(x)-b*y];
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.55,420,270),b=gb(),f=F(b);
    B=axes(ctx,{l:36,t:10,w:w-46,h:h-34,xr:[-2*Math.PI-0.3,2*Math.PI+0.3],yr:[-3.2,3.2],xl:'θ (rad)',yl:'θ̇'});
    if(b===0){[-0.8,-0.4,0,0.4,0.8,1.5,2.2,3].forEach(c=>contour(ctx,B,(x,y)=>y*y/2-Math.cos(x),c,'rgba(15,118,110,.4)',1.2,140,80));contour(ctx,B,(x,y)=>y*y/2-Math.cos(x),1,K.w,2.2,180,90,[6,4]);}
    else vecField(ctx,B,f,26,14);
    lastO=null;
    orbs.forEach((p,i)=>{const col=PAL[(i+1)%PAL.length],o=orbit((s,u)=>f(u[0],u[1]),0,p,30,3000,60);path(ctx,B,o.map(q=>[q[1],q[2]]),col,2.4);dot(ctx,B.X(p[0]),B.Y(p[1]),4.5,col);if(i===orbs.length-1)lastO={o,col};});
    [-2,-1,0,1,2].forEach(k=>{const s=k%2!==0;dot(ctx,B.X(k*Math.PI),B.Y(0),6,s?'#fff':K.ink,s?K.ink:null);});
    snap=ctx.getImageData(0,0,cv.width,cv.height);drawPend(ctx,w,h);
    let s=row('b',nf(b,2));
    if(orbs.length){const p=orbs[orbs.length-1],E=p[1]*p[1]/2-Math.cos(p[0]);s+=row('E inicial = θ̇²/2 − cos θ',nt(E,3))+row('movimiento',b>0?'disipativo: E decrece':E<1?'libración (oscila)':E>1?'rotación':'separatriz');
      if(b===0&&E<1&&E>-1){const k=Math.sqrt((1+E)/2);s+=row('período 4K(k), k = sin(θ₀/2)',nt(pA_period(k),3));}}
    rd.innerHTML=s+sep+rowT(b===0?'Sin rozamiento: centros en θ = 2kπ y sillas en θ = (2k+1)π unidas por órbitas heteroclínicas (la separatriz roja).':b<2?'Con rozamiento los centros son focos estables: el péndulo oscila con amplitud decreciente. Si empieza con mucha energía da vueltas completas y luego cae en algún pozo.':'Sobreamortiguado: nodos estables.');
  }
  function pA_period(k){/* 4K(k) por la media aritmético-geométrica */let a=1,g=Math.sqrt(1-k*k);for(let i=0;i<20;i++){const an=(a+g)/2;g=Math.sqrt(a*g);a=an;}return 4*Math.PI/(2*a);}
  /* ---- índice ---- */
  const cv2=$('#dn6-cv2',sec),rd2=$('#dn6-read2',sec),sys=$('#dn6-sys',sec),gR=sl(sec,'dn6-R',v=>nf(v,2),()=>draw2());
  const SY={duf:{F:(x,y)=>[y,x-x*x*x],xr:[-2.5,2.5],yr:[-1.8,1.8],c:[0.4,0]},
    lv:{F:(x,y)=>[x*(3-x-2*y),y*(2-x-y)],xr:[-0.6,3.8],yr:[-0.6,2.8],c:[1,1]},
    z2:{F:(x,y)=>[x*x-y*y,2*x*y],xr:[-2,2],yr:[-1.5,1.5],c:[0.3,0.2]},
    pen:{F:(x,y)=>[y,-Math.sin(x)],xr:[-5,5],yr:[-2.5,2.5],c:[0.5,0]}};
  const ctr=[0.4,0];let PB=null;
  sys.addEventListener('change',()=>{const S=SY[sys.value];ctr[0]=S.c[0];ctr[1]=S.c[1];draw2();});
  drag(cv2,(x,y)=>PB&&Math.hypot(PB.X(ctr[0])-x,PB.Y(ctr[1])-y)<22?0:null,(i,x,y)=>{const q=invA(PB,x,y),S=SY[sys.value];ctr[0]=clamp(q[0],S.xr[0],S.xr[1]);ctr[1]=clamp(q[1],S.yr[0],S.yr[1]);draw2();});
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.55,420,270),S=SY[sys.value],R=gR(),F=S.F,hw=Math.floor(w*0.72);
    PB=axes(ctx,{l:36,t:10,w:hw-46,h:h-34,xr:S.xr,yr:S.yr,xl:'x',yl:'y'});vecField(ctx,PB,F,20,14);
    const E=pA_equil(F,S.xr,S.yr,14,10);
    /* recorrido del círculo y ángulo acumulado */
    const N=720;let tot=0,prev=null,ok=true;const ang=[];
    for(let i=0;i<=N;i++){const a=i/N*TAU,x=ctr[0]+R*Math.cos(a),y=ctr[1]+R*Math.sin(a),v=F(x,y);if(Math.hypot(...v)<1e-6)ok=false;const p=Math.atan2(v[1],v[0]);
      if(prev!==null){let d=p-prev;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;tot+=d;}prev=p;ang.push(p);}
    const I=Math.round(tot/TAU);
    ctx.save();ctx.beginPath();ctx.rect(PB.o.l,PB.o.t,PB.o.w,PB.o.h);ctx.clip();ctx.strokeStyle=K.b;ctx.lineWidth=2.6;ctx.beginPath();
    ctx.ellipse(PB.X(ctr[0]),PB.Y(ctr[1]),Math.abs(PB.X(ctr[0]+R)-PB.X(ctr[0])),Math.abs(PB.Y(ctr[1]+R)-PB.Y(ctr[1])),0,0,TAU);ctx.stroke();
    for(let k=0;k<16;k++){const a=k/16*TAU,x=ctr[0]+R*Math.cos(a),y=ctr[1]+R*Math.sin(a),v=F(x,y),n=Math.hypot(...v)||1,px=PB.X(x),py=PB.Y(y);arrow(ctx,px,py,px+v[0]/n*18,py-v[1]/n*18,K.d,2);}
    ctx.restore();dot(ctx,PB.X(ctr[0]),PB.Y(ctr[1]),6,'#fff',K.b);
    let sum=0,inside=[];
    E.forEach(e=>{const M=e[2],t=M[0][0]+M[1][1],d=det2(M[0][0],M[0][1],M[1][0],M[1][1]);const ind=Math.abs(d)<1e-8?null:d<0?-1:1;
      const In=Math.hypot(e[0]-ctr[0],e[1]-ctr[1])<R;dot(ctx,PB.X(e[0]),PB.Y(e[1]),6,ind===-1?'#fff':K.ink,ind===-1?K.ink:null);
      if(In){inside.push([e,ind]);if(ind!==null)sum+=ind;}});
    /* rueda del ángulo */
    const cx=hw+(w-hw)/2,cy=h*0.35,rr=Math.min((w-hw)/2-12,h*0.25);
    ctx.save();ctx.strokeStyle=K.ax;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(cx,cy,rr,0,TAU);ctx.stroke();ctx.strokeStyle=K.d;ctx.lineWidth=2;ctx.beginPath();
    let acc=ang[0];ctx.moveTo(cx+rr*0.3*Math.cos(acc),cy-rr*0.3*Math.sin(acc));
    for(let i=1;i<ang.length;i++){let d=ang[i]-ang[i-1];while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;acc+=d;const rad=rr*(0.3+0.7*i/ang.length);ctx.lineTo(cx+rad*Math.cos(acc),cy-rad*Math.sin(acc));}
    ctx.stroke();ctx.restore();label(ctx,'giro de f',cx,cy+rr+14,K.mut,'center');
    let s=row('índice I_C',ok?`<b>${I>0?'+':''}${I}</b>`:'indefinido (la curva pasa por un punto fijo)')+row('puntos fijos encerrados',inside.length)+row('suma de índices',(sum>0?'+':'')+sum);
    inside.forEach(([e,ind])=>{s+=`<div><span class="k">(${nt(e[0],2)}, ${nt(e[1],2)})</span>: índice ${ind===null?'—':(ind>0?'+1':'−1')}</div>`;});
    rd2.innerHTML=s+sep+rowT(sys.value==='z2'?'El origen de ẋ = x² − y², ẏ = 2xy (es f = z²) tiene índice +2: el vector da dos vueltas.':'Nodos, focos y centros aportan +1; sillas −1. Si la curva no encierra puntos fijos, I = 0.');
  }
  return {draw(){draw1();draw2();},tick(dt){if(lastO&&snap&&vis(cv)&&$('.tabpane[data-pane="pend"]',sec).classList.contains('on')){anim+=dt*100;if(anim>=lastO.o.length)anim=0;const ctx=cv.getContext('2d');ctx.putImageData(snap,0,0);drawPend(ctx,cv._w,cv._h);}}};
};

/* ======================= PARTE B · temas 7–12 ======================= */
/* ---- helpers propios de la parte B ---- */
function pB_classify(t,d){const D=t*t-4*d,e=1e-9;
  if(d<-e)return 'silla';if(Math.abs(d)<=e)return 'degenerado (Δ = 0)';
  if(Math.abs(t)<=e)return 'centro (lineal)';
  if(Math.abs(D)<=1e-6)return t<0?'nodo impropio estable':'nodo impropio inestable';
  if(D>0)return t<0?'nodo estable':'nodo inestable';return t<0?'foco estable':'foco inestable';}
function pB_eig(t,d){const D=t*t/4-d;if(D>=0){const s=Math.sqrt(D);return nt(t/2+s,3)+', '+nt(t/2-s,3);}return nt(t/2,3)+' ± '+nt(Math.sqrt(-D),3)+'i';}
/* RK4 sin reservar memoria para sistemas pequeños: f(y,out) */
function pB_step(f,y,h,n){const k1=new Array(n),k2=new Array(n),k3=new Array(n),k4=new Array(n),t=new Array(n);
  f(y,k1);for(let i=0;i<n;i++)t[i]=y[i]+h/2*k1[i];f(t,k2);for(let i=0;i<n;i++)t[i]=y[i]+h/2*k2[i];f(t,k3);for(let i=0;i<n;i++)t[i]=y[i]+h*k3[i];f(t,k4);
  for(let i=0;i<n;i++)y[i]+=h/6*(k1[i]+2*k2[i]+2*k3[i]+k4[i]);return y;}
/* periodo y amplitud de un ciclo límite plano F(x,y)->[dx,dy]; cruces ascendentes de y = 0 con x > 0 … se usa el cruce de x por 0 con ẋ > 0 */
function pB_cycle(F,x0,ttr,h,maxT){let y=x0.slice();const f=(u,o)=>{const v=F(u[0],u[1]);o[0]=v[0];o[1]=v[1];};
  for(let t=0;t<ttr;t+=h)pB_step(f,y,h,2);
  const cr=[],pts=[];let t=0,prev=y.slice(),amp=0;
  while(t<maxT&&cr.length<4){pB_step(f,y,h,2);t+=h;if(prev[0]<0&&y[0]>=0){const s=-prev[0]/(y[0]-prev[0]);cr.push(t-h+s*h);}
    if(cr.length>=2&&cr.length<3)pts.push([y[0],y[1]]);if(cr.length>=1)amp=Math.max(amp,Math.abs(y[0]));prev=y.slice();if(!isFinite(y[0]))break;}
  if(cr.length<3)return {T:NaN,amp,pts};return {T:(cr[cr.length-1]-cr[0])/(cr.length-1),amp,pts};}
/* dibuja una trayectoria con desvanecimiento */
function pB_trail(ctx,A,pts,col,lw=2.2){if(pts.length<2)return;ctx.save();ctx.beginPath();ctx.rect(A.o.l,A.o.t,A.o.w,A.o.h);ctx.clip();ctx.lineCap='round';
  const n=pts.length;for(let i=1;i<n;i++){ctx.globalAlpha=0.15+0.85*i/n;ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(A.X(pts[i-1][0]),A.Y(pts[i-1][1]));ctx.lineTo(A.X(pts[i][0]),A.Y(pts[i][1]));ctx.stroke();}ctx.restore();}
const pB_play=(id,on=true)=>`<button class="btn ghost" id="${id}">${on?'❚❚ Pausa':'▶ Reproducir'}</button>`;
function pB_toggle(sec,id,get,set){const b=$('#'+id,sec);b.addEventListener('click',()=>{set(!get());b.textContent=get()?'❚❚ Pausa':'▶ Reproducir';});}
const pB_on=(sec,p)=>{const el=$(`.tabpane[data-pane="${p}"]`,sec);return !el||el.classList.contains('on');};

/* ================= 7 · CICLOS LÍMITE ================= */
V.push(String.raw`<section class="view theme-aa" data-view="dn-ciclos-limite">
<div class="eyebrow">Dinámica no lineal y caos · Unidad III · Plano de fase no lineal</div><h1>Ciclos límite, Poincaré-Bendixson y van der Pol</h1><p class="lead">Un ciclo límite es una oscilación que el sistema elige por sí mismo: su amplitud y su periodo no dependen de las condiciones iniciales. Es la firma de los osciladores autosostenidos (el corazón, un reloj de péndulo, un circuito con válvula) y solo existe en sistemas no lineales.</p>
<div class="toc"><a href="#dn7-res" data-scroll>Resumen</a><a href="#dn7-lab" data-scroll>Visualiza</a><a href="#dn7-leyes" data-scroll>Leyes y fórmulas</a><a href="#dn7-ej" data-scroll>Ejemplo</a></div>
<div class="block" id="dn7-res"><h2><span class="ico">≡</span>Resumen</h2><ul class="keypoints">
<li><b>Definición.</b> Un ciclo límite es una órbita cerrada <i>aislada</i>: las trayectorias vecinas no son cerradas, sino que espiralan hacia ella (estable), se alejan (inestable) o hacen ambas cosas por cada lado (semiestable). En un sistema lineal \(\dot{\mathbf x}=A\mathbf x\) las órbitas cerradas vienen en familias (si \(\mathbf x(t)\) es solución, también \(c\,\mathbf x(t)\)), así que nunca son aisladas.</li>
<li><b>Modelo en polares.</b> \(\dot r=r(1-r^2)\), \(\dot\theta=1\): el flujo radial tiene un punto fijo estable en \(r=1\), que en el plano es un ciclo límite estable de periodo \(2\pi\). Toda la estabilidad del ciclo se lee en la ecuación unidimensional para \(r\).</li>
<li><b>Descartar órbitas cerradas.</b> No existen en sistemas gradiente \(\dot{\mathbf x}=-\nabla V\) (\(V\) decrece estrictamente), ni si hay una función de Liapunov, ni si se cumple el criterio de Dulac: si \(\nabla\cdot(g\,\mathbf F)\) tiene signo constante en una región simplemente conexa \(R\), no hay órbitas cerradas contenidas en \(R\).</li>
<li><b>Poincaré-Bendixson.</b> Si una trayectoria queda confinada en una región cerrada y acotada \(R\) que no contiene puntos fijos, entonces \(R\) contiene una órbita cerrada. En la práctica se construye una <i>región atrapante</i> (típicamente un anillo) en cuyo borde el campo apunta hacia adentro.</li>
<li><b>No hay caos en el plano.</b> Por Poincaré-Bendixson, en 2D las trayectorias acotadas solo pueden ir a puntos fijos, órbitas cerradas o ciclos heteroclínicos. El caos necesita al menos tres dimensiones (o un mapa).</li>
<li><b>Liénard y van der Pol.</b> La ecuación \(\ddot x+f(x)\dot x+g(x)=0\) tiene un único ciclo límite estable si \(g\) es impar, \(f\) par, y \(F(x)=\int_0^x f\) tiene un único cero positivo \(a\), es negativa en \((0,a)\) y crece hacia \(+\infty\) después. Van der Pol: \(\ddot x+\mu(x^2-1)\dot x+x=0\), con amortiguamiento negativo para \(|x|\lt1\) y positivo para \(|x|>1\).</li>
<li><b>Límite débil \(\mu\ll1\).</b> Con \(x=r\cos(t+\phi)\) y promediando sobre un ciclo, \(\dot r=\tfrac{\mu}{8}r(4-r^2)\): el ciclo es casi una circunferencia de radio \(r=2\) y periodo \(T=2\pi+O(\mu^2)\).</li>
<li><b>Relajación \(\mu\gg1\).</b> En la variable de Liénard \(w=\dot x/\mu+F(x)\), \(F=\tfrac13x^3-x\), el movimiento alterna tramos lentos sobre la cúbica \(w=F(x)\) y saltos rápidos horizontales. El periodo crece linealmente: \(T\approx(3-2\ln2)\,\mu\).</li>
</ul></div>
<div class="block" id="dn7-lab"><h2><span class="ico">◎</span>Visualiza</h2>`+tabs([
 ['fase','Plano de fase',lab2('dn7-cv',sel('dn7-s',[['vdp','van der Pol: ẍ + μ(x² − 1)ẋ + x = 0'],['ej','Ejemplo: ṙ = r(1 − r²(1 + sin²θ)), θ̇ = 1'],['pol','Modelo: ṙ = μ r(1 − r²), θ̇ = 1']])+slider('dn7-mu','μ',0.1,6,0.05,1)+btn('dn7-clr','Borrar órbitas')+pB_play('dn7-play'),'dn7-read',String.raw`Haz clic en el plano para lanzar trayectorias (los puntos se mueven con el flujo). En verde oscuro, el ciclo límite calculado numéricamente. En el ejemplo, las circunferencias punteadas \(r=1/\sqrt2\) y \(r=1\) delimitan la región atrapante.`)],
 ['rel','Relajación y periodo',lab2('dn7-cv2',slider('dn7-mu2','μ',0.1,10,0.1,5),'dn7-read2',String.raw`Arriba: \(x(t)\) en el ciclo límite de van der Pol. Abajo: periodo medido (puntos) frente a \(T\approx2\pi\) (\(\mu\ll1\)), \(T\approx(3-2\ln2)\mu\) (naranja) y la corrección \(+3\alpha\mu^{-1/3}\) (violeta punteado).`)]])+String.raw`</div>
<div class="block" id="dn7-leyes"><h2><span class="ico">§</span>Leyes y fórmulas</h2><div class="laws">
<div class="law"><h3>Teorema de Poincaré-Bendixson</h3><div class="eq">\[ R\ \text{compacta},\ \ \nexists\ \mathbf x^*\in R,\ \ \mathbf x(t)\in R\ \forall t\ge0\ \Rightarrow\ \exists\ \text{órbita cerrada en }R \]</div><p>Válido solo en el plano (usa el teorema de la curva de Jordan).</p></div>
<div class="law"><h3>Criterio de Dulac</h3><div class="eq">\[ \nabla\cdot(g\,\dot{\mathbf x})=\frac{\partial(gf_1)}{\partial x}+\frac{\partial(gf_2)}{\partial y}\ \text{de signo fijo en }R\ \Rightarrow\ \text{sin órbitas cerradas} \]</div><p>Con \(g=1\) es el criterio de Bendixson. Se demuestra con el teorema de Green.</p></div>
<div class="law"><h3>Teorema de Liénard</h3><div class="eq">\[ \ddot x+f(x)\dot x+g(x)=0,\qquad F(x)=\int_0^x f(u)\,du \]</div><p>Con \(g\) impar, \(xg>0\), \(f\) par y \(F\) con un único cero positivo y creciente a partir de él: un único ciclo límite, estable.</p></div>
<div class="law"><h3>Promediado (van der Pol débil)</h3><div class="eq">\[ \dot r=\frac{\mu}{8}\,r\,(4-r^2),\qquad \dot\phi=O(\mu^2) \]</div><p>Amplitud del ciclo \(r^*=2\), independiente de \(\mu\) a primer orden.</p></div>
<div class="law"><h3>Periodo de relajación</h3><div class="eq">\[ T\approx2\int_{1}^{2}\frac{x^2-1}{x}\,dx\cdot\mu=(3-2\ln2)\,\mu\approx1{,}614\,\mu \]</div><p>Se integra el tramo lento \(\dot x=-x/[\mu(x^2-1)]\) sobre la rama \(w=F(x)\) entre \(x=2\) y \(x=1\).</p></div>
<div class="law"><h3>Función de Liapunov</h3><div class="eq">\[ V(\mathbf x)>0,\quad \dot V=\nabla V\cdot\dot{\mathbf x}\lt0\ \ (\mathbf x\ne\mathbf x^*) \]</div><p>Si existe, \(\mathbf x^*\) es globalmente asintóticamente estable y no hay órbitas cerradas.</p></div>
</div></div>
<div class="block" id="dn7-ej"><h2><span class="ico">✎</span>Ejemplo resuelto</h2><div class="example"><p><b>Demuestra que el sistema \(\dot x=x-y-x(x^2+2y^2)\), \(\dot y=x+y-y(x^2+2y^2)\) tiene al menos un ciclo límite y acota su radio.</b></p><ol>
<li>Pasamos a polares. Con \(r\dot r=x\dot x+y\dot y\): \(r\dot r=x^2+y^2-(x^2+y^2)(x^2+2y^2)\), es decir \(\dot r=r\big[1-r^2(1+\sin^2\theta)\big]\).</li>
<li>Para el ángulo, \(r^2\dot\theta=x\dot y-y\dot x=x^2+xy-xy\,Q-xy+y^2+xy\,Q=r^2\) con \(Q=x^2+2y^2\); luego \(\dot\theta=1\). El único punto fijo es el origen (ahí \(\dot r>0\): es un foco inestable).</li>
<li>Borde interior: como \(1\le1+\sin^2\theta\le2\), si \(r\lt1/\sqrt2\) entonces \(r^2(1+\sin^2\theta)\le2r^2\lt1\) y \(\dot r>0\) para todo \(\theta\). Tomamos \(r_1=0{,}7\).</li>
<li>Borde exterior: si \(r>1\), \(r^2(1+\sin^2\theta)\ge r^2>1\) y \(\dot r\lt0\). Tomamos \(r_2=1{,}01\).</li>
<li>El anillo \(R=\{0{,}7\le r\le1{,}01\}\) es atrapante y no contiene puntos fijos. Por Poincaré-Bendixson contiene una órbita cerrada, que es un ciclo límite (las trayectorias de ambos bordes se acercan a ella).</li>
<li>Verificación numérica (RK4, \(h=0{,}01\)): partiendo de \((0{,}1;0)\) y de \((1{,}5;0)\), ambas trayectorias convergen a la misma curva, con \(r\) oscilando entre \(0{,}73\) y \(0{,}93\), y periodo \(T=2\pi\) (porque \(\dot\theta=1\)).</li>
</ol><p style="margin:.6em 0 0">El ciclo límite existe y está en \(1/\sqrt2\lt r\lt1\). No es una circunferencia: se achata en la dirección \(y\), donde el término cúbico frena más.</p></div></div>
<div class="pager"><a href="#dn-conservativos"><small>← Anterior</small>Sistemas conservativos, reversibles, el péndulo e índice</a><a class="next" href="#dn-hopf"><small>Siguiente →</small>Bifurcación de Hopf supercrítica y subcrítica</a></div>
<p class="note">Contenido de referencia: Strogatz, <i>Nonlinear Dynamics and Chaos</i>, 3.ª ed., §7.1–7.6; Guckenheimer y Holmes, <i>Nonlinear Oscillations</i>, §1.8. Redacción y simulaciones propias.</p></section>`);

LABS['dn-ciclos-limite']=function(sec){
  const cv=$('#dn7-cv',sec),rd=$('#dn7-read',sec),ss=$('#dn7-s',sec);cv.classList.add('dx-click');
  let play=true,A=null,orbs=[],cyc=null;
  const SY={
    vdp:{F:m=>(x,y)=>[y,m*(1-x*x)*y-x],xr:[-4.5,4.5],yr:[-6,6],xl:'x',yl:'ẋ',seeds:[[0.1,0],[4,4],[-4,-5]],x0:[2,0]},
    ej:{F:()=>(x,y)=>{const q=x*x+2*y*y;return [x-y-x*q,x+y-y*q];},xr:[-1.7,1.7],yr:[-1.2,1.2],xl:'x',yl:'y',seeds:[[0.05,0],[1.5,1]],x0:[0.8,0]},
    pol:{F:m=>(x,y)=>{const r2=x*x+y*y,g=m*(1-r2);return [g*x-y,g*y+x];},xr:[-2,2],yr:[-1.5,1.5],xl:'x',yl:'y',seeds:[[0.05,0],[1.8,1.2]],x0:[1,0]}};
  const gm=sl(sec,'dn7-mu',v=>nf(v,2),()=>{reset();draw1();});
  function Fc(){return SY[ss.value].F(gm());}
  function mk(p){return {p:p.slice(),tr:[p.slice()]};}
  function reset(){const S=SY[ss.value];orbs=S.seeds.map(mk);const c=pB_cycle(Fc(),S.x0,ss.value==='vdp'?40:30,0.005,200);cyc=c;}
  ss.addEventListener('change',()=>{reset();draw1();});$('#dn7-clr',sec).addEventListener('click',()=>{orbs=[];draw1();});
  pB_toggle(sec,'dn7-play',()=>play,v=>play=v);
  clickPos(cv,(px,py)=>{if(A&&inA(A,px,py)){orbs.push(mk(invA(A,px,py)));if(orbs.length>10)orbs.shift();draw1();}});
  reset();
  function adv(dt){const F=Fc(),f=(u,o)=>{const v=F(u[0],u[1]);o[0]=v[0];o[1]=v[1];};const n=Math.max(1,Math.ceil(dt/0.01)),h=dt/n;
    orbs.forEach(o=>{for(let i=0;i<n;i++)pB_step(f,o.p,h,2);if(!isFinite(o.p[0])||Math.abs(o.p[0])>1e3){o.dead=true;return;}o.tr.push(o.p.slice());if(o.tr.length>500)o.tr.shift();});
    orbs=orbs.filter(o=>!o.dead);}
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.7,440,280),S=SY[ss.value];
    A=axes(ctx,{l:40,t:10,w:w-50,h:h-34,xr:S.xr,yr:S.yr,xl:S.xl,yl:S.yl});vecField(ctx,A,Fc(),22,15);
    if(ss.value==='ej'){[1/Math.SQRT2,1].forEach(r=>{const p=[];for(let k=0;k<=120;k++)p.push([r*Math.cos(k/120*TAU),r*Math.sin(k/120*TAU)]);path(ctx,A,p,K.f,1.8,[6,4]);});}
    if(cyc&&cyc.pts.length)path(ctx,A,cyc.pts.concat([cyc.pts[0]]),K.t,4);
    orbs.forEach((o,i)=>{pB_trail(ctx,A,o.tr,PAL[(i+1)%PAL.length]);dot(ctx,A.X(o.p[0]),A.Y(o.p[1]),5,PAL[(i+1)%PAL.length],'#fff');});
    dot(ctx,A.X(0),A.Y(0),6,'#fff',K.ink);
    let s=row('sistema',ss.options[ss.selectedIndex].text.split(':')[0]);
    if(ss.value!=='ej')s+=row('μ',nf(gm(),2));
    s+=row('punto fijo','(0, 0) · '+(ss.value==='vdp'?pB_classify(gm(),1):'foco inestable'))+sep;
    if(cyc&&isFinite(cyc.T))s+=row('periodo T',nf(cyc.T,3))+row('amplitud máx |x|',nf(cyc.amp,3));
    if(ss.value==='vdp')s+=rowT(gm()<0.6?'μ pequeño: ciclo casi circular de radio 2 y T ≈ 2π.':gm()<2?'μ intermedio: el ciclo se deforma, pero la amplitud sigue cerca de 2.':'μ grande: tramos lentos y saltos rápidos (oscilación de relajación).');
    else if(ss.value==='ej')s+=rowT('El ciclo vive en el anillo atrapante 1/√2 &lt; r &lt; 1, como garantiza Poincaré-Bendixson.');
    else s+=rowT('El flujo radial ṙ = μr(1 − r²) tiene r* = 1 estable: autovalor −2μ. μ solo cambia la rapidez de atracción.');
    rd.innerHTML=s;}
  /* ---- relajación ---- */
  const cv2=$('#dn7-cv2',sec),rd2=$('#dn7-read2',sec);let TT=null;
  const gm2=sl(sec,'dn7-mu2',v=>nf(v,1),()=>draw2());
  function table(){if(TT)return TT;TT=[];for(let m=0.25;m<=10.01;m+=0.5){const c=pB_cycle((x,y)=>[y,m*(1-x*x)*y-x],[2,0],30+3*m,0.004,400);TT.push([m,c.T]);}return TT;}
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.8,480,320),m=gm2(),hh=Math.floor(h*0.5);
    const F=(x,y)=>[y,m*(1-x*x)*y-x],f=(u,o)=>{const v=F(u[0],u[1]);o[0]=v[0];o[1]=v[1];};
    const y=[2,0];for(let t=0;t<30;t+=0.005)pB_step(f,y,0.005,2);const pts=[[0,y[0]]];const tmax=Math.max(25,3.2*(1.614*m+7*Math.pow(m,-1/3)));
    for(let t=0;t<tmax;){for(let k=0;k<10;k++){pB_step(f,y,0.005,2);t+=0.005;}pts.push([t,y[0]]);}
    const B=axes(ctx,{l:36,t:8,w:w-46,h:hh-30,xr:[0,tmax],yr:[-2.6,2.6],xl:'t',yl:'x(t)'});path(ctx,B,pts,K.t,2.4);
    const T=table(),c=pB_cycle(F,[2,0],30+3*m,0.004,400);
    const C2=axes(ctx,{l:36,t:hh+6,w:w-46,h:h-hh-30,xr:[0,10],yr:[0,22],xl:'μ',yl:'T'});
    ctx.save();ctx.strokeStyle=K.mut;ctx.setLineDash([5,4]);ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(C2.X(0),C2.Y(TAU));ctx.lineTo(C2.X(10),C2.Y(TAU));ctx.stroke();ctx.restore();
    curve(ctx,C2,x=>(3-2*Math.log(2))*x,0,10,K.b,2,[6,4]);curve(ctx,C2,x=>(3-2*Math.log(2))*x+7.014*Math.pow(x,-1/3),1.5,10,K.d,1.6,[2,3]);
    T.forEach(p=>dot(ctx,C2.X(p[0]),C2.Y(p[1]),3.5,K.a));dot(ctx,C2.X(m),C2.Y(c.T),7,'#fff',K.t);
    label(ctx,'2π',C2.X(0.3),C2.Y(TAU)-9,K.mut);label(ctx,'(3 − 2 ln 2)μ',C2.X(7.2),C2.Y(1.614*7.2)+14,K.b);
    rd2.innerHTML=row('μ',nf(m,1))+row('T medido',nf(c.T,3))+row('2π',nf(TAU,3))+row('(3 − 2 ln 2)μ',nf(1.6137*m,3))+row('+ 7,014 μ^(−1/3)',nf(1.6137*m+7.014*Math.pow(m,-1/3),3))+row('amplitud',nf(c.amp,3))+sep+
      rowT('La amplitud se queda cerca de 2 para todo μ. El periodo pasa de 2π a crecer linealmente con μ; la diferencia a μ moderado la explica la corrección 3α μ^(−1/3) (α ≈ 2,338, primer cero de la función de Airy).');}
  return {draw(){draw1();draw2();},tick(dt){if(play&&vis(cv)&&pB_on(sec,'fase')){adv(dt*(ss.value==='vdp'?2:1.2));draw1();}}};
};

/* ================= 8 · HOPF ================= */
V.push(String.raw`<section class="view theme-aa" data-view="dn-hopf">
<div class="eyebrow">Dinámica no lineal y caos · Unidad IV · Bifurcaciones en el plano</div><h1>Bifurcación de Hopf supercrítica y subcrítica</h1><p class="lead">Cuando un foco estable pierde su estabilidad porque un par de autovalores complejos cruza el eje imaginario, nace (o muere) un ciclo límite. Así empiezan a oscilar los láseres, las reacciones químicas, las alas que flamean y muchos ritmos biológicos.</p>
<div class="toc"><a href="#dn8-res" data-scroll>Resumen</a><a href="#dn8-lab" data-scroll>Visualiza</a><a href="#dn8-leyes" data-scroll>Leyes y fórmulas</a><a href="#dn8-ej" data-scroll>Ejemplo</a></div>
<div class="block" id="dn8-res"><h2><span class="ico">≡</span>Resumen</h2><ul class="keypoints">
<li><b>Mecanismo.</b> En 2D, un punto fijo pierde estabilidad de dos maneras: un autovalor real pasa por 0 (silla-nodo, transcrítica, tridente) o un par complejo \(\lambda=\alpha(\mu)\pm i\omega(\mu)\) cruza el eje imaginario. El segundo caso es la bifurcación de Hopf: en \(\mu_c\) se tiene \(\tau=0\) y \(\Delta>0\).</li>
<li><b>Hopf supercrítica.</b> Forma normal \(\dot r=\mu r-r^3\), \(\dot\theta=\omega+br^2\). Para \(\mu\lt0\) el origen es un foco estable; para \(\mu>0\) es inestable y aparece un ciclo límite estable de radio \(r=\sqrt\mu\). La transición es suave y reversible.</li>
<li><b>Escalas.</b> Cerca del umbral, la amplitud crece como \(\sqrt{\mu-\mu_c}\) y la frecuencia tiende a \(\omega=\operatorname{Im}\lambda\) en \(\mu_c\): el periodo inicial es \(T\approx2\pi/\omega\), finito. Con \(b\ne0\) la frecuencia depende de la amplitud.</li>
<li><b>Hopf subcrítica.</b> \(\dot r=\mu r+r^3-r^5\). Un ciclo inestable rodea al foco estable y se encoge hasta matarlo en \(\mu=0\); entonces el sistema salta a un ciclo grande lejano. Hay biestabilidad e histéresis en \(-\tfrac14\lt\mu\lt0\): al bajar \(\mu\) el ciclo grande sobrevive hasta la silla-nodo de ciclos en \(\mu=-\tfrac14\).</li>
<li><b>Cómo distinguirlas.</b> La linealización no basta: lo decide el signo del primer coeficiente de Liapunov \(a\) (el término cúbico de la forma normal \(\dot r=\mu r+ar^3\)). \(a\lt0\): supercrítica; \(a>0\): subcrítica. En la práctica se integra numéricamente a cada lado de \(\mu_c\).</li>
<li><b>Hopf degenerada.</b> Si los términos no lineales no actúan (\(a=0\) y siguientes), como en el péndulo amortiguado \(\ddot x+\mu\dot x+\sin x=0\) al cambiar el signo de \(\mu\), en \(\mu_c\) hay un centro no lineal y no nace ningún ciclo aislado.</li>
<li><b>Oscilaciones químicas.</b> En el Brusselator \(\dot x=1-(b+1)x+ax^2y\), \(\dot y=bx-ax^2y\) el punto fijo \((1,b/a)\) tiene \(\tau=b-1-a\), \(\Delta=a\): Hopf (supercrítica) en \(b_c=1+a\) con frecuencia \(\omega=\sqrt a\). Es el modelo de la reacción de Belousov-Zhabotinsky.</li>
</ul></div>
<div class="block" id="dn8-lab"><h2><span class="ico">◎</span>Visualiza</h2>`+tabs([
 ['nf','Forma normal',lab2('dn8-cv',seg('dn8-t','t',[['sup','supercrítica'],['sub','subcrítica']])+slider('dn8-mu','μ',-0.5,0.5,0.01,-0.1)+slider('dn8-b','b (frecuencia–amplitud)',-2,2,0.1,0)+pB_play('dn8-play'),'dn8-read',String.raw`Izquierda: plano de fase de \(\dot r=\mu r+ar^3-cr^5\), \(\dot\theta=1+br^2\); dos partículas, una cerca del origen y otra lejos. Derecha: diagrama de bifurcación \(r^*(\mu)\) (línea continua estable, discontinua inestable). En el caso subcrítico, sube y baja \(\mu\) para ver la histéresis.`)],
 ['bru','Brusselator',lab2('dn8-cv2',slider('dn8-a','a',0.5,3,0.05,1)+slider('dn8-bb','b',0.5,4.5,0.05,2.4)+btn('dn8-rs','Reiniciar'),'dn8-read2',String.raw`Plano \((x,y)\) con las nulclinas (\(\dot x=0\) en azul, \(\dot y=0\) en naranja) y una trayectoria que parte cerca del punto fijo. Debajo, \(x(t)\). La oscilación aparece cuando \(b>1+a\).`)]])+String.raw`</div>
<div class="block" id="dn8-leyes"><h2><span class="ico">§</span>Leyes y fórmulas</h2><div class="laws">
<div class="law"><h3>Condición de Hopf</h3><div class="eq">\[ \tau(\mu_c)=0,\quad \Delta(\mu_c)>0,\quad \frac{d\alpha}{d\mu}\Big|_{\mu_c}\ne0 \]</div><p>Con \(\lambda=\alpha\pm i\omega\), \(\alpha=\tau/2\), \(\omega=\sqrt{\Delta}\) en el umbral.</p></div>
<div class="law"><h3>Forma normal supercrítica</h3><div class="eq">\[ \dot r=\mu r-r^3,\qquad \dot\theta=\omega+br^2,\qquad r^*=\sqrt\mu \]</div><p>Ciclo estable: \(\tfrac{d}{dr}(\mu r-r^3)\big|_{\sqrt\mu}=-2\mu\lt0\).</p></div>
<div class="law"><h3>Forma normal subcrítica</h3><div class="eq">\[ \dot r=\mu r+r^3-r^5,\qquad r^{*2}_\pm=\frac{1\pm\sqrt{1+4\mu}}{2} \]</div><p>Silla-nodo de ciclos en \(\mu=-\tfrac14\), \(r^*=1/\sqrt2\).</p></div>
<div class="law"><h3>Forma normal compleja</h3><div class="eq">\[ \dot z=(\mu+i\omega)z+(a+ib)|z|^2z \]</div><p>Con \(z=re^{i\theta}\) da \(\dot r=\mu r+ar^3\), \(\dot\theta=\omega+br^2\).</p></div>
<div class="law"><h3>Brusselator</h3><div class="eq">\[ J=\begin{pmatrix}b-1&a\\-b&-a\end{pmatrix},\quad \tau=b-1-a,\quad \Delta=a \]</div><p>Hopf en \(b_c=1+a\), con \(\omega_c=\sqrt a\) y \(T_c=2\pi/\sqrt a\).</p></div>
<div class="law"><h3>Amplitud cerca del umbral</h3><div class="eq">\[ r\propto\sqrt{\mu-\mu_c},\qquad T\to\frac{2\pi}{\operatorname{Im}\lambda(\mu_c)} \]</div><p>Contrasta con las bifurcaciones globales, donde el periodo diverge o la amplitud nace finita.</p></div>
</div></div>
<div class="block" id="dn8-ej"><h2><span class="ico">✎</span>Ejemplo resuelto</h2><div class="example"><p><b>Para el Brusselator con \(a=1\), encuentra el umbral de Hopf, el periodo de las oscilaciones recién nacidas y comprueba numéricamente que la bifurcación es supercrítica.</b></p><ol>
<li>Punto fijo: \(\dot y=0\Rightarrow ax^2y=bx\); sustituyendo en \(\dot x=0\): \(1-(b+1)x+bx=0\Rightarrow x^*=1\), \(y^*=b/a=b\).</li>
<li>Jacobiano en \((1,b)\): \(\partial_x\dot x=-(b+1)+2axy=b-1\), \(\partial_y\dot x=ax^2=1\), \(\partial_x\dot y=b-2axy=-b\), \(\partial_y\dot y=-ax^2=-1\). Así \(\tau=b-2\), \(\Delta=-(b-1)+b=1>0\).</li>
<li>Como \(\Delta>0\) siempre, el punto fijo es foco o nodo; cambia de estable a inestable cuando \(\tau=0\): \(b_c=2\). Además \(d\tau/db=1\ne0\): condición de transversalidad.</li>
<li>Frecuencia en el umbral: \(\lambda=\pm i\sqrt\Delta=\pm i\), así que \(T_c=2\pi\approx6{,}28\).</li>
<li>Numérico (RK4, \(h=0{,}005\), desde \((1{,}05;2{,}05)\)): con \(b=2{,}05\) la trayectoria se estabiliza en un ciclo de amplitud (pico a pico) \(\Delta x\approx0{,}53\) y \(T\approx6{,}30\); con \(b=2{,}2\), \(\Delta x\approx1{,}13\) (la razón \(1{,}13/0{,}53\approx2{,}1\approx\sqrt{0{,}2/0{,}05}=2\), escala \(\sqrt{b-b_c}\)). Con \(b=1{,}95\) la trayectoria vuelve al punto fijo.</li>
</ol><p style="margin:.6em 0 0">Amplitud que nace desde cero como \(\sqrt{b-b_c}\), periodo finito \(2\pi/\sqrt a\) y sin histéresis: es una Hopf supercrítica.</p></div></div>
<div class="pager"><a href="#dn-ciclos-limite"><small>← Anterior</small>Ciclos límite, Poincaré-Bendixson y van der Pol</a><a class="next" href="#dn-globales"><small>Siguiente →</small>Bifurcaciones globales de ciclos y osciladores acoplados</a></div>
<p class="note">Contenido de referencia: Strogatz, <i>Nonlinear Dynamics and Chaos</i>, 3.ª ed., §8.1–8.3; Kuznetsov, <i>Elements of Applied Bifurcation Theory</i>, cap. 3. Redacción y simulaciones propias.</p></section>`);

LABS['dn-hopf']=function(sec){
  const cv=$('#dn8-cv',sec),rd=$('#dn8-read',sec);let play=true;
  const gt=segm(sec,'dn8-t','t',()=>{reset();draw1();}),gm=sl(sec,'dn8-mu',v=>nf(v,2),()=>draw1()),gb=sl(sec,'dn8-b',v=>nf(v,1),()=>draw1());
  pB_toggle(sec,'dn8-play',()=>play,v=>play=v);
  let P=[];function reset(){P=[{p:[0.05,0],tr:[]},{p:[gt()==='sub'?1.3:1.1,0],tr:[]}];}reset();
  const rdot=(r,m)=>gt()==='sup'?m*r-r*r*r:m*r+r*r*r-Math.pow(r,5);
  const F=(x,y)=>{const r=Math.hypot(x,y);if(r<1e-12)return [0,0];const m=gm(),rd_=rdot(r,m),th=1+gb()*r*r;return [rd_*x/r-th*y,rd_*y/r+th*x];};
  function cyc(m){const o=[];if(gt()==='sup'){if(m>0)o.push([Math.sqrt(m),true]);}else{const D=1+4*m;if(D>=0){const p=(1+Math.sqrt(D))/2,q=(1-Math.sqrt(D))/2;o.push([Math.sqrt(p),true]);if(q>0)o.push([Math.sqrt(q),false]);}}return o;}
  function adv(dt){const n=Math.ceil(dt/0.01),h=dt/n,f=(u,o)=>{const v=F(u[0],u[1]);o[0]=v[0];o[1]=v[1];};
    P.forEach(o=>{for(let i=0;i<n;i++)pB_step(f,o.p,h,2);if(Math.hypot(o.p[0],o.p[1])<1e-3){const a=Math.atan2(o.p[1],o.p[0]);o.p=[1e-3*Math.cos(a),1e-3*Math.sin(a)];}o.tr.push(o.p.slice());if(o.tr.length>400)o.tr.shift();});}
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.55,400,260),m=gm(),hw=Math.floor(w*0.5);
    const A=axes(ctx,{l:30,t:10,w:Math.min(hw-40,h-34),h:h-34,xr:[-1.6,1.6],yr:[-1.6,1.6],xl:'x',yl:'y'});vecField(ctx,A,F,14,14);
    cyc(m).forEach(([r,st])=>{const p=[];for(let k=0;k<=100;k++)p.push([r*Math.cos(k/100*TAU),r*Math.sin(k/100*TAU)]);path(ctx,A,p,st?K.t:K.w,st?3.5:2.2,st?null:[6,4]);});
    P.forEach((o,i)=>{pB_trail(ctx,A,o.tr,i?K.b:K.a);dot(ctx,A.X(o.p[0]),A.Y(o.p[1]),5,i?K.b:K.a,'#fff');});
    const st0=m<0;dot(ctx,A.X(0),A.Y(0),6,st0?K.ink:'#fff',K.ink);
    const B=axes(ctx,{l:hw+34,t:10,w:w-hw-44,h:h-34,xr:[-0.5,0.5],yr:[0,1.4],xl:'μ',yl:'r*'});
    ctx.save();ctx.strokeStyle=K.ink;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(B.X(-0.5),B.Y(0));ctx.lineTo(B.X(0),B.Y(0));ctx.stroke();ctx.setLineDash([6,4]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(B.X(0),B.Y(0));ctx.lineTo(B.X(0.5),B.Y(0));ctx.stroke();ctx.restore();
    if(gt()==='sup')curve(ctx,B,x=>x>=0?Math.sqrt(x):NaN,0,0.5,K.t,3);
    else{curve(ctx,B,x=>{const D=1+4*x;return D>=0?Math.sqrt((1+Math.sqrt(D))/2):NaN;},-0.25,0.5,K.t,3);curve(ctx,B,x=>{const D=1+4*x,q=(1-Math.sqrt(D))/2;return D>=0&&q>0?Math.sqrt(q):NaN;},-0.25,0,K.w,2,[6,4]);}
    ctx.save();ctx.strokeStyle=K.f;ctx.lineWidth=1.5;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(B.X(m),B.o.t);ctx.lineTo(B.X(m),B.o.t+B.o.h);ctx.stroke();ctx.restore();
    P.forEach((o,i)=>dot(ctx,B.X(m),B.Y(Math.min(1.4,Math.hypot(o.p[0],o.p[1]))),5,i?K.b:K.a,'#fff'));
    const C=cyc(m);let s=row('μ',nf(m,2))+row('autovalores del origen',nf(m,2)+' ± i')+row('origen',m<0?'foco estable':m>0?'foco inestable':'foco débil (no lineal)')+sep;
    C.forEach(([r,st])=>{s+=row(st?'ciclo estable':'ciclo inestable','r = '+nf(r,3)+' · T = '+nf(TAU/(1+gb()*r*r),3));});if(!C.length)s+=rowT('Sin ciclos límite.');
    s+=sep+rowT(gt()==='sup'?'Supercrítica: la amplitud nace desde cero como √μ.':(m>-0.25&&m<0?'Biestabilidad: el resultado depende de dónde empieces. Mira las dos partículas.':m>=0?'El origen ya es inestable: todo salta al ciclo grande (r ≈ 1).':'Solo el origen es atractor.'));
    rd.innerHTML=s;}
  /* ---- Brusselator ---- */
  const cv2=$('#dn8-cv2',sec),rd2=$('#dn8-read2',sec);let Bp=null,Bt=[],Bx=[],tt=0;
  const ga=sl(sec,'dn8-a',v=>nf(v,2),()=>rs()),gbb=sl(sec,'dn8-bb',v=>nf(v,2),()=>rs());
  function rs(){const a=ga(),b=gbb();Bp=[1.05,b/a+0.05];Bt=[];Bx=[];tt=0;draw2();}
  $('#dn8-rs',sec).addEventListener('click',rs);
  const FB=(x,y)=>{const a=ga(),b=gbb();return [1-(b+1)*x+a*x*x*y,b*x-a*x*x*y];};
  function adv2(dt){if(!Bp)rs();const n=Math.ceil(dt/0.005),h=dt/n,f=(u,o)=>{const v=FB(u[0],u[1]);o[0]=v[0];o[1]=v[1];};
    for(let i=0;i<n;i++){pB_step(f,Bp,h,2);tt+=h;}Bt.push(Bp.slice());if(Bt.length>900)Bt.shift();Bx.push([tt,Bp[0]]);if(Bx.length>900)Bx.shift();}
  function draw2(){
    if(!vis(cv2))return;if(!Bp)rs();const {ctx,w,h}=fit(cv2,.85,500,320),a=ga(),b=gbb(),hh=Math.floor(h*0.64);
    const ym=Math.max(4,b/a*2.2+0.5),A=axes(ctx,{l:36,t:8,w:w-46,h:hh-30,xr:[0,4],yr:[0,ym],xl:'x',yl:'y'});
    vecField(ctx,A,FB,20,12);
    curve(ctx,A,x=>((b+1)*x-1)/(a*x*x),0.05,4,K.a,2);curve(ctx,A,x=>b/(a*x),0.05,4,K.b,2);
    pB_trail(ctx,A,Bt,K.t,2.2);dot(ctx,A.X(Bp[0]),A.Y(Bp[1]),5,K.t,'#fff');
    const tau=b-1-a;dot(ctx,A.X(1),A.Y(b/a),6,tau<0?K.ink:'#fff',K.ink);
    const t0=Bx.length?Bx[0][0]:0,B=axes(ctx,{l:36,t:hh+6,w:w-46,h:h-hh-30,xr:[t0,t0+Math.max(20,(Bx.length?Bx[Bx.length-1][0]-t0:0))],yr:[0,4],xl:'t',yl:'x(t)'});path(ctx,B,Bx,K.t,2);
    let amp=NaN,mx=-1e9,mn=1e9;Bx.slice(-400).forEach(p=>{mx=Math.max(mx,p[1]);mn=Math.min(mn,p[1]);});if(Bx.length>300)amp=mx-mn;
    rd2.innerHTML=row('punto fijo','(1, '+nf(b/a,2)+')')+row('τ = b − 1 − a',nf(tau,2))+row('Δ = a',nf(a,2))+row('λ',pB_eig(tau,a))+row('b_c = 1 + a',nf(1+a,2))+row('T_c = 2π/√a',nf(TAU/Math.sqrt(a),2))+
      (isFinite(amp)?row('Δx (pico a pico)',nf(amp,2)):'')+sep+rowT(tau<0?'b &lt; 1 + a: foco estable, la reacción llega al equilibrio.':'b &gt; 1 + a: el equilibrio es inestable y la reacción oscila en un ciclo límite.');}
  return {draw(){draw1();draw2();},tick(dt){
    if(play&&vis(cv)&&pB_on(sec,'nf')){adv(dt*2.5);draw1();}
    if(vis(cv2)&&pB_on(sec,'bru')){adv2(dt*3);draw2();}}};
};

/* ================= 9 · BIFURCACIONES GLOBALES Y OSCILADORES ACOPLADOS ================= */
V.push(String.raw`<section class="view theme-aa" data-view="dn-globales">
<div class="eyebrow">Dinámica no lineal y caos · Unidad IV · Bifurcaciones en el plano</div><h1>Bifurcaciones globales de ciclos y osciladores acoplados</h1><p class="lead">No todos los ciclos nacen en una Hopf. Algunos aparecen o desaparecen por eventos que involucran regiones grandes del plano de fase: dos ciclos que chocan, un punto fijo que se forma sobre la órbita o un ciclo que toca una silla. Y cuando dos osciladores interactúan, la dinámica vive sobre un toro.</p>
<div class="toc"><a href="#dn9-res" data-scroll>Resumen</a><a href="#dn9-lab" data-scroll>Visualiza</a><a href="#dn9-leyes" data-scroll>Leyes y fórmulas</a><a href="#dn9-ej" data-scroll>Ejemplo</a></div>
<div class="block" id="dn9-res"><h2><span class="ico">≡</span>Resumen</h2><ul class="keypoints">
<li><b>Silla-nodo de ciclos.</b> Un ciclo estable y otro inestable se acercan, se funden y desaparecen. En la forma normal \(\dot r=\mu r+r^3-r^5\) ocurre en \(\mu=-\tfrac14\). El ciclo nace con amplitud <i>finita</i> y periodo finito: no hay aviso previo en la linealización.</li>
<li><b>Bifurcación de periodo infinito.</b> \(\dot r=r(1-r^2)\), \(\dot\theta=\mu-\sin\theta\). Para \(\mu>1\) hay un ciclo en \(r=1\); al bajar \(\mu\) a 1 aparece sobre él un punto fijo (silla-nodo en el círculo) y el periodo diverge como \(T=2\pi/\sqrt{\mu^2-1}\sim(\mu-1)^{-1/2}\). Es la misma física que el cuello de botella de §4.3.</li>
<li><b>Bifurcación homoclínica.</b> Un ciclo crece hasta tocar una silla y se convierte en una órbita homoclínica (sale y vuelve a la misma silla). Al pasar el umbral desaparece. El periodo diverge más lentamente, como \(T\sim-\tfrac{1}{\lambda_u}\ln(\mu_c-\mu)\), porque la órbita pasa cada vez más tiempo cerca de la silla.</li>
<li><b>Tabla de escalas.</b> Hopf: amplitud \(O(\sqrt{\mu-\mu_c})\), periodo finito. Silla-nodo de ciclos: amplitud y periodo finitos. Periodo infinito: amplitud finita, \(T\sim(\mu-\mu_c)^{-1/2}\). Homoclínica: amplitud finita, \(T\sim\ln|\mu-\mu_c|\).</li>
<li><b>Flujo en el toro.</b> Dos osciladores \(\dot\theta_1=\omega_1\), \(\dot\theta_2=\omega_2\) viven en \(T^2=S^1\times S^1\), el cuadrado con lados opuestos identificados. Si \(\omega_1/\omega_2=p/q\) es racional, toda trayectoria es cerrada (un nudo toroidal \(p:q\)); si es irracional, la trayectoria es densa en el toro: <i>cuasiperiodicidad</i>.</li>
<li><b>Acoplamiento y enganche de fase.</b> Con \(\dot\theta_1=\omega_1+K_1\sin(\theta_2-\theta_1)\), \(\dot\theta_2=\omega_2+K_2\sin(\theta_1-\theta_2)\), la diferencia \(\phi=\theta_1-\theta_2\) obedece \(\dot\phi=\Delta\omega-(K_1+K_2)\sin\phi\). Si \(|\Delta\omega|\le K_1+K_2\), \(\phi\) se fija: los osciladores se sincronizan con frecuencia común \(\omega^*=(K_2\omega_1+K_1\omega_2)/(K_1+K_2)\).</li>
<li><b>Deriva de fase.</b> Si \(|\Delta\omega|>K_1+K_2\), \(\phi\) gira con periodo \(T_\phi=2\pi/\sqrt{\Delta\omega^2-(K_1+K_2)^2}\), que diverge en el umbral: la pérdida de sincronización es una bifurcación de periodo infinito sobre el toro.</li>
</ul></div>
<div class="block" id="dn9-lab"><h2><span class="ico">◎</span>Visualiza</h2>`+tabs([
 ['glob','Bifurcaciones globales',lab2('dn9-cv',sel('dn9-s',[['inf','Periodo infinito: ṙ = r(1 − r²), θ̇ = μ − sin θ'],['hom','Homoclínica: ẋ = y, ẏ = μy + x − x² + xy']])+slider('dn9-mu','μ',0.7,2,0.005,1.3)+btn('dn9-clr','Borrar órbitas')+pB_play('dn9-play'),'dn9-read',String.raw`Haz clic para lanzar trayectorias. En periodo infinito, baja \(\mu\) hacia 1 y mira cómo la partícula se frena cerca de \(\theta=\pi/2\). En la homoclínica, el ciclo (en verde) crece hasta tocar la silla del origen en \(\mu_c\approx-0{,}8645\).`)],
 ['toro','Osciladores en el toro',lab2('dn9-cv2',slider('dn9-w1','ω₁',0.5,2,0.01,1.2)+slider('dn9-w2','ω₂',0.5,2,0.01,1)+slider('dn9-K','K₁ = K₂ = K',0,0.4,0.005,0.05)+btn('dn9-rs','Reiniciar'),'dn9-read2',String.raw`Izquierda: la trayectoria en el cuadrado \([0,2\pi)^2\) (el toro desplegado). Derecha: la diferencia de fase \(\phi(t)\) módulo \(2\pi\). Con \(2K\ge|\omega_1-\omega_2|\) la trayectoria se vuelve una recta de pendiente 1: enganche de fase.`)]])+String.raw`</div>
<div class="block" id="dn9-leyes"><h2><span class="ico">§</span>Leyes y fórmulas</h2><div class="laws">
<div class="law"><h3>Periodo infinito</h3><div class="eq">\[ T=\int_0^{2\pi}\frac{d\theta}{\mu-\sin\theta}=\frac{2\pi}{\sqrt{\mu^2-1}}\quad(\mu>1) \]</div><p>Cerca del umbral \(T\approx\pi\sqrt2\,(\mu-1)^{-1/2}\).</p></div>
<div class="law"><h3>Escala homoclínica</h3><div class="eq">\[ T\approx-\frac{1}{\lambda_u}\ln(\mu_c-\mu)+\text{cte} \]</div><p>\(\lambda_u>0\): autovalor inestable de la silla.</p></div>
<div class="law"><h3>Silla-nodo de ciclos</h3><div class="eq">\[ \dot r=\mu r+r^3-r^5:\quad \mu_c=-\tfrac14,\ \ r_c=\tfrac{1}{\sqrt2} \]</div><p>Los dos ciclos \(r_\pm\) coinciden cuando \(1+4\mu=0\).</p></div>
<div class="law"><h3>Diferencia de fase</h3><div class="eq">\[ \dot\phi=\omega_1-\omega_2-(K_1+K_2)\sin\phi \]</div><p>Una ecuación de Adler: el mismo flujo en el círculo de §4.3.</p></div>
<div class="law"><h3>Enganche de fase</h3><div class="eq">\[ |\omega_1-\omega_2|\le K_1+K_2,\qquad \sin\phi^*=\frac{\omega_1-\omega_2}{K_1+K_2} \]</div><p>Frecuencia común \(\omega^*=\dfrac{K_2\omega_1+K_1\omega_2}{K_1+K_2}\).</p></div>
<div class="law"><h3>Periodo de deriva (batido)</h3><div class="eq">\[ T_\phi=\frac{2\pi}{\sqrt{(\omega_1-\omega_2)^2-(K_1+K_2)^2}} \]</div><p>Número de rotación \(\rho=\langle\dot\theta_1\rangle/\langle\dot\theta_2\rangle\): racional si hay enganche.</p></div>
</div></div>
<div class="block" id="dn9-ej"><h2><span class="ico">✎</span>Ejemplo resuelto</h2><div class="example"><p><b>Dos osciladores con \(\omega_1=1{,}2\), \(\omega_2=1\) y acoplamiento simétrico \(K_1=K_2=K\). (a) Halla el acoplamiento mínimo para que se sincronicen. (b) Con \(K=0{,}15\), calcula el desfase y la frecuencia común. (c) Con \(K=0{,}05\), calcula el periodo de los batidos.</b></p><ol>
<li>La diferencia de fase obedece \(\dot\phi=0{,}2-2K\sin\phi\). Hay puntos fijos si y solo si \(2K\ge0{,}2\): \(K_{\min}=0{,}1\).</li>
<li>(b) Con \(K=0{,}15\): \(\sin\phi^*=0{,}2/0{,}3=2/3\). Hay dos soluciones; la estable es la que tiene \(\tfrac{d\dot\phi}{d\phi}=-2K\cos\phi^*\lt0\), es decir \(\cos\phi^*>0\): \(\phi^*=\arcsin(2/3)\approx0{,}730\) rad \(\approx41{,}8^\circ\).</li>
<li>Frecuencia común: \(\dot\theta_1=\omega_1+K\sin(\theta_2-\theta_1)=1{,}2-0{,}15\cdot\tfrac23=1{,}1\). Coincide con \(\omega^*=(\omega_1+\omega_2)/2\), como debe ser para acoplamiento simétrico.</li>
<li>(c) Con \(K=0{,}05\): \(2K=0{,}1\lt0{,}2\), no hay enganche. \(T_\phi=2\pi/\sqrt{0{,}2^2-0{,}1^2}=2\pi/0{,}1732\approx36{,}3\).</li>
<li>Sin acoplamiento la fase relativa giraría con periodo \(2\pi/0{,}2\approx31{,}4\): el acoplamiento alarga los batidos. Numéricamente (simulador, pestaña del toro) se mide \(T_\phi\approx36{,}3\).</li>
</ol><p style="margin:.6em 0 0">\(K_{\min}=0{,}1\); con \(K=0{,}15\), \(\phi^*\approx41{,}8^\circ\) y \(\omega^*=1{,}1\); con \(K=0{,}05\), batidos de periodo \(\approx36{,}3\).</p></div></div>
<div class="pager"><a href="#dn-hopf"><small>← Anterior</small>Bifurcación de Hopf supercrítica y subcrítica</a><a class="next" href="#dn-poincare"><small>Siguiente →</small>Mapa de Poincaré y estabilidad de órbitas periódicas</a></div>
<p class="note">Contenido de referencia: Strogatz, <i>Nonlinear Dynamics and Chaos</i>, 3.ª ed., §8.4–8.6; Pikovsky, Rosenblum y Kurths, <i>Synchronization</i>, cap. 7. Redacción y simulaciones propias.</p></section>`);

LABS['dn-globales']=function(sec){
  const cv=$('#dn9-cv',sec),rd=$('#dn9-read',sec),ss=$('#dn9-s',sec),mi=$('#dn9-mu',sec);cv.classList.add('dx-click');let play=true,A=null,orbs=[],cyc=null;
  const gm=sl(sec,'dn9-mu',v=>nf(v,3),()=>{calc();draw1();});
  const SY={inf:{F:m=>(x,y)=>{const r=Math.hypot(x,y)||1e-9,th=Math.atan2(y,x),rr=r*(1-r*r),tt=m-Math.sin(th);return [rr*x/r-tt*y,rr*y/r+tt*x];},xr:[-1.8,1.8],yr:[-1.4,1.4],xl:'x',yl:'y',rng:[0.7,2,1.3],seeds:[[0.1,0.05],[1.6,-1]]},
    hom:{F:m=>(x,y)=>[y,m*y+x-x*x+x*y],xr:[-1.5,2.2],yr:[-1.4,1.4],xl:'x',yl:'y',rng:[-1.1,-0.75,-0.92],seeds:[[1.05,0]]}};
  const Fc=()=>SY[ss.value].F(gm()),mk=p=>({p:p.slice(),tr:[p.slice()]});
  function calc(){cyc=null;const m=gm(),F=Fc();
    if(ss.value==='inf'){cyc={T:m>1?TAU/Math.sqrt(m*m-1):Infinity};}
    else if(m>-1){const y=[1.02,0],f=(u,o)=>{const v=F(u[0],u[1]);o[0]=v[0];o[1]=v[1];};let ok=true;for(let t=0;t<150;t+=0.01){pB_step(f,y,0.01,2);if(Math.hypot(y[0],y[1])>6||!isFinite(y[0])){ok=false;break;}}
      if(ok){const c=pB_cycle((X,Y)=>F(X+1,Y),[y[0]-1,y[1]],0,0.005,300);/* X = x − 1: el ciclo rodea X = 0 */c.pts=c.pts.map(p=>[p[0]+1,p[1]]);if(isFinite(c.T))cyc=c;}}}
  function setup(){const S=SY[ss.value];mi.min=S.rng[0];mi.max=S.rng[1];gm.set(S.rng[2]);orbs=S.seeds.map(mk);calc();}
  ss.addEventListener('change',()=>{setup();draw1();});$('#dn9-clr',sec).addEventListener('click',()=>{orbs=[];draw1();});pB_toggle(sec,'dn9-play',()=>play,v=>play=v);
  clickPos(cv,(px,py)=>{if(A&&inA(A,px,py)){orbs.push(mk(invA(A,px,py)));if(orbs.length>8)orbs.shift();draw1();}});setup();
  function adv(dt){const F=Fc(),f=(u,o)=>{const v=F(u[0],u[1]);o[0]=v[0];o[1]=v[1];};const n=Math.ceil(dt/0.01),h=dt/n;
    orbs.forEach(o=>{for(let i=0;i<n;i++)pB_step(f,o.p,h,2);if(!isFinite(o.p[0])||Math.hypot(o.p[0],o.p[1])>20){o.dead=true;return;}o.tr.push(o.p.slice());if(o.tr.length>450)o.tr.shift();});orbs=orbs.filter(o=>!o.dead);}
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.72,440,280),S=SY[ss.value],m=gm();
    A=axes(ctx,{l:40,t:10,w:w-50,h:h-34,xr:S.xr,yr:S.yr,xl:S.xl,yl:S.yl});vecField(ctx,A,Fc(),22,15);
    let s=row('μ',nf(m,3));
    if(ss.value==='inf'){const p=[];for(let k=0;k<=120;k++)p.push([Math.cos(k/120*TAU),Math.sin(k/120*TAU)]);path(ctx,A,p,m>1?K.t:K.mut,m>1?3.5:1.5,m>1?null:[5,4]);
      if(m<=1){const a=Math.asin(Math.min(1,m));[[a,true],[Math.PI-a,false]].forEach(([t,st])=>dot(ctx,A.X(Math.cos(t)),A.Y(Math.sin(t)),6,st?K.ink:'#fff',K.ink));}
      dot(ctx,A.X(0),A.Y(0),6,'#fff',K.ink);
      s+=row('ciclo r = 1',m>1?'existe':'roto por puntos fijos')+(m>1?row('T = 2π/√(μ² − 1)',nf(cyc.T,3)):row('puntos fijos en r = 1','θ = '+nf(Math.asin(Math.min(1,m)),3)+' (nodo), '+nf(Math.PI-Math.asin(Math.min(1,m)),3)+' (silla)'))+
        sep+rowT(m>1?'Cuanto más cerca de μ = 1, más lento el paso por θ ≈ π/2: el periodo diverge como (μ − 1)^(−1/2).':'Para μ ≤ 1 todas las órbitas acaban en el nodo: el ciclo desapareció con periodo infinito.');}
    else{dot(ctx,A.X(0),A.Y(0),6,'#fff',K.ink);const tau=m+1;dot(ctx,A.X(1),A.Y(0),6,tau<0?K.ink:'#fff',K.ink);
      if(cyc)path(ctx,A,cyc.pts.concat([cyc.pts[0]]),K.t,3.5);
      s+=row('silla (0, 0)','λ = '+pB_eig(m,-1))+row('(1, 0)',pB_classify(tau,1))+(cyc?row('ciclo: periodo T',nf(cyc.T,3)):row('ciclo','no existe'))+sep+
        rowT(m<-1?'μ &lt; −1: (1, 0) es un foco estable y no hay ciclo.':cyc?'Entre la Hopf (μ = −1) y μ_c ≈ −0,8645 hay un ciclo estable. Acércate a μ_c: el periodo crece logarítmicamente.':'μ &gt; μ_c: el ciclo chocó con la silla y desapareció; las trayectorias escapan.');}
    orbs.forEach((o,i)=>{pB_trail(ctx,A,o.tr,PAL[(i+1)%PAL.length]);dot(ctx,A.X(o.p[0]),A.Y(o.p[1]),5,PAL[(i+1)%PAL.length],'#fff');});
    rd.innerHTML=s;}
  /* ---- toro ---- */
  const cv2=$('#dn9-cv2',sec),rd2=$('#dn9-read2',sec);let th=[0,0],trT=[],ph=[],tt=0,acc=[0,0];
  const g1=sl(sec,'dn9-w1',v=>nf(v,2),()=>rs()),g2=sl(sec,'dn9-w2',v=>nf(v,2),()=>rs()),gK=sl(sec,'dn9-K',v=>nf(v,3),()=>rs());
  function rs(){th=[0,2];trT=[];ph=[];tt=0;acc=[0,0];draw2();}$('#dn9-rs',sec).addEventListener('click',rs);
  function adv2(dt){const w1=g1(),w2=g2(),k=gK(),f=(u,o)=>{o[0]=w1+k*Math.sin(u[1]-u[0]);o[1]=w2+k*Math.sin(u[0]-u[1]);};const n=Math.ceil(dt/0.02),h=dt/n;
    for(let i=0;i<n;i++){const o=th.slice();pB_step(f,th,h,2);acc[0]+=th[0]-o[0];acc[1]+=th[1]-o[1];tt+=h;}
    trT.push([((th[0]%TAU)+TAU)%TAU,((th[1]%TAU)+TAU)%TAU]);if(trT.length>1500)trT.shift();ph.push([tt,(((th[0]-th[1])%TAU)+TAU)%TAU]);if(ph.length>1500)ph.shift();}
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.55,400,260),hw=Math.floor(w*0.5),w1=g1(),w2=g2(),k=gK(),dw=w1-w2;
    const xf=v=>Math.abs(v-Math.PI)<1e-6?'π':Math.abs(v-TAU)<1e-6?'2π':nt(v,1);
    const A2=axes(ctx,{l:34,t:10,w:Math.min(hw-44,h-34),h:h-34,xr:[0,TAU],yr:[0,TAU],xl:'θ₁',yl:'θ₂',xf});
    ctx.save();ctx.beginPath();ctx.rect(A2.o.l,A2.o.t,A2.o.w,A2.o.h);ctx.clip();ctx.strokeStyle=K.t;ctx.lineWidth=1.6;ctx.beginPath();
    for(let i=0;i<trT.length;i++){const p=trT[i],q=trT[i-1];if(!q||Math.abs(p[0]-q[0])>3||Math.abs(p[1]-q[1])>3)ctx.moveTo(A2.X(p[0]),A2.Y(p[1]));else ctx.lineTo(A2.X(p[0]),A2.Y(p[1]));}ctx.stroke();ctx.restore();
    if(trT.length)dot(ctx,A2.X(trT[trT.length-1][0]),A2.Y(trT[trT.length-1][1]),5,K.b,'#fff');
    const t0=ph.length?ph[0][0]:0,t1=Math.max(t0+40,ph.length?ph[ph.length-1][0]:0);
    const B=axes(ctx,{l:hw+34,t:10,w:w-hw-44,h:h-34,xr:[t0,t1],yr:[0,TAU],xl:'t',yl:'φ mód 2π'});
    ctx.save();ctx.beginPath();ctx.rect(B.o.l,B.o.t,B.o.w,B.o.h);ctx.clip();ctx.strokeStyle=K.d;ctx.lineWidth=2;ctx.beginPath();
    ph.forEach((p,i)=>{const q=ph[i-1];if(!q||Math.abs(p[1]-q[1])>3)ctx.moveTo(B.X(p[0]),B.Y(p[1]));else ctx.lineTo(B.X(p[0]),B.Y(p[1]));});ctx.stroke();ctx.restore();
    const lock=Math.abs(dw)<=2*k;let s=row('Δω = ω₁ − ω₂',nf(dw,3))+row('K₁ + K₂',nf(2*k,3))+row('estado',lock?'<span class="aa-ok">enganche de fase</span>':'<span class="aa-no">deriva de fase</span>');
    if(lock){const p=Math.asin(dw/(2*k));s+=row('φ*',nf(p,3)+' rad')+row('ω* = (ω₁ + ω₂)/2',nf((w1+w2)/2,3));}
    else s+=row('T_φ teórico',nf(TAU/Math.sqrt(dw*dw-4*k*k),2));
    if(tt>20)s+=row('ρ = ⟨θ̇₁⟩/⟨θ̇₂⟩ (medido)',nf(acc[0]/acc[1],4));
    rd2.innerHTML=s+sep+rowT(lock?'La trayectoria en el toro se vuelve una recta de pendiente 1: ambos osciladores giran con la misma frecuencia y desfase fijo.':'Sin enganche la fase relativa avanza a saltos: lento cerca de φ = π/2, rápido en el resto (cuello de botella).');}
  return {draw(){draw1();draw2();},tick(dt){if(play&&vis(cv)&&pB_on(sec,'glob')){adv(dt*2);draw1();}if(vis(cv2)&&pB_on(sec,'toro')){adv2(dt*4);draw2();}}};
};

/* ================= 10 · MAPA DE POINCARÉ ================= */
V.push(String.raw`<section class="view theme-aa" data-view="dn-poincare">
<div class="eyebrow">Dinámica no lineal y caos · Unidad IV · Bifurcaciones en el plano</div><h1>Mapa de Poincaré y estabilidad de órbitas periódicas</h1><p class="lead">En vez de seguir la trayectoria entera, se mira solo dónde atraviesa una superficie fija. Un flujo continuo en \(n\) dimensiones se convierte en un mapa discreto en \(n-1\): las órbitas periódicas pasan a ser puntos fijos y su estabilidad, un multiplicador.</p>
<div class="toc"><a href="#dn10-res" data-scroll>Resumen</a><a href="#dn10-lab" data-scroll>Visualiza</a><a href="#dn10-leyes" data-scroll>Leyes y fórmulas</a><a href="#dn10-ej" data-scroll>Ejemplo</a></div>
<div class="block" id="dn10-res"><h2><span class="ico">≡</span>Resumen</h2><ul class="keypoints">
<li><b>Sección de Poincaré.</b> Para \(\dot{\mathbf x}=\mathbf f(\mathbf x)\) en \(\mathbb R^n\), se elige una hipersuperficie \(S\) de dimensión \(n-1\) transversal al flujo. Si \(\mathbf x_k\in S\) es un cruce, el siguiente cruce en el mismo sentido define el mapa de Poincaré \(\mathbf x_{k+1}=P(\mathbf x_k)\).</li>
<li><b>Órbitas periódicas = puntos fijos.</b> Una órbita cerrada que corta \(S\) en \(\mathbf x^*\) cumple \(P(\mathbf x^*)=\mathbf x^*\). Una órbita que da \(k\) vueltas antes de cerrarse es un punto de periodo \(k\) de \(P\).</li>
<li><b>Multiplicadores de Floquet.</b> Linealizando, \(\mathbf v_{k+1}=DP(\mathbf x^*)\mathbf v_k\). Los autovalores \(\lambda_j\) de \(DP\) (multiplicadores característicos) deciden: la órbita es linealmente estable si y solo si \(|\lambda_j|\lt1\) para todo \(j=1,\dots,n-1\).</li>
<li><b>Ejemplo radial.</b> En \(\dot r=r(1-r^2)\), \(\dot\theta=1\), la sección \(\theta=0\) da (con \(u=r^{-2}\), \(\dot u=-2(u-1)\)) \(P(r)=\big[1+e^{-4\pi}(r^{-2}-1)\big]^{-1/2}\), con punto fijo \(r^*=1\) y multiplicador \(e^{-4\pi}\).</li>
<li><b>Sistemas forzados periódicamente.</b> Si \(\mathbf f\) depende de \(t\) con periodo \(T\), se toma \(S\) como "el instante \(t=nT\)": el mapa estroboscópico. Para \(\dot x+x=\sin t\), \(P(x_0)=-\tfrac12+(x_0+\tfrac12)e^{-2\pi}\): un único ciclo límite \(x^*=-\tfrac12\), fuertemente estable.</li>
<li><b>Fórmula de Liouville.</b> En el plano, el único multiplicador no trivial de un ciclo \(\gamma\) de periodo \(T\) es \(\lambda=\exp\oint_\gamma\nabla\cdot\mathbf f\,dt\). Si la divergencia media es negativa, el ciclo es estable.</li>
<li><b>Por qué importa.</b> El mapa de Poincaré es la herramienta que conecta flujos con mapas: el mapa de Lorenz, el péndulo forzado y la duplicación de periodo de los mapas unidimensionales se leen en este lenguaje. Las bifurcaciones de ciclos corresponden a multiplicadores que cruzan \(+1\) (silla-nodo), \(-1\) (duplicación de periodo) o la circunferencia unidad con \(\lambda\) complejo (Neimark-Sacker, nacimiento de un toro).</li>
</ul></div>
<div class="block" id="dn10-lab"><h2><span class="ico">◎</span>Visualiza</h2>`+tabs([
 ['rad','Mapa radial y telaraña',lab2('dn10-cv',slider('dn10-l','λ (rapidez radial)',0.02,0.6,0.01,0.08)+btn('dn10-n','Siguiente vuelta ▸',false)+btn('dn10-rs','Reiniciar')+pB_play('dn10-play',false),'dn10-read',String.raw`Sistema \(\dot r=\lambda r(1-r^2)\), \(\dot\theta=1\). Izquierda: la trayectoria y sus cruces con la sección \(\theta=0\) (semieje \(x>0\)). Derecha: telaraña del mapa \(r_{k+1}=P(r_k)\). Haz clic en la sección (eje \(x>0\)) para cambiar \(r_0\).`)],
 ['vdp','Floquet de van der Pol',lab2('dn10-cv2',slider('dn10-mu','μ',0.05,3,0.05,0.3)+slider('dn10-d','perturbación δ',0.05,1.5,0.05,0.8),'dn10-read2',String.raw`Sección \(\dot x=0\), \(x>0\) (los máximos de \(x\)). Izquierda: el ciclo (verde) y una trayectoria perturbada con sus cruces. Derecha: \(\ln|x_k-x^*|\) frente a \(k\); la pendiente es \(\ln|\lambda|\), que se compara con \(\oint\mu(1-x^2)\,dt\).`)]])+String.raw`</div>
<div class="block" id="dn10-leyes"><h2><span class="ico">§</span>Leyes y fórmulas</h2><div class="laws">
<div class="law"><h3>Mapa de Poincaré</h3><div class="eq">\[ P:S\to S,\qquad \mathbf x_{k+1}=P(\mathbf x_k),\qquad P(\mathbf x^*)=\mathbf x^* \]</div><p>\(S\) transversal: \(\mathbf f\cdot\hat{\mathbf n}\ne0\) sobre \(S\).</p></div>
<div class="law"><h3>Estabilidad lineal</h3><div class="eq">\[ \mathbf v_{k+1}=DP(\mathbf x^*)\,\mathbf v_k,\qquad |\lambda_j|\lt1\ \forall j\ \Rightarrow\ \text{estable} \]</div><p>Los \(\lambda_j\) no dependen de la sección elegida.</p></div>
<div class="law"><h3>Fórmula de Liouville (2D)</h3><div class="eq">\[ \lambda=\exp\!\left(\oint_\gamma\nabla\cdot\mathbf f\,dt\right) \]</div><p>En dimensión \(n\): \(\prod_j\lambda_j=\exp\oint\nabla\cdot\mathbf f\,dt\) (el multiplicador trivial \(1\) excluido).</p></div>
<div class="law"><h3>Mapa radial</h3><div class="eq">\[ P(r)=\Big[1+e^{-4\pi\lambda}\big(r^{-2}-1\big)\Big]^{-1/2},\qquad P'(1)=e^{-4\pi\lambda} \]</div><p>Para \(\dot r=\lambda r(1-r^2)\), \(\dot\theta=1\).</p></div>
<div class="law"><h3>Mapa estroboscópico lineal</h3><div class="eq">\[ \dot x+\gamma x=A\sin t:\quad P(x_0)=x_p+(x_0-x_p)\,e^{-2\pi\gamma} \]</div><p>\(x_p=-A/(1+\gamma^2)\) es el valor de la solución periódica en \(t=2\pi n\).</p></div>
<div class="law"><h3>Bifurcaciones de ciclos</h3><div class="eq">\[ \lambda\to+1:\ \text{silla-nodo};\quad \lambda\to-1:\ \text{duplicación};\quad |\lambda|\to1,\ \lambda\in\mathbb C:\ \text{toro} \]</div><p>Son las bifurcaciones de puntos fijos de mapas aplicadas a \(P\).</p></div>
</div></div>
<div class="block" id="dn10-ej"><h2><span class="ico">✎</span>Ejemplo resuelto</h2><div class="example"><p><b>Para \(\dot r=r(1-r^2)\), \(\dot\theta=1\) con la sección \(\theta=0\), calcula \(P(r)\), verifica que \(r^*=1\) es punto fijo, obtén su multiplicador y evalúa \(P(0{,}5)\).</b></p><ol>
<li>Como \(\dot\theta=1\), el tiempo entre dos cruces de \(\theta=0\) es exactamente \(2\pi\). Basta resolver la ecuación radial durante \(2\pi\).</li>
<li>Con \(u=r^{-2}\): \(\dot u=-2r^{-3}\dot r=-2r^{-2}(1-r^2)=-2(u-1)\). Es lineal: \(u(t)-1=(u_0-1)e^{-2t}\).</li>
<li>En \(t=2\pi\): \(u_1=1+(u_0-1)e^{-4\pi}\), es decir \(P(r_0)=\big[1+e^{-4\pi}(r_0^{-2}-1)\big]^{-1/2}\).</li>
<li>Punto fijo: \(P(1)=[1+0]^{-1/2}=1\). Derivada: \(P'(r)=\tfrac12\big[\cdots\big]^{-3/2}\cdot2e^{-4\pi}r^{-3}\Rightarrow P'(1)=e^{-4\pi}\approx3{,}49\times10^{-6}\). Como \(|P'(1)|\lt1\), el ciclo es estable.</li>
<li>Comprobación con Liouville: \(\nabla\cdot\mathbf f=\tfrac1r\partial_r(r\dot r)+\partial_\theta\dot\theta=\tfrac1r\partial_r(r^2-r^4)=2-4r^2\); en \(r=1\) vale \(-2\), y \(\exp(-2\cdot2\pi)=e^{-4\pi}\). ✓</li>
<li>\(P(0{,}5)\): \(u_0=4\), \(u_1=1+3e^{-4\pi}\approx1{,}0000105\), \(r_1\approx0{,}9999948\). En una sola vuelta la trayectoria ya está a \(5\times10^{-6}\) del ciclo.</li>
</ol><p style="margin:.6em 0 0">\(r^*=1\) es un punto fijo superestable en la práctica: multiplicador \(e^{-4\pi}\approx3{,}5\times10^{-6}\).</p></div></div>
<div class="pager"><a href="#dn-globales"><small>← Anterior</small>Bifurcaciones globales de ciclos y osciladores acoplados</a><a class="next" href="#dn-lorenz"><small>Siguiente →</small>Las ecuaciones de Lorenz: propiedades y atractor extraño</a></div>
<p class="note">Contenido de referencia: Strogatz, <i>Nonlinear Dynamics and Chaos</i>, 3.ª ed., §8.7; Guckenheimer y Holmes, <i>Nonlinear Oscillations</i>, §1.5. Redacción y simulaciones propias.</p></section>`);

/* siguiente cruce de la sección y = 0 bajando (ẋ = y cambia de + a −) con x > 0 */
function pB_secY(F,p,h,maxT){const f=(u,o)=>{const v=F(u[0],u[1]);o[0]=v[0];o[1]=v[1];};let y=p.slice(),t=0,pts=[y.slice()];
  for(let k=0;k<5;k++)pB_step(f,y,h,2),t+=h;
  while(t<maxT){const o=y.slice();pB_step(f,y,h,2);t+=h;pts.push(y.slice());if(o[1]>0&&y[1]<=0&&y[0]>0){const s=o[1]/(o[1]-y[1]);return {x:o[0]+s*(y[0]-o[0]),t:t-h+s*h,pts};}if(!isFinite(y[0]))break;}
  return {x:NaN,t:NaN,pts};}
LABS['dn-poincare']=function(sec){
  const cv=$('#dn10-cv',sec),rd=$('#dn10-read',sec);cv.classList.add('dx-click');let play=false,A=null,r0=0.25,cur=null,hits=[],th=0,tr=[];
  const gl=sl(sec,'dn10-l',v=>nf(v,2),()=>rs());
  const P=r=>{const L=gl();return Math.pow(1+Math.exp(-4*Math.PI*L)*(1/(r*r)-1),-0.5);};
  function rs(){cur=[r0,0];th=0;hits=[r0];tr=[[r0,0]];draw1();}
  $('#dn10-rs',sec).addEventListener('click',rs);pB_toggle(sec,'dn10-play',()=>play,v=>play=v);
  $('#dn10-n',sec).addEventListener('click',()=>{adv(TAU-th%TAU+1e-9);draw1();});
  clickPos(cv,(px,py)=>{if(!A||!inA(A,px,py))return;const q=invA(A,px,py);if(q[0]>0.03&&Math.abs(q[1])<0.25){r0=clamp(q[0],0.03,1.9);rs();}});
  function adv(dt){const L=gl(),n=Math.ceil(dt/0.01),h=dt/n;for(let i=0;i<n;i++){let r=cur[0];const f=u=>L*u*(1-u*u);const k1=f(r),k2=f(r+h/2*k1),k3=f(r+h/2*k2),k4=f(r+h*k3);r+=h/6*(k1+2*k2+2*k3+k4);
      const th0=th;th+=h;cur=[r,th];if(Math.floor(th0/TAU)!==Math.floor(th/TAU))hits.push(r);tr.push([r*Math.cos(th),r*Math.sin(th)]);}if(tr.length>2500)tr.splice(0,tr.length-2500);}
  rs();
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.55,400,260),hw=Math.floor(w*0.5);
    A=axes(ctx,{l:30,t:10,w:Math.min(hw-40,h-34),h:h-34,xr:[-2,2],yr:[-2,2],xl:'x',yl:'y'});
    const c=[];for(let k=0;k<=100;k++)c.push([Math.cos(k/100*TAU),Math.sin(k/100*TAU)]);path(ctx,A,c,K.t,3);
    ctx.save();ctx.strokeStyle=K.f;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(A.X(0),A.Y(0));ctx.lineTo(A.X(2),A.Y(0));ctx.stroke();ctx.restore();label(ctx,'S: θ = 0',A.X(1.4),A.Y(0)+12,K.f);
    path(ctx,A,tr,K.a,1.6);hits.forEach((r,i)=>dot(ctx,A.X(r),A.Y(0),i===hits.length-1?6:4,K.w,'#fff'));dot(ctx,A.X(cur[0]*Math.cos(cur[1])),A.Y(cur[0]*Math.sin(cur[1])),5,K.a,'#fff');
    const B=axes(ctx,{l:hw+34,t:10,w:Math.min(w-hw-44,h-34),h:h-34,xr:[0,2],yr:[0,2],xl:'r_k',yl:'r_{k+1}'});
    curve(ctx,B,x=>x,0,2,K.mut,1.5,[5,4]);curve(ctx,B,x=>x>0.01?P(x):NaN,0.01,2,K.t,2.5);
    ctx.save();ctx.strokeStyle=K.w;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(B.X(hits[0]),B.Y(0));
    for(let i=0;i<hits.length-1;i++){ctx.lineTo(B.X(hits[i]),B.Y(hits[i+1]));ctx.lineTo(B.X(hits[i+1]),B.Y(hits[i+1]));}ctx.stroke();ctx.restore();
    dot(ctx,B.X(1),B.Y(1),6,K.ink);
    const L=gl(),m=Math.exp(-4*Math.PI*L),k=hits.length-1;
    rd.innerHTML=row('r₀',nf(r0,3))+row('vueltas k',k)+row('r_k',nf(hits[k],6))+row('|r_k − 1|',(Math.abs(hits[k]-1)).toExponential(2).replace('.',','))+sep+
      row('multiplicador P′(1) = e^(−4πλ)',m<1e-3?m.toExponential(2).replace('.',','):nf(m,4))+rowT('Cada vuelta la distancia al ciclo se multiplica por ≈ e^(−4πλ): el ciclo es estable para todo λ &gt; 0. Lejos del ciclo la telaraña muestra la no linealidad de P.');}
  /* ---- Floquet van der Pol ---- */
  const cv2=$('#dn10-cv2',sec),rd2=$('#dn10-read2',sec);let cache=null;
  const gmu=sl(sec,'dn10-mu',v=>nf(v,2),()=>{cache=null;draw2();}),gd=sl(sec,'dn10-d',v=>nf(v,2),()=>{cache=null;draw2();});
  function compute(){const m=gmu(),F=(x,y)=>[y,m*(1-x*x)*y-x],h=0.002;
    /* ciclo: transitorio y luego cruce */
    let c=pB_secY(F,[2,0.5],h,200);for(let i=0;i<3;i++)c=pB_secY(F,[c.x,0],h,200);
    const xs=c.x,cy=pB_secY(F,[xs,0],h,200);let I=0;for(let i=1;i<cy.pts.length;i++){const a=cy.pts[i-1][0],b=cy.pts[i][0];I+=m*(1-(a*a+b*b)/2)*h;}
    const seq=[xs+gd()],trj=[];let x=seq[0];for(let k=0;k<6;k++){const r=pB_secY(F,[x,0],h,200);if(!isFinite(r.x))break;trj.push(...r.pts.filter((p,i)=>i%4===0));x=r.x;seq.push(x);}
    return {m,xs,T:cy.t,I,lam:Math.exp(I),cyc:cy.pts.filter((p,i)=>i%3===0),seq,trj};}
  function draw2(){
    if(!vis(cv2))return;if(!cache)cache=compute();const C2=cache,{ctx,w,h}=fit(cv2,.55,400,260),hw=Math.floor(w*0.5);
    const A2=axes(ctx,{l:34,t:10,w:hw-44,h:h-34,xr:[-3.5,3.5],yr:[-6,6],xl:'x',yl:'ẋ'});
    ctx.save();ctx.strokeStyle=K.f;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(A2.X(0),A2.Y(0));ctx.lineTo(A2.X(3.5),A2.Y(0));ctx.stroke();ctx.restore();
    path(ctx,A2,C2.trj,K.a,1.4);path(ctx,A2,C2.cyc,K.t,3);C2.seq.forEach((x,i)=>dot(ctx,A2.X(x),A2.Y(0),i?4:6,K.w,'#fff'));
    const d=C2.seq.map(x=>Math.log(Math.abs(x-C2.xs)+1e-300)),ymin=Math.max(-26,Math.min(-12,Math.floor(Math.min(...d)))),B=axes(ctx,{l:hw+34,t:10,w:w-hw-44,h:h-34,xr:[0,6],yr:[ymin,1],xl:'k',yl:'ln|x_k − x*|'});
    curve(ctx,B,k=>d[0]+k*C2.I,0,6,K.b,2,[6,4]);d.forEach((v,k)=>dot(ctx,B.X(k),B.Y(v),5,K.d,'#fff'));
    const ok=d.map((v,k)=>[k,v]).filter(q=>q[0]>=1&&q[1]>-18),meas=ok.length>=2?(ok[ok.length-1][1]-ok[0][1])/(ok[ok.length-1][0]-ok[0][0]):(d.length>1?d[1]-d[0]:NaN);
    rd2.innerHTML=row('μ',nf(C2.m,2))+row('x* (máximo del ciclo)',nf(C2.xs,4))+row('periodo T',nf(C2.T,3))+row('∮ μ(1 − x²) dt',nf(C2.I,3))+row('λ = exp ∮ ∇·f dt',C2.lam<1e-3?C2.lam.toExponential(2).replace('.',','):nf(C2.lam,4))+
      row('pendiente medida (ln|λ|)',isFinite(meas)?nf(meas,3):'—')+row('μ pequeño: −2πμ',nf(-TAU*C2.m,3))+sep+rowT('La divergencia μ(1 − x²) es positiva dentro de |x| &lt; 1 y negativa fuera; el ciclo pasa más tiempo fuera, así que la integral es negativa y el ciclo es estable. Para μ pequeño, x ≈ 2 cos t y ∮ μ(1 − 4cos²t) dt = −2πμ. Los puntos por debajo de ≈ −20 son ruido numérico.');}
  return {draw(){draw1();draw2();},tick(dt){if(play&&vis(cv)&&pB_on(sec,'rad')){adv(dt*3);draw1();}}};
};

/* ================= 11 · ECUACIONES DE LORENZ ================= */
function pB_lorenz(s,r,b){return (u,o)=>{o[0]=s*(u[1]-u[0]);o[1]=r*u[0]-u[1]-u[0]*u[2];o[2]=u[0]*u[1]-b*u[2];};}
V.push(String.raw`<section class="view theme-aa" data-view="dn-lorenz">
<div class="eyebrow">Dinámica no lineal y caos · Unidad V · Caos</div><h1>Las ecuaciones de Lorenz: propiedades y atractor extraño</h1><p class="lead">En 1963 Edward Lorenz redujo la convección atmosférica a tres ecuaciones diferenciales con dos no linealidades cuadráticas. Encontró trayectorias acotadas que nunca se repiten ni se asientan, extremadamente sensibles a las condiciones iniciales: el primer atractor extraño.</p>
<div class="toc"><a href="#dn11-res" data-scroll>Resumen</a><a href="#dn11-lab" data-scroll>Visualiza</a><a href="#dn11-leyes" data-scroll>Leyes y fórmulas</a><a href="#dn11-ej" data-scroll>Ejemplo</a></div>
<div class="block" id="dn11-res"><h2><span class="ico">≡</span>Resumen</h2><ul class="keypoints">
<li><b>El sistema.</b> \(\dot x=\sigma(y-x)\), \(\dot y=rx-y-xz\), \(\dot z=xy-bz\), con \(\sigma,r,b>0\). \(x\) mide la intensidad de la convección, \(y\) y \(z\) las diferencias de temperatura; \(\sigma\) es el número de Prandtl y \(r\) el número de Rayleigh normalizado. Valores clásicos: \(\sigma=10\), \(b=8/3\), \(r=28\). La misma dinámica describe una rueda hidráulica caótica y el láser monomodo.</li>
<li><b>Simetría.</b> \((x,y,z)\to(-x,-y,z)\) deja invariantes las ecuaciones: toda solución tiene su imagen especular o es simétrica ella misma. El eje \(z\) es invariante.</li>
<li><b>Disipación.</b> \(\nabla\cdot\mathbf f=-(\sigma+1+b)\lt0\): todo volumen de condiciones iniciales se contrae como \(V(t)=V_0e^{-(\sigma+1+b)t}\). Así, el atractor tiene volumen cero; por eso no puede haber repulsores (fuentes, ciclos repulsores) ni cuasiperiodicidad en un toro sólido.</li>
<li><b>Puntos fijos.</b> El origen existe siempre; es estable para \(r\lt1\) (globalmente, por la función de Liapunov \(V=x^2/\sigma+y^2+z^2\)). En \(r=1\) hay una bifurcación tridente y nacen \(C^\pm=\big(\pm\sqrt{b(r-1)},\pm\sqrt{b(r-1)},r-1\big)\): convección estacionaria en rollos que giran en sentidos opuestos.</li>
<li><b>Hopf subcrítica.</b> \(C^\pm\) son estables para \(1\lt r\lt r_H=\dfrac{\sigma(\sigma+b+3)}{\sigma-b-1}\approx24{,}74\). En \(r_H\) los ciclos inestables que los rodeaban se encogen y los desestabilizan: no hay atractor cercano y el sistema salta al atractor extraño.</li>
<li><b>Atractor extraño.</b> Para \(r=28\) las trayectorias giran alrededor de \(C^+\) y \(C^-\) un número de veces impredecible antes de cambiar de ala. Están acotadas (hay un elipsoide atrapante), no se cortan (unicidad) y el conjunto límite tiene dimensión fractal \(\approx2{,}06\).</li>
<li><b>Sensibilidad.</b> Dos trayectorias que empiezan a \(10^{-5}\) se separan como \(|\delta(t)|\sim|\delta_0|e^{\lambda t}\) con \(\lambda\approx0{,}9\), hasta que la separación es del tamaño del atractor. Ver el tema siguiente.</li>
<li><b>Otros regímenes.</b> Caos transitorio para \(13{,}93\lt r\lt24{,}06\); coexistencia de atractor extraño y puntos fijos estables en \(24{,}06\lt r\lt24{,}74\); para \(r\) muy grande (\(r\gtrsim313\)) vuelve un ciclo límite estable, con ventanas periódicas intercaladas.</li>
</ul></div>
<div class="block" id="dn11-lab"><h2><span class="ico">◎</span>Visualiza</h2>`+tabs([
 ['3d','Atractor en 3D',lab2('dn11-cv',slider('dn11-r','r',0.5,40,0.1,28)+slider('dn11-d','log₁₀ δ₀',-9,-1,1,-5)+btn('dn11-rs','Reiniciar')+pB_play('dn11-play'),'dn11-read',String.raw`Dos trayectorias (azul y naranja) separadas inicialmente por \(\delta_0\) en \(x\). Arrastra para rotar. Prueba \(r=0{,}5\), \(r=10\), \(r=20\) (caos transitorio), \(r=24{,}5\) y \(r=28\).`)],
 ['ts','Series temporales',lab2('dn11-cv2','','dn11-read2',String.raw`\(x(t)\) de ambas trayectorias (las mismas de la pestaña 3D) y \(\ln|\delta(t)|\) debajo. La separación crece exponencialmente y se satura en el tamaño del atractor.`)]])+String.raw`</div>
<div class="block" id="dn11-leyes"><h2><span class="ico">§</span>Leyes y fórmulas</h2><div class="laws">
<div class="law"><h3>Ecuaciones de Lorenz</h3><div class="eq">\[ \dot x=\sigma(y-x),\quad \dot y=rx-y-xz,\quad \dot z=xy-bz \]</div><p>Truncamiento de Galerkin de tres modos de la convección de Rayleigh-Bénard.</p></div>
<div class="law"><h3>Contracción de volumen</h3><div class="eq">\[ \frac{\dot V}{V}=\nabla\cdot\mathbf f=-(\sigma+1+b)\ \Rightarrow\ V(t)=V_0e^{-(\sigma+1+b)t} \]</div><p>Con los valores clásicos, el volumen cae un factor \(e^{-13{,}7}\approx10^{-6}\) por unidad de tiempo.</p></div>
<div class="law"><h3>Puntos fijos \(C^\pm\)</h3><div class="eq">\[ x^*=y^*=\pm\sqrt{b(r-1)},\qquad z^*=r-1 \]</div><p>Existen para \(r>1\) (tridente supercrítica en \(r=1\)).</p></div>
<div class="law"><h3>Polinomio característico en \(C^\pm\)</h3><div class="eq">\[ \lambda^3+(\sigma+b+1)\lambda^2+b(r+\sigma)\lambda+2b\sigma(r-1)=0 \]</div><p>Raíz imaginaria pura \(\lambda=i\omega\) si \(a_2a_1=a_0\) (criterio de Routh-Hurwitz en el borde).</p></div>
<div class="law"><h3>Umbral de Hopf</h3><div class="eq">\[ r_H=\frac{\sigma(\sigma+b+3)}{\sigma-b-1}\quad(\sigma>b+1) \]</div><p>\(\sigma=10\), \(b=8/3\): \(r_H\approx24{,}74\).</p></div>
<div class="law"><h3>Elipsoide atrapante</h3><div class="eq">\[ V=rx^2+\sigma y^2+\sigma(z-2r)^2,\qquad \dot V\lt0\ \text{fuera de un elipsoide} \]</div><p>Todas las trayectorias entran en una región acotada y se quedan allí.</p></div>
</div></div>
<div class="block" id="dn11-ej"><h2><span class="ico">✎</span>Ejemplo resuelto</h2><div class="example"><p><b>Para \(\sigma=10\), \(b=8/3\): (a) calcula \(C^\pm\) en \(r=28\); (b) deduce \(r_H\) a partir del polinomio característico; (c) halla el periodo de las oscilaciones en el umbral.</b></p><ol>
<li>(a) \(b(r-1)=\tfrac83\cdot27=72\Rightarrow C^\pm=(\pm8{,}485;\ \pm8{,}485;\ 27)\).</li>
<li>(b) Con \(p(\lambda)=\lambda^3+a_2\lambda^2+a_1\lambda+a_0\), sustituir \(\lambda=i\omega\) da \(-i\omega^3-a_2\omega^2+ia_1\omega+a_0=0\). Parte imaginaria: \(\omega^2=a_1\). Parte real: \(a_0=a_2\omega^2=a_2a_1\).</li>
<li>Con \(a_2=\sigma+b+1\), \(a_1=b(r+\sigma)\), \(a_0=2b\sigma(r-1)\): \((\sigma+b+1)(r+\sigma)=2\sigma(r-1)\Rightarrow r(\sigma-b-1)=\sigma(\sigma+b+3)\), es decir \(r_H=\dfrac{\sigma(\sigma+b+3)}{\sigma-b-1}\).</li>
<li>Numéricamente: \(\sigma+b+3=15{,}667\), \(\sigma-b-1=6{,}333\), \(r_H=10\cdot15{,}667/6{,}333\approx24{,}74\). Como \(r=28>r_H\), \(C^\pm\) son inestables en el régimen clásico.</li>
<li>(c) \(\omega^2=a_1=b(r_H+\sigma)=\tfrac83\cdot34{,}74\approx92{,}6\Rightarrow\omega\approx9{,}62\) y \(T=2\pi/\omega\approx0{,}653\). Es el periodo con que las trayectorias espiralan alrededor de \(C^\pm\) en el atractor (en el simulador, unas 0,6–0,7 unidades de tiempo por vuelta).</li>
</ol><p style="margin:.6em 0 0">\(C^\pm=(\pm6\sqrt2,\pm6\sqrt2,27)\), \(r_H\approx24{,}74\) y \(T_H\approx0{,}65\).</p></div></div>
<div class="pager"><a href="#dn-poincare"><small>← Anterior</small>Mapa de Poincaré y estabilidad de órbitas periódicas</a><a class="next" href="#dn-lorenz-mapa"><small>Siguiente →</small>Mapa de Lorenz, exponentes de Lyapunov y predictibilidad</a></div>
<p class="note">Contenido de referencia: Strogatz, <i>Nonlinear Dynamics and Chaos</i>, 3.ª ed., §9.1–9.3; E. N. Lorenz, «Deterministic nonperiodic flow», <i>J. Atmos. Sci.</i> 20 (1963) 130; Sparrow, <i>The Lorenz Equations</i>. Redacción y simulaciones propias.</p></section>`);

LABS['dn-lorenz']=function(sec){
  const cv=$('#dn11-cv',sec),rd=$('#dn11-read',sec),cv2=$('#dn11-cv2',sec),rd2=$('#dn11-read2',sec);
  const st={yaw:0.5,pitch:0.2,auto:true};let play=true,T=[],ts=[],t=0;
  cam3(cv,st,()=>draw1());
  const gr=sl(sec,'dn11-r',v=>nf(v,1),()=>rs()),gd=sl(sec,'dn11-d',v=>'10^'+v,()=>rs());
  $('#dn11-rs',sec).addEventListener('click',()=>rs());pB_toggle(sec,'dn11-play',()=>play,v=>play=v);
  function rs(){const d=Math.pow(10,gd());T=[{p:[1,1,1],tr:[]},{p:[1+d,1,1],tr:[]}];ts=[];t=0;draw1();draw2();}
  function adv(dt){const f=pB_lorenz(10,gr(),8/3),n=Math.ceil(dt/0.004),h=dt/n;
    for(let i=0;i<n;i++){T.forEach(o=>pB_step(f,o.p,h,3));t+=h;}
    T.forEach(o=>{o.tr.push(o.p.slice());if(o.tr.length>1400)o.tr.shift();});
    const a=T[0].p,b=T[1].p;ts.push([t,a[0],b[0],Math.log(Math.max(1e-16,Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2])))]);if(ts.length>1500)ts.shift();}
  rs();
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.75,460,300),r=gr(),zc=Math.max(0,Math.min(25,r-1));const Pp=P3(st,w,h,25),Tf=(x,y,z)=>Pp.T(x,y,z-zc);
    const P={T:Tf};axes3(ctx,P,22,['x','y','z']);
    T.forEach((o,k)=>{ctx.save();ctx.lineWidth=1.4;ctx.strokeStyle=k?K.b:K.a;ctx.globalAlpha=k?0.85:0.75;ctx.beginPath();o.tr.forEach((p,i)=>{const q=Tf(p[0],p[1],p[2]);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});ctx.stroke();ctx.restore();
      const q=Tf(...o.p);dot(ctx,q[0],q[1],5,k?K.b:K.a,'#fff');});
    const fx=[[0,0,0]];if(r>1){const c=Math.sqrt(8/3*(r-1));fx.push([c,c,r-1],[-c,-c,r-1]);}
    const rH=10*(10+8/3+3)/(10-8/3-1);
    fx.forEach((p,i)=>{const q=Tf(...p);const stb=i===0?r<1:r<rH;dot(ctx,q[0],q[1],5,stb?K.ink:'#fff',K.ink);if(i)label(ctx,i===1?'C⁺':'C⁻',q[0]+8,q[1]-8,K.ink);});
    const a=T[0].p,b=T[1].p,dd=Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
    let s=row('σ, b','10, 8/3')+row('r',nf(r,1))+row('origen',r<1?'estable':'silla')+(r>1?row('C±','(±'+nf(Math.sqrt(8/3*(r-1)),2)+', ±'+nf(Math.sqrt(8/3*(r-1)),2)+', '+nf(r-1,2)+') · '+(r<rH?'estables':'inestables')):'')+
      row('r_H',nf(rH,2))+row('t',nf(t,1))+row('|δ(t)|',dd<1e-3?dd.toExponential(1).replace('.',','):nf(dd,3))+sep;
    s+=rowT(r<1?'r &lt; 1: todo decae al origen (no hay convección).':r<13.93?'1 &lt; r &lt; 13,9: las trayectorias espiralan hacia C⁺ o C⁻ (rollos estacionarios).':r<24.06?'Caos transitorio: la trayectoria vaga un tiempo de forma errática y luego cae en C⁺ o C⁻.':r<rH?'Coexisten el atractor extraño y los puntos fijos estables: depende de la condición inicial.':'Atractor extraño: las dos trayectorias se separan y cambian de ala en momentos distintos.');
    rd.innerHTML=s;}
  function draw2(){
    if(!vis(cv2))return;const {ctx,w,h}=fit(cv2,.7,440,280),hh=Math.floor(h*0.55);const t0=ts.length?ts[0][0]:0,t1=Math.max(t0+12,ts.length?ts[ts.length-1][0]:0);
    const A=axes(ctx,{l:36,t:8,w:w-46,h:hh-30,xr:[t0,t1],yr:[-22,22],xl:'t',yl:'x(t)'});path(ctx,A,ts.map(p=>[p[0],p[1]]),K.a,1.8);path(ctx,A,ts.map(p=>[p[0],p[2]]),K.b,1.8);
    const B=axes(ctx,{l:36,t:hh+6,w:w-46,h:h-hh-30,xr:[t0,t1],yr:[-22,5],xl:'t',yl:'ln|δ|'});path(ctx,B,ts.map(p=>[p[0],p[3]]),K.d,2);
    if(ts.length){const L0=Math.log(Math.pow(10,gd()));curve(ctx,B,x=>L0+0.906*x,0,t1,K.mut,1.4,[5,4]);label(ctx,'pendiente 0,906',B.X(Math.min(t1,t0+(t1-t0)*0.15)),B.Y(-20)-6,K.mut);}
    const lt=ts.length?ts[ts.length-1]:null;rd2.innerHTML=row('t',lt?nf(lt[0],1):'0')+row('ln|δ(t)|',lt?nf(lt[3],2):'—')+row('ln|δ₀|',nf(Math.log(Math.pow(10,gd())),2))+sep+rowT('Mientras |δ| es pequeño crece como e^(λt) con λ ≈ 0,906 (línea gris). Al llegar a |δ| ≈ 20 (el tamaño del atractor) se satura: a partir de ahí las dos trayectorias están descorrelacionadas.');}
  return {draw(){draw1();draw2();},tick(dt){if(!play)return;const v1=vis(cv)&&pB_on(sec,'3d'),v2=vis(cv2)&&pB_on(sec,'ts');if(!v1&&!v2)return;
    adv(dt*0.8);if(st.auto&&v1)st.yaw+=dt*0.15;if(v1)draw1();if(v2)draw2();}};
};

/* ================= 12 · MAPA DE LORENZ Y LYAPUNOV ================= */
V.push(String.raw`<section class="view theme-aa" data-view="dn-lorenz-mapa">
<div class="eyebrow">Dinámica no lineal y caos · Unidad V · Caos</div><h1>Mapa de Lorenz, exponentes de Lyapunov y predictibilidad</h1><p class="lead">Lorenz encontró orden dentro del caos: si se anota cada máximo de \(z(t)\), el siguiente máximo es función del anterior. Ese mapa unidimensional explica por qué no hay órbitas periódicas estables, y el exponente de Lyapunov cuantifica cuánto tiempo se puede predecir.</p>
<div class="toc"><a href="#dn12-res" data-scroll>Resumen</a><a href="#dn12-lab" data-scroll>Visualiza</a><a href="#dn12-leyes" data-scroll>Leyes y fórmulas</a><a href="#dn12-ej" data-scroll>Ejemplo</a></div>
<div class="block" id="dn12-res"><h2><span class="ico">≡</span>Resumen</h2><ul class="keypoints">
<li><b>Mapa de Lorenz.</b> Sea \(z_n\) el \(n\)-ésimo máximo local de \(z(t)\). Los puntos \((z_n,z_{n+1})\) caen sobre una curva casi unidimensional en forma de tienda: \(z_{n+1}=f(z_n)\). El atractor es tan delgado (dimensión \(\approx2{,}06\)) que la sección se comporta como un intervalo.</li>
<li><b>Ninguna órbita periódica es estable.</b> En el mapa de Lorenz \(|f'(z)|>1\) en todas partes. Si hubiera un ciclo de periodo \(p\) con puntos \(z_1,\dots,z_p\), su multiplicador sería \(\prod_k f'(z_k)\), de módulo mayor que 1: inestable. Así se descartan los ciclos límite estables para \(r=28\).</li>
<li><b>Sensibilidad exponencial.</b> Para una perturbación pequeña \(\boldsymbol\delta(t)\), \(\|\boldsymbol\delta(t)\|\sim\|\boldsymbol\delta_0\|e^{\lambda t}\). En Lorenz (\(\sigma=10\), \(b=8/3\), \(r=28\)) \(\lambda_1\approx0{,}906\): los errores se multiplican por \(e\) cada \(\approx1{,}1\) unidades de tiempo.</li>
<li><b>Espectro de Lyapunov.</b> En un flujo de dimensión \(n\) hay \(n\) exponentes \(\lambda_1\ge\dots\ge\lambda_n\). En Lorenz \(\approx(0{,}906;\ 0;\ -14{,}57)\): uno positivo (estiramiento), uno nulo (la dirección del flujo) y uno muy negativo (plegado y contracción). Su suma es \(\nabla\cdot\mathbf f=-(\sigma+1+b)=-13{,}67\).</li>
<li><b>Cálculo práctico (Benettin).</b> Se integran una trayectoria de referencia y una vecina a distancia \(d_0\); cada \(\Delta t\) se mide la separación \(d_k\), se acumula \(\ln(d_k/d_0)\) y se renormaliza la vecina a distancia \(d_0\) en la misma dirección. \(\lambda\approx\frac{1}{N\Delta t}\sum_k\ln(d_k/d_0)\).</li>
<li><b>Horizonte de predicción.</b> Si se tolera un error \(a\) y la condición inicial tiene incertidumbre \(\delta_0\), la predicción vale hasta \(t_h\approx\frac{1}{\lambda}\ln\frac{a}{\delta_0}\). La dependencia logarítmica es cruel: mejorar \(\delta_0\) mil veces solo suma \(\ln(1000)/\lambda\approx7{,}6\) unidades de tiempo.</li>
<li><b>Dimensión de Kaplan-Yorke.</b> \(D_{KY}=j+\frac{\sum_{i\le j}\lambda_i}{|\lambda_{j+1}|}\), con \(j\) el mayor índice con suma parcial no negativa. Para Lorenz, \(D_{KY}=2+0{,}906/14{,}57\approx2{,}06\).</li>
</ul></div>
<div class="block" id="dn12-lab"><h2><span class="ico">◎</span>Visualiza</h2>`+tabs([
 ['mapa','Mapa de Lorenz',lab2('dn12-cv',slider('dn12-r','r',24.8,60,0.1,28)+btn('dn12-it','Iterar telaraña ▸',false)+btn('dn12-clr','Borrar'),'dn12-read',String.raw`Arriba: \(z(t)\) con sus máximos marcados. Abajo: los pares \((z_n,z_{n+1})\) de unos 500 máximos y la diagonal. "Iterar telaraña" recorre la sucesión real de máximos. Cambia \(r\) para ver cómo la curva se deforma (con \(r\) grande aparecen ventanas periódicas).`)],
 ['lyap','Exponente de Lyapunov',lab2('dn12-cv2',slider('dn12-d','log₁₀ δ₀',-12,-2,1,-8)+slider('dn12-a','log₁₀ tolerancia a',-4,0,0.5,-2)+btn('dn12-go','Recalcular',false),'dn12-read2',String.raw`\(\ln|\delta(t)|\) de un par de trayectorias (violeta) y el método de Benettin (renormalizando cada 0,5 unidades de tiempo) para estimar \(\lambda_1\). La línea vertical marca el horizonte \(t_h=\lambda^{-1}\ln(a/\delta_0)\).`)]])+String.raw`</div>
<div class="block" id="dn12-leyes"><h2><span class="ico">§</span>Leyes y fórmulas</h2><div class="laws">
<div class="law"><h3>Exponente de Lyapunov máximo</h3><div class="eq">\[ \lambda_1=\lim_{t\to\infty}\lim_{\delta_0\to0}\frac1t\ln\frac{\|\boldsymbol\delta(t)\|}{\|\boldsymbol\delta_0\|} \]</div><p>Promedio sobre el atractor; caos \(\Leftrightarrow\lambda_1>0\) en un conjunto acotado.</p></div>
<div class="law"><h3>Suma de exponentes</h3><div class="eq">\[ \sum_{i=1}^n\lambda_i=\big\langle\nabla\cdot\mathbf f\big\rangle=-(\sigma+1+b) \]</div><p>Para Lorenz es una constante: \(-41/3\approx-13{,}67\).</p></div>
<div class="law"><h3>Horizonte de predicción</h3><div class="eq">\[ t_h\approx\frac{1}{\lambda_1}\ln\frac{a}{\|\boldsymbol\delta_0\|} \]</div><p>Logarítmico en la precisión inicial.</p></div>
<div class="law"><h3>Multiplicador de un ciclo del mapa</h3><div class="eq">\[ \frac{d}{dz}f^{p}(z_1)=\prod_{k=1}^{p}f'(z_k),\qquad |f'|>1\ \Rightarrow\ \text{ciclo inestable} \]</div><p>Regla de la cadena aplicada a la \(p\)-ésima iterada.</p></div>
<div class="law"><h3>Benettin</h3><div class="eq">\[ \lambda_1\approx\frac{1}{N\,\Delta t}\sum_{k=1}^{N}\ln\frac{d_k}{d_0} \]</div><p>La renormalización evita que \(\delta\) sature en el tamaño del atractor.</p></div>
<div class="law"><h3>Kaplan-Yorke</h3><div class="eq">\[ D_{KY}=j+\frac{\lambda_1+\dots+\lambda_j}{|\lambda_{j+1}|} \]</div><p>Lorenz: \(D_{KY}\approx2{,}06\); conjetura: coincide con la dimensión de información.</p></div>
</div></div>
<div class="block" id="dn12-ej"><h2><span class="ico">✎</span>Ejemplo resuelto</h2><div class="example"><p><b>En el sistema de Lorenz clásico, \(\lambda_1\approx0{,}906\) y \(\lambda_2=0\). (a) Obtén \(\lambda_3\). (b) Con \(\delta_0=10^{-7}\) y tolerancia \(a=10^{-3}\), estima el horizonte de predicción. (c) ¿Cuánto se gana si \(\delta_0\) se reduce a \(10^{-10}\)? (d) Calcula \(D_{KY}\).</b></p><ol>
<li>(a) \(\lambda_1+\lambda_2+\lambda_3=-(\sigma+1+b)=-(10+1+8/3)=-13{,}667\Rightarrow\lambda_3=-13{,}667-0{,}906=-14{,}573\).</li>
<li>(b) \(t_h=\dfrac{1}{0{,}906}\ln\dfrac{10^{-3}}{10^{-7}}=\dfrac{\ln10^4}{0{,}906}=\dfrac{9{,}21}{0{,}906}\approx10{,}2\).</li>
<li>(c) \(t_h'=\dfrac{\ln10^7}{0{,}906}=\dfrac{16{,}12}{0{,}906}\approx17{,}8\). La ganancia es \(\ln(10^3)/\lambda_1\approx7{,}6\): mil veces más precisión compra menos que duplicar el horizonte.</li>
<li>(d) Suma parcial \(\lambda_1+\lambda_2=0{,}906\ge0\) y \(\lambda_1+\lambda_2+\lambda_3\lt0\), así que \(j=2\): \(D_{KY}=2+0{,}906/14{,}573\approx2{,}062\).</li>
<li>Comprobación numérica (pestaña "Exponente de Lyapunov"): Benettin con \(\Delta t=0{,}5\) durante 200 unidades de tiempo da \(\lambda_1\approx0{,}9\) (entre \(0{,}85\) y \(0{,}95\) según la condición inicial); una trayectoria con \(\delta_0=10^{-7}\) alcanza \(|\delta|=10^{-3}\) en \(t\approx10\), con fluctuaciones de \(\pm2\) según la condición inicial.</li>
</ol><p style="margin:.6em 0 0">\(\lambda_3\approx-14{,}57\); \(t_h\approx10{,}2\) y \(\approx17{,}8\); \(D_{KY}\approx2{,}06\): el atractor es apenas más que una superficie.</p></div></div>
<div class="pager"><a href="#dn-lorenz"><small>← Anterior</small>Las ecuaciones de Lorenz: propiedades y atractor extraño</a><a class="next" href="#dn-mapas-1d"><small>Siguiente →</small>Mapas unidimensionales, puntos fijos y telaraña</a></div>
<p class="note">Contenido de referencia: Strogatz, <i>Nonlinear Dynamics and Chaos</i>, 3.ª ed., §9.4–9.5; Cvitanović et al., <i>ChaosBook</i>, cap. 6 (exponentes de Lyapunov); Benettin et al., <i>Meccanica</i> 15 (1980) 9. Redacción y simulaciones propias.</p></section>`);

LABS['dn-lorenz-mapa']=function(sec){
  const cv=$('#dn12-cv',sec),rd=$('#dn12-read',sec);let M=null,web=0;
  const gr=sl(sec,'dn12-r',v=>nf(v,1),()=>{M=null;web=0;draw1();});
  $('#dn12-it',sec).addEventListener('click',()=>{web=Math.min(web+1,(M?M.z.length:1)-2);draw1();});$('#dn12-clr',sec).addEventListener('click',()=>{web=0;draw1();});
  function compute(){const r=gr(),f=pB_lorenz(10,r,8/3),h=0.005,u=[1,1,20];for(let t=0;t<10;t+=h)pB_step(f,u,h,3);
    const z=[],zs=[];let a=u[2],b=u[2],t=0;const N=Math.round(380/h);
    for(let i=0;i<N;i++){pB_step(f,u,h,3);t+=h;if(b>a&&b>u[2]){/* parábola por tres puntos */const den=a-2*b+u[2],dz=den!==0?0.5*(a-u[2])/den:0;z.push(b-0.25*(a-u[2])*dz);}a=b;b=u[2];if(t<12&&i%4===0)zs.push([t,u[2]]);}
    return {r,z,zs};}
  function draw1(){
    if(!vis(cv))return;if(!M)M=compute();const {ctx,w,h}=fit(cv,.95,560,340),hh=Math.floor(h*0.3),z=M.z;
    const zmin=Math.min(...z),zmax=Math.max(...z),pad=(zmax-zmin)*0.08||1;
    const A=axes(ctx,{l:40,t:8,w:w-50,h:hh-28,xr:[0,12],yr:[0,Math.max(50,zmax+5)],xl:'t',yl:'z(t)'});path(ctx,A,M.zs,K.t,1.6);
    for(let i=1;i<M.zs.length-1;i++)if(M.zs[i][1]>M.zs[i-1][1]&&M.zs[i][1]>=M.zs[i+1][1])dot(ctx,A.X(M.zs[i][0]),A.Y(M.zs[i][1]),3.5,K.w);
    const s0=Math.min(w-50,h-hh-36),B=axes(ctx,{l:40+(w-50-s0)/2,t:hh+6,w:s0,h:h-hh-34,xr:[zmin-pad,zmax+pad],yr:[zmin-pad,zmax+pad],xl:'z_n',yl:'z_{n+1}'});
    curve(ctx,B,x=>x,zmin-pad,zmax+pad,K.mut,1.4,[5,4]);
    for(let i=0;i<z.length-1;i++)dot(ctx,B.X(z[i]),B.Y(z[i+1]),1.8,K.a);
    if(web>0){ctx.save();ctx.strokeStyle=K.b;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(B.X(z[0]),B.Y(z[0]));for(let i=0;i<web;i++){ctx.lineTo(B.X(z[i]),B.Y(z[i+1]));ctx.lineTo(B.X(z[i+1]),B.Y(z[i+1]));}ctx.stroke();ctx.restore();dot(ctx,B.X(z[web]),B.Y(z[web]),5,K.b,'#fff');}
    /* pendiente mínima estimada por vecinos */
    const pr=z.slice(0,-1).map((v,i)=>[v,z[i+1]]).sort((p,q)=>p[0]-q[0]);let smin=Infinity;for(let i=0;i+6<pr.length;i+=3){const p=pr[i],q=pr[i+6];if(q[0]-p[0]>0.3){const s=Math.abs((q[1]-p[1])/(q[0]-p[0]));if(s<smin)smin=s;}}
    rd.innerHTML=row('r',nf(M.r,1))+row('máximos registrados',z.length)+row('rango de z_n',nf(zmin,1)+' – '+nf(zmax,1))+(isFinite(smin)?row('mín |f′| estimado',nf(smin,2)):'')+row('paso de telaraña',web)+sep+
      rowT(M.r<31?'Curva en forma de tienda con |f′| &gt; 1 en todas partes: cualquier ciclo de este mapa es inestable, así que el atractor no puede ser un ciclo estable.':'Para r mayor la nube puede dejar de ser una curva limpia o concentrarse en pocos puntos (ventanas periódicas, por ejemplo cerca de r ≈ 100–160 fuera de este rango).');}
  /* ---- Lyapunov ---- */
  const cv2=$('#dn12-cv2',sec),rd2=$('#dn12-read2',sec);let L=null;
  const gd=sl(sec,'dn12-d',v=>'10^'+v,()=>{L=null;draw2();}),ga=sl(sec,'dn12-a',v=>'10^'+nf(v,1),()=>draw2());
  $('#dn12-go',sec).addEventListener('click',()=>{L=null;draw2();});
  function lyap(){const f=pB_lorenz(10,28,8/3),h=0.005,d0=Math.pow(10,gd());const u=[Math.random()*2-1,Math.random()*2-1,20+Math.random()*4];for(let t=0;t<15;t+=h)pB_step(f,u,h,3);
    const ref=u.slice(),v=[u[0]+d0,u[1],u[2]],sep_=[];let t=0;for(let i=0;i<Math.round(30/h);i++){pB_step(f,ref,h,3);pB_step(f,v,h,3);t+=h;if(i%10===0)sep_.push([t,Math.log(Math.max(1e-300,Math.hypot(ref[0]-v[0],ref[1]-v[1],ref[2]-v[2])))]);}
    /* Benettin */const r2=u.slice(),q=[u[0]+1e-8,u[1],u[2]];let S=0;const est=[];const nS=Math.round(0.5/h);
    for(let k=1;k<=400;k++){for(let i=0;i<nS;i++){pB_step(f,r2,h,3);pB_step(f,q,h,3);}const dv=[q[0]-r2[0],q[1]-r2[1],q[2]-r2[2]],d=Math.hypot(...dv);S+=Math.log(d/1e-8);for(let j=0;j<3;j++)q[j]=r2[j]+dv[j]*1e-8/d;if(k%5===0)est.push([k*0.5,S/(k*0.5)]);}
    return {d0,sep:sep_,est,lam:S/200};}
  function draw2(){
    if(!vis(cv2))return;if(!L)L=lyap();const {ctx,w,h}=fit(cv2,.8,480,320),hh=Math.floor(h*0.58);
    const lam=L.lam,a=Math.pow(10,ga()),th=Math.log(a/L.d0)/lam,L0=Math.log(L.d0);
    const A=axes(ctx,{l:36,t:8,w:w-46,h:hh-30,xr:[0,30],yr:[Math.min(-30,L0-2),5],xl:'t',yl:'ln|δ|'});
    path(ctx,A,L.sep,K.d,2);curve(ctx,A,x=>L0+lam*x,0,30,K.mut,1.4,[5,4]);
    ctx.save();ctx.strokeStyle=K.f;ctx.lineWidth=1.2;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(A.o.l,A.Y(Math.log(a)));ctx.lineTo(A.o.l+A.o.w,A.Y(Math.log(a)));ctx.stroke();
    ctx.strokeStyle=K.w;ctx.setLineDash([]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(A.X(th),A.o.t);ctx.lineTo(A.X(th),A.o.t+A.o.h);ctx.stroke();ctx.restore();label(ctx,'t_h',A.X(th)+5,A.o.t+10,K.w);
    const B=axes(ctx,{l:36,t:hh+6,w:w-46,h:h-hh-30,xr:[0,200],yr:[0,1.6],xl:'t (Benettin)',yl:'λ estimado'});path(ctx,B,L.est,K.t,2);
    ctx.save();ctx.strokeStyle=K.mut;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(B.o.l,B.Y(0.906));ctx.lineTo(B.o.l+B.o.w,B.Y(0.906));ctx.stroke();ctx.restore();
    let tm=NaN;for(const p of L.sep)if(p[1]>=Math.log(a)){tm=p[0];break;}
    rd2.innerHTML=row('λ₁ (Benettin, 200 u.t.)',nf(lam,3))+row('referencia',nf(0.906,3))+row('λ₃ = −41/3 − λ₁',nf(-41/3-lam,2))+row('D_KY',nf(2+lam/(41/3+lam),3))+sep+
      row('δ₀ → a',L.d0.toExponential(0)+' → '+a.toExponential(0))+row('t_h teórico',nf(th,1))+row('t_h medido',isFinite(tm)?nf(tm,1):'&gt; 30')+sep+rowT('Recalcula varias veces: cada corrida usa otra condición inicial en el atractor. El exponente converge a ≈ 0,9; el horizonte de una corrida individual fluctúa porque la expansión no es uniforme.');}
  return {draw(){draw1();draw2();}};
};

/* ================= PARTE C · Unidades V (mapas) y VI · temas 13–18 ================= */
/* ---- utilidades propias de la parte C ---- */
/* laboratorio con varios canvas apilados en la columna izquierda */
const pC_lab=(cvs,ctrl,rd,hint)=>`<div class="two"><div>${cvs.map((c,i)=>`<div class="canvas-box"${i?' style="margin-top:10px"':''}><canvas id="${c}"></canvas></div>`).join('')}${ctrl?`<div class="controls">${ctrl}</div>`:''}</div><div><div class="readout" id="${rd}"></div>${hint?`<p class="hint" style="margin-top:12px">${hint}</p>`:''}</div></div>`;
/* raíces de g en [a,b], incluyendo ceros exactos sobre la malla */
function pC_roots(g,a,b,n=1200){const r=[];let x0=a,g0=g(a);if(Math.abs(g0)<1e-12)r.push(a);
  for(let i=1;i<=n;i++){const x1=a+(b-a)*i/n,g1=g(x1);if(Math.abs(g1)<1e-12){r.push(x1);}else if(isFinite(g0)&&isFinite(g1)&&g0*g1<0&&Math.abs(g0)>=1e-12)r.push(bisect(g,x0,x1));x0=x1;g0=g1;}
  return r.filter((v,i)=>!i||Math.abs(v-r[i-1])>1e-6);}
/* período de una órbita ya asentada (0 si no se detecta hasta pmax) */
function pC_period(f,x,pmax=64,tol=1e-6){const s=[x];for(let i=0;i<pmax;i++){x=f(x);s.push(x);}
  for(let p=1;p<=pmax;p++){if(Math.abs(s[p]-s[0])<tol*(1+Math.abs(s[0]))){let ok=true;for(let k=1;k+p<s.length&&k<8;k++)if(Math.abs(s[k+p]-s[k])>tol*(1+Math.abs(s[k]))){ok=false;break;}if(ok)return p;}}return 0;}
/* zoom por arrastre de un rectángulo sobre unos ejes A; cb(x0,x1,y0,y1) o click(x,y) */
function pC_zoom(cv,getA,cb,click,overlay){let st=null;
  const pos=e=>{const r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];};
  cv.style.cursor='crosshair';
  cv.addEventListener('pointerdown',e=>{const A=getA();if(!A)return;const p=pos(e);if(!inA(A,p[0],p[1]))return;st={a:p,b:p};cv.setPointerCapture(e.pointerId);e.preventDefault();});
  cv.addEventListener('pointermove',e=>{if(!st)return;st.b=pos(e);overlay(st.a,st.b);});
  const up=()=>{if(!st)return;const A=getA(),a=st.a,b=st.b;st=null;
    if(Math.abs(a[0]-b[0])<6||Math.abs(a[1]-b[1])<6){const q=invA(A,a[0],a[1]);click(q[0],q[1]);return;}
    const p=invA(A,Math.min(a[0],b[0]),Math.max(a[1],b[1])),q=invA(A,Math.max(a[0],b[0]),Math.min(a[1],b[1]));cb(p[0],q[0],p[1],q[1]);};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',()=>{st=null;overlay(null);});}
function pC_rect(ctx,a,b){if(!a)return;ctx.save();ctx.fillStyle='rgba(15,118,110,.12)';ctx.strokeStyle=K.t;ctx.lineWidth=1.5;ctx.setLineDash([5,4]);
  const x=Math.min(a[0],b[0]),y=Math.min(a[1],b[1]),w=Math.abs(a[0]-b[0]),h=Math.abs(a[1]-b[1]);ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h);ctx.restore();}
/* diagrama de bifurcación de un mapa 1D como imagen de densidad (lienzo fuera de pantalla) */
function pC_bifImg(f,W,H,r0,r1,x0,x1,trans,M,seed=0.5,col=[28,34,48]){
  const off=document.createElement('canvas');off.width=W;off.height=H;const oc=off.getContext('2d'),img=oc.createImageData(W,H),D=img.data,cnt=new Uint16Array(W*H);
  for(let i=0;i<W;i++){const r=r0+(r1-r0)*(i+0.5)/W;let x=seed;for(let k=0;k<trans;k++)x=f(x,r);
    for(let k=0;k<M;k++){x=f(x,r);if(!isFinite(x))break;const j=Math.floor((x1-x)/(x1-x0)*H);if(j>=0&&j<H){const q=j*W+i;if(cnt[q]<65000)cnt[q]++;}}}
  for(let q=0;q<W*H;q++){const c=cnt[q];if(!c)continue;const k=q*4;D[k]=col[0];D[k+1]=col[1];D[k+2]=col[2];D[k+3]=Math.min(255,70+45*Math.log2(c));}
  oc.putImageData(img,0,0);return off;}
/* exponente de Lyapunov de un mapa 1D */
function pC_lyap(f,df,r,x=0.5,trans=400,n=1500){for(let k=0;k<trans;k++)x=f(x,r);let s=0;
  for(let k=0;k<n;k++){const d=Math.abs(df(x,r));s+=Math.log(Math.max(d,1e-300));x=f(x,r);}return s/n;}
const pC_logi=(x,r)=>r*x*(1-x),pC_dlogi=(x,r)=>r*(1-2*x);
/* línea vertical etiquetada sobre unos ejes */
function pC_vline(ctx,A,x,col,txt,dash=[4,4]){if(x<A.o.xr[0]||x>A.o.xr[1])return;ctx.save();ctx.strokeStyle=col;ctx.lineWidth=1.2;ctx.setLineDash(dash);
  ctx.beginPath();ctx.moveTo(A.X(x),A.o.t);ctx.lineTo(A.X(x),A.o.t+A.o.h);ctx.stroke();ctx.restore();if(txt)label(ctx,txt,A.X(x)+4,A.o.t+12,col,'left','middle','600 11px Inter, sans-serif');}

/* ================= 13 · MAPAS UNIDIMENSIONALES Y TELARAÑA ================= */
V.push(String.raw`<section class="view theme-aa" data-view="dn-mapas-1d">
<div class="eyebrow">Dinámica no lineal y caos · Unidad V · Caos</div><h1>Mapas unidimensionales, puntos fijos y telaraña</h1><p class="lead">Un mapa \(x_{n+1}=f(x_n)\) es un sistema dinámico de tiempo discreto. Aparece al muestrear un flujo (mapa de Poincaré, máximos sucesivos de Lorenz), en poblaciones con generaciones que no se solapan y en todo algoritmo iterativo. A diferencia de los flujos en la recta, un mapa de una sola variable ya puede oscilar y ser caótico, porque la órbita salta en lugar de deslizarse.</p>
<div class="toc"><a href="#dn13-res" data-scroll>Resumen</a><a href="#dn13-lab" data-scroll>Visualiza</a><a href="#dn13-leyes" data-scroll>Leyes y fórmulas</a><a href="#dn13-ej" data-scroll>Ejemplo</a></div>
<div class="block" id="dn13-res"><h2><span class="ico">≡</span>Resumen</h2><ul class="keypoints">
<li><b>Órbita.</b> Dado \(x_0\), la sucesión \(x_0,\ x_1=f(x_0),\ x_2=f(f(x_0))=f^2(x_0),\dots\) es la órbita de \(x_0\). Aquí \(f^n\) denota la \(n\)-ésima <i>iterada</i> (composición), no la potencia.</li>
<li><b>Puntos fijos y estabilidad lineal.</b> \(x^*=f(x^*)\). Con \(x_n=x^*+\eta_n\): \(\eta_{n+1}=f'(x^*)\,\eta_n+O(\eta_n^2)\), así que \(\eta_n\approx\lambda^n\eta_0\) con el <i>multiplicador</i> \(\lambda=f'(x^*)\). Si \(|\lambda|\lt1\) el punto es linealmente estable; si \(|\lambda|>1\), inestable; \(|\lambda|=1\) es marginal y decide el orden siguiente.</li>
<li><b>Superestabilidad.</b> Si \(f'(x^*)=0\), \(\eta_{n+1}\approx\tfrac12f''(x^*)\,\eta_n^2\): la convergencia es cuadrática (el número de cifras correctas se duplica en cada paso). Es lo que hace tan rápido al método de Newton.</li>
<li><b>Diagrama de telaraña.</b> Desde \((x_n,x_n)\) se sube o baja en vertical hasta la curva \(y=f(x)\) y se va en horizontal hasta la diagonal \(y=x\): se llega a \((x_{n+1},x_{n+1})\). Si \(0\lt f'(x^*)\lt1\) la órbita se acerca en escalera; si \(-1\lt f'(x^*)\lt0\), en espiral alternando de lado.</li>
<li><b>Ciclos.</b> Un ciclo de período \(p\) es un conjunto \(\{x_1,\dots,x_p\}\) con \(f(x_i)=x_{i+1}\), \(f(x_p)=x_1\): cada \(x_i\) es punto fijo de \(f^p\). Por la regla de la cadena su multiplicador es \((f^p)'(x_1)=\prod_{i=1}^pf'(x_i)\), el mismo para todos los puntos del ciclo.</li>
<li><b>Mapa logístico.</b> \(x_{n+1}=rx_n(1-x_n)\), \(0\le r\le4\), deja invariante \([0,1]\). Puntos fijos \(x^*=0\) (multiplicador \(r\)) y \(x^*=1-1/r\) (multiplicador \(2-r\)). El segundo es estable para \(1\lt r\lt3\); en \(r=3\) su multiplicador pasa por \(-1\) y nace un 2-ciclo (bifurcación de <i>flip</i> o duplicación de período).</li>
<li><b>Mapas frente a flujos.</b> En un flujo \(\dot x=f(x)\) las trayectorias no pueden cruzarse ni oscilar. Un mapa sí, porque \(f\) no tiene por qué ser invertible: el mapa logístico es 2 a 1, y ese plegado es el ingrediente del caos en 1D.</li></ul></div>
<div class="block" id="dn13-lab"><h2><span class="ico">◎</span>Visualiza</h2>`
+pC_lab(['dn13-cv','dn13-cv2'],sel('dn13-map',[['log','x ↦ r x(1 − x)  (logístico)'],['sin','x ↦ r sin(πx)  (seno)'],['tent','x ↦ r·min(x, 1 − x)  (tienda)'],['cub','x ↦ r x − x³  (cúbico)']])
  +slider('dn13-r','r',0,4,0.001,2.8)+slider('dn13-x0','x₀',0,1,0.001,0.12)+slider('dn13-n','iteraciones',1,200,1,30)
  +seg('dn13-f2','s',[['1','f'],['2','f y f²']])+btn('dn13-play','▶ Animar',false),
  'dn13-read',String.raw`Arriba: telaraña sobre \(y=f(x)\) y la diagonal; haz clic en el gráfico para elegir \(x_0\). Abajo: la serie \(x_n\). Con «f y f²» aparece la segunda iterada: los cortes de \(f^2\) con la diagonal que no son puntos fijos de \(f\) son el 2-ciclo. En el logístico, prueba \(r=2{,}8\) (espiral), \(r=3{,}2\) (2-ciclo), \(r=3{,}5\) (4-ciclo) y \(r=3{,}9\) (caos).`)
+String.raw`</div>
<div class="block" id="dn13-leyes"><h2><span class="ico">§</span>Leyes y fórmulas</h2><div class="laws">
<div class="law"><h3>Estabilidad de un punto fijo</h3><div class="eq">\[ x^*=f(x^*),\qquad |f'(x^*)|\lt1\Rightarrow\text{estable},\qquad |f'(x^*)|>1\Rightarrow\text{inestable} \]</div><p>El error se multiplica por \(\lambda=f'(x^*)\) en cada iteración.</p></div>
<div class="law"><h3>Multiplicador de un ciclo</h3><div class="eq">\[ \lambda_p=(f^p)'(x_1)=\prod_{i=1}^{p}f'(x_i) \]</div><p>Regla de la cadena; no depende del punto del ciclo elegido.</p></div>
<div class="law"><h3>Convergencia superestable</h3><div class="eq">\[ f'(x^*)=0\ \Rightarrow\ \eta_{n+1}\approx\frac{f''(x^*)}{2}\,\eta_n^2 \]</div><p>Newton \(x_{n+1}=x_n-g(x_n)/g'(x_n)\) tiene \(f'(x^*)=0\) en cada raíz simple.</p></div>
<div class="law"><h3>Puntos fijos del mapa logístico</h3><div class="eq">\[ x^*=0\ (\lambda=r),\qquad x^*=1-\frac1r\ (\lambda=2-r) \]</div><p>El no trivial existe en \([0,1]\) para \(r\ge1\) y es estable si \(1\lt r\lt3\).</p></div>
<div class="law"><h3>2-ciclo del mapa logístico</h3><div class="eq">\[ p,q=\frac{r+1\pm\sqrt{(r-3)(r+1)}}{2r},\qquad \lambda_2=-r^2+2r+4 \]</div><p>Existe para \(r>3\) y es estable mientras \(|\lambda_2|\lt1\), es decir \(3\lt r\lt1+\sqrt6\approx3{,}449\).</p></div>
<div class="law"><h3>Teorema de Sharkovskii (período 3 implica caos)</h3><div class="eq">\[ 3\rhd5\rhd7\rhd\cdots\rhd2\cdot3\rhd2\cdot5\rhd\cdots\rhd2^2\cdot3\rhd\cdots\rhd2^3\rhd2^2\rhd2\rhd1 \]</div><p>Si un mapa continuo de la recta tiene un ciclo de período \(p\), tiene ciclos de todo período \(q\) con \(p\rhd q\). Un 3-ciclo obliga a tener ciclos de todos los períodos (Li y Yorke, 1975).</p></div>
</div></div>
<div class="block" id="dn13-ej"><h2><span class="ico">✎</span>Ejemplo resuelto</h2><div class="example"><p><b>Para el mapa logístico con \(r=3{,}2\), halla el 2-ciclo, su multiplicador y decide si es estable. ¿Hasta qué valor de \(r\) sigue siéndolo?</b></p><ol>
<li>Los puntos del 2-ciclo cumplen \(f^2(x)=x\). El polinomio \(f^2(x)-x\) es de grado 4 y contiene los puntos fijos \(x=0\) y \(x=1-1/r\); al dividir por ellos queda \(r^2x^2-r(r+1)x+(r+1)=0\).</li>
<li>Por tanto \(p+q=\dfrac{r+1}{r}\) y \(pq=\dfrac{r+1}{r^2}\), con \(p,q=\dfrac{r+1\pm\sqrt{(r-3)(r+1)}}{2r}\). Son reales y distintos sólo si \(r>3\): el 2-ciclo nace en el flip de \(r=3\).</li>
<li>Con \(r=3{,}2\): \((r-3)(r+1)=0{,}2\cdot4{,}2=0{,}84\), \(\sqrt{0{,}84}=0{,}91652\), así que \(p=\dfrac{4{,}2+0{,}91652}{6{,}4}=0{,}79946\) y \(q=\dfrac{4{,}2-0{,}91652}{6{,}4}=0{,}51304\). Comprobación: \(3{,}2\cdot0{,}79946\cdot0{,}20054=0{,}51304\). ✓</li>
<li>Multiplicador: \(\lambda_2=f'(p)f'(q)=r^2(1-2p)(1-2q)=r^2\big[1-2(p+q)+4pq\big]=r^2-2r(r+1)+4(r+1)=-r^2+2r+4\).</li>
<li>En \(r=3{,}2\): \(\lambda_2=-10{,}24+6{,}4+4=0{,}16\). Directamente: \(f'(p)=3{,}2(1-1{,}59891)=-1{,}91651\), \(f'(q)=3{,}2(1-1{,}02609)=-0{,}08349\), producto \(0{,}16\). ✓ Como \(|\lambda_2|\lt1\), el 2-ciclo es estable (aunque \(|f'(p)|>1\): lo que importa es el producto).</li>
<li>Pierde la estabilidad cuando \(\lambda_2=-1\): \(r^2-2r-5=0\Rightarrow r=1+\sqrt6\approx3{,}4495\). Ahí se duplica de nuevo y aparece el 4-ciclo.</li></ol><p style="margin:.6em 0 0">El 2-ciclo es \(\{0{,}5130;\ 0{,}7995\}\), con \(\lambda_2=0{,}16\), estable para \(3\lt r\lt1+\sqrt6\). En el laboratorio, con «f y f²» se ve que \(p\) y \(q\) son los cortes nuevos de \(f^2\) con la diagonal.</p></div></div>
<div class="pager"><a href="#dn-lorenz-mapa"><small>← Anterior</small>Mapa de Lorenz, exponentes de Lyapunov y predictibilidad</a><a class="next" href="#dn-logistico"><small>Siguiente →</small>Mapa logístico: duplicación de período, ventanas y exponente de Lyapunov</a></div>
<p class="note">Contenido de referencia: Strogatz, <i>Nonlinear Dynamics and Chaos</i>, 3.ª ed., §10.1–10.3 y ejercicio 10.3.1; Alligood, Sauer y Yorke, <i>Chaos</i>, cap. 1 y 3 (Sharkovskii). Redacción y simulaciones propias.</p></section>`);
LABS['dn-mapas-1d']=function(sec){
  const cv=$('#dn13-cv',sec),cv2=$('#dn13-cv2',sec),rd=$('#dn13-read',sec),sm=$('#dn13-map',sec),rs=$('#dn13-r',sec),xs=$('#dn13-x0',sec);
  const M={
    log:{f:(x,r)=>r*x*(1-x),df:(x,r)=>r*(1-2*x),R:[0,4,2.8],D:[0,1],x0:0.12,t:'r x(1 − x)'},
    sin:{f:(x,r)=>r*Math.sin(Math.PI*x),df:(x,r)=>r*Math.PI*Math.cos(Math.PI*x),R:[0,1,0.7],D:[0,1],x0:0.12,t:'r sin(πx)'},
    tent:{f:(x,r)=>r*Math.min(x,1-x),df:(x,r)=>x<0.5?r:-r,R:[0,2,1.5],D:[0,1],x0:0.123,t:'r·min(x, 1 − x)'},
    cub:{f:(x,r)=>r*x-x*x*x,df:(x,r)=>r-3*x*x,R:[0,3,1.8],D:[-2,2],x0:0.3,t:'r x − x³'}};
  let m=M.log,shown=null,play=false,acc=0,A1=null;
  const gr=sl(sec,'dn13-r',v=>nt(v,3),()=>{shown=null;draw();}),gx=sl(sec,'dn13-x0',v=>nt(v,3),()=>{shown=null;draw();}),gn=sl(sec,'dn13-n',null,()=>{shown=null;draw();});
  const g2=segm(sec,'dn13-f2','s',()=>draw());
  function setMap(){m=M[sm.value];rs.min=m.R[0];rs.max=m.R[1];rs.step=(m.R[1]-m.R[0])/4000;gr.set(m.R[2]);xs.min=m.D[0];xs.max=m.D[1];xs.step=(m.D[1]-m.D[0])/1000;gx.set(m.x0);shown=null;draw();}
  sm.addEventListener('change',setMap);
  const pb=$('#dn13-play',sec);pb.addEventListener('click',()=>{play=!play;if(play){shown=0;acc=0;}pb.textContent=play?'❚❚ Pausa':'▶ Animar';draw();});
  clickPos(cv,(px,py)=>{if(!A1||!inA(A1,px,py))return;const q=invA(A1,px,py);gx.set(clamp(q[0],m.D[0],m.D[1]));shown=null;draw();});
  function orbitPts(){const r=gr(),N=gn();const o=[gx()];for(let i=0;i<N;i++){const v=m.f(o[o.length-1],r);if(!isFinite(v)||Math.abs(v)>1e3)break;o.push(v);}return o;}
  function draw(){
    if(!vis(cv))return;const r=gr(),f=x=>m.f(x,r),o=orbitPts(),k=shown==null?o.length-1:Math.min(shown,o.length-1);
    let {ctx,w,h}=fit(cv,.78,420,260);const D=m.D;
    A1=axes(ctx,{l:40,t:10,w:w-52,h:h-34,xr:D,yr:D,xl:'xₙ',yl:'xₙ₊₁'});
    ctx.save();ctx.strokeStyle=K.ax;ctx.setLineDash([5,4]);ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(A1.X(D[0]),A1.Y(D[0]));ctx.lineTo(A1.X(D[1]),A1.Y(D[1]));ctx.stroke();ctx.restore();
    if(g2()==='2')curve(ctx,A1,x=>f(f(x)),D[0],D[1],K.d,1.8,[6,3],600);
    curve(ctx,A1,f,D[0],D[1],K.t,2.6,null,600);
    ctx.save();ctx.beginPath();ctx.rect(A1.o.l,A1.o.t,A1.o.w,A1.o.h);ctx.clip();ctx.lineWidth=1.4;
    for(let i=0;i<k;i++){const a=o[i],b=o[i+1],al=0.25+0.75*(i+1)/Math.max(1,k);ctx.strokeStyle=`rgba(217,72,15,${al})`;ctx.beginPath();
      ctx.moveTo(A1.X(a),A1.Y(i?a:D[0]));ctx.lineTo(A1.X(a),A1.Y(b));ctx.lineTo(A1.X(b),A1.Y(b));ctx.stroke();}
    ctx.restore();
    const fx=pC_roots(x=>f(x)-x,D[0],D[1]);
    fx.forEach(x=>{const st=Math.abs(m.df(x,r))<1;dot(ctx,A1.X(x),A1.Y(x),5.5,st?K.ink:'#fff',st?null:K.ink);});
    dot(ctx,A1.X(o[0]),A1.Y(D[0])-1,5,K.b);
    /* serie temporal */
    ({ctx,w,h}=fit(cv2,.32,170,120));
    const N=gn(),A2=axes(ctx,{l:40,t:8,w:w-52,h:h-30,xr:[0,N],yr:D,xl:'n',yl:'xₙ'});
    ctx.save();ctx.strokeStyle='rgba(15,118,110,.45)';ctx.lineWidth=1.2;ctx.beginPath();for(let i=0;i<=k;i++){i?ctx.lineTo(A2.X(i),A2.Y(o[i])):ctx.moveTo(A2.X(i),A2.Y(o[i]));}ctx.stroke();ctx.restore();
    if(N<=120)for(let i=0;i<=k;i++)dot(ctx,A2.X(i),A2.Y(o[i]),2.4,K.t);
    /* lectura */
    let s=row('mapa','f(x) = '+m.t)+row('r',nt(r,3));
    fx.forEach(x=>{const l=m.df(x,r);s+=row('x*',nt(x,4)+' → λ = '+nt(l,3)+(Math.abs(l)<1?' <span class="aa-ok">estable</span>':' <span class="aa-no">inestable</span>'));});
    let y=o[o.length-1];for(let i=0;i<2000;i++)y=f(y);const p=isFinite(y)?pC_period(f,y,64,1e-7):0;
    s+=sep+row('x_N',nt(o[k],5))+row('atractor',!isFinite(y)?'la órbita escapa':p===1?'punto fijo':p?'ciclo de período '+p:'sin período ≤ 64 (¿caos?)');
    if(p>1){let pr=1,z=y;for(let i=0;i<p;i++){pr*=m.df(z,r);z=f(z);}s+=row('multiplicador del ciclo',nt(pr,4));}
    rd.innerHTML=s;
  }
  return {draw,tick(dt){if(!play||!vis(cv))return;acc+=dt;if(acc>0.18){acc=0;shown++;if(shown>=gn()){play=false;pb.textContent='▶ Animar';shown=null;}draw();}}};
};

/* ================= 14 · MAPA LOGÍSTICO ================= */
V.push(String.raw`<section class="view theme-aa" data-view="dn-logistico">
<div class="eyebrow">Dinámica no lineal y caos · Unidad V · Caos</div><h1>Mapa logístico: duplicación de período, ventanas y exponente de Lyapunov</h1><p class="lead">Un polinomio de grado dos, \(x_{n+1}=rx_n(1-x_n)\), contiene casi todo el repertorio del caos: una cascada infinita de duplicaciones de período que se acumula en \(r_\infty\approx3{,}5699\), bandas caóticas, ventanas periódicas y crisis. El exponente de Lyapunov separa con un número lo periódico de lo caótico.</p>
<div class="toc"><a href="#dn14-res" data-scroll>Resumen</a><a href="#dn14-lab" data-scroll>Visualiza</a><a href="#dn14-leyes" data-scroll>Leyes y fórmulas</a><a href="#dn14-ej" data-scroll>Ejemplo</a></div>
<div class="block" id="dn14-res"><h2><span class="ico">≡</span>Resumen</h2><ul class="keypoints">
<li><b>Régimen simple.</b> Para \(0\le r\lt1\) todo va a \(x^*=0\); para \(1\lt r\lt3\), a \(x^*=1-1/r\) (con aproximación en espiral si \(r>2\), porque \(f'(x^*)=2-r\lt0\)).</li>
<li><b>Cascada de duplicaciones.</b> En \(r_1=3\) nace el 2-ciclo, en \(r_2=1+\sqrt6=3{,}4495\) el 4-ciclo, en \(r_3=3{,}5441\) el 8-ciclo, en \(r_4=3{,}5644\) el 16-ciclo… Los intervalos se acortan geométricamente, \((r_n-r_{n-1})/(r_{n+1}-r_n)\to\delta=4{,}6692\), y se acumulan en \(r_\infty=3{,}569946\).</li>
<li><b>Más allá de \(r_\infty\).</b> Para la mayoría de los \(r\in(r_\infty,4]\) la órbita es aperiódica y sensible a las condiciones iniciales. El atractor se organiza en \(2^k\) bandas que se van fusionando (cascada inversa) hasta ocupar \([f^2(1/2),f(1/2)]\).</li>
<li><b>Ventanas periódicas.</b> Entre el caos hay intervalos de \(r\) con ciclos estables. La más ancha es la del 3-ciclo, que nace en \(r=1+\sqrt8\approx3{,}8284\) por una bifurcación tangente (silla-nodo de \(f^3\)) y después se duplica a 6, 12, 24…, una copia en miniatura del diagrama entero.</li>
<li><b>Intermitencia.</b> Justo antes de \(r=1+\sqrt8\) la órbita pasa largos ratos casi periódicos (un «canal» estrecho entre \(f^3\) y la diagonal) interrumpidos por ráfagas caóticas; la duración media de las fases laminares escala como \((r_c-r)^{-1/2}\).</li>
<li><b>Exponente de Lyapunov.</b> \(\lambda=\lim_{n\to\infty}\frac1n\sum_{i=0}^{n-1}\ln|f'(x_i)|\) mide la tasa media de separación de órbitas vecinas: \(|\delta_n|\approx|\delta_0|e^{n\lambda}\). \(\lambda\lt0\) en ciclos estables (y \(\lambda\to-\infty\) en los superestables), \(\lambda=0\) en cada bifurcación, \(\lambda>0\) en el caos.</li>
<li><b>El caso \(r=4\).</b> Con \(x=\sin^2(\pi\theta)\) el mapa se vuelve \(\theta_{n+1}=2\theta_n\bmod1\): desplazamiento de la expansión binaria. Por eso la solución es exacta, \(x_n=\sin^2(2^n\pi\theta_0)\), la densidad invariante es \(\rho(x)=\dfrac{1}{\pi\sqrt{x(1-x)}}\) y \(\lambda=\ln2\).</li></ul></div>
<div class="block" id="dn14-lab"><h2><span class="ico">◎</span>Visualiza</h2>`
+tabs([['bif','Diagrama de bifurcación',pC_lab(['dn14-cv'],btn('dn14-reset','Restablecer zoom')+seg('dn14-mk','m',[['1','marcar r_n'],['0','sin marcas']]),'dn14-read',String.raw`Arrastra un rectángulo para ampliar (la imagen se recalcula con más iteraciones). Un clic fija \(r\) y muestra su atractor y su \(\lambda\). Busca la ventana de período 3 cerca de \(r=3{,}83\) y amplía una de sus ramas: reaparece el diagrama completo.`)],
       ['lyap','Exponente de Lyapunov',pC_lab(['dn14-cv2','dn14-cv3'],'','dn14-read2',String.raw`Arriba: \(\lambda(r)\) en el mismo intervalo de \(r\) que el diagrama de bifurcación (\(\lambda\) se hunde a \(-\infty\) en los \(r\) superestables y toca 0 en cada bifurcación). Abajo: dos órbitas que empiezan a \(10^{-10}\) y \(\ln|\delta_n|\); su pendiente es \(\lambda\). Haz clic arriba para cambiar \(r\).`)]])
+String.raw`</div>
<div class="block" id="dn14-leyes"><h2><span class="ico">§</span>Leyes y fórmulas</h2><div class="laws">
<div class="law"><h3>Mapa logístico</h3><div class="eq">\[ x_{n+1}=rx_n(1-x_n),\qquad 0\le r\le4,\ x\in[0,1] \]</div><p>Máximo cuadrático en \(x=1/2\) de altura \(r/4\).</p></div>
<div class="law"><h3>Exponente de Lyapunov</h3><div class="eq">\[ \lambda=\lim_{n\to\infty}\frac1n\sum_{i=0}^{n-1}\ln|f'(x_i)|=\lim_{n\to\infty}\frac1n\ln|(f^n)'(x_0)| \]</div><p>Para un \(p\)-ciclo estable, \(\lambda=\frac1p\ln|\lambda_p|\lt0\).</p></div>
<div class="law"><h3>Cascada de duplicación</h3><div class="eq">\[ r_1=3,\ r_2=1+\sqrt6,\ \dots,\quad r_\infty-r_n\approx C\,\delta^{-n},\ \ r_\infty=3{,}5699456 \]</div><p>\(\delta=4{,}6692016\) es la constante de Feigenbaum.</p></div>
<div class="law"><h3>Ventana de período 3</h3><div class="eq">\[ r_c=1+\sqrt8\approx3{,}8284,\qquad \langle T_{\text{laminar}}\rangle\propto(r_c-r)^{-1/2} \]</div><p>Bifurcación tangente de \(f^3\); antes de \(r_c\), intermitencia de tipo I (Pomeau-Manneville).</p></div>
<div class="law"><h3>Solución exacta en \(r=4\)</h3><div class="eq">\[ x_n=\sin^2\!\big(2^n\pi\theta_0\big),\qquad \rho(x)=\frac{1}{\pi\sqrt{x(1-x)}} \]</div><p>Conjugación con el mapa de desplazamiento \(\theta\mapsto2\theta\bmod1\).</p></div>
<div class="law"><h3>Teorema ergódico (promedio temporal = espacial)</h3><div class="eq">\[ \lambda=\int_0^1\ln|f'(x)|\,\rho(x)\,dx \]</div><p>Válido para casi todo \(x_0\) cuando existe una medida invariante ergódica \(\rho\).</p></div>
</div></div>
<div class="block" id="dn14-ej"><h2><span class="ico">✎</span>Ejemplo resuelto</h2><div class="example"><p><b>Demuestra que para \(r=4\) el mapa logístico tiene \(\lambda=\ln2\): primero conjúgalo con el mapa de desplazamiento y después calcula \(\lambda\) con la densidad invariante.</b></p><ol>
<li>Sustituye \(x_n=\sin^2(\pi\theta_n)\): \(4x_n(1-x_n)=4\sin^2(\pi\theta_n)\cos^2(\pi\theta_n)=\sin^2(2\pi\theta_n)\). Por tanto \(x_{n+1}=\sin^2(\pi\theta_{n+1})\) con \(\theta_{n+1}=2\theta_n\bmod1\).</li>
<li>El mapa \(\theta\mapsto2\theta\bmod1\) desplaza un lugar la expansión binaria de \(\theta\): estiramiento uniforme por 2, de modo que sus órbitas vecinas se separan como \(2^n\) y su exponente vale exactamente \(\ln2\). La conjugación es suave salvo en los extremos, así que \(\lambda\) del logístico también será \(\ln2\); lo verificamos.</li>
<li>Densidad invariante: la medida de Lebesgue es invariante para \(\theta\mapsto2\theta\bmod1\), así que \(\theta\) es uniforme en \([0,1]\). Cada \(x\) tiene dos preimágenes, \(\theta\) y \(1-\theta\), y \(dx/d\theta=\pi\sin2\pi\theta=2\pi\sqrt{x(1-x)}\); por tanto \(\rho(x)=2\Big|\dfrac{d\theta}{dx}\Big|=\dfrac{1}{\pi\sqrt{x(1-x)}}\). Está normalizada: \(\int_0^1\rho\,dx=1\).</li>
<li>\(\lambda=\displaystyle\int_0^1\frac{\ln|4(1-2x)|}{\pi\sqrt{x(1-x)}}\,dx\). Con \(x=\sin^2(\varphi/2)\), \(\varphi\in[0,\pi]\): \(1-2x=\cos\varphi\) y \(\dfrac{dx}{\pi\sqrt{x(1-x)}}=\dfrac{d\varphi}{\pi}\).</li>
<li>\(\lambda=\ln4+\dfrac1\pi\displaystyle\int_0^\pi\ln|\cos\varphi|\,d\varphi=\ln4+\frac1\pi(-\pi\ln2)=\ln4-\ln2=\ln2\approx0{,}6931\), usando la integral clásica \(\int_0^{\pi}\ln|\cos\varphi|\,d\varphi=-\pi\ln2\).</li>
<li>Comprobación numérica (laboratorio, pestaña Lyapunov, clic en \(r=4\)): el promedio sobre \(10^4\) iteraciones da \(\lambda\approx0{,}693\). Un error inicial de \(10^{-10}\) llega a orden 1 en unas \(\ln(10^{10})/\ln2\approx33\) iteraciones.</li></ol><p style="margin:.6em 0 0">\(\lambda=\ln2\): cada iteración se pierde, en promedio, un bit de información sobre la condición inicial.</p></div></div>
<div class="pager"><a href="#dn-mapas-1d"><small>← Anterior</small>Mapas unidimensionales, puntos fijos y telaraña</a><a class="next" href="#dn-universalidad"><small>Siguiente →</small>Universalidad, constante de Feigenbaum y renormalización</a></div>
<p class="note">Contenido de referencia: Strogatz, <i>Nonlinear Dynamics and Chaos</i>, 3.ª ed., §10.2–10.5 y ejercicio 10.5.4; Ott, <i>Chaos in Dynamical Systems</i>, cap. 2. Redacción y simulaciones propias.</p></section>`);
LABS['dn-logistico']=function(sec){
  const cv=$('#dn14-cv',sec),cv2=$('#dn14-cv2',sec),cv3=$('#dn14-cv3',sec),rd=$('#dn14-read',sec),rd2=$('#dn14-read2',sec);
  const R0=[2.5,4,0,1];let Rg=R0.slice(),mark=3.83,img=null,key='',A1=null,A2=null,ly=null,lkey='',drag0=null;
  const mk=segm(sec,'dn14-mk','m',()=>draw1());
  $('#dn14-reset',sec).addEventListener('click',()=>{Rg=R0.slice();draw1();draw2();});
  const RN=[[3,'r₁'],[1+Math.sqrt(6),'r₂'],[3.544090,'r₃'],[3.564407,'r₄'],[3.569946,'r∞'],[1+Math.sqrt(8),'1+√8']];
  pC_zoom(cv,()=>A1,(a,b,c,d)=>{if(b-a<1e-7||d-c<1e-7)return;Rg=[a,b,Math.max(0,c),Math.min(1,d)];draw1();draw2();},(x)=>{mark=clamp(x,0,4);draw1();draw2();},(a,b)=>{drag0=a?[a,b]:null;draw1(true);});
  function lyR(r){return pC_lyap(pC_logi,pC_dlogi,r,0.5,1000,10000);}
  function info(r){let x=0.5;for(let i=0;i<4000;i++)x=pC_logi(x,r);const p=pC_period(z=>pC_logi(z,r),x,128,1e-8);const l=lyR(r);
    return row('r',nt(r,6))+row('λ(r)',isFinite(l)&&l>-50?nt(l,4):'−∞ (superestable)')+row('atractor',p===1?'punto fijo x* = '+nt(x,4):p?'ciclo de período '+p:(l>0?'caótico (λ > 0)':'aperiódico'))+
      (r>1?row('x* = 1 − 1/r',nt(1-1/r,4)+'  (λ = 2 − r = '+nt(2-r,3)+')'):'');}
  function draw1(fast){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.72,440,280);
    A1=axes(ctx,{l:44,t:10,w:w-54,h:h-34,xr:[Rg[0],Rg[1]],yr:[Rg[2],Rg[3]],xl:'r',yl:'x',xf:v=>nt(v,Rg[1]-Rg[0]<0.01?5:3)});
    const W=Math.round(A1.o.w),H=Math.round(A1.o.h),z=Math.log2(Math.max(1,1.5/(Rg[1]-Rg[0]))),k2=Rg.join()+W+'x'+H;
    if(!fast||!img||key!==k2){if(key!==k2){img=pC_bifImg(pC_logi,W,H,Rg[0],Rg[1],Rg[2],Rg[3],Math.min(4000,500+300*z),Math.min(3000,700+250*z));key=k2;}}
    ctx.drawImage(img,A1.o.l,A1.o.t,A1.o.w,A1.o.h);
    if(mk()==='1')RN.forEach(([v,t])=>pC_vline(ctx,A1,v,K.d,t));
    pC_vline(ctx,A1,mark,K.b,null,[]);
    if(drag0)pC_rect(ctx,drag0[0],drag0[1]);
    if(!fast)rd.innerHTML=row('ventana r',nt(Rg[0],5)+' … '+nt(Rg[1],5))+row('ventana x',nt(Rg[2],4)+' … '+nt(Rg[3],4))+sep+info(mark);
  }
  function draw2(){
    if(!vis(cv2))return;let {ctx,w,h}=fit(cv2,.45,250,170);
    const lk=Rg[0]+':'+Rg[1]+':'+w;
    if(lk!==lkey){const n=Math.round(Math.min(700,w));ly=[];for(let i=0;i<=n;i++){const r=Rg[0]+(Rg[1]-Rg[0])*i/n;ly.push([r,pC_lyap(pC_logi,pC_dlogi,r,0.5,300,700)]);}lkey=lk;}
    A2=axes(ctx,{l:44,t:8,w:w-54,h:h-30,xr:[Rg[0],Rg[1]],yr:[-2,1],xl:'r',yl:'λ',xf:v=>nt(v,Rg[1]-Rg[0]<0.01?5:3)});
    ctx.save();ctx.strokeStyle=K.ink;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(A2.o.l,A2.Y(0));ctx.lineTo(A2.o.l+A2.o.w,A2.Y(0));ctx.stroke();ctx.restore();
    path(ctx,A2,ly.map(p=>[p[0],Math.max(-2.2,p[1])]),K.t,1.4);
    pC_vline(ctx,A2,mark,K.b,null,[]);
    /* separación de dos órbitas */
    ({ctx,w,h}=fit(cv3,.4,220,150));const r=mark,N=80;let a=0.3,b=0.3+1e-10;const L=[];
    for(let i=0;i<=N;i++){L.push([i,Math.log(Math.max(Math.abs(a-b),1e-300))]);a=pC_logi(a,r);b=pC_logi(b,r);}
    const A3=axes(ctx,{l:44,t:8,w:w-54,h:h-30,xr:[0,N],yr:[-26,1],xl:'n',yl:'ln|δₙ|'});
    const l=lyR(r);path(ctx,A3,L,K.b,1.8);if(isFinite(l)&&l>0)path(ctx,A3,[[0,Math.log(1e-10)],[N,Math.log(1e-10)+l*N]],K.d,1.3,[6,4]);
    rd2.innerHTML=info(r)+sep+rowT('La recta discontinua tiene pendiente λ; la separación se satura en orden 1 (el tamaño del atractor).');
  }
  clickPos(cv2,(px,py)=>{if(!A2||!inA(A2,px,py))return;mark=invA(A2,px,py)[0];draw2();draw1();});
  return {draw(){draw1();draw2();}};
};

/* ================= 15 · UNIVERSALIDAD Y FEIGENBAUM ================= */
/* mapas unimodales con máximo cuadrático en x = 1/2 (para R_n superestables y renormalización) */
const pC_UNI={
  log:{f:(x,r)=>r*x*(1-x),fr:x=>x*(1-x),fx:(x,r)=>r*(1-2*x),R0:2,rmax:4,R:[2.8,4],t:'r x(1 − x)'},
  sin:{f:(x,r)=>r*Math.sin(Math.PI*x),fr:x=>Math.sin(Math.PI*x),fx:(x,r)=>r*Math.PI*Math.cos(Math.PI*x),R0:0.5,rmax:1,R:[0.7,1],t:'r sin(πx)'}};
function pC_G(m,R,n){let x=0.5,d=0;const N=2**n;for(let i=0;i<N;i++){d=m.fr(x)+m.fx(x,R)*d;x=m.f(x,R);}return [x-0.5,d];}
const _pCRn={};
function pC_Rn(k,nmax=11){if(_pCRn[k])return _pCRn[k];const m=pC_UNI[k],R=[m.R0];
  let a=m.R0+0.02,ga=pC_G(m,a,1)[0];for(let r=a+0.002;r<m.rmax;r+=0.002){const g=pC_G(m,r,1)[0];if(g*ga<0){R.push(bisect(z=>pC_G(m,z,1)[0],a,r));break;}a=r;ga=g;}
  for(let n=2;n<=nmax;n++){let r=R[n-1]+(R[n-1]-R[n-2])/4.669;for(let it=0;it<50;it++){const [g,d]=pC_G(m,r,n),s=g/d;r-=s;if(Math.abs(s)<1e-15)break;}R.push(r);}
  return _pCRn[k]=R;}
V.push(String.raw`<section class="view theme-aa" data-view="dn-universalidad">
<div class="eyebrow">Dinámica no lineal y caos · Unidad V · Caos</div><h1>Universalidad, constante de Feigenbaum y renormalización</h1><p class="lead">El mapa logístico y el mapa seno tienen fórmulas distintas, pero sus cascadas de duplicación se acumulan con la misma razón \(\delta=4{,}669\ldots\) y se reescalan con el mismo factor \(\alpha=-2{,}503\ldots\). Lo mismo ocurre en fluidos, circuitos y láseres. La explicación es la renormalización: al iterar dos veces y reescalar, todos los mapas con un máximo cuadrático fluyen hacia la misma función universal.</p>
<div class="toc"><a href="#dn15-res" data-scroll>Resumen</a><a href="#dn15-lab" data-scroll>Visualiza</a><a href="#dn15-leyes" data-scroll>Leyes y fórmulas</a><a href="#dn15-ej" data-scroll>Ejemplo</a></div>
<div class="block" id="dn15-res"><h2><span class="ico">≡</span>Resumen</h2><ul class="keypoints">
<li><b>Universalidad cualitativa.</b> Metropolis, Stein y Stein (1973): para todo mapa unimodal \(x_{n+1}=rf(x_n)\) (un solo máximo, suave), los ciclos estables aparecen al aumentar \(r\) <i>en el mismo orden</i> (la secuencia U). Los diagramas de bifurcación del logístico y del seno son cualitativamente idénticos.</li>
<li><b>Universalidad cuantitativa.</b> Feigenbaum (1978): si el máximo es cuadrático, \(\delta=\lim\limits_{n\to\infty}\dfrac{r_n-r_{n-1}}{r_{n+1}-r_n}=4{,}6692016\ldots\) para cualquier mapa de la clase. Depende sólo del orden del máximo (\(|x|^z\) con \(z=2\)), no de los detalles.</li>
<li><b>Superestables.</b> En la práctica se usan los \(R_n\) en los que el \(2^n\)-ciclo contiene al máximo \(x_m=\tfrac12\) (multiplicador nulo): \(f^{2^n}_{R_n}(\tfrac12)=\tfrac12\). Están intercalados con los \(r_n\) y dan el mismo \(\delta\); se calculan con Newton muy eficientemente.</li>
<li><b>Escala en \(x\).</b> Sea \(d_n\) la distancia de \(x_m\) al punto más próximo del ciclo superestable \(R_n\), \(d_n=f^{2^{n-1}}_{R_n}(x_m)-x_m\). Entonces \(d_n/d_{n+1}\to\alpha=-2{,}5029\ldots\): cada duplicación invierte la figura y la reduce un factor \(|\alpha|\).</li>
<li><b>Renormalización.</b> Cerca de \(x_m\), \(f^2_{R_{n+1}}\) reflejado y ampliado por \(\alpha\) se parece a \(f_{R_n}\). El operador \(\mathcal T f(x)=\alpha f\big(f(x/\alpha)\big)\) tiene un punto fijo \(g\) (ecuación de Feigenbaum-Cvitanović). \(\alpha\) sale de normalizar \(g\), y \(\delta\) es el único autovalor inestable de \(\mathcal T\) linealizado en \(g\).</li>
<li><b>Renormalización elemental.</b> Aplicada a la forma normal \(x_{n+1}=-(1+\mu)x_n+x_n^2\), iterar dos veces y reescalar da \(\mu'=\mu^2+4\mu-2\). Su punto fijo da \(\delta\approx1+\sqrt{17}=5{,}12\) y \(\alpha\approx-2{,}24\): la idea correcta con un error del 10 % (ejemplo de abajo).</li>
<li><b>Experimentos.</b> La cascada y su \(\delta\) se han medido en convección de Rayleigh-Bénard (mercurio: \(\delta\approx4{,}4\pm0{,}1\), Libchaber y colaboradores), en circuitos con diodos varactores, en láseres y en acústica. Con tres o cuatro bifurcaciones medibles, \(\delta\) sale cerca de 4,7, en acuerdo con la teoría.</li></ul></div>
<div class="block" id="dn15-lab"><h2><span class="ico">◎</span>Visualiza</h2>`
+tabs([['rn','R_n superestables y δ',pC_lab(['dn15-cv'],seg('dn15-m','m',[['log','logístico'],['sin','seno']]),'dn15-read',String.raw`Las líneas verticales son los \(R_n\) calculados con Newton sobre \(f^{2^n}_R(\tfrac12)-\tfrac12=0\); la horizontal es \(x=\tfrac12\). La tabla da \(\delta_n=(R_{n-1}-R_{n-2})/(R_n-R_{n-1})\) y \(\alpha_n=d_n/d_{n+1}\). Compara las columnas de los dos mapas: los \(R_n\) son distintos, los cocientes convergen a lo mismo.`)],
       ['cmp','Logístico frente a seno',pC_lab(['dn15-cv2','dn15-cv3'],'','dn15-read2',String.raw`Arriba \(x\mapsto rx(1-x)\) en \(r\in[2{,}8;4]\); abajo \(x\mapsto r\sin\pi x\) en \(r\in[0{,}7;1]\). Las ventanas aparecen en el mismo orden (secuencia U): la de período 3, la de período 5 y la de período 6 se reconocen en ambos.`)],
       ['ren','Función universal',pC_lab(['dn15-cv4'],slider('dn15-n','nivel n',0,7,1,0),'dn15-read3',String.raw`Curvas \(g_n(y)=\alpha^n\big[f^{2^n}_{R_n}(\tfrac12+y/\alpha^n)-\tfrac12\big]\), normalizadas para que la curvatura en \(y=0\) sea \(-1\) (\(\hat g=\kappa\,g(y/\kappa)\)). Al subir \(n\) las del logístico (verde) y las del seno (naranja) convergen a la misma función: el punto fijo de la renormalización.`)]])
+String.raw`</div>
<div class="block" id="dn15-leyes"><h2><span class="ico">§</span>Leyes y fórmulas</h2><div class="laws">
<div class="law"><h3>Constante de Feigenbaum δ</h3><div class="eq">\[ \delta=\lim_{n\to\infty}\frac{R_n-R_{n-1}}{R_{n+1}-R_n}=4{,}669201609\ldots \]</div><p>Equivale a \(R_\infty-R_n\approx C\delta^{-n}\). Para el logístico \(R_\infty=r_\infty=3{,}5699456\).</p></div>
<div class="law"><h3>Factor de escala α</h3><div class="eq">\[ \alpha=\lim_{n\to\infty}\frac{d_n}{d_{n+1}}=-2{,}502907875\ldots,\qquad d_n=f^{2^{n-1}}_{R_n}(x_m)-x_m \]</div><p>El signo negativo: el punto más cercano a \(x_m\) cambia de lado en cada duplicación.</p></div>
<div class="law"><h3>Ecuación de Feigenbaum-Cvitanović</h3><div class="eq">\[ g(x)=\alpha\,g\big(g(x/\alpha)\big),\qquad g(0)=1,\ g'(0)=0 \]</div><p>Origen en el máximo. La normalización fija \(\alpha=1/g(1)\).</p></div>
<div class="law"><h3>Autovalor de la renormalización</h3><div class="eq">\[ \mathcal T[g+\epsilon h]=g+\epsilon\,\mathcal L h+O(\epsilon^2),\qquad \mathcal Lh_\delta=\delta\,h_\delta \]</div><p>\(\delta\) es el único autovalor de módulo mayor que 1 del operador linealizado.</p></div>
<div class="law"><h3>Renormalización elemental (Strogatz §10.7)</h3><div class="eq">\[ \mu'=\mu^2+4\mu-2,\quad \mu^*=\frac{-3+\sqrt{17}}2,\quad \delta\approx1+\sqrt{17}\approx5{,}12 \]</div><p>Con \(\alpha\approx C(\mu^*)\approx-2{,}24\).</p></div>
<div class="law"><h3>Universalidad cualitativa (MSS)</h3><div class="eq">\[ x_{n+1}=r f(x_n),\quad f \text{ unimodal}\ \Rightarrow\ \text{mismo orden de ventanas: } 1,2,4,\dots,6,5,3,\dots \]</div><p>El orden de aparición de los ciclos superestables es el mismo para todos los mapas unimodales.</p></div>
</div></div>
<div class="block" id="dn15-ej"><h2><span class="ico">✎</span>Ejemplo resuelto</h2><div class="example"><p><b>Renormalización elemental. Parte de la forma normal del flip, \(x_{n+1}=-(1+\mu)x_n+x_n^2\) (el flip ocurre en \(\mu=0\)). Itera dos veces cerca del 2-ciclo, reescala y obtén aproximaciones de \(\delta\) y \(\alpha\).</b></p><ol>
<li>Llama \(a=-(1+\mu)\), así \(f(x)=ax+x^2\). El 2-ciclo cumple \(f^2(x)=x\); quitando los puntos fijos \(x=0\) y \(x=1-a\) queda \(x^2+(1+a)x+(1+a)=0\), es decir \(x^2-\mu x-\mu=0\): \(p,q=\dfrac{\mu\pm\sqrt{\mu^2+4\mu}}2\), reales para \(\mu>0\).</li>
<li>Desarrolla \(f^2\) en torno a \(p\) con \(x=p+\eta\): \(\eta_{n+2}=(f^2)'(p)\,\eta_n+C\eta_n^2+\dots\), donde \((f^2)'(p)=(a+2p)(a+2q)=a^2+2a(p+q)+4pq=1-4\mu-\mu^2\) (usando \(p+q=\mu\), \(pq=-\mu\)) y \(C=\tfrac12(f^2)''(p)=(a+2p)^2+(a+2q)\).</li>
<li>Para que tenga la misma forma que el mapa original escribe \((f^2)'(p)=-(1+\mu')\) y reescala \(\tilde x=C\eta\): \(\tilde x_{n+2}=-(1+\mu')\tilde x_n+\tilde x_n^2\). La regla de renormalización es \(\mu'=\mu^2+4\mu-2\).</li>
<li>El \(2^k\)-ciclo de \(f\) se duplica cuando el renormalizado \(k\) veces lo hace, o sea cuando su \(\mu\) vale 0. Así \(\mu_1=0\) y \(\mu_{k}=\mu_{k+1}^2+4\mu_{k+1}-2\): \(\mu_2=-2+\sqrt6=0{,}4495\) (¡exacto para el logístico, con \(\mu=r-3\): \(r_2=1+\sqrt6\)!), \(\mu_3=0{,}5446\), …, convergiendo a \(\mu^*\) con \(\mu^{*2}+3\mu^*-2=0\): \(\mu^*=\dfrac{-3+\sqrt{17}}{2}=0{,}5616\).</li>
<li>Cerca del punto fijo, \(\mu_k-\mu^*\approx\dfrac{d\mu'}{d\mu}\Big|_{\mu^*}(\mu_{k+1}-\mu^*)\), así que \(\delta\approx2\mu^*+4=1+\sqrt{17}=5{,}123\).</li>
<li>Para \(\alpha\): en \(\mu^*\), \(a=-1{,}5616\), \(\sqrt{\mu^{*2}+4\mu^*}=1{,}6005\), \(p=1{,}0810\), \(q=-0{,}5195\); \(a+2p=0{,}6005\), \(a+2q=-2{,}6005\). Entonces \(\alpha\approx C=0{,}6005^2-2{,}6005=-2{,}240\).</li></ol><p style="margin:.6em 0 0">Resultado: \(\delta\approx5{,}12\) y \(\alpha\approx-2{,}24\), frente a los exactos \(4{,}669\) y \(-2{,}503\). Truncar a orden \(\eta^2\) da un error de ~10 %, pero el mecanismo (iterar dos veces, reescalar y buscar el punto fijo) es el de la teoría exacta.</p></div></div>
<div class="pager"><a href="#dn-logistico"><small>← Anterior</small>Mapa logístico: duplicación de período, ventanas y exponente de Lyapunov</a><a class="next" href="#dn-fractales"><small>Siguiente →</small>Fractales: Cantor, Koch y dimensiones de similaridad y de conteo de cajas</a></div>
<p class="note">Contenido de referencia: Strogatz, <i>Nonlinear Dynamics and Chaos</i>, 3.ª ed., §10.6–10.7; Feigenbaum, <i>J. Stat. Phys.</i> 19, 25 (1978); Cvitanović et al., <i>ChaosBook.org</i>, cap. «Universality». Redacción y simulaciones propias.</p></section>`);
LABS['dn-universalidad']=function(sec){
  const cv=$('#dn15-cv',sec),cv2=$('#dn15-cv2',sec),cv3=$('#dn15-cv3',sec),cv4=$('#dn15-cv4',sec),rd=$('#dn15-read',sec),rd2=$('#dn15-read2',sec),rd3=$('#dn15-read3',sec);
  const gm=segm(sec,'dn15-m','m',()=>draw1()),gn=sl(sec,'dn15-n',null,()=>draw3());const imgs={};
  function draw1(){
    if(!vis(cv))return;const k=gm(),m=pC_UNI[k],R=pC_Rn(k),{ctx,w,h}=fit(cv,.62,380,240);
    const r0=k==='log'?2.9:0.7,r1=k==='log'?3.58:0.87;
    const A=axes(ctx,{l:44,t:10,w:w-54,h:h-34,xr:[r0,r1],yr:[0,1],xl:'r',yl:'x',xf:v=>nt(v,3)});
    const key=k+w+'x'+h;if(!imgs[key])imgs[key]=pC_bifImg(m.f,Math.round(A.o.w),Math.round(A.o.h),r0,r1,0,1,800,600);
    ctx.drawImage(imgs[key],A.o.l,A.o.t,A.o.w,A.o.h);
    ctx.save();ctx.strokeStyle=K.b;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(A.o.l,A.Y(0.5));ctx.lineTo(A.o.l+A.o.w,A.Y(0.5));ctx.stroke();ctx.restore();
    R.forEach((r,i)=>{if(i<6)pC_vline(ctx,A,r,K.d,i<4?'R'+'₀₁₂₃₄₅'[i]:null,[2,3]);dot(ctx,A.X(r),A.Y(0.5),3.5,K.d);});
    let s=`<table class="aa-mat" style="font-size:.8rem"><tr><td>n</td><td>Rₙ</td><td>δₙ</td><td>αₙ</td></tr>`;
    const d=[];for(let n=1;n<R.length;n++){let x=0.5;for(let i=0;i<2**(n-1);i++)x=m.f(x,R[n]);d.push(x-0.5);}
    R.forEach((r,n)=>{const dl=n>=2?(R[n-1]-R[n-2])/(R[n]-R[n-1]):null,al=n>=1&&n<R.length-1?d[n-1]/d[n]:null;
      s+=`<tr><td>${n}</td><td>${nf(r,9)}</td><td>${dl?nf(dl,5):'—'}</td><td>${al?nf(al,4):'—'}</td></tr>`;});
    rd.innerHTML=row('mapa','f(x) = '+m.t)+s+'</table>'+rowT('Teoría: δ = 4,66920…, α = −2,50291…')+row('R∞ (extrapolado)',nf(R[R.length-1]+(R[R.length-1]-R[R.length-2])/(4.6692-1),9));
  }
  function bifInto(c,k,lab){const m=pC_UNI[k],{ctx,w,h}=fit(c,.42,230,150),A=axes(ctx,{l:44,t:8,w:w-54,h:h-30,xr:m.R,yr:[0,1],xl:'r',yl:lab,xf:v=>nt(v,3)});
    const key=k+'c'+w+'x'+h;if(!imgs[key])imgs[key]=pC_bifImg(m.f,Math.round(A.o.w),Math.round(A.o.h),m.R[0],m.R[1],0,1,600,500);ctx.drawImage(imgs[key],A.o.l,A.o.t,A.o.w,A.o.h);
    pC_vline(ctx,A,pC_Rn(k)[pC_Rn(k).length-1],K.d,'r∞');return A;}
  function draw2(){if(!vis(cv2))return;bifInto(cv2,'log','logístico');bifInto(cv3,'sin','seno');
    const a=pC_Rn('log'),b=pC_Rn('sin');
    rd2.innerHTML=row('r∞ logístico',nf(a[a.length-1],6))+row('r∞ seno',nf(b[b.length-1],6))+sep+rowT('Mismo orden de ventanas (secuencia U). En el logístico la ventana de período 3 empieza en r = 1 + √8 ≈ 3,8284; en el seno, en r ≈ 0,9378.');}
  function gfun(k,n){const m=pC_UNI[k],R=pC_Rn(k)[n],a=-2.502907875,an=a**n,N=2**n;
    const g=y=>{let x=0.5+y/an;for(let i=0;i<N;i++)x=m.f(x,R);return (x-0.5)*an;};const e=1e-3,kap=-g(e)/(e*e);return {g:y=>kap*g(y/kap),kap};}
  function draw3(){if(!vis(cv4))return;const {ctx,w,h}=fit(cv4,.62,380,240),n=gn();
    const A=axes(ctx,{l:44,t:10,w:w-54,h:h-34,xr:[-1.6,1.6],yr:[-2.2,0.4],xl:'y',yl:'ĝₙ(y)'});
    for(let j=0;j<=n;j++){const al=j===n?1:0.25;const L=gfun('log',j),S=gfun('sin',j);
      curve(ctx,A,L.g,-1.6,1.6,j===n?K.r:'rgba(43,138,62,.3)',j===n?2.6:1.2);curve(ctx,A,S.g,-1.6,1.6,j===n?K.b:'rgba(217,72,15,.3)',j===n?2:1.2,[6,4]);}
    const L=gfun('log',n),S=gfun('sin',n);
    rd3.innerHTML=row('nivel n',n+'  (f iterado 2ⁿ = '+2**n+' veces)')+row('ĝ logístico (y = 1)',nf(L.g(1),4))+row('ĝ seno (y = 1)',nf(S.g(1),4))+row('diferencia',nf(Math.abs(L.g(1)-S.g(1)),4))+
      sep+rowT('La diferencia cae rápidamente con n: las direcciones en que difieren los dos mapas son contractivas bajo la renormalización (la única inestable, la de δ, se compensa al elegir Rₙ), y sólo sobrevive la función universal.')+leg([[K.r,'logístico'],[K.b,'seno']]);}
  return {draw(){draw1();draw2();draw3();}};
};

/* ================= 16 · FRACTALES ================= */
V.push(String.raw`<section class="view theme-aa" data-view="dn-fractales">
<div class="eyebrow">Dinámica no lineal y caos · Unidad VI · Fractales y atractores extraños</div><h1>Fractales: Cantor, Koch y dimensiones de similaridad y de conteo de cajas</h1><p class="lead">Los atractores extraños no son curvas ni superficies: su sección transversal es un conjunto de Cantor, con estructura a todas las escalas. Para medirlos hace falta una noción de dimensión que pueda ser fraccionaria, definida por cómo crece el número de piezas de tamaño \(\varepsilon\) necesarias para cubrir el conjunto.</p>
<div class="toc"><a href="#dn16-res" data-scroll>Resumen</a><a href="#dn16-lab" data-scroll>Visualiza</a><a href="#dn16-leyes" data-scroll>Leyes y fórmulas</a><a href="#dn16-ej" data-scroll>Ejemplo</a></div>
<div class="block" id="dn16-res"><h2><span class="ico">≡</span>Resumen</h2><ul class="keypoints">
<li><b>Fractal.</b> Conjunto con estructura fina a escalas arbitrariamente pequeñas, a menudo autosimilar (formado por copias reducidas de sí mismo) y con una dimensión que no es entera.</li>
<li><b>Conjunto de Cantor.</b> Se quita el tercio central de \([0,1]\) y se repite en cada trozo. La longitud quitada es \(\sum_{n\ge0}2^n/3^{n+1}=1\): tiene medida cero. Aun así es no numerable: sus puntos son los \(x=0{,}a_1a_2\ldots\) en base 3 con \(a_i\in\{0,2\}\), en biyección con las sucesiones binarias.</li>
<li><b>Dimensión de similaridad.</b> Si el conjunto está formado por \(m\) copias de sí mismo reducidas por un factor \(r\), \(m=r^{-d}\Rightarrow d=\dfrac{\ln m}{\ln(1/r)}\). Un segmento (\(m=r^{-1}\)) da 1, un cuadrado (\(m=r^{-2}\)) da 2, el Cantor \(\ln2/\ln3=0{,}6309\).</li>
<li><b>Curva de Koch.</b> Cada segmento se sustituye por 4 de tamaño \(1/3\): \(d=\ln4/\ln3=1{,}2619\). Su longitud \((4/3)^n\to\infty\), pero el copo de nieve encierra un área finita, \(\tfrac85\) la del triángulo inicial.</li>
<li><b>Dimensión de conteo de cajas.</b> Si \(N(\varepsilon)\) es el número mínimo de cajas de lado \(\varepsilon\) que cubren el conjunto, \(N(\varepsilon)\propto\varepsilon^{-d}\) y \(d=\lim\limits_{\varepsilon\to0}\dfrac{\ln N(\varepsilon)}{\ln(1/\varepsilon)}\). No exige autosimilaridad, así que vale para atractores: se mide como la pendiente de \(\ln N\) frente a \(\ln(1/\varepsilon)\).</li>
<li><b>Dimensión de correlación.</b> Para un atractor muestreado por una órbita \(\{\mathbf x_i\}\), \(C(\varepsilon)=\lim\limits_{N\to\infty}\dfrac{1}{N^2}\#\{(i,j):|\mathbf x_i-\mathbf x_j|\lt\varepsilon\}\propto\varepsilon^{d_{\text{corr}}}\) (Grassberger-Procaccia, 1983). Pesa las regiones más visitadas; para Lorenz \(d_{\text{corr}}\approx2{,}05\), para Hénon \(\approx1{,}21\).</li>
<li><b>Por qué aparecen.</b> En un atractor disipativo los volúmenes se contraen mientras las órbitas se separan: el estirado y plegado repetido produce capas dentro de capas. Una sección transversal es (localmente) un Cantor, y la dimensión total es «entero + fracción».</li></ul></div>
<div class="block" id="dn16-lab"><h2><span class="ico">◎</span>Visualiza</h2>`
+tabs([['cons','Construcción',pC_lab(['dn16-cv'],sel('dn16-set',[['cantor','Cantor (quitar el centro)'],['quintos','Cantor de quintos pares'],['koch','Curva de Koch'],['sier','Triángulo de Sierpinski']])+slider('dn16-n','iteración n',0,7,1,3)+slider('dn16-f','fracción quitada',0.05,0.9,0.0001,0.3333),'dn16-read',String.raw`En cada paso el conjunto se reemplaza por \(m\) copias reducidas por \(r\). La lectura da \(N_n=m^n\) piezas de tamaño \(\varepsilon_n=r^n\) y la medida que queda. Con el Cantor puedes variar la fracción quitada y ver cómo cambia \(d=\ln2/\ln\frac{2}{1-f}\).`)],
       ['box','Conteo de cajas',pC_lab(['dn16-cv2','dn16-cv3'],sel('dn16-bs',[['koch','Curva de Koch'],['sier','Sierpinski (juego del caos)'],['henon','Atractor de Hénon'],['circ','Circunferencia'],['sq','Cuadrado lleno']])+slider('dn16-k','cajas ε = 2⁻ᵏ, k',1,8,1,4),'dn16-read2',String.raw`Arriba: el conjunto (puntos) y las cajas de lado \(\varepsilon=2^{-k}\) que contienen al menos un punto. Abajo: \(\ln N(\varepsilon)\) frente a \(\ln(1/\varepsilon)\) para \(k=1,\dots,9\) y la recta de mínimos cuadrados en \(k=2\ldots7\); su pendiente estima \(d\). A escalas muy finas los conjuntos muestreados con puntos dejan de llenar cajas: por eso se ajusta en un rango intermedio.`)]])
+String.raw`</div>
<div class="block" id="dn16-leyes"><h2><span class="ico">§</span>Leyes y fórmulas</h2><div class="laws">
<div class="law"><h3>Dimensión de similaridad</h3><div class="eq">\[ m=r^{-d}\ \Rightarrow\ d=\frac{\ln m}{\ln(1/r)} \]</div><p>\(m\) copias autosimilares reducidas un factor \(r\).</p></div>
<div class="law"><h3>Dimensión de conteo de cajas</h3><div class="eq">\[ d_{\text{box}}=\lim_{\varepsilon\to0}\frac{\ln N(\varepsilon)}{\ln(1/\varepsilon)} \]</div><p>Si \(N(\varepsilon_n)=m^n\) con \(\varepsilon_n=r^n\), coincide con la de similaridad.</p></div>
<div class="law"><h3>Conjunto de Cantor</h3><div class="eq">\[ \sum_{n=0}^{\infty}\frac{2^n}{3^{n+1}}=1,\qquad d=\frac{\ln2}{\ln3}=0{,}6309 \]</div><p>Medida nula, no numerable y totalmente desconectado.</p></div>
<div class="law"><h3>Curva y copo de Koch</h3><div class="eq">\[ L_n=\Big(\frac43\Big)^nL_0\to\infty,\qquad A_\infty=\frac85A_0,\qquad d=\frac{\ln4}{\ln3}=1{,}2619 \]</div><p>Longitud infinita encerrando un área finita.</p></div>
<div class="law"><h3>Dimensión de correlación</h3><div class="eq">\[ C(\varepsilon)=\lim_{N\to\infty}\frac{1}{N^2}\sum_{i\ne j}\Theta\big(\varepsilon-|\mathbf x_i-\mathbf x_j|\big)\propto\varepsilon^{d_{\text{corr}}} \]</div><p>Grassberger-Procaccia; en general \(d_{\text{corr}}\le d_{\text{box}}\).</p></div>
<div class="law"><h3>Sierpinski</h3><div class="eq">\[ m=3,\ r=\tfrac12\ \Rightarrow\ d=\frac{\ln3}{\ln2}=1{,}585,\qquad A_n=\Big(\frac34\Big)^nA_0\to0 \]</div><p>Área nula, pero «más que una curva».</p></div>
</div></div>
<div class="block" id="dn16-ej"><h2><span class="ico">✎</span>Ejemplo resuelto</h2><div class="example"><p><b>El conjunto de Cantor de «quintos pares» se construye dividiendo \([0,1]\) en cinco partes iguales y quitando la segunda y la cuarta, y repitiendo en cada trozo que queda. Halla su dimensión de similaridad y la de cajas, la longitud que queda y decide si \(x=\tfrac12\) pertenece al conjunto.</b></p><ol>
<li>En cada paso quedan \(m=3\) trozos (el 1.º, el 3.º y el 5.º quinto), cada uno copia del todo reducida por \(r=\tfrac15\).</li>
<li>Dimensión de similaridad: \(3=5^{d}\Rightarrow d=\dfrac{\ln3}{\ln5}=\dfrac{1{,}0986}{1{,}6094}=0{,}6826\). Es algo mayor que la del Cantor clásico (0,6309).</li>
<li>Conteo de cajas: tras \(n\) pasos el conjunto está cubierto por \(N=3^n\) intervalos de lado \(\varepsilon=5^{-n}\), y no por menos (cada intervalo contiene puntos del conjunto y están separados). Entonces \(\dfrac{\ln N}{\ln(1/\varepsilon)}=\dfrac{n\ln3}{n\ln5}\) y \(d_{\text{box}}=0{,}6826\), igual que antes.</li>
<li>Longitud que queda: \(L_n=(3/5)^n\to0\). Equivalente: lo quitado suma \(\sum_{n\ge0}\tfrac25\big(\tfrac35\big)^n=\tfrac25\cdot\dfrac{1}{1-3/5}=1\).</li>
<li>Caracterización: un punto pertenece al conjunto si y sólo si tiene una expansión en base 5 con dígitos en \(\{0,2,4\}\) (estar en el 1.º, 3.º o 5.º quinto en cada escala).</li>
<li>\(\tfrac12=\sum_{k\ge1}2\cdot5^{-k}=2\cdot\dfrac{1/5}{1-1/5}=\dfrac12\), es decir \(\tfrac12=0{,}2222\ldots_5\). Todos los dígitos son 2, así que \(\tfrac12\) pertenece al conjunto (está siempre en el quinto central de cada trozo).</li></ol><p style="margin:.6em 0 0">\(d=\ln3/\ln5\approx0{,}683\), medida nula, y \(\tfrac12\) está en el conjunto. En el laboratorio, «Cantor de quintos pares» muestra los niveles de la construcción.</p></div></div>
<div class="pager"><a href="#dn-universalidad"><small>← Anterior</small>Universalidad, constante de Feigenbaum y renormalización</a><a class="next" href="#dn-henon"><small>Siguiente →</small>Mapa del panadero, mapa de Hénon y atractor de Rössler</a></div>
<p class="note">Contenido de referencia: Strogatz, <i>Nonlinear Dynamics and Chaos</i>, 3.ª ed., §11.1–11.5 (el Cantor de quintos pares es uno de sus ejercicios de §11.2–11.3); Grassberger y Procaccia, <i>Phys. Rev. Lett.</i> 50, 346 (1983). Redacción y simulaciones propias.</p></section>`);
/* puntos de los conjuntos para el conteo de cajas, normalizados a [0,1]² */
const _pCsets={};
function pC_setPts(k){if(_pCsets[k])return _pCsets[k];let P=[];
  if(k==='koch'){let L=[[0,0],[1,0]];for(let d=0;d<8;d++){const N=[L[0]];for(let i=0;i<L.length-1;i++){const [x0,y0]=L[i],[x1,y1]=L[i+1],dx=(x1-x0)/3,dy=(y1-y0)/3,
      a=[x0+dx,y0+dy],b=[x0+2*dx,y0+2*dy],c=[a[0]+dx*0.5-dy*Math.sqrt(3)/2,a[1]+dy*0.5+dx*Math.sqrt(3)/2];N.push(a,c,b,L[i+1]);}L=N;}
    for(let i=0;i<L.length-1;i++)for(let t=0;t<2;t++)P.push([L[i][0]+(L[i+1][0]-L[i][0])*t/2,0.2+L[i][1]+(L[i+1][1]-L[i][1])*t/2]);}
  else if(k==='sier'){const V3=[[0,0.067],[1,0.067],[0.5,0.067+Math.sqrt(3)/2]];let x=0.3,y=0.3;for(let i=0;i<160000;i++){const v=V3[(Math.random()*3)|0];x=(x+v[0])/2;y=(y+v[1])/2;if(i>20)P.push([x,y]);}}
  else if(k==='henon'){let x=0,y=0;for(let i=0;i<150000;i++){const nx=1-1.4*x*x+y;y=0.3*x;x=nx;if(i>100)P.push([(x+1.5)/3,(y+0.45)/3+0.35]);}}
  else if(k==='circ'){for(let i=0;i<60000;i++){const t=TAU*i/60000;P.push([0.5+0.45*Math.cos(t),0.5+0.45*Math.sin(t)]);}}
  else {for(let i=0;i<200000;i++)P.push([0.05+0.9*Math.random(),0.05+0.9*Math.random()]);}
  return _pCsets[k]=P;}
function pC_boxCount(P,k){const n=2**k,S=new Set();for(const p of P){const i=Math.min(n-1,Math.floor(p[0]*n)),j=Math.min(n-1,Math.floor(p[1]*n));if(i>=0&&j>=0)S.add(i*n+j);}return S;}
LABS['dn-fractales']=function(sec){
  const cv=$('#dn16-cv',sec),cv2=$('#dn16-cv2',sec),cv3=$('#dn16-cv3',sec),rd=$('#dn16-read',sec),rd2=$('#dn16-read2',sec),ss=$('#dn16-set',sec),bs=$('#dn16-bs',sec);
  const gn=sl(sec,'dn16-n',null,()=>draw1()),gf=sl(sec,'dn16-f',v=>nt(v,3),()=>draw1()),gk=sl(sec,'dn16-k',v=>v+'  (ε = 1/'+2**v+')',()=>draw2());
  ss.addEventListener('change',draw1);bs.addEventListener('change',()=>{counts=null;draw2();});let counts=null,ckey='';
  function draw1(){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.62,380,240),k=ss.value,n=gn();$('#dn16-f',sec).parentElement.style.display=k==='cantor'?'':'none';
    let m,r,meas,mname;
    if(k==='cantor'||k==='quintos'){
      const f=gf();let I=[[0,1]];const levels=[I];
      for(let i=0;i<n;i++){const N=[];I.forEach(([a,b])=>{const L=b-a;if(k==='cantor'){const q=(1-f)/2*L;N.push([a,a+q],[b-q,b]);}else{N.push([a,a+L/5],[a+2*L/5,a+3*L/5],[a+4*L/5,b]);}});I=N;levels.push(I);}
      const pad=20,H=Math.min(28,(h-2*pad)/(levels.length)),X=x=>pad+x*(w-2*pad);
      levels.forEach((L,j)=>{ctx.fillStyle=j===levels.length-1?K.t:'rgba(15,118,110,.35)';const y=pad+j*H*1.15;L.forEach(([a,b])=>ctx.fillRect(X(a),y,Math.max(0.6,X(b)-X(a)),H*0.75));label(ctx,'n = '+j,4,y+H*0.37,K.mut,'left','middle','600 10px Inter');});
      if(k==='cantor'){m=2;r=(1-f)/2;}else{m=3;r=0.2;}meas=(m*r)**n;mname='longitud';
    }else if(k==='koch'){
      let L=[[0,0],[1,0]];for(let d=0;d<n;d++){const N=[L[0]];for(let i=0;i<L.length-1;i++){const [x0,y0]=L[i],[x1,y1]=L[i+1],dx=(x1-x0)/3,dy=(y1-y0)/3,a=[x0+dx,y0+dy],b=[x0+2*dx,y0+2*dy],c=[a[0]+dx*0.5-dy*Math.sqrt(3)/2,a[1]+dy*0.5+dx*Math.sqrt(3)/2];N.push(a,c,b,L[i+1]);}L=N;}
      const s=Math.min(w-40,(h-30)*2.6),ox=(w-s)/2,oy=h-20;ctx.save();ctx.strokeStyle=K.t;ctx.lineWidth=1.6;ctx.lineJoin='round';ctx.beginPath();L.forEach((p,i)=>{const X=ox+p[0]*s,Y=oy-p[1]*s;i?ctx.lineTo(X,Y):ctx.moveTo(X,Y);});ctx.stroke();ctx.restore();
      m=4;r=1/3;meas=(4/3)**n;mname='longitud';
    }else{
      const s=Math.min(w-40,(h-24)/0.866),ox=(w-s)/2,oy=h-12;ctx.fillStyle=K.t;
      const tri=(x,y,L,d)=>{if(d===0){ctx.beginPath();ctx.moveTo(ox+x*s,oy-y*s);ctx.lineTo(ox+(x+L)*s,oy-y*s);ctx.lineTo(ox+(x+L/2)*s,oy-(y+L*0.866)*s);ctx.closePath();ctx.fill();return;}
        tri(x,y,L/2,d-1);tri(x+L/2,y,L/2,d-1);tri(x+L/4,y+L*0.433,L/2,d-1);};tri(0,0,1,Math.min(n,7));
      m=3;r=0.5;meas=0.75**n;mname='área (relativa)';
    }
    const d=Math.log(m)/Math.log(1/r);
    rd.innerHTML=row('copias m',m)+row('factor r',nt(r,4))+row('piezas Nₙ = mⁿ',m**n)+row('tamaño εₙ = rⁿ',nf(r**n,5))+row(mname,nf(meas,5))+sep+row('d = ln m / ln(1/r)',nf(d,4))+
      row('ln Nₙ / ln(1/εₙ)',n?nf(Math.log(m**n)/Math.log(r**-n),4):'—');
  }
  function draw2(){
    if(!vis(cv2))return;const set=bs.value,P=pC_setPts(set),K0=gk();
    if(ckey!==set){counts=[];for(let k=1;k<=9;k++)counts.push([k,pC_boxCount(P,k).size]);ckey=set;}
    let {ctx,w,h}=fit(cv2,.62,360,240);const s=Math.min(w,h)-20,ox=(w-s)/2,oy=10;
    const occ=pC_boxCount(P,K0),n=2**K0;ctx.fillStyle='rgba(217,72,15,.22)';
    occ.forEach(q=>{const i=Math.floor(q/n),j=q%n;ctx.fillRect(ox+i*s/n,oy+s-(j+1)*s/n,s/n,s/n);});
    ctx.strokeStyle='rgba(93,101,119,.35)';ctx.lineWidth=0.6;if(n<=64){ctx.beginPath();for(let i=0;i<=n;i++){ctx.moveTo(ox+i*s/n,oy);ctx.lineTo(ox+i*s/n,oy+s);ctx.moveTo(ox,oy+i*s/n);ctx.lineTo(ox+s,oy+i*s/n);}ctx.stroke();}
    ctx.fillStyle=K.t;const step=Math.max(1,Math.floor(P.length/40000));for(let i=0;i<P.length;i+=step){const p=P[i];ctx.fillRect(ox+p[0]*s,oy+s-p[1]*s,1,1);}
    ({ctx,w,h}=fit(cv3,.45,240,160));const L=counts.map(([k,N])=>[k*Math.LN2,Math.log(N)]);
    const A=axes(ctx,{l:44,t:8,w:w-54,h:h-30,xr:[0,9*Math.LN2+0.2],yr:[0,Math.max(...L.map(p=>p[1]))+0.5],xl:'ln(1/ε)',yl:'ln N'});
    const fitP=L.filter((p,i)=>i>=1&&i<=6),mx=fitP.reduce((a,p)=>a+p[0],0)/fitP.length,my=fitP.reduce((a,p)=>a+p[1],0)/fitP.length;
    const sl_=fitP.reduce((a,p)=>a+(p[0]-mx)*(p[1]-my),0)/fitP.reduce((a,p)=>a+(p[0]-mx)**2,0),b=my-sl_*mx;
    path(ctx,A,[[0,b],[9*Math.LN2+0.2,b+sl_*(9*Math.LN2+0.2)]],K.d,1.4,[6,4]);L.forEach((p,i)=>dot(ctx,A.X(p[0]),A.Y(p[1]),i+1===K0?6:4,i>=1&&i<=6?K.t:'#fff',K.t));
    const th={koch:[Math.log(4)/Math.log(3),'ln 4 / ln 3'],sier:[Math.log(3)/Math.log(2),'ln 3 / ln 2'],henon:[1.26,'≈ 1,26 (numérico)'],circ:[1,'1'],sq:[2,'2']}[set];
    rd2.innerHTML=row('puntos',P.length.toLocaleString('es'))+row('k',K0)+row('N(ε)',occ.size)+row('ln N / ln(1/ε)',nf(Math.log(occ.size)/(K0*Math.LN2),3))+sep+row('pendiente (k = 2…7)',nf(sl_,3))+row('valor teórico',nf(th[0],3)+'  ('+th[1]+')');
  }
  return {draw(){draw1();draw2();}};
};

/* ================= 17 · PANADERO, HÉNON Y RÖSSLER ================= */
V.push(String.raw`<section class="view theme-aa" data-view="dn-henon">
<div class="eyebrow">Dinámica no lineal y caos · Unidad VI · Fractales y atractores extraños</div><h1>Mapa del panadero, mapa de Hénon y atractor de Rössler</h1><p class="lead">Un atractor extraño nace de dos operaciones repetidas sin fin: estirar (lo que separa órbitas vecinas) y plegar (lo que las mantiene en una región acotada). El mapa del panadero lo hace con tijeras, el de Hénon con una parábola y el flujo de Rössler con una sola no linealidad. Los tres dejan una estructura de Cantor transversal.</p>
<div class="toc"><a href="#dn17-res" data-scroll>Resumen</a><a href="#dn17-lab" data-scroll>Visualiza</a><a href="#dn17-leyes" data-scroll>Leyes y fórmulas</a><a href="#dn17-ej" data-scroll>Ejemplo</a></div>
<div class="block" id="dn17-res"><h2><span class="ico">≡</span>Resumen</h2><ul class="keypoints">
<li><b>Atractor extraño.</b> Conjunto cerrado, invariante y atractor (con una cuenca de medida positiva) sobre el que la dinámica depende sensiblemente de las condiciones iniciales (\(\lambda_1>0\)) y que tiene estructura fractal. «Extraño» se refiere a la geometría; «caótico», a la dinámica.</li>
<li><b>Mapa del panadero.</b> \((x,y)\mapsto(2x,\,ay)\) si \(x\lt\tfrac12\) y \((2x-1,\,ay+\tfrac12)\) si \(x\ge\tfrac12\), con \(0\lt a\le\tfrac12\): estira en \(x\), aplasta en \(y\), corta y apila. Separa órbitas como \(2^n\) (\(\lambda=\ln2\)) y contrae áreas por \(2a\). El atractor es \([0,1]\times\) Cantor, de dimensión \(1+\ln2/\ln(1/a)\).</li>
<li><b>Mapa de Hénon.</b> \(x_{n+1}=1+y_n-ax_n^2,\ y_{n+1}=bx_n\). Es la composición de un plegado \((x,y)\mapsto(x,1+y-ax^2)\), una contracción \((x,y)\mapsto(bx,y)\) y una reflexión \((x,y)\mapsto(y,x)\). Es invertible y contrae áreas uniformemente: \(\det J=-b\).</li>
<li><b>Atractor de Hénon (\(a=1{,}4\), \(b=0{,}3\)).</b> Parece una curva en forma de bumerán, pero al ampliar cada «línea» se desdobla en varias, una y otra vez: sección de Cantor. \(\lambda_1\approx0{,}42\), \(\lambda_1+\lambda_2=\ln b\), dimensión \(\approx1{,}26\). Algunos datos iniciales escapan a infinito: la cuenca es acotada.</li>
<li><b>Atractor de Rössler.</b> \(\dot x=-y-z,\ \dot y=x+ay,\ \dot z=b+z(x-c)\), con una sola no linealidad, \(zx\). La órbita gira en espiral hacia afuera en el plano \(xy\) y, cuando \(x\) supera \(c\), \(z\) se dispara y la reinyecta cerca del centro: una banda que se estira y se pliega sobre sí misma.</li>
<li><b>Ruta al caos en Rössler.</b> Con \(a=b=0{,}2\) y \(c\) creciente hay una cascada de duplicaciones: período 1 en \(c=2{,}3\), período 2 en \(c=3{,}3\), período 4 en \(c=4{,}1\), caos en \(c\approx4{,}3\), una ventana de período 3 en \(c=5{,}3\) y caos de nuevo en \(c=5{,}7\). El mapa de máximos sucesivos \(x_{n+1}^{\max}=F(x_n^{\max})\) es casi unimodal: un mapa logístico «disfrazado».</li>
<li><b>Por qué hacen falta tres dimensiones.</b> En un flujo plano no puede haber caos (Poincaré-Bendixson). En un mapa invertible del plano, como Hénon, sí, porque es la sección de Poincaré de un flujo en 3D.</li></ul></div>
<div class="block" id="dn17-lab"><h2><span class="ico">◎</span>Visualiza</h2>`
+tabs([['hen','Atractor de Hénon',pC_lab(['dn17-cv'],slider('dn17-a','a',0.9,1.42,0.001,1.4)+slider('dn17-b','b',0,0.4,0.001,0.3)+btn('dn17-reset','Restablecer zoom'),'dn17-read',String.raw`La imagen se acumula con cada fotograma (densidad de visitas). Arrastra un rectángulo para ampliar: las «curvas» se desdoblan en capas. Con \(b=0\) el mapa se reduce al logístico en \(x\); baja \(a\) para ver la cascada de duplicaciones en 2D.`)],
       ['fold','Estirar y plegar',pC_lab(['dn17-cv2'],seg('dn17-st','s',[['0','región inicial'],['1','T′: plegado'],['2','T″: contracción'],['3','T‴: reflexión']])+slider('dn17-k','iteraciones previas',0,6,1,0),'dn17-read2',String.raw`Una región rectangular coloreada según \(x\) se transforma etapa por etapa: \(T'\) dobla la región en forma de arco (conserva el área), \(T''\) la aplasta en \(x\) por \(b\) y \(T'''\) la refleja en la diagonal. Con «iteraciones previas» se aplica antes el mapa completo varias veces: las bandas se multiplican.`)],
       ['ros','Rössler 3D',pC_lab(['dn17-cv3','dn17-cv4'],slider('dn17-c','c',2,6.5,0.01,5.7)+btn('dn17-play','❚❚ Pausa',false),'dn17-read3',String.raw`Arrastra para girar. Abajo, el mapa de máximos sucesivos de \(x(t)\): un solo punto en período 1, dos en período 2… y una curva unimodal en el caos. Prueba \(c=2{,}3;\ 3{,}3;\ 4{,}1;\ 4{,}3;\ 5{,}3;\ 5{,}7\).`)]])
+String.raw`</div>
<div class="block" id="dn17-leyes"><h2><span class="ico">§</span>Leyes y fórmulas</h2><div class="laws">
<div class="law"><h3>Mapa de Hénon</h3><div class="eq">\[ x_{n+1}=1+y_n-ax_n^2,\qquad y_{n+1}=bx_n,\qquad J=\begin{pmatrix}-2ax&1\\ b&0\end{pmatrix} \]</div><p>\(\det J=-b\): áreas multiplicadas por \(|b|\) en cada paso; inverso \(x_n=y_{n+1}/b\).</p></div>
<div class="law"><h3>Puntos fijos de Hénon</h3><div class="eq">\[ ax^{*2}+(1-b)x^*-1=0,\qquad y^*=bx^* \]</div><p>Existen si \(a>-\tfrac14(1-b)^2\); estabilidad por los autovalores de \(J\).</p></div>
<div class="law"><h3>Mapa del panadero</h3><div class="eq">\[ d=1+\frac{\ln2}{\ln(1/a)},\qquad \lambda_x=\ln2,\quad \lambda_y=\ln a \]</div><p>Para \(a=\tfrac12\) conserva el área (mezcla); para \(a\lt\tfrac12\) es disipativo.</p></div>
<div class="law"><h3>Contracción y exponentes de un mapa 2D</h3><div class="eq">\[ \lambda_1+\lambda_2=\ln|\det J|,\qquad d_{KY}=1+\frac{\lambda_1}{|\lambda_2|} \]</div><p>Para Hénon: \(\lambda_1\approx0{,}42\), \(\lambda_2=\ln0{,}3-\lambda_1\approx-1{,}62\), \(d_{KY}\approx1{,}26\).</p></div>
<div class="law"><h3>Sistema de Rössler</h3><div class="eq">\[ \dot x=-y-z,\qquad \dot y=x+ay,\qquad \dot z=b+z(x-c) \]</div><p>Divergencia \(\nabla\cdot\mathbf v=a+x-c\): disipativo en promedio sobre el atractor.</p></div>
<div class="law"><h3>Mapa de máximos (Lorenz)</h3><div class="eq">\[ x_{n+1}^{\max}=F\big(x_n^{\max}\big) \]</div><p>Reducción de un flujo 3D a un mapa 1D aproximado; si \(F\) es unimodal, hereda la cascada de Feigenbaum.</p></div>
</div></div>
<div class="block" id="dn17-ej"><h2><span class="ico">✎</span>Ejemplo resuelto</h2><div class="example"><p><b>Para el mapa de Hénon con \(a=1{,}4\) y \(b=0{,}3\), halla los puntos fijos, clasifícalos y comprueba la relación entre los autovalores y \(\det J\).</b></p><ol>
<li>Un punto fijo cumple \(x=1+y-ax^2\) y \(y=bx\). Sustituyendo: \(ax^2+(1-b)x-1=0\Rightarrow 1{,}4x^2+0{,}7x-1=0\).</li>
<li>\(x^*=\dfrac{-0{,}7\pm\sqrt{0{,}49+5{,}6}}{2{,}8}=\dfrac{-0{,}7\pm2{,}46779}{2{,}8}\): \(x_1^*=0{,}63135\), \(y_1^*=0{,}18941\) y \(x_2^*=-1{,}13135\), \(y_2^*=-0{,}33941\).</li>
<li>En \(x_1^*\): \(J=\begin{pmatrix}-1{,}76779&1\\0{,}3&0\end{pmatrix}\), con \(\tau=-1{,}76779\) y \(\Delta=-0{,}3\). Autovalores: \(\lambda^2-\tau\lambda+\Delta=0\Rightarrow\lambda=\dfrac{-1{,}76779\pm\sqrt{3{,}12509+1{,}2}}{2}\): \(\lambda_+=0{,}15595\), \(\lambda_-=-1{,}92374\).</li>
<li>Como \(|\lambda_+|\lt1\lt|\lambda_-|\), \(x_1^*\) es una <i>silla</i> (con reflexión en la dirección inestable). Este punto está dentro del atractor: su variedad inestable traza el «bumerán».</li>
<li>En \(x_2^*\): \(\tau=+3{,}16779\), \(\lambda=\dfrac{3{,}16779\pm\sqrt{10{,}0349+1{,}2}}{2}\): \(\lambda_+=3{,}25982\), \(\lambda_-=-0{,}09203\). También es silla, fuera del atractor, sobre el borde de la cuenca.</li>
<li>Comprobación: \(\lambda_+\lambda_-=0{,}15595\cdot(-1{,}92374)=-0{,}3000\) y \(3{,}25982\cdot(-0{,}09203)=-0{,}3000\), iguales a \(\det J=-b\) en ambos casos (el determinante no depende del punto).</li></ol><p style="margin:.6em 0 0">Los dos puntos fijos son sillas, así que ningún punto fijo atrae: las órbitas acotadas van al atractor extraño. En el laboratorio, la lectura de la primera pestaña da estos valores para cualquier \((a,b)\).</p></div></div>
<div class="pager"><a href="#dn-fractales"><small>← Anterior</small>Fractales: Cantor, Koch y dimensiones de similaridad y de conteo de cajas</a><a class="next" href="#dn-pendulo-forzado"><small>Siguiente →</small>Péndulo forzado amortiguado, Duffing y secciones de Poincaré</a></div>
<p class="note">Contenido de referencia: Strogatz, <i>Nonlinear Dynamics and Chaos</i>, 3.ª ed., §12.1–12.3; Hénon, <i>Commun. Math. Phys.</i> 50, 69 (1976); Rössler, <i>Phys. Lett. A</i> 57, 397 (1976). Redacción y simulaciones propias.</p></section>`);
LABS['dn-henon']=function(sec){
  const cv=$('#dn17-cv',sec),cv2=$('#dn17-cv2',sec),cv3=$('#dn17-cv3',sec),cv4=$('#dn17-cv4',sec),rd=$('#dn17-read',sec),rd2=$('#dn17-read2',sec),rd3=$('#dn17-read3',sec);
  const W0=[-1.5,1.5,-0.45,0.45];let Wn=W0.slice(),grid=null,GW=0,GH=0,pt=[0.1,0.1],npts=0,A1=null,dragR=null,escaped=false;
  const reset=()=>{grid=null;npts=0;pt=[0.1,0.1];escaped=false;};
  const ga=sl(sec,'dn17-a',v=>nt(v,3),()=>{reset();draw1();}),gb=sl(sec,'dn17-b',v=>nt(v,3),()=>{reset();draw1();});
  $('#dn17-reset',sec).addEventListener('click',()=>{Wn=W0.slice();reset();draw1();});
  pC_zoom(cv,()=>A1,(x0,x1,y0,y1)=>{if(x1-x0<1e-9||y1-y0<1e-9)return;Wn=[x0,x1,y0,y1];reset();draw1();},()=>{},(a,b)=>{dragR=a?[a,b]:null;draw1(true);});
  function accumulate(n){const a=ga(),b=gb();if(!grid){GW=Math.max(10,Math.round(A1?A1.o.w:400));GH=Math.max(10,Math.round(A1?A1.o.h:250));grid=new Uint32Array(GW*GH);for(let i=0;i<200;i++)step();}
    function step(){const nx=1-a*pt[0]*pt[0]+pt[1];pt=[nx,b*pt[0]];}
    for(let i=0;i<n;i++){step();if(!isFinite(pt[0])||Math.abs(pt[0])>1e6){escaped=true;pt=[0.1*Math.random(),0.1*Math.random()];continue;}
      const ix=Math.floor((pt[0]-Wn[0])/(Wn[1]-Wn[0])*GW),iy=Math.floor((Wn[3]-pt[1])/(Wn[3]-Wn[2])*GH);if(ix>=0&&ix<GW&&iy>=0&&iy<GH)grid[iy*GW+ix]++;}npts+=n;}
  function fixedInfo(){const a=ga(),b=gb(),D=(1-b)**2+4*a;if(D<0)return rowT('Sin puntos fijos reales.');let s='';
    [(-(1-b)+Math.sqrt(D))/(2*a),(-(1-b)-Math.sqrt(D))/(2*a)].forEach((x,i)=>{const t=-2*a*x,d=-b,disc=t*t-4*d;let ev,cl;
      if(disc>=0){const l1=(t+Math.sqrt(disc))/2,l2=(t-Math.sqrt(disc))/2;ev=nt(l1,4)+', '+nt(l2,4);const m1=Math.abs(l1),m2=Math.abs(l2);cl=m1<1&&m2<1?'atractor':m1>1&&m2>1?'repulsor':'silla';}
      else{const m=Math.sqrt(d);ev=nt(t/2,3)+' ± '+nt(Math.sqrt(-disc)/2,3)+'i';cl=m<1?'foco estable':'foco inestable';}
      s+=row('x'+(i?'₂':'₁')+'*',`(${nt(x,4)}, ${nt(b*x,4)})`)+row('  autovalores',ev+' → '+cl);});return s;}
  function draw1(fast){
    if(!vis(cv))return;const {ctx,w,h}=fit(cv,.62,400,250);
    A1=axes(ctx,{l:46,t:10,w:w-56,h:h-34,xr:[Wn[0],Wn[1]],yr:[Wn[2],Wn[3]],xl:'x',yl:'y',xf:v=>nt(v,Wn[1]-Wn[0]<0.05?4:2)});
    if(!grid||GW!==Math.round(A1.o.w)||GH!==Math.round(A1.o.h)){grid=null;accumulate(60000);}
    const off=document.createElement('canvas');off.width=GW;off.height=GH;const oc=off.getContext('2d'),img=oc.createImageData(GW,GH),D=img.data;let mx=1;for(let q=0;q<grid.length;q++)if(grid[q]>mx)mx=grid[q];
    const lm=Math.log(1+mx);for(let q=0;q<grid.length;q++){const c=grid[q];if(!c)continue;const k=q*4,v=Math.log(1+c)/lm;D[k]=15;D[k+1]=118;D[k+2]=110;D[k+3]=Math.min(255,90+165*v);}
    oc.putImageData(img,0,0);ctx.drawImage(off,A1.o.l,A1.o.t,A1.o.w,A1.o.h);if(dragR)pC_rect(ctx,dragR[0],dragR[1]);
    if(!fast)rd.innerHTML=row('a, b',nt(ga(),3)+', '+nt(gb(),3))+row('det J',nt(-gb(),3))+row('puntos acumulados',npts.toLocaleString('es'))+row('ventana x',nt(Wn[0],4)+' … '+nt(Wn[1],4))+row('ventana y',nt(Wn[2],4)+' … '+nt(Wn[3],4))+
      (escaped?row('aviso','<span class="aa-no">algunas órbitas escapan</span>'):'')+sep+fixedInfo();
  }
  /* estirar y plegar */
  const gst=segm(sec,'dn17-st','s',()=>draw2()),gk=sl(sec,'dn17-k',null,()=>draw2());
  const R0=[];for(let i=0;i<=70;i++)for(let j=0;j<=24;j++)R0.push([-1.33+2.66*i/70,-0.42+0.84*j/24,i/70]);
  function draw2(){
    if(!vis(cv2))return;const a=1.4,b=0.3,st=+gst(),k=gk(),{ctx,w,h}=fit(cv2,.62,400,250);
    const A=axes(ctx,{l:46,t:10,w:w-56,h:h-34,xr:[-2.2,2.2],yr:[-1.6,1.6],xl:'x',yl:'y'});
    const H=p=>[1+p[1]-a*p[0]*p[0],b*p[0],p[2]];let P=R0.map(p=>{let q=p;for(let i=0;i<k;i++)q=H(q);return q;});
    if(st>=1)P=P.map(p=>[p[0],1+p[1]-a*p[0]*p[0],p[2]]);if(st>=2)P=P.map(p=>[b*p[0],p[1],p[2]]);if(st>=3)P=P.map(p=>[p[1],p[0],p[2]]);
    P.forEach(p=>{if(!isFinite(p[0])||Math.abs(p[0])>3||Math.abs(p[1])>3)return;const c=Math.round(255*p[2]);ctx.fillStyle=`rgb(${36+Math.round(181*p[2])},${83-Math.round(11*p[2])},${201-Math.round(186*p[2])})`;ctx.fillRect(A.X(p[0])-1,A.Y(p[1])-1,2.2,2.2);});
    const T=['Región inicial: rectángulo, color según x inicial.','T′(x, y) = (x, 1 + y − a x²): dobla el rectángulo en un arco; det = 1 (conserva el área).','T″(x, y) = (b x, y): aplasta en x por b = 0,3; det = b.','T‴(x, y) = (y, x): reflexión en la diagonal; det = −1. La composición es el mapa de Hénon.'];
    rd2.innerHTML=row('etapa',['0','T′','T″ ∘ T′','T‴ ∘ T″ ∘ T′'][st])+row('iteraciones previas',k)+row('área relativa',nf(Math.pow(b,k)*(st>=2?b:1),5))+sep+rowT(T[st])+leg([['#2453c9','x inicial a la izquierda'],['#d9480f','x inicial a la derecha']]);
  }
  /* Rössler */
  const gc=sl(sec,'dn17-c',v=>nt(v,2),()=>{rs=null;draw3();});let play=true,rs=null,trail=[],maxs=[],cam={yaw:0.6,pitch:0.45,auto:true};
  cam3(cv3,cam,()=>draw3());$('#dn17-play',sec).addEventListener('click',e=>{play=!play;e.target.textContent=play?'❚❚ Pausa':'▶ Seguir';});
  const RF=c=>y=>[-y[1]-y[2],y[0]+0.2*y[1],0.2+y[2]*(y[0]-c)];
  function rInit(){const c=gc(),f=RF(c);let y=[1,1,0.1];for(let i=0;i<20000;i++)y=rk4((t,u)=>f(u),0,y,0.01);rs={y,c,px:y[0],ppx:y[0]};trail=[];maxs=[];
    for(let i=0;i<60000;i++)rStep();}
  function rStep(){const f=RF(rs.c);const y=rk4((t,u)=>f(u),0,rs.y,0.01);if(rs.px>rs.ppx&&rs.px>y[0]){maxs.push(rs.px);if(maxs.length>600)maxs.shift();}rs.ppx=rs.px;rs.px=y[0];rs.y=y;trail.push(y);if(trail.length>9000)trail.shift();}
  function draw3(){
    if(!vis(cv3))return;if(!rs)rInit();let {ctx,w,h}=fit(cv3,.62,380,240);const P=P3(cam,w,h,10);
    axes3(ctx,P,13);ctx.save();ctx.lineWidth=1;const n=trail.length;
    for(let i=1;i<n;i++){const a=P.T(trail[i-1][0],trail[i-1][1],trail[i-1][2]*0.5-3),b=P.T(trail[i][0],trail[i][1],trail[i][2]*0.5-3);ctx.strokeStyle=`rgba(15,118,110,${0.12+0.8*i/n})`;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}
    ctx.restore();const yl=trail[n-1];const q=P.T(yl[0],yl[1],yl[2]*0.5-3);dot(ctx,q[0],q[1],4.5,K.b);
    ({ctx,w,h}=fit(cv4,.42,220,150));const A=axes(ctx,{l:44,t:8,w:w-54,h:h-30,xr:[2,13],yr:[2,13],xl:'xₙᵐᵃˣ',yl:'xₙ₊₁ᵐᵃˣ'});
    path(ctx,A,[[2,2],[13,13]],K.ax,1,[4,4]);for(let i=1;i<maxs.length;i++)dot(ctx,A.X(maxs[i-1]),A.Y(maxs[i]),2.2,K.d);
    const u=[...new Set(maxs.slice(-80).map(v=>v.toFixed(2)))].length;
    rd3.innerHTML=row('a = b','0,2')+row('c',nt(gc(),2))+row('máximos distintos (últimos 80)',u)+row('régimen',u<=8?'periódico, período '+u:'caótico (o período alto)')+sep+rowT('Sección: cada punto del mapa de abajo es un par de máximos consecutivos de x(t).');
  }
  return {draw(){draw1();draw2();draw3();},tick(dt){
    if(vis(cv)&&$('.tabpane[data-pane="hen"]',sec).classList.contains('on')&&npts<4e6){accumulate(40000);draw1();}
    if(vis(cv3)&&$('.tabpane[data-pane="ros"]',sec).classList.contains('on')){if(!rs)rInit();if(play){for(let i=0;i<12;i++)rStep();}if(cam.auto)cam.yaw+=dt*0.25;draw3();}}};
};

/* ================= 18 · PÉNDULO FORZADO AMORTIGUADO ================= */
V.push(String.raw`<section class="view theme-aa" data-view="dn-pendulo-forzado">
<div class="eyebrow">Dinámica no lineal y caos · Unidad VI · Fractales y atractores extraños</div><h1>Péndulo forzado amortiguado, Duffing y secciones de Poincaré</h1><p class="lead">El péndulo de laboratorio con un motor que lo empuja periódicamente es el sistema mecánico caótico más sencillo. Su espacio de fases \((\theta,\omega,\varphi)\) es tridimensional, y mirarlo con una luz estroboscópica, una vez por período del forzamiento, reduce el flujo a un mapa del plano en el que se ve directamente el atractor fractal.</p>
<div class="toc"><a href="#dn18-res" data-scroll>Resumen</a><a href="#dn18-lab" data-scroll>Visualiza</a><a href="#dn18-leyes" data-scroll>Leyes y fórmulas</a><a href="#dn18-ej" data-scroll>Ejemplo</a></div>
<div class="block" id="dn18-res"><h2><span class="ico">≡</span>Resumen</h2><ul class="keypoints">
<li><b>Modelo.</b> \(mL^2\ddot\theta+b\dot\theta+mgL\sin\theta=\Gamma\cos\Omega t\). Con \(\tau=\omega_0t\), \(\omega_0^2=g/L\): \(\ddot\theta+\gamma\dot\theta+\sin\theta=F\cos\Omega t\), con \(\gamma=b/(mL^2\omega_0)\), \(F=\Gamma/(mgL)\) y \(\Omega\) en unidades de \(\omega_0\).</li>
<li><b>Espacio de fases autónomo.</b> Con \(\omega=\dot\theta\) y \(\varphi=\Omega t\bmod2\pi\): \(\dot\theta=\omega,\ \dot\omega=-\gamma\omega-\sin\theta+F\cos\varphi,\ \dot\varphi=\Omega\). Tres dimensiones: lo mínimo para el caos en un flujo.</li>
<li><b>Disipación.</b> \(\nabla\cdot\mathbf v=-\gamma\): los volúmenes se contraen como \(e^{-\gamma t}\). El mapa estroboscópico \(P:(\theta,\omega)(t)\mapsto(\theta,\omega)(t+T)\), \(T=2\pi/\Omega\), contrae áreas por \(e^{-\gamma T}\) en cada paso.</li>
<li><b>Ruta al caos (Baker y Gollub).</b> Con \(\gamma=0{,}5\) y \(\Omega=2/3\): para \(F=0{,}9\) hay un ciclo de período \(T\); hacia \(F\approx1{,}07\) se duplica (período \(2T\)); a partir de \(F\approx1{,}15\) el movimiento es caótico, con ventanas periódicas intercaladas. El péndulo da vueltas completas de forma impredecible.</li>
<li><b>Sección de Poincaré.</b> Un ciclo de período \(kT\) aparece como \(k\) puntos; un movimiento cuasiperiódico, como una curva cerrada; el caos, como un conjunto fractal plegado, cuya sección transversal es un Cantor.</li>
<li><b>Oscilador de Duffing.</b> \(\ddot x+\delta\dot x-x+x^3=F\cos\Omega t\): partícula en un pozo doble \(V=-\tfrac12x^2+\tfrac14x^4\) (viga pandeada, Moon y Holmes). Con forzamiento suficiente salta caóticamente entre los pozos; el criterio de Melnikov da el umbral en que se cruzan las variedades de la silla en \(x=0\).</li>
<li><b>Exponentes del flujo.</b> \(\lambda_1>0\), \(\lambda_2=0\) (dirección del flujo) y \(\lambda_3\lt0\), con \(\lambda_1+\lambda_2+\lambda_3=-\gamma\). La dimensión de Kaplan-Yorke \(d_{KY}=2+\lambda_1/|\lambda_3|\) estima la del atractor; la de la sección es \(d_{KY}-1\).</li></ul></div>
<div class="block" id="dn18-lab"><h2><span class="ico">◎</span>Visualiza</h2>`
+tabs([['sim','Péndulo y plano de fase',pC_lab(['dn18-cv','dn18-cv2'],slider('dn18-F','F',0,1.6,0.005,1.15)+slider('dn18-g','γ',0.05,1.2,0.01,0.5)+slider('dn18-W','Ω',0.3,1.5,0.005,0.6667)+btn('dn18-play','❚❚ Pausa',false)+btn('dn18-rst','Reiniciar'),'dn18-read',String.raw`Izquierda: el péndulo y la flecha del par aplicado; derecha: la trayectoria en \((\theta,\omega)\) con \(\theta\) reducido a \((-\pi,\pi]\). Los puntos naranjas se marcan una vez por período \(T=2\pi/\Omega\). Abajo, \(\omega(t)\). Prueba \(F=0{,}9\) (periódico) y \(F=1{,}15\) (caótico).`)],
       ['poin','Sección de Poincaré',pC_lab(['dn18-cv3'],sel('dn18-pre',[['1.5','F = 1,5 (caos)'],['1.15','F = 1,15 (caos)'],['1.07','F = 1,07 (período 2)'],['0.9','F = 0,9 (período 1)'],['1.35','F = 1,35']])+slider('dn18-ph','fase φ₀ de la sección',0,6.283,0.01,0)+btn('dn18-clr','Borrar'),'dn18-read2',String.raw`Cada punto es \((\theta,\omega)\) en \(t=(2\pi k+\varphi_0)/\Omega\), con \(\gamma=0{,}5\), \(\Omega=2/3\). Se integran ~25 períodos por fotograma. Cambiar la fase \(\varphi_0\) muestra la misma estructura estirándose y plegándose a lo largo del ciclo.`)],
       ['bif','Diagrama de bifurcación',pC_lab(['dn18-cv4'],btn('dn18-go','Calcular de nuevo'),'dn18-read3',String.raw`Para cada \(F\in[0{,}9;\,1{,}5]\) (\(\gamma=0{,}5\), \(\Omega=2/3\)) se descartan 120 períodos y se marcan 60 valores de \(\omega\) en la sección. Se avanza en \(F\) partiendo del estado anterior, como en un experimento en que se sube lentamente el forzamiento.`)]])
+String.raw`</div>
<div class="block" id="dn18-leyes"><h2><span class="ico">§</span>Leyes y fórmulas</h2><div class="laws">
<div class="law"><h3>Péndulo forzado adimensional</h3><div class="eq">\[ \ddot\theta+\gamma\dot\theta+\sin\theta=F\cos\Omega t \]</div><p>\(\gamma=1/Q\) es el inverso del factor de calidad.</p></div>
<div class="law"><h3>Contracción de volúmenes</h3><div class="eq">\[ \nabla\cdot\mathbf v=\frac{\partial\dot\theta}{\partial\theta}+\frac{\partial\dot\omega}{\partial\omega}+\frac{\partial\dot\varphi}{\partial\varphi}=-\gamma,\qquad V(t)=V_0e^{-\gamma t} \]</div><p>Por eso el atractor tiene volumen nulo.</p></div>
<div class="law"><h3>Mapa estroboscópico</h3><div class="eq">\[ \mathbf x_{k+1}=P(\mathbf x_k),\qquad \det DP=e^{-\gamma T},\quad T=\frac{2\pi}{\Omega} \]</div><p>Por Liouville, \(\det DP=\exp\!\int_0^T\nabla\cdot\mathbf v\,dt\).</p></div>
<div class="law"><h3>Respuesta lineal (oscilaciones pequeñas)</h3><div class="eq">\[ \theta(t)\approx A\cos(\Omega t-\phi),\qquad A=\frac{F}{\sqrt{(1-\Omega^2)^2+\gamma^2\Omega^2}} \]</div><p>Válida mientras \(A\ll1\); al crecer \(A\) la no linealidad de \(\sin\theta\) entra en juego.</p></div>
<div class="law"><h3>Oscilador de Duffing</h3><div class="eq">\[ \ddot x+\delta\dot x-x+x^3=F\cos\Omega t,\qquad V(x)=-\tfrac12x^2+\tfrac14x^4 \]</div><p>Pozo doble; caos en los saltos entre pozos.</p></div>
<div class="law"><h3>Dimensión de Kaplan-Yorke</h3><div class="eq">\[ d_{KY}=j+\frac{\sum_{i=1}^{j}\lambda_i}{|\lambda_{j+1}|},\qquad \text{flujo 3D: } d_{KY}=2+\frac{\lambda_1}{|\lambda_3|} \]</div><p>\(j\) es el mayor índice con \(\sum_{i\le j}\lambda_i\ge0\).</p></div>
</div></div>
<div class="block" id="dn18-ej"><h2><span class="ico">✎</span>Ejemplo resuelto</h2><div class="example"><p><b>Para el péndulo con \(\gamma=0{,}5\), \(\Omega=2/3\) y \(F=1{,}5\) se mide numéricamente el mayor exponente de Lyapunov, \(\lambda_1\approx0{,}11\) (por unidad de tiempo adimensional). Halla la contracción de áreas del mapa estroboscópico, los otros dos exponentes, la dimensión de Kaplan-Yorke del atractor y la de su sección de Poincaré.</b></p><ol>
<li>Período del forzamiento: \(T=2\pi/\Omega=3\pi=9{,}4248\).</li>
<li>Contracción del mapa: \(\det DP=e^{-\gamma T}=e^{-1{,}5\pi}=e^{-4{,}7124}=0{,}00898\). Cada período, cualquier área de condiciones iniciales queda reducida a menos del 1 %.</li>
<li>Exponentes del flujo: \(\lambda_2=0\) (perturbar a lo largo de la trayectoria no crece ni decrece en promedio). La suma es la divergencia: \(\lambda_1+\lambda_2+\lambda_3=-\gamma\Rightarrow\lambda_3=-0{,}5-0{,}11=-0{,}61\) (con el valor medido \(\lambda_1=0{,}1125\): \(\lambda_3=-0{,}6125\)).</li>
<li>Kaplan-Yorke: \(\lambda_1\ge0\), \(\lambda_1+\lambda_2\ge0\) y \(\lambda_1+\lambda_2+\lambda_3\lt0\), así que \(j=2\) y \(d_{KY}=2+\dfrac{\lambda_1}{|\lambda_3|}=2+\dfrac{0{,}1125}{0{,}6125}=2{,}18\).</li>
<li>Sección de Poincaré: es un mapa 2D con exponentes por iteración \(\Lambda_1=\lambda_1T=1{,}060\) y \(\Lambda_2=\lambda_3T=-5{,}773\). Su suma, \(-4{,}712\), coincide con \(\ln\det DP=-\gamma T\). ✓ Entonces \(d_{KY}^{\text{sec}}=1+\dfrac{\Lambda_1}{|\Lambda_2|}=1+0{,}184=1{,}18=d_{KY}-1\).</li>
<li>Interpretación: la sección es «un poco más que una curva», con una estructura de Cantor transversal muy fina (cada iteración contrae transversalmente por \(e^{\Lambda_2}\approx0{,}003\)). Por eso, a la resolución de la pantalla, el atractor del laboratorio parece una curva plegada.</li></ol><p style="margin:.6em 0 0">\(\det DP\approx0{,}009\), \(\lambda=(0{,}11;\ 0;\ -0{,}61)\), \(d_{KY}\approx2{,}18\) y la sección tiene dimensión \(\approx1{,}18\).</p></div></div>
<div class="pager"><a href="#dn-henon"><small>← Anterior</small>Mapa del panadero, mapa de Hénon y atractor de Rössler</a><a class="next" href="#dinamica-no-lineal-ejercicios"><small>Siguiente →</small>Ejercicios resueltos</a></div>
<p class="note">Contenido de referencia: Strogatz, <i>Nonlinear Dynamics and Chaos</i>, 3.ª ed., §12.4–12.5 (y §4.6, péndulo sobreamortiguado); Baker y Gollub, <i>Chaotic Dynamics: An Introduction</i>, Cambridge, 1996; Alligood, Sauer y Yorke, <i>Chaos</i>, cap. 2 y 9. Redacción y simulaciones propias.</p></section>`);
/* integrador del péndulo forzado: estado [θ, ω], t */
function pC_pend(y,t,h,g,F,W){const f=(tt,u)=>[u[1],-g*u[1]-Math.sin(u[0])+F*Math.cos(W*tt)];return rk4(f,t,y,h);}
const pC_wrap=a=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
LABS['dn-pendulo-forzado']=function(sec){
  const cv=$('#dn18-cv',sec),cv2=$('#dn18-cv2',sec),cv3=$('#dn18-cv3',sec),cv4=$('#dn18-cv4',sec),rd=$('#dn18-read',sec),rd2=$('#dn18-read2',sec),rd3=$('#dn18-read3',sec);
  /* pestaña 1 */
  let y=[0.2,0],t=0,play=true,tr=[],ser=[],str=[],kT=0;
  const rst=()=>{y=[0.2,0];t=0;tr=[];ser=[];str=[];kT=0;};
  const gF=sl(sec,'dn18-F',v=>nt(v,3),()=>{str=[];}),gg=sl(sec,'dn18-g',v=>nt(v,2),()=>{str=[];}),gW0=sl(sec,'dn18-W',v=>Math.abs(v-2/3)<0.003?'2/3':nt(v,3),()=>{str=[];}),gW=()=>{const v=gW0();return Math.abs(v-2/3)<0.003?2/3:v;};
  $('#dn18-play',sec).addEventListener('click',e=>{play=!play;e.target.textContent=play?'❚❚ Pausa':'▶ Seguir';});$('#dn18-rst',sec).addEventListener('click',()=>{rst();draw1();});
  function adv(dt){const W=gW(),T=TAU/W,n=Math.max(1,Math.round(dt*3/0.02));const h=dt*3/n;
    for(let i=0;i<n;i++){y=pC_pend(y,t,h,gg(),gF(),W);t+=h;tr.push([pC_wrap(y[0]),y[1]]);if(tr.length>2500)tr.shift();ser.push([t,y[1]]);if(ser.length>3000)ser.shift();
      if(Math.floor(t/T)>kT){kT=Math.floor(t/T);str.push([pC_wrap(y[0]),y[1]]);if(str.length>400)str.shift();}}}
  function draw1(){
    if(!vis(cv))return;let {ctx,w,h}=fit(cv,.55,340,230);const half=Math.min(w*0.38,h);
    const cx=half/2+6,cy=h/2,L=Math.min(half,h)*0.38,th=y[0];
    ctx.save();ctx.strokeStyle=K.line;ctx.beginPath();ctx.arc(cx,cy,L,0,TAU);ctx.stroke();
    const bx=cx+L*Math.sin(th),by=cy+L*Math.cos(th);ctx.strokeStyle=K.ink;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(bx,by);ctx.stroke();ctx.restore();
    dot(ctx,cx,cy,4,K.ink);dot(ctx,bx,by,10,K.t);const tq=gF()*Math.cos(gW()*t);
    ctx.save();ctx.strokeStyle=K.b;ctx.lineWidth=2.5;ctx.beginPath();const r=L*0.35,a0=-Math.PI/2;ctx.arc(cx,cy,r,a0,a0+tq*1.2,tq<0);ctx.stroke();ctx.restore();
    label(ctx,'par F cos Ωt',cx,cy+L+16,K.b,'center','middle','600 11px Inter');
    const A=axes(ctx,{l:half+40,t:10,w:w-half-50,h:h-34,xr:[-Math.PI,Math.PI],yr:[-3.2,3.2],xl:'θ',yl:'ω',xf:v=>nt(v,1)});
    ctx.save();ctx.beginPath();ctx.rect(A.o.l,A.o.t,A.o.w,A.o.h);ctx.clip();ctx.lineWidth=1;
    for(let i=1;i<tr.length;i++){if(Math.abs(tr[i][0]-tr[i-1][0])>3)continue;ctx.strokeStyle=`rgba(15,118,110,${0.1+0.7*i/tr.length})`;ctx.beginPath();ctx.moveTo(A.X(tr[i-1][0]),A.Y(tr[i-1][1]));ctx.lineTo(A.X(tr[i][0]),A.Y(tr[i][1]));ctx.stroke();}
    ctx.restore();str.forEach(p=>dot(ctx,A.X(p[0]),A.Y(p[1]),2.6,K.b));if(tr.length)dot(ctx,A.X(tr[tr.length-1][0]),A.Y(tr[tr.length-1][1]),4.5,K.ink);
    ({ctx,w,h}=fit(cv2,.28,150,100));const t1=t,t0=Math.max(0,t-60);const B=axes(ctx,{l:40,t:8,w:w-50,h:h-28,xr:[t0,Math.max(t0+60,t1)],yr:[-3.2,3.2],xl:'t',yl:'ω'});
    path(ctx,B,ser.filter(p=>p[0]>=t0),K.t,1.4);
    const W=gW(),Am=gF()/Math.sqrt((1-W*W)**2+(gg()*W)**2);
    rd.innerHTML=row('t',nf(t,1))+row('θ (reducido)',nf(pC_wrap(y[0]),3))+row('ω',nf(y[1],3))+row('vueltas completas',Math.round(y[0]/TAU))+row('T = 2π/Ω',nf(TAU/W,3))+sep+row('amplitud lineal A',nf(Am,3)+(Am>0.5?'  (no lineal: A no es pequeña)':''))+row('det DP = e^{−γT}',nf(Math.exp(-gg()*TAU/W),5));
  }
  /* pestaña 2: sección de Poincaré acumulativa */
  const pre=$('#dn18-pre',sec),gph=sl(sec,'dn18-ph',v=>nt(v,2),()=>{pts=[];ps=null;});let pts=[],ps=null;
  pre.addEventListener('change',()=>{pts=[];ps=null;draw2();});$('#dn18-clr',sec).addEventListener('click',()=>{pts=[];draw2();});
  const PG=0.5,PW=2/3,PT=TAU/PW,PN=150;
  function pInit(){const F=+pre.value;let u=[0.2,0],tt=gph()/PW;for(let k=0;k<100;k++)for(let i=0;i<PN;i++){u=pC_pend(u,tt,PT/PN,PG,F,PW);tt+=PT/PN;}ps={u,tt,F};}
  function pRun(nper){if(!ps)pInit();for(let k=0;k<nper;k++){for(let i=0;i<PN;i++){ps.u=pC_pend(ps.u,ps.tt,PT/PN,PG,ps.F,PW);ps.tt+=PT/PN;}pts.push([pC_wrap(ps.u[0]),ps.u[1]]);}if(pts.length>40000)pts.splice(0,pts.length-40000);}
  function draw2(){
    if(!vis(cv3))return;const {ctx,w,h}=fit(cv3,.66,420,260);const A=axes(ctx,{l:44,t:10,w:w-54,h:h-34,xr:[-Math.PI,Math.PI],yr:[-3,3],xl:'θ',yl:'ω',xf:v=>nt(v,1)});
    ctx.fillStyle=K.t;pts.forEach(p=>ctx.fillRect(A.X(p[0])-0.75,A.Y(p[1])-0.75,1.5,1.5));
    const last=pts.slice(-40),u=new Set(last.map(p=>p[0].toFixed(3)+','+p[1].toFixed(3))).size;
    rd2.innerHTML=row('F',pre.value.replace('.',','))+row('γ, Ω','0,5; 2/3')+row('fase φ₀',nt(gph(),2))+row('puntos',pts.length)+row('puntos distintos (últimos 40)',pts.length>=40?u:'—')+row('lectura',pts.length<40?'acumulando…':u<=8?'ciclo de período '+u+'T':'conjunto extendido: caos')+sep+row('contracción por período',nf(Math.exp(-PG*PT),5));
  }
  /* pestaña 3: diagrama de bifurcación incremental */
  const BF=[0.9,1.5],NB=300;let bif=[],bst=null;
  $('#dn18-go',sec).addEventListener('click',()=>{bif=[];bst=null;draw3();});
  function bStep(){if(bif.length>=NB)return;if(!bst)bst={u:[0.2,0],tt:0};const F=BF[0]+(BF[1]-BF[0])*bif.length/(NB-1),N=100,h=PT/N;let u=bst.u,tt=bst.tt;
    for(let k=0;k<120;k++)for(let i=0;i<N;i++){u=pC_pend(u,tt,h,PG,F,PW);tt+=h;}const col=[];
    for(let k=0;k<60;k++){for(let i=0;i<N;i++){u=pC_pend(u,tt,h,PG,F,PW);tt+=h;}col.push(u[1]);}bst={u,tt};bif.push([F,col]);}
  function draw3(){
    if(!vis(cv4))return;const {ctx,w,h}=fit(cv4,.62,400,250);const A=axes(ctx,{l:44,t:10,w:w-54,h:h-34,xr:BF,yr:[-3,3],xl:'F',yl:'ω (sección)'});
    ctx.fillStyle=K.ink;bif.forEach(([F,c])=>c.forEach(v=>ctx.fillRect(A.X(F)-0.7,A.Y(v)-0.7,1.4,1.4)));
    [[1.07,'P2'],[1.15,'caos']].forEach(([v,tx])=>pC_vline(ctx,A,v,K.d,tx));
    rd3.innerHTML=row('progreso',Math.round(100*bif.length/NB)+' %')+row('F calculado hasta',bif.length?nf(bif[bif.length-1][0],3):'—')+sep+rowT('Una rama = movimiento periódico; dos ramas = período 2T; nube de puntos = caos. Las franjas limpias dentro de la nube son ventanas periódicas.');
  }
  return {draw(){draw1();draw2();draw3();},tick(dt){
    const on=p=>$(`.tabpane[data-pane="${p}"]`,sec).classList.contains('on');
    if(vis(cv)&&on('sim')){if(play)adv(dt);draw1();}
    if(vis(cv3)&&on('poin')){pRun(25);draw2();}
    if(vis(cv4)&&on('bif')&&bif.length<NB){bStep();bStep();draw3();}}};
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
      const pane=bar.parentElement;pane.querySelectorAll(':scope > .tabpane').forEach(p=>p.classList.toggle('on',p.dataset.pane===b.dataset.t));
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

