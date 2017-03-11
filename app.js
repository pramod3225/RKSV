var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
//var config = require('./config');
var app = express();
// view engine setup
app.set('port', process.env.PORT || 3000);

app.set('view engine', null);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var server = http.createServer(app).listen(3000, function () {
    console.log('Express server listening on port ' + app.get('port'));
});

var routes = require('./routes/index');
app.use('/api', routes);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.send({
            message: err.message,
            error: err
        });
    });
}

//app.post('/login/auth', routes.loginAuth);

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render( {
        message: err.message,
        error: {}
    });
});


module.exports = app;
