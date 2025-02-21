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
const csurf = require('csurf');
const { body, validationResult } = require('express-validator');
const winston = require('winston');
//* Configuración del logger

/*const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'Logs/app.log' })
    ]
});


if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple()
    }));
  }*/
//* Configuracion de cifrado de token
const jwtSecret = process.env.JWTSECRET;
//* Configuracion de bcrypt 
const bcryptSalt=bcrypt.genSaltSync(10);
//*Configuracion de Cors
app.use(cors({
    origin: '*',
    credentials: true,
    
    //origin: 'http://localhost',
}));
//*Configuracion del helmet
app.use(helmet());
//*Permite usar json
app.use(express.json());
//* Configura el middleware de parsing de cuerpo (body-parser)
app.use(express.urlencoded({ extended: true }));
//* Configura el middleware csurf con protección basada en cookies
app.use(cookieParser());
const csrftProtection = csurf({ cookie: true });
app.use(csurf({ cookie: true }));

app.get('/', (req, res) => {
    res.json('¡Hi, World!, in express');
});

app.get('/test-connection', async (req, res) => {
    try {
        const result = await db.any('SELECT 1');
        res.send('Conexión exitosa: ' + JSON.stringify(result));
    } catch (error) {
        res.send('Error en la conexión: ' + error.message);
    }
});

app.get('/get-csrf-token', (req, res) => {
    const csrfToken = req.csrfToken();
    res.send({ csrfToken: csrfToken });
});

app.post('/login', csrftProtection, async (req, res) => {
  try {
    logger.info('[Info] Iniciando proceso de login');
    //variables de request
    const {_email,_password} = req.body;
    password.set(_password);
    email.set(_email);
    //comprueba credenciales
    const existe = await db.one('SELECT * FROM ExisteUsuario($1)', [email.get()]);
    if(existe.existeusuario){
      const pwdBD = await db.one('SELECT * FROM ObtenerPwdPorEmail($1)', [email.get()]);
      const match = await bcrypt.compare(_password,pwdBD.obtenerpwdporemail);
      if (match){
        const usuarioData = await db.one('SELECT * FROM ObtenerUsuario($1)', [email.get()]); ;
        idUsuario.set(usuarioData.id_usuario);
        emailBD.set(usuarioData.email);
        jwt.sign({
          email: emailBD.get(),
          id: idUsuario.get()
        }, jwtSecret, {}, (err, token) => {
          if (err) {
            logger.error('[Error] Error al generar el token JWT:', err);
            throw err;
          }
          logger.info(`[Info] Token generado: ${token}`);
          res.cookie('token', token).json(emailBD.get());
        });
      }else{
        res.status(422).json({
          error: 'Contraseña incorrecta'
        });
        logger.warn('[Warning] Contraseña incorrecta por el usuario '+email.get());
      }
    }else{
      res.status(422).json({
        error: 'Usuario no encontrado'
      });
    }
  } catch (error) {
    res.send('[Error] Algo a fallado (⊙_⊙)？');
    logger.error('Error en la conexión:', error.message);
  }
});

app.post('/register', csrftProtection, async (req,res) => {
  
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

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
