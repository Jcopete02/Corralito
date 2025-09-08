const sql = require("mssql");

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

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const pool = await new sql.ConnectionPool(dbConfig).connect();
        const result = await pool.request().query(`
            SELECT TOP 3 J.Nombre AS Jugador, G.Goles, E.NombreEquipo
            FROM Goleadores G
            JOIN Jugador J ON G.JugadorID = J.JugadorID
            JOIN Equipo E ON G.EquipoID = E.EquipoID
            ORDER BY G.Goles DESC
        `);
        
        res.json(result.recordset);
        await pool.close();
    } catch (err) {
        console.error("❌ Error al obtener goleadores:", err);
        res.status(500).json({ error: "Error interno en el servidor" });
    }
}