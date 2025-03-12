const express = require('express');
const app = express();
const port = 3000;
const db = require('./Config/database.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { body, validationResult } = require('express-validator');
const logger = require('./Utils/logger');
const authRoutes = require('./Routers/testRoutes.js');
const loginRoutes = require('./Routers/loginRutes.js');
const registerRoutes = require('./Routers/registerRoutes');
const logoutRoutes = require('./Routers/logoutRutes.js');

//* Configuracion de cifrado de token
const jwtSecret = process.env.JWTSECRET;
//*Configuracion de Cors
//Todo: Quitar origenes de desarrollo
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'https://gatito027.vercel.app', 'https://arquitec.vercel.app', 'http://192.168.56.1:3001'];

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


app.use('/', authRoutes);
app.use('/', loginRoutes);
app.use('/', registerRoutes);
app.use('/', logoutRoutes);

app.get('/obtener-sucursales', async (req, res) => {
  try {
    const {token} = req.cookies;
    logger.info('Obtencion de sucursales iniciada');
    if (token){
      jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        const response = await db.query('SELECT * FROM ObtenerSucursales()');
        res.json(response);
      });
    }else{
      logger.warning('Se recibio un token no valido');
      res.status(401).json({msg:'Token no valido'});
    }
  } catch (error) {
    logger.error('Error grave al consultar');
    res.status(422).json({ msg: 'Algo a fallado (⊙_⊙)？' });
  }
});

app.get('/consulta-filtro', [body('_sucursalId').notEmpty().withMessage('El ID de la sucursal es requerido').isInt().withMessage('El ID de la sucursal debe ser un número entero'),], async (req, res) => {
  try {
    const { token } = req.cookies;
    const { _sucursalId } = req.body;
    logger.info('Obtencion de planeacion por sucursal iniciada');
    if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) {
          logger.warning('Token no valido');
          return res.status(401).json({ msg: 'Token no valido' });
        }
        try {
          const response = await db.query('SELECT * FROM ObtenerPlaneacion(int $1)', [_sucursalId]);
          res.json(response);
        } catch (dbError) {
          logger.error('Error en la consulta a la base de datos');
          res.status(500).json({ msg: 'Error en la consulta a la base de datos'});
        }
      });
    } else {
      logger.warning('Se recibio un token no valido');
      res.status(401).json({ msg: 'Token no valido' });
    }
  } catch (error) {
    logger.error('Error grave al consultar por sucursal');
    res.status(422).json({ msg: 'Algo ha fallado (⊙_⊙)？' });
  }
});


//consulta fecha
app.get('/consulta-filtro-fecha', [body('_fecha').notEmpty().withMessage('La fecha es requerida').isDate().withMessage('La fecha debe tener un formato válido (YYYY-MM-DD)'),], async (req, res) => {
  try {
    const { token } = req.cookies;
    const { _fecha } = req.body;
    logger.info('Obtencion de planeacion por fecha iniciada');
    if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) {
          logger.warning('Token no valido');
          return res.status(401).json({ msg: 'Token no valido' });
        }
        try {
          const response = await db.query('SELECT * FROM ObtenerPlaneacion(date $1)', [_fecha]);
          res.json(response);
        } catch (dbError) {
          logger.error('Error en la consulta a la base de datos');
          res.status(500).json({ msg: 'Error en la consulta a la base de datos'});
        }
      });
    } else {
      logger.warning('Se recibio un token no valido');
      res.status(401).json({ msg: 'Token no valido' });
    }
  } catch (error) {
    logger.error('Error grave al consultar por fecha');
    res.status(422).json({ msg: 'Algo ha fallado (⊙_⊙)？' });
  }
});

