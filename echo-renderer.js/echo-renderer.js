// Nullus germen — Echo morphology prototype v0.1
const NS = "http://www.w3.org/2000/svg";

function hash32(s) {
  let h = 0x811c9dc5;
  for (let i=0;i<s.length;i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6D2B79F5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function el(tag, attrs={}, parent) {
  const n = document.createElementNS(NS, tag);
  for (const [k,v] of Object.entries(attrs)) n.setAttribute(k,v);
  if (parent) parent.appendChild(n);
  return n;
}

function renderEcho(svg, seedText, polarity="Lux") {
  svg.replaceChildren();
  svg.setAttribute("viewBox","0 0 276 276");

  const seed = hash32("echo-morph-v1|" + seedText);
  const r = rng(seed);
  const lux = polarity === "Lux";
  const ink = lux ? "#1457c9" : "#33217f";
  const mid = lux ? "#4b8fe8" : "#6045b7";
  const pale = lux ? "#a9d4ff" : "#b9a7ef";

  el("rect",{x:0,y:0,width:276,height:276,fill:"#fff"},svg);

  const defs=el("defs",{},svg);
  const grad=el("radialGradient",{id:"coreGlow"},defs);
  el("stop",{offset:"0%","stop-color":ink,"stop-opacity":".95"},grad);
  el("stop",{offset:"45%","stop-color":mid,"stop-opacity":".45"},grad);
  el("stop",{offset:"100%","stop-color":pale,"stop-opacity":"0"},grad);

  const mode = r() < 0.72 ? "rings" : "web";
  const cx=138+(r()-.5)*9;
  const cy=137+(r()-.5)*9;
  const outer=91+r()*8;

  for(let i=0;i<5;i++){
    el("circle",{cx,cy,r:outer-i*5,fill:"none",
      stroke:pale,"stroke-width":7-i*.7,
      "stroke-opacity":.10+(4-i)*.018},svg);
  }

  if(mode==="rings"){
    const count=5+Math.floor(r()*3);
    for(let i=0;i<count;i++){
      const rr=17+i*(outer-22)/(count-1);
      el("circle",{cx,cy,r:rr,fill:"none",
        stroke:i%2?mid:pale,
        "stroke-width":i===0?5:2.2+r()*2,
        "stroke-opacity":.34+r()*.34},svg);
      if(i>0 && i<count-1){
        el("circle",{cx,cy,r:rr+2.5,fill:"none",
          stroke:ink,"stroke-width":.65,
          "stroke-opacity":.22},svg);
      }
    }

    const spokes=16+Math.floor(r()*9);
    for(let i=0;i<spokes;i++){
      const a=2*Math.PI*i/spokes+(r()-.5)*.07;
      const x1=cx+Math.cos(a)*25;
      const y1=cy+Math.sin(a)*25;
      const x2=cx+Math.cos(a)*(outer+2);
      const y2=cy+Math.sin(a)*(outer+2);
      el("line",{x1,y1,x2,y2,stroke:ink,
        "stroke-width":.65,"stroke-opacity":.20},svg);
      if(r()>.35){
        const rr=35+r()*(outer-45);
        el("circle",{cx:cx+Math.cos(a)*rr,
          cy:cy+Math.sin(a)*rr,r:1.2+r()*1.5,
          fill:ink,"fill-opacity":.65},svg);
      }
    }
  } else {
    const n=8+Math.floor(r()*4), pts=[];
    for(let i=0;i<n;i++){
      const a=2*Math.PI*i/n;
      const rr=outer*(.72+r()*.23);
      pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);
    }
    for(let i=0;i<n;i++){
      const p=pts[i],q=pts[(i+1)%n];
      el("line",{x1:p[0],y1:p[1],x2:q[0],y2:q[1],
        stroke:mid,"stroke-width":1.5,
        "stroke-opacity":.42},svg);
      const j=(i+2+Math.floor(r()*3))%n,z=pts[j];
      el("line",{x1:p[0],y1:p[1],x2:z[0],y2:z[1],
        stroke:ink,"stroke-width":.8,
        "stroke-opacity":.28},svg);
    }

    const satellites=3+Math.floor(r()*3);
    for(let i=0;i<satellites;i++){
      const a=r()*Math.PI*2;
      const rr=24+r()*43;
      const x=cx+Math.cos(a)*rr;
      const y=cy+Math.sin(a)*rr;
      const rad=5+r()*9;
      el("circle",{cx:x,cy:y,r:rad*1.8,
        fill:pale,"fill-opacity":.28},svg);
      el("circle",{cx:x,cy:y,r:rad,fill:"white",
        "fill-opacity":.9,stroke:mid,"stroke-width":2},svg);
      el("circle",{cx:x,cy:y,r:rad*.42,fill:ink},svg);
    }
    for(const p of pts){
      el("circle",{cx:p[0],cy:p[1],r:2+r()*2,
        fill:ink,"fill-opacity":.8},svg);
    }
  }

  el("circle",{cx,cy,r:25,fill:"url(#coreGlow)"},svg);
  el("circle",{cx,cy,r:12,
    fill:lux?"#b8dcff":"#c8b8ff","fill-opacity":.72},svg);
  el("circle",{cx,cy,r:8,fill:ink,"fill-opacity":.95},svg);
  el("circle",{cx,cy,r:3.4,fill:"#fff"},svg);

  const dots=62+Math.floor(r()*35);
  for(let i=0;i<dots;i++){
    const a=r()*Math.PI*2;
    const rr=outer*(.88+r()*.20);
    el("circle",{
      cx:cx+Math.cos(a)*rr,
      cy:cy+Math.sin(a)*rr,
      r:.55+r()*1.35,
      fill:ink,
      "fill-opacity":.22+r()*.55
    },svg);
  }

  const nodes=3+Math.floor(r()*4);
  for(let i=0;i<nodes;i++){
    const a=r()*Math.PI*2;
    const rr=outer*(.72+r()*.23);
    const x=cx+Math.cos(a)*rr;
    const y=cy+Math.sin(a)*rr;
    const rad=3+r()*3;
    el("circle",{cx:x,cy:y,r:rad,fill:"#fff",
      stroke:ink,"stroke-width":1.7},svg);
    el("circle",{cx:x,cy:y,r:rad*.35,fill:ink},svg);
  }

  return {
    mode,
    seed:seed.toString(16).padStart(8,"0")
  };
}

window.renderEcho = renderEcho;
