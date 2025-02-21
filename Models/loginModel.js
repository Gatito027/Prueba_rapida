const email = {
    get: function() { return this._email; },
    set: function(value) { this._email = value; }
};

const password = {
    get: function() { return this._password; },
    set: function(value) { this._password = value; }
};

module.exports = { email, password };
