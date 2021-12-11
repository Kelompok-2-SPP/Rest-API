# REST-API SPP 🎃

[API Endpoint 🍳](https://praktek-ukk-spp.herokuapp.com/api/v1/)<br />
[SQL Database 🧵](https://raw.githubusercontent.com/Kelompok-2-SPP/Rest-API/master/.github/pembayaran_spp.sql)

Rest API for android-based spp payment apps practice to facilitate backend communication, all request must use Authorization token 🎟, which you can get it by post to [this endpoint](https://praktek-ukk-spp.herokuapp.com/api/v1/auth) with x-www-form-urlencoded using username and password that already resgistered on database

<br />

## Request Method 🧧

### GET 🎣
All router has function keyword, to search all column (except id, uniqe, index key, you still can search using nisn and nis only on siswa)</br> 
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/keyword-get.png" alt="Keyword example"></code>

### 1. [Kelas-All](https://praktek-ukk-spp.herokuapp.com/api/v1/kelas)
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/kelas-get-1.png" alt="Kelas Get-1"></code>
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/kelas-get-2.png" alt="Kelas Get-2"></code>
### 2. [Pembayaran-All](https://praktek-ukk-spp.herokuapp.com/api/v1/pembayaran)
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/pembayaran-get-1.png" alt="Pembayaran Get-1"></code>
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/pembayaran-get-2.png" alt="Pembayaran Get-2"></code>
### 3. [Petugas-All](https://praktek-ukk-spp.herokuapp.com/api/v1/petugas)
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/petugas-get-1.png" alt="Petugas Get-1"></code>
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/petugas-get-2.png" alt="Petugas Get-2"></code>
### 4. [Siswa-All](https://praktek-ukk-spp.herokuapp.com/api/v1/siswa)
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/siswa-get-1.png" alt="Siswa Get-1"></code>
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/siswa-get-2.png" alt="Siswa Get-2"></code>
### 5. [Spp-All](https://praktek-ukk-spp.herokuapp.com/api/v1/spp)
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/spp-get-1.png" alt="Spp Get-1"></code>
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/spp-get-2.png" alt="Spp Get-2"></code>

#

### POST 🎨
### 1. [Auth-All](https://praktek-ukk-spp.herokuapp.com/api/v1/auth)
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/auth-post-1.png" alt="Auth Post-1"></code>
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/auth-post-2.png" alt="Auth Post-2"></code>
### 2. [Kelas-Admin](https://praktek-ukk-spp.herokuapp.com/api/v1/kelas)
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/kelas-post-1.png" alt="Kelas Post-1"></code>
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/kelas-post-2.png" alt="Kelas Post-2"></code>
### 3. [Pembayaran-Petugas/Admin](https://praktek-ukk-spp.herokuapp.com/api/v1/pembayaran)
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/pembayaran-post-1.png" alt="Pembayaran Post-1"></code>
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/pembayaran-post-2.png" alt="Pembayaran Post-2"></code>
### 4. [Petugas-Admin](https://praktek-ukk-spp.herokuapp.com/api/v1/petugas)
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/petugas-post-1.png" alt="Petugas Post-1"></code>
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/petugas-post-2.png" alt="Petugas Post-2"></code>
### 5. [Siswa-Admin](https://praktek-ukk-spp.herokuapp.com/api/v1/siswa)
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/siswa-post-1.png" alt="Siswa Post-1"></code>
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/siswa-post-2.png" alt="Siswa Post-2"></code>
### 6. [Spp-Admin](https://praktek-ukk-spp.herokuapp.com/api/v1/spp)
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/spp-post-1.png" alt="Spp Post-1"></code>
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/spp-post-2.png" alt="Spp Post-2"></code>

#

### PUT 🐱
### 1. [Kelas-Admin](https://praktek-ukk-spp.herokuapp.com/api/v1/kelas)
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/kelas-put-1.png" alt="Kelas Put-1"></code>
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/kelas-put-2.png" alt="Kelas Put-2"></code>
### 2. [Pembayaran-Petugas/Admin](https://praktek-ukk-spp.herokuapp.com/api/v1/pembayaran)
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/pembayaran-put-1.png" alt="Pembayaran Put-1"></code>
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/pembayaran-put-2.png" alt="Pembayaran Put-2"></code>
### 3. [Petugas-Admin](https://praktek-ukk-spp.herokuapp.com/api/v1/petugas)
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/petugas-put-1.png" alt="Petugas Put-1"></code>
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/petugas-put-2.png" alt="Petugas Put-2"></code>
### 4. [Siswa-Admin](https://praktek-ukk-spp.herokuapp.com/api/v1/siswa)
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/siswa-put-1.png" alt="Siswa Put-1"></code>
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/siswa-put-2.png" alt="Siswa Put-2"></code>
### 5. [Spp-Admin](https://praktek-ukk-spp.herokuapp.com/api/v1/spp)
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/spp-put-1.png" alt="Spp Put-1"></code>
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/spp-put-2.png" alt="Spp Put-2"></code>

#

### DELETE 🐶
### 1. [Kelas-Admin](https://praktek-ukk-spp.herokuapp.com/api/v1/kelas)
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/kelas-delete-1.png" alt="Kelas Delete-1"></code>
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/kelas-delete-2.png" alt="Kelas Delete-2"></code>
### 2. [Pembayaran-Admin](https://praktek-ukk-spp.herokuapp.com/api/v1/pembayaran)
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/pembayaran-delete-1.png" alt="Pembayaran Delete-1"></code>
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/pembayaran-delete-2.png" alt="Pembayaran Delete-2"></code>
### 3. [Petugas-Admin](https://praktek-ukk-spp.herokuapp.com/api/v1/petugas)
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/petugas-delete-1.png" alt="Petugas Delete-1"></code>
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/petugas-delete-2.png" alt="Petugas Delete-2"></code>
### 4. [Siswa-Admin](https://praktek-ukk-spp.herokuapp.com/api/v1/siswa)
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/siswa-delete-1.png" alt="Siswa Delete-1"></code>
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/siswa-delete-2.png" alt="Siswa Delete-2"></code>
### 5. [Spp-Admin](https://praktek-ukk-spp.herokuapp.com/api/v1/spp)
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/spp-delete-1.png" alt="Spp Delete-1"></code>
<code><img height=300 src="https://github.com/Kelompok-2-SPP/Rest-API/blob/master/.github/image/spp-delete-2.png" alt="Spp Delete-2"></code>

#
Here some [easter egg 🥚](https://praktek-ukk-spp.herokuapp.com), Huge thanks for [him](https://github.com/aqsyalraihanjamil/) 🤩
