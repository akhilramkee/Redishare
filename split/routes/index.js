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
var insertid;
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
  console.log(req.cookies.user);
});

router.get('/login',function(req,res,next){
  res.render('login',{tilte:'LOGIN'});
});

router.get('/register',function(req,res,next){
  res.render('register',{tilte:'REGISTER'});
});

var tagid;
var postid;
router.post('/postTag',function(req,res){
      var ass=[];
      var ass1=[];
      var date=new Date();
      var post={
        "content":req.body.post_txt,
        "tag":req.body.tag,
        "email":req.cookies.user.email
      };
      if(post.content=="" || post.tag==""){
          res.send("Go Back and enter something....");
      }else {
     connection.query('INSERT INTO postContent(content,email,created) values(?,?,?)',[post.content,post.email,date])
      .then((result)=>{
        //  console.log(result);
          postid=result.insertId;var cookie = req.cookies.user;
          console.log(post.tag);
          connection.query('Select * from `TAG`')
          .then((result)=>{
                var resa=0;
                result1 = JSON.stringify(result);
                result1 = JSON.parse(result1);
                console.log(result1);
                for(var i=0 ; i<result1.length;i++)
                {
                  if(result1[i].TagName==post.tag)
                  {
                      tagid=result1[i].Tagid;
                      console.log(tagid);
                      resa = 1;
                      break;
                  }
                  tagid = result1[i].Tagid;
                }
                console.log(resa);

              if(resa==0){
//                    console.log(result[0].tagid)
                  //  tagid = result[0].tagid;
                  tagid = tagid+1;
                connection.query('Insert INTO TAG(TagName) values(?)',post.tag)
                  .then((result)=>{
                     console.log(result);
                    })
                  .catch(err=>{
                      console.log(err);
                  })
              }

           connection.query('Insert INTO tag_post_mapping(tagid,postid) values(?,?)',[tagid,postid])
              .then((result)=>{
                    console.log(result);
             })
            connection.query('Select * from postContent')
                .then(rows=>{
                      console.log(rows);
                      ass=rows;
                     console.log(ass);
              })
              .catch((err)=>{
                  console.err(err);
              })
              var arra=[];
              connection.query('Select * from tag_post_mapping')
              .then((result)=>{
                  result = JSON.stringify(result);
                  result = JSON.parse(result);
                  arra = result;
              })
              connection.query('Select * from TAG')
                .then(rows=>{
                    console.log(rows);
                    ass1=rows;
                    console.log(ass1);
                      res.render('userPortal',{'result':ass,'result1':ass1,'result2':arra});
                })
                .catch((err)=>{
                    console.log(err);
                })
          })

      })
    }
});

router.get('/dashboard/:email',function(req,res)  {
      var post=[];
      connection.query('Select * from postContent where `tagName`=(?)',email)
      .then(result=>{
          var result1 = JSON.stringify(result);
          result1  = JSON.parse(result1);
          post = result1;
          res.render('dashboard',{'email':email,'post':post});
      })
});


router.post('/register',(req,res)=>{
  var cookie = req.cookies.user;
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
        var ass=[];
        var ass1=[];
        var user={
          "name":req.body.first_name,
          "email":req.body.email,
          "password":req.body.password
        };
        connection.query('INSERT INTO userLog(email,logged_in) values(?,?)',[users.email,today])
        .then((res)=>{
              insertid = res.insertId;
        })
        if(cookie === undefined){
          res.cookie('user',user,{httpOnly:true});
          console.log('cookie created successfully');
        }
        connection.query('Select * from postContent')
            .then(rows=>{
              //    console.log(rows);
                  ass=rows;
            //     console.log(ass);
          })
          .catch((err)=>{
              console.err(err);
          })
          connection.query('Select * from TAG')
            .then(rows=>{
              //  console.log(rows);
                ass1=rows;
          })
        res.render('userPortal',{'username':user.name,'result':ass,'result1':ass1});
  })
  .catch(err=>{
    console.log(err);
  })
});

router.get('/signout',(req,res)=>{
    var date=new Date();
    res.clearCookie("user");
    res.render('index');
})


router.post('/login',(req,res)=>{
  var cookie = req.cookies.user;
  console.log(cookie);
  if(cookie === undefined){
    var users={
      "name":req.body.first_name,
      "email":req.body.email,
      "password":req.body.password
    }
    console.log(users);
    connection.query('SELECT `password` from `users` where `email`=(?)',[users.email])
    .then((result)=>{
        var date = new Date();
        if(result[0].password===users.password){
            res.cookie("user",users)
            connection.query('INSERT INTO userLog(email,logged_in) values(?,?)',[users.email,date])
            .then((res)=>{
                  insertid = res.insertId;
            })
            res.redirect('userPortal');
          }else{
            res.send('Invalid Credentials')
            res.render('/');
        }
    })
    .catch(err=>{
        res.send('Invalid Credentials')
        res.render('/')
     })
  }else{
     connection.query('INSERT INTO userLog(email,logged_in) values(?,?)',[users.email,date])
     .then((res)=>{
          insertid = res.insertId;
     })
     res.redirect('userPortal');
  }
});

router.get('/trial',(req,res)=>{
  res.render('trial');
});

router.get('/userPortal',function(req,res,next){
  var cookie = req.cookies.user;
  var ass=[];
  var ass1=[];
  var arra=[];
  if(cookie === undefined){
      res.render('index');
  }
connection.query('Select * from postContent')
  .then((rows)=>{
       rows = JSON.stringify(rows);
       rows = JSON.parse(rows);
        ass = rows;
    })
connection.query('Select * from tag_post_mapping')
  .then((result)=>{
    result = JSON.stringify(result);
    result = JSON.parse(result);
    arra = result;
  })
connection.query('Select * from TAG')
  .then((rows)=>{
       rows = JSON.stringify(rows);
       rows = JSON.parse(rows);
       ass1 = rows;
  })
  console.log(cookie);
  res.render('userPortal',{'result':ass,'result1':ass1,'result2':arra,'username':cookie.name});

});

/*router.post('/delete',function(req,res)=>{
      var tag = user.body.tag;
      var array=[];
      connection.query('Select tagid from tag where tagname=(?)',tag)
      .then((result)=>{
          result = JSON.stringify(result);
          result = JSON.parse(result);
          connection.query('Select postid from tag_post_mapping where tagid=(?)',result.tagid)
          .then((result)=>{
              result = JSON.stringify(result);
              result = JSON.parse(result);
              connection.query('Select content from postContent where postid=(?)',result.postid)
              .then((result)=>{
                  result = JSON.stringify(result);
                  result = JSON.parse(result);
                  array = result;
                  res.render('deletecontent',{'content':result});
            })
        })
      }
});*/

module.exports = router;
