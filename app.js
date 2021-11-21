var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser')
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');




var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productsRouter = require('./routes/products');
var orderesRouter = require('./routes/orders');
var categoriesRouter = require('./routes/categories');
const authjwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

var app = express();

require('dotenv/config');
const api = process.env.API_URL;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json()); //middleware
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(`${api}/`, indexRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/products`, productsRouter);
app.use(`${api}/orders`, orderesRouter);
app.use(`${api}/categories`, categoriesRouter);

app.use(cors());
app.options('*',cors())

//middleware
let err, req, res = {}
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authjwt);
// app.use(errorHandler)


mongoose.connect(process.env.CONNECTION_STRING,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName:'eshop-database'
}).then(()=>{
  console.log("Database Connection is ready.....")
}).catch((err)=>{
  console.log(err);
})




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

module.exports = app;
