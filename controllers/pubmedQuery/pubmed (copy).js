/* pubmed query  */


/**
 * Module dependencies.
 */
 

 /**
 * Controllers
 */


exports.pubmedQuerySetParameters = function(req, res) {
    //if (req.body.query != '') {
	    console.log("pmquery ctrl");
        res.render('pubmedQuery/pubmedQuerySetParameters', {title : "Interface for querying PUBMED"});
   // }
}

exports.pubmedQueryGetResults= function(req, res) {
    //if (req.body.query != '') {
	 // console.log("pmquery getresults ctrl");
     //res.render('pubmedQuery/pubmedQueryGetResults', {title : "Query results" , qu: "thequery" , fields : "thefields" , result : "theresults"});
   // }
 
	var esearch = require('elasticsearch');
    var externalConfig=require('../../../externalConfig.json');
	console.log(externalConfig.es.clientConfig);
	//var client = new esearch.Client(externalConfig.es.clientConfig);
	
    esIndex = externalConfig.es.index;
    esMapping = externalConfig.es.mapping;
	// fields=["TIART","ABS"]
    searchTerm=req.body.query;
	// recuperer match 
	var matchall= req.body.matchall || false;
	var matching = req.body.match || false;
        console.log("+++" , matching)
	var fields= req.body.field || false;
	// console.log(m);
	//=====
    from=0;
    size=req.body.nbfield;
     
if(matching.length!=0){	
	var should = [];
	for (var m in matching) {       
           console.log("*** " + matching);
	if (matching.indexOf("ABS") >= 0){
	should.push(  {
          "match": {
            "ABS" : searchTerm
          }
        })
		}
		
	if (matching.indexOf("TIART") >= 0){
	should.push(  {
          "match": {
            "TIART" : searchTerm
          }
        })
		}
	if (matching.indexOf("TIJOU") >= 0){
	should.push(  {
          "match": {
            "TIJOU" : searchTerm
          }
        })
		}
	if (matching.indexOf("MSH") >= 0){
	should.push(  {
          "match": {
            "MSH" : searchTerm
          }
        })
		}
	
	}
	

	var q ={
  "query": {
    "bool": {
      "should": should
    }
  },
  "fields" : fields 
}
	
};

	
sizefields=fields.length;
	
    client.search({
        index: esIndex,
        type: esMapping,
        size: size,
        from: from,
        body: q
        } 
    , function(err, searchRes) {       
			if(err) {
				console.log("ERR: " + err);
			} 
			else { 
			var resultFields=[];
			for (var i in searchRes.hits.hits) {
				for (var f in searchRes.hits.hits[i].fields) {
				  resultFields.push(searchRes.hits.hits[i].fields[f])
				} 
			}
			res.render('pubmedQuery/pubmedQueryGetResults', {title : "Interface for querying PUBMED",qu : req.body.query, result : JSON.stringify(resultFields)});
		        } 
	});
   
}
