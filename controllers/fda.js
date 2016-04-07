
var express = require('express')

function empty_list (req, res, next) {
  res.json([]);
  next( );
}

exports.routes = function routes (master) {
  var app = express( );

  app.get('/smbg', empty_list);
  return app;

}