//consulta por estado
app.get('/consulta-filtro-estado', [
  body('_estado')
    .notEmpty().withMessage('El estado es requerido')
    .isString().withMessage('El estado debe ser una cadena de texto')
    .isLength({ max: 20 }).withMessage('El estado no puede tener más de 20 caracteres'),
], async (req, res) => {
  try {
    const { token } = req.cookies;
    const { _estado } = req.body;
    logger.info('Obtencion de planeacion por estado iniciada');
    if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) {
          logger.warning('Token no valido');
          return res.status(401).json({ msg: 'Token no valido' });
        }
        try {
          const response = await db.query('SELECT * FROM ObtenerPlaneacion(varchar $1)', [_estado]);
          res.json(response);
        } catch (dbError) {
          logger.error('Error en la consulta a la base de datos');
          res.status(500).json({ msg: 'Error en la consulta a la base de datos'});
        }
      });
    } else {
      logger.warning('Se recibio un token no valido');
      res.status(401).json({ msg: 'Token no valido' });
    }
  } catch (error) {
    logger.error('Error grave al consultar por estado');
    res.status(422).json({ msg: 'Algo ha fallado (⊙_⊙)？' });
  }
});

//consulta existencia de produccion
app.get('/consulta-existecia-produccion', [
  body('_sucursalId').notEmpty().withMessage('El ID de la sucursal es requerido').isInt().withMessage('El ID de la sucursal debe ser un número entero'),
  body('_fecha').notEmpty().withMessage('La fecha es requerida').isDate().withMessage('La fecha debe tener un formato válido (YYYY-MM-DD)'),
  body('_produccionEstimada').notEmpty().withMessage('La producción estimada es requerida').isNumeric().withMessage('La producción estimada debe ser un número'),
  body('_estado')
    .notEmpty().withMessage('El estado es requerido')
    .isString().withMessage('El estado debe ser una cadena de texto')
    .isLength({ max: 20 }).withMessage('El estado no puede tener más de 20 caracteres'),
], async (req, res) => {
  try {
    const { token } = req.cookies;
    const { _sucursalId, _fecha, _produccionEstimada, _estado } = req.body;
    logger.info('Obtencion de planeacion por estado iniciada');
    if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) {
          logger.warning('Token no valido');
          return res.status(401).json({ msg: 'Token no valido' });
        }
        try {
          const response = await db.one('SELECT * FROM ExistePlaneacion($1,date $2, $3, $4)', [_sucursalId, _fecha, _produccionEstimada, _estado]);
          res.json(response);
        } catch (dbError) {
          logger.error('Error en la consulta a la base de datos');
          res.status(500).json({ msg: 'Error en la consulta a la base de datos'});
        }
      });
    } else {
      logger.warning('Se recibio un token no valido');
      res.status(401).json({ msg: 'Token no valido' });
    }
  } catch (error) {
    logger.error('Error grave al consultar por estado');
    res.status(422).json({ msg: 'Algo ha fallado (⊙_⊙)？' });
  }
});

app.get('/obtener-planeacion', async (req, res) => {
  try {
    const { token } = req.cookies;
    logger.info('Obtencion de planeacion iniciada');
    if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) {
          logger.warning('Token no valido');
          return res.status(401).json({ msg: 'Token no valido' });
        }
        try {
          const response = await db.query('SELECT * FROM ObtenerPlaneacion()');
          res.json(response);
        } catch (dbError) {
          logger.error('Error en la consulta a la base de datos');
          res.status(500).json({ msg: 'Error en la consulta a la base de datos'});
        }
      });
    } else {
      logger.warning('Se recibio un token no valido');
      res.status(401).json({ msg: 'Token no valido' });
    }
  } catch (error) {
    logger.error('Error grave al consultar la consulta');
    res.status(422).json({ msg: 'Algo ha fallado (⊙_⊙)？' });
  }
});

app.get('/ValidarToken', async (req, res) => {
  try {
    const {token} = req.cookies;
    logger.info('Consulta de token');
    if (token){
      jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        res.json({msg: true});
      });
    }else{
      logger.warning('Se recibio un token no valido');
      res.status(401).json({msg:false});
    }
  } catch (error) {
    logger.error('Error grave al consultar');
    res.status(422).json({ msg: 'Algo a fallado (⊙_⊙)？' });
  }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
