Greenhouse.setMode=function(mode){
  const s=Greenhouse.state;if(s.emergency){
    Greenhouse.toast("Hãy RESET dừng khẩn cấp trước.");return;}
  s.mode=mode;
  document.getElementById("auto-mode").classList.toggle("active",mode==="AUTO");
  document.getElementById("manual-mode").classList.toggle("active",mode==="MANUAL");
  document.getElementById("mode-description").textContent=mode==="AUTO"?"Hệ thống tự động điều khiển van theo ngưỡng độ ẩm đã cài đặt.":"Chế độ thủ công: sử dụng công tắc để bật hoặc tắt từng van.";
  Greenhouse.render();
  Greenhouse.addLog("Chuyển sang chế độ "+mode,"info");
};
Greenhouse.setValve = function(index, turnOn) {
    const s = Greenhouse.state;

    if (s.mode !== "MANUAL") {
        Greenhouse.toast("Hãy chuyển sang MANUAL.");
        return;
    }

    if (s.emergency) {
        Greenhouse.toast("Hệ thống đang bị khóa khẩn cấp.");
        return;
    }

    if (!s.running) {
        Greenhouse.toast("Hãy nhấn START trước.");
        return;
    }

    const zone = s.zones[index];

    if (!zone) return;

    // Cập nhật trạng thái vòi
    zone.valve = turnOn;

    // Ghi nhật ký
    Greenhouse.addLog(
        zone.name + " chuyển sang " + (turnOn ? "ON" : "OFF"),
        "info"
    );

    // Cập nhật giao diện
    Greenhouse.render();
};
Greenhouse.start=function(){
  const s=Greenhouse.state;if(s.emergency){
    Greenhouse.toast("Cần RESET trước khi khởi động.");
    return;}
  s.running=true;
  Greenhouse.addLog("Khởi động hệ thống tưới","success");
  Greenhouse.toast("Hệ thống đã khởi động.");
  Greenhouse.render();
};
Greenhouse.stop=function(){
  const s=Greenhouse.state;
  s.running=false;
  s.zones.forEach(z=>z.valve=false);
  Greenhouse.addLog("STOP: Đã dừng bơm và toàn bộ van tưới","alert");
  Greenhouse.toast("Đã dừng hệ thống.");
  Greenhouse.render();
};
Greenhouse.emergencyStop=function(){
  if(!confirm("XÁC NHẬN DỪNG KHẨN CẤP?\\nToàn bộ van tưới sẽ bị khóa."))
    return;
  const s=Greenhouse.state;
  s.emergency=true;
  s.running=false;
  s.zones.forEach(z=>z.valve=false);
  Greenhouse.addLog("EMERGENCY STOP: Khóa toàn bộ hệ thống","alert");
  Greenhouse.toast("Đã kích hoạt dừng khẩn cấp.");
  Greenhouse.render();
  setTimeout(() => {
    if (confirm("Hệ thống đang bị khóa. Bạn có muốn RESET để cho phép hoạt động trở lại?")) {
        Greenhouse.resetSystem();
    }
}, 250);
};
Greenhouse.resetSystem = function() {
    const s = Greenhouse.state;

    s.emergency = false;
    s.running = false;
    s.mode = "AUTO";

    s.zones.forEach(zone => {
        zone.valve = false;
        zone.seconds = 0;
    });

    document.getElementById("auto-mode").classList.add("active");
    document.getElementById("manual-mode").classList.remove("active");

    document.getElementById("mode-description").textContent =
        "Hệ thống đang ở AUTO. Nhấn START để bắt đầu.";

    Greenhouse.addLog(
        "RESET: Hệ thống trở về trạng thái an toàn, tất cả vòi OFF",
        "success"
    );

    Greenhouse.toast("RESET thành công. Tất cả vòi đã OFF.");

    Greenhouse.render();
};
