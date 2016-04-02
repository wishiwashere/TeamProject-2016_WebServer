var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');

var fs = require("fs");

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var multerStorage = multer.diskStorage({
    destination: "./images",
    filename: function (req, file, cb) {
        console.log("File received " + file.originalname);
        cb(null, Date.now() + "_" + file.originalname);
    }
});

var multerUpload = multer({
    storage: multerStorage
});

fs.exists("/images", function(exists) {
    var pathName = "/images";

    if (exists) {
        console.log("The " + pathName + " directory already exists");
    } else {
        console.log("The " + pathName + " directory does not already exist");
        fs.mkdir(pathName, function(err) {
            console.log("New " + pathName + " directory created");        
        });
    }
});

app.use("/", multerUpload.any());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/images", express.static(path.join(__dirname, 'images')));

app.use('/', routes);
app.use('/customReq', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
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
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
