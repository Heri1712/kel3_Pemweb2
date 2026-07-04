<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kelola Produk - MiniRetail Admin</title>
</head>
<body>

<table width="100%"><tr valign="top">
<!-- SIDEBAR -->
<td width="150">
    <?= view('admin/partials/sidebar') ?>
</td>

<!-- MAIN CONTENT -->
<td>
    <h2>Kelola Produk</h2>
    <hr>

    <!-- Pesan sukses/error -->
    <div id="msg-container"></div>

    <!-- Tombol tambah -->
    <button onclick="showForm()">+ Tambah Produk</button>

    <hr>

    <!-- Daftar Produk -->
    <h3>Produk Terdaftar</h3>
    <div id="produk-list">Memuat data...</div>

    <hr>

    <!-- Form Tambah/Edit Produk -->
    <div id="form-produk" style="display:none;">
        <h3>Form Tambah/Edit Produk</h3>
        <form id="produk-form">
            <input type="hidden" id="produk-id">

            <div>
                <label>Nama Produk</label><br>
                <input type="text" id="nama_produk" placeholder="Masukan nama produk" required>
            </div>
            <br>
            <div>
                <label>Kategori</label><br>
                <select id="id_kategori" required>
                    <option value="">Pilih kategori</option>
                </select>
            </div>
            <br>
            <div>
                <label>Harga</label><br>
                <input type="number" id="harga" placeholder="Masukan harga produk" required>
            </div>
            <br>
            <div>
                <label>Stok</label><br>
                <input type="number" id="stok" placeholder="Masukan stok produk" required>
            </div>
            <br>
            <div>
                <label>Deskripsi</label><br>
                <textarea id="deskripsi" placeholder="Masukan deskripsi produk"></textarea>
            </div>
            <br>
            <div>
                <label>Gambar (nama file)</label><br>
                <input type="text" id="foto" placeholder="contoh: produk.jpg">
            </div>
            <br>
            <button type="submit">Simpan</button>
            <button type="button" onclick="hideForm()">Batal</button>
        </form>
    </div>
</td>
</tr></table>

<script>
    let editingId = null;

    async function loadProduk() {
        const res  = await fetch('<?= base_url("api/admin/produk") ?>');
        const json = await res.json();

        let rows = '';
        json.data.forEach(p => {
            rows += `<tr>
                <td>${p.foto ? p.foto : '-'}</td>
                <td>${p.nama_produk}</td>
                <td>${p.nama_kategori || '-'}</td>
                <td>Rp. ${Number(p.harga).toLocaleString('id-ID')}</td>
                <td>${p.stok}</td>
                <td>
                    <button onclick="editProduk(${p.id}, '${p.nama_produk}', ${p.id_kategori}, ${p.harga}, ${p.stok}, '${p.deskripsi}', '${p.foto}')">Edit</button>
                    <button onclick="deleteProduk(${p.id})">Hapus</button>
                </td>
            </tr>`;
        });

        document.getElementById('produk-list').innerHTML = `
            <table border="1" cellpadding="8" cellspacing="0" width="100%">
                <thead>
                    <tr>
                        <th>Foto</th>
                        <th>Nama Produk</th>
                        <th>Kategori</th>
                        <th>Harga</th>
                        <th>Stok</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }

    async function loadKategori() {
        const res  = await fetch('<?= base_url("api/admin/kategori") ?>');
        const json = await res.json();
        const sel  = document.getElementById('id_kategori');
        sel.innerHTML = '<option value="">Pilih kategori</option>';
        json.data.forEach(k => {
            sel.innerHTML += `<option value="${k.id}">${k.nama_kategori}</option>`;
        });
    }

    function showForm() {
        editingId = null;
        document.getElementById('produk-form').reset();
        document.getElementById('produk-id').value = '';
        document.getElementById('form-produk').style.display = 'block';
        loadKategori();
    }

    function hideForm() {
        document.getElementById('form-produk').style.display = 'none';
    }

    function editProduk(id, nama, id_kat, harga, stok, deskripsi, foto) {
        editingId = id;
        document.getElementById('produk-id').value   = id;
        document.getElementById('nama_produk').value = nama;
        document.getElementById('harga').value       = harga;
        document.getElementById('stok').value        = stok;
        document.getElementById('deskripsi').value   = deskripsi;
        document.getElementById('foto').value        = foto;
        document.getElementById('form-produk').style.display = 'block';
        loadKategori().then(() => {
            document.getElementById('id_kategori').value = id_kat;
        });
    }

    async function deleteProduk(id) {
        if (!confirm('Hapus produk ini?')) return;
        const res  = await fetch(`<?= base_url("api/admin/produk/delete/") ?>${id}`, { method: 'POST' });
        const json = await res.json();
        showMsg(json.messages?.success || json.messages?.error || 'Selesai', res.ok);
        loadProduk();
    }

    document.getElementById('produk-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const id = document.getElementById('produk-id').value;
        const url = id
            ? `<?= base_url("api/admin/produk/update/") ?>${id}`
            : `<?= base_url("api/admin/produk") ?>`;

        const body = {
            nama_produk:  document.getElementById('nama_produk').value,
            id_kategori:  document.getElementById('id_kategori').value,
            harga:        document.getElementById('harga').value,
            stok:         document.getElementById('stok').value,
            deskripsi:    document.getElementById('deskripsi').value,
            foto:         document.getElementById('foto').value,
        };

        const res  = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body:   JSON.stringify(body)
        });
        const json = await res.json();

        if (res.ok) {
            showMsg(json.messages.success, true);
            hideForm();
            loadProduk();
        } else {
            let errText = '';
            for (const k in json.messages) errText += json.messages[k] + ' ';
            showMsg(errText.trim(), false);
        }
    });

    function showMsg(text, ok) {
        const el = document.getElementById('msg-container');
        el.style.color = ok ? 'green' : 'red';
        el.innerText = text;
        setTimeout(() => { el.innerText = ''; }, 4000);
    }

    loadProduk();
</script>
</body>
</html>
