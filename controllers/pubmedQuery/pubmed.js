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
 
	var esearch = require('elasticsearch');
        var externalConfig=require('../../../externalConfig.json');
	console.log(externalConfig.es.clientConfig);
	//var client = new esearch.Client(externalConfig.es.clientConfig);
	
    esIndex = externalConfig.es.index;
    esMapping = externalConfig.es.mapping;
    searchTerm=req.body.query;
	// recuperer match 
	var matchall= req.body.matchall || false;
	var matching = req.body.match || false;
        console.log("+++" , matching)
	var fields= req.body.field || false;
	
    from=0;
    size =req.body.nbfield;

    if(matching){

	var should = [];

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
	
     }  // end if matching
	
  
     var q ={
        "query": {
        "bool": {
        "should": should
        }
      },
      "fields" : fields 
     }

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
			res.render('pubmedQuery/pubmedQueryGetResults', {title : "Search Results",qu : searchTerm, result : JSON.stringify(resultFields)});
		        } 
	}
     );

	

}

   
