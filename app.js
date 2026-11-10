// Conecta Contigo - versión corregida
// Los eventos se conectan cuando el documento ya está disponible.
(function () {
  function iniciarAplicacion() {
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const USERS_KEY = "conecta_users_v1";
const SESSION_KEY = "conecta_session_v1";
const DATA_KEY = "conecta_data_v1";
let currentUser = null;
let data = {};

function users(){ return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); }
function saveUsers(list){ localStorage.setItem(USERS_KEY, JSON.stringify(list)); }
function loadData(){ const all = JSON.parse(localStorage.getItem(DATA_KEY) || "{}"); data = all[currentUser.email] || {records:[],goal:2,done:[],moods:{}}; }
function saveData(){ const all = JSON.parse(localStorage.getItem(DATA_KEY) || "{}"); all[currentUser.email] = data; localStorage.setItem(DATA_KEY, JSON.stringify(all)); }
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2300); }
function showApp(user){ currentUser=user; loadData(); $("#authView").classList.add("hidden"); $("#appView").classList.remove("hidden"); $("#sideName").textContent=user.name; $("#avatarInitial").textContent=user.name.charAt(0).toUpperCase(); $("#todayLabel").textContent=new Intl.DateTimeFormat("es-MX",{weekday:"long",day:"numeric",month:"long"}).format(new Date()); $("#recordDate").value=new Date().toISOString().slice(0,10); renderAll(); }
function showAuth(){ $("#appView").classList.add("hidden"); $("#authView").classList.remove("hidden"); }
$$(".tab").forEach(btn=>btn.addEventListener("click",()=>{ $$(".tab").forEach(x=>x.classList.toggle("active",x===btn)); $("#loginForm").classList.toggle("hidden",btn.dataset.tab!=="login"); $("#registerForm").classList.toggle("hidden",btn.dataset.tab!=="register"); }));
$("#registerForm").addEventListener("submit",e=>{e.preventDefault();const name=$("#registerName").value.trim(),email=$("#registerEmail").value.trim().toLowerCase(),password=$("#registerPassword").value;const list=users();if(list.some(u=>u.email===email)){toast("Ese correo ya tiene una cuenta.");return;}list.push({name,email,password});saveUsers(list);$("#registerForm").reset();toast("Cuenta creada. Ya puedes iniciar sesión.");$$(".tab")[0].click();$("#loginEmail").value=email;});
$("#loginForm").addEventListener("submit",e=>{e.preventDefault();const email=$("#loginEmail").value.trim().toLowerCase(),password=$("#loginPassword").value;const user=users().find(u=>u.email===email&&u.password===password);if(!user){toast("Correo o contraseña incorrectos.");return;}localStorage.setItem(SESSION_KEY,email);showApp(user);});
$("#logoutBtn").addEventListener("click",()=>{localStorage.removeItem(SESSION_KEY);currentUser=null;showAuth();});
function go(page){$$(".page").forEach(p=>p.classList.add("hidden"));$("#page-"+page).classList.remove("hidden");$$(".nav").forEach(n=>n.classList.toggle("active",n.dataset.page===page));const titles={inicio:"Tu espacio",registro:"Mi registro",retos:"Retos conscientes",aprende:"Conciencia digital"};$("#pageHeading").textContent=titles[page];if(page==="registro")renderRecords();}
$$(".nav").forEach(n=>n.addEventListener("click",()=>go(n.dataset.page)));$$("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
const challenges=[
 ["01","Primera pausa","Deja el celular a un lado durante 15 minutos mientras haces una actividad que disfrutes."],
 ["02","Comida presente","Comparte una comida sin revisar notificaciones."],
 ["03","Notificaciones en calma","Desactiva avisos que no sean importantes durante un rato."],
 ["04","Un momento al aire libre","Dedica 20 minutos a caminar, jugar o estar afuera sin pantalla."],
 ["05","Conversa cara a cara","Ten una conversación y escucha sin mirar el celular."],
 ["06","Rutina para descansar","Prueba una actividad relajante sin pantalla antes de dormir."]
];
function renderChallenges(){ $("#challengeGrid").innerHTML=challenges.map((c,i)=>`<article class="challenge-card"><span class="number">${c[0]}</span><h3>${c[1]}</h3><p>${c[2]}</p><button data-challenge="${i}" class="${data.done.includes(i)?"done":""}">${data.done.includes(i)?"✓ Completado":"Marcar como completado"}</button></article>`).join("");$$("[data-challenge]").forEach(b=>b.addEventListener("click",()=>{const id=Number(b.dataset.challenge);data.done=data.done.includes(id)?data.done.filter(x=>x!==id):[...data.done,id];saveData();renderChallenges();renderStats();}));}
$("#recordForm").addEventListener("submit",e=>{e.preventDefault();const h=Number($("#hours").value),m=Number($("#minutes").value);if(!Number.isInteger(h)||!Number.isInteger(m)||h<0||h>24||m<0||m>59||h*60+m===0){toast("Ingresa un tiempo válido.");return;}data.records.push({id:Date.now(),date:$("#recordDate").value,minutes:h*60+m,category:$("#category").value,note:$("#recordNote").value.trim()});saveData();$("#recordNote").value="";$("#hours").value=0;$("#minutes").value=0;renderAll();toast("Registro guardado.");});
function formatTime(total){return `${Math.floor(total/60)} h ${total%60} min`;}
function renderRecords(){const list=$("#recordList");if(!data.records.length){list.innerHTML='<p class="muted">Todavía no tienes registros. Agrega el primero.</p>';return;}list.innerHTML=[...data.records].sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id).map(r=>`<div class="record-item"><div><b>${r.category}</b><small>${new Date(r.date+"T12:00:00").toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})}${r.note?" · "+escapeHtml(r.note):""}</small></div><div><strong>${formatTime(r.minutes)}</strong><button class="delete-record" data-delete="${r.id}" aria-label="Eliminar registro">✕</button></div></div>`).join("");$$("[data-delete]").forEach(b=>b.addEventListener("click",()=>{data.records=data.records.filter(r=>r.id!==Number(b.dataset.delete));saveData();renderAll();toast("Registro eliminado.");}));}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function todayMinutes(){const today=new Date().toISOString().slice(0,10);return data.records.filter(r=>r.date===today).reduce((sum,r)=>sum+r.minutes,0);}
function renderStats(){const mins=todayMinutes();$("#todayTime").textContent=formatTime(mins);$("#goalDisplay").textContent=formatTime(data.goal*60);$("#goalStatus").textContent=mins<=data.goal*60?"Vas dentro de tu meta":"Tu registro superó la meta";$("#challengeCount").textContent=data.done.length;$("#goalHours").value=data.goal;}
$("#saveGoal").addEventListener("click",()=>{const v=Number($("#goalHours").value);if(!Number.isInteger(v)||v<1||v>24){toast("Elige entre 1 y 24 horas.");return;}data.goal=v;saveData();renderStats();toast("Meta actualizada.");});
$$(".moods button").forEach(b=>b.addEventListener("click",()=>{const today=new Date().toISOString().slice(0,10);data.moods[today]=b.dataset.mood;saveData();$$(".moods button").forEach(x=>x.classList.toggle("selected",x===b));$("#moodSaved").textContent="Reflexión guardada: "+b.dataset.mood;}));
function renderMood(){const today=new Date().toISOString().slice(0,10),m=data.moods[today];$$(".moods button").forEach(b=>b.classList.toggle("selected",b.dataset.mood===m));$("#moodSaved").textContent=m?"Reflexión guardada: "+m:"";}
function renderAll(){renderStats();renderRecords();renderChallenges();renderMood();}
const session=localStorage.getItem(SESSION_KEY);if(session){const user=users().find(u=>u.email===session);if(user)showApp(user);else localStorage.removeItem(SESSION_KEY);}

  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarAplicacion, { once: true });
  } else {
    iniciarAplicacion();
  }
})();
