const express = require('express');
const app = express();
const port = 3000;
const db = require('./Config/database.js');
//const login = require('./Controllers/login.js');
const { email, password } = require('./Models/loginModel.js');
const { idUsuario, nombre, emailBD, passwordBD, telefono, rol, estado, fechaRegistro, sucursalId } = require('./Models/usuariosWeb.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
//const csrf = require('csurf');
const { body, validationResult } = require('express-validator');
const winston = require('winston');
const rateLimit = require('express-rate-limit');

//* Configuración del logger

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'app.log' })
    ]
});


if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple()
    }));
  }
//* Configuracion de cifrado de token
const jwtSecret = process.env.JWTSECRET;
//* Configuracion de bcrypt 
const bcryptSalt=bcrypt.genSaltSync(10);
//*Configuracion de Cors
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'https://gatito027.vercel.app', 'https://arquitec.vercel.app', 'http://192.168.56.1:3001'];

/*app.use(cors({
    //origin: '*',
    credentials: true,
    origin: 'http://localhost',
}));*/
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
/*app.use((req, res, next) => {
  console.log('CORS headers:', res.getHeaders());
  next();
});*/


//*Configuracion del helmet
app.use(helmet());
//*Permite usar json
app.use(express.json());
//* Configura el middleware de parsing de cuerpo (body-parser)
app.use(express.urlencoded({ extended: true }));
//* Configura el middleware csurf con protección basada en cookies
app.use(cookieParser());
/*var parseForm = bodyParser.urlencoded({ extended: false })
const csrftProtection = csrf({ cookie: true});
app.use(csrf({ cookie: true }));
*/


//*Configurar limitador
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 5 intentos
  message: 'Demasiados intentos de login, intenta más tarde',
});

app.get('/', (req, res) => {
    res.json('¡Hi, World!, in express');
});

app.get('/cookies', function (req, res) {
  // Cookies that have not been signed
  console.log('Cookies: ', req.cookies);

  // Cookies that have been signed
  console.log('Signed Cookies: ', req.signedCookies);
  res.json({Cookies: req.cookies, SignedCookies: req.signedCookies});
});

app.get('/test-connection', async (req, res) => {
    try {
        const result = await db.any('SELECT 1');
        res.send('Conexión exitosa: ' + JSON.stringify(result));
    } catch (error) {
        res.send('Error en la conexión: ' + error.message);
    }
});

/*app.get('/get-csrf-token', (req, res) => {
    const csrfToken = req.csrfToken();
    res.cookie('XSRF-TOKEN', csrfToken, { 
      httpOnly: true, 
      secure: true, 
      domain: 'gatito027.vercel.app',
      sameSite: 'None', 
      path: '/', });  // Configurar la cookie
    console.log('CSRF Token generado:', csrfToken);
    console.log('Cookies enviadas:', res.getHeaders()['set-cookie']);
    res.send({ csrfToken: csrfToken });
});*/


app.post('/login', loginLimiter,
  [
    body('_email').isEmail().withMessage('Email inválido'),
    body('_password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
  ], async (req, res) => {
  try {
    logger.info('Iniciando proceso de login');
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      logger.error('Error al iniciar sesión: Los valores no son admitidos');
      return res.status(400).json({ errores: errores.array() });
    }

    const { _email, _password } = req.body;
    password.set(_password);
    email.set(_email);

    const existe = await db.one('SELECT * FROM ExisteUsuario($1)', [email.get()]);
    if (existe.existeusuario) {
      const pwdBD = await db.one('SELECT * FROM ObtenerPwdPorEmail($1)', [email.get()]);
      const match = await bcrypt.compare(_password, pwdBD.obtenerpwdporemail);
      if (match) {
        const usuarioData = await db.one('SELECT * FROM ObtenerUsuario($1)', [email.get()]);
        idUsuario.set(usuarioData.id_usuario);
        emailBD.set(usuarioData.email);
        jwt.sign({
          email: emailBD.get(),
          id: idUsuario.get()
        }, jwtSecret, { expiresIn: '1h' }, (err, token) => {
          if (err) {
            logger.error('Error al generar el token JWT:', err);
            throw err;
          }
          logger.info(`Token generado para: ${email.get()}`);
          res.cookie('token', token, {
            sameSite: 'none', // Permite el uso de la cookie en contextos entre sitios
            secure: true,     //! Solo envía la cookie sobre HTTPS
            httpOnly: false    // Opcional: previene el acceso a la cookie desde JavaScript
          }).json(emailBD.get());
        });
      } else {
        res.status(422).json({ msg: 'Contraseña incorrecta' });
        logger.warn('Contraseña incorrecta por el usuario ' + email.get());
      }
    } else {
      res.status(422).json({ msg: 'Usuario no encontrado' });
      logger.warn('El usuario ' + email.get() + ' no existe');
    }
  } catch (error) {
    res.status(422).json({ msg: 'Algo a fallado (⊙_⊙)？' });
    logger.error('Error grave:', error.message);
  }
});

app.post('/logout', (req,res) => {
  try {
    logger.info('Token finalizado');
    res.cookie('token','').json(true);
  } catch (error) {
    logger.error('Error al borrar token');
    res.status(422).json({ msg: 'Algo a fallado (⊙_⊙)？' });
  }
});


app.post('/register', async (req,res) => {
  
  try{
    const {_email,_password} = req.body;
    password.set(bcrypt.hashSync(_password,bcryptSalt));
    email.set(_email);
    //registrarUsuario
    const result = await db.one('SELECT * FROM registrarUsuario($1, $2)', [email.get(), password.get()]);
    res.json({Resultado: result});
  }catch(e){
      res.status(422).json(e);
  }
});

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
    logger.error('Error grave al consultar la planeacion');
    res.status(422).json({ msg: 'Algo ha fallado (⊙_⊙)？' });
  }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
