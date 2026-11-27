/* Home page: the stone. One cut diamond, a facet for each rabbi; small in the crown of the Aron, full size below it.
   The stone is the intersection of cutting planes, drawn on a 2D canvas. No library. */
(function(){
"use strict";
const ST=window.STONE,$=id=>document.getElementById(id);
const cv=$("st-gem"),jw=$("st-jewel");
if(!ST||!cv||!jw||!cv.getContext||!window.ResizeObserver)return;
const DATA=ST.d,T=ST.t,FONT="500 100px "+ST.font;
// Gem geometry: the stone is the intersection of half-spaces; every plane is one facet.
function buildGem(P){
  const D2R=Math.PI/180, planes=[];
  const add=(elDeg,azDeg,d,group,tier)=>{const el=elDeg*D2R,az=azDeg*D2R;
    const n=[Math.cos(el)*Math.cos(az),Math.sin(el),Math.cos(el)*Math.sin(az)];planes.push({n,d,group,tier});};
  const thru=(elDeg,azDeg,p)=>{const el=elDeg*D2R,az=azDeg*D2R;
    const n=[Math.cos(el)*Math.cos(az),Math.sin(el),Math.cos(el)*Math.sin(az)];return n[0]*p[0]+n[1]*p[1]+n[2]*p[2];};
  const rim=(azDeg,y,r=1)=>[r*Math.cos(azDeg*D2R),y,r*Math.sin(azDeg*D2R)];
  // table
  add(90,0,P.tableY,'table','table');
  const nc=P.nc, sc=360/nc;
  for(let k=0;k<nc;k++){ // crown: three tiers
    const a=k*sc, b=a+sc/2;
    add(P.c1el,a,thru(P.c1el,a,rim(a,P.gy)),'crown','c1');                 // upper girdle
    add(P.c2el,b,thru(P.c2el,b,rim(b,P.gy+P.c2lift,P.c2r)),'crown','c2');   // bezel
    add(P.c3el,a,thru(P.c3el,a,rim(a,P.tableY,P.tableR)),'crown','c3');     // star
  }
  const np=P.np, sp=360/np;
  for(let k=0;k<np;k++){ // pavilion: two tiers
    const a=k*sp, b=a+sp/2;
    add(-P.p1el,a,thru(-P.p1el,a,[0,-P.depth,0]),'pav','p1');               // mains to the culet
    add(-P.p2el,b,thru(-P.p2el,b,rim(b,-P.gy,P.p2r||1)),'pav','p2');                 // lower girdle
  }
  const ng=P.ng; for(let k=0;k<ng;k++) add(0,k*360/ng+180/ng,Math.cos(Math.PI/ng),'girdle','g');
  // facet polygons by clipping
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2], cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const norm=a=>{const l=Math.hypot(...a);return a.map(x=>x/l)};
  const facets=[];
  planes.forEach((pl,i)=>{
    const n=pl.n, o=n.map(x=>x*pl.d);
    let u=norm(cross(n,Math.abs(n[1])<0.9?[0,1,0]:[1,0,0])), v=cross(n,u);
    const B=6; let poly=[[-B,-B],[B,-B],[B,B],[-B,B]].map(([s,t])=>[o[0]+u[0]*s+v[0]*t,o[1]+u[1]*s+v[1]*t,o[2]+u[2]*s+v[2]*t]);
    for(let j=0;j<planes.length&&poly.length;j++){ if(j===i) continue; const q=planes[j];
      const out=[]; for(let a=0;a<poly.length;a++){const A=poly[a],Bp=poly[(a+1)%poly.length];
        const da=dot(q.n,A)-q.d, db=dot(q.n,Bp)-q.d;
        if(da<=1e-9) out.push(A);
        if((da<-1e-9&&db>1e-9)||(da>1e-9&&db<-1e-9)){const t=da/(da-db);out.push([A[0]+(Bp[0]-A[0])*t,A[1]+(Bp[1]-A[1])*t,A[2]+(Bp[2]-A[2])*t]);}
      } poly=out; }
    // dedupe + area
    const pts=[]; poly.forEach(p=>{const l=pts[pts.length-1]; if(!l||Math.hypot(p[0]-l[0],p[1]-l[1],p[2]-l[2])>1e-6) pts.push(p)});
    if(pts.length>2&&Math.hypot(pts[0][0]-pts[pts.length-1][0],pts[0][1]-pts[pts.length-1][1],pts[0][2]-pts[pts.length-1][2])<1e-6) pts.pop();
    let area=0,c=[0,0,0]; if(pts.length>=3){for(let a=1;a<pts.length-1;a++){const e1=pts[a].map((x,k)=>x-pts[0][k]),e2=pts[a+1].map((x,k)=>x-pts[0][k]);area+=Math.hypot(...cross(e1,e2))/2;}
      pts.forEach(p=>{c[0]+=p[0];c[1]+=p[1];c[2]+=p[2]});c=c.map(x=>x/pts.length);}
    // winding: make it counter-clockwise seen from outside
    if(pts.length>=3){const e1=pts[1].map((x,k)=>x-pts[0][k]),e2=pts[2].map((x,k)=>x-pts[0][k]); if(dot(cross(e1,e2),n)<0) pts.reverse();}
    facets.push({n,pts,area,c,group:pl.group,tier:pl.tier});
  });
  return facets;
}
const mainCtx=cv.getContext("2d"),jwCtx=jw.getContext("2d"),words=$("st-words");let ctx=mainCtx,isMini=false;
const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
let showNames=true,auto=!still;
$("st-jewelbtn").hidden=false;$("stone").hidden=false;

/* ---------- the stone ---------- */
const el=DATA.map((d,i)=>i).filter(i=>DATA[i].g==="el"), tr=DATA.map((d,i)=>i).filter(i=>DATA[i].g==="tr"), ot=DATA.findIndex(d=>d.g==="ot");
// the cut follows the counts: three rings above for the elections, two below for the land
const NC=Math.max(14,Math.ceil(el.length/3)),NP=Math.max(10,Math.ceil(tr.length/2));
const P={tableY:0.44,tableR:0.46,gy:0.025,nc:NC,c1el:40,c2el:52,c2lift:0.14,c2r:0.90,c3el:64,np:NP,p1el:50,p2el:32,p2r:0.97,depth:0.95,ng:Math.max(60,Math.round(NC*NP/2))};
const F=buildGem(P).filter(f=>f.area>1e-5);
const az=f=>Math.atan2(f.n[2],f.n[0]);
const crown=F.filter(f=>f.group==="crown").sort((a,b)=>az(a)-az(b)||a.tier.localeCompare(b.tier));
const pav=F.filter(f=>f.group==="pav").sort((a,b)=>az(a)-az(b));
crown.forEach((f,k)=>{if(el[k]!=null)f.d=el[k]});   // the upper half: the elections
if(ot>=0)F.find(f=>f.group==="table").d=ot;      // the top facet
pav.forEach((f,k)=>{if(tr[k]!=null)f.d=tr[k]});     // the lower half: the land
const byData=[];F.forEach(f=>{if(f.d!=null)byData[f.d]=f});
// each facet's own frame, for the engraved name
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
      nrm=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l]};
