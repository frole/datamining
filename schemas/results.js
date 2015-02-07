var mongoose=require('mongoose');

var ResultSchema = new mongoose.Schema({
   user : String,
   date : Date,
   corpusName : String,
   corpusLocation : String,
   algo : String,
   nbRowClusters : Number,
   nbColClusters : Number,
   rowCoordinates : Array,
   colCoordinates : Array
});
