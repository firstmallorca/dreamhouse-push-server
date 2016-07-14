var express = require('express'),
    http = require('http'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    methodOverride = require('method-override'),
    sqlinit = require('./server/sqlinit'),
    push = require('./server/push');

var app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(methodOverride()); // simulate DELETE and PUT

app.post('/devices', push.register);
app.get('/devices', push.find);
app.post('/notifications', push.pushNotification);

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500).send(err.message)
});

app.set('port', process.env.PORT || 5000);

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});