window.Greenhouse = window.Greenhouse || {};
Greenhouse.state = {
  running:true, emergency:false, mode:"AUTO", selected:0,
  airTemp:28.5, airHumidity:68,
  zones:[
    {name:"Khu vực 01", moisture:35, onThreshold:40, offThreshold:60, duration:30, valve:true, plant:"Cần bổ sung nước", seconds:0},
    {name:"Khu vực 02", moisture:55, onThreshold:45, offThreshold:60, duration:30, valve:false, plant:"Phát triển tốt", seconds:0},
    {name:"Khu vực 03", moisture:28, onThreshold:40, offThreshold:60, duration:30, valve:true, plant:"Cần bổ sung nước", seconds:0}
  ],
  history:[], samples:{temp:[],air:[],soil:[[],[],[]]}
};
Greenhouse.tick = function(){
  const s=Greenhouse.state;
  if(s.running && !s.emergency){
    s.zones.forEach((z)=>{
      if(z.valve){ z.moisture=Math.min(82,z.moisture+1.2+Math.random()*1.2); 
        z.seconds++; }
      else { z.moisture=Math.max(18,z.moisture-(Math.random()*.8)); }
      if(s.mode==="AUTO"){
        if(!z.valve && z.moisture<z.onThreshold){z.valve=true;
          Greenhouse.addLog("Van tưới "+z.name.toLowerCase()+" tự động bật","info");}
        else if(z.valve && z.moisture>=z.offThreshold){z.valve=false;
          Greenhouse.addLog("Van tưới "+z.name.toLowerCase()+" tự động tắt","success");}
      }
      if(z.moisture<z.onThreshold)z.plant="Cần bổ sung nước";
      else if(z.moisture>z.offThreshold+10)z.plant="Độ ẩm cao";
      else z.plant="Phát triển tốt";
    });
  } else if(!s.running || s.emergency){s.zones.forEach(z=>z.valve=false);}
  s.airTemp=+(s.airTemp+(Math.random()-.5)*.45).toFixed(1);
  s.airTemp=Math.max(23,Math.min(34,s.airTemp));
  s.airHumidity=Math.round(Math.max(45,Math.min(85,s.airHumidity+(Math.random()-.5)*3)));
  s.samples.temp.push(s.airTemp);
  s.samples.air.push(s.airHumidity);
  s.zones.forEach((z,i)=>s.samples.soil[i].push(Math.round(z.moisture)));
  Object.keys(s.samples).forEach(k=>{if(k==="soil")s.samples.soil.forEach(a=>{if(a.length>24)a.shift()});else if(s.samples[k].length>24)s.samples[k].shift()});
  Greenhouse.render();
};
Greenhouse.seedSamples=function(){
  for(let i=0;i<18;i++){
    Greenhouse.state.samples.temp.push(27+Math.random()*3);
    Greenhouse.state.samples.air.push(63+Math.random()*10);
    Greenhouse.state.zones.forEach((z,j)=>Greenhouse.state.samples.soil[j].push(z.moisture+Math.random()*4-2));}
};
