const express = require('express');
const app = express();
const port = 3000;
const db = require('./database.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const { body, validationResult } = require('express-validator');
const winston = require('winston');
//* Configuración del logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    // Registrar en un archivo
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
//* Configuracion de cifrado de token
const jwtSecret = process.env.JWTSECRET;
//* Configuracion de bcrypt 
const bcryptSalt=bcrypt.genSaltSync(10);
//*Configuracion de Cors
app.use(cors({
    credentials: true,
    origin: 'http://localhost',
}));
//*Configuracion del helmet
app.use(helmet());
//*Permite usar json
app.use(express.json());
//* Configura el middleware de parsing de cookies
app.use(cookieParser());
//* Configura el middleware de parsing de cuerpo (body-parser)
app.use(express.urlencoded({ extended: true }));
//* Configura el middleware csurf con protección basada en cookies
const csrfProtection = csurf({ cookie: true });
app.use(csrfProtection);

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
