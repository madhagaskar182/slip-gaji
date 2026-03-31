// ======================
// INIT TAMBAHAN DASHBOARD (AMAN)
// ======================
window.addEventListener("DOMContentLoaded", () => {

    const btnLoad = el("btnLoadFile");
    const btnDelete = el("btnDeleteFile");
    const checkAll = el("checkAll");

    if(btnLoad) btnLoad.onclick = loadPDFList;
    if(btnDelete) btnDelete.onclick = deleteSelectedFiles;

    if(checkAll){
        checkAll.onchange = function(){
            document.querySelectorAll(".file-check")
                .forEach(c => c.checked = this.checked);
        };
    }

});

// ======================
// DASHBOARD
// ======================
async function loadPDFList(){

    const token = el("dashToken")?.value.trim();
    const tahun = el("dashTahun")?.value;
    const bulan = el("dashBulan")?.value;

    const container = el("dashboardList");
    const counter = el("fileCount");
    const bulk = el("bulkActions");
    const checkAll = el("checkAll");

    if(!token) return alert("Token kosong!");
    if(!tahun || !bulan) return alert("Pilih tahun & bulan!");

    // reset UI
    if(bulk) bulk.classList.add("hidden");
    if(checkAll) checkAll.checked = false;

    container.innerHTML = "Loading...";
    counter.innerHTML = "";

    try{
        const path = `files/${tahun}/${bulan}`;
        const url = `https://api.github.com/repos/valios-idn/slip-gaji/contents/${path}`;

        const res = await fetch(url,{
            headers:{ Authorization:`Bearer ${token}` }
        });

        if(!res.ok) throw new Error();

        const data = await res.json();

        const pdfFiles = data
            .filter(f => f.name.toLowerCase().endsWith(".pdf"))
            .sort((a,b)=>a.name.localeCompare(b.name));

        // tampilkan bulk action
        if(pdfFiles.length > 0 && bulk){
            bulk.classList.remove("hidden");
        }

        // count
        counter.innerText = `Total File: ${pdfFiles.length}`;

        if(pdfFiles.length === 0){
            container.innerHTML = `<div class="empty">Tidak ada file</div>`;
            return;
        }

        container.innerHTML = pdfFiles.map(f=>`
            <div class="file-row">
                <input type="checkbox" class="file-check" 
                    data-path="${f.path}" 
                    data-sha="${f.sha}">

                <div class="file-name">📄 ${f.name}</div>

                <div class="file-action">
                    <a href="${f.download_url}" target="_blank" class="open-btn">Buka</a>
                </div>
            </div>
        `).join("");

    }catch(err){
        console.error(err);
        container.innerHTML = "❌ Gagal load file";
    }
}

// ======================
// DELETE MULTI FILE
// ======================
async function deleteSelectedFiles(){

    const token = el("dashToken")?.value.trim();
    if(!token) return alert("Token kosong!");

    const checks = document.querySelectorAll(".file-check:checked");

    if(checks.length === 0){
        return alert("Pilih file dulu!");
    }

    if(!confirm(`Hapus ${checks.length} file?`)) return;

    for(let chk of checks){

        const path = chk.dataset.path;
        const sha = chk.dataset.sha;

        const url = `https://api.github.com/repos/valios-idn/slip-gaji/contents/${path}`;

        try{
            await fetch(url,{
                method:"DELETE",
                headers:{
                    Authorization:`Bearer ${token}`,
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({
                    message: "hapus file",
                    sha: sha
                })
            });
        }catch{
            console.log("gagal hapus:", path);
        }
    }

    showNotif("✅ File berhasil dihapus");

    setTimeout(()=>{
        loadPDFList();
    },1000);
}

// ======================
// CHECKBOX SYNC
// ======================
document.addEventListener("change", function(e){

    // sync individual → checkAll
    if(e.target.classList.contains("file-check")){
        const all = document.querySelectorAll(".file-check");
        const checked = document.querySelectorAll(".file-check:checked");

        const checkAll = el("checkAll");
        if(checkAll){
            checkAll.checked = all.length === checked.length;
        }
    }

    // update counter
    const total = document.querySelectorAll(".file-check").length;
    const checked = document.querySelectorAll(".file-check:checked").length;

    const counter = el("fileCount");
    if(counter){
        counter.innerText = `Total: ${total} | Dipilih: ${checked}`;
    }

});

// ======================
// NOTIF (ANTI HILANG SENDIRI)
// ======================
function showNotif(msg, duration = 2000){
    let box = el("notifBox");

    // buat kalau belum ada
    if(!box){
        box = document.createElement("div");
        box.id = "notifBox";
        box.className = "notif";
        document.body.appendChild(box);
    }

    box.innerText = msg;
    box.style.display = "block";
    box.style.opacity = "1";

    // hilang otomatis (fade out)
    setTimeout(()=>{
        box.style.opacity = "0";

        setTimeout(()=>{
            box.style.display = "none";
        },300); // waktu fade
    }, duration);
}
