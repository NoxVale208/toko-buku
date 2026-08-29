# BookVault Frontend — Progress & Rencana Kerja

## Status Fase 1 — Auth (Selesai)
- Scaffold Vite + React + Tailwind, design tokens dari `DESIGN.md` Stitch
- Komponen reusable: Button, Input, Card, Badge, Icon
- API client Axios + Sanctum, AuthContext
- Halaman Login & Register (1:1 desain), terhubung ke backend

## Status Fase 2 — Customer Flow (Selesai)
Halaman yang dibangun (folder `src/pages/customer`), semua 1:1 dari `code.html` Stitch dan tersambung ke API:
- **BrowseBooks** (`/browse`, juga dipakai untuk `/search`) → `GET /books`, filter genre client-side, sort
- **BookDetail** (`/books/:id`) → `GET /books/:id`, tambah ke cart
- **Cart** (`/cart`) → `GET/POST/PUT/DELETE /cart...`
- **Checkout** (`/checkout`) → `POST /checkout` (metode transfer, catatan)
- **OrderConfirmed** (`/order-confirmed`) → upload bukti transfer via `POST /payments/{id}/upload-proof`
- **TrackOrder** (`/orders`) → daftar pesanan, `GET /orders`
- **OrderDetail / Invoice** (`/orders/:id`) → `GET /orders/:id`, tampilan invoice + status stepper, printable
- **MyAccount** (`/account`) → ringkasan profil & statistik pesanan
- **MyWishlist** (`/wishlist`) → **client-side (localStorage)**, lihat catatan di bawah
- **ProfileSettings** (`/settings`) → UI sesuai desain, form dinonaktifkan (lihat catatan)

Context baru: `CartContext` (state keranjang real-time dari API), `WishlistContext` (localStorage).

## Catatan Penting (perbedaan desain vs backend)
1. **Role Selection saat daftar** — endpoint `/register` selalu set role = customer. Halaman role-selection akan dipindah ke modul admin "Users & Permissions" di fase Admin.
2. **Wishlist** — backend belum punya tabel/endpoint wishlist. Implementasi saat ini pakai `localStorage` per-perangkat (bukan per-akun). Kalau mau wishlist tersinkron ke akun, perlu tambahan endpoint backend (`wishlists` table + controller) — beri tahu saya kalau mau saya buatkan.
3. **Payment method** — desain checkout aslinya punya form kartu kredit; backend hanya mendukung `transfer` (bank transfer manual + upload bukti). Saya adaptasi checkout & halaman konfirmasi jadi alur transfer + upload bukti, bukan form kartu.
4. **Profile/User Settings** — belum ada endpoint update-profil di backend, jadi form ditampilkan sesuai desain tapi read-only dengan catatan di layar. Beri tahu saya kalau mau saya tambahkan endpoint `PUT /me` di backend.
5. **Track Order (desain asli)** — desain aslinya berupa halaman shipping-tracking dengan data kurir. Backend tidak punya data pengiriman/kurir, jadi diadaptasi jadi status stepper berbasis `order.status` (waiting_confirmation → paid → completed).
6. Rating/review buku pada desain (bintang, jumlah rating) tidak ditampilkan karena backend tidak punya data rating — saya tidak mengarang data palsu.

## Rencana Fase Berikutnya
3. **Kasir (POS)**: POS terminal (1&2), receipt preview, transaction history & refunds, verifikasi pembayaran
4. **Admin — Katalog**: book management dashboard, edit book, inventory list
5. **Admin — Procurement & Stock**: purchase orders, stock control analytics, stock history/audit trail, master data management
6. **Admin — Reports & Analytics**: analytics dashboard, sales performance report, inventory operational reports
7. **Admin — Settings**: store profile, payment & tax, security & API, users & permissions (termasuk role-selection yang dipindah dari sini), system settings/activity log

## Perbaikan Bug (ditemukan saat verifikasi ulang endpoint sebelum Fase 3)
Beberapa path endpoint di Fase 2 sempat salah tebak, sudah diperbaiki:
- Update qty cart: `PUT /cart/update/{id}` (bukan `/cart/{id}`)
- Hapus item cart: `DELETE /cart/remove/{id}` (bukan `/cart/{id}`)
- Upload bukti bayar: `POST /payment/{id}/upload` (bukan `/payments/{id}/upload-proof`)

## Status Fase 3 — Kasir / POS (Selesai)
- **KasirSidebar** — nav sidebar bersama untuk area kasir (POS Terminal, Transactions, Payment Verification)
- **PosTerminal** (`/kasir/pos`) → grid buku + panel keranjang kasir, `POST /pos/transaction` (transaksi tunai langsung terverifikasi, sesuai backend)
- **ReceiptPreview** (`/kasir/receipt` dari state transaksi baru, atau `/kasir/receipt/:id` dari riwayat) → struk digital ala kertas kasir, printable
- **TransactionHistory** (`/kasir/transactions`) → `GET /sales` dengan filter pencarian & tanggal
- **PaymentVerification** (`/kasir/payments`) → **tidak ada desain Stitch persis untuk ini**, saya adaptasi dari gaya kartu/tabel yang sama karena endpoint `GET /payment/pending` & `PUT /payment/{id}/verify` adalah fitur nyata yang perlu UI. Menampilkan bukti transfer pelanggan untuk diverifikasi/ditolak kasir.

## Catatan Perbedaan Desain vs Backend (Fase 3)
- Desain POS Terminal punya "Tax (8%)", "Hold Order", "Split Pay" — backend PosController tidak mendukung pajak/diskon/tahan-order/split-pembayaran (harga = subtotal langsung, pajak & diskon selalu 0). Tombol-tombol itu saya hilangkan agar tidak menyesatkan (bukan sekadar dekorasi tak berfungsi).
- Desain "Secure Payment" (pilihan kartu/QR di POS) tidak dipakai karena backend POS hanya mendukung pembayaran tunai yang otomatis terverifikasi.
- Desain "Transaction History & Refunds" punya alur refund lengkap — backend tidak punya endpoint/kolom refund sama sekali, jadi tombol refund saya hilangkan dengan catatan di halaman (bukan dipalsukan jadi tombol yang tidak berfungsi).
- Receipt Preview desain asli menampilkan data loyalty pelanggan ("member since", "earned points") — dihilangkan karena backend tidak punya data loyalty/membership.

## Rencana Fase Berikutnya
4. **Admin — Katalog**: book management dashboard, edit book, inventory list
5. **Admin — Procurement & Stock**: purchase orders, stock control analytics, stock history/audit trail, master data management
6. **Admin — Reports & Analytics**: analytics dashboard, sales performance report, inventory operational reports
7. **Admin — Settings**: store profile, payment & tax, security & API, users & permissions (termasuk role-selection dari fase 1), system settings/activity log

## Status Fase 4 — Admin Dashboard (Selesai, menunggu review)
Sumber desain: `stitch_bookvault_enterprise_design_system/analytics_dashboard` (judul asli "BookVault - Enterprise ERP Dashboard" — bukan `5/analytics_dashboard_bookvault` yang judulnya "Analytics Overview" dan itu untuk fase Reports nanti).

### Endpoint yang dipakai
- `GET /dashboard` — statistik utama (role admin)
- `GET /books-management` — untuk hitung & tampilkan daftar stok menipis
- `GET /orders-management` — pesanan berstatus `pending` yang butuh persetujuan
- `POST /orders/{order}/approve` & `POST /orders/{order}/reject` — aksi cepat dari dashboard
- `GET /sales` — transaksi terbaru

### Fitur yang berhasil diimplementasikan
- AdminSidebar & AdminNavbar (reusable, dipakai ulang di fase Admin berikutnya)
- 6 kartu metrik nyata: Total Omzet, Total Penjualan, Total Order, Total Buku, Total Customer, Stok Menipis — semua dari `GET /dashboard`
- Panel "Pesanan Perlu Persetujuan" dengan tombol approve/reject langsung berfungsi
- Panel "Stok Menipis" dengan data buku nyata (bukan "Top Sellers" seperti desain asli)
- Tabel "Transaksi Terbaru" dari data penjualan nyata
- Loading state (spinner), error state (banner merah jika gagal fetch), empty state di tiap panel (pesanan kosong, stok aman, belum ada transaksi)
- Layout responsive (grid menyesuaikan di mobile/tablet/desktop)

### Penyesuaian Desain vs Backend
1. **Sales Trends chart (grafik batang Mon-Sun)** — **dihilangkan**. Backend tidak punya endpoint data time-series penjualan harian/mingguan, jadi grafik ini tidak bisa diisi data asli. Tidak saya buat dummy.
2. **Badge persentase perubahan** (+12.5%, +8.2%, -2.1%) di kartu metrik — **dihilangkan**. Tidak ada data pembanding periode sebelumnya di backend.
3. **"Top Stock" (buku terlaris minggu ini)** — **diganti** jadi "Stok Menipis" (daftar buku nyata dengan `stok <= minimal_stok`), karena backend tidak punya data "unit terjual per buku per minggu".
4. **Tombol "Last 30 Days" & "Export Report"** di header — **dihilangkan**. Tidak ada endpoint filter rentang tanggal atau export laporan.
5. **"Aktivitas Terbaru"** — **tidak diimplementasikan**. Tidak ada endpoint activity log sama sekali di backend saat ini.
6. **Search bar di top navbar** — desain menunjukkan pencarian global admin (buku/order/customer), tapi tidak ada endpoint pencarian gabungan; search bar ditampilkan sesuai desain tapi dinonaktifkan (disabled) agar tidak menyesatkan.
7. **Panel "Pesanan Perlu Persetujuan"** — **tidak ada di desain asli** (desain aslinya statis, tabel "Recent Transactions" saja). Saya tambahkan karena `GET /orders-management` + approve/reject adalah fitur nyata dan penting untuk actionable dashboard admin — dibuat dengan visual language yang sama (card + tombol ikon), bukan style baru.

### Hasil Build
`npm run build` sukses tanpa error (bundle ~385KB JS, ~34KB CSS).

### Rekomendasi Fase Admin Berikutnya
Saya sarankan **Katalog & Inventory** selanjutnya karena:
- Endpoint sudah lengkap (`/books-management`, CRUD `/books`, kategori/author/publisher CRUD)
- Link "Inventory" di sidebar & tombol "Kelola Inventory" di dashboard sudah mengarah ke `/admin/books` (masih placeholder)
- Melengkapi data referensi (kategori, penulis, penerbit) yang juga dipakai form tambah/edit buku

## Final Check Dashboard (sebelum Fase 5)
1. ✅ Semua statistik dari `GET /dashboard`, tidak ada yang hardcoded
2. ✅ Tidak ada business data dummy — sudah diverifikasi ulang kode `AdminDashboard.jsx`
3. ✅ Endpoint dicek ulang terhadap `DashboardController.php`, `BookController.php`, `AdminOrderController.php` di source backend — konsisten
4. ✅ Semua link sidebar (`AdminSidebar.jsx`) punya route tujuan yang valid di `App.jsx` (Dashboard aktif, sisanya placeholder berlabel jelas "segera hadir", bukan link mati)
5. ✅ Loading (spinner), error (banner merah), empty state (per panel) masih ada dan tidak diubah
6. ✅ Tidak ada fitur baru ditambahkan ke Dashboard
7. ✅ Tidak ada perubahan visual Dashboard

## Status Fase 5 — Katalog & Inventory (Selesai, menunggu review)

### Endpoint yang dipakai
- `GET /books-management` — daftar semua buku (admin, semua status)
- `POST /books` — tambah buku (multipart, termasuk cover)
- `GET /books/{id}` — detail buku (fallback jika halaman edit diakses tanpa state list — **lihat catatan bug di bawah**)
- `POST /books/{id}` dengan `_method=PUT` — update buku (Laravel method-spoofing, dipakai karena upload file perlu multipart, bukan PUT asli)
- `POST /books/{id}/publish` — publish buku draft/nonaktif
- `DELETE /books/{id}` — hapus buku permanen
- `GET/POST/PUT/DELETE /categories`, `/authors`, `/publishers` — CRUD master data (dipakai di modal "Kelola Kategori/Penulis/Penerbit" dan dropdown form buku)

### Fitur yang berhasil
- **InventoryList** (`/admin/books`) — tabel katalog dengan search (judul/ISBN/kode/penulis), filter kategori, filter status (draft/published/nonaktif), filter level stok (in/low/out — dihitung dari `stok.tersedia` vs `stok.minimal`), aksi publish/edit/delete per baris, loading/error/empty state
- **BookForm** (`/admin/books/new` dan `/admin/books/:id/edit`) — form tambah & edit buku (komponen sama), termasuk upload cover, dropdown kategori/penulis/penerbit dari data asli, Danger Zone (Archive → set status nonaktif, Delete permanen), sticky "unsaved changes" bar
- **MasterDataModal** (reusable) — CRUD Kategori/Penulis/Penerbit dengan search, dipanggil dari 3 tombol di halaman Inventory

### Design-vs-Backend Adjustments
1. **Export PDF / Export Excel** (tombol di header Inventory List) — **dihilangkan**. Tidak ada endpoint export di backend.
2. **Bulk actions** (checkbox pilih banyak baris + "Publish Selected"/"Archive Selected"/"Delete Selected") — **dihilangkan**. Backend hanya punya endpoint single-item (publish/update/delete per buku), tidak ada endpoint bulk.
3. **Pagination di tabel** — **tidak diimplementasikan** karena `GET /books-management` mengembalikan semua buku sekaligus (`->get()`, bukan `->paginate()`), tidak ada parameter halaman. Search/filter dilakukan client-side dari data penuh ini.
4. **Server-side search** — tidak tersedia di `books-management` (endpoint tidak membaca query `search`), jadi search dilakukan client-side.
5. **Distributor** — **tidak dibangun di Fase 5**. Backend punya CRUD `/distributors` lengkap, tapi tabel `books` tidak punya kolom `distributor_id` — distributor tidak terhubung ke buku sama sekali di skema saat ini. Lebih relevan dibangun di Fase 6 (Procurement/Purchase Orders) yang kemungkinan menggunakan distributor sebagai pemasok. Saya tidak memaksakan menambah field distributor ke buku.
6. **"Author Name" & Publisher sebagai teks bebas** di desain asli — **diubah jadi dropdown** karena backend mewajibkan `author_id`/`publisher_id`/`category_id` sebagai foreign key (relasi), bukan teks bebas. Ini penyesuaian struktural yang diperlukan, bukan sekadar preferensi visual.
7. **"Preview Page"**, **"Generate Copy" (AI Marketing Assistant)**, field **Creator/Last Edited** di sidebar status — **dihilangkan**. Tidak ada endpoint preview publik dari sisi admin, tidak ada AI-copy generator, dan backend tidak menyimpan siapa pembuat/kapan terakhir diedit (tidak ada kolom `created_by`/timestamp yang diekspos untuk itu).
8. **Harga ditampilkan "USD ($)"** di desain asli — **diubah ke IDR**, konsisten dengan seluruh aplikasi (backend pakai `harga_beli`/`harga_jual` integer tanpa mata uang eksplisit, dan seluruh fase sebelumnya sudah pakai format Rupiah).

### Route Ditambahkan
- `/admin/books` → InventoryList
- `/admin/books/new` → BookForm (mode tambah)
- `/admin/books/:id/edit` → BookForm (mode edit)

### Hasil Build/Test
- `npm run build` sukses tanpa error.
- Tidak bisa menjalankan test end-to-end sungguhan karena tidak ada instance backend Laravel yang live di sandbox ini — verifikasi dilakukan dengan membaca source code controller/route Laravel secara langsung untuk memastikan field, method HTTP, dan bentuk response cocok dengan yang dipakai frontend.

