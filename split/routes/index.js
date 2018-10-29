var express = require('express');
var login = require('./loginroutes');
var router = express.Router();
var mariadb = require('mariadb');
var connection = mariadb.createPool({
    host  : 'localhost',
    user  : 'root',
    password : 'root',
    database : 'SPLIT'
});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login',function(req,res,next){
  res.render('login',{tilte:'LOGIN'});
});


router.post('/postTag',function(req,res){
      console.log(req.signedCookies);
});



router.post('/register',(req,res)=>{
  var today = new Date();
  var users = {
    "first_name":req.body.first_name,
    "last_name":req.body.last_name,
    "email":req.body.email,
    "password":req.body.password,
    "created":today,
    "modified":today
  }
  connection.query('INSERT INTO users(first_name,last_name,email,password,created,modified) value (?,?,?,?,?,?)',[users.first_name,users.last_name,users.email,users.password,users.created,users.modified])
  .then((result)=>{
       console.log(result)
        var user={
          "name":req.body.first_name,
          "email":req.body.email,
          "password":req.body.password
        };
        req.session.user = user;
        res.render('userPortal',{'username':user.name});
  })
  .catch(err=>{
    console.log(err);
  })
});

router.post('/login',(req,res)=>{
  var users={
    "name":req.body.first_name,
    "email":req.body.email,
    "password":req.body.password
  }
  connection.query('SELECT password from users where email=(?)',[users.email])
  .then((result)=>{
      if(result[0].password===users.password){
          console.log("hello")
          req.session.user=users;
          res.render('userPortal',{'username':users.email});
      }else{
          res.send('Invalid Credentials')
          res.redirect('/');
      }
  })
  .catch(err=>{
      console.log(err);
  })
});

router.get('/trial',(req,res)=>{
  res.render('trial');
});

router.get('/userPortal',function(req,res,next){
  res.render('userPortal');
});

router.post('/getall',function(req,res){
    connection.query(`SELECT first_name from users`)
    .then((first_name)=>{
        res.first_name = JSON.stringify(first_name)
        res.render('trial',{first_name:first_name})
    })
    .catch((err)=>{
        console.log(err);
    })
});
/*router.get('/userPortal',(req,res,next){

})*/

module.exports = router;
