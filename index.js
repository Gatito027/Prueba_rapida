const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mainRoutes = require('./Routers/mainRoutes');

//*Configuracion de Cors
const dotenv = require('dotenv');
dotenv.config();

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'El origen CORS no está permitido.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,  // Permitir credenciales
};

app.use(cors(corsOptions));
//*Configuracion del helmet
app.use(helmet());
//*Permite usar json
app.use(express.json());
//* Configura el middleware de parsing de cuerpo (body-parser)
app.use(express.urlencoded({ extended: true }));
//* Configura el middleware csurf con protección basada en cookies
app.use(cookieParser());

app.use('/', mainRoutes);

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
