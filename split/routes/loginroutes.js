var mariadb = require('mariadb');
var connection = mariadb.createPool({
    host  : 'localhost',
    user  : 'root',
    password : 'root',
    database : 'SPLIT'
});
var express = require('express');


exports.register = function(req,res){
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
  .then(res=>{
       console.log(res)
       if(res.warningStatus==0)
       {
        var user={
          "name":req.body.first_name,
          "email":req.body.email,
          "password":req.body.password
        };
        req.session.user = user;
        res.redirect('/userPortal');
      }
  })
  .catch(err=>{
    console.log(err);
  })
}

exports.login = function(req,res){
      var users={
        "name":req.body.first_name,
        "email":req.body.email,
        "password":req.body.password
      }
      connection.query('SELECT password from users where email=(?)',[users.email])
      .then(res=>{
          if(res[0].password===users.password){
              console.log("hello")
              req.session.user=users;
              res.render('/userPortal',{'username':users.email});
          }else{
            /*  res.send('Invalid Credentials');*/
              res.redirect('/');
          }
      })
      .catch(err=>{
          console.log(err);
/*          res.send('Invalid Credentials');*/
      })
}
