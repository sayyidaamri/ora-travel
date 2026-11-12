# ORA Travel — rebuild HTML statis

Situs HTML/CSS/JS native yang meniru tata letak & perilaku referensi `ermtour.com.tw` 1:1, dengan brand,
teks (Inggris), foto, logo, ilustrasi, dan kode buatan sendiri. Brand fiktif: **ORA Travel**.

## Cara membuka
Buka `index.html` (di root proyek) langsung di browser (klik dua kali). Tidak perlu server atau internet: font,
gambar, video, dan skrip ada di `assets/`.

## Halaman (39 file)
| Template | File |
|---|---|
| Beranda (slider full-screen) | `index.html` |
| Our Story (sejarah brand) | `about.html` (bagian `#incentive`) |
| Daftar berita / detail | `news.html`, `news-1.html` … `news-9.html` |
| Good Days (galeri pengalaman + panel detail) | `experience.html` |
| Papan tur per negara | `tours-south-africa.html`, `tours-japan.html` |
| Detail tur / itinerary harian / formulir pendaftaran | `tour-*.html`, `itinerary-*.html`, `apply-*.html` (4 tur) |
| Panduan negara | `country-*.html` (6 negara) |
| Daftar atraksi / hotel / restoran (+ popup detail) | `places.html`, `hotels.html`, `restaurants.html` (`?c=negara`, `?t=tur`) |
| Karier / kontak / trip custom | `join.html`, `contact.html`, `custom-trip.html` |

## Struktur
```
*.html                39 halaman statis di root proyek (lihat tabel di atas)
assets/
  css/                fonts, base (chrome bersama), home, about, list, form, intro
  js/                 main (chrome + wizard), home, about, list, form, intro
  img/                53 foto Unsplash — sumber di assets/img/CREDITS.md
  media/              video awan (Mixkit #2408, Mixkit License) + poster
  svg/                favicon, ilustrasi jip (about)
  fonts/              Source Sans 3, Yantramanav, Nunito (Google Fonts, OFL)
```
Folder generator (`build/`), skrip riset (`clone-kit/`), `docs/`, dan folder `site/` sudah tidak ada di proyek ini;
file HTML di root adalah sumber yang diedit langsung.

## Mengubah teks
Edit langsung file `.html` terkait. Header, menu, wizard "Explore", dan footer diulang di setiap halaman, jadi
perubahan pada bagian bersama harus diterapkan ke semua file (cari-ganti lintas file). Gaya bersama ada di
`assets/css/base.css`, perilaku bersama di `assets/js/main.js`.

## State & interaksi yang dibuat
- **Loader** cincin berputar → tirai biru dengan huruf "GO" → foto muncul dari bawah → logo/menu/tab meluncur masuk.
- **Slider beranda**: prev/next, roda mouse, tombol panah, swipe; satu slide berupa video.
- **Menu**: tombol "menu." (animasi garis saat hover), bar navigasi biru turun; versi mobile vertikal.
- **Wizard "Explore"** (semua halaman): Group Tours → tipe → wilayah → negara, Incentive → korporat (pilih logo,
  login demo) / individu → wilayah → negara; progress bar dengan titik yang bisa diklik, Back / Start over,
  panel bawah "What is an incentive trip?". Mobile: rel progres vertikal.
- **Panel "Hot right now"** di beranda, footer "More" (slide-up di beranda), back-to-top.
- About: reveal saat scroll, slider 6 langkah incentive. Daftar: hover kartu, load more, panel detail Good Days,
  panel tanggal keberangkatan. Detail tur: menu sticky, tab info (modal di mobile), jam lokal, peta rute.
  Itinerary: slider hero, animasi per hari. Atraksi/hotel/restoran: popup detail via hash (`#place-1`).
- **Form** (join, contact, custom trip, pendaftaran): validasi per field, kode verifikasi yang bisa di-refresh,
  modal kebijakan privasi, state terima kasih. **Tidak ada data yang dikirim** — sambungkan ke backend sendiri
  di `assets/js/form.js` (dan form subscribe di `main.js`).
- Esc menutup semua modal/panel; `prefers-reduced-motion` dihormati.

## Perbedaan yang disengaja / tidak bisa 1:1
- Font referensi (Source Han Sans, CJK, Typekit) diganti **Source Sans 3** (glyph Latin-nya memang turunan Source
  Sans); karena copy berbahasa Inggris, lebar dan pemenggalan baris sedikit berbeda, dan beberapa ukuran angka
  disesuaikan agar tampak setara.
- Logo, ilustrasi (kacamata, koper, jip, amplop, kaca pembesar, dll.) digambar ulang sebagai SVG sederhana.
- Tombol unduh PDF/itinerary/visa mengarah ke `#` dengan catatan "Coming soon" (referensi memakai file asli).
- Login korporat dan semua form hanya demo di sisi klien.
- Halaman daftar atraksi/hotel/restoran di referensi kosong tanpa parameter; di sini menampilkan semua item.

## Placeholder yang perlu diganti
Nama brand, email `hello@oratravel.example`, telepon/fax, alamat & nomor lisensi, kantor cabang, nama
perusahaan klien, studio "Lumen Lab", harga & tanggal tur — semuanya fiktif, tersebar di file `.html`
(cari-ganti lintas file untuk menggantinya).
