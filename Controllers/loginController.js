const db = require('../Config/database');
const logger = require('../Utils/logger');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { email, password } = require('../Models/loginModel');
const { idUsuario, emailBD } = require('../Models/usuariosWeb');
const { validationResult } = require('express-validator');

// Asegúrate de que las variables de entorno estén cargadas
require('dotenv').config();

const login = async (req, res) => {
    try {
        logger.info('Iniciando proceso de login');

        // Validar entrada de usuario
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            logger.error('Error al iniciar sesión: Los valores no son admitidos');
            return res.status(400).json({ errores: errores.array() });
        }

        const { _email, _password } = req.body;
        email.set(_email);
        password.set(_password);

        // Comprobar existencia del usuario
        const existe = await db.one('SELECT * FROM ExisteUsuario($1)', [email.get()]);
        if (!existe.existeusuario) {
            logger.warn('El usuario ' + email.get() + ' no existe');
            return res.status(422).json({ msg: 'Usuario no encontrado' });
        }

        // Obtener contraseña del usuario
        const pwdBD = await db.one('SELECT * FROM ObtenerPwdPorEmail($1)', [email.get()]);
        const match = await bcrypt.compare(_password, pwdBD.obtenerpwdporemail);

        // Verificar contraseña
        if (!match) {
            logger.warn('Contraseña incorrecta por el usuario ' + email.get());
            return res.status(422).json({ msg: 'Contraseña incorrecta' });
        }

        // Obtener datos del usuario
        const usuarioData = await db.one('SELECT * FROM ObtenerUsuario($1)', [email.get()]);
        idUsuario.set(usuarioData.id_usuario);
        emailBD.set(usuarioData.email);

        // Generar JWT
        jwt.sign({
            email: emailBD.get(),
            id: idUsuario.get()
        }, process.env.JWTSECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) {
                logger.error('Error al generar el token JWT:', err);
                return res.status(500).json({ msg: 'Error al generar el token' });
            }
            logger.info(`Token generado para: ${email.get()}`);
            res.cookie('token', token, {
                sameSite: 'none', // Permite el uso de la cookie en contextos entre sitios
                secure: true,     // Solo envía la cookie sobre HTTPS
                httpOnly: true    // Previene el acceso a la cookie desde JavaScript
            }).json(emailBD.get());
        });

    } catch (error) {
        logger.error('Error grave:', error.message);
        res.status(500).json({ msg: 'Algo ha fallado (⊙_⊙)？' });
    }
};

module.exports = { login };
