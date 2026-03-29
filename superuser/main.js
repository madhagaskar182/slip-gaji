import { showToast } from './helpers.js';

let currentPage = "dashboard";
const pages = ["dashboardPage","jsonPage","uploadPage"];

const excelDrop = document.getElementById("excelDrop");
const excelFile = document.getElementById("excelFile");
const jsonFileList = document.getElementById("jsonFileList");
let jsonData = {};

const pdfDrop = document.getElementById("pdfDrop");
const pdfFiles = document.getElementById("pdfFiles");
const fileList = document.getElementById("fileList");
let files = [];

// === SIDEBAR NAV ===
document.getElementById("menuDashboard").addEventListener("click", ()=>showPage("dashboard"));
document.getElementById("menuJSON").addEventListener("click", ()=>showPage("json"));
document.getElementById("menuUpload").addEventListener("click", ()=>showPage("upload"));

function showPage(page){
    pages.forEach(p => document.getElementById(p).classList.add("hidden"));
    if(page==="dashboard") document.getElementById("dashboardPage").classList.remove("hidden");
    if(page==="json") document.getElementById("jsonPage").classList.remove("hidden");
    if(page==="upload") document.getElementById("uploadPage").classList.remove("hidden");
    currentPage = page;
}

// === DRAG & DROP EXCEL ===
excelDrop.onclick = ()=>excelFile.click();
excelDrop.ondrop = e => { e.preventDefault(); excelFile.files = e.dataTransfer.files; showExcel(); };
excelDrop.ondragover = e => e.preventDefault();
excelFile.onchange = showExcel;

function showExcel(){
    const f = excelFile.files[0];
    if(!f) return;
    jsonFileList.innerHTML = `<div class="file-item">${f.name}</div>`;
}

// === GENERATE JSON ===
document.getElementById("generateJSONBtn").addEventListener("click", async ()=>{
    const file = excelFile.files[0];
    if(!file){ alert("Pilih file Excel!"); return; }
    const reader = new FileReader();
    reader.onload = async e => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array", cellDates:true, cellText:false });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, {defval:"", raw:false});
        const result = {};
        for(let row of rows){
            const normalized = {};
            for(let key in row) normalized[key.toLowerCase().replace(/\s/g,'')] = row[key];
            const email = (normalized.email||"").toLowerCase().trim();
            const nama = (normalized.namafile||"").toUpperCase().trim();
            const pass = (normalized.password||"").toString().trim();
            if(!email || !nama || !pass) continue;
            result[email]={namaFile:nama,password:btoa(pass)};
        }
        jsonData = result;
        document.getElementById("jsonOutput").value = JSON.stringify(result,null,2);
        showToast("✅ JSON berhasil dibuat!");
    };
    reader.readAsArrayBuffer(file);
});

// === UPLOAD JSON ===
document.getElementById("uploadJSONBtn").addEventListener("click", async ()=>{
    if(Object.keys(jsonData).length===0){ alert("Generate JSON dulu!"); return; }
    const token = document.getElementById("tokenJson").value.trim();
    if(!token){ alert("Token kosong!"); return; }

    const repo="valios-idn/slip-gaji";
    const path="dataPegawai.json";
    const content=btoa(unescape(encodeURIComponent(JSON.stringify(jsonData,null,2))));
    const url=`https://api.github.com/repos/${repo}/contents/${path}`;

    let sha=null;
    try{
        const get = await fetch(url,{headers:{Authorization:`Bearer ${token}`}});
        if(get.ok){ const data = await get.json(); sha=data.sha; }
    }catch(e){}

    const res = await fetch(url,{
        method:"PUT",
        headers:{Authorization:`Bearer ${token}`, "Content-Type":"application/json"},
        body: JSON.stringify({message:"update dataPegawai", content:content, sha:sha})
    });
    const result = await res.json();
    if(!res.ok) showToast("❌ Upload JSON gagal","error");
    else showToast("✅ JSON berhasil diupload!");
});

// === DRAG & DROP PDF ===
pdfDrop.onclick = ()=>pdfFiles.click();
pdfFiles.onchange = e => { files=Array.from(e.target.files); renderFiles(); };
function renderFiles(){
    fileList.innerHTML="";
    files.forEach((f,i)=>{
        fileList.innerHTML+=`
        <div class="file-item">
            <div class="file-top">${f.name}<span class="remove" onclick="removeFile(${i})">✖</span></div>
            <div class="progress"><div class="bar" id="bar${i}"></div></div>
        </div>`;
    });
}
window.removeFile = i => { files.splice(i,1); renderFiles(); };

// === UPLOAD PDF ===
document.getElementById("uploadPDFBtn").addEventListener("click", async ()=>{
    if(files.length===0){ alert("Tidak ada file!"); return; }
    const token = document.getElementById("tokenUpload").value.trim();
    if(!token){ alert("Token kosong!"); return; }

    const tahun = document.getElementById("tahun").value;
    const bulan = document.getElementById("bulan").value;
    const status = document.getElementById("status");
    status.innerText="⏳ Upload sedang berjalan...";
    let success=0;

    for(let i=0;i<files.length;i++){
        try{
            await uploadSingle(files[i], i, token, tahun, bulan);
            success++;
        }catch(e){ console.error(e); }
    }

    if(success===files.length){ status.innerText="🎉 Semua file berhasil diupload!"; showToast("🎉 Upload selesai semua!"); }
    else { status.innerText=`⚠️ ${success}/${files.length} file berhasil`; showToast("⚠️ Ada file gagal upload","error"); }
});

async function uploadSingle(file, i, token, tahun, bulan){
    const bar = document.getElementById("bar"+i);
    const base64 = await toBase64(file);
    const fileName = file.name.toUpperCase();
    const path = `files/${tahun}/${bulan}/${fileName}`;
    const url = `https://api.github.com/repos/valios-idn/slip-gaji/contents/${path}`;

    let sha=null;
    try{ const get = await fetch(url,{headers:{Authorization:`Bearer ${token}`}});
        if(get.ok){ const data = await get.json(); sha=data.sha; }
    }catch(e){}

    bar.style.width="30%";
    const res = await fetch(url,{
        method:"PUT",
        headers:{Authorization:`Bearer ${token}`, "Content-Type":"application/json"},
        body: JSON.stringify({message:"Upload slip gaji", content:base64, sha:sha})
    });
    bar.style.width="100%";
    if(!res.ok){ bar.style.backgroundColor="#ef4444"; throw new Error("Upload gagal"); }
}

function toBase64(file){
    return new Promise(r=>{
        const fr = new FileReader();
        fr.onload = ()=>r(fr.result.split(',')[1]);
        fr.readAsDataURL(file);
    });
}