F.forEach(f=>{
  if(f.d==null)return;
  f.U=Math.abs(f.n[1])>0.999?[1,0,0]:nrm(cross([0,1,0],f.n)); f.V=cross(f.n,f.U); if(f.V[1]<0){f.V=f.V.map(x=>-x);f.U=f.U.map(x=>-x)}
  // the facet as a flat outline, for fitting its name
  f.poly=f.pts.map(p=>{const r=p.map((x,k)=>x-f.c[k]);return[dot(r,f.U),dot(r,f.V)]});
  const vs=f.poly.map(p=>p[1]);f.v0=Math.min(...vs);f.v1=Math.max(...vs);
  let A=0,cv2=0;for(let i=0;i<f.poly.length;i++){const a=f.poly[i],b=f.poly[(i+1)%f.poly.length],w=a[0]*b[1]-b[0]*a[1];A+=w;cv2+=(a[1]+b[1])*w}
  f.vc=cv2/(3*A);
});

/* ---------- rotation ---------- */
const qmul=(a,b)=>[a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
const qax=(x,y,z,a)=>{const s=Math.sin(a/2);return[x*s,y*s,z*s,Math.cos(a/2)]};
const qn=q=>{const l=Math.hypot(q[0],q[1],q[2],q[3]);return q.map(x=>x/l)};
let q=qmul(qax(1,0,0,0.60),qax(0,0,1,-0.10)), M=null;
function mat(){const[x,y,z,w]=q;M=[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w),2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w),2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]}
const rot=p=>[M[0]*p[0]+M[1]*p[1]+M[2]*p[2],M[3]*p[0]+M[4]*p[1]+M[5]*p[2],M[6]*p[0]+M[7]*p[1]+M[8]*p[2]];

