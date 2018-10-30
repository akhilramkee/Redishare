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
     connection.query('INSERT INTO postContent(content,email,created) values(?,?,?)',[post.content,post.email,date])
      .then((result)=>{
        //  console.log(result);
          postid=result.insertId;
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
                }

              if(resa==0){
//                    console.log(result[0].tagid)
                  //  tagid = result[0].tagid;
                connection.query('Insert INTO TAG(TagName) values(?)',post.tag)
                  .then((result)=>{
                     console.log(result.insertId);
                      tagid = result.insertId;
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
              connection.query('Select * from TAG')
                .then(rows=>{
                    console.log(rows);
                    ass1=rows;
                    console.log(ass1);
                      res.render('userPortal',{'result':ass,'result1':ass1});
                })
                .catch((err)=>{
                    console.log(err);
                })
          })

      })
});
// });
        /*  connection.query('Insert INTO TAG(tagName) values(?)',post.tag)
          .then((result)=>{
              tagid=result.insertId;
              console.log(result);
              connection.query('Insert INTO tag_post_mapping(tagid,postid) values(?,?)',[tagid,postid])
              .then((result)=>{
                  console.log(result);
              })
              .catch((err)=>{
                console.log(err);
              })
          })
          .catch((err)=>{
              console.log(err);
          })  */
        /*connection.query('Select * from postContent')
          .then(rows=>{
                ass=rows;
            })
          })*/
      //  res.render('userPortal',{result:ass})
//  });


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
       console.log(result)
        var user={
          "name":req.body.first_name,
          "email":req.body.email,
          "password":req.body.password
        };
        if(cookie === undefined){
          res.cookie('user',user,{httpOnly:true});
          console.log('cookie created successfully');
        }
        res.render('userPortal',{'username':user.name});
  })
  .catch(err=>{
    console.log(err);
  })
});

router.get('/signout',(req,res)=>{
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
    connection.query('SELECT password from users where email=(?)',[users.email])
    .then((result)=>{
        if(result[0].password===users.password){
            console.log("hello")
            res.cookie("user",users)
            res.render('userPortal',{'username':users.name});
          }else{
            res.send('Invalid Credentials')
            res.render('/');
        }
    })
    .catch(err=>{
        console.log(err);
     })
  }else{
     var users = cookie;
     res.render('userPortal',{'username':users.name});
  }
});

router.get('/trial',(req,res)=>{
  res.render('trial');
});

router.get('/userPortal',function(req,res,next){
  var ass=[];
  var ass1=[];
  connection.query('Select * from postContent')
  .then((rows)=>{
      var rows1 = JSON.stringify(rows);
      if(rows1){
        ass = rows;
    }
  })
  connection.query('Select * from TAG')
  .then((rows)=>{
      var rows1 = JSON.stringify(rows);
      if(rows1){
      ass1 = rows;
    }
  })
  res.render('userPortal',{'result':ass,'result1':ass1});
});

router.post('/getall',function(req,res){
    connection.query(`SELECT first_name from users`)
    .then((first_name)=>{
        res.first_name = JSON.stringify(first_name)
        console.log(res.first_name)
        res.render('trial',{first_name:first_name})
    })
    .catch((err)=>{
        console.log(err);
    })
})

module.exports = router;
