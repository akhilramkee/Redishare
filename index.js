const express = require('express');
const mariadb = require('mariadb');
const connection= mariadb.createPool({
            host:'localhost',
            user:'root',
            password:'root',
            database:'SPLIT',
            connectionLimit:5
          })
/*connection.query('CREATE TABLE trial1('+
                'id MEDIUMINT NOT NULL AUTO_INCREMENT,'+
                'name VARCHAR(30) NOT NULL,'+
                'PRIMARY KEY(id))');*/
connection.query('INSERT INTO trial1(name) value(?)',['sea lions'])
      .then(res=>{
          console.log(res);
      })
      .catch(err=>{
        console.log(err);
    });

/*connection.query('DROP TABLE trial1')
    .then(res=>{
      console.log(res);
    })
    .catch(err=>{
      console.log(err);
    });*/
const app = express();

app.listen(3000,()=>console.log('Listening on port 3000'));
/*app.post()
app.put()
app.delete()*/
