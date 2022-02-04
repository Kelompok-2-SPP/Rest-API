const express = require("express");
const services = require("../../data/services");
const {
  FixedResponse,
  authVerify,
  accessLimit,
  checkNull,
} = require("../../domain/utils");
const { errorHandling, roles } = require("../../domain/const");

const app = express();
const kelas = services.kelas;

app.use(authVerify);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -- GET
app.get("/", async (req, res) => {
  // Fetch data from query params
  const { id_kelas, keyword, size, page } = req.query;

  // Check if have id_kelas param
  if (id_kelas) {
    // Call services getKelasbyId
    await kelas
      .getKelasbyId(id_kelas)
      .then((data) => {
        // Check data is found or not
        switch (data) {
          case errorHandling.NOT_FOUND:
            res.status(404).json(new FixedResponse(res.statusCode));
            break;
          case errorHandling.BAD_REQ:
            res.status(400).json(new FixedResponse(res.statusCode));
            break;
          default:
            // Return data to user
            res
              .status(200)
              .json(
                new FixedResponse(
                  (code = res.statusCode),
                  (message = ""),
                  (details = data)
                )
              );
        }
        // Throw if have server error
      })
      .catch((err) => {
        res.status(500).json(new FixedResponse(res.statusCode, err.message));
      });
  } else {
    // Call services getKelas
    await kelas
      .getKelas(keyword, size, page)
      .then((data) => {
        // Check data is found or not
        if (data == errorHandling.NOT_FOUND) {
          res.status(404).json(new FixedResponse((code = res.statusCode)));
          // Return data to user
        } else {
          res
            .status(200)
            .json(
              new FixedResponse(
                (code = res.statusCode),
                (message = ""),
                (details = data)
              )
            );
        }
        // Throw if have server error
      })
      .catch((err) => {
        res.status(500).json(new FixedResponse(res.statusCode, err.message));
      });
  }
});

// -- POST
app.post("/", accessLimit([roles.admin]), async (req, res) => {
  // Fetch data from body
  const { nama_kelas, jurusan, angkatan } = req.body;

  // Check if have required body
  if (nama_kelas && jurusan && angkatan) {
    // Call services insertKelas
    await kelas
      .insKelas(nama_kelas, jurusan, angkatan)
      .then((data) => {
        // Check if double data or not
        switch (data) {
          case errorHandling.DOUBLE_DATA:
            res
              .status(409)
              .json(
                new FixedResponse(
                  (code = res.statusCode),
                  (message =
                    "Nama kelas " +
                    nama_kelas +
                    " has been used, try different nama_kelas")
                )
              );
            break;
          case errorHandling.BAD_REQ:
            res.status(400).json(new FixedResponse(res.statusCode));
            break;
          default:
            res
              .status(201)
              .json(
                new FixedResponse(
                  (code = res.statusCode),
                  (message = "Data sucessfully inserted"),
                  (details = data)
                )
              );
        }
        // Throw if have server error
      })
      .catch((err) => {
        res.status(500).json(new FixedResponse(res.statusCode, err.message));
      });
  } else {
    // Throw error to user
    res
      .status(422)
      .json(
        new FixedResponse(
          (code = res.statusCode),
          (message =
            "Required body is missing !" +
            (await checkNull({ nama_kelas, jurusan, angkatan })))
        )
      );
  }
});

// -- PUT
app.put("/", accessLimit([roles.admin]), async (req, res) => {
  // Fetch data from body
  const { nama_kelas } = req.body;
  const { id_kelas } = req.query;

  // Check if have required body
  if (id_kelas) {
    // Call services putKelas
    await kelas
      .putKelas(id_kelas, req.body)
      .then((data) => {
        // Check if double data or not
        switch (data) {
          case errorHandling.DOUBLE_DATA:
            res
              .status(409)
              .json(
                new FixedResponse(
                  (code = res.statusCode),
                  (message =
                    "Nama kelas " +
                    nama_kelas +
                    " has been used, try different nama_kelas")
                )
              );
            break;
          // Check if data not found
          case errorHandling.BAD_REQ:
            res.status(400).json(new FixedResponse(res.statusCode));
            break;
          case errorHandling.NOT_FOUND:
            res.status(404).json(new FixedResponse(res.statusCode));
            break;
          // Return data to user
          default:
            res
              .status(200)
              .json(
                new FixedResponse(
                  (code = res.statusCode),
                  (message = "Data sucessfuly updated"),
                  (details = data)
                )
              );
        }
        // Throw if have server error
      })
      .catch((err) => {
        res.status(500).json(new FixedResponse(res.statusCode, err.message));
      });
  } else {
    // Throw error to user
    res
      .status(422)
      .json(
        new FixedResponse(
          (code = res.statusCode),
          (message =
            "Required query params is missing !, id_kelas. body (optional) nama_kelas or jurusan or angkatan")
        )
      );
  }
});

// -- DELETE
app.delete("/", accessLimit([roles.admin]), async (req, res) => {
  // Ftech data from query
  const { id_kelas } = req.query;

  // Check if have required query
  if (id_kelas) {
    // Call services delKelas
    await kelas
      .delKelas(id_kelas)
      .then((data) => {
        switch (data) {
          // Check if data is found or not
          case errorHandling.NOT_FOUND:
            res.status(404).json(new FixedResponse(res.statusCode));
            break;
          case errorHandling.BAD_REQ:
            res.status(400).json(new FixedResponse(res.statusCode));
            break;
          default:
            res
              .status(200)
              .json(
                new FixedResponse(
                  (code = res.statusCode),
                  (message = "Data sucessfuly deleted"),
                  (details = data)
                )
              );
        }
      })
      .catch((err) => {
        res.status(500).json(new FixedResponse(res.statusCode, err.message));
      });
  } else {
    // Throw error to user
    res
      .status(422)
      .json(
        new FixedResponse(
          (code = res.statusCode),
          (message = "Required query params is missing !, id_kelas")
        )
      );
  }
});

module.exports = app;
