// Importando dependências
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const SteamStrategy = require('passport-steam');
const mongoose = require('mongoose');



//Importando rotas
const login = require('./controllers/login');
const painel = require('./controllers/painel');

// Gerar a aplicação
const app = express();

// Configurar o handlebars
app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Middlewares
app.use(express.static('assets'));
app.use(bodyParser.urlencoded());
app.use(session({
  secret: 'csrifas',
  resave: true,
  saveUninitialized: true}));

//Configurando mongoose

mongoose.connect('mongodb://localhost/projetorifas');


//Configurando passport
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new SteamStrategy({
    returnURL: 'http://localhost:3000/auth/steam/return',
    realm: 'http://localhost:3000/',
    apiKey: 'D8102D8C6837D2ED3FD3766183CEF3B7'
  },
  function(identifier, profile, done) {
    process.nextTick(function () {
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));


app.use(passport.initialize());
app.use(passport.session());



//Rotas
app.get('/', (request, response) => {
    if (request.user) {
      response.redirect('/painel');
      return;
    };
    response.render('index');
});

app.use('/auth', login);
app.use('/painel', painel);

//Inicializar o servidor
app.listen(3000, () => {
  console.log('Servidor inicializado');
});
