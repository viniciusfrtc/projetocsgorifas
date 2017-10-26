const mongoose = require('mongoose');


const RifaSchema = mongoose.model('Rifa', {
    premio: {
      mktname: {type: String, required: true},
      invpos: {type: Number, required: true}
    },
    qtdinic: {type: Number, required: true},
    qtdmax: {type: Number, required: true},
    ativa: {type: Boolean, required: true},
    visivel: {type: Boolean, required: true},
    tickets: [String],
    vencedor: {
      id: String,
      nome: String
    }
});

module.exports = RifaSchema;
