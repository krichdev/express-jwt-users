require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var User = require('./models/user');
var app = express();

var secret = process.env.SESSION_SECRET

mongoose.connect('mongodb://localhost:27017/myauthenticatedusers');

app.use(bodyParser.urlencoded({extended:true}));
app.use('/api/users', expressJWT({secret: secret}));
app.use('/api/users', require('./controllers/users'));
app.use(function (err, req, res, next){
  if(err.name === 'UnauthorizedError'){
    res.status(401).send({message: "You need an authorization token to view this information"})
  }
});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/auth', function(req, res){
  // some code to check that a user's credentials are right #bcryptmaybe?
  // collect any information we want to include in the token, like that user's info
  User.findOne({email: req.body.email}, function(err, user){
    if (err || !user) return res.send({message: "User not found"});
    user.authenticated(req.body.password, function(err, result){
      if (err || !result) return res.send({message: 'User not authenticated'});

      // make a token already & send it as JSON
      var token = jwt.sign(user, secret);
      res.send({user: user, token: token});
    });
  });
});

app.listen(3000);