/* ---------- canvas size ---------- */
let W=0,H=0,S=1,cx=0,cy=0,dpr=1;const CAM=5.2;
const VW={};
function size(){for(const[k,c]of[["main",cv],["mini",jw]]){const r=c.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);
    c.width=Math.max(1,Math.round(r.width*d));c.height=Math.max(1,Math.round(r.height*d));const m=Math.min(r.width,r.height);
    VW[k]={W:r.width,H:r.height,dpr:d,S:m*(k==="mini"?0.41:0.47),cx:r.width/2,cy:r.height*(k==="mini"?0.5:0.48)}}use("main")}
function use(k){const v=VW[k];W=v.W;H=v.H;dpr=v.dpr;S=v.S;cx=v.cx;cy=v.cy;isMini=k==="mini";ctx=isMini?jwCtx:mainCtx}
function drawAll(now){use("mini");draw(now);use("main");draw(now)}
const proj=p=>{const f=CAM/(CAM-p[2]);return[cx+p[0]*S*f,cy-(p[1]+0.25)*S*f]};

/* ---------- light ---------- */
const L1=nrm([-0.55,0.75,0.55]),L2=nrm([0.75,0.25,0.6]),L3=nrm([0.1,-0.7,0.7]);
function env(r){let b=0.10+0.95*Math.pow(Math.max(0,dot(r,L1)),7)+0.6*Math.pow(Math.max(0,dot(r,L2)),12)+0.32*Math.pow(Math.max(0,dot(r,L3)),5);
  b+=0.16*(0.5+0.5*Math.sin(8*r[0]+5*r[1]-3*r[2]));return b}
const refl=(n,v)=>{const k=2*dot(n,v);return[k*n[0]-v[0],k*n[1]-v[1],k*n[2]-v[2]]};
const PAL={el:[[26,24,40],[226,190,120],[255,250,236]],tr:[[8,14,44],[108,148,244],[240,246,255]],ot:[[22,22,30],[176,178,196],[255,255,255]],
           table:[[10,16,40],[120,140,200],[255,255,255]],girdle:[[40,44,66],[170,176,200],[240,242,250]]};
function shade(pal,b){b=Math.max(0,Math.min(1.25,b));const[a,m,h]=pal;let c;
  if(b<0.5){const t=b/0.5;c=[a[0]+(m[0]-a[0])*t,a[1]+(m[1]-a[1])*t,a[2]+(m[2]-a[2])*t]}
  else{const t=Math.min(1,(b-0.5)/0.6);c=[m[0]+(h[0]-m[0])*t,m[1]+(h[1]-m[1])*t,m[2]+(h[2]-m[2])*t]}
  return c.map(Math.round)}
const palOf=f=>f.group==="table"?PAL.table:f.group==="girdle"?PAL.girdle:f.d==null?PAL.el:PAL[DATA[f.d].g];

/* ---------- state ---------- */
let active=-1,pinned=false,hover=-1,lastFeature=0,userUntil=0,seen=[];
let drag=null,vel=[0,0];
const tintVar={el:"var(--st-el)",tr:"var(--st-tr)",ot:"var(--st-ot)"};

