// login.js
const ADMIN_HASH = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";
const SESSION_DURATION = 60 * 60 * 1000; // 60 menit

let sessionTimeout;

// ambil elemen
const loginPage = document.getElementById("loginPage");
const app = document.getElementById("app");
const adminPass = document.getElementById("adminPass");

// ================= HASH PASSWORD =================
export async function hashPass(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

// ================= LOGIN =================
export async function login() {
    if (!adminPass.value) {
        alert("⚠️ Masukkan password!");
        return;
    }

    const hash = await hashPass(adminPass.value);
    if (hash === ADMIN_HASH) {
        const sessionData = {
            loggedIn: true,
            expiresAt: Date.now() + SESSION_DURATION
        };
        localStorage.setItem("adminSession", JSON.stringify(sessionData));

        loginPage.classList.add("hidden");
        app.classList.remove("hidden");
        adminPass.value = "";

        startIdleTimer();
    } else {
        alert("❌ Password salah!");
        adminPass.value = "";
    }
}

// ================= SESSION =================
export function checkSession() {
    const session = localStorage.getItem("adminSession");
    if (session) {
        const { expiresAt } = JSON.parse(session);
        if (Date.now() < expiresAt) {
            loginPage.classList.add("hidden");
            app.classList.remove("hidden");
            startIdleTimer();
        } else {
            logout(true);
        }
    }
}

// ================= IDLE TIMER =================
export function startIdleTimer() {
    if (sessionTimeout) clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => {
        logout(true);
    }, SESSION_DURATION);
}

export function resetIdleTimer() {
    if (sessionTimeout) startIdleTimer();
}

// ================= LOGOUT =================
export function logout(isIdle = false) {
    localStorage.removeItem("adminSession");
    if (sessionTimeout) clearTimeout(sessionTimeout);

    app.classList.add("hidden");
    loginPage.classList.remove("hidden");
    adminPass.value = "";

    if (isIdle) {
        alert("⏰ Session telah berakhir karena tidak ada aktivitas selama 1 jam.");
    } else {
        alert("Anda telah keluar.");
    }
}
