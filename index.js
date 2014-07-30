module.exports = function loginService(app, options) {
  
  var 
    policy = process.env.LOGIN_POLICY || options.policy || "deny"
    except = process.env.LOGIN_EXCEPT || options.except || "/"
    login = process.env.LOGIN_PAGE || options.page || "/login"
    getUserId = options.getid || function (login, password, next) { return next(1); } // use next(null) for failure
    sessionKey = options.key || "user_id"
    onAuthenticated = options.authenticated // function (req, res, error)
    
    restricted = policy.toLowerCase() === 'deny'
    exceptions = except.split(',').map(function(e) { return e.trim(); })
    verbose = options.verbose || false
    
  var Errors = {
    missing: "Missing login/password",
    empty: "Empty login/password",
    failed: "Failed to authenticate"
  };
  
  console.log('> login policy', policy);
  console.log('> login exceptions', exceptions);
  console.log('> login page', login);
  
  app.set('loginErrors', Errors);
  
  var loginRequired = function (req, res, next) {
    var authorized = function (message) {
      if (verbose) console.log('> authorized', req.method, req.path, ':', message);
      next();
    };
    
    var restricted = function (message, redirect) {
      if (verbose) console.log('> restricted', req.method, req.path, ':', message);
      res.redirect(redirect || 'back');
    }
    
    if (!req.session) {
      throw new Error('Login requires session middleware to be installed');
    }
    
    if (req.path === '/login' && req.method.toLowerCase() === 'post') {
      return req.session[sessionKey] != null ? restricted('already logged in') : authorized('login');
    }
    
    if (req.path === '/logout' && req.method.toLowerCase() === 'delete') {
      return req.session[sessionKey] != null ? authorized('logout') : restricted('not logged in');
    } 
    
    if (req.path === login && req.method.toLowerCase() === 'get') {
      return authorized('login page');
    }
    
    if (restricted) {
      
      if (exceptions.indexOf(req.path) >= 0) return authorized('page');
      if (req.session[sessionKey] != null) return authorized('identified');
      
      return restricted("D", login + '?redirect=' + req.path);
    }
    
    if (exceptions.indexOf(req.path) >= 0) return restricted("A", login + '?redirect=' + req.path);
    
    authorized('allow');
  };
  
  app.all('*', loginRequired);
  
  var authenticate = function (callback) {
    return function (req, res) {
      if (!req.body) throw new Error('Login requires body-parser middleware to be installed');
      if (!req.body.login || !req.body.password) return callback(req, res, "missing");

      var 
        login = req.body.login
        password = req.body.password
      
      if (!login.length || !password.length) return callback(req, res, "empty");
    
      getUserId(login, password, function (userId) {
        var found = userId != null;
 
        if (found) {
          req.session[sessionKey] = userId;
          if (verbose) console.log('> authenticated!', userId);
        } else {
          delete(req.session[sessionKey]);
          if (verbose) console.log('> authentication failed!');
        }
        
        callback(req, res, found ? null: "failed");
      });
    }
  };
  
  app.post('/login', authenticate(onAuthenticated || function (req, res, error) {
    if (error) {
      if (verbose) console.log('> error:', Errors[error]);
      return res.redirect('back');
    }
    res.redirect(req.param('redirect') || "/");
  }));
  
  app.delete('/logout', function (req, res) {
    delete(req.session[sessionKey]);
    res.redirect(req.param('redirect') || "/");
  });  

}