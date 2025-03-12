const db = require('../Config/database');
const logger = require('../Utils/logger');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { email, password } = require('../Models/loginModel');
const { idUsuario, emailBD } = require('../Models/usuariosWeb');
const { body, validationResult } = require('express-validator');

const login = async (req, res) => {
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
                }, process.env.JWTSECRET, { expiresIn: '1h' }, (err, token) => {
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
};

module.exports = { login };