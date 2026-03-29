// main.js

// Dashboard langsung tampil
window.addEventListener("DOMContentLoaded", () => {
    const pages = ["dashboardPage","jsonPage","uploadPage"];
    let currentPage = "dashboard";

    // Sidebar navigation
    document.getElementById("menuDashboard").addEventListener("click", () => showPage("dashboard"));
    document.getElementById("menuJSON").addEventListener("click", () => showPage("json"));
    document.getElementById("menuUpload").addEventListener("click", () => showPage("upload"));

    // Drag & drop Excel
    const excelDrop = document.getElementById("excelDrop");
    const excelFile = document.getElementById("excelFile");
    const jsonFileList = document.getElementById("jsonFileList");
    excelDrop.onclick = () => excelFile.click();
    excelDrop.ondrop = e => {
        e.preventDefault();
        excelFile.files = e.dataTransfer.files;
        showExcel();
    };
    excelDrop.ondragover = e => e.preventDefault();
    excelFile.onchange = showExcel;

    function showExcel(){
        const f = excelFile.files[0];
        if(!f) return;
        jsonFileList.innerHTML = `<div class="file-item">${f.name}</div>`;
    }

    function showPage(page){
        pages.forEach(p => document.getElementById(p).classList.add("hidden"));
        if(page==="dashboard") document.getElementById("dashboardPage").classList.remove("hidden");
        if(page==="json") document.getElementById("jsonPage").classList.remove("hidden");
        if(page==="upload") document.getElementById("uploadPage").classList.remove("hidden");
        currentPage = page;
    }
});

// Toast helper
export function showToast(message,type="success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = "toast show";
    if(type==="error") toast.classList.add("error");
    setTimeout(()=>toast.classList.remove("show"),3000);
}
