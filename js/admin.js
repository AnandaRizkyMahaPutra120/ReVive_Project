function $(id) {
  return document.getElementById(id);
}

function escapeHtml(teks) {
  return String(teks)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(angka);
}

let barangList = [];
let fotoTerpilih = null;
let previewFotoUrl = "";
let sesiAdmin = false;

function setSesiAdmin(aktif) {
  sesiAdmin = aktif;
  $("adminLogin").hidden = aktif;
  $("adminLayout").hidden = !aktif;
  $("logoutAdmin").hidden = !aktif;
}

async function muatBarangAdmin() {
  barangList = await ReviveCatalog.load();
  tampilkanBarangAdmin();
}

function tampilkanBarangAdmin() {
  $("jumlahAdmin").textContent = barangList.length + " produk";

  if (barangList.length === 0) {
    $("daftarAdmin").innerHTML = '<p class="empty">Belum ada produk di katalog.</p>';
    return;
  }

  $("daftarAdmin").innerHTML = barangList.map(function (barang) {
    const gambar = barang.foto
      ? '<img src="' + escapeHtml(barang.foto) + '" alt="' + escapeHtml(barang.nama) + '">'
      : '<div class="photo-missing">Foto belum diunggah</div>';

    return `
      <article class="admin-product">
        <div class="admin-thumb">${gambar}</div>
        <div class="admin-product-info">
          <strong>${escapeHtml(barang.nama)}</strong>
          <span>${escapeHtml(barang.kategori)} · ${formatRupiah(barang.harga)}</span>
          <label class="btn admin-photo-upload" for="foto-produk-${Number(barang.id)}">${barang.foto ? "Ganti foto" : "Upload foto"}</label>
          <input accept="image/*" class="admin-photo-input" data-foto="${Number(barang.id)}"
            id="foto-produk-${Number(barang.id)}" type="file">
        </div>
        <button class="btn admin-delete" data-hapus="${Number(barang.id)}" type="button"
          aria-label="Hapus ${escapeHtml(barang.nama)}">Hapus</button>
      </article>`;
  }).join("");
}

$("fotoAdmin").addEventListener("change", function () {
  const file = this.files[0];
  fotoTerpilih = "";

  if (!file) {
    $("previewAdmin").innerHTML = "<p>Pratinjau foto akan tampil di sini</p>";
    return;
  }

  ReviveCatalog.readImage(file).then(async function (foto) {
    if ($("fotoAdmin").files[0] !== file) {
      return;
    }

    fotoTerpilih = foto;
    if (previewFotoUrl) {
      URL.revokeObjectURL(previewFotoUrl);
    }
    previewFotoUrl = URL.createObjectURL(foto);
    $("previewAdmin").innerHTML = '<img src="' + previewFotoUrl + '" alt="Pratinjau foto produk">';
    $("statusAdmin").textContent = "";
  }).catch(function (error) {
    console.error("Foto produk gagal diproses.", error);
    $("statusAdmin").textContent = error.message;
    $("fotoAdmin").value = "";
    $("previewAdmin").innerHTML = "<p>Pratinjau foto akan tampil di sini</p>";
  });
});

$("loginAdmin").addEventListener("submit", async function (event) {
  event.preventDefault();
  $("statusLogin").textContent = "Memeriksa password...";

  try {
    await ReviveCatalog.login($("passwordAdmin").value);
    $("passwordAdmin").value = "";
    setSesiAdmin(true);
    await muatBarangAdmin();
    $("statusAdmin").textContent = "Berhasil masuk sebagai admin.";
  } catch (error) {
    $("statusLogin").textContent = error.message;
  }
});

$("logoutAdmin").addEventListener("click", async function () {
  try {
    await ReviveCatalog.logout();
    setSesiAdmin(false);
    $("statusLogin").textContent = "Anda sudah keluar.";
  } catch (error) {
    $("statusAdmin").textContent = error.message;
  }
});

$("formAdmin").addEventListener("submit", async function (event) {
  event.preventDefault();

  if (!fotoTerpilih) {
    $("statusAdmin").textContent = "Pilih foto produk yang valid terlebih dahulu.";
    return;
  }

  const harga = Number($("hargaAdmin").value);
  const hargaBaru = $("hargaBaruAdmin").value === ""
    ? harga
    : Number($("hargaBaruAdmin").value);
  const whatsapp = $("whatsappAdmin").value.trim();

  if (
    !Number.isFinite(harga) ||
    harga < 0 ||
    !Number.isFinite(hargaBaru) ||
    hargaBaru < 0 ||
    !/^62[0-9]{8,13}$/.test(whatsapp)
  ) {
    $("statusAdmin").textContent = "Periksa harga dan format nomor WhatsApp.";
    return;
  }

  const data = new FormData();
  data.set("nama", $("namaAdmin").value.trim());
  data.set("harga", String(harga));
  data.set("hargaBaru", String(hargaBaru));
  data.set("kategori", $("kategoriAdmin").value);
  data.set("kondisi", $("kondisiAdmin").value);
  data.set("deskripsi", $("deskripsiAdmin").value.trim());
  data.set("penjual", $("penjualAdmin").value.trim());
  data.set("whatsapp", whatsapp);
  data.set("foto", fotoTerpilih);

  try {
    await ReviveCatalog.create(data, true);
    await muatBarangAdmin();
  } catch (error) {
    console.error("Produk gagal disimpan.", error);
    $("statusAdmin").textContent = error.message;
    return;
  }

  this.reset();
  fotoTerpilih = "";
  if (previewFotoUrl) {
    URL.revokeObjectURL(previewFotoUrl);
    previewFotoUrl = "";
  }
  $("previewAdmin").innerHTML = "<p>Pratinjau foto akan tampil di sini</p>";
  $("statusAdmin").textContent = "Produk berhasil ditambahkan ke katalog.";
});

$("daftarAdmin").addEventListener("change", async function (event) {
  const inputFoto = event.target.closest("[data-foto]");

  if (!inputFoto || !inputFoto.files[0]) {
    return;
  }

  const id = Number(inputFoto.dataset.foto);
  const file = inputFoto.files[0];
  const status = $("statusAdmin");

  try {
    await ReviveCatalog.readImage(file);
    if (inputFoto.files[0] !== file) {
      return;
    }

    await ReviveCatalog.updateImage(id, file);
    await muatBarangAdmin();
    status.textContent = "Foto produk berhasil diperbarui.";
  } catch (error) {
    console.error("Foto produk gagal diperbarui.", error);
    status.textContent = error.message;
    inputFoto.value = "";
  }
});

$("daftarAdmin").addEventListener("click", async function (event) {
  const tombolHapus = event.target.closest("[data-hapus]");

  if (!tombolHapus) {
    return;
  }

  const id = Number(tombolHapus.dataset.hapus);
  const barang = barangList.find(item => item.id === id);

  if (!barang || !window.confirm('Hapus "' + barang.nama + '" dari katalog?')) {
    return;
  }

  try {
    await ReviveCatalog.remove(id);
    await muatBarangAdmin();
  } catch (error) {
    console.error("Produk gagal dihapus.", error);
    $("statusAdmin").textContent = error.message;
    return;
  }

  $("statusAdmin").textContent = "Produk berhasil dihapus.";
});

async function mulaiAdmin() {
  try {
    const status = await ReviveCatalog.authStatus();
    setSesiAdmin(status.authenticated);
    if (status.authenticated) {
      await muatBarangAdmin();
    }
  } catch (error) {
    $("statusLogin").textContent = error.message;
  }
}

setSesiAdmin(false);
mulaiAdmin();
