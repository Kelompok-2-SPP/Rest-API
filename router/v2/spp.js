const express = require("express");
const services = require("../../data/services");
const {
  FixedResponse,
  authVerify,
  accessLimit,
  checkNull,
} = require("../../domain/utils");
const { errorHandling } = require("../../domain/const");

const app = express();
const spp = services.spp;

app.use(authVerify);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -- GET
app.get("/", async (req, res) => {
  // Fetch data from query params
  const { id_spp, keyword, size, page } = req.query;

  // Check if have id_spp param
  if (id_spp) {
    // Call services getSppbyId
    await spp
      .getSppbyId(id_spp)
      .then((data) => {
        // Check data is found or not
        if (data == errorHandling.NOT_FOUND) {
          res.status(404).json(new FixedResponse((code = res.statusCode)));
          // Return data to user
        } else if (data == errorHandling.BAD_REQ) {
          res.status(400).json(new FixedResponse(res.statusCode));
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
  } else {
    // Call services getSpp
    await spp
      .getSpp(keyword, size, page)
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
app.post("/", accessLimit(["admin"]), async (req, res) => {
  // Fetch data from body
  const { tahun, nominal, angkatan } = req.body;

  // Check if have required body
  if (tahun && nominal && angkatan) {
    // Call services insertSpp
    await spp
      .insSpp(tahun, nominal, angkatan)
      .then((data) => {
        if (data == errorHandling.BAD_REQ) {
          res.status(400).json(new FixedResponse(res.statusCode));
        } else {
          // Return data to user
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
            tahun,
            nominal,
            angkatan,
          })))
      )
    );
  }
});

app.put("/", accessLimit(["admin"]), async (req, res) => {
  // Fetch data from body
  const { id_spp } = req.query;

  // Check if have required body
  if (id_spp) {
    // Call services putSpp
    await spp
      .putSpp(id_spp, req.body)
      .then((data) => {
        // Check if bad req or not
        if (data == errorHandling.BAD_REQ) {
          res.status(400).json(new FixedResponse(res.statusCode));
          // Check if data not found
        } else if (data == errorHandling.NOT_FOUND) {
          res.status(404).json(new FixedResponse((code = res.statusCode)));
          // Return data to user
        } else {
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
            "Required query params is missing !, id_spp, body (optional) tahun or nominal or angkatan")
        )
      );
  }
});

app.delete("/", accessLimit(["admin"]), async (req, res) => {
  // Ftech data from query
  const { id_spp } = req.query;

  // Check if have required query
  if (id_spp) {
    // Call services delSpp
    await spp
      .delSpp(id_spp)
      .then((data) => {
        // Check if data is found or not
        if (data == errorHandling.NOT_FOUND) {
          res.status(404).json(new FixedResponse((code = res.statusCode)));
          // Return data to user
        } else if (data == errorHandling.BAD_REQ) {
          res.status(400).json(new FixedResponse(res.statusCode));
          // Check if data not found
        } else {
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
          (message = "Required query params is missing !, id_spp")
        )
      );
  }
});

module.exports = app;
