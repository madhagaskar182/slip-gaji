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

  } catch {
    errorDiv.textContent = 'Gagal memuat data!';
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

// ================= LAZY LOAD =================
function setupLazyLoad() {
  const observer = new IntersectionObserver(async (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const canvas = entry.target;
        const pageNum = canvas.dataset.page;

        if (!canvas.dataset.rendered) {
          const page = await pdfDoc.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.2 });

          const ctx = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: ctx,
            viewport
          }).promise;

          canvas.dataset.rendered = "true";
        }
      }
    }
  }, { rootMargin: '100px' });

  document.querySelectorAll('.pdf-page').forEach(c => observer.observe(c));
}

// ================= SUBMIT =================
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!dataLoaded) {
    errorDiv.textContent = 'Data belum siap!';
    return;
  }

  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value.trim();

  errorDiv.textContent = '';
  pesan.textContent = 'Loading...';
  viewer.innerHTML = '';
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

  // 🔥 FIXED PATH
  const baseUrl = 'https://cdn.jsdelivr.net/gh/madhagaskar182/testing@main/files/2026/03/';
  const url = `${baseUrl}${namaFile}.pdf`;

  try {
    pdfDoc = await pdfjsLib.getDocument(url).promise;

    // buat canvas placeholder
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const canvas = document.createElement('canvas');
      canvas.classList.add('pdf-page');
      canvas.dataset.page = i;
      viewer.appendChild(canvas);
    }

    setupLazyLoad();

    currentUrl = url;
    viewerContainer.style.display = 'block';
    pesan.textContent = `Slip ${namaFile} berhasil dimuat`;

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
