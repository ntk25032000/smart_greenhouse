Greenhouse.addLog=function(message,type="info"){
  const item={message,type,time:new Date()};
  Greenhouse.state.history.unshift(item);
  if(Greenhouse.state.history.length>80)Greenhouse.state.history.pop();
  if(Greenhouse.renderHistory)Greenhouse.renderHistory();
};
Greenhouse.renderHistory=function(){
  const el=document.getElementById("history-list");if(!el)return;
  if(!Greenhouse.state.history.length){
    el.innerHTML='<div class="empty-history">Chưa có hoạt động nào được ghi nhận.</div>';
    return;}
  el.innerHTML=Greenhouse.state.history.map(item=>{
    const time=item.time.toLocaleTimeString("vi-VN",{
      hour:"2-digit",minute:"2-digit",second:"2-digit"});
    const icon=item.type==="alert"?"alert-triangle":item.type==="success"?"check-circle":"activity";
    return `<div class="history-item"><div class="history-mark ${item.type==="alert"?"alert":""}"><i data-lucide="${icon}"></i></div><div class="history-text"><b>${item.message}</b><small>${item.time.toLocaleDateString("vi-VN")}</small></div><span class="history-time">${time}</span></div>`;
  }).join("");
  if(window.lucide)lucide.createIcons();
};
