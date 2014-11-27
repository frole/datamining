var azure = require('azure');


var config = require('./config')

exports.wsFunction= function (req, res) {
 
  res.render("communications/websocket_client_clust.jade");
 }
