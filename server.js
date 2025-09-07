const express = require("express");
const sql = require("mssql");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de conexión usando variables de entorno
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: process.env.DB_ENCRYPT === "true",
        trustServerCertificate: false
    }
};

// Crear pool global de conexiones
const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log("✅ Conexión a SQL Server en AWS exitosa");
        return pool;
    })
    .catch(err => {
        console.error("❌ Error de conexión a la BD:", err);
        process.exit(1); // salir si no conecta
    });

// ------------------- RUTAS ------------------- //

// Login de usuario contra la tabla Usuario
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("email", sql.VarChar, email)
            .input("password", sql.VarChar, password)
            .query(`
                SELECT U.UsuarioID, U.NombreUsuario, U.Email, R.NombreRol
                FROM Usuario U
                INNER JOIN Roles R ON U.RolID = R.RolID
                WHERE U.Email = @email AND U.Contraseña = @password
            `);

        if (result.recordset.length > 0) {
            res.json({ success: true, user: result.recordset[0] });
        } else {
            res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
        }
    } catch (err) {
        console.error("❌ Error en login:", err);
        res.status(500).send("Error interno en el servidor");
    }
});

// Ruta para obtener la tabla de goleadores
app.get("/api/goleadores", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT TOP 3 J.Nombre AS Jugador, G.Goles, E.NombreEquipo
            FROM Goleadores G
            JOIN Jugador J ON G.JugadorID = J.JugadorID
            JOIN Equipo E ON G.EquipoID = E.EquipoID
            ORDER BY G.Goles DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error("❌ Error al obtener goleadores:", err);
        res.status(500).send("Error interno en el servidor");
    }
});

// Ruta para obtener la tabla de asistencias
app.get("/api/asistencias", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT TOP 3 J.Nombre AS Jugador, A.Asistencias, E.NombreEquipo
            FROM Asistencias A
            JOIN Jugador J ON A.JugadorID = J.JugadorID
            JOIN Equipo E ON A.EquipoID = E.EquipoID
            ORDER BY A.Asistencias DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error("❌ Error al obtener asistencias:", err);
        res.status(500).send("Error interno en el servidor");
    }
});

// Ruta para obtener jugadores por equipo
app.get("/api/equipos/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("equipoId", sql.Int, id)
            .query(`
                SELECT J.Nombre AS Jugador, J.TipoSangre, J.URLFoto
                FROM Jugador J
                WHERE J.EquipoID = @equipoId
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error("❌ Error al obtener jugadores del equipo:", err);
        res.status(500).send("Error interno en el servidor");
    }
});

// ------------------- INICIO DEL SERVIDOR ------------------- //
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
