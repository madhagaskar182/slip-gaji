// ================= LOGIN & SESSION =================
const ADMIN_HASH = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";
const SESSION_DURATION = 60 * 60 * 1000; // 60 menit
let sessionTimeout;

export async function hashPass(password) {
    const data = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export function checkSession() {
    const session = localStorage.getItem("adminSession");
    if (session) {
        const { expiresAt } = JSON.parse(session);
        if (Date.now() < expiresAt) {
            loginPage.classList.add("hidden");
            app.classList.remove("hidden");
            startIdleTimer();
        } else logout();
    }
}

export function startIdleTimer() {
    if (sessionTimeout) clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => logout(true), SESSION_DURATION);
}

export function resetIdleTimer() {
    if (sessionTimeout) startIdleTimer();
}

export function logout(isIdle = false) {
    localStorage.removeItem("adminSession");
    if (sessionTimeout) clearTimeout(sessionTimeout);

    app.classList.add("hidden");
    loginPage.classList.remove("hidden");
    adminPass.value = "";

    alert(isIdle ? "⏰ Session telah berakhir karena tidak ada aktivitas selama 1 jam." : "Anda telah keluar.");
}

export async function login() {
    if (await hashPass(adminPass.value) === ADMIN_HASH) {
        const sessionData = { loggedIn: true, expiresAt: Date.now() + SESSION_DURATION };
        localStorage.setItem("adminSession", JSON.stringify(sessionData));

        loginPage.classList.add("hidden");
        app.classList.remove("hidden");
        adminPass.value = "";
        startIdleTimer();
    } else alert("Password salah!");
}
