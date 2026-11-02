// Fungsi bantu
function $(id) {
  return document.getElementById(id);
}

function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(angka);
}

// Mencegah teks dari pengguna dibaca sebagai kode HTML
function escapeHtml(teks) {
  return String(teks)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function teksHarga(barang) {
  return barang.harga === 0 ? "Gratis" : formatRupiah(barang.harga);
}

let barangList = [];
let fotoTerpilih = "";
let hanyaFavorit = false;
let favorit = [];
let previewFotoUrl = "";

const kosongFoto = "<p>Foto barang akan tampil di sini</p>";

// Favorit dan tema disimpan di browser (localStorage)
try {
  favorit = JSON.parse(localStorage.getItem("revive-fav")) || [];
} catch (error) {
  favorit = [];
}

function simpanFavorit() {
  try {
    localStorage.setItem("revive-fav", JSON.stringify(favorit));
  } catch (error) {}
}

// Notifikasi kecil (toast)
let timerToast;

function tampilkanToast(pesan) {
  const toast = $("toast");
  toast.textContent = pesan;
  toast.classList.add("show");

  clearTimeout(timerToast);
  timerToast = setTimeout(function () {
    toast.classList.remove("show");
  }, 2600);
}

// Tema gelap dan terang
function aturTema(tema) {
  document.documentElement.dataset.theme = tema;

  try {
    localStorage.setItem("revive-tema", tema);
  } catch (error) {}
}

let temaTersimpan = null;

try {
  temaTersimpan = localStorage.getItem("revive-tema");
} catch (error) {}

const suka = window.matchMedia("(prefers-color-scheme: dark)").matches;
aturTema(temaTersimpan || (suka ? "dark" : "light"));

$("temaBtn").addEventListener("click", function () {
  const gelap = document.documentElement.dataset.theme === "dark";
  aturTema(gelap ? "light" : "dark");
});

// Menu navigasi di layar kecil
$("menuBtn").addEventListener("click", function () {
  $("nav").classList.toggle("open");
});

$("nav").addEventListener("click", function (event) {
  if (event.target.tagName === "A") {
    $("nav").classList.remove("open");
  }
});

// Statistik di bagian hero
function hitungStatistik() {
  let totalHemat = 0;

  barangList.forEach(function (barang) {
    totalHemat += Math.max(0, barang.hargaBaru - barang.harga);
  });

  animasiAngka($("statBarang"), barangList.length, String);
  animasiAngka($("statGratis"), barangList.filter(barang => barang.harga === 0).length, String);
  animasiAngka($("statHemat"), totalHemat, formatRupiah);
}

// Menampilkan katalog barang
function tampilkanBarang() {
  const kataKunci = $("cariBarang").value.toLowerCase();
  const kategori = $("filterKategori").value;

  let hasil = barangList.filter(barang => {
    const cocokNama = barang.nama.toLowerCase().includes(kataKunci);
    const cocokKategori = kategori === "Semua" || barang.kategori === kategori;
    const cocokFavorit = !hanyaFavorit || favorit.includes(barang.id);

    return cocokNama && cocokKategori && cocokFavorit;
  });

  if ($("urutHarga").value === "termurah") {
    hasil.sort((a, b) => a.harga - b.harga);
  } else if ($("urutHarga").value === "termahal") {
    hasil.sort((a, b) => b.harga - a.harga);
  }

  $("favCount").textContent = favorit.length;

  if (hasil.length === 0) {
    const pesan = hanyaFavorit
      ? "Belum ada favorit. Ketuk ♡ pada barang yang kamu suka."
      : "Barang tidak ditemukan. Coba kata kunci atau kategori lain.";

    $("daftarBarang").innerHTML = '<p class="empty">' + pesan + "</p>";
    return;
  }

  $("daftarBarang").innerHTML = hasil.map(barang => {
    const gambar = barang.foto
      ? '<img src="' + barang.foto + '" alt="' + escapeHtml(barang.nama) + '">'
      : '<div class="photo-missing">Foto belum diunggah</div>';

    const ikonFavorit = favorit.includes(barang.id) ? "♥" : "♡";

    return `
      <article class="card">
        <div class="thumb">${gambar}</div>
        <button class="fav" data-fav="${barang.id}"
          aria-label="Favorit ${escapeHtml(barang.nama)}">${ikonFavorit}</button>
        <span class="cat">${escapeHtml(barang.kategori)}</span>
        <h3>${escapeHtml(barang.nama)}</h3>
        <p class="price">${teksHarga(barang)}</p>
        <p class="meta">Kondisi ${escapeHtml(barang.kondisi)} · ${escapeHtml(barang.penjual)}</p>
        <button class="btn" data-detail="${barang.id}">Lihat detail</button>
      </article>`;
  }).join("");

  // Beri jeda animasi muncul pada setiap kartu
  document.querySelectorAll(".card").forEach(function (kartu, i) {
    kartu.style.setProperty("--i", Math.min(i, 8));
  });
}

// Tombol favorit dan detail pada setiap kartu
$("daftarBarang").addEventListener("click", function (event) {
  const tombolFav = event.target.closest("[data-fav]");
  const tombolDetail = event.target.closest("[data-detail]");

  if (tombolFav) {
    const id = Number(tombolFav.dataset.fav);

    if (favorit.includes(id)) {
      favorit = favorit.filter(item => item !== id);
    } else {
      favorit.push(id);
    }

    simpanFavorit();
    tampilkanBarang();
  }

  if (tombolDetail) {
    bukaDetail(Number(tombolDetail.dataset.detail));
  }
});

$("cariBarang").addEventListener("input", tampilkanBarang);
$("filterKategori").addEventListener("change", tampilkanBarang);
$("urutHarga").addEventListener("change", tampilkanBarang);

$("favFilter").addEventListener("click", function () {
  hanyaFavorit = !hanyaFavorit;
  this.setAttribute("aria-pressed", hanyaFavorit);
  tampilkanBarang();
});

// Detail barang (modal)
function bukaDetail(id) {
  const barang = barangList.find(item => item.id === id);

  const pesanWa =
    "Halo " + barang.penjual + ", saya tertarik dengan " + barang.nama +
    " di ReVive. Apakah barangnya masih tersedia?";
  const linkWa =
    "https://wa.me/" + barang.whatsapp + "?text=" + encodeURIComponent(pesanWa);

  const gambar = barang.foto
    ? '<img src="' + barang.foto + '" alt="' + escapeHtml(barang.nama) + '">'
    : '<div class="photo-missing">Foto belum diunggah</div>';

  const hemat = barang.hargaBaru > barang.harga
    ? "<p>Hemat " + formatRupiah(barang.hargaBaru - barang.harga) +
      " dari harga baru.</p>"
    : "";

  $("modalIsi").innerHTML = `
    <div class="thumb">${gambar}</div>
    <span class="cat">${escapeHtml(barang.kategori)}</span>
    <h3>${escapeHtml(barang.nama)}</h3>
    <p class="price">${teksHarga(barang)}</p>
    ${hemat}
    <p>${escapeHtml(barang.deskripsi)}</p>
    <p>Kondisi: ${escapeHtml(barang.kondisi)} · Penjual: ${escapeHtml(barang.penjual)}</p>
    <a class="btn wa" href="${linkWa}" target="_blank"
      rel="noopener noreferrer">Hubungi via WhatsApp</a>`;

  $("modal").showModal();
}

$("tutup").addEventListener("click", function () {
  $("modal").close();
});

// Klik di luar kotak modal juga menutupnya
$("modal").addEventListener("click", function (event) {
  if (event.target === $("modal")) {
    $("modal").close();
  }
});

// Upload dan pratinjau foto
$("fotoBarang").addEventListener("change", function () {
  const file = this.files[0];
  fotoTerpilih = "";

  if (!file) {
    $("previewFoto").innerHTML = kosongFoto;
    return;
  }

  ReviveCatalog.readImage(file).then(function (foto) {
    if ($("fotoBarang").files[0] !== file) {
      return;
    }

    fotoTerpilih = foto;
    if (previewFotoUrl) {
      URL.revokeObjectURL(previewFotoUrl);
    }
    previewFotoUrl = URL.createObjectURL(foto);
    $("previewFoto").innerHTML =
      '<img src="' + previewFotoUrl + '" alt="Pratinjau foto barang">';
  }).catch(function (error) {
    console.error("Foto barang gagal diproses.", error);
    tampilkanToast(error.message);
    $("fotoBarang").value = "";
    $("previewFoto").innerHTML = kosongFoto;
  });
});

// Menambahkan barang baru
$("formBarang").addEventListener("submit", async function (event) {
  event.preventDefault();

  if (!fotoTerpilih) {
    tampilkanToast("Pilih foto barang dulu.");
    return;
  }

  const harga = Number($("hargaBarang").value);
  const whatsapp = $("whatsappPenjual").value.trim();

  if (!/^62[0-9]{8,13}$/.test(whatsapp) || !Number.isFinite(harga) || harga < 0) {
    tampilkanToast("Periksa harga dan format nomor WhatsApp.");
    return;
  }

  const data = new FormData();
  data.set("nama", $("namaBarang").value.trim());
  data.set("harga", String(harga));
  data.set("hargaBaru", String(harga));
  data.set("kategori", $("kategoriBarang").value);
  data.set("kondisi", $("kondisiBarang").value);
  data.set("deskripsi", $("deskripsiBarang").value.trim());
  data.set("penjual", $("namaPenjual").value.trim());
  data.set("whatsapp", whatsapp);
  data.set("foto", fotoTerpilih);

  try {
    await ReviveCatalog.create(data, false);
    barangList = await ReviveCatalog.load();
  } catch (error) {
    console.error("Barang gagal disimpan ke database.", error);
    tampilkanToast(error.message || "Barang gagal disimpan ke database.");
    return;
  }

  this.reset();
  fotoTerpilih = "";
  if (previewFotoUrl) {
    URL.revokeObjectURL(previewFotoUrl);
    previewFotoUrl = "";
  }
  $("previewFoto").innerHTML = kosongFoto;

  $("filterKategori").value = "Semua";
  $("cariBarang").value = "";
  $("urutHarga").value = "default";
  hanyaFavorit = false;
  $("favFilter").setAttribute("aria-pressed", "false");

  tampilkanBarang();
  hitungStatistik();

  $("katalog").scrollIntoView({ behavior: "smooth" });
  tampilkanToast("Barang berhasil dipasang di katalog!");
  ledakanKonfeti();
});

// Simulasi anggaran
const pilihanAnggaran = [
  { nama: "Meja Belajar", harga: 85000 },
  { nama: "Kipas Angin", harga: 60000 },
  { nama: "Buku Algoritma", harga: 25000 },
  { nama: "Lampu Meja", harga: 0 },
  { nama: "Rak Kos", harga: 40000 },
  { nama: "Kursi Belajar", harga: 70000 },
  { nama: "Rice Cooker", harga: 75000 },
  { nama: "Kasur Lipat", harga: 120000 }
];

pilihanAnggaran.forEach(function (item) {
  const label = document.createElement("label");
  label.className = "budget-item";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.dataset.harga = item.harga;
  checkbox.className = "pilihBudget";
  checkbox.addEventListener("change", hitungAnggaran);

  const teks = document.createElement("span");
  teks.textContent =
    item.nama + " — " + (item.harga === 0 ? "Gratis" : formatRupiah(item.harga));

  label.appendChild(checkbox);
  label.appendChild(teks);
  $("pilihanAnggaran").appendChild(label);
});

$("budget").addEventListener("input", hitungAnggaran);

function hitungAnggaran() {
  let total = 0;

  document.querySelectorAll(".pilihBudget:checked").forEach(function (item) {
    total += Number(item.dataset.harga);
  });

  const budget = Math.max(0, Number($("budget").value) || 0);
  const sisa = budget - total;
  const persen = budget > 0 ? Math.min(100, (total / budget) * 100) : (total > 0 ? 100 : 0);

  $("totalBelanja").textContent = formatRupiah(total);
  $("sisaAnggaran").textContent = formatRupiah(sisa);
  $("barIsi").style.width = persen + "%";
  $("barIsi").style.background = sisa < 0 ? "#d4452b" : "";

  const status = $("statusAnggaran");

  if (sisa < 0) {
    status.textContent = "Anggaran kamu melebihi batas.";
    status.style.color = "#d4452b";
  } else {
    status.textContent = "Anggaran masih mencukupi.";
    status.style.color = "var(--pine)";
  }
}

ReviveCatalog.load().then(function (products) {
  barangList = products;
  favorit = favorit.filter(id => barangList.some(barang => barang.id === id));
  simpanFavorit();
  tampilkanBarang();
  hitungStatistik();
}).catch(function (error) {
  console.error("Katalog gagal dimuat dari database.", error);
  $("daftarBarang").innerHTML =
    '<p class="empty">Katalog gagal dimuat. Pastikan PHP dan MySQL berjalan.</p>';
  tampilkanToast(error.message || "Database katalog tidak dapat dihubungi.");
});
hitungAnggaran();

// ===== Animasi dan efek tambahan =====

// Angka statistik naik perlahan
function animasiAngka(elemen, tujuan, format) {
  const mulai = performance.now();

  function langkah(sekarang) {
    const t = Math.min(1, (sekarang - mulai) / 1200);
    const nilai = Math.round(tujuan * (1 - Math.pow(1 - t, 3)));
    elemen.textContent = format(nilai);

    if (t < 1) {
      requestAnimationFrame(langkah);
    }
  }

  requestAnimationFrame(langkah);
}

// Bar progres scroll dan tombol kembali ke atas
window.addEventListener("scroll", function () {
  const tinggi = document.documentElement.scrollHeight - window.innerHeight;
  const persen = tinggi > 0 ? window.scrollY / tinggi : 0;

  $("progress").style.transform = "scaleX(" + persen + ")";
  $("naik").classList.toggle("show", window.scrollY > 500);
});

$("naik").addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Elemen muncul saat di-scroll
const pengamat = new IntersectionObserver(function (daftar) {
  daftar.forEach(function (item) {
    if (item.isIntersecting) {
      item.target.classList.add("in");
      pengamat.unobserve(item.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".head, .step, .panel, details").forEach(function (el) {
  el.classList.add("reveal");
  pengamat.observe(el);
});

// Kartu produk miring mengikuti kursor
$("daftarBarang").addEventListener("mousemove", function (event) {
  const kartu = event.target.closest(".card");

  if (!kartu) {
    return;
  }

  const kotak = kartu.getBoundingClientRect();
  const x = (event.clientX - kotak.left) / kotak.width;
  const y = (event.clientY - kotak.top) / kotak.height;

  kartu.style.setProperty("--ry", (x - 0.5) * 10 + "deg");
  kartu.style.setProperty("--rx", (0.5 - y) * 10 + "deg");
  kartu.style.setProperty("--mx", x * 100 + "%");
  kartu.style.setProperty("--my", y * 100 + "%");
});

$("daftarBarang").addEventListener("mouseout", function (event) {
  const kartu = event.target.closest(".card");

  if (kartu) {
    kartu.style.setProperty("--rx", "0deg");
    kartu.style.setProperty("--ry", "0deg");
  }
});

// Kartu label di hero bergeser mengikuti kursor
$("beranda").addEventListener("mousemove", function (event) {
  const kotak = this.getBoundingClientRect();
  const seni = this.querySelector(".hero-art");

  seni.style.setProperty("--px", (event.clientX - kotak.left) / kotak.width - 0.5);
  seni.style.setProperty("--py", (event.clientY - kotak.top) / kotak.height - 0.5);
});

// Placeholder pencarian berganti-ganti
const contohCari = ["meja belajar", "kipas angin", "buku algoritma", "monitor", "lampu meja"];
let urutanCari = 0;

setInterval(function () {
  urutanCari = (urutanCari + 1) % contohCari.length;
  $("cariBarang").placeholder = "Cari " + contohCari[urutanCari] + "...";
}, 2500);

// Ledakan emoji saat barang berhasil dipasang
function ledakanKonfeti() {
  const emoji = ["♻️", "🎉", "✨", "💚", "🎒"];

  for (let i = 0; i < 18; i++) {
    const el = document.createElement("span");
    el.className = "konfeti";
    el.textContent = emoji[i % emoji.length];
    el.style.setProperty("--x", (Math.random() - 0.5) * 520 + "px");
    el.style.setProperty("--y", (Math.random() - 0.7) * 420 + "px");
    document.body.appendChild(el);

    setTimeout(function () {
      el.remove();
    }, 1300);
  }
}

// ===== Pencarian di hero =====
$("heroCari").addEventListener("submit", function (event) {
  event.preventDefault();

  $("cariBarang").value = $("heroInput").value.trim();
  tampilkanBarang();
  $("katalog").scrollIntoView({ behavior: "smooth" });
});

// ===== Chatbot Reva =====
const kataAbaikan = [
  "cari", "carikan", "ada", "apa", "yang", "dong", "mau", "saya", "aku",
  "barang", "tolong", "untuk", "dengan", "dan", "ya", "gak", "nggak", "harga", "berapa"
];

// Membaca angka uang, contoh: "300 ribu", "1,5 juta", "250.000"
function ambilAngka(teks) {
  const bersih = teks.replace(/(\d)\.(\d{3})(?!\d)/g, "$1$2").replace(",", ".");
  const cocok = bersih.match(/(\d+(?:\.\d+)?)\s*(juta|jt|ribu|rb|k)?/);

  if (!cocok) {
    return null;
  }

  let nilai = parseFloat(cocok[1]);

  if (cocok[2] === "juta" || cocok[2] === "jt") {
    nilai *= 1000000;
  } else if (cocok[2]) {
    nilai *= 1000;
  }

  return nilai >= 1000 ? nilai : null;
}

function daftarHasil(daftar) {
  return daftar.map(barang =>
    '<button class="hasil" data-detail="' + barang.id + '"><span>' +
    escapeHtml(barang.nama) + "</span><b>" +
    teksHarga(barang) + "</b></button>"
  ).join("");
}

function jawabReva(teks) {
  const t = teks.toLowerCase();
  const uang = ambilAngka(t);

  if (/^(halo|hai|hi|hei|pagi|siang|sore|malam)\b/.test(t)) {
    return "Halo! Aku Reva. Aku bisa bantu cari barang, hitung paket hemat sesuai anggaran, atau jelaskan cara jual.";
  }

  if (/terima kasih|makasih|thanks/.test(t)) {
    return "Sama-sama! Kabari aku kalau butuh bantuan lagi.";
  }

  if (uang && /anggaran|budget|uang|dana|rp|paket|hemat|punya|belanja/.test(t)) {
    const urut = barangList.slice().sort((a, b) => a.harga - b.harga);
    const paket = [];
    let total = 0;

    urut.forEach(function (barang) {
      if (total + barang.harga <= uang) {
        paket.push(barang);
        total += barang.harga;
      }
    });

    return "Dengan " + formatRupiah(uang) + ", ini paket hemat untukmu (" +
      paket.length + " barang, total " + formatRupiah(total) + ", sisa " +
      formatRupiah(uang - total) + "):" + daftarHasil(paket.slice(0, 6));
  }

  if (/gratis|give ?away|free/.test(t)) {
    const gratis = barangList.filter(barang => barang.harga === 0);
    return "Ini barang gratis yang tersedia:" + daftarHasil(gratis);
  }

  if (/murah|termurah/.test(t)) {
    const murah = barangList.filter(barang => barang.harga > 0)
      .sort((a, b) => a.harga - b.harga).slice(0, 4);
    return "Barang berbayar termurah saat ini:" + daftarHasil(murah);
  }

  if (/jual|pasang|upload/.test(t)) {
    return 'Untuk menjual: buka bagian <a href="#jual">Pasang barangmu</a>, unggah foto, isi nama, harga, kategori, kondisi, dan nomor WhatsApp. Isi harga 0 kalau ingin memberikannya gratis.';
  }

  if (/bayar|cod|transfer|pembayaran/.test(t)) {
    return "Pembayaran disepakati langsung antara pembeli dan penjual, misalnya bayar di tempat saat bertemu.";
  }

  if (/aman|tipu|penipuan|percaya/.test(t)) {
    return "Tips aman: bertemu di area kampus, periksa barang sebelum membayar, dan jangan transfer sebelum barang kamu lihat.";
  }

  const kata = t.split(/\W+/).filter(k => k.length > 2 && !kataAbaikan.includes(k));
  const cocok = barangList.filter(barang =>
    kata.some(k => (barang.nama + " " + barang.kategori).toLowerCase().includes(k))
  );

  if (cocok.length > 0) {
    return "Aku menemukan " + cocok.length + " barang:" + daftarHasil(cocok.slice(0, 5));
  }

  return "Hmm, aku belum paham. Coba tanya seperti: \"barang gratis\", \"anggaran 300 ribu\", \"cari kipas\", atau \"cara jual\".";
}

function tambahPesan(html, dari) {
  const pesan = document.createElement("div");
  pesan.className = "msg " + dari;
  pesan.innerHTML = html;

  $("chatLog").appendChild(pesan);
  $("chatLog").scrollTop = $("chatLog").scrollHeight;
  return pesan;
}

function kirimKeReva(teks) {
  tambahPesan(escapeHtml(teks), "user");

  const ketik = tambahPesan('<span class="ketik"><span></span><span></span><span></span></span>', "bot");

  setTimeout(function () {
    ketik.innerHTML = jawabReva(teks);
    $("chatLog").scrollTop = $("chatLog").scrollHeight;
  }, 700);
}

$("chatBtn").addEventListener("click", function () {
  $("chatBox").classList.toggle("open");

  if ($("chatLog").children.length === 0) {
    tambahPesan("Halo, aku <b>Reva</b>, asisten ReVive. Mau cari barang apa hari ini?", "bot");
  }
});

$("chatTutup").addEventListener("click", function () {
  $("chatBox").classList.remove("open");
});

$("chatForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const teks = $("chatInput").value.trim();

  if (teks) {
    kirimKeReva(teks);
    $("chatInput").value = "";
  }
});

$("chatChips").addEventListener("click", function (event) {
  if (event.target.tagName === "BUTTON") {
    kirimKeReva(event.target.textContent);
  }
});

$("chatLog").addEventListener("click", function (event) {
  const tombol = event.target.closest("[data-detail]");

  if (tombol) {
    bukaDetail(Number(tombol.dataset.detail));
  }
});
