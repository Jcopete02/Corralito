const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de conexión
const dbConfig = {
    user: "sa",
    password: "jhoncopete02",
    server: "LaptopJhoimar",   // o el nombre del servidor
    database: "Corralito",
    options: {
        encrypt: false, // Cambiar a true si usas Azure
        trustServerCertificate: true
    }
};
// Login de usuario contra la tabla Usuario
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
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
        res.status(500).send(err.message);
    }
});

// Nueva ruta para obtener la tabla de goleadores
app.get("/api/goleadores", async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
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
        res.status(500).send(err.message);
    }
});

// Nueva ruta para obtener la tabla de asistencias
app.get("/api/asistencias", async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
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
        res.status(500).send(err.message);
    }
});

// Nueva ruta para obtener los jugadores por equipo
app.get("/api/equipos/:id", async (req, res) => {
    const { id } = req.params;
    try {
        let pool = await sql.connect(dbConfig);
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
        res.status(500).send(err.message);
    }
});


// Iniciar servidor
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
