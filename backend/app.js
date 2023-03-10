var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var MemoryStore = require('memorystore')(session);
const uuidv4 = require('uuid').v4;
const cors = require('cors');
require('dotenv').config();
var indexRouter = require('./routes/index');

var app = express();
const port = 4000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//session configuration must come before routing
const sessionStore = new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
});
app.use(session({
    genid: (req) => {
        return uuidv4(); // Generate a unique ID for each session
    },
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}));

app.use(cors({
    origin: [process.env.CORS_ORIGIN_HOST]
}));

app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});

module.exports = app;