function setActive(i,quick){
  if(i===active||i<0)return;active=i;seen.push(i);if(seen.length>24)seen.shift();
  const fill=()=>{const d=DATA[i];
    words.style.setProperty("--c",tintVar[d.g]);
    $("st-chip").lastElementChild.textContent=(d.g==="tr"?T.lower+" \u00b7 "+T.tr:d.g==="el"?T.upper+" \u00b7 "+T.el:T.top);
    $("st-name").textContent=d.n;$("st-meta").textContent=d.t;$("st-meta").hidden=!d.t;
    $("st-quote").textContent=d.q;$("st-more").href=d.u;
    words.classList.remove("swap")};
  if(quick){fill()}else{words.classList.add("swap");setTimeout(fill,240)}
}
/* ---------- drawing ---------- */
function path(pp){ctx.beginPath();ctx.moveTo(pp[0][0],pp[0][1]);for(let i=1;i<pp.length;i++)ctx.lineTo(pp[i][0],pp[i][1]);ctx.closePath()}
const MINSIZE=0.031;   // in stone units; below this a full name gives way to the short one
function nameLines(f){ if(f.lines)return f.lines;
  const d=DATA[f.d],full=d.f,short=d.s;
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.font=FONT;
  const wd=s=>ctx.measureText(s).width/100;
  const chord=v=>{let lo=1e9,hi=-1e9;const P2=f.poly;for(let i=0;i<P2.length;i++){const a=P2[i],b=P2[(i+1)%P2.length];
      if((a[1]-v)*(b[1]-v)<=0&&a[1]!==b[1]){const u=a[0]+(b[0]-a[0])*(v-a[1])/(b[1]-a[1]);lo=Math.min(lo,u);hi=Math.max(hi,u)}}return hi>lo?[lo,hi]:null};
  const band=(v,hb)=>{let lo=-1e9,hi=1e9;for(let k=0;k<=6;k++){const c=chord(v-hb/2+hb*k/6);if(!c)return null;lo=Math.max(lo,c[0]);hi=Math.min(hi,c[1])}return hi>lo?[lo,hi]:null};
  const th=f.v1-f.v0;
  // the largest upright block that fits inside the facet, with the name centered in it
  const fit=lines=>{const w=Math.max(...lines.map(wd));let best=null;
    for(let k=0;k<=14;k++){const v=f.v0+th*(0.15+0.70*k/14);
      for(let size=0.085;size>0.01;size*=0.95){const hb=lines.length*1.08*size*1.12,b=band(v,hb);if(b&&w*size<=(b[1]-b[0])*0.84){const sc=size*(1-0.35*Math.abs(v-f.vc)/th);
          if(!best||sc>best.sc)best={sc,size,v,u:(b[0]+b[1])/2,lines};break}}}
    return best};
  // every way of breaking the words into one, two or three lines
  const breaks=s=>{const ws=s.split(" "),out=[[s]];
    for(let i=1;i<ws.length;i++){out.push([ws.slice(0,i).join(" "),ws.slice(i).join(" ")]);
      for(let j=i+1;j<ws.length;j++)out.push([ws.slice(0,i).join(" "),ws.slice(i,j).join(" "),ws.slice(j).join(" ")])}return out};
  const bestOf=s=>{let b=null;for(const L of breaks(s)){const r=fit(L);if(r&&(!b||r.size>b.size))b=r}return b};
  let pick=full?bestOf(full):null;
  if(short&&(!pick||pick.size<MINSIZE)){const sh=bestOf(short);if(sh&&(!pick||sh.size>pick.size))pick=sh}
  ctx.restore();
  if(!pick)pick={size:0.012,v:f.vc,u:0,lines:[full||short]};
  f.tx={u:pick.u,v:pick.v};
  f.lines={lines:pick.lines,size:pick.size};return f.lines}
