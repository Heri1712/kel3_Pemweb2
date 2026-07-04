<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard User</title>
</head>
<body>
    <div style="max-width: 500px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
        <h2>Dashboard</h2>
        
        <p style="font-size: 1.2em;">Selamat datang, <strong><?= esc($user['nama']) ?></strong>!</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h4>Informasi Akun Anda:</h4>
            <p><strong>Email:</strong> <?= esc($user['email']) ?></p>
            <p><strong>Role:</strong> <?= esc($user['role']) ?></p>
        </div>

        <a href="<?= base_url('logout') ?>" style="display: inline-block; padding: 10px 15px; background-color: #d9534f; color: white; text-decoration: none; border-radius: 3px;">Logout</a>
    </div>
</body>
</html>
