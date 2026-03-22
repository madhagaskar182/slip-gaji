const form = document.getElementById('pdfForm');
const viewer = document.getElementById('pdfViewer');
const viewerContainer = document.getElementById('viewerContainer');
const pesan = document.getElementById('pesan');
const errorDiv = document.getElementById('error');
const downloadBtn = document.getElementById('downloadBtn');

let currentUrl = '';
let currentFileName = '';
let dataPegawai = {};

// Load JSON pegawai
async function loadData() {
  try {
    const res = await fetch('pegawai.json');
    if (!res.ok) {
      throw new Error(`Gagal fetch pegawai.json - status: ${res.status}`);
    }
    dataPegawai = await res.json();
    console.log('pegawai.json berhasil dimuat. Jumlah pegawai:', Object.keys(dataPegawai).length);
    if (Object.keys(dataPegawai).length > 0) {
      console.log('Contoh NIP pertama:', Object.keys(dataPegawai)[0]);
    }
  } catch (err) {
    console.error('Gagal memuat pegawai.json:', err);
    errorDiv.textContent = 'Gagal memuat data pegawai. Hubungi bagian keuangan.';
  }
}
loadData();

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Handle form submit
form.addEventListener('submit', async function(e) {
  e.preventDefault();

  const tahun = document.getElementById('tahun').value;
  const bulan = document.getElementById('bulan').value;
  const nipInput = document.getElementById('nip').value.trim();
  const password = document.getElementById('password').value.trim();

  // Debug ke console
  console.log('=== DEBUG LOGIN ===');
  console.log('NIP yang dimasukkan:', nipInput);
  console.log('Panjang NIP:', nipInput.length);
  console.log('Password:', password ? '*** (ada)' : '(kosong)');

  errorDiv.textContent = '';
  pesan.textContent = '';
  viewerContainer.style.display = 'none';
  viewer.innerHTML = '';

  // Validasi input
  if (!tahun || !bulan || !nipInput || !password) {
    errorDiv.textContent = 'Harap isi semua kolom dengan lengkap!';
    return;
  }

  // Validasi panjang NIP (standar NIP Indonesia 18 digit)
  if (nipInput.length !== 18 || !/^\d{18}$/.test(nipInput)) {
    errorDiv.textContent = 'NIP harus 18 digit angka tanpa spasi atau tanda hubung!';
    return;
  }

  pesan.textContent = 'Memeriksa data...';

  // Cek apakah NIP ada di data
  const pegawai = dataPegawai[nipInput];
  if (!pegawai) {
    errorDiv.textContent = 'NIP tidak terdaftar. Periksa kembali atau hubungi keuangan.';
    console.log('NIP tidak ditemukan. NIP yang dicari:', nipInput);
    console.log('Daftar NIP yang tersedia:', Object.keys(dataPegawai));
    return;
  }

  // Cek password
  if (pegawai.password !== password) {
    errorDiv.textContent = 'Password salah!';
    return;
  }

  // Ambil nama file PDF
  const namaFile = pegawai.namaFile;
  currentFileName = namaFile + '.pdf';

  // Bangun URL PDF (sesuaikan jika path berbeda)
  const baseUrl = 'https://cdn.jsdelivr.net/gh/madhagaskar182/testing@main/files/';
  const url = `${baseUrl}${tahun}/${bulan}/${namaFile}.pdf`;

  pesan.textContent = 'Memuat slip gaji... Mohon tunggu.';
  console.log('Mencoba load PDF dari:', url);

  try {
    currentUrl = url;

    // Load PDF
    const pdf = await pdfjsLib.getDocument(url).promise;

    // Render setiap halaman
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.3 });
      const canvas = document.createElement('canvas');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      viewer.appendChild(canvas);

      await page.render({
        canvasContext: canvas.getContext('2d'),
        viewport: viewport
      }).promise;
    }

    viewerContainer.style.display = 'block';
    pesan.textContent = `Login berhasil - Slip gaji ${bulan}/${tahun} - ${pegawai.namaFile || 'Pegawai'}`;
    errorDiv.textContent = '';
  } catch (err) {
    console.error('Gagal memuat PDF:', err);
    errorDiv.textContent = 'Gagal memuat slip gaji. File mungkin belum tersedia atau ada kesalahan koneksi.';
    pesan.textContent = '';
  }
});

// Tombol Download
downloadBtn.onclick = async () => {
  if (!currentUrl) {
    alert('Tidak ada file untuk di-download.');
    return;
  }

  try {
    const res = await fetch(currentUrl);
    if (!res.ok) throw new Error('Gagal download');
    
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Gagal download:', err);
    alert('Gagal mengunduh file. Coba lagi atau hubungi admin.');
  }
};

// Set default tahun ke tahun berjalan
document.addEventListener('DOMContentLoaded', () => {
  const tahunSekarang = new Date().getFullYear().toString();
  const selectTahun = document.getElementById('tahun');
  
  if (![...selectTahun.options].some(opt => opt.value === tahunSekarang)) {
    const opt = document.createElement('option');
    opt.value = tahunSekarang;
    opt.textContent = tahunSekarang;
    selectTahun.appendChild(opt);
  }
  
  selectTahun.value = tahunSekarang;
});
