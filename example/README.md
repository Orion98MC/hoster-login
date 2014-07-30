# Example

Run with hoster:
```
$ hoster +/login:hoster-login app.js
```

Run as a regular express app:
```
$ node app.js
```

## Why bother to use hoster then ?

If you design your services with hoster in mind, you get modularity. 

You may choose to add the login feature or not to an already defined service.

With a plain express app you have to change your code whether you want it or not...

Example:

I want to protect /secret with user authentication:

```
$ hoster +/login:hoster-login app.js
```

I don't need user authentication anymore:

```
$ hoster app.js
```

Of course that's a simplistic example.