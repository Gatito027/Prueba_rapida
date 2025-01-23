const express = require('express');
const app = express();
const port = 3000;
const db = require('./database.js');

app.use(express.json());

app.get('/', (req, res) => {
    res.json('¡Hi, World!, in express');
});

app.get('/database', async (req, res) => {
    try {
        const query = await db.any('SELECT * FROM usuarios');
        res.json(query);
    } catch (error) {
        res.status(500).json('Error');
        console.error(error);
    }
    
});

app.get('/test-connection', async (req, res) => {
    try {
        const result = await db.any('SELECT 1');
        res.send('Conexión exitosa: ' + JSON.stringify(result));
    } catch (error) {
        res.send('Error en la conexión: ' + error.message);
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
