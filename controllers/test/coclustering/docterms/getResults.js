

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

conf=require("./../../config.json")
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






 exports.getResults= function (req, res) { 
      var corpus=  req.body.corpus;
      var nbrows = parseInt(req.body.nbrowcluster);
      var nbcols = parseInt(req.body.nbcolcluster);
      if(typeof req.body.popep !== "undefined"){
         cocluster(res, corpus , nbrows  , nbcols, true);
      }
      else{
          cocluster(res, corpus , nbrows  , nbcols, false);
      }
  }


function cocluster(res, corpus , nbrows  , nbcols,popep) {  

      var WebSocket = require('ws');

      var host="localhost";
      var port=8888;
      var uri="/ws";

      var websocket = new WebSocket("ws://" + host + ":" + port + uri);

      /***************************************************************************************/
      /********************** graphe top terms en dure provisoir!!!! *************************/
      /***************************************************************************************/

       var topTermsGraph; /*=  {"nodesArray" :[[
{ label : "patients", id : 0, color : "#1F77B4", textcolor : "#000000", size : 6, desc : "description description" },
{ label : "cheng", id : 1, color : "#1F77B4", textcolor : "#000000", size : 3, desc : "description description" },
{ label : "ratios", id : 2, color : "#1F77B4", textcolor : "#000000", size : 3, desc : "description description" },
{ label : "flutter", id : 3, color : "#1F77B4", textcolor : "#000000", size : 6, desc : "description description" },
],
[
{ label : "autistic", id : 0, color : "#1F77B4", textcolor : "#000000", size : 3, desc : "description description" },
{ label : "crane", id : 1, color : "#1F77B4", textcolor : "#000000", size : 3, desc : "description description" },
{ label : "surfactant", id : 2, color : "#1F77B4", textcolor : "#000000", size : 3, desc : "description description" },
{ label : "indexer", id : 3, color : "#1F77B4", textcolor : "#000000", size : 3, desc : "description description" },
]],
"linksArray" :[[
{desc : "Edge description", source : 0, target : 1, weight : 0.153149671321, color : "#cfcfff"},
{desc : "Edge description", source : 0, target : 3, weight : 0.636229510992, color : "#cfcfff"},
{desc : "Edge description", source : 2, target : 3, weight : 0.20635902519, color : "#cfcfff"},
],
[
{desc : "Edge description", source : 0, target : 2, weight : 0.278166183366, color : "#cfcfff"},
{desc : "Edge description", source : 1, target : 2, weight : 0.206282318673, color : "#cfcfff"},
{desc : "Edge description", source : 2, target : 3, weight : 0.313979342359, color : "#cfcfff"},
]]
};*/

     /***********************************************************************************************/
     /***********************************************************************************************/    







           //SUPPORT FUNCTIONS 
           function doSend(message) { console.log("SENT TO SERVER: " + message );  websocket.send(message);
           }  

          
          
           // HANDLERS
           var msg='{"corpus" :' +  '"' + corpus + '",' + '"nbrows" :' + nbrows + ','      + '"nbcols" : ' + nbcols  + '}';
           function onOpen(evt) { console.log("CONNECTED");
                                 doSend(msg);
           } 
           function onClose(evt) { console.log("DISCONNECTED " + evt ); 
           }  
           function onMessage(evt) { 
                                    console.log('RESPONSE FROM SERVER: ' + evt.data);
                                    var bp= JSON.parse(evt.data);
                                    var topDocs = [];
                                    var topTerms = [];
                                    var terms_with_best_scores = [];
                                    var docs_with_best_scores = [];
                                    var json = bp;
                                    console.log(evt.data.nodesArray);
                                    topTermsGraph = {"nodesArray":json.nodesArray,"linksArray":json.linksArray};
                                    for (top in json.col_cluster_info){
                                         topDocs.push(json.col_cluster_info[top].top_docs);
                                         docs_with_best_scores.push(json.col_cluster_info[top].docs_with_best_scores);
                                    }
                                    for (top in json.row_cluster_info){
                                         topTerms.push(json.row_cluster_info[top].top_terms);
                                         terms_with_best_scores.push(json.row_cluster_info[top].terms_with_best_scores);
                                    }
                                    var jsonFinal = {"row_cluster_sizes":json.row_cluster_sizes,"col_cluster_sizes":json.col_cluster_sizes,"rowClusterJob":topDocs,        "colClusterGenre":topTerms,"global_row_cluster_info":terms_with_best_scores}; 

                                   if(popep){
                                       res.send(jsonFinal);
                                   }
                                   else{    
                                       res.render('coclustering/coclusteringBipartiteDocTermVisu.jade',{graphe:JSON.stringify(jsonFinal),nbrows:nbrows,topTermsGraph:JSON.stringify(topTermsGraph)}); 
                                   }
                               
                                    websocket.close();
           }
           function onError(evt) {console.log(evt.data); 
           } 
          
           websocket.onopen = function(evt) { onOpen(evt) }; 
           websocket.onclose = function(evt) { onClose(evt) }; 
           websocket.onmessage = function(evt) { onMessage(evt) }; 
           websocket.onerror = function(evt) { onError(evt) }; 
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


















 
 
