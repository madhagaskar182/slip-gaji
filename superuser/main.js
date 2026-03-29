import { login, checkSession, resetIdleTimer, logout, hashPass } from './login.js';

let files = [];
let jsonData = {};

// INIT
window.addEventListener("DOMContentLoaded", checkSession);
document.getElementById("loginBtn").onclick = login;
document.getElementById("menuLogout").onclick = logout;

document.addEventListener("click", resetIdleTimer);
document.addEventListener("keydown", resetIdleTimer);

// NAVIGATION
const pages = ["dashboardPage","jsonPage","uploadPage"];

function showPage(page){
    pages.forEach(p => document.getElementById(p).classList.add("hidden"));
    document.getElementById(page+"Page").classList.remove("hidden");
}

menuDashboard.onclick = ()=>showPage("dashboard");
menuJSON.onclick = ()=>showPage("json");
menuUpload.onclick = ()=>showPage("upload");

// EXCEL
excelDrop.onclick = ()=>excelFile.click();
excelFile.onchange = showExcel;

function showExcel(){
    const f = excelFile.files[0];
    if(!f) return;
    jsonFileList.innerHTML = f.name;
}

// GENERATE JSON
generateJSONBtn.onclick = async ()=>{
    const file = excelFile.files[0];
    if(!file) return alert("Pilih file!");

    const reader = new FileReader();
    reader.onload = async e=>{
        const wb = XLSX.read(new Uint8Array(e.target.result), {type:"array"});
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

        const result = {};
        for(let r of rows){
            const email = r.email?.toLowerCase().trim();
            const nama = r.namafile?.toUpperCase().trim();
            const pass = r.password?.toString();

            if(email && nama && pass){
                result[email]={
                    namaFile:nama,
                    password: await hashPass(pass)
                };
            }
        }

        jsonData = result;
        jsonOutput.value = JSON.stringify(result,null,2);
    };
    reader.readAsArrayBuffer(file);
};

// UPLOAD JSON
uploadJSONBtn.onclick = async ()=>{
    const token = tokenJson.value.trim();
    if(!token) return alert("Token kosong!");

    const url = `https://api.github.com/repos/valios-idn/slip-gaji/contents/dataPegawai.json`;
    const content = btoa(JSON.stringify(jsonData));

    await fetch(url,{
        method:"PUT",
        headers:{Authorization:`Bearer ${token}`},
        body: JSON.stringify({message:"update", content})
    });

    alert("JSON uploaded!");
};

// PDF
pdfDrop.onclick = ()=>pdfFiles.click();
pdfFiles.onchange = e=>{
    files = Array.from(e.target.files);
    renderFiles();
};

function renderFiles(){
    fileList.innerHTML="";
    files.forEach((f,i)=>{
        fileList.innerHTML+=`${f.name} <button onclick="removeFile(${i})">X</button><br>`;
    });
}

window.removeFile = i=>{
    files.splice(i,1);
    renderFiles();
};

// UPLOAD PDF
uploadPDFBtn.onclick = async ()=>{
    const token = tokenUpload.value;
    const tahun = tahun.value;
    const bulan = bulan.value;

    for(let f of files){
        const base64 = await toBase64(f);

        await fetch(`https://api.github.com/repos/valios-idn/slip-gaji/contents/files/${tahun}/${bulan}/${f.name}`,{
            method:"PUT",
            headers:{Authorization:`Bearer ${token}`},
            body: JSON.stringify({message:"upload", content:base64})
        });
    }

    alert("Upload selesai!");
};

function toBase64(file){
    return new Promise(r=>{
        const fr = new FileReader();
        fr.onload = ()=>r(fr.result.split(',')[1]);
        fr.readAsDataURL(file);
    });
}
