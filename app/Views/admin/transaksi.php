<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Transaksi - MiniRetail Admin</title>
</head>
<body>

<table width="100%"><tr valign="top">
<td width="150">
    <?= view('admin/partials/sidebar') ?>
</td>
<td>
    <h2>Data Transaksi</h2>
    <hr>

    <!-- Filter Transaksi -->
    <form id="filter-form">
        <label>Dari Tanggal:</label>
        <input type="date" id="date-from">

        <label>Sampai Tanggal:</label>
        <input type="date" id="date-to">

        <label>Status:</label>
        <select id="status-filter">
            <option value="">Semua Status</option>
            <option value="Selesai">Selesai</option>
            <option value="Dibatalkan">Dibatalkan</option>
            <option value="Pending">Pending</option>
        </select>

        <button type="submit">Filter</button>
        <button type="button" onclick="resetFilter()">Reset</button>
    </form>

    <hr>

    <h3>Daftar Transaksi</h3>
    <div id="transaksi-list">Memuat data...</div>
</td>
</tr></table>

<script>
    async function loadTransaksi(from = '', to = '', status = '') {
        let url = '<?= base_url("api/admin/transaksi") ?>?';
        if (from)   url += `from=${from}&`;
        if (to)     url += `to=${to}&`;
        if (status) url += `status=${status}&`;

        const res  = await fetch(url);
        const json = await res.json();

        if (!json.data || json.data.length === 0) {
            document.getElementById('transaksi-list').innerHTML = '<p>Tidak ada data transaksi.</p>';
            return;
        }

        let rows = '';
        json.data.forEach((t, i) => {
            const inv     = 'INV-' + String(t.id).padStart(3, '0');
            const tanggal = new Date(t.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const total   = 'Rp. ' + Number(t.total_harga).toLocaleString('id-ID');
            rows += `<tr>
                <td>${inv}</td>
                <td>${t.nama_user}</td>
                <td>${tanggal}</td>
                <td>${total}</td>
                <td>${t.metode_pembayaran || '-'}</td>
                <td>${t.status}</td>
            </tr>`;
        });

        document.getElementById('transaksi-list').innerHTML = `
            <table border="1" cellpadding="8" cellspacing="0" width="100%">
                <thead>
                    <tr>
                        <th>Invoice</th>
                        <th>User</th>
                        <th>Tanggal</th>
                        <th>Total</th>
                        <th>Metode Pembayaran</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }

    document.getElementById('filter-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const from   = document.getElementById('date-from').value;
        const to     = document.getElementById('date-to').value;
        const status = document.getElementById('status-filter').value;
        loadTransaksi(from, to, status);
    });

    function resetFilter() {
        document.getElementById('date-from').value       = '';
        document.getElementById('date-to').value         = '';
        document.getElementById('status-filter').value   = '';
        loadTransaksi();
    }

    loadTransaksi();
</script>
</body>
</html>
