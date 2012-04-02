var port = process.env.PORT || 80;
var oneYear = 31557600000;

var express = require('express');
var app = require('express').createServer();

app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
});

app.configure('development', function(){
    app.use(express.static(__dirname + '/', { maxAge: oneYear }));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.static(__dirname + '/', { maxAge: oneYear }));
  app.use(express.errorHandler());
});

app.listen(port);
console.log('server running at http://localhost:%d', port);
