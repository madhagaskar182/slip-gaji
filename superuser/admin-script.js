// ================= KONSTANTA & VARIABEL GLOBAL =================
const ADMIN_HASH = "eb8dd3569264665279b7715826fcf2a291b074137704e18d06574f321fd91a58";

let sessionTimeout;
const SESSION_DURATION = 60 * 60 * 1000; // 60 menit

let currentPage = "dashboard";
let jsonData = {};
let files = [];

// Token Global (sama untuk semua halaman)
let GLOBAL_GITHUB_TOKEN = "hub_pat_11CAL3MIA0GiKpa7mrdH13_QjxgBpaQsd80czUGfw0frJJU1rWt9KkWXClMgWIbf3B75OZACNDIfYo01LO"; 

// Elemen DOM
let loginPage, app, dashboardPage, jsonPage, uploadPage;
let adminPass, excelFile, jsonFileList, jsonOutput;
let pdfFiles, fileList, statusEl, tahun, bulan;
let tokenDashboard, dashTahun, dashBulan;

// ================= HASH FUNCTION =================
async function hash(t) {
    const e = new TextEncoder().encode(t);
    const b = await crypto.subtle.digest("SHA-256", e);
    return Array.from(new Uint8Array(b))
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
}

async function hashPass(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

// ================= SESSION MANAGEMENT =================
function checkSession() {
    const session = localStorage.getItem("adminSession");
    if (!session) return;

    try {
        const { expiresAt } = JSON.parse(session);
        if (Date.now() < expiresAt) {
            loginPage?.classList.add("hidden");
            app?.classList.remove("hidden");
            startIdleTimer();
        } else {
            logout(true);
        }
    } catch (e) {
        localStorage.removeItem("adminSession");
    }
}

async function login() {
    if (!adminPass) {
        alert("⚠️ Input password admin tidak ditemukan!");
        console.error("adminPass undefined");
        return;
    }

    if (await hash(adminPass.value) === ADMIN_HASH) {
        const sessionData = { loggedIn: true, expiresAt: Date.now() + SESSION_DURATION };
        localStorage.setItem("adminSession", JSON.stringify(sessionData));

        loginPage?.classList.add("hidden");
        app?.classList.remove("hidden");
        adminPass.value = "";
        startIdleTimer();
    } else {
        alert("❌ Password salah!");
    }
}

function logout(isIdle = false) {
    localStorage.removeItem("adminSession");
    if (sessionTimeout) clearTimeout(sessionTimeout);
    
    app?.classList.add("hidden");
    loginPage?.classList.remove("hidden");
    
    if (isIdle) alert("⏰ Session telah berakhir karena tidak ada aktivitas selama 1 jam.");
    else alert("✅ Anda telah keluar.");
    
    adminPass.value = "";
}

// ================= IDLE TIMER =================
function startIdleTimer() {
    if (sessionTimeout) clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => logout(true), SESSION_DURATION);
}

function resetIdleTimer() {
    if (sessionTimeout) startIdleTimer();
}

// ================= NAVIGATION =================
function showPage(p) {
    if (currentPage === "json") resetJSON();
    if (currentPage === "upload") resetUpload();

    dashboardPage?.classList.add("hidden");
    jsonPage?.classList.add("hidden");
    uploadPage?.classList.add("hidden");

    if (p === "dashboard") dashboardPage?.classList.remove("hidden");
    if (p === "json") jsonPage?.classList.remove("hidden");
    if (p === "upload") uploadPage?.classList.remove("hidden");

    currentPage = p;
}

// ================= RESET =================
function resetJSON() {
    if (excelFile) excelFile.value = "";
    if (jsonOutput) jsonOutput.value = "";
    if (jsonFileList) jsonFileList.innerHTML = "";
    jsonData = {};
}

function resetUpload() {
    if (pdfFiles) pdfFiles.value = "";
    if (fileList) fileList.innerHTML = "";
    files = [];
    if (statusEl) statusEl.innerText = "";
}

// ================= DUMMY searchFiles =================
function searchFiles() {
    console.log("searchFiles dipanggil (dummy)");
}

// ================= INIT =================
function initElements() {
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
function setupEventListeners() {
    document.getElementById("excelDrop")?.addEventListener("click", () => excelFile.click());
    excelFile?.addEventListener("change", () => {
        const f = excelFile.files[0];
        if (f) jsonFileList.innerHTML = `<div class="file-item">${f.name}</div>`;
    });

    document.getElementById("pdfDrop")?.addEventListener("click", () => pdfFiles.click());
    pdfFiles?.addEventListener("change", e => {
        files = Array.from(e.target.files);
        renderFiles();
    });

    document.getElementById("btnLogout")?.addEventListener("click", logout);

    document.addEventListener("mousemove", resetIdleTimer);
    document.addEventListener("keydown", resetIdleTimer);
    document.addEventListener("click", resetIdleTimer);
}

// ================= GLOBAL =================
window.login = login;
window.logout = logout;
window.showPage = showPage;
window.generateJSON = generateJSON;
window.uploadJSON = uploadJSON;
window.uploadAll = uploadAll;
window.removeFile = removeFile;
window.loadFilesByMonth = loadFilesByMonth;
window.searchFiles = searchFiles;

// ================= START =================
window.addEventListener("load", () => {
    initElements();
    setupEventListeners();

    if (tokenDashboard) tokenDashboard.value = GLOBAL_GITHUB_TOKEN;

    checkSession();
});
