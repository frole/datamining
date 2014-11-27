

 /**
 * Clustering controllers
 */
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
 exports.corpusClusterSetParameters= function (req, res) {
  res.send("<p>Parameter Settings</p>");
 }
 
 
exports.corpusClusterShowResults= function (req, res) {}
 
 
 /**
 * Coclustering controllers
 */

 exports.corpusCoclusterSetParameters= function (req, res) {
     console.log('coclustering/setCoclusterParameters.jade');
     res.render('coclustering/setCoclusterParameters.jade');  
}


 exports.corpusCoclusterDocTerm= function (req, res) {


    blobSvc.getBlobToText("test","Bipartite",
    function(err, bipartite, blob) {
        if (err) {
            console.error("Couldn't download blob %s", "Bipartite blob");
            console.error(err);
        } else {
            console.log("Sucessfully downloaded blob %s", "Bipartite blob");
            var json = JSON.parse(bipartite)
            //res.send(bipartite);
            var tab = {"tab":[1,1,1],"tab2":[2,2,2]}
            res.render('coclustering/coclusteringBipartiteDocTermVisu.jade',{graphe:JSON.stringify(json)});
        }
    });

} 
 
 
