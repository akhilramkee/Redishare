var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var login = require('./routes/loginroutes');
var bodyParser = require('body-parser')
var session = require('client-sessions');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
/*auth(passport);
app.use(passport.initialize());
app.get('/auth/google',passport.authenticate('google',{
    scope:['https://www.googleapis.com/auth/userinfo.profile']
}));

app.get('/auth/google/callback',
    passport.authenticate('google',{
      failureRedirect:'/'
    }),
    (req,res)=>{}
);
*/

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  cookieName: 'session',
  secret    : 'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8',
  duration  :30*60*1000,
  activeDuration:5*60*1000,
  httpOnly :true,
  secure   :true,
  ephemeral:true
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000,()=>{console.log("Listening to port 3000")});

module.exports = app;
