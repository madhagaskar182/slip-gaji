// LOGIN
const loginPanel=document.getElementById('loginPanel');
const adminPanel=document.getElementById('adminPanel');
const loginBtn=document.getElementById('loginBtn');
const loginError=document.getElementById('loginError');

loginBtn.addEventListener('click',()=>{
    const u=document.getElementById('username').value;
    const p=document.getElementById('password').value;
    if(u==='admin' && p==='admin123'){
        loginPanel.style.display='none';
        adminPanel.style.display='flex';
        populateYearsMonths();
        document.getElementById('githubToken').value='GITHUB_TOKEN_DEFAULT';
        showMenu('dashboard');
    } else { loginError.style.display='block'; }
});

document.getElementById('logoutBtn').addEventListener('click',()=>{
    adminPanel.style.display='none';
    loginPanel.style.display='flex';
});

// MENU
document.querySelectorAll('.menuBtn').forEach(btn=>btn.addEventListener('click',()=>showMenu(btn.dataset.menu)));
function showMenu(id){
    document.querySelectorAll('.menuContent').forEach(m=>m.style.display='none');
    document.getElementById(id).style.display='block';
}

// YEARS & MONTHS
function populateYearsMonths(){
    const yearSelects=[document.getElementById('selectYear'),document.getElementById('pdfYear')];
    const monthSelects=[document.getElementById('selectMonth'),document.getElementById('pdfMonth')];
    const currentYear=new Date().getFullYear();
    yearSelects.forEach(sel=>{ sel.innerHTML=''; for(let y=currentYear;y>=2000;y--) sel.innerHTML+=`<option value="${y}">${y}</option>`; });
    monthSelects.forEach(sel=>{ sel.innerHTML=''; for(let m=1;m<=12;m++) sel.innerHTML+=`<option value="${m}">${m}</option>`; });
}

// Toast
function showToast(msg){
    const t=document.getElementById('toast');
    t.textContent=msg;
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'),3000);
}

// File upload, generate JSON, preview, upload PDF
// ... (bisa pakai JS dari versi sebelumnya, tapi pastikan sudah terstruktur rapi)
