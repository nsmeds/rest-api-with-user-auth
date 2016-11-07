const router = require('express').Router();
const jsonParser = require('body-parser').json();
const User = require('../models/user');
const token = require('../auth/token');
const ensureAuth = require('../auth/ensure-auth');

router.post('/validate', ensureAuth, (req, res, next) => {
  res.send({valid: true});
});

router.post('/signup', jsonParser, (req, res, next) => {
  const {username, password} = req.body;
  delete req.body.password;
  if(!username || !password) {
    return next({
      code: 400,
      error: 'Both username and password are required'
    });
  }

  User.find({username})
    .count()
    .then(count => {
      if (count > 0) throw {code:400, error: `username ${username} already in use`};
      const user = new User(req.body);
      user.generateHash(password);
      return user.save();
    })
    .then(user => token.sign(user))
    .then(token => res.send({token}))
    .catch(next);
});

module.exports = router;