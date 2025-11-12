<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Absen Harian Prinses 🌸</title>
<style>
    /* ===== Theme & Layout ===== */
    body {
        font-family: 'Segoe UI', sans-serif;
        background: #ffe4e1; /* pastel pink */
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
    }

    .container {
        background: #fff0f5;
        padding: 30px;
        border-radius: 20px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        width: 90%;
        max-width: 500px;
    }

    h1 {
        text-align: center;
        color: #ff69b4;
        margin-bottom: 20px;
    }

    label {
        display: block;
        margin-top: 15px;
        color: #ff1493;
        font-weight: bold;
    }

    input[type="text"], textarea, select {
        width: 100%;
        padding: 10px;
        margin-top: 5px;
        border-radius: 10px;
        border: 1px solid #ffc0cb;
        font-size: 16px;
    }

    textarea {
        resize: vertical;
    }

    input[type="file"] {
        margin-top: 10px;
    }

    .preview-img {
        margin-top: 10px;
        max-width: 100%;
        border-radius: 10px;
        display: none;
    }

    .btn-submit {
        margin-top: 20px;
        width: 100%;
        padding: 12px;
        background: #ffb6c1;
        color: white;
        font-size: 18px;
        font-weight: bold;
        border: none;
        border-radius: 15px;
        cursor: pointer;
        transition: transform 0.2s;
    }

    .btn-submit:hover {
        transform: scale(1.05);
    }

    /* ===== Popup ===== */
    .popup {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: #fff0f5;
        padding: 30px;
        border-radius: 20px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        text-align: center;
        z-index: 100;
        transition: transform 0.3s ease-in-out;
    }

    .popup.show {
        transform: translate(-50%, -50%) scale(1);
    }

    .flower {
        width: 80px;
        height: 80px;
        margin: 0 auto 15px auto;
        background: url('https://i.postimg.cc/QMbyc1h1/flower.png') no-repeat center/contain;
        animation: bloom 1s ease forwards;
    }

    @keyframes bloom {
        0% { transform: scale(0); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }

    .close-popup {
        margin-top: 15px;
        padding: 8px 20px;
        background: #ff69b4;
        color: white;
        border: none;
        border-radius: 12px;
        cursor: pointer;
    }
</style>
</head>
<body>
<div class="container">
    <h1>Absen Harian Prinses 🌸</h1>
    <form id="prinsesForm">
        <label for="mood">Mood hari ini</label>
        <select id="mood" required>
            <option value="" disabled selected>Pilih mood</option>
            <option value="Senang">Senang</option>
            <option value="Sedih">Sedih</option>
            <option value="Sakit">Sakit</option>
            <option value="Biasa aja">Biasa aja</option>
            <option value="Lainnya">Lainnya</option>
        </select>

        <label for="food">Makanan hari ini 🍱</label>
        <input type="text" id="food" placeholder="Tuliskan makanannya" required>

        <label for="story">Gimana harinyaaa ceritain dikit sini prinseskuu 💌</label>
        <textarea id="story" rows="4" placeholder="Cerita singkat..." required></textarea>

        <label for="photo">Upload foto</label>
        <input type="file" id="photo" accept="image/*">
        <img id="preview" class="preview-img">

        <button type="submit" class="btn-submit">💖 Kirim ke mdeepiee 💖</button>
    </form>
</div>

<div class="popup" id="popup">
    <div class="flower"></div>
    <p>🌸 Hadiah untuk prinses karna absen 🌸</p>
    <button class="close-popup" onclick="closePopup()">Tutup</button>
</div>

<script>
    const form = document.getElementById('prinsesForm');
    const photoInput = document.getElementById('photo');
    const preview = document.getElementById('preview');
    const popup = document.getElementById('popup');

    // Preview & convert photo ke base64
    let photoBase64 = "";
    photoInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                photoBase64 = e.target.result;
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
            reader.readAsDataURL(file);
        } else {
            photoBase64 = "";
            preview.src = '';
            preview.style.display = 'none';
        }
    });

    // Submit form
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const data = {
            mood: document.getElementById('mood').value,
            food: document.getElementById('food').value,
            story: document.getElementById('story').value,
            photo: photoBase64
        };

        fetch('https://formspree.io/f/mwpapkpq', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                showPopup();
                form.reset();
                preview.style.display = 'none';
                photoBase64 = "";
            } else {
                alert("Gagal kirim, coba lagi ya prinses 💔");
            }
        })
        .catch(err => alert("Gagal kirim, coba lagi ya prinses 💔"));
    });

    function showPopup() {
        popup.classList.add('show');
    }

    function closePopup() {
        popup.classList.remove('show');
    }
</script>
</body>
</html>
