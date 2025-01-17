const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.json('¡Hi, World!, in express');
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