let mainFrame=[];
function draw(now){
  mat();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  // light pooling on the velvet under the stone
  const g0=ctx.createRadialGradient(cx,cy+S*0.92,0,cx,cy+S*0.92,S*1.25);g0.addColorStop(0,"rgba(120,150,255,0.14)");g0.addColorStop(1,"rgba(120,150,255,0)");
  if(!isMini){ctx.save();ctx.translate(0,cy+S*0.92);ctx.scale(1,0.22);ctx.translate(0,-(cy+S*0.92));ctx.fillStyle=g0;ctx.fillRect(0,0,W,H*4);ctx.restore()}
  const cam=[0,0,CAM],frame=[];if(!isMini)mainFrame=frame;
  for(const f of F){const n=rot(f.n),c=rot(f.c),v=nrm([cam[0]-c[0],cam[1]-c[1],cam[2]-c[2]]);
    const facing=dot(n,v),pp=f.pts.map(p=>proj(rot(p)));frame.push({f,n,c,v,facing,pp})}
  // far side first: seen through the stone
  for(const o of frame){if(o.facing>=0)continue;const nb=[-o.n[0],-o.n[1],-o.n[2]],b=env(refl(nb,o.v))*0.70,c=shade(palOf(o.f),b);
    path(o.pp);ctx.fillStyle="rgba("+c[0]+","+c[1]+","+c[2]+",0.62)";ctx.fill();ctx.lineWidth=0.6;ctx.strokeStyle="rgba(255,255,255,0.10)";ctx.stroke();
    if(o.f.d===active&&!isMini){ctx.fillStyle="rgba(255,232,160,0.30)";ctx.fill()}}
  // near side
  const glints=[];
  for(const o of frame){if(o.facing<0)continue;const f=o.f,pal=palOf(f);
    const b=env(refl(o.n,o.v)),t=nrm(cross(o.n,[0.3,0.9,0.2])),k=0.16;
    const b1=env(refl(nrm([o.n[0]+t[0]*k,o.n[1]+t[1]*k,o.n[2]+t[2]*k]),o.v)),b2=env(refl(nrm([o.n[0]-t[0]*k,o.n[1]-t[1]*k,o.n[2]-t[2]*k]),o.v));
    let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const p of o.pp){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}
    const gr=ctx.createLinearGradient(x0,y0,x1,y1),c1=shade(pal,b1),c2=shade(pal,b2);
    const al=f.group==="table"?0.16+0.5*Math.max(0,b-0.5):Math.min(0.95,0.36+0.56*b);
    gr.addColorStop(0,"rgba("+c1[0]+","+c1[1]+","+c1[2]+","+al+")");gr.addColorStop(1,"rgba("+c2[0]+","+c2[1]+","+c2[2]+","+al+")");
    path(o.pp);ctx.fillStyle=gr;ctx.fill();ctx.lineWidth=0.7;ctx.strokeStyle="rgba(255,255,255,"+(f.group==="girdle"?0.10:0.20+0.4*Math.min(1,b))+")";ctx.stroke();
    o.b=b;if(b>0.80&&f.group!=="girdle")glints.push(o);
  }
  // engraved names
  if(showNames&&!isMini){ctx.textAlign="center";ctx.textBaseline="middle";
    for(const o of frame){const f=o.f;if(f.d==null||o.facing<0.42)continue;const L=nameLines(f);
      const px=L.size*S*(CAM/(CAM-o.c[2]));if(px<6.2)continue;
      const org=f.c.map((x,k)=>x+f.U[k]*f.tx.u+f.V[k]*f.tx.v),p0=proj(rot(org)),e=0.05;
      const pu=proj(rot(org.map((x,k)=>x+f.U[k]*e))),pv=proj(rot(org.map((x,k)=>x+f.V[k]*e)));
      const ux=(pu[0]-p0[0])/e,uy=(pu[1]-p0[1])/e,vx=(pv[0]-p0[0])/e,vy=(pv[1]-p0[1])/e;
      const sc=L.size/100;ctx.save();ctx.transform(ux*sc,uy*sc,-vx*sc,-vy*sc,p0[0],p0[1]);
      const a=Math.min(1,(o.facing-0.42)/0.25)*(f.d===active?1:0.80);
      ctx.font=FONT;ctx.lineJoin="round";ctx.lineWidth=9;ctx.strokeStyle="rgba(8,12,34,"+(0.42*a)+")";ctx.fillStyle="rgba(255,250,236,"+a+")";
      const lh=108,y0=-(L.lines.length-1)*lh/2;L.lines.forEach((s,i)=>{ctx.strokeText(s,0,y0+i*lh);ctx.fillText(s,0,y0+i*lh)});ctx.restore()}}
  // the facet being read
  const A=frame.find(o=>o.f.d===active);
  if(A&&A.facing>=0&&!isMini){ctx.save();path(A.pp);ctx.shadowColor="rgba(255,214,120,0.9)";ctx.shadowBlur=22;ctx.lineWidth=2;ctx.strokeStyle="#ffe7a6";ctx.stroke();
    ctx.shadowBlur=0;ctx.fillStyle="rgba(255,232,160,0.20)";ctx.fill();ctx.restore()}
  // a few glints where the light catches
  glints.sort((a,b)=>b.b-a.b);for(const o of glints.slice(0,3)){const p=o.pp[0],a=Math.min(0.9,(o.b-0.80)*2.4),r=S*(0.05+0.09*a)*(isMini?2.4:1);
    ctx.save();ctx.globalCompositeOperation="lighter";ctx.translate(p[0],p[1]);
    for(const[rx,ry]of[[r,r*0.07],[r*0.07,r]]){const g=ctx.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,"rgba(255,255,255,"+a+")");g.addColorStop(1,"rgba(255,255,255,0)");
      ctx.save();ctx.scale(rx/r,ry/r);ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();ctx.restore()}ctx.restore()}
}

