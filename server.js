var express = require('express');
var app = express();

var ngrok = require('ngrok');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var config = require('./config');
var SWF = require('./routes/SWF');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(function (req, res, next) {
    console.log('got a request process pid ' + process.pid + ' url ' + req.originalUrl);
    next();
});

app.use('/api/v1', SWF);

process.on('uncaughtException', function (err) {
    console.log('Node uncaught Exception -- > ');
    console.log(err.stack);
});

ngrok.connect(3000, function (err, url) {
    console.log(url);
    config.setUrl(url);
});

app.listen('3000', function () {
    console.log('Server listening at port no. 3000 pid ' + process.pid);
    console.log(process);
});