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
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { email, password } = req.body;

    try {
        const pool = await new sql.ConnectionPool(dbConfig).connect();
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

        await pool.close();
    } catch (err) {
        console.error("❌ Error en login:", err);
        res.status(500).json({ error: "Error interno en el servidor" });
    }
}
