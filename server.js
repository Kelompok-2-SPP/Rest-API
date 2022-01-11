const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 8000;

app.use(cors());

// API V.1.0
const routerv1 = require("./router/v1")

app.use("/api/v1/auth", routerv1.auth);
app.use("/api/v1/spp", routerv1.spp);
app.use("/api/v1/siswa", routerv1.siswa);
app.use("/api/v1/kelas", routerv1.kelas);
app.use("/api/v1/petugas", routerv1.petugas);
app.use("/api/v1/pembayaran", routerv1.pembayaran);

// API V.2.0
// const routerV2 = require("./router/v2");

// app.use("/api/v2/auth", require("./router/v2/auth"));
// app.use("/api/v2/kelas", require("./router/v2/kelas"));
// app.use("/api/v2/siswa", siswaV2);
// app.use("/api/v2/kelas", kelasV2);
// app.use("/api/v2/petugas", petugasV2);
// app.use("/api/v2/pembayaran", pembayaranV2);

// // API DOCUMENTATION
// app.get("/api", function (req, res) {
//   res.redirect("https://app.example.io");
// });

app.use(express.static(__dirname));

app.listen(port, () => {
  console.log("Runing in port", port);
});
