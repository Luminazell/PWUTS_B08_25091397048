# RuangKos — UTS Dava

**Mahasiswa:** Muhammad Dava Desvilano  
**NIM:** 25091397048  
**Kelompok/Kelas:** B08 / 2025B  
**Topik:** Sistem Informasi Manajemen Kos — Modul Pengelolaan Informasi Kos.

## Teknologi
- HTML5 — layout utama pada `index.html` dan halaman konten terpisah.
- CSS3 murni — desain responsif tanpa Bootstrap.
- JavaScript murni — navigasi **Ajax dengan `fetch()`**, validasi, pencarian, pengurutan, form tambah/edit, dan penyimpanan `localStorage`.
- **Tidak menggunakan PHP, Node.js, MySQL, atau folder API.**

## Pemetaan soal UTS
- **2.a:** `index.html` menjadi homepage utama yang responsif. Menu Beranda, Daftar Kos, dan Tambah Kos memuat fragmen HTML dengan Ajax (`fetch`) tanpa full reload.
- **2.b:** `pages/daftar-kos.html`, konten interaktif untuk mencari, mengurutkan, membuka detail, dan menuju Edit Kos.
- **2.c:** `pages/tambah-kos.html` berisi form dengan validasi JavaScript. Data tambah/edit tersimpan di **localStorage**.
- **2.d:** Dava fokus pada pengelolaan informasi *kos*, berbeda dari Farhan (kamar) dan Gerald (ulasan/laporan).

## Cara menjalankan
1. Extract ZIP. Pastikan hasilnya adalah folder `PWUTS_B08_25091397048` yang berisi `index.html`.
2. Salin folder itu ke `C:\xampp\htdocs\PWUTS_B08_25091397048`.
3. Buka XAMPP lalu **Start Apache**. **MySQL tidak perlu dijalankan**.
4. Buka `http://localhost/PWUTS_B08_25091397048/`.
5. Jika memakai VS Code, alternatifnya gunakan ekstensi Live Server dan buka `index.html` dengan Live Server.
6. Jangan buka `index.html` lewat `file:///` sebab navigasi Ajax dapat diblokir browser.

## Fitur
- Beranda: statistik jumlah kos dan total kamar dari data contoh.
- Daftar Kos: cari nama/alamat/deskripsi, urutkan, lihat detail, edit.
- Tambah Kos: validasi nama (3–120 karakter), alamat (10–1000), deskripsi (maksimum 1000).
- Penyimpanan: data tetap ada setelah refresh selama `localStorage` untuk origin tersebut tidak dihapus.
- Data contoh: Kos Arunika, Kos Nusa, dan Kos Asri (nama fiktif).
- Kos baru mendapat ID berikutnya; total kamar awal 0 sebab pengelolaan kamar termasuk modul Farhan.

## Susunan folder
```
PWUTS_B08_25091397048/
├── index.html
├── pages/
│   ├── beranda.html
│   ├── daftar-kos.html
│   └── tambah-kos.html
├── assets/
│   ├── css/style.css
│   └── js/app.js
└── README.md
```
