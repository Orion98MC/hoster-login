function setupApp(app) {
  
  var 
    atpl = require('atpl')
    session = require('express-session')
    bodyParser = require('body-parser')
    methodOverride = require('method-override')
  
  app.engine('html', atpl.__express);
  app.set('view engine', 'html');
  app.set('views', __dirname + '/views');
    
  app.use(methodOverride('_method'))
  app.use(bodyParser.urlencoded({ extended: false }));
  
  app.use(session({ 
    secret: "foo bar baz", key: 'sid', 
    cookie: { maxAge: 3600 * 1000 }, 
    saveUninitialized: true, resave: true 
  }));
  
  app.use(function (req, res, next) {
    res.locals.identified = req.session.user_id != null ? true : false;
    next();
  });
  
  app.features('/login', {
    getid: function (login, password, next) { 
      next((login == 'foo' && password == 'bar') ? 1 : null) 
    }
  });
  
  app.get('/', function (req, res) { res.render('home') });
  app.get('/login', function (req, res) { res.render('login', { redirect: req.query.redirect }) });
  app.get('/secret', function (req, res) { res.render('secret') });
};

if (module.parent) return module.exports = setupApp;

var 
  port = process.env.PORT || 3000
  express = require('express')
  app = express()

setupApp(app);  
app.listen(port);
console.log('App listens on port', port);
