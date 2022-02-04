// Error handling
const errorHandling = {
  DOUBLE_DATA: "Double data",
  INDEX_NOT_FOUND: "Foreign key not found",
  NOT_FOUND: "Data were not found",
  BAD_REQ: "Bad request",
};

// Dbb Config
const dbConfig = {
  username: "root",
  password: null,
  database: "pembayaran_spp",
  host: "127.0.0.1",
  dialect: "mysql",
  timezone: "+07:00",
};

// Secret key dict
const secretKey = {
  petugas: "petugasSPP",
  siswa: "siswaSPP",
};

// Roles
const roles = {
  admin: "admin",
  petugas: "petugas",
};

module.exports = {
  errorHandling,
  dbConfig,
  secretKey,
  roles,
};
