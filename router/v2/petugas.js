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
const petugas = services.petugas;

app.use(authVerify);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -- GET
app.get("/", async (req, res) => {
  // Fetch data from query params
  const { id_petugas, keyword, size, page } = req.query;

  // Check if have id_petugas param
  if (id_petugas) {
    // Call services getPetugasbyId
    await petugas
      .getPetugasbyId(id_petugas)
      .then((data) => {
        switch (data) {
          // Check data is found or not
          case errorHandling.NOT_FOUND:
            res.status(404).json(new FixedResponse((code = res.statusCode)));
            break;
          case errorHandling.BAD_REQ:
            res.status(400).json(new FixedResponse(res.statusCode));
            break;
          // Return data to user
          default:
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
    // Call services getPetugas
    await petugas
      .getPetugas(keyword, size, page)
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
  const { username, nama_petugas, password, level } = req.body;

  // Check if have required body
  if (username && nama_petugas && password) {
    // Call services insertPetugas
    await petugas
      .insPetugas(username, nama_petugas, password, level)
      .then((data) => {
        switch (data) {
          case errorHandling.BAD_REQ:
            res.status(400).json(new FixedResponse(res.statusCode));
            break;
          case errorHandling.DOUBLE_DATA:
            res
              .status(409)
              .json(
                new FixedResponse(
                  (code = res.statusCode),
                  (message =
                    "Username " +
                    username +
                    " has been used, try different username")
                )
              );
            break;
          // Return data to user
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
    res.status(422).json(
      new FixedResponse(
        (code = res.statusCode),
        (message =
          "Required body is missing !" +
          (await checkNull({
            username,
            nama_petugas,
            password,
            level,
          })))
      )
    );
  }
});

app.put("/", accessLimit([roles.admin]), async (req, res) => {
  // Fetch data from body
  const { id_petugas } = req.query;
  const { username } = req.body;

  // Check if have required body
  if (id_petugas) {
    // Call services putPetugas
    await petugas
      .putPetugas(id_petugas, req.body)
      .then((data) => {
        switch (data) {
          // Check if bad req or not
          case errorHandling.BAD_REQ:
            res.status(400).json(new FixedResponse(res.statusCode));
            break;
          case errorHandling.DOUBLE_DATA:
            res
              .status(409)
              .json(
                new FixedResponse(
                  (code = res.statusCode),
                  (message =
                    "Username " +
                    username +
                    " has been used, try different username")
                )
              );
            break;
          // Check if data not found
          case errorHandling.NOT_FOUND:
            res.status(404).json(new FixedResponse((code = res.statusCode)));
            break;
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
            "Required query params is missing !, id_petugas, body (optional) username or nama_petugas or password or level")
        )
      );
  }
});

app.delete("/", accessLimit([roles.admin]), async (req, res) => {
  // Ftech data from query
  const { id_petugas } = req.query;

  // Check if have required query
  if (id_petugas) {
    // Call services delPetugas
    await petugas
      .delPetugas(id_petugas)
      .then((data) => {
        switch (data) {
          // Check if data is found or not
          case errorHandling.NOT_FOUND:
            res.status(404).json(new FixedResponse((code = res.statusCode)));
            break;
          case errorHandling.BAD_REQ:
            res.status(400).json(new FixedResponse(res.statusCode));
            break;
          // Return data to user
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
          (message = "Required query params is missing !, id_petugas")
        )
      );
  }
});

module.exports = app;