### Masalah yang Masih Tersisa (backend, ditemukan bukan diubah)
**Route conflict di backend**: `GET /books/{book}` didefinisikan dua kali di `routes/api.php` — sekali di grup publik (`publicShow`, tanpa auth, hanya buku `status=published`) dan sekali di grup admin (`show`, harusnya bisa lihat semua status). Karena rute publik didaftarkan lebih dulu, Laravel akan selalu mencocokkan rute publik itu duluan, jadi endpoint admin `show` **tidak pernah benar-benar tercapai**. Dampaknya: jika admin membuka URL edit buku *langsung* (bukan dari klik baris di tabel) untuk buku berstatus `draft`/`nonaktif`, fetch fallback saya ke `/books/{id}` akan gagal dengan "Buku tidak tersedia" (404), karena yang terpanggil adalah `publicShow`. Saat ini saya **mitigasi di sisi frontend** dengan selalu mengirim data buku lewat React Router state saat klik "Edit" dari tabel (jadi tidak perlu fetch ulang), tapi ini tidak menutup celah untuk akses URL langsung/refresh halaman edit. Perbaikan sebenarnya perlu di backend (mis. pisahkan prefix route admin, seperti `/admin/books/{book}`) — saya **belum mengubahnya** karena itu perubahan backend yang perlu persetujuan Anda dulu. Beri tahu saya kalau ingin saya perbaiki.

### Rekomendasi Fase Berikutnya
**Procurement & Stock** (Purchase Orders, Stock Control Analytics, Stock History/Audit Trail, Master Data Management termasuk Distributor) — karena Distributor yang ditunda dari Fase 5 relevan di sana, dan mengikuti urutan rencana awal.

## FIX BUG — Route Collision (sebelum Fase 6)

### Masalah awal
`GET /books/{book}` terdaftar dua kali di `routes/api.php`: satu di grup publik (`publicShow`, tanpa auth, hanya `status=published`) dan satu di grup admin (`show`, seharusnya bisa semua status). Karena Laravel mencocokkan route berdasarkan urutan pendaftaran, dan grup publik didaftarkan lebih dulu (baris 43 vs 97), route admin **tidak pernah tercapai**.

### Route sebelum
```
Route::get('/books',[BookController::class,'publicIndex']);        // publik
Route::get('/books/{book}',[BookController::class,'publicShow']);  // publik — hanya published

// ...di dalam grup admin:
Route::get('/books-management',[BookController::class,'index']);
Route::post('/books',[BookController::class,'store']);
Route::get('/books/{book}',[BookController::class,'show']);        // ❌ tidak pernah tercapai (shadowed)
Route::put('/books/{book}',[BookController::class,'update']);      // aman (beda method, tidak konflik)
Route::delete('/books/{book}',[BookController::class,'destroy']);  // aman (beda method)
Route::post('/books/{book}/publish',[BookController::class,'publish']); // aman (beda method)
```

### Route sesudah
```
Route::get('/books',[BookController::class,'publicIndex']);        // publik — tidak berubah
Route::get('/books/{book}',[BookController::class,'publicShow']);  // publik — tidak berubah

// grup admin — hanya path show/update/delete/publish yang dipindah ke prefix unik:
Route::get('/books-management',[BookController::class,'index']);
Route::post('/books',[BookController::class,'store']);                        // tidak berubah (store tidak konflik)
Route::get('/books-management/{book}',[BookController::class,'show']);        // ✅ diperbaiki
Route::put('/books-management/{book}',[BookController::class,'update']);      // dipindah agar konsisten satu prefix
Route::delete('/books-management/{book}',[BookController::class,'destroy']);  // dipindah agar konsisten satu prefix
Route::post('/books-management/{book}/publish',[BookController::class,'publish']); // dipindah agar konsisten satu prefix
```
Saya memilih memperluas prefix `/books-management` yang **sudah ada** (dipakai endpoint index admin sejak awal) ke path single-resource, bukan membuat prefix `/admin/` baru dari nol — ini paling konsisten dengan struktur API yang sudah ada dan meminimalkan perubahan (`POST /books` untuk store dan `GET /books` + `GET /books/{book}` publik tidak disentuh sama sekali).

### File yang diubah
- `routes/api.php` (backend) — 4 baris route dipindah
- `src/pages/admin/BookForm.jsx` (frontend) — 4 pemanggilan API (`GET`, `POST+_method=PUT` untuk update, `POST+_method=PUT` untuk archive, `DELETE`) diarahkan ke `/books-management/{id}`
- `src/pages/admin/InventoryList.jsx` (frontend) — 2 pemanggilan API (`publish`, `delete`) diarahkan ke `/books-management/{id}...`

### Dampak terhadap frontend
- **Sebelum**: buka halaman edit buku lewat klik di tabel → jalan (karena data buku dikirim lewat React Router state, tidak fetch ulang). Tapi refresh halaman edit atau buka URL edit langsung → 404 "Buku tidak tersedia" untuk buku berstatus draft/nonaktif (karena tanpa sadar memanggil `publicShow`).
- **Sesudah**: kedua jalur (klik dari tabel maupun direct URL/refresh) sama-sama berfungsi untuk buku status apa pun, karena endpoint admin sekarang benar-benar tercapai.
- Endpoint publik customer (`GET /books`, `GET /books/{id}` untuk katalog customer) **tidak berubah sama sekali** — sudah diverifikasi tidak ada perubahan behavior di sana.

## Final Check Fase 5 (setelah fix route)
| Item | Hasil |
|---|---|
| Dashboard | ✅ Aman, tidak tersentuh perubahan ini |
| Inventory List berfungsi | ✅ (`GET /books-management` tidak berubah) |
| Search | ✅ (client-side, tidak terpengaruh) |
| Filter kategori | ✅ |
| Filter status | ✅ |
| Filter level stok | ✅ |
| Tambah buku | ✅ (`POST /books` tidak berubah) |
| Edit buku (dari tabel) | ✅ |
| **Edit via direct URL/refresh** | ✅ **diperbaiki** — sebelumnya gagal untuk draft/nonaktif, sekarang berhasil |
| Upload cover | ✅ |
| Dropdown Category/Author/Publisher | ✅ (endpoint tidak berubah) |
| Publish | ✅ (path diperbarui ke `/books-management/{id}/publish`) |
| Archive/Delete | ✅ (path diperbarui) |
| Master Data Category/Author/Publisher | ✅ (endpoint tidak berubah) |
| Dummy business data | ✅ Tidak ada |
| Build frontend | ✅ Sukses |

**Fase 5 dinyatakan FINAL.**

## Status Fase 6 — Procurement & Stock (Selesai, menunggu review)

### Analisis backend (sebelum coding)
- Model: `Purchase` (kode_pembelian, distributor_id, tanggal, subtotal, diskon, pajak, grand_total, keterangan), `PurchaseDetail` (purchase_id, book_id, qty, harga_beli, subtotal), `Distributor` (nama, kode_distributor — **tanpa** kolom lain, tanpa soft-delete/status), `Book` (dipakai ulang dari Fase 5), `StockHistory` (book_id, user_id, type, qty, stok_sebelum, stok_sesudah, keterangan — **model & tabel ada, tapi TIDAK ADA route/controller yang meng-expose-nya sebagai API sama sekali**).
- `PurchaseController`: `index()` (tanpa pagination, tanpa search — `->get()` polos), `show()`, `store()` (transaksional: buat Purchase + PurchaseDetail per item, **stok buku langsung bertambah otomatis**, **dan StockHistory otomatis tercatat** — tapi tetap tak bisa dibaca lewat API). **Tidak ada update/delete/approval untuk Purchase.**
- `DistributorController`: CRUD lengkap, **satu-satunya yang mendukung search & pagination server-side** di antara master data.
- Tidak ada kolom `distributor_id` di tabel `books` — sesuai instruksi, **saya tidak menambahkannya**. Distributor murni jadi bagian dari transaksi Purchase, bukan atribut buku.

### File dibuat/diubah
Baru:
- `src/components/admin/DistributorModal.jsx` — form 2-field (kode + nama), search & pagination server-side asli
- `src/pages/admin/procurement/PurchaseList.jsx`
- `src/pages/admin/procurement/CreatePurchase.jsx`
- `src/pages/admin/procurement/PurchaseDetail.jsx`

Diubah:
- `src/App.jsx` — routing procurement
- `src/components/admin/AdminSidebar.jsx` — tambah link "Procurement", perbaiki active-state matching agar sub-route (mis. `/admin/books/new`, `/admin/purchases/123`) ikut ter-highlight

### Endpoint yang digunakan
- `GET /purchases` — daftar pembelian (semua data, tanpa pagination di backend)
- `POST /purchases` — buat pembelian baru (otomatis menambah stok buku)
- `GET /purchases/{id}` — detail pembelian
- `GET/POST/PUT/DELETE /distributors` — CRUD distributor (search & pagination asli)
- `GET /books-management` — dipakai ulang untuk memilih buku saat membuat pembelian

### Fitur yang berhasil
- **PurchaseList** (`/admin/purchases`) — 3 kartu statistik nyata (Total PO, Total Unit Dibeli, Total Value — semua dihitung dari data `/purchases` asli, tanpa badge persentase karena tidak ada data pembanding), filter distributor (client-side, real), search kode/distributor (client-side), tabel klik-untuk-detail, tombol buka modal Distributor
- **CreatePurchase** (`/admin/purchases/new`) — pilih distributor (dropdown asli), tanggal, tambah item buku (dropdown dari katalog asli, harga beli auto-terisi dari data buku tapi bisa diedit), qty, subtotal per item dihitung live, grand total live, submit ke `POST /purchases`
- **PurchaseDetail** (`/admin/purchases/:id`) — info distributor, tabel item, breakdown subtotal/diskon/pajak/grand total, tombol print, catatan bahwa stok otomatis bertambah
- **DistributorModal** — CRUD penuh dengan search server-side asli

### Route Frontend Baru
- `/admin/purchases` → PurchaseList
- `/admin/purchases/new` → CreatePurchase
- `/admin/purchases/:id` → PurchaseDetail
(Semua diberi akses role `admin` dan `kasir`, sesuai middleware backend `role:admin,kasir` pada grup route Purchase)

### Design-vs-Backend Adjustments
1. **Status Purchase Order** (Pending/Partial/Completed) di desain Stitch — **tidak ada di backend sama sekali**. `Purchase` tidak punya kolom status; `store()` langsung menambah stok penuh saat dibuat, tidak ada alur partial-receiving. Filter status "All/Pending/Partial/Completed" dan kolom "Expected Date" **dihilangkan**, tombol "Record Receipt" **dihilangkan**.
2. **Badge persentase perubahan** (+12%, -3%, "On track") di kartu statistik desain — **dihilangkan**, tidak ada data pembanding periode di backend.
3. **"Deliveries Today"** — **dihilangkan**, tidak ada field tanggal pengiriman/jadwal.
4. **Tombol Export** — **dihilangkan**, tidak ada endpoint export.
5. **Activity feed** ("New PO sent to...") di bagian bawah desain asli — **dihilangkan**, tidak ada activity-log API (konsisten dengan temuan yang sama di Fase 4).
6. **Halaman "Create Purchase Order"** — **tidak ada screen persis di desain Stitch** (kedua varian desain procurement yang ditemukan hanya berupa halaman list/monitoring). Saya bangun halaman baru memakai design system yang sudah mapan (kartu, Field-style input, warna, radius) agar tetap konsisten secara visual, bukan menyalin desain yang tidak ada.
7. **Stock History / Audit Trail** — **TIDAK DIBANGUN**. Model & tabel `StockHistory` ada dan otomatis terisi saat pembelian, tapi **tidak ada route/controller API sama sekali** untuk membacanya. Saya tidak mengarang endpoint baru (sesuai instruksi eksplisit). Riwayat stok-masuk secara tidak langsung tetap bisa dilihat lewat daftar Purchase, tapi ini bukan audit trail lengkap (tidak mencakup stok keluar dari penjualan/POS).
8. **Stock Control Analytics** (grafik analitik stok) — **TIDAK DIBANGUN** untuk alasan sama seperti di atas: tidak ada endpoint analitik stok time-series. Manajemen stok real-time tetap tersedia lewat **Inventory List** yang sudah dibangun di Fase 5 (kolom stok, filter level stok) — tidak saya duplikasi di sini.
9. **Distributor "nonaktifkan"** (soft-deactivate) — **tidak tersedia**, tabel `distributors` tidak punya kolom status/soft-delete, jadi hanya delete permanen (`DELETE /distributors/{id}`) yang saya sediakan.

## Status Fase 7 — Reports & Analytics (Selesai, menunggu review)

### BAGIAN 1 — Audit Backend

Pemetaan DATA → ENDPOINT → KEPERLUAN REPORT:

| Data | Endpoint | Filter server-side? | Keperluan Report |
|---|---|---|---|
| Sales | `GET /sales` | ✅ `search` (kode_transaksi/customer_name), `tanggal` (exact date), pagination 10/hal | Sales Report — tabel transaksi |
| Dashboard aggregates | `GET /dashboard` (role admin) | — (all-time, tidak ada range) | Sales Report — KPI (revenue, total transaksi, avg order value, total customer) |
| Purchases | `GET /purchases` | ❌ tidak ada, `->get()` polos, tidak dipaginasi | Purchase Report — KPI & breakdown per distributor (dihitung dari dataset penuh, akurat karena tidak dipotong pagination) |
| Books | `GET /books-management` | ❌ tidak ada, `->get()` polos | Inventory Summary — KPI status/stok/kategori/nilai inventori |
| Orders | `GET /orders-management` | ❌ tidak ada, dipaginasi 10/hal | **Tidak dipakai** untuk report baru — sudah tercakup di panel "Pesanan Perlu Persetujuan" (Fase 4) |
| Users/Customers | tidak ada endpoint list customer terpisah, hanya count via `/dashboard` | — | Dipakai sebagai satu KPI ("Total Customer") di Sales Report |
| StockHistory | **tidak ada route/controller sama sekali** | — | **Tidak bisa dipakai** — dikonfirmasi ulang sejak Fase 6 |
| Reports/Analytics khusus | **tidak ada endpoint report terpisah** di backend | — | Semua report Fase 7 disusun dari endpoint transaksional yang sudah ada, bukan endpoint report dedicated |

**Kesimpulan filter tanggal/periode**: backend hanya mendukung filter tanggal **exact-match tunggal** di `/sales` (`whereDate('tanggal', $request->tanggal)`), **tidak ada** range filter (dari-sampai), tidak ada grouping per hari/minggu/bulan/tahun. `/purchases` dan `/books-management` **tidak punya filter sama sekali** di backend.

### BAGIAN 2–6 — Report yang Dibangun

**A. Sales Report** (`/admin/reports`, tab "Sales Report")
- KPI: Total Revenue (Paid), Total Transaksi, Rata-rata Nilai Transaksi (dihitung: total_omzet ÷ total_penjualan — bukan endpoint terpisah, murni pembagian dari 2 angka backend asli), Total Customer — semua dari `GET /dashboard`, **all-time**, jelas diberi catatan "tidak ada data periode sebelumnya untuk dibandingkan"
- **Buku Terlaris** — dihitung on-demand (tombol "Hitung Buku Terlaris") dari SELURUH dataset `/sales` (looping semua halaman, seperti pola yang sudah dipakai di Fase 5 untuk kategori/penulis/penerbit), agregasi qty & revenue per buku dari `saleDetails` asli
- **Tabel transaksi** — `GET /sales` dengan search & filter tanggal **server-side asli**, pagination **server-side asli** (pakai `meta.current_page`/`last_page`/`total` dari response)

