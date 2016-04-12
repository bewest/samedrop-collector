
var express = require('express');
var path = require('path');
var _ = require('lodash');
var User = require('../models/User');

function render_page (req, res, next) {
  // res.render(res.locals.page, { title: 'Inventory' });
  res.render(res.locals.page, res.locals.meta);
}

function setup_page (req, res, next) {
  res.locals.page = path.join('my', path.basename(req.path));
  next( )
}

function define_page (opts) {
  function setup_page (req, res, next) {
    res.locals.page = path.join('my', path.basename(req.path));
    res.locals.meta = opts.meta;
    next( )
  }
  return setup_page;
}

function query (req, res, next) {
  var query = {
  };
  var result = req.user.favorites.slice(0);
  res.locals.inventory = result;
  res.locals.favorites = result;
  next( );
}

function select (req, res, next) {
  var nick = req.params.nick;
  console.log(nick, res.locals.inventory);
  var selected = _.find(res.locals.inventory, {nick: nick});
  res.locals.selected = selected;
  res.locals.inventory = selected;
  if (req.params.attr) {
    res.locals.inventory = selected[req.params.attr];
  }
  next( );
}

function modify_prop (req, res, next) {
  var nick = req.params.nick;
  var attr = req.params.attr;
  res.locals.selected[attr] = req.body.value;
  // var favorites = _.without(res.locals.favorites, {nick: nick});
  console.log('???', req.user.favorites);
  // console.log('yyy', req.user.favorites);
  // res.locals.inventory
  req.user.favorites = req.user.favorites.slice( );
  User.findByIdAndUpdate(req.user._id, { $set: {favorites: req.user.favorites.slice(0) }}, function (err) {
    res.locals.inventory = res.locals.selected;
    next(err);
  });
}

function delete_fave (req, res, next) {
  var nick = req.params.nick;
  var favorites = _.filter(res.locals.favorites, function (item) {
    // {nick: nick}
    return item.nick != nick;
  });
  // console.log('removing fave', nick, favorites);
  User.findByIdAndUpdate(req.user._id, { $set: {favorites: favorites}}, function (err) {
    res.locals.inventory = { };
    // console.log('deleted', err, favorites);
    next(err);
  });
  
}

function fmt (req, res, next) {
  res.json(res.locals.inventory);
}

exports.routes = function routes (master) {
  var app = express( );

  app.get('/equipment'
     , define_page({meta: { title: "Inventory" }})
     , render_page);

  app.get('/equipment/list', query, fmt);
  app.get('/equipment/list/:nick', query, select, fmt);
  app.get('/equipment/list/:nick/:attr', query, select, fmt);
  app.put('/equipment/list/:nick/:attr', query, select, modify_prop, fmt);
  app.del('/equipment/list/:nick', query, select, delete_fave, fmt);
  return app;
}

