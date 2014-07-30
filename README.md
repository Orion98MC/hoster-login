# Login for express

* Prevents access to login required paths
* Handles login/logout

## Requirements

* session middleware
* body-parser middleware
* method-override middleware

They should be loaded before in the middleware stack.

## Usage

### In a regular express app

```js
var app = express()
...

app.use(sessions);
app.use(bodyParser);
app.use(methodOverride);

require('hoster-login')(app, { OPTIONS });

...
app.get('/login', function (req, res) { res.render('login'); });
...

```

Require it soon enough in your middleware stack so that it can prevent unauthorized accesses.

### As a hoster feature

Load it as a feature in hoster:

```
$ hoster +/login:hoster-login app.js
```

Then, in your app.js you should include the feature at the appropriate place

```js
app.use(sessions);
app.use(bodyParser);
app.use(methodOverride);

if (app.features) app.features('/login', { OPTIONS });

...
app.get('/login', function (req, res) { res.render('login'); });
...
```

Call the feature soon enough in your middleware stack so that it can prevent unauthorized accesses.

## Workflow

The handler does this:

* adds a route to the provided app context to check all paths accesses i.e. app.all('*', check)
* adds a POST /login route for authentication form processing
* adds a DELETE /logout route for logout

### Login required

If the one tries to access a path that requires authentication, one is redirected to the login page. The default login page is /login.

You may provide your own login page address as login option:

```js
app.features('/login', {
  page: '/authentication'
});
```


### Login

The POST /login route handler expect two body parameters accessible via the req.body. Hence, the body-parser middleware should be loaded before.

Required body parameters:

* login
* password

Neither of them should be empty.

If not empty then the user id is fetched and recorded in the req.session. Hence, the session middleware should be loaded before.

### Fetch user id

This operation should be provided as an option named 'getid'. The arguments are (login, password, next) where next is a function that should be called by the getid function with a unique argument, an id for the user if any or null (or undefined) if no user.

Example:

```js
{
  getid: function (login, password, next) { 
    User.findByLoginAndPassword(login, password, function (err, user) {
      next(err ? null : user.id);
    });
  }
}
```


### On authenticated

When a user id is returned by the getid function (whether it is a value or a null which indicate a failed authentication), the not null id is recorded in the session, then, the authenticated function is called with (req, res, error). 

The default authenticated method when no custom one is provided as authenticated option, redirects the user (to the referer as record by the redirect query parameter or to '/') if no error is reported.

If error is not null, then user is redirected to the page that submitted the form (i.e 'back').


### Logout

On DELETE /logout the id is removed from the session and the user is redirected to the req.query.redirect or to /. Hence, the method-override should be loaded before if your client does not support DELETE HTTP method.


## Options

* policy: String, 'deny' | 'allow' (default: 'deny')
* except: String, a list of comma-separated paths that are considered exceptions to the policy (default: '/')
* page: String, the login page url (default: '/login')
* getid: Function(String login, String password, Function(Value) next), the function that calls next(user_id) for matching login/password (default: returns next(1) this allow any login/password)
* key: String, the session's key where to store the user id (default: 'user_id')
* authenticated: Function (req, res, error), called when a user id has been returned (null or not). If no error, then the access is granted. On error, you may look at the app.get('loginErrors') for the meaning of the error.


## License terms

Copyright (c), 2014 Thierry Passeron

The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.