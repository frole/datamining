var azure = require('azure-storage');

/*
var nconf = require('nconf');
nconf.env()
     .file({ file: 'config.json'});
var accountName = nconf.get("STORAGE_NAME");
var accountKey = nconf.get("STORAGE_KEY");

*/

conf=require("./config.json")
var accountName = conf["STORAGE_NAME"];
var accountKey = conf["STORAGE_KEY"];

var blobSvc = azure.createBlobService(accountName, accountKey);

exports.storeFunction= function (req, res) {

       blobSvc.listBlobsSegmented('test', null, function(error, result, response){
     if(!error){
       console.log(result);
     }
    else console.log("ERROR when retieving blob");

    var containerName="test"  ;
    var blobName="testblob" ;


     

   blobSvc.getBlobToText(
    containerName,
    blobName,
    function(err, blobContent, blob) {
        if (err) {
            console.error("Couldn't download blob %s", blobName);
            console.error(err);
        } else {
            console.log("Sucessfully downloaded blob %s", blobName);
            res.send(blobContent);
        }
    });

});

/* blobSvc.createBlockBlobFromLocalFile('test', 'BipartiteNewFormat', '/home/aghiles/Bureau/datamining/public/BipartiteNewFormat.txt', function(error, result, response){
  if(!error){
    console.log("creation of BipartiteNewFormat Blob from BipartiteNewFort.txt");
  }
else
  {
    console.log(error);
 }
});*/




}




