var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
//var logger = require('morgan');
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookie = require('cookie-parser');

var route = {
  index:require('./routes/index')
  , register:require('./routes/register')
  , test:require('./routes/test')
  , testdate:require('./routes/testdate')
  , images:require('./routes/images')
  , showmaid:require('./routes/showmaid')
  , detailmaid:require('./routes/detailmaid')
  , requestmaid:require('./routes/requestmaid')
  , pickupmaid:require('./routes/pickupmaid')
  , profile:require('./routes/profile')
  , editprofile:require('./routes/editprofile')
  , filtermaid:require('./routes/filtermaid')
  , employment:require('./routes/employment')
  , requestemployment:require('./routes/requestemployment')
  , detailemployer:require('./routes/detailemployer')
  , maidaccount:require('./routes/maidaccount')
  , uploadimage:require('./routes/uploadimage')
  , payment:require('./routes/payment')
  , maidwork:require('./routes/maidwork')
  , rating:require('./routes/rating')
  , contractt:require('./routes/contractt')
}

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookie());
app.use(session({
  secret: "cat"
  , cookie: { secure: false, maxAge: 4 * 60 * 60 * 1000}
  , saveUninitialized: true
  , resave: false
}));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'uploads')));

app.use('/', route.index);
app.use('/register', route.register);
app.use('/test', route.test);
app.use('/testdate', route.testdate);
app.use('/images', route.images);
app.use('/showmaid', route.showmaid);
app.use('/detailmaid', route.detailmaid);
app.use('/requestmaid', route.requestmaid);
app.use('/pickupmaid', route.pickupmaid);
app.use('/profile', route.profile);
app.use('/editprofile', route.editprofile);
app.use('/filtermaid', route.filtermaid);
app.use('/employment', route.employment);
app.use('/requestemployment', route.requestemployment);
app.use('/detailemployer', route.detailemployer);
app.use('/maidaccount', route.maidaccount);
app.use('/uploadimage', route.uploadimage);
app.use('/payment', route.payment);
app.use('/maidwork', route.maidwork);
app.use('/rating', route.rating);
app.use('/contractt', route.contractt);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.log("development error handler : ", err);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  console.error(err);
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;