**B. Purchase Report** (tab "Purchase Report")
- KPI: Total PO, Total Unit Dibeli, Total Nilai Pembelian — dihitung dari SELURUH dataset `/purchases` (akurat 100%, karena endpoint ini memang tidak dipaginasi backend)
- Breakdown "Pembelian per Distributor" — agregasi client-side dari data yang sama
- **Tidak menduplikasi tabel Purchase List Fase 6** — cukup link "Lihat Daftar & Detail Pembelian Lengkap" ke `/admin/purchases` yang sudah lengkap dengan filter/search/detail

**C. Inventory Summary** (tab "Inventory Summary")
- KPI: Total Buku, Published, Stok Menipis, Stok Habis — dihitung dari `GET /books-management` (dataset penuh)
- Breakdown status buku (progress bar), estimasi nilai inventori (Σ stok × harga_beli — murni matematis dari data asli, bukan endpoint terpisah), buku per kategori
- **Tidak membangun Stock History/Audit Trail** — dikonfirmasi ulang sesuai keputusan Fase 6, tidak ada API-nya
- Link ke `/admin/books` (Fase 5) untuk kelola detail, bukan menduplikasi tabelnya

**D. Dashboard Analytics** — tidak membangun ulang; Admin Dashboard Fase 4 sudah menampilkan revenue/sales/inventory summary dari data real. Reports Hub ini melengkapi dengan detail per-kategori yang tidak ada di Dashboard (tabel transaksi lengkap, breakdown distributor/kategori), bukan duplikasi.

### File dibuat/diubah
Baru: `ReportsHub.jsx`, `reports/SalesReport.jsx`, `reports/PurchaseReport.jsx`, `reports/InventorySummary.jsx`
Diubah: `App.jsx` (routing), `AdminSidebar.jsx` (label "Analytics" → "Reports", target `/admin/reports`)

### Route Frontend
- `/admin/reports` → ReportsHub (kanonik)
- `/admin/analytics` → alias ke komponen yang sama (link lama tidak putus)

### Filter yang Digunakan
- Sales Report: search + tanggal → **server-side asli** (`GET /sales?search=...&tanggal=...`), pagination → **server-side asli**
- Purchase Report & Inventory Summary: **tidak ada filter** — dataset sudah penuh dari backend (`.get()` tanpa pagination), breakdown dihitung langsung di client dari data lengkap, bukan hasil filtering parsial
- Tidak ada filter yang "berpura-pura" server-side padahal client-side — semua didokumentasikan sesuai sumbernya di atas

### Design-vs-Backend Adjustments
1. **Toggle Daily/Weekly/Monthly/Yearly** dan **date-range picker** ("Oct 01 - Oct 31") di desain Sales Performance — **dihilangkan**. Backend hanya mendukung filter tanggal tunggal exact-match, tidak ada grouping periode.
2. **Badge "+12.4% vs last month"** di setiap KPI card — **dihilangkan** di semua report. Tidak ada data periode sebelumnya untuk dibandingkan.
3. **"Sales Volume by Day" chart** (grafik tren harian) — **dihilangkan**. Tidak ada endpoint time-series.
4. **Kolom "Trends" (sparkline per buku)** di tabel Sales Performance — **dihilangkan**, diganti kolom Revenue & Qty Terjual (data agregat asli, tanpa tren).
5. **Kolom "Actions" (Reorder)** di tabel Sales Performance — **dihilangkan**; tidak ada endpoint reorder/restock cepat.
6. **Tombol Export** (semua varian: PDF/Excel/CSV) — **tidak dibuat di seluruh Fase 7**, tidak ada mekanisme export di backend.
7. **Inventory Operational Reports** (desain Stitch terpisah untuk laporan operasional stok, termasuk elemen mirip stock-movement) — **tidak dibangun sebagai halaman terpisah**. Sudah tercakup oleh Inventory Summary yang saya bangun, memakai data nyata yang tersedia; elemen yang butuh riwayat pergerakan stok tetap tidak dibangun karena keterbatasan API yang sama seperti temuan Fase 6.
8. **Tab switcher (Sales/Purchase/Inventory)** — tidak ada padanan desain Stitch yang persis menyatukan 3 laporan ini dalam satu hub. Saya susun begini agar konsisten dengan sidebar ("Reports" — satu entry) dan menghindari duplikasi UI (Purchase List & Inventory List sudah lengkap di fase sebelumnya), bukan style baru — tetap memakai AdminSidebar/AdminNavbar/kartu/tabel yang sama persis dari fase-fase sebelumnya.

### Export yang Tersedia/Tidak Tersedia
**Tidak ada** export dalam bentuk apa pun (PDF/Excel/CSV/Print) di Fase 7 — kecuali "Print" pada Purchase Detail (`window.print()`) yang sudah ada sejak Fase 6, memakai fitur print browser native, bukan mekanisme export backend.

### Hasil Build
`npm run build` sukses tanpa error.

### Hasil API/Source Verification
Backend **tidak diubah** di Fase 7 (tidak ada perubahan `routes/api.php` atau controller). Verifikasi dilakukan dengan membaca ulang `SaleController.php`, `SaleResource.php`, `DashboardController.php`, `PurchaseController.php`, `BookController.php` langsung dari source untuk memastikan field & parameter yang dipakai frontend (search, tanggal, meta pagination, struktur items/total) benar-benar cocok. **Tidak ada instance Laravel live di environment saya**, jadi ini bukan bukti E2E sungguhan — hanya verifikasi source/kontrak API.

### Masalah yang Masih Tersisa
- Tidak ada masalah/bug baru ditemukan.
- Keterbatasan yang berulang dari fase sebelumnya (tidak ada endpoint activity log, stock history, export, date-range) tetap berlaku dan konsisten didokumentasikan.
- "Buku Terlaris" mengambil SELURUH data `/sales` (loop semua halaman) saat tombol ditekan — untuk toko dengan jumlah transaksi sangat besar ini bisa memakan waktu/permintaan lumayan banyak. Ini trade-off sadar (akurasi penuh vs jumlah request) karena backend tidak menyediakan endpoint agregasi per-buku.

### Rekomendasi Fase Berikutnya
**Settings** (Store Profile, Payment & Tax, Security & API, Users & Permissions termasuk halaman Role Selection yang ditunda dari Fase 1, System Settings) — fase terakhir yang tersisa dari rencana awal. Endpoint `GET/PUT /settings` dan CRUD `/users` sudah tersedia di backend.

## Status Fase 8 — Settings (Selesai, menunggu review)

### BAGIAN 1 — Audit Backend

| Settings UI | Endpoint | Controller | Database |
|---|---|---|---|
| Store Profile | `GET/PUT /settings` | `SettingController@index,update` | tabel `settings`: `nama_toko`, `logo`, `telepon`, `email`, `alamat` |
| Users & Permissions | `GET/POST/PUT/DELETE /users` | `UserController` (full CRUD) | tabel `users`: `name`, `email`, `password`, `role` (enum tersirat: admin/kasir/customer via validasi `in:admin,kasir,customer`) |
| Payment & Tax | **tidak ada** | — | tidak ada kolom terkait di tabel `settings` atau tabel lain |
| Security & API | **tidak ada** | — | tidak ada endpoint API-key/security config |
| System Settings / Activity Log | **model & tabel `ActivityLog` ada** (`user_id`, `action`, `table_name`, `record_id`, `description`), **tapi tidak ada satupun route/controller yang meng-expose-nya**, dan tidak ditemukan kode manapun yang menulis ke tabel ini (kemungkinan fitur belum selesai dibangun di backend) | — | — |

Middleware `role:admin` diperiksa langsung (`RoleMiddleware.php`) — **benar-benar menolak** request dengan `403 Forbidden` jika role tidak cocok, bukan hanya validasi kosmetik. Route Settings & Users sama-sama di bawah grup `role:admin`, jadi keduanya genuinely admin-only di sisi server, bukan hanya disembunyikan di frontend.

### BAGIAN 2 — Fitur

**A. Store Profile** — form nama_toko (wajib), email, telepon, alamat — persis field yang didukung `update()`. Logo ditampilkan read-only jika ada (bukan upload), karena `update()` di backend **tidak memproses field logo sama sekali** meskipun kolomnya ada di database dan di `$fillable` model — upload logo akan sia-sia (data terkirim tapi diabaikan controller), jadi saya tidak menyediakan form upload untuk itu.

**B. Payment & Tax** — **TIDAK DIBANGUN**. Tidak ada field atau endpoint apa pun terkait pembayaran/pajak di backend.

**C. Users & Permissions** — tabel user (search + filter role, client-side karena `index()` tidak baca query param), tambah user (nama/email/password/role), edit user (nama/email/role — tidak ada endpoint ubah password oleh admin), hapus user (hard delete, tombol dinonaktifkan untuk akun sendiri agar admin tidak mengunci diri sendiri).

**D. Role Selection** — **diselesaikan di sini**, bukan di alur registrasi publik (sesuai temuan sejak Fase 1: endpoint `/register` publik selalu memaksa role `customer`). Penentuan role kini dilakukan admin lewat form Add/Edit User di atas — 3 tombol pilihan role (Admin/Kasir/Customer) sesuai persis validasi backend `in:admin,kasir,customer`, tersimpan sungguhan lewat `POST/PUT /users`.

### File dibuat/diubah
Baru: `SettingsHub.jsx`, `settings/StoreProfile.jsx`, `settings/UsersPermissions.jsx`
Diubah: `App.jsx` (routing `/admin/settings` dari placeholder → SettingsHub)

### Route Frontend
- `/admin/settings` → SettingsHub (tab Store Profile & Users and Permissions)

### BAGIAN 4 — Security & Authorization Check
1. ✅ Endpoint `/settings` dan `/users` benar-benar dilindungi `role:admin` di server (diverifikasi baca `RoleMiddleware.php` langsung, bukan asumsi)
2. ✅ Frontend tidak "menyembunyikan tombol" sebagai satu-satunya proteksi — `ProtectedRoute` di frontend hanya untuk UX (redirect cepat), keamanan sesungguhnya ada di middleware backend
3. ✅ Tidak ada fungsi yang ditampilkan ke role yang sebenarnya tidak boleh mengaksesnya
4. ✅ Tidak ada credential/API-key di-hardcode di frontend (memang tidak ada fitur API-key sama sekali di backend)
5. ✅ `UserResource` sudah membatasi field yang diekspos (tidak ada password/remember_token bocor ke response — dicek `$hidden` di model & field di Resource)

## FULL PROJECT AUDIT

Saya baca ulang seluruh route frontend (`App.jsx`), seluruh pemanggilan `api.*()` di semua halaman, dan `routes/api.php` backend untuk verifikasi silang. Temuan:
- **Tidak ada duplicate route** di backend (dicek ulang lewat script grep+uniq, hasil kosong)
- **Tidak ada endpoint frontend yang salah path** — semua `api.get/post/put/delete` yang dipakai cocok dengan route yang benar-benar ada
- **Tidak ada dummy/TODO/lorem-ipsum** tersisa di source (dicek grep menyeluruh)
- **Ditemukan 1 gap responsive nyata**: `AdminSidebar` dan `KasirSidebar` memakai `fixed w-[280px]` tanpa mode collapse/hamburger untuk layar kecil — beda dengan `CustomerNavbar` yang sudah responsive (`hidden md:flex`, dst). Ini genuine gap, bukan sekadar dugaan — dicek langsung tidak ada class `md:hidden`/toggle di kedua sidebar tersebut.
- `/admin/orders` dan `/admin/sales` masih Placeholder berlabel "segera hadir" — bukan link mati, tapi juga bukan halaman dedicated. Fungsinya sudah tercakup di tempat lain: approve/reject pesanan ada di Admin Dashboard (Fase 4), data penjualan lengkap ada di Reports → Sales Report (Fase 7) dan Kasir → Transaction History (Fase 3). Tidak dibangun sebagai halaman admin terpisah karena akan menduplikasi fitur yang sudah ada, bukan karena backend tidak mendukung.


## Fase 9 — Final Polish, Responsive Fix & QA (Selesai — FASE TERAKHIR)

### 1. Responsive Fix
**File diubah**: `AdminSidebar.jsx`, `KasirSidebar.jsx`, `AdminNavbar.jsx`, `PosTerminal.jsx`, `BookForm.jsx`, `AdminDashboard.jsx`, `InventoryList.jsx`, `ReportsHub.jsx`, `SettingsHub.jsx`, `procurement/CreatePurchase.jsx`, `procurement/PurchaseDetail.jsx`, `procurement/PurchaseList.jsx`, `PaymentVerification.jsx`, `ReceiptPreview.jsx`, `TransactionHistory.jsx`.

**AdminSidebar & KasirSidebar**: pola sama persis di keduanya (tidak ada context/logic terpisah yang duplikatif secara konsep) — masing-masing punya:
- Tombol hamburger `fixed top-3 left-3 md:hidden` (state `open` lokal per komponen, tidak perlu context lintas-file)
- Backdrop `fixed inset-0 md:hidden` yang menutup sidebar saat diklik
- Panel sidebar: `-translate-x-full` (mobile, default tertutup) → `translate-x-0` saat dibuka → `md:translate-x-0` (selalu tampil di desktop, transform mobile tidak berlaku)
- Klik link navigasi otomatis menutup sidebar (`onClick={() => setOpen(false)}`)
- Tombol close (X) di header sidebar, mobile-only

**Behavior per breakpoint**:
- **Desktop (md ke atas, ≥768px)**: sidebar selalu terlihat, `translate-x-0` permanen, tampilan **tidak berubah sama sekali** dari Fase 4-8 — AdminNavbar tetap `left-[280px]`, semua `<main>` tetap `md:ml-[280px]`
- **Tablet (~768px, pas di breakpoint `md`)**: sudah masuk kondisi desktop (sidebar tetap terlihat), karena breakpoint `md` Tailwind = 768px — dipilih agar konsisten dengan breakpoint yang sudah dipakai di seluruh app sejak Fase 1 (CustomerNavbar dsb juga pakai `md:`)
- **Mobile (<768px)**: sidebar default tersembunyi, hamburger muncul, overlay gelap saat dibuka, konten (`ml-0`) tidak lagi terdorong 280px, tidak ada horizontal overflow

**AdminNavbar**: posisi `left-0 md:left-[280px]` (bukan permanen offset), search bar disembunyikan di layar sangat sempit (`hidden sm:block`) karena ruang terbatas setelah hamburger, avatar+nama tetap terlihat.

**PosTerminal** (kasir, punya split-view book-grid + cart panel yang paling rawan overflow): layout diubah dari `flex` horizontal permanen menjadi `flex-col lg:flex-row` — di bawah `lg` (1024px), grid buku dan panel keranjang **ditumpuk vertikal** alih-alih dipaksa berdampingan (sebelumnya panel keranjang `w-[400px]` fixed akan menyebabkan overflow horizontal di layar <700px). Header POS juga diberi `pl-16` mobile untuk ruang hamburger.

**3 halaman kasir tanpa top navbar** (PaymentVerification, ReceiptPreview, TransactionHistory): ditambah `pt-20` khusus mobile agar konten tidak tertutup tombol hamburger yang melayang di pojok kiri atas.

### 2. UI Consistency
Ditinjau ulang seluruh komponen reusable (`Button`, `Input`, `Card`, `Badge`, `Icon`) dan pola halaman (tabel, modal, form Field) — **tidak ditemukan style baru/menyimpang** yang perlu diperbaiki; Fase 9 murni menyentuh class responsive (`ml-`, `px-`, `pt-`), tidak mengubah warna/radius/shadow/tipografi di manapun. Satu perbaikan kecil dilakukan: padding horizontal admin (`px-margin-desktop` tetap tanpa `md:`) diseragamkan jadi `px-margin-mobile md:px-margin-desktop` di 8 halaman admin, konsisten dengan pola yang sudah dipakai halaman customer sejak Fase 2.

