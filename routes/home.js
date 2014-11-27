module.exports = function (app) {

    var tests = require('../controllers/test/storage')
    var corpus = require('../controllers/test/corpus')
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
        app.get('/bipartiteRecom', function (req, res) {
          res.render('coclustering/coclusteringBipartiteVisu.jade');
    });
        app.get('/bipartiteDocsTerms', function (req, res) {
           corpus.corpusCoclusterDocTerm(req,res); 
          //res.render('coclustering/coclusteringBipartiteDocTermVisu.jade');
    });

      app.get('/test', function (req, res) {
          //res.render('test/test.jade');       
          tests.storeFunction(req,res);
    });
}


