const mongoose = require('mongoose');


const UsuarioSchema = mongoose.model('Usuario', {
    steamid: {type: String, required: true},
    nome: {type: String, required: true},
    rifasganhas: [String]
});

module.exports = UsuarioSchema;
