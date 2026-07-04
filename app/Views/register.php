<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daftar Akun Baru - Mini Retail</title>
</head>
<body>
    <!-- Logo Mini Retail -->
    <div>
        <strong>MINI RETAIL</strong>
    </div>

    <hr>

    <!-- Form Register -->
    <div>
        <h1>Buat Akun Baru</h1>
        <p>Daftar untuk mulai berbelanja</p>

        <!-- Container Response API -->
        <div id="error-container" style="color: red; display: none;"></div>
        <div id="success-container" style="color: green; display: none;"></div>

        <form id="register-form">
            <div>
                <label for="nama">Nama Lengkap</label><br>
                <input type="text" id="nama" name="nama" placeholder="Masukan nama lengkap" required>
            </div>
            <br>
            <div>
                <label for="email">E-mail</label><br>
                <input type="email" id="email" name="email" placeholder="Masukan email" required>
            </div>
            <br>
            <div>
                <label for="password">Password</label><br>
                <input type="password" id="password" name="password" placeholder="Masukan password" required>
            </div>
            <br>
            <div>
                <label for="confirm_password">Password</label><br>
                <input type="password" id="confirm_password" name="confirm_password" placeholder="Konfirmasi password" required>
            </div>
            <br>
            <button type="submit" id="btn-submit">DAFTAR</button>
        </form>

        <p>Sudah punya akun? <a href="<?= base_url('login') ?>">Login</a></p>
    </div>

    <script>
        document.getElementById('register-form').addEventListener('submit', async function(e) {
            e.preventDefault();

            const nama = document.getElementById('nama').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirm_password = document.getElementById('confirm_password').value;
            const errorContainer = document.getElementById('error-container');
            const successContainer = document.getElementById('success-container');
            const btnSubmit = document.getElementById('btn-submit');

            // Reset messages
            errorContainer.style.display = 'none';
            errorContainer.innerHTML = '';
            successContainer.style.display = 'none';
            successContainer.innerHTML = '';
            btnSubmit.disabled = true;
            btnSubmit.innerText = 'Memproses...';

            try {
                const response = await fetch('<?= base_url("api/register") ?>', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({ nama, email, password, confirm_password })
                });

                const result = await response.json();

                if (response.ok) {
                    successContainer.innerText = result.messages.success;
                    successContainer.style.display = 'block';
                    
                    // Redirect to login after 1.5 seconds
                    setTimeout(() => {
                        window.location.href = '<?= base_url("login") ?>';
                    }, 1500);
                } else {
                    errorContainer.style.display = 'block';
                    if (result.messages && typeof result.messages === 'object') {
                        let errorHtml = '<ul>';
                        for (const field in result.messages) {
                            errorHtml += `<li>${result.messages[field]}</li>`;
                        }
                        errorHtml += '</ul>';
                        errorContainer.innerHTML = errorHtml;
                    } else if (result.messages) {
                        errorContainer.innerText = result.messages;
                    } else {
                        errorContainer.innerText = 'Terjadi kesalahan saat registrasi.';
                    }
                    btnSubmit.disabled = false;
                    btnSubmit.innerText = 'DAFTAR';
                }
            } catch (error) {
                console.error('Error:', error);
                errorContainer.innerText = 'Gagal terhubung ke server.';
                errorContainer.style.display = 'block';
                btnSubmit.disabled = false;
                btnSubmit.innerText = 'DAFTAR';
            }
        });
    </script>
</body>
</html>
