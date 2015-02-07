module.exports = function (app) {

    var corpus = require('../controllers/test/corpus')

    var testStorage = require('../controllers/test/storage')
    var testCommunications = require('../controllers/test/communications')
    var testCommunicationsWs = require('../controllers/test/communications-ws')

    var testDB = require('../controllers/db/testDB')

    // home page
    app.get('/', function (req, res) {
        res.render('index', { title: 'Home Page.  ' })
    });

    // chat area
    app.get('/chat', function (req, res) {
        res.render('chat', { title: 'Chat with Me!  ' })
    });

    // about page
    app.get('/about', function (req, res) {
        res.render('about', { title: 'About Me.  ' })
    });
	
	app.get('/setParameters', function (req, res) {
          res.render('coclustering/setCoclusterParameters.jade');
    });
        app.get('/setParametersDocTerm', function (req, res) {
          res.render('coclustering/setCoclusterParametersDocTerm.jade');
    });
       /* app.get('/testSetParametersDocTerm', function (req, res) {
          res.render('coclustering/testSetCoclusterParametersDocTerm.jade');
    });  */
        app.get('/bipartiteRecom', function (req, res) {
          res.render('coclustering/coclusteringBipartiteVisu.jade');
    });
        app.get('/bipartiteDocsTerms', function (req, res) {
           corpus.corpusCoclusterDocTerm(req,res); 
          //res.render('coclustering/coclusteringBipartiteDocTermVisu.jade');
    });
         app.get('/testbipartiteDocsTerms', function (req, res) {
           corpus.corpusTestCoclusterDocTerm(req,res); 
          //res.render('coclustering/coclusteringBipartiteDocTermVisu.jade');
    });

      app.get('/testStorage', function (req, res) {
          //res.render('test/test.jade');       
          testStorage.storeFunction(req,res);
    });
  
      app.get('/testCommunications', function (req, res) {
          //res.render('test/test.jade');       
         // testCommunications.serviceBusFunction(req,res);
           testCommunicationsWs.wsFunction(req,res);
    });

   app.get('/testCommunications/ws', function (req, res) {
          //res.render('test/test.jade');       
          testCommunicationsWs.wsFunction(req,res);
    });

   app.get('/testDB', function (req, res) {
          testDB.loadResults(req,res);
    }); 
  
}


