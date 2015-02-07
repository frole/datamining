var mongoose=require('mongoose');
var dbURL= 'mongodb://localhost/results'
var db = mongoose.connect(dbURL);

var Result = require('../../models/results');

function loadResults(req, res, next) {
   Result.findOne({"user" : "Pierre" } , function(err,result) {
                                         if (err) return netx(err);
                                         if (!result) res.send("Result not found", 404);
                                         res.send("OKKKK" + result);
                   });
}

exports.loadResults=loadResults;