/* ---------- motion ---------- */
let last=0;
function pickNext(){ // the facet that will face the viewer in a few seconds
  const ahead=qmul(qax(0,1,0,0.16*3.2),q);const save=q;q=ahead;mat();let best=-1,bs=-9;
  for(const f of F){if(f.d==null||seen.indexOf(f.d)>=0)continue;const n=rot(f.n),c=rot(f.c);if(c[0]<-0.75||c[0]>0.75)continue;
    const s=n[2]+(DATA[f.d].g==="tr"?0.04:0);if(s>bs){bs=s;best=f.d}}
  q=save;return best}
function tick(now){const dt=Math.min(0.05,(now-last)/1000||0);last=now;
  if(!drag){
    if(Math.abs(vel[0])+Math.abs(vel[1])>0.02){q=qn(qmul(qmul(qax(0,1,0,vel[0]*dt),qax(1,0,0,vel[1]*dt)),q));const k=Math.exp(-2.6*dt);vel=[vel[0]*k,vel[1]*k]}
    else if(auto&&!pinned&&now>userUntil){const slow=hover>=0?0.25:1;
      q=qn(qmul(qmul(qax(0,1,0,0.16*dt*slow),q),qax(0,1,0,0.045*dt*slow)));
      if(hover<0&&now-lastFeature>7000){const i=pickNext();if(i>=0){setActive(i);lastFeature=now}}}
  }
  drawAll(now);raf=running?requestAnimationFrame(tick):0}

