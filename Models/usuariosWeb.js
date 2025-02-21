const idUsuario = {
    get: function() { return this._idUsuario; },
    set: function(value) { this._idUsuario = value; }
};

const nombre = {
    get: function() { return this._nombre; },
    set: function(value) { this._nombre = value; }
};

const emailBD = {
    get: function() { return this._email; },
    set: function(value) { this._email = value; }
};

const passwordBD = {
    get: function() { return this._passwordBD; },
    set: function(value) { this._passwordBD = value; }
};

const telefono = {
    get: function() { return this._telefono; },
    set: function(value) { this._telefono = value; }
};

const rol = {
    get: function() { return this._rol; },
    set: function(value) { this._rol = value; }
};

const estado = {
    get: function() { return this._estado; },
    set: function(value) { this._estado = value; }
};

const fechaRegistro = {
    get: function() { return this._fechaRegistro; },
    set: function(value) { this._fechaRegistro = value; }
};

const sucursalId = {
    get: function() { return this._sucursalId; },
    set: function(value) { this._sucursalId = value; }
};

module.exports = { idUsuario, nombre, emailBD, passwordBD, telefono, rol, estado, fechaRegistro, sucursalId };