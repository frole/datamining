module.exports = function (app) {

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
          res.render('coclustering/coclusteringBipartiteDocTermVisu.jade');
    });
}