/* ---------- pointer ---------- */
function facetAt(x,y){let hit=-1,best=-1;for(const o of mainFrame){if(o.facing<=0||o.f.d==null)continue;const pp=o.pp;let inside=false;
    for(let i=0,j=pp.length-1;i<pp.length;j=i++){const a=pp[i],b=pp[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside}
    if(inside&&o.facing>best){best=o.facing;hit=o.f.d}}return hit}
const pos=e=>{const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
cv.addEventListener("pointerdown",e=>{const p=pos(e);drag={x:p[0],y:p[1],sx:p[0],sy:p[1],t:performance.now(),moved:false};vel=[0,0];cv.setPointerCapture(e.pointerId);cv.classList.add("dragging")});
cv.addEventListener("pointermove",e=>{const p=pos(e);
  if(drag){const dx=p[0]-drag.x,dy=p[1]-drag.y,now=performance.now(),dt=Math.max(1,now-drag.t)/1000;
    if(Math.hypot(p[0]-drag.sx,p[1]-drag.sy)>5)drag.moved=true;
    q=qn(qmul(qmul(qax(0,1,0,dx*0.0085),qax(1,0,0,dy*0.0085)),q));vel=[dx*0.0085/dt*0.6,dy*0.0085/dt*0.6];drag.x=p[0];drag.y=p[1];drag.t=now}
  else if(e.pointerType==="mouse"){const h=facetAt(p[0],p[1]);hover=h;if(h>=0&&!pinned)setActive(h,true)}});
function up(e){if(!drag)return;const p=pos(e);cv.classList.remove("dragging");
  if(!drag.moved){vel=[0,0];const h=facetAt(p[0],p[1]);if(h>=0){setActive(h,true);pinned=true;lastFeature=performance.now()}else{pinned=false}}
  else{pinned=false;userUntil=performance.now()+2500;vel=[Math.max(-4,Math.min(4,vel[0])),Math.max(-4,Math.min(4,vel[1]))]}
  drag=null}
cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",e=>{drag=null;cv.classList.remove("dragging")});
cv.addEventListener("pointerleave",()=>{hover=-1});
cv.addEventListener("keydown",e=>{const k={ArrowLeft:[-0.14,0],ArrowRight:[0.14,0],ArrowUp:[0,-0.14],ArrowDown:[0,0.14]}[e.key];if(!k)return;e.preventDefault();
  q=qn(qmul(qmul(qax(0,1,0,k[0]),qax(1,0,0,k[1])),q));userUntil=performance.now()+2500});

/* ---------- controls ---------- */
function step(d){const order=[ot].concat(el,tr);let i=order.indexOf(active);i=(i+d+order.length)%order.length;const id=order[i];
  pinned=true;setActive(id,true);words.setAttribute("aria-live","polite");
  // turn the stone so this facet faces the viewer
  mat();const f=byData[id],n=rot(f.n),tgt=nrm([0,0.18,1]),ax=cross(n,tgt),s=Math.hypot(ax[0],ax[1],ax[2]),c=dot(n,tgt);
  if(s>1e-4){const ang=Math.atan2(s,c),a=nrm(ax);const from=q,to=qn(qmul(qax(a[0],a[1],a[2],ang),q)),t0=performance.now();
    (function go(now){const u=Math.min(1,(now-t0)/700),e=u*u*(3-2*u);let d4=from[0]*to[0]+from[1]*to[1]+from[2]*to[2]+from[3]*to[3];const sg=d4<0?-1:1;
      q=qn(from.map((x,k)=>x+(to[k]*sg-x)*e));if(u<1&&pinned&&active===id)requestAnimationFrame(go)})(t0)}}
$("st-prev").onclick=()=>step(-1);$("st-next").onclick=()=>step(1);
$("st-auto").onclick=function(){auto=!auto;this.setAttribute("aria-pressed",auto);if(auto){pinned=false;lastFeature=0}};
$("st-names").onchange=function(){showNames=this.checked};

/* ---------- start ---------- */
let raf=0,running=false;const seenBy=new Set();
function wake(){const on=seenBy.size>0&&!document.hidden;if(on&&!running){running=true;raf=requestAnimationFrame(t=>{last=t;tick(t)})}else if(!on&&running){running=false;cancelAnimationFrame(raf)}}
$("st-auto").setAttribute("aria-pressed",auto);
size();mat();drawAll(0);
{let b=-1,s=-9;F.forEach(f=>{if(f.d==null)return;const n=rot(f.n);if(n[2]>s){s=n[2];b=f.d}});setActive(b,true)}
{const ro=new ResizeObserver(()=>{size();if(!running)drawAll(0)});ro.observe(cv);ro.observe(jw)}
if(window.IntersectionObserver){const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?seenBy.add(e.target):seenBy.delete(e.target)});wake()});io.observe(cv);io.observe(jw)}else{seenBy.add(cv);wake()}
document.addEventListener("visibilitychange",wake);
$("st-jewelbtn").onclick=()=>{$("stone").scrollIntoView({behavior:still?"auto":"smooth",block:"start"})};
if(document.fonts){const again=()=>{F.forEach(f=>{f.lines=null});if(!running)drawAll(0)};if(document.fonts.ready)document.fonts.ready.then(again);if(document.fonts.addEventListener)document.fonts.addEventListener("loadingdone",again)}
lastFeature=performance.now()-3500;
})();