### 3. Routing
- Dicek ulang seluruh `path=` di `App.jsx` — **tidak ada duplikat** (verifikasi grep+uniq, hasil kosong)
- `/admin/reports` tetap canonical, `/admin/analytics` tetap alias berfungsi (tidak dihapus)
- `/admin/orders`, `/admin/sales`, `/forgot-password` tetap Placeholder dengan label jelas ("segera hadir" / nama fitur), bukan link putus
- Tidak ada route baru ditambahkan di Fase 9 (sesuai instruksi STOP feature development)

### 4. API Integration
Cross-check ulang seluruh endpoint yang pernah bermasalah/diperbaiki di fase-fase sebelumnya, dengan grep langsung ke source frontend dan dibandingkan ke `routes/api.php`:
- Cart update/remove → `/cart/update/{id}`, `/cart/remove/{id}` ✓ cocok
- Payment upload → `/payment/{id}/upload` ✓ cocok
- Admin Books → `/books-management`, `/books-management/{id}`, `/books-management/{id}/publish` ✓ cocok (hasil fix Fase 6)
- Purchase → `/purchases`, `/purchases/{id}` ✓ cocok
- Distributor → `/distributors`, `/distributors/{id}` ✓ cocok
- Reports → `/sales`, `/dashboard`, `/purchases`, `/books-management` (tidak ada endpoint report terpisah, sesuai audit Fase 7) ✓ cocok
- Settings → `/settings` ✓ cocok
- Users → `/users`, `/users/{id}` ✓ cocok
- **Tidak ada mismatch ditemukan.**

### 5. Authorization
Diverifikasi ulang `RoleMiddleware.php` — tetap benar-benar menolak (403) request dengan role tidak cocok, bukan hanya sembunyi tombol frontend.
- **Admin**: seluruh route admin (`role:admin`) tetap dapat diakses, tidak ada perubahan di Fase 9
- **Kasir**: `/kasir/pos`, `/kasir/transactions`, `/kasir/payments` tetap dapat diakses (`role:kasir` atau `role:admin,kasir` di backend, `ProtectedRoute roles={["kasir"]}`/`["kasir","admin"]` di frontend — dicek konsisten)
- **Customer**: `/browse`, `/books/:id`, `/cart`, `/checkout` dst tetap `roles={["customer"]}`, tidak tersentuh Fase 9
- Tidak ada role baru dibuat

### 6. Data Integrity
Grep ulang menyeluruh untuk `dummy`/`TODO`/`FIXME`/`lorem ipsum` di seluruh `src/` — **hasil kosong**. Tidak ada perubahan data/logic bisnis di Fase 9 (murni CSS/layout), jadi status data integrity sama seperti hasil audit Fase 8 (semua real, tidak ada yang dikarang).

### 7. Design-vs-Backend Audit
Ditinjau ulang daftar backend limitation dari audit Fase 8 — **tidak ada yang "diam-diam" dibangun** di Fase 9 (tidak ada endpoint baru, tidak ada halaman baru). Payment & Tax, Security & API, Activity Log API, Stock History API, Stock Analytics API, Export PDF/Excel, date-range filtering, `distributor_id` pada `books` — **semua masih dan tetap tidak dibangun**, tidak dicoba diakali dengan frontend palsu.

### 8. Responsive Final Check
*(Catatan metodologi: tidak ada browser/renderer visual di lingkungan saya — pemeriksaan ini adalah **verifikasi berbasis source/class Tailwind**, bukan screenshot hasil render sungguhan pada perangkat nyata.)*

| Area | Desktop (≥1440px) | Tablet (~768px) | Mobile (~375px) |
|---|---|---|---|
| Customer | ✅ sudah baik sejak Fase 2, tidak disentuh | ✅ `CustomerNavbar` sudah `hidden md:flex` sejak awal, tidak ada regresi dari perubahan Fase 9 | ✅ tidak berubah, tidak ada regresi |
| Admin | ✅ tampilan identik Fase 4-8 (sidebar permanen, `md:ml-[280px]`) | ✅ masuk kondisi "desktop" sidebar di breakpoint `md`(768px), tidak overlap konten | ✅ hamburger + overlay berfungsi, `ml-0`, padding responsive, tidak ada overflow horizontal by design (semua tabel sudah `overflow-x-auto` sejak fase awal) |
| Kasir | ✅ identik Fase 3, POS tetap split-view `lg:flex-row` | ✅ di bawah `lg`(1024px) POS menumpuk vertikal (grid lalu keranjang) — perubahan sengaja agar tidak overflow | ✅ sidebar sama seperti Admin (hamburger+overlay), POS stack vertikal, 3 halaman tanpa navbar diberi `pt-20` ekstra |

### 9. Build/Test
- **Build**: `npm run build` sukses tanpa error setelah seluruh perubahan responsive (bundle ~471KB JS, ~40KB CSS)
- **Lint/type-check**: tidak ada tool lint/TS terpasang di project ini (proyek JS murni, tanpa `eslint`/`tsc` dikonfigurasi) — tidak dijalankan karena memang tidak tersedia, bukan diskip
- **Route verification**: dijalankan (grep+uniq manual, karena `php artisan route:list` tidak bisa dijalankan — PHP tidak tersedia di sandbox saya) — hasil bersih, tidak ada duplikat di frontend maupun backend
- **API/source verification**: dijalankan dengan membaca ulang source controller & route langsung
- **E2E limitation**: **tidak ada instance Laravel live di environment saya** — dinyatakan eksplisit, seluruh verifikasi di atas adalah source-level, bukan hasil klik-sungguhan di browser pada backend yang jalan

### 10. Regression Check
Dicek ulang bahwa perubahan Fase 9 (murni class Tailwind responsive) **tidak mengubah**:
- Logic fetch/submit data di manapun (tidak ada `api.*()` call yang disentuh)
- Struktur komponen/hierarki JSX di luar wrapper hamburger+overlay
- Design tokens (warna/radius/shadow/font) — tidak ada yang diubah
- Route path (tidak ada yang ditambah/dihapus/diganti)

Build sukses mengonfirmasi tidak ada import/component yang rusak akibat perubahan ini.

### 9. Remaining Issues (update dari Fase 8)

**Critical**: tidak ada.

**Medium**: tidak ada lagi — gap responsive sidebar (Medium di Fase 8) **sudah diperbaiki** di Fase 9.

**Low**: `/admin/orders` & `/admin/sales` tetap placeholder (fungsinya sudah tercakup di Dashboard/Reports/Transaction History, lihat Fase 8) — tidak diubah di Fase 9 sesuai instruksi stop-feature-development.

**Backend Limitation** (tidak berubah dari Fase 7-8): Payment & Tax settings, Security & API settings, Activity Log API, Stock History/Analytics API, Export (PDF/Excel), date-range/period filtering, `distributor_id` pada `books`.

### 10. Final Status

**READY FOR FINAL TEST**

Tidak ada Critical issue. Tidak ada regresi ditemukan (build sukses, route bersih, endpoint cocok, data integrity terjaga). Gap Medium satu-satunya dari Full Project Audit (sidebar admin/kasir tidak responsive) sudah diperbaiki tuntas di Fase 9 tanpa mengubah visual desktop maupun menyentuh backend. Yang tersisa hanyalah keterbatasan backend yang sudah didokumentasikan konsisten sejak Fase 6-8 dan bukan bug — project siap untuk pengujian akhir sungguhan di lingkungan dengan Laravel live instance.

## HOTFIX — Cart Bug (setelah Fase 9)

### Root Cause

Audit menyeluruh dari `routes/api.php` → `CartController` → `Cart`/`CartDetail` model → response → frontend state menunjukkan **struktur data & endpoint cart sudah benar** (dikonfirmasi silang dengan `CheckoutController` yang memakai pola query identik dan sudah terbukti berfungsi sejak Fase 2). Tidak ditemukan endpoint salah, method salah, atau response-shape mismatch pada flow cart.

Root cause sesungguhnya ada di **penanganan error yang hilang di frontend**:

`BookCard.jsx` (komponen "Add to Cart" yang dipakai di grid Browse Books — jalur paling umum customer menambah item) memanggil `addToCart(book.id, 1)` **tanpa `await` dan tanpa `try/catch`**. Kalau `POST /cart/add` gagal karena alasan apa pun (validasi stok/status buku, hiccup jaringan, dll), promise itu reject secara diam-diam — tidak ada pesan error, tombol tidak menunjukkan status gagal, dan customer mengira item sudah masuk. Begitu mereka membuka halaman Cart, cart memang benar-benar kosong di database (karena `POST /cart/add` betul-betul gagal), sehingga backend correctly me-return `data: []` dan frontend correctly menampilkan "Keranjang kamu masih kosong" — **bukan bug tampilan, tapi symptom dari add-to-cart yang gagal tanpa pemberitahuan.**

Pola yang sama (bare `try { } finally { }` tanpa `catch`) juga ditemukan di `BookDetail.jsx` — errornya tidak sampai ditampilkan ke user (meski di sana setidaknya tidak menyebabkan navigasi ke Cart yang salah, karena exception yang tidak tertangkap menghentikan eksekusi sebelum baris `navigate("/cart")`).

Selama audit ini juga ditemukan **bug keamanan IDOR** (Insecure Direct Object Reference) yang nyata di backend: `CartController::update()` dan `remove()` memakai `CartDetail::findOrFail($id)` **tanpa memverifikasi item itu benar milik cart user yang sedang login** — secara teori customer A bisa mengubah/menghapus isi cart customer B kalau tahu/menebak ID `cart_details`. Ini tidak menyebabkan gejala "cart kosong" yang dilaporkan, tapi termasuk dalam cakupan audit ("Cart update", "Cart remove" diminta diperiksa ulang), jadi tetap diperbaiki.

### File yang Diubah

**Frontend:**
- `src/components/customer/BookCard.jsx` — tombol Add to Cart sekarang `async`, di-`await`, ada `try/catch` dengan pesan error ditampilkan di kartu buku, tombol nonaktif+berubah label ("Menambah...") selagi proses berjalan
- `src/pages/customer/BookDetail.jsx` — ditambah `catch` (sebelumnya bare `try/finally`), pesan error ditampilkan di atas tombol Add to Cart
- `src/context/CartContext.jsx` — `updateQty`/`removeItem` sekarang `catch` error (log ke console, tidak lagi jadi unhandled promise rejection karena caller di `Cart.jsx` juga tidak `await`/`catch`) dan **selalu** `refresh()` di `finally` agar UI tetap sinkron dengan state backend yang sebenarnya walau request gagal

**Backend:**
- `app/Http/Controllers/Api/CartController.php` — `update()` dan `remove()` sekarang query lewat `CartDetail::whereHas('cart', fn($q) => $q->where('user_id', $user->id))->find($id)`, return `404 "Item keranjang tidak ditemukan"` kalau item tidak ada atau bukan milik user tsb. `index()` dan `add()` **tidak diubah** (sudah benar).

### Endpoint Terkait
`POST /cart/add`, `PUT /cart/update/{id}`, `DELETE /cart/remove/{id}`, `GET /cart` — path tidak berubah, hanya isi method `update()`/`remove()` di controller.

### Temuan Tambahan (didokumentasikan, TIDAK diubah)
Tabel `carts` **tidak punya unique constraint** pada kolom `user_id`. `Cart::firstOrCreate(['user_id'=>...])` di `add()` aman untuk request sekuensial, tapi secara teori rentan race-condition kalau ada dua request `POST /cart/add` yang benar-benar bersamaan dari user yang sama (bisa membuat 2 baris cart terpisah). Saya **tidak membuat migration baru** untuk ini karena: (1) ini bukan penyebab bug yang dilaporkan, (2) menambah unique constraint butuh migration terpisah yang perlu divalidasi dulu terhadap data production yang mungkin sudah ada (kalau sudah ada duplikat, migration akan gagal), (3) tidak ada instance Laravel live di environment saya untuk menguji migration ini dengan aman. **Rekomendasi**: tambahkan `$table->unique('user_id')` di migration `carts` melalui migration baru saat ada kesempatan uji di lingkungan staging.

### Hasil Test
- **Build frontend**: sukses tanpa error
- **Sintaks PHP**: diperiksa manual (brace seimbang, struktur method valid) — **tidak bisa dijalankan `php artisan` / linter PHP sungguhan** karena PHP tidak tersedia di sandbox saya
- **Route re-check**: 4 route cart (`GET /cart`, `POST /cart/add`, `PUT /cart/update/{id}`, `DELETE /cart/remove/{id}`) dikonfirmasi **tidak berubah path/method-nya**, tidak ada duplikat route baru
- **E2E sungguhan (klik nyata di browser terhubung ke Laravel+MySQL live)**: **TIDAK DILAKUKAN** — tidak ada instance Laravel live di environment saya. Root cause & fix di atas adalah hasil audit source-code menyeluruh dan penalaran dari perilaku kode, bukan hasil observasi langsung bug di browser. Rekomendasi kuat: **verifikasi manual sekali lagi** di lingkungan nyata dengan langkah reproduce persis seperti yang diminta (Login → Browse → Add to Cart via tombol di card → buka Cart) untuk memastikan fix ini benar-benar menutup kasus yang dilaporkan.

### Auto-Relogin
**PASS — bukan bug**, sesuai konfirmasi. Tidak disentuh sama sekali di hotfix ini.

## HOTFIX #2 — Cart Bug (Real Root Cause) + Pagination Audit

### A. Cart Bug — Root Cause Sesungguhnya

Bukti Postman yang diberikan (`GET /cart` mengembalikan `cart_details` dengan **underscore**, bukan `cartDetails` camelCase) membongkar kesalahan asli: **field-name mismatch murni di frontend**, bukan silent-failure seperti dugaan hotfix sebelumnya.

**Penjelasan teknis**: Eloquent Laravel punya `public static $snakeAttributes = true` secara default — artinya ketika model mentah (bukan lewat API Resource) di-serialize ke JSON, nama relasi otomatis di-*snake_case*-kan. Jadi method relasi `cartDetails()` di model `Cart` **selalu keluar sebagai `cart_details` di JSON**, bukan `cartDetails`. Kode saya sebelumnya salah asumsi ini tetap camelCase.

`CartContext.jsx` (dan 2 tempat lain dengan pola sama) membaca `cart.cartDetails` — selalu `undefined` → `items` selalu `[]` → **Cart selalu tampil kosong meskipun data di database benar**, persis seperti yang Anda buktikan lewat Postman.

**Bug yang sama ditemukan & diperbaiki di 2 tempat lain** (pola identik: model mentah dengan relasi multi-kata):
1. `OrderConfirmed.jsx` — `order.orderDetails` → harus `order.order_details` (dari `POST /checkout`, model `Order` mentah)
2. `ReceiptPreview.jsx` — `sale.saleDetails` → harus `sale.sale_details` (dari `POST /pos/transaction`, model `Sale` mentah)

Endpoint yang memakai API Resource kustom (`SaleResource`, `OrderResource`, `PurchaseResource`, dst — dipakai di `GET /sales/{id}`, `GET /orders/{id}`, dll) **tidak terkena bug ini** karena Resource mendefinisikan key JSON secara eksplisit (`items`, bukan nama relasi mentah), bukan hasil auto-serialize Eloquent.

### Cart Files Changed
- `src/context/CartContext.jsx` — `cart?.cartDetails` → `cart?.cart_details` (**fix inti**)
- `src/pages/customer/OrderConfirmed.jsx` — `order.orderDetails` → `order.order_details`
- `src/pages/kasir/ReceiptPreview.jsx` — normalisasi `sale_details`→`saleDetails` diperbaiki untuk kedua jalur data (fetch by ID via `GET /sales/{id}`, dan hasil langsung `POST /pos/transaction`)

