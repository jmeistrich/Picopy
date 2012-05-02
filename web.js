var port = process.env.PORT || 80;
var oneYear = 31557600000;

var express = require('express');
var app = require('express').createServer();

app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
});

app.configure('development', function(){
	console.log("dev");
    app.use(express.static(__dirname + '/'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(app.router);
});

app.configure('production', function(){
	console.log("prod");
  app.use(express.static(__dirname + '/', { maxAge: oneYear }));
  app.use(express.errorHandler());
});

app.configure(function(){
    app.use(app.router);
});

app.get('*', function(req, res){
  res.send("You're silly! That file doesn't exist.", 404);
});

app.listen(port);
console.log('server running at http://localhost:%d', port);
