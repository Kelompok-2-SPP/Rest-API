const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.REQ_PORT || 8000;

app.use(cors());

// API V.1.0
const authV1 = require("./router/v1/auth");
const sppV1 = require("./router/v1/spp");
const siswaV1 = require("./router/v1/siswa");
const kelasV1 = require("./router/v1/kelas");
const petugasV1 = require("./router/v1/petugas");
const pembayaranV1 = require("./router/v1/pembayaran");

app.use("/api/v1/auth", authV1);
app.use("/api/v1/spp", sppV1);
app.use("/api/v1/siswa", siswaV1);
app.use("/api/v1/kelas", kelasV1);
app.use("/api/v1/petugas", petugasV1);
app.use("/api/v1/pembayaran", pembayaranV1);

// API V.2.0
// const authV2 = require("./router/v2/auth");
// const sppV2 = require("./router/v2/spp");
// const siswaV2 = require("./router/v2/siswa");
// const kelasV2 = require("./router/v2/kelas");
// const petugasV2 = require("./router/v2/petugas");
// const pembayaranV2 = require("./router/v2/pembayaran");

// app.use("/api/v2/auth", authV2);
// app.use("/api/v2/spp", sppV2);
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