Catatan: fix Bagian A dari hotfix sebelumnya (error handling di `BookCard.jsx`/`BookDetail.jsx`, dan fix IDOR di `CartController::update/remove`) **tetap dipertahankan** — keduanya perbaikan yang valid secara independen (defense-in-depth dan security), meski bukan penyebab utama gejala yang dilaporkan kali ini.

**Backend TIDAK diubah untuk bug Cart ini** — sesuai instruksi, karena Postman sudah membuktikan backend benar.

---

### B. Audit & Implementasi Pagination

**Metodologi**: cek `index()` tiap controller list — apakah pakai `get()`/`all()` (tidak dipaginasi) atau `paginate()`.

| Endpoint | Sebelum | Sesudah | Keputusan |
|---|---|---|---|
| `/books-management` | `->get()` | `->paginate(10)` + filter `search`/`category_id`/`status`/`stock_level` | **Dipaginasi** — katalog buku toko buku realistis bisa mencapai ratusan/ribuan judul |
| `/sales` | `->paginate(10)` (sudah ada sejak Fase 7) | tidak berubah | Sudah benar sebelumnya |
| `/purchases` | `->get()` | `->paginate(10)` + filter `search`/`distributor_id` | **Dipaginasi** — riwayat pembelian bertambah terus seiring waktu |
| `/orders-management` | `->paginate(10)` (sudah ada sejak Fase 4) | tidak berubah | Sudah benar sebelumnya |
| `/users` | `->get()` | `->paginate(10)` + filter `search`/`role` | **Dipaginasi** — akun customer berpotensi terus bertambah |
| `/categories`, `/authors`, `/publishers`, `/distributors` | `->paginate(10)` (sudah ada sejak Fase 5/6) | tidak berubah | Sudah benar sebelumnya |

**Kenapa saya sekaligus tambah parameter filter (`search`, `category_id`, dll), bukan cuma `paginate()` polos?** Karena `InventoryList`, `PurchaseList`, dan `UsersPermissions` sudah punya UI search/filter yang sebelumnya bekerja secara client-side dari dataset penuh. Kalau saya hanya menambah pagination tanpa filter server-side, search itu jadi salah (hanya mencari di 10 data pada halaman yang sedang tampil) — jadi menambah parameter filter ke method `index()` yang SAMA (bukan endpoint baru) adalah bagian yang diperlukan agar pagination tidak merusak fitur yang sudah ada, sesuai instruksi "Pertahankan filter/search yang sudah ada."

### Backend Files Changed
- `app/Http/Controllers/Api/BookController.php` — `index()`: tambah `paginate(10)` + filter `search`/`category_id`/`status`/`stock_level`
- `app/Http/Controllers/Api/PurchaseController.php` — `index()`: tambah `paginate(10)` + filter `search`/`distributor_id`
- `app/Http/Controllers/Api/UserController.php` — `index()`: tambah `paginate(10)` + filter `search`/`role`
- **Tidak ada migration baru, tidak ada perubahan struktur database, tidak ada endpoint lama yang dihapus.**

### Perubahan API Response/Contract

**Sebelum** (`BookResource::collection($books)` dari `Collection` biasa):
```json
{ "data": [ {...}, {...}, ... semua buku ... ] }
```

**Sesudah** (`BookResource::collection($books)` dari `LengthAwarePaginator`):
```json
{
  "data": [ {...10 buku...} ],
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." },
  "meta": { "current_page": 1, "last_page": 5, "per_page": 10, "total": 42, ... }
}
```
Pola yang sama persis untuk `/purchases` dan `/users`. `res.data.data` **tetap array** (bukan lagi array SEMUA data, hanya 10 per halaman) — ini yang membuat sebagian consumer FE lama perlu disesuaikan.

### Pemetaan Consumer FE (API Contract Mapping)

| Endpoint | Consumer FE | Kebutuhan | Solusi |
|---|---|---|---|
| `/books-management` | `InventoryList.jsx` | Browsable table | ✅ Real pagination UI (Prev/Next) + filter server-side |
| `/books-management` | `AdminDashboard.jsx` (panel stok menipis) | Beberapa item saja | ✅ Pakai filter `stock_level=low` langsung, ambil halaman 1 |
| `/books-management` | `CreatePurchase.jsx` (dropdown pilih buku) | **Dataset lengkap** (untuk dicari) | ✅ `fetchAllPages()` — loop semua halaman |
| `/books-management` | `InventorySummary.jsx` (Reports, agregat) | **Dataset lengkap** (untuk hitung total) | ✅ `fetchAllPages()` |
| `/books-management/{id}` | `BookForm.jsx` | Single record | Tidak terdampak (bukan list) |
| `/purchases` | `PurchaseList.jsx` (tabel) | Browsable table | ✅ Real pagination UI |
| `/purchases` | `PurchaseList.jsx` (3 kartu KPI) | **Dataset lengkap** | ✅ `fetchAllPages()` terpisah dari tabel |
| `/purchases` | `PurchaseReport.jsx` | **Dataset lengkap** (agregat per-distributor) | ✅ `fetchAllPages()` |
| `/users` | `UsersPermissions.jsx` | Browsable table | ✅ Real pagination UI + filter server-side |

Ditemukan tidak ada consumer lain di luar tabel di atas (dicek lewat grep menyeluruh terhadap ketiga endpoint di seluruh `src/`).

### Frontend Files Changed
Baru:
- `src/lib/fetchAllPages.js` — helper reusable untuk consumer yang genuinely butuh dataset lengkap (loop semua halaman)
- `src/components/ui/Pagination.jsx` — komponen Prev/Next/halaman-saat-ini/total reusable, dipakai 3 halaman baru

Diubah:
- `src/pages/admin/InventoryList.jsx` — full rewrite: pagination server-side asli + filter server-side
- `src/pages/admin/procurement/PurchaseList.jsx` — full rewrite: tabel dipaginasi asli, KPI tetap akurat via `fetchAllPages` terpisah
- `src/pages/admin/settings/UsersPermissions.jsx` — pagination server-side asli + filter server-side
- `src/pages/admin/AdminDashboard.jsx` — panel stok menipis pakai filter `stock_level=low` langsung (lebih efisien, bukan fetch semua lalu filter client-side)
- `src/pages/admin/procurement/CreatePurchase.jsx` — dropdown buku pakai `fetchAllPages`
- `src/pages/admin/reports/InventorySummary.jsx` — agregat pakai `fetchAllPages`
- `src/pages/admin/reports/PurchaseReport.jsx` — agregat pakai `fetchAllPages`

### Pagination UI yang Ditambahkan
Komponen `Pagination.jsx` (Prev/Next + "Halaman X dari Y (Z data)") ditambahkan di **3 halaman**: Inventory List, Purchase List (tabel bawah), Users & Permissions. Desain mengikuti gaya tombol/border yang sudah ada di sistem desain (rounded, border `outline-variant`), **tidak ada redesign**. Halaman lain (Sales Report, Transaction History) **sudah punya pagination sejak Fase 7/3** — tidak disentuh.

### Regression yang Diverifikasi
1. **Build**: sukses tanpa error
2. **Cross-check seluruh pemanggilan** `/books-management`, `/purchases`, `/users` di codebase (grep menyeluruh) — dikonfirmasi **9 titik pemanggilan** semuanya sudah disesuaikan dengan benar (baik yang butuh pagination asli maupun yang butuh dataset lengkap)
3. **Dashboard**: panel stok menipis tetap menampilkan data benar (memakai filter baru, bukan fetch-semua-lalu-filter)
4. **Inventory**: tabel + search/filter + tombol publish/edit/delete tetap berfungsi, sekarang dengan pagination asli
5. **Reports**: `InventorySummary` dan `PurchaseReport` tetap menghitung dari dataset LENGKAP (bukan cuma 10 data pertama) via `fetchAllPages`
6. **Procurement**: `PurchaseList` (tabel+KPI) dan `CreatePurchase` (dropdown buku) tetap benar
7. **Transaction History**: tidak disentuh sama sekali (endpoint `/sales` sudah dipaginasi sejak awal, tidak berubah)
8. **Cart**: struktur response **tidak diubah jadi paginated** — tetap object tunggal `{id, user_id, cart_details}`, sesuai instruksi eksplisit untuk tidak memaginasi Cart
9. **Route check**: tidak ada duplikat, tidak ada route yang dihapus (dikonfirmasi ulang lewat grep)

### Build Result
`npm run build` — **sukses**, tanpa error, tanpa warning yang relevan.

### Remaining Issues
- **E2E sungguhan (Postman/browser terhubung ke Laravel+MySQL live untuk skenario pagination & filter baru) belum dijalankan oleh saya** — tidak ada instance Laravel live di environment saya. Semua di atas adalah hasil audit source-code + penalaran dari bukti Postman yang Anda berikan untuk bug Cart, dan implementasi berdasarkan pola yang sudah terbukti bekerja (paginate() sudah dipakai sukses di 6 endpoint lain sejak fase-fase sebelumnya). **Sangat direkomendasikan**: uji ulang persis skenario yang Anda lakukan di Postman (`GET /cart` dengan token customer yang sudah ada isinya) langsung di browser pada halaman Cart untuk konfirmasi final, plus uji search/filter/Prev/Next di 3 halaman yang baru dipaginasi.

## HOTFIX #3 — Checkout 500 + Payment Flow (Transfer & Tunai)

### 1. Root Cause 500 Checkout
Kolom `payments.jumlah_bayar` adalah `decimal(15,2)` **NOT NULL tanpa default** di migration (`create_payments_table`). `CheckoutController::checkout()` membuat `Payment::create()` **tanpa menyertakan field itu sama sekali** → MySQL menolak insert → `SQLSTATE[HY000]: 1364` → 500. Bahkan seandainya field itu disertakan di array, sebelumnya **tidak ada di `$fillable`** model `Payment`, jadi tetap akan didiamkan oleh mass-assignment protection Eloquent. Root cause murni backend, bukan payload dari frontend.

Selama audit ini juga ditemukan **bug identik** yang belum sempat memicu laporan tapi pasti akan crash dengan cara yang sama: `PosController::store()` (transaksi tunai kasir) juga membuat `Payment::create()` tanpa `jumlah_bayar`. Diperbaiki sekalian karena satu root cause yang sama persis, di file yang sama-sama diaudit ("Audit Payment Flow Existing").

Ditemukan juga **mismatch nama kolom** yang independen dari bug 500 ini: kode menulis `'verifier_id'` saat verifikasi/pembayaran tunai, padahal kolom sungguhannya di migration adalah `verified_by`. Karena `verifier_id` tidak ada di `$fillable`, field ini selama ini **diam-diam gagal tersimpan** — kasir yang memverifikasi pembayaran tidak pernah benar-benar tercatat di database. Diperbaiki sekaligus karena bagian dari flow yang sama.

Dan: `PaymentResource` mengakses `$this->metode` (field yang tidak ada di kolom manapun — kolom sebenarnya `metode_pembayaran`), jadi field itu selalu tampil `null` di response API manapun yang memakai `PaymentResource`. Diperbaiki + ditambahkan `jumlah_bayar` yang sebelumnya tidak diekspos sama sekali.

### 2. File Backend yang Diubah
- `app/Models/Payment.php` — `$fillable`: tambah `jumlah_bayar`, ganti `verifier_id` → `verified_by`
- `app/Http/Controllers/Api/CheckoutController.php` — validasi `metode_pembayaran` sekarang menerima `transfer,tunai` (sebelumnya cuma `transfer`); `Payment::create()` sekarang menyertakan `jumlah_bayar` = `$order->grand_total`
- `app/Http/Controllers/Api/PaymentController.php` — `verify()`: `verifier_id` → `verified_by`
- `app/Http/Controllers/Api/PosController.php` — `Payment::create()` transaksi tunai POS: tambah `jumlah_bayar` = `$sale->grand_total`, `verifier_id` → `verified_by`
- `app/Http/Resources/PaymentResource.php` — `metode` sekarang membaca `metode_pembayaran` (bukan field yang tidak ada), tambah field `jumlah_bayar`

### 3. File Frontend yang Diubah
- `src/pages/customer/Checkout.jsx` — UI pemilihan metode pembayaran nyata: **Bank Transfer** vs **Tunai** (dua kartu bisa diklik, bukan teks statis "satu-satunya metode"), state `metodePembayaran` dikirim apa adanya ke `POST /checkout`
- `src/pages/customer/OrderConfirmed.jsx` — alur bercabang berdasarkan `order.payment.metode_pembayaran`: Transfer tetap tampilkan info rekening + widget upload bukti (seperti sebelumnya); **Tunai tidak lagi menampilkan widget upload** (memang tidak relevan), diganti pesan "tunjukkan kode order ke kasir"

### 4. Perubahan Database/Migration
**Tidak ada.** Tidak ada migration baru, tidak ada kolom ditambah/diubah/dihapus. Semua fix murni di level kode PHP (Model `$fillable`, Controller, Resource) yang menyesuaikan diri ke struktur database yang **sudah ada sejak awal** — sesuai instruksi "jangan mengubah database kalau tidak diperlukan". Nilai `jumlah_bayar` diisi dengan `grand_total` dari order/sale terkait — representasi paling masuk akal untuk "jumlah yang harus/sedang dibayarkan" di baris payment tersebut, konsisten baik untuk transfer (nominal yang perlu ditransfer) maupun tunai (nominal yang kasir konfirmasi).

### 5. Flow Transfer (Setelah Fix)
```
Customer checkout (metode_pembayaran=transfer)
  → Order dibuat (status: waiting_confirmation)
  → Payment dibuat (metode_pembayaran=transfer, jumlah_bayar=grand_total, status=pending)
  → Customer diarahkan ke halaman Order Confirmed
  → Tampil info rekening + form upload bukti transfer
  → Customer upload via POST /payment/{id}/upload (endpoint sudah ada sejak Fase 2, tidak diubah)
  → Order status berubah jadi waiting_confirmation (sudah begitu sejak awal)
  → Kasir buka Payment Verification, lihat bukti, verifikasi via PUT /payment/{id}/verify
  → status verified → Order status jadi 'paid' (logic existing, tidak diubah)
```

### 6. Flow Tunai (Setelah Fix — BARU, sebelumnya tidak bisa dipilih sama sekali)
```
Customer checkout (metode_pembayaran=tunai)
  → Order dibuat (status: waiting_confirmation)
  → Payment dibuat (metode_pembayaran=tunai, jumlah_bayar=grand_total, status=pending)
  → Customer diarahkan ke halaman Order Confirmed
  → TIDAK ada widget upload bukti (tidak relevan untuk tunai)
  → Tampil pesan: tunjukkan kode order ke kasir
  → Kasir buka Payment Verification (endpoint sama: GET /payment/pending — sudah otomatis
    menampilkan SEMUA metode pending, transfer maupun tunai, tanpa perlu endpoint baru)
  → Kasir verifikasi via PUT /payment/{id}/verify (endpoint sama persis dengan transfer)
  → status verified → Order status jadi 'paid'
```
**Tidak ada endpoint baru dibuat untuk mendukung tunai** — `GET /payment/pending` dan `PUT /payment/{id}/verify` sudah generik terhadap `metode_pembayaran` sejak awal (tidak pernah memfilter berdasarkan metode), jadi kasir otomatis bisa menangani kedua metode dari satu halaman Payment Verification yang sudah ada sejak Fase 3.

