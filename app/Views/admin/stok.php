<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kelola Stok - MiniRetail Admin</title>
</head>
<body>

<table width="100%"><tr valign="top">
<td width="150">
    <?= view('admin/partials/sidebar') ?>
</td>
<td>
    <h2>Kelola Stok</h2>
    <hr>

    <div id="msg-container"></div>

    <h3>Stok Produk</h3>
    <div id="stok-list">Memuat data...</div>
</td>
</tr></table>

<script>
    async function loadStok() {
        const res  = await fetch('<?= base_url("api/admin/produk") ?>');
        const json = await res.json();

        let rows = '';
        json.data.forEach(p => {
            rows += `<tr>
                <td>${p.foto || '-'}</td>
                <td>${p.nama_produk}</td>
                <td id="stok-${p.id}">${p.stok}</td>
                <td>
                    <input type="number" id="tambah-${p.id}" placeholder="Tambah" min="0" value="0" style="width:60px">
                    /
                    <input type="number" id="kurangi-${p.id}" placeholder="Kurangi" min="0" value="0" style="width:60px">
                </td>
                <td>
                    <button onclick="updateStok(${p.id})">Update</button>
                </td>
            </tr>`;
        });

        document.getElementById('stok-list').innerHTML = `
            <table border="1" cellpadding="8" cellspacing="0" width="100%">
                <thead>
                    <tr>
                        <th>Foto</th>
                        <th>Nama Produk</th>
                        <th>Stok Saat Ini</th>
                        <th>Tambah / Kurangi</th>
                        <th>Update</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }

    async function updateStok(id) {
        const tambah  = parseInt(document.getElementById(`tambah-${id}`).value)  || 0;
        const kurangi = parseInt(document.getElementById(`kurangi-${id}`).value) || 0;

        if (tambah === 0 && kurangi === 0) {
            showMsg('Masukan nilai tambah atau kurangi terlebih dahulu.', false);
            return;
        }

        const res  = await fetch(`<?= base_url("api/admin/produk/update-stok/") ?>${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body:   JSON.stringify({ tambah, kurangi })
        });
        const json = await res.json();

        if (res.ok) {
            showMsg(json.messages.success, true);
            document.getElementById(`stok-${id}`).innerText = json.data.stok_baru;
            document.getElementById(`tambah-${id}`).value  = 0;
            document.getElementById(`kurangi-${id}`).value = 0;
        } else {
            showMsg(json.messages?.error || 'Terjadi kesalahan.', false);
        }
    }

    function showMsg(text, ok) {
        const el = document.getElementById('msg-container');
        el.style.color = ok ? 'green' : 'red';
        el.innerText   = text;
        setTimeout(() => { el.innerText = ''; }, 4000);
    }

    loadStok();
</script>
</body>
</html>
