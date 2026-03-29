// ===== Sidebar Menu =====
const menuItems = document.querySelectorAll('.sidebar ul li');
const menus = document.querySelectorAll('.menu-content');

menuItems.forEach(item => {
  item.addEventListener('click', () => {
    menuItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    const target = item.dataset.menu;
    menus.forEach(m => m.classList.remove('active'));
    document.getElementById(target).classList.add('active');
  });
});

// ===== Tahun Dropdown =====
function fillYears(selectId) {
  const select = document.getElementById(selectId);
  const year = new Date().getFullYear();
  for(let i = year; i >= year-10; i--){
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    select.appendChild(option);
  }
}
fillYears('tahun-dashboard');
fillYears('tahun-upload');

// ===== Load File List (Dashboard) =====
document.getElementById('load-files').addEventListener('click', async () => {
  const year = document.getElementById('tahun-dashboard').value;
  const month = document.getElementById('bulan-dashboard').value;
  const token = document.getElementById('github-token').value;

  // Placeholder: Replace with GitHub API fetch
  const fileList = document.getElementById('file-list');
  fileList.innerHTML = `<p>Menampilkan file untuk ${year}-${month}...</p>`;
});

// ===== Excel Upload & Generate JSON =====
let excelFiles = [];
const excelInput = document.getElementById('excel-file');
const excelListDiv = document.getElementById('excel-list');
const jsonPreview = document.getElementById('json-preview');

excelInput.addEventListener('change', (e) => {
  excelFiles = Array.from(e.target.files);
  renderExcelFiles();
});

function renderExcelFiles() {
  excelListDiv.innerHTML = '';
  excelFiles.forEach((file, idx) => {
    const div = document.createElement('div');
    div.className = 'file-item';
    div.innerHTML = `${file.name} <button onclick="removeExcel(${idx})">&times;</button>`;
    excelListDiv.appendChild(div);
  });
}

window.removeExcel = function(idx){
  excelFiles.splice(idx,1);
  renderExcelFiles();
}

// Placeholder: Generate JSON (hash password)
document.getElementById('generate-json-btn').addEventListener('click', async () => {
  const result = excelFiles.map(f => ({
    nama: f.name,
    password: hashPassword(f.name)
  }));
  jsonPreview.textContent = JSON.stringify(result,null,2);

  // TODO: Upload result to GitHub as dataPegawai.json
  alert('JSON berhasil digenerate & siap diupload ke repo!');
});

// Simple hash function (SHA-256)
async function hashPassword(str){
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// ===== Upload PDF =====
const pdfInput = document.getElementById('pdf-files');
const pdfProgress = document.getElementById('pdf-progress');
const uploadStatus = document.getElementById('upload-status');

document.getElementById('upload-pdf-btn').addEventListener('click', async () => {
  const files = Array.from(pdfInput.files);
  if(files.length===0){ alert('Pilih file PDF!'); return; }

  pdfProgress.style.width = '0%';
  uploadStatus.textContent = '';

  for(let i=0;i<files.length;i++){
    await fakeUpload(files[i], i, files.length);
  }

  uploadStatus.textContent = 'Semua file berhasil diupload!';
  setTimeout(()=>{ uploadStatus.textContent=''; pdfProgress.style.width='0%'; }, 5000);
});

function fakeUpload(file, idx, total){
  return new Promise(resolve=>{
    let progress = 0;
    const interval = setInterval(()=>{
      progress += Math.random()*10;
      if(progress>=100) progress=100;
      pdfProgress.style.width = ((idx + progress/100)/total*100) + '%';
      if(progress>=100){ clearInterval(interval); resolve(); }
    }, 200);
  });
}
