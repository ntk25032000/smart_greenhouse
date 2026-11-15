Greenhouse.toast=function(message){
  const el=document.getElementById("toast");
  el.textContent=message;
  el.classList.add("show");
  clearTimeout(Greenhouse.toastTimer);
  Greenhouse.toastTimer=setTimeout(()=>el.classList.remove("show"),2400);
};
Greenhouse.render=function(){
  const s=Greenhouse.state;
  document.getElementById("air-temp").innerHTML=s.airTemp+'<span>°C</span>';
  document.getElementById("air-humidity").innerHTML=s.airHumidity+'<span>%</span>';
  const need=s.zones.filter(z=>z.moisture<z.onThreshold).length,active=s.zones.filter(z=>z.valve).length;
  document.getElementById("need-watering").innerHTML=String(need).padStart(2,"0")+'<span>/ 03</span>';
  document.getElementById("active-valves").innerHTML=String(active).padStart(2,"0")+'<span>/ 03</span>';
  s.zones.forEach((z,i)=>{
    document.getElementById("zone-moisture-"+i).textContent=Math.round(z.moisture)+"%";
    const btn=document.querySelector(`.zone[data-zone="${i}"]`);
    btn.classList.toggle("selected",s.selected===i);
    btn.style.background=z.valve?"rgba(33,116,185,.88)":z.moisture<z.onThreshold?"rgba(191,130,42,.88)":"rgba(26,91,57,.78)";
    const state=document.getElementById("valve-state-"+i);
    state.textContent=z.valve?"ON":"OFF";state.classList.toggle("on",z.valve);
    document.querySelectorAll(
    `.valve-command[data-valve="${i}"]`
).forEach(button => {

    const wantsOn = button.dataset.valveAction === "on";

    button.classList.toggle("selected", z.valve === wantsOn);

    button.disabled =
    s.mode !== "MANUAL" ||
    !s.running ||
    s.emergency;
});
  });
  const status=document.getElementById("system-status");
  status.textContent=s.emergency?"KHẨN CẤP":s.running?"ĐANG CHẠY":"ĐÃ DỪNG";
  status.className="status-pill"+(s.emergency?" emergency":!s.running?" stopped":"");
  document.getElementById("start-btn").disabled=s.running&&!s.emergency;
  const z=s.zones[s.selected];
  document.getElementById("detail-name").textContent="Thông tin "+z.name.toLowerCase();
  document.getElementById("detail-moisture").textContent=Math.round(z.moisture)+"%";
  document.getElementById("detail-moisture-bar").style.width=Math.round(z.moisture)+"%";
  document.getElementById("detail-temp").textContent=s.airTemp+" °C";
  const plant=document.getElementById("detail-plant");
  plant.textContent=z.plant;
  plant.className=z.plant==="Phát triển tốt"?"plant-good":z.plant==="Độ ẩm cao"?"plant-bad":"plant-warn";
  document.getElementById("detail-valve").textContent="Van tưới: "+(z.valve?"ĐANG BẬT":"ĐANG TẮT");
  if(Greenhouse.renderCharts)Greenhouse.renderCharts();
};
Greenhouse.showPage=function(page){
  document.querySelectorAll(".page-section").forEach(el=>el.classList.remove("active"));
  document.getElementById("page-"+page).classList.add("active");
  document.querySelectorAll(".nav-item").forEach(el=>el.classList.toggle("active",el.dataset.page===page));
  const titles={dashboard:"Tổng quan nhà kính",charts:"Biểu đồ môi trường",settings:"Cài đặt hệ thống",history:"Lịch sử hoạt động"};
  document.getElementById("page-title").textContent=titles[page];
  if(page==="charts")Greenhouse.renderCharts();
};
Greenhouse.renderSettings=function(){
  document.getElementById("settings-rows").innerHTML=Greenhouse.state.zones.map((z,i)=>`<tr><td><b>${z.name}</b></td><td><input type="number" min="1" max="90" id="on-${i}" value="${z.onThreshold}"></td><td><input type="number" min="10" max="100" id="off-${i}" value="${z.offThreshold}"></td><td><input type="number" min="5" max="600" id="duration-${i}" value="${z.duration}"></td></tr>`).join("");
};
document.addEventListener("DOMContentLoaded",()=>{
  if(window.lucide)lucide.createIcons();
  Greenhouse.seedSamples();
  document.getElementById("current-date").textContent=new Date().toLocaleDateString("vi-VN",{weekday:"short",day:"2-digit",month:"2-digit",year:"numeric"});
  document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>Greenhouse.showPage(btn.dataset.page)));
  document.querySelectorAll(".zone").forEach(btn=>btn.addEventListener("click",()=>{Greenhouse.state.selected=Number(btn.dataset.zone);Greenhouse.render();}));
  document.getElementById("auto-mode").addEventListener("click",()=>Greenhouse.setMode("AUTO"));
  document.getElementById("manual-mode").addEventListener("click",()=>Greenhouse.setMode("MANUAL"));
  document.querySelectorAll(".valve-command").forEach(btn => {
    btn.addEventListener("click", () => {
        const index = Number(btn.dataset.valve);
        const turnOn = btn.dataset.valveAction === "on";

        Greenhouse.setValve(index, turnOn);
    });
});
  document.getElementById("start-btn").addEventListener("click",Greenhouse.start);
  document.getElementById("stop-btn").addEventListener("click",Greenhouse.stop);
  document.getElementById("emergency-btn").addEventListener("click",Greenhouse.emergencyStop);
  document.getElementById("reset-btn")
    .addEventListener("click", () => {

        const confirmReset = confirm(
            "Bạn có chắc chắn muốn RESET hệ thống? " +
            "Tất cả vòi tưới sẽ chuyển OFF."
        );

        if (confirmReset) {
            Greenhouse.resetSystem();
        }
    });
  document.getElementById("save-settings").addEventListener("click",()=>{
    let valid=true;
    Greenhouse.state.zones.forEach((z,i)=>{
      const on=Number(document.getElementById("on-"+i).value),off=Number(document.getElementById("off-"+i).value),duration=Number(document.getElementById("duration-"+i).value);
      if(!on||!off||!duration||on>=off||on<1||off>100||duration<5){valid=false;return;}
      z.onThreshold=on;z.offThreshold=off;z.duration=duration;
    });
    const msg=document.getElementById("save-message");
    if(!valid){msg.textContent="Giá trị không hợp lệ. Ngưỡng bật phải nhỏ hơn ngưỡng dừng.";msg.style.color="#d84b4b";return;}
    msg.textContent="Đã lưu cài đặt thành công.";
    msg.style.color="var(--green)";
    Greenhouse.addLog("Cập nhật ngưỡng độ ẩm và thời gian tưới","success");
    Greenhouse.render();
  });
  document.getElementById("clear-history").addEventListener("click",()=>{if(confirm("Bạn có chắc muốn xóa toàn bộ lịch sử?")){Greenhouse.state.history=[];Greenhouse.renderHistory();}});
  Greenhouse.renderSettings();
  Greenhouse.addLog("Hệ thống mô phỏng đã khởi tạo","success");
  Greenhouse.addLog("Đang theo dõi 3 khu vực trồng cây","info");
  Greenhouse.render();
  Greenhouse.renderHistory();
  setInterval(Greenhouse.tick,1500);
  window.addEventListener("resize",()=>{if(document.getElementById("page-charts").classList.contains("active"))Greenhouse.renderCharts();});
});
