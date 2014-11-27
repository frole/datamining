var azure = require('azure-storage');

/*
var nconf = require('nconf');
nconf.env()
     .file({ file: 'config.json'});
var accountName = nconf.get("STORAGE_NAME");
var accountKey = nconf.get("STORAGE_KEY");
biodata test
*/

conf=require("./config.json")
var accountName = conf["STORAGE_NAME"];
var accountKey = conf["STORAGE_KEY"];

var blobSvc = azure.createBlobService(accountName, accountKey);


blobSvc.listBlobsSegmented('test', null, function(error, result, response){
     if(!error){
       console.log(result);
     }
    else console.log("ERROR when retieving blob");
   });

var filePath='/home/frole/recherche/data/smartStopwords.txt'
blobSvc.createBlockBlobFromLocalFile('test', 'data/smartStopwords.txt',filePath,  function(error, result, response){
        if(!error){
           console.log("creation of blob ok");
        }
       else{
          console.log(error);
    }
   });


blobSvc.listBlobsSegmented('test', null, function(error, result, response){
     if(!error){
       console.log(result);
     }
    else console.log("ERROR when retieving blob");
   });


