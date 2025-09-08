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

module.exports = async function handler(req, res) {
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

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID del equipo es requerido' });
    }

    try {
        const pool = await new sql.ConnectionPool(dbConfig).connect();
        const result = await pool.request()
            .input("equipoId", sql.Int, parseInt(id))
            .query(`
                SELECT J.Nombre AS Jugador, J.TipoSangre, J.URLFoto
                FROM Jugador J
                WHERE J.EquipoID = @equipoId
            `);
        
        res.json(result.recordset);
        await pool.close();
    } catch (err) {
        console.error("❌ Error al obtener jugadores del equipo:", err);
        res.status(500).json({ error: "Error interno en el servidor" });
    }
}
