Greenhouse.drawChart=function(canvasId,series,labels,min,max){
  const canvas=document.getElementById(canvasId);
  if(!canvas)
    return;
  const rect=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
  canvas.width=Math.max(300,rect.width)*dpr;canvas.height=190*dpr;
  const ctx=canvas.getContext("2d");
  ctx.scale(dpr,dpr);
  const w=canvas.width/dpr,h=190,p={l:32,r:12,t:12,b:25},cw=w-p.l-p.r,ch=h-p.t-p.b;
  ctx.clearRect(0,0,w,h);
  ctx.font="9px sans-serif";
  ctx.fillStyle="#9aa69e";
  ctx.strokeStyle="#edf1ed";
  ctx.lineWidth=1;
  for(let i=0;i<=4;i++){let y=p.t+ch*i/4;
    ctx.beginPath();
    ctx.moveTo(p.l,y);ctx.lineTo(w-p.r,y);
    ctx.stroke();ctx.fillText(String(Math.round(max-(max-min)*i/4)),2,y+3);}
  series.forEach((line,index)=>{
    const vals=line.values;if(!vals.length)return;
    ctx.strokeStyle=line.color;
    ctx.lineWidth=2;
    ctx.beginPath();
    vals.forEach((v,i)=>{const x=p.l+(vals.length===1?0:i/(Math.max(1,vals.length-1)))*cw;
      const y=p.t+(max-v)/(max-min)*ch;
      if(i===0)ctx.moveTo(x,y);
      else ctx.lineTo(x,y)});
    ctx.stroke();
    vals.forEach((v,i)=>{const x=p.l+(vals.length===1?0:i/(Math.max(1,vals.length-1)))*cw;
      const y=p.t+(max-v)/(max-min)*ch;
      ctx.fillStyle=line.color;ctx.beginPath();
      ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fill()});
  });
  ctx.fillStyle="#9aa69e";
  ctx.fillText("Gần đây",p.l,h-5);
  ctx.fillText("Hiện tại",w-48,h-5);
};
Greenhouse.renderCharts=function(){
  const s=Greenhouse.state;
  Greenhouse.drawChart("temperature-chart",[{values:s.samples.temp,color:"#e99a4a"}],20,36);
  Greenhouse.drawChart("air-chart",[{values:s.samples.air,color:"#559bd5"}],35,95);
  Greenhouse.drawChart("soil-chart",s.zones.map((z,i)=>({values:s.samples.soil[i],color:["#3b9b69","#559bd5","#b28bce"][i]})),0,100);
  document.getElementById("chart-temp-value").textContent=s.airTemp+"°C";
  document.getElementById("chart-air-value").textContent=s.airHumidity+"%";
};
