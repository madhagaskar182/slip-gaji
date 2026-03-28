const form = document.getElementById('pdfForm');
const viewer = document.getElementById('pdfViewer');
const viewerContainer = document.getElementById('viewerContainer');
const pesan = document.getElementById('pesan');
const errorDiv = document.getElementById('error');
const downloadBtn = document.getElementById('downloadBtn');

let dataPegawai = {};
let pdfDoc = null;
let currentUrl = '';
let currentFileName = '';
let dataLoaded = false;

// ================= LOAD JSON =================
async function loadData() {
  try {
    const res = await fetch('./dataPegawai.json');
    if (!res.ok) throw new Error();

    dataPegawai = await res.json();
    dataLoaded = true;

    console.log("DATA LOADED:", dataPegawai);
  } catch {
    errorDiv.textContent = '❌ Gagal memuat data!';
  }
}
loadData();

// ================= HASH =================
async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)]
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

// ================= PDF.js =================
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ================= RENDER =================
async function renderAllPages() {
  viewer.innerHTML = '';

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 1.2 });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: ctx, viewport }).promise;

    viewer.appendChild(canvas);
  }
}

// ================= SUBMIT =================
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!dataLoaded) {
    errorDiv.textContent = 'Data belum siap!';
    return;
  }

  const tahun = document.getElementById('tahun').value;
  const bulan = document.getElementById('bulan').value;
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value.trim();

  errorDiv.textContent = '';
  pesan.textContent = 'Loading...';
  viewerContainer.style.display = 'none';

  const pegawai = dataPegawai[email];

  if (!pegawai) {
    errorDiv.textContent = 'Email tidak ditemukan!';
    return;
  }

  const hashed = await hashPassword(password);

  if (pegawai.password !== hashed) {
    errorDiv.textContent = 'Password salah!';
    return;
  }

  const namaFile = pegawai.namaFile;
  currentFileName = namaFile + '.pdf';

  const baseUrl = 'https://cdn.jsdelivr.net/gh/madhagaskar182/testing@main/files/';
  const url = `${baseUrl}${tahun}/${bulan}/${namaFile}.pdf`;

  try {
    pdfDoc = await pdfjsLib.getDocument(url).promise;

    await renderAllPages();

    currentUrl = url;
    viewerContainer.style.display = 'block';
    pesan.textContent = `✅ Slip ${namaFile} berhasil dimuat`;

  } catch (err) {
    console.error(err);
    errorDiv.textContent = 'PDF tidak ditemukan!';
    pesan.textContent = '';
  }
});

// ================= DOWNLOAD =================
downloadBtn.addEventListener('click', async () => {
  if (!currentUrl) return;

  const res = await fetch(currentUrl);
  const blob = await res.blob();

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = currentFileName;
  a.click();
});

// ================= UI =================
document.getElementById('togglePass').onclick = () => {
  const input = document.getElementById('password');
  input.type = input.type === 'password' ? 'text' : 'password';
};

// AUTO TAHUN
document.addEventListener('DOMContentLoaded', () => {
  const tahunNow = new Date().getFullYear().toString();
  const select = document.getElementById('tahun');

  if (![...select.options].some(o => o.value === tahunNow)) {
    const opt = document.createElement('option');
    opt.value = tahunNow;
    opt.textContent = tahunNow;
    select.appendChild(opt);
  }

  select.value = tahunNow;
});
