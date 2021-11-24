"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class siswa extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.kelas, {
        foreignKey: "id_kelas",
        as: "kelas",
      });
      this.hasMany(models.pembayaran, {
        foreignKey: "nisn",
        as: "pembayaran",
      });
    }
  }
  siswa.init(
    {
      nisn: {
        type: DataTypes.CHAR,
        primaryKey: true,
        allowNull: false,
      },
      nis: {
        type: DataTypes.CHAR,
        unique: true,
      },
      password: DataTypes.STRING,
      nama: DataTypes.STRING,
      id_kelas: DataTypes.INTEGER,
      alamat: DataTypes.TEXT,
      no_telp: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "siswa",
      tableName: "siswa",
    }
  );
  return siswa;
};
