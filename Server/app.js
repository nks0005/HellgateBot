var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const { sequelize } = require('./models/index.js');

const hellgateRouter = require('./routes/hellgate');
const crystalRouter = require('./routes/crystal');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev')););
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 데이터 베이스 동기화
sequelize.sync({ force: false }).then(() => {
        console.log('데이터베이스 연결 성공');
    })
    .catch((err) => {
        console.error(err);
    })


app.use('/HELLGATE', hellgateRouter);
app.use('/CRYSTAL', crystalRouter);



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