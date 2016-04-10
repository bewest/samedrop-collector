/**
 * GET /
 * Home page.
 */
exports.index = function(req, res) {
  res.render('home', {
    title: 'Home'
  });
};


exports.getResults = function (req, res) {
  res.render('results', {
    title: 'Results'
  });

}

exports.renderResultPair = function (req, res, next) {
  res.format({
    html: function ( ) {
      res.render('results', {
        title: 'Results'
      , results: res.locals.pairs
      });
    }
  , json: function ( ) {
      next( );
    }
  });
}