### 7. Endpoint yang Digunakan (tidak ada yang baru)
`POST /checkout`, `POST /payment/{id}/upload`, `GET /payment/pending`, `PUT /payment/{id}/verify`, `POST /pos/transaction` — semuanya sudah ada sejak fase-fase sebelumnya, hanya isi controller/model-nya yang diperbaiki.

### 8. Build Result
`npm run build` — **sukses**, tanpa error.

### 9. Route/API Verification
- Tidak ada perubahan path di `routes/api.php` sama sekali untuk hotfix ini (dicek: `checkout`, `payment/*`, `pos/transaction` semua persis sama seperti sebelumnya)
- Tidak ada duplikat route (grep+uniq, hasil kosong)
- Sintaks PHP diperiksa manual (brace/bracket balance) di seluruh 5 file backend yang diubah — seimbang
- Cross-check frontend: `Checkout.jsx` mengirim `metode_pembayaran` dinamis (bukan hardcode `"transfer"` lagi), `OrderConfirmed.jsx` membaca `order.payment.metode_pembayaran` dari response raw `Order` model (bukan lewat Resource, jadi field mentahnya memang `metode_pembayaran` — dikonfirmasi konsisten dengan cara `CheckoutController` melakukan `$order->load('orderDetails.book','payment')`)

### 10. Remaining Issues
- **E2E sungguhan belum dijalankan** — tidak ada instance Laravel live di environment saya. Root cause 500 diidentifikasi murni dari pembacaan migration vs kode insert (bukti sekuat mungkin dari source: kolom NOT NULL tanpa default + field yang hilang total dari `create()`), bukan dari observasi langsung. **Sangat direkomendasikan**: uji checkout dengan kedua metode (transfer & tunai) di lingkungan nyata, lalu uji alur verifikasi kasir untuk keduanya, untuk konfirmasi final bahwa error 500 benar-benar hilang dan `verified_by` sekarang benar-benar tersimpan.
- Bug `verifier_id`/`metode` yang ditemukan bukan penyebab crash 500, tapi silent-fail (data tidak tersimpan / selalu null) — sudah diperbaiki sekaligus karena satu file/flow yang sama, didokumentasikan terpisah agar jelas mana yang benar-benar jadi biang error 500 vs mana yang perbaikan tambahan dari audit.

### 11. File Backend Lengkap yang Perlu Ditimpa (Hotfix #3)
- `app/Models/Payment.php`
- `app/Http/Controllers/Api/CheckoutController.php`
- `app/Http/Controllers/Api/PaymentController.php`
- `app/Http/Controllers/Api/PosController.php`
- `app/Http/Resources/PaymentResource.php`

(Ditambah 5 file dari hotfix-hotfix sebelumnya yang masih berlaku: `routes/api.php`, `app/Http/Controllers/Api/CartController.php`, `app/Http/Controllers/Api/BookController.php`, `app/Http/Controllers/Api/PurchaseController.php`, `app/Http/Controllers/Api/UserController.php` — total **10 file backend** yang perlu ditimpa dari awal proyek sampai sekarang.)

## HOTFIX #4 — Finalisasi Payment Flow (Transfer + Tunai + POS + Verification)

### 1. Root Cause Bug yang Ditemukan

**A. Order status enum salah dipakai sejak Fase 2 (BARU DITEMUKAN, paling krusial)**
Tabel `orders` punya **2 migration** untuk kolom `status`: migration pertama membuat enum 4 nilai (`pending,approved,rejected,completed`), migration kedua (`update_status_orders_table`, berjalan setelahnya) **mengubahnya jadi 6 nilai**: `pending_payment, waiting_confirmation, paid, processing, completed, cancelled`. Saya sebelumnya hanya mengaudit migration pertama dan melewatkan migration kedua — akibatnya seluruh kode (Checkout, Order status map di frontend) memakai asumsi salah:
- `CheckoutController` men-set order baru langsung ke `'waiting_confirmation'`, padahal secara semantik order yang BARU DIBUAT (belum ada pembayaran/bukti sama sekali) seharusnya `'pending_payment'` — `'waiting_confirmation'` baru tepat SETELAH customer upload bukti (yang memang sudah benar dilakukan `uploadProof()`, tapi jadi tidak berarti apa-apa karena status awalnya sudah salah duluan).

**B. `AdminOrderController::approve()`/`reject()` benar-benar rusak (BARU DITEMUKAN)**
`approve()` mengecek `$order->status !== 'pending'` — tapi `'pending'` **bukan nilai enum yang valid sama sekali** di skema final. Artinya kondisi ini SELALU true → endpoint **selalu** mengembalikan 400 "Order sudah diproses", tidak pernah bisa sukses. `reject()` menulis `status=>'rejected'` — juga bukan nilai enum valid, akan membuat DB error kalau saja bisa tercapai. Ini adalah sisa kode dari desain awal (4-status enum) yang tidak pernah disesuaikan setelah migration kedua mengubah enum. **Panel "Pesanan Perlu Persetujuan" yang saya bangun di Fase 4 sudah tidak pernah berfungsi sejak awal** — tombol Approve/Reject di sana selalu gagal, dan saya baru sadar sekarang setelah audit migration menyeluruh. Kalaupun diperbaiki string status-nya, controller ini akan **mengurangi stok BUKU KEDUA KALINYA** (checkout sudah mengurangi stok saat order dibuat) — jadi bukan sekadar salah nama status, tapi juga salah secara desain dan tidak sesuai flow bisnis final yang Anda jelaskan (approval pembayaran online seharusnya lewat Payment Verification, bukan lewat "approve order" terpisah).

**C. `payments.jumlah_bayar` diisi nilai yang menyesatkan (dari hotfix sebelumnya)**
Hotfix #3 mengisi `jumlah_bayar = grand_total` saat checkout untuk mengatasi error 500 — tapi ini menyiratkan "sudah dibayar lunas" padahal pembayaran belum terjadi sama sekali (baik transfer maupun tunai). Diperbaiki jadi `0` saat checkout (kolom tetap terisi, tapi nilainya jujur: belum dibayar), baru diisi nilai sebenarnya saat kasir mengonfirmasi.

**D. `PaymentController::verify()` tidak mendukung "kasir input uang tunai + hitung kembalian"**
Sebelumnya cuma menerima `status`, tidak ada tempat untuk kasir memasukkan nominal uang yang diterima untuk pembayaran tunai — padahal ini kebutuhan bisnis eksplisit.

