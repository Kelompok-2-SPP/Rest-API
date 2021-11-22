const express = require("express")
const models = require("../models/index")
const md5 = require("md5")
const jwt = require("jsonwebtoken")

const app = express()
const petugas = models.petugas
const siswa = models.siswa

let SECRET_KEY = {
    petugas: "petugasSPP",
    siswa: "siswaSPP"
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post("/", async(req, res) => {
    if (req.body.username) {
        await petugas.findOne({ where: { username: req.body.username } })
            .then(found => {
                if (found.password == md5(req.body.password)) {
                    res.status(200).json({
                        status: res.statusCode,
                        message: "Authorized",
                        details: {
                            logged: true,
                            token: jwt.sign(JSON.stringify(found), SECRET_KEY.petugas)
                        }
                    })
                } else {
                    res.status(401).json({
                        status: res.statusCode,
                        message: "Unauthorized",
                        details: {
                            logged: false,
                            token: null
                        }
                    })
                }
            })
            .catch(error => {
                res.status(500).json({
                    status: res.statusCode,
                    message: "Something went wrong on server side",
                    details: error.message
                })
            })
    } else if (req.body.nisn) {
        await siswa.findOne({ where: { nisn: req.body.nisn } })
            .then(found => {
                if (found.password == md5(req.body.password)) {
                    res.status(200).json({
                        status: res.statusCode,
                        message: "Authorized",
                        details: {
                            logged: true,
                            token: jwt.sign(JSON.stringify(found), SECRET_KEY.petugas)
                        }
                    })
                } else {
                    res.status(401).json({
                        status: res.statusCode,
                        message: "Unauthorized",
                        details: {
                            logged: false,
                            token: null
                        }
                    })
                }
            })
            .catch(error => {
                res.status(500).json({
                    status: res.statusCode,
                    message: "Something went wrong on server side",
                    details: error.message
                })
            })
    } else {
        res.status(422).json({
            status: res.statusCode,
            message: "Required body is missing !",
            details: 'Needed body is username or nisn, password'
        })
    }
})


module.exports = app