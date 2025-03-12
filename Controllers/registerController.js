const db = require('../Config/database');
const bcrypt = require('bcryptjs');
const { email, password } = require('../Models/loginModel');
const logger = require('../Utils/logger');

const register = async (req, res) => {
  try {
    const { _email, _password } = req.body;
    const bcryptSalt = bcrypt.genSaltSync(10); // Generar salt para bcrypt
    password.set(bcrypt.hashSync(_password, bcryptSalt)); // Cifrar la contraseña
    email.set(_email);

    // Registrar usuario en la base de datos
    const result = await db.one('SELECT * FROM registrarUsuario($1, $2)', [email.get(), password.get()]);
    logger.info(`Usuario registrado: ${email.get()}`);
    res.json({ Resultado: result });
  } catch (error) {
    logger.error(`Error al registrar usuario: ${error.message}`);
    res.status(422).json({ msg: 'Error al registrar usuario', error: error.message });
  }
};

module.exports = { register };