<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Admin - MiniRetail</title>
</head>
<body>

<table width="100%"><tr valign="top">
<!-- SIDEBAR -->
<td width="150">
    <?= view('admin/partials/sidebar') ?>
</td>

<!-- MAIN CONTENT -->
<td>
    <div>
        <h2>DASHBOARD</h2>
        <p>Admin: <strong><?= esc(session()->get('userName')) ?></strong></p>
        <hr>

        <!-- STATISTIK KARTU -->
        <div id="stats-container">
            <p>Memuat data...</p>
        </div>

        <hr>

        <!-- TRANSAKSI TERBARU -->
        <h3>Transaksi Terbaru</h3>
        <div id="recent-transaksi">
            <p>Memuat data...</p>
        </div>
    </div>
</td>
</tr></table>

<script>
    async function loadDashboard() {
        try {
            const res  = await fetch('<?= base_url("api/admin/dashboard-stats") ?>');
            const json = await res.json();

            if (!res.ok) {
                document.getElementById('stats-container').innerText = 'Gagal memuat statistik.';
                return;
            }

            const d = json.data;

            // Tampilkan kartu statistik
            document.getElementById('stats-container').innerHTML = `
                <table border="1" cellpadding="8" cellspacing="0">
                    <tr>
                        <td><strong>Total Produk</strong><br>${d.total_produk}</td>
                        <td><strong>Total Kategori</strong><br>${d.total_kategori}</td>
                        <td><strong>Total Stok</strong><br>${d.total_stok}</td>
                        <td><strong>Total Transaksi</strong><br>${d.total_transaksi}</td>
                    </tr>
                </table>
            `;

            // Tampilkan transaksi terbaru
            let rows = '';
            d.recent_transaksi.forEach((t, i) => {
                const inv    = 'INV-' + String(t.id).padStart(3, '0');
                const tanggal = new Date(t.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
                const total  = 'Rp. ' + Number(t.total_harga).toLocaleString('id-ID');
                rows += `<tr>
                    <td>${inv}</td>
                    <td>${t.nama_user}</td>
                    <td>${tanggal}</td>
                    <td>${total}</td>
                    <td>${t.status}</td>
                </tr>`;
            });

            document.getElementById('recent-transaksi').innerHTML = `
                <table border="1" cellpadding="8" cellspacing="0" width="100%">
                    <thead>
                        <tr>
                            <th>Invoice</th>
                            <th>User</th>
                            <th>Tanggal</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            `;
        } catch (err) {
            document.getElementById('stats-container').innerText = 'Error: ' + err.message;
        }
    }

    loadDashboard();
</script>
</body>
</html>
