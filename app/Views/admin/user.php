<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data User - MiniRetail Admin</title>
</head>
<body>

<table width="100%"><tr valign="top">
<td width="150">
    <?= view('admin/partials/sidebar') ?>
</td>
<td>
    <h2>Daftar User</h2>
    <hr>

    <div id="user-list">Memuat data...</div>
</td>
</tr></table>

<script>
    async function loadUser() {
        const res  = await fetch('<?= base_url("api/admin/user") ?>');
        const json = await res.json();

        if (!json.data || json.data.length === 0) {
            document.getElementById('user-list').innerHTML = '<p>Tidak ada data user.</p>';
            return;
        }

        let rows = '';
        json.data.forEach((u, i) => {
            const tgl = new Date(u.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
            rows += `<tr>
                <td>${i + 1}</td>
                <td>${u.nama}</td>
                <td>${u.email}</td>
                <td>${u.role}</td>
                <td>${tgl}</td>
            </tr>`;
        });

        document.getElementById('user-list').innerHTML = `
            <table border="1" cellpadding="8" cellspacing="0" width="100%">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Terdaftar</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }

    loadUser();
</script>
</body>
</html>
