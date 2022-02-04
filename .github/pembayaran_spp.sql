-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 04, 2022 at 05:13 AM
-- Server version: 10.4.22-MariaDB
-- PHP Version: 8.1.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pembayaran_spp`
--

-- --------------------------------------------------------

--
-- Table structure for table `kelas`
--

CREATE TABLE `kelas` (
  `id_kelas` int(11) NOT NULL,
  `nama_kelas` varchar(35) CHARACTER SET utf8mb4 DEFAULT NULL,
  `jurusan` varchar(35) CHARACTER SET utf8mb4 DEFAULT NULL,
  `angkatan` int(11) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `kelas`
--

INSERT INTO `kelas` (`id_kelas`, `nama_kelas`, `jurusan`, `angkatan`, `createdAt`, `updatedAt`) VALUES
(1, 'XII RPL 1', 'RPL', 28, '2022-01-23 09:06:22', '2022-01-23 09:06:22');

-- --------------------------------------------------------

--
-- Table structure for table `pembayaran`
--

CREATE TABLE `pembayaran` (
  `id_pembayaran` int(11) NOT NULL,
  `id_petugas` int(11) DEFAULT NULL,
  `nisn` char(10) CHARACTER SET utf8mb4 DEFAULT NULL,
  `tgl_bayar` date DEFAULT NULL,
  `id_spp` int(11) DEFAULT NULL,
  `bulan_spp` int(2) DEFAULT NULL,
  `tahun_spp` int(4) DEFAULT NULL,
  `jumlah_bayar` int(11) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `pembayaran`
--

INSERT INTO `pembayaran` (`id_pembayaran`, `id_petugas`, `nisn`, `tgl_bayar`, `id_spp`, `bulan_spp`, `tahun_spp`, `jumlah_bayar`, `createdAt`, `updatedAt`) VALUES
(1, NULL, '1', NULL, 1, 7, 2021, NULL, '2022-01-31 10:52:22', '2022-01-31 10:52:22'),
(2, NULL, '1', NULL, 1, 8, 2021, NULL, '2022-01-31 10:52:22', '2022-01-31 10:52:22'),
(3, NULL, '1', NULL, 1, 9, 2021, NULL, '2022-01-31 10:52:22', '2022-01-31 10:52:22'),
(4, NULL, '1', NULL, 1, 10, 2021, NULL, '2022-01-31 10:52:22', '2022-01-31 10:52:22'),
(5, NULL, '1', NULL, 1, 11, 2021, NULL, '2022-01-31 10:52:22', '2022-01-31 10:52:22'),
(6, NULL, '1', NULL, 1, 12, 2021, NULL, '2022-01-31 11:01:12', '2022-01-31 11:01:12'),
(7, NULL, '1', NULL, 1, 1, 2022, NULL, '2022-01-31 11:01:12', '2022-01-31 11:01:12'),
(8, NULL, '1', NULL, 1, 2, 2022, NULL, '2022-02-03 07:30:58', '2022-02-03 07:30:58');

-- --------------------------------------------------------

--
-- Table structure for table `petugas`
--

CREATE TABLE `petugas` (
  `id_petugas` int(11) NOT NULL,
  `username` varchar(25) CHARACTER SET utf8mb4 NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 DEFAULT NULL,
  `nama_petugas` varchar(35) CHARACTER SET utf8mb4 DEFAULT NULL,
  `level` enum('petugas','admin') CHARACTER SET utf8mb4 DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `petugas`
--

INSERT INTO `petugas` (`id_petugas`, `username`, `password`, `nama_petugas`, `level`, `createdAt`, `updatedAt`) VALUES
(1, 'admin', '$2b$10$VAtpnNV7Ka/rGLVgxZV.f.SlwHEU51f/iKim4V6jD5gfCwx4bjaMW', 'admin', 'admin', '2022-01-23 09:00:06', '2022-01-23 09:00:06');

-- --------------------------------------------------------

--
-- Table structure for table `siswa`
--

CREATE TABLE `siswa` (
  `nisn` char(10) CHARACTER SET utf8mb4 NOT NULL,
  `nis` char(8) CHARACTER SET utf8mb4 NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 DEFAULT NULL,
  `nama` varchar(35) CHARACTER SET utf8mb4 DEFAULT NULL,
  `id_kelas` int(11) DEFAULT NULL,
  `alamat` text CHARACTER SET utf8mb4 DEFAULT NULL,
  `no_telp` varchar(13) CHARACTER SET utf8mb4 DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `siswa`
--

INSERT INTO `siswa` (`nisn`, `nis`, `password`, `nama`, `id_kelas`, `alamat`, `no_telp`, `createdAt`, `updatedAt`) VALUES
('1', 'Nis/1', '$2b$10$foZlEcBu0upcqrhg5/Nd6.ldS59h/W3kra6ffrE14k3QMcDSH0h8C', 'admin', 1, 'Indonesia', '0812345678910', '2022-01-23 09:08:03', '2022-01-23 09:08:03');

-- --------------------------------------------------------

--
-- Table structure for table `spp`
--

CREATE TABLE `spp` (
  `id_spp` int(11) NOT NULL,
  `angkatan` int(11) DEFAULT NULL,
  `tahun` int(11) DEFAULT NULL,
  `nominal` int(11) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `spp`
--

INSERT INTO `spp` (`id_spp`, `angkatan`, `tahun`, `nominal`, `createdAt`, `updatedAt`) VALUES
(1, 28, 2021, 400000, '2022-01-23 09:09:45', '2022-01-23 09:09:45');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `kelas`
--
ALTER TABLE `kelas`
  ADD PRIMARY KEY (`id_kelas`),
  ADD UNIQUE KEY `nama_kelas` (`nama_kelas`);

--
-- Indexes for table `pembayaran`
--
ALTER TABLE `pembayaran`
  ADD PRIMARY KEY (`id_pembayaran`),
  ADD KEY `nisn` (`nisn`),
  ADD KEY `id_petugas` (`id_petugas`),
  ADD KEY `id_spp` (`id_spp`);

--
-- Indexes for table `petugas`
--
ALTER TABLE `petugas`
  ADD PRIMARY KEY (`id_petugas`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `siswa`
--
ALTER TABLE `siswa`
  ADD PRIMARY KEY (`nisn`),
  ADD UNIQUE KEY `nis` (`nis`),
  ADD KEY `id_kelas` (`id_kelas`);

--
-- Indexes for table `spp`
--
ALTER TABLE `spp`
  ADD PRIMARY KEY (`id_spp`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `kelas`
--
ALTER TABLE `kelas`
  MODIFY `id_kelas` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pembayaran`
--
ALTER TABLE `pembayaran`
  MODIFY `id_pembayaran` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `petugas`
--
ALTER TABLE `petugas`
  MODIFY `id_petugas` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `spp`
--
ALTER TABLE `spp`
  MODIFY `id_spp` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `pembayaran`
--
ALTER TABLE `pembayaran`
  ADD CONSTRAINT `pembayaran_ibfk_5` FOREIGN KEY (`nisn`) REFERENCES `siswa` (`nisn`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pembayaran_ibfk_6` FOREIGN KEY (`id_petugas`) REFERENCES `petugas` (`id_petugas`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `pembayaran_ibfk_7` FOREIGN KEY (`id_spp`) REFERENCES `spp` (`id_spp`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `siswa`
--
ALTER TABLE `siswa`
  ADD CONSTRAINT `siswa_ibfk_1` FOREIGN KEY (`id_kelas`) REFERENCES `kelas` (`id_kelas`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