**E. 3 Resource (`PaymentResource`, `OrderResource`, `SaleResource`) membaca field `metode` yang tidak eksis**
Kolom sebenarnya adalah `metode_pembayaran`. Sebelumnya field ini SELALU tampil `null` di setiap response yang memakai Resource-Resource itu — ditemukan dan diperbaiki di ketiganya (satu sudah diperbaiki di Hotfix #3 untuk `PaymentResource`, dua lainnya baru ditemukan sekarang).

**F. `PaymentResource` tidak mengekspos data yang dibutuhkan kasir**
Nama customer dan nominal tagihan (`order.grand_total`, `sale.grand_total`, nama customer) tidak pernah diekspos — padahal data itu sudah di-eager-load di `pending()`. Kasir tidak akan pernah bisa "melihat customer, melihat total" seperti yang diminta di flow bisnis, karena field-nya memang tidak pernah dikirim ke frontend.

### 2. Flow Payment Final yang Sekarang Diterapkan

**Transfer:**
```
Checkout (metode=transfer)
  → Order status: pending_payment | Payment: pending, jumlah_bayar=0
  → Customer upload bukti (POST /payment/{id}/upload)
  → Order status: waiting_confirmation
  → Kasir buka Payment Verification, tab "Transfer"
  → Approve: PUT /payment/{id}/verify {status: verified}
      → Payment.jumlah_bayar = grand_total (kasir konfirmasi sesuai bukti)
      → Order status: paid
  → Reject: PUT /payment/{id}/verify {status: rejected}
      → Payment tetap jumlah_bayar=0, status=rejected
      → Order TETAP di status sebelumnya (waiting_confirmation) — TIDAK pernah dianggap lunas
```

**Tunai (online checkout):**
```
Checkout (metode=tunai)
  → Order status: pending_payment | Payment: pending, jumlah_bayar=0
  → TIDAK ada upload bukti (tidak relevan)
  → Customer datang ke toko, kasir buka Payment Verification, tab "Tunai"
  → Kasir input jumlah uang diterima
  → PUT /payment/{id}/verify {status: verified, jumlah_bayar: <input kasir>}
      → Validasi: jumlah_bayar harus >= grand_total, kalau kurang → 422 "Jumlah uang kurang dari total tagihan"
      → Payment.jumlah_bayar = nilai yang diinput kasir
      → Order status: paid
      → Response menyertakan 'kembalian' (jumlah_bayar - grand_total), ditampilkan langsung ke kasir
```

**POS (transaksi langsung di toko, bukan online):**
```
Kasir pilih buku → Current Cart → Complete Checkout (Cash)
  → Modal input "Uang Diterima" muncul, kembalian dihitung live
  → Konfirmasi: POST /pos/transaction {..., jumlah_bayar: <input kasir>}
      → Validasi: jumlah_bayar harus >= subtotal, kalau kurang → 422
      → Sale + Payment (status=verified langsung, karena kasir menerima uang saat itu juga) dibuat sekaligus
      → Response menyertakan 'kembalian', ditampilkan di halaman receipt
  → TIDAK ada upload bukti transfer sama sekali (memang tidak relevan untuk POS)
```

### 3. Status Order yang Benar-Benar Tersedia (dikonfirmasi dari migration, bukan asumsi)
`pending_payment`, `waiting_confirmation`, `paid`, `processing`, `completed`, `cancelled`

Catatan jujur: `processing` dan `completed` **ada di skema tapi tidak pernah di-set oleh kode manapun** setelah pembersihan `AdminOrderController` yang rusak — order akan berhenti di `paid` setelah pembayaran dikonfirmasi. Tidak ada fitur "lanjut ke processing/completed" yang diminta di flow bisnis kali ini, jadi saya **tidak mengarang** transisi status tambahan untuk itu (sesuai instruksi "jangan mengarang status").

### 4. Status Payment yang Benar-Benar Tersedia
`pending`, `verified`, `rejected` (dikonfirmasi dari migration `payments`)

### 5. Apa yang Terjadi Setelah Transfer di-Approve
`Payment.status → verified`, `Payment.jumlah_bayar → grand_total`, `Payment.verified_by → id kasir`, `Payment.tanggal_bayar → sekarang`, `Order.status → paid`. Stok **tidak** dikurangi lagi di sini — sudah dikurangi sejak order dibuat (checkout), sesuai "stok diproses sesuai business logic existing" yang diminta.

### 6. Apa yang Terjadi Setelah Cash Dibayar Kasir
**Untuk tunai online** (via Payment Verification): sama seperti Transfer approve di atas, hanya `jumlah_bayar` diisi dari input kasir (bukan otomatis = grand_total), dan response menyertakan kembalian.
**Untuk POS langsung**: `Sale` + `Payment` (status langsung `verified`) dibuat dalam satu transaksi database, stok dikurangi + `StockHistory` dicatat, response menyertakan kembalian untuk ditampilkan di receipt.

### 7. File BACKEND yang Diubah (sesi ini)
- `app/Http/Controllers/Api/CheckoutController.php` — status awal `pending_payment` (bukan `waiting_confirmation`), `jumlah_bayar=0` (bukan `grand_total`)
- `app/Http/Controllers/Api/PaymentController.php` — `verify()` diperluas: terima `jumlah_bayar` opsional, validasi untuk tunai, auto-isi untuk transfer, kembalikan `kembalian` di response
- `app/Http/Controllers/Api/PosController.php` — terima `jumlah_bayar` opsional, validasi cukup/tidak, kembalikan `kembalian`
- `app/Http/Resources/PaymentResource.php` — expose `order.grand_total`, `order.customer_name`, `sale.grand_total`, `sale.customer_name` (sebelumnya tidak ada sama sekali)
- `app/Http/Resources/OrderResource.php` — fix `metode` → `metode_pembayaran`, tambah `jumlah_bayar`
- `app/Http/Resources/SaleResource.php` — fix `metode` → `metode_pembayaran`, tambah `jumlah_bayar`

**`AdminOrderController.php` SENGAJA TIDAK DIUBAH** — dibiarkan sebagaimana adanya (dengan bug status-nya) karena bukan bagian dari flow bisnis final yang diminta, dan memperbaikinya tetap akan bermasalah (double stock decrement) tanpa desain ulang yang jauh lebih besar. Saya hanya menghapus PEMICU-nya dari frontend (lihat di bawah) supaya tidak ada tombol yang mengarah ke endpoint yang secara desain sudah tidak sesuai. Route `/orders/{order}/approve` dan `/orders/{order}/reject` **tetap ada** di `routes/api.php` (tidak dihapus, sesuai instruksi "pertahankan route yang sudah ada"), hanya sudah tidak dipanggil dari mana pun di frontend.

### 8. File FRONTEND yang Diubah
- `src/pages/admin/AdminDashboard.jsx` — panel "Pesanan Perlu Persetujuan" (approve/reject, endpoint rusak) diganti jadi panel informasional read-only "Pesanan Menunggu Pembayaran" yang mengarahkan ke Payment Verification
- `src/pages/customer/TrackOrder.jsx`, `src/pages/customer/OrderDetail.jsx` — status map & stepper diperbaiki agar mencakup 6 status asli (sebelumnya cuma 4, hilang `pending_payment` & `processing`)
- `src/pages/kasir/PaymentVerification.jsx` — full rewrite: tab **Transfer** (lihat bukti, approve/reject seperti sebelumnya) terpisah dari tab **Tunai** (input uang + kalkulasi kembalian real-time + konfirmasi), keduanya dari satu endpoint `GET /payment/pending` yang sama, difilter di frontend berdasarkan `metode`
- `src/pages/kasir/PosTerminal.jsx` — "Complete Checkout (Cash)" sekarang membuka modal input uang tunai + kembalian sebelum transaksi benar-benar dikirim (sebelumnya langsung submit tanpa jumlah uang & kembalian sama sekali)
- `src/pages/kasir/ReceiptPreview.jsx` — menampilkan baris TUNAI & KEMBALIAN di struk kalau datanya tersedia

### 9. Migration yang Dibuat
**Tidak ada.** Semua field yang dipakai (`jumlah_bayar`, `metode_pembayaran`, `verified_by`, status enum) **sudah ada** di skema sejak awal — masalahnya murni di kode PHP yang salah mengacu ke nama field/nilai enum yang tidak sesuai skema sebenarnya.

### 10. Endpoint yang Digunakan
Semua sudah ada sebelumnya, tidak ada endpoint baru: `POST /checkout`, `POST /payment/{id}/upload`, `GET /payment/pending`, `PUT /payment/{id}/verify`, `POST /pos/transaction`. `POST /orders/{id}/approve` dan `/reject` **tidak dipakai** di frontend manapun lagi (dijelaskan di poin 7).

### 11. Perubahan Database/Schema
**Tidak ada.**

### 12. Build Result
`npm run build` — **sukses**, tanpa error.

### 13. Regression Check
- Cart: `cart?.cart_details` dikonfirmasi **tidak berubah**, tetap benar
- Pagination: 3 halaman (Inventory, Procurement, Users) dikonfirmasi tetap memakai komponen `Pagination` yang sama
- Route: tidak ada perubahan path untuk checkout/payment/pos, tidak ada duplikat
- Inventory, Reports, Settings: tidak disentuh sama sekali di sesi ini
- POS lama (tanpa input kembalian) → sekarang **tetap kompatibel mundur**: kalau `jumlah_bayar` tidak dikirim, backend fallback ke `grand_total` seperti perilaku lama (tidak ada breaking change untuk klien lain yang mungkin memanggil endpoint ini)

### 14. Masalah yang Masih Tersisa
- **E2E sungguhan belum dijalankan** — tidak ada instance Laravel live di environment saya. Semua di atas adalah hasil audit source-code (migration vs model vs controller vs resource) yang sangat menyeluruh, bukan observasi langsung.
- `AdminOrderController` tetap ada sebagai kode "mati" (route terdaftar, tidak dipanggil dari frontend manapun) — kalau suatu saat ingin benar-benar dihapus atau didesain ulang (mis. untuk kebutuhan lain di luar payment flow), perlu keputusan terpisah karena menyentuh alur stok yang sensitif.
- Status `processing` di enum Order tidak pernah dipakai — bukan bug, hanya belum ada fitur yang membutuhkannya sesuai flow bisnis saat ini.

### 15. Checklist E2E Manual (untuk Anda)

**TEST 1 — Customer Checkout Transfer**
1. Login customer → Browse → Add to Cart → Checkout → pilih "Bank Transfer" → Place Order
2. ✅ Expected: order berhasil dibuat, tidak ada error 500, diarahkan ke halaman Order Confirmed dengan info rekening bank

**TEST 2 — Upload Bukti Transfer**
1. Di halaman Order Confirmed, upload gambar sebagai bukti
2. ✅ Expected: upload sukses, order berpindah status (bisa dicek di Track Order — harus tampil "Menunggu Konfirmasi")

**TEST 3 — Kasir Approve Transfer**
1. Login kasir → Payment Verification → tab Transfer → cari order dari Test 1 → klik bukti untuk lihat preview → klik Verifikasi
2. ✅ Expected: sukses, payment hilang dari daftar pending, order status customer berubah jadi "Dibayar"

**TEST 4 — Kasir Reject Transfer**
1. Buat order transfer baru + upload bukti (ulangi Test 1-2) → di Payment Verification klik Tolak
2. ✅ Expected: sukses, order **tidak** berubah jadi "Dibayar" (tetap "Menunggu Konfirmasi" atau status sebelumnya)

**TEST 5 — Customer Checkout Tunai**
1. Checkout → pilih "Tunai" → Place Order
2. ✅ Expected: order dibuat, halaman Order Confirmed menampilkan pesan "tunjukkan kode order ke kasir" (BUKAN form upload bukti)

**TEST 6 — Kasir Konfirmasi Tunai**
1. Payment Verification → tab Tunai → cari order dari Test 5 → masukkan jumlah uang (lebih besar dari total) → cek kembalian tampil benar → Konfirmasi Pembayaran
2. ✅ Expected: sukses, kembalian ditampilkan, order status customer jadi "Dibayar"
3. Coba juga masukkan jumlah KURANG dari total → tombol Konfirmasi harus disabled/menampilkan error

**TEST 7 — POS Cash Checkout**
1. Kasir → POS Terminal → pilih beberapa buku → Complete Checkout (Cash) → modal muncul → masukkan uang → cek kembalian → Konfirmasi Pembayaran
2. ✅ Expected: transaksi sukses, diarahkan ke Receipt, struk menampilkan baris TUNAI dan KEMBALIAN dengan angka yang benar

**TEST 8 — Cek Stok Setelah Transaksi**
1. Cek stok buku yang dipakai di Test 1 (transfer) SEBELUM dan SESUDAH checkout — harus berkurang **saat checkout**, bukan saat approve
2. Cek stok buku yang dipakai di Test 7 (POS) — harus berkurang saat transaksi POS selesai

**TEST 9 — Cek Transactions/History**
1. Kasir → Transactions — transaksi dari Test 7 (POS) harus muncul dengan metode "tunai" dan status yang benar
2. Admin → Reports → Sales Report — transaksi yang sama harus ikut terhitung

**TEST 10 — Cek Status Order dari Sisi Customer**
1. Customer → My Orders — order dari Test 1 (setelah di-approve) harus tampil "Dibayar" dengan metode "transfer" (BUKAN kosong/null lagi)
2. Order dari Test 5 (setelah dikonfirmasi tunai) harus tampil "Dibayar" dengan metode "tunai"

**Tambahan — verifikasi khusus bug lama:**
- Buka Admin Dashboard → pastikan **tidak ada lagi** tombol Approve/Reject pesanan yang error saat diklik (panel sudah diganti jadi informasional)

## FINISHING — Public Guest Experience + Admin Orders/Sales + Dashboard Chart

### 1. Root Cause (bug ditemukan saat audit, bukan diminta eksplisit)
Tidak ada bug baru — sesi ini murni pekerjaan fitur/finishing. Satu catatan: `AdminOrderController::show()` sebelumnya tidak ada sama sekali (hanya `index()`), sehingga halaman detail order admin tidak akan bisa diakses lewat direct-URL/refresh kalau hanya mengandalkan `state` dari klik tabel — pola masalah yang sama persis dengan bug route Fase 6 (buku). Diperbaiki dari awal kali ini dengan menambah `show()`, bukan menunggu jadi bug laporan.

### 2. Guest / Public Landing
- `/` sekarang **tidak lagi paksa redirect ke Login** — guest langsung melihat katalog buku published (halaman `Home.jsx` baru, merender `BrowseBooks` langsung untuk guest; user yang sudah login otomatis diarahkan ke area role masing-masing)
- `/browse`, `/search`, `/books/:id` — dibuka aksesnya untuk guest (sebelumnya `ProtectedRoute roles={["customer"]}`, sekarang publik), data tetap 100% dari `GET /books` (endpoint publik, sudah ada sejak Fase 2)
- "New Releases" — dicapai lewat sort "Newest Arrivals" yang sudah ada di `BrowseBooks` (data asli, urut `created_at`)
- **"Best Sellers" TIDAK dibuat untuk guest** — data terlaris hanya bisa dihitung dari `/sales` yang **role-gated admin+kasir**, guest/customer tidak punya akses ke situ. Memaksakan ini butuh mengekspos data penjualan ke publik (perubahan keamanan besar) atau endpoint publik baru — keduanya di luar scope "gunakan data existing", jadi saya **tidak mengarang** dan link "Best Sellers" di navbar untuk sementara mengarah ke browse biasa (bukan link mati, tapi belum benar-benar mengurutkan by sales). Didokumentasikan sebagai backend/access limitation.

### 3. Authentication Gate
- `ProtectedRoute.jsx` — sekarang mengirim `state: { from: location }` saat redirect ke `/login`
- `Login.jsx` — setelah login sukses, kembali ke `state.from` kalau ada, baru fallback ke halaman default per role
- `BookCard.jsx`, `BookDetail.jsx` — tombol "Add to Cart" untuk guest sekarang **redirect ke Login** (bukan mencoba API call yang pasti gagal 401 secara diam-diam)
- `CustomerNavbar.jsx` — ikon akun untuk guest langsung ke Login (bukan buka dropdown penuh link yang toh akan mental); ikon cart untuk guest juga langsung ke Login
- Checkout/Cart/Account/Wishlist/Settings/Orders tetap `ProtectedRoute roles={["customer"]}` — tidak berubah, guest otomatis kena gate ini kalau coba akses langsung

### 4. Admin Dashboard — Grafik Nyata
- Ditambahkan chart "Tren Penjualan" (Recharts `BarChart`) — data diagregasi dari **seluruh** `/sales` (lewat `fetchAllPages`, sesuai instruksi), dikelompokkan per tanggal transaksi asli, ditampilkan 14 hari transaksi terakhir
- Loading state, empty state (kalau belum ada transaksi) tersedia
- Tidak ada data dummy — kalau `/sales` kosong, chart menampilkan empty state jujur, bukan grafik palsu

### 5. Admin Orders (`/admin/orders`) — Sekarang Nyata
- List: `GET /orders-management` — search (kode order/nama customer) + filter status (6 nilai asli) + pagination, **semua server-side** (diperluas dari endpoint yang sudah ada, bukan endpoint baru)
- Kolom: Order ID, Customer, Tanggal, Total, **Metode Pembayaran** (butuh tambah eager-load `payment` di controller — sebelumnya tidak di-load sama sekali), Status
- Detail (`/admin/orders/:id`): **endpoint baru `GET /orders-management/{order}`** ditambahkan (lihat Bagian 7) — menampilkan item, info customer, info pembayaran (termasuk bukti transfer kalau ada)
- **Tidak ada tombol Approve/Reject** — sesuai instruksi eksplisit, karena workflow itu (di `AdminOrderController::approve/reject`) sudah dikonfirmasi rusak sejak audit sebelumnya dan berisiko mengurangi stok dua kali. Endpoint-nya tetap ada di backend (tidak dihapus) tapi tidak dipanggil dari frontend manapun.

### 6. Admin Sales (`/admin/sales`) — Sekarang Nyata
- Pakai `GET /sales` — endpoint yang **sudah ada** sejak Fase 3/7, sudah mendukung search+filter tanggal+pagination server-side, tidak ada perubahan backend untuk ini
- Kolom: No. Transaksi, Tanggal, Customer, **Metode Pembayaran**, Total, Status
- Detail dibuka lewat halaman **Receipt Preview yang sudah ada** (`/kasir/receipt/:id`, sudah mengizinkan role admin sejak Fase 3) — tidak menduplikasi komponen

### 7. File BACKEND yang Diubah
- `app/Http/Controllers/Api/AdminOrderController.php` — `index()` diperluas (tambah filter `search`/`status`, tambah eager-load `payment`); **method `show()` baru ditambahkan** (untuk detail order admin, mengikuti pola penamaan `resource-management/{id}` yang sudah dipakai konsisten sejak fix Fase 6)
- `routes/api.php` — **1 baris baru**: `Route::get('/orders-management/{order}',[AdminOrderController::class,'show']);`

**Tidak ada migration, tidak ada perubahan tabel/kolom.** `approve()`/`reject()` di `AdminOrderController` **tidak disentuh** (tetap ada, tetap tidak dipanggil dari mana pun).

### 8. File FRONTEND yang Diubah/Ditambah
Baru: `src/pages/Home.jsx`, `src/pages/admin/AdminOrders.jsx`, `src/pages/admin/AdminOrderDetail.jsx`, `src/pages/admin/AdminSales.jsx`
Diubah: `App.jsx` (routing guest + admin orders/sales), `ProtectedRoute.jsx`, `Login.jsx`, `BookCard.jsx`, `BookDetail.jsx`, `CustomerNavbar.jsx`, `AdminDashboard.jsx` (chart + import `recharts`/`fetchAllPages`)

### 9. Perubahan Endpoint/API
- `GET /books-management` dst — **tidak berubah**
- `GET /orders-management` — response tetap sama strukturnya (paginator mentah), hanya field `payment` sekarang ikut ter-eager-load, dan sekarang menerima query param `search`/`status` (opsional, backward compatible — kalau tidak dikirim, perilaku identik seperti sebelumnya)
- `GET /orders-management/{order}` — **endpoint baru**, hanya dipakai `AdminOrderDetail.jsx`

### 10. Perubahan Database
**Tidak ada.**

### 11. Hasil Build
`npm run build` — **sukses**. Muncul warning ukuran bundle (>500kB setelah minifikasi, karena penambahan `recharts`) — ini peringatan optimasi, bukan error, tidak menghalangi fungsi apa pun.

### 12. Hasil Audit Route
- Backend: tidak ada duplikat route (grep+uniq, hasil kosong)
- Frontend: 33 route terdaftar di `App.jsx`, tidak ada duplikat path, `/admin/orders` dan `/admin/sales` **sudah bukan placeholder lagi**
- Cross-check API call baru (`orders-management` dengan filter, `orders-management/{id}`) — cocok persis dengan route yang didaftarkan
- Grep dummy/TODO/mock — hasil kosong

### 13. Remaining Issues
- **E2E sungguhan belum dijalankan** — tidak ada instance Laravel live di environment saya
- "Best Sellers" di navbar customer belum benar-benar mengurutkan berdasarkan penjualan (backend limitation, dijelaskan di Bagian 2) — link tetap fungsional (ke Browse), hanya belum terurut sesuai label
- Bundle size membesar signifikan karena `recharts` (dari ~482KB ke ~858KB gzip) — bukan bug, tapi kalau ingin dioptimasi ke depan bisa pakai code-splitting/dynamic import khusus untuk halaman Dashboard

### 14. Status Final
Guest browsing, auth gate dengan return-path, Admin Orders (nyata, tanpa approve/reject berbahaya), Admin Sales (nyata), dan grafik Dashboard (data asli) — semuanya terpasang dan diverifikasi source-level. Cart, Pagination, Payment Flow, Inventory, Procurement, Reports, Settings, Users & Permissions, Responsive sidebar — **dikonfirmasi tidak ada regresi** dari perubahan sesi ini.

## HOTFIX #5 — Auth Regression Fix + Landing Page (Stitch Design)

### A. Audit & Fix Auth Regression

**Bug #1 — Login → Logout → Login lagi gagal/macet**
**Root cause**: axios response interceptor di `lib/api.js` melakukan `window.location.href = "/login"` (hard **full-page reload**) setiap kali menerima response 401. Pola ini fundamental rapuh untuk SPA — kalau 401 itu terjadi bersamaan dengan proses lain yang sedang berjalan (mis. request lain masih in-flight), hard reload bisa menyela state React di tengah jalan, termasuk berpotensi mengganggu proses login kedua yang baru saja disubmit. Ini murni bug frontend, tidak ada perubahan di backend (`AuthController::login/logout` sudah benar sejak awal — dikonfirmasi ulang, selalu membuat token baru dan tidak menyimpan state lintas-sesi apa pun).
**Fix**: Interceptor sekarang hanya membersihkan `localStorage` dan mengirim custom event `auth:unauthorized` (bukan hard reload). `AuthContext` mendengarkan event itu untuk membersihkan state React (`setUser(null)`) — `ProtectedRoute` yang sudah ada otomatis menangani redirect-nya secara wajar lewat React Router, tanpa reload browser.

**Bug #2 — Guest melihat & bisa pakai fitur Wishlist**
**Root cause**: Ikon hati (toggle wishlist) di `BookCard.jsx` dan `BookDetail.jsx` **tidak pernah dicek status login sama sekali** — karena `WishlistContext` murni berbasis `localStorage` (tanpa backend), tombolnya selalu tampil dan selalu berfungsi untuk siapa saja, termasuk guest, tanpa diarahkan ke Login. (Dropdown menu "Wishlist" di navbar sebenarnya sudah benar tergating sejak awal — cuma ikon hati di kartu/detail buku yang bocor.)
**Fix**: Ikon hati sekarang hanya dirender kalau `user?.role === "customer"` — disembunyikan total untuk guest DAN untuk admin/kasir yang sedang browsing (bukan fitur mereka). Item dropdown "My Orders", "Wishlist", "Settings" juga disembunyikan untuk role selain customer (sebelumnya tampil tapi mengarah ke halaman customer-only yang membingungkan).

**Bug #3 — Admin login → klik "My Account" → malah balik ke Login**
**Root cause**: route `/account` di-hardcode `ProtectedRoute roles={["customer"]}`, dan `ProtectedRoute` lama memperlakukan "role tidak cocok" **sama persis** dengan "belum login" — keduanya sama-sama redirect ke `/login`. Ini pas dengan gejala di laporan: admin authenticated (token valid) tapi dianggap "gagal" hanya karena rolenya bukan `customer` — persis pola `"bukan customer → dianggap belum login"` yang secara eksplisit dilarang di instruksi.
**Fix** (2 lapis):
1. `ProtectedRoute.jsx` — dipisahkan tegas: `!user` (benar-benar belum login) → tetap ke `/login`. `user` ada tapi role tidak cocok (authorization, bukan authentication) → diarahkan ke **halaman utama role mereka sendiri** (`roleHome()`), bukan ke Login.
2. `/account` di `App.jsx` — dibuka untuk ketiga role (`customer`, `admin`, `kasir`), bukan customer-only, karena "My Account" secara konsep valid untuk siapa saja yang authenticated.
3. `MyAccount.jsx` — dibuat role-aware: untuk customer tampil seperti sebelumnya (statistik pesanan, link Wishlist/Orders — karena `GET /orders` memang backend-nya customer-only). Untuk admin/kasir, ditampilkan kartu profil sederhana (nama/email/role) + tombol "Kembali ke Dashboard", **tanpa** memanggil `/orders` (yang memang akan 403 kalau dipanggil sebagai admin/kasir).

### File Frontend yang Diubah/Ditambah (Bagian A)
Baru: `src/lib/roleHome.js` (util bersama, menghindari duplikasi map role→halaman yang sebelumnya ada di 2 tempat berbeda)
Diubah: `src/lib/api.js`, `src/context/AuthContext.jsx`, `src/routes/ProtectedRoute.jsx`, `src/App.jsx` (route `/account`), `src/pages/auth/Login.jsx`, `src/pages/customer/MyAccount.jsx`, `src/components/customer/CustomerNavbar.jsx`, `src/components/customer/BookCard.jsx`, `src/pages/customer/BookDetail.jsx`, `src/components/kasir/KasirSidebar.jsx`, `src/components/admin/AdminSidebar.jsx` (tombol logout sekarang ke `/` sesuai aturan baru, bukan `/login`)

### File Backend yang Diubah (Bagian A)
**Tidak ada.** Dikonfirmasi lewat audit `AuthController.php` bahwa `login()`, `logout()`, `me()` sudah benar sejak awal — bug murni di sisi frontend.

### B. Landing Page (Stitch Design)

- `/` sekarang me-render `Landing.jsx` (halaman baru) untuk guest — **bukan** form login, **bukan** langsung grid seluruh buku (`/browse`)
- User yang sudah login (role apa pun) di `/` otomatis diarahkan ke halaman utama rolenya masing-masing (pakai `roleHome()` yang sama)
- Struktur mengikuti desain Stitch (`welcome_to_bookvault_your_premium_bookstore` + varian mobile) sedekat mungkin: hero dengan headline gradient, 2 tombol CTA, kartu ber-glass-effect dengan ilustrasi, section kategori, grid "Featured Books", section "Why BookVault", footer
- **CustomerNavbar dipakai ulang** (bukan header baru) — supaya konsisten dengan seluruh halaman lain di app dan search/sign-in/cart behavior tetap sama persis di mana pun

**Penyesuaian dari desain asli (data di desain adalah placeholder fiktif, saya ganti dengan data nyata):**
1. Statistik **"10,000+ Active Readers"** di desain — **dihilangkan**, tidak ada data pembaca aktif di backend. Diganti angka **jumlah judul buku asli** dari `GET /books` (`{books.length}+ Judul Tersedia`)
2. **Kategori chip** di desain (Sci-Fi, History, Psychology, Technology — hardcoded) — diganti kategori **asli** yang benar-benar ada di katalog (diturunkan dari data buku, pola yang sama seperti sudah dipakai di `BrowseBooks.jsx`)
3. **Grid "Featured Books"** di desain (buku-buku fiktif seperti "The Grid System" karya "Josef Müller") — diganti buku **published asli** dari `GET /books`, diurutkan terbaru, memakai komponen `BookCard` yang sudah ada (bukan kartu baru)
4. Tombol "Explore Collection" di desain diarahkan ke section "Featured Books" di halaman yang sama (scroll-anchor `#featured`) — bukan destinasi fiktif
5. Bottom navigation bar di varian mobile desain — **tidak diimplementasikan**, karena app ini sudah punya pola navigasi konsisten (`CustomerNavbar`) di semua halaman; menambah bottom-nav خhusus satu halaman akan tidak konsisten dengan sisa aplikasi

### File Frontend yang Diubah/Ditambah (Bagian B)
Baru: `src/pages/Landing.jsx`
Diubah: `src/pages/Home.jsx` (guest sekarang render `Landing`, bukan `BrowseBooks` langsung)

### Perubahan Guest/Customer/Admin Behavior (Final)
| | Guest | Customer (login) | Admin/Kasir (login) |
|---|---|---|---|
| `/` | Landing page (baru) | redirect ke area masing-masing | redirect ke area masing-masing |
| Browse/Detail/Search | ✅ bebas | ✅ bebas | ✅ bebas (halaman public tetap bisa diakses) |
| Wishlist (ikon hati + menu) | ❌ disembunyikan total | ✅ | ❌ disembunyikan (bukan fitur mereka) |
| Add to Cart / Checkout | → diarahkan Login | ✅ | tidak relevan (tidak dipaksa, cuma tidak dipakai) |
| My Account | → diarahkan Login | ✅ (versi lengkap) | ✅ (versi ringkas + tombol kembali ke dashboard) |
| Logout | — | kembali ke `/` | kembali ke `/` |

### Hasil 10 Test (Source-Level — TIDAK ADA instance Laravel live untuk E2E sungguhan)
1. **Guest buka `/`, tidak dipaksa login, Wishlist tidak muncul** — ✅ source: `Home.jsx` render `Landing` untuk `!user`; heart icon & menu Wishlist digate `user?.role==="customer"`
2. **Guest klik Add to Cart → Login** — ✅ tidak berubah dari fix sebelumnya, tetap berfungsi (`BookCard`/`BookDetail` cek `!user` sebelum panggil API)
3. **Login customer → Browse → Wishlist muncul → My Account berhasil** — ✅ source: gating role-based ditambah, `/account` tidak lagi customer-only
4. **Logout → jadi guest lagi → Wishlist hilang** — ✅ source: `user` di-null-kan oleh `logout()`, komponen re-render sesuai kondisi guest
5. **Login lagi sebagai customer → berhasil** — ✅ source: root cause hard-reload dihapus dari interceptor
6. **Login admin → masuk Browse → profile → My Account → TIDAK balik ke Login** — ✅ source: fix inti Bug #3, `ProtectedRoute` tidak lagi menyamakan role-mismatch dengan belum-login
7. **Admin logout → login admin lagi → berhasil** — ✅ source: sama seperti test 5, berlaku untuk semua role
8. **Refresh browser setelah login → tetap authenticated** — ✅ tidak diubah, `AuthContext`'s mount-effect (`GET /me`) tidak disentuh
9. **Guest akses halaman protected → diarahkan login** — ✅ tidak diubah, `ProtectedRoute` untuk `!user` tetap ke `/login`
10. **Login dari halaman protected → kembali ke halaman tujuan** — ✅ tidak diubah dari fix sebelumnya (`state.from`), tetap dipertahankan

*(Catatan jujur: semua ✅ di atas adalah hasil penelusuran source code secara menyeluruh dan koheren, bukan hasil klik sungguhan di browser — tidak ada instance Laravel live di environment saya untuk E2E nyata.)*

### Build Result
`npm run build` — **sukses**, tanpa error. Warning ukuran bundle (>500KB, dari `recharts` sesi sebelumnya) masih ada, tidak berubah dari sebelumnya, bukan error.

### Audit Route/Redirect
- Backend: tidak ada perubahan route sama sekali di sesi ini, tidak ada duplikat (dicek ulang)
- Frontend: 33 route, tidak ada duplikat, tidak ditemukan redirect loop — ditelusuri manual setiap kombinasi role×route yang mungkin mismatch (`/account` kini terbuka utk 3 role, `/wishlist` tetap customer-only tapi mismatch sekarang ke `roleHome()` bukan `/login`, tidak ada rantai redirect balik)

### Remaining Issues
- E2E sungguhan belum dijalankan (tidak ada Laravel live instance)
- Bundle size masih besar dari penambahan `recharts` sesi sebelumnya — tidak berubah, bukan regresi baru
- "Best Sellers" di navbar (link `?sort=best_selling`) tetap belum benar-benar terurut by sales (limitation yang sama seperti sesi sebelumnya — `/sales` role-gated admin+kasir, guest/customer tidak bisa akses untuk menghitung buku terlaris)

## HOTFIX #6 — Global "progress_activity" Loading Screen saat Browser Refresh

### Koreksi Interpretasi
"Relog"/refresh yang dimaksud = **F5/Ctrl+R browser**, bukan logout-login manual. Route/URL sebelum refresh **sudah benar dipertahankan** (dikonfirmasi, tidak disentuh sama sekali) — yang jadi masalah murni **layar loading global "progress_activity"** yang muncul setiap kali refresh sebelum halaman yang sama akhirnya tampil kembali.

### Identifikasi "progress_activity" (9 poin audit)

1. **File asal**: teks `progress_activity` adalah nama ikon Material Symbols, muncul persis di 2 tempat — `src/routes/ProtectedRoute.jsx` (baris 12-13) dan `src/pages/Home.jsx` (baris 12-13, untuk route `/`)
2. **Component yang merender**: kedua tempat itu return `<span className="material-symbols-outlined animate-spin">progress_activity</span>` langsung di dalam blok `if (loading) return (...)`
3. **State yang mengontrol**: `loading` dari `useAuth()` — sumbernya satu-satunya: `AuthContext.jsx`
4. **Kapan `loading` jadi `true`**: sebelumnya **selalu** `true` di awal (`useState(true)`) — setiap kali `AuthProvider` mount, termasuk setiap F5 (karena F5 me-reload seluruh JS bundle dari nol, `AuthProvider` selalu mount ulang dari kosong)
5. **Kapan `loading` jadi `false`** (sebelum fix): **hanya setelah** promise `GET /me` selesai (`.finally(() => setLoading(false))`) — inilah akar masalahnya
6. **Apakah `GET /me` dipanggil tiap reload**: **Ya**, dan ini **tetap dipertahankan tanpa perubahan** — restore/validasi session tetap jalan persis seperti sebelumnya
7. **Apakah `ProtectedRoute` menunggu `AuthContext` selesai**: Ya, lewat `loading` — mekanisme ini **tidak dihapus**, hanya sumber nilai awal `loading`-nya yang diperbaiki
8. **Apakah interceptor/event `auth:unauthorized` ikut memperlambat**: **Tidak** — event listener itu cuma register saat mount, tidak pernah fire selama proses inisialisasi normal (hanya fire kalau ADA request API yang benar-benar dapat respons 401 di kemudian hari). Dicek dan disingkirkan sebagai penyebab.
9. **Apakah loading "stuck" atau cuma lama**: **Bukan stuck** — selalu selesai (baik lewat `.then` atau `.catch`, keduanya diikuti `.finally(() => setLoading(false))`). Masalahnya murni **durasi yang tidak perlu**: UI diblokir menunggu round-trip jaringan ke `/me`, padahal kita **sudah tahu siapa yang login secara instan** dari `localStorage` (`user` di-restore *synchronous* di `useState(() => JSON.parse(...))` — baris ini tidak pernah berubah, sudah instan sejak awal).

### Root Cause
`AuthContext` menyamakan dua hal yang sebenarnya berbeda: **"tahu siapa user-nya"** (instan, dari `localStorage`) vs **"memvalidasi ulang token ke server"** (perlu network round-trip). Sebelumnya, UI diblokir sampai KEDUANYA selesai — padahal untuk kasus normal (session masih valid), yang pertama saja sudah cukup untuk langsung render halaman; validasi ulang ke server harusnya jalan di belakang layar, bukan menahan tampilan.

### Fix (1 file, minimal)
`src/context/AuthContext.jsx` — nilai awal `loading` sekarang dihitung, bukan selalu `true`:
```js
const [loading, setLoading] = useState(() => {
  const token = localStorage.getItem("bookvault_token");
  const cachedUser = localStorage.getItem("bookvault_user");
  return !!token && !cachedUser; // hanya block kalau benar-benar belum tahu siapa usernya
});
```
- Kalau ada token **dan** ada cached user (kasus normal: user memang sedang login) → `loading` mulai `false`, halaman langsung dirender, **layar progress_activity tidak pernah muncul sama sekali**
- Kalau tidak ada token sama sekali (guest) → `loading` tetap `false` dari awal (perilaku lama, tidak berubah)
- Kalau ada token tapi TIDAK ada cached user (kasus langka — localStorage rusak/parsial) → `loading` tetap `true` sampai `/me` selesai, karena di situasi ini kita **memang benar-benar belum tahu** siapa yang login — ini pengecualian yang jujur, bukan disembunyikan

**`GET /me` di `useEffect` sama sekali tidak diubah** — tetap jalan setiap mount kalau ada token, tetap memvalidasi/refresh data user, tetap membersihkan session kalau token ternyata tidak valid lagi (lewat `catch` yang sudah ada). Hanya saja sekarang jalan **di belakang layar** tanpa memblokir tampilan untuk kasus umum.

**`ProtectedRoute.jsx` tidak disentuh sama sekali** — mekanisme redirect-nya (belum login → `/login`, role tidak cocok → `roleHome()`) persis sama seperti sebelumnya. Route/URL yang sedang diakses tetap dipertahankan (sudah benar dari awal, tidak ada yang perlu diperbaiki di situ).

### Trade-off yang Disadari (didokumentasikan secara jujur)
Karena sekarang render memakai data `user` dari cache SEBELUM validasi server selesai (optimistic render), ada kemungkinan sangat kecil: kalau token ternyata sudah di-revoke di server (misalnya di-logout paksa dari device lain) tepat saat itu, halaman akan sempat tampil sepersekian detik dengan data lama sebelum `/me` gagal dan sesi dibersihkan. Ini trade-off standar & wajar untuk pola "render optimis, validasi di belakang layar" — jauh lebih baik untuk UX dibanding memblokir SETIAP refresh demi kasus yang sangat jarang ini.

### Regression Test (6 skenario, source-level trace)
Untuk semua skenario di bawah: `user` sudah ter-cache di localStorage (kondisi "sedang login" yang diminta diuji) → `loading` mulai `false` secara sinkron → `ProtectedRoute` langsung lewati blok spinner → cek `!user` (false) → cek role match (sesuai) → render halaman **seketika**, tanpa network round-trip yang memblokir.

| # | Skenario | Hasil |
|---|---|---|
| 1 | Customer → `/books/:id` → F5 | ✅ (route ini publik, tidak lewat ProtectedRoute sama sekali — tapi dikonfirmasi tetap tidak terpengaruh) |
| 2 | Customer → `/cart` → F5 | ✅ render seketika, tidak ada spinner |
| 3 | Customer → `/account` → F5 | ✅ render seketika |
| 4 | Admin → `/admin/dashboard` → F5 | ✅ render seketika |
| 5 | Admin → `/admin/purchases` (Procurement) → F5 | ✅ render seketika — skenario persis seperti contoh di laporan |
| 6 | Kasir → `/kasir/pos` → F5 | ✅ render seketika |

Tidak ada infinite loading (setiap jalur selalu berakhir di `false`, baik sinkron maupun lewat `.finally`). Tidak ada infinite redirect (logic redirect tidak diubah). Tidak ada perubahan URL ke Landing/Login untuk session yang valid.

### File yang Diubah
**Hanya `src/context/AuthContext.jsx`.** Tidak ada file lain yang disentuh — `ProtectedRoute.jsx`, `App.jsx`, role-based routing, session persistence, backend/database sama sekali tidak diubah.

### Build Result
`npm run build` — **sukses**, tanpa error.

### Remaining Issues
E2E sungguhan (klik F5 di browser asli) belum dijalankan — tidak ada instance Laravel live + browser nyata di environment saya. Analisis di atas adalah penelusuran lifecycle state React secara menyeluruh dan deterministik (bukan dugaan), tapi tetap saya nyatakan jujur bahwa ini bukan observasi langsung.
