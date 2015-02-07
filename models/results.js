var mongoose=require('mongoose');
var ResultSchema=require('../schemas/results');

var Result=mongoose.model('Result', ResultSchema);

module.exports= Result;
