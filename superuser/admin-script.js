// ================= KONSTANTA & VARIABEL =================
const ADMIN_HASH = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";
const SESSION_DURATION = 60 * 60 * 1000; // 1 jam
let sessionTimeout;
let currentPage = "dashboard";
let jsonData = {};
let files = [];
let GLOBAL_GITHUB_TOKEN = "hub_pat_11CAL3MIA0GiKpa7mrdH13_QjxgBpaQsd80czUGfw0frJJU1rWt9KkWXClMgWIbf3B75OZACNDIfYo01LO";

// DOM Elements
let loginPage, app, dashboardPage, jsonPage, uploadPage;
let adminPass, excelFile, jsonFileList, jsonOutput;
let pdfFiles, fileList, statusEl, tahun, bulan;
let tokenDashboard, dashTahun, dashBulan;

// ================= HASH FUNCTION =================
async function hash(t) {
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
    return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('');
}

// ================= SESSION =================
function checkSession() {
    const session = JSON.parse(localStorage.getItem("adminSession") || "{}");
    if (session?.expiresAt && Date.now() < session.expiresAt) {
        loginPage.classList.add("hidden");
        app.classList.remove("hidden");
        startIdleTimer();
    } else {
        localStorage.removeItem("adminSession");
    }
}

async function login() {
    if (!adminPass) {
        alert("⚠️ Input password admin tidak ditemukan!");
        return;
    }
    if (await hash(adminPass.value) === ADMIN_HASH) {
        localStorage.setItem("adminSession", JSON.stringify({loggedIn:true, expiresAt:Date.now()+SESSION_DURATION}));
        loginPage.classList.add("hidden");
        app.classList.remove("hidden");
        adminPass.value = "";
        startIdleTimer();
    } else {
        alert("❌ Password salah!");
    }
}

function logout(isIdle=false) {
    localStorage.removeItem("adminSession");
    if (sessionTimeout) clearTimeout(sessionTimeout);
    app.classList.add("hidden");
    loginPage.classList.remove("hidden");
    adminPass.value = "";
    if (isIdle) alert("⏰ Session berakhir karena tidak aktif 1 jam");
    else alert("✅ Anda telah keluar");
}

// ================= IDLE TIMER =================
function startIdleTimer() {
    if (sessionTimeout) clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(()=>logout(true), SESSION_DURATION);
}
function resetIdleTimer(){startIdleTimer();}

// ================= NAVIGATION =================
function showPage(p){
    if(currentPage==='json') resetJSON();
    if(currentPage==='upload') resetUpload();
    dashboardPage.classList.add("hidden");
    jsonPage.classList.add("hidden");
    uploadPage.classList.add("hidden");
    if(p==='dashboard') dashboardPage.classList.remove("hidden");
    if(p==='json') jsonPage.classList.remove("hidden");
    if(p==='upload') uploadPage.classList.remove("hidden");
    currentPage=p;
}

// ================= RESET =================
function resetJSON(){ if(excelFile) excelFile.value=''; if(jsonOutput) jsonOutput.value=''; if(jsonFileList) jsonFileList.innerHTML=''; jsonData={}; }
function resetUpload(){ if(pdfFiles) pdfFiles.value=''; if(fileList) fileList.innerHTML=''; files=[]; if(statusEl) statusEl.innerText=''; }

// ================= INIT =================
function initElements(){
    loginPage = document.getElementById("loginPage");
    app = document.getElementById("app");
    dashboardPage = document.getElementById("dashboardPage");
    jsonPage = document.getElementById("jsonPage");
    uploadPage = document.getElementById("uploadPage");

    adminPass = document.getElementById("adminPass");
    excelFile = document.getElementById("excelFile");
    jsonFileList = document.getElementById("jsonFileList");
    jsonOutput = document.getElementById("jsonOutput");

    pdfFiles = document.getElementById("pdfFiles");
    fileList = document.getElementById("fileList");
    statusEl = document.getElementById("status");
    tahun = document.getElementById("tahun");
    bulan = document.getElementById("bulan");

    tokenDashboard = document.getElementById("tokenDashboard");
    dashTahun = document.getElementById("dashTahun");
    dashBulan = document.getElementById("dashBulan");
}

// ================= EVENT LISTENERS =================
function setupEventListeners(){
    console.log("Event listener setup dijalankan");
    
    document.getElementById("btnLogin").addEventListener("click", login);
    document.getElementById("btnLogout").addEventListener("click", logout);

    document.getElementById("excelDrop")?.addEventListener("click", ()=>excelFile.click());
    excelFile?.addEventListener("change", ()=>{ const f=excelFile.files[0]; if(f) jsonFileList.innerHTML=`<div>${f.name}</div>` });

    document.getElementById("pdfDrop")?.addEventListener("click", ()=>pdfFiles.click());
    pdfFiles?.addEventListener("change", e=>{ files=Array.from(e.target.files); renderFiles(); });

    document.addEventListener("mousemove", resetIdleTimer);
    document.addEventListener("keydown", resetIdleTimer);
    document.addEventListener("click", resetIdleTimer);
}

// ================= GLOBAL FUNCTIONS =================
window.login=login;
window.logout=logout;
window.showPage=showPage;
window.searchFiles=()=>console.log("searchFiles dipanggil (dummy)");

// ================= START =================
window.addEventListener("load", ()=>{
    initElements();
    setupEventListeners();
    if(tokenDashboard) tokenDashboard.value=GLOBAL_GITHUB_TOKEN;
    checkSession();
});
