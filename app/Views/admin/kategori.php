<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kelola Kategori - MiniRetail Admin</title>
</head>
<body>

<table width="100%"><tr valign="top">
<td width="150">
    <?= view('admin/partials/sidebar') ?>
</td>
<td>
    <h2>Kelola Kategori</h2>
    <hr>

    <div id="msg-container"></div>

    <!-- Form Tambah/Edit Kategori -->
    <h3>Tambah / Edit Kategori</h3>
    <form id="kategori-form">
        <input type="hidden" id="kat-id">
        <label>Nama Kategori</label><br>
        <input type="text" id="nama_kategori" placeholder="Masukan nama kategori" required>
        <button type="submit">Simpan</button>
        <button type="button" onclick="resetForm()">Reset</button>
    </form>

    <hr>

    <!-- Daftar Kategori -->
    <h3>Daftar Kategori</h3>
    <div id="kategori-list">Memuat data...</div>
</td>
</tr></table>

<script>
    async function loadKategori() {
        const res  = await fetch('<?= base_url("api/admin/kategori") ?>');
        const json = await res.json();

        let rows = '';
        json.data.forEach(k => {
            rows += `<tr>
                <td>${k.id}</td>
                <td>${k.nama_kategori}</td>
                <td>
                    <button onclick="editKategori(${k.id}, '${k.nama_kategori}')">Edit</button>
                    <button onclick="deleteKategori(${k.id})">Hapus</button>
                </td>
            </tr>`;
        });

        document.getElementById('kategori-list').innerHTML = `
            <table border="1" cellpadding="8" cellspacing="0">
                <thead>
                    <tr><th>ID</th><th>Nama Kategori</th><th>Action</th></tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }

    function editKategori(id, nama) {
        document.getElementById('kat-id').value         = id;
        document.getElementById('nama_kategori').value  = nama;
    }

    function resetForm() {
        document.getElementById('kat-id').value         = '';
        document.getElementById('nama_kategori').value  = '';
    }

    async function deleteKategori(id) {
        if (!confirm('Hapus kategori ini?')) return;
        const res  = await fetch(`<?= base_url("api/admin/kategori/delete/") ?>${id}`, { method: 'POST' });
        const json = await res.json();
        showMsg(json.messages?.success || 'Selesai', res.ok);
        loadKategori();
    }

    document.getElementById('kategori-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const id   = document.getElementById('kat-id').value;
        const nama = document.getElementById('nama_kategori').value;

        const body = id
            ? { id, nama_kategori: nama }
            : { nama_kategori: nama };

        const res  = await fetch('<?= base_url("api/admin/kategori") ?>', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body:   JSON.stringify(body)
        });
        const json = await res.json();

        if (res.ok) {
            showMsg(json.messages.success, true);
            resetForm();
            loadKategori();
        } else {
            let errText = '';
            for (const k in json.messages) errText += json.messages[k] + ' ';
            showMsg(errText.trim(), false);
        }
    });

    function showMsg(text, ok) {
        const el = document.getElementById('msg-container');
        el.style.color = ok ? 'green' : 'red';
        el.innerText   = text;
        setTimeout(() => { el.innerText = ''; }, 4000);
    }

    loadKategori();
</script>
</body>
</html>
