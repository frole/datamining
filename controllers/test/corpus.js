

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


 exports.corpusTestCoclusterDocTerm= function (req, res) {

    console.log('request received');
    console.log(req.param('nbrowcluster'));
    console.log(req.param('bipartite'));
    var bp = JSON.parse(req.param('bipartite'));
    console.log(bp.row_cluster_sizes);
    var corpus=  req.param('corpus');
    var nbrows = parseInt(req.param('nbrowcluster'));
    var nbcols = parseInt(req.param('nbcolcluster'));
    var topDocs = [];
    var topTerms = [];
    var terms_with_best_scores = [];
    var docs_with_best_scores = [];
    console.log('corpus');
    /*blobSvc.getBlobToText("test","BipartiteNewFormat",
    function(err, bipartite, blob) {
        if (err) {
            console.error("Couldn't download blob %s", "Bipartite blob");
            console.error(err);
        } else {
            console.log("Sucessfully downloaded blob %s", "Bipartite blob");*/
            var json = bp;
            for (top in json.col_cluster_info){
                 topDocs.push(json.col_cluster_info[top].top_docs);
                 docs_with_best_scores.push(json.col_cluster_info[top].docs_with_best_scores);
            }
            for (top in json.row_cluster_info){
                 topTerms.push(json.row_cluster_info[top].top_terms);
                 terms_with_best_scores.push(json.row_cluster_info[top].terms_with_best_scores);
            }
            var jsonFinal = {"row_cluster_sizes":json.row_cluster_sizes,"col_cluster_sizes":json.col_cluster_sizes,"rowClusterJob":topDocs, "colClusterGenre":topTerms,"global_row_cluster_info":terms_with_best_scores};                       
              
             res.send(jsonFinal);
            //res.render('coclustering/coclusteringBipartiteDocTermVisu.jade',{graphe:JSON.stringify(jsonFinal)});
        //}
   // });

} 

 exports.corpusCoclusterDocTerm= function (req, res) {

    
    var corpus=  req.param('corpus');
    var nbrows = parseInt(req.param('nbrowcluster'));
    var nbcols = parseInt(req.param('nbcolcluster'));
    var topDocs = [];
    var topTerms = [];
    var terms_with_best_scores = [];
    var docs_with_best_scores = [];
    console.log('corpus');
    blobSvc.getBlobToText("test","BipartiteNewFormat",
    function(err, bipartite, blob) {
        if (err) {
            console.error("Couldn't download blob %s", "Bipartite blob");
            console.error(err);
        } else {
            console.log("Sucessfully downloaded blob %s", "Bipartite blob");
            var json = bipartite;

            res.render('coclustering/coclusteringBipartiteDocTermVisu.jade',{graphe:JSON.stringify(json)});
        }
    });

} 


















 
 
