require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({

    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10

});


app.get("/", function(req, res) {

    res.json({
        message: "Hospital Management API is running"
    });

});


app.get("/api/patients", async function(req, res) {

    try {

        const [rows] = await pool.query(
            "SELECT * FROM patients ORDER BY id DESC"
        );

        res.json(rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});


app.post("/api/patients", async function(req, res) {

    try {

        const {
            name,
            age,
            gender,
            phone,
            disease
        } = req.body;

        if (!name || !age || !gender) {

            return res.status(400).json({
                error: "Name, age and gender are required"
            });

        }

        const [result] = await pool.query(

            `INSERT INTO patients
            (name, age, gender, phone, disease)
            VALUES (?, ?, ?, ?, ?)`,

            [
                name,
                age,
                gender,
                phone || null,
                disease || null
            ]

        );

        res.status(201).json({

            message: "Patient registered successfully",

            id: result.insertId

        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});


app.get("/api/doctors", async function(req, res) {

    try {

        const [rows] = await pool.query(
            "SELECT * FROM doctors ORDER BY name"
        );

        res.json(rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});


app.get("/api/beds", async function(req, res) {

    try {

        const [rows] = await pool.query(
            "SELECT * FROM beds ORDER BY id"
        );

        res.json(rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});


app.get("/api/appointments", async function(req, res) {

    try {

        const [rows] = await pool.query(`

            SELECT
                a.*,
                p.name AS patient_name,
                d.name AS doctor_name

            FROM appointments a

            JOIN patients p
                ON p.id = a.patient_id

            JOIN doctors d
                ON d.id = a.doctor_id

            ORDER BY a.appointment_date

        `);

        res.json(rows);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});


app.post("/api/appointments", async function(req, res) {

    try {

        const {
            patient_id,
            doctor_id,
            appointment_date,
            reason
        } = req.body;

        const [result] = await pool.query(

            `INSERT INTO appointments
            (patient_id, doctor_id, appointment_date, reason)
            VALUES (?, ?, ?, ?)`,

            [
                patient_id,
                doctor_id,
                appointment_date,
                reason || null
            ]

        );

        res.status(201).json({

            message: "Appointment created successfully",

            id: result.insertId

        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});


const PORT = process.env.PORT || 5000;

app.listen(PORT, function() {

    console.log(
        `Server running on port ${PORT}`
    );

});
