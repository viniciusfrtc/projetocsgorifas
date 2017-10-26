const express = require('express');
const passport = require('passport');

const router = express.Router();


router.get('/steam',
  passport.authenticate('steam', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });


router.get('/steam/return',

  function(req, res, next) {
      req.url = req.originalUrl;
      next();
  },
  passport.authenticate('steam', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });

module.exports = router;
