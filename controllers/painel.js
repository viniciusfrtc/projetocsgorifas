const express = require('express');
const passport = require('passport');
const UsuarioSchema = require('../model/usuarios');
const RifaSchema = require('../model/rifas');
const adm = require('../admin.json');
const inv = require('../inventario.js');
const bot = require('../bot.js');

const router = express.Router();


//Primeiro, checa se o usuário é o admin e retorna um booleano de acordo. Em seguida, eu busco
//o steam id do usuário. Se for primeiro acesso, eu salvo esse id na collection de usuários. Por
//fim, na variável novamente eu vejo se é primeiro acesso e coloco um "novamente" na mensagem de
//bem vindo :)
router.get('/', ensureAuthenticated, (request, response) => {

  let admin = false;
  if (adm.id === request.user.id) {
    admin = true;
  };

  UsuarioSchema.findOne({steamid: request.user.id}, (error, usuario) => {
    if(usuario == null){
      let novousuario = new UsuarioSchema({steamid: request.user.id, nome: request.user.displayName});
      novousuario.save((error, resultado) => {
      });
    };
  });

  UsuarioSchema.find({steamid: request.user.id}, (error, usuario) => {
    if(request.user.displayName !== usuario.nome){
      UsuarioSchema.findOneAndUpdate({steamid: request.user.id},{$set: {nome: request.user.displayName}}, {'new': true}, (error, resultado) => {
      });
    };
  });

  response.render('painel', {user: request.user.displayName, id: request.user.id, admin: admin});

});


//Faz um check do cookie e se é o admin quem acessa a página. Se tudo estiver ok, renderiza a página de criar rifa.
router.get('/novarifa', ensureAuthenticated, (request, response) => {

  if (adm.id !== request.user.id) {
    response.redirect('/');
  };

  let nomesInventario = [];
  for (i = 0; i < inv.inventario.length; i++){
    nomesInventario.push(String(inv.inventario[i].market_name));
  };


  response.render('novarifa', {inventario: nomesInventario});

});


//Faz um check do cookie e se é o admin quem acessa a página. Se tudo estiver ok, gera a nova rifa. Na variável
//conclusão, guarda uma msg de feedback ao admin.
router.post('/novarifa', ensureAuthenticated, (request, response) => {

  if (adm.id !== request.user.id) {
    response.redirect('/');
  };

  let invpos;
  for(i = 0; i < inv.inventario.length; i++){
   if (request.body.premio == inv.inventario[i].market_name){
     invpos = i;
   };
  };

  let novarifa = new RifaSchema({premio: {mktname: request.body.premio, invpos: invpos}, qtdmax: request.body.tickets, ativa: true, visivel: true, qtdinic: 0});
  let conclusao;
  novarifa.save((error, resultado) => {
    conclusao = "A rifa foi criada com sucesso";
  });

  response.redirect('novarifa');

});


//Busca a lista de rifas ativas e renderiza numa tabela.
router.get('/rifas', ensureAuthenticated, (request, response) => {

  RifaSchema.find({visivel: true}, (error, resultado) => {
    response.render('rifas', {rifas: resultado});
  });

});



router.post('/rifas/comprar/', ensureAuthenticated, (request, response) => {

  RifaSchema.findOneAndUpdate({_id: request.body.rifaid},{$push: {tickets: request.user.id}}, {'new': true}, (error, resultado) => {
  });

  RifaSchema.findOneAndUpdate({_id: request.body.rifaid},{$inc: {qtdinic: 1}}, {'new': true}, (error, resultado) => {

    RifaSchema.findOne({_id: request.body.rifaid}, (error, rifacheck) => {

      if (rifacheck.qtdinic >= rifacheck.qtdmax){
        RifaSchema.findOneAndUpdate({_id: request.body.rifaid}, {$set: {'ativa': false}}, {'new': true}, (error, rifacompleta) => {
          let posvenc = Math.floor(Math.random() * rifacompleta.tickets.length);
          UsuarioSchema.findOneAndUpdate({steamid: rifacompleta.tickets[posvenc]}, {$push: {'rifasganhas': rifacompleta._id}}, {'new': true}, (error, vencedor) => {
            RifaSchema.findOneAndUpdate({_id: request.body.rifaid}, {$set: {'vencedor': {id: rifacompleta.tickets[posvenc], nome: vencedor.nome}}}, {'new': true}, (error, resultado) => {});
          });
        });
      };

    });

  });

  response.redirect('/painel/rifas');

});




router.get('/premios', ensureAuthenticated, (request, response) => {

  UsuarioSchema.findOne({steamid: request.user.id}, (error, usuario) => {
    // console.log(usuario.rifasganhas);
    RifaSchema.find({'_id': {$in: usuario.rifasganhas}}, (error, resultado) => {
      // console.log(resultado);
      response.render('premios', {vitorias: resultado});
    });
  });

});


router.post('/premios/enviar', ensureAuthenticated, (request, response) => {

  RifaSchema.findOne({_id: request.body.rifaid}, (error, resultado) => {
    // console.log(resultado.premio.invpos);
    bot.enviarpremio(request.body.tradeurl, resultado.premio.invpos);
  });
  // console.log(pospremio);

  response.redirect('/painel');

});



function ensureAuthenticated(request, response, next) {
  if (request.isAuthenticated()) { return next(); }
  response.redirect('/');
};

module.exports = router;
