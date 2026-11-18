import "./styles.css";

const root = document.querySelector("#root");
const apps = [
  { id: "files", name: "File Explorer", icon: "📁" },
  { id: "browser", name: "Qytrix Browser", icon: "🌐" },
  { id: "notes", name: "Notes", icon: "📝" },
  { id: "calculator", name: "Calculator", icon: "🧮" },
  { id: "settings", name: "Settings", icon: "⚙️" },
  { id: "terminal", name: "Terminal", icon: "⌘" }
];

const state = { windows: [], active: null, nextId: 1, menu: false, start: false };
const savedNotes = localStorage.getItem("qytrix-notes") || "";
const savedWallpaper = localStorage.getItem("qytrix-wallpaper") || "aurora";

function appContent(id) {
  if (id === "notes") return `<textarea class="notes" placeholder="Start writing...">${escapeHtml(savedNotes)}</textarea>`;
  if (id === "calculator") return `<div class="calculator"><div class="calc-display" id="calc-display">0</div><div class="calc-grid">${["7","8","9","÷","4","5","6","×","1","2","3","−","0",".","C","+","="].map(k => `<button data-key="${k}">${k}</button>`).join("")}</div></div>`;
  if (id === "files") return `<div class="file-view"><div class="file-toolbar"><strong>Home</strong><button data-action="new-folder">＋ New folder</button></div><div class="file-grid"><div class="file-item">📁 <span>Documents</span></div><div class="file-item">📁 <span>Pictures</span></div><div class="file-item">📁 <span>Downloads</span></div><div class="file-item">📄 <span>Welcome.txt</span></div></div><p class="muted">Your Qytrix files will live here. Local file storage is coming next.</p></div>`;
  if (id === "browser") return `<div class="browser"><form class="browser-bar" id="browser-form"><button type="button" data-action="back" title="Back">←</button><button type="button" data-action="forward" title="Forward">→</button><input id="browser-url" value="https://www.google.com" aria-label="address or search" placeholder="Search Google or enter a website" /><button type="submit">Go</button></form><div class="browser-status" id="browser-status" role="status">Ready · Google search</div><iframe title="Qytrix browser" id="browser-frame" src="https://www.google.com/webhp?igu=1" referrerpolicy="strict-origin-when-cross-origin"></iframe><div class="browser-fallback" id="browser-fallback" hidden><span id="browser-fallback-text">This page may not allow embedding.</span><button type="button" data-action="open-current">Open in this tab</button></div><p class="muted browser-note">Qytrix tries the embedded view first. Some sites block embedding; browser security does not let a webpage reliably inspect or bypass those restrictions.</p></div>`;
  if (id === "settings") return `<div class="settings"><h3>Personalization</h3><p>Choose your desktop atmosphere.</p><div class="wallpapers"><button data-wall="aurora">Aurora</button><button data-wall="night">Midnight</button><button data-wall="dusk">Dusk</button></div><h3>About Qytrix</h3><p>Qytrix OS · Browser edition</p><p class="muted">A desktop-style workspace that runs on the web.</p></div>`;
  if (id === "terminal") return `<div class="terminal"><p>Qytrix Terminal [web preview]</p><p>Type <b>help</b> to see available commands.</p><div class="terminal-line"><span>guest@qytrix:~$</span><input id="terminal-input" autocomplete="off" /></div><div id="terminal-output"></div></div>`;
  return "<p>Welcome to Qytrix.</p>";
}
function safeCalculate(source) {
  const tokens = source.match(/\\d+(?:\\.\\d+)?|[()+*/-]/g) || [];
  if (tokens.join("") !== source.replace(/\\s/g, "")) throw new Error("Invalid input");
  let i = 0;
  function factor() {
    if (tokens[i] === "+") { i++; return factor(); }
    if (tokens[i] === "-") { i++; return -factor(); }
    if (tokens[i] === "(") { i++; const n = expression(); if (tokens[i++] !== ")") throw new Error("Missing )"); return n; }
    const n = Number(tokens[i++]); if (!Number.isFinite(n)) throw new Error("Number expected"); return n;
  }
  function term() { let n = factor(); while (tokens[i] === "*" || tokens[i] === "/") { const op=tokens[i++], r=factor(); n=op==="*"?n*r:n/r; } return n; }
  function expression() { let n=term(); while (tokens[i] === "+" || tokens[i] === "-") { const op=tokens[i++], r=term(); n=op==="+"?n+r:n-r; } return n; }
  const result=expression(); if(i!==tokens.length || !Number.isFinite(result)) throw new Error("Invalid calculation"); return result;
}
function escapeHtml(value) { return value.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function openApp(id) {
  const existing = state.windows.find(w => w.app === id);
  if (existing) { existing.minimized = false; state.active = existing.id; render(); return; }
  const app = apps.find(a => a.id === id);
  const win = { id: state.nextId++, app: id, title: app.name, x: 120 + state.windows.length * 28, y: 70 + state.windows.length * 24, w: id === "browser" ? 780 : 560, h: id === "browser" ? 540 : 420, minimized: false };
  state.windows.push(win); state.active = win.id; render();
}
function render() {
  root.innerHTML = `<main class="desktop wallpaper-${savedWallpaper}">
    <header class="topbar"><div class="brand-mark">◈ <b>qytrix</b></div><div class="top-status">workspace <span>●</span> online</div><div class="top-actions"><button class="fullscreen-button" id="fullscreen-button" title="Enter fullscreen">⛶ Fullscreen</button><button class="top-clock" id="clock"></button></div></header>
    <section class="desktop-icons">${apps.map(a => `<button class="desktop-icon" data-open="${a.id}"><span>${a.icon}</span><small>${a.name}</small></button>`).join("")}</section>
    <section class="window-layer">${state.windows.filter(w=>!w.minimized).map(w=>`<article class="app-window ${state.active===w.id?"focused":""}" data-window="${w.id}" style="left:${w.x}px;top:${w.y}px;width:${w.w}px;height:${w.h}px"><header class="window-title" data-drag="${w.id}"><span>${apps.find(a=>a.id===w.app).icon} ${w.title}</span><nav><button data-min="${w.id}" aria-label="Minimize">−</button><button data-max="${w.id}" aria-label="Maximize">□</button><button data-close="${w.id}" aria-label="Close">×</button></nav></header><div class="window-content">${appContent(w.app)}</div></article>`).join("")}</section>
    ${state.start ? `<aside class="start-menu"><div class="start-heading">Good to see you.</div><input placeholder="Search apps" id="app-search" />${apps.map(a=>`<button data-open="${a.id}">${a.icon} ${a.name}</button>`).join("")}</aside>` : ""}
    <footer class="taskbar"><button class="start-button" id="start-button">◈</button><div class="task-apps">${state.windows.map(w=>`<button class="${state.active===w.id?"selected":""}" data-task="${w.id}">${apps.find(a=>a.id===w.app).icon}</button>`).join("")}</div><div class="tray">⌁　◉　<span id="tray-clock"></span></div></footer>
  </main>`;
  updateClock();
  const fullscreenButton = root.querySelector("#fullscreen-button");
  if (fullscreenButton) fullscreenButton.onclick = async () => { try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen(); } catch { fullscreenButton.textContent = "Fullscreen unavailable"; } };
  document.onfullscreenchange = () => { const b = root.querySelector("#fullscreen-button"); if (b) b.textContent = document.fullscreenElement ? "⛶ Exit fullscreen" : "⛶ Fullscreen"; };
  root.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click",()=>{state.start=false;openApp(b.dataset.open)}));
  root.querySelector("#start-button").onclick=()=>{state.start=!state.start;render()};
  root.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>{state.windows=state.windows.filter(w=>w.id!==Number(b.dataset.close));render()});
  root.querySelectorAll("[data-min]").forEach(b=>b.onclick=()=>{const w=state.windows.find(w=>w.id===Number(b.dataset.min));w.minimized=true;render()});
  root.querySelectorAll("[data-task]").forEach(b=>b.onclick=()=>{const w=state.windows.find(w=>w.id===Number(b.dataset.task));w.minimized=!w.minimized;state.active=w.id;render()});
  root.querySelectorAll("[data-max]").forEach(b=>b.onclick=()=>{const el=b.closest(".app-window");el.classList.toggle("maximized")});
  root.querySelectorAll(".app-window").forEach(el=>el.addEventListener("mousedown",()=>{state.active=Number(el.dataset.window);root.querySelectorAll(".app-window").forEach(x=>x.classList.remove("focused"));el.classList.add("focused")}));
  root.querySelectorAll("[data-drag]").forEach(bar=>bar.addEventListener("mousedown",e=>{if(e.target.closest("button"))return;const w=state.windows.find(x=>x.id===Number(bar.dataset.drag));const sx=e.clientX-w.x,sy=e.clientY-w.y;const move=ev=>{w.x=Math.max(0,ev.clientX-sx);w.y=Math.max(36,ev.clientY-sy);bar.closest(".app-window").style.left=w.x+"px";bar.closest(".app-window").style.top=w.y+"px"};const up=()=>{window.removeEventListener("mousemove",move);window.removeEventListener("mouseup",up)};window.addEventListener("mousemove",move);window.addEventListener("mouseup",up)}));
  const note=root.querySelector(".notes");if(note)note.addEventListener("input",()=>localStorage.setItem("qytrix-notes",note.value));
  root.querySelectorAll("[data-wall]").forEach(b=>b.onclick=()=>{localStorage.setItem("qytrix-wallpaper",b.dataset.wall);location.reload()});
  const browserForm=root.querySelector("#browser-form");
  if(browserForm){
    const address=root.querySelector("#browser-url"), frame=root.querySelector("#browser-frame"), status=root.querySelector("#browser-status"), fallback=root.querySelector("#browser-fallback"), fallbackText=root.querySelector("#browser-fallback-text");
    const backStack=[], forwardStack=[]; let currentUrl=frame.src, scanTimer=null;
    const normalize=value=>{const raw=value.trim();if(!raw)return "https://www.google.com/webhp?igu=1";if(/^https?:\/\//i.test(raw))return raw;if(/^[\w.-]+\.[a-z]{2,}(?::\d+)?(?:\/.*)?$/i.test(raw))return "https://"+raw;return "https://www.google.com/search?q="+encodeURIComponent(raw)};
    const navigate=(value,record=true)=>{const url=normalize(value);if(record&&currentUrl&&url!==currentUrl)backStack.push(currentUrl);if(record)forwardStack.length=0;currentUrl=url;address.value=url;fallback.hidden=true;status.textContent="Checking display compatibility…";status.className="browser-status checking";clearTimeout(scanTimer);frame.src=url;scanTimer=setTimeout(()=>{status.textContent="Still checking · this site may be slow or block embedded viewing";status.className="browser-status warning";fallback.hidden=false;fallbackText.textContent="Qytrix cannot confirm whether this page allows embedding. You can open it in the current tab instead.";},9000)};
    browserForm.addEventListener("submit",e=>{e.preventDefault();navigate(address.value)});
    frame.addEventListener("load",()=>{clearTimeout(scanTimer);status.textContent="Page responded · embedded content may still be restricted";status.className="browser-status";fallback.hidden=false;fallbackText.textContent="If the page is blank or shows an error, the site may block embedded browsers.";});
    root.querySelector('[data-action="back"]').onclick=()=>{if(!backStack.length)return;forwardStack.push(currentUrl);navigate(backStack.pop(),false)};
    root.querySelector('[data-action="forward"]').onclick=()=>{if(!forwardStack.length)return;backStack.push(currentUrl);navigate(forwardStack.pop(),false)};
    root.querySelector('[data-action="open-current"]').onclick=()=>{location.assign(currentUrl)};
  }
  const calc=root.querySelector(".calc-grid");if(calc){let expr="";calc.onclick=e=>{const k=e.target.dataset.key;if(!k)return;const d=root.querySelector("#calc-display");if(k==="C")expr="";else if(k==="="){try{expr=String(safeCalculate(expr.replaceAll("×","*").replaceAll("÷","/").replaceAll("−","-")))}catch{expr="Error"}}else expr+=k;d.textContent=expr||"0"}}
  const terminal=root.querySelector("#terminal-input");if(terminal)terminal.addEventListener("keydown",e=>{if(e.key!=="Enter")return;const out=root.querySelector("#terminal-output");const cmd=terminal.value.trim();out.innerHTML+="<p>guest@qytrix:~$ "+escapeHtml(cmd)+"</p><p>"+(cmd==="help"?"Available: help, date, clear, about":cmd==="date"?new Date().toString():cmd==="clear"?"":cmd==="about"?"Qytrix OS browser edition":"Command not found")+"</p>";terminal.value=""});
  const search=root.querySelector("#app-search");if(search)search.addEventListener("input",()=>root.querySelectorAll(".start-menu [data-open]").forEach(b=>b.hidden=!b.textContent.toLowerCase().includes(search.value.toLowerCase())));
}
function updateClock(){const s=new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});const c=root.querySelector("#clock"),t=root.querySelector("#tray-clock");if(c)c.textContent=s;if(t)t.textContent=s}
render();
setInterval(updateClock,15000);
