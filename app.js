var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var express = require('express');
var { v4: uuidv4 } = require('uuid');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var session = require('express-session');
var url = "mongodb://localhost:27017/mydb";
const MongoStore = require('connect-mongo');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var app = express();


const res = require('express/lib/response');
const myLogger = function (req, res, next) {
  res.set('Cache-Control', 'private,no-cache,no-store,must-revalidate');
  next()
}

app.use(myLogger)
app.use(session({
  genid: function (req) {
    return uuidv4();
  },
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3000000 },
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost/27017' })

}));

// app.get("/a",(req,res)=>{
//   console.log("aaaaaa")
//   res.send("sasas")
// })
// // view engine setup
// app.set('views', path.join(path.resolve(), 'views'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var mongodbutil = require('./routes/mongodbutil');
mongodbutil.connectToServer(function(err){
 // console.log("as")
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/userlogin')
var adminRouter = require('./routes/admin')
var cartRouter = require('./routes/cart')
app.use(loginRouter);




app.get('/signout', function (req, res) {
  req.session.destroy(function () {
    res.render('user',{"msg":""});
  });
});


app.get('/login', function (req, res) {
  req.session.auth1=false;

  res.render('user', { "msg": "" });
})





const authenticate = function(req,res,next){
  
  if (req.session.auth1==true)
  {
    next();
  }
  else{
    res.send("Authentication Failed Login to continue")
  }
}
//app.use(authenticate);

app.use('/', indexRouter);
app.use( usersRouter);

app.use( adminRouter);
app.use(cartRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
})
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
// app.listen(5015,(req,res)=>{
//   console.log("listening")
// })
module.exports = app;
