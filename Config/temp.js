const bcrypt = require('bcrypt');

app.post('/login', csrftProtection, async (req, res) => {
  try {
    logger.info('Iniciando proceso de login');
    // variables de request
    const { _email, _password } = req.body;
    logger.info(`Email: ${_email}, Password: ${_password}`);
    
    password.set(_password);
    email.set(_email);
    
    // comprueba credenciales
    const existe = await db.one('SELECT * FROM ExisteUsuario($1)', [email.get()]);
    logger.info(`Resultado de ExisteUsuario: ${JSON.stringify(existe)}`);
    
    if (existe.existeusuario) {
      const pwdBD = await db.one('SELECT * FROM ObtenerPwdPorEmail($1)', [email.get()]);
      logger.info(`Contraseña obtenida de la base de datos: ${JSON.stringify(pwdBD)}`);
      
      const match = await bcrypt.compare(_password, pwdBD.obtenerpwdporemail);
      logger.info(`Resultado de comparación de contraseñas: ${match}`);
      
      if (match) {
        const usuarioData = await db.one('SELECT * FROM ObtenerUsuario($1)', [email.get()]);
        logger.info(`Datos del usuario: ${JSON.stringify(usuarioData)}`);
        
        idUsuario.set(usuarioData.id_usuario);
        emailBD.set(usuarioData.email);
        
        jwt.sign({
          email: emailBD.get(),
          id: idUsuario.get()
        }, jwtSecret, {}, (err, token) => {
          if (err) {
            logger.error('Error al generar el token JWT:', err);
            throw err;
          }
          logger.info(`Token generado: ${token}`);
          res.cookie('token', token).json(emailBD.get());
        });
      } else {
        logger.warn('Contraseña incorrecta');
        res.status(422).json({
          error: 'Contraseña incorrecta'
        });
      }
    } else {
      logger.warn('Usuario no encontrado');
      res.status(422).json({
        error: 'Usuario no encontrado'
      });
    }
  } catch (error) {
    logger.error('Error en la conexión:', error);
    res.send('Error en la conexión: ' + error.message);
  }
});